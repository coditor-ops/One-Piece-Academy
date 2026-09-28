import { describe, it, expect } from 'vitest';
import { computePrice } from '../pricing/computePrice.js';

const cfg = { k: 0.6, alpha: 1.0, minMult: 0.7, maxMult: 3.0 };

describe('computePrice', () => {
  it('cold start: no demand returns price equal to base', () => {
    const { multiplier, price } = computePrice({ basePrice: 200, supply: 1, demand: 0, cfg });
    expect(multiplier).toBeCloseTo(1.0, 5);
    expect(price).toBe(200);
  });

  it('Rayleigh worked example: base=200 S=1 D=12 → ~508 VCT', () => {
    const { price } = computePrice({ basePrice: 200, supply: 1, demand: 12, cfg });
    // pressure=12, raw=1+0.6*ln(13)≈2.54, price≈508
    expect(price).toBeGreaterThanOrEqual(500);
    expect(price).toBeLessThanOrEqual(515);
  });

  it('clamps at maxMult when demand is extreme', () => {
    const { multiplier } = computePrice({ basePrice: 100, supply: 1, demand: 10000, cfg });
    expect(multiplier).toBeCloseTo(cfg.maxMult, 5);
  });

  it('zero demand → multiplier is exactly 1.0 (minMult only applies when formula goes below it)', () => {
    // pressure=0, raw=1+0.6*ln(1)=1.0 — formula naturally returns 1.0, does not clamp to minMult
    const { multiplier } = computePrice({ basePrice: 100, supply: 100, demand: 0, cfg });
    expect(multiplier).toBeCloseTo(1.0, 5);
  });

  it('smoothing with alpha=0.3 blends toward target', () => {
    const smoothCfg = { ...cfg, alpha: 0.3 };
    const { multiplier } = computePrice({ basePrice: 100, supply: 1, demand: 12, prevMultiplier: 1.0, cfg: smoothCfg });
    // target ~2.54, prev=1.0 → result = 0.7*1.0 + 0.3*2.54 = 1.462
    expect(multiplier).toBeCloseTo(1.462, 1);
  });

  it('scarcity: S=1 high demand hits close to maxMult', () => {
    const { multiplier } = computePrice({ basePrice: 100, supply: 1, demand: 100, cfg });
    expect(multiplier).toBeCloseTo(cfg.maxMult, 5);
  });

  it('target is clamped before smoothing blend (clamp is on target, not final result)', () => {
    // With demand=0: target=clamp(1.0, 0.7, 3.0)=1.0. Smoothed with prev=0.5, alpha=0.3 → 0.65
    // The clamp does NOT apply to the final smoothed value - that is intentional
    const smoothCfg = { ...cfg, alpha: 0.3 };
    const { multiplier } = computePrice({ basePrice: 100, supply: 1, demand: 0, prevMultiplier: 0.5, cfg: smoothCfg });
    expect(multiplier).toBeCloseTo(0.65, 5);
  });

  it('oversupply: S=10 D=1 → price still above base (log formula never drops below 1 with positive demand)', () => {
    // pressure=0.1, raw=1+0.6*ln(1.1)≈1.057 — still above base; that is correct formula behaviour
    const { multiplier } = computePrice({ basePrice: 100, supply: 10, demand: 1, cfg });
    expect(multiplier).toBeGreaterThan(1.0);
    expect(multiplier).toBeLessThan(1.2);
  });

  it('price is always a whole integer', () => {
    const { price } = computePrice({ basePrice: 99, supply: 3, demand: 7, cfg });
    expect(Number.isInteger(price)).toBe(true);
  });
});
