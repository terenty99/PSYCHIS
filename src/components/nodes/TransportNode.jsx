import React from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { MathFormula } from '../../utils/mathRenderer';
import { TrendingUp, BarChart2 } from 'lucide-react';

export const TransportNode = ({
  node,
  isSelected,
  isAnticipating = false,
  isDragging,
  isLinkSelected = false,
  isLinkShaking = false,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onInspect,
  onSpecificProbe,
}) => {
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
        width: `${node.data?.layout?.width || node.width || 280}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      ariaLabel={`Transport solid-state physics node: ${node.data.title}`}
    >
      {/* Spectral Measurement Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-grey-medium">
        <span className="font-mono text-[10px] font-semibold text-text-primary flex items-center gap-1.5">
          <span className="text-blue-500 text-xs">🪟</span>
          <span>OPTICAL TRANSPORT</span>
        </span>
        <span className="font-mono text-[8.5px] font-semibold text-[#15803D] bg-[#DCFCE7] border border-[#BBF7D0] px-2 py-0.5 rounded-full">
          99.1% conf
        </span>
      </div>

      <h3 className="font-display text-[13.5px] font-medium text-text-primary mb-1 leading-snug">
        {node.data.title || 'Drude-Lorentz Conductivity'}
      </h3>

      {/* 60FPS Kinetic Simulation Viewport if assigned */}
      {(node.data?.gifSvg || node.data?.gifUrl) ? (
        <div
          className="h-[135px] bg-[#1E1B18] rounded-xl mb-2 flex flex-col items-center justify-center p-1 shadow-inner relative overflow-hidden group/sim cursor-pointer"
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            e.stopPropagation();
            onInspect?.(node.id);
          }}
        >
          {node.data?.gifSvg ? (
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full pointer-events-none select-none"
              dangerouslySetInnerHTML={{ __html: node.data.gifSvg }}
            />
          ) : (
            <img
              src={node.data.gifUrl}
              alt={node.data.title || 'Transport Kinetic Simulation'}
              className="w-full h-full object-contain p-0.5 group-hover/sim:scale-105 transition-transform duration-300 pointer-events-none select-none"
              draggable={false}
              loading="eager"
            />
          )}
          <div className="absolute top-1.5 left-2 font-mono text-[8px] text-white/95 uppercase tracking-wider flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>60FPS KINETIC LOOP</span>
          </div>
        </div>
      ) : (
        /* Mini SVG Optical Conductivity Curve Chart */
        <div className="bg-white-warm border border-grey-medium rounded-xl p-2.5 mb-2 shadow-xs">
          <div className="flex justify-between font-mono text-[8px] text-text-muted mb-1">
            <span>σ(ω) SPECTRAL RESPONSE</span>
            <span>ωτ &gt; 1</span>
          </div>
          <svg className="w-full h-12" viewBox="0 0 200 50">
            {/* Axis Grid lines */}
            <line x1="10" y1="42" x2="190" y2="42" stroke="#E0DED9" strokeWidth="1" />
            <line x1="10" y1="5" x2="10" y2="42" stroke="#E0DED9" strokeWidth="1" />

            {/* Drude Peak Curve */}
            <path
              d="M 10 10 Q 30 12, 60 25 T 130 38 T 190 41"
              fill="none"
              stroke="#4A4540"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Suppression Threshold Marker */}
            <line x1="75" y1="10" x2="75" y2="42" stroke="#8A8782" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="75" cy="28" r="3" fill="#4A4540" />
            <text x="80" y="24" fontSize="8" fill="#6B655A" fontFamily="monospace">
              100 cm⁻¹
            </text>
          </svg>
        </div>
      )}

      <div className="bg-grey-soft border border-grey-medium rounded-xl p-2 text-center mb-2 overflow-x-auto">
        <MathFormula
          math={
            node.data.formula ||
            '\\sigma(\\omega)=\\frac{\\sigma_0}{1+\\omega^2\\tau^2}+i\\frac{\\sigma_0\\omega\\tau}{1+\\omega^2\\tau^2}'
          }
        />
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

      <div className="flex justify-between items-center font-mono text-[9.5px] pt-1.5 border-t border-grey-soft">
        <span className="text-text-muted">1D Lattice channel</span>
        <button
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            e.stopPropagation();
            onInspect?.(node.id);
          }}
          className="text-text-primary hover:underline font-semibold"
        >
          inspect proof →
        </button>
      </div>
    </SmartGlassPanel>
  );
};
