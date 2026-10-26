import { parseWebPage } from "./webParser";

const CACHE_TTL = 5 * 60 * 1000;
const CACHE_MAX_SIZE = 50;
const pageCache = new Map();

async function fetchHtmlWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getOrParseHtml(url) {
  const now = Date.now();
  const cached = pageCache.get(url);

  if (cached) {
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    pageCache.delete(url);
  }

  try {
    const html = await fetchHtmlWithTimeout(url);
    const parsed = await parseWebPage(html, url);

    if (!parsed?.success) {
      return null;
    }

    if (pageCache.size >= CACHE_MAX_SIZE) {
      const oldestKey = pageCache.keys().next().value;
      pageCache.delete(oldestKey);
    }

    pageCache.set(url, { data: parsed, timestamp: now });
    return parsed;
  } catch (error) {
    console.warn("Deterministic web parsing fetch/parse error:", error);
    return null;
  }
}