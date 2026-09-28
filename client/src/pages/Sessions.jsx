import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Modal, StatusChip, Spinner, EmptyState, ErrorState, VCT } from '../components/ui.jsx';
import { useState } from 'react';

export default function Sessions() {
  const { user, refreshUser } = useAuth();
  const qc = useQueryClient();
  const [ratingModal, setRatingModal] = useState(null);

  const { data: sessions, isLoading, error, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions'),
    refetchInterval: 15000,
  });

  const markDone = useMutation({
    mutationFn: id => api.post(`/sessions/${id}/complete`),
    onSuccess: () => qc.invalidateQueries(['sessions']),
  });
  const confirm = useMutation({
    mutationFn: id => api.post(`/sessions/${id}/confirm`),
    onSuccess: () => { qc.invalidateQueries(['sessions']); refreshUser(); },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-display text-3xl text-text-primary mb-5">My Sessions</h1>

      {sessions?.length === 0 && <EmptyState icon="📚" title="No sessions yet" description="Book a skill session to get started." />}

      <div className="flex flex-col gap-4">
        {sessions?.map(s => {
          const r = s.request;
          const isProvider = r?.listing?.provider?.id === user?.id;
          const isLearner = r?.learnerId === user?.id;
          return (
            <div key={s.id} className="bg-hull border border-line rounded-md p-4">
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <div>
                  <div className="font-medium text-text-primary">{r?.listing?.skill?.name}</div>
                  <div className="text-text-muted text-sm">
                    {isProvider ? `with ${r?.learner?.name}` : `with ${r?.listing?.provider?.name}`}
                    {' · '}{new Date(r?.slot?.startAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <VCT amount={r?.lockedPrice} />
                  <StatusChip status={r?.status} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {isProvider && r?.status === 'ACCEPTED' && !s.providerDone && (
                  <Button compact onClick={() => markDone.mutate(s.id)} loading={markDone.isPending}>
                    ✓ Mark Done
                  </Button>
                )}
                {isLearner && r?.status === 'ACCEPTED' && s.providerDone && !s.completedAt && (
                  <Button compact onClick={() => confirm.mutate(s.id)} loading={confirm.isPending}>
                    ✓ Confirm Completion
                  </Button>
                )}
                {isLearner && r?.status === 'COMPLETED' && !s.rating && (
                  <Button compact variant="secondary" onClick={() => setRatingModal(s)}>
                    ★ Rate Session
                  </Button>
                )}
                {s.rating && <span className="text-text-muted text-sm">★ Rated {s.rating.score}/5</span>}
              </div>
            </div>
          );
        })}
      </div>

      {ratingModal && (
        <RatingModal session={ratingModal} onClose={() => setRatingModal(null)} onSuccess={() => { setRatingModal(null); qc.invalidateQueries(['sessions']); }} />
      )}
    </div>
  );
}

function RatingModal({ session, onClose, onSuccess }) {
  const [score, setScore] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.post(`/sessions/${session.id}/rate`, { score, review }),
    onSuccess,
    onError: e => setError(e.message),
  });

  return (
    <Modal open title="Rate this Session" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-text-secondary text-sm">How was your session?</p>

        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setScore(n)}
              className={`text-3xl transition-transform hover:scale-110 ${n <= score ? 'text-gold' : 'text-line'}`}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}>
              ★
            </button>
          ))}
        </div>
        <p className="text-text-muted text-sm" aria-live="polite">{score > 0 ? `${score} of 5` : 'Select a rating'}</p>

        <textarea
          className="w-full bg-deep border border-line rounded p-2.5 text-text-primary text-sm resize-none focus:border-gold outline-none"
          rows={3} value={review} placeholder="Leave a review (optional)..."
          onChange={e => setReview(e.target.value)} />

        {error && <p className="text-crimson text-sm">{error}</p>}
        <Button className="w-full" disabled={!score || mutation.isPending} loading={mutation.isPending} onClick={() => mutation.mutate()}>
          Submit Rating
        </Button>
      </div>
    </Modal>
  );
}
