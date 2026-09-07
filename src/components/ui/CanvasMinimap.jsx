import React, { useMemo, useRef, useCallback } from 'react';
import { Focus, MapPin, X, Minus, Maximize2 } from 'lucide-react';

export const CanvasMinimap = ({
  nodes = [],
  pan = { x: 0, y: 0 },
  zoom = 1,
  onPanChange,
  onFitView,
  isOpen = true,
  onToggle,
}) => {
  const mapRef = useRef(null);
  const MAP_WIDTH = 190;
  const MAP_HEIGHT = 120;

  // Compute world bounding box that encapsulates all nodes AND the current camera viewport
  const minimapBounds = useMemo(() => {
    const visibleNodes = nodes.filter((n) => !n.hidden);
    if (visibleNodes.length === 0) return null;

    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080;

    // Viewport bounds in world coordinates
    const viewWorldLeft = -pan.x / zoom;
    const viewWorldTop = -pan.y / zoom;
    const viewWorldRight = (-pan.x + screenW) / zoom;
    const viewWorldBottom = (-pan.y + screenH) / zoom;

    let minX = viewWorldLeft;
    let minY = viewWorldTop;
    let maxX = viewWorldRight;
    let maxY = viewWorldBottom;

    visibleNodes.forEach((node) => {
      const nx = node.position?.x ?? 0;
      const ny = node.position?.y ?? 0;
      const nw = node.width || 280;
      const nh = node.height || 220;

      if (nx < minX) minX = nx;
      if (ny < minY) minY = ny;
      if (nx + nw > maxX) maxX = nx + nw;
      if (ny + nh > maxY) maxY = ny + nh;
    });

    // Add margin
    const margin = 200;
    minX -= margin;
    minY -= margin;
    maxX += margin;
    maxY += margin;

    const worldW = maxX - minX;
    const worldH = maxY - minY;

    // Scale to fit MAP_WIDTH x MAP_HEIGHT
    const scale = Math.min(MAP_WIDTH / worldW, MAP_HEIGHT / worldH);

    return {
      minX,
      minY,
      worldW,
      worldH,
      scale,
      viewWorldLeft,
      viewWorldTop,
      viewWorldRight,
      viewWorldBottom,
      screenW,
      screenH,
    };
  }, [nodes, pan, zoom]);

  // Click on minimap to jump canvas camera
  const handleMinimapPointerDown = useCallback(
    (e) => {
      if (!minimapBounds || !mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert minimap pixel coordinate to world coordinate
      const targetWorldX = minimapBounds.minX + clickX / minimapBounds.scale;
      const targetWorldY = minimapBounds.minY + clickY / minimapBounds.scale;

      // Pan canvas so targetWorld is at screen center
      const newPanX = minimapBounds.screenW / 2 - targetWorldX * zoom;
      const newPanY = minimapBounds.screenH / 2 - targetWorldY * zoom;

      onPanChange?.({ x: Math.round(newPanX), y: Math.round(newPanY) });
    },
    [minimapBounds, zoom, onPanChange]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-20 right-5 z-40 bg-white border border-[#C5C2BC] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.16)] p-2 select-none font-sans text-xs flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200"
      style={{ width: `${MAP_WIDTH + 16}px` }}
      aria-label="Canvas Minimap"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-1 border-b border-grey-medium px-1">
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-text-muted uppercase tracking-wider">
          <MapPin className="w-3 h-3 text-text-secondary" />
          <span>Spatial Radar</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onFitView}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-grey-soft transition-colors cursor-pointer"
            title="Fit All Nodes in View (F)"
            aria-label="Fit View"
          >
            <Focus className="w-3 h-3" />
          </button>
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-grey-soft transition-colors cursor-pointer"
              title="Close Minimap"
              aria-label="Close Minimap"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Minimap Viewport Canvas Area */}
      <div
        ref={mapRef}
        onPointerDown={handleMinimapPointerDown}
        className="relative bg-[#F5F4F2] border border-grey-medium rounded-xl overflow-hidden cursor-crosshair shadow-inner"
        style={{ width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` }}
      >
        {minimapBounds && (
          <>
            {/* Render Mini Node Rectangles */}
            {nodes
              .filter((n) => !n.hidden)
              .map((node) => {
                const nx = node.position?.x ?? 0;
                const ny = node.position?.y ?? 0;
                const nw = node.width || 280;
                const nh = node.height || 220;

                const left = (nx - minimapBounds.minX) * minimapBounds.scale;
                const top = (ny - minimapBounds.minY) * minimapBounds.scale;
                const width = Math.max(nw * minimapBounds.scale, 4);
                const height = Math.max(nh * minimapBounds.scale, 3);

                return (
                  <div
                    key={node.id}
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                    }}
                    className="absolute bg-[#4A4540] rounded-[2px] shadow-3xs border border-[#2B2724]/40"
                    title={node.data?.title || node.id}
                  />
                );
              })}

            {/* Current Camera Viewport Rectangle */}
            {(() => {
              const vLeft =
                (minimapBounds.viewWorldLeft - minimapBounds.minX) *
                minimapBounds.scale;
              const vTop =
                (minimapBounds.viewWorldTop - minimapBounds.minY) *
                minimapBounds.scale;
              const vWidth =
                (minimapBounds.viewWorldRight - minimapBounds.viewWorldLeft) *
                minimapBounds.scale;
              const vHeight =
                (minimapBounds.viewWorldBottom - minimapBounds.viewWorldTop) *
                minimapBounds.scale;

              return (
                <div
                  style={{
                    left: `${vLeft}px`,
                    top: `${vTop}px`,
                    width: `${vWidth}px`,
                    height: `${vHeight}px`,
                  }}
                  className="absolute border-2 border-red-500 bg-red-500/15 pointer-events-none rounded-[3px] shadow-xs"
                />
              );
            })()}
          </>
        )}
      </div>

      {/* Footer controls hint */}
      <div className="flex items-center justify-between text-[9.5px] font-mono text-text-muted px-1">
        <span>Click map to pan</span>
        <button
          type="button"
          onClick={onFitView}
          className="text-text-primary font-semibold hover:underline cursor-pointer"
        >
          Center (F)
        </button>
      </div>
    </div>
  );
};
