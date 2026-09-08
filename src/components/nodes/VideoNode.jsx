import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import {
  Play,
  Maximize2,
  RotateCcw,
  Tv,
} from 'lucide-react';
import { searchWebVideos } from '../../utils/visualSearchEngine';

export const VideoNode = ({
  node,
  isSelected,
  isAnticipating = false,
  isDragging,
  isLinkSelected = false,
  isLinkShaking = false,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onInspect,
  onSpecificProbe,
}) => {
  const data = node.data || {};
  const videoData = data.videoData || {};
  const videoId = videoData.videoId || (videoData.url?.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/#\s]{11})/i)?.[1]) || null;
  const platform = videoData.platform || (videoId ? 'youtube' : 'web');
  const thumbnail = videoData.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : (data.primaryPhoto?.url || data.photos?.[0]?.url || ''));

  // Auto-resolve video if videoId missing
  const [resolvedVideoId, setResolvedVideoId] = useState(videoId);
  const [resolvedThumbnail, setResolvedThumbnail] = useState(thumbnail);

  useEffect(() => {
    if (!resolvedVideoId) {
      const q = videoData.videoQuery || data.videoQuery || data.title || '';
      if (q) {
        searchWebVideos(q).then((vids) => {
          if (Array.isArray(vids) && vids.length > 0) {
            const first = vids[0];
            if (first.videoId) {
              setResolvedVideoId(first.videoId);
              node.data.videoData = { ...(node.data.videoData || {}), ...first };
            }
            if (first.thumbnail) {
              setResolvedThumbnail(first.thumbnail);
            }
          }
        }).catch(() => {});
      }
    }
  }, [resolvedVideoId, videoData.videoQuery, data.videoQuery, data.title, node.data]);

  const effectiveVideoId = resolvedVideoId || videoId;
  const effectiveThumbnail = resolvedThumbnail || thumbnail || (effectiveVideoId ? `https://i.ytimg.com/vi/${effectiveVideoId}/hqdefault.jpg` : '');

  // Playback & Interaction States
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreviewCover, setShowPreviewCover] = useState(true);
  const [currentTime, setCurrentTime] = useState(data.savedTimestamp || 0);
  const [isTheater, setIsTheater] = useState(false);

  // References for timers & iframe
  const idleTimerRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  const iframeRef = useRef(null);
  const videoElementRef = useRef(null);
  const savedTimeRef = useRef(data.savedTimestamp || 0);

  // Sync saved time ref
  useEffect(() => {
    savedTimeRef.current = currentTime;
    node.data.savedTimestamp = currentTime;
  }, [currentTime, node.data]);

  // Format seconds -> M:SS
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Reset 30-Second Inactivity / Unwatched Preview Timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    // Only arm idle timer if video is paused or idle
    if (!isPlaying && !showPreviewCover) {
      idleTimerRef.current = setTimeout(() => {
        // Revert to preview thumbnail as if unwatched, preserving timestamp
        setShowPreviewCover(true);
      }, 30000);
    }
  }, [isPlaying, showPreviewCover]);

  // Reset timer on user interaction
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    resetIdleTimer();
  }, [resetIdleTimer]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer, isPlaying]);

  // Handle Play / Resume from saved timestamp
  const handleStartPlay = (e) => {
    e?.stopPropagation?.();
    setShowPreviewCover(false);
    setIsPlaying(true);
    resetIdleTimer();
  };



  // Toggle Theater Mode
  const handleToggleTheater = (e) => {
    e.stopPropagation();
    setIsTheater((prev) => !prev);
  };

  // Density & layout classes
  const density = data.layout?.density || 'comfortable';
  const descClampClass =
    density === 'expanded' ? 'line-clamp-6' : density === 'compact' ? 'line-clamp-2' : 'line-clamp-4';

  const nodeWidth = isTheater ? 780 : (data.layout?.width || 420);

  return (
    <SmartGlassPanel
      nodeId={node.id}
      isSelected={isSelected}
      isAnticipating={isAnticipating}
      isDragging={isDragging}
      isLinkSelected={isLinkSelected}
      isLinkShaking={isLinkShaking}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      style={{
        left: `${node.position?.x ?? 0}px`,
        top: `${node.position?.y ?? 0}px`,
        width: `${nodeWidth}px`,
        zIndex: isTheater ? 50 : undefined,
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
      }}
      className={`border border-grey-medium/80 ${isTheater ? 'shadow-[0_20px_50px_rgba(0,0,0,0.25)] ring-1 ring-amber-500/30' : ''}`}
    >
      {/* 🎬 1. TOP VIDEO VIEWPORT (Strictly on Top) */}
      <div
        className="-mx-4 -mt-4 mb-3.5 relative bg-[#0C0D10] border-b border-[#22242B] overflow-hidden select-none group/player"
        onMouseMove={handleUserActivity}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <div className="w-full aspect-video min-h-[190px] relative bg-black overflow-hidden">
          {/* A. Cover Thumbnail Mode (Default or when paused/idle 30s) */}
          {showPreviewCover ? (
            <button
              type="button"
              data-interactive="true"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleStartPlay}
              className="absolute inset-0 w-full h-full cursor-pointer relative group/cover p-0 border-0 bg-transparent block text-left focus:outline-none"
              title={currentTime > 0 ? `Resume from ${formatTime(currentTime)}` : 'Click to play video'}
            >
              <img
                src={effectiveThumbnail}
                alt={videoData.title || data.title}
                className="w-full h-full object-cover group-hover/cover:scale-102 transition-transform duration-500 pointer-events-none"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover/cover:from-black/70 transition-colors pointer-events-none" />

              {/* Center Play Beacon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-13 h-13 rounded-full bg-white/90 group-hover/cover:bg-white text-black flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.4)] transition-all group-hover/cover:scale-110 active:scale-95">
                  <Play className="w-6 h-6 fill-current ml-0.5 text-black" />
                </div>
              </div>

              {/* Top Source Badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                <span className="font-mono text-[8px] font-bold uppercase bg-black/80 text-white px-2 py-0.5 rounded backdrop-blur-md border border-white/10 tracking-wider flex items-center gap-1">
                  <Tv className="w-3 h-3 text-red-500" />
                  {platform.toUpperCase()} VIDEO
                </span>
                {videoData.duration && (
                  <span className="font-mono text-[8px] bg-black/70 text-[#C4C0BA] px-1.5 py-0.5 rounded backdrop-blur-md">
                    {videoData.duration}
                  </span>
                )}
              </div>

              {/* Bottom Resume Timestamp Indicator */}
              {currentTime > 0 && (
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-amber-500/90 text-black px-2 py-0.5 rounded text-[9px] font-mono font-bold shadow-xs pointer-events-none">
                  <RotateCcw className="w-3 h-3" />
                  Resume from {formatTime(currentTime)}
                </div>
              )}
            </button>
          ) : (
            /* B. Active Fast In-Built Video Wrapper */
            <div
              data-interactive="true"
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              {effectiveVideoId ? (
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${effectiveVideoId}?autoplay=1&enablejsapi=1&rel=0&playsinline=1`}
                  title={data.title || 'Video'}
                  className="w-full h-full border-0 pointer-events-auto block"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : videoData.url && videoData.url.endsWith('.mp4') ? (
                <video
                  ref={videoElementRef}
                  src={videoData.url}
                  autoPlay
                  controls
                  className="w-full h-full object-contain"
                  onTimeUpdate={(e) => {
                    setCurrentTime(e.target.currentTime);
                    if (e.target.duration) setDuration(e.target.duration);
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-black">
                  <span className="text-white text-xs mb-2">{videoData.title || data.title || 'Video Stream'}</span>
                </div>
              )}
            </div>
          )}

          {/* 📺 Top-Right Theater Mode Toggle (Available in both cover and playing mode) */}
          <div className="absolute top-2.5 right-2.5 z-20 pointer-events-auto">
            <button
              type="button"
              data-interactive="true"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleToggleTheater}
              className={`px-2 py-1 rounded font-mono text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md shadow-md ${
                isTheater
                  ? 'bg-amber-500 text-black shadow-amber-500/30'
                  : 'bg-black/80 hover:bg-black text-white/90 border border-white/15 hover:text-white'
              }`}
              title="Toggle Theater Mode (Expands card to 780px)"
              aria-label="Theater mode"
            >
              <span>{isTheater ? 'COMPACT' : 'THEATER'}</span>
              <Maximize2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 📋 2. HEADER & METADATA */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-text-muted truncate">
            {data.category || 'Audiovisual Masterclass'}
          </span>
        </div>
        <span className="font-mono text-[8px] bg-grey-soft text-text-secondary px-1.5 py-0.5 rounded border border-grey-medium/70 shrink-0">
          {data.status || 'video dossier'}
        </span>
      </div>

      {/* 🏷️ 3. TITLE */}
      <h3 className="font-display text-[13.5px] font-semibold text-text-primary mb-1.5 leading-snug line-clamp-2">
        {data.title || 'Practical Video Demonstration'}
      </h3>

      {/* 📝 4. SYNTHESIS DOSSIER */}
      <p className={`text-[10px] text-text-secondary leading-[1.5] mb-3 ${descClampClass}`}>
        {data.detailedSynthesis || data.description || 'Step-by-step practical procedural demonstration and audiovisual analysis.'}
      </p>

      {/* 🎯 5. TARGETED INQUIRIES */}
      {Array.isArray(data.targetedInquiries) && data.targetedInquiries.length > 0 && (
        <div className="pt-2 border-t border-grey-medium/60 flex flex-col gap-1 mb-2.5">
          <span className="font-mono text-[7.5px] uppercase tracking-wider text-text-muted">Targeted Inquiries</span>
          <div className="flex flex-wrap gap-1">
            {data.targetedInquiries.slice(0, 3).map((inq, idx) => (
              <button
                key={idx}
                type="button"
                data-interactive="true"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onSpecificProbe?.(inq, node.id);
                }}
                className="text-left font-mono text-[8.5px] bg-grey-soft/70 hover:bg-amber-500/10 hover:text-amber-900 border border-grey-medium/70 rounded px-1.5 py-0.5 transition-colors truncate max-w-full cursor-pointer"
              >
                ↳ {inq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🔗 6. FOOTER */}
      <div className="pt-2 border-t border-grey-medium/60 flex items-center justify-between text-text-muted font-mono text-[8px]">
        <span className="truncate max-w-[180px]">{data.source || 'PSYCHIS Video Stream'}</span>
        <button
          type="button"
          data-interactive="true"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onInspect?.(node.id);
          }}
          className="hover:text-text-primary underline cursor-pointer transition-colors"
        >
          Inspect Dossier →
        </button>
      </div>
    </SmartGlassPanel>
  );
};
