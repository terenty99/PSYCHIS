import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  Cpu,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Zap,
  Tv,
  Music,
} from 'lucide-react';
import {
  getStoredGroqKey,
  setStoredGroqKey,
  getStoredGroqModel,
  setStoredGroqModel,
  GROQ_MODELS,
  fetchGroqLiveModels,
  testGroqConnection,
  getStoredAiMode,
  setStoredAiMode,
  getStoredBackendUrl,
  setStoredBackendUrl,
  getStoredYouTubeKey,
  setStoredYouTubeKey,
  getStoredSpotifyCredentials,
  setStoredSpotifyCredentials,
  DEFAULT_GROQ_KEY,
} from '../../utils/geminiClient';

export const AISettingsModal = ({ isOpen = false, onClose, onSettingsSaved }) => {
  const [groqKey, setGroqKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [groqModel, setGroqModel] = useState('openai/gpt-oss-120b');
  const [groqModelList, setGroqModelList] = useState(GROQ_MODELS);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  const [aiMode, setAiMode] = useState('auto');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');

  // Media APIs
  const [youtubeKey, setYoutubeKey] = useState('');
  const [spotifyClientId, setSpotifyClientId] = useState('');
  const [spotifyClientSecret, setSpotifyClientSecret] = useState('');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleResetToDefaultGroqKey = () => {
    setGroqKey(DEFAULT_GROQ_KEY);
    setTestResult(null);
    if (DEFAULT_GROQ_KEY) {
      loadGroqLiveModels(DEFAULT_GROQ_KEY);
    }
  };

  const loadGroqLiveModels = async (keyToUse) => {
    const k = (keyToUse || groqKey || '').trim();
    if (!k || k.length < 10) return;
    setIsFetchingModels(true);
    const live = await fetchGroqLiveModels(k);
    setIsFetchingModels(false);
    if (live && live.length > 0) {
      setGroqModelList(live);
      if (!live.some((m) => m.id === groqModel)) {
        setGroqModel(live[0].id);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const gKey = getStoredGroqKey();
      const currentGModel = getStoredGroqModel();
      setGroqKey(gKey);
      setGroqModel(currentGModel);
      setAiMode(getStoredAiMode());
      setBackendUrl(getStoredBackendUrl());

      setYoutubeKey(getStoredYouTubeKey());
      const spot = getStoredSpotifyCredentials();
      setSpotifyClientId(spot.clientId);
      setSpotifyClientSecret(spot.clientSecret);

      setTestResult(null);
      setSavedSuccess(false);
      setShowKey(false);

      if (gKey) {
        loadGroqLiveModels(gKey);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testGroqConnection(groqKey, groqModel);
    if (result.suggestedModels && result.suggestedModels.length > 0) {
      setGroqModelList(result.suggestedModels);
      if (!result.suggestedModels.some((m) => m.id === groqModel)) {
        setGroqModel(result.suggestedModels[0].id);
      }
    }
    setIsTesting(false);
    setTestResult(result);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setStoredGroqKey(groqKey);
    setStoredGroqModel(groqModel);
    setStoredAiMode(aiMode);
    setStoredBackendUrl(backendUrl);

    setStoredYouTubeKey(youtubeKey);
    setStoredSpotifyCredentials(spotifyClientId, spotifyClientSecret);

    setSavedSuccess(true);
    if (onSettingsSaved) {
      onSettingsSaved({ provider: 'groq', groqKey, groqModel, aiMode, backendUrl, youtubeKey });
    }

    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[94vw] bg-[#FFFFFF] border border-[#C5C2BC] rounded-3xl shadow-[0_25px_65px_rgba(0,0,0,0.35)] p-6 select-none animate-in zoom-in-95 duration-200 text-[#1A1816]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Groq AI Engine Settings"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E5E2DC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#FFF7ED] border border-[#FDBA74] flex items-center justify-center text-[#EA580C] shadow-2xs">
              <Zap className="w-4 h-4 text-[#EA580C]" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#1A1816] leading-tight flex items-center gap-2">
                <span>Groq Cloud AI Engine</span>
                <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              </h2>
              <p className="font-mono text-[10.5px] text-[#6B655A] mt-0.5">
                Ultra-fast inference (500 T/s) • 14,400 free req/day • Llama 3.3 70B & DeepSeek R1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-[#F4F2ED] hover:bg-[#EAE7E0] border border-[#DDD9D2] flex items-center justify-center text-[#6B655A] hover:text-[#1A1816] transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* GROQ API KEY & MODEL SECTION */}
          <div className="bg-[#FFFBF5] border border-[#FDBA74]/60 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10.5px] font-bold text-[#9A3412] uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Groq API Key</span>
              </label>
              <div className="flex items-center gap-2">
                {DEFAULT_GROQ_KEY && (
                  <button
                    type="button"
                    onClick={handleResetToDefaultGroqKey}
                    className="font-mono text-[9.5px] text-[#EA580C] hover:underline cursor-pointer"
                  >
                    Use Built-in Key
                  </button>
                )}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[9.5px] text-[#EA580C] hover:underline flex items-center gap-0.5"
                >
                  <span>Get Free Key</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#FED7AA] rounded-xl px-3 py-2 focus-within:border-[#EA580C] focus-within:ring-1 focus-within:ring-[#EA580C]/20 transition-all shadow-2xs">
              <input
                type={showKey ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => {
                  const newKey = e.target.value;
                  setGroqKey(newKey);
                  setTestResult(null);
                  if (newKey.trim().startsWith('gsk_') && newKey.trim().length > 25) {
                    loadGroqLiveModels(newKey);
                  }
                }}
                placeholder="gsk_..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-[#1A1816] placeholder:text-[#A8A49E] tracking-wider select-text"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[#8A8782] hover:text-[#1A1816] cursor-pointer p-0.5"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-[10px] font-bold text-[#9A3412] uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-[#EA580C]" />
                  <span>Groq AI Model</span>
                </label>
                <button
                  type="button"
                  onClick={() => loadGroqLiveModels(groqKey)}
                  disabled={isFetchingModels || !groqKey}
                  className="font-mono text-[9px] text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-2.5 h-2.5 ${isFetchingModels ? 'animate-spin' : ''}`} />
                  <span>{isFetchingModels ? 'Detecting...' : 'Auto-Detect Live Models'}</span>
                </button>
              </div>
              <select
                value={groqModel}
                onChange={(e) => {
                  setGroqModel(e.target.value);
                  setTestResult(null);
                }}
                className="w-full bg-[#FFFFFF] border border-[#FED7AA] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1A1816] outline-none cursor-pointer focus:border-[#EA580C]"
              >
                {groqModelList.map((gm) => (
                  <option key={gm.id} value={gm.id}>
                    {gm.name} {gm.badge ? `(${gm.badge})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Routing Mode & Backend URL */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-mono text-[10px] font-bold text-[#4A4540] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>AI Execution Mode</span>
              </label>
              <select
                value={aiMode}
                onChange={(e) => setAiMode(e.target.value)}
                className="w-full bg-[#F8F7F4] border border-[#D5D2CC] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1A1816] outline-none cursor-pointer focus:border-[#1A1816]"
              >
                <option value="auto">Auto (Direct Groq Cloud → Fallback)</option>
                <option value="direct">Direct Groq Cloud API Only</option>
                <option value="backend">Local Python Server Only</option>
                <option value="offline">Offline Synthesizer (No API)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold text-[#4A4540] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Server className="w-3 h-3 text-[#6B655A]" />
                <span>Backend Port / URL</span>
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full bg-[#F8F7F4] border border-[#D5D2CC] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1A1816] outline-none focus:border-[#1A1816]"
              />
            </div>
          </div>

          {/* MEDIA & INGESTION APIS (OPTIONAL) */}
          <div className="bg-[#F9F8F6] border border-[#E0DCD5] rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-[#4A4540] uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="w-3 h-3 text-red-500" />
                <span>Media &amp; Ingestion APIs (Optional)</span>
              </span>
              <span className="font-mono text-[9px] text-[#8A857D]">
                Built-in free fallbacks active
              </span>
            </div>

            {/* YouTube Data API v3 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-[9.5px] font-semibold text-[#5A554E] flex items-center gap-1">
                  <span>YouTube Data API v3 Key</span>
                </label>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[9px] text-amber-700 hover:underline"
                >
                  Get Free Key (10k units/day) ↗
                </a>
              </div>
              <input
                type="password"
                value={youtubeKey}
                onChange={(e) => setYoutubeKey(e.target.value)}
                placeholder="AIzaSy... (Paste free YouTube key)"
                className="w-full bg-[#FFFFFF] border border-[#D5D2CC] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1A1816] outline-none focus:border-red-500 placeholder:text-[#A8A49E]"
              />
            </div>

            {/* Spotify / Custom Audio API */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-mono text-[9.5px] font-semibold text-[#5A554E] mb-1 flex items-center gap-1">
                  <Music className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Spotify Client ID</span>
                </label>
                <input
                  type="password"
                  value={spotifyClientId}
                  onChange={(e) => setSpotifyClientId(e.target.value)}
                  placeholder="Client ID"
                  className="w-full bg-[#FFFFFF] border border-[#D5D2CC] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1A1816] outline-none focus:border-emerald-600 placeholder:text-[#A8A49E]"
                />
              </div>
              <div>
                <label className="block font-mono text-[9.5px] font-semibold text-[#5A554E] mb-1">
                  <span>Spotify Client Secret</span>
                </label>
                <input
                  type="password"
                  value={spotifyClientSecret}
                  onChange={(e) => setSpotifyClientSecret(e.target.value)}
                  placeholder="Client Secret"
                  className="w-full bg-[#FFFFFF] border border-[#D5D2CC] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1A1816] outline-none focus:border-emerald-600 placeholder:text-[#A8A49E]"
                />
              </div>
            </div>
          </div>

          {/* Test Connection Output */}
          {testResult && (
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-mono text-[11px] animate-in fade-in duration-150 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <div className="flex-1 truncate">
                <span>{testResult.message}</span>
                {testResult.latencyMs > 0 && (
                  <span className="opacity-75 ml-2 font-semibold">({testResult.latencyMs}ms)</span>
                )}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E5E2DC]">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-2 rounded-xl border border-[#D5D2CC] hover:bg-[#F4F2ED] text-[#4A4540] font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#EA580C]' : 'text-[#EA580C]'}`} />
              <span>{isTesting ? 'Testing Groq...' : 'Test Groq Connection'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#D5D2CC] text-[#4A4540] hover:bg-[#F4F2ED] font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2E2A27] hover:bg-[#151311] text-[#FFFFFF] font-mono text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>{savedSuccess ? 'Saved ✓' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
