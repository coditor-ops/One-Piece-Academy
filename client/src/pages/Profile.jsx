import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, TierBadge, Spinner, EmptyState, VCT, Badge } from '../components/ui.jsx';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', avatar: '', crew: '' });

  const { data: ratings } = useQuery({
    queryKey: ['ratings', user?.id],
    queryFn: () => api.get(`/users/${user.id}/ratings`),
    enabled: !!user,
  });

  useEffect(() => {
    if (user && editMode) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        crew: user.crew || '',
      });
    }
  }, [editMode, user]);

  const updateMut = useMutation({
    mutationFn: () => api.put(`/users/${user?.id}`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth'] });
      refreshUser();
      setEditMode(false);
    },
  });

  if (!user) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-hull border border-line rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-deep flex items-center justify-center text-4xl border border-line">
            {user.avatar || user.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl text-text-primary">{user.name}</h1>
              <TierBadge tier={user.tier} />
            </div>
            <div className="text-text-secondary text-sm">{user.crew || 'No crew'}</div>
            <div className="text-text-muted text-xs mt-1">
              Sailing since {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <VCT amount={user.balance} />
          <Badge color="muted">💎 {user.balance?.toLocaleString() || 0} VCT in wallet</Badge>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant={editMode ? 'secondary' : 'primary'} onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/market')}>
            Browse Market
          </Button>
        </div>
      </div>

      {editMode ? (
        <div className="bg-hull border border-line rounded-lg p-5">
          <h2 className="font-semibold mb-4 text-text-primary">Edit Profile</h2>
          <div className="flex flex-col gap-3">
            <input
              className="input"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Crew / Ship"
              value={form.crew}
              onChange={e => setForm(f => ({ ...f, crew: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Avatar (emoji or URL)"
              value={form.avatar}
              onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
            />
            <textarea
              className="input"
              placeholder="Bio"
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
            />
            <Button className="w-full" loading={updateMut.isPending} onClick={() => updateMut.mutate()}>
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-hull border border-line rounded-lg p-5">
          <h2 className="font-semibold mb-3 text-text-primary">About</h2>
          <p className="text-text-secondary whitespace-pre-wrap">
            {user.bio || 'No bio yet. Tell the world who you are.'}
          </p>
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-semibold mb-3 text-text-primary">Ratings Received</h2>
        {ratings?.length === 0 && (
          <EmptyState icon="⭐" title="No ratings yet" description="Complete sessions to earn your reputation." />
        )}
        <div className="flex flex-col gap-2">
          {ratings?.map(r => (
            <div key={r.id} className="bg-hull border border-line rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gold">★ {r.score}</span>
                  <span className="text-text-secondary text-sm">{r.rater?.name}</span>
                </div>
                <span className="text-text-muted text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.review && <p className="text-text-secondary text-sm mt-1 italic">"{r.review}"</p>}
            </div>
          ))}
        </div>
      </div>

      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 6px; color: #F3EEDF; padding: 10px 12px; font-size: 14px; outline: none; transition: border-color 150ms; } .input:focus { border-color: #F2B84B; } .input::placeholder { color: #6F7C99; }`}</style>
    </div>
  );
}