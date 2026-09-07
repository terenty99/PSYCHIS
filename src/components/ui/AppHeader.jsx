import React from 'react';
import { AppWindow, Keyboard, Loader2 } from 'lucide-react';
import { TimeDisplay } from './TimeDisplay';
import { PsychisLogo } from './PsychisLogo';

export const AppHeader = ({
  currentWorkspace,
  workspaces,
  nodeCount = 0,
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
  isBrowserOpen = false,
  onOpenBrowser,
  onOpenShortcuts,
  isBrowserLoading = false,
}) => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-10 sm:h-12 bg-white-warm/95 backdrop-blur-md border-b border-grey-medium select-none shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200"
      role="banner"
    >
      <div className="w-full max-w-[1200px] h-full mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left Zone: App Identifier (Logo on White Ground + Title) */}
        <div className="flex items-center gap-2.5 flex-shrink-0" title="PSYCHIS Spatial Knowledge Engine">
          <PsychisLogo size={26} showText={true} background="white" />
        </div>

        {/* Center Zone: Flexible Spacer */}
        <div className="flex-1" />

        {/* Right Zone: Strictly Ordered: 1. Shortcuts Button, 2. Time Display, 3. In-Built Browser Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 1. Shortcuts Icon Button */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="h-8 w-8 sm:h-9 sm:w-9 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-grey-soft active:bg-grey-medium transition-colors border border-transparent hover:border-grey-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 cursor-pointer"
            aria-label="View keyboard shortcuts"
            aria-haspopup="dialog"
            title="View keyboard shortcuts (?)"
          >
            <Keyboard className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* 2. Subtle Ambient Real-Time Clock (Plain Text, Accessible <time>) */}
          <TimeDisplay />

          {/* 3. In-Built Browser Button */}
          <button
            type="button"
            onClick={onOpenBrowser}
            disabled={isBrowserLoading}
            className={`h-8 sm:h-9 min-h-[44px] min-w-[44px] px-2.5 sm:px-3.5 rounded-lg flex items-center justify-center gap-2 text-xs font-medium font-sans transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 cursor-pointer ${
              isBrowserLoading ? 'opacity-40 cursor-not-allowed' : ''
            } ${
              isBrowserOpen
                ? 'bg-grey-medium text-text-primary border border-grey-strong shadow-inner'
                : 'bg-[#0F121A] text-white hover:bg-[#1E2230] active:scale-[0.98] border border-black/10'
            }`}
            aria-label="Launch in-built browser"
            aria-controls="embedded-browser-pane"
            aria-expanded={isBrowserOpen}
            title="Launch in-built browser (B)"
          >
            {isBrowserLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
            ) : (
              <AppWindow className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            )}
            <span className="hidden lg:inline">
              {isBrowserLoading ? 'Opening...' : isBrowserOpen ? 'Browser Active' : 'Open Browser'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
