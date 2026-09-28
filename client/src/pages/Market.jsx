import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { BountyPosterCard } from '../components/BountyPosterCard.jsx';
import { Spinner, EmptyState, ErrorState } from '../components/ui.jsx';

const CATEGORIES = ['All', 'Haki', 'Swordsmanship', 'Fish-Man Karate', 'Navigation', 'Cooking', 'Devil Fruit Mastery', 'Shipwright'];

export default function Market() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('demand');
  const [minRating, setMinRating] = useState('');

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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line/40 pb-6">
        <div>
          <span className="text-gold text-xs font-mono font-semibold uppercase tracking-widest block mb-1">
            🏝️ Sabaody Archipelago • Central Exchange
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-text-primary">
            Sabaody Skill Market
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1">
            Browse skills offered across the Grand Line. Prices react live to demand and supply.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-hull p-3 rounded-xl border border-line">
          <span className="text-2xl">⚡</span>
          <div className="text-xs">
            <span className="text-text-primary font-bold block">Live Market Feed</span>
            <span className="text-text-muted">Auto-refreshes every 8 seconds</span>
          </div>
        </div>
      </div>

      {/* Category Island Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => {
          const isSelected = (cat === 'All' && !category) || category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'bg-gold text-abyss shadow-glow-gold' 
                  : 'bg-hull border border-line text-text-secondary hover:text-text-primary hover:border-gold/40'
              }`}
            >
              {cat === 'All' ? '🌐 All Islands' : cat}
            </button>
          );
        })}
      </div>

      {/* Hot Surging Section */}
      {hotListings.length > 0 && (
        <div className="bg-hull/40 border border-ember/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <h2 className="font-display text-2xl text-text-primary">Surging Bounties</h2>
              <span className="text-xs font-mono font-bold text-ember bg-ember/15 px-2.5 py-0.5 rounded-full">
                High Demand ({hotListings.length})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotListings.slice(0, 3).map(l => (
              <BountyPosterCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-hull border border-line rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-e1">
        <div className="flex-1 min-w-[240px]">
          <input
            className="input"
            placeholder="🔍 Search by skill, provider name, or mastery..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select className="input w-auto" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="demand">Sort: Highest Demand</option>
            <option value="price">Sort: Price (High to Low)</option>
            <option value="rating">Sort: Best Rating</option>
            <option value="newest">Sort: Newest</option>
          </select>

          <select className="input w-auto" value={minRating} onChange={e => setMinRating(e.target.value)}>
            <option value="">Rating: Any</option>
            <option value="4">4.0+ Stars ★</option>
            <option value="3">3.0+ Stars ★</option>
          </select>
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size={36} />
        </div>
      )}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {data?.listings?.length === 0 && (
        <EmptyState 
          icon="🌊" 
          title="No mastery listings found" 
          description="Try clearing your search filters or be the first master to list a skill." 
        />
      )}

      {/* Main Listings Bento Grid */}
      {data?.listings && data.listings.length > 0 && (
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-text-muted mb-4">
            <span>Showing {data.listings.length} of {data.total} listings</span>
            <span>Sorted by {sort}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.listings.map(l => (
              <BountyPosterCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}

      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 8px; color: #F3EEDF; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 150ms; } .input:focus { border-color: #F2B84B; } .input::placeholder { color: #6F7C99; } option { background: #0D1526; }`}</style>
    </div>
  );
}
