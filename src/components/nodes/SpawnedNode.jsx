import React from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { Sparkles, ArrowRight } from 'lucide-react';
import { MathFormula } from '../../utils/mathRenderer';

export const SpawnedNode = ({
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
      ariaLabel={`Spawned discovery node: ${node.data.title}`}
    >
      {/* Luminous AI Beacon Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-grey-medium">
        <span className="font-mono text-[10px] font-semibold text-text-primary flex items-center gap-1.5">
          <span className="text-amber-500 text-xs">✦</span>
          <span>AI DISCOVERY</span>
        </span>
        <span className="font-mono text-[8.5px] font-semibold text-text-primary bg-grey-soft border border-grey-medium px-2 py-0.5 rounded-md">
          CRAWLED 2026
        </span>
      </div>

      <h3 className="font-display text-[13.5px] font-medium text-text-primary mb-1 leading-snug">
        Cryogenic Flexure Stability
      </h3>

      <p className="text-[10.5px] text-text-secondary leading-[1.55] mb-2.5">
        Sub-micron excursion maintained to 4.2 K with zero stick-slip hysteresis on beryllium-copper flexures.
      </p>

      {node.data.formula && (
        <div className="bg-white-warm border border-grey-medium rounded-xl p-2 text-center mb-2.5 shadow-xs">
          <MathFormula math={node.data.formula} />
        </div>
      )}

      {/* Citation and Inspect Link */}
      <div className="flex justify-between items-center font-mono text-[9px] pt-1.5 border-t border-grey-soft">
        <span className="text-text-muted">IEEE Trans. Robotics</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect?.(node.id);
          }}
          className="text-text-primary font-semibold hover:underline"
        >
          view +
        </button>
      </div>
    </SmartGlassPanel>
  );
};
