import React, { useState } from 'react';
import { Sparkles, FilePlus, X, Compass, Layers, ArrowRight } from 'lucide-react';

export const NewInvestigationModal = ({
  isOpen = false,
  onClose,
  onCreateInvestigation,
}) => {
  const [theme, setTheme] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTheme = theme.trim() || 'Untitled Investigation';
    onCreateInvestigation({
      name: cleanTheme
    });
    setTheme('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[94vw] bg-[#FFFFFF] border border-[#C5C2BC] rounded-3xl shadow-[0_25px_65px_rgba(0,0,0,0.35)] p-7 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E5E2DC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4F2ED] flex items-center justify-center border border-[#DDD9D2] shadow-2xs">
              <FilePlus className="w-5 h-5 text-[#1A1816]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#1A1816] leading-tight">
                Start New Investigation
              </h2>
              <p className="font-mono text-[11px] text-[#6B655A] mt-0.5">
                Initialize clean research sanctuary from scratch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#F4F2ED] hover:bg-[#EAE7E0] border border-[#DDD9D2] flex items-center justify-center text-[#6B655A] hover:text-[#1A1816] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="investigation-theme"
              className="block font-mono text-[11.5px] font-bold text-[#2E2A27] uppercase tracking-wider mb-2"
            >
              Investigation Theme / Topic
            </label>
            <div className="bg-[#F8F7F4] border-2 border-[#D5D2CC] focus-within:border-[#1A1816] focus-within:bg-[#FFFFFF] rounded-2xl px-4 py-3 transition-all shadow-2xs flex items-center gap-3">
              <Compass className="w-5 h-5 text-[#8A8782] shrink-0" />
              <input
                id="investigation-theme"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Child labor in USA early 20th century, Quantum Gravity, SpaceX Starship..."
                className="flex-1 bg-transparent border-none outline-none font-sans text-[13.5px] font-medium text-[#1A1816] placeholder:text-[#A8A49E] select-text"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E2DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D5D2CC] text-[#4A4540] hover:bg-[#F4F2ED] font-mono text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2E2A27] hover:bg-[#151311] text-[#FFFFFF] font-mono text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <span>Initialize Canvas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};