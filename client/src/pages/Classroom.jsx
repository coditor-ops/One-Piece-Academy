import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Spinner, EmptyState, ErrorState, TierBadge, VCT, Badge } from '../components/ui.jsx';

export default function Classroom() {
  const { id } = useParams(); // listingId or skillId
  const { user } = useAuth();
  const qc = useQueryClient();

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState('04:15');
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'chapters' | 'discussion'

  // Fetch skill or listing details
  const { data: skill, isLoading, error } = useQuery({
    queryKey: ['classroom-skill', id],
    queryFn: async () => {
      try {
        return await api.get(`/skills/${id}`);
      } catch (e) {
        // Fallback search listing
        const listings = await api.get('/skills/listings');
        const found = listings.listings?.find(l => l.id === id || l.skillId === id);
        return found?.skill || { name: 'Masterclass Skill', category: 'Haki', description: 'Advanced masterclass training.' };
      }
    },
  });

  const listing = skill?.listings?.[0] || {
    basePrice: 200,
    currentPrice: 600,
    provider: { name: 'Silvers Rayleigh', tier: 'Legend', avatar: '⚡' },
    level: 'Master',
    durationMin: 90
  };

  const masterName = listing?.provider?.name || 'Grand Line Master';
  const masterAvatar = listing?.provider?.avatar || '☠️';

  const chapters = [
    { time: '00:00', title: 'Introduction & Stance Alignment', desc: 'Grounding your energy and preparing physical posture.' },
    { time: '03:45', title: 'Internal Haki Flow & Pressure Control', desc: 'Focusing willpower without wasting stamina.' },
    { time: '08:12', title: 'Infusing Strikes with Conquerors Spirit', desc: 'Applying black lightning impact force onto strikes.' },
    { time: '14:30', title: 'Defensive Deflection & Counter Tactics', desc: 'Using aura barriers to nullify incoming attacks.' },
    { time: '22:15', title: 'Mastery Drills & Daily Training Rituals', desc: 'Recommended daily exercises for sustained growth.' },
  ];

  const comments = [
    { id: 1, author: 'Monkey D. Luffy', time: '2 hours ago', text: 'This lesson completely changed how I use my gear forms! The 08:12 section on black lightning infusion makes total sense now.', likes: 24 },
    { id: 2, author: 'Roronoa Zoro', time: '5 hours ago', text: 'Clear instruction on posture alignment. Practiced the stance drill for 3 hours straight.', likes: 18 },
  ];

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentText('');
  };

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={36} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
        <Link to="/my-dashboard" className="hover:text-gold transition-colors">My Dashboard</Link>
        <span>›</span>
        <Link to="/market" className="hover:text-gold transition-colors">Market</Link>
        <span>›</span>
        <span className="text-text-primary font-bold">{skill?.name || 'Classroom Lecture'}</span>
      </div>

      {/* YOUTUBE-STYLE VIDEO THEATER PLAYER */}
      <div className="bg-[#070B14] border border-line/80 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="relative aspect-video w-full bg-black flex items-center justify-center group overflow-hidden">
          
          {/* Animated Demo Lecture Stream (High Quality Video Simulation) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#070B14] flex flex-col items-center justify-center p-6 text-center">
            {/* Background Aesthetic Waves */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent opacity-60" />

            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center text-4xl shadow-glow-gold animate-pulse">
                {skill?.icon || '⚡'}
              </div>
              <h2 className="font-display text-2xl sm:text-4xl text-white tracking-tight">
                {skill?.name || 'Masterclass Video Lecture'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gold text-[#1A1204] font-black text-xs rounded-full uppercase tracking-wider">
                  LIVE STREAM / RECORDING • HD 1080P
                </span>
                <span className="text-xs font-mono text-text-muted">Master: {masterName}</span>
              </div>
            </div>
          </div>

          {/* YouTube Control Bar Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 z-20 transition-opacity duration-300">
            {/* Scrubber Timeline Bar */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer group-hover:h-2.5 transition-all">
              <div className="bg-gold h-full w-2/5 rounded-full shadow-glow-gold" />
            </div>

            <div className="flex items-center justify-between text-white text-xs font-mono pt-1">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-gold transition-colors text-lg cursor-pointer"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <span className="text-text-muted">🔊</span>
                <span>{currentTime} / 25:00</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold border border-white/20">HD 1080p</span>
                <span className="cursor-pointer hover:text-gold">⚙️</span>
                <span className="cursor-pointer hover:text-gold">⛶</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YOUTUBE-STYLE VIDEO INFORMATION & CHANNEL HEADER */}
      <div className="bg-hull border border-line rounded-2xl p-6 shadow-e1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line/40 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge color="gold">{skill?.category || 'Grand Line Skill'}</Badge>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                ✓ Full Course Unlocked with VCT
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
              {skill?.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-deep px-4 py-2 rounded-xl border border-line text-xs font-mono">
              <span className="text-text-muted block">Duration</span>
              <span className="font-bold text-gold">{listing.durationMin} mins</span>
            </div>
            <div className="bg-deep px-4 py-2 rounded-xl border border-line text-xs font-mono">
              <span className="text-text-muted block">Course Level</span>
              <span className="font-bold text-text-primary">{listing.level}</span>
            </div>
          </div>
        </div>

        {/* Master Channel Details Bar */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-deep flex items-center justify-center text-2xl font-bold text-gold border-2 border-gold/40 shadow-inner">
              {masterAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl text-text-primary">{masterName}</h3>
                <TierBadge tier={listing.provider?.tier || 'Legend'} />
              </div>
              <p className="text-text-muted text-xs font-mono">Sabaody Academy Verified Instructor</p>
            </div>
          </div>

          <Button compact variant="secondary" className="border-gold/40 text-gold hover:bg-gold/15">
            + Follow Master
          </Button>
        </div>
      </div>

      {/* SYLLABUS, TEXT GUIDE & DISCUSSIONS TABS */}
      <div className="bg-hull border border-line rounded-2xl p-6 shadow-e1 space-y-6">
        <div className="flex border-b border-line/40 gap-4 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 transition-all cursor-pointer border-b-2 ${
              activeTab === 'guide' ? 'border-gold text-gold' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            📖 In-Depth Skill Text Guide & Master Notes
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`pb-3 transition-all cursor-pointer border-b-2 ${
              activeTab === 'chapters' ? 'border-gold text-gold' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            ⏱️ Chapter Timestamps ({chapters.length})
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`pb-3 transition-all cursor-pointer border-b-2 ${
              activeTab === 'discussion' ? 'border-gold text-gold' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            💬 Student Q&A Discussion ({comments.length})
          </button>
        </div>

        {/* TAB 1: COMPREHENSIVE SKILL TEXT GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-6 text-text-secondary leading-relaxed text-sm sm:text-base">
            <div className="bg-deep/80 border border-line/60 rounded-xl p-5 space-y-3">
              <h3 className="font-display text-xl text-gold">
                1. Core Fundamentals & Skill Overview
              </h3>
              <p>
                {skill?.description} To successfully channel this technique, you must first master the breath-control stance. Conqueror's pressure is not generated through muscle tension; rather, it originates from unyielding mental resolve focused directly into your striking point.
              </p>
            </div>

            <div className="bg-deep/80 border border-line/60 rounded-xl p-5 space-y-3">
              <h3 className="font-display text-xl text-gold">
                2. Step-by-Step Execution Protocol
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-text-primary font-medium text-xs sm:text-sm">
                <li><strong>Initial Grounding:</strong> Plant your dominant foot firmly, bending knees slightly to lower your center of gravity.</li>
                <li><strong>Aura Compression:</strong> Exhale completely while drawing focus to the core of your forehead and chest.</li>
                <li><strong>Willpower Projection:</strong> Envision your energy expanding 3 meters outward before snapping inward onto your weapon or fists.</li>
                <li><strong>Impact Extension:</strong> Strike without making physical contact; the black lightning discharge will transfer the kinetic wave.</li>
              </ol>
            </div>

            <div className="bg-deep/80 border border-line/60 rounded-xl p-5 space-y-3">
              <h3 className="font-display text-xl text-gold">
                3. Pro Tips & Recommended Daily Exercises
              </h3>
              <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
                <li>Practice aura holding for 15 minutes every morning at Grove 13.</li>
                <li>Never force the technique when fatigued; spirit reserves recover only during rest.</li>
                <li>Pair with Haki stance control for maximum armor penetration.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: CHAPTER TIMESTAMPS */}
        {activeTab === 'chapters' && (
          <div className="space-y-3">
            {chapters.map((ch, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentTime(ch.time)}
                className="bg-deep p-4 rounded-xl border border-line/50 hover:border-gold/50 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-gold bg-gold/10 px-2.5 py-1 rounded-lg border border-gold/30 group-hover:scale-105 transition-transform">
                    ▶ {ch.time}
                  </span>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm group-hover:text-gold transition-colors">{ch.title}</h4>
                    <p className="text-text-muted text-xs">{ch.desc}</p>
                  </div>
                </div>
                <span className="text-xs text-text-muted font-mono">Jump to Timestamp →</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DISCUSSION & COMMENTS */}
        {activeTab === 'discussion' && (
          <div className="space-y-6">
            <form onSubmit={handlePostComment} className="space-y-3">
              <textarea
                rows={3}
                className="input w-full"
                placeholder="Ask a question about this lecture or share your practice progress..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <Button type="submit" compact className="bg-gold text-[#1A1204] font-bold">
                Post Comment
              </Button>
            </form>

            <div className="space-y-4 pt-4 border-t border-line/40">
              {comments.map(c => (
                <div key={c.id} className="bg-deep p-4 rounded-xl border border-line/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-primary">{c.author}</span>
                    <span className="text-text-muted font-mono">{c.time}</span>
                  </div>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">{c.text}</p>
                  <div className="text-[11px] font-mono text-text-muted flex items-center gap-2">
                    <span className="cursor-pointer hover:text-gold">👍 {c.likes} Likes</span>
                    <span>•</span>
                    <span className="cursor-pointer hover:text-gold">Reply</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 10px; color: #F3EEDF; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 150ms; } .input:focus { border-color: #F2B84B; }`}</style>
    </div>
  );
}
