import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PriceBadge } from './PriceBadge.jsx';
import { TierBadge } from './ui.jsx';

export function BountyPosterCard({ listing, onBook, onOpenOverview }) {
  const navigate = useNavigate();
  if (!listing) return null;

  const targetId = listing.skillId || listing.skill?.id || listing.id;
  const isSurging = listing.multiplier >= 1.5;
  const isRising = listing.multiplier >= 1.1;

  const handleOpenOverview = (e) => {
    e.stopPropagation();
    if (onOpenOverview) {
      onOpenOverview(listing);
    } else if (targetId) {
      navigate(`/skills/${targetId}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`group relative bg-[#141E34]/30 backdrop-blur-md border rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-e1 hover:shadow-e2 transition-all duration-300 ${
        isSurging 
          ? 'border-crimson/60 hover:border-crimson shadow-[0_0_25px_rgba(217,46,50,0.2)]' 
          : isRising 
          ? 'border-gold/50 hover:border-gold shadow-[0_0_20px_rgba(242,184,75,0.15)]' 
          : 'border-line/70 hover:border-text-muted'
      }`}
    >
      {/* Top Banner Tag & Bounty Label */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-widest font-mono font-bold px-3 py-1 rounded-full bg-deep/40 text-gold border border-gold/30">
          {listing.skill?.category || 'Grand Line Skill'}
        </span>
        {isSurging ? (
          <span className="animate-pulse-ember bg-crimson text-white text-[10px] font-black font-mono px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            🔥 BOUNTY SURGE
          </span>
        ) : isRising ? (
          <span className="bg-emerald-600/90 text-white text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1">
            ▲ TRENDING
          </span>
        ) : null}
      </div>

      {/* Main Content & Icon */}
      <div className="mb-4">
        <div className="flex items-start gap-3.5 mb-2 cursor-pointer" onClick={handleOpenOverview}>
          <span className="text-3xl p-2.5 rounded-2xl bg-deep/40 border border-line/60 group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0">
            {listing.skill?.icon || '⚔️'}
          </span>
          <div>
            <h3 
              className="font-display text-xl sm:text-2xl text-text-primary hover:text-gold transition-colors cursor-pointer line-clamp-1 leading-snug"
            >
              {listing.skill?.name || 'Skill Title'}
            </h3>
            <div className="text-xs text-text-secondary flex items-center gap-2 mt-0.5 font-medium">
              <span className="text-gold font-semibold">{listing.level}</span>
              <span className="opacity-40">•</span>
              <span>{listing.durationMin} min session</span>
            </div>
          </div>
        </div>

        <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 mt-2 leading-relaxed font-normal">
          {listing.description || listing.skill?.description}
        </p>

        <button
          type="button"
          onClick={handleOpenOverview}
          className="text-gold hover:text-gold-bright text-xs font-mono font-bold mt-2.5 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>📖 View Overview & Target Audience</span>
          <span>→</span>
        </button>
      </div>

      {/* Provider & Bounty Rating */}
      <div className="pt-3 border-t border-line/50 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-deep flex items-center justify-center text-sm font-bold text-gold border border-line shadow-sm">
            {listing.provider?.avatar || listing.provider?.name?.[0]}
          </div>
          <div>
            <div className="text-xs font-bold text-text-primary leading-tight">
              {listing.provider?.name}
            </div>
            <TierBadge tier={listing.provider?.tier || 'Rookie'} />
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-black text-gold flex items-center justify-end gap-1 font-mono">
            <span>★</span>
            <span>{listing.avgRating > 0 ? listing.avgRating.toFixed(1) : 'New'}</span>
            <span className="text-text-muted text-[10px]">({listing.ratingCount || 0})</span>
          </div>
          <span className="text-[10px] text-text-muted font-mono block">
            {listing.slots?.length || 0} open slots
          </span>
        </div>
      </div>

      {/* Bottom Price & One Piece CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-line/50">
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider block font-mono font-semibold">
            Vivre Card Price
          </span>
          <PriceBadge price={listing.currentPrice} basePrice={listing.basePrice} multiplier={listing.multiplier} size="md" />
        </div>

        <button
          onClick={() => onBook ? onBook(listing) : navigate(`/skills/${listing.skillId}`)}
          className="px-4 py-2 text-xs font-black rounded-xl bg-gold text-[#1A1204] hover:bg-gold-bright hover:shadow-glow-gold active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
        >
          Send Vivre Card 📜
        </button>
      </div>
    </motion.div>
  );
}
