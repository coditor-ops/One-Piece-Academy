import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PriceBadge } from './PriceBadge.jsx';
import { TierBadge } from './ui.jsx';

export function BountyPosterCard({ listing, onBook }) {
  const navigate = useNavigate();
  if (!listing) return null;

  const isSurging = listing.multiplier >= 1.5;
  const isRising = listing.multiplier >= 1.1;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative bg-hull border rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-e1 hover:shadow-e2 transition-colors duration-300 ${
        isSurging 
          ? 'border-ember/40 hover:border-ember/80 shadow-[0_0_20px_rgba(255,90,60,0.15)]' 
          : isRising 
          ? 'border-gold/40 hover:border-gold/80' 
          : 'border-line hover:border-text-muted'
      }`}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] uppercase tracking-wider font-mono font-semibold px-2.5 py-0.5 rounded-full bg-deep text-text-muted border border-line/60">
          {listing.skill?.category || 'Skill Listing'}
        </span>
        {isSurging && (
          <span className="animate-pulse-ember bg-ember/20 text-ember border border-ember/30 text-[11px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
            🔥 BOUNTY SURGE
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-xl bg-deep border border-line/50 group-hover:scale-110 transition-transform duration-300">
              {listing.skill?.icon || '⚔️'}
            </span>
            <div>
              <h3 
                onClick={() => navigate(`/skills/${listing.skillId}`)}
                className="font-display text-xl text-text-primary hover:text-gold transition-colors cursor-pointer line-clamp-1"
              >
                {listing.skill?.name || 'Skill Title'}
              </h3>
              <div className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                <span>{listing.level}</span>
                <span>•</span>
                <span>{listing.durationMin} min session</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-text-secondary text-sm line-clamp-2 mt-2 leading-relaxed font-normal">
          {listing.description || listing.skill?.description}
        </p>
      </div>

      {/* Provider & Rating */}
      <div className="pt-3 border-t border-line/50 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-deep flex items-center justify-center text-sm font-bold text-gold border border-line">
            {listing.provider?.avatar || listing.provider?.name?.[0]}
          </div>
          <div>
            <div className="text-xs font-semibold text-text-primary leading-tight">
              {listing.provider?.name}
            </div>
            <TierBadge tier={listing.provider?.tier || 'Rookie'} />
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-gold flex items-center justify-end gap-1">
            <span>★</span>
            <span>{listing.avgRating > 0 ? listing.avgRating.toFixed(1) : 'New'}</span>
            <span className="text-text-muted text-[10px]">({listing.ratingCount || 0})</span>
          </div>
          <span className="text-[10px] text-text-muted block">
            {listing.slots?.length || 0} slots available
          </span>
        </div>
      </div>

      {/* Bottom Price & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-line/40">
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider block font-mono">
            Vivre Card Price
          </span>
          <PriceBadge price={listing.currentPrice} basePrice={listing.basePrice} multiplier={listing.multiplier} size="md" />
        </div>

        <button
          onClick={() => onBook ? onBook(listing) : navigate(`/skills/${listing.skillId}`)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-gold text-abyss hover:bg-gold-bright hover:-translate-y-0.5 shadow-glow-gold transition-all duration-200 cursor-pointer"
        >
          Send Vivre Card
        </button>
      </div>
    </motion.div>
  );
}
