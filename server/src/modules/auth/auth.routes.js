import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../../db.js';
import { signToken, authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { grant } from '../wallet/wallet.service.js';
import { appError } from '../../middleware/errors.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  crew: z.string().max(100).default(''),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, crew } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw appError('EMAIL_TAKEN', 'Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({ data: { name, email, passwordHash, crew } });
      await grant(tx, u.id);
      return u;
    });

    const token = signToken({ id: user.id, email: user.email });
    res.status(201).json({ token, user: safeUser(user) });
  } catch (e) { next(e); }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw appError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }
    const token = signToken({ id: user.id, email: user.email });
    res.json({ token, user: safeUser(user) });
  } catch (e) { next(e); }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw appError('NOT_FOUND', 'User not found', 404);
    res.json(safeUser(user));
  } catch (e) { next(e); }
});

function safeUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

export default router;
