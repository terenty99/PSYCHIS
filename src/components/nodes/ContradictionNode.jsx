import React from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { MathFormula } from '../../utils/mathRenderer';
import { AlertOctagon, CheckCircle2, XCircle } from 'lucide-react';

export const ContradictionNode = ({
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
      variant="contradiction"
      style={{
        left: `${node.position?.x ?? 0}px`,
        top: `${node.position?.y ?? 0}px`,
        width: `${node.data?.layout?.width || node.width || 320}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      ariaLabel={`Contradiction and refutation node: ${node.data.title}`}
    >
      {/* Contrast / Dialectical Perspective Header */}
      <div className="bg-[#2B2724] text-white-pure rounded-xl p-2 px-2.5 mb-2.5 flex items-center justify-between gap-2 shadow-xs flex-wrap">
        <div className="flex items-center gap-1.5 font-mono text-[9.5px] font-semibold tracking-wider text-[#FAF9F7] uppercase min-w-0 flex-1">
          <span className="text-amber-400 text-xs shrink-0">✦</span>
          <span className="truncate">{node.data.relationshipLabel || node.data.category || 'CONTRAST / DIVERGENCE'}</span>
        </div>
        <span className="font-mono text-[8px] bg-white/15 text-white/90 px-2 py-0.5 rounded font-medium uppercase shrink-0 whitespace-nowrap">
          {node.data.status || 'PERSPECTIVE'}
        </span>
      </div>

      <h3 className="font-display text-[13.5px] font-medium text-text-primary mb-1.5 leading-snug">
        {node.data.title || 'Phase Transition Impedance Drop'}
      </h3>

      {/* 60FPS Kinetic Simulation Viewport if assigned */}
      {(node.data?.gifSvg || node.data?.gifUrl) && (
        <div
          className="h-[135px] bg-[#1E1B18] rounded-xl mb-2 flex flex-col items-center justify-center p-1 shadow-inner relative overflow-hidden group/sim cursor-pointer"
          onClick={(e) => {
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
              alt={node.data.title || 'Contradiction Kinetic Simulation'}
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
      )}

      {/* Description / Summary */}
      <p className="text-[10.5px] text-text-secondary leading-[1.55] mb-2.5">
        {node.data.description || 'Dialectical counter-thesis and anomalous boundary condition.'}
      </p>

      {/* Claim vs Reality Comparison Card (If claims provided) */}
      {(node.data.thesis || node.data.counterClaim) && (
        <div className="bg-white-warm border border-grey-medium rounded-xl p-2.5 mb-2.5 space-y-1.5 shadow-xs font-mono text-[10px]">
          <div className="flex items-center gap-1.5 text-red-600">
            <span className="font-bold text-xs">✕</span>
            <span className="line-through text-text-muted">{node.data.thesis || node.data.counterClaim}</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-600 font-semibold">
            <span className="font-bold text-xs">✓</span>
            <span>{node.data.antithesis || node.data.resolution || 'Observed Empirical Refutation'}</span>
          </div>
        </div>
      )}

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

      {/* Result / Formula Box */}
      {node.data.conclusionFormula ? (
        <div className="p-2.5 bg-grey-soft border border-grey-strong rounded-xl text-[10.5px] text-text-primary font-mono leading-relaxed text-center">
          <b>Empirical Invariant:</b>
          <div className="mt-1">
            <MathFormula math={node.data.conclusionFormula} />
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center font-mono text-[9px] pt-1.5 border-t border-grey-soft">
          <span className="text-text-muted truncate max-w-[180px]">
            {node.data.source || 'Refutation Analysis'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspect?.(node.id);
            }}
            className="text-text-primary font-semibold hover:underline cursor-pointer shrink-0"
          >
            view +
          </button>
        </div>
      )}
    </SmartGlassPanel>
  );
};
