import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Network, Link2 } from 'lucide-react';

export const DeleteNodeConfirmModal = ({
  isOpen,
  node,
  connectedEdges = [],
  allNodes = [],
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel?.();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onConfirm?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen || !node) return null;

  const nodeTitle = node.data?.title || ('Node ' + node.id);
  const nodeCategory = node.data?.category || node.type || 'Knowledge Node';
  const linkageCount = connectedEdges.length;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-[#1E1B18]/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm Node Deletion"
      onClick={onCancel}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white-pure border border-grey-strong rounded-3xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.25)] max-w-[440px] w-full text-text-primary animate-in zoom-in-95 duration-150"
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-grey-medium">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-text-primary tracking-tight">
                Confirm Node Deletion
              </h2>
              <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider">
                Active Junction Safeguard
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-xl text-text-muted hover:text-text-primary hover:bg-grey-soft transition-colors cursor-pointer"
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Details Card */}
        <div className="bg-white-warm border border-grey-medium rounded-2xl p-3.5 mb-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[9px] font-semibold text-text-muted uppercase tracking-wider">
              {nodeCategory}
            </span>
            <span className="font-mono text-[8.5px] px-1.5 py-0.5 rounded bg-grey-soft text-text-secondary">
              ID: {node.id}
            </span>
          </div>
          <div className="font-display text-base font-semibold text-text-primary mb-1">
            {nodeTitle}
          </div>
          <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
            {node.data?.description || 'Selected canvas node.'}
          </p>
        </div>

        {/* Warning Callout for Connected Linkages */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <Network className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-mono text-[10px] font-semibold text-amber-900 mb-1">
                Connected to {linkageCount} {linkageCount === 1 ? 'Linkage' : 'Linkages'}
              </div>
              <p className="text-[10.5px] text-amber-800 leading-snug mb-2">
                This node acts as a relational bridge. Deleting it will permanently break and remove all {linkageCount} associated connections:
              </p>
              <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                {connectedEdges.map((ed) => {
                  const otherNodeId = ed.source === node.id ? ed.target : ed.source;
                  const otherNode = allNodes.find((n) => n.id === otherNodeId);
                  const otherTitle = otherNode?.data?.title || ('Node ' + otherNodeId);
                  return (
                    <div 
                      key={ed.id}
                      className="flex items-center gap-1.5 font-mono text-[9px] text-amber-900/90 bg-white/80 px-2 py-1 rounded-lg border border-amber-200/60 truncate"
                    >
                      <Link2 className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                      <span className="truncate">Linked with <strong>{otherTitle}</strong></span>
                      {ed.label && <span className="text-text-muted">({ed.label})</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-3 rounded-xl border border-grey-medium font-mono text-[11px] font-medium text-text-secondary hover:bg-grey-soft transition-colors cursor-pointer text-center shadow-sm"
          >
            Cancel (Esc)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Node (Enter)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
