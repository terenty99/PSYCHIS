import React, { useState } from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { Globe, Lock, ExternalLink, ArrowUpRight } from 'lucide-react';

export const WebsiteNode = ({
  node,
  isSelected,
  isDragging,
  isLinkSelected = false,
  isLinkShaking = false,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onOpenBrowser,
  onInspect,
}) => {
  const [iframeFailed, setIframeFailed] = useState(false);

  let hostname = 'web signal';
  try {
    if (node.data.url) hostname = new URL(node.data.url).hostname;
  } catch (e) {
    hostname = node.data.url || 'web signal';
  }

  const handleOpenExternal = (e) => {
    e.stopPropagation();
    if (node.data.url) {
      window.open(node.data.url, '_blank', 'noopener,noreferrer');
    }
  };

  const dynamicWidth = node.data?.layout?.width || node.width || 320;
  const previewMaxHeight = node.data?.layout?.mediaMaxHeight || 135;

  return (
    <SmartGlassPanel
      nodeId={node.id}
      isSelected={isSelected}
      isDragging={isDragging}
      isLinkSelected={isLinkSelected}
      isLinkShaking={isLinkShaking}
      style={{
        left: `${node.position?.x ?? 0}px`,
        top: `${node.position?.y ?? 0}px`,
        width: `${dynamicWidth}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      ariaLabel={`Website node: ${node.data.title}`}
    >
      {/* Mini Browser Window Top Bar */}
      <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-grey-medium">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <span className="font-mono text-[9.5px] font-semibold text-text-muted bg-grey-soft border border-grey-medium px-2 py-0.5 rounded-full flex items-center gap-1 truncate min-w-0 flex-1 justify-center max-w-[180px]">
          <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
          <span className="truncate">{hostname}</span>
        </span>
        <button
          onClick={handleOpenExternal}
          className="p-1 hover:bg-grey-soft rounded text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
          title="Open in System Browser (New Tab)"
        >
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Live Site Preview Frame / Snapshot Viewport */}
      <div
        className="relative w-full aspect-video bg-white-pure rounded-xl overflow-hidden border border-grey-medium mb-2 shadow-2xs group/frame"
        style={{ maxHeight: `${previewMaxHeight}px`, minHeight: '95px' }}
      >
        {node.data?.gifSvg ? (
          <div className="w-full h-full bg-[#141210] flex items-center justify-center relative">
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full pointer-events-none select-none"
              dangerouslySetInnerHTML={{ __html: node.data.gifSvg }}
            />
            <div className="absolute top-1.5 left-1.5 font-mono text-[7px] font-bold bg-[#0F121A]/85 text-white px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>60FPS</span>
            </div>
          </div>
        ) : node.data?.gifUrl ? (
          <div className="w-full h-full bg-[#141210] flex items-center justify-center relative">
            <img
              src={node.data.gifUrl}
              alt={node.data.title || 'Kinetic simulation'}
              className="w-full h-full object-contain p-0.5 pointer-events-none select-none"
              draggable={false}
              loading="eager"
            />
            <div className="absolute top-1.5 left-1.5 font-mono text-[7px] font-bold bg-[#0F121A]/85 text-white px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>60FPS</span>
            </div>
          </div>
        ) : node.data.url && !iframeFailed ? (
          <iframe
            src={node.data.url}
            title={node.data.title}
            className="w-[300%] h-[300%] transform scale-[0.3333] origin-top-left pointer-events-none border-none select-none"
            loading="lazy"
            onError={() => setIframeFailed(true)}
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-br from-grey-soft to-white-warm text-center relative overflow-hidden">
            {node.data?.primaryPhoto?.url ? (
              <>
                <img
                  src={node.data.primaryPhoto.url}
                  alt={node.data.title || hostname}
                  className="w-full h-full object-contain object-center p-1 pointer-events-none select-none"
                  draggable={false}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </>
            ) : (
              <>
                <Globe className="w-6 h-6 text-text-muted mb-1 opacity-70" />
                <span className="font-mono text-[10px] font-semibold text-text-primary truncate max-w-[200px]">
                  {hostname}
                </span>
                <span className="font-mono text-[8px] text-text-muted mt-0.5">Live Web Artifact</span>
              </>
            )}
          </div>
        )}

        {/* Hover overlay with 1-click open */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenBrowser?.(node.data.url);
          }}
          className="absolute inset-0 bg-text-primary/0 group-hover/frame:bg-text-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover/frame:opacity-100 cursor-pointer"
          title="Open in embedded browser"
        >
          <span className="font-mono text-[10px] font-semibold bg-white-pure text-text-primary px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-grey-medium">
            <ExternalLink className="w-3 h-3" />
            <span>Open Site</span>
          </span>
        </div>
      </div>

      <h3 className="font-display text-[12.5px] font-semibold text-text-primary mb-1 leading-snug line-clamp-2">
        {node.data.title || hostname}
      </h3>

      <p className="text-[10px] text-text-secondary leading-[1.45] mb-2.5 line-clamp-2">
        {node.data.description || 'Live web signal mapped to spatial canvas.'}
      </p>

      {/* Action Bar */}
      <div className="flex gap-1.5 pt-1.5 border-t border-grey-soft">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenBrowser?.(node.data.url);
          }}
          className="btn-contemplative btn-primary-contemplative flex-1 text-[10px] !py-1 shadow-xs flex items-center justify-center gap-1"
          aria-label="Open page in embedded browser"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Open Browser</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect?.(node.id);
          }}
          className="btn-contemplative text-[10px] !py-1 px-2.5"
          aria-label="Show node details"
        >
          Details
        </button>
      </div>
    </SmartGlassPanel>
  );
};
