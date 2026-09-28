import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { appError } from '../../middleware/errors.js';
import { CONFIG } from '../../config.js';

const router = Router();

// Public listing search (MUST BE DECLARED BEFORE /:id)
router.get('/listings', async (req, res, next) => {
  try {
    const { q, category, minRating, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      active: true,
      ...(minPrice || maxPrice ? { currentPrice: { gte: parseInt(minPrice) || 0, lte: parseInt(maxPrice) || 999999 } } : {}),
      ...(minRating ? { avgRating: { gte: parseFloat(minRating) } } : {}),
      skill: {
        ...(category ? { category } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}),
      },
    };

    const orderBy = sort === 'price' ? { currentPrice: 'asc' }
      : sort === 'rating' ? { avgRating: 'desc' }
      : sort === 'newest' ? { createdAt: 'desc' }
      : { multiplier: 'desc' }; // default: by demand

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          skill: true,
          provider: { select: { id: true, name: true, tier: true, avatar: true } },
          slots: { where: { isBooked: false, startAt: { gte: new Date() } }, take: 1, orderBy: { startAt: 'asc' } },
        },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      prisma.listing.count({ where }),
    ]);
    res.json({ listings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { next(e); }
});

// Listings validation schema
const listingSchema = z.object({
  skillId: z.string().min(1),
  description: z.string().max(1000).default(''),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Master']).default('Beginner'),
  durationMin: z.number().int().refine(v => [30, 60, 90].includes(v), 'Duration must be 30, 60, or 90'),
  basePrice: z.number().int().min(CONFIG.BASE_PRICE_MIN).max(CONFIG.BASE_PRICE_MAX),
});

router.post('/listings', authMiddleware, validate(listingSchema), async (req, res, next) => {
  try {
    const { skillId, description, level, durationMin, basePrice } = req.body;
    const providerId = req.user.id;

    const existing = await prisma.listing.findFirst({ where: { providerId, skillId, active: true } });
    if (existing) throw appError('DUPLICATE_LISTING', 'You already have an active listing for this skill', 409);

    const listing = await prisma.listing.create({
      data: { providerId, skillId, description, level, durationMin, basePrice, currentPrice: basePrice },
    });
    res.status(201).json(listing);
  } catch (e) { next(e); }
});

router.put('/listings/:id', authMiddleware, async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) throw appError('NOT_FOUND', 'Listing not found', 404);
    if (listing.providerId !== req.user.id) throw appError('FORBIDDEN', 'Not your listing', 403);

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.description !== undefined ? { description: req.body.description } : {}),
        ...(req.body.active !== undefined ? { active: req.body.active } : {}),
        ...(req.body.basePrice !== undefined ? { basePrice: req.body.basePrice } : {}),
      },
    });
    res.json(updated);
  } catch (e) { next(e); }
});

// Add slots to a listing
const slotSchema = z.object({
  slots: z.array(z.object({
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
  })).min(1),
});

router.post('/listings/:id/slots', authMiddleware, validate(slotSchema), async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) throw appError('NOT_FOUND', 'Listing not found', 404);
    if (listing.providerId !== req.user.id) throw appError('FORBIDDEN', 'Not your listing', 403);

    const now = new Date();
    const slots = req.body.slots.filter(s => new Date(s.startAt) > now);
    if (!slots.length) throw appError('VALIDATION_ERROR', 'All slots are in the past', 400);

    const created = await prisma.availabilitySlot.createMany({
      data: slots.map(s => ({ listingId: req.params.id, startAt: new Date(s.startAt), endAt: new Date(s.endAt) })),
    });
    res.status(201).json({ created: created.count });
  } catch (e) { next(e); }
});

// Public — list all skills
router.get('/', async (req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    res.json(skills);
  } catch (e) { next(e); }
});

// Specific skill detail by ID
router.get('/:id', async (req, res, next) => {
  try {
    const skill = await prisma.skill.findUnique({
      where: { id: req.params.id },
      include: {
        listings: {
          where: { active: true },
          include: {
            provider: { select: { id: true, name: true, tier: true, avatar: true } },
            slots: { where: { isBooked: false, startAt: { gte: new Date() } }, orderBy: { startAt: 'asc' }, take: 3 },
          },
        },
      },
    });
    if (!skill) throw appError('NOT_FOUND', 'Skill not found', 404);
    res.json(skill);
  } catch (e) { next(e); }
});

export default router;
