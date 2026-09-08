import React, { useState, useMemo, useEffect } from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { useGlobalAudio } from '../../hooks/useGlobalAudio';
import { searchMusicTracks } from '../../utils/visualSearchEngine';
import {
  Play,
  Pause,
  Disc,
  Music,
  ExternalLink,
  Radio,
  Sliders,
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
  onOpenBrowser,
}) => {
  const data = node.data || {};
  const musicData = data.musicData || {};
  const trackTitle = musicData.trackTitle || data.title || 'Acoustic Composition';
  const artist = musicData.artist || 'Featured Artist';
  const album = musicData.album || 'Single / Canonical Release';
  const year = musicData.year || '2024';
  const genre = musicData.genre || 'Electronic / Experimental';
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

  // Connect to Global Audio
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

  // Generate deterministic SoundCloud-style waveform amplitude bars from seed
  const waveformBars = useMemo(() => {
    const seed = `${trackTitle}-${artist}-${album}`;
    const bars = [];
    const barCount = 44;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < barCount; i++) {
      // Deterministic pseudo-random height with natural musical bell-curve envelope
      const pseudo = Math.abs(Math.sin((i + 1) * 12.9898 + hash) * 43758.5453) % 1;
      const envelope = Math.sin((i / (barCount - 1)) * Math.PI); // higher in middle
      const heightPercent = Math.max(18, Math.min(100, Math.round((0.3 + 0.7 * pseudo * envelope) * 100)));
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

  // Waveform Click Scrub
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
    density === 'expanded' ? 'line-clamp-6' : density === 'compact' ? 'line-clamp-2' : 'line-clamp-4';

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
        width: `${data.layout?.width || 390}px`,
      }}
      className="border border-grey-medium/80"
    >
      {/* 🎵 1. TOP ACOUSTIC HERO CARD */}
      <div className="-mx-4 -mt-4 mb-3 p-3 bg-gradient-to-br from-[#18191E] via-[#121318] to-[#0D0E12] border-b border-white/10 text-white select-none relative overflow-hidden">
        {/* Background Ambient Blur Glow */}
        {effectiveArtwork && (
          <div
            className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-25 blur-2xl pointer-events-none"
            style={{ backgroundImage: `url(${effectiveArtwork})`, backgroundSize: 'cover' }}
          />
        )}

        <div className="flex items-center gap-3 relative z-10">
          {/* Album Artwork with Play Action */}
          <div
            className="relative w-15 h-15 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-md bg-black/40 group/art cursor-pointer"
            onClick={handlePlayToggle}
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
            {/* Center Play Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover/art:bg-black/20 transition-colors flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md transition-transform group-hover/art:scale-110 active:scale-95">
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </div>
            </div>
          </div>

          {/* Track Details */}
          <div className="flex flex-col min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-mono text-[7.5px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                {genre}
              </span>
              {year && (
                <span className="font-mono text-[8px] text-white/50">
                  {year}
                </span>
              )}
            </div>
            <h4 className="font-display text-[13px] font-bold text-white truncate" title={trackTitle}>
              {trackTitle}
            </h4>
            <span className="text-[10.5px] text-white/70 truncate mt-0.5" title={artist}>
              {artist}
            </span>
            {album && (
              <span className="text-[9px] text-white/45 truncate mt-0.5 font-mono" title={album}>
                {album}
              </span>
            )}
          </div>
        </div>

        {/* 🎚️ 2. SOUNDCLOUD-STYLE WAVEFORM ("Music Line with Volume Lines") */}
        <div className="mt-3 pt-2 border-t border-white/10 relative">
          <div className="flex items-center justify-between text-[9px] font-mono text-white/60 mb-1.5 select-none">
            <span className="flex items-center gap-1">
              <Radio className={`w-3 h-3 ${isPlaying ? 'text-amber-400 animate-pulse' : 'text-white/40'}`} />
              30S PREVIEW STREAM
            </span>
            <span>
              {formatTime(activeTime)} / {formatTime(activeDuration)}
            </span>
          </div>

          {/* Interactive Waveform Container */}
          <div
            className="w-full h-9 flex items-end justify-between gap-[2px] cursor-pointer py-1 relative group/wave"
            onClick={handleWaveformClick}
            onMouseMove={handleWaveformMouseMove}
            onMouseLeave={() => setHoverScrub(null)}
            title="Click or scrub to jump anywhere in preview"
          >
            {waveformBars.map((heightPct, idx) => {
              const barRatio = idx / (waveformBars.length - 1);
              const isFilled = isThisTrackActive && barRatio <= progressRatio;
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-full transition-colors duration-75 relative"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: isFilled ? '#F59E0B' : 'rgba(255, 255, 255, 0.22)',
                  }}
                />
              );
            })}

            {/* Hover Tooltip Timestamp */}
            {hoverScrub && (
              <div
                className="absolute -top-6 px-1.5 py-0.5 bg-black/90 text-amber-300 font-mono text-[8px] font-bold rounded shadow-md pointer-events-none -translate-x-1/2 border border-white/10"
                style={{ left: `${hoverScrub.x}px` }}
              >
                {hoverScrub.timeStr}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📋 3. HEADER & METADATA */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-text-muted truncate">
            {data.category || 'Acoustic Theory & Composition'}
          </span>
        </div>
        <span className="font-mono text-[8px] bg-grey-soft text-text-secondary px-1.5 py-0.5 rounded border border-grey-medium/70 shrink-0">
          {data.status || 'acoustic artifact'}
        </span>
      </div>

      {/* 🏷️ 4. TITLE */}
      <h3 className="font-display text-[13.5px] font-semibold text-text-primary mb-1.5 leading-snug line-clamp-2">
        {data.title || `${trackTitle} // ${artist}`}
      </h3>

      {/* 📝 5. SYNTHESIS DOSSIER */}
      <p className={`text-[10px] text-text-secondary leading-[1.5] mb-3 ${descClampClass}`}>
        {data.detailedSynthesis || data.description || `Harmonic analysis, rhythmic syncopation, and stylistic genesis of ${trackTitle}.`}
      </p>

      {/* 🎯 6. TARGETED INQUIRIES */}
      {Array.isArray(data.targetedInquiries) && data.targetedInquiries.length > 0 && (
        <div className="pt-2 border-t border-grey-medium/60 flex flex-col gap-1 mb-2.5">
          <span className="font-mono text-[7.5px] uppercase tracking-wider text-text-muted">Musicological Inquiries</span>
          <div className="flex flex-wrap gap-1">
            {data.targetedInquiries.slice(0, 3).map((inq, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onSpecificProbe?.(inq, node.id);
                }}
                className="text-left font-mono text-[8.5px] bg-grey-soft/70 hover:bg-amber-500/10 hover:text-amber-900 border border-grey-medium/70 rounded px-1.5 py-0.5 transition-colors truncate max-w-full"
              >
                ↳ {inq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🔗 7. FOOTER */}
      <div className="pt-2 border-t border-grey-medium/60 flex items-center justify-between text-text-muted font-mono text-[8px]">
        <span className="truncate max-w-[180px]">{data.source || 'PSYCHIS Acoustic Mesh'}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect?.(node.id);
          }}
          className="hover:text-text-primary underline cursor-pointer transition-colors"
        >
          Inspect Full Track →
        </button>
      </div>
    </SmartGlassPanel>
  );
};
