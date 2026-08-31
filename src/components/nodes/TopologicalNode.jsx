import React from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { MathFormula } from '../../utils/mathRenderer';
import { Compass } from 'lucide-react';

export const TopologicalNode = ({
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
        width: `${node.width || 250}px`,
      }}
      onPointerDown={onPointerDown}
      onClick={onClick}
      ariaLabel={`Topological theorem node: ${node.data.title}`}
    >
      {/* Proof Leaf Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-grey-medium">
        <span className="font-mono text-[9.5px] font-semibold text-text-primary flex items-center gap-1.5">
          <span className="text-indigo-500 text-xs">📐</span>
          <span>TOPOLOGICAL PROOF</span>
        </span>
        <span className="font-mono text-[9px] font-medium text-text-muted bg-grey-soft border border-grey-medium px-2 py-0.5 rounded">
          0x03
        </span>
      </div>

      <h3 className="font-display text-[13px] font-medium text-text-primary mb-1 leading-snug">
        Coupler Curve Curvature
      </h3>

      <p className="text-[10.5px] text-text-secondary leading-[1.5] mb-2">
        Euler-Savary inflection circle formulation for planar guidance.
      </p>

      {/* KaTeX Formula Box in Parchment Styling */}
      <div className="bg-white-warm border border-grey-medium rounded-xl p-2.5 text-center mb-2 shadow-xs overflow-x-auto">
        <MathFormula
          math={node.data.formula || '\\left(\\frac{1}{r}-\\frac{1}{r_0}\\right)\\sin(\\psi)=\\frac{1}{R}'}
        />
      </div>

      <div className="flex items-center justify-between font-mono text-[9px] text-text-muted pt-1 border-t border-grey-soft">
        <span>Inflection R = 1.414a</span>
        <span className="text-text-secondary font-medium">3rd-order vanish</span>
      </div>
    </SmartGlassPanel>
  );
};
