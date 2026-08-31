import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Keyboard, Plus, Move } from 'lucide-react';

export const CanvasControls = ({
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenShortcuts,
  onOpenNewNode,
}) => {
  return (
    <div
      className="fixed bottom-5 left-5 z-40 bg-white-pure/95 backdrop-blur-md border border-grey-strong rounded-2xl p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center gap-1.5 select-none font-mono text-xs"
      aria-label="Canvas zoom and view controls"
    >
      <button
        onClick={onZoomOut}
        className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg"
        aria-label="Zoom out (-)"
        title="Zoom Out (-)"
      >
        <span className="text-sm leading-none font-bold">−</span>
      </button>

      <button
        onClick={onResetZoom}
        className="btn-contemplative !h-7 !px-2 rounded-lg font-semibold text-[11px]"
        aria-label="Reset zoom to 100%"
        title="Reset View (0)"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        onClick={onZoomIn}
        className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg"
        aria-label="Zoom in (+)"
        title="Zoom In (+)"
      >
        <span className="text-sm leading-none font-bold">+</span>
      </button>

      <div className="w-[1px] h-4 bg-grey-medium mx-0.5" />

      <button
        onClick={onOpenShortcuts}
        className="btn-contemplative !h-7 !px-2.5 rounded-lg text-[11px] flex items-center gap-1.5 font-medium"
        aria-label="Show shortcuts and trackpad guide"
        title="Shortcuts (?)"
      >
        <Keyboard className="w-3.5 h-3.5 text-text-secondary" />
        <span>Shortcuts</span>
      </button>
    </div>
  );
};
