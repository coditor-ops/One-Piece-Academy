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

export default router;
