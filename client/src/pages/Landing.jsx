import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui.jsx';
import { InteractiveDemandSimulator } from '../components/InteractiveDemandSimulator.jsx';

export default function Landing() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const authRef = useRef(null);
  const videoRef = useRef(null);

  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', crew: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  // Scroll-driven video playback controller (scrubs video smoothly as user scrolls)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animId;
    let targetTime = 0;
    let currentTime = 0;
    let isUserScrolling = false;
    let scrollTimeout;

    const handleScroll = () => {
      isUserScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
      }, 150);

      const scrollY = window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      setScrollPct(Math.round(progress * 100));

      if (video.duration && !isNaN(video.duration)) {
        targetTime = progress * video.duration;
      }
    };

    const renderLoop = () => {
      if (video.duration && !isNaN(video.duration)) {
        if (isUserScrolling) {
          // Quick interpolation when user is actively scrolling
          currentTime += (targetTime - currentTime) * 0.25;
          if (Math.abs(currentTime - video.currentTime) > 0.01) {
            video.currentTime = currentTime;
          }
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    video.addEventListener('loadedmetadata', handleScroll);

    // Initial check
    if (video.readyState >= 1) {
      handleScroll();
    }

    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      video.removeEventListener('loadedmetadata', handleScroll);
      cancelAnimationFrame(animId);
      clearTimeout(scrollTimeout);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') await login(form.email, form.password);
      else await register(form);
      navigate('/market');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function scrollToAuth() {
    authRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="relative overflow-x-hidden w-full max-w-full text-text-primary min-h-screen bg-transparent">
      
      {/* 
        FIXED SCROLL-DRIVEN BACKGROUND VIDEO
        Fixed behind all page content; vibrant, luminous, and scrubs with scroll.
      */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-abyss">
        <video 
          ref={videoRef}
          autoPlay
          loop
          muted 
          playsInline 
          preload="auto"
          className="w-full h-full object-cover select-none filter contrast-105 saturate-115 opacity-90"
        >
          <source src="/hero-page.mp4" type="video/mp4" />
          <source src="/hero%20page.mp4" type="video/mp4" />
        </video>

        {/* Light Cinematic Vignette Overlays (keeps video bright & vibrant while maintaining text contrast) */}
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/40 via-transparent to-abyss/70 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(7,11,20,0.65)_100%)] pointer-events-none" />
      </div>

      {/* Floating Interactive Scroll-HUD Indicator */}
      <div className="fixed top-20 right-6 z-40 hidden lg:flex items-center gap-2 bg-deep/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-line/70 shadow-e2 text-xs font-mono text-text-secondary">
        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        <span>Grand Line Voyage: <strong className="text-gold font-bold">{scrollPct}%</strong></span>
      </div>

      {/* 
        1. ATTENTION (HERO) SECTION
      */}
      <section className="relative z-10 w-full min-h-[92vh] flex flex-col justify-between">
        
        {/* Top Floating Header Bar */}
        <div className="w-full max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 bg-deep/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-line/60 shadow-e1">
            <span className="text-2xl">⛵</span>
            <span className="font-display text-xl sm:text-2xl text-gold tracking-tight">Grand Line Exchange</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={scrollToAuth} 
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-deep/70 backdrop-blur-md border border-line text-text-primary hover:border-gold transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <Button onClick={scrollToAuth} className="text-xs px-5 h-9 font-bold shadow-glow-gold">
              Enlist Now ⚓
            </Button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="w-full max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center my-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl"
          >
            {/* 2-Line Headline */}
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7.2rem] leading-[0.9] text-text-primary mb-6 tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
              Trade Your Mastery. <br />
              <span className="text-gold opacity-95 mix-blend-plus-lighter drop-shadow-[0_0_40px_rgba(242,184,75,0.6)]">
                Dynamic Skill Marketplace.
              </span>
            </h1>
            
            <p className="text-text-primary text-lg sm:text-2xl max-w-2xl mx-auto font-medium mb-10 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] bg-deep/30 backdrop-blur-sm p-3 rounded-2xl border border-line/20">
              The Grand Line's premier peer-to-peer exchange where prices float dynamically with real-time supply and demand.
            </p>

            {/* High-Contrast CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                onClick={scrollToAuth} 
                className="text-base sm:text-lg px-8 h-14 bg-gold text-abyss hover:bg-gold-bright hover:-translate-y-1 shadow-glow-gold transition-all duration-300 font-bold cursor-pointer"
              >
                Set Sail & Claim 500 VCT ⚓
              </Button>

              <button 
                onClick={() => {
                  document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-base sm:text-lg px-8 h-14 bg-deep/80 backdrop-blur-md text-text-primary border border-line rounded-xl hover:border-gold/70 hover:bg-deep transition-all duration-300 font-semibold cursor-pointer shadow-e1"
              >
                Try Price Simulator ⚡
              </button>
            </div>
          </motion.div>

        </div>

        {/* Live Marquee Ticker HUD at Bottom of Hero */}
        <div className="w-full border-t border-b border-line/40 bg-abyss/75 backdrop-blur-xl py-3 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee flex gap-12 text-sm font-medium text-text-secondary w-max flex-nowrap">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex gap-10 items-center flex-nowrap shrink-0">
                <span className="flex items-center gap-2 text-ember font-bold shrink-0">
                  🔥 Rayleigh's Haki Surging
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-text-primary font-semibold">Conqueror's Haki</span>
                  <span className="text-ember font-mono font-bold">▲ 508 VCT</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-text-primary font-semibold">Fish-Man Karate</span>
                  <span className="text-ember font-mono font-bold">▲ 144 VCT</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-text-primary font-semibold">Santoryu Swordsmanship</span>
                  <span className="text-ember font-mono font-bold">▲ 320 VCT</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-text-primary font-semibold">Black Leg Cooking</span>
                  <span className="text-foam font-mono font-bold">▼ 72 VCT</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        2. INTEREST: INTERACTIVE SIMULATOR SECTION
      */}
      <section id="simulator" className="relative z-10 w-full py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-gold text-xs font-mono font-semibold uppercase tracking-widest block mb-2">
            Demand-Based Pricing Architecture
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-text-primary drop-shadow-lg">
            Watch Prices React to Scarcity
          </h2>
          <p className="text-text-secondary text-base max-w-xl mx-auto mt-3 drop-shadow">
            When pirates flood Sabaody, Rayleigh's Haki session prices surge automatically. Adjust the sliders below to test the pricing engine.
          </p>
        </div>

        <InteractiveDemandSimulator />
      </section>

      {/* 
        3. DESIRE: GAPLESS BENTO GRID SECTION
      */}
      <section className="relative z-10 w-full py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-ember text-xs font-mono font-semibold uppercase tracking-widest block mb-2">
            The Grand Line Protocol
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-text-primary drop-shadow-lg">
            Built for Pirate Masters & Apprentices
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 grid-flow-dense">
          
          {/* Card 1: Large Span */}
          <div className="md:col-span-2 bg-hull/80 backdrop-blur-xl border border-line/80 rounded-2xl p-8 flex flex-col justify-between hover:border-gold/60 transition-colors shadow-e2">
            <div>
              <div className="text-3xl mb-4">📜</div>
              <h3 className="font-display text-2xl text-text-primary mb-2">Vivre Card Escrow Guarantee</h3>
              <p className="text-text-secondary text-base leading-relaxed">
                Tokens are held safely in Marine HQ Escrow when you request a session. Payment is only released to the master when the lesson is confirmed complete. If declined, your Vivre Card Tokens are refunded 100%.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-line/50 flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Escrow Lock: Instant</span>
              <span className="text-foam font-bold">100% Refundable</span>
            </div>
          </div>

          {/* Card 2: Bounty Surge */}
          <div className="bg-hull/80 backdrop-blur-xl border border-line/80 rounded-2xl p-8 flex flex-col justify-between hover:border-ember/60 transition-colors shadow-e2">
            <div>
              <div className="text-3xl mb-4">🔥</div>
              <h3 className="font-display text-2xl text-text-primary mb-2">Bounty Price Surge</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                As request volume spikes for rare skills like Conqueror's Haki, the multiplier updates dynamically from 0.7× to 3.0×.
              </p>
            </div>
            <div className="mt-6 font-mono text-xl font-bold text-ember">
              ▲ Up to 3.0× Surge
            </div>
          </div>

          {/* Card 3: Starting Grant */}
          <div className="bg-hull/80 backdrop-blur-xl border border-line/80 rounded-2xl p-8 flex flex-col justify-between hover:border-gold/60 transition-colors shadow-e2">
            <div>
              <div className="text-3xl mb-4">💰</div>
              <h3 className="font-display text-2xl text-text-primary mb-2">500 VCT Welcome Grant</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Every newly enlisted pirate receives a 500 Vivre Card Token grant instantly upon creating an account.
              </p>
            </div>
            <div className="mt-6 font-mono text-xl font-bold text-gold">
              🃏 500 VCT Bonus
            </div>
          </div>

          {/* Card 4: Master Tier Progression */}
          <div className="md:col-span-2 bg-hull/80 backdrop-blur-xl border border-line/80 rounded-2xl p-8 flex flex-col justify-between hover:border-gold/60 transition-colors shadow-e2">
            <div>
              <div className="text-3xl mb-4">👑</div>
              <h3 className="font-display text-2xl text-text-primary mb-2">Rookie to Yonko Legend Tiers</h3>
              <p className="text-text-secondary text-base leading-relaxed">
                Earn ratings from 1 to 5 Berries. As your session count and rating rise, progress from Rookie to Supernova, Warlord, and Yonko-level Legend. Higher tiers unlock higher base pricing freedom.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-deep border border-line text-text-muted">Rookie</span>
              <span className="px-3 py-1 rounded-full bg-deep border border-line text-tide">Supernova</span>
              <span className="px-3 py-1 rounded-full bg-deep border border-line text-ember">Warlord</span>
              <span className="px-3 py-1 rounded-full bg-deep border border-gold/50 text-gold font-bold">Yonko Legend</span>
            </div>
          </div>

        </div>
      </section>

      {/* 
        4. ACTION (AUTH & FOOTER) SECTION
      */}
      <section ref={authRef} className="relative z-10 w-full py-24 px-4 sm:px-6">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <span className="text-gold text-xs font-mono font-semibold uppercase tracking-widest">
              Ready to Sail?
            </span>
            <h2 className="font-display text-4xl sm:text-6xl text-text-primary leading-tight drop-shadow-lg">
              Earn Vivre Cards.<br />
              <span className="text-gold">Prove Your Worth.</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed drop-shadow">
              Create your profile today, receive 500 Vivre Card Tokens, and start trading mastery on the Grand Line.
            </p>

            <div className="p-4 rounded-xl bg-hull/80 backdrop-blur-xl border border-line flex items-center gap-4 shadow-e1">
              <div className="text-2xl">⚓</div>
              <div className="text-xs text-text-secondary">
                <span className="font-bold text-text-primary block text-sm">Protected by Marine HQ Escrow</span>
                Zero financial risk. Internal token economy only.
              </div>
            </div>
          </div>

          {/* Auth Form Card */}
          <div className="relative w-full max-w-md mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-b from-gold/30 to-ember/20 rounded-2xl blur-xl opacity-60 z-0" />
            
            <div className="relative w-full bg-hull/90 backdrop-blur-2xl border border-line rounded-2xl shadow-e2 p-8 z-10">
              <div className="flex gap-2 mb-6 bg-deep/80 rounded-xl p-1 border border-line/60">
                {['login', 'register'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                      tab === t 
                        ? 'bg-gold text-abyss shadow-md' 
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {t === 'login' ? '⚓ Login' : '🏴‍☠️ Enlist'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {tab === 'register' && (
                  <div className="flex flex-col gap-4">
                    <input 
                      className="input" 
                      placeholder="Pirate Name (e.g. Silvers Rayleigh)" 
                      value={form.name} 
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                      required 
                    />
                    <input 
                      className="input" 
                      placeholder="Crew / Ship (e.g. Straw Hat Pirates)" 
                      value={form.crew} 
                      onChange={e => setForm(f => ({ ...f, crew: e.target.value }))} 
                    />
                  </div>
                )}
                <input 
                  className="input" 
                  type="email" 
                  placeholder="Email Address" 
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                  required 
                />
                <input 
                  className="input" 
                  type="password" 
                  placeholder="Password" 
                  value={form.password} 
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                  required 
                />

                {error && (
                  <div className="text-crimson text-xs bg-crimson/10 p-3 rounded-lg border border-crimson/20">
                    ⚠️ {error}
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full mt-2 h-12 text-sm font-bold shadow-glow-gold">
                  {tab === 'login' ? 'Proceed to Sabaody Market' : 'Claim 500 VCT & Enlist'}
                </Button>
              </form>

              {tab === 'register' && (
                <p className="mt-4 text-center text-text-muted text-xs">
                  Bonus: <strong className="text-gold font-mono">500 VCT</strong> added to your Treasure Chest immediately.
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      <style>{`
        .input {
          background: rgba(13, 21, 38, 0.8);
          border: 1px solid var(--color-line);
          border-radius: 8px;
          color: var(--color-text-primary);
          padding: 12px 16px;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: all 200ms ease;
        }
        .input:focus { 
          border-color: var(--color-gold); 
          box-shadow: 0 0 0 1px var(--color-gold); 
        }
        .input::placeholder { color: var(--color-text-muted); }
      `}</style>
    </main>
  );
}