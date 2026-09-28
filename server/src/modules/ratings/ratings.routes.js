import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { appError } from '../../middleware/errors.js';
import { updateTier } from './ratings.service.js';

const router = Router();

const rateSchema = z.object({
  score: z.number().int().min(1).max(5),
  review: z.string().max(500).default(''),
});

router.post('/sessions/:id/rate', authMiddleware, validate(rateSchema), async (req, res, next) => {
  try {
    const { score, review } = req.body;
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { request: { include: { listing: true } }, rating: true },
    });
    if (!session) throw appError('NOT_FOUND', 'Session not found', 404);
    if (session.request.learnerId !== req.user.id) throw appError('FORBIDDEN', 'Only the learner can rate', 403);
    if (session.request.status !== 'COMPLETED') throw appError('INVALID_STATE', 'Session not completed', 409);
    if (session.rating) throw appError('ALREADY_RATED', 'Already rated this session', 409);

    const providerId = session.request.listing.providerId;
    const rating = await prisma.rating.create({
      data: { sessionId: session.id, raterId: req.user.id, providerId, score, review },
    });

    // Recompute listing avg
    const listingId = session.request.listingId;
    const agg = await prisma.rating.aggregate({
      where: { session: { request: { listingId } } },
      _avg: { score: true },
      _count: { score: true },
    });
    await prisma.listing.update({
      where: { id: listingId },
      data: { avgRating: agg._avg.score || 0, ratingCount: agg._count.score },
    });

    await updateTier(providerId);
    res.status(201).json(rating);
  } catch (e) { next(e); }
});

router.get('/users/:id/ratings', async (req, res, next) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { providerId: req.params.id },
      include: { rater: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(ratings);
  } catch (e) { next(e); }
});

export default router;
