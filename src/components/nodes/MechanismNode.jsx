import React, { useEffect, useState } from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { MathFormula } from '../../utils/mathRenderer';
import { Activity } from 'lucide-react';

export const MechanismNode = ({
  node,
  isSelected,
  isAnticipating = false,
  isDragging,
  isLinkSelected = false,
  isLinkShaking = false,
  isAnimationPaused = false,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onInspect,
  onSpecificProbe,
  onOpenBrowser,
}) => {
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [crankState, setCrankState] = useState({ p1x: 58, p1y: 45, p2x: 102, p2y: 45, mx: 80, my: 45 });

  useEffect(() => {
    if (isAnimationPaused) return;

    let theta = 0;
    let animId;

    const animate = () => {
      theta += 0.035 * speedMultiplier;
      const r = 18;
      const p1x = 40 + r * Math.cos(theta);
      const p1y = 45 - r * Math.sin(theta);
      const p2x = 120 - r * Math.cos(theta);
      const p2y = 45 - r * Math.sin(theta);
      const mx = (p1x + p2x) / 2;
      const my = (p1y + p2y) / 2;

      setCrankState({ p1x, p1y, p2x, p2y, mx, my });
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [speedMultiplier, isAnimationPaused]);

  return (
    <SmartGlassPanel
      nodeId={node.id}
      isSelected={isSelected}
      isAnticipating={isAnticipating}
      isDragging={isDragging}
      isLinkSelected={isLinkSelected}
      isLinkShaking={isLinkShaking}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: `${node.data?.layout?.width || node.width || 300}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      ariaLabel={`Mechanism engineering node: ${node.data.title}`}
    >
      {/* Schematic Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-grey-medium">
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-text-primary">
          <span className="text-amber-500 text-xs">⚡</span>
          <span>KINEMATIC ENGINE</span>
        </div>
        <span className="font-mono text-[9px] font-semibold text-text-primary bg-grey-medium px-2 py-0.5 rounded-md">
          {node.id}
        </span>
      </div>

      {/* Prominent High-Contrast Mechanical Simulation Viewport */}
      <div
        className="min-h-[135px] max-h-[190px] h-[150px] bg-[#1E1B18] rounded-xl mb-2.5 flex flex-col items-center justify-center p-1 shadow-inner relative overflow-hidden group/sim cursor-pointer"
        role="img"
        aria-label="Animated mechanism simulation"
        onClick={(e) => {
          e.stopPropagation();
          onInspect?.(node.id);
        }}
      >
        {node.data?.gifSvg ? (
          <>
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full pointer-events-none select-none"
              dangerouslySetInnerHTML={{ __html: node.data.gifSvg }}
            />
            <div className="absolute top-1.5 left-2 font-mono text-[8px] text-white/95 uppercase tracking-wider flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>60FPS KINETIC LOOP</span>
              {isAnimationPaused && <span className="text-white/80 font-bold bg-white/20 px-1 rounded">[PAUSED]</span>}
            </div>
          </>
        ) : node.data?.gifUrl ? (
          <>
            <img
              src={node.data.gifUrl}
              alt={node.data.title || 'Kinetic Simulation'}
              className="w-full h-full object-contain p-0.5 group-hover/sim:scale-105 transition-transform duration-300 pointer-events-none select-none"
              draggable={false}
              loading="eager"
            />
            <div className="absolute top-1.5 left-2 font-mono text-[8px] text-white/95 uppercase tracking-wider flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>60FPS KINETIC LOOP</span>
              {isAnimationPaused && <span className="text-white/80 font-bold bg-white/20 px-1 rounded">[PAUSED]</span>}
            </div>
          </>
        ) : (node.data?.primaryPhoto || (Array.isArray(node.data?.photos) && node.data.photos[0])) ? (
          <>
            <img
              src={(node.data?.primaryPhoto || node.data?.photos[0]).url}
              alt={node.data.title || 'Mechanism Visual'}
              className="w-full h-full object-contain object-center p-1 group-hover/sim:scale-102 transition-transform duration-300 pointer-events-none select-none"
              draggable={false}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-1.5 left-2 font-mono text-[8px] text-white/95 uppercase tracking-wider flex items-center gap-1.5 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
              <span>PHOTO</span>
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-1.5 left-2 font-mono text-[8px] text-white/40 uppercase tracking-widest flex items-center gap-1">
              <span>SIM // 4-BAR CHEBYSHEV</span>
              {isAnimationPaused && <span className="text-white/80 font-bold bg-white/20 px-1 rounded">[PAUSED]</span>}
            </div>

            <svg className="w-full h-full" viewBox="0 0 160 60">
              {/* Ground Base Line */}
              <circle cx="40" cy="45" r="3" fill="#A8A49E" />
              <circle cx="120" cy="45" r="3" fill="#A8A49E" />
              <line x1="40" y1="45" x2="120" y2="45" stroke="#6B655A" strokeWidth="1" strokeDasharray="3 3" />

              {/* Crank Arms */}
              <line x1="40" y1="45" x2={crankState.p1x} y2={crankState.p1y} stroke="#E8E6E3" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="120" y1="45" x2={crankState.p2x} y2={crankState.p2y} stroke="#E8E6E3" strokeWidth="2.2" strokeLinecap="round" />

              {/* Coupler Bar */}
              <line x1={crankState.p1x} y1={crankState.p1y} x2={crankState.p2x} y2={crankState.p2y} stroke="#D8D6D2" strokeWidth="2.8" strokeLinecap="round" />

              {/* Straight-line tracing coupler point */}
              <circle cx={crankState.mx} cy={crankState.my} r="3.5" fill="#FFFFFF" />

              {/* Guide Line */}
              <line x1="44" y1="18" x2="116" y2="18" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeDasharray="2 2" />
            </svg>

            {/* Speed Controls */}
            <div className="absolute bottom-1 right-2 flex gap-1 font-mono text-[8px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSpeedMultiplier((s) => (s === 1 ? 2 : 1));
                }}
                className="bg-white/10 hover:bg-white/20 text-white/80 px-2 py-0.5 rounded transition-all active:scale-95 cursor-pointer"
              >
                {speedMultiplier}x speed
              </button>
            </div>
          </>
        )}
      </div>

      <h3 className="font-display text-[13.5px] font-medium text-text-primary mb-1 leading-snug">
        {node.data.title || 'Chebyshev Straight-Line Linkage'}
      </h3>

      <div className="bg-white-warm border border-grey-medium rounded-xl p-2 text-center mb-2.5 shadow-xs">
        <MathFormula math={node.data.formula || 'F = \\frac{\\mu_0 \\cdot I_1 \\cdot I_2 \\cdot L}{2\\pi d}'} />
      </div>

      {/* Clickable AI Probe Questions */}
      {Array.isArray(node.data?.targetedInquiries) && node.data.targetedInquiries.length > 0 && (
        <div className="mb-2 flex flex-col gap-1.5">
          {node.data.targetedInquiries.slice(0, 2).map((inquiry, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSpecificProbe?.(inquiry, node.id);
              }}
              className="w-full text-left px-3 py-1.5 rounded-xl bg-[#FBFBFA] hover:bg-white border border-[#E5E3DF] hover:border-grey-strong text-[#5C5650] hover:text-[#2B2724] font-mono text-[10px] transition-all duration-150 active:scale-[0.98] shadow-3xs cursor-pointer flex items-center gap-1.5"
              title={`Investigate: "${inquiry}"`}
            >
              <span className="text-[#8F8A83] shrink-0 leading-none">→</span>
              <span className="truncate leading-tight">{inquiry}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center font-mono text-[8px] pt-1.5 border-t border-grey-soft mt-auto">
        <span className="text-text-muted truncate max-w-[140px]">
          {node.data?.source || node.data?.category || 'KINEMATICS // LAB'}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenBrowser?.(node.data?.url || node.data?.sourceUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(node.data?.title || 'Kinematics')}`);
            }}
            className="text-[#645e57] hover:text-[#2B2724] font-medium hover:underline cursor-pointer flex items-center gap-0.5 transition-colors"
            title="Open source in built-in browser"
          >
            <span>🌐</span> browser
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect?.(node.id);
            }}
            className="text-text-primary font-semibold hover:underline cursor-pointer"
          >
            view +
          </button>
        </div>
      </div>

    </SmartGlassPanel>
  );
};
