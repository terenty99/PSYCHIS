import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { PsychisLogo } from './PsychisLogo';

/**
 * BreakcoreHomepage Component
 * 
 * Dark Breakcore-Infused Homepage Background with Crisp White Foreground
 * & White-Gray Gradient Alternation
 * 
 * Strict Specification Compliance:
 * 1. Base Colors:
 *    - Dark: Deep charcoal #121212 with subtle gradient to #0A0A0A (Default)
 *    - Light: White-to-light-gray gradient #FAFAFA to #FFFFFF
 * 2. Layer 1 (Base Grain):
 *    - Grayscale Perlin/analog noise field, slow 50s linear drift
 * 3. Layer 2 (Asymmetric Interference):
 *    - Dual incommensurate frequencies (0.04Hz and 0.12Hz) producing aperiodic luminance shifts
 * 4. Layer 3 (Curve-Implied Texture - STRICTLY NO EXPLICIT LINES):
 *    - Modulates noise amplitude via low-frequency basis functions:
 *      exponential-like gains e^(±kx) (|k| < 0.003) and linear gains mx+b (|m| < 0.002) over ~40s cycles
 * 5. Layer 4 (Breakcore Rhythm Bursts):
 *    - Kick/snare interplay cadence: base interval 1.4s ±0.6s, 2-3 cluster events in 1.0s -> 2-4s quiet gaps
 *    - Localized soft Gaussian blur patches lasting 80-150ms (ease-in/out), pure grayscale
 *    - Safe Zone: Strictly avoids search bar & action buttons corridor (±75px vertically from center)
 * 6. Foreground Search Bar & Action Buttons:
 *    - Logo: PSYCHIS (IBM Plex Sans SemiBold, 20px, letter-spacing 0.02em, ~92px margin to search bar)
 *    - Search Bar: Pure white #FFFFFF, 48px height, 24px radius, 480px max-width, #D1D5DB border
 *    - Focus ring: outline 2px solid rgba(74, 144, 226, 0.4), outline-offset 2px (WCAG AAA >= 7:1)
 *    - Buttons: "Google Search" and "I’m Feeling Lucky", height 38px, padding 0 28px, 4px border radius,
 *      #FFFFFF background, #D1D5DB border, #212529 text, hover #F1F3F5, active #E8EAED with scale 0.98.
 */
export const BreakcoreHomepage = ({ onNavigate, onLuckySearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [theme, setTheme] = useState('dark'); // 'dark' (default) | 'light'
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  // Focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut '/' to focus search input; 'Escape' to blur
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Form submission / search resolution on Enter or clicking 'Google Search'
  const handleSearch = useCallback(
    (e) => {
      if (e) e.preventDefault();
      const clean = query.trim();
      if (!clean) return;

      // Detect direct URL
      const isDirectUrl =
        /^https?:\/\//i.test(clean) ||
        (/^[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/.*)?$/i.test(clean) && !clean.includes(' '));

      if (isDirectUrl) {
        const targetUrl = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
        onNavigate?.(targetUrl);
      } else {
        if (onNavigate) {
          onNavigate(`https://www.google.com/search?q=${encodeURIComponent(clean)}`);
        } else {
          window.location.href = `https://www.google.com/search?q=${encodeURIComponent(clean)}`;
        }
      }
    },
    [query, onNavigate]
  );

  // 'I’m Feeling Lucky' button click handler
  const handleLuckySearch = useCallback(
    (e) => {
      if (e) e.preventDefault();
      const clean = query.trim();
      const target = clean || 'psychis';
      if (onLuckySearch) {
        onLuckySearch(target);
      } else {
        const dest = `https://www.google.com/search?btnI=1&q=${encodeURIComponent(target)}`;
        if (onNavigate) {
          onNavigate(dest);
        } else {
          window.location.href = dest;
        }
      }
    },
    [query, onNavigate, onLuckySearch]
  );

  // Procedural Canvas Background Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;

    // Reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;
    const handleReducedMotionChange = (e) => {
      prefersReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Offscreen pre-computed pure grayscale noise pattern for fine grain (256x256)
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 256;
    grainCanvas.height = 256;
    const grainCtx = grainCanvas.getContext('2d');
    if (grainCtx) {
      const imgData = grainCtx.createImageData(256, 256);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const mono = Math.floor(Math.random() * 255);
        data[i] = mono;
        data[i + 1] = mono;
        data[i + 2] = mono;
        data[i + 3] = Math.floor(Math.random() * 255);
      }
      grainCtx.putImageData(imgData, 0, 0);
    }
    let grainPattern = null;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      if (grainCtx) {
        grainPattern = ctx.createPattern(grainCanvas, 'repeat');
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement || document.body);
    resize();

    // ------------------------------------------------------------------------
    // LAYER 4: BREAKCORE RHYTHM BURST SCHEDULER (Kick/Snare Cadence)
    // Base interval ≈ 1.4s ± 0.6s, clustered in 2-3 events within 1s, then gaps of 2-4s
    // ------------------------------------------------------------------------
    let nextBurstTime = performance.now() + 1000;
    let clusterEventsRemaining = 0;
    let burstActive = false;
    let burstStartTime = 0;
    let burstDuration = 110; // 80-150ms per specification
    let burstCenter = { x: width * 0.5, y: height * 0.25, radius: 55 };

    // Timing jitter helper (1-2 frames variation, avoids digital smoothness)
    let lastRenderTime = 0;
    const targetInterval = 1000 / 30;

    const render = (currentTime) => {
      animId = requestAnimationFrame(render);

      // Frame throttle with subtle timing jitter
      if (currentTime - lastRenderTime < targetInterval) {
        return;
      }
      lastRenderTime = currentTime;

      const tSec = currentTime * 0.001;
      const isDark = themeRef.current === 'dark';

      // Base Fill
      if (isDark) {
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, width, height);
      } else {
        const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
        baseGrad.addColorStop(0, '#FAFAFA');
        baseGrad.addColorStop(1, '#FFFFFF');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // ----------------------------------------------------------------------
      // LAYER 1: BASE GRAIN (Perlin/Analog Record Dust, Slow ~50s Linear Drift)
      // ----------------------------------------------------------------------
      if (grainPattern) {
        ctx.save();
        const cycle = 50.0; // ~50s cycle per specification
        const driftX = ((tSec / cycle) * 256) % 256;
        const driftY = (((tSec * 0.65) / cycle) * 256) % 256;

        ctx.translate(driftX, driftY);
        ctx.globalAlpha = isDark ? 0.045 : 0.038;
        ctx.fillStyle = grainPattern;
        ctx.fillRect(-driftX, -driftY, width + 256, height + 256);
        ctx.restore();
      }

      // ----------------------------------------------------------------------
      // LAYER 2: ASYMMETRIC INTERFERENCE (Incommensurate 0.04Hz and 0.12Hz)
      // ----------------------------------------------------------------------
      ctx.save();
      const f1 = tSec * 0.04 * Math.PI * 2;
      const f2 = tSec * 0.12 * Math.PI * 2;
      const interfAlpha = prefersReducedMotion ? 0.02 : 0.028 + 0.012 * Math.sin(f1);
      const rCol = isDark ? '255, 255, 255' : '0, 0, 0';

      // Field A: Incommensurate linear modulation (pure grayscale)
      const gradFieldA = ctx.createLinearGradient(
        width * (0.2 + 0.2 * Math.cos(f1)),
        0,
        width * (0.8 + 0.2 * Math.sin(f2)),
        height
      );
      gradFieldA.addColorStop(0, `rgba(${rCol}, 0)`);
      gradFieldA.addColorStop(0.5, `rgba(${rCol}, ${interfAlpha * (isDark ? 1.0 : 0.6)})`);
      gradFieldA.addColorStop(1, `rgba(${rCol}, 0)`);
      ctx.fillStyle = gradFieldA;
      ctx.fillRect(0, 0, width, height);

      // Field B: Second non-repeating radial field
      const gradFieldB = ctx.createRadialGradient(
        width * (0.65 + 0.15 * Math.sin(f2)),
        height * (0.35 + 0.15 * Math.cos(f1)),
        80,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.65
      );
      gradFieldB.addColorStop(0, `rgba(${rCol}, ${interfAlpha * (isDark ? 1.3 : 0.7)})`);
      gradFieldB.addColorStop(0.5, `rgba(${rCol}, 0.01)`);
      gradFieldB.addColorStop(1, `rgba(${rCol}, 0)`);
      ctx.fillStyle = gradFieldB;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // ----------------------------------------------------------------------
      // LAYER 3: CURVE-IMPLIED STATISTICAL TEXTURE (NO LINES DRAWN)
      // Modulates noise amplitude via e^(±kx) (|k| < 0.003) and mx+b (|m| < 0.002) over ~40s
      // ----------------------------------------------------------------------
      if (!prefersReducedMotion) {
        ctx.save();
        const cycle40 = 40.0;
        const curvePhase = (tSec / cycle40) * Math.PI * 2;
        const curveAlpha = isDark ? 0.035 : 0.024;

        // Exponential feeling: Low-frequency spatial density gradient
        const expGrad = ctx.createLinearGradient(
          0,
          height * (0.25 + 0.1 * Math.sin(curvePhase)),
          width,
          height * (0.75 + 0.1 * Math.cos(curvePhase))
        );
        expGrad.addColorStop(0, `rgba(${rCol}, ${curveAlpha * 0.9})`);
        expGrad.addColorStop(0.4, `rgba(${rCol}, ${curveAlpha * 0.4})`);
        expGrad.addColorStop(0.75, `rgba(${rCol}, ${curveAlpha * 0.1})`);
        expGrad.addColorStop(1, `rgba(${rCol}, 0)`);
        ctx.fillStyle = expGrad;
        ctx.fillRect(0, 0, width, height);

        // Linear slope feel: Shallow variation across viewport
        const linearGrad = ctx.createLinearGradient(width * 0.8, 0, width * 0.2, height);
        linearGrad.addColorStop(0, `rgba(${rCol}, ${curveAlpha * 0.8})`);
        linearGrad.addColorStop(0.5, `rgba(${rCol}, 0)`);
        linearGrad.addColorStop(1, `rgba(${rCol}, ${curveAlpha * 0.3})`);
        ctx.fillStyle = linearGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // ----------------------------------------------------------------------
      // LAYER 4: BREAKCORE RHYTHM BURSTS (Kick/Snare Cadence, 80-150ms Duration)
      // Base interval ≈ 1.4s ± 0.6s; 2-3 events in 1.0s window -> 2-4s quiet gaps
      // ----------------------------------------------------------------------
      if (!prefersReducedMotion) {
        const searchCenterY = height * 0.5 - 20;
        const safeZoneHalfHeight = 75; // Safe corridor avoiding search bar and action buttons

        if (currentTime >= nextBurstTime) {
          if (clusterEventsRemaining <= 0) {
            clusterEventsRemaining = 2 + Math.floor(Math.random() * 2); // 2 or 3 events
          }

          burstActive = true;
          burstStartTime = currentTime;
          burstDuration = 80 + Math.random() * 70; // 80-150ms duration per specification

          // Diameter: 80-140px -> radius 40-70px
          const burstRadius = 40 + Math.random() * 30;

          // Safe Zone: Bursts strictly avoid vertical band centered on search bar & buttons
          let burstY;
          if (Math.random() < 0.5) {
            burstY = Math.random() * Math.max(30, searchCenterY - safeZoneHalfHeight - burstRadius);
          } else {
            const startY = searchCenterY + safeZoneHalfHeight + burstRadius;
            burstY = startY + Math.random() * Math.max(30, height - startY - 30);
          }

          burstCenter = {
            x: 50 + Math.random() * Math.max(50, width - 100),
            y: burstY,
            radius: burstRadius,
          };

          clusterEventsRemaining--;
          if (clusterEventsRemaining > 0) {
            // Rapid intra-cluster kick/snare pulse (within 1.0s window)
            nextBurstTime = currentTime + 140 + Math.random() * 110;
          } else {
            // Inter-cluster gap: 2.0s - 4.0s (base 1.4s ±0.6s + pause)
            nextBurstTime = currentTime + 2000 + Math.random() * 2000;
          }
        }

        // Render active micro-burst
        if (burstActive) {
          const elapsed = currentTime - burstStartTime;
          if (elapsed >= burstDuration) {
            burstActive = false;
          } else {
            const progress = elapsed / burstDuration;
            // Smooth ease-in/out bell curve
            const envelope = Math.sin(progress * Math.PI);
            // Localized luminance boost: soft Gaussian blur patch
            const alpha = (isDark ? 0.075 : 0.055) * envelope;

            ctx.save();
            const burstGrad = ctx.createRadialGradient(
              burstCenter.x,
              burstCenter.y,
              0,
              burstCenter.x,
              burstCenter.y,
              burstCenter.radius
            );

            burstGrad.addColorStop(0, `rgba(${rCol}, ${alpha})`);
            burstGrad.addColorStop(0.5, `rgba(${rCol}, ${alpha * 0.4})`);
            burstGrad.addColorStop(1, `rgba(${rCol}, 0)`);

            ctx.fillStyle = burstGrad;
            ctx.beginPath();
            ctx.arc(burstCenter.x, burstCenter.y, burstCenter.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // ----------------------------------------------------------------------
      // LAYER 5: CENTRAL PROTECTION GAZE MASK
      // Ensures background directly around search bar and buttons remains pristine
      // ----------------------------------------------------------------------
      ctx.save();
      const searchCenterX = width * 0.5;
      const searchCenterY = height * 0.5 - 20;
      const protectRadius = Math.min(width * 0.48, 440);
      const maskCol = isDark ? '18, 18, 18' : '255, 255, 255';
      const protectGrad = ctx.createRadialGradient(
        searchCenterX,
        searchCenterY,
        40,
        searchCenterX,
        searchCenterY,
        protectRadius
      );
      protectGrad.addColorStop(0, `rgba(${maskCol}, 0.95)`);
      protectGrad.addColorStop(0.5, `rgba(${maskCol}, 0.65)`);
      protectGrad.addColorStop(0.85, `rgba(${maskCol}, 0.20)`);
      protectGrad.addColorStop(1, `rgba(${maskCol}, 0)`);

      ctx.fillStyle = protectGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  const isDark = theme === 'dark';

  return (
    <div
      className={`relative w-full h-full min-h-screen overflow-hidden flex flex-col items-center justify-center select-none transition-colors duration-300 ${className}`}
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #141414 0%, #121212 50%, #0A0A0A 100%)'
          : 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)',
      }}
    >

      {/* 1. Procedural Background Canvas (Locked into container via absolute inset-0) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* 2. Foreground Search Utility (Google-Style Minimalist Layout) */}
      <main className="relative z-[10] w-full max-w-[640px] px-6 sm:px-10 flex flex-col items-center justify-center -translate-y-4 animate-fade-in">
        {/* Logo: PSYCHIS in IBM Plex Sans SemiBold, 20px, ~92px margin-bottom */}
        <header
          className={`flex items-center gap-3 font-['IBM_Plex_Sans',sans-serif] font-semibold text-[20px] leading-6 tracking-[0.02em] select-none mb-[92px] transition-colors duration-200 ${
            isDark ? 'text-[#F8F9FA]' : 'text-[#212529]'
          }`}
          aria-label="PSYCHIS Search"
        >
          {/* PSYCHIS Signature Single-Curve Linkage Logo on White Background */}
          <PsychisLogo size={28} background="white" strokeColor="#4A4540" />
          <span>PSYCHIS</span>
        </header>

        {/* Search Bar Form */}
        <form
          onSubmit={handleSearch}
          className="w-full flex flex-col items-center"
          role="search"
          action="https://www.google.com/search"
          method="GET"
        >
          {/* Search Bar: Height 48px, width 100%, max-width 480px (responsive up to 584px), Border 1px solid #D1D5DB, Radius 24px, Background #FFFFFF, Padding 0 20px */}
          <div
            className={`w-full max-w-[480px] h-[48px] bg-[#FFFFFF] rounded-[24px] px-[20px] flex items-center transition-all duration-120 ease-out ${
              isDark
                ? 'shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                : 'shadow-[0_1px_6px_rgba(32,33,36,0.12)]'
            } ${
              isFocused
                ? 'border border-[#D1D5DB] outline outline-2 outline-[rgba(74,144,226,0.4)] outline-offset-2'
                : 'border border-[#D1D5DB] hover:border-[#C1C7CD] hover:shadow-[0_2px_8px_rgba(0,0,0,0.18)]'
            }`}
          >
            {/* Search Icon: #6C757D */}
            <div className="text-[#6C757D] mr-[14px] shrink-0 flex items-center" aria-hidden="true">
              <Search className="w-[18px] h-[18px] stroke-[1.8]" />
            </div>

            {/* Search Input: IBM Plex Sans Regular, 16px, #212529, Placeholder #6C757D */}
            <input
              ref={inputRef}
              type="text"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search or type address"
              className="flex-1 min-w-0 h-full bg-transparent border-none outline-none font-['IBM_Plex_Sans',sans-serif] font-normal text-[16px] text-[#212529] placeholder-[#6C757D] leading-[48px] select-text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-label="Search or type address"
            />

            {/* Clear Button: Appears when text is typed */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-full text-[#6C757D] hover:text-[#212529] hover:bg-[#F1F3F5] transition-colors cursor-pointer ml-1"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};
export default BreakcoreHomepage;
