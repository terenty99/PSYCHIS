import React, { useEffect, useRef, useState } from 'react';
import { Check, Trash2, ArrowRight, Minus, MoreHorizontal, Sparkles } from 'lucide-react';

export const LINKAGE_PALETTE = [
  { id: 'gray', label: 'Gray (Default)', hex: '#7A7570' },
  { id: 'charcoal', label: 'Charcoal', hex: '#2E2A27' },
  { id: 'amber', label: 'Amber', hex: '#F59E0B' },
  { id: 'blue', label: 'Blue', hex: '#3B82F6' },
  { id: 'emerald', label: 'Emerald', hex: '#10B981' },
  { id: 'rose', label: 'Rose', hex: '#EF4444' },
  { id: 'violet', label: 'Violet', hex: '#8B5CF6' },
];

export const LINKAGE_STYLES = [
  { id: 'basic', label: 'Basic', icon: Minus, desc: 'Solid smooth curve' },
  { id: 'arrowed', label: 'Arrowed', icon: ArrowRight, desc: 'Directional arrow' },
  { id: 'dashed', label: 'Dashed', icon: MoreHorizontal, desc: 'Hypothesized / tension' },
];

export const LinkageOptionsPopover = ({
  edge,
  sourceNode,
  targetNode,
  position = { x: 400, y: 300 },
  onChange,
  onClose,
  onDelete,
}) => {
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  const [label, setLabel] = useState(edge?.label || '');
  const [description, setDescription] = useState(edge?.description || '');

  // Synchronize when a new edge is targeted
  useEffect(() => {
    setLabel(edge?.label || '');
    setDescription(edge?.description || '');
  }, [edge?.id]);

  // Auto-focus input on open so user can immediately write
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
    return () => clearTimeout(timer);
  }, [edge?.id]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        if (e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onClose]);

  const handleLabelChange = (val) => {
    setLabel(val);
    onChange({ label: val });
  };

  const handleDescChange = (val) => {
    setDescription(val);
    onChange({ description: val });
  };

  if (!edge) return null;

  const currentColor = (edge.color || '#7A7570').toUpperCase();
  const currentStyle = edge.style || 'basic';

  const popoverWidth = 320;
  const popoverHeight = 290;

  // Clamp screen coordinates so popover stays fully visible within window
  const left = Math.max(16, Math.min(position.x - popoverWidth / 2, window.innerWidth - popoverWidth - 16));

  // Prefer placing just above the linkage midpoint; if too close to top dock, place below
  const placeAbove = position.y - popoverHeight - 20 >= 70;
  const rawTop = placeAbove ? position.y - popoverHeight - 15 : position.y + 25;
  const top = Math.max(70, Math.min(rawTop, window.innerHeight - popoverHeight - 16));

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Linkage Options"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-50 bg-white-pure/98 backdrop-blur-2xl border border-[#4A4540]/30 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-3.5 w-[320px] font-sans text-xs animate-in fade-in zoom-in-95 duration-150"
      style={{ left: `${left}px`, top: `${top}px` }}
    >
      {/* Header with Connection Breadcrumb */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-grey-medium">
        <div className="flex items-center gap-1 font-mono text-[9px] font-semibold text-text-primary uppercase tracking-wider truncate max-w-[200px]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: currentColor }} />
          <span className="truncate">{sourceNode?.data?.title || 'Node A'}</span>
          <span className="text-text-muted">→</span>
          <span className="truncate">{targetNode?.data?.title || 'Node B'}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(edge.id);
              }}
              title="Delete this linkage"
              className="p-1 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Confirm (Enter)"
            className="p-1 px-2 rounded-lg bg-text-primary text-white font-mono text-[10px] font-medium hover:bg-black transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Check className="w-3 h-3" />
            <span>Done</span>
          </button>
        </div>
      </div>

      {/* 1. Color Palette Selector */}
      <div className="mb-2.5">
        <label className="block font-mono text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
          Linkage Color
        </label>
        <div className="flex items-center justify-between gap-1.5 px-0.5">
          {LINKAGE_PALETTE.map((c) => {
            const isSelected = currentColor === c.hex.toUpperCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange({ color: c.hex })}
                title={c.label}
                className={`w-6 h-6 rounded-full transition-transform duration-150 cursor-pointer flex items-center justify-center ${
                  isSelected ? 'scale-115 ring-2 ring-offset-2 ring-text-primary shadow-xs' : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && <Check className="w-3 h-3 text-white drop-shadow-sm" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Linkage Style (basic, arrowed, dashed) */}
      <div className="mb-2.5">
        <label className="block font-mono text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
          Line Style
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {LINKAGE_STYLES.map((st) => {
            const isSelected = currentStyle === st.id;
            const Icon = st.icon;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onChange({ style: st.id })}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-mono text-[10px] font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-text-primary text-white-pure border-text-primary shadow-xs'
                    : 'bg-white-warm hover:bg-grey-soft text-text-secondary border-grey-medium'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Text on Linkage in Small Window (Chip) */}
      <div className="mb-2">
        <label className="block font-mono text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">
          Text on Linkage Window <span className="font-normal text-[8.5px] lowercase">(optional chip)</span>
        </label>
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              e.preventDefault();
              onClose();
            }
          }}
          placeholder="e.g. coupled, derives from, contradicts..."
          className="w-full px-2.5 py-1.5 rounded-xl bg-white-warm border border-grey-medium font-mono text-[10.5px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors select-text cursor-text"
        />
      </div>

      {/* 4. Hover Explanation Text */}
      <div className="mb-2">
        <label className="block font-mono text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">
          Hover Explanation Text <span className="font-normal text-[8.5px] lowercase">(appears on hover)</span>
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => handleDescChange(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onClose();
            }
          }}
          placeholder="Explain how these two concepts connect..."
          className="w-full px-2.5 py-1.5 rounded-xl bg-white-warm border border-grey-medium font-sans text-[11px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary resize-none transition-colors leading-snug select-text cursor-text"
        />
      </div>

      {/* Multi-Node Hint Footer */}
      <div className="pt-2 border-t border-grey-soft flex items-center justify-between text-[9px] font-mono text-text-muted">
        <span className="flex items-center gap-1 text-text-secondary">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Click another node to link with same style</span>
        </span>
        <span className="bg-grey-soft px-1.5 py-0.5 rounded text-[8.5px]">↵ Enter to save</span>
      </div>
    </div>
  );
};
