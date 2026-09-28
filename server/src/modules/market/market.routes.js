import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { appError } from '../../middleware/errors.js';
import { recalcAllSkills, getConfig, triggerPriceRecalc } from './pricing.service.js';

const router = Router();

router.get('/overview', async (req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        listings: {
          where: { active: true },
          select: { id: true, currentPrice: true, basePrice: true, multiplier: true, avgRating: true },
        },
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 2,
          select: { price: true, multiplier: true, supply: true, demand: true, recordedAt: true },
        },
      },
    });

    const overview = skills.map(s => {
      const avgMult = s.listings.length
        ? s.listings.reduce((a, l) => a + l.multiplier, 0) / s.listings.length
        : 1;
      const latest = s.priceHistory[0];
      const prev = s.priceHistory[1];
      const trend = latest && prev
        ? latest.price > prev.price ? 'rising' : latest.price < prev.price ? 'falling' : 'stable'
        : 'stable';
      return {
        id: s.id, name: s.name, category: s.category, icon: s.icon,
        providerCount: s.listings.length,
        supply: latest?.supply ?? 0,
        demand: latest?.demand ?? 0,
        multiplier: avgMult,
        trend,
      };
    });

    res.json(overview);
  } catch (e) { next(e); }
});

router.get('/skills/:id/price-history', async (req, res, next) => {
  try {
    const history = await prisma.priceHistory.findMany({
      where: { skillId: req.params.id },
      orderBy: { recordedAt: 'asc' },
      take: 100,
    });
    res.json(history);
  } catch (e) { next(e); }
});

// Admin routes
router.get('/admin/pricing-config', authMiddleware, async (req, res, next) => {
  try {
    res.json(await getConfig());
  } catch (e) { next(e); }
});

const configSchema = z.object({
  k: z.number().min(0).max(5).optional(),
  alpha: z.number().min(0).max(1).optional(),
  minMult: z.number().min(0.1).max(1).optional(),
  maxMult: z.number().min(1).max(10).optional(),
  windowDays: z.number().int().min(1).max(30).optional(),
});

router.put('/admin/pricing-config', authMiddleware, validate(configSchema), async (req, res, next) => {
  try {
    const cfg = await prisma.pricingConfig.upsert({
      where: { id: 'default' },
      update: req.body,
      create: { id: 'default', ...req.body },
    });
    res.json(cfg);
  } catch (e) { next(e); }
});

// Simulate pirate rush — inject demand events for a skill
router.post('/admin/simulate-rush', authMiddleware, async (req, res, next) => {
  try {
    const { skillId, count = 10 } = req.body;
    if (!skillId) throw appError('VALIDATION_ERROR', 'skillId required', 400);
    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) throw appError('NOT_FOUND', 'Skill not found', 404);

    await prisma.demandEvent.createMany({
      data: Array.from({ length: count }, () => ({ skillId, type: 'REQUEST', weight: 1.0 })),
    });
    await triggerPriceRecalc(skillId);
    res.json({ injected: count, skillId });
  } catch (e) { next(e); }
});

export default router;
