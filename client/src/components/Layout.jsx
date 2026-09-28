import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Modal } from '../components/ui.jsx';
import { api } from '../api/client.js';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentOutlet = useOutlet();
  const qc = useQueryClient();
  const [showRushModal, setShowRushModal] = useState(false);
  const [rushSkillId, setRushSkillId] = useState('');
  const [rushSuccessMsg, setRushSuccessMsg] = useState('');

  // Fetch live skill list for pirate rush dropdown
  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.get('/skills'),
  });

  const simulateRush = useMutation({
    mutationFn: (targetId) => api.post('/market/admin/simulate-rush', { 
      skillId: targetId || rushSkillId || (skills?.[0]?.id), 
      count: 15 
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['market-overview'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['skills'] });
      setRushSuccessMsg('⚡ Pirate Rush Injected! Prices are surging live.');
      setTimeout(() => {
        setRushSuccessMsg('');
        setShowRushModal(false);
        navigate('/market');
      }, 1200);
    },
  });

  const navItems = [
    ...(user ? [
      { path: '/market', label: 'Home' },
      { path: '/my-dashboard', label: 'My Dashboard' }
    ] : []),
    { path: '/market?view=skills#skills-section', label: 'Explore Skills' },
    { path: '/market?view=mentors#skills-section', label: 'Find Mentors' },
    ...(user ? [
      { path: '/requests', label: 'Requests' },
      { path: '/dashboard', label: 'Fleet Admin' },
    ] : []),
  ];

  const isActive = (path) => {
    const cleanPath = path.split('#')[0];
    if (cleanPath.includes('?')) {
      return (location.pathname + location.search) === cleanPath;
    }
    return location.pathname === cleanPath && !location.search;
  };

  return (
    <div className="min-h-screen text-text-primary selection:bg-gold selection:text-text-on-gold flex flex-col">
      
      {/* 
        FLOATING CYLINDRICAL GLASSMORPHISM NAVBAR
        Rounded capsule structure with backdrop blur, edge refraction, and inner highlights.
      */}
      <header className="sticky top-4 z-50 px-4 sm:px-8 w-full max-w-[1920px] mx-auto pointer-events-none mb-4">
        <div className="pointer-events-auto bg-[#0D1526]/80 backdrop-blur-2xl border border-white/15 rounded-full px-4 sm:px-7 py-3 flex items-center justify-between shadow-[0_16px_40px_rgba(0,0,0,0.6),_inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-gold/20 transition-all duration-300">
          
          {/* Brand Logo & Title */}
          <NavLink to="/market" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hull to-deep flex items-center justify-center text-xl border border-gold/40 group-hover:scale-105 group-hover:border-gold transition-all shadow-[0_0_15px_rgba(242,184,75,0.2)]">
              ☠️
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-xl text-text-primary tracking-tight group-hover:text-gold transition-colors leading-none">
                ONE PIECE
              </span>
              <span className="font-display text-xs tracking-widest text-gold leading-tight">
                ACADEMY
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Capsule Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-deep/60 px-3 py-1.5 rounded-full border border-line/60 shadow-inner">
            {navItems.map(item => (
              <NavLink 
                key={item.path} 
                to={item.path}
                onClick={() => {
                  if (item.path.includes('#skills-section')) {
                    setTimeout(() => {
                      const el = document.getElementById('skills-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 80);
                  }
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  isActive(item.path) 
                    ? 'text-gold bg-hull-raised shadow-sm ring-1 ring-gold/40' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-hull/40'
                }`}
              >
                {item.label}
              </NavLink>
            ))}

            {/* Simulate Pirate Rush Nav Button */}
            {user && (
              <button
                onClick={() => {
                  if (skills?.length && !rushSkillId) setRushSkillId(skills[0].id);
                  setShowRushModal(true);
                }}
                className="px-3.5 py-1.5 text-xs font-bold rounded-full text-amber-400 hover:bg-amber-400/15 border border-amber-400/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-1 active:scale-95"
              >
                <span className="animate-pulse">⚡</span>
                <span>Simulate Pirate Rush</span>
              </button>
            )}
          </nav>

          {/* Right Action / Wallet Token Badge & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <>
                {/* Token Chest Badge */}
                <NavLink 
                  to="/wallet" 
                  className="flex items-center gap-2 bg-[#EADBB8] text-[#2A1D0E] px-3 sm:px-4 py-2 rounded-full font-mono text-xs font-black shadow-md hover:brightness-105 transition-all border border-[#C9B58A]"
                  title="Your Berries / Vivre Coins"
                >
                  <span>🪙</span>
                  <span>{user.balance?.toLocaleString() || 500} VCT</span>
                  <span className="opacity-60 hidden sm:inline">•</span>
                  <span className="text-[11px] opacity-80 hidden sm:inline">Held: {user.escrowHeld?.toLocaleString() || 0}</span>
                </NavLink>

                {/* Profile Link */}
                <NavLink
                  to="/profile"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-hull border border-line text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-gold/40 transition-all"
                >
                  <span>👤</span>
                  <span>{user.name}</span>
                </NavLink>

                {/* Logout Button */}
                <button 
                  onClick={logout} 
                  className="px-3 sm:px-4 py-2 text-xs font-bold rounded-full bg-crimson hover:bg-crimson/90 text-white transition-all shadow-md shadow-crimson/30 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink
                to="/"
                className="px-4 py-2 text-xs font-bold rounded-full bg-gold text-abyss hover:brightness-110 transition-all shadow-glow-gold"
              >
                Enlist / Sign In
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-4 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full h-full flex flex-col"
          >
            {currentOutlet}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-line/40 bg-deep/30 py-6 text-center text-xs text-text-muted mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>☠️</span>
            <span>One Piece Academy • Sabaody Skill Exchange</span>
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/market" className="hover:text-gold transition-colors">Market</NavLink>
            {user && (
              <>
                <NavLink to="/dashboard" className="hover:text-gold transition-colors">Fleet Admin</NavLink>
                <NavLink to="/sessions" className="hover:text-gold transition-colors">Sessions</NavLink>
                <NavLink to="/wallet" className="hover:text-gold transition-colors">Treasure Chest</NavLink>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Quick Simulate Pirate Rush Modal */}
      {showRushModal && (
        <Modal open title="⚡ Simulate Instant Pirate Rush" onClose={() => setShowRushModal(false)}>
          <div className="space-y-4 text-sm">
            <p className="text-text-secondary leading-relaxed">
              Inject 15 instant session demand requests to watch skill prices surge live across the Sabaody market.
            </p>
            <div>
              <label className="text-xs text-text-muted uppercase font-mono block mb-1">Target Skill to Surge</label>
              <select 
                className="input w-full"
                value={rushSkillId || (skills?.[0]?.id || '')} 
                onChange={e => setRushSkillId(e.target.value)}
              >
                {skills?.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.icon || '⚔️'} {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            {rushSuccessMsg && (
              <div className="p-3 bg-foam/10 border border-foam/30 rounded-xl text-foam text-xs font-semibold flex items-center gap-2">
                <span>✓</span>
                <span>{rushSuccessMsg}</span>
              </div>
            )}

            <Button 
              className="w-full h-11 bg-ember text-white hover:bg-ember/90 font-bold shadow-glow-ember rounded-xl"
              loading={simulateRush.isPending}
              onClick={() => simulateRush.mutate(rushSkillId || skills?.[0]?.id)}
            >
              {simulateRush.isPending ? 'Surging Demand Events...' : '⚡ Launch 15 Demand Events Now'}
            </Button>
          </div>
        </Modal>
      )}

      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 10px; color: #F3EEDF; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 150ms; } .input:focus { border-color: #F2B84B; } select option { background: #0D1526; }`}</style>
    </div>
  );
}