import { useState, useEffect } from 'react';

// Singleton Audio State
let audioState = {
  currentTrack: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 30,
  volume: 0.85,
  isMuted: false,
};

const listeners = new Set();
let globalAudio = null;

function getAudioElement() {
  if (typeof window === 'undefined') return null;
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.volume = audioState.volume;
    globalAudio.preload = 'auto';

    globalAudio.addEventListener('timeupdate', () => {
      audioState.currentTime = globalAudio.currentTime;
      audioState.duration = globalAudio.duration || audioState.currentTrack?.duration || 30;
      notify();
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
      audioState.currentTime = 0;
      // Auto-advance to next track in queue if available
      if (audioState.queue.length > 0 && audioState.currentIndex < audioState.queue.length - 1) {
        actions.nextTrack();
      } else {
        notify();
      }
    });

    globalAudio.addEventListener('error', (e) => {
      console.warn('[GlobalAudio playback error]:', e);
      audioState.isPlaying = false;
      notify();
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
    const audio = getAudioElement();
    if (!audio) return;

    const trackObj = {
      id: track.id || `track-${Date.now()}`,
      trackTitle: track.trackTitle || track.title || 'Unknown Track',
      artist: track.artist || 'Unknown Artist',
      album: track.album || '',
      year: track.year || '',
      genre: track.genre || 'Music',
      previewUrl: track.previewUrl || track.url || '',
      fullTrackUrl: track.fullTrackUrl || '',
      duration: track.duration || 30,
      artwork: track.artwork || '',
      source: track.source || 'Public Audio Engine',
    };

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      audioState.queue = newQueue;
      const idx = newQueue.findIndex((t) => (t.id && t.id === trackObj.id) || (t.previewUrl && t.previewUrl === trackObj.previewUrl));
      audioState.currentIndex = idx !== -1 ? idx : 0;
    } else if (!audioState.queue.some((t) => t.previewUrl === trackObj.previewUrl)) {
      audioState.queue = [trackObj, ...audioState.queue];
      audioState.currentIndex = 0;
    }

    audioState.currentTrack = trackObj;
    audioState.currentTime = 0;
    audioState.duration = trackObj.duration || 30;

    if (trackObj.previewUrl) {
      if (audio.src !== trackObj.previewUrl) {
        audio.src = trackObj.previewUrl;
        audio.load();
      }
      audio.play().then(() => {
        audioState.isPlaying = true;
        notify();
      }).catch((err) => {
        console.warn('[GlobalAudio play error]:', err.message);
        audioState.isPlaying = false;
        notify();
      });
    } else if (trackObj.trackTitle || trackObj.artist) {
      // Dynamically resolve preview URL on demand if missing
      import('../utils/visualSearchEngine.js').then(({ searchMusicTracks }) => {
        const q = `${trackObj.artist || ''} ${trackObj.trackTitle || ''}`.trim();
        searchMusicTracks(q).then((tracks) => {
          if (Array.isArray(tracks) && tracks.length > 0 && tracks[0].previewUrl) {
            trackObj.previewUrl = tracks[0].previewUrl;
            if (!trackObj.artwork && tracks[0].artwork) trackObj.artwork = tracks[0].artwork;
            audio.src = trackObj.previewUrl;
            audio.load();
            audio.play().then(() => {
              audioState.isPlaying = true;
              notify();
            }).catch(() => {});
          }
        }).catch(() => {});
      });
    }
  },

  togglePlayPause: () => {
    const audio = getAudioElement();
    if (!audio || !audioState.currentTrack) return;

    if (audioState.isPlaying) {
      audio.pause();
      audioState.isPlaying = false;
      notify();
    } else {
      audio.play().then(() => {
        audioState.isPlaying = true;
        notify();
      }).catch((e) => console.warn(e));
    }
  },

  seek: (seconds) => {
    const audio = getAudioElement();
    if (!audio) return;
    const safeTime = Math.max(0, Math.min(audioState.duration, seconds));
    audio.currentTime = safeTime;
    audioState.currentTime = safeTime;
    notify();
  },

  nextTrack: () => {
    if (audioState.queue.length === 0) return;
    const nextIdx = (audioState.currentIndex + 1) % audioState.queue.length;
    audioState.currentIndex = nextIdx;
    actions.playTrack(audioState.queue[nextIdx]);
  },

  prevTrack: () => {
    const audio = getAudioElement();
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      audioState.currentTime = 0;
      notify();
      return;
    }
    if (audioState.queue.length === 0) return;
    const prevIdx = (audioState.currentIndex - 1 + audioState.queue.length) % audioState.queue.length;
    audioState.currentIndex = prevIdx;
    actions.playTrack(audioState.queue[prevIdx]);
  },

  dismiss: () => {
    const audio = getAudioElement();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    audioState.isPlaying = false;
    audioState.currentTrack = null;
    audioState.currentTime = 0;
    notify();
  },

  setVolume: (val) => {
    const audio = getAudioElement();
    const clamped = Math.max(0, Math.min(1, val));
    audioState.volume = clamped;
    audioState.isMuted = clamped === 0;
    if (audio) {
      audio.volume = clamped;
      audio.muted = audioState.isMuted;
    }
    notify();
  },

  toggleMute: () => {
    const audio = getAudioElement();
    audioState.isMuted = !audioState.isMuted;
    if (audio) {
      audio.muted = audioState.isMuted;
    }
    notify();
  },
};

export function useGlobalAudio() {
  const [state, setState] = useState(() => ({ ...audioState }));

  useEffect(() => {
    getAudioElement();
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
