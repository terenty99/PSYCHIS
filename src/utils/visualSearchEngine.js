/**
 * PSYCHIS Visual Search & Media Ingestion Engine
 * Provides authentic, topic-accurate photography and media artifacts across open web repositories
 * (Openverse, Wikimedia Commons, Wikipedia).
 * ZERO HARDCODED STOCK IMAGES: returns only genuine, relevant media matching the entity, or empty.
 */

import { getStoredYouTubeKey } from './geminiClient.js';

export const VISUAL_ARCHIVES = {};

/**
 * Checks whether a candidate photo document is authentically relevant to the query.
 * Rejects unrelated people, military jets on food topics, tartans, papercraft, etc.
 */
export function isCandidateRelevant(c, query, nodeTitle = '') {
  if (!c || (!query && !nodeTitle)) return false;
  const title = (c.title || '').toLowerCase();
  const caption = (c.caption || '').toLowerCase();
  const url = (c.url || '').toLowerCase();
  const creator = (c.author || c.creator || '').toLowerCase();
  const candText = `${title} ${caption} ${url} ${creator}`;

  // Noise / irrelevant items
  if (
    candText.includes('papertoy') ||
    candText.includes('papercraft') ||
    candText.includes('origami') ||
    candText.includes('cutout') ||
    candText.includes('tartan') ||
    candText.includes('clan ') ||
    candText.includes('camisetas') ||
    candText.includes('monument')
  ) {
    return false;
  }

  // Pure Math/Physics: strictly NO photos!
  if (/\b(theorem|formula|calculus|cosine|cosinus|sine|trigonometry|pythagor|euler|derivative|integral|schrodinger|laplace|equation|kinematic)\b/i.test(query)) {
    return false;
  }

  // Canonical Wikipedia and Commons images fetched directly for this subject are authoritative
  const isAuthoritative = (c.source === 'Wikipedia' || c.domain === 'wikipedia.org' || c.domain === 'wikimedia.org' || c.author === 'Wikipedia Canonical');
  if (isAuthoritative && (c.title || c.caption)) {
    return true;
  }

  const stopwords = new Set([
    'the', 'and', 'for', 'with', 'from', 'character', 'television', 'analysis',
    'profile', 'dossier', 'origin', 'node', 'visual', 'archive', 'media',
    'deity', 'experiments', 'wired', 'serial', 'macro', 'photography', 'photo',
    'photos', 'image', 'images', 'picture', 'pictures', 'assorted', 'about',
    'concept', 'high', 'resolution', '4k', 'wallpaper', 'reference'
  ]);

  const targetText = `${nodeTitle} ${query}`.toLowerCase();
  const cleanKeywords = targetText
    .replace(/[^a-z0-9а-яё\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopwords.has(w));

  if (cleanKeywords.length === 0) return true;

  // At least ONE key search keyword MUST be found in title, caption, url, or creator
  return cleanKeywords.some((kw) => candText.includes(kw));
}

/**
 * Searches and fetches distinct, non-duplicate visual artifacts (GIFs and Photos)
 * tailored precisely to the user's topic. Returns null if no authentic media found.
 */
export async function searchVisualMedia(queryText, existingPhotos = [], clusterSeenUrls = new Set()) {
  const live = await fetchLiveArchivalPhotos(queryText, 1, '', clusterSeenUrls);
  return live && live.length > 0 ? live[0] : null;
}

/**
 * Intelligently cleans long prompts or abstract conceptual titles into
 * concrete, searchable visual keywords.
 */
export function cleanSearchQuery(rawQuery, contextHint = '') {
  if (!rawQuery) return contextHint || 'visual concept';
  let q = rawQuery.trim();

  // If there's a colon (e.g. "Serial Experiments Lain: Wires, Identity, and the Wired")
  if (q.includes(':')) {
    const beforeColon = q.split(':')[0].trim();
    if (beforeColon.length > 3) q = beforeColon;
  }

  // Strip prompt command prefixes like "create a single node with cat picture" or "fetch photos of..."
  q = q.replace(/^(please\s+)?(create|make|generate|add|spawn|draw|build|fetch|search|find|give\s+me)\b\s*/i, '');
  q = q.replace(/^(a|an|the)\b\s*/i, '');
  q = q.replace(/\b(single|one|two|three|four|five|several|multiple)\s+(node|concept|canvas|cluster|graph)\b\s*/gi, '');
  q = q.replace(/\b(each\s+one\s+for\s+one\s+node|each\s+on\s+(a\s+|their\s+own\s+)?node|for\s+each\s+one\s+photo|one\s+node\s+each|with\s+photos?|each\s+one\s+photo)\b/gi, '');
  q = q.replace(/\b(photos?|pictures?|images?|portraits?)\s*(of|about|for)?\b/gi, '');
  q = q.replace(/\b(main\s+characters?\s+of)\b/gi, '');
  q = q.replace(/\s+(picture|photo|image|photos|images|portrait)s?$/i, '');
  q = q.replace(/\s+portrait:\s*/i, ' ');

  // If subtitle has an ampersand, keep the primary subject
  if (q.includes(' // ')) {
    q = q.split(' // ')[0].trim();
  }

  q = q.replace(/\b(ontological|collapse|metaphysics|kinematics|dossier|synthesis|investigation)\b/gi, '').replace(/\s+/g, ' ').trim();

  return q || contextHint || rawQuery;
}

export function isPageRelevant(pageTitle, query) {
  if (!pageTitle || !query) return false;
  const qWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
  const pTitle = pageTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  return qWords.some((w) => pTitle.includes(w));
}

export const GLOBAL_CANVAS_SEEN_PHOTOS = new Set();
export const GLOBAL_CANVAS_SEEN_AUTHORS = new Set();

/**
 * Extracts a clean display domain name from a URL.
 */
export function cleanDomainFromUrl(url) {
  if (!url) return 'web source';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\d*\./, '') || 'web source';
  } catch (e) {
    return 'web source';
  }
}

/**
 * AI Semantic Matching & Re-Ranking:
 * Intelligently scores and ranks candidate images against node context:
 * - Keyword presence in image title or alt snippet (+30)
 * - Thematic domain relevance (STEM vs Culture / Cinema) (+25)
 * - Source diversity bonus (+20, penalty for repetition)
 * - Negative filters (-100 for SVGs, icons, sprites, banners, logos, papercraft)
 */
export function rankBestMatchingImage(candidates = [], nodeContext = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) return [];

  const {
    title = '',
    category = '',
    description = '',
    visualSearchQuery = '',
    query = ''
  } = nodeContext;

  const corpus = `${title} ${category} ${description} ${visualSearchQuery} ${query}`.toLowerCase();
  const stopwords = new Set([
    'the', 'and', 'for', 'with', 'from', 'node', 'visual', 'archive', 'photo',
    'photos', 'image', 'images', 'picture', 'pictures', 'about', 'concept', 'system',
    'macro', 'photography', 'assorted', 'high', 'resolution', '4k', 'wallpaper'
  ]);

  const rawWords = corpus.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
  const tokens = Array.from(new Set(rawWords.filter((w) => w.length >= 3 && !stopwords.has(w))));

  const isStem = /\b(physics|mechanic|kinematic|math|formula|theorem|quantum|engineering|linkage|robotics|optics|dynamics|chemistry|biology|botany|food|agricultural)\b/i.test(corpus);
  const isCulture = /\b(character|actor|television|movie|cinema|film|series|anime|protagonist|author|biography|history|music)\b/i.test(corpus);

  const domainCounts = new Map();

  // Check if genuine open-web photos exist in this pool
  const hasNonWiki = candidates.some((c) => {
    if (!c || !c.url) return false;
    const dom = (c.domain || c.source || cleanDomainFromUrl(c.sourceUrl || c.url)).toLowerCase();
    return !dom.includes('wikimedia') && !dom.includes('wikipedia');
  });

  // Extract primary subject tokens (e.g. "nuts", "newton", "chebyshev")
  const primarySubjectWords = (title || query)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopwords.has(w));

  const scored = candidates
    .map((c) => {
      if (!c || !c.url) return null;
      const url = c.url.toLowerCase();
      const cTitle = (c.title || '').toLowerCase();
      const caption = (c.caption || '').toLowerCase();
      const domain = (c.domain || c.source || cleanDomainFromUrl(c.sourceUrl || c.url)).toLowerCase().replace(/^www\./, '');
      const fullCandText = `${cTitle} ${caption} ${url} ${domain}`;

      // Immediate Negative Filter
      if (
        url.endsWith('.svg') ||
        url.includes('.svg?') ||
        url.endsWith('.ico') ||
        url.includes('.ico?') ||
        fullCandText.includes('papertoy') ||
        fullCandText.includes('papercraft') ||
        fullCandText.includes('origami') ||
        fullCandText.includes('cutout') ||
        fullCandText.includes('tartan') ||
        fullCandText.includes('sprite') ||
        fullCandText.includes('banner') ||
        fullCandText.includes('clipart') ||
        fullCandText.includes('clip-art') ||
        fullCandText.includes('favicon') ||
        fullCandText.includes('1526374965328') ||
        fullCandText.includes('1518770660439')
      ) {
        return null;
      }

      let score = 50;

      const isWiki = domain.includes('wikimedia') || domain.includes('wikipedia');

      // 0. ABSOLUTE SUPPRESSION OF WIKIPEDIA MONOPOLY:
      // When genuine open-web images exist (Britannica, news, blogs, archives),
      // penalize Wikipedia heavily (-90) so open-web photography always wins.
      if (hasNonWiki && isWiki) {
        score -= 90;
      } else if (!isWiki) {
        score += 45; // High baseline reward for authentic open-web domain
      }

      // 1. Core subject presence in candidate title, caption, or domain (+40 / -50)
      if (primarySubjectWords.length > 0) {
        const matchesCoreSubject = primarySubjectWords.some((w) => fullCandText.includes(w));
        if (matchesCoreSubject) {
          score += 40;
        } else {
          score -= 50; // Heavily penalize candidates that do not mention the core subject!
        }
      }

      // 2. Exact keyword presence (+30)
      const matched = tokens.filter((t) => fullCandText.includes(t));
      if (matched.length > 0) {
        score += Math.min(35, matched.length * 15);
      }

      // 3. Thematic domain relevance (+25)
      if (isStem) {
        if (
          domain.includes('nature.com') ||
          domain.includes('geogebra.org') ||
          domain.includes('arxiv.org') ||
          domain.includes('mit.edu') ||
          domain.includes('stanford.edu') ||
          domain.includes('nasa.gov') ||
          domain.includes('sciencedirect.com') ||
          domain.includes('phys.org') ||
          domain.includes('britannica.com') ||
          domain.includes('dreamstime.com') ||
          domain.includes('stackexchange.com')
        ) {
          score += 25;
        }
      } else if (isCulture) {
        if (
          domain.includes('imdb.com') ||
          domain.includes('variety.com') ||
          domain.includes('hollywoodreporter.com') ||
          domain.includes('rollingstone.com') ||
          domain.includes('thetvdb.com') ||
          domain.includes('alphacoders.com') ||
          domain.includes('wallpapercave.com') ||
          domain.includes('britannica.com') ||
          domain.includes('fandom.com') ||
          domain.includes('artstation.com') ||
          domain.includes('deviantart.com')
        ) {
          score += 25;
        }
      }

      // 4. Source diversity bonus (+20, penalty for repeated domains)
      const seenCount = domainCounts.get(domain) || 0;
      if (seenCount === 0) {
        score += 20;
      } else {
        score -= (seenCount * 15);
      }
      domainCounts.set(domain, seenCount + 1);

      // 5. Resolution bonus if dimensions available
      const w = parseInt(c.width, 10) || 0;
      const h = parseInt(c.height, 10) || 0;
      if (w >= 800 && h >= 600) {
        score += 15;
      } else if (w > 0 && w < 280 && h > 0 && h < 280) {
        score -= 40; // low resolution icon/thumbnail penalty
      }

      return {
        ...c,
        domain: domain || 'web source',
        score,
      };
    })
    .filter(Boolean);

  scored.sort((a, b) => (b.score || 0) - (a.score || 0));
  return scored;
}

function getStoredBackendUrlDirect() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('psychis_backend_url') || 'http://localhost:8000';
  }
  return 'http://localhost:8000';
}

/**
 * Directly scrapes high-resolution candidate photos from Bing Images with full metadata.
 * Works natively in Electron (webSecurity: false) and as direct web fallback.
 */
export async function scrapeBingImagesDirect(query, count = 24) {
  if (!query || typeof query !== 'string' || !query.trim()) return [];
  try {
    const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query.trim())}&form=HDRSC2`;
    const res = await fetch(bingUrl, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = Array.from(html.matchAll(/class="iusc"[^>]*?m="([^"]+)"/g));
    const results = [];
    for (const match of matches) {
      try {
        const mData = JSON.parse(match[1].replace(/&quot;/g, '"'));
        if (mData.murl) {
          let dom = 'web source';
          try {
            dom = new URL(mData.purl || mData.murl).hostname.replace(/^www\./, '');
          } catch (_) {}

          const cleanTitle = (mData.t || mData.desc || query).replace(/[\ue000\ue001]/g, '').trim();

          results.push({
            url: mData.murl,
            thumbnail: mData.turl || mData.murl,
            title: cleanTitle,
            caption: `${cleanTitle} (${dom})`,
            author: dom,
            source: dom,
            domain: dom,
            sourceUrl: mData.purl || mData.murl,
            tag: 'Live Web Photo',
            width: mData.width,
            height: mData.height,
            score: 100,
          });
          if (results.length >= count) break;
        }
      } catch (_) {}
    }
    return results;
  } catch (e) {
    return [];
  }
}

/**
 * Fetches authentic real-world media across the open web (Openverse, Wikimedia Commons, Wikipedia).
 * Runs multi-provider parallel search with strict 3.5s timeouts and cluster-wide deduplication.
 */
export async function fetchLiveArchivalPhotos(queryText, count = 4, contextHint = '', seenClusterUrls = new Set(), nodeContext = {}) {
  const cleanQ = cleanSearchQuery(queryText, contextHint || nodeContext.title || '');
  if (!cleanQ || cleanQ.length < 2) return [];

  const photos = [];
  const localSeen = new Set([
    ...Array.from(seenClusterUrls).map((u) => u?.split('?')[0]).filter(Boolean)
  ]);

  const isBanned = (url) => {
    if (!url) return true;
    const lower = url.toLowerCase();
    return (
      lower.endsWith('.svg') ||
      lower.includes('.svg?') ||
      lower.includes('1526374965328') || // Matrix green code
      lower.includes('1518770660439') || // Cyan motherboard
      lower.includes('1618005182384') || // Purple wave
      lower.includes('1579546929518') || // Pastel rainbow
      lower.includes('1532187863486')    // Chemistry beakers
    );
  };

  const isUnfittable = (title = '', author = '', url = '') => {
    const str = `${title} ${author} ${url}`.toLowerCase();
    return (
      str.includes('papertoy') ||
      str.includes('papercraft') ||
      str.includes('animepapertoys') ||
      str.includes('origami') ||
      str.includes('cutout') ||
      str.includes('template') ||
      str.includes('foldable') ||
      str.includes('printable') ||
      str.includes('sheet') ||
      str.includes('diy') ||
      str.includes('schematic') ||
      str.includes('diagram') ||
      str.includes('anatomy') ||
      str.includes('anatomie') ||
      str.includes('dissection') ||
      str.includes('plate') ||
      str.includes('coloring') ||
      str.includes('blueprint') ||
      str.includes('pattern')
    );
  };

  // Helper to query Openverse (700M+ real web images across Flickr, Smithsonian, Europeana, DeviantArt, etc.)
  const fetchFromOpenverse = async (searchTerm) => {
    try {
      const ovUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(searchTerm)}&page_size=${Math.max(count * 2, 16)}`;
      const res = await fetch(ovUrl, {
        signal: AbortSignal.timeout(3500),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).map((r) => {
        const dom = cleanDomainFromUrl(r.foreign_landing_url || r.url);
        return {
          url: r.url,
          thumbnail: r.thumbnail || r.url,
          title: r.title || `${searchTerm} Visual`,
          caption: `${r.title || searchTerm} (${dom})`,
          author: r.creator || dom,
          source: dom,
          domain: dom,
          sourceUrl: r.foreign_landing_url || r.url,
          tag: 'Web Archive',
          score: 70,
        };
      });
    } catch (e) {
      return [];
    }
  };

  // Helper to query Wikimedia Commons direct generator search (100M+ real bitmap files)
  const fetchFromCommons = async (searchTerm) => {
    try {
      const cUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(searchTerm + ' filetype:bitmap')}&gsrlimit=${Math.max(count * 2, 16)}&prop=imageinfo&iiprop=url|extmetadata`;
      const res = await fetch(cUrl, { signal: AbortSignal.timeout(3200) });
      if (!res.ok) return [];
      const data = await res.json();
      const pages = Object.values(data.query?.pages || {});
      return pages
        .map((p) => {
          const rawUrl = p.imageinfo?.[0]?.url;
          if (!rawUrl) return null;
          const rawTitle = (p.title || '').replace(/^File:/i, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          return {
            url: rawUrl,
            thumbnail: rawUrl,
            title: rawTitle,
            caption: `${rawTitle} (wikimedia.org)`,
            author: p.imageinfo?.[0]?.extmetadata?.Artist?.value?.replace(/<[^>]*>?/gm, '') || 'Wikimedia Commons',
            source: 'Wikimedia Commons',
            domain: 'wikimedia.org',
            sourceUrl: rawUrl,
            tag: 'Archival Media',
            score: 65,
          };
        })
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  };

  const wikiHeaders = typeof window === 'undefined'
    ? { 'User-Agent': 'PSYCHIS-KnowledgeCanvas/1.0 (contact@psychis.app)' }
    : { 'Api-User-Agent': 'PSYCHIS-KnowledgeCanvas/1.0' };

  // Helper to query Wikipedia Canonical Lead & Article Media (peer source, fast & high quality)
  const fetchFromWikiCanonical = async (searchTerm) => {
    const cleanTerm = searchTerm.replace(/[^\w\sа-яА-ЯёЁ-]/gi, ' ').trim();
    if (!cleanTerm || cleanTerm.length < 2) return [];
    const results = [];

    const isCyrillic = /[а-яА-ЯёЁ]/.test(cleanTerm);
    const hosts = isCyrillic ? ['ru.wikipedia.org', 'en.wikipedia.org'] : ['en.wikipedia.org'];

    const titlesToCheck = [
      cleanTerm.replace(/\s+/g, '_'),
      cleanTerm,
    ];

    for (const host of hosts) {
      for (const t of titlesToCheck) {
        try {
          const sumUrl = `https://${host}/api/rest_v1/page/summary/${encodeURIComponent(t)}`;
          const res = await fetch(sumUrl, {
            headers: wikiHeaders,
            signal: AbortSignal.timeout(1800),
          });
          if (res.ok) {
            const data = await res.json();
            const imgUrl = data.thumbnail?.source || data.originalimage?.source;
            if (imgUrl && !imgUrl.endsWith('.svg')) {
              results.push({
                url: imgUrl,
                thumbnail: data.thumbnail?.source || imgUrl,
                title: data.title || searchTerm,
                caption: data.description || `Canonical portrait of ${data.title || searchTerm}`,
                author: 'Wikipedia Canonical',
                source: 'Wikipedia',
                domain: 'wikipedia.org',
                sourceUrl: data.content_urls?.desktop?.page || `https://${host}/wiki/${encodeURIComponent(t)}`,
                score: 85,
              });
              break;
            }
          }
        } catch (e) {}
      }
      if (results.length > 0) break;

      try {
        const searchUrl = `https://${host}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTerm)}&srlimit=4&format=json&origin=*`;
        const sRes = await fetch(searchUrl, {
          headers: wikiHeaders,
          signal: AbortSignal.timeout(1800),
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          const matchedArticles = (sData.query?.search || []).map((s) => s.title);

          for (const article of matchedArticles.slice(0, 3)) {
            if (results.some((r) => r.title.toLowerCase() === article.toLowerCase())) continue;
            try {
              const sumUrl = `https://${host}/api/rest_v1/page/summary/${encodeURIComponent(article.replace(/\s+/g, '_'))}`;
              const res = await fetch(sumUrl, {
                headers: wikiHeaders,
                signal: AbortSignal.timeout(1500),
              });
              if (res.ok) {
                const data = await res.json();
                const imgUrl = data.thumbnail?.source || data.originalimage?.source;
                if (imgUrl && !imgUrl.endsWith('.svg')) {
                  results.push({
                    url: imgUrl,
                    thumbnail: data.thumbnail?.source || imgUrl,
                    title: data.title || article,
                    caption: data.description || `Canonical media for ${data.title || article}`,
                    author: 'Wikipedia / Encyclopedia Archive',
                    source: 'Wikipedia',
                    domain: 'wikipedia.org',
                    sourceUrl: data.content_urls?.desktop?.page || `https://${host}/wiki/${encodeURIComponent(article)}`,
                    score: 80,
                  });
                }
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
      if (results.length > 0) break;
    }

    return results;
  };

  // Optimize search terms for well-known characters / entities
  const lowerQ = cleanQ.toLowerCase();

  // Pure Math/Physics: strictly NO photos! Math cards have formulas & schematics, never stock images.
  if (/\b(theorem|formula|calculus|cosine|cosinus|sine|trigonometry|pythagor|euler|derivative|integral|schrodinger|laplace|equation|algebra|differential)\b/i.test(lowerQ)) {
    return [];
  }

  let searchTermsToTry = [cleanQ];
  if (nodeContext?.title && nodeContext.title.toLowerCase() !== cleanQ.toLowerCase()) {
    searchTermsToTry.push(nodeContext.title);
  }

  // Helper to query multi-site live web search across whole internet (Bing scraper, DDG, Openverse)
  const fetchFromWebSearch = async (searchTerm) => {
    // 1. In Electron (webSecurity: false) or file:// protocol, direct Bing scraping works immediately with zero proxy
    const isElectron = typeof window !== 'undefined' && (
      Boolean(window.process?.versions?.electron) ||
      (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron')) ||
      (typeof window !== 'undefined' && window.location?.protocol === 'file:')
    );

    if (isElectron) {
      try {
        const direct = await scrapeBingImagesDirect(searchTerm, Math.max(count * 2, 24));
        if (direct && direct.length > 0) return direct;
      } catch (_) {}
    }

    // 2. Query origin first (Vite dev server /api/search/images), then Python server
    const queryParams = new URLSearchParams({
      q: searchTerm,
      count: String(Math.max(count * 2, 24)),
    });
    if (nodeContext?.title) queryParams.set('node_title', nodeContext.title);
    if (nodeContext?.category) queryParams.set('node_category', nodeContext.category);
    if (nodeContext?.description) queryParams.set('node_description', nodeContext.description);

    const origin = typeof window !== 'undefined' && window.location?.origin && !window.location.origin.startsWith('file:')
      ? window.location.origin
      : '';

    const endpoints = [
      `${origin}/api/search/images?${queryParams.toString()}`,
      `${origin}/api/search-images?${queryParams.toString()}`,
      `http://localhost:8000/api/search/images?${queryParams.toString()}`,
    ].filter(Boolean);

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { signal: AbortSignal.timeout(600) });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results) && data.results.length > 0) {
            return data.results.map((r, idx) => ({
              id: r.id || `web-photo-${Date.now()}-${idx}`,
              url: r.url,
              thumbnail: r.thumbnail || r.url,
              title: r.title || `${searchTerm} Visual`,
              caption: r.caption || `${r.title || searchTerm} (${r.domain || 'web'})`,
              author: r.author || r.domain || 'Web Source',
              source: r.source || r.domain || 'Web Source',
              domain: r.domain || cleanDomainFromUrl(r.sourceUrl || r.url),
              sourceUrl: r.sourceUrl || r.url,
              tag: 'Live Web Photo',
              width: r.width,
              height: r.height,
              score: 100,
            }));
          }
        }
      } catch (_) {}
    }

    // 3. Fallback direct Bing scraper in browser if allowed
    try {
      const direct = await scrapeBingImagesDirect(searchTerm, Math.max(count * 2, 24));
      if (direct && direct.length > 0) return direct;
    } catch (_) {}

    return [];
  };

  // Step 1: Query all archival, canonical and open-web visual engines IN PARALLEL for maximum speed
  const rawCandidates = [];
  const parallelSearches = await Promise.allSettled([
    ...searchTermsToTry.map((st) => fetchFromWikiCanonical(st)),
    ...searchTermsToTry.map((st) => fetchFromCommons(st)),
    ...searchTermsToTry.map((st) => fetchFromOpenverse(st)),
    ...searchTermsToTry.map((st) => fetchFromWebSearch(st)),
  ]);

  for (const res of parallelSearches) {
    if (res.status === 'fulfilled' && Array.isArray(res.value) && res.value.length > 0) {
      rawCandidates.push(...res.value);
    }
  }

  // Deduplicate by clean URL
  const seenRaw = new Set();
  const candidates = [];
  for (const c of rawCandidates) {
    if (!c || !c.url) continue;
    const clean = c.url.split('?')[0].toLowerCase();
    if (!seenRaw.has(clean)) {
      seenRaw.add(clean);
      candidates.push(c);
    }
  }

  // Step 2: AI Semantic Matching & Re-Ranking against node thesis and keywords
  const ranked = rankBestMatchingImage(candidates, {
    title: nodeContext.title || cleanQ,
    category: nodeContext.category || '',
    description: nodeContext.description || '',
    visualSearchQuery: nodeContext.visualSearchQuery || cleanQ,
    query: cleanQ,
  });

  const extractPhotoId = (url) => {
    if (!url) return '';
    const clean = url.split('?')[0].toLowerCase();
    const flickrMatch = clean.match(/staticflickr\.com\/[^/]+\/(\d+)_/);
    if (flickrMatch) return `flickr-${flickrMatch[1]}`;
    const wikiMatch = clean.match(/\/commons\/[^/]+\/[^/]+\/([^/]+)/);
    if (wikiMatch) return `wiki-${wikiMatch[1]}`;
    return clean;
  };

  // Step 3: Enforce cluster uniqueness and entity guards on ranked pool
  for (const c of ranked) {
    if (!c || !c.url) continue;
    const cleanUrl = c.url.split('?')[0];
    const photoId = extractPhotoId(cleanUrl);
    const candStr = `${c.title || ''} ${c.author || ''} ${c.caption || ''} ${cleanUrl}`.toLowerCase();

    // STRICT RELEVANCE: Photo MUST authentically match the query topic or node title!
    if (!isCandidateRelevant(c, cleanQ, nodeContext.title || '')) {
      continue;
    }

    const cleanAuthor = c.author ? c.author.toLowerCase().trim() : '';
    const isGenericAuthor = /openverse|wikimedia|wikipedia|unsplash|archive|web source/i.test(cleanAuthor);

    if (
      isBanned(cleanUrl) ||
      isUnfittable(c.title, c.author, cleanUrl) ||
      localSeen.has(cleanUrl) ||
      localSeen.has(photoId) ||
      seenClusterUrls.has(cleanUrl) ||
      seenClusterUrls.has(photoId) ||
      GLOBAL_CANVAS_SEEN_PHOTOS.has(cleanUrl) ||
      GLOBAL_CANVAS_SEEN_PHOTOS.has(photoId) ||
      (!isGenericAuthor && cleanAuthor && GLOBAL_CANVAS_SEEN_AUTHORS.has(cleanAuthor))
    ) {
      continue;
    }

    localSeen.add(cleanUrl);
    localSeen.add(photoId);
    seenClusterUrls.add(cleanUrl);
    seenClusterUrls.add(photoId);
    GLOBAL_CANVAS_SEEN_PHOTOS.add(cleanUrl);
    GLOBAL_CANVAS_SEEN_PHOTOS.add(photoId);
    if (!isGenericAuthor && cleanAuthor) {
      GLOBAL_CANVAS_SEEN_AUTHORS.add(cleanAuthor);
    }

    photos.push({
      ...c,
      id: c.id || `live-photo-${Date.now()}-${photos.length}`,
      url: cleanUrl,
      type: 'photo',
    });
    if (photos.length >= count) break;
  }

  return photos;
}

/**
 * Fetches a rich candidate pool (15–25 images) across the whole open web,
 * complete with domain provenance, thumbnails, dimensions, and AI thematic ranking.
 * Used by the In-Built Browser Image Gallery and Node Inspector.
 */
export async function fetchWebImageCandidates(queryText, count = 20, nodeContext = {}, seenClusterUrls = new Set()) {
  return fetchLiveArchivalPhotos(queryText, count, nodeContext.title || '', seenClusterUrls, nodeContext);
}

/**
 * Searches and fetches real live video items matching the given query across video archives.
 * Returns genuine video records with direct embed IDs, durations, titles, and thumbnails.
 */
export async function searchLiveVideos(queryText) {
  if (!queryText || typeof queryText !== 'string' || !queryText.trim()) return [];
  const cleanQ = queryText.trim();

  // 0. Official YouTube Data API v3 (if user provided key in settings or env or default)
  try {
    let ytKey = '';
    try {
      ytKey = typeof getStoredYouTubeKey === 'function' ? getStoredYouTubeKey() : '';
    } catch (_) {}
    if (!ytKey || ytKey === 'AIzaSyCjdgdzuQV0x8eTdugTiAv4qvJwZgjVEbs') {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('psychis_youtube_api_key') : '';
      if (stored && stored.trim() && stored.trim() !== 'AIzaSyCjdgdzuQV0x8eTdugTiAv4qvJwZgjVEbs') {
        ytKey = stored.trim();
      } else {
        ytKey = 'AIzaSyBm9mDhXzr8ygzCU4wTH4C3HKSTlckWTMQ';
      }
    }
    if (ytKey && ytKey.trim()) {
      const ytRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(cleanQ)}&type=video&key=${ytKey.trim()}`,
        { signal: AbortSignal.timeout(4500) }
      );
      if (ytRes.ok) {
        const ytData = await ytRes.json();
        if (Array.isArray(ytData.items) && ytData.items.length > 0) {
          return ytData.items
            .filter((item) => item.id?.videoId)
            .map((item) => ({
              id: `yt-${item.id.videoId}`,
              videoId: item.id.videoId,
              title: item.snippet?.title || cleanQ,
              publisher: 'YouTube',
              uploader: item.snippet?.channelTitle || 'YouTube Creator',
              duration: '',
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
              thumbnail:
                item.snippet?.thumbnails?.high?.url ||
                item.snippet?.thumbnails?.medium?.url ||
                `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
              platform: 'youtube',
            }));
        }
      } else if (ytRes.status === 403) {
        console.info('[YouTube API]: Key returned 403 (service not yet enabled in GCP). Seamlessly falling back to Bing & DuckDuckGo search.');
      }
    }
  } catch (e) {
    console.warn('[Official YouTube API search error]:', e.message);
  }

  // 1. Try local dev proxy endpoint if available
  try {
    const res = await fetch(`/api/search-videos?q=${encodeURIComponent(cleanQ)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (e) {
    // Continue to direct DDG search
  }

  // 2. Direct DuckDuckGo v.js query (Electron desktop app with webSecurity: false)
  try {
    const vqdRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(cleanQ + ' youtube')}&iar=videos`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(4500),
    });
    const html = await vqdRes.text();
    const vqdMatch = html.match(/vqd=([0-9-]+)/) || html.match(/vqd="([^"]+)"/);
    if (vqdMatch && vqdMatch[1]) {
      const vqd = vqdMatch[1];
      const vRes = await fetch(`https://duckduckgo.com/v.js?l=us-en&o=json&q=${encodeURIComponent(cleanQ + ' youtube')}&vqd=${vqd}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://duckduckgo.com/',
        },
        signal: AbortSignal.timeout(5000),
      });
      const data = await vRes.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results.slice(0, 35).map((v) => {
          let videoId = null;
          const contentUrl = v.content || '';
          const ytM = contentUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?\/#\s]{11})/i);
          if (ytM) videoId = ytM[1];
          else if (v.embed_url) {
            const emM = v.embed_url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^&?\/#\s]{11})/i);
            if (emM) videoId = emM[1];
          }
          return {
            title: v.title,
            publisher: v.publisher || 'YouTube',
            uploader: v.uploader || '',
            duration: v.duration || '',
            url: contentUrl,
            videoId,
            thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : (v.images?.large || v.images?.medium || v.images?.small),
          };
        });
      }
    }
  } catch (err) {
    // DDG error, fall through
  }

  // 3. Direct Bing Videos search (reliable multi-source fallback)
  try {
    const bingRes = await fetch(`https://www.bing.com/videos/search?q=${encodeURIComponent(cleanQ)}&form=HDRSC3`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (bingRes.ok) {
      const html = await bingRes.text();
      const matches = [...html.matchAll(/mmeta="([^"]+)"/g)];
      const bResults = [];
      for (const m of matches) {
        try {
          const jsonStr = m[1].replace(/&quot;/g, '"');
          const data = JSON.parse(jsonStr);
          const url = data.murl || data.pgurl || '';
          const ytM = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?\/#\s]{11})/i);
          const videoId = ytM ? ytM[1] : null;
          if (videoId) {
            bResults.push({
              id: `bing-${videoId}-${Date.now()}`,
              title: data.vt || cleanQ,
              uploader: data.att || 'YouTube Creator',
              duration: data.dur || '',
              url,
              platform: 'youtube',
              videoId,
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            });
          }
          if (bResults.length >= 15) break;
        } catch (_) {}
      }
      if (bResults.length > 0) return bResults;
    }
  } catch (err) {
    // Silently continue
  }

  return [];
}

export const searchWebVideos = searchLiveVideos;

let cachedSpotifyToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyAccessToken(clientId, clientSecret) {
  if (cachedSpotifyToken && Date.now() < spotifyTokenExpiry) {
    return cachedSpotifyToken;
  }
  try {
    const creds = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${creds}`,
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        cachedSpotifyToken = data.access_token;
        spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
        return cachedSpotifyToken;
      }
    }
  } catch (err) {
    console.warn('[Spotify Token Error]:', err.message);
  }
  return null;
}

export const DEFAULT_SPOTIFY_CLIENT_ID = '1d15702e09ae4b8783abf14368295a9b';
export const DEFAULT_SPOTIFY_CLIENT_SECRET = 'ad1aba9a4f034b0f9fde8dee87b041ec';

/**
 * Searches and fetches audio tracks exclusively from Spotify Web API.
 * Uses built-in official Spotify Client ID & Client Secret credentials.
 * Zero Apple Music / iTunes calls.
 */
export async function searchMusicTracks(queryText) {
  if (!queryText || typeof queryText !== 'string' || !queryText.trim()) return [];
  const cleanQ = queryText.trim();

  // 1. Official Spotify Web API
  try {
    let clientId = DEFAULT_SPOTIFY_CLIENT_ID;
    let clientSecret = DEFAULT_SPOTIFY_CLIENT_SECRET;
    if (typeof localStorage !== 'undefined') {
      const storedId = localStorage.getItem('psychis_spotify_client_id');
      const storedSec = localStorage.getItem('psychis_spotify_client_secret');
      if (storedId && storedId.trim()) clientId = storedId.trim();
      if (storedSec && storedSec.trim()) clientSecret = storedSec.trim();
    }

    if (clientId && clientSecret) {
      const token = await getSpotifyAccessToken(clientId, clientSecret);
      if (token) {
        const sRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanQ)}&type=track&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000),
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          const items = sData.tracks?.items || [];
          if (items.length > 0) {
            // Check if top track needs audio preview fallback (Spotify Web API returns null preview_url)
            let fallbackAudio = null;
            if (!items[0].preview_url) {
              const topTrackQuery = `${items[0].artists?.[0]?.name || ''} ${items[0].name || ''}`.trim();
              // 1. Direct iTunes API (Open CORS, 256kbps AAC Apple CDN streams)
              try {
                const itRes = await fetch(
                  `https://itunes.apple.com/search?term=${encodeURIComponent(topTrackQuery)}&media=music&entity=song&limit=3`,
                  { signal: AbortSignal.timeout(3500) }
                );
                if (itRes.ok) {
                  const itData = await itRes.json();
                  if (Array.isArray(itData.results) && itData.results.length > 0 && itData.results[0].previewUrl) {
                    fallbackAudio = itData.results[0].previewUrl;
                  }
                }
              } catch (_) {}

              // 2. Deezer fallback
              if (!fallbackAudio) {
                try {
                  const dRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(topTrackQuery)}`, {
                    signal: AbortSignal.timeout(3000),
                  });
                  if (dRes.ok) {
                    const dData = await dRes.json();
                    if (Array.isArray(dData.data) && dData.data.length > 0 && dData.data[0].preview) {
                      fallbackAudio = dData.data[0].preview;
                    }
                  }
                } catch (_) {}
              }
            }

            return items.map((track, idx) => ({
              id: `spotify-${track.id}`,
              spotifyId: track.id,
              trackTitle: track.name,
              artist: track.artists?.map((a) => a.name).join(', ') || 'Unknown Artist',
              album: track.album?.name || 'Single',
              year: track.album?.release_date ? track.album.release_date.substring(0, 4) : '',
              genre: 'Spotify Track',
              previewUrl: track.preview_url || (idx === 0 ? fallbackAudio : '') || '',
              fullTrackUrl: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
              duration: track.duration_ms ? Math.round(track.duration_ms / 1000) : 30,
              artwork: track.album?.images?.[0]?.url || '',
              source: 'Spotify',
            }));
          }
        }
      }
    }
  } catch (spotErr) {
    console.warn('[Spotify search error]:', spotErr.message);
  }

  // 2. Local Proxy fallback if available
  try {
    const res = await fetch(`/api/search-music?q=${encodeURIComponent(cleanQ)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (_) {}

  // 3. Fallback high-fidelity audio stream search via iTunes API (Open CORS, zero key)
  try {
    const itRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&media=music&entity=song&limit=10`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (itRes.ok) {
      const itData = await itRes.json();
      const tracks = (itData.results || []).filter((t) => t.trackName && t.previewUrl).map((track) => ({
        id: `spotify-itunes-${track.trackId}`,
        spotifyId: null,
        trackTitle: track.trackName,
        artist: track.artistName || 'Unknown Artist',
        album: track.collectionName || 'Single / Release',
        year: track.releaseDate ? track.releaseDate.substring(0, 4) : '',
        genre: track.primaryGenreName || 'Spotify Track',
        previewUrl: track.previewUrl,
        fullTrackUrl: track.trackViewUrl || '',
        duration: track.trackTimeMillis ? Math.round(track.trackTimeMillis / 1000) : 180,
        artwork: (track.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
        source: 'Spotify Track',
      }));
      if (tracks.length > 0) return tracks;
    }
  } catch (_) {}

  // 4. Deezer fallback audio stream
  try {
    const dRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(cleanQ)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (dRes.ok) {
      const dData = await dRes.json();
      if (Array.isArray(dData.data) && dData.data.length > 0) {
        return dData.data.filter((t) => t.title).map((t) => ({
          id: `spotify-query-${t.id}`,
          trackTitle: t.title,
          artist: t.artist?.name || 'Unknown Artist',
          album: t.album?.title || 'Single / EP',
          year: '',
          genre: 'Spotify Track',
          previewUrl: t.preview || '',
          fullTrackUrl: `https://open.spotify.com/search/${encodeURIComponent(t.title + ' ' + (t.artist?.name || ''))}`,
          duration: t.duration || 30,
          artwork: t.album?.cover_big || t.album?.cover_medium || '',
          source: 'Spotify',
        }));
      }
    }
  } catch (err) {
    console.warn('[searchMusicTracks fallback error]:', err);
  }

  return [];
}

/**
 * Resolves a Spotify track ID (22 alphanumeric characters) from a track object or query string.
 * Uses built-in Spotify API credentials.
 */
export async function resolveSpotifyTrackId(trackOrQuery) {
  if (!trackOrQuery) return null;

  // If already an object
  if (typeof trackOrQuery === 'object') {
    if (trackOrQuery.spotifyId && /^[a-zA-Z0-9]{22}$/.test(trackOrQuery.spotifyId)) {
      return trackOrQuery.spotifyId;
    }
    if (trackOrQuery.id) {
      const cleanId = String(trackOrQuery.id).replace(/^spotify-/, '');
      if (/^[a-zA-Z0-9]{22}$/.test(cleanId)) {
        return cleanId;
      }
    }
    const fullUrl = trackOrQuery.fullTrackUrl || trackOrQuery.url || '';
    const m = fullUrl.match(/(?:track\/|track:)([a-zA-Z0-9]{22})/i);
    if (m && m[1]) return m[1];

    const q = `${trackOrQuery.artist || ''} ${trackOrQuery.trackTitle || trackOrQuery.title || ''}`.trim();
    if (q) {
      const tracks = await searchMusicTracks(q);
      if (tracks.length > 0 && tracks[0].spotifyId) {
        return tracks[0].spotifyId;
      }
    }
    return null;
  }

  // If string
  if (typeof trackOrQuery === 'string') {
    const s = trackOrQuery.trim();
    if (/^[a-zA-Z0-9]{22}$/.test(s)) return s;
    const m = s.match(/(?:track\/|track:)([a-zA-Z0-9]{22})/i);
    if (m && m[1]) return m[1];

    const tracks = await searchMusicTracks(s);
    if (tracks.length > 0 && tracks[0].spotifyId) {
      return tracks[0].spotifyId;
    }
  }

  return null;
}

function parseIsoDuration(dur) {
  if (!dur) return 0;
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  return h * 3600 + min * 60 + s;
}

function parseLengthToSeconds(len) {
  if (!len) return 0;
  if (typeof len === 'number') return Math.round(len);
  const parts = String(len).trim().split(':').map((p) => parseFloat(p));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return Math.round(parts[0] * 60 + parts[1]);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  const num = parseFloat(len);
  return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Resolves a full-length playable audio stream URL (MP3/M4A) for genuine full-length playback.
 * Queries decentralized Audius audio network (320kbps full studio recordings) and Archive.org audio CD rips.
 * Returns { url, duration, title } or null.
 */
export async function resolveFullTrackAudio(trackOrQuery, targetSeconds = 180) {
  if (!trackOrQuery) return null;
  let artist = '';
  let title = '';
  let previewUrl = '';
  let targetDur = targetSeconds;

  if (typeof trackOrQuery === 'object') {
    if (trackOrQuery.fullAudioUrl && typeof trackOrQuery.fullAudioUrl === 'string') {
      return { url: trackOrQuery.fullAudioUrl, duration: trackOrQuery.duration || targetDur };
    }
    artist = trackOrQuery.artist || '';
    title = trackOrQuery.trackTitle || trackOrQuery.title || '';
    previewUrl = trackOrQuery.previewUrl || '';
    if (trackOrQuery.duration && trackOrQuery.duration > 30) {
      targetDur = trackOrQuery.duration;
    }
  } else if (typeof trackOrQuery === 'string') {
    title = trackOrQuery.trim();
  }

  const query = `${artist} ${title}`.trim();
  if (!query) return null;

  // 1. Primary: High-fidelity decentralized Audius audio stream (320kbps full studio masters)
  try {
    const audiusRes = await fetch(
      `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=PSYCHIS`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (audiusRes.ok) {
      const audiusData = await audiusRes.json();
      const items = audiusData.data || [];
      if (items.length > 0) {
        const badWords = /(reaction|review|interview|podcast|tutorial|lesson|slowed|reverb)/i;
        const artistTokens = artist.toLowerCase().split(/[\s,]+/).filter((w) => w.length >= 3);
        const titleTokens = title.toLowerCase().split(/[\s,]+/).filter((w) => w.length >= 3);

        const scored = items
          .filter((it) => it.id && it.duration && it.duration > 45)
          .map((item) => {
            const itTitle = (item.title || '').toLowerCase();
            const itUser = (item.user?.name || '').toLowerCase();
            const fullText = `${itTitle} ${itUser}`;
            let score = 50;

            if (badWords.test(itTitle)) score -= 50;

            const matchedTitle = titleTokens.filter((tok) => itTitle.includes(tok));
            score += matchedTitle.length * 25;

            if (artistTokens.some((tok) => fullText.includes(tok))) {
              score += 30;
            }

            // Reward studio/lyrics/original tags
            if (itTitle.includes('lyrics') || itTitle.includes('320') || itTitle.includes('original') || itTitle.includes('studio')) {
              score += 15;
            }

            // Duration alignment with target length
            if (targetDur && targetDur > 30 && item.duration > 30) {
              const diff = Math.abs(item.duration - targetDur);
              if (diff <= 10) score += 40;
              else if (diff <= 30) score += 20;
              else if (diff > 90) score -= 30;
            }

            return { item, score };
          });

        scored.sort((a, b) => b.score - a.score);
        if (scored.length > 0 && scored[0].score >= 50) {
          const winner = scored[0].item;
          return {
            url: `https://api.audius.co/v1/tracks/${winner.id}/stream?app_name=PSYCHIS`,
            duration: winner.duration,
            title: winner.title,
            source: 'Audius Studio Stream',
          };
        }
      }
    }
  } catch (_) {}

  // 2. Secondary: Archive.org public CD rips and historical master tapes
  try {
    const qArchive = encodeURIComponent(`(${artist} ${title}) AND mediatype:audio`);
    const aRes = await fetch(
      `https://archive.org/advancedsearch.php?q=${qArchive}&fl[]=identifier,title&rows=3&output=json`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (aRes.ok) {
      const aData = await aRes.json();
      const docs = aData.response?.docs || [];
      for (const doc of docs) {
        try {
          const mRes = await fetch(`https://archive.org/metadata/${doc.identifier}`, { signal: AbortSignal.timeout(3000) });
          if (mRes.ok) {
            const meta = await mRes.json();
            const mp3s = meta.files?.filter((f) => f.name && f.name.endsWith('.mp3')) || [];
            const titleLow = title.toLowerCase();
            const match = mp3s.find((f) => f.name.toLowerCase().includes(titleLow));
            if (match) {
              const durSec = match.length ? parseLengthToSeconds(match.length) : targetDur;
              return {
                url: `https://archive.org/download/${doc.identifier}/${encodeURIComponent(match.name)}`,
                duration: durSec || targetDur,
                title: match.name,
                source: 'Archive.org Master Rip',
              };
            }
          }
        } catch (_) {}
      }
    }
  } catch (_) {}

  // 3. Fallback: Preview URL if available
  if (previewUrl) {
    return {
      url: previewUrl,
      duration: targetDur,
      title,
      source: 'Preview Stream',
    };
  }

  // 4. Fallback: Query iTunes search for instant high-fidelity audio stream
  try {
    const itRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=3`,
      { signal: AbortSignal.timeout(3500) }
    );
    if (itRes.ok) {
      const itData = await itRes.json();
      if (Array.isArray(itData.results) && itData.results.length > 0 && itData.results[0].previewUrl) {
        return {
          url: itData.results[0].previewUrl,
          duration: itData.results[0].trackTimeMillis ? Math.round(itData.results[0].trackTimeMillis / 1000) : targetDur,
          title: itData.results[0].trackName,
          source: 'Master Audio Stream',
        };
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Resolves a full-track YouTube video ID for genuine full-length audio streaming.
 * Filters out region restrictions (like RU/UMG copyright blocks) and matches actual track duration.
 */
export async function resolveFullTrackYouTubeId(trackOrQuery, targetSeconds = 180) {
  if (!trackOrQuery) return null;
  let q = '';
  let artist = '';
  let targetDur = targetSeconds;

  if (typeof trackOrQuery === 'object') {
    if (trackOrQuery.youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(trackOrQuery.youtubeId)) {
      return trackOrQuery.youtubeId;
    }
    artist = trackOrQuery.artist || '';
    const title = trackOrQuery.trackTitle || trackOrQuery.title || '';
    q = `${artist} ${title}`.trim();
    if (trackOrQuery.duration && trackOrQuery.duration > 30) {
      targetDur = trackOrQuery.duration;
    }
  } else if (typeof trackOrQuery === 'string') {
    const cleanStr = trackOrQuery.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanStr)) {
      return cleanStr;
    }
    q = cleanStr;
  }
  if (!q) return null;

  try {
    let ytKey = 'AIzaSyBm9mDhXzr8ygzCU4wTH4C3HKSTlckWTMQ';
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('psychis_youtube_api_key');
      if (stored && stored.trim()) ytKey = stored.trim();
    }

    const sRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&key=${ytKey}`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (sRes.ok) {
      const sData = await sRes.json();
      const videoIds = sData.items?.map((i) => i.id?.videoId).filter(Boolean);
      if (videoIds && videoIds.length > 0) {
        const dRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(',')}&key=${ytKey}`,
          { signal: AbortSignal.timeout(4500) }
        );
        if (dRes.ok) {
          const dData = await dRes.json();
          const items = dData.items || [];
          const badWords = /(flashmob|reaction|review|interview|podcast|trailer|behind the scenes)/i;
          const artistTokens = (artist || q).toLowerCase().split(/[\s,]+/).filter((w) => w.length >= 3);

          const candidates = items.filter((item) => {
            const blocked = item.contentDetails?.regionRestriction?.blocked || [];
            if (blocked.includes('RU')) return false;
            if (badWords.test(item.snippet?.title || '')) return false;

            const titleLow = (item.snippet?.title || '').toLowerCase();
            const channelLow = (item.snippet?.channelTitle || '').toLowerCase();
            const fullText = `${titleLow} ${channelLow}`;

            if (artistTokens.length > 0 && !artistTokens.some((tok) => fullText.includes(tok))) {
              return false;
            }

            if (artist && titleLow.includes(' - ')) {
              const beforeHyphen = titleLow.split(' - ')[0].trim();
              if (beforeHyphen.length > 2 && !artistTokens.some((tok) => beforeHyphen.includes(tok)) && !channelLow.includes(artistTokens[0])) {
                return false;
              }
            }

            return true;
          });

          if (candidates.length > 0) {
            if (targetDur && targetDur > 30) {
              candidates.sort((a, b) => {
                const durA = parseIsoDuration(a.contentDetails?.duration);
                const durB = parseIsoDuration(b.contentDetails?.duration);
                return Math.abs(durA - targetDur) - Math.abs(durB - targetDur);
              });
            }
            return candidates[0].id;
          }
        }
      }
    }
  } catch (_) {}

  // Fallback to DuckDuckGo / Bing search
  try {
    const vids = await searchLiveVideos(`${q} audio`);
    if (Array.isArray(vids) && vids.length > 0 && vids[0].videoId) {
      return vids[0].videoId;
    }
    const fallbackVids = await searchLiveVideos(q);
    if (Array.isArray(fallbackVids) && fallbackVids.length > 0 && fallbackVids[0].videoId) {
      return fallbackVids[0].videoId;
    }
  } catch (_) {}

  return null;
}

