import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function webImageSearchPlugin() {
  return {
    name: 'web-image-search-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api/search/images') || req.url.startsWith('/api/search-images'))) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const query = urlObj.searchParams.get('q');
            const count = parseInt(urlObj.searchParams.get('count') || '20', 10);
            if (!query) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ results: [] }));
              return;
            }

            let results = [];

            // 1. Primary: Direct Bing Image Scraping (Fastest, 30+ real-world web photos across the internet)
            try {
              const bingRes = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                  'Accept-Language': 'en-US,en;q=0.9',
                },
              });
              if (bingRes.ok) {
                const bingHtml = await bingRes.text();
                const matches = bingHtml.matchAll(/class="iusc"[^>]*?m="([^"]+)"/g);
                for (const match of matches) {
                  try {
                    const mStr = match[1].replace(/&quot;/g, '"');
                    const mData = JSON.parse(mStr);
                    if (mData.murl) {
                      let dom = 'web source';
                      try {
                        dom = new URL(mData.purl || mData.murl).hostname.replace(/^www\./, '');
                      } catch (_) {}

                      const cleanTitle = (mData.t || mData.desc || query).replace(/[\ue000\ue001]/g, '').trim();

                      results.push({
                        id: `bing-img-${Date.now()}-${results.length}`,
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
                        score: 95,
                      });
                      if (results.length >= count) break;
                    }
                  } catch (_) {}
                }
              }
            } catch (_) {}

            // 2. Secondary: Openverse API (700M+ CC media across museums, Flickr, Smithsonian)
            if (results.length < count) {
              try {
                const ovRes = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${count}`, {
                  headers: {
                    'User-Agent': 'PSYCHIS-SpatialCanvas/1.0',
                  },
                });
                if (ovRes.ok) {
                  const ovData = await ovRes.json();
                  for (const item of ovData.results || []) {
                    const imgUrl = item.url;
                    if (imgUrl && !results.some((r) => r.url === imgUrl)) {
                      const dom = new URL(item.foreign_landing_url || imgUrl).hostname.replace(/^www\./, '');
                      results.push({
                        id: `ov-img-${Date.now()}-${results.length}`,
                        url: imgUrl,
                        thumbnail: item.thumbnail || imgUrl,
                        title: item.title || query,
                        caption: `${item.title || query} (${dom})`,
                        author: item.creator || dom,
                        source: dom,
                        domain: dom,
                        sourceUrl: item.foreign_landing_url || imgUrl,
                        tag: 'Web Photo',
                        width: item.width,
                        height: item.height,
                        score: 85,
                      });
                      if (results.length >= count) break;
                    }
                  }
                }
              } catch (_) {}
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: results.length, results }));
          } catch (err) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message, results: [] }));
          }
        } else if (req.url && req.url.startsWith('/api/search-videos')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const query = urlObj.searchParams.get('q');
            if (!query) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ results: [] }));
              return;
            }

            let results = [];

            // 1. Primary: Direct Bing Videos scraping (Fastest, zero blocks, extracts direct YouTube & TikTok videos)
            try {
              const bingRes = await fetch(`https://www.bing.com/videos/search?q=${encodeURIComponent(query)}&form=HDRSC3`, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                  'Accept-Language': 'en-US,en;q=0.9',
                },
                signal: AbortSignal.timeout(6000),
              });
              if (bingRes.ok) {
                const html = await bingRes.text();
                const cardMatches = [...html.matchAll(/<div[^>]*?class="[^"]*?mc_vtvc[^"]*?"[^>]*?mmeta="([^"]+)"[^>]*?>(.*?)<\/div>\s*<\/div>/gs)];
                for (const m of cardMatches) {
                  try {
                    const mmeta = JSON.parse(m[1].replace(/&quot;/g, '"'));
                    const cardHtml = m[2];
                    const ariaMatch = cardHtml.match(/aria-label="([^"]+)"/);
                    let title = '';
                    let duration = '';
                    let uploader = '';
                    if (ariaMatch) {
                      const parts = ariaMatch[1].split(' · ');
                      title = parts[0]?.replace(/ from (YouTube|TikTok|Vimeo).*$/i, '').trim();
                      for (const p of parts) {
                        if (p.toLowerCase().includes('duration:')) duration = p.replace(/duration:\s*/i, '').trim();
                        if (p.toLowerCase().includes('uploaded by')) uploader = p.replace(/uploaded by\s*/i, '').replace(/\s*·.*$/, '').trim();
                      }
                    }
                    const url = mmeta.murl || mmeta.pgurl || '';
                    const ytM = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?\/#\s]{11})/i);
                    const isTikTok = url.includes('tiktok.com');
                    const videoId = ytM ? ytM[1] : null;

                    results.push({
                      id: `vid-${videoId || results.length}-${Date.now()}`,
                      title: title || query,
                      duration: duration || '',
                      uploader: uploader || (ytM ? 'YouTube Creator' : isTikTok ? 'TikTok Creator' : 'Web Video'),
                      url,
                      platform: ytM ? 'youtube' : isTikTok ? 'tiktok' : 'web',
                      videoId,
                      thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : (mmeta.turl ? mmeta.turl.replace(/&amp;/g, '&') : ''),
                    });
                    if (results.length >= 25) break;
                  } catch (_) {}
                }
              }
            } catch (bErr) {
              console.warn('[Bing Videos Search warn]:', bErr.message);
            }

            // 2. Secondary fallback: DuckDuckGo Videos
            if (results.length === 0) {
              try {
                const vqdRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query + ' youtube')}&iar=videos`, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                  },
                  signal: AbortSignal.timeout(5000),
                });
                const html = await vqdRes.text();
                const vqdMatch = html.match(/vqd=([0-9-]+)/) || html.match(/vqd="([^"]+)"/);
                if (vqdMatch) {
                  const vqd = vqdMatch[1];
                  const vRes = await fetch(`https://duckduckgo.com/v.js?l=us-en&o=json&q=${encodeURIComponent(query + ' youtube')}&vqd=${vqd}`, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                      'Referer': 'https://duckduckgo.com/',
                    },
                    signal: AbortSignal.timeout(5000),
                  });
                  const data = await vRes.json();
                  const ddgResults = (data.results || []).slice(0, 25).map((v) => {
                    let videoId = null;
                    const contentUrl = v.content || '';
                    const ytM = contentUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?\/#\s]{11})/i);
                    if (ytM) videoId = ytM[1];
                    else if (v.embed_url) {
                      const emM = v.embed_url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^&?\/#\s]{11})/i);
                      if (emM) videoId = emM[1];
                    }
                    return {
                      id: `ddg-vid-${videoId || results.length}`,
                      title: v.title,
                      publisher: v.publisher || 'YouTube',
                      uploader: v.uploader || '',
                      duration: v.duration || '',
                      url: contentUrl,
                      platform: 'youtube',
                      videoId,
                      thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : (v.images?.large || v.images?.medium || v.images?.small),
                    };
                  });
                  results.push(...ddgResults);
                }
              } catch (_) {}
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: results.length, results }));
          } catch (err) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message, results: [] }));
          }
        } else if (req.url && (req.url.startsWith('/api/search/music') || req.url.startsWith('/api/search-music'))) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const query = urlObj.searchParams.get('q');
            if (!query) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ results: [] }));
              return;
            }

            let results = [];

            // 1. Primary: iTunes Search API (Free, high-res AAC 30s preview, 600x600 artwork, accurate metadata)
            try {
              const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=15`, {
                headers: {
                  'User-Agent': 'PSYCHIS-SpatialKnowledge/1.0',
                },
                signal: AbortSignal.timeout(6000),
              });
              if (itunesRes.ok) {
                const itunesData = await itunesRes.json();
                for (const track of itunesData.results || []) {
                  if (track.trackName && track.previewUrl) {
                    results.push({
                      id: `itunes-${track.trackId}`,
                      trackTitle: track.trackName,
                      artist: track.artistName || 'Unknown Artist',
                      album: track.collectionName || 'Single / EP',
                      year: track.releaseDate ? track.releaseDate.substring(0, 4) : '',
                      genre: track.primaryGenreName || 'Music',
                      previewUrl: track.previewUrl,
                      fullTrackUrl: track.trackViewUrl || '',
                      duration: track.trackTimeMillis ? Math.round(track.trackTimeMillis / 1000) : 30,
                      artwork: (track.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
                      source: 'Apple Music / iTunes',
                    });
                  }
                }
              }
            } catch (iErr) {
              console.warn('[iTunes search warn]:', iErr.message);
            }

            // 2. Secondary fallback: Deezer Search API
            if (results.length === 0) {
              try {
                const deezerRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' },
                  signal: AbortSignal.timeout(6000),
                });
                if (deezerRes.ok) {
                  const deezerData = await deezerRes.json();
                  for (const track of (deezerData.data || []).slice(0, 15)) {
                    if (track.title && track.preview) {
                      results.push({
                        id: `deezer-${track.id}`,
                        trackTitle: track.title,
                        artist: track.artist?.name || 'Unknown Artist',
                        album: track.album?.title || 'Single',
                        year: '',
                        genre: 'Music',
                        previewUrl: track.preview,
                        fullTrackUrl: track.link || '',
                        duration: track.duration || 30,
                        artwork: track.album?.cover_big || track.album?.cover_medium || '',
                        source: 'Deezer',
                      });
                    }
                  }
                }
              } catch (dErr) {
                console.warn('[Deezer search warn]:', dErr.message);
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: results.length, results }));
          } catch (err) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message, results: [] }));
          }
        } else if (req.url && (req.url.startsWith('/api/proxy/image') || req.url.startsWith('/api/proxy-image'))) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const targetUrl = urlObj.searchParams.get('url');
            if (!targetUrl || !targetUrl.startsWith('http')) {
              res.statusCode = 400;
              res.end('Missing or invalid image url');
              return;
            }

            const imgRes = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': targetUrl,
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              },
              signal: AbortSignal.timeout(8000),
            });

            if (!imgRes.ok) {
              res.statusCode = imgRes.status;
              res.end(`Remote server returned ${imgRes.status}`);
              return;
            }

            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('Access-Control-Allow-Origin', '*');

            const buffer = await imgRes.arrayBuffer();
            res.end(Buffer.from(buffer));
          } catch (err) {
            res.statusCode = 502;
            res.end(`Proxy error: ${err.message}`);
          }
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), webImageSearchPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

