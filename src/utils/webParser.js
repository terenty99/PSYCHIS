/**
 * PSYCHIS Web Page Parser
 * Extracts structured content from web pages for knowledge node creation
 *
 * Features:
 * - Structured data extraction (JSON-LD, Microdata, Open Graph)
 * - Main content extraction (readability-inspired)
 * - Video detection and extraction
 * - Image and media extraction
 * - Clean, standardized output for node creation
 */

export const parseWebPage = async (htmlContent, url) => {
  try {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Extract structured data
    const structuredData = extractStructuredData(doc);

    // Extract main content
    const mainContent = extractMainContent(doc);

    // Extract videos
    const videos = extractVideos(doc, url);

    // Extract images
    const images = extractImages(doc, url);

    // Extract metadata
    const metadata = extractMetadata(doc);

    // Determine content type
    const contentType = determineContentType(doc, structuredData, mainContent, videos);

    return {
      success: true,
      url,
      contentType,
      structuredData,
      mainContent,
      videos,
      images,
      metadata,
      title: metadata.title || structuredData.title || extractTitle(doc),
      description: metadata.description || structuredData.description || mainContent.summary,
      author: metadata.author || structuredData.author,
      publisher: metadata.publisher || structuredData.publisher,
      publishedDate: metadata.publishedDate || structuredData.publishedDate,
      siteName: metadata.siteName || structuredData.siteName,
      language: metadata.language || document.documentElement.lang || 'en'
    };
  } catch (error) {
    console.error('Error parsing web page:', error);
    return {
      success: false,
      error: error.message,
      url
    };
  }
};

/**
 * Extract structured data from JSON-LD, Microdata, and Open Graph
 */
const extractStructuredData = (doc) => {
  const data = {
    jsonLd: [],
    microdata: [],
    openGraph: {}
  };

  // JSON-LD
  const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
  jsonLdScripts.forEach(script => {
    try {
      const parsed = JSON.parse(script.textContent);
      data.jsonLd.push(parsed);
    } catch (e) {
      // Invalid JSON-LD, skip
    }
  });

  // Microdata
  const microdataItems = doc.querySelectorAll('[itemscope]');
  microdataItems.forEach(item => {
    const type = item.getAttribute('itemtype');
    const properties = {};
    item.querySelectorAll('[itemprop]').forEach(prop => {
      const name = prop.getAttribute('itemprop');
      let value = '';
      if (prop.tagName === 'IMG' || prop.tagName === 'AUDIO' || prop.tagName === 'VIDEO' || prop.tagName === 'SOURCE') {
        value = prop.getAttribute('src') || prop.getAttribute('href') || '';
      } else if (prop.tagName === 'META') {
        value = prop.getAttribute('content') || '';
      } else if (prop.tagName === 'A') {
        value = prop.getAttribute('href') || prop.textContent.trim() || '';
      } else {
        value = prop.textContent.trim() || '';
      }
      if (name && value) {
        properties[name] = value;
      }
    });
    if (type || Object.keys(properties).length > 0) {
      data.microdata.push({ type, properties });
    }
  });

  // Open Graph
  const ogMetaTags = doc.querySelectorAll('meta[property^="og:"]');
  ogMetaTags.forEach(tag => {
    const property = tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (property && content) {
      // Convert og:title to title, etc.
      const key = property.substring(3); // Remove 'og:' prefix
      data.openGraph[key] = content;
    }
  });

  // Also extract standard meta tags that overlap with OG
  const standardMetaTags = doc.querySelectorAll('meta[name]');
  standardMetaTags.forEach(tag => {
    const name = tag.getAttribute('name');
    const content = tag.getAttribute('content');
    if (name && content) {
      // Map common meta tags to OG equivalents if not already set
      const ogMap = {
        'title': 'title',
        'description': 'description',
        'image': 'image',
        'url': 'url',
        'site_name': 'siteName',
        'author': 'author',
        'published_time': 'publishedDate',
        'modified_time': 'modifiedDate',
        'keywords': 'keywords',
        'language': 'language'
      };
      if (ogMap[name] && !data.openGraph[ogMap[name]]) {
        data.openGraph[ogMap[name]] = content;
      }
    }
  });

  return data;
};

/**
 * Extract main content using readability-inspired algorithm
 */
const extractMainContent = (doc) => {
  // Remove unwanted elements
  const removeSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 'aside',
    '.ad', '.ads', '.advertisement', '.comments', '.comment',
    '.sidebar', '.widget', '.menu', '.navigation', '.breadcrumb',
    '.social', '.sharing', '.share', '.popup', '.modal',
    '[role="banner"]', '[role="navigation"]', '[role="complementary"]',
    '[role="contentinfo"]', '[role="search"]'
  ];

  const cleanDoc = doc.cloneNode(true);
  removeSelectors.forEach(selector => {
    cleanDoc.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Try to find main content containers in order of preference
  const mainSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '.content',
    '.post',
    '.entry',
    '.article',
    '.story',
    '.page',
    '#main',
    '#content',
    '#main-content',
    '#post',
    '#entry',
    '#article'
  ];

  let mainElement = null;
  for (const selector of mainSelectors) {
    mainElement = cleanDoc.querySelector(selector);
    if (mainElement) break;
  }

  // If no main container found, use body but try to find the densest block
  if (!mainElement) {
    mainElement = cleanDoc.body;

    // Score blocks by text density (text length / total length)
    const blocks = mainElement.querySelectorAll('div, section, p, li, dd, dt');
    let bestBlock = null;
    let bestScore = 0;

    blocks.forEach(block => {
      // Skip if too small
      if (block.children.length < 2) return;

      const textLength = block.textContent.trim().length;
      const totalLength = block.innerHTML.length;

      if (totalLength > 0) {
        const density = textLength / totalLength;
        // Boost score for blocks with semantic tags or classes
        const tagScore = block.tagName === 'P' || block.tagName === 'LI' ||
                        block.tagName === 'DD' || block.tagName === 'DT' ? 1.2 : 1.0;
        const classScore = block.className &&
                          (/content|article|post|entry|main|text/i.test(block.className)) ? 1.3 : 1.0;

        const finalScore = density * tagScore * classScore * Math.log(textLength + 1);

        if (finalScore > bestScore) {
          bestScore = finalScore;
          bestBlock = block;
        }
      }
    });

    if (bestBlock && bestScore > 0.3) { // Only use if we found a decent block
      mainElement = bestBlock;
    }
  }

  // Extract text content
  if (mainElement) {
    // Get text with reasonable formatting
    const text = mainElement.textContent
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^\s+|\s+$/g, '') // Trim
      .slice(0, 5000); // Limit length

    // Try to extract a summary (first couple sentences)
    const summaryMatch = text.match(/^([^.!?]*[.!?]){1,3}/);
    const summary = summaryMatch ? summaryMatch[0].trim() : text.substring(0, Math.min(200, text.length));

    return {
      text,
      summary,
      wordCount: text.trim().split(/\s+/).filter(Boolean).length,
      charCount: text.length
    };
  }

  // Fallback to body text
  const bodyText = cleanDoc.body.textContent
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .slice(0, 3000);

  return {
    text: bodyText,
    summary: bodyText.substring(0, Math.min(200, bodyText.length)),
    wordCount: bodyText.trim().split(/\s+/).filter(Boolean).length,
    charCount: bodyText.length
  };
};

/**
 * Extract all video elements from the page
 */
const extractVideos = (doc, baseUrl) => {
  const videos = [];

  // HTML5 video elements
  const videoElements = doc.querySelectorAll('video');
  videoElements.forEach(video => {
    const src = video.getAttribute('src');
    if (src) {
      videos.push({
        type: 'html5',
        url: new URL(src, baseUrl).toString(),
        poster: video.getAttribute('poster') || '',
        preload: video.getAttribute('preload') || '',
        autoplay: video.hasAttribute('autoplay'),
        loop: video.hasAttribute('loop'),
        muted: video.hasAttribute('muted'),
        controls: video.hasAttribute('controls'),
        width: video.getAttribute('width') || '',
        height: video.getAttribute('height') || ''
      });
    }

    // Check for source tags inside video
    const sources = video.querySelectorAll('source');
    sources.forEach(source => {
      const src = source.getAttribute('src');
      if (src) {
        videos.push({
          type: 'html5-source',
          url: new URL(src, baseUrl).toString(),
          typeAttr: source.getAttribute('type') || '',
          poster: video.getAttribute('poster') || ''
        });
      }
    });
  });

  // Iframe videos (YouTube, Vimeo, etc.)
  const iframeElements = doc.querySelectorAll('iframe');
  iframeElements.forEach(iframe => {
    let src = iframe.getAttribute('src');
    if (!src) return;

    try {
      src = new URL(src, baseUrl).toString();

      // YouTube
      if (src.includes('youtube.com/embed/') || src.includes('youtu.be/')) {
        const youtubeIdMatch = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^"?&]+)/);
        if (youtubeIdMatch) {
          videos.push({
            type: 'youtube',
            videoId: youtubeIdMatch[1],
            url: src,
            title: iframe.getAttribute('title') || 'YouTube Video',
            width: iframe.getAttribute('width') || '',
            height: iframe.getAttribute('height') || ''
          });
          return; // Don't add as generic iframe
        }
      }

      // Vimeo
      if (src.includes('player.vimeo.com/video/')) {
        const vimeoIdMatch = src.match(/player\.vimeo\.com\/video\/(\d+)/);
        if (vimeoIdMatch) {
          videos.push({
            type: 'vimeo',
            videoId: vimeoIdMatch[1],
            url: src,
            title: iframe.getAttribute('title') || 'Vimeo Video',
            width: iframe.getAttribute('width') || '',
            height: iframe.getAttribute('height') || ''
          });
          return;
        }
      }

      // Streamable
      if (src.includes('streamable.com/e/')) {
        const streamableIdMatch = src.match(/streamable\.com\/e\/([^/?&]+)/);
        if (streamableIdMatch) {
          videos.push({
            type: 'streamable',
            videoId: streamableIdMatch[1],
            url: src,
            title: iframe.getAttribute('title') || 'Streamable Video',
            width: iframe.getAttribute('width') || '',
            height: iframe.getAttribute('height') || ''
          });
          return;
        }
      }

      // Dailymotion
      if (src.includes('dailymotion.com/embed/video/')) {
        const dmIdMatch = src.match(/dailymotion\.com\/embed\/video\/([^/?&]+)/);
        if (dmIdMatch) {
          videos.push({
            type: 'dailymotion',
            videoId: dmIdMatch[1],
            url: src,
            title: iframe.getAttribute('title') || 'Dailymotion Video',
            width: iframe.getAttribute('width') || '',
            height: iframe.getAttribute('height') || ''
          });
          return;
        }
      }

      // Generic iframe (might be video)
      videos.push({
        type: 'iframe',
        url: src,
        title: iframe.getAttribute('title') || 'Embedded Content',
        width: iframe.getAttribute('width') || '',
        height: iframe.getAttribute('height') || '',
        sandbox: iframe.getAttribute('sandbox') || ''
      });
    } catch (e) {
      // Invalid URL, skip
    }
  });

  // Object/embed videos (Flash, etc. - less common now)
  const objectElements = doc.querySelectorAll('object, embed');
  objectElements.forEach(obj => {
    const src = obj.getAttribute('data') || obj.getAttribute('src');
    if (src) {
      try {
        const url = new URL(src, baseUrl).toString();
        videos.push({
          type: 'object',
          url,
          title: obj.getAttribute('title') || 'Embedded Object',
          width: obj.getAttribute('width') || '',
          height: obj.getAttribute('height') || '',
          typeAttr: obj.getAttribute('type') || ''
        });
      } catch (e) {
        // Invalid URL
      }
    }
  });

  return videos;
};

/**
 * Extract images from the page
 */
const extractImages = (doc, baseUrl) => {
  const images = [];
  const seenUrls = new Set();

  // img tags
  const imgElements = doc.querySelectorAll('img');
  imgElements.forEach(img => {
    let src = img.getAttribute('src');
    if (!src) return;

    try {
      src = new URL(src, baseUrl).toString();
      // Skip data URLs, very small images, and duplicates
      if (src.startsWith('data:') || seenUrls.has(src)) return;

      // Skip likely icons/logos (small dimensions)
      const width = parseInt(img.getAttribute('width')) || 0;
      const height = parseInt(img.getAttribute('height')) || 0;
      if ((width > 0 && width < 50) || (height > 0 && height < 50)) return;

      seenUrls.add(src);
      images.push({
        url,
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || '',
        width: img.getAttribute('width') || '',
        height: img.getAttribute('height') || ''
      });
    } catch (e) {
      // Invalid URL
    }
  });

  // Open Graph images (often higher quality)
  const ogImage = doc.querySelector('meta[property="og:image"]');
  if (ogImage) {
    let src = ogImage.getAttribute('content');
    if (src) {
      try {
        src = new URL(src, baseUrl).toString();
        if (!seenUrls.has(src)) {
          images.unshift({ // Prioritize OG image
            url,
            alt: '',
            title: 'Open Graph Image',
            width: '1200', // OG images are typically large
            height: '630'
          });
          seenUrls.add(src);
        }
      } catch (e) {}
    }
  }

  // Twitter card images
  const twitterImage = doc.querySelector('meta[name="twitter:image"]');
  if (twitterImage) {
    let src = twitterImage.getAttribute('content');
    if (src) {
      try {
        src = new URL(src, baseUrl).toString();
        if (!seenUrls.has(src)) {
          images.push({
            url,
            alt: '',
            title: 'Twitter Card Image',
            width: '1200',
            height: '600'
          });
          seenUrls.add(src);
        }
      } catch (e) {}
    }
  }

  return images.slice(0, 20); // Limit to 20 images
};

/**
 * Extract metadata from meta tags
 */
const extractMetadata = (doc) => {
  const metadata = {};

  // Standard meta tags
  const metaTags = doc.querySelectorAll('meta[name], meta[property]');
  metaTags.forEach(tag => {
    // Get name or property
    const key = tag.getAttribute('name') || tag.getAttribute('property');
    if (!key) return;

    const value = tag.getAttribute('content') || '';
    if (!value) return;

    // Common mappings
    const map = {
      'title': 'title',
      'description': 'description',
      'author': 'author',
      'keywords': 'keywords',
      'language': 'language',
      'geo.placename': 'placeName',
      'geo.position': 'position',
      'geo.region': 'region',
      'icbm': 'icbm',
      'date': 'date',
      'pubdate': 'pubDate',
      'publishdate': 'publishDate',
      'timestamp': 'timestamp',
      'application-name': 'appName',
      'apple-mobile-web-app-title': 'appleTitle',
      'theme-color': 'themeColor',
      'msapplication-TileColor': 'tileColor',
      'msapplication-TileImage': 'tileImage',
      'msapplication-config': 'config',
      'viewport': 'viewport',
      'handheldfriendly': 'handheldFriendly',
      'mobileoptimized': 'mobileOptimized',
      'rating': 'rating',
      'robots': 'robots',
      'referrer': 'referrer',
      'csrf-token': 'csrfToken'
    };

    if (map[key]) {
      metadata[map[key]] = value;
    }

    // Special handling for Open Graph (already handled in extractStructuredData but keeping for completeness)
    if (key.startsWith('og:')) {
      const ogKey = key.substring(3);
      if (!metadata[ogKey]) { // Don't overwrite if already set
        metadata[ogKey] = value;
      }
    }

    // Special handling for Twitter Card
    if (key.startsWith('twitter:')) {
      const twKey = key.substring(8);
      if (!metadata[`twitter_${twKey}`]) {
        metadata[`twitter_${twKey}`] = value;
      }
    }
  });

  // Link tags for canonical, icons, etc.
  const linkTags = doc.querySelectorAll('link[rel]');
  linkTags.forEach(link => {
    const rel = link.getAttribute('rel');
    const href = link.getAttribute('href');
    if (!rel || !href) return;

    try {
      const url = new URL(href, doc.baseURI || window.location.href).toString();

      if (rel === 'canonical') {
        metadata.canonicalUrl = url;
      } else if (rel === 'icon' || rel === 'shortcut icon') {
        metadata.favicon = url;
      } else if (rel === 'apple-touch-icon') {
        metadata.appleTouchIcon = url;
      } else if (rel === 'stylesheet') {
        // Could track CSS but usually not needed for content extraction
      }
    } catch (e) {
      // Invalid URL
    }
  });

  return metadata;
};

/**
 * Determine the type of content based on signals
 */
const determineContentType = (doc, structuredData, mainContent, videos) => {
  // Check for article/blog post indicators
  const articleIndicators = [
    doc.querySelector('article'),
    doc.querySelector('[role="article"]'),
    doc.querySelector('.post, .article, .entry, .blog-post, .news-article'),
    structuredData.jsonLd.some(item =>
      ['Article', 'BlogPosting', 'NewsArticle', 'ScholarlyArticle'].includes(item['@type']) ||
      (Array.isArray(item['@type']) && item['@type'].some(t =>
        ['Article', 'BlogPosting', 'NewsArticle', 'ScholarlyArticle'].includes(t))
    )),
    structuredData.microdata.some(item =>
      item.type &&
      ['Article', 'BlogPosting', 'NewsArticle', 'ScholarlyArticle'].some(t =>
        item.type.includes(t)
      )
    ),
    structuredData.openGraph['og:type'] === 'article'
  ];

  if (articleIndicators.some(Boolean)) {
    return 'article';
  }

  // Check for product page
  const productIndicators = [
    structuredData.jsonLd.some(item =>
      ['Product', 'Offer', 'AggregateOffer'].includes(item['@type']) ||
      (Array.isArray(item['@type']) && item['@type'].some(t =>
        ['Product', 'Offer', 'AggregateOffer'].includes(t))
    )),
    structuredData.microdata.some(item =>
      item.type &&
      ['Product', 'Offer', 'AggregateOffer'].some(t =>
        item.type.includes(t)
      )
    ),
    structuredData.openGraph['og:type'] === 'product',
    doc.querySelector('[itemprop="offers"], [itemprop="price"], .price, .cost, .buy, .purchase')
  ];

  if (productIndicators.some(Boolean)) {
    return 'product';
  }

  // Check for video-centric page
  if (videos.length > 0 &&
      (videos.some(v => v.type === 'youtube' || v.type === 'vimeo') ||
       mainContent.wordCount < 300)) {
    return 'video';
  }

  // Check for image gallery
  const images = doc.querySelectorAll('img');
  if (images.length > 10 && mainContent.wordCount < 500) {
    // Likely a gallery if many images and little text
    return 'gallery';
  }

  // Default to general webpage
  return 'webpage';
};

/**
 * Extract title from document (fallback)
 */
const extractTitle = (doc) => {
  // Try og:title first
  const ogTitle = doc.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.getAttribute('content')) {
    return ogTitle.getAttribute('content');
  }

  // Try twitter:title
  const twitterTitle = doc.querySelector('meta[name="twitter:title"]');
  if (twitterTitle && twitterTitle.getAttribute('content')) {
    return twitterTitle.getAttribute('content');
  }

  // Try standard title tag
  const titleTag = doc.querySelector('title');
  if (titleTag && titleTag.textContent.trim()) {
    return titleTag.textContent.trim();
  }

  // Try h1
  const h1 = doc.querySelector('h1');
  if (h1 && h1.textContent.trim()) {
    return h1.textContent.trim();
  }

  return '';
};

export default { parseWebPage };