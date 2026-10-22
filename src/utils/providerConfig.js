// VITE_* values are public build-time configuration, not server-side secrets.
// Leave these unset in distributed builds; personal keys can be entered in Settings.
const env = import.meta.env || {};
export const DEFAULT_GROQ_KEY = (env.VITE_GROQ_API_KEY || '').trim();
export const DEFAULT_TAVILY_KEY = (env.VITE_TAVILY_API_KEY || '').trim();
export const DEFAULT_YOUTUBE_API_KEY = (env.VITE_YOUTUBE_API_KEY || '').trim();
export const DEFAULT_SPOTIFY_CLIENT_ID = (env.VITE_SPOTIFY_CLIENT_ID || '').trim();
export const DEFAULT_SPOTIFY_CLIENT_SECRET = (env.VITE_SPOTIFY_CLIENT_SECRET || '').trim();
