import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BountyPosterCard } from '../components/BountyPosterCard.jsx';
import { PurchaseModal } from '../components/PurchaseModal.jsx';
import { SkillOverviewModal } from '../components/SkillOverviewModal.jsx';
import { MarketHero } from '../components/MarketHero.jsx';
import { Spinner, EmptyState, ErrorState, TierBadge, VCT, Modal } from '../components/ui.jsx';

const CATEGORIES = ['All', 'Haki', 'Swordsmanship', 'Fish-Man Karate', 'Navigation', 'Cooking', 'Devil Fruit Mastery', 'Shipwright'];

// Reading this as: P2P skill marketplace for One Piece Academy pirates, with a dark-navy pirate bounty exchange visual language, leaning toward dark tech glassmorphism + custom parchment tokens.
export default function Market() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQ = searchParams.get('q') || '';
  const viewMode = searchParams.get('view') || 'skills'; // 'skills' | 'mentors'

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('demand');
  const [minRating, setMinRating] = useState('');
  const [purchaseListing, setPurchaseListing] = useState(null);
  const [overviewListing, setOverviewListing] = useState(null);
  const [overviewMentor, setOverviewMentor] = useState(null);

  // Sync state if URL query params change and auto-scroll
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const query = searchParams.get('q') || '';
    if (cat !== category) setCategory(cat);
    if (query !== q) setQ(query);

    if (window.location.hash === '#skills-section' || searchParams.get('scroll') === 'true') {
      setTimeout(() => {
        const el = document.getElementById('skills-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams]);

  const updateCategory = (cat) => {
    const nextCat = cat === 'All' ? '' : cat;
    setCategory(nextCat);
    const newParams = new URLSearchParams(searchParams);
    if (nextCat) newParams.set('category', nextCat);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const updateViewMode = (mode) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', mode);
    setSearchParams(newParams);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['listings', q, category, sort, minRating],
    queryFn: () => {
      const params = new URLSearchParams({ sort, limit: 50 });
      if (q) params.set('q', q);
      if (category && category !== 'All') params.set('category', category);
      if (minRating) params.set('minRating', minRating);
      return api.get(`/skills/listings?${params}`);
    },
    refetchInterval: 8000,
  });

  const hotListings = data?.listings?.filter(l => l.multiplier >= 1.5) || [];

  // Group listings by provider for mentors view
  const mentorsMap = new Map();
  data?.listings?.forEach(l => {
    if (!l.provider) return;
    if (!mentorsMap.has(l.provider.id)) {
      mentorsMap.set(l.provider.id, {
        ...l.provider,
        listings: [l],
      });
    } else {
      mentorsMap.get(l.provider.id).listings.push(l);
    }
  });
  const mentors = Array.from(mentorsMap.values());

  return (
    <div className="w-full space-y-8">
      
      {/* Cinematic Hero - Scrub Animation */}
      {user && <MarketHero />}

      {/* Personalized Welcome Banner for Authenticated Pirates */}
      {user && (
        <div className="bg-gradient-to-r from-[#141E34]/50 via-[#1A2644]/50 to-[#0D1526]/50 backdrop-blur-md border border-gold/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden mb-6">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-hull/80 to-deep/80 flex items-center justify-center text-3xl border border-gold/50 shadow-md shrink-0">
              {user.avatar || '☠️'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                  {user.crew || 'Straw Hat Fleet'}
                </span>
                <TierBadge tier={user.tier || 'Rookie'} />
              </div>
              <h1 className="font-display text-2xl sm:text-4xl text-text-primary tracking-tight drop-shadow-md">
                Welcome Aboard, Captain {user.name}!
              </h1>
              <p className="text-text-secondary text-xs sm:text-sm mt-1 drop-shadow-sm">
                Your Vivre Card Wallet is loaded and ready for trading skills across Sabaody.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
            <div className="bg-[#EADBB8]/90 text-[#2A1D0E] px-4 py-2.5 rounded-2xl font-mono text-xs font-black shadow-md border border-[#C9B58A] flex items-center gap-2">
              <span>🪙</span>
              <span>{user.balance?.toLocaleString() || 500} VCT Available</span>
            </div>
            <button 
              onClick={() => navigate('/wallet')}
              className="px-4 py-2.5 text-xs font-bold rounded-2xl bg-gold text-[#1A1204] hover:bg-gold-bright transition-all shadow-glow-gold cursor-pointer"
            >
              + Offer a Skill
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#141E34]/40 backdrop-blur-md border border-line/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-e2">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#EADBB8]/90 text-[#2A1D0E] px-3.5 py-1 rounded-md text-xs font-mono font-black tracking-widest mb-3 shadow-sm">
            <span>🏝️</span>
            <span>SABAODY ARCHIPELAGO • CENTRAL EXCHANGE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl text-text-primary tracking-tight drop-shadow-lg">
            Sabaody Skill Market
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mt-2 max-w-2xl leading-relaxed drop-shadow-sm">
            Browse skills offered across the Grand Line. Prices react live to demand surges, master availability, and pirate requests.
          </p>
        </div>

        {/* View Switcher Capsule */}
        <div className="flex items-center gap-2 bg-deep/50 backdrop-blur-md p-1.5 rounded-2xl border border-line/50 shadow-inner">
          <button
            onClick={() => updateViewMode('skills')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              viewMode !== 'mentors'
                ? 'bg-gold text-abyss shadow-glow-gold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            ⚔️ Explore Skills
          </button>
          <button
            onClick={() => updateViewMode('mentors')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              viewMode === 'mentors'
                ? 'bg-gold text-abyss shadow-glow-gold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            👑 Find Mentors
          </button>
        </div>
      </div>

      {/* Category Island Filter Pills & Scroll Target */}
      <div id="skills-section" className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-mt-28">
        {CATEGORIES.map(cat => {
          const isSelected = (cat === 'All' && !category) || category === cat;
          return (
            <button
              key={cat}
              onClick={() => updateCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-sm ${
                isSelected 
                  ? 'bg-crimson text-white shadow-glow-crimson scale-105' 
                  : 'bg-hull/80 backdrop-blur-md border border-line/60 text-text-secondary hover:text-text-primary hover:border-gold/50'
              }`}
            >
              {cat === 'All' ? '🌐 All Islands' : cat}
            </button>
          );
        })}
      </div>

      {/* Hot Surging Section */}
      {hotListings.length > 0 && viewMode !== 'mentors' && (
        <div className="bg-[#141E34]/80 backdrop-blur-xl border-2 border-crimson/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-xl bg-crimson/20 border border-crimson/30">🔥</span>
              <div>
                <h3 className="font-display text-2xl sm:text-3xl text-text-primary leading-tight">
                  High Demand Bounty Surges
                </h3>
                <p className="text-text-secondary text-xs">Skills experiencing intense request volumes</p>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-white bg-crimson px-3 py-1 rounded-full shadow-sm">
              {hotListings.length} Surging Skills
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotListings.slice(0, 3).map(l => (
              <BountyPosterCard
                key={l.id}
                listing={l}
                onBook={l => setPurchaseListing(l)}
                onOpenOverview={l => setOverviewListing(l)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-hull/90 backdrop-blur-xl border border-line/80 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-e1">
        <div className="flex-1 min-w-[260px]">
          <input
            className="input w-full"
            placeholder="🔍 Search by skill, master name, or mastery level..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select className="input w-auto" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="demand">Sort: Highest Demand Surge</option>
            <option value="price">Sort: Price (High to Low)</option>
            <option value="rating">Sort: Best Crew Rating</option>
            <option value="newest">Sort: Newly Listed</option>
          </select>

          <select className="input w-auto" value={minRating} onChange={e => setMinRating(e.target.value)}>
            <option value="">Rating: Any Reputation</option>
            <option value="4">4.0+ Stars ★</option>
            <option value="3">3.0+ Stars ★</option>
          </select>
        </div>
      </div>

      {/* Loading, Error, Empty States */}
      {isLoading && (
        <div className="flex justify-center py-24">
          <Spinner size={36} />
        </div>
      )}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {data?.listings?.length === 0 && !isLoading && (
        <EmptyState 
          icon="🌊" 
          title="No mastery listings found" 
          description="Try clearing your search filters or be the first master to offer a skill in this category." 
        />
      )}

      {/* MENTORS VIEW MODE */}
      {viewMode === 'mentors' && mentors.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-text-muted px-1">
            <span>Showing {mentors.length} Grand Line Masters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((m, index) => (
              <div key={m.id} id={index === 0 ? 'tour-mentor-card' : undefined} className="bg-hull/90 backdrop-blur-xl border border-line/80 rounded-2xl p-6 shadow-e1 hover:border-gold/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-14 h-14 rounded-full bg-deep flex items-center justify-center text-2xl font-bold text-gold border-2 border-gold/40 shadow-inner">
                      {m.avatar || m.name[0]}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-text-primary">{m.name}</h3>
                      <TierBadge tier={m.tier || 'Rookie'} />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-text-muted uppercase font-mono">Offered Skills ({m.listings.length})</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.listings.map(l => (
                        <span 
                          key={l.id}
                          onClick={() => navigate(`/skills/${l.skillId}`)}
                          className="px-2.5 py-1 bg-deep rounded-lg text-xs font-semibold text-text-primary border border-line/60 hover:border-gold/50 cursor-pointer flex items-center gap-1"
                        >
                          <span>{l.skill?.icon || '⚔️'}</span>
                          <span>{l.skill?.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    onClick={() => navigate(`/skills/${m.listings[0]?.skillId}`)}
                    className="flex-1 py-2.5 px-2 text-xs font-bold rounded-xl bg-gold text-[#1A1204] hover:bg-gold-bright shadow-[0_0_15px_rgba(242,184,75,0.4)] transition-all cursor-pointer active:scale-95"
                  >
                    Send Vivre Card
                  </button>
                  <button
                    onClick={() => setOverviewMentor(m)}
                    className="flex-1 py-2.5 px-2 text-xs font-bold rounded-xl bg-white/5 text-text-primary hover:bg-white/10 hover:text-gold border border-white/10 transition-all cursor-pointer active:scale-95"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN SKILLS LISTINGS GRID */}
      {viewMode !== 'mentors' && data?.listings && data.listings.length > 0 && (
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-text-muted mb-4 px-1">
            <span>Showing {data.listings.length} of {data.total} listings</span>
            <span className="text-gold font-bold">Sorted by {sort}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.listings.map((l, index) => (
              <div key={l.id} id={index === 0 ? 'tour-skill-card' : undefined}>
                <BountyPosterCard
                  listing={l}
                  onBook={l => setPurchaseListing(l)}
                  onOpenOverview={l => setOverviewListing(l)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {overviewListing && (
        <SkillOverviewModal
          listing={overviewListing}
          onClose={() => setOverviewListing(null)}
          onBook={l => setPurchaseListing(l)}
        />
      )}

      {purchaseListing && (
        <PurchaseModal
          listing={purchaseListing}
          onClose={() => setPurchaseListing(null)}
        />
      )}

      <Modal open={!!overviewMentor} onClose={() => setOverviewMentor(null)} title={`${overviewMentor?.name || 'Master'}'s Profile`}>
        {overviewMentor && (
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-deep flex items-center justify-center text-3xl border border-line">
                  {overviewMentor.avatar || overviewMentor.name[0]}
                </div>
                <div>
                  <h3 className="font-display text-2xl text-text-primary">{overviewMentor.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <TierBadge tier={overviewMentor.tier || 'Rookie'} />
                    <span className="text-xs font-mono text-text-secondary">{overviewMentor.crew || 'No Crew'}</span>
                  </div>
                </div>
             </div>
             <div className="bg-hull/50 p-4 rounded-xl border border-line/50">
               <h4 className="font-semibold text-text-primary mb-2 text-sm uppercase tracking-wider">About</h4>
               <p className="text-sm text-text-secondary leading-relaxed">{overviewMentor.bio || 'This master is a mystery...'}</p>
             </div>
             <div>
               <h4 className="font-semibold text-text-primary mb-2 text-sm uppercase tracking-wider">Offered Skills</h4>
               <div className="grid grid-cols-1 gap-2">
                 {overviewMentor.listings.map(l => (
                    <div key={l.id} className="flex items-center justify-between bg-hull p-3 rounded-lg border border-line hover:border-gold/50 transition-colors cursor-pointer group" onClick={() => navigate(`/skills/${l.skillId}`)}>
                      <div className="flex items-center gap-2">
                        <span className="group-hover:scale-110 transition-transform">{l.skill?.icon}</span>
                        <span className="text-sm font-semibold group-hover:text-gold transition-colors">{l.skill?.name}</span>
                      </div>
                      <span className="text-gold font-mono text-sm font-bold">{l.price || l.basePrice} VCT</span>
                    </div>
                 ))}
               </div>
             </div>
          </div>
        )}
      </Modal>

      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 10px; color: #F3EEDF; padding: 10px 16px; font-size: 14px; outline: none; transition: border-color 150ms; } .input:focus { border-color: #F2B84B; } .input::placeholder { color: #6F7C99; } option { background: #0D1526; }`}</style>
    </div>
  );
}

