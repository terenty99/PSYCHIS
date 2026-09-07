import React from 'react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { TimeDisplay } from './TimeDisplay';
import { Plus, Globe, Focus } from 'lucide-react';
import { PsychisLogo } from './PsychisLogo';

export const TopNavDock = ({
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
  onOpenBrowser,
  onFitView,
}) => {
  return (
    <nav
      aria-label="Workspace and navigation dock"
      className="fixed top-3.5 left-4 z-40 flex items-center bg-white-pure/92 backdrop-blur-xl border border-grey-medium/80 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.03)] p-1 gap-1 select-none font-sans"
    >
      {/* PSYCHIS Core Logo Tile (White Background) */}
      <div className="flex items-center pl-1 pr-0.5" title="PSYCHIS — Spatial Knowledge Engine">
        <PsychisLogo size={25} background="white" />
      </div>

      {/* Hairline Divider */}
      <div className="w-[1px] h-4 bg-grey-medium/70 mx-0.5" />

      {/* Workspace Switcher */}
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
        inlineTrigger={true}
      />

      {/* Hairline Divider */}
      <div className="w-[1px] h-4 bg-grey-medium/70 mx-0.5" />

      {/* Live Clock with Status Dot */}
      <TimeDisplay compact={true} />

      {/* Hairline Divider */}
      <div className="w-[1px] h-4 bg-grey-medium/70 mx-0.5" />

      {/* Embedded Scholarly Browser Quick Action */}
      <button
        type="button"
        onClick={() => onOpenBrowser?.()}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl bg-white hover:bg-grey-subtle text-[#2B2724] border border-grey-medium/80 font-sans text-[11px] font-medium transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer hover:border-text-primary/40"
        title="Open In-App Web Browser"
        aria-label="Open In-App Browser"
      >
        <Globe className="w-3.5 h-3.5 text-accent-primary" />
        <span className="hidden sm:inline">Browser</span>
      </button>

      {/* Center All Nodes Quick Action */}
      {onFitView && (
        <button
          type="button"
          onClick={onFitView}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl bg-white hover:bg-grey-subtle text-[#2B2724] border border-grey-medium/80 font-sans text-[11px] font-medium transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer hover:border-text-primary/40"
          title="Center All Nodes & Fit View (F)"
          aria-label="Center All Nodes"
        >
          <Focus className="w-3.5 h-3.5 text-text-secondary" />
          <span className="hidden sm:inline">Center (F)</span>
        </button>
      )}

      {/* New Investigation Quick Action */}
      <button
        type="button"
        onClick={onNewWorkspace}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl bg-[#2B2724] hover:bg-black text-white font-sans text-[11px] font-medium transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
        title="Start New Investigation (Alt+N)"
        aria-label="New Investigation"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">New</span>
      </button>
    </nav>
  );
};
