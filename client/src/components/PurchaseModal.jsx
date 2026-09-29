import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal, Button, VCT } from './ui.jsx';

export function PurchaseModal({ listing, onClose }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const currentPrice = listing?.currentPrice || 100;
  const userBalance = user?.balance || 0;
  const canAfford = userBalance >= currentPrice;
  const missingVCT = Math.max(0, currentPrice - userBalance);

  const topUpMutation = useMutation({
    mutationFn: () => api.post('/wallet/topup', { amount: Math.max(500, missingVCT + 100) }),
    onSuccess: () => {
      refreshUser();
      qc.invalidateQueries({ queryKey: ['wallet'] });
      setError('');
    },
    onError: e => setError(e.message),
  });

  const purchaseMutation = useMutation({
    mutationFn: () =>
      api.post('/requests', {
        listingId: listing.id,
        slotId: 'instant',
        message: 'Instant Course Purchase',
      }),
    onSuccess: () => {
      refreshUser();
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      onClose();
      navigate(`/classroom/${listing.skillId || listing.id}`);
    },
    onError: e => setError(e.message),
  });

  if (!listing) return null;

  const isDuplicate = Boolean(error && error.toLowerCase().includes('active booking'));

  return (
    <Modal open title="Send Vivre Card - Purchase Skill Course" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <div className="bg-deep rounded-2xl p-4 border border-line/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2.5 bg-hull rounded-xl border border-line">
              {listing.skill?.icon || 'sword'}
            </span>
            <div>
              <h3 className="font-display text-xl text-text-primary">
                {listing.skill?.name || 'Skill Course'}
              </h3>
              <p className="text-text-muted text-xs">
                Master: {listing.provider?.name || 'Academy Instructor'} - {listing.durationMin || 60} mins
              </p>
            </div>
          </div>
          <VCT amount={currentPrice} className="text-lg font-mono font-bold" />
        </div>

        <div className="bg-deep rounded-2xl p-4 border border-line/60 space-y-2 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted">Course VCT Price</span>
            <VCT amount={currentPrice} />
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Your Current VCT Balance</span>
            <VCT amount={userBalance} />
          </div>
          <div className="flex justify-between border-t border-line/60 pt-2 font-bold">
            <span className="text-text-secondary">Balance After Hold</span>
            <span className={canAfford ? 'text-gold' : 'text-crimson'}>
              {(userBalance - currentPrice).toLocaleString()} VCT
            </span>
          </div>
        </div>

        {!canAfford && !isDuplicate && (
          <div className="bg-crimson/10 border border-crimson/30 rounded-2xl p-4 space-y-3">
            <div className="text-crimson text-xs font-semibold flex items-center gap-2">
              <span>You need {missingVCT.toLocaleString()} more VCT tokens to buy this course.</span>
            </div>
            <Button
              compact
              loading={topUpMutation.isPending}
              onClick={() => topUpMutation.mutate()}
              className="w-full bg-gold text-[#1A1204] font-bold shadow-glow-gold"
            >
              Instant Top-Up {Math.max(500, missingVCT + 100).toLocaleString()} VCT Bounty
            </Button>
          </div>
        )}

        {isDuplicate ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-amber-400 font-bold text-sm">Already Enrolled!</p>
                <p className="text-text-muted text-xs mt-1">
                  You already have an active booking for this course. Head to your Dashboard to access it.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                compact
                onClick={() => { onClose(); navigate('/dashboard'); }}
                className="flex-1 bg-gold text-[#1A1204] font-bold"
              >
                Go to My Dashboard
              </Button>
              <Button
                compact
                onClick={onClose}
                className="flex-1 border border-line/60 text-text-secondary"
              >
                Close
              </Button>
            </div>
          </div>
        ) : error ? (
          <div className="p-3 bg-crimson/15 border border-crimson/30 rounded-xl text-crimson text-xs">
            {error}
          </div>
        ) : null}

        {!isDuplicate && (
          <Button
            disabled={!canAfford || purchaseMutation.isPending}
            loading={purchaseMutation.isPending}
            onClick={() => purchaseMutation.mutate()}
            className="w-full h-12 text-sm font-bold bg-gold text-[#1A1204] rounded-xl shadow-glow-gold"
          >
            {purchaseMutation.isPending
              ? 'Processing Vivre Card...'
              : 'Send Vivre Card and Unlock Lecture (' + currentPrice.toLocaleString() + ' VCT)'}
          </Button>
        )}
      </div>
    </Modal>
  );
}
