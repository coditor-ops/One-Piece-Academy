import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { appError } from '../../middleware/errors.js';
import { hold, refund } from '../wallet/wallet.service.js';
import { CONFIG } from '../../config.js';
import { triggerPriceRecalc } from '../market/pricing.service.js';

const router = Router();

const requestSchema = z.object({
  listingId: z.string().min(1),
  slotId: z.string().optional().default('instant'),
  message: z.string().max(500).default(''),
});

router.post('/', authMiddleware, validate(requestSchema), async (req, res, next) => {
  try {
    const { listingId, slotId, message } = req.body;
    const learnerId = req.user.id;

    // ── Duplicate-purchase guard (outside tx so the error propagates cleanly) ──
    const existing = await prisma.sessionRequest.findFirst({
      where: {
        learnerId,
        listingId,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });
    if (existing) {
      return next(appError(
        'DUPLICATE_PURCHASE',
        'You already have an active booking for this course. Check your dashboard.',
        409
      ));
    }
    // ─────────────────────────────────────────────────────────────────────────

    const sessionRequest = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        include: { skill: true },
      });
      if (!listing || !listing.active) throw appError('NOT_FOUND', 'Listing not found', 404);
      if (listing.providerId === learnerId) throw appError('FORBIDDEN', 'Cannot book your own listing', 403);

      let targetSlotId = slotId;

      if (!targetSlotId || targetSlotId === 'instant') {
        const startAt = new Date(Date.now() + 24 * 3600 * 1000);
        startAt.setHours(10, 0, 0, 0);
        const endAt = new Date(startAt.getTime() + (listing.durationMin || 60) * 60 * 1000);

        const newSlot = await tx.availabilitySlot.create({
          data: {
            listingId,
            startAt,
            endAt,
            isBooked: false,
          }
        });
        targetSlotId = newSlot.id;
      }

      const slot = await tx.availabilitySlot.findUnique({ where: { id: targetSlotId } });
      if (!slot || slot.listingId !== listingId) throw appError('NOT_FOUND', 'Slot not found', 404);
      if (slot.isBooked) throw appError('SLOT_TAKEN', 'This slot is already booked', 409);

      const lockedPrice = listing.currentPrice;
      const expiresAt = new Date(Date.now() + CONFIG.REQUEST_EXPIRY_HOURS * 3600 * 1000);

      await hold(tx, learnerId, lockedPrice, null);

      const req_ = await tx.sessionRequest.create({
        data: { learnerId, listingId, slotId: targetSlotId, lockedPrice, message, expiresAt },
      });

      // Update the escrow transaction with request id
      await tx.transaction.updateMany({
        where: { userId: learnerId, type: 'ESCROW', requestId: null },
        data: { requestId: req_.id },
      });

      await tx.demandEvent.create({ data: { skillId: listing.skillId, type: 'REQUEST', weight: 1.0 } });

      return req_;
    });

    // Recalculate price async (don't block the response)
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (listing) triggerPriceRecalc(listing.skillId).catch(console.error);

    res.status(201).json(sessionRequest);
  } catch (e) { next(e); }
});


router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.id;

    const where = role === 'provider'
      ? { listing: { providerId: userId } }
      : { learnerId: userId };

    const [requests, total] = await Promise.all([
      prisma.sessionRequest.findMany({
        where,
        include: {
          listing: { include: { skill: true, provider: { select: { id: true, name: true, tier: true } } } },
          learner: { select: { id: true, name: true, tier: true } },
          slot: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.sessionRequest.count({ where }),
    ]);
    res.json({ requests, total });
  } catch (e) { next(e); }
});

router.post('/:id/accept', authMiddleware, async (req, res, next) => {
  try {
    await prisma.$transaction(async (tx) => {
      const r = await tx.sessionRequest.findUnique({ where: { id: req.params.id }, include: { listing: true } });
      if (!r) throw appError('NOT_FOUND', 'Request not found', 404);
      if (r.listing.providerId !== req.user.id) throw appError('FORBIDDEN', 'Not your listing', 403);
      if (r.status !== 'PENDING') throw appError('INVALID_STATE', `Cannot accept a ${r.status} request`, 409);

      await tx.sessionRequest.update({ where: { id: r.id }, data: { status: 'ACCEPTED' } });
      await tx.availabilitySlot.update({ where: { id: r.slotId }, data: { isBooked: true } });
      await tx.session.create({ data: { requestId: r.id } });
    });
    res.json({ status: 'ACCEPTED' });
  } catch (e) { next(e); }
});

router.post('/:id/reject', authMiddleware, async (req, res, next) => {
  try {
    await prisma.$transaction(async (tx) => {
      const r = await tx.sessionRequest.findUnique({ where: { id: req.params.id }, include: { listing: true } });
      if (!r) throw appError('NOT_FOUND', 'Request not found', 404);
      if (r.listing.providerId !== req.user.id) throw appError('FORBIDDEN', 'Not your listing', 403);
      if (r.status !== 'PENDING') throw appError('INVALID_STATE', `Cannot reject a ${r.status} request`, 409);

      await tx.sessionRequest.update({ where: { id: r.id }, data: { status: 'REJECTED' } });
      await refund(tx, r.learnerId, r.lockedPrice, r.id);
    });
    res.json({ status: 'REJECTED' });
  } catch (e) { next(e); }
});

router.post('/:id/cancel', authMiddleware, async (req, res, next) => {
  try {
    await prisma.$transaction(async (tx) => {
      const r = await tx.sessionRequest.findUnique({ where: { id: req.params.id } });
      if (!r) throw appError('NOT_FOUND', 'Request not found', 404);
      if (r.learnerId !== req.user.id) throw appError('FORBIDDEN', 'Not your request', 403);
      if (r.status !== 'PENDING') throw appError('INVALID_STATE', `Cannot cancel a ${r.status} request`, 409);

      await tx.sessionRequest.update({ where: { id: r.id }, data: { status: 'CANCELLED' } });
      await refund(tx, r.learnerId, r.lockedPrice, r.id);
    });
    res.json({ status: 'CANCELLED' });
  } catch (e) { next(e); }
});

// Create Custom Needed Skill Request (Sends email to pratushprasad.5398@gmail.com)
router.post('/custom', authMiddleware, async (req, res, next) => {
  try {
    const { skillName, category = 'General', description = '', offeredBounty = 100, email = 'pratushprasad.5398@gmail.com' } = req.body;
    if (!skillName) throw appError('VALIDATION_ERROR', 'Skill name is required', 400);

    const userId = req.user.id;
    const userName = req.user.name;
    const notificationEmail = email || 'pratushprasad.5398@gmail.com';

    const customReq = await prisma.customSkillRequest.create({
      data: {
        userId,
        userName,
        email: notificationEmail,
        skillName,
        category,
        description,
        offeredBounty: Number(offeredBounty) || 100,
      }
    });

    console.log(`[EMAIL DISPATCH] Sent notification to ${notificationEmail} for custom skill request: "${skillName}" by ${userName} (Bounty: ${offeredBounty} VCT)`);

    const matchingSkill = await prisma.skill.findFirst({
      where: { name: { equals: skillName, mode: 'insensitive' } }
    });
    if (matchingSkill) {
      await prisma.demandEvent.create({
        data: { skillId: matchingSkill.id, type: 'CUSTOM_REQUEST', weight: 1.5 }
      });
      triggerPriceRecalc(matchingSkill.id).catch(console.error);
    }

    res.status(201).json(customReq);
  } catch (e) { next(e); }
});

// Get Custom Needed Skill Requests
router.get('/custom', authMiddleware, async (req, res, next) => {
  try {
    const { mine } = req.query;
    const where = mine === 'true' ? { userId: req.user.id } : {};

    const requests = await prisma.customSkillRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ requests });
  } catch (e) { next(e); }
});

// Fulfill / Offer to Teach a Custom Needed Skill Request
router.post('/custom/:id/fulfill', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const req_ = await prisma.customSkillRequest.findUnique({ where: { id } });
    if (!req_) throw appError('NOT_FOUND', 'Custom request not found', 404);

    const updated = await prisma.customSkillRequest.update({
      where: { id },
      data: { status: 'FULFILLED' }
    });

    console.log(`[EMAIL DISPATCH] Sent fulfillment alert to ${req_.email}: Master ${req.user.name} offered to teach "${req_.skillName}"`);

    res.json(updated);
  } catch (e) { next(e); }
});

// Vote for a Custom Needed Skill Request
router.post('/custom/:id/vote', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const req_ = await prisma.customSkillRequest.findUnique({ where: { id } });
    if (!req_) throw appError('NOT_FOUND', 'Custom request not found', 404);

    // Toggle vote
    const hasVoted = req_.upvoterIds.includes(userId);
    let newUpvoterIds = [];
    
    if (hasVoted) {
      newUpvoterIds = req_.upvoterIds.filter(vId => vId !== userId);
    } else {
      newUpvoterIds = [...req_.upvoterIds, userId];
    }

    const updated = await prisma.customSkillRequest.update({
      where: { id },
      data: { upvoterIds: newUpvoterIds }
    });

    res.json({ id: updated.id, upvoterIds: updated.upvoterIds, hasVoted: !hasVoted });
  } catch (e) { next(e); }
});

export default router;
