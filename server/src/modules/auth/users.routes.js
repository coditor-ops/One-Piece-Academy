import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { appError } from '../../middleware/errors.js';

const router = Router();

// Public
router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.user.findMany({
      where: { id: req.query.id || undefined },
      select: publicFields,
    }));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: publicFields });
    if (!user) throw appError('NOT_FOUND', 'User not found', 404);
    res.json(user);
  } catch (e) { next(e); }
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().max(200).optional(),
  crew: z.string().max(100).optional(),
});

router.put('/:id', authMiddleware, validate(updateSchema), async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) throw appError('FORBIDDEN', 'Cannot update another user', 403);
    const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
    const { passwordHash, ...rest } = user;
    res.json(rest);
  } catch (e) { next(e); }
});

const publicFields = {
  id: true, name: true, bio: true, avatar: true, crew: true,
  tier: true, balance: true, escrowHeld: true,
  createdAt: true,
};

export default router;
