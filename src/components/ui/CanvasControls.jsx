import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Keyboard, Plus, Move, Focus, Map } from 'lucide-react';
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
}) => {
  return (
    <div
      className="fixed bottom-5 left-5 z-40 bg-white-pure/95 backdrop-blur-xl border border-grey-medium/80 rounded-2xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] flex items-center gap-1.5 select-none font-sans text-xs"
      aria-label="Canvas zoom and view controls"
    >
      <button
        onClick={onZoomOut}
        className="w-8 h-8 rounded-xl bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-primary flex items-center justify-center transition-all duration-150 active:scale-90 shadow-3xs cursor-pointer"
        aria-label="Zoom out (-)"
        title="Zoom Out (-)"
      >
        <span className="text-base leading-none font-semibold">−</span>
      </button>

      <button
        onClick={onResetZoom}
        className="h-8 px-2.5 rounded-xl bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-primary font-mono font-semibold text-[11px] flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
        aria-label="Reset zoom to 100%"
        title="Reset View (0)"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        onClick={onZoomIn}
        className="w-8 h-8 rounded-xl bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-primary flex items-center justify-center transition-all duration-150 active:scale-90 shadow-3xs cursor-pointer"
        aria-label="Zoom in (+)"
        title="Zoom In (+)"
      >
        <span className="text-base leading-none font-semibold">+</span>
      </button>

      {/* Fit View / Find Nodes Action Button */}
      {onFitView && (
        <button
          type="button"
          onClick={onFitView}
          className="h-8 px-2.5 rounded-xl bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-secondary hover:text-text-primary font-sans text-[11.5px] font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
          aria-label="Fit all nodes in view (F)"
          title="Find & Center All Nodes (F)"
        >
          <Focus className="w-3.5 h-3.5 text-text-secondary" />
          <span>Fit View (F)</span>
        </button>
      )}

      {/* Minimap Toggle Button */}
      {onToggleMinimap && (
        <button
          type="button"
          onClick={onToggleMinimap}
          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer ${
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

      <div className="w-[1px] h-4.5 bg-grey-medium/70 mx-0.5" />

      <button
        onClick={onOpenShortcuts}
        className="h-8 px-3 rounded-xl bg-white-pure hover:bg-grey-soft/90 border border-grey-medium/70 hover:border-text-primary/30 text-text-secondary hover:text-text-primary font-sans text-[11.5px] font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
        aria-label="Show shortcuts and trackpad guide"
        title="Shortcuts (?)"
      >
        <Keyboard className="w-3.5 h-3.5 text-text-secondary" />
        <span>Shortcuts</span>
      </button>

      {currentWorkspace && (
        <>
          <div className="w-[1px] h-4 bg-grey-medium mx-0.5" />
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
