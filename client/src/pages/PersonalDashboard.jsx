import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, StatusChip, Spinner, EmptyState, ErrorState, VCT, TierBadge, Modal } from '../components/ui.jsx';

export default function PersonalDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('purchased'); // 'purchased' | 'teaching' | 'wallet'
  const [reviewModal, setReviewModal] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Fetch purchased courses / learner requests
  const { data: learnerData, isLoading: loadingLearner, error: errLearner } = useQuery({
    queryKey: ['requests', 'learner'],
    queryFn: () => api.get('/requests?role=learner'),
    refetchInterval: 6000,
  });

  // Fetch teaching schedule / provider requests
  const { data: providerData, isLoading: loadingProvider, error: errProvider } = useQuery({
    queryKey: ['requests', 'provider'],
    queryFn: () => api.get('/requests?role=provider'),
    refetchInterval: 6000,
  });

  // Fetch sessions
  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions'),
    refetchInterval: 6000,
  });

  // Fetch wallet transactions
  const { data: walletTxns } = useQuery({
    queryKey: ['wallet-txns'],
    queryFn: () => api.get('/wallet/transactions?limit=15'),
    refetchInterval: 10000,
  });

  // Accept request mutation
  const acceptRequest = useMutation({
    mutationFn: (id) => api.post(`/requests/${id}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['sessions'] });
      refreshUser();
    },
  });

  // Complete session mutation (releases VCT payout)
  const completeSession = useMutation({
    mutationFn: (sessionId) => api.post(`/sessions/${sessionId}/complete`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['wallet-txns'] });
      refreshUser();
    },
  });

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: ({ sessionId, score, review }) => api.post(`/sessions/${sessionId}/rate`, { score, review }),
    onSuccess: () => {
      setReviewModal(null);
      setReviewText('');
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  const purchasedRequests = learnerData?.requests || [];
  const teachingRequests = providerData?.requests || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Pirate Profile Banner */}
      <div className="bg-gradient-to-r from-[#141E34] via-[#1A2644] to-[#0D1526] border-2 border-gold/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-gold/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-hull to-deep flex items-center justify-center text-3xl border-2 border-gold shadow-md shrink-0">
            {user?.avatar || '☠️'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                {user?.crew || 'Straw Hat Fleet'}
              </span>
              <TierBadge tier={user?.tier || 'Rookie'} />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-text-primary tracking-tight">
              Captain {user?.name}'s Command Deck
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-1">
              Manage your purchased skill courses, active teaching sessions, and Vivre Token chest.
            </p>
          </div>
        </div>

        {/* Live VCT Balance & Action Pill */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <div className="bg-[#EADBB8] text-[#2A1D0E] px-4 py-2.5 rounded-2xl font-mono text-xs font-black shadow-md border border-[#C9B58A] flex items-center gap-2">
            <span>🪙</span>
            <span>{user?.balance?.toLocaleString() || 500} VCT Available</span>
            <span className="opacity-50">•</span>
            <span className="opacity-80">Held: {user?.escrowHeld?.toLocaleString() || 0}</span>
          </div>

          <button
            onClick={() => navigate('/market')}
            className="px-4 py-2.5 text-xs font-bold rounded-2xl bg-gold text-[#1A1204] hover:bg-gold-bright transition-all shadow-glow-gold cursor-pointer"
          >
            + Buy New Course
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line/40 pb-4">
        <button
          onClick={() => setActiveTab('purchased')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'purchased'
              ? 'bg-gold text-abyss shadow-glow-gold'
              : 'bg-hull border border-line text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>📚</span>
          <span>Purchased Skills & Courses ({purchasedRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teaching')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'teaching'
              ? 'bg-gold text-abyss shadow-glow-gold'
              : 'bg-hull border border-line text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>⚔️</span>
          <span>Skills You Are Teaching ({teachingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'wallet'
              ? 'bg-gold text-abyss shadow-glow-gold'
              : 'bg-hull border border-line text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>🪙</span>
          <span>VCT Wallet History</span>
        </button>
      </div>

      {/* TAB 1: PURCHASED SKILLS & COURSES */}
      {activeTab === 'purchased' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-text-muted px-1">
            <span>Showing {purchasedRequests.length} Purchased Course Enrollments</span>
            <span className="text-gold font-bold">Protected by Escrow</span>
          </div>

          {loadingLearner && <div className="flex justify-center py-16"><Spinner size={32} /></div>}
          {errLearner && <ErrorState message={errLearner.message} />}

          {purchasedRequests.length === 0 && !loadingLearner && (
            <EmptyState
              icon="📚"
              title="No purchased courses yet"
              description="Explore the Sabaody Market to purchase skill courses from legendary masters using VCT."
              action={
                <Button compact onClick={() => navigate('/market')}>
                  Browse Market Catalog
                </Button>
              }
            />
          )}

          <div className="grid grid-cols-1 gap-4">
            {purchasedRequests.map(r => {
              const matchedSession = sessions?.find(s => s.requestId === r.id);
              const isCompleted = r.status === 'COMPLETED' || matchedSession?.completedAt;

              return (
                <div key={r.id} className="bg-hull/90 border border-line rounded-2xl p-6 shadow-e1 hover:border-gold/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl p-3 rounded-2xl bg-deep border border-line shrink-0">
                      {r.listing?.skill?.icon || '📜'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-deep text-gold border border-line">
                          {r.listing?.skill?.category || 'Grand Line Skill'}
                        </span>
                        <StatusChip status={r.status} />
                      </div>
                      <h3 className="font-display text-2xl text-text-primary">
                        {r.listing?.skill?.name}
                      </h3>
                      <p className="text-text-secondary text-xs mt-1">
                        Taught by Master <strong className="text-text-primary">{r.listing?.provider?.name}</strong> • {r.listing?.durationMin || 60} minute interactive session
                      </p>
                      <div className="text-text-muted text-xs font-mono mt-2">
                        📅 Scheduled: {new Date(r.slot?.startAt).toLocaleDateString()} at {new Date(r.slot?.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted uppercase font-mono block">Paid Price</span>
                      <VCT amount={r.lockedPrice} className="text-lg font-mono font-bold" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {matchedSession?.meetingLink ? (
                        <a
                          href={matchedSession.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-gold text-[#1A1204] hover:bg-gold-bright transition-all shadow-glow-gold flex items-center gap-1.5"
                        >
                          <span>🎥</span>
                          <span>Join Classroom</span>
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted font-mono bg-deep px-3 py-1.5 rounded-xl border border-line/60">
                          Classroom Link Pending
                        </span>
                      )}

                      {isCompleted && matchedSession && !matchedSession.rating && (
                        <Button compact variant="secondary" onClick={() => setReviewModal(matchedSession)}>
                          ⭐ Rate Master
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS YOU ARE TEACHING */}
      {activeTab === 'teaching' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-text-muted px-1">
            <span>Showing {teachingRequests.length} Teaching Requests & Sessions</span>
            <span className="text-gold font-bold">Earn VCT upon completion</span>
          </div>

          {loadingProvider && <div className="flex justify-center py-16"><Spinner size={32} /></div>}
          {errProvider && <ErrorState message={errProvider.message} />}

          {teachingRequests.length === 0 && !loadingProvider && (
            <EmptyState
              icon="⚔️"
              title="You aren't teaching any upcoming sessions yet"
              description="Create a listing or add open slots to let pirates book training with you."
              action={
                <Button compact onClick={() => navigate('/market')}>
                  View Your Market Listings
                </Button>
              }
            />
          )}

          <div className="grid grid-cols-1 gap-4">
            {teachingRequests.map(r => {
              const matchedSession = sessions?.find(s => s.requestId === r.id);
              const isAccepted = r.status === 'ACCEPTED';
              const isPending = r.status === 'PENDING';
              const isCompleted = r.status === 'COMPLETED' || matchedSession?.completedAt;

              return (
                <div key={r.id} className="bg-hull/90 border border-line rounded-2xl p-6 shadow-e1 hover:border-gold/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl p-3 rounded-2xl bg-deep border border-line shrink-0">
                      {r.listing?.skill?.icon || '📜'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-deep text-gold border border-line">
                          {r.listing?.skill?.name}
                        </span>
                        <StatusChip status={r.status} />
                      </div>
                      <h3 className="font-display text-2xl text-text-primary">
                        Student: {r.learner?.name}
                      </h3>
                      <p className="text-text-secondary text-xs mt-1">
                        Level: {r.listing?.level} • Duration: {r.listing?.durationMin || 60} mins
                      </p>
                      {r.message && (
                        <div className="text-text-muted text-xs mt-2 italic bg-deep/60 p-2.5 rounded-lg border border-line/40 max-w-lg">
                          "{r.message}"
                        </div>
                      )}
                      <div className="text-text-muted text-xs font-mono mt-2">
                        📅 Scheduled: {new Date(r.slot?.startAt).toLocaleDateString()} at {new Date(r.slot?.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted uppercase font-mono block">Your Payout</span>
                      <VCT amount={Math.floor(r.lockedPrice * 0.95)} className="text-lg font-mono font-bold text-foam" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isPending && (
                        <Button 
                          compact 
                          loading={acceptRequest.isPending}
                          onClick={() => acceptRequest.mutate(r.id)}
                        >
                          ✓ Accept Student Request
                        </Button>
                      )}

                      {isAccepted && matchedSession && !isCompleted && (
                        <Button 
                          compact 
                          loading={completeSession.isPending}
                          onClick={() => completeSession.mutate(matchedSession.id)}
                        >
                          ✓ Complete & Collect VCT
                        </Button>
                      )}

                      {isCompleted && (
                        <span className="text-xs font-bold text-foam flex items-center gap-1 bg-foam/15 px-3 py-1.5 rounded-xl border border-foam/30">
                          ✓ VCT Payout Claimed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: VCT WALLET HISTORY */}
      {activeTab === 'wallet' && (
        <div className="bg-hull border border-line rounded-2xl p-6 shadow-e1 space-y-4">
          <div className="flex justify-between items-center border-b border-line/40 pb-4">
            <div>
              <h3 className="font-display text-2xl text-text-primary">VCT Token Transaction History</h3>
              <p className="text-text-secondary text-xs mt-0.5">Real-time ledger of your deposits, payouts, grants, and escrow holds.</p>
            </div>
            <Button compact variant="secondary" onClick={() => navigate('/wallet')}>
              Open Full Wallet
            </Button>
          </div>

          <div className="space-y-2">
            {walletTxns?.rows?.map(t => (
              <div key={t.id} className="bg-deep rounded-xl p-3.5 border border-line/50 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-gold font-bold">{t.type}</span>
                  <span className="text-text-muted">{new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-text-secondary truncate max-w-xs">{t.note || '-'}</span>
                </div>
                <div className={`font-bold ${t.amount < 0 ? 'text-crimson' : 'text-foam'}`}>
                  {t.amount < 0 ? '−' : '+'}{Math.abs(t.amount).toLocaleString()} VCT
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RATING & REVIEW MODAL */}
      {reviewModal && (
        <Modal open title="⭐ Rate & Review Master" onClose={() => setReviewModal(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-text-secondary leading-relaxed text-xs">
              Leave feedback for your master to help update their Sabaody Academy reputation tier.
            </p>

            <div>
              <label className="text-xs font-mono font-semibold uppercase text-text-muted block mb-2">Score (1 to 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className={`px-3 py-2 rounded-xl text-lg font-bold border transition-all cursor-pointer ${
                      ratingScore >= star ? 'bg-gold/20 border-gold text-gold' : 'bg-deep border-line text-text-muted'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-semibold uppercase text-text-muted block mb-1">Review Comments</label>
              <textarea
                rows={3}
                className="input w-full"
                placeholder="How was the training session?"
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
            </div>

            <Button
              className="w-full h-11 bg-gold text-[#1A1204] font-bold rounded-xl shadow-glow-gold"
              loading={submitReview.isPending}
              onClick={() => submitReview.mutate({ sessionId: reviewModal.id, score: ratingScore, review: reviewText })}
            >
              Submit Master Rating
            </Button>
          </div>
        </Modal>
      )}

      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 10px; color: #F3EEDF; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 150ms; } .input:focus { border-color: #F2B84B; }`}</style>
    </div>
  );
}
