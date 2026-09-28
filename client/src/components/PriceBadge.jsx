import { useState } from 'react';

// PriceBadge - the hero component
export function PriceBadge({ price, basePrice, multiplier, size = 'md' }) {
  const trend = multiplier >= 1.5 ? 'surge'
    : multiplier >= 1.1 ? 'rising'
    : multiplier <= 0.9 ? 'falling'
    : 'stable';

  const pct = Math.round((multiplier - 1) * 100);
  const sign = pct >= 0 ? '+' : '';

  const colors = {
    surge:   'text-ember',
    rising:  'text-ember',
    stable:  'text-text-primary',
    falling: 'text-foam',
  };
  const arrows = { surge: '▲', rising: '▲', stable: '=', falling: '▼' };
  const sizeClass = size === 'xl' ? 'text-4xl' : 'text-2xl';

  return (
    <div className={`flex items-baseline gap-2 ${colors[trend]}`}>
      <span className={`font-mono font-bold ${sizeClass}`}>🃏 {Number(price).toLocaleString()} VCT</span>
      <span className="text-sm font-medium flex items-center gap-0.5">
        <span>{arrows[trend]}</span>
        <span>{sign}{pct}%</span>
        {trend === 'surge' && <span className="animate-pulse-ember">🔥</span>}
      </span>
      {basePrice && (
        <span className="text-xs text-text-muted font-mono hidden sm:inline">
          (Base {basePrice})
        </span>
      )}
    </div>
  );
}

// Why-this-price popover
export function WhyThisPrice({ listing, skillHistory }) {
  const [open, setOpen] = useState(false);
  if (!listing) return null;
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-text-muted hover:text-text-secondary text-sm underline cursor-pointer"
        aria-label="Why this price?"
      >
        ⓘ Why {Number(listing.currentPrice).toLocaleString()} VCT?
      </button>
      {open && (
        <div className="absolute z-40 bottom-full mb-2 left-0 bg-hull-raised border border-line rounded-md p-4 w-72 shadow-e2 text-sm font-mono animate-fade-up">
          <div className="flex justify-between text-text-secondary mb-1">
            <span>Base price</span>
            <span className="text-text-primary">{listing.basePrice} VCT</span>
          </div>
          <div className="flex justify-between text-text-secondary mb-1">
            <span>Providers available</span>
            <span className="text-tide">{skillHistory?.[0]?.supply ?? '?'}</span>
          </div>
          <div className="flex justify-between text-text-secondary mb-1">
            <span>Recent demand</span>
            <span className="text-ember">{skillHistory?.[0]?.demand?.toFixed(1) ?? '?'}</span>
          </div>
          <div className="flex justify-between text-text-secondary mb-1">
            <span>Multiplier</span>
            <span className="text-gold">×{listing.multiplier?.toFixed(2)}</span>
          </div>
          <div className="border-t border-line my-2" />
          <div className="flex justify-between font-bold">
            <span className="text-text-primary">Price</span>
            <span className="text-gold">{listing.currentPrice} VCT</span>
          </div>
        </div>
      )}
    </div>
  );
}
