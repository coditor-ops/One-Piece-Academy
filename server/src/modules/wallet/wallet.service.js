import prisma from '../../db.js';
import { CONFIG } from '../../config.js';

/**
 * All wallet operations. No other module touches balance/escrow_held/transactions.
 */

export async function grant(tx, userId) {
  await tx.user.update({
    where: { id: userId },
    data: { balance: { increment: CONFIG.STARTING_GRANT } },
  });
  await tx.transaction.create({
    data: { userId, type: 'GRANT', amount: CONFIG.STARTING_GRANT, note: 'Welcome grant' },
  });
}

export async function hold(tx, userId, amount, requestId) {
  const user = await tx.user.findUnique({ where: { id: userId }, select: { balance: true } });
  if (!user || user.balance < amount) {
    const err = new Error('Insufficient tokens');
    err.code = 'INSUFFICIENT_TOKENS';
    err.status = 402;
    throw err;
  }
  await tx.user.update({
    where: { id: userId },
    data: { balance: { decrement: amount }, escrowHeld: { increment: amount } },
  });
  await tx.transaction.create({
    data: { userId, type: 'ESCROW', amount, requestId, note: 'Session escrow hold' },
  });
}

export async function release(tx, learnerId, providerId, amount, requestId) {
  const burn = Math.floor(amount * CONFIG.TAX_RATE);
  const payout = amount - burn;
  // Release from learner escrow
  await tx.user.update({
    where: { id: learnerId },
    data: { escrowHeld: { decrement: amount } },
  });
  // Pay provider
  await tx.user.update({
    where: { id: providerId },
    data: { balance: { increment: payout } },
  });
  await tx.transaction.createMany({
    data: [
      { userId: learnerId, type: 'RELEASE', amount, requestId, note: 'Escrow released' },
      { userId: providerId, type: 'RELEASE', amount: payout, requestId, note: '95% session payout' },
      { userId: providerId, type: 'BURN', amount: burn, requestId, note: 'World Government 5% tax' },
    ],
  });
}

export async function refund(tx, userId, amount, requestId) {
  await tx.user.update({
    where: { id: userId },
    data: { balance: { increment: amount }, escrowHeld: { decrement: amount } },
  });
  await tx.transaction.create({
    data: { userId, type: 'REFUND', amount, requestId, note: 'Escrow refunded' },
  });
}

export async function getWallet(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true, escrowHeld: true },
  });
  return user;
}

export async function getTransactions(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);
  return { rows, total, page, limit };
}
