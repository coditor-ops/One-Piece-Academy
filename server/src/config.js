// Central config — never hard-code these values elsewhere
export const CONFIG = {
  STARTING_GRANT: 500,
  TAX_RATE: 0.05,          // 5% burned on completion
  REQUEST_EXPIRY_HOURS: 48,
  AUTO_CONFIRM_HOURS: 24,
  PRICING: {
    k: 0.6,
    alpha: 1.0,            // ponytail: instant reaction for demo; lower to 0.3 for production smoothing
    minMult: 0.7,
    maxMult: 3.0,
    windowDays: 7,
  },
  BASE_PRICE_MIN: 10,
  BASE_PRICE_MAX: 1000,
  TIER_THRESHOLDS: {
    Supernova: { sessions: 5,  rating: 3.5 },
    Warlord:   { sessions: 20, rating: 4.0 },
    Legend:    { sessions: 50, rating: 4.5 },
  },
};
