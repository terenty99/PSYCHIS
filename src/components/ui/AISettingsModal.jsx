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
  Globe,
  Bot,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getStoredAiProvider,
  setStoredAiProvider,
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
  testSpotifyConnection,
  DEFAULT_GROQ_KEY,
} from '../../utils/geminiClient';
import {
  getStoredTavilyKey,
  setStoredTavilyKey,
  getStoredTavilyDepth,
  setStoredTavilyDepth,
  testTavilyConnection,
} from '../../utils/tavilyClient';

export const AISettingsModal = ({ isOpen = false, onClose, onSettingsSaved }) => {
  // Groq Configuration
  const [groqKey, setGroqKey] = useState('');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [groqModel, setGroqModel] = useState('openai/gpt-oss-120b');
  const [groqModelList, setGroqModelList] = useState(GROQ_MODELS);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isTestingGroq, setIsTestingGroq] = useState(false);
  const [groqTestResult, setGroqTestResult] = useState(null);

  // System & Routing
  const [aiMode, setAiMode] = useState('auto');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');

  // Tavily Search & RAG
  const [tavilyKey, setTavilyKey] = useState('');
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [tavilyDepth, setTavilyDepth] = useState('basic');
  const [isTestingTavily, setIsTestingTavily] = useState(false);
  const [tavilyTestResult, setTavilyTestResult] = useState(null);

  // Media APIs
  const [showMediaSection, setShowMediaSection] = useState(false);
  const [youtubeKey, setYoutubeKey] = useState('');
  const [spotifyClientId, setSpotifyClientId] = useState('');
  const [spotifyClientSecret, setSpotifyClientSecret] = useState('');
  const [showSpotifySecret, setShowSpotifySecret] = useState(false);
  const [isTestingSpotify, setIsTestingSpotify] = useState(false);
  const [spotifyTestResult, setSpotifyTestResult] = useState(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleResetToDefaultGroqKey = () => {
    setGroqKey(DEFAULT_GROQ_KEY);
    setGroqTestResult(null);
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
      setGroqTestResult(null);
      setShowGroqKey(false);

      setAiMode(getStoredAiMode());
      setBackendUrl(getStoredBackendUrl());

      setTavilyKey(getStoredTavilyKey());
      setTavilyDepth(getStoredTavilyDepth());
      setTavilyTestResult(null);
      setShowTavilyKey(false);

      setYoutubeKey(getStoredYouTubeKey());
      const spot = getStoredSpotifyCredentials();
      setSpotifyClientId(spot.clientId);
      setSpotifyClientSecret(spot.clientSecret);

      setSavedSuccess(false);

      if (gKey) {
        loadGroqLiveModels(gKey);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestGroq = async () => {
    setIsTestingGroq(true);
    setGroqTestResult(null);
    const result = await testGroqConnection(groqKey, groqModel);
    if (result.suggestedModels && result.suggestedModels.length > 0) {
      setGroqModelList(result.suggestedModels);
      if (!result.suggestedModels.some((m) => m.id === groqModel)) {
        setGroqModel(result.suggestedModels[0].id);
      }
    }
    setIsTestingGroq(false);
    setGroqTestResult(result);
  };

  const handleTestTavily = async () => {
    setIsTestingTavily(true);
    setTavilyTestResult(null);
    const result = await testTavilyConnection(tavilyKey);
    setIsTestingTavily(false);
    setTavilyTestResult(result);
  };

  const handleTestSpotify = async () => {
    setIsTestingSpotify(true);
    setSpotifyTestResult(null);
    const result = await testSpotifyConnection(spotifyClientId, spotifyClientSecret);
    setIsTestingSpotify(false);
    setSpotifyTestResult(result);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setStoredAiProvider('groq');

    setStoredGroqKey(groqKey);
    setStoredGroqModel(groqModel);

    setStoredAiMode(aiMode);
    setStoredBackendUrl(backendUrl);

    setStoredTavilyKey(tavilyKey);
    setStoredTavilyDepth(tavilyDepth);

    setStoredYouTubeKey(youtubeKey);
    setStoredSpotifyCredentials(spotifyClientId, spotifyClientSecret);

    setSavedSuccess(true);
    if (onSettingsSaved) {
      onSettingsSaved({
        provider: 'groq',
        groqKey,
        groqModel,
        aiMode,
        backendUrl,
        youtubeKey,
        tavilyKey,
        tavilyDepth,
      });
    }

    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[560px] max-w-[95vw] max-h-[90vh] flex flex-col bg-[#FFFFFF] border border-[#C5C2BC] rounded-3xl shadow-[0_25px_65px_rgba(0,0,0,0.35)] p-6 select-none animate-in zoom-in-95 duration-200 text-[#1A1816]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="AI Engine & Synthesizer Settings"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E5E2DC] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] shadow-2xs">
              <Bot className="w-5 h-5 text-[#EA580C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-[#1A1816] leading-tight">
                  AI Synthesizer &amp; Engine
                </h2>
                <span className="font-mono text-[9px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-semibold">
                  Groq Cloud Active
                </span>
              </div>
              <p className="font-mono text-[10.5px] text-[#6B655A] mt-0.5">
                Groq neural synthesis • Tavily live web grounding • High-speed RAG
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

        {/* Scrollable Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-1 space-y-4">

          {/* GROQ SETTINGS CARD */}
          <div className="bg-[#FFFBF5] border border-[#FDBA74]/60 rounded-2xl p-4 space-y-3.5 animate-in fade-in duration-150">
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
                  type={showGroqKey ? 'text' : 'password'}
                  value={groqKey}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    setGroqKey(newKey);
                    setGroqTestResult(null);
                    if (newKey.trim().startsWith('gsk_') && newKey.trim().length > 25) {
                      loadGroqLiveModels(newKey);
                    }
                  }}
                  placeholder="gsk_..."
                  className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-[#1A1816] placeholder:text-[#A8A49E] tracking-wider select-text"
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  className="text-[#8A8782] hover:text-[#1A1816] cursor-pointer p-0.5"
                  title={showGroqKey ? 'Hide key' : 'Show key'}
                >
                  {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
                    setGroqTestResult(null);
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

              {/* Groq Test Button & Status */}
              <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleTestGroq}
                  disabled={isTestingGroq || !groqKey}
                  className="px-3 py-1.5 rounded-xl border border-[#EA580C]/40 text-[#9A3412] bg-white hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Activity className={`w-3.5 h-3.5 ${isTestingGroq ? 'animate-spin text-[#EA580C]' : 'text-[#EA580C]'}`} />
                  <span>{isTestingGroq ? 'Testing Groq...' : 'Test Groq Connection'}</span>
                </button>

                {groqTestResult && (
                  <div
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-[10.5px] animate-in fade-in duration-150 ${
                      groqTestResult.success
                        ? 'bg-emerald-100/90 border-emerald-400 text-emerald-900'
                        : 'bg-red-50 border-red-300 text-red-800'
                    }`}
                  >
                    {groqTestResult.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    )}
                    <span className="truncate">{groqTestResult.message}</span>
                    {groqTestResult.latencyMs > 0 && (
                      <span className="font-bold opacity-85 shrink-0">({groqTestResult.latencyMs}ms)</span>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* Tavily Web Search & Grounding Engine */}
          <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="font-mono text-xs font-bold text-[#14532D] uppercase tracking-wider">
                  Tavily Web Search &amp; Grounding
                </span>
                <span className="font-mono text-[9px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                  Built-in Live RAG Active
                </span>
              </div>
              <a
                href="https://app.tavily.com"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[9.5px] text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <span>Get Personal Key</span>
                <span>↗</span>
              </a>
            </div>

            <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#86EFAC] rounded-xl px-3 py-2 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all shadow-2xs">
              <input
                type={showTavilyKey ? 'text' : 'password'}
                value={tavilyKey}
                onChange={(e) => {
                  setTavilyKey(e.target.value);
                  setTavilyTestResult(null);
                }}
                placeholder="tvly-... (Built-in key configured)"
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-[#1A1816] placeholder:text-[#A8A49E] tracking-wider select-text"
              />
              <button
                type="button"
                onClick={() => setShowTavilyKey(!showTavilyKey)}
                className="text-[#8A8782] hover:text-[#1A1816] cursor-pointer p-0.5"
                title={showTavilyKey ? 'Hide key' : 'Show key'}
              >
                {showTavilyKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold text-[#14532D]">Search Depth:</span>
                <div className="flex rounded-lg border border-[#86EFAC] p-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => setTavilyDepth('basic')}
                    className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-medium transition-colors cursor-pointer ${
                      tavilyDepth === 'basic' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[#4A4540] hover:text-[#1A1816]'
                    }`}
                  >
                    Basic (Fast)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTavilyDepth('advanced')}
                    className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-medium transition-colors cursor-pointer ${
                      tavilyDepth === 'advanced' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[#4A4540] hover:text-[#1A1816]'
                    }`}
                  >
                    Advanced (Deep)
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestTavily}
                disabled={isTestingTavily || !tavilyKey}
                className="font-mono text-[10px] px-2.5 py-1 rounded-lg border border-emerald-600/40 text-emerald-800 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Activity className={`w-3 h-3 ${isTestingTavily ? 'animate-spin' : ''}`} />
                {isTestingTavily ? 'Testing...' : 'Test Tavily'}
              </button>
            </div>

            {tavilyTestResult && (
              <div
                className={`p-2 rounded-xl border flex items-center gap-2 font-mono text-[10.5px] animate-in fade-in duration-150 ${
                  tavilyTestResult.success
                    ? 'bg-emerald-100/70 border-emerald-400 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                {tavilyTestResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                )}
                <span className="flex-1 truncate">{tavilyTestResult.message}</span>
              </div>
            )}
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
                <option value="auto">Auto (Direct Cloud AI → Fallback)</option>
                <option value="direct">Direct Cloud AI Only</option>
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

          {/* MEDIA & INGESTION APIS (OPTIONAL / COLLAPSIBLE) */}
          <div className="bg-[#F9F8F6] border border-[#E0DCD5] rounded-2xl p-3.5 space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowMediaSection(!showMediaSection)}
            >
              <span className="font-mono text-[10px] font-bold text-[#4A4540] uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="w-3 h-3 text-red-500" />
                <span>Media &amp; Ingestion APIs (YouTube / Spotify)</span>
              </span>
              <div className="flex items-center gap-1 text-[#8A857D] font-mono text-[9px]">
                <span>{showMediaSection ? 'Collapse' : 'Expand'}</span>
                {showMediaSection ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </div>
            </div>

            {showMediaSection && (
              <div className="space-y-3 pt-2 border-t border-[#E5E2DC]/80 animate-in fade-in duration-150">
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

                {/* Spotify Web API Integration */}
                <div className="pt-2 border-t border-[#E5E2DC]/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-mono text-[9.5px] font-semibold text-[#5A554E] flex items-center gap-1">
                      <Music className="w-3 h-3 text-emerald-600" />
                      <span>Spotify Web API (Official Music Metadata &amp; Covers)</span>
                    </label>
                    <a
                      href="https://developer.spotify.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[9px] text-emerald-600 hover:text-emerald-700 underline flex items-center gap-0.5"
                    >
                      Get Keys ↗
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono text-[9px] text-[#7A7570] mb-0.5">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={spotifyClientId}
                        onChange={(e) => setSpotifyClientId(e.target.value)}
                        placeholder="32-character ID"
                        className="w-full bg-[#FFFFFF] border border-[#D5D2CC] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1A1816] outline-none focus:border-emerald-600 placeholder:text-[#A8A49E]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block font-mono text-[9px] text-[#7A7570]">
                          Client Secret
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowSpotifySecret((prev) => !prev)}
                          className="text-[#7A7570] hover:text-[#1A1816] text-[9px] font-mono flex items-center gap-0.5 cursor-pointer"
                        >
                          {showSpotifySecret ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                      <input
                        type={showSpotifySecret ? 'text' : 'password'}
                        value={spotifyClientSecret}
                        onChange={(e) => setSpotifyClientSecret(e.target.value)}
                        placeholder="32-character Secret"
                        className="w-full bg-[#FFFFFF] border border-[#D5D2CC] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1A1816] outline-none focus:border-emerald-600 placeholder:text-[#A8A49E]"
                      />
                    </div>
                  </div>

                  {/* Spotify Test Button & Status */}
                  <div className="mt-2 flex items-center justify-between flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={handleTestSpotify}
                      disabled={isTestingSpotify || !spotifyClientId || !spotifyClientSecret}
                      className="font-mono text-[10px] px-2.5 py-1 rounded-lg border border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Activity className={`w-3 h-3 ${isTestingSpotify ? 'animate-spin' : ''}`} />
                      {isTestingSpotify ? 'Connecting...' : 'Test Spotify API'}
                    </button>
                    {spotifyTestResult && (
                      <span
                        className={`font-mono text-[9.5px] px-2 py-0.5 rounded ${
                          spotifyTestResult.success
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {spotifyTestResult.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-[#E5E2DC] shrink-0">
          <div className="font-mono text-[10px] text-[#6B655A] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active: Groq Cloud AI Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#D5D2CC] text-[#4A4540] hover:bg-[#F4F2ED] font-mono text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#1A1816] hover:bg-[#000000] text-[#FFFFFF] font-mono text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>{savedSuccess ? 'Saved ✓' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
