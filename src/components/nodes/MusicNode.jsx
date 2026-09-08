import React, { useState, useMemo, useEffect } from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { useGlobalAudio } from '../../hooks/useGlobalAudio';
import { searchMusicTracks } from '../../utils/visualSearchEngine';
import {
  Play,
  Pause,
  Disc,
  Music,
  Radio,
  Sliders,
  Volume2,
} from 'lucide-react';

export const MusicNode = ({
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
  const musicData = data.musicData || {};
  const trackTitle = musicData.trackTitle || data.title || 'Acoustic Composition';
  const artist = musicData.artist || 'Featured Artist';
  const album = musicData.album || 'Single / Canonical Release';
  const year = musicData.year || '2024';
  const genre = musicData.genre || 'Electronic / Sound Design';
  const artwork = musicData.artwork || data.primaryPhoto?.url || data.photos?.[0]?.url || null;
  const previewUrl = musicData.previewUrl || '';

  // Auto-resolve audio preview and artwork if missing
  const [resolvedPreview, setResolvedPreview] = useState(previewUrl);
  const [resolvedArtwork, setResolvedArtwork] = useState(artwork);

  useEffect(() => {
    if (!resolvedPreview && (trackTitle || artist || data.title)) {
      const q = `${artist || ''} ${trackTitle || data.title || ''}`.trim();
      if (q && q !== 'Featured Artist Acoustic Composition') {
        searchMusicTracks(q).then((tracks) => {
          if (Array.isArray(tracks) && tracks.length > 0) {
            const first = tracks[0];
            if (first.previewUrl) {
              setResolvedPreview(first.previewUrl);
              musicData.previewUrl = first.previewUrl;
            }
            if (first.artwork && !resolvedArtwork) {
              setResolvedArtwork(first.artwork);
              musicData.artwork = first.artwork;
            }
          }
        }).catch(() => {});
      }
    }
  }, [resolvedPreview, trackTitle, artist, data.title, resolvedArtwork]);

  const effectivePreview = resolvedPreview || previewUrl;
  const effectiveArtwork = resolvedArtwork || artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop';

  // Connect to Global Audio Singleton
  const {
    currentTrack,
    isPlaying: globalIsPlaying,
    currentTime,
    duration: globalDuration,
    playTrack,
    togglePlayPause,
    seek,
  } = useGlobalAudio();

  // Is THIS specific node's track currently active in global audio?
  const isThisTrackActive =
    Boolean(currentTrack) &&
    ((effectivePreview && currentTrack.previewUrl === effectivePreview) ||
      (currentTrack.trackTitle === trackTitle && currentTrack.artist === artist));

  const isPlaying = isThisTrackActive && globalIsPlaying;
  const activeTime = isThisTrackActive ? currentTime : 0;
  const activeDuration = isThisTrackActive ? (globalDuration || 30) : (musicData.duration || 30);
  const progressRatio = activeDuration > 0 ? Math.min(1, activeTime / activeDuration) : 0;

  // Hover state on waveform for timestamp tooltip
  const [hoverScrub, setHoverScrub] = useState(null); // { ratio, timeStr, x }

  // Generate deterministic amplitude bars from track seed
  const waveformBars = useMemo(() => {
    const seed = `${trackTitle}-${artist}-${album}`;
    const bars = [];
    const barCount = 42;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < barCount; i++) {
      const pseudo = Math.abs(Math.sin((i + 1) * 12.9898 + hash) * 43758.5453) % 1;
      const envelope = Math.sin((i / (barCount - 1)) * Math.PI); // natural bell curve
      const heightPercent = Math.max(18, Math.min(100, Math.round((0.25 + 0.75 * pseudo * envelope) * 100)));
      bars.push(heightPercent);
    }
    return bars;
  }, [trackTitle, artist, album]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayToggle = (e) => {
    e.stopPropagation();
    if (!isThisTrackActive) {
      playTrack({
        id: node.id,
        trackTitle,
        artist,
        album,
        year,
        genre,
        previewUrl: effectivePreview,
        fullTrackUrl: musicData.fullTrackUrl || data.url,
        duration: musicData.duration || 30,
        artwork: effectiveArtwork,
        source: musicData.source || 'Public Audio Engine',
      });
    } else {
      togglePlayPause();
    }
  };

  // Waveform Click / Scrub
  const handleWaveformClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = ratio * activeDuration;

    if (!isThisTrackActive) {
      playTrack({
        id: node.id,
        trackTitle,
        artist,
        album,
        year,
        genre,
        previewUrl: effectivePreview,
        fullTrackUrl: musicData.fullTrackUrl || data.url,
        duration: activeDuration,
        artwork: effectiveArtwork,
      });
      setTimeout(() => seek(targetSeconds), 80);
    } else {
      seek(targetSeconds);
    }
  };

  // Waveform Hover Tooltip
  const handleWaveformMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const time = ratio * activeDuration;
    setHoverScrub({ ratio, timeStr: formatTime(time), x });
  };

  const density = data.layout?.density || 'comfortable';
  const descClampClass =
    density === 'expanded' ? 'line-clamp-5' : density === 'compact' ? 'line-clamp-2' : 'line-clamp-3';

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
        width: `${data.layout?.width || 380}px`,
      }}
      className="border border-grey-medium/80 shadow-md"
    >
      {/* 🎵 1. TOP ACOUSTIC HERO DECK (Compact ~135px, Not Stretched Skyscraper) */}
      <div className="-mx-4 -mt-4 mb-3 p-3.5 bg-gradient-to-b from-[#181920] via-[#121318] to-[#0A0B0E] border-b border-white/10 text-white select-none relative overflow-hidden rounded-t-[14px]">
        {/* Ambient Artwork Glow */}
        {effectiveArtwork && (
          <div
            className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ backgroundImage: `url(${effectiveArtwork})`, backgroundSize: 'cover' }}
          />
        )}

        {/* Row 1: Album Cover + Track Metadata */}
        <div className="flex items-center gap-3 relative z-10">
          {/* Square Album Artwork with Clickable Play/Pause Overlay */}
          <button
            type="button"
            data-interactive="true"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handlePlayToggle}
            className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md bg-black/60 group/art cursor-pointer p-0 block focus:outline-none"
            title={isPlaying ? 'Pause' : 'Play 30s High-Res Preview'}
          >
            {effectiveArtwork ? (
              <img
                src={effectiveArtwork}
                alt={trackTitle}
                className="w-full h-full object-cover group-hover/art:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1A1C23]">
                <Disc className="w-7 h-7 text-amber-400/80" />
              </div>
            )}
            {/* Center Play/Pause Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover/art:bg-black/20 transition-colors flex items-center justify-center">
              <div
                className={`w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transition-transform group-hover/art:scale-110 active:scale-95 ${
                  isPlaying ? 'ring-2 ring-amber-300/80 animate-pulse' : ''
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </div>
            </div>
          </button>

          {/* Track Details */}
          <div className="flex flex-col min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="font-mono text-[8px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                {genre}
              </span>
              {year && (
                <span className="font-mono text-[8px] text-white/50">
                  {year}
                </span>
              )}
              <span className="font-mono text-[7.5px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1 py-0.5 rounded">
                320K
              </span>
            </div>
            <h4 className="font-display text-[13.5px] font-bold text-white truncate" title={trackTitle}>
              {trackTitle}
            </h4>
            <span className="text-[11px] text-amber-400/90 font-medium truncate mt-0.5" title={artist}>
              {artist}
            </span>
            {album && (
              <span className="text-[9px] text-white/45 truncate mt-0.5 font-mono" title={album}>
                {album}
              </span>
            )}
          </div>
        </div>

        {/* 🎚️ Row 2: SoundCloud-Style Waveform with Real-Time Playhead */}
        <div className="mt-3 pt-2 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between text-[8.5px] font-mono text-white/70 mb-1 select-none">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-amber-400 animate-ping' : 'bg-white/40'}`} />
              <Radio className={`w-3 h-3 ${isPlaying ? 'text-amber-400' : 'text-white/40'}`} />
              AUDIO PREVIEW (30S)
            </span>
            <span className="font-bold text-white/80">
              {formatTime(activeTime)} / {formatTime(activeDuration)}
            </span>
          </div>

          {/* Interactive Waveform Container */}
          <div
            data-interactive="true"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleWaveformClick}
            onMouseMove={handleWaveformMouseMove}
            onMouseLeave={() => setHoverScrub(null)}
            className="w-full h-8 flex items-end justify-between gap-[2px] cursor-pointer py-1 relative group/wave select-none"
            title="Click or scrub to seek anywhere in preview"
          >
            {waveformBars.map((heightPct, idx) => {
              const barRatio = idx / (waveformBars.length - 1);
              const isFilled = isThisTrackActive && barRatio <= progressRatio;
              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-all duration-75 relative ${
                    isPlaying && isFilled ? 'opacity-100' : 'opacity-85'
                  }`}
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: isFilled ? '#F59E0B' : 'rgba(255, 255, 255, 0.22)',
                    boxShadow: isFilled ? '0 0 6px rgba(245, 158, 11, 0.35)' : 'none',
                  }}
                />
              );
            })}

            {/* Hover Tooltip Timestamp */}
            {hoverScrub && (
              <div
                className="absolute -top-6 px-1.5 py-0.5 bg-black/95 text-amber-300 font-mono text-[8.5px] font-bold rounded shadow-lg pointer-events-none -translate-x-1/2 border border-white/15"
                style={{ left: `${hoverScrub.x}px` }}
              >
                {hoverScrub.timeStr}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📋 2. HEADER & METADATA */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-text-muted truncate">
            {data.category || 'Acoustic Theory & Sound Design'}
          </span>
        </div>
        <span className="font-mono text-[8px] bg-grey-soft text-text-secondary px-1.5 py-0.5 rounded border border-grey-medium/70 shrink-0">
          {data.status || 'acoustic artifact'}
        </span>
      </div>

      {/* 🏷️ 3. TITLE */}
      <h3 className="font-display text-[13px] font-semibold text-text-primary mb-1.5 leading-snug line-clamp-2">
        {data.title || `${trackTitle} // ${artist}`}
      </h3>

      {/* 📝 4. SYNTHESIS DOSSIER */}
      <p className={`text-[10px] text-text-secondary leading-[1.5] mb-3 ${descClampClass}`}>
        {data.detailedSynthesis || data.description || `Harmonic analysis, rhythmic syncopation, and stylistic genesis of ${trackTitle}.`}
      </p>

      {/* 🎯 5. TARGETED INQUIRIES */}
      {Array.isArray(data.targetedInquiries) && data.targetedInquiries.length > 0 && (
        <div className="pt-2 border-t border-grey-medium/60 flex flex-col gap-1 mb-2.5">
          <span className="font-mono text-[7.5px] uppercase tracking-wider text-text-muted">Musicological Inquiries</span>
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
        <span className="truncate max-w-[180px]">{data.source || 'PSYCHIS Acoustic Mesh'}</span>
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
          Inspect Audio Dossier →
        </button>
      </div>
    </SmartGlassPanel>
  );
};
