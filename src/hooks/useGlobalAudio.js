import { useState, useEffect } from 'react';
import { resolveFullTrackAudio } from '../utils/visualSearchEngine.js';

// Singleton Audio State
let audioState = {
  currentTrack: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 180,
  volume: 0.85,
  previousVolume: 0.85,
  isMuted: false,
};

let globalAudio = null;
const listeners = new Set();

function getOrCreateAudio() {
  if (typeof window === 'undefined') return null;
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = 'auto';
    globalAudio.volume = audioState.volume;
    globalAudio.muted = audioState.isMuted;

    globalAudio.addEventListener('timeupdate', () => {
      if (globalAudio) {
        audioState.currentTime = globalAudio.currentTime;
        notify();
      }
    });

    globalAudio.addEventListener('loadedmetadata', () => {
      if (globalAudio && globalAudio.duration && !isNaN(globalAudio.duration) && isFinite(globalAudio.duration)) {
        const d = Math.round(globalAudio.duration);
        if (d > 30 || !audioState.duration || audioState.duration <= 30) {
          audioState.duration = d;
          if (audioState.currentTrack) {
            audioState.currentTrack.duration = d;
          }
        }
        notify();
      }
    });

    globalAudio.addEventListener('play', () => {
      audioState.isPlaying = true;
      notify();
    });

    globalAudio.addEventListener('pause', () => {
      audioState.isPlaying = false;
      notify();
    });

    globalAudio.addEventListener('ended', () => {
      audioState.isPlaying = false;
      actions.nextTrack();
      notify();
    });

    globalAudio.addEventListener('error', (e) => {
      console.warn('[GlobalAudio] stream error, attempting fallback');
      if (audioState.currentTrack) {
        const track = audioState.currentTrack;
        if (track.previewUrl && globalAudio.src !== track.previewUrl) {
          globalAudio.src = track.previewUrl;
          if (audioState.isPlaying) {
            globalAudio.play().catch(() => {});
          }
        }
      }
    });
  }
  return globalAudio;
}

function notify() {
  const snapshot = { ...audioState };
  listeners.forEach((listener) => listener(snapshot));
}

export const actions = {
  playTrack: (track, newQueue = null) => {
    if (!track) return;
    const audio = getOrCreateAudio();

    const trackObj = {
      id: track.id || `track-${Date.now()}`,
      trackTitle: track.trackTitle || track.title || 'Unknown Track',
      artist: track.artist || 'Unknown Artist',
      album: track.album || '',
      year: track.year || '',
      genre: track.genre || 'Music',
      duration: track.duration && track.duration > 30 ? track.duration : 180,
      artwork: track.artwork || '',
      source: track.source || 'Spotify Track',
      previewUrl: track.previewUrl || '',
      fullAudioUrl: track.fullAudioUrl || null,
    };

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      audioState.queue = newQueue;
      const idx = newQueue.findIndex((t) => (t.id && t.id === trackObj.id) || (t.trackTitle === trackObj.trackTitle && t.artist === trackObj.artist));
      audioState.currentIndex = idx !== -1 ? idx : 0;
    } else if (!audioState.queue.some((t) => t.id === trackObj.id || (t.trackTitle === trackObj.trackTitle && t.artist === trackObj.artist))) {
      audioState.queue = [trackObj, ...audioState.queue];
      audioState.currentIndex = 0;
    }

    audioState.currentTrack = trackObj;
    audioState.currentTime = 0;
    audioState.duration = trackObj.duration;
    audioState.isPlaying = true;
    notify();

    const playStream = (url) => {
      if (!audio || !url) return;
      if (audio.src !== url) {
        audio.src = url;
      }
      audio.currentTime = 0;
      audio.volume = audioState.isMuted ? 0 : audioState.volume;
      audio.muted = audioState.isMuted;
      audio.play().catch((err) => {
        console.warn('[GlobalAudio play error]:', err.message);
      });
    };

    if (trackObj.fullAudioUrl) {
      playStream(trackObj.fullAudioUrl);
    } else if (trackObj.previewUrl) {
      playStream(trackObj.previewUrl);

      resolveFullTrackAudio(trackObj, trackObj.duration).then((res) => {
        if (res && res.url && res.url !== trackObj.previewUrl && audioState.currentTrack?.id === trackObj.id) {
          trackObj.fullAudioUrl = res.url;
          if (res.duration && res.duration > 30) {
            trackObj.duration = res.duration;
            audioState.duration = res.duration;
          }
          if (audio && audioState.isPlaying) {
            const currentPos = audio.currentTime;
            audio.src = res.url;
            if (currentPos > 0) {
              audio.currentTime = currentPos;
            }
            audio.play().catch(() => {});
          }
          notify();
        }
      }).catch(() => {});
    } else {
      // Neither fullAudioUrl nor previewUrl was immediately provided
      // Prime audio instance synchronously to register user gesture activation
      try {
        audio.pause();
      } catch (_) {}

      resolveFullTrackAudio(trackObj, trackObj.duration).then((res) => {
        if (res && res.url && audioState.currentTrack?.id === trackObj.id) {
          trackObj.fullAudioUrl = res.url;
          trackObj.previewUrl = trackObj.previewUrl || res.url;
          if (res.duration && res.duration > 30) {
            trackObj.duration = res.duration;
            audioState.duration = res.duration;
          }
          if (audio && audioState.isPlaying) {
            playStream(res.url);
          }
          notify();
        }
      }).catch(() => {});
    }
  },

  togglePlayPause: () => {
    const audio = getOrCreateAudio();
    if (!audioState.currentTrack || !audio) return;

    if (audioState.isPlaying) {
      audio.pause();
      audioState.isPlaying = false;
    } else {
      if (!audio.src || audio.src === '' || audio.src === window.location.href) {
        actions.playTrack(audioState.currentTrack);
        return;
      }
      audio.play().catch((err) => {
        console.warn('[GlobalAudio resume error]:', err.message);
        actions.playTrack(audioState.currentTrack);
      });
      audioState.isPlaying = true;
    }
    notify();
  },

  seek: (seconds) => {
    const audio = getOrCreateAudio();
    const safeTime = Math.max(0, Math.min(audioState.duration, seconds));
    audioState.currentTime = safeTime;
    if (audio) {
      try {
        audio.currentTime = safeTime;
      } catch (_) {}
    }
    notify();
  },

  nextTrack: () => {
    if (audioState.queue.length === 0) return;
    const nextIdx = (audioState.currentIndex + 1) % audioState.queue.length;
    audioState.currentIndex = nextIdx;
    actions.playTrack(audioState.queue[nextIdx]);
  },

  prevTrack: () => {
    if (audioState.currentTime > 3) {
      actions.seek(0);
      return;
    }
    if (audioState.queue.length === 0) return;
    const prevIdx = (audioState.currentIndex - 1 + audioState.queue.length) % audioState.queue.length;
    audioState.currentIndex = prevIdx;
    actions.playTrack(audioState.queue[prevIdx]);
  },

  dismiss: () => {
    const audio = getOrCreateAudio();
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    audioState.isPlaying = false;
    audioState.currentTrack = null;
    audioState.currentTime = 0;
    notify();
  },

  setVolume: (val) => {
    const clamped = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
    if (clamped > 0) {
      audioState.previousVolume = clamped;
    }
    audioState.volume = clamped;
    audioState.isMuted = clamped === 0;

    const audio = getOrCreateAudio();
    if (audio) {
      audio.volume = clamped;
      audio.muted = audioState.isMuted;
    }

    notify();
  },

  adjustVolumeDelta: (delta) => {
    const current = audioState.isMuted ? 0 : audioState.volume;
    const next = Math.max(0, Math.min(1, Math.round((current + delta) * 100) / 100));
    actions.setVolume(next);
  },

  toggleMute: () => {
    if (audioState.isMuted) {
      const restore = audioState.previousVolume > 0 ? audioState.previousVolume : 0.85;
      actions.setVolume(restore);
    } else {
      audioState.previousVolume = audioState.volume;
      actions.setVolume(0);
    }
  },
};

export function useGlobalAudio() {
  const [state, setState] = useState(() => ({ ...audioState }));

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    ...actions,
  };
}
