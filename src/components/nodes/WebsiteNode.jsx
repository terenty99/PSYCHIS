import React from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { Globe, Lock, ExternalLink, ArrowUpRight } from 'lucide-react';

export const WebsiteNode = ({
  node,
  isSelected,
  isDragging,
  onPointerDown,
  onClick,
  onOpenBrowser,
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
      ariaLabel={`Website repository node: ${node.data.title}`}
    >
      {/* Mini Browser Window Top Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-grey-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-grey-strong" />
          <span className="w-2 h-2 rounded-full bg-grey-medium" />
          <span className="w-2 h-2 rounded-full bg-grey-medium" />
        </div>
        <span className="font-mono text-[9.5px] font-semibold text-text-muted bg-grey-soft border border-grey-medium px-2 py-0.5 rounded-full flex items-center gap-1">
          <Lock className="w-2.5 h-2.5 text-text-secondary" /> arxiv.org
        </span>
      </div>

      {/* URL Capsule */}
      <div className="bg-white-pure border border-grey-medium rounded-xl p-2 px-2.5 mb-2 flex items-center justify-between shadow-xs">
        <span className="font-mono text-[11px] font-semibold text-text-primary truncate max-w-[180px]">
          arXiv:2307.12008
        </span>
        <span className="font-mono text-[9px] text-text-muted bg-grey-soft px-1.5 py-0.5 rounded">cs.RO</span>
      </div>

      <h3 className="font-display text-[13px] font-medium text-text-primary mb-1.5 leading-snug">
        Non-linear Kinematics of Chebyshev Four-Bar Linkages
      </h3>

      <p className="text-[11px] text-text-secondary leading-[1.55] mb-3 line-clamp-2">
        "{node.data.description || 'Topological formulation of constrained straight-line micro-manipulators in vacuum robotics.'}"
      </p>

      {/* Action Bar */}
      <div className="flex gap-2 pt-1 border-t border-grey-soft">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenBrowser?.(node.data.url);
          }}
          className="btn-contemplative btn-primary-contemplative flex-1 text-[10.5px] !py-1.5 shadow-xs"
          aria-label="Open page in embedded browser"
        >
          <ExternalLink className="w-3 h-3" /> Open Browser
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect?.(node.id);
          }}
          className="btn-contemplative text-[10.5px] !py-1.5"
          aria-label="Show node details"
        >
          Details
        </button>
      </div>
    </SmartGlassPanel>
  );
};
