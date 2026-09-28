import { useState } from 'react';
import { motion } from 'framer-motion';

export function InteractiveDemandSimulator() {
  const [basePrice, setBasePrice] = useState(200);
  const [supply, setSupply] = useState(1);
  const [demand, setDemand] = useState(15);
  const k = 0.6;

  // Pricing engine formula matching PRD section 6 & architecture.md section 7
  const pressure = demand / Math.max(supply, 1);
  const rawMult = 1 + k * Math.log(1 + pressure);
  const multiplier = Math.min(Math.max(rawMult, 0.7), 3.0);
  const calculatedPrice = Math.round(basePrice * multiplier);
  const pctChange = Math.round((multiplier - 1) * 100);

  const presets = [
    { label: "🔥 Rayleigh's Haki Rush", S: 1, D: 25, base: 200 },
    { label: "⚖️ Balanced Market", S: 4, D: 4, base: 150 },
    { label: "🌊 Over-supplied Skill", S: 10, D: 2, base: 100 },
    { label: "⚡ Sudden Demand Spike", S: 2, D: 18, base: 180 },
  ];

  return (
    <div className="relative bg-hull border border-line rounded-2xl p-6 shadow-e2 overflow-hidden backdrop-blur-md">
      {/* Background ambient mesh */}
      <div className="absolute -right-20 -top-20 w-60 h-60 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-ember/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-line/60 pb-4">
          <div>
            <span className="text-ember text-xs font-mono font-semibold uppercase tracking-widest block mb-1">
              Interactive Economy Engine
            </span>
            <h3 className="font-display text-2xl text-text-primary">
              Live Supply & Demand Pricing Simulator
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => {
                    setSupply(p.S);
                    setDemand(p.D);
                    setBasePrice(p.base);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-deep border border-line hover:border-gold/60 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-text-secondary flex items-center gap-2">
                  <span className="text-tide">🛡️ Supply (S)</span>
                  <span className="text-xs text-text-muted">(Active teachers with open slots)</span>
                </span>
                <span className="font-mono text-tide font-bold">{supply} providers</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={supply}
                onChange={e => setSupply(parseInt(e.target.value))}
                className="w-full h-2 bg-deep rounded-lg appearance-none cursor-pointer accent-tide"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-text-secondary flex items-center gap-2">
                  <span className="text-ember">🔥 Demand (D)</span>
                  <span className="text-xs text-text-muted">(Session requests in 7 days)</span>
                </span>
                <span className="font-mono text-ember font-bold">{demand} requests</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={demand}
                onChange={e => setDemand(parseInt(e.target.value))}
                className="w-full h-2 bg-deep rounded-lg appearance-none cursor-pointer accent-ember"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-text-secondary">Base Price</span>
                <span className="font-mono text-gold font-bold">{basePrice} VCT</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={basePrice}
                onChange={e => setBasePrice(parseInt(e.target.value))}
                className="w-full h-2 bg-deep rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>
          </div>

          {/* Result Output Card */}
          <div className="lg:col-span-5 bg-deep/80 border border-line rounded-xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="text-xs text-text-muted uppercase tracking-widest mb-1">Calculated Live Price</div>
            
            <motion.div
              key={calculatedPrice}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="my-2"
            >
              <span className="font-mono text-5xl font-black text-gold tracking-tight drop-shadow-[0_0_20px_rgba(242,184,75,0.3)]">
                {calculatedPrice.toLocaleString()}
              </span>
              <span className="text-gold font-bold text-lg ml-2">VCT</span>
            </motion.div>

            <div className="flex items-center gap-2 mt-1 mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                multiplier >= 1.5 ? 'bg-ember/20 text-ember border border-ember/30' :
                multiplier >= 1.1 ? 'bg-ember/15 text-ember' :
                multiplier <= 0.9 ? 'bg-foam/20 text-foam' : 'bg-line text-text-secondary'
              }`}>
                {pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`} Surge
              </span>
              <span className="text-xs font-mono text-text-muted">
                (Multiplier ×{multiplier.toFixed(2)})
              </span>
            </div>

            <div className="w-full pt-3 border-t border-line/50 grid grid-cols-2 text-xs font-mono text-text-secondary">
              <div>
                <span className="block text-text-muted text-[10px] uppercase">Market Pressure</span>
                <span className="font-bold text-text-primary">{pressure.toFixed(2)} D/S</span>
              </div>
              <div>
                <span className="block text-text-muted text-[10px] uppercase">Sensitivity (k)</span>
                <span className="font-bold text-text-primary">{k}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
