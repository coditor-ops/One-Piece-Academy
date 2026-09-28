import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Button, Modal } from './ui.jsx';

export function AddSlotsModal({ listing, onClose, onSuccess }) {
  const qc = useQueryClient();
  const [customStart, setCustomStart] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (slotsArray) => api.post(`/skills/listings/${listing.id}/slots`, { slots: slotsArray }),
    onSuccess: (data) => {
      setSuccessMsg(`✓ Added ${data.created} training slots!`);
      qc.invalidateQueries({ queryKey: ['skill'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1000);
    },
    onError: (e) => setError(e.message),
  });

  const getQuickSlots = () => {
    const now = new Date();
    const duration = listing.durationMin || 60;
    
    // Tomorrow 10 AM
    const d1 = new Date(now);
    d1.setDate(d1.getDate() + 1);
    d1.setHours(10, 0, 0, 0);

    // Tomorrow 2 PM
    const d2 = new Date(now);
    d2.setDate(d2.getDate() + 1);
    d2.setHours(14, 0, 0, 0);

    // In 2 Days 11 AM
    const d3 = new Date(now);
    d3.setDate(d3.getDate() + 2);
    d3.setHours(11, 0, 0, 0);

    // In 3 Days 4 PM
    const d4 = new Date(now);
    d4.setDate(d4.getDate() + 3);
    d4.setHours(16, 0, 0, 0);

    return [
      { label: '🌅 Tomorrow 10:00 AM', start: d1 },
      { label: '☀️ Tomorrow 2:00 PM', start: d2 },
      { label: '⚓ In 2 Days 11:00 AM', start: d3 },
      { label: '⚔️ In 3 Days 4:00 PM', start: d4 },
    ].map(p => ({
      label: p.label,
      startAt: p.start.toISOString(),
      endAt: new Date(p.start.getTime() + duration * 60000).toISOString(),
    }));
  };

  const handleAddQuickSlot = (slot) => {
    setError('');
    mutation.mutate([{ startAt: slot.startAt, endAt: slot.endAt }]);
  };

  const handleAddAllQuickSlots = () => {
    setError('');
    const slots = getQuickSlots().map(s => ({ startAt: s.startAt, endAt: s.endAt }));
    mutation.mutate(slots);
  };

  const handleAddCustomSlot = (e) => {
    e.preventDefault();
    setError('');
    if (!customStart) {
      setError('Please select a date and start time');
      return;
    }
    const startDate = new Date(customStart);
    if (isNaN(startDate.getTime()) || startDate <= new Date()) {
      setError('Start time must be in the future');
      return;
    }
    const duration = listing.durationMin || 60;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    mutation.mutate([{ startAt: startDate.toISOString(), endAt: endDate.toISOString() }]);
  };

  const quickSlots = getQuickSlots();

  return (
    <Modal open title={`+ Add Availability Slots for ${listing.skill?.name || 'Skill'}`} onClose={onClose}>
      <div className="space-y-5">
        <div className="bg-deep rounded-xl p-3.5 border border-line/60 text-xs">
          <div className="font-semibold text-text-primary text-sm">{listing.skill?.name}</div>
          <div className="text-text-muted mt-0.5 font-mono">
            {listing.level} · {listing.durationMin} min duration · Base Price: {listing.basePrice} VCT
          </div>
        </div>

        {/* Quick Add Presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-gold font-bold">⚡ One-Click Quick Presets</span>
            <button
              onClick={handleAddAllQuickSlots}
              disabled={mutation.isPending}
              className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
            >
              + Add All 4 Presets
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickSlots.map((qs, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAddQuickSlot(qs)}
                disabled={mutation.isPending}
                className="p-3 bg-hull hover:bg-hull-raised border border-line/70 hover:border-gold rounded-xl text-xs font-mono text-left transition-all cursor-pointer flex items-center justify-between group active:scale-95"
              >
                <span>{qs.label}</span>
                <span className="text-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity">+ Add</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date / Time Input */}
        <form onSubmit={handleAddCustomSlot} className="border-t border-line/40 pt-4 space-y-3">
          <label className="text-xs font-mono uppercase text-text-secondary font-bold block">
            🗓️ Custom Training Slot
          </label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              className="input flex-1 font-mono text-xs"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
            />
            <Button type="submit" loading={mutation.isPending} compact className="font-bold">
              + Add Custom Slot
            </Button>
          </div>
        </form>

        {successMsg && (
          <div className="p-3 bg-foam/10 border border-foam/30 rounded-xl text-foam text-xs font-semibold flex items-center gap-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-crimson/10 border border-crimson/30 rounded-xl text-crimson text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}
      </div>

      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 8px; color: #F3EEDF; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 150ms; } .input:focus { border-color: #F2B84B; }`}</style>
    </Modal>
  );
}
