import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Zap,
  FileText,
  ExternalLink,
  Maximize2,
  Minimize2,
  Paperclip,
  PlusCircle,
  Layers,
  Columns,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const EmbeddedBrowser = ({
  isOpen = false,
  url = 'https://arxiv.org/abs/2307.12008',
  viewMode = 'split',
  onSwitchViewMode,
  activeNode,
  onClose,
  onMapToGraph,
  onClipToNode,
}) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [selectedText, setSelectedText] = useState('');
  const [clipStatus, setClipStatus] = useState('');

  const isSplit = viewMode === 'split';
  const isFullScreen = viewMode === 'browser';

  const handleClipSelection = () => {
    setClipStatus('✓ Clipped selection to active node');
    onClipToNode?.({
      text: selectedText || 'Non-linear Kinematics of Four-Bar Chebyshev Mechanisms (arXiv:2307.12008)',
      url: currentUrl,
      nodeId: activeNode?.id,
    });
    setTimeout(() => setClipStatus(''), 2000);
  };

  return (
    <>
      {/* Backdrop overlay only when in single full browser view on small screens */}
      {isOpen && isFullScreen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[65] bg-[#3A3530]/15 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto"
          aria-hidden="true"
        />
      )}

      <aside
        id="embedded-browser"
        onWheel={(e) => e.stopPropagation()}
        className={`fixed inset-y-0 left-0 z-[70] flex flex-col bg-white-pure border-r border-grey-medium shadow-[20px_0_50px_rgba(0,0,0,0.14)] transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          isFullScreen
            ? 'w-screen max-w-full'
            : isSplit
            ? 'w-[calc(100vw-540px)] max-w-[960px]'
            : 'w-[580px] max-w-[92vw]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Unified scholarly browser workstation"
      >
        {/* Top Browser Chrome */}
        <div className="bg-grey-soft border-b border-grey-medium p-3 flex flex-col gap-2 select-none shadow-sm transition-colors duration-200">
          {/* Tabs & View Mode Bar */}
          <div className="flex items-center gap-1.5 text-xs">
            {/* Active Tab */}
            <div className="bg-white-pure border-t-2 border-text-primary border-l border-r border-grey-medium rounded-t-lg px-3 py-1.5 flex items-center gap-2 max-w-[240px] shadow-xs">
              <FileText className="w-3.5 h-3.5 text-text-secondary shrink-0" />
              <span className="truncate font-semibold text-text-primary text-[11.5px]">arXiv:2307.12008</span>
              <button
                onClick={onClose}
                className="text-text-faint hover:text-text-primary text-[10px] ml-auto p-0.5"
                aria-label="Close tab"
              >
                ✕
              </button>
            </div>

            {/* Contextual Awareness Indicator */}
            {activeNode && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white-warm border border-grey-medium rounded-lg text-[10.5px] font-mono text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                <span>Linked: <b className="text-text-primary">{activeNode.id}</b> ({activeNode.data?.title || 'Node'})</span>
              </div>
            )}

            <div className="flex-1" />

            {/* Unified View Mode Segmented Switcher */}
            <div className="flex items-center bg-white-pure border border-grey-medium rounded-lg p-0.5 gap-0.5 shadow-2xs">
              <button
                onClick={() => onSwitchViewMode?.('split')}
                className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 transition-colors ${
                  isSplit ? 'bg-text-primary text-white-pure font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Split View (Side-by-side with Study Inspector)"
              >
                <Columns className="w-3 h-3" />
                <span className="hidden md:inline">Split</span>
              </button>

              <button
                onClick={() => onSwitchViewMode?.('browser')}
                className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 transition-colors ${
                  isFullScreen ? 'bg-text-primary text-white-pure font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Full Source Reading Mode"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden md:inline">Full</span>
              </button>

              <button
                onClick={() => onSwitchViewMode?.('inspector')}
                className="px-2 py-0.5 rounded font-mono text-[10px] text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                title="Collapse browser to Study Inspector only"
              >
                <Minimize2 className="w-3 h-3" />
                <span className="hidden md:inline">Hide</span>
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="btn-contemplative !w-7 !h-7 !p-0 rounded-md text-[10px] ml-1"
              aria-label="Close browser"
            >
              <X className="w-3.5 h-3.5 text-text-secondary" />
            </button>
          </div>

          {/* Navigation & Address Bar */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-[11px]" aria-label="Navigate back">
                <ArrowLeft className="w-3 h-3" />
              </button>
              <button className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-[11px] opacity-40" aria-label="Navigate forward">
                <ArrowRight className="w-3 h-3" />
              </button>
              <button className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-[11px]" aria-label="Refresh page">
                <RotateCw className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 bg-white-pure border border-grey-strong rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xs transition-all duration-300">
              <Lock className="w-3 h-3 text-text-muted shrink-0" />
              <input
                type="text"
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs text-text-primary font-mono select-text"
                aria-label="Web Address"
                spellCheck={false}
              />
            </div>

            {/* Bidirectional Clipping & Mapping Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClipSelection}
                className="btn-contemplative !rounded-xl text-[10px] px-2.5 py-1.5 shrink-0 transition-all font-mono"
                title="Clip selected insight or abstract directly into active node study"
              >
                <Paperclip className="w-3 h-3 text-text-secondary" />
                <span className="hidden sm:inline">Clip to Node</span>
              </button>

              <button
                onClick={() => onMapToGraph?.(currentUrl)}
                className="btn-contemplative btn-primary-contemplative !rounded-xl text-[10px] px-3 py-1.5 shrink-0 transition-all duration-200"
                aria-label="Map page to spatial knowledge graph"
              >
                <Zap className="w-3 h-3" /> Map to Graph
              </button>
            </div>
          </div>

          {/* Feedback Status */}
          {clipStatus && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-[10.5px] font-mono px-2 py-1 rounded-md text-center">
              {clipStatus}
            </div>
          )}
        </div>

        {/* Rendered Scholarly Paper Content with Smooth Centered Expansion */}
        <div className="flex-1 overflow-y-auto bg-white-pure text-[13px] leading-[1.75] text-text-primary select-text transition-all duration-300">
          <div
            className={`transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
              isFullScreen ? 'max-w-4xl mx-auto p-12 px-16' : 'p-8'
            }`}
          >
            <div className="border-b border-grey-soft pb-5 mb-5">
              <div className="flex justify-between items-center mb-2.5">
                <span className="font-mono text-xs font-semibold text-text-secondary bg-grey-soft px-2.5 py-1 rounded-md border border-grey-medium">
                  arXiv:2307.12008 [cs.RO]
                </span>
                <div className="flex items-center gap-2">
                  <button className="btn-contemplative text-[10.5px] !py-1 flex items-center gap-1" aria-label="Download paper PDF">
                    <ExternalLink className="w-3 h-3" /> PDF
                  </button>
                </div>
              </div>
              <h1
                className={`font-display font-medium text-text-primary leading-snug mb-2 transition-all duration-300 ${
                  isFullScreen ? 'text-[24px]' : 'text-[18px]'
                }`}
              >
                Non-linear Kinematics of Four-Bar Chebyshev Mechanisms and Topological Linkages in Vacuum Robotics
              </h1>
              <p className="text-xs text-text-secondary font-medium">
                P. L. Chebyshev, M. J. Thorne, Elena Rostova, K. V. Vance &bull; <i>Applied Mechanics Laboratory</i>
              </p>
            </div>

            <h2 className="font-mono text-[11px] font-semibold text-text-muted tracking-wider uppercase mb-2.5">
              ABSTRACT
            </h2>
            <p className="mb-3.5 max-w-[62ch] text-text-secondary">
              We present a rigorous topological and kinematic formulation of the classical Chebyshev four-bar straight-line motion mechanism applied to constrained planar micro-manipulators in semiconductor and cryogenic environments.
            </p>
            <p className="mb-5 max-w-[62ch] text-text-secondary">
              By deriving the closed-form inflection circle via the Euler-Savary equation, we prove that the central coupler point maintains a trajectory linear tolerance within 0.042% across an angular excursion of Δθ = 85° with zero mechanical sliding friction.
            </p>

            <div className="p-5 bg-white-warm border border-grey-medium rounded-2xl mb-6 shadow-xs">
              <h3 className="font-display text-sm font-semibold text-text-primary mb-2">Kinematic Design Parameters</h3>
              <ul className="text-xs text-text-secondary list-disc pl-4 space-y-1.5 font-mono">
                <li>L₁ = L₂ = 2.50a (Crank arms)</li>
                <li>L₃ = 1.00a (Coupler link)</li>
                <li>L₄ = 2.00a (Ground base pivot distance)</li>
                <li>Inflection Circle Diameter D = 1.414a</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-grey-soft">
              <div className="bg-grey-soft/70 border border-grey-medium p-4 rounded-2xl">
                <h4 className="font-display text-xs font-semibold text-text-primary mb-1">
                  Topological Proof Summary
                </h4>
                <p className="text-[12px] text-text-secondary leading-relaxed font-sans">
                  Derivation through the Euler-Savary equation establishes that third-order derivatives vanish at the symmetric midpoint, eliminating first-order positional error.
                </p>
              </div>
              <div className="bg-grey-soft/70 border border-grey-medium p-4 rounded-2xl">
                <h4 className="font-display text-xs font-semibold text-text-primary mb-1">
                  Vacuum Semiconductor Application
                </h4>
                <p className="text-[12px] text-text-secondary leading-relaxed font-sans">
                  Elimination of sliding rails prevents particle shedding and dry friction wear in ultra-high vacuum (UHV) lithography deposition stages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

