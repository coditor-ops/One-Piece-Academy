import prisma from '../../db.js';
import { CONFIG } from '../../config.js';

export async function updateTier(providerId) {
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    select: { id: true },
  });
  if (!provider) return;

  const [sessionsCompleted, ratingsAgg] = await Promise.all([
    prisma.listing.aggregate({ where: { providerId }, _sum: { sessionsCompleted: true } }),
    prisma.rating.aggregate({ where: { providerId }, _avg: { score: true } }),
  ]);

  const sessions = sessionsCompleted._sum.sessionsCompleted || 0;
  const avg = ratingsAgg._avg.score || 0;
  const { TIER_THRESHOLDS } = CONFIG;

  let tier = 'Rookie';
  if (sessions >= TIER_THRESHOLDS.Legend.sessions && avg >= TIER_THRESHOLDS.Legend.rating) tier = 'Legend';
  else if (sessions >= TIER_THRESHOLDS.Warlord.sessions && avg >= TIER_THRESHOLDS.Warlord.rating) tier = 'Warlord';
  else if (sessions >= TIER_THRESHOLDS.Supernova.sessions && avg >= TIER_THRESHOLDS.Supernova.rating) tier = 'Supernova';

  await prisma.user.update({ where: { id: providerId }, data: { tier } });
}
