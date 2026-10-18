import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { AudioTrack, MusicLoopMode } from '../types';
import { saveTrackToDB, getAllTracksFromDB, deleteTrackFromDB, clearAllTracksFromDB } from '../utils/musicDb';
import { birthdaySynth } from '../utils/birthdaySynthesizer';
import { soundFx } from '../utils/audio';
import { bakeryAmbientAudio, BakerySoundtrackId } from '../utils/bakeryAmbientAudio';
import {
  uploadAudioToFirebaseStorage,
  deleteAudioFromFirebaseStorage,
  saveFirestoreDoc,
  deleteFirestoreDoc,
  subscribeToFirestoreCollection,
  getStoredFirebaseConfig,
} from '../services/firebase';
import {
  extractYouTubeVideoId,
  fetchYouTubeVideoInfo,
  downloadWebAudioBlob,
} from '../services/youtubeMusicService';

// Default 100% Offline Cafe & Bakery Soundtracks (Bundled locally with zero network dependency)
const defaultTracks: AudioTrack[] = [
  {
    id: 'default-1',
    title: 'Happy Birthday Celebration 🎂',
    artist: 'SweetBakery Orchestra (Offline)',
    url: '/audio/birthday.wav',
    duration: 70,
    isCustom: false,
    category: 'birthday',
  },
  {
    id: 'default-2',
    title: 'Sweet Morning Cafe & Bakery ☕',
    artist: 'Acoustic Ambiance (Offline)',
    url: '/audio/cafe.wav',
    duration: 64,
    isCustom: false,
    category: 'cafe',
  },
  {
    id: 'default-3',
    title: 'Relaxing Pastry Shop Melody 🍰',
    artist: 'Chillout Vibes (Offline)',
    url: '/audio/pastry.wav',
    duration: 54,
    isCustom: false,
    category: 'cafe',
  },
  {
    id: 'default-4',
    title: 'Acoustic Garden Guitar 🥐',
    artist: 'Acoustic Bakery (Offline)',
    url: '/audio/acoustic.wav',
    duration: 70,
    isCustom: false,
    category: 'acoustic',
  },
];

export interface UploadProgress {
  current: number;
  total: number;
  currentFileName: string;
}

export type VibeMood = 'all' | 'cafe' | 'birthday' | 'acoustic' | 'custom' | 'youtube' | 'mp4' | 'favorites';

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

  // Modern App Features & Video Mode
  isVideoMode: boolean;
  setIsVideoMode: (videoMode: boolean) => void;
  toggleVideoMode: () => void;
  isFloatingMiniVideo: boolean;
  setIsFloatingMiniVideo: (floating: boolean) => void;
  toggleFloatingMiniVideo: () => void;
  isCurrentVideo: boolean;
  ytErrorTrackIndex: number | null;
  clearYtError: () => void;

  vibeMood: VibeMood;
  setVibeMood: (mood: VibeMood) => void;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  setSleepTimer: (minutes: number | null) => void;
  favoriteTrackIds: string[];
  toggleFavorite: (trackId: string) => void;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  skipBy: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  setLoopMode: (mode: MusicLoopMode) => void;
  toggleShuffle: () => void;
  playTrackById: (id: string) => void;
  uploadTracks: (files: FileList | File[]) => Promise<void>;
  addTrackByUrl: (url: string, title?: string, artist?: string) => Promise<{ success: boolean; error?: string }>;
  addYouTubeTrack: (
    urlOrId: string,
    customTitle?: string,
    customAuthor?: string,
    customDuration?: number,
    autoPlay?: boolean
  ) => Promise<{ success: boolean; track?: AudioTrack; error?: string }>;
  addMultipleYouTubeTracks: (
    tracks: Array<{ id: string; title: string; author?: string; duration?: number | string; durationSec?: number }>
  ) => Promise<{ success: boolean; addedCount: number }>;
  downloadWebAudioTrack: (url: string, title?: string, artist?: string) => Promise<{ success: boolean; track?: AudioTrack; error?: string }>;
  deleteTrack: (id: string) => Promise<void>;
  clearCustomTracks: () => Promise<void>;
  playBirthdayCelebration: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Helper to determine exact audio or video duration from File/Blob
const getMediaDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mkv|mov)$/i));
      const media = isVideo ? document.createElement('video') : new Audio();
      const objectUrl = URL.createObjectURL(file);
      media.src = objectUrl;
      const cleanup = (dur: number) => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (e) {}
        resolve(dur || 180);
      };
      media.addEventListener('loadedmetadata', () => {
        cleanup(Math.round(media.duration || 0));
      });
      media.addEventListener('error', () => {
        cleanup(180);
      });
      setTimeout(() => cleanup(180), 2500);
    } catch (e) {
      resolve(180);
    }
  });
};

// Helper to normalize and convert popular cloud/streaming audio URLs
export const normalizeAudioUrl = (inputUrl: string): { url: string; fallbackTitle: string } => {
  let url = inputUrl.trim();
  let fallbackTitle = 'Online Track 🎵';

  // 1. Google Drive direct link conversion
  const gdriveMatch =
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
    url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    url = `https://docs.google.com/uc?export=download&id=${gdriveMatch[1]}`;
    fallbackTitle = 'Google Drive Audio 🎧';
  }

  // 2. Dropbox direct link conversion
  if (url.includes('dropbox.com')) {
    url = url.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
    if (!url.includes('raw=1') && !url.includes('dl=1')) {
      url += (url.includes('?') ? '&' : '?') + 'raw=1';
    }
    fallbackTitle = 'Dropbox Audio 📦';
  }

  // 3. Try to extract clean filename from URL pathname if applicable
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const segment = pathname.split('/').filter(Boolean).pop();
    if (segment && segment.includes('.')) {
      const clean = decodeURIComponent(segment.replace(/\.[^/.]+$/, '').replace(/[-_+]/g, ' '));
      if (clean && clean.length > 1) {
        fallbackTitle = clean;
      }
    }
  } catch (e) {}

  return { url, fallbackTitle };
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

  // Modern Features State & Video Mode
  const [vibeMood, setVibeMood] = useState<VibeMood>('all');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bakery_favorite_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Video Mode (16:9 Video Screen vs Vinyl Disc)
  const [isVideoMode, setIsVideoModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bakery_music_video_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Floating Mini Video (Picture-in-Picture on POS screen when modal closed)
  const [isFloatingMiniVideo, setIsFloatingMiniVideoState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bakery_music_floating_video');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const setIsVideoMode = (enabled: boolean) => {
    setIsVideoModeState(enabled);
    try {
      localStorage.setItem('bakery_music_video_mode', String(enabled));
    } catch {}
  };

  const toggleVideoMode = () => {
    soundFx.playPop();
    setIsVideoMode(!isVideoMode);
  };

  const setIsFloatingMiniVideo = (enabled: boolean) => {
    setIsFloatingMiniVideoState(enabled);
    try {
      localStorage.setItem('bakery_music_floating_video', String(enabled));
    } catch {}
  };

  const toggleFloatingMiniVideo = () => {
    soundFx.playPop();
    setIsFloatingMiniVideo(!isFloatingMiniVideo);
  };

  const [ytErrorTrackIndex, setYtErrorTrackIndex] = useState<number | null>(null);
  const clearYtError = () => setYtErrorTrackIndex(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytTickerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingVideoIdRef = useRef<string | null>(null);

  // Live mutable refs to completely prevent stale closures in event callbacks
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

  // Load YouTube IFrame API script & initialize video elements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inject CSS for YouTube IFrame to fully fill its docked slot
    const styleId = 'sweetbakery-video-player-styles';
    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement('style');
      styleTag.id = styleId;
      styleTag.textContent = `
        #sweetbakery-yt-hidden-player,
        #sweetbakery-yt-hidden-player iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          display: block !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    // 1. YouTube Container
    let container = document.getElementById('sweetbakery-yt-hidden-player');
    if (!container) {
      container = document.createElement('div');
      container.id = 'sweetbakery-yt-hidden-player';
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '200px';
      container.style.height = '200px';
      container.style.pointerEvents = 'none';
      container.style.opacity = '0';
      container.style.zIndex = '99999';
      container.style.backgroundColor = '#000';
      document.body.appendChild(container);
    }

    // 2. Persistent MP4 Video Player
    let mp4El = document.getElementById('sweetbakery-mp4-persistent-player') as HTMLVideoElement | null;
    if (!mp4El) {
      mp4El = document.createElement('video');
      mp4El.id = 'sweetbakery-mp4-persistent-player';
      mp4El.style.position = 'fixed';
      mp4El.style.top = '-9999px';
      mp4El.style.left = '-9999px';
      mp4El.style.width = '200px';
      mp4El.style.height = '200px';
      mp4El.style.pointerEvents = 'none';
      mp4El.style.opacity = '0';
      mp4El.style.zIndex = '99999';
      mp4El.style.backgroundColor = '#000';
      mp4El.style.objectFit = 'contain';
      mp4El.playsInline = true;
      mp4El.controls = true;
      mp4El.preload = 'metadata';
      document.body.appendChild(mp4El);
    }
    videoRef.current = mp4El;

    // Attach MP4 Video callbacks
    const handleVideoTimeUpdate = () => {
      const cur = playlistRef.current[currentTrackIndexRef.current];
      const isMp4 = Boolean(cur && (cur.category === 'mp4' || cur.isVideo || cur.url.match(/\.(mp4|webm|mkv|mov)/i)));
      if (isMp4 && mp4El && isPlayingRef.current) {
        setCurrentTime(mp4El.currentTime);
      }
    };

    const handleVideoLoadedMetadata = () => {
      const cur = playlistRef.current[currentTrackIndexRef.current];
      const isMp4 = Boolean(cur && (cur.category === 'mp4' || cur.isVideo || cur.url.match(/\.(mp4|webm|mkv|mov)/i)));
      if (isMp4 && mp4El) {
        setDuration(mp4El.duration || 0);
      }
    };

    const handleVideoEnded = () => {
      const cur = playlistRef.current[currentTrackIndexRef.current];
      const isMp4 = Boolean(cur && (cur.category === 'mp4' || cur.isVideo || cur.url.match(/\.(mp4|webm|mkv|mov)/i)));
      if (isMp4) {
        handleEnded();
      }
    };

    mp4El.addEventListener('timeupdate', handleVideoTimeUpdate);
    mp4El.addEventListener('loadedmetadata', handleVideoLoadedMetadata);
    mp4El.addEventListener('ended', handleVideoEnded);

    const initYt = () => {
      try {
        if ((window as any).YT && (window as any).YT.Player) {
          const appOrigin =
            typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http')
              ? window.location.origin
              : 'https://sothearetsuon-ai.github.io';
          const appUrl =
            typeof window !== 'undefined' && window.location.href && window.location.href.startsWith('http')
              ? window.location.href
              : 'https://sothearetsuon-ai.github.io/sweetbakery-pos/';

          ytPlayerRef.current = new (window as any).YT.Player('sweetbakery-yt-hidden-player', {
            height: '100%',
            width: '100%',
            host: 'https://www.youtube-nocookie.com',
            playerVars: {
              autoplay: 1,
              controls: 1,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              enablejsapi: 1,
              origin: appOrigin,
              widget_referrer: appUrl,
            },
            events: {
              onReady: () => {
                try {
                  const iframe =
                    document.querySelector('#sweetbakery-yt-hidden-player iframe') ||
                    document.getElementById('sweetbakery-yt-hidden-player');
                  if (iframe && (iframe as HTMLElement).tagName === 'IFRAME') {
                    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                    iframe.setAttribute(
                      'allow',
                      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    );
                  }
                } catch {}
                if (pendingVideoIdRef.current) {
                  try {
                    ytPlayerRef.current.loadVideoById({
                      videoId: pendingVideoIdRef.current,
                      suggestedQuality: 'hd720',
                    });
                    pendingVideoIdRef.current = null;
                  } catch (e) {
                    console.warn('Pending loadVideoById error:', e);
                  }
                }
              },
              onStateChange: (event: any) => {
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
                if (event.data === 1) {
                  setIsPlaying(true);
                  isPlayingRef.current = true;
                  setYtErrorTrackIndex(null);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                  isPlayingRef.current = false;
                } else if (event.data === 0) {
                  handleEnded();
                }
              },
              onError: (event: any) => {
                console.warn('YouTube IFrame player error code:', event.data);
                // 2 = invalid param, 5 = HTML5 error, 100 = not found, 101/150/153 = embed restricted
                setYtErrorTrackIndex(currentTrackIndexRef.current);
              },
            },
          });
        }
      } catch (e) {
        console.warn('YouTube IFrame player initialization warning:', e);
      }
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const first = document.getElementsByTagName('script')[0];
      first?.parentNode?.insertBefore(tag, first);
      (window as any).onYouTubeIframeAPIReady = initYt;
    } else {
      initYt();
    }

    return () => {
      if (mp4El) {
        mp4El.removeEventListener('timeupdate', handleVideoTimeUpdate);
        mp4El.removeEventListener('loadedmetadata', handleVideoLoadedMetadata);
        mp4El.removeEventListener('ended', handleVideoEnded);
      }
    };
  }, []);

  // Sleep Timer countdown ticker
  useEffect(() => {
    if (sleepTimerRemaining === null || sleepTimerRemaining <= 0) return;
    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          pause();
          setSleepTimerMinutes(null);
          soundFx.playPop();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  const setSleepTimer = (minutes: number | null) => {
    soundFx.playPop();
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepTimerRemaining(null);
    } else {
      setSleepTimerRemaining(minutes * 60);
    }
  };

  const toggleFavorite = (trackId: string) => {
    soundFx.playPop();
    setFavoriteTrackIds((prev) => {
      const next = prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId];
      try {
        localStorage.setItem('bakery_favorite_tracks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Dynamically pin video containers (#sweetbakery-yt-hidden-player & #sweetbakery-mp4-persistent-player)
  // to #sweetbakery-video-screen-slot (inside Modal) or #sweetbakery-floating-video-slot (Floating Mini Player)
  useEffect(() => {
    const syncVideoPosition = () => {
      const ytContainer = document.getElementById('sweetbakery-yt-hidden-player');
      const mp4El = document.getElementById('sweetbakery-mp4-persistent-player');
      if (!ytContainer && !mp4El) return;

      const track = playlist[currentTrackIndex];
      const isYt = Boolean(track && (track.category === 'youtube' || track.url.startsWith('youtube:')));
      const isMp4 = Boolean(
        track && !isYt && (track.category === 'mp4' || track.isVideo || track.url.match(/\.(mp4|webm|mkv|mov)/i))
      );
      const isVideoTrack = isYt || isMp4;

      let targetSlot: HTMLElement | null = null;
      if (isVideoTrack) {
        if (isPlayerOpen && isVideoMode) {
          targetSlot = document.getElementById('sweetbakery-video-screen-slot');
        } else if (!isPlayerOpen && isFloatingMiniVideo) {
          targetSlot = document.getElementById('sweetbakery-floating-video-slot');
        }
      }

      if (targetSlot) {
        const rect = targetSlot.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const activeEl = isYt ? ytContainer : mp4El;
          const inactiveEl = isYt ? mp4El : ytContainer;

          if (activeEl) {
            activeEl.style.position = 'fixed';
            activeEl.style.top = `${rect.top}px`;
            activeEl.style.left = `${rect.left}px`;
            activeEl.style.width = `${rect.width}px`;
            activeEl.style.height = `${rect.height}px`;
            activeEl.style.zIndex = '99999';
            activeEl.style.opacity = '1';
            activeEl.style.pointerEvents = 'auto';
            activeEl.style.borderRadius = isPlayerOpen ? '1.25rem' : '0.85rem';
            activeEl.style.overflow = 'hidden';
            activeEl.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';
            activeEl.style.transition = 'top 0.12s ease, left 0.12s ease, width 0.12s ease, height 0.12s ease';
          }
          if (inactiveEl) {
            inactiveEl.style.top = '-9999px';
            inactiveEl.style.left = '-9999px';
            inactiveEl.style.opacity = '0';
            inactiveEl.style.pointerEvents = 'none';
          }
          return;
        }
      }

      // Hide both offscreen
      if (ytContainer) {
        ytContainer.style.top = '-9999px';
        ytContainer.style.left = '-9999px';
        ytContainer.style.opacity = '0';
        ytContainer.style.pointerEvents = 'none';
      }
      if (mp4El) {
        mp4El.style.top = '-9999px';
        mp4El.style.left = '-9999px';
        mp4El.style.opacity = '0';
        mp4El.style.pointerEvents = 'none';
      }
    };

    const interval = setInterval(syncVideoPosition, 100);
    window.addEventListener('resize', syncVideoPosition);
    window.addEventListener('scroll', syncVideoPosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', syncVideoPosition);
      window.removeEventListener('scroll', syncVideoPosition, true);
    };
  }, [isPlayerOpen, isVideoMode, isFloatingMiniVideo, currentTrackIndex, playlist]);

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

    birthdaySynth.stop();

    // 1. YouTube Track Playback
    if (targetTrack.category === 'youtube' || targetTrack.url.startsWith('youtube:')) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
      }
      bakeryAmbientAudio.stop();

      const videoId = targetTrack.youtubeId || extractYouTubeVideoId(targetTrack.url);
      if (videoId) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          try {
            ytPlayerRef.current.loadVideoById({
              videoId: videoId,
              suggestedQuality: 'hd720',
            });
            ytPlayerRef.current.setVolume(isMutedRef.current ? 0 : Math.round(volumeRef.current * 100));
            ytPlayerRef.current.playVideo();
          } catch (err) {
            console.warn('YouTube loadVideo error:', err);
            pendingVideoIdRef.current = videoId;
          }
        } else {
          pendingVideoIdRef.current = videoId;
        }
      }
      setCurrentTime(0);
      setDuration(targetTrack.duration || 210);
      return;
    }

    // Stop YouTube audio when switching to normal audio
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }

    // 2. MP4 Video Track Playback
    const isMp4 = Boolean(
      targetTrack.category === 'mp4' ||
      targetTrack.isVideo ||
      targetTrack.url.match(/\.(mp4|webm|mkv|mov)(\?.*)?$/i)
    );
    if (isMp4) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }
      bakeryAmbientAudio.stop();

      if (videoRef.current) {
        const vid = videoRef.current;
        vid.volume = isMutedRef.current ? 0 : volumeRef.current;
        vid.src = targetTrack.url;
        vid.currentTime = 0;
        vid.play().catch((err) => {
          console.warn('MP4 video playback error:', err);
        });
      }
      setCurrentTime(0);
      setDuration(targetTrack.duration || 180);
      return;
    }

    // Stop MP4 video when switching to normal audio
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
      } catch {}
    }

    // 3. Synthesized Ambient Music
    if (targetTrack.url.startsWith('synthesized:')) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }
      const trackId = (targetTrack.url.replace('synthesized:', '') as BakerySoundtrackId) || 'cafe';
      bakeryAmbientAudio.setVolume(isMutedRef.current ? 0 : volumeRef.current);
      bakeryAmbientAudio.play(trackId);
      setCurrentTime(0);
      setDuration(targetTrack.duration || 120);
    } else {
      // 4. Offline WAV / Uploaded custom track or URL via HTML5 Audio
      bakeryAmbientAudio.stop();
      if (audioRef.current) {
        const currentAudio = audioRef.current;
        currentAudio.volume = isMutedRef.current ? 0 : volumeRef.current;
        currentAudio.src = targetTrack.url;
        currentAudio.currentTime = 0;
        currentAudio.play().catch((err) => {
          console.warn('Playback error or policy blocked, falling back to ambient audio:', err);
          bakeryAmbientAudio.setVolume(isMutedRef.current ? 0 : volumeRef.current);
          bakeryAmbientAudio.play('cafe');
        });
      }
    }
  };

  // Continuous playback engine: automatically advances to the next consecutive track
  const handleEnded = () => {
    const list = playlistRef.current;
    const currentIndex = currentTrackIndexRef.current;
    const mode = loopModeRef.current;
    const shuffle = isShuffleRef.current;

    if (!list || list.length === 0) return;
    const currentTrack = list[currentIndex];

    // Check if sleep timer was set to "End of current song"
    if (sleepTimerMinutes === 0) {
      pause();
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      return;
    }

    // 1. Loop single track
    if (mode === 'one') {
      if (currentTrack?.category === 'youtube' && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
        } catch {}
      } else if (
        currentTrack?.category === 'mp4' ||
        currentTrack?.isVideo ||
        currentTrack?.url.match(/\.(mp4|webm|mkv|mov)/i)
      ) {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      } else if (currentTrack?.url.startsWith('synthesized:')) {
        const trackId = (currentTrack.url.replace('synthesized:', '') as BakerySoundtrackId) || 'cafe';
        bakeryAmbientAudio.play(trackId);
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    // 2. Stop at end if loop mode is none
    if (mode === 'none' && currentIndex >= list.length - 1) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      bakeryAmbientAudio.stop();
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

  // Live ticker for YouTube audio duration & progress
  useEffect(() => {
    if (ytTickerRef.current) clearInterval(ytTickerRef.current);
    const track = playlist[currentTrackIndex];
    if (isPlaying && track?.category === 'youtube') {
      ytTickerRef.current = setInterval(() => {
        try {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
            const time = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || 0;
            setCurrentTime(time);
            if (dur > 0) setDuration(dur);
          }
        } catch {}
      }, 500);
    }
    return () => {
      if (ytTickerRef.current) clearInterval(ytTickerRef.current);
    };
  }, [isPlaying, currentTrackIndex, playlist]);

  // Initialize HTML5 audio element & ambient audio callbacks
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audioRef.current && isPlayingRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration || 0);
      }
    };

    const handleError = () => {
      console.warn('Audio playback error on current track, auto-recovering with ambient audio...');
      if (isPlayingRef.current) {
        bakeryAmbientAudio.setVolume(isMutedRef.current ? 0 : volumeRef.current);
        bakeryAmbientAudio.play('cafe');
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    bakeryAmbientAudio.setCallbacks(
      (time, dur) => {
        if (isPlayingRef.current) {
          setCurrentTime(time);
          if (dur > 0) setDuration(dur);
        }
      },
      () => {
        if (isPlayingRef.current) {
          handleEnded();
        }
      }
    );

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      bakeryAmbientAudio.stop();
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
        const loadedTracks: AudioTrack[] = stored
          .map((item) => {
            let trackUrl = item.url || '';
            if (item.blob) {
              try {
                trackUrl = URL.createObjectURL(item.blob);
              } catch (e) {}
            }
            if (!trackUrl) return null;

            const isYt = trackUrl.startsWith('youtube:') || item.id.startsWith('yt-');
            const isMp4 = Boolean(item.isVideo || item.category === 'mp4' || trackUrl.match(/\.(mp4|webm|mkv|mov)/i));
            const ytId = isYt ? extractYouTubeVideoId(trackUrl) || item.id.replace('yt-', '') : undefined;

            return {
              id: item.id,
              title: item.title,
              artist: item.artist || (isYt ? 'YouTube Music 🔴' : isMp4 ? 'វីដេអូ MP4 🎬' : item.url ? 'Online Audio Link 🌐' : 'Uploaded Track'),
              url: trackUrl,
              duration: item.duration,
              isCustom: true,
              category: (isYt ? 'youtube' : isMp4 ? 'mp4' : 'custom') as any,
              isVideo: isMp4,
              mediaType: isMp4 ? 'video' : 'audio',
              youtubeId: ytId,
              thumbnailUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined,
              dateAdded: item.dateAdded,
            };
          })
          .filter(Boolean) as AudioTrack[];

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

  const isCurrentVideo = Boolean(
    currentTrack && (
      currentTrack.category === 'youtube' ||
      currentTrack.category === 'mp4' ||
      currentTrack.isVideo ||
      currentTrack.url.startsWith('youtube:') ||
      Boolean(currentTrack.url.match(/\.(mp4|webm|mkv|mov)(\?.*)?$/i))
    )
  );

  // Handle volume / mute change across HTML5 Audio, Video, YouTube, and Bakery Ambient Audio
  useEffect(() => {
    const effectiveVol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = effectiveVol;
    }
    if (videoRef.current) {
      videoRef.current.volume = effectiveVol;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(Math.round(effectiveVol * 100));
        if (isMuted) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
      } catch {}
    }
    bakeryAmbientAudio.setVolume(effectiveVol);
  }, [volume, isMuted]);

  const play = () => {
    const track = currentTrack || playlist[0];
    if (!track) return;
    setIsPlaying(true);
    isPlayingRef.current = true;

    birthdaySynth.stop();

    if (track.category === 'youtube' || track.url.startsWith('youtube:')) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        try {
          ytPlayerRef.current.playVideo();
        } catch {}
      }
      return;
    }

    const isMp4 = Boolean(
      track.category === 'mp4' ||
      track.isVideo ||
      track.url.match(/\.(mp4|webm|mkv|mov)(\?.*)?$/i)
    );
    if (isMp4) {
      if (videoRef.current) {
        if (!videoRef.current.src || !videoRef.current.src.includes(track.url)) {
          videoRef.current.src = track.url;
        }
        videoRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
        videoRef.current.play().catch(() => {});
      }
      return;
    }

    if (track.url.startsWith('synthesized:')) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const trackId = (track.url.replace('synthesized:', '') as BakerySoundtrackId) || 'cafe';
      bakeryAmbientAudio.setVolume(isMutedRef.current ? 0 : volumeRef.current);
      bakeryAmbientAudio.play(trackId);
    } else if (audioRef.current) {
      bakeryAmbientAudio.stop();
      if (!audioRef.current.src || !audioRef.current.src.includes(track.url)) {
        audioRef.current.src = track.url;
      }
      audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
      audioRef.current.play().catch((e) => {
        console.warn('Playback failed, falling back to ambient audio:', e);
        bakeryAmbientAudio.setVolume(isMutedRef.current ? 0 : volumeRef.current);
        bakeryAmbientAudio.play('cafe');
      });
    }
  };

  const pause = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }
    bakeryAmbientAudio.stop();
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

    if (currentTime > 3) {
      seek(0);
      return;
    }

    const prevIdx = (currentIndex - 1 + list.length) % list.length;
    playTrackAtIndex(prevIdx);
  };

  const seek = (seconds: number) => {
    const track = playlistRef.current[currentTrackIndexRef.current];
    if (track?.category === 'youtube' && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
      } catch {}
      setCurrentTime(seconds);
    } else if (
      track?.category === 'mp4' ||
      track?.isVideo ||
      track?.url.match(/\.(mp4|webm|mkv|mov)/i)
    ) {
      if (videoRef.current) {
        videoRef.current.currentTime = seconds;
        setCurrentTime(seconds);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const skipBy = (seconds: number) => {
    soundFx.playPop();
    const target = Math.max(0, Math.min(duration || 1000, currentTime + seconds));
    seek(target);
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

  // Upload custom song or video files (MP3, WAV, MP4, WEBM, etc.) in batch with real-time progress
  const uploadTracks = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(
      (file) =>
        file.type.startsWith('audio/') ||
        file.type.startsWith('video/') ||
        file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|mp4|webm|mkv|mov)$/i)
    );
    if (validFiles.length === 0) return;

    setIsUploading(true);
    const newTracks: AudioTrack[] = [];
    let serverActive = true;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mkv|mov)$/i));
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      setUploadProgress({
        current: i + 1,
        total: validFiles.length,
        currentFileName: cleanTitle,
      });

      const trackDuration = await getMediaDuration(file);
      let trackUrl = URL.createObjectURL(file);
      let trackId = (isVideo ? 'video-' : 'custom-') + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

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
              artist: isVideo ? 'វីដេអូ MP4 ផ្ទាល់ខ្លួន 🎬' : 'បទចម្រៀងផ្ទាល់ខ្លួន 🎵',
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
            serverActive = false;
          }
        } catch (err) {
          serverActive = false;
        }
      }

      const newTrack: AudioTrack = {
        id: trackId,
        title: cleanTitle,
        artist: isVideo ? 'វីដេអូ MP4 ផ្ទាល់ខ្លួន 🎬' : 'បទចម្រៀងផ្ទាល់ខ្លួន 🎵',
        url: trackUrl,
        isCustom: true,
        category: isVideo ? 'mp4' : 'custom',
        isVideo: isVideo,
        mediaType: isVideo ? 'video' : 'audio',
        duration: trackDuration,
        dateAdded: new Date().toISOString().slice(0, 10),
      };

      // 2. Persist into browser IndexedDB so it's permanent across page refreshes
      saveTrackToDB({
        id: trackId,
        title: cleanTitle,
        artist: newTrack.artist!,
        blob: file,
        duration: trackDuration,
        category: isVideo ? 'mp4' : 'custom',
        isVideo: isVideo,
        mediaType: isVideo ? 'video' : 'audio',
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

  // Add custom song from direct Web URL / Stream / Cloud Link
  const addTrackByUrl = async (
    rawUrl: string,
    customTitle?: string,
    customArtist?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!rawUrl || !rawUrl.trim()) {
      return { success: false, error: 'សូមបញ្ចូលលីង URL បទចម្រៀង' };
    }

    // Check if it's a YouTube URL
    const ytId = extractYouTubeVideoId(rawUrl);
    if (ytId) {
      return addYouTubeTrack(rawUrl, customTitle);
    }

    const { url, fallbackTitle } = normalizeAudioUrl(rawUrl);
    const isVideo = Boolean(rawUrl.match(/\.(mp4|webm|mkv|mov)(\?.*)?$/i));
    const title = (customTitle && customTitle.trim()) || fallbackTitle;
    const artist = (customArtist && customArtist.trim()) || (isVideo ? 'វីដេអូ Web MP4 🎬' : 'Online Web Stream 🌐');
    const trackId = (isVideo ? 'video-url-' : 'url-') + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    // Try to detect duration from media URL metadata
    const trackDuration = await new Promise<number>((resolve) => {
      try {
        const media = isVideo ? document.createElement('video') : new Audio();
        media.src = url;
        const done = (dur: number) => {
          resolve(dur || 180);
        };
        media.addEventListener('loadedmetadata', () => {
          done(Math.round(media.duration || 0));
        });
        media.addEventListener('error', () => {
          done(180);
        });
        setTimeout(() => done(180), 3000);
      } catch {
        resolve(180);
      }
    });

    const newTrack: AudioTrack = {
      id: trackId,
      title,
      artist,
      url,
      isCustom: true,
      category: isVideo ? 'mp4' : 'custom',
      isVideo: isVideo,
      mediaType: isVideo ? 'video' : 'audio',
      duration: trackDuration,
      dateAdded: new Date().toISOString().slice(0, 10),
    };

    // 1. Save to local IndexedDB for permanence
    await saveTrackToDB({
      id: trackId,
      title,
      artist,
      url,
      isUrlOnly: true,
      duration: trackDuration,
      category: isVideo ? 'mp4' : 'custom',
      isVideo: isVideo,
      mediaType: isVideo ? 'video' : 'audio',
      dateAdded: newTrack.dateAdded!,
    }).catch(() => {});

    // 2. Sync to Firebase Cloud
    try {
      await saveFirestoreDoc('musicTracks', trackId, {
        ...newTrack,
        isCloudSynced: true,
      });
    } catch {}

    // 3. Update active playlist state
    setPlaylist((prev) => {
      const updated = [...prev, newTrack];
      playlistRef.current = updated;
      return updated;
    });

    soundFx.playSuccess();
    confetti({
      particleCount: 65,
      spread: 65,
      origin: { y: 0.6 },
    });

    // Auto-play newly added track
    setTimeout(() => {
      const list = playlistRef.current;
      playTrackAtIndex(Math.max(0, list.length - 1));
    }, 100);

    return { success: true };
  };

  // Add YouTube Track via oEmbed metadata and background playback
  const addYouTubeTrack = async (
    urlOrId: string,
    customTitle?: string,
    customAuthor?: string,
    customDuration?: number,
    autoPlay: boolean = true
  ): Promise<{ success: boolean; track?: AudioTrack; error?: string }> => {
    const videoId = extractYouTubeVideoId(urlOrId);
    if (!videoId) {
      return { success: false, error: 'លីង YouTube មិនត្រឹមត្រូវ (សូមបញ្ចូល Link ពេញលេញ)' };
    }

    let title = customTitle?.trim();
    let artist = customAuthor?.trim() || 'YouTube';
    let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    let durationSec = customDuration || 210;

    // If metadata not provided, fetch via oEmbed
    if (!title) {
      const info = await fetchYouTubeVideoInfo(videoId);
      title = info?.title || `YouTube Music (${videoId})`;
      artist = customAuthor?.trim() || info?.author || 'YouTube';
      if (info?.thumbnailUrl) thumbnailUrl = info.thumbnailUrl;
    }

    const trackId = 'yt-' + videoId;

    const newTrack: AudioTrack = {
      id: trackId,
      title,
      artist,
      url: `youtube:${videoId}`,
      duration: durationSec,
      isCustom: true,
      category: 'youtube',
      youtubeId: videoId,
      thumbnailUrl,
      sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
      dateAdded: new Date().toISOString().slice(0, 10),
    };

    // Save to IndexedDB
    await saveTrackToDB({
      id: trackId,
      title,
      artist,
      url: newTrack.url,
      isUrlOnly: true,
      duration: durationSec,
      dateAdded: newTrack.dateAdded!,
    }).catch(() => {});

    setPlaylist((prev) => {
      const filtered = prev.filter((t) => t.id !== trackId);
      const updated = [...filtered, newTrack];
      playlistRef.current = updated;
      return updated;
    });

    soundFx.playSuccess();
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.6 },
    });

    if (autoPlay) {
      setTimeout(() => {
        const idx = playlistRef.current.findIndex((t) => t.id === trackId);
        if (idx !== -1) playTrackAtIndex(idx);
      }, 150);
    }

    return { success: true, track: newTrack };
  };

  // Add Multiple YouTube Tracks at once (from search, curated lists, or playlist imports)
  const addMultipleYouTubeTracks = async (
    tracks: Array<{ id: string; title: string; author?: string; duration?: number | string; durationSec?: number }>
  ): Promise<{ success: boolean; addedCount: number }> => {
    if (!tracks || tracks.length === 0) return { success: false, addedCount: 0 };

    const newTracks: AudioTrack[] = [];
    const today = new Date().toISOString().slice(0, 10);

    for (const t of tracks) {
      const videoId = extractYouTubeVideoId(t.id) || t.id;
      if (!videoId) continue;
      const trackId = 'yt-' + videoId;
      const durSec = typeof t.duration === 'number' ? t.duration : t.durationSec || 210;
      const newTrack: AudioTrack = {
        id: trackId,
        title: t.title || `YouTube Music (${videoId})`,
        artist: t.author || 'YouTube',
        url: `youtube:${videoId}`,
        duration: durSec,
        isCustom: true,
        category: 'youtube',
        youtubeId: videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        dateAdded: today,
      };

      saveTrackToDB({
        id: trackId,
        title: newTrack.title,
        artist: newTrack.artist!,
        url: newTrack.url,
        isUrlOnly: true,
        duration: newTrack.duration,
        dateAdded: today,
      }).catch(() => {});

      newTracks.push(newTrack);
    }

    if (newTracks.length > 0) {
      setPlaylist((prev) => {
        const existingMap = new Map(prev.map((item) => [item.id, item]));
        newTracks.forEach((nt) => existingMap.set(nt.id, nt));
        const updated = Array.from(existingMap.values());
        playlistRef.current = updated;
        return updated;
      });

      soundFx.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Auto-play the first added track
      setTimeout(() => {
        const firstId = newTracks[0]?.id;
        if (firstId) {
          const idx = playlistRef.current.findIndex((t) => t.id === firstId);
          if (idx !== -1) playTrackAtIndex(idx);
        }
      }, 150);
    }

    return { success: true, addedCount: newTracks.length };
  };

  // Direct Audio Downloader: download online MP3/WAV into IndexedDB blob for offline playback
  const downloadWebAudioTrack = async (
    url: string,
    title?: string,
    artist?: string
  ): Promise<{ success: boolean; track?: AudioTrack; error?: string }> => {
    setIsUploading(true);
    const result = await downloadWebAudioBlob(url);
    setIsUploading(false);

    if (!result) {
      return { success: false, error: 'មិនអាចទាញយកបទចម្រៀងពីលីងនេះបានទេ សូមពិនិត្យមើលលីងម្តងទៀត' };
    }

    const trackId = 'web-dl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const finalTitle = title?.trim() || normalizeAudioUrl(url).fallbackTitle;
    const finalArtist = artist?.trim() || 'Online Downloaded 📥';
    const objectUrl = URL.createObjectURL(result.blob);

    const newTrack: AudioTrack = {
      id: trackId,
      title: finalTitle,
      artist: finalArtist,
      url: objectUrl,
      duration: result.duration,
      isCustom: true,
      category: 'custom',
      dateAdded: new Date().toISOString().slice(0, 10),
    };

    // Save blob directly into IndexedDB for 100% offline playback
    await saveTrackToDB({
      id: trackId,
      title: finalTitle,
      artist: finalArtist,
      blob: result.blob,
      duration: result.duration,
      dateAdded: newTrack.dateAdded!,
    }).catch(() => {});

    setPlaylist((prev) => {
      const updated = [...prev, newTrack];
      playlistRef.current = updated;
      return updated;
    });

    soundFx.playSuccess();
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      const idx = playlistRef.current.findIndex((t) => t.id === trackId);
      if (idx !== -1) playTrackAtIndex(idx);
    }, 150);

    return { success: true, track: newTrack };
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
        isVideoMode,
        setIsVideoMode,
        toggleVideoMode,
        isFloatingMiniVideo,
        setIsFloatingMiniVideo,
        toggleFloatingMiniVideo,
        isCurrentVideo,
        ytErrorTrackIndex,
        clearYtError,
        vibeMood,
        setVibeMood,
        sleepTimerMinutes,
        sleepTimerRemaining,
        setSleepTimer,
        favoriteTrackIds,
        toggleFavorite,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        skipBy,
        setVolume,
        toggleMute,
        setLoopMode,
        toggleShuffle,
        playTrackById,
        uploadTracks,
        addTrackByUrl,
        addYouTubeTrack,
        addMultipleYouTubeTracks,
        downloadWebAudioTrack,
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
