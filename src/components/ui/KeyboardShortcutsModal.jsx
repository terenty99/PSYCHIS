import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Pause / Resume all animations & mechanisms' },
    { key: 'Esc', desc: 'Close open drawers (Browser / Inspector)' },
    { key: 'Two-Finger Drag', desc: 'Pan & travel across the spatial canvas' },
    { key: 'Pinch / Ctrl + Scroll', desc: 'Zoom canvas view narrower or wider' },
    { key: '+ / -', desc: 'Zoom in / Zoom out' },
    { key: '0', desc: 'Reset viewport zoom to 100%' },
    { key: '1 - 5', desc: 'Quick-inspect nodes 0x01 through 0x05' },
    { key: 'T / S', desc: 'Focus bottom PSYCHIS Spark Terminal' },
    { key: 'N', desc: 'Open Node Template Creator' },
    { key: '?', desc: 'Toggle this keyboard shortcuts guide' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-[#3A3530]/20 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white-pure border border-grey-strong rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-w-[480px] w-full text-text-primary"
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-grey-medium">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-text-secondary" />
            <h2 className="font-display text-base font-semibold text-text-primary">
              PSYCHIS Touchpad &amp; Key Controls
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs"
            aria-label="Close shortcuts modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-grey-soft/80 border border-grey-medium hover:bg-grey-medium/60 transition-colors"
            >
              <span className="font-sans text-[12px] text-text-primary">{s.desc}</span>
              <kbd className="px-2.5 py-1 bg-white-pure border border-grey-strong rounded-lg shadow-2xs font-semibold text-text-primary text-[11px]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-grey-soft text-center font-mono text-[11px] text-text-muted">
          Press <kbd className="px-1.5 py-0.5 bg-grey-soft rounded border border-grey-medium text-[10px]">Esc</kbd> or <kbd className="px-1.5 py-0.5 bg-grey-soft rounded border border-grey-medium text-[10px]">?</kbd> to dismiss
        </div>
      </div>
    </div>
  );
};
