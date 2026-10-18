import React, { useRef, useState, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Upload,
  Music,
  Disc3,
  Sparkles,
  Trash2,
  Cake,
  ListMusic,
  Radio,
  Loader2,
  Link2,
  Globe,
  Plus,
  AlertCircle,
  Check,
  MapPin,
  Heart,
  Clock,
  RotateCcw,
  RotateCw,
  Search,
  Download,
  ExternalLink,
  Youtube,
  FolderOpen,
  Coffee,
  Flame,
  Clipboard,
  ListPlus,
  PlayCircle,
  Video,
  Tv,
} from 'lucide-react';
import { useMusic, VibeMood } from '../../context/MusicContext';
import { soundFx } from '../../utils/audio';
import {
  extractYouTubeVideoId,
  extractYouTubePlaylistId,
  fetchYouTubeVideoInfo,
  searchYouTubeVideos,
  fetchYouTubePlaylistVideos,
  readYouTubeUrlFromClipboard,
  getFastDownloadLinks,
  curatedBakeryPresets,
  popularYouTubeBakeryPresets,
  YouTubeInfo,
  WebConverterTool,
} from '../../services/youtubeMusicService';

export const MusicPlayerModal: React.FC = () => {
  const {
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
    isFloatingMiniVideo,
    toggleFloatingMiniVideo,
    isCurrentVideo,
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
  } = useMusic();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'player' | 'download'>('player');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // YouTube / Web Importer State
  const [youtubeInput, setYoutubeInput] = useState('');
  const [isFetchingYt, setIsFetchingYt] = useState(false);
  const [isSearchingYt, setIsSearchingYt] = useState(false);
  const [ytSearchResults, setYtSearchResults] = useState<YouTubeInfo[]>([]);
  const [previewYt, setPreviewYt] = useState<YouTubeInfo | null>(null);
  const [detectedPlaylist, setDetectedPlaylist] = useState<{ id: string; count?: number } | null>(null);
  const [isImportingPlaylist, setIsImportingPlaylist] = useState(false);
  const [webAudioUrl, setWebAudioUrl] = useState('');
  const [webAudioTitle, setWebAudioTitle] = useState('');
  const [isDownloadingWeb, setIsDownloadingWeb] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag and drop for local upload
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Filter playlist by Vibe Mood & Search Query (must be declared before any conditional return!)
  const filteredPlaylist = useMemo(() => {
    return playlist.filter((track) => {
      // Vibe filter
      if (vibeMood === 'favorites' && !favoriteTrackIds.includes(track.id)) return false;
      if (vibeMood === 'cafe' && track.category !== 'cafe') return false;
      if (vibeMood === 'birthday' && track.category !== 'birthday') return false;
      if (vibeMood === 'acoustic' && track.category !== 'acoustic') return false;
      if (vibeMood === 'custom' && !track.isCustom) return false;
      if (vibeMood === 'youtube' && track.category !== 'youtube') return false;
      if (vibeMood === 'mp4' && track.category !== 'mp4' && !track.isVideo) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = track.title.toLowerCase().includes(q);
        const matchArtist = track.artist?.toLowerCase().includes(q) || false;
        return matchTitle || matchArtist;
      }
      return true;
    });
  }, [playlist, vibeMood, favoriteTrackIds, searchQuery]);

  if (!isPlayerOpen) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  const cycleLoopMode = () => {
    soundFx.playPop();
    if (loopMode === 'all') setLoopMode('one');
    else if (loopMode === 'one') setLoopMode('none');
    else setLoopMode('all');
  };

  // Handle Auto Search or Link Lookup
  const handleAutoSearchYouTube = async (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : youtubeInput).trim();
    if (!q) return;

    setDownloadMsg(null);
    setPreviewYt(null);
    setDetectedPlaylist(null);

    // 1. Check if it's a playlist URL
    const playlistId = extractYouTubePlaylistId(q);
    if (playlistId) {
      setDetectedPlaylist({ id: playlistId });
      setDownloadMsg({
        type: 'success',
        text: '📑 បានរកឃើញ YouTube Playlist! ចុចប៊ូតុង "នាំចូល Playlist ទាំងមូល" ខាងក្រោមដើម្បីបញ្ចូល',
      });
      return;
    }

    // 2. Check if it's a single video URL
    const videoId = extractYouTubeVideoId(q);
    if (videoId) {
      setIsFetchingYt(true);
      try {
        const info = await fetchYouTubeVideoInfo(videoId);
        if (info) {
          setPreviewYt(info);
        } else {
          setDownloadMsg({ type: 'error', text: 'មិនអាចស្វែងរកព័ត៌មានពី YouTube បានទេ' });
        }
      } catch (err: any) {
        setDownloadMsg({ type: 'error', text: err.message || 'Error fetching YouTube info' });
      } finally {
        setIsFetchingYt(false);
      }
      return;
    }

    // 3. Otherwise treat as search query (song name, artist, keywords)
    setIsSearchingYt(true);
    try {
      const results = await searchYouTubeVideos(q);
      setYtSearchResults(results);
      if (results.length === 0) {
        setDownloadMsg({
          type: 'error',
          text: `មិនមានលទ្ធផលសម្រាប់ "${q}" ទេ សូមសាកល្បងពាក្យគន្លឹះផ្សេងទៀត`,
        });
      }
    } catch (err: any) {
      setDownloadMsg({ type: 'error', text: 'បរាជ័យក្នុងការស្វែងរក សូមព្យាយាមម្តងទៀត' });
    } finally {
      setIsSearchingYt(false);
    }
  };

  // Auto-Detect & Paste from Clipboard
  const handleAutoPasteFromClipboard = async () => {
    soundFx.playPop();
    const url = await readYouTubeUrlFromClipboard();
    if (url) {
      setYoutubeInput(url);
      setDownloadMsg({ type: 'success', text: '📋 បានទាញ Link ពី Clipboard រួចរាល់!' });
      handleAutoSearchYouTube(url);
    } else {
      setDownloadMsg({
        type: 'error',
        text: 'មិនមាន Link YouTube នៅក្នុង Clipboard របស់អ្នកទេ (សូម Copy Link ជាមុន)',
      });
    }
  };

  // Add Single YouTube Preview to Playlist
  const handleAddYouTubeToPlaylist = async () => {
    if (!youtubeInput.trim() && !previewYt) return;
    const targetUrl = previewYt ? previewYt.id : youtubeInput;
    setIsFetchingYt(true);
    setDownloadMsg(null);

    const res = await addYouTubeTrack(targetUrl, previewYt?.title);
    setIsFetchingYt(false);

    if (res.success) {
      setDownloadMsg({
        type: 'success',
        text: `✅ បានបញ្ចូល "${res.track?.title}" ទៅក្នុងម៉ាស៊ីនចាក់ភ្លេងរួចរាល់!`,
      });
      setYoutubeInput('');
      setPreviewYt(null);
    } else {
      setDownloadMsg({ type: 'error', text: res.error || 'មិនអាចបញ្ចូលបទនេះបានទេ' });
    }
  };

  // Play a Search Result Immediately
  const handlePlaySearchResult = async (item: YouTubeInfo) => {
    soundFx.playPop();
    const res = await addYouTubeTrack(item.id, item.title, item.author, item.durationSec, true);
    if (res.success) {
      setDownloadMsg({
        type: 'success',
        text: `▶️ កំពុងចាក់ "${item.title}"...`,
      });
    }
  };

  // Add Search Result to Playlist (without switching song immediately)
  const handleAddSearchResult = async (item: YouTubeInfo) => {
    soundFx.playPop();
    const res = await addYouTubeTrack(item.id, item.title, item.author, item.durationSec, false);
    if (res.success) {
      setDownloadMsg({
        type: 'success',
        text: `➕ បានបន្ថែម "${item.title}" ទៅក្នុង Playlist រួចរាល់!`,
      });
    }
  };

  // Bulk Import Entire Playlist
  const handleImportPlaylistAll = async () => {
    if (!detectedPlaylist) return;
    setIsImportingPlaylist(true);
    setDownloadMsg(null);
    try {
      const items = await fetchYouTubePlaylistVideos(detectedPlaylist.id);
      if (items.length > 0) {
        const res = await addMultipleYouTubeTracks(items);
        setDownloadMsg({
          type: 'success',
          text: `🎉 បានទាញយក និងនាំចូលចម្រៀង ${res.addedCount} បទពី YouTube Playlist ដោយជោគជ័យ!`,
        });
        setDetectedPlaylist(null);
        setYoutubeInput('');
      } else {
        setDownloadMsg({
          type: 'error',
          text: 'មិនអាចទាញយកបទពី Playlist នេះបានទេ (សូមពិនិត្យមើលសិទ្ធិបើកសាធារណៈ)',
        });
      }
    } catch (err: any) {
      setDownloadMsg({ type: 'error', text: err.message || 'Error importing playlist' });
    } finally {
      setIsImportingPlaylist(false);
    }
  };

  // Download direct Web Audio (MP3/WAV)
  const handleDownloadWebAudio = async () => {
    if (!webAudioUrl.trim()) {
      setDownloadMsg({ type: 'error', text: 'សូមបញ្ចូលលីង URL បទចម្រៀងផ្ទាល់ (MP3/WAV)' });
      return;
    }

    setIsDownloadingWeb(true);
    setDownloadMsg(null);

    const res = await downloadWebAudioTrack(webAudioUrl.trim(), webAudioTitle.trim());
    setIsDownloadingWeb(false);

    if (res.success) {
      setDownloadMsg({ type: 'success', text: `✅ បានទាញយក "${res.track?.title}" រួចរាល់! អាចចាក់ស្តាប់បាន Offline ១០០%` });
      setWebAudioUrl('');
      setWebAudioTitle('');
    } else {
      setDownloadMsg({ type: 'error', text: res.error || 'ការទាញយកមិនជោគជ័យ' });
    }
  };

  // Handle local file uploads
  const handleLocalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadTracks(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDropFiles = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadTracks(e.dataTransfer.files);
    }
  };

  const isCurrentFavorite = currentTrack ? favoriteTrackIds.includes(currentTrack.id) : false;
  const fastConverters = previewYt ? getFastDownloadLinks(previewYt.id) : getFastDownloadLinks(youtubeInput || 'https://www.youtube.com');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-battambang">
      {/* Frosted Glass Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={() => setIsPlayerOpen(false)}
      />

      {/* Main Glassmorphism Modal Box */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-950/90 text-white rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh] backdrop-blur-2xl">
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-amber-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Radio className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5">
                  <span>SweetBakery Jukebox</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Pro Studio 🎶
                  </span>
                </h2>
              </div>
              <p className="text-[10px] text-slate-400">
                ចាក់ភ្លេងហាងនំទំនើបបែប Spotify & Apple Music 🎶
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tab Switcher: Player vs Downloader */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setActiveTab('player');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'player'
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>ចាក់ភ្លេង</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setActiveTab('download');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'download'
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Download className="w-3 h-3" />
                <span>Download & YouTube 🔴</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsPlayerOpen(false);
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          {/* ============================================================== */}
          {/* TAB 1: MAIN PRO MUSIC PLAYER                                   */}
          {/* ============================================================== */}
          {activeTab === 'player' && (
            <div className="space-y-4">
              {/* Video Mode vs Vinyl Disc Mode Switcher Bar */}
              {isCurrentVideo && (
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-1.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setIsVideoMode(true);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        isVideoMode
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30 ring-1 ring-pink-400'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>អេក្រង់វីដេអូ (Video)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setIsVideoMode(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        !isVideoMode
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30 ring-1 ring-pink-400'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Disc3 className="w-3.5 h-3.5" />
                      <span>ឌីសចម្រៀង (Vinyl Disc)</span>
                    </button>
                  </div>

                  {/* Floating Mini Video (PiP) Toggle */}
                  <button
                    type="button"
                    onClick={toggleFloatingMiniVideo}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isFloatingMiniVideo
                        ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title="បើក/បិទ Mini Video អណ្តែតលើអេក្រង់ POS ពេលបិទផ្ទាំងនេះ"
                  >
                    <Tv className="w-3.5 h-3.5 text-pink-400" />
                    <span className="hidden sm:inline">Mini Video (PiP)៖</span>
                    <span className={isFloatingMiniVideo ? 'text-emerald-400' : 'text-slate-500'}>
                      {isFloatingMiniVideo ? 'បើក' : 'បិទ'}
                    </span>
                  </button>
                </div>
              )}

              {/* HERO DISPLAY: Video Screen or Vinyl Disc */}
              {isVideoMode && isCurrentVideo ? (
                /* 16:9 HD VIDEO SCREEN MODE */
                <div className="space-y-3">
                  <div
                    id="sweetbakery-video-screen-slot"
                    className="relative w-full aspect-video rounded-3xl bg-black border border-white/15 overflow-hidden shadow-2xl flex items-center justify-center group"
                    style={{ minHeight: '220px' }}
                  >
                    {/* Backplate / Placeholder while persistent video element docks */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-slate-900 via-slate-950 to-black">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center mb-2 shadow-lg shadow-pink-500/30">
                        <Video className="w-7 h-7 text-white animate-pulse" />
                      </div>
                      <p className="text-sm font-black text-white">{currentTrack?.title}</p>
                      <p className="text-xs text-pink-300/80 mt-0.5">
                        {currentTrack?.category === 'youtube'
                          ? 'YouTube Music Video HD 🔴'
                          : 'វីដេអូ MP4 កម្រិតច្បាស់ 🎬'}
                      </p>
                    </div>
                  </div>

                  {/* Video Meta Info Bar */}
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          {currentTrack?.category === 'youtube' ? 'YouTube Video 🔴' : 'MP4 Video 🎬'}
                        </span>
                        {sleepTimerRemaining !== null && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 animate-spin" />
                            <span>
                              {Math.floor(sleepTimerRemaining / 60)}:
                              {(sleepTimerRemaining % 60).toString().padStart(2, '0')}
                            </span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white truncate drop-shadow-md mt-1">
                        {currentTrack?.title || 'ជ្រើសរើសបទចម្រៀង'}
                      </h3>
                      <p className="text-xs text-slate-300/80 truncate">
                        {currentTrack?.artist || 'SweetBakery Music'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsVideoMode(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center gap-1 shrink-0 cursor-pointer"
                      title="ប្តូរទៅឌីសចម្រៀង (Vinyl Disc)"
                    >
                      <Disc3 className="w-3.5 h-3.5 text-pink-400" />
                      <span className="hidden sm:inline">ឌីសចម្រៀង</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* VINYL DISC TURNTABLE MODE */
                <div className="relative rounded-3xl p-5 bg-gradient-to-b from-white/5 to-white/0 border border-white/10 overflow-hidden flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                  {/* Vinyl Record Artwork */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-900 border-4 border-slate-800 shadow-2xl flex items-center justify-center relative overflow-hidden ${
                        isPlaying ? 'animate-spin-slow' : ''
                      }`}
                      style={{ animationDuration: '8s' }}
                    >
                      {/* Vinyl Grooves Texture */}
                      <div className="absolute inset-2 rounded-full border border-slate-700/50" />
                      <div className="absolute inset-5 rounded-full border border-slate-700/40" />
                      <div className="absolute inset-8 rounded-full border border-slate-700/30" />
                      <div className="absolute inset-11 rounded-full border border-slate-700/20" />

                      {/* Center Album Art */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center overflow-hidden border-2 border-white/40 shadow-inner">
                        {currentTrack?.thumbnailUrl ? (
                          <img
                            src={currentTrack.thumbnailUrl}
                            alt={currentTrack.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Cake className="w-8 h-8 text-white" />
                        )}
                      </div>

                      {/* Center Hole */}
                      <div className="absolute w-3 h-3 rounded-full bg-slate-950 border border-white/60" />
                    </div>

                    {/* Pulsing Aura when playing */}
                    {isPlaying && (
                      <div className="absolute -inset-2 rounded-full bg-pink-500/20 blur-xl -z-10 animate-pulse" />
                    )}
                  </div>

                  {/* Song Info & Equalizer Spectrum */}
                  <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        {currentTrack?.category === 'youtube'
                          ? 'YouTube Audio 🔴'
                          : currentTrack?.category === 'mp4'
                          ? 'MP4 Video 🎬'
                          : currentTrack?.category === 'birthday'
                          ? 'Birthday Festival 🎂'
                          : currentTrack?.category === 'cafe'
                          ? 'Bakery Cafe ☕'
                          : 'Offline HQ 🥐'}
                      </span>

                      {/* Sleep Timer Indicator */}
                      {sleepTimerRemaining !== null && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 animate-spin" />
                          <span>
                            {Math.floor(sleepTimerRemaining / 60)}:
                            {(sleepTimerRemaining % 60).toString().padStart(2, '0')}
                          </span>
                        </span>
                      )}

                      {/* Video Available Badge (Click to open video screen) */}
                      {isCurrentVideo && !isVideoMode && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setIsVideoMode(true);
                          }}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs flex items-center gap-1 cursor-pointer hover:scale-105 transition-all"
                        >
                          <Video className="w-2.5 h-2.5" />
                          <span>ចុចមើលវីដេអូ 🎬</span>
                        </button>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white truncate drop-shadow-md">
                      {currentTrack?.title || 'ជ្រើសរើសបទចម្រៀង'}
                    </h3>
                    <p className="text-xs text-slate-300/80 truncate">
                      {currentTrack?.artist || 'SweetBakery Music'}
                    </p>

                    {/* Animated Equalizer Waveform Spectrum (Dancing bars) */}
                    <div className="pt-2 flex items-center justify-center sm:justify-start gap-1">
                      {[16, 28, 20, 36, 24, 32, 18, 26, 14].map((h, i) => (
                        <span
                          key={i}
                          className={`inline-block w-1.5 rounded-full bg-gradient-to-t from-pink-500 to-amber-400 transition-all ${
                            isPlaying ? 'animate-pulse' : 'opacity-30'
                          }`}
                          style={{
                            height: isPlaying ? `${h}px` : '6px',
                            animationDuration: `${0.4 + (i % 4) * 0.2}s`,
                            animationDelay: `${i * 0.08}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Scrubber Slider */}
              <div className="space-y-1.5">
                <div className="relative group flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:h-2 transition-all"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* High-Standard Playback Controls (Spotify / Apple Music style) */}
              <div className="flex items-center justify-between gap-2 px-2">
                {/* Shuffle Toggle */}
                <button
                  type="button"
                  onClick={toggleShuffle}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isShuffle
                      ? 'text-pink-400 bg-pink-500/20 ring-1 ring-pink-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={isShuffle ? 'បិទ Shuffle' : 'បើក Shuffle'}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Skip Backward 10s */}
                <button
                  type="button"
                  onClick={() => skipBy(-10)}
                  className="w-9 h-9 rounded-full hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  title="ថយក្រោយ 10 វិនាទី"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Previous Track */}
                <button
                  type="button"
                  onClick={prevTrack}
                  className="w-10 h-10 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  title="បទមុន"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                {/* Large Center Play / Pause Button with Glow */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-pink-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? 'ផ្អាក (Pause)' : 'ចាក់ (Play)'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>

                {/* Next Track */}
                <button
                  type="button"
                  onClick={nextTrack}
                  className="w-10 h-10 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  title="បទបន្ទាប់"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                {/* Skip Forward 10s */}
                <button
                  type="button"
                  onClick={() => skipBy(10)}
                  className="w-9 h-9 rounded-full hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  title="ទៅមុខ 10 វិនាទី"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Repeat Mode Toggle */}
                <button
                  type="button"
                  onClick={cycleLoopMode}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    loopMode !== 'none'
                      ? 'text-pink-400 bg-pink-500/20 ring-1 ring-pink-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={
                    loopMode === 'all'
                      ? 'Loop គ្រប់បទទាំងអស់'
                      : loopMode === 'one'
                      ? 'Loop តែបទនេះមួយគត់'
                      : 'មិន Loop'
                  }
                >
                  {loopMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              {/* Volume Slider & Quick Favorite & Sleep Timer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10">
                {/* Volume Slider */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 sm:w-28 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-8">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>

                {/* Sleep Timer & Favorite */}
                <div className="flex items-center gap-2">
                  {/* Sleep Timer Selector */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <select
                      value={sleepTimerMinutes === null ? '' : sleepTimerMinutes}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') setSleepTimer(null);
                        else setSleepTimer(parseInt(val, 10));
                      }}
                      className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-white">
                        Timer បិទភ្លេង
                      </option>
                      <option value="15" className="bg-slate-900 text-white">
                        ⏱️ ១៥ នាទី
                      </option>
                      <option value="30" className="bg-slate-900 text-white">
                        ⏱️ ៣០ នាទី
                      </option>
                      <option value="45" className="bg-slate-900 text-white">
                        ⏱️ ៤៥ នាទី
                      </option>
                      <option value="60" className="bg-slate-900 text-white">
                        ⏱️ ១ ម៉ោង
                      </option>
                      <option value="0" className="bg-slate-900 text-white">
                        ⏹️ ចប់បទនេះ
                      </option>
                    </select>
                  </div>

                  {/* Favorite Current Song */}
                  {currentTrack && (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(currentTrack.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        isCurrentFavorite
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isCurrentFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                        }`}
                      />
                      <span>ចូលចិត្ត</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Atmosphere Mood / Vibe Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>បរិយាកាសហាងនំ (Atmosphere Vibe)៖</span>
                  </span>
                  <span className="text-[10px] text-pink-400">{filteredPlaylist.length} បទ</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all' as VibeMood, label: 'ទាំងអស់ (All)' },
                    { id: 'cafe' as VibeMood, label: '☕ Bakery Lo-Fi' },
                    { id: 'birthday' as VibeMood, label: '🎂 Happy Birthday' },
                    { id: 'acoustic' as VibeMood, label: '🥐 Acoustic Guitar' },
                    { id: 'youtube' as VibeMood, label: '🔴 YouTube' },
                    { id: 'mp4' as VibeMood, label: '🎬 វីដេអូ MP4' },
                    { id: 'favorites' as VibeMood, label: '💖 បទចូលចិត្ត' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setVibeMood(v.id);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        vibeMood === v.id
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-400 shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playlist Section with Search */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ស្វែងរកឈ្មោះបទចម្រៀង..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  {playlist.some((t) => t.isCustom) && (
                    <button
                      type="button"
                      onClick={clearCustomTracks}
                      className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold transition-all border border-rose-500/20 cursor-pointer flex items-center gap-1"
                      title="លុបបទដែលបានបញ្ចូលទាំងអស់"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>សម្អាត</span>
                    </button>
                  )}
                </div>

                {/* Playlist Tracks List */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {filteredPlaylist.map((track) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const isFav = favoriteTrackIds.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrackById(track.id)}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition-all group ${
                          isCurrent
                            ? 'bg-pink-600/25 border-pink-500/60 shadow-md ring-1 ring-pink-500/40 text-white'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Play Status or Disc Icon */}
                          <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            {isCurrent && isPlaying ? (
                              <div className="flex items-center gap-0.5">
                                <span className="inline-block w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                                <span className="inline-block w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                <span className="inline-block w-1 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                              </div>
                            ) : (
                              <Music className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-black truncate leading-tight group-hover:text-pink-300">
                              {track.title}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                              <span>{track.artist || 'SweetBakery Music'}</span>
                              <span>•</span>
                              <span>{formatTime(track.duration || 180)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Heart Favorite & Delete */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleFavorite(track.id)}
                            className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isFav ? 'fill-rose-500 text-rose-500' : ''
                              }`}
                            />
                          </button>

                          {track.isCustom && (
                            <button
                              type="button"
                              onClick={() => deleteTrack(track.id)}
                              className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors"
                              title="លុបបទនេះ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: YOUTUBE & WEB MUSIC DOWNLOADER / IMPORTER               */}
          {/* ============================================================== */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              {/* Status Message */}
              {downloadMsg && (
                <div
                  className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-bold border ${
                    downloadMsg.type === 'success'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {downloadMsg.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{downloadMsg.text}</span>
                </div>
              )}

              {/* 1. YouTube Audio Importer & Auto-Search Studio */}
              <div className="p-4 rounded-3xl bg-gradient-to-b from-red-950/40 via-purple-950/20 to-white/5 border border-red-500/25 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30">
                      <Youtube className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                        <span>ទាញយក & ចាក់ចម្រៀងពី YouTube ស្វ័យប្រវត្តិ 🔴</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black bg-red-500/20 text-red-300 border border-red-500/30">
                          Auto Search
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        វាយឈ្មោះបទចម្រៀង ឬបិទភ្ជាប់ Link ដើម្បីស្វែងរក និងចាក់ភ្លាមៗ
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Clipboard Auto Paste Button */}
                  <button
                    type="button"
                    onClick={handleAutoPasteFromClipboard}
                    className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white rounded-xl text-[11px] font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="ទាញ Link ពី Clipboard ដោយស្វ័យប្រវត្តិ"
                  >
                    <Clipboard className="w-3.5 h-3.5 text-pink-400" />
                    <span>ទាញពី Clipboard</span>
                  </button>
                </div>

                {/* Search / Input Box with Enter Key support */}
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={youtubeInput}
                      onChange={(e) => setYoutubeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAutoSearchYouTube();
                        }
                      }}
                      placeholder="វាយឈ្មោះបទចម្រៀង (ឧ. ចម្រៀងកាហ្វេ, Birthday) ឬ Paste Link YouTube..."
                      className="w-full bg-white/5 border border-white/15 rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                    />
                    {youtubeInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setYoutubeInput('');
                          setYtSearchResults([]);
                          setPreviewYt(null);
                          setDetectedPlaylist(null);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAutoSearchYouTube()}
                    disabled={isFetchingYt || isSearchingYt || !youtubeInput.trim()}
                    className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-red-600/20 active:scale-95"
                  >
                    {isFetchingYt || isSearchingYt ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>ស្វែងរក</span>
                  </button>
                </div>

                {/* Quick Auto-Search Categories (1-Click Query Pills) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold mr-0.5">ស្វែងរកភ្លាមៗ៖</span>
                  {[
                    { label: '☕ កាហ្វេ Chill', q: 'bakery cafe acoustic music chill' },
                    { label: '🎂 Happy Birthday', q: 'happy birthday song acoustic celebration' },
                    { label: '🥐 Bakery Morning', q: 'morning coffee cafe acoustic guitar' },
                    { label: '🥖 Parisian Jazz', q: 'french patisserie jazz accordion bakery' },
                    { label: '🇰🇭 ចម្រៀងខ្មែរ Acoustic', q: 'ចម្រៀងកាហ្វេ acoustic ខ្មែរ' },
                    { label: '🎹 Piano Cafe', q: 'relaxing cafe piano instrumental bakery' },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setYoutubeInput(cat.label);
                        handleAutoSearchYouTube(cat.q);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-pink-500/40 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Playlist Auto-Import Banner if Playlist URL detected */}
                {detectedPlaylist && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-pink-950/30 to-purple-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <ListPlus className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-amber-200">
                          រកឃើញ YouTube Playlist ទាំងមូល 📑
                        </div>
                        <div className="text-[10px] text-slate-300 truncate">
                          អ្នកអាចទាញយក និងនាំចូលគ្រប់បទទាំងអស់ក្នុង Playlist នេះដោយចុចតែ ១ ដង
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleImportPlaylistAll}
                      disabled={isImportingPlaylist}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white rounded-xl text-xs font-black transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {isImportingPlaylist ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>+ នាំចូល Playlist ទាំងមូល</span>
                    </button>
                  </div>
                )}

                {/* Single Video Preview Box if Direct Link Looked Up */}
                {previewYt && (
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                    <img
                      src={previewYt.thumbnailUrl}
                      alt={previewYt.title}
                      className="w-16 h-12 rounded-xl object-cover shrink-0 shadow-md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-white truncate">{previewYt.title}</div>
                      <div className="text-[10px] text-red-300 font-bold">{previewYt.author}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddYouTubeToPlaylist}
                      className="px-3 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                    >
                      + បញ្ចូលចាក់ភ្លាម
                    </button>
                  </div>
                )}

                {/* Search Results Grid (Automatic Video Discovery) */}
                {ytSearchResults.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>លទ្ធផលស្វែងរកពី YouTube ({ytSearchResults.length} បទ)៖</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setYtSearchResults([])}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        បិទលទ្ធផល
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {ytSearchResults.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-2.5 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="relative w-14 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-sm">
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              {item.duration && (
                                <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-white">
                                  {item.duration}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate leading-tight group-hover:text-pink-300">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                {item.author}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePlaySearchResult(item)}
                              className="px-2.5 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                              title="ចាក់បទនេះភ្លាមៗ"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>ចាក់</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddSearchResult(item)}
                              className="w-7 h-7 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95"
                              title="បន្ថែមទៅ Playlist"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular YouTube Bakery Presets (1-Click Instant Load) */}
                <div className="space-y-1.5 pt-1 border-t border-white/10">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>បទ YouTube ពេញនិយមប្រចាំហាង (1-Click Instant Tracks)៖</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {popularYouTubeBakeryPresets.map((song) => (
                      <div
                        key={song.id}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-2 transition-all"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">{song.title}</div>
                          <div className="text-[9px] text-slate-400 truncate flex items-center gap-1">
                            <span>{song.author}</span>
                            <span>•</span>
                            <span>{song.duration}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            addYouTubeTrack(song.id, song.title, song.author, 210, true);
                          }}
                          className="px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-0.5 active:scale-95"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>ចាក់</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click Fast Online Converters */}
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                    <span>ឧបករណ៍ទាញយកជា MP3 ឥតគិតថ្លៃ (1-Click Fast MP3 Converters)៖</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {fastConverters.map((c) => (
                      <a
                        key={c.id}
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex flex-col items-center text-center transition-all group"
                      >
                        <span className="text-base">{c.icon}</span>
                        <span className="text-[11px] font-black text-white group-hover:text-pink-300">
                          {c.name}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate w-full">{c.badge}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Direct Web Audio Link Downloader (MP3/WAV/Cloud Links) */}
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">
                      ទាញយកពី Web Audio / Cloud Storage (MP3, WAV)
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Google Drive, Dropbox, Soundcloud ឬ Web Link (រក្សាទុកចាក់ Offline ១០០%)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={webAudioUrl}
                    onChange={(e) => setWebAudioUrl(e.target.value)}
                    placeholder="បិទភ្ជាប់ Link ចម្រៀងផ្ទាល់ (URL) ឧ. https://example.com/song.mp3"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={webAudioTitle}
                      onChange={(e) => setWebAudioTitle(e.target.value)}
                      placeholder="ចំណងជើងបទចម្រៀង (ស្រេចចិត្ត)"
                      className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleDownloadWebAudio}
                      disabled={isDownloadingWeb || !webAudioUrl.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {isDownloadingWeb ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>ទាញយក Offline</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Local File Upload (Phone & PC) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDropFiles}
                className={`p-4 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isDraggingFile
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*,video/*,.mp3,.wav,.ogg,.m4a,.flac,.mp4,.webm,.mkv"
                  onChange={handleLocalFileChange}
                  className="hidden"
                />
                <FolderOpen className="w-8 h-8 text-pink-400 mb-1 animate-bounce" />
                <div className="text-xs font-black text-white">
                  ចុចដើម្បីជ្រើសរើសចម្រៀង ឬវីដេអូ MP4 ពីទូរស័ព្ទ ឬកុំព្យូទ័រ
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  គាំទ្រ MP3, WAV, MP4, WEBM (មើលវីដេអូ និងចាក់ភ្លេងបានភ្លាមៗ)
                </div>
              </div>

              {/* 4. Curated Bakery Presets */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  <span>បទចម្រៀងគំរូហាងនំពេញនិយម (1-Click Recommended)៖</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {curatedBakeryPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">{preset.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{preset.artist}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addTrackByUrl(preset.url, preset.title, preset.artist)}
                        className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-[11px] font-black transition-all shrink-0 cursor-pointer"
                      >
                        + បញ្ចូល
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
