import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { appError } from '../../middleware/errors.js';
import { release, refund } from '../wallet/wallet.service.js';
import { updateTier } from '../ratings/ratings.service.js';

const router = Router();

// Provider marks session done
router.post('/:id/complete', authMiddleware, async (req, res, next) => {
  try {
    await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: req.params.id },
        include: { request: { include: { listing: true, slot: true } } },
      });
      if (!session) throw appError('NOT_FOUND', 'Session not found', 404);
      if (session.request.listing.providerId !== req.user.id) throw appError('FORBIDDEN', 'Not your session', 403);
      if (session.request.status !== 'ACCEPTED') throw appError('INVALID_STATE', 'Session not in accepted state', 409);

      await tx.session.update({ where: { id: session.id }, data: { providerDone: true } });
    });
    res.json({ providerDone: true });
  } catch (e) { next(e); }
});

// Learner confirms completion → triggers payout
router.post('/:id/confirm', authMiddleware, async (req, res, next) => {
  try {
    await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: req.params.id },
        include: { request: { include: { listing: { include: { provider: true } } } } },
      });
      if (!session) throw appError('NOT_FOUND', 'Session not found', 404);
      const r = session.request;
      if (r.learnerId !== req.user.id) throw appError('FORBIDDEN', 'Not your session', 403);
      if (r.status !== 'ACCEPTED') throw appError('INVALID_STATE', 'Session not in accepted state', 409);
      if (session.completedAt) throw appError('INVALID_STATE', 'Already completed', 409);

      await tx.session.update({ where: { id: session.id }, data: { completedAt: new Date() } });
      await tx.sessionRequest.update({ where: { id: r.id }, data: { status: 'COMPLETED' } });
      await release(tx, r.learnerId, r.listing.providerId, r.lockedPrice, r.id);
      await tx.listing.update({
        where: { id: r.listingId },
        data: { sessionsCompleted: { increment: 1 } },
      });
    });

    // Update provider tier outside the transaction (read-only risk acceptable)
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { request: { include: { listing: true } } },
    });
    await updateTier(session.request.listing.providerId);

    res.json({ status: 'COMPLETED' });
  } catch (e) { next(e); }
});

// Dispute — marks cancelled and refunds
router.post('/:id/dispute', authMiddleware, async (req, res, next) => {
  try {
    await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: req.params.id },
        include: { request: true },
      });
      if (!session) throw appError('NOT_FOUND', 'Session not found', 404);
      const r = session.request;
      if (r.learnerId !== req.user.id) throw appError('FORBIDDEN', 'Not your session', 403);
      if (r.status !== 'ACCEPTED') throw appError('INVALID_STATE', 'Cannot dispute this session', 409);

      await tx.sessionRequest.update({ where: { id: r.id }, data: { status: 'CANCELLED' } });
      await refund(tx, r.learnerId, r.lockedPrice, r.id);
    });
    res.json({ status: 'CANCELLED' });
  } catch (e) { next(e); }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessions = await prisma.session.findMany({
      where: {
        request: {
          OR: [
            { learnerId: userId },
            { listing: { providerId: userId } },
          ],
        },
      },
      include: {
        request: {
          include: {
            listing: { include: { skill: true, provider: { select: { id: true, name: true } } } },
            learner: { select: { id: true, name: true } },
            slot: true,
          },
        },
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sessions);
  } catch (e) { next(e); }
});

export default router;
