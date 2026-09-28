import prisma from '../../db.js';
import { computePrice } from '../../pricing/computePrice.js';
import { CONFIG } from '../../config.js';

export async function getConfig() {
  let cfg = await prisma.pricingConfig.findUnique({ where: { id: 'default' } });
  if (!cfg) {
    cfg = await prisma.pricingConfig.create({ data: { id: 'default' } });
  }
  return cfg;
}

export async function triggerPriceRecalc(skillId) {
  const cfg = await getConfig();
  await recalcSkill(skillId, cfg);
}

export async function recalcAllSkills() {
  const cfg = await getConfig();
  const skills = await prisma.skill.findMany({ select: { id: true } });
  await Promise.all(skills.map(s => recalcSkill(s.id, cfg)));
  console.log(`[pricing] recalculated ${skills.length} skills`);
}

async function recalcSkill(skillId, cfg) {
  const now = new Date();
  const windowStart = new Date(now - cfg.windowDays * 86400 * 1000);

  // Supply: active listings with at least one free future slot
  const supply = await prisma.listing.count({
    where: {
      skillId,
      active: true,
      slots: { some: { isBooked: false, startAt: { gte: now } } },
    },
  });

  // Demand: time-decayed sum of demand events in window
  const events = await prisma.demandEvent.findMany({
    where: { skillId, createdAt: { gte: windowStart } },
    select: { weight: true, createdAt: true },
  });
  const demand = events.reduce((sum, e) => {
    const ageDays = (now - new Date(e.createdAt)) / 86400000;
    return sum + e.weight * Math.exp(-ageDays / (cfg.windowDays / 2));
  }, 0);

  // Get all active listings for this skill to update prices
  const listings = await prisma.listing.findMany({
    where: { skillId, active: true },
    select: { id: true, basePrice: true, multiplier: true },
  });

  for (const listing of listings) {
    const { multiplier, price } = computePrice({
      basePrice: listing.basePrice,
      supply,
      demand,
      prevMultiplier: listing.multiplier,
      cfg: { k: cfg.k, alpha: cfg.alpha, minMult: cfg.minMult, maxMult: cfg.maxMult },
    });

    await prisma.listing.update({
      where: { id: listing.id },
      data: { currentPrice: price, multiplier },
    });

    await prisma.priceHistory.create({
      data: { listingId: listing.id, skillId, supply, demand, multiplier, price },
    });
  }
}
