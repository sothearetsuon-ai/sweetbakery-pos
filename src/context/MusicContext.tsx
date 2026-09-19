import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { AudioTrack, MusicLoopMode } from '../types';
import { saveTrackToDB, getAllTracksFromDB, deleteTrackFromDB, clearAllTracksFromDB } from '../utils/musicDb';
import { birthdaySynth } from '../utils/birthdaySynthesizer';
import { soundFx } from '../utils/audio';
import {
  uploadAudioToFirebaseStorage,
  deleteAudioFromFirebaseStorage,
  saveFirestoreDoc,
  deleteFirestoreDoc,
  subscribeToFirestoreCollection,
  getStoredFirebaseConfig,
} from '../services/firebase';

// Default Royalty-Free Cafe & Bakery Soundtracks
const defaultTracks: AudioTrack[] = [
  {
    id: 'default-1',
    title: 'Happy Birthday Celebration 🎂',
    artist: 'SweetBakery Orchestra',
    url: 'https://assets.mixkit.co/music/preview/mixkit-happy-birthday-cheer-527.mp3',
    duration: 110,
    isCustom: false,
    category: 'birthday',
  },
  {
    id: 'default-2',
    title: 'Sweet Morning Cafe & Bakery ☕',
    artist: 'Acoustic Ambiance',
    url: 'https://assets.mixkit.co/music/preview/mixkit-coffee-chill-out-1094.mp3',
    duration: 148,
    isCustom: false,
    category: 'cafe',
  },
  {
    id: 'default-3',
    title: 'Relaxing Pastry Shop Melody 🍰',
    artist: 'Chillout Vibes',
    url: 'https://assets.mixkit.co/music/preview/mixkit-sweet-melody-789.mp3',
    duration: 135,
    isCustom: false,
    category: 'cafe',
  },
  {
    id: 'default-4',
    title: 'Acoustic Garden Guitar 🥐',
    artist: 'Acoustic Bakery',
    url: 'https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-522.mp3',
    duration: 160,
    isCustom: false,
    category: 'acoustic',
  },
];

export interface UploadProgress {
  current: number;
  total: number;
  currentFileName: string;
}

interface MusicContextType {
  playlist: AudioTrack[];
  currentTrackIndex: number;
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  loopMode: MusicLoopMode;
  isShuffle: boolean;
  isPlayerOpen: boolean;
  setIsPlayerOpen: (open: boolean) => void;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  setLoopMode: (mode: MusicLoopMode) => void;
  toggleShuffle: () => void;
  playTrackById: (id: string) => void;
  uploadTracks: (files: FileList | File[]) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  clearCustomTracks: () => Promise<void>;
  playBirthdayCelebration: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Helper to determine exact audio duration from File/Blob
const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;
      const cleanup = (dur: number) => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (e) {}
        resolve(dur || 180);
      };
      audio.addEventListener('loadedmetadata', () => {
        cleanup(Math.round(audio.duration || 0));
      });
      audio.addEventListener('error', () => {
        cleanup(180);
      });
      setTimeout(() => cleanup(180), 2000);
    } catch (e) {
      resolve(180);
    }
  });
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<AudioTrack[]>(defaultTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [loopMode, setLoopMode] = useState<MusicLoopMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Live mutable refs to completely prevent stale closures in HTML5 audio event callbacks
  const playlistRef = useRef<AudioTrack[]>(playlist);
  const currentTrackIndexRef = useRef<number>(currentTrackIndex);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const loopModeRef = useRef<MusicLoopMode>(loopMode);
  const isShuffleRef = useRef<boolean>(isShuffle);
  const volumeRef = useRef<number>(volume);
  const isMutedRef = useRef<boolean>(isMuted);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);
  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);
  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Direct playback function that guarantees immediate audio continuation
  const playTrackAtIndex = (index: number) => {
    const list = playlistRef.current;
    if (!list || list.length === 0) return;
    const safeIndex = (index + list.length) % list.length;
    const targetTrack = list[safeIndex];
    if (!targetTrack) return;

    currentTrackIndexRef.current = safeIndex;
    setCurrentTrackIndex(safeIndex);
    setIsPlaying(true);
    isPlayingRef.current = true;

    if (audioRef.current) {
      birthdaySynth.stop();
      const currentAudio = audioRef.current;
      currentAudio.volume = isMutedRef.current ? 0 : volumeRef.current;
      currentAudio.src = targetTrack.url;
      currentAudio.currentTime = 0;
      currentAudio.play().catch((err) => {
        console.warn('Playback error or policy blocked:', err);
        // If file cannot be played or format error, auto skip to next track after a short delay
        setTimeout(() => {
          if (isPlayingRef.current) {
            handleEnded();
          }
        }, 800);
      });
    }
  };

  // Continuous playback engine: automatically advances to the next consecutive track
  const handleEnded = () => {
    const list = playlistRef.current;
    const currentIndex = currentTrackIndexRef.current;
    const mode = loopModeRef.current;
    const shuffle = isShuffleRef.current;

    if (!list || list.length === 0) return;

    // 1. Loop single track
    if (mode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    // 2. Stop at end if loop mode is none
    if (mode === 'none' && currentIndex >= list.length - 1) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    // 3. Shuffle mode: pick a random other song
    if (shuffle && list.length > 1) {
      let nextIdx = Math.floor(Math.random() * list.length);
      if (nextIdx === currentIndex) {
        nextIdx = (currentIndex + 1) % list.length;
      }
      playTrackAtIndex(nextIdx);
      return;
    }

    // 4. Default: Smoothly and consecutive play next song (0 -> 1 -> 2 -> ... -> N-1 -> 0)
    const nextIdx = (currentIndex + 1) % list.length;
    playTrackAtIndex(nextIdx);
  };

  // Initialize HTML5 audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration || 0);
      }
    };

    const handleError = () => {
      console.warn('Audio playback error on current track, auto-skipping to next...');
      if (isPlayingRef.current) {
        setTimeout(() => {
          handleEnded();
        }, 600);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Load custom tracks from Server (/api/songs) and fallback to IndexedDB
  const fetchServerTracks = async () => {
    try {
      const res = await fetch('/api/songs');
      if (res.ok) {
        const serverTracks: AudioTrack[] = await res.json();
        if (Array.isArray(serverTracks) && serverTracks.length > 0) {
          setPlaylist((prev) => {
            const defaults = prev.filter((t) => !t.isCustom);
            const nonServerCustom = prev.filter(
              (t) => t.isCustom && !serverTracks.some((st) => st.id === t.id)
            );
            return [...defaults, ...serverTracks, ...nonServerCustom];
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch songs from server:', e);
    }

    // Fallback: Read from browser IndexedDB
    try {
      const stored = await getAllTracksFromDB();
      if (stored && stored.length > 0) {
        const loadedTracks: AudioTrack[] = stored.map((item) => ({
          id: item.id,
          title: item.title,
          artist: item.artist || 'Uploaded Track',
          url: URL.createObjectURL(item.blob),
          duration: item.duration,
          isCustom: true,
          category: 'custom',
          dateAdded: item.dateAdded,
        }));
        setPlaylist((prev) => {
          const defaults = prev.filter((t) => !t.isCustom);
          return [...defaults, ...loadedTracks];
        });
      }
    } catch (e) {
      console.warn('Error reading audio tracks from IndexedDB:', e);
    }
  };

  useEffect(() => {
    fetchServerTracks();

    // Listen to real-time LAN SSE updates for songs
    let sse: EventSource | null = null;
    try {
      sse = new EventSource('/api/lan-events');
      sse.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'SONGS_UPDATED' || parsed.type === 'SYNC_UPDATE') {
            fetchServerTracks();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (sse) sse.close();
    };
  }, []);

  // Real-time Firestore Cloud Music Sync
  useEffect(() => {
    const config = getStoredFirebaseConfig();
    if (!config) return;

    const unsubscribe = subscribeToFirestoreCollection<AudioTrack>('musicTracks', (cloudTracks) => {
      if (!cloudTracks) return;
      setPlaylist((prev) => {
        const defaults = prev.filter((t) => !t.isCustom);
        const localOnly = prev.filter((t) => t.isCustom && !t.isCloudSynced);
        const formattedCloud: AudioTrack[] = cloudTracks.map((ct) => ({
          ...ct,
          isCustom: true,
          isCloudSynced: true,
        }));

        const seenIds = new Set<string>();
        const merged: AudioTrack[] = [];
        for (const tr of [...defaults, ...formattedCloud, ...localOnly]) {
          if (!seenIds.has(tr.id)) {
            seenIds.add(tr.id);
            merged.push(tr);
          }
        }
        return merged;
      });
    });

    return () => unsubscribe();
  }, []);

  const currentTrack = playlist[currentTrackIndex] || null;

  // Handle external or manual track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;
    const currentSrc = audio.src;
    const isSameSrc = currentSrc === currentTrack.url || currentSrc.endsWith(currentTrack.url);

    if (!isSameSrc) {
      audio.src = currentTrack.url;
      audio.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn('Playback prevented by browser policy:', err);
        });
      }
    } else if (isPlaying && audio.paused) {
      audio.play().catch(() => {});
    }
  }, [currentTrackIndex, playlist]);

  // Handle volume / mute change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const play = () => {
    if (audioRef.current) {
      birthdaySynth.stop();
      if (!audioRef.current.src && currentTrack) {
        audioRef.current.src = currentTrack.url;
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
      }).catch((e) => {
        console.warn('Playback failed:', e);
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
    birthdaySynth.stop();
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const nextTrack = () => {
    const list = playlistRef.current;
    const currentIndex = currentTrackIndexRef.current;
    if (!list || list.length === 0) return;

    if (isShuffleRef.current && list.length > 1) {
      let nextIdx = Math.floor(Math.random() * list.length);
      if (nextIdx === currentIndex) {
        nextIdx = (currentIndex + 1) % list.length;
      }
      playTrackAtIndex(nextIdx);
    } else {
      const nextIdx = (currentIndex + 1) % list.length;
      playTrackAtIndex(nextIdx);
    }
  };

  const prevTrack = () => {
    const list = playlistRef.current;
    const currentIndex = currentTrackIndexRef.current;
    if (!list || list.length === 0) return;

    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }

    const prevIdx = (currentIndex - 1 + list.length) % list.length;
    playTrackAtIndex(prevIdx);
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolume = (level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      isMutedRef.current = false;
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      isMutedRef.current = !prev;
      return !prev;
    });
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => {
      isShuffleRef.current = !prev;
      return !prev;
    });
  };

  const playTrackById = (id: string) => {
    const idx = playlistRef.current.findIndex((t) => t.id === id);
    if (idx !== -1) {
      playTrackAtIndex(idx);
    }
  };

  // Upload custom song files (MP3, WAV, etc.) in batch with real-time progress
  const uploadTracks = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)
    );
    if (validFiles.length === 0) return;

    setIsUploading(true);
    const newTracks: AudioTrack[] = [];
    let serverActive = true;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      setUploadProgress({
        current: i + 1,
        total: validFiles.length,
        currentFileName: cleanTitle,
      });

      const trackDuration = await getAudioDuration(file);
      let trackUrl = URL.createObjectURL(file);
      let trackId = 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

      // 1. Try server disk upload if on local node/LAN server
      if (serverActive) {
        try {
          const base64Str = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const res = await fetch('/api/upload-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: cleanTitle,
              artist: 'បទចម្រៀងផ្ទាល់ខ្លួន 🎵',
              filename: file.name,
              audioBase64: base64Str,
              duration: trackDuration,
            }),
          });
          if (res.ok) {
            const resData = await res.json();
            if (resData.success && resData.track) {
              trackUrl = resData.track.url;
              trackId = resData.track.id;
            }
          } else {
            // Server endpoint returned non-ok (e.g. 404 on Surge static deployment)
            serverActive = false;
          }
        } catch (err) {
          serverActive = false;
        }
      }

      const newTrack: AudioTrack = {
        id: trackId,
        title: cleanTitle,
        artist: 'បទចម្រៀងផ្ទាល់ខ្លួន 🎵',
        url: trackUrl,
        isCustom: true,
        category: 'custom',
        duration: trackDuration,
        dateAdded: new Date().toISOString().slice(0, 10),
      };

      // 2. Always persist into browser IndexedDB so it's permanent across page refreshes
      saveTrackToDB({
        id: trackId,
        title: cleanTitle,
        artist: 'បទចម្រៀងផ្ទាល់ខ្លួន 🎵',
        blob: file,
        duration: trackDuration,
        dateAdded: newTrack.dateAdded!,
      }).catch(() => {});

      // 3. Optional Firebase Cloud upload in background
      uploadAudioToFirebaseStorage(file, file.name)
        .then((cloudRes) => {
          if (cloudRes) {
            saveFirestoreDoc('musicTracks', trackId, {
              ...newTrack,
              url: cloudRes.downloadUrl,
              storagePath: cloudRes.storagePath,
              isCloudSynced: true,
            });
          }
        })
        .catch(() => {});

      newTracks.push(newTrack);
    }

    setIsUploading(false);
    setUploadProgress(null);

    if (newTracks.length > 0) {
      setPlaylist((prev) => {
        const withoutDuplicates = prev.filter((t) => !newTracks.some((nt) => nt.id === t.id));
        const updated = [...withoutDuplicates, ...newTracks];
        playlistRef.current = updated;
        return updated;
      });

      soundFx.playSuccess();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Auto-play the first of the newly uploaded songs
      setTimeout(() => {
        const list = playlistRef.current;
        const targetIndex = list.length - newTracks.length;
        playTrackAtIndex(Math.max(0, targetIndex));
      }, 100);
    }
  };

  const deleteTrack = async (id: string) => {
    const trackToDelete = playlistRef.current.find((t) => t.id === id);

    // Delete from Server
    try {
      fetch('/api/delete-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    } catch (e) {}

    // Delete from local IndexedDB
    await deleteTrackFromDB(id);

    // Delete from Firebase
    if (trackToDelete?.storagePath) {
      deleteAudioFromFirebaseStorage(trackToDelete.storagePath).catch(() => {});
    }
    deleteFirestoreDoc('musicTracks', id).catch(() => {});

    setPlaylist((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      playlistRef.current = updated;
      return updated;
    });

    if (currentTrack?.id === id) {
      nextTrack();
    }
    soundFx.playPop();
  };

  const clearCustomTracks = async () => {
    await clearAllTracksFromDB();

    setPlaylist((prev) => {
      const defaults = prev.filter((t) => !t.isCustom);
      playlistRef.current = defaults;
      return defaults;
    });

    playTrackAtIndex(0);
    soundFx.playPop();
  };

  // Birthday celebration shortcut
  const playBirthdayCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    const birthdayIndex = playlistRef.current.findIndex((t) => t.category === 'birthday');
    if (birthdayIndex !== -1) {
      playTrackAtIndex(birthdayIndex);
    } else {
      birthdaySynth.playMelody();
    }
  };

  return (
    <MusicContext.Provider
      value={{
        playlist,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        loopMode,
        isShuffle,
        isPlayerOpen,
        setIsPlayerOpen,
        isUploading,
        uploadProgress,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        setLoopMode,
        toggleShuffle,
        playTrackById,
        uploadTracks,
        deleteTrack,
        clearCustomTracks,
        playBirthdayCelebration,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
