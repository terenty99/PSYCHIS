import React, { useEffect, useState } from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { MathFormula } from '../../utils/mathRenderer';
import { Activity } from 'lucide-react';

export const MechanismNode = ({
  node,
  isSelected,
  isDragging,
  isAnimationPaused = false,
  onPointerDown,
  onClick,
  onInspect,
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
      isSelected={isSelected}
      isDragging={isDragging}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: `${node.width || 280}px`,
      }}
      onPointerDown={onPointerDown}
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
        className="h-[84px] bg-[#2E2A27] rounded-xl mb-2.5 flex flex-col items-center justify-center p-2 shadow-inner relative overflow-hidden"
        role="img"
        aria-label="Animated four-bar mechanism schematic"
      >
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
            className="bg-white/10 hover:bg-white/20 text-white/80 px-1.5 py-0.5 rounded transition-colors"
          >
            {speedMultiplier}x speed
          </button>
        </div>
      </div>

      <h3 className="font-display text-[13.5px] font-medium text-text-primary mb-1 leading-snug">
        Chebyshev Straight-Line Linkage
      </h3>

      <div className="bg-white-warm border border-grey-medium rounded-xl p-2 text-center mb-2.5 shadow-xs">
        <MathFormula math={node.data.formula || 'F = \\frac{\\mu_0 \\cdot I_1 \\cdot I_2 \\cdot L}{2\\pi d}'} />
      </div>

      {/* Engineering Metrics Ribbon */}
      <div className="grid grid-cols-2 gap-1.5 font-mono text-[9.5px] pt-2 border-t border-grey-soft">
        <div className="bg-grey-soft border border-grey-medium p-1.5 rounded-lg text-center">
          <span className="text-text-muted block text-[8px]">RATIO</span>
          <b className="text-text-primary">L / d = 2.50</b>
        </div>
        <div className="bg-grey-soft border border-grey-medium p-1.5 rounded-lg text-center">
          <span className="text-text-muted block text-[8px]">TOLERANCE</span>
          <b className="text-text-primary">Δx ≤ 0.042%</b>
        </div>
      </div>
    </SmartGlassPanel>
  );
};
