import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { getWallet, getTransactions } from './wallet.service.js';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    res.json(await getWallet(req.user.id));
  } catch (e) { next(e); }
});

router.get('/transactions', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    res.json(await getTransactions(req.user.id, page, limit));
  } catch (e) { next(e); }
});

router.post('/topup', authMiddleware, async (req, res, next) => {
  try {
    const amount = Number(req.body.amount) || 500;
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: req.user.id },
        data: { balance: { increment: amount } },
      });
      await tx.transaction.create({
        data: { userId: req.user.id, type: 'GRANT', amount, note: 'Pirate Bounty Top-Up' },
      });
    });
    const updatedWallet = await getWallet(req.user.id);
    res.json({ message: `Successfully topped up ${amount} VCT!`, ...updatedWallet });
  } catch (e) { next(e); }
});

export default router;
