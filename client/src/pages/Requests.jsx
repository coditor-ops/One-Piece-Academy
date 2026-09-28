import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Button, StatusChip, Spinner, EmptyState, ErrorState, VCT } from '../components/ui.jsx';

export default function Requests() {
  const [tab, setTab] = useState('received');
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['requests', tab],
    queryFn: () => api.get(`/requests?role=${tab === 'received' ? 'provider' : 'learner'}`),
    refetchInterval: 8000,
  });

  const accept = useMutation({
    mutationFn: id => api.post(`/requests/${id}/accept`),
    onSuccess: () => {
      qc.invalidateQueries(['requests']);
      qc.invalidateQueries(['sessions']);
    },
  });

  const reject = useMutation({
    mutationFn: id => api.post(`/requests/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries(['requests']);
      qc.invalidateQueries(['wallet']);
    },
  });

  const cancel = useMutation({
    mutationFn: id => api.post(`/requests/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries(['requests']);
      qc.invalidateQueries(['wallet']);
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/40 pb-5">
        <div>
          <span className="text-gold text-xs font-mono font-semibold uppercase tracking-widest block mb-1">
            📜 Marine HQ Escrow Inbox
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
            Vivre Card Requests
          </h1>
        </div>

        {/* Role Tab Switcher */}
        <div className="flex gap-2 bg-hull p-1 rounded-xl border border-line">
          {['received', 'sent'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === t 
                  ? 'bg-gold text-abyss shadow-md' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t === 'received' ? '📥 Received Requests' : '📤 Sent Requests'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size={32} /></div>}
      {error && <ErrorState message={error.message} onRetry={refetch} />}
      
      {data?.requests?.length === 0 && (
        <EmptyState 
          icon="📭" 
          title="No requests found" 
          description={tab === 'received' ? "You haven't received any Vivre Card requests yet." : "You haven't sent any session requests yet."} 
        />
      )}

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
                <Button compact variant="danger" onClick={() => reject.mutate(r.id)} loading={reject.isPending}>
                  ✕ Decline & Refund
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
    </div>
  );
}
