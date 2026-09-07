import React, { useEffect, useRef } from 'react';
import { X, Keyboard, Compass, LayoutGrid, Monitor, Globe } from 'lucide-react';

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  // Focus trap & ESC listener inside modal
  useEffect(() => {
    if (!isOpen) return;

    // Store previous active element to restore focus on close
    const previousActiveElement = document.activeElement;

    // Focus the first interactive element (close button)
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = Array.from(
          modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown, true);
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Spatial Canvas',
      icon: LayoutGrid,
      items: [
        { keys: ['F'], desc: 'Fit view / Center all nodes on canvas' },
        { keys: ['M'], desc: 'Toggle spatial minimap radar' },
        { keys: ['Two-Finger Drag'], desc: 'Pan canvas viewport smoothly' },
        { keys: ['Pinch', 'Ctrl + Scroll'], desc: 'Zoom canvas view narrower or wider' },
        { keys: ['+', '−'], desc: 'Zoom in or out incrementally' },
        { keys: ['0'], desc: 'Reset viewport zoom to 100%' },
        { keys: ['Space'], desc: 'Pause / Resume all physics and animations' },
      ],
    },
    {
      title: 'Node Inspector & Creation',
      icon: Compass,
      items: [
        { keys: ['Ctrl + Hover'], desc: 'Tactile node shake preview' },
        { keys: ['Ctrl + Click'], desc: 'Select link source (release Ctrl to cancel)' },
        { keys: ['Backspace', 'Delete'], desc: 'Delete hovered or selected node (safeguards multi-link junctions)' },
        { keys: ['1 – 5'], desc: 'Quick-inspect nodes 0x01 through 0x05' },
        { keys: ['N'], desc: 'Open Node Template Creator' },
      ],
    },
    {
      title: 'Browser & Tabs',
      icon: Globe,
      items: [
        { keys: ['B'], desc: 'Launch or toggle In-Built Browser' },
        { keys: ['Ctrl + T'], desc: 'Open new browser tab' },
        { keys: ['Ctrl + W'], desc: 'Close active browser tab' },
        { keys: ['Ctrl + Tab'], desc: 'Cycle to next browser tab' },
        { keys: ['Ctrl + 1 – 9'], desc: 'Directly switch to tab 1 through 9' },
      ],
    },
    {
      title: 'Global & Tools',
      icon: Monitor,
      items: [
        { keys: ['T', 'S'], desc: 'Focus PSYCHIS Spark AI Terminal' },
        { keys: ['?'], desc: 'Toggle keyboard shortcuts guide' },
        { keys: ['Esc'], desc: 'Dismiss active drawers, search, or dialogs' },
      ],
    },
  ];

  const renderKey = (keyString) => {
    return (
      <kbd
        key={keyString}
        className="px-2 py-0.5 bg-white-pure border border-grey-strong rounded-md shadow-2xs font-mono font-semibold text-text-primary text-[11px] inline-flex items-center gap-1"
      >
        {keyString}
      </kbd>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-[#3A3530]/40 backdrop-blur-md flex items-end lg:items-center justify-center p-0 lg:p-4 select-none animate-in fade-in duration-200"
      role="presentation"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white-pure border border-grey-strong rounded-t-3xl lg:rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-w-[440px] w-full text-text-primary max-h-[85vh] lg:max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-6 lg:slide-in-from-bottom-0 lg:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-10 h-1 rounded-full bg-grey-medium mx-auto mb-3 lg:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-grey-medium flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-grey-soft border border-grey-medium flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-text-primary" />
            </div>
            <h2 id="shortcuts-modal-title" className="font-display text-base font-semibold text-text-primary">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-grey-soft active:bg-grey-medium transition-colors cursor-pointer border border-transparent hover:border-grey-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
            aria-label="Close shortcuts dialog"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Shortcut Groups */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 font-mono text-xs">
          {shortcutGroups.map((group, groupIdx) => {
            const GroupIcon = group.icon;
            return (
              <div key={groupIdx} className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-text-faint tracking-wider uppercase px-1">
                  <GroupIcon className="w-3 h-3 text-text-muted" />
                  <span>{group.title}</span>
                </div>
                <div className="space-y-1.5">
                  {group.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between p-2 rounded-xl bg-grey-soft/70 border border-grey-medium hover:bg-grey-medium/60 transition-colors"
                    >
                      <span className="font-sans text-[12px] text-text-primary pr-2">
                        {item.desc}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <React.Fragment key={kIdx}>
                            {kIdx > 0 && <span className="text-[10px] text-text-muted">/</span>}
                            {renderKey(k)}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-grey-soft text-center font-mono text-[11px] text-text-muted flex-shrink-0">
          Press <kbd className="px-1.5 py-0.5 bg-grey-soft rounded border border-grey-medium text-[10px] font-mono">Esc</kbd> or <kbd className="px-1.5 py-0.5 bg-grey-soft rounded border border-grey-medium text-[10px] font-mono">?</kbd> to dismiss
        </div>
      </div>
    </div>
  );
};
