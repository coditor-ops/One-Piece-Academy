import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export function MarketHero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const canvasRef = useRef(null);
  const uiRef = useRef(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    
    // Setup for 128 frames (021 to 148)
    const frameCount = 128;
    const currentFrame = (index) => `/video_frames/ezgif-frame-${(index + 21).toString().padStart(3, '0')}.png`;

    const images = [];
    const airpods = { frame: 0 };
    
    canvas.width = 1920;
    canvas.height = 1080;

    function render() {
      const img = images[Math.round(airpods.frame)];
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

    // 1. Scrub through the image sequence tied to the ENTIRE page scroll
    gsap.to(airpods, {
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

    // 2. Animate the massive text moving left and fading early in the scroll
    gsap.to(textRef.current, {
      x: -150,
      opacity: 0,
      scale: 0.9,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: '500px top',
        scrub: true,
      }
    });

    // 3. Parallax the canvas slowly (removed filter as it can cause gray artifacts on some browsers)
    gsap.to(canvas, {
      scale: 1.15,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      }
    });

    // 4. UI elements fade out quicker
    gsap.to(uiRef.current, {
      y: -30,
      opacity: 0,
      ease: 'power1.in',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: '300px top',
        scrub: true,
      }
    });

  }, { scope: containerRef });

  return (
    <>
      {/* Fullscreen Fixed Canvas Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0A0A0C]">
        <canvas 
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
        {/* Subtle dark overlay to ensure page content is readable over the video */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div 
        ref={containerRef} 
        className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center mb-12"
      >
        {/* Massive Overlapping Typography */}
        <div 
          ref={textRef}
          className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-20 pointer-events-none mix-blend-difference"
        >
          <h1 className="font-display text-[12vw] leading-[0.8] tracking-tighter text-[#F9FAFB] uppercase m-0 flex flex-col">
            <span>Master</span>
            <span className="ml-8 md:ml-16">The</span>
            <span>Haki</span>
          </h1>
        </div>

        {/* UI Elements / CTAs */}
        <div 
          ref={uiRef}
          className="absolute bottom-8 left-6 right-6 md:left-12 md:right-12 z-30 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* VCT Pill */}
          <div className="bg-[#18181B]/80 backdrop-blur-md border border-line/50 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-xl">
            <div className="w-3 h-3 rounded-full bg-[#E11D48] animate-pulse" />
            <span className="text-text-secondary text-xs font-bold tracking-widest uppercase">
              Your VCT: <span className="text-[#F9FAFB] font-mono">{user?.balance?.toLocaleString() || 500}</span>
            </span>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => {
              const el = document.getElementById('skills-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative overflow-hidden bg-transparent border-2 border-[#D4AF37]/50 rounded-lg px-8 py-4 flex flex-col items-center justify-center transition-all hover:border-[#D4AF37] pointer-events-auto"
          >
            <div className="absolute inset-0 bg-[#D4AF37]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 text-[#D4AF37] text-sm font-black tracking-widest uppercase mb-1">
              Explore Skills
            </span>
            <span className="relative z-10 text-[#D4AF37]/60 text-[10px] tracking-[0.2em] uppercase font-mono">
              Hone Your Haki
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
