import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Layers,
  Plus,
  Download,
  Upload,
  Trash2,
  Check,
  Key,
  FolderOpen,
} from 'lucide-react';

export const WorkspaceSwitcher = ({
  currentWorkspace,
  workspaces,
  nodeCount = 0,
  onSelectWorkspace,
  onNewWorkspace,
  onExportPsychis,
  onImportPsychis,
  onClearCanvas,
  clientAuth,
  onOpenAuthModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onImportPsychis(event.target.result);
      setIsOpen(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside
      ref={dropdownRef}
      className="fixed top-14 left-4 z-40 select-none font-mono text-xs"
      aria-label="Workspace and board manager"
    >
      {/* Top Floating Pill */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white-warm/95 hover:bg-grey-soft backdrop-blur-md border border-grey-strong shadow-[0_2px_10px_rgba(0,0,0,0.06)] text-text-primary transition-all duration-200 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Layers className="w-3.5 h-3.5 text-text-secondary" />
        <span className="font-sans font-medium text-[12.5px] max-w-[190px] sm:max-w-[240px] truncate text-text-primary">
          {currentWorkspace?.name || 'Applied Kinematics'}
        </span>
        <span className="text-[10px] bg-grey-medium px-2 py-0.5 rounded-full font-mono text-text-secondary font-semibold">
          {nodeCount} nodes
        </span>
        <ChevronDown
          className={`w-3 h-3 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Glassmorphic Dropdown Deck */}
      {isOpen && (
        <div
          className="absolute top-12 left-0 w-[310px] bg-white-pure/98 backdrop-blur-2xl border border-grey-strong rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2 animate-in fade-in zoom-in-95 duration-150 text-text-primary"
          role="menu"
        >
          {/* Client Authentication Header */}
          <div className="px-3 py-2 border-b border-grey-soft flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <Key className="w-3 h-3 text-text-muted" />
              <span className="truncate max-w-[150px]">
                {clientAuth?.handle ? `${clientAuth.handle}` : 'Guest Session'}
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuthModal();
              }}
              className="text-[10px] text-text-muted hover:text-text-primary underline cursor-pointer"
            >
              {clientAuth?.accessKey ? 'Key: Verified' : 'Enter Key'}
            </button>
          </div>

          {/* Workspaces List */}
          <div className="space-y-1 mb-2 max-h-[190px] overflow-y-auto pr-1">
            <div className="text-[10px] font-semibold text-text-muted px-2 py-1 uppercase tracking-wider">
              Saved Workspaces
            </div>

            {workspaces.map((ws) => {
              const isCurrent = ws.id === currentWorkspace?.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-grey-soft border border-grey-medium font-semibold'
                      : 'hover:bg-grey-soft/70 border border-transparent'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderOpen
                      className={`w-3.5 h-3.5 ${
                        isCurrent ? 'text-text-primary' : 'text-text-muted'
                      }`}
                    />
                    <span className="font-sans text-[12px] truncate">{ws.name}</span>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="h-[1px] bg-grey-medium my-1.5" />

          {/* Actions */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onNewWorkspace();
                setIsOpen(false);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl text-left flex items-center gap-2 hover:bg-grey-soft text-text-primary transition-colors cursor-pointer text-[11.5px]"
              role="menuitem"
            >
              <Plus className="w-3.5 h-3.5 text-text-secondary" />
              <span>New Blank Canvas</span>
            </button>

            <button
              onClick={() => {
                onExportPsychis();
                setIsOpen(false);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl text-left flex items-center gap-2 hover:bg-grey-soft text-text-primary transition-colors cursor-pointer text-[11.5px]"
              role="menuitem"
            >
              <Download className="w-3.5 h-3.5 text-text-secondary" />
              <span>Export .psychis file</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-2.5 py-1.5 rounded-xl text-left flex items-center gap-2 hover:bg-grey-soft text-text-primary transition-colors cursor-pointer text-[11.5px]"
              role="menuitem"
            >
              <Upload className="w-3.5 h-3.5 text-text-secondary" />
              <span>Import .psychis file</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear all nodes from the current canvas?')) {
                  onClearCanvas();
                  setIsOpen(false);
                }
              }}
              className="w-full px-2.5 py-1.5 rounded-xl text-left flex items-center gap-2 hover:bg-red-50 text-red-700 transition-colors cursor-pointer text-[11.5px]"
              role="menuitem"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Clear Canvas</span>
            </button>
          </div>

          {/* Hidden File Input for .psychis */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".psychis,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </aside>
  );
};
