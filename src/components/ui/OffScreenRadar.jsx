import React, { useMemo } from 'react';
import { Navigation } from 'lucide-react';

export const OffScreenRadar = ({ nodes = [], pan = { x: 0, y: 0 }, zoom = 1, onFitView }) => {
  const radarData = useMemo(() => {
    if (!nodes || nodes.length === 0) return null;

    const visibleNodes = nodes.filter((n) => !n.hidden);
    if (visibleNodes.length === 0) return null;

    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080;

    let visibleCount = 0;
    let sumX = 0;
    let sumY = 0;

    visibleNodes.forEach((node) => {
      const w = node.width || 280;
      const h = node.height || 220;
      const nx = node.position?.x ?? 0;
      const ny = node.position?.y ?? 0;

      const screenX = nx * zoom + pan.x;
      const screenY = ny * zoom + pan.y;
      const screenR = screenX + w * zoom;
      const screenB = screenY + h * zoom;

      const isVisible =
        screenR > 40 &&
        screenX < screenW - 40 &&
        screenB > 60 &&
        screenY < screenH - 60;

      if (isVisible) {
        visibleCount++;
      }

      sumX += nx + w / 2;
      sumY += ny + h / 2;
    });

    // If at least one node is currently visible on screen, no need to show the lost radar
    if (visibleCount > 0) return null;

    // All nodes are off-screen! Calculate direction vector to center of nodes
    const avgX = sumX / visibleNodes.length;
    const avgY = sumY / visibleNodes.length;

    const clusterScreenX = avgX * zoom + pan.x;
    const clusterScreenY = avgY * zoom + pan.y;

    const cx = screenW / 2;
    const cy = screenH / 2;

    const dx = clusterScreenX - cx;
    const dy = clusterScreenY - cy;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    // Project onto screen rectangle bounds
    const marginX = 110;
    const marginY = 90;
    const rx = screenW / 2 - marginX;
    const ry = screenH / 2 - marginY;

    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const scale = Math.min(
      rx / (Math.abs(cos) || 0.0001),
      ry / (Math.abs(sin) || 0.0001)
    );

    const pillX = Math.round(cx + cos * scale);
    const pillY = Math.round(cy + sin * scale);

    return {
      totalNodes: visibleNodes.length,
      pillX,
      pillY,
      angleDeg,
    };
  }, [nodes, pan, zoom]);

  if (!radarData) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFitView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFitView?.();
        }
      }}
      style={{
        left: `${radarData.pillX}px`,
        top: `${radarData.pillY}px`,
        transform: 'translate(-50%, -50%)',
      }}
      className="fixed z-50 cursor-pointer pointer-events-auto bg-white border-2 border-text-primary rounded-full px-3.5 py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.25)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 text-text-primary select-none group animate-in fade-in zoom-in-90"
      title="All nodes are off-screen! Click or press 'F' to center canvas view"
      aria-label="Nodes off-screen. Click to center view."
    >
      <div
        className="w-5 h-5 rounded-full bg-text-primary text-white flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 shadow-xs"
        style={{ transform: `rotate(${radarData.angleDeg}deg)` }}
      >
        <Navigation className="w-3 h-3 fill-current" />
      </div>

      <div className="flex items-center gap-1.5 font-sans">
        <span className="font-mono text-[11.5px] font-bold text-text-primary tracking-tight">
          {radarData.totalNodes} {radarData.totalNodes === 1 ? 'Node' : 'Nodes'} Off-Screen
        </span>
        <span className="font-mono text-[9.5px] font-semibold bg-grey-soft text-text-secondary border border-grey-medium px-1.5 py-0.5 rounded-md shadow-3xs">
          Center View (F)
        </span>
      </div>
    </div>
  );
};
