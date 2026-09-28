import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Modal, TierBadge, Spinner, EmptyState, ErrorState, VCT } from '../components/ui.jsx';
import { PriceBadge, WhyThisPrice } from '../components/PriceBadge.jsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SkillDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const qc = useQueryClient();
  const [requestModal, setRequestModal] = useState(null);

  const { data: skill, isLoading, error } = useQuery({
    queryKey: ['skill', id],
    queryFn: () => api.get(`/skills/${id}`),
    refetchInterval: 8000,
  });

  const { data: history } = useQuery({
    queryKey: ['price-history', id],
    queryFn: () => api.get(`/market/skills/${id}/price-history`),
    refetchInterval: 12000,
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={36} /></div>;
  if (error) return <ErrorState message={error.message} />;
  if (!skill) return null;

  const topListing = skill.listings?.[0];
  const chartData = history?.map(h => ({
    date: new Date(h.recordedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    price: h.price,
    supply: h.supply,
    demand: Math.round(h.demand),
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
        <Link to="/market" className="hover:text-gold transition-colors">Market</Link>
        <span>›</span>
        <span className="text-text-secondary">{skill.category}</span>
        <span>›</span>
        <span className="text-text-primary font-bold">{skill.name}</span>
      </div>

      {/* Hero Header */}
      <div className="bg-hull border border-line rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-e1">
        <div className="flex items-start gap-4">
          <span className="text-5xl p-4 bg-deep rounded-2xl border border-line">
            {skill.icon}
          </span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-mono font-semibold px-2.5 py-0.5 rounded-full bg-deep text-gold border border-line">
                {skill.category}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-text-primary tracking-tight">
              {skill.name}
            </h1>
            <p className="text-text-secondary text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              {skill.description}
            </p>
          </div>
        </div>

        {topListing && (
          <div className="bg-deep/80 border border-line p-5 rounded-xl flex flex-col gap-3 min-w-[240px]">
            <span className="text-xs text-text-muted uppercase tracking-wider font-mono">
              Current Market Price
            </span>
            <PriceBadge price={topListing.currentPrice} basePrice={topListing.basePrice} multiplier={topListing.multiplier} size="xl" />
            <WhyThisPrice listing={topListing} skillHistory={history} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Charts & Providers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Price History Chart */}
          {chartData.length > 0 && (
            <div className="bg-hull border border-line rounded-2xl p-6 shadow-e1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-primary font-display text-xl">
                  Price Dynamics Over Time
                </h3>
                <span className="text-xs font-mono text-gold">
                  📈 Live Recalculation
                </span>
              </div>

              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" stroke="#6F7C99" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#6F7C99" tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ background: '#131D33', border: '1px solid #2A3A5C', borderRadius: 8 }} 
                      labelStyle={{ color: '#A9B4CC' }} 
                      itemStyle={{ color: '#F2B84B' }} 
                    />
                    {topListing && (
                      <ReferenceLine 
                        y={topListing.basePrice} 
                        stroke="#6F7C99" 
                        strokeDasharray="3 3" 
                        label={{ value: 'Base Price', fill: '#6F7C99', fontSize: 11 }} 
                      />
                    )}
                    <Line type="monotone" dataKey="price" stroke="#F2B84B" strokeWidth={2.5} dot={{ fill: '#F2B84B', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Supply vs Demand Bar Chart */}
          {chartData.length > 0 && (
            <div className="bg-hull border border-line rounded-2xl p-6 shadow-e1">
              <h3 className="text-text-primary font-display text-xl mb-4">
                Supply (S) vs Demand (D) Ratio
              </h3>

              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(-7)}>
                    <XAxis dataKey="date" stroke="#6F7C99" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#6F7C99" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#131D33', border: '1px solid #2A3A5C', borderRadius: 8 }} />
                    <Bar dataKey="supply" fill="#3DA9FC" name="Active Supply (S)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="demand" fill="#FF5A3C" name="Weighted Demand (D)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Providers List */}
          <div className="bg-hull border border-line rounded-2xl p-6 shadow-e1">
            <h3 className="text-text-primary font-display text-2xl mb-4">
              Available Masters ({skill.listings?.length || 0})
            </h3>

            {skill.listings?.length === 0 && (
              <EmptyState icon="📜" title="No active listings for this skill" description="Be the first master to offer training in this skill." />
            )}

            <div className="flex flex-col gap-4">
              {skill.listings?.map(l => (
                <div key={l.id} className="bg-deep border border-line/60 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 hover:border-gold/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-hull flex items-center justify-center text-xl font-bold text-gold border border-line">
                      {l.provider.avatar || l.provider.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary text-base">{l.provider.name}</span>
                        <TierBadge tier={l.provider.tier} />
                      </div>
                      <div className="text-text-secondary text-xs mt-0.5">
                        {l.level} · {l.durationMin}min · ★ {l.avgRating > 0 ? l.avgRating.toFixed(1) : 'New'} ({l.ratingCount} reviews)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <PriceBadge price={l.currentPrice} basePrice={l.basePrice} multiplier={l.multiplier} />
                    {user && user.id !== l.providerId && l.slots?.length > 0 && (
                      <Button onClick={() => setRequestModal(l)}>
                        Send Vivre Card
                      </Button>
                    )}
                    {(!l.slots?.length) && <span className="text-text-muted text-xs font-mono">No slots</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sticky Summary Sidebar */}
        <div className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="bg-hull border border-line rounded-2xl p-6 space-y-4 shadow-e2">
            <h3 className="font-display text-xl text-text-primary border-b border-line pb-3">
              Skill Overview
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-text-muted">Category</span>
                <span className="text-text-primary">{skill.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Available Teachers</span>
                <span className="text-tide font-bold">{skill.listings?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Escrow Protection</span>
                <span className="text-foam font-bold">100% Guaranteed</span>
              </div>
            </div>

            {topListing && user && user.id !== topListing.providerId && topListing.slots?.length > 0 && (
              <Button className="w-full text-sm font-bold h-12 shadow-glow-gold" onClick={() => setRequestModal(topListing)}>
                Send Vivre Card ({Number(topListing.currentPrice).toLocaleString()} VCT)
              </Button>
            )}
          </div>
        </div>
      </div>

      {requestModal && (
        <RequestModal
          listing={requestModal}
          user={user}
          onClose={() => setRequestModal(null)}
          onSuccess={() => { setRequestModal(null); qc.invalidateQueries(['skill', id]); refreshUser(); }}
        />
      )}
    </div>
  );
}

function RequestModal({ listing, user, onClose, onSuccess }) {
  const [slotId, setSlotId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: slots } = useQuery({
    queryKey: ['slots', listing.id],
    queryFn: () => api.get(`/skills/${listing.skillId}`).then(s => s.listings?.find(l => l.id === listing.id)?.slots || []),
  });

  const mutation = useMutation({
    mutationFn: () => api.post('/requests', { listingId: listing.id, slotId, message }),
    onSuccess,
    onError: e => setError(e.message),
  });

  const canAfford = (user?.balance || 0) >= listing.currentPrice;
  const afterBalance = (user?.balance || 0) - listing.currentPrice;

  return (
    <Modal open title="Send Vivre Card Request" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="bg-deep rounded-xl p-4 text-sm border border-line/60">
          <div className="font-semibold text-text-primary text-base">{listing.skill?.name || 'Skill'}</div>
          <div className="text-text-muted text-xs">with {listing.provider?.name} · {listing.durationMin}min duration</div>
        </div>

        <div>
          <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-2">Select Training Slot</label>
          {!slots?.length && <p className="text-text-muted text-xs">No open slots for this provider.</p>}
          <div className="flex flex-wrap gap-2">
            {slots?.map(s => (
              <button 
                key={s.id}
                type="button"
                className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                  slotId === s.id 
                    ? 'border-gold bg-gold/15 text-gold font-bold shadow-glow-gold' 
                    : 'border-line bg-deep text-text-secondary hover:border-gold/50'
                }`}
                onClick={() => setSlotId(s.id)}
              >
                {new Date(s.startAt).toLocaleDateString()} {new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-1">Message for Master (optional)</label>
          <textarea 
            className="w-full bg-deep border border-line rounded-lg p-3 text-text-primary text-xs resize-none focus:border-gold outline-none transition-colors"
            rows={2} 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            placeholder="Tell the master why you need this training session..." 
          />
        </div>

        <div className="bg-deep rounded-xl p-4 text-xs font-mono flex flex-col gap-1.5 border border-line/60">
          <div className="flex justify-between"><span className="text-text-muted">Locked Price</span><VCT amount={listing.currentPrice} /></div>
          <div className="flex justify-between"><span className="text-text-muted">Your Current Balance</span><VCT amount={user?.balance || 0} /></div>
          <div className="flex justify-between border-t border-line/60 pt-2 mt-1">
            <span className="text-text-secondary font-bold">Balance After Hold</span>
            <span className={`font-bold ${canAfford ? 'text-gold' : 'text-crimson'}`}>
              🃏 {afterBalance.toLocaleString()} VCT
            </span>
          </div>
          <p className="text-text-muted text-[11px] mt-1">
            Held safely by Marine HQ Escrow until session confirmation. 100% refunded if rejected or expired.
          </p>
        </div>

        {!canAfford && (
          <p className="text-crimson text-xs bg-crimson/10 p-2.5 rounded-lg border border-crimson/20">
            ⚠️ You need {(listing.currentPrice - (user?.balance || 0)).toLocaleString()} more VCT. Teach a skill to earn tokens!
          </p>
        )}
        
        {error && <p className="text-crimson text-xs">{error}</p>}

        <Button
          className="w-full h-12 text-sm font-bold shadow-glow-gold"
          disabled={!slotId || !canAfford || mutation.isPending}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Send Vivre Card for {Number(listing.currentPrice).toLocaleString()} VCT
        </Button>
      </div>
    </Modal>
  );
}
