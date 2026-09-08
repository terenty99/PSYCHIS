import React from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { MathFormula } from '../../utils/mathRenderer';
import { Compass } from 'lucide-react';

export const TopologicalNode = ({
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
        width: `${node.data?.layout?.width || node.width || 270}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
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
          {node.id}
        </span>
      </div>

      <h3 className="font-display text-[13px] font-medium text-text-primary mb-1 leading-snug">
        {node.data.title || 'Coupler Curve Curvature'}
      </h3>

      {/* 60FPS Kinetic Simulation Viewport if assigned */}
      {(node.data?.gifSvg || node.data?.gifUrl) && (
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
              alt={node.data.title || 'Topological Kinetic Simulation'}
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

      <p className="text-[10.5px] text-text-secondary leading-[1.5] mb-2">
        {node.data.description || 'Euler-Savary inflection circle formulation for planar guidance.'}
      </p>

      {/* KaTeX Formula Box in Parchment Styling */}
      <div className="bg-white-warm border border-grey-medium rounded-xl p-2.5 text-center mb-2 shadow-xs overflow-x-auto">
        <MathFormula
          math={node.data.formula || '\\left(\\frac{1}{r}-\\frac{1}{r_0}\\right)\\sin(\\psi)=\\frac{1}{R}'}
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

      <div className="flex items-center justify-between font-mono text-[9px] text-text-muted pt-1 border-t border-grey-soft">
        <span>Inflection R = 1.414a</span>
        <span className="text-text-secondary font-medium">3rd-order vanish</span>
      </div>
    </SmartGlassPanel>
  );
};
