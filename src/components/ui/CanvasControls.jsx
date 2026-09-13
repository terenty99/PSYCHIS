import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Keyboard, Plus, Move, Focus, Map, Hand, BoxSelect } from 'lucide-react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

export const CanvasControls = ({
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  onToggleMinimap,
  isMinimapOpen = false,
  onOpenShortcuts,
  onOpenNewNode,
  currentWorkspace,
  workspaces,
  nodeCount,
  onSelectWorkspace,
  onNewWorkspace,
  onExportPsychis,
  onImportPsychis,
  onExportTrainingJsonl,
  onClearCanvas,
  clientAuth,
  onOpenAuthModal,
  onOpenAISettings,
  onLogout,
  toolMode = 'hand',
  onToolModeChange,
}) => {
  return (
    <div
      className="fixed bottom-6 left-5 z-40 bg-white-pure/95 backdrop-blur-xl border border-grey-medium/80 rounded-2xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] flex flex-col items-center gap-1.5 select-none font-sans text-xs"
      aria-label="Canvas zoom and view controls"
    >
      {/* Tool Switcher: Hand Mode (H) vs Selection Marquee Mode (V) */}
      <div className="flex flex-col items-center gap-0.5 bg-grey-soft/80 p-0.5 rounded-xl border border-grey-medium/60">
        <button
          type="button"
          onClick={() => onToolModeChange?.('hand')}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
            toolMode === 'hand'
              ? 'bg-text-primary text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-white-pure/80'
          }`}
          title="Hand / Pan Mode (H)"
          aria-label="Hand Mode"
        >
          <Hand className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onToolModeChange?.('select')}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
            toolMode === 'select'
              ? 'bg-text-primary text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-white-pure/80'
          }`}
          title="Select / Marquee Mode (V)"
          aria-label="Select Mode"
        >
          <BoxSelect className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-4 h-[1px] bg-grey-medium/70 my-0.5" />

      {/* Zoom In (+) */}
      <button
        onClick={onZoomIn}
        className="w-7 h-7 rounded-xl bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-primary flex items-center justify-center transition-all duration-150 active:scale-90 shadow-3xs cursor-pointer"
        aria-label="Zoom in (+)"
        title="Zoom In (+)"
      >
        <span className="text-base leading-none font-semibold">+</span>
      </button>

      {/* Reset Zoom to 100% */}
      <button
        onClick={onResetZoom}
        className="h-6 px-1 rounded-lg bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-primary font-mono font-semibold text-[10px] flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
        aria-label="Reset zoom to 100%"
        title="Reset View (0)"
      >
        {Math.round(zoom * 100)}%
      </button>

      {/* Zoom Out (-) */}
      <button
        onClick={onZoomOut}
        className="w-7 h-7 rounded-xl bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-primary flex items-center justify-center transition-all duration-150 active:scale-90 shadow-3xs cursor-pointer"
        aria-label="Zoom out (-)"
        title="Zoom Out (-)"
      >
        <span className="text-base leading-none font-semibold">−</span>
      </button>

      <div className="w-4 h-[1px] bg-grey-medium/70 my-0.5" />

      {/* Fit View / Find Nodes Action Button */}
      {onFitView && (
        <button
          type="button"
          onClick={onFitView}
          className="w-7 h-7 rounded-xl bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-secondary hover:text-text-primary flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
          aria-label="Fit all nodes in view (F)"
          title="Find & Center All Nodes (F)"
        >
          <Focus className="w-3.5 h-3.5 text-text-secondary" />
        </button>
      )}

      {/* Minimap Toggle Button */}
      {onToggleMinimap && (
        <button
          type="button"
          onClick={onToggleMinimap}
          className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer ${
            isMinimapOpen
              ? 'bg-text-primary text-white border-text-primary'
              : 'bg-white-pure hover:bg-grey-soft/90 border-grey-medium/70 text-text-secondary hover:text-text-primary'
          }`}
          aria-label="Toggle Minimap (M)"
          title={isMinimapOpen ? 'Hide Minimap (M)' : 'Show Minimap (M)'}
        >
          <Map className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Keyboard Shortcuts Button */}
      <button
        onClick={onOpenShortcuts}
        className="w-7 h-7 rounded-xl bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-secondary hover:text-text-primary flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
        aria-label="Show shortcuts and trackpad guide"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-3.5 h-3.5 text-text-secondary" />
      </button>

      {currentWorkspace && (
        <>
          <div className="w-4 h-[1px] bg-grey-medium/70 my-0.5" />
          <WorkspaceSwitcher
            currentWorkspace={currentWorkspace}
            workspaces={workspaces}
            nodeCount={nodeCount}
            onSelectWorkspace={onSelectWorkspace}
            onNewWorkspace={onNewWorkspace}
            onExportPsychis={onExportPsychis}
            onImportPsychis={onImportPsychis}
            onExportTrainingJsonl={onExportTrainingJsonl}
            onClearCanvas={onClearCanvas}
            clientAuth={clientAuth}
            onOpenAuthModal={onOpenAuthModal}
            onOpenAISettings={onOpenAISettings}
            onLogout={onLogout}
          />
        </>
      )}
    </div>
  );
};
