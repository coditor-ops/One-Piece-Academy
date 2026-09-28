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
    { label: "⚖️ Balanced Sabaody Market", S: 5, D: 5, base: 150 },
    { label: "🌊 Oversupplied Cooking", S: 12, D: 2, base: 100 },
    { label: "⚡ Zoro Swordsmanship Surge", S: 2, D: 18, base: 180 },
  ];

  return (
    <div className="relative bg-[#141E34]/90 backdrop-blur-xl border border-line/80 rounded-3xl p-6 sm:p-8 shadow-e2 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -right-24 -top-24 w-72 h-72 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-72 h-72 bg-crimson/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-line/50 pb-5">
          <div>
            <span className="text-crimson text-xs font-mono font-black uppercase tracking-widest block mb-1">
              ⚓ Dynamic Economy Engine
            </span>
            <h3 className="font-display text-3xl sm:text-4xl text-text-primary tracking-tight">
              Live Supply & Demand Pricing Engine
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-mono font-bold">Presets:</span>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => {
                    setSupply(p.S);
                    setDemand(p.D);
                    setBasePrice(p.base);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-deep/90 border border-line hover:border-gold text-text-secondary hover:text-gold transition-all cursor-pointer shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-deep/70 p-4 rounded-2xl border border-line/50">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-text-primary font-bold flex items-center gap-2">
                  <span className="text-tide">🛡️ Active Supply (S)</span>
                  <span className="text-xs text-text-muted font-normal">(Available teachers with open slots)</span>
                </span>
                <span className="font-mono text-tide font-black text-base">{supply} masters</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={supply}
                onChange={e => setSupply(parseInt(e.target.value))}
                className="w-full h-2.5 bg-hull rounded-lg appearance-none cursor-pointer accent-tide"
              />
            </div>

            <div className="bg-deep/70 p-4 rounded-2xl border border-line/50">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-text-primary font-bold flex items-center gap-2">
                  <span className="text-crimson">🔥 Weighted Demand (D)</span>
                  <span className="text-xs text-text-muted font-normal">(Session requests in last 7 days)</span>
                </span>
                <span className="font-mono text-crimson font-black text-base">{demand} requests</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={demand}
                onChange={e => setDemand(parseInt(e.target.value))}
                className="w-full h-2.5 bg-hull rounded-lg appearance-none cursor-pointer accent-crimson"
              />
            </div>

            <div className="bg-deep/70 p-4 rounded-2xl border border-line/50">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-text-primary font-bold">Base Price Set by Master</span>
                <span className="font-mono text-gold font-black text-base">{basePrice} VCT</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={basePrice}
                onChange={e => setBasePrice(parseInt(e.target.value))}
                className="w-full h-2.5 bg-hull rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>
          </div>

          {/* Parchment Live Output Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#F3EEDF] to-[#EADBB8] text-[#2A1D0E] border-2 border-[#C9B58A] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative shadow-2xl overflow-hidden">
            <div className="text-xs font-mono font-black uppercase tracking-widest text-[#2A1D0E]/70 mb-1">
              Calculated Live Market Price
            </div>
            
            <motion.div
              key={calculatedPrice}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="my-3"
            >
              <span className="font-mono text-6xl font-black text-[#1B130B] tracking-tight">
                {calculatedPrice.toLocaleString()}
              </span>
              <span className="text-crimson font-black text-2xl ml-2 font-display">VCT</span>
            </motion.div>

            <div className="flex items-center gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-black font-mono shadow-sm ${
                multiplier >= 1.5 ? 'bg-crimson text-white' :
                multiplier >= 1.1 ? 'bg-emerald-700 text-white' :
                multiplier <= 0.9 ? 'bg-blue-700 text-white' : 'bg-[#2A1D0E] text-[#EADBB8]'
              }`}>
                {pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`} Surge
              </span>
              <span className="text-xs font-mono font-bold text-[#2A1D0E]/80">
                (Multiplier ×{multiplier.toFixed(2)})
              </span>
            </div>

            <div className="w-full pt-4 border-t border-[#2A1D0E]/20 grid grid-cols-2 text-xs font-mono text-[#2A1D0E]">
              <div>
                <span className="block text-[#2A1D0E]/60 text-[10px] uppercase font-bold">Market Pressure (D/S)</span>
                <span className="font-black text-sm text-[#1B130B]">{pressure.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[#2A1D0E]/60 text-[10px] uppercase font-bold">Sensitivity (k)</span>
                <span className="font-black text-sm text-[#1B130B]">{k}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
