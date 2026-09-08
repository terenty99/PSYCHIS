import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Zap,
  Globe,
  ExternalLink,
  Maximize2,
  Minimize2,
  Bookmark,
  Search,
  BookOpen,
  Copy,
  Check,
  Camera,
  Loader2,
  Film,
  Plus,
  Home,
} from 'lucide-react';
import { BreakcoreHomepage } from './BreakcoreHomepage';
import { PsychisLogo } from './PsychisLogo';

const QUICK_BOOKMARKS = [
  { name: '⚡ Breakcore Search', url: 'psychis://home' },
  { name: '🎬 YouTube', url: 'https://www.youtube.com' },
  { name: '⚡ Fast Search', url: 'https://html.duckduckgo.com' },
  { name: '📚 Wikipedia', url: 'https://en.m.wikipedia.org' },
  { name: '📄 arXiv', url: 'https://arxiv.org' },
  { name: '🔬 Phys.org', url: 'https://phys.org' },
  { name: '🌐 Nature', url: 'https://www.nature.com' },
];

/**
 * Detects if a URL is a video source (YouTube, Vimeo, or direct video file)
 * and returns the optimal player configuration.
 */
export const getVideoMetadata = (url) => {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();

  // 1. YouTube Watch / Shorts / Share / Embed URL (direct video links)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|watch|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = clean.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      // embedUrl for fallback iframe player
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`,
      title: 'YouTube HD Player',
    };
  }

  // 2. Vimeo Player
  const vimeoRegex = /(?:vimeo\.com\/(?:video\/)?)([0-9]+)/i;
  const vimeoMatch = clean.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?title=0&byline=0`,
      title: 'Vimeo Player',
    };
  }

  // 4. Direct HTML5 Video (.mp4, .webm, .ogg, .mov, .m4v)
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(clean)) {
    return {
      type: 'direct_video',
      embedUrl: clean,
      title: 'Direct HTML5 Video Stream',
    };
  }

  return null;
};

/**
 * Resolves a search term or raw URL into a fast, reliable web destination.
 */
const resolveNavigationTarget = (target) => {
  let finalUrl = (target || '').trim();
  if (!finalUrl) return '';

  if (finalUrl === 'about:blank' || finalUrl === 'psychis://home' || finalUrl.toLowerCase() === 'home') {
    return 'psychis://home';
  }

  if (/^https?:\/\//i.test(finalUrl)) {
    return finalUrl;
  }

  if (/^[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/.*)?$/i.test(finalUrl) && !finalUrl.includes(' ')) {
    return `https://${finalUrl}`;
  }

  if (
    finalUrl.toLowerCase().startsWith('video ') ||
    finalUrl.toLowerCase().startsWith('yt ') ||
    finalUrl.toLowerCase().startsWith('youtube ')
  ) {
    const q = finalUrl.replace(/^(video|yt|youtube)\s+/i, '');
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  }

  if (finalUrl.toLowerCase().startsWith('wiki ')) {
    const q = finalUrl.replace(/^wiki\s+/i, '');
    return `https://en.m.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`;
  }

  // Automatic YouTube video search if query looks like video/edit/media
  if (/\b(edit|edits|video|clip|compilation|trailer|song|remix)\b/i.test(finalUrl)) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(finalUrl)}`;
  }

  // Fast Instant HTML Search
  return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(finalUrl)}`;
};

/**
 * Generate human-readable tab title from URL or context
 */
export const getTabTitleFromUrl = (url, customTitle) => {
  if (customTitle && customTitle.trim()) return customTitle.trim();
  if (!url) return 'New Tab';
  const clean = url.trim();

  // Breakcore Homepage check
  if (clean === 'psychis://home' || clean === 'about:blank') return 'Search';

  // Video metadata check
  const videoMeta = getVideoMetadata(clean);
  if (videoMeta?.type === 'youtube') return 'YouTube';
  if (videoMeta?.type === 'vimeo') return 'Vimeo';
  if (videoMeta?.type === 'direct_video') return 'Direct Video';

  // arXiv check
  const arxivMatch = clean.match(/arxiv\.org\/(?:abs|pdf)\/([0-9.]+)/i);
  if (arxivMatch && arxivMatch[1]) return `arXiv:${arxivMatch[1]}`;

  // Wikipedia check
  const wikiMatch = clean.match(/wikipedia\.org\/wiki\/([^#?]+)/i);
  if (wikiMatch && wikiMatch[1]) {
    try {
      return decodeURIComponent(wikiMatch[1]).replace(/_/g, ' ');
    } catch (_) {
      return wikiMatch[1].replace(/_/g, ' ');
    }
  }

  // DuckDuckGo Search check
  if (clean.includes('duckduckgo.com')) {
    const qMatch = clean.match(/[?&]q=([^&]+)/);
    if (qMatch && qMatch[1]) {
      try {
        return `Search: ${decodeURIComponent(qMatch[1]).replace(/\+/g, ' ')}`;
      } catch (_) {
        return `Search: ${qMatch[1]}`;
      }
    }
    return 'DuckDuckGo';
  }

  // Domain fallback
  try {
    const parsed = new URL(clean);
    const host = parsed.hostname.replace(/^www\./, '');
    return host || clean;
  } catch (_) {
    return clean.length > 20 ? `${clean.slice(0, 20)}…` : clean;
  }
};

/**
 * Helper to determine tab icon category
 */
export const getTabIconType = (url) => {
  if (!url || url === 'psychis://home' || url === 'about:blank') return 'home';
  const meta = getVideoMetadata(url);
  if (meta) return 'video';
  if (url.includes('wikipedia.org') || url.includes('arxiv.org') || url.includes('nature.com') || url.includes('phys.org')) {
    return 'scholarly';
  }
  if (url.includes('duckduckgo.com') || url.includes('google.com') || url.includes('search')) {
    return 'search';
  }
  return 'web';
};

/**
 * Single Tab Frame Viewport Component
 * Kept alive via CSS display: flex/none to preserve DOM, videos, and scroll positions across tabs.
 */
const TabFrameItem = ({
  tab,
  isActive,
  isElectron,
  onUpdateNav,
  onLoadingChange,
}) => {
  const iframeRef = useRef(null);
  const videoRef = useRef(null);
  const webviewRef = useRef(null);
  const lastNavUrlRef = useRef(tab.url);

  const videoMeta = getVideoMetadata(tab.url);
  const effectiveFrameUrl = videoMeta?.embedUrl || tab.url;

  // Electron webview event listeners
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview || !isElectron) return;

    const handleDidNavigate = (e) => {
      if (e.url && e.url !== lastNavUrlRef.current) {
        lastNavUrlRef.current = e.url;
        onUpdateNav?.(tab.id, e.url, null);
      }
    };

    const handleTitleUpdated = (e) => {
      if (e.title) {
        onUpdateNav?.(tab.id, null, e.title);
      }
    };

    const handleStartLoading = () => onLoadingChange?.(tab.id, true);
    const handleStopLoading = () => onLoadingChange?.(tab.id, false);

    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigate);
    webview.addEventListener('page-title-updated', handleTitleUpdated);
    webview.addEventListener('did-start-loading', handleStartLoading);
    webview.addEventListener('did-stop-loading', handleStopLoading);

    return () => {
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener('did-navigate-in-page', handleDidNavigate);
      webview.removeEventListener('page-title-updated', handleTitleUpdated);
      webview.removeEventListener('did-start-loading', handleStartLoading);
      webview.removeEventListener('did-stop-loading', handleStopLoading);
    };
  }, [isElectron, tab.id, onUpdateNav, onLoadingChange]);

  const isHomepage = tab.url === 'psychis://home' || tab.url === 'about:blank' || !tab.url;

  return (
    <div
      style={{ display: isActive ? 'flex' : 'none' }}
      className={`w-full h-full relative flex-1 overflow-hidden ${isHomepage ? 'bg-[#121212]' : 'bg-white-pure'}`}
    >
      {isHomepage ? (
        <BreakcoreHomepage
          onNavigate={(target) => {
            onUpdateNav?.(tab.id, target, null);
            onLoadingChange?.(tab.id, true);
          }}
          onLuckySearch={(target) => {
            const dest = `https://www.google.com/search?btnI=1&q=${encodeURIComponent(target)}`;
            onUpdateNav?.(tab.id, dest, null);
            onLoadingChange?.(tab.id, true);
          }}
        />
      ) : isElectron ? (
        <webview
          ref={webviewRef}
          src={tab.url}
          style={{ width: '100%', height: '100%', display: 'flex' }}
          className="w-full h-full border-none bg-white-pure"
          allowpopups="true"
          webpreferences="allowRunningInsecureContent=yes, contextIsolation=yes"
        />
      ) : videoMeta?.type === 'direct_video' ? (
        <video
          ref={videoRef}
          src={videoMeta.embedUrl}
          controls
          playsInline
          className="w-full h-full object-contain bg-black"
          onLoadedData={() => onLoadingChange?.(tab.id, false)}
          onError={() => onLoadingChange?.(tab.id, false)}
        />
      ) : (
        <iframe
          ref={iframeRef}
          src={effectiveFrameUrl}
          title={tab.title || videoMeta?.title || 'Web View'}
          className={`w-full h-full border-none select-auto ${videoMeta ? 'bg-black' : 'bg-white-pure'}`}
          onLoad={() => onLoadingChange?.(tab.id, false)}
          onError={() => onLoadingChange?.(tab.id, false)}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen={true}
        />
      )}
    </div>
  );
};

export const getBrowserQuickTargets = (activeNode) => {
  if (!activeNode?.data) return ['Scientific Diagram', 'High Resolution', 'Historical Archive'];
  const title = activeNode.data.title || 'Topic';
  const cat = (activeNode.data.category || '').toLowerCase();
  const list = [title];
  if (cat && !title.toLowerCase().includes(cat)) {
    list.push(`${title} ${cat}`);
  }
  list.push(`${title} photography`);
  list.push(`${title} diagram`);
  list.push(`${title} high resolution`);
  return list;
};

export const EmbeddedBrowser = ({
  isOpen = false,
  url = 'https://arxiv.org/abs/2307.12008',
  viewMode = 'split',
  onSwitchViewMode,
  activeNode,
  onClose,
  onMapToGraph,
  onClipToNode,
  isInspectorOpen = false,
  onUpdateNodeData,
  browserViewTab = 'frame',
  onSwitchBrowserViewTab,
}) => {
  const initialUrl = url || 'psychis://home';
  const [tabs, setTabs] = useState(() => [
    {
      id: 'tab_init',
      url: initialUrl,
      inputUrl: initialUrl,
      title: activeNode?.data?.title || getTabTitleFromUrl(initialUrl),
      history: [initialUrl],
      historyIndex: 0,
      isLoading: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab_init');
  const [clipStatus, setClipStatus] = useState('');
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const tabsContainerRef = useRef(null);
  const bookmarksRef = useRef(null);
  const lastPropUrlRef = useRef(initialUrl);

  const isElectron = typeof window !== 'undefined' && (
    Boolean(window.process?.versions?.electron) ||
    (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron'))
  );

  // Active tab helper
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || {
    id: 'fallback',
    url: initialUrl,
    inputUrl: initialUrl,
    title: 'New Tab',
    history: [initialUrl],
    historyIndex: 0,
    isLoading: false,
  };

  // Sync address bar when active tab changes or inputUrl changes
  const [omnibarInput, setOmnibarInput] = useState(activeTab.inputUrl);
  useEffect(() => {
    setOmnibarInput(activeTab.inputUrl || activeTab.url);
  }, [activeTab.id, activeTab.inputUrl, activeTab.url]);

  // Loading safety timeout per tab
  useEffect(() => {
    if (!activeTab.isLoading) return;
    const timer = setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab.id ? { ...t, isLoading: false } : t))
      );
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeTab.isLoading, activeTab.id]);

  // Sync with incoming url prop only when browser is explicitly opened
  useEffect(() => {
    if (!isOpen || !url) return;
    if (lastPropUrlRef.current === url) return;
    lastPropUrlRef.current = url;

    setTabs((prevTabs) => {
      // 1. If an existing tab already has this exact URL, switch to it
      const existing = prevTabs.find((t) => t.url === url);
      if (existing) {
        setActiveTabId(existing.id);
        return prevTabs;
      }

      // 2. If current active tab is an untouched default search tab, reuse it
      const current = prevTabs.find((t) => t.id === activeTabId);
      const isCleanDefault =
        current &&
        (current.url === 'https://html.duckduckgo.com' ||
          current.url === 'about:blank' ||
          current.url === 'psychis://home') &&
        current.history.length <= 1;

      const title = (activeNode?.data?.url === url ? activeNode?.data?.title : null) || getTabTitleFromUrl(url);

      if (isCleanDefault) {
        return prevTabs.map((t) =>
          t.id === current.id
            ? {
                ...t,
                url,
                inputUrl: url,
                title,
                history: [url],
                historyIndex: 0,
                viewTab: 'frame',
                isLoading: true,
              }
            : t
        );
      }

      // 3. Otherwise navigate current active tab to this URL instead of multiplying tabs
      return prevTabs.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url,
              inputUrl: url,
              title,
              history: [...t.history.slice(0, t.historyIndex + 1), url],
              historyIndex: t.historyIndex + 1,
              viewTab: 'frame',
              isLoading: true,
            }
          : t
      );
    });
  }, [isOpen, url, activeTabId]);

  // Click-outside listener for quick sites popover
  useEffect(() => {
    if (!isBookmarksOpen) return;
    const handleClickOutside = (e) => {
      if (bookmarksRef.current && !bookmarksRef.current.contains(e.target)) {
        setIsBookmarksOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isBookmarksOpen]);

  // Tab Operations
  const handleNewTab = useCallback((targetUrl = 'psychis://home', titleOverride = '') => {
    const finalUrl = resolveNavigationTarget(targetUrl) || targetUrl;
    const newTabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isHome = finalUrl === 'psychis://home';
    const newTab = {
      id: newTabId,
      url: finalUrl,
      inputUrl: finalUrl,
      title: getTabTitleFromUrl(finalUrl, titleOverride),
      history: [finalUrl],
      historyIndex: 0,
      isLoading: !isHome,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);

    // Auto-scroll tab strip to end
    setTimeout(() => {
      if (tabsContainerRef.current) {
        tabsContainerRef.current.scrollTo({
          left: tabsContainerRef.current.scrollWidth,
          behavior: 'smooth',
        });
      }
    }, 50);
  }, []);

  const handleCloseTab = useCallback((tabIdToClose, e) => {
    if (e) e.stopPropagation();

    setTabs((prevTabs) => {
      const targetIndex = prevTabs.findIndex((t) => t.id === tabIdToClose);
      if (targetIndex === -1) return prevTabs;

      // If closing the last remaining tab in browser:
      if (prevTabs.length <= 1) {
        const freshTabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const freshTab = {
          id: freshTabId,
          url: 'psychis://home',
          inputUrl: 'psychis://home',
          title: 'Search',
          history: ['psychis://home'],
          historyIndex: 0,
          isLoading: false,
        };
        setActiveTabId(freshTabId);
        return [freshTab];
      }

      const nextTabs = prevTabs.filter((t) => t.id !== tabIdToClose);

      // If active tab was closed, switch to adjacent tab
      if (activeTabId === tabIdToClose) {
        const nextIndex = Math.min(targetIndex, nextTabs.length - 1);
        setActiveTabId(nextTabs[nextIndex].id);
      }

      return nextTabs;
    });
  }, [activeTabId]);

  const handleSwitchTab = (tabId) => {
    setActiveTabId(tabId);
  };

  const handleDuplicateTab = (tabId) => {
    const target = tabs.find((t) => t.id === tabId) || activeTab;
    if (!target) return;

    const newTabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const duplicatedTab = {
      ...target,
      id: newTabId,
      title: `${target.title} (Copy)`,
      history: [...target.history],
    };

    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tabId);
      const next = [...prev];
      next.splice(idx + 1, 0, duplicatedTab);
      return next;
    });
    setActiveTabId(newTabId);
  };

  const handleNavigate = (target) => {
    const finalUrl = resolveNavigationTarget(target);
    if (!finalUrl || !activeTab) return;

    const title = getTabTitleFromUrl(finalUrl);

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTab.id) return t;
        const nextHistory = [...t.history.slice(0, t.historyIndex + 1), finalUrl];
        return {
          ...t,
          url: finalUrl,
          inputUrl: finalUrl,
          title,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
          isLoading: true,
        };
      })
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleNavigate(omnibarInput);
  };

  const handleBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const nextIndex = activeTab.historyIndex - 1;
    const prevUrl = activeTab.history[nextIndex];

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              historyIndex: nextIndex,
              url: prevUrl,
              inputUrl: prevUrl,
              title: getTabTitleFromUrl(prevUrl),
              isLoading: true,
            }
          : t
      )
    );
  };

  const handleForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const nextIndex = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[nextIndex];

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              historyIndex: nextIndex,
              url: nextUrl,
              inputUrl: nextUrl,
              title: getTabTitleFromUrl(nextUrl),
              isLoading: true,
            }
          : t
      )
    );
  };

  const handleReload = () => {
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, isLoading: true } : t))
    );
  };

  const handleUpdateTabNav = useCallback((tabId, nextUrl, nextTitle) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId) return t;
        const updatedUrl = nextUrl || t.url;
        const updatedTitle = nextTitle || (nextUrl ? getTabTitleFromUrl(nextUrl) : t.title);
        return {
          ...t,
          url: updatedUrl,
          inputUrl: updatedUrl,
          title: updatedTitle,
        };
      })
    );
  }, []);

  const handleTabLoadingChange = useCallback((tabId, isLoading) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, isLoading } : t))
    );
  }, []);

  const handleCopyUrl = () => {
    if (activeTab?.url) {
      navigator.clipboard?.writeText(activeTab.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1500);
    }
  };

  const handleClip = () => {
    if (!activeTab?.url) return;
    const textToClip = `[Live Web Reference from ${activeTab.url}]`;
    onClipToNode?.({
      text: textToClip,
      url: activeTab.url,
      nodeId: activeNode?.id,
    });
    setClipStatus('clipped');
    setTimeout(() => setClipStatus(''), 1500);
  };

  const handleOpenExternal = () => {
    if (activeTab?.url) {
      window.open(activeTab.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Keyboard Shortcuts (Tabs management)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Ctrl+T: New Tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
        return;
      }

      // Ctrl+W: Close Tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) {
          handleCloseTab(activeTabId);
        }
        return;
      }

      // Ctrl+Tab / Ctrl+Shift+Tab: Switch Tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        setTabs((currentTabs) => {
          if (currentTabs.length <= 1) return currentTabs;
          const currentIndex = currentTabs.findIndex((t) => t.id === activeTabId);
          if (currentIndex === -1) return currentTabs;
          const delta = e.shiftKey ? -1 : 1;
          const nextIndex = (currentIndex + delta + currentTabs.length) % currentTabs.length;
          setActiveTabId(currentTabs[nextIndex].id);
          return currentTabs;
        });
        return;
      }

      // Ctrl+1 through Ctrl+8: Quick Switch
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key >= '1' && e.key <= '8') {
        const targetIdx = parseInt(e.key, 10) - 1;
        setTabs((currentTabs) => {
          if (currentTabs[targetIdx]) {
            e.preventDefault();
            setActiveTabId(currentTabs[targetIdx].id);
          }
          return currentTabs;
        });
        return;
      }

      // Ctrl+9: Last tab
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === '9') {
        setTabs((currentTabs) => {
          if (currentTabs.length > 0) {
            e.preventDefault();
            setActiveTabId(currentTabs[currentTabs.length - 1].id);
          }
          return currentTabs;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTabId, handleNewTab, handleCloseTab]);

  const isSplit = viewMode === 'split';
  const isFullScreen = viewMode === 'browser';

  return (
    <>
      {isOpen && isFullScreen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[75] bg-[#3A3530]/25 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto"
          aria-hidden="true"
        />
      )}

      <aside
        id="embedded-browser"
        onWheel={(e) => e.stopPropagation()}
        className={`fixed inset-y-0 left-0 z-[80] flex flex-col bg-white-pure border-r border-grey-medium shadow-[20px_0_50px_rgba(0,0,0,0.14)] transition-all duration-350 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden ${
          isFullScreen
            ? 'w-screen max-w-full'
            : isSplit
            ? 'w-[calc(100vw-540px)] max-w-[1040px]'
            : 'w-[840px] max-w-[94vw]'
        } ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto visible' : '-translate-x-full opacity-0 pointer-events-none invisible'}`}
        aria-label="Real embedded web browser workstation with tabs"
      >
        {/* TIER 1: Sleek Browser Tab Strip */}
        <div
          role="tablist"
          aria-label="Browser tabs"
          className="bg-[#ECEAE6] border-b border-grey-medium px-2 pt-1.5 flex items-center gap-1 select-none overflow-hidden shrink-0"
        >
          {/* Scrollable Tabs List */}
          <div
            ref={tabsContainerRef}
            onWheel={(e) => {
              if (tabsContainerRef.current) {
                tabsContainerRef.current.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-none py-0.5"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const iconType = getTabIconType(tab.url);

              return (
                <div
                  key={tab.id}
                  role="tab"
                  id={`tab-btn-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`tab-panel-${tab.id}`}
                  onClick={() => handleSwitchTab(tab.id)}
                  onAuxClick={(e) => {
                    if (e.button === 1) handleCloseTab(tab.id, e); // Middle click close
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleDuplicateTab(tab.id);
                  }}
                  className={`group relative flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-t-lg text-xs font-mono transition-all duration-150 cursor-pointer max-w-[180px] min-w-[100px] shrink-0 border-t-2 border-x ${
                    isActive
                      ? 'bg-[#FAF9F6] text-text-primary font-medium border-t-text-primary border-x-grey-medium shadow-3xs -mb-px pb-1.5 z-10'
                      : 'bg-transparent text-text-secondary hover:bg-white-warm/90 hover:text-text-primary border-t-transparent border-x-transparent hover:border-grey-medium/50'
                  }`}
                  title={`${tab.title} (${tab.url}) — Right-click to duplicate`}
                >
                  {/* Tab Icon / Status */}
                  <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center text-text-muted">
                    {tab.isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin text-text-primary" />
                    ) : iconType === 'home' ? (
                      <PsychisLogo size={14} background="white" strokeColor="#4A4540" />
                    ) : iconType === 'video' ? (
                      <Film className="w-3 h-3 text-red-600" />
                    ) : iconType === 'scholarly' ? (
                      <BookOpen className="w-3 h-3 text-indigo-600" />
                    ) : iconType === 'search' ? (
                      <Search className="w-3 h-3 text-amber-600" />
                    ) : (
                      <Globe className="w-3 h-3 text-text-muted" />
                    )}
                  </div>

                  {/* Tab Title Text */}
                  <span className="truncate flex-1 text-[11px] leading-tight select-none">
                    {tab.title || 'New Tab'}
                  </span>

                  {/* Close Tab Button */}
                  <button
                    type="button"
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-text-muted hover:text-red-600 hover:bg-red-50 active:scale-95 transition-colors cursor-pointer shrink-0 ${
                      isActive ? 'opacity-80 hover:opacity-100' : 'opacity-0 group-hover:opacity-80'
                    }`}
                    title="Close Tab (Ctrl+W)"
                    aria-label={`Close tab: ${tab.title}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}

            {/* New Tab Button (+) positioned right after recent tab */}
            <button
              type="button"
              onClick={() => handleNewTab()}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[#FAF9F6] active:scale-95 transition-colors border border-transparent hover:border-grey-medium shrink-0 cursor-pointer shadow-3xs ml-0.5"
              title="New Tab (Ctrl+T)"
              aria-label="Open new browser tab"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TIER 2: Navigation & Omnibar Controls */}
        <header className="relative bg-[#FAF9F6] border-b border-grey-medium px-3 py-2 flex items-center gap-2 select-none shadow-3xs shrink-0 z-10">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleBack}
              disabled={activeTab.historyIndex <= 0}
              className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs disabled:opacity-25 disabled:cursor-not-allowed"
              title="Back"
              aria-label="Navigate back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleForward}
              disabled={activeTab.historyIndex >= activeTab.history.length - 1}
              className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs disabled:opacity-25 disabled:cursor-not-allowed"
              title="Forward"
              aria-label="Navigate forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReload}
              className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs"
              title="Reload"
              aria-label="Reload current tab"
            >
              <RotateCw className={`w-3.5 h-3.5 ${activeTab.isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => handleNavigate('psychis://home')}
              className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs flex items-center justify-center bg-white border border-grey-medium hover:border-text-primary/40 shadow-3xs"
              title="PSYCHIS Home Canvas & Search"
              aria-label="Navigate to PSYCHIS home"
            >
              <PsychisLogo size={18} background="none" withBorder={false} strokeColor="#4A4540" />
            </button>
          </div>

          {/* Omnibar (Address & Search) */}
          <form
            id="browser-omnibar-form"
            onSubmit={handleFormSubmit}
            className="flex-1 min-w-0 flex items-center"
          >
            <div className="w-full bg-[#F5F4F2] hover:bg-white-pure focus-within:bg-white-pure border border-grey-medium hover:border-grey-strong focus-within:border-text-primary rounded-xl px-2.5 h-7.5 flex items-center gap-2 shadow-3xs transition-colors">
              <Lock className="w-3 h-3 text-text-muted shrink-0" />
              <input
                type="text"
                value={omnibarInput}
                onChange={(e) => setOmnibarInput(e.target.value)}
                placeholder="Search web or enter address..."
                className="flex-1 min-w-0 bg-transparent border-none outline-none font-mono text-[11px] text-text-primary placeholder:text-text-faint select-text"
                spellCheck={false}
              />
              {omnibarInput && omnibarInput !== activeTab.url && (
                <button
                  type="button"
                  onClick={() => setOmnibarInput(activeTab.url)}
                  className="text-text-faint hover:text-text-primary p-0.5"
                  title="Reset address"
                  aria-label="Reset address"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                type="submit"
                className="text-text-muted hover:text-text-primary cursor-pointer p-0.5 shrink-0"
                title="Navigate"
                aria-label="Submit URL"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Action Group */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Sites Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
                className={`btn-contemplative !h-7 !px-2 text-[11px] font-mono flex items-center gap-1 transition-colors ${
                  isBookmarksOpen ? '!bg-white-pure border-grey-strong text-text-primary' : ''
                }`}
                title="Quick Sites"
                aria-expanded={isBookmarksOpen}
              >
                <Bookmark className="w-3 h-3 text-text-muted" />
                <span className="hidden md:inline text-[10.5px]">Sites</span>
              </button>

              {/* Quick Sites Menu */}
              {isBookmarksOpen && (
                <div
                  ref={bookmarksRef}
                  className="absolute top-9 left-0 z-50 bg-white-pure border border-grey-medium rounded-xl shadow-xl p-1.5 min-w-[180px] flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2 py-1 text-[9.5px] font-mono font-bold text-text-muted uppercase tracking-wider">
                    Quick Destinations
                  </div>
                  {QUICK_BOOKMARKS.map((bm) => (
                    <button
                      key={bm.name}
                      type="button"
                      onClick={() => {
                        handleNavigate(bm.url);
                        setIsBookmarksOpen(false);
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-grey-soft text-text-primary text-left transition-colors cursor-pointer"
                    >
                      <span>{bm.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clip to Node */}
            <button
              onClick={handleClip}
              className={`btn-contemplative !h-7 !px-2 text-[11px] font-mono flex items-center gap-1 transition-all ${
                clipStatus === 'clipped' ? '!bg-emerald-50 !border-emerald-300 text-emerald-700' : ''
              }`}
              title="Clip reference to selected node dossier"
              aria-label="Clip page reference to selected node"
            >
              {clipStatus === 'clipped' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px]">Clipped!</span>
                </>
              ) : (
                <>
                  <Camera className="w-3 h-3 text-text-secondary" />
                  <span className="hidden md:inline text-[10.5px]">Clip</span>
                </>
              )}
            </button>

            {/* Map to Graph */}
            <button
              onClick={() => {
                onMapToGraph?.(activeTab.url);
                setClipStatus('mapped');
                setTimeout(() => setClipStatus(''), 1500);
              }}
              className={`btn-contemplative !h-7 !px-2 text-[11px] font-mono flex items-center gap-1 transition-all ${
                clipStatus === 'mapped' ? '!bg-amber-50 !border-amber-300 text-amber-800' : ''
              }`}
              title="Map current page as new card on canvas"
              aria-label="Map page to spatial canvas"
            >
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="hidden md:inline text-[10.5px]">
                {clipStatus === 'mapped' ? 'Mapped!' : 'Map'}
              </span>
            </button>

            {/* Subtle Divider */}
            <div className="w-[1px] h-4 bg-grey-medium/70 mx-0.5" />

            {/* Maximize / Restore */}
            <button
              onClick={() => {
                if (isFullScreen) {
                  onSwitchViewMode?.(isInspectorOpen ? 'split' : 'drawer');
                } else {
                  onSwitchViewMode?.('browser');
                }
              }}
              className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs"
              title={isFullScreen ? (isInspectorOpen ? 'Restore Split View' : 'Restore Side Panel') : 'Maximize Fullscreen'}
              aria-label="Toggle full screen view"
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>


            {/* Close Entire Browser */}
            <button
              onClick={onClose}
              className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs hover:!bg-red-50 hover:text-red-600"
              title="Close Browser"
              aria-label="Close embedded browser"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* VIEWPORT AREA: Tabs DOM-retention */}
        <div className="flex-1 relative bg-white-pure w-full h-full overflow-hidden flex flex-col">
          {/* Render Frame View for all tabs (retaining DOM / state when inactive) */}
          {tabs.map((tab) => {
            const isTabActive = tab.id === activeTabId;

            return (
              <div
                key={tab.id}
                id={`tab-panel-${tab.id}`}
                role="tabpanel"
                aria-labelledby={`tab-btn-${tab.id}`}
                style={{ display: isTabActive ? 'flex' : 'none' }}
                className="w-full h-full flex-1"
              >
                <TabFrameItem
                  tab={tab}
                  isActive={isTabActive}
                  isElectron={isElectron}
                  onUpdateNav={handleUpdateTabNav}
                  onLoadingChange={handleTabLoadingChange}
                />
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};