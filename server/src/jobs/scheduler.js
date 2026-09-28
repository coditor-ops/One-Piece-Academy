import cron from 'node-cron';
import prisma from '../db.js';
import { refund } from '../modules/wallet/wallet.service.js';
import { recalcAllSkills } from '../modules/market/pricing.service.js';

export function startJobs() {
  // Price recalculation every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try { await recalcAllSkills(); } catch (e) { console.error('[jobs] price recalc failed', e); }
  });

  // Expire pending requests every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expired = await prisma.sessionRequest.findMany({
        where: { status: 'PENDING', expiresAt: { lt: new Date() } },
      });
      for (const r of expired) {
        await prisma.$transaction(async (tx) => {
          const current = await tx.sessionRequest.findUnique({ where: { id: r.id } });
          if (current.status !== 'PENDING') return; // already processed
          await tx.sessionRequest.update({ where: { id: r.id }, data: { status: 'EXPIRED' } });
          await refund(tx, r.learnerId, r.lockedPrice, r.id);
        });
      }
      if (expired.length) console.log(`[jobs] expired ${expired.length} requests`);
    } catch (e) { console.error('[jobs] expiry failed', e); }
  });

  // Auto-confirm sessions every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 3600 * 1000);
      const sessions = await prisma.session.findMany({
        where: { providerDone: true, completedAt: null, createdAt: { lt: cutoff } },
        include: { request: { include: { listing: true } } },
      });
      for (const s of sessions) {
        const r = s.request;
        if (r.status !== 'ACCEPTED') continue;
        await prisma.$transaction(async (tx) => {
          const current = await tx.session.findUnique({ where: { id: s.id } });
          if (current.completedAt) return;
          await tx.session.update({ where: { id: s.id }, data: { completedAt: new Date() } });
          await tx.sessionRequest.update({ where: { id: r.id }, data: { status: 'COMPLETED' } });
          const { release } = await import('../modules/wallet/wallet.service.js');
          await release(tx, r.learnerId, r.listing.providerId, r.lockedPrice, r.id);
          await tx.listing.update({ where: { id: r.listingId }, data: { sessionsCompleted: { increment: 1 } } });
        });
      }
      if (sessions.length) console.log(`[jobs] auto-confirmed ${sessions.length} sessions`);
    } catch (e) { console.error('[jobs] auto-confirm failed', e); }
  });
}
