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
  listingId: z.string().uuid(),
  slotId: z.string().uuid(),
  message: z.string().max(500).default(''),
});

router.post('/', authMiddleware, validate(requestSchema), async (req, res, next) => {
  try {
    const { listingId, slotId, message } = req.body;
    const learnerId = req.user.id;

    const sessionRequest = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        include: { skill: true },
      });
      if (!listing || !listing.active) throw appError('NOT_FOUND', 'Listing not found', 404);
      if (listing.providerId === learnerId) throw appError('FORBIDDEN', 'Cannot book your own listing', 403);

      const slot = await tx.availabilitySlot.findUnique({ where: { id: slotId } });
      if (!slot || slot.listingId !== listingId) throw appError('NOT_FOUND', 'Slot not found', 404);
      if (slot.isBooked) throw appError('SLOT_TAKEN', 'This slot is already booked', 409);
      if (new Date(slot.startAt) <= new Date()) throw appError('VALIDATION_ERROR', 'Slot is in the past', 400);

      const lockedPrice = listing.currentPrice;
      const expiresAt = new Date(Date.now() + CONFIG.REQUEST_EXPIRY_HOURS * 3600 * 1000);

      await hold(tx, learnerId, lockedPrice, null);

      const req_ = await tx.sessionRequest.create({
        data: { learnerId, listingId, slotId, lockedPrice, message, expiresAt },
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
    triggerPriceRecalc(listing.skillId).catch(console.error);

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

export default router;
