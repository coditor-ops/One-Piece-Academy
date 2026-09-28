import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Modal } from '../components/ui.jsx';
import { InteractiveDemandSimulator } from '../components/InteractiveDemandSimulator.jsx';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '☠️', category: '' },
  { id: 'haki', label: 'Haki', icon: '⚡', category: 'Haki' },
  { id: 'swordsmanship', label: 'Swordsmanship', icon: '⚔️', category: 'Swordsmanship' },
  { id: 'fishman', label: 'Fish-Man Karate', icon: '🥋', category: 'Fish-Man Karate' },
  { id: 'navigation', label: 'Navigation', icon: '🧭', category: 'Navigation' },
  { id: 'cooking', label: 'Cooking', icon: '🍳', category: 'Cooking' },
  { id: 'devilfruit', label: 'Devil Fruit', icon: '🍎', category: 'Devil Fruit Mastery' },
  { id: 'shipwright', label: 'Shipwright', icon: '⚓', category: 'Shipwright' },
];

const POPULAR_SKILLS = [
  {
    id: 'haki-1',
    name: "Advanced Conqueror's Haki",
    teacher: 'Silvers Rayleigh',
    price: 508,
    multiplier: 2.54,
    tag: 'Bounty surge',
    tagColor: 'bg-crimson text-white',
    icon: '⚡',
  },
  {
    id: 'zoro-1',
    name: 'Santoryu Swordsmanship',
    teacher: 'Roronoa Zoro',
    price: 198,
    multiplier: 1.10,
    tag: 'Trending',
    tagColor: 'bg-emerald-600 text-white',
    icon: '⚔️',
  },
  {
    id: 'jinbe-1',
    name: 'Fish-Man Karate',
    teacher: 'Jinbe',
    price: 144,
    multiplier: 0.90,
    tag: 'Stable',
    tagColor: 'bg-cyan-600 text-white',
    icon: '🥋',
  },
  {
    id: 'nami-1',
    name: 'Navigation & Cartography',
    teacher: 'Nami',
    price: 100,
    multiplier: 1.00,
    tag: 'Popular',
    tagColor: 'bg-blue-600 text-white',
    icon: '🧭',
  },
  {
    id: 'sanji-1',
    name: 'Black Leg Style Cooking',
    teacher: 'Sanji',
    price: 72,
    multiplier: 0.90,
    tag: 'Oversupply',
    tagColor: 'bg-amber-600 text-white',
    icon: '🍳',
  },
];

export default function Landing() {
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [rushModalOpen, setRushModalOpen] = useState(false);
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', crew: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    
    // Setup for 150 frames (ezgif-frame-001.png to ezgif-frame-150.png)
    const frameCount = 150;
    const currentFrame = (index) => `/video1/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`;

    const images = [];
    const scrubData = { frame: 0 };
    
    canvas.width = 1920;
    canvas.height = 1080;

    function render() {
      const img = images[Math.round(scrubData.frame)];
      if (img && img.complete && img.naturalWidth > 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratio covering
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgRatio;
          drawHeight = canvas.height;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }
        
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    }

    // Preload images safely
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      images.push(img);
    }

    images[0].onload = render;
    
    // Assign src after onload is bound
    for (let i = 0; i < frameCount; i++) {
      images[i].src = currentFrame(i);
    }

    // Scrub through the image sequence tied to the ENTIRE page scroll
    gsap.to(scrubData, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      onUpdate: render,
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom', // Scrubs until the very bottom of the webpage
        scrub: 0.5,
      }
    });

    // Parallax the canvas slowly and fade slightly at bottom
    gsap.fromTo(canvas, {
      scale: 1,
      opacity: 1
    }, {
      scale: 1.15,
      opacity: 0.5,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      }
    });

  });

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') await login(form.email, form.password);
      else await register(form);
      setAuthModalOpen(false);
      navigate('/market');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e?.preventDefault();
    const qParam = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
    navigate(`/market${qParam}`);
  }

  function handleCategoryClick(catObj) {
    setSelectedCat(catObj.id);
    if (catObj.category) {
      navigate(`/market?category=${encodeURIComponent(catObj.category)}`);
    } else {
      navigate('/market');
    }
  }

  return (
    <main className="relative overflow-x-hidden w-full max-w-full text-text-primary min-h-screen bg-transparent">
      
      {/* 
        CINEMATIC SCRUB BACKGROUND: Scrub through images tied to scroll 
      */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#0A0A0C]">
        <canvas 
          ref={canvasRef}
          className="w-full h-full object-cover origin-center"
        />
        {/* Ultra-light vignette: maximum video visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070B14]/15 via-transparent to-[#070B14]/40 pointer-events-none" />
      </div>

      {/* Floating WANTED Poster Card */}
      <div className="fixed top-24 right-8 z-30 hidden xl:block pointer-events-auto">
        <div 
          onClick={() => (user ? navigate('/market') : setAuthModalOpen(true))}
          className="bg-[#EADBB8] text-[#2A1D0E] p-3.5 rounded-xl shadow-2xl border-2 border-[#C9B58A] w-32 text-center cursor-pointer hover:rotate-3 hover:scale-105 transition-all duration-300 backdrop-blur-md"
        >
          <div className="font-display text-lg font-black tracking-widest border-b border-[#2A1D0E]/30 pb-1">
            WANTED
          </div>
          <div className="text-[9px] font-bold tracking-tight uppercase my-1 font-mono">
            Learners & Mentors
          </div>
          <div className="text-2xl my-0.5">💰</div>
          <div className="text-[11px] font-mono font-bold mt-1 bg-[#2A1D0E] text-[#EADBB8] rounded py-1 shadow-sm">
            500 VCT GRANT
          </div>
        </div>
      </div>

      {/* 
        FLOATING CYLINDRICAL GLASSMORPHISM NAVBAR (Double-Bezel Architecture)
      */}
      <header className="sticky top-6 z-50 px-4 sm:px-6 w-full max-w-[1440px] mx-auto pointer-events-none mb-12">
        {/* Outer Shell */}
        <div className="pointer-events-auto bg-white/[0.02] p-1.5 rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-md">
          {/* Inner Core */}
          <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[calc(2.5rem-0.375rem)] px-5 sm:px-7 py-3 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-gold/10">
            
            {/* Logo & Brand */}
            <div 
              onClick={() => navigate('/market')} 
              className="flex items-center gap-3 cursor-pointer group shrink-0 active:scale-[0.98] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#141E34] to-[#0D1526] flex items-center justify-center text-xl border border-white/10 group-hover:border-gold/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                ☠️
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg sm:text-xl text-text-primary tracking-tight leading-none group-hover:text-gold transition-colors duration-500 drop-shadow">
                  ONE PIECE
                </span>
                <span className="font-display text-xs tracking-widest text-gold/80 leading-tight drop-shadow">
                  ACADEMY
                </span>
              </div>
            </div>

          {/* Desktop Nav Links in Capsule */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-deep/70 px-3 py-1.5 rounded-full border border-line/60 shadow-inner">
            {user && (
              <button 
                onClick={() => navigate('/market')} 
                className="px-4 py-1.5 text-xs font-bold text-gold bg-hull-raised rounded-full shadow-sm ring-1 ring-gold/40 cursor-pointer"
              >
                Home
              </button>
            )}
            <button 
              onClick={() => navigate('/market?view=skills')} 
              className="px-4 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-hull/40 rounded-full transition-colors cursor-pointer"
            >
              Explore Skills
            </button>
            <button 
              onClick={() => navigate('/market?view=mentors')} 
              className="px-4 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-hull/40 rounded-full transition-colors cursor-pointer"
            >
              Find Mentors
            </button>
            {user && (
              <>
                <button 
                  onClick={() => navigate('/sessions')} 
                  className="px-4 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-hull/40 rounded-full transition-colors cursor-pointer"
                >
                  My Sessions
                </button>
                <button 
                  onClick={() => navigate('/requests')} 
                  className="px-4 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-hull/40 rounded-full transition-colors cursor-pointer"
                >
                  Requests
                </button>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="px-4 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-hull/40 rounded-full transition-colors cursor-pointer"
                >
                  Fleet Admin
                </button>
                
                {/* Simulate Pirate Rush Nav Button */}
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-full text-amber-300 hover:bg-amber-400/20 border border-amber-400/50 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-1 active:scale-95"
                >
                  <span className="animate-pulse">⚡</span>
                  <span>Simulate Pirate Rush</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action: User Info or Enlist CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <button 
                  onClick={() => navigate('/wallet')} 
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full font-mono text-xs font-bold shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border border-white/10 cursor-pointer active:scale-[0.98]"
                >
                  <span>🪙</span>
                  <span>{user.balance?.toLocaleString() || 500} VCT</span>
                  <span className="opacity-60 hidden sm:inline">•</span>
                  <span className="text-[11px] opacity-80 hidden sm:inline">Held: {user.escrowHeld?.toLocaleString() || 0}</span>
                </button>

                <button 
                  onClick={logout} 
                  className="px-4 py-2 text-xs font-bold rounded-full bg-crimson/90 hover:bg-crimson text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_0_15px_rgba(217,46,50,0.3)] active:scale-[0.98] cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setTab('login'); setAuthModalOpen(true); }}
                  className="px-4 py-2.5 text-xs font-bold rounded-full bg-transparent text-text-primary hover:text-gold transition-colors duration-300 cursor-pointer"
                >
                  Sign In
                </button>

                {/* Button-in-Button Architecture */}
                <button 
                  onClick={() => { setTab('register'); setAuthModalOpen(true); }}
                  className="group relative flex items-center justify-between gap-3 pl-5 pr-1.5 py-1.5 text-xs font-bold rounded-full bg-gold text-[#1A1204] hover:bg-gold-bright shadow-[0_0_20px_rgba(242,184,75,0.4)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer"
                >
                  <span>Enlist Now</span>
                  <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[2px] group-hover:scale-105">
                    ⚓
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
        </div>
      </header>

      {/* 
        HERO SECTION
      */}
      <section className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        
        {/* Parchment Pill Tag */}
        <div className="inline-flex items-center gap-2 bg-[#EADBB8] text-[#2A1D0E] px-4 py-1.5 rounded-md font-mono text-xs font-black tracking-widest mb-6 shadow-lg border border-[#C9B58A]">
          <span>⚓</span>
          <span>LEARN • TEACH • TRADE • GROW</span>
        </div>

        {/* Big Display Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl"
        >
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[6.8rem] leading-[0.95] text-text-primary mb-5 tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            Skills Today, <br />
            A <span className="text-crimson font-black drop-shadow-[0_0_35px_rgba(229,72,77,0.85)]">Bigger</span> Tomorrow
          </h1>

          <p className="text-text-primary text-base sm:text-xl max-w-2xl font-medium mb-8 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] bg-[#070B14]/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
            A peer-to-peer skill marketplace where every talent finds its crew. Learn from masters, share your skills, and trade knowledge with <strong className="text-gold">Vivre Card Tokens</strong>.
          </p>
        </motion.div>

        {/* Large Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mb-8">
          <div className="bg-[#F3EEDF] text-[#2A1D0E] rounded-2xl p-1.5 flex items-center shadow-[0_12px_35px_rgba(0,0,0,0.6)] border-2 border-[#EADBB8]">
            <input 
              type="text"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm sm:text-base outline-none text-[#2A1D0E] placeholder-[#6F7C99] font-medium"
              placeholder="Search skills... (e.g. Haki, Swordsmanship, Cooking, Navigation)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-crimson hover:bg-crimson/90 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <span>🎯</span>
              <span>Find Skills</span>
            </button>
          </div>
        </form>

        {/* Category Icons Strip */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none max-w-4xl mb-10">
          {CATEGORIES.map(c => {
            const isSelected = selectedCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCategoryClick(c)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl min-w-[80px] transition-all cursor-pointer backdrop-blur-md ${
                  isSelected 
                    ? 'bg-crimson/80 border-2 border-crimson text-white scale-105 shadow-glow-crimson' 
                    : 'bg-[#0D1526]/70 hover:bg-[#0D1526]/90 border border-white/10 text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="w-10 h-10 rounded-full bg-[#141E34] flex items-center justify-center text-lg border border-gold/30 shadow-inner">
                  {c.icon}
                </span>
                <span className="text-[11px] font-bold">{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4 Stat Cards in Parchment Texture Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mb-12">
          
          <div className="bg-[#EADBB8] text-[#2A1D0E] p-4 rounded-xl border border-[#C9B58A] flex items-center gap-3.5 shadow-xl hover:scale-102 transition-transform">
            <span className="text-2xl p-2 rounded-lg bg-[#2A1D0E]/10">👥</span>
            <div>
              <div className="font-display text-2xl font-black leading-tight">21.4K+</div>
              <div className="text-[11px] font-bold uppercase font-mono text-[#2A1D0E]/80">Active Pirates</div>
            </div>
          </div>

          <div className="bg-[#EADBB8] text-[#2A1D0E] p-4 rounded-xl border border-[#C9B58A] flex items-center gap-3.5 shadow-xl hover:scale-102 transition-transform">
            <span className="text-2xl p-2 rounded-lg bg-[#2A1D0E]/10">📚</span>
            <div>
              <div className="font-display text-2xl font-black leading-tight">1.2K+</div>
              <div className="text-[11px] font-bold uppercase font-mono text-[#2A1D0E]/80">Skills Listed</div>
            </div>
          </div>

          <div className="bg-[#EADBB8] text-[#2A1D0E] p-4 rounded-xl border border-[#C9B58A] flex items-center gap-3.5 shadow-xl hover:scale-102 transition-transform">
            <span className="text-2xl p-2 rounded-lg bg-[#2A1D0E]/10">☠️</span>
            <div>
              <div className="font-display text-2xl font-black leading-tight">8.7K+</div>
              <div className="text-[11px] font-bold uppercase font-mono text-[#2A1D0E]/80">Sessions Done</div>
            </div>
          </div>

          <div className="bg-[#EADBB8] text-[#2A1D0E] p-4 rounded-xl border border-[#C9B58A] flex items-center gap-3.5 shadow-xl hover:scale-102 transition-transform">
            <span className="text-2xl p-2 rounded-lg bg-[#2A1D0E]/10">⭐</span>
            <div>
              <div className="font-display text-2xl font-black leading-tight">4.9/5</div>
              <div className="text-[11px] font-bold uppercase font-mono text-[#2A1D0E]/80">Crew Rating</div>
            </div>
          </div>

        </div>

        {/* Popular Skills Bar & Cards */}
        <div className="space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 bg-[#EADBB8] text-[#2A1D0E] px-3.5 py-1.5 rounded-md font-mono text-xs font-black tracking-wider shadow-md">
              <span>🔥</span>
              <span>POPULAR SKILLS MARKET</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-300 font-semibold drop-shadow">
                ⚡ Live Surge Multiplier Active
              </span>
              <button 
                onClick={() => navigate('/market')}
                className="px-3 py-1 bg-gold hover:bg-gold-bright text-abyss rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <span>Browse All</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Popular Skill Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {POPULAR_SKILLS.map(sk => (
              /* Outer Shell */
              <div
                key={sk.id}
                className="bg-white/[0.02] p-1.5 rounded-[2rem] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] group hover:scale-[1.02] active:scale-[0.98] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
                onClick={() => navigate('/market')}
              >
                {/* Inner Core */}
                <div className="bg-[#050505]/80 backdrop-blur-2xl rounded-[calc(2rem-0.375rem)] p-5 flex flex-col justify-between h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-white/10 group-hover:ring-gold/30 transition-colors duration-500 ease-out relative overflow-hidden">
                  
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/5 group-hover:to-transparent transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono ${sk.tagColor} shadow-md`}>
                        {sk.tag}
                      </span>
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-center">{sk.icon}</span>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-text-primary text-base line-clamp-2 group-hover:text-gold transition-colors duration-500">
                        {sk.name}
                      </h3>
                      <div className="text-xs text-text-muted mt-1.5 font-mono">by {sk.teacher}</div>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-white/10 font-mono">
                      <span className="text-gold font-bold text-lg">{sk.price} VCT</span>
                      <span className="text-xs text-text-secondary bg-white/5 px-2 py-0.5 rounded-md">×{sk.multiplier}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </section>

      {/* 
        INTERACTIVE DEMAND PRICING SIMULATOR SECTION
      */}
      <section className="relative z-10 w-full py-20 px-4 sm:px-6 max-w-[1440px] mx-auto border-t border-white/10 bg-[#070B14]/65 backdrop-blur-2xl rounded-3xl my-10 shadow-2xl">
        <div className="text-center mb-10">
          <span className="text-gold text-xs font-mono font-semibold uppercase tracking-widest block mb-1">
            Dynamic Economy Engine
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-text-primary drop-shadow">
            Interactive Supply & Demand Simulator
          </h2>
          <p className="text-text-secondary text-sm max-w-xl mx-auto mt-2">
            Test how prices react live to supply and demand with the formula built for the Grand Line Skill Exchange.
          </p>
        </div>

        <InteractiveDemandSimulator />
      </section>

      {/* Auth Modal */}
      {authModalOpen && (
        <Modal open title={tab === 'login' ? '⚓ Pirate Login' : '🏴‍☠️ Enlist in One Piece Academy'} onClose={() => setAuthModalOpen(false)}>
          <div className="space-y-4">
            <div className="flex gap-2 bg-deep p-1 rounded-xl border border-line">
              <button 
                onClick={() => setTab('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${tab === 'login' ? 'bg-gold text-abyss font-black' : 'text-text-secondary'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setTab('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${tab === 'register' ? 'bg-gold text-abyss font-black' : 'text-text-secondary'}`}
              >
                Enlist (500 VCT)
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {tab === 'register' && (
                <>
                  <input 
                    className="input w-full" 
                    placeholder="Pirate Name (e.g. Silvers Rayleigh)"
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required 
                  />
                  <input 
                    className="input w-full" 
                    placeholder="Crew / Ship (optional)"
                    value={form.crew} 
                    onChange={e => setForm(f => ({ ...f, crew: e.target.value }))} 
                  />
                </>
              )}
              <input 
                className="input w-full" 
                type="email" 
                placeholder="Email Address"
                value={form.email} 
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required 
              />
              <input 
                className="input w-full" 
                type="password" 
                placeholder="Password"
                value={form.password} 
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required 
              />

              {error && <div className="text-crimson text-xs bg-crimson/10 p-2.5 rounded-lg border border-crimson/20">⚠️ {error}</div>}

              <Button type="submit" loading={loading} className="w-full h-11 text-sm font-bold shadow-glow-gold">
                {tab === 'login' ? 'Enter Academy Market' : 'Claim 500 VCT Bonus & Join'}
              </Button>
            </form>
          </div>
        </Modal>
      )}

      <style>{`
        .input {
          background: #0D1526;
          border: 1px solid #2A3A5C;
          border-radius: 8px;
          color: #F3EEDF;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 150ms;
        }
        .input:focus { border-color: #F2B84B; }
      `}</style>
    </main>
  );
}