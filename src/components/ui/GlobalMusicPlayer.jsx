import React from 'react';
import { useGlobalAudio } from '../../hooks/useGlobalAudio';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
  VolumeX,
  Disc,
} from 'lucide-react';

export const GlobalMusicPlayer = () => {
  const {
    currentTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    togglePlayPause,
    seek,
    nextTrack,
    prevTrack,
    dismiss,
    toggleMute,
  } = useGlobalAudio();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hasMultiple = Array.isArray(queue) && queue.length > 1;

  return (
    <div
      className="fixed top-3.5 right-4 z-40 flex items-center bg-white-pure/94 backdrop-blur-xl border border-grey-medium/80 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] px-3 py-1.5 gap-2.5 select-none font-sans transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      role="region"
      aria-label="Global audio queue"
    >
      {/* Artwork Thumbnail / Vinyl Disc */}
      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-grey-medium/60 shadow-3xs bg-[#16181D] flex items-center justify-center">
        {currentTrack.artwork ? (
          <img
            src={currentTrack.artwork}
            alt={currentTrack.trackTitle}
            className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'opacity-90'}`}
          />
        ) : (
          <Disc className={`w-4 h-4 text-amber-500 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
        )}
      </div>

      {/* Track & Artist Info */}
      <div className="flex flex-col min-w-0 max-w-[150px] leading-tight">
        <span className="font-display text-[11.5px] font-semibold text-text-primary truncate" title={currentTrack.trackTitle}>
          {currentTrack.trackTitle}
        </span>
        <span className="text-[9.5px] text-text-secondary truncate" title={currentTrack.artist}>
          {currentTrack.artist}
        </span>
      </div>

      {/* Tiny Animated Sound Wave or Time */}
      <div className="flex items-center gap-1.5 px-1">
        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-3.5 w-4" title="Playing preview">
            <span className="w-[2.5px] bg-amber-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
            <span className="w-[2.5px] bg-amber-600 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s] h-2" />
            <span className="w-[2.5px] bg-amber-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.4s] h-3.5" />
          </div>
        ) : (
          <span className="font-mono text-[9px] text-text-muted">
            {formatTime(currentTime)}
          </span>
        )}
      </div>

      {/* Compact Mini Progress Scrubber */}
      <div
        className="w-16 h-1.5 bg-grey-soft rounded-full overflow-hidden cursor-pointer relative group/scrub shrink-0"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          seek(ratio * duration);
        }}
        title={`Seek: ${formatTime(currentTime)} / ${formatTime(duration)}`}
      >
        <div
          className="h-full bg-amber-500 transition-all duration-100 rounded-full group-hover/scrub:bg-amber-600"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Audio Controls */}
      <div className="flex items-center gap-0.5 ml-0.5">
        {hasMultiple && (
          <button
            onClick={prevTrack}
            className="p-1 rounded-md hover:bg-grey-soft text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Previous track"
            aria-label="Previous track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={togglePlayPause}
          className="w-6 h-6 rounded-full bg-text-primary hover:bg-black text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-3xs"
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
        </button>

        {hasMultiple && (
          <button
            onClick={nextTrack}
            className="p-1 rounded-md hover:bg-grey-soft text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Next track"
            aria-label="Next track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={toggleMute}
          className="p-1 rounded-md hover:bg-grey-soft text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Divider */}
        <div className="w-[1px] h-3.5 bg-grey-medium/70 mx-0.5" />

        {/* Dismiss / Close Pill */}
        <button
          onClick={dismiss}
          className="p-1 rounded-md hover:bg-grey-soft text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          title="Dismiss player"
          aria-label="Dismiss player"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
