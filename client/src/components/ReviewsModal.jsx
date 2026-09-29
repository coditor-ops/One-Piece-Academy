import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Modal, Spinner, EmptyState, TierBadge } from './ui.jsx';

export function ReviewsModal({ providerId, providerName, onClose }) {
  const { data: ratings, isLoading, error } = useQuery({
    queryKey: ['ratings', providerId],
    queryFn: () => api.get(`/users/${providerId}/ratings`),
    enabled: !!providerId,
  });

  return (
    <Modal open title={`⭐ Reviews for ${providerName}`} onClose={onClose}>
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner size={24} />
          </div>
        )}
        
        {error && (
          <p className="text-crimson text-sm">Failed to load reviews: {error.message}</p>
        )}
        
        {!isLoading && !error && ratings?.length === 0 && (
          <EmptyState icon="⭐" title="No Reviews Yet" description="This master hasn't received any reviews yet." />
        )}

        {!isLoading && ratings?.map((r) => (
          <div key={r.id} className="bg-deep border border-line/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary text-sm">{r.rater?.name}</span>
                <span className="text-text-muted text-[10px]">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex text-gold text-xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < r.score ? 'text-gold' : 'text-line/40'}>★</span>
                ))}
              </div>
            </div>
            {r.review && (
              <p className="text-text-secondary text-sm italic border-l-2 border-gold/30 pl-3 leading-relaxed">
                "{r.review}"
              </p>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
