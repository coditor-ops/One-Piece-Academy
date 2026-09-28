import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Button, StatusChip, Spinner, EmptyState, ErrorState, VCT, Modal, Badge } from '../components/ui.jsx';

const CATEGORIES = ['Haki', 'Swordsmanship', 'Fish-Man Karate', 'Navigation', 'Cooking', 'Devil Fruit Mastery', 'Shipwright', 'Programming / Tech', 'General'];

export default function Requests() {
  const [tab, setTab] = useState('received'); // 'received' | 'sent' | 'custom'
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('Haki');
  const [offeredBounty, setOfferedBounty] = useState(150);
  const [email, setEmail] = useState('pratushprasad.5398@gmail.com');
  const [description, setDescription] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['requests', tab],
    queryFn: () => {
      if (tab === 'custom') return api.get('/requests/custom');
      return api.get(`/requests?role=${tab === 'received' ? 'provider' : 'learner'}`);
    },
    refetchInterval: 8000,
  });

  const accept = useMutation({
    mutationFn: id => api.post(`/requests/${id}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const reject = useMutation({
    mutationFn: id => api.post(`/requests/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  const cancel = useMutation({
    mutationFn: id => api.post(`/requests/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  const createCustomRequest = useMutation({
    mutationFn: (reqData) => api.post('/requests/custom', reqData),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['market-overview'] });
      setSuccessToast(`📜 Needed skill request successfully generated! Notification dispatched to ${data.email || email}`);
      setShowCustomModal(false);
      setSkillName('');
      setDescription('');
      setTab('custom');
      setTimeout(() => setSuccessToast(''), 6000);
    },
  });

  const fulfillCustomRequest = useMutation({
    mutationFn: (id) => api.post(`/requests/custom/${id}/fulfill`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    createCustomRequest.mutate({
      skillName: skillName.trim(),
      category,
      offeredBounty: Number(offeredBounty) || 100,
      email: email.trim() || 'pratushprasad.5398@gmail.com',
      description: description.trim(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/40 pb-5">
        <div>
          <span className="text-gold text-xs font-mono font-semibold uppercase tracking-widest block mb-1">
            📜 Marine HQ Escrow & Skill Inbox
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
            Vivre Card Requests
          </h1>
        </div>

        {/* Generate Request CTA & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gold text-[#1A1204] hover:bg-gold-bright transition-all shadow-glow-gold flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span className="text-sm">✨</span>
            <span>+ Generate Needed Skill Request</span>
          </button>

          <div className="flex gap-1 bg-hull p-1 rounded-xl border border-line">
            {[
              { id: 'received', label: '📥 Received' },
              { id: 'sent', label: '📤 Sent' },
              { id: 'custom', label: '🌟 Needed Skill Demands' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === t.id 
                    ? 'bg-gold text-abyss shadow-md' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="bg-foam/15 border border-foam/40 p-4 rounded-xl text-foam text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-up shadow-md">
          <span className="text-lg">📧</span>
          <span>{successToast}</span>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-16"><Spinner size={32} /></div>}
      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {/* CUSTOM NEEDED SKILLS DEMANDS TAB */}
      {tab === 'custom' && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted px-1">
            <span>Showing Custom Needed Skill Demands</span>
            <span className="text-gold font-bold">Email alerts to: pratushprasad.5398@gmail.com</span>
          </div>

          {data?.requests?.length === 0 ? (
            <EmptyState
              icon="🌟"
              title="No needed skill requests generated yet"
              description="Be the first pirate to request a custom skill to alert masters across the academy!"
              action={
                <Button compact onClick={() => setShowCustomModal(true)}>
                  + Generate Request Now
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {data?.requests?.map(cr => (
                <div key={cr.id} className="bg-hull/90 border border-line rounded-xl p-5 shadow-e1 hover:border-gold/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge color="gold">{cr.category}</Badge>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${cr.status === 'OPEN' ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-foam/20 text-foam border border-foam/30'}`}>
                        {cr.status}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-text-primary">{cr.skillName}</h3>
                    <p className="text-text-secondary text-xs">{cr.description || 'No additional details specified.'}</p>
                    <div className="text-text-muted text-[11px] font-mono flex items-center gap-2 pt-1">
                      <span>Requested by <strong className="text-text-primary">{cr.userName}</strong></span>
                      <span>•</span>
                      <span>Alert Email: <strong className="text-gold">{cr.email}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <VCT amount={cr.offeredBounty} className="text-base font-mono font-bold" />
                    {cr.status === 'OPEN' ? (
                      <Button 
                        compact 
                        loading={fulfillCustomRequest.isPending}
                        onClick={() => fulfillCustomRequest.mutate(cr.id)}
                      >
                        ⚔️ Offer to Teach
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-foam flex items-center gap-1">
                        <span>✓</span> Master Accepted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STANDARD VIVRE CARD SESSION REQUESTS */}
      {tab !== 'custom' && data?.requests?.length === 0 && !isLoading && (
        <EmptyState 
          icon="📭" 
          title="No requests found" 
          description={tab === 'received' ? "You haven't received any Vivre Card requests yet." : "You haven't sent any session requests yet."} 
        />
      )}

      {tab !== 'custom' && (
        <div className="flex flex-col gap-4">
          {data?.requests?.map(r => (
            <div key={r.id} className="bg-hull border border-line rounded-xl p-5 shadow-e1 hover:border-line/80 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="font-display text-xl text-text-primary">{r.listing?.skill?.name}</div>
                  <div className="text-text-secondary text-xs mt-1">
                    {tab === 'received' ? `from learner ${r.learner?.name}` : `with master ${r.listing?.provider?.name}`}
                    {' · '}{new Date(r.slot?.startAt).toLocaleDateString()} at {new Date(r.slot?.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {r.message && (
                    <div className="text-text-muted text-xs mt-2 italic bg-deep/60 p-2.5 rounded-lg border border-line/40">
                      "{r.message}"
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <VCT amount={r.lockedPrice} className="text-base font-mono font-bold" />
                  <StatusChip status={r.status} />
                </div>
              </div>

              {tab === 'received' && r.status === 'PENDING' && (
                <div className="flex gap-2 pt-3 border-t border-line/40">
                  <Button compact onClick={() => accept.mutate(r.id)} loading={accept.isPending}>
                    ✓ Accept Request
                  </Button>
                </div>
              )}

              {tab === 'sent' && r.status === 'PENDING' && (
                <div className="pt-3 border-t border-line/40">
                  <Button compact variant="danger" onClick={() => cancel.mutate(r.id)} loading={cancel.isPending}>
                    ✕ Cancel & Release Escrow
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* GENERATE NEEDED SKILL REQUEST MODAL */}
      <Modal open={showCustomModal} onClose={() => setShowCustomModal(false)} title="✨ Generate Needed Skill Request">
        <form onSubmit={handleSubmitCustom} className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Post a custom request for a skill you need. Notifications will be dispatched to your email address when masters respond.
          </p>

          <div>
            <label className="text-xs font-mono font-semibold uppercase text-text-muted block mb-1">Needed Skill Name *</label>
            <input
              required
              className="input w-full"
              placeholder="e.g. Advanced Conqueror's Haki, Golang Microservices..."
              value={skillName}
              onChange={e => setSkillName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-semibold uppercase text-text-muted block mb-1">Category</label>
              <select className="input w-full" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono font-semibold uppercase text-text-muted block mb-1">Offered VCT Bounty</label>
              <input
                type="number"
                min="10"
                max="5000"
                className="input w-full"
                value={offeredBounty}
                onChange={e => setOfferedBounty(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-semibold uppercase text-text-muted block mb-1">Notification Email ID *</label>
            <input
              type="email"
              required
              className="input w-full"
              placeholder="pratushprasad.5398@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-mono font-semibold uppercase text-text-muted block mb-1">Requirements / Details</label>
            <textarea
              rows={3}
              className="input w-full"
              placeholder="Describe what specific topics or mastery goals you are looking to learn..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gold text-[#1A1204] font-bold shadow-glow-gold rounded-xl"
            loading={createCustomRequest.isPending}
          >
            {createCustomRequest.isPending ? 'Generating & Dispatching Request...' : '🚀 Generate Request & Send Email Alert'}
          </Button>
        </form>
      </Modal>

      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 10px; color: #F3EEDF; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 150ms; } .input:focus { border-color: #F2B84B; } select option { background: #0D1526; }`}</style>
    </div>
  );
}
