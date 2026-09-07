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
  Sparkles,
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
  onOpenAISettings,
  className = '',
  inlineTrigger = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close dropdown on outside click and reset confirmClear
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setConfirmClear(false);
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
    <div
      ref={dropdownRef}
      className={`relative select-none font-mono text-xs ${className}`}
      aria-label="Workspace and board manager"
    >
      {/* Top Floating Pill */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          inlineTrigger
            ? 'flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-grey-soft/80 text-text-primary transition-all duration-150 active:scale-95 cursor-pointer h-7 text-xs font-sans'
            : 'flex items-center gap-2 px-3 py-1 rounded-xl bg-white-pure hover:bg-grey-soft/90 backdrop-blur-xl border border-grey-medium/70 hover:border-text-primary/30 shadow-3xs text-text-primary transition-all duration-150 active:scale-95 cursor-pointer h-8 text-xs font-sans'
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Layers className="w-3.5 h-3.5 text-text-secondary" />
        <span className="font-medium text-[11.5px] max-w-[140px] sm:max-w-[200px] truncate text-text-primary">
          {currentWorkspace?.name || 'Applied Kinematics'}
        </span>
        <span className="text-[10px] bg-grey-medium/80 px-1.5 py-0.2 rounded-md font-mono text-text-secondary font-semibold">
          {nodeCount}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Solid Opaque Dropdown Deck */}
      {isOpen && (
        <div
          className="absolute top-11 left-0 w-[310px] bg-white border border-[#D5D2CC] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.22)] p-2 animate-in fade-in zoom-in-95 duration-150 text-text-primary z-50 opacity-100"
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
              className="w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between hover:bg-grey-soft text-text-primary transition-colors cursor-pointer text-[11.5px]"
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-text-primary" />
                <span className="font-medium">Start New Investigation...</span>
              </div>
              <span className="text-[9px] font-mono bg-grey-medium px-1.5 py-0.5 rounded text-text-muted">From Scratch</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAISettings?.();
              }}
              className="w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between hover:bg-grey-soft text-text-primary transition-colors cursor-pointer text-[11.5px]"
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-medium">AI Engine & API Settings</span>
              </div>
              <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">Groq Cloud</span>
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!confirmClear) {
                  setConfirmClear(true);
                } else {
                  setConfirmClear(false);
                  setIsOpen(false);
                  onClearCanvas();
                }
              }}
              className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer text-[11.5px] ${
                confirmClear
                  ? 'bg-red-600 text-white font-semibold hover:bg-red-700'
                  : 'hover:bg-red-50 text-red-700'
              }`}
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                <Trash2 className={`w-3.5 h-3.5 ${confirmClear ? 'text-white' : 'text-red-500'}`} />
                <span>{confirmClear ? 'Click again to confirm Clear' : 'Clear Canvas'}</span>
              </div>
              {confirmClear && <span className="text-[10px] bg-red-800/60 text-white px-1.5 py-0.5 rounded">Confirm</span>}
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
    </div>
  );
};
