import React from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { MathFormula } from '../../utils/mathRenderer';
import { TrendingUp, BarChart2 } from 'lucide-react';

export const TransportNode = ({
  node,
  isSelected,
  isDragging,
  onPointerDown,
  onClick,
  onInspect,
}) => {
  return (
    <SmartGlassPanel
      isSelected={isSelected}
      isDragging={isDragging}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: `${node.width || 270}px`,
      }}
      onPointerDown={onPointerDown}
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
        Drude-Lorentz Conductivity
      </h3>

      {/* Mini SVG Optical Conductivity Curve Chart */}
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

      <div className="bg-grey-soft border border-grey-medium rounded-xl p-2 text-center mb-2 overflow-x-auto">
        <MathFormula
          math={
            node.data.formula ||
            '\\sigma(\\omega)=\\frac{\\sigma_0}{1+\\omega^2\\tau^2}+i\\frac{\\sigma_0\\omega\\tau}{1+\\omega^2\\tau^2}'
          }
        />
      </div>

      <div className="flex justify-between items-center font-mono text-[9.5px] pt-1.5 border-t border-grey-soft">
        <span className="text-text-muted">1D Lattice channel</span>
        <button
          onClick={(e) => {
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
