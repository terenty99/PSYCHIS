import React from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { MathFormula } from '../../utils/mathRenderer';
import { AlertOctagon, CheckCircle2, XCircle } from 'lucide-react';

export const ContradictionNode = ({
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
      variant="contradiction"
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: `${node.width || 280}px`,
      }}
      onPointerDown={onPointerDown}
      onClick={onClick}
      ariaLabel={`Contradiction and refutation node: ${node.data.title}`}
    >
      {/* Refutation Banner Header */}
      <div className="bg-[#2B2724] text-white-pure rounded-xl p-2 px-2.5 mb-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 font-mono text-[9.5px] font-semibold tracking-wider text-[#FAF9F7]">
          <span className="text-amber-400 text-xs">⚠️</span>
          <span>COUNTER-THESIS</span>
        </div>
        <span className="font-mono text-[8.5px] bg-white/15 text-white/85 px-2 py-0.5 rounded font-medium">
          REFUTATION
        </span>
      </div>

      <h3 className="font-display text-[13.5px] font-medium text-text-primary mb-1.5 leading-snug">
        Phase Transition Impedance Drop
      </h3>

      {/* Claim vs Reality Comparison Card */}
      <div className="bg-white-warm border border-grey-medium rounded-xl p-2.5 mb-2.5 space-y-1.5 shadow-xs font-mono text-[10px]">
        <div className="flex items-center gap-1.5 text-red-600">
          <span className="font-bold text-xs">✕</span>
          <span className="line-through text-text-muted">Ambient Superconductivity</span>
        </div>
        <div className="flex items-center gap-1.5 text-indigo-600 font-semibold">
          <span className="font-bold text-xs">✓</span>
          <span>Cu₂S 1st-Order Phase Transition</span>
        </div>
      </div>

      {/* Ground State Result Box */}
      <div className="p-2.5 bg-grey-soft border border-grey-strong rounded-xl text-[10.5px] text-text-primary font-mono leading-relaxed text-center">
        <b>Insulating Ground State:</b>
        <div className="mt-1">
          <MathFormula math={node.data.conclusionFormula || '\\rho > 10^8\\,\\Omega{\\cdot}\\text{cm}'} />
        </div>
      </div>
    </SmartGlassPanel>
  );
};
