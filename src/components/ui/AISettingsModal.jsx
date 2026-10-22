import React, { useEffect, useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { getStoredGroqKey, setStoredGroqKey, getStoredYouTubeKey, setStoredYouTubeKey,
  getStoredSpotifyCredentials, setStoredSpotifyCredentials, OFFICIAL_REMOTE_BACKEND_URL } from '../../utils/engineClient';
import { getStoredTavilyKey, setStoredTavilyKey } from '../../utils/tavilyClient';

function KeyField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);
  return <label className="block space-y-2 text-xs text-[#4A4540]">
    <span>{label}</span>
    <span className="flex gap-2 rounded-xl border border-[#DDD9D2] bg-white px-3 py-2.5">
      <input aria-label={label} type={visible ? 'text' : 'password'} value={value}
        onChange={(e) => onChange(e.target.value)} autoComplete="off" spellCheck={false}
        className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none select-text" />
      <button type="button" aria-label={`${visible ? 'Hide' : 'Show'} ${label}`} onClick={() => setVisible(!visible)}>
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </span>
  </label>;
}

export const AISettingsModal = ({ isOpen = false, onClose, onSettingsSaved }) => {
  const [keys, setKeys] = useState({ groq: '', tavily: '', youtube: '', spotifyId: '', spotifySecret: '' });
  const [connection, setConnection] = useState('idle');
  useEffect(() => {
    if (!isOpen) return;
    const spotify = getStoredSpotifyCredentials();
    setKeys({ groq: getStoredGroqKey(), tavily: getStoredTavilyKey(), youtube: getStoredYouTubeKey(),
      spotifyId: spotify.clientId, spotifySecret: spotify.clientSecret });
    setConnection('idle');
  }, [isOpen]);
  if (!isOpen) return null;
  const updateKey = (name) => (value) => setKeys((previous) => ({ ...previous, [name]: value }));
  const save = (event) => {
    event.preventDefault();
    setStoredGroqKey(keys.groq);
    setStoredTavilyKey(keys.tavily);
    setStoredYouTubeKey(keys.youtube);
    setStoredSpotifyCredentials(keys.spotifyId, keys.spotifySecret);
    onSettingsSaved?.({ aiMode: 'backend', backendUrl: OFFICIAL_REMOTE_BACKEND_URL,
      groqKey: keys.groq, tavilyKey: keys.tavily, youtubeKey: keys.youtube });
    onClose();
  };
  const checkConnection = async () => {
    setConnection('checking');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${OFFICIAL_REMOTE_BACKEND_URL}/api/health`, { signal: controller.signal });
      const data = await response.json();
      setConnection(response.ok && data.status === 'ok' ? 'online' : 'offline');
    } catch { setConnection('offline'); }
    finally { clearTimeout(timeout); }
  };
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
    <form onSubmit={save} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="api-settings-title"
      className="flex max-h-[90vh] w-[440px] max-w-full flex-col rounded-3xl border border-[#DDD9D2] bg-[#FAF9F6] p-6 text-[#1A1816] shadow-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h2 id="api-settings-title" className="text-base font-semibold">API Settings</h2>
        <button type="button" onClick={onClose} aria-label="Close settings" className="rounded-lg p-1.5 hover:bg-black/5"><X size={18} /></button>
      </div>
      <div className="min-h-0 space-y-5 overflow-y-auto pr-1">
        <div className="rounded-2xl border border-[#DDD9D2] bg-white p-4">
          <div className="text-sm font-medium">PSYCHIS Server</div>
          <div className="mt-1 select-text font-mono text-xs text-[#6B655A]">{OFFICIAL_REMOTE_BACKEND_URL}</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" disabled={connection === 'checking'} onClick={checkConnection}
              className="rounded-lg border border-[#DDD9D2] px-3 py-1.5 text-xs hover:bg-[#F4F2ED] disabled:opacity-50">
              {connection === 'checking' ? 'Checking…' : 'Check connection'}
            </button>
            <span role="status" className={`text-xs ${connection === 'offline' ? 'text-red-700' : 'text-[#6B655A]'}`}>
              {connection === 'online' ? 'Server available' : connection === 'offline' ? 'Server unreachable' : ''}
            </span>
          </div>
        </div>
        <details className="rounded-2xl border border-[#DDD9D2] p-4">
          <summary className="cursor-pointer text-sm font-medium">API keys</summary>
          <p className="mt-3 text-xs leading-relaxed text-[#6B655A]">Saved on this device. Server AI uses the keys configured on the server.</p>
          <div className="mt-4 space-y-4">
            <KeyField label="Groq API key" value={keys.groq} onChange={updateKey('groq')} />
            <KeyField label="Tavily API key" value={keys.tavily} onChange={updateKey('tavily')} />
            <KeyField label="YouTube API key" value={keys.youtube} onChange={updateKey('youtube')} />
            <KeyField label="Spotify Client ID" value={keys.spotifyId} onChange={updateKey('spotifyId')} />
            <KeyField label="Spotify Client Secret" value={keys.spotifySecret} onChange={updateKey('spotifySecret')} />
          </div>
        </details>
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t border-[#E5E2DC] pt-4">
        <button type="button" onClick={onClose} className="rounded-xl border border-[#DDD9D2] px-4 py-2 text-xs">Cancel</button>
        <button type="submit" className="rounded-xl bg-[#1A1816] px-4 py-2 text-xs font-semibold text-white hover:bg-black">Save</button>
      </div>
    </form>
  </div>;
};
