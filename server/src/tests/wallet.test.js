import { describe, it, expect } from 'vitest';

// Wallet logic tests using in-memory simulation (no DB needed)
// These test the mathematical invariants and state transitions

describe('wallet invariants', () => {
  it('hold reduces balance and increases escrowHeld by same amount', () => {
    const user = { balance: 500, escrowHeld: 0 };
    const amount = 200;
    // Simulate hold
    user.balance -= amount;
    user.escrowHeld += amount;
    expect(user.balance).toBe(300);
    expect(user.escrowHeld).toBe(200);
    expect(user.balance + user.escrowHeld).toBe(500); // conservation
  });

  it('release: 95% to provider, 5% burned, learner escrow cleared', () => {
    const learner = { balance: 300, escrowHeld: 200 };
    const provider = { balance: 100, escrowHeld: 0 };
    const amount = 200;

    const burn = Math.floor(amount * 0.05); // 10
    const payout = amount - burn;           // 190

    learner.escrowHeld -= amount;
    provider.balance += payout;
    // burn destroys payout

    expect(learner.escrowHeld).toBe(0);
    expect(provider.balance).toBe(290);
    expect(burn).toBe(10);
    expect(payout + burn).toBe(amount); // nothing created or lost
  });

  it('refund restores balance and clears escrow', () => {
    const user = { balance: 300, escrowHeld: 200 };
    const amount = 200;

    user.balance += amount;
    user.escrowHeld -= amount;

    expect(user.balance).toBe(500);
    expect(user.escrowHeld).toBe(0);
  });

  it('hold fails if balance < amount', () => {
    const user = { balance: 100, escrowHeld: 0 };
    const amount = 200;
    // Simulate the guard
    const canHold = user.balance >= amount;
    expect(canHold).toBe(false);
  });

  it('conservation: balance never lost across hold→release cycle', () => {
    const totalBefore = 700; // learner 500 + provider 200
    const learner = { balance: 500, escrowHeld: 0 };
    const provider = { balance: 200, escrowHeld: 0 };
    const price = 300;

    // hold
    learner.balance -= price;
    learner.escrowHeld += price;

    // release
    const burn = Math.floor(price * 0.05);
    const payout = price - burn;
    learner.escrowHeld -= price;
    provider.balance += payout;

    const totalAfter = learner.balance + learner.escrowHeld + provider.balance + provider.escrowHeld + burn;
    expect(totalAfter).toBe(totalBefore);
  });
});

describe('request state machine', () => {
  function transition(current, action, role, ownerId, userId) {
    const allowed = {
      PENDING:  { accept: 'provider', reject: 'provider', cancel: 'learner' },
      ACCEPTED: { complete: 'provider', dispute: 'learner' },
    };
    if (!allowed[current]) return { ok: false, error: 'INVALID_STATE' };
    const requiredRole = allowed[current][action];
    if (!requiredRole) return { ok: false, error: 'INVALID_STATE' };
    if (requiredRole !== role) return { ok: false, error: 'FORBIDDEN' };
    const next = { accept: 'ACCEPTED', reject: 'REJECTED', cancel: 'CANCELLED', complete: 'COMPLETED', dispute: 'CANCELLED' };
    return { ok: true, status: next[action] };
  }

  it('provider can accept PENDING', () => {
    expect(transition('PENDING', 'accept', 'provider').ok).toBe(true);
  });
  it('provider can reject PENDING', () => {
    expect(transition('PENDING', 'reject', 'provider').ok).toBe(true);
  });
  it('learner can cancel PENDING', () => {
    expect(transition('PENDING', 'cancel', 'learner').ok).toBe(true);
  });
  it('learner cannot accept PENDING', () => {
    expect(transition('PENDING', 'accept', 'learner').ok).toBe(false);
  });
  it('provider cannot cancel PENDING', () => {
    expect(transition('PENDING', 'cancel', 'provider').ok).toBe(false);
  });
  it('cannot accept an ACCEPTED request', () => {
    expect(transition('ACCEPTED', 'accept', 'provider').ok).toBe(false);
  });
  it('cannot act on COMPLETED', () => {
    expect(transition('COMPLETED', 'accept', 'provider').ok).toBe(false);
  });
  it('provider marks complete from ACCEPTED', () => {
    expect(transition('ACCEPTED', 'complete', 'provider').ok).toBe(true);
  });
  it('learner can dispute ACCEPTED', () => {
    expect(transition('ACCEPTED', 'dispute', 'learner').ok).toBe(true);
  });
});
