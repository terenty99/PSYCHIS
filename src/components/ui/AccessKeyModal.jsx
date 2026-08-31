import React, { useState } from 'react';
import { X, Key, ShieldCheck, User } from 'lucide-react';

export const AccessKeyModal = ({ isOpen, onClose, currentAuth, onSaveAuth }) => {
  const [accessKey, setAccessKey] = useState(currentAuth?.accessKey || '');
  const [handle, setHandle] = useState(currentAuth?.handle || 'Researcher 01');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveAuth({ accessKey: accessKey.trim(), handle: handle.trim() });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[95] bg-[#3A3530]/25 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white-pure border border-grey-strong rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-w-[420px] w-full text-text-primary"
        role="dialog"
        aria-label="Client access key credentials"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-grey-medium">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-text-secondary" />
            <h2 className="font-display text-base font-semibold text-text-primary">
              PSYCHIS Protocol Access
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs"
            aria-label="Close credentials modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          Enter your secret client access key to synchronize workspaces and authenticate AI telemetry to your private atelier cloud.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[11px] text-text-muted mb-1 uppercase tracking-wider">
              Secret Access Key
            </label>
            <div className="flex items-center gap-2 bg-grey-soft/80 border border-grey-strong rounded-xl px-3 py-2">
              <Key className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="e.g. psychis-alpha-2026"
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-text-primary placeholder:text-text-faint"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-text-muted mb-1 uppercase tracking-wider">
              Client / Researcher Handle
            </label>
            <div className="flex items-center gap-2 bg-grey-soft/80 border border-grey-strong rounded-xl px-3 py-2">
              <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. Dr. Vance"
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-text-primary placeholder:text-text-faint"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-contemplative px-3.5 py-1.5 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-contemplative btn-primary-contemplative px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
