import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, User, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import { PsychisLogo } from './PsychisLogo';

export const AccessKeyModal = ({ isOpen, currentAuth, onSaveAuth, isGatekeeper = false, onLogout }) => {
  const [accessKey, setAccessKey] = useState('');
  const [handle, setHandle] = useState(currentAuth?.handle || 'Researcher 01');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAccessKey('');
      setErrorMsg('');
      setIsShaking(false);
      setUnlockedSuccess(false);
      setHandle(currentAuth?.handle || 'Researcher 01');
    }
  }, [isOpen, currentAuth]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanKey = accessKey.trim();

    // Strictly enforce secret code: 2347
    if (cleanKey !== '2347') {
      setErrorMsg('Invalid Protocol Access Code');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setErrorMsg('');
    setUnlockedSuccess(true);
    setTimeout(() => {
      onSaveAuth({
        accessKey: '2347',
        handle: handle.trim() || 'Researcher 01',
        authenticatedAt: Date.now(),
      });
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#1E1B18]/65 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="PSYCHIS Access Gateway"
    >
      <div
        className={`bg-white-pure border ${
          isShaking ? 'border-red-500 animate-shake' : 'border-grey-strong'
        } rounded-3xl p-7 shadow-[0_25px_70px_rgba(0,0,0,0.28)] max-w-[420px] w-full text-text-primary transition-all duration-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-grey-medium">
          <div className="flex items-center gap-2.5">
            <PsychisLogo size={32} background="white" />
            <div>
              <h2 className="font-display text-base font-semibold text-text-primary leading-tight">
                PSYCHIS Access Gateway
              </h2>
              <span className="font-mono text-[10px] text-text-muted">Protocol v2026.1 // Wired Sanctuary</span>
            </div>
          </div>
          <span className="font-mono text-[9.5px] font-semibold text-text-secondary bg-grey-soft px-2 py-0.5 rounded border border-grey-medium">
            AUTH 01
          </span>
        </div>

        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          Spatial knowledge engine is protected by high-security protocol. Enter the secret access key to initialize your contemplative atelier.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Secret Access Code
            </label>
            <div
              className={`flex items-center gap-2 bg-grey-soft/80 border ${
                errorMsg ? 'border-red-500 bg-red-50/40' : 'border-grey-strong'
              } rounded-xl px-3.5 py-2.5 transition-colors`}
            >
              <Key className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="password"
                value={accessKey}
                onChange={(e) => {
                  setAccessKey(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter 4-digit access code"
                className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-text-primary placeholder:text-text-faint tracking-widest"
                autoFocus
                required
              />
            </div>
            {errorMsg && (
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-red-600 font-semibold mt-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-mono text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Researcher Handle (Optional)
            </label>
            <div className="flex items-center gap-2 bg-grey-soft/80 border border-grey-strong rounded-xl px-3.5 py-2.5">
              <User className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Researcher 01"
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-text-primary placeholder:text-text-faint"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            {!isGatekeeper && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="btn-contemplative px-3.5 py-2 rounded-xl text-xs text-red-600 hover:!bg-red-50 mr-auto"
              >
                Log Out
              </button>
            )}

            <button
              type="submit"
              className="btn-contemplative btn-dark px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer w-full justify-center"
            >
              {unlockedSuccess ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <span>Unlock Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};