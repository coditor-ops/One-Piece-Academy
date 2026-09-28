/**
 * Pure pricing function — no DB, no Date.now(), no side effects.
 * @param {object} p
 * @param {number} p.basePrice
 * @param {number} p.supply   - active providers with open slots in window
 * @param {number} p.demand   - time-decayed request count
 * @param {number} p.prevMultiplier
 * @param {object} p.cfg      - { k, alpha, minMult, maxMult }
 * @returns {{ multiplier: number, price: number, pressure: number }}
 */
export function computePrice({ basePrice, supply, demand, prevMultiplier = 1, cfg }) {
  const pressure  = demand / Math.max(supply, 1);
  const raw       = 1 + cfg.k * Math.log(1 + pressure);
  const target    = Math.min(cfg.maxMult, Math.max(cfg.minMult, raw));
  const multiplier = (1 - cfg.alpha) * prevMultiplier + cfg.alpha * target;
  const price     = Math.round(basePrice * multiplier);
  return { multiplier, price, pressure };
}
