import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Modal } from '../components/ui.jsx';
import { api } from '../api/client.js';
import { OnboardingBot } from './OnboardingBot.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentOutlet = useOutlet();
  const qc = useQueryClient();
  const [showRushModal, setShowRushModal] = useState(false);
  const [rushSkillId, setRushSkillId] = useState('');
  const [rushSuccessMsg, setRushSuccessMsg] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Skull Toggle */}
            <div 
              className="lg:hidden w-10 h-10 rounded-full bg-gradient-to-br from-hull to-deep flex items-center justify-center text-xl border border-gold/40 cursor-pointer shadow-[0_0_15px_rgba(242,184,75,0.2)] active:scale-95"
              onClick={() => setIsSidebarOpen(true)}
            >
              ☠️
            </div>
            
            {/* Desktop Logo Link */}
            <NavLink to="/market" className="hidden lg:flex items-center gap-3 group">
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

            {/* Mobile Title */}
            <div className="flex flex-col lg:hidden cursor-pointer" onClick={() => navigate('/market')}>
              <span className="font-display text-lg sm:text-xl text-text-primary tracking-tight leading-none">
                ONE PIECE
              </span>
              <span className="font-display text-xs tracking-widest text-gold leading-tight">
                ACADEMY
              </span>
            </div>
          </div>

          {/* Desktop Navigation Capsule Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-deep/60 px-3 py-1.5 rounded-full border border-line/60 shadow-inner">
            {navItems.map(item => (
              <NavLink 
                key={item.path} 
                id={`tour-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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

            {/* DEMO Dropdown */}
            {user && (
              <div className="relative group px-1">
                <button className="px-3.5 py-1.5 text-xs font-bold rounded-full text-amber-400 hover:bg-amber-400/15 border border-amber-400/20 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                  <span>🛠️ DEMO</span>
                </button>
                <div className="absolute top-full right-0 mt-3 w-56 bg-[#0D1526]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col gap-1">
                  <NavLink 
                    to="/dashboard"
                    className={({ isActive }) => `px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      isActive 
                        ? 'bg-white/10 text-white' 
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Fleet Admin (Instructor)
                  </NavLink>
                  <button
                    onClick={() => {
                      if (skills?.length && !rushSkillId) setRushSkillId(skills[0].id);
                      setShowRushModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all flex items-center gap-2"
                  >
                    <span className="animate-pulse">⚡</span> Simulate Pirate Rush
                  </button>
                </div>
              </div>
            )}
          </nav>

          {/* Right Action / Wallet Token Badge & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <>
                {/* Token Chest Badge */}
                <NavLink 
                  id="tour-wallet"
                  to="/wallet" 
                  className="flex items-center gap-2 bg-[#EADBB8] text-[#2A1D0E] px-3 sm:px-4 py-2 rounded-full font-mono text-xs font-black shadow-md hover:brightness-105 transition-all border border-[#C9B58A]"
                  title="Your Berries / Vivre Coins"
                >
                  <span>🪙</span>
                  <span>{user.balance?.toLocaleString() || 500} VCT</span>
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

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[80vw] bg-hull border-r border-gold/20 z-[70] lg:hidden flex flex-col p-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsSidebarOpen(false); navigate('/market'); }}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hull to-deep flex items-center justify-center text-xl border border-gold/40">
                    ☠️
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-lg text-text-primary leading-none">ONE PIECE</span>
                    <span className="font-display text-[10px] tracking-widest text-gold leading-tight">ACADEMY</span>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-text-muted hover:text-white p-2 text-xl leading-none font-bold">
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {navItems.map(item => {
                  const active = isActive(item.path);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        setIsSidebarOpen(false);
                        if (item.path.includes('#skills-section')) {
                          setTimeout(() => {
                            const el = document.getElementById('skills-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 80);
                        }
                      }}
                      className={`px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${
                        active
                          ? 'bg-gold text-[#1A1204] shadow-glow-gold'
                          : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {item.label}
                    </NavLink>
                  );
                })}
                
                {user && (
                  <div className="mt-4 pt-4 border-t border-line/40 flex flex-col gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 px-4 mb-1 tracking-widest">🛠️ DEMO CONTROLS</span>
                    <NavLink
                      to="/dashboard"
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) => `px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${
                        isActive
                          ? 'bg-gold text-[#1A1204] shadow-glow-gold'
                          : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      Fleet Admin (Instructor)
                    </NavLink>
                    <button
                      onClick={() => {
                        setIsSidebarOpen(false);
                        if (skills?.length && !rushSkillId) setRushSkillId(skills[0].id);
                        setShowRushModal(true);
                      }}
                      className="px-4 py-3.5 rounded-xl font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 text-left flex items-center gap-2"
                    >
                      <span className="animate-pulse">⚡</span> Simulate Pirate Rush
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-4 flex flex-col">
        {user && <OnboardingBot user={user} />}
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