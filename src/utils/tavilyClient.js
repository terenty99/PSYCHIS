/**
 * PSYCHIS Tavily Search Engine Client
 * Version: 2026.1
 * 
 * Directly queries the Tavily Search API (https://api.tavily.com/search)
 * for real-time web retrieval, factual extraction, exact source URLs, and answers.
 */

export const STORAGE_KEY_TAVILY_KEY = 'psychis_tavily_api_key';
export const STORAGE_KEY_TAVILY_DEPTH = 'psychis_tavily_search_depth';

export const DEFAULT_TAVILY_KEY = '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';

/**
 * Retrieve stored Tavily API Key from localStorage or environment
 */
export function getStoredTavilyKey() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_TAVILY_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TAVILY_API_KEY) {
    return import.meta.env.VITE_TAVILY_API_KEY.trim();
  }
  return DEFAULT_TAVILY_KEY;
}

/**
 * Persist Tavily API Key to localStorage
 */
export function setStoredTavilyKey(key) {
  if (typeof localStorage !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY_TAVILY_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_TAVILY_KEY);
    }
  }
}

/**
 * Get search depth ('basic' | 'advanced')
 */
export function getStoredTavilyDepth() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY_TAVILY_DEPTH) || 'basic';
  }
  return 'basic';
}

/**
 * Set search depth ('basic' | 'advanced')
 */
export function setStoredTavilyDepth(depth) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_TAVILY_DEPTH, depth === 'advanced' ? 'advanced' : 'basic');
  }
}

/**
 * Execute real-time search on Tavily Search API
 * @param {Object} options
 * @param {string} options.query - The user search query
 * @param {string} [options.apiKey] - Optional explicit API key, falls back to stored key
 * @param {string} [options.searchDepth] - 'basic' or 'advanced'
 * @param {number} [options.maxResults] - Max search results to return (default: 5)
 * @param {boolean} [options.includeAnswer] - Whether to request Tavily's direct synthesized answer
 * @param {boolean} [options.includeImages] - Whether to return related image URLs
 * @returns {Promise<{ success: boolean, answer?: string, results: Array<{title: string, url: string, content: string, score: number}>, images?: Array<string>, error?: string }>}
 */
export async function searchTavily({
  query,
  apiKey,
  searchDepth,
  maxResults = 5,
  includeAnswer = true,
  includeImages = true,
}) {
  const keyToUse = (apiKey || getStoredTavilyKey() || '').trim();
  if (!keyToUse) {
    return {
      success: false,
      error: 'NO_KEY',
      results: [],
      answer: '',
      message: 'Tavily API key not configured. Add your key in AI Settings.',
    };
  }

  const depthToUse = searchDepth || getStoredTavilyDepth();

  try {
    const payload = {
      api_key: keyToUse,
      query: query.trim(),
      search_depth: depthToUse,
      include_answer: includeAnswer,
      include_images: includeImages,
      max_results: Math.min(Math.max(maxResults, 1), 10),
    };

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedMsg = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedMsg = jsonErr.detail?.error || jsonErr.message || jsonErr.detail || errText;
      } catch (e) {}
      return {
        success: false,
        error: `HTTP_${res.status}`,
        message: parsedMsg,
        results: [],
      };
    }

    const data = await res.json();
    return {
      success: true,
      query: data.query || query,
      answer: data.answer || '',
      results: Array.isArray(data.results) ? data.results : [],
      images: Array.isArray(data.images) ? data.images : [],
    };
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return {
      success: false,
      error: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: isTimeout ? 'Tavily search request timed out.' : err.message,
      results: [],
    };
  }
}

/**
 * Ping Tavily API to verify key validity and measure latency
 */
export async function testTavilyConnection(apiKey) {
  const keyToTest = (apiKey || getStoredTavilyKey() || '').trim();
  if (!keyToTest) {
    return {
      success: false,
      message: 'Tavily API Key is empty (must start with tvly-...).',
      latencyMs: 0,
    };
  }

  const startTime = performance.now();
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: keyToTest,
        query: 'ping',
        search_depth: 'basic',
        max_results: 1,
      }),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errText = await res.text();
      let msg = errText;
      try {
        const parsed = JSON.parse(errText);
        msg = parsed.detail?.error || parsed.message || parsed.detail || errText;
      } catch (e) {}
      return {
        success: false,
        message: `Tavily error (${res.status}): ${msg}`,
        latencyMs,
      };
    }

    return {
      success: true,
      message: `Connected to Tavily Web Search API (${latencyMs}ms)`,
      latencyMs,
    };
  } catch (err) {
    return {
      success: false,
      message: `Connection failed: ${err.message}`,
      latencyMs: Math.round(performance.now() - startTime),
    };
  }
}
