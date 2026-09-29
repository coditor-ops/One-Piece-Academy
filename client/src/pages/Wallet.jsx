import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Button, Modal, Spinner, EmptyState, VCT } from '../components/ui.jsx';
import { AddSlotsModal } from '../components/AddSlotsModal.jsx';

export default function Wallet() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [createListingModal, setCreateListingModal] = useState(false);
  const [addSlotsModalListing, setAddSlotsModalListing] = useState(null);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get('/wallet'),
    refetchInterval: 8000,
  });

  const { data: txns } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => api.get(`/wallet/transactions?page=${page}&limit=20`),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size={36} /></div>;
  if (!wallet) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/40 pb-5">
        <div>
          <span className="text-gold text-xs font-mono font-semibold uppercase tracking-widest block mb-1">
            🏴‍☠️ Pirate Ledger & Token Wallet
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
            Treasure Chest Wallet
          </h1>
        </div>
        <Button onClick={() => setCreateListingModal(true)} className="h-10 text-xs font-bold shadow-glow-gold">
          + Offer a New Skill
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <div className="bg-hull border border-line rounded-2xl p-6 text-center shadow-e1">
          <div className="text-text-muted text-xs uppercase tracking-widest font-mono mb-2">
            Available Balance
          </div>
          <VCT amount={wallet.balance} className="text-4xl font-mono font-black text-gold" />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-hull border border-line rounded-2xl overflow-hidden shadow-e1">
        <div className="p-5 border-b border-line/40 flex items-center justify-between">
          <h2 className="font-display text-2xl text-text-primary">Immutable Transaction Ledger</h2>
          <span className="text-xs font-mono text-text-muted">Marine HQ Verified</span>
        </div>

        {txns?.rows?.length === 0 && (
          <EmptyState icon="📜" title="No transactions yet" description="Teach skills or complete sessions to see your token flow." />
        )}

        {txns?.rows && txns.rows.length > 0 && (
          <div>
            <div className="grid grid-cols-12 p-3 text-text-muted text-xs font-mono border-b border-line/40 bg-deep/40">
              <span className="col-span-3">Timestamp</span>
              <span className="col-span-3">Type</span>
              <span className="col-span-3 text-right">Amount</span>
              <span className="col-span-3 pl-4">Note</span>
            </div>

            <div className="divide-y divide-line/30">
              {txns.rows.map(t => (
                <div key={t.id} className="grid grid-cols-12 p-3 text-xs items-center hover:bg-deep/40 transition-colors">
                  <span className="col-span-3 text-text-secondary font-mono">
                    {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="col-span-3 text-text-primary font-semibold">
                    {t.type}
                  </span>
                  <span className={`col-span-3 text-right font-mono font-bold text-sm ${t.amount < 0 ? 'text-crimson' : 'text-foam'}`}>
                    {t.amount < 0 ? '−' : '+'}{Number(Math.abs(t.amount)).toLocaleString()} VCT
                  </span>
                  <span className="col-span-3 pl-4 text-text-muted truncate">
                    {t.note || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-3">
        <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous Page
        </Button>
        <span className="text-text-muted text-xs font-mono">Page {page}</span>
        <Button variant="secondary" onClick={() => setPage(p => p + 1)} disabled={!txns?.rows?.length || txns.rows.length < 20}>
          Next Page
        </Button>
      </div>

      {createListingModal && (
        <CreateListingModal 
          onClose={() => setCreateListingModal(false)} 
          onSuccess={(newListing) => { 
            setCreateListingModal(false); 
            qc.invalidateQueries({ queryKey: ['wallet'] }); 
            qc.invalidateQueries({ queryKey: ['listings'] });
            if (newListing) setAddSlotsModalListing(newListing);
          }} 
        />
      )}

      {addSlotsModalListing && (
        <AddSlotsModal
          listing={addSlotsModalListing}
          onClose={() => setAddSlotsModalListing(null)}
          onSuccess={() => { setAddSlotsModalListing(null); qc.invalidateQueries({ queryKey: ['listings'] }); }}
        />
      )}
    </div>
  );
}

function CreateListingModal({ onClose, onSuccess }) {
  const { data: skills } = useQuery({ queryKey: ['skills'], queryFn: () => api.get('/skills') });
  const [form, setForm] = useState({ skillId: '', description: '', level: 'Beginner', durationMin: 60, basePrice: 100 });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.post('/skills/listings', form),
    onSuccess: (newListing) => onSuccess(newListing),
    onError: e => setError(e.message),
  });

  if (!skills) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <Modal open title="Offer a New Skill Listing" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
        <div>
          <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-1">Skill</label>
          <select className="input" value={form.skillId} onChange={e => setForm(f => ({ ...f, skillId: e.target.value }))} required>
            <option value="">Select a skill...</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name} ({s.category})</option>)}
          </select>
        </div>

        <div>
          <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-1">Mastery Level</label>
          <select className="input" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Master">Master</option>
          </select>
        </div>

        <div>
          <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-1">Session Duration</label>
          <select className="input" value={form.durationMin} onChange={e => setForm(f => ({ ...f, durationMin: parseInt(e.target.value) }))}>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>

        <div>
          <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-1">Base Price (VCT)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              className="input flex-1" 
              min="10" 
              max="1000" 
              step="1"
              value={form.basePrice} 
              onChange={e => setForm(f => ({ ...f, basePrice: parseInt(e.target.value) || 0 }))} 
            />
            <span className="text-gold font-mono font-bold">VCT</span>
          </div>
        </div>

        <div>
          <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-1">Description</label>
          <textarea 
            className="input" 
            rows={2} 
            placeholder="Describe your teaching style, prerequisites, and session goals..."
            value={form.description} 
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
          />
        </div>

        {error && <p className="text-crimson text-xs">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending} className="flex-1 font-bold">Publish Listing</Button>
        </div>
      </form>
      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 8px; color: #F3EEDF; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 150ms; width: 100%; } .input:focus { border-color: #F2B84B; } select option { background: #0D1526; }`}</style>
    </Modal>
  );
}