import React, { useRef, useState } from 'react';
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
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { soundFx } from '../../utils/audio';

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
    addTrackByUrl,
    deleteTrack,
    clearCustomTracks,
    playBirthdayCelebration,
  } = useMusic();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAddUrlOpen, setIsAddUrlOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  if (!isPlayerOpen) return null;

  const customTracksCount = playlist.filter((t) => t.isCustom).length;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadTracks(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadTracks(e.dataTransfer.files);
    }
  };

  const cycleLoopMode = () => {
    soundFx.playPop();
    if (loopMode === 'all') setLoopMode('one');
    else if (loopMode === 'one') setLoopMode('none');
    else setLoopMode('all');
  };

  const handleAddUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError(null);

    if (!urlInput || !urlInput.trim()) {
      setUrlError('សូមបញ្ចូលលីង URL បទចម្រៀង');
      return;
    }

    setIsSubmittingUrl(true);
    try {
      const res = await addTrackByUrl(urlInput.trim(), titleInput.trim(), artistInput.trim());
      if (res.success) {
        setUrlInput('');
        setTitleInput('');
        setArtistInput('');
        setIsAddUrlOpen(false);
      } else {
        setUrlError(res.error || 'មិនអាចបញ្ចូលបទនេះបានទេ');
      }
    } catch (err: any) {
      setUrlError(err?.message || 'មានបញ្ហាក្នុងការទាញយកបទ');
    } finally {
      setIsSubmittingUrl(false);
    }
  };

  const applyPresetUrl = (presetUrl: string, presetTitle: string, presetArtist: string) => {
    soundFx.playPop();
    setUrlInput(presetUrl);
    setTitleInput(presetTitle);
    setArtistInput(presetArtist);
    setUrlError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsPlayerOpen(false)}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-pink-500/25">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                  ម៉ាស៊ីនចាក់ភ្លេងហាងនំ 🎶
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-pink-100 text-pink-700">
                  Bakery Jukebox
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ចាក់ភ្លេងកំដរហាងនំ បទខួបកំណើត & Upload ចម្រៀងពីទូរស័ព្ទ/PC
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPlayerOpen(false)}
            className="w-9 h-9 rounded-2xl bg-white border border-rose-200 text-slate-400 hover:text-slate-700 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Turntable & Current Playing Widget */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-pink-950 p-5 sm:p-6 text-white shadow-xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              {/* Spinning Vinyl Record */}
              <div className="relative shrink-0">
                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border-4 border-slate-700/80 shadow-2xl flex items-center justify-center ${
                    isPlaying ? 'animate-spin-slow' : ''
                  }`}
                  style={{ animationDuration: '6s' }}
                >
                  {/* Vinyl Grooves */}
                  <div className="w-20 h-20 rounded-full border border-slate-600/40 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-slate-500/30 flex items-center justify-center">
                      {/* Center Label */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-amber-500 flex items-center justify-center shadow-inner">
                        <Disc3 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Equalizer Waves when playing */}
                {isPlaying && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-0.5 bg-slate-900/90 px-2 py-1 rounded-full border border-pink-500/40 shadow-xs">
                    <span className="w-1 h-3 bg-pink-400 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-rose-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-amber-400 rounded-full animate-pulse delay-150" />
                    <span className="w-1 h-4 bg-pink-400 rounded-full animate-pulse delay-100" />
                  </div>
                )}
              </div>

              {/* Current Track Info & Audio Controls */}
              <div className="flex-1 w-full text-center sm:text-left space-y-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-pink-500/30 text-pink-300 border border-pink-400/30">
                      {currentTrack?.isCustom ? '📁 Uploaded' : '🎵 ភ្លេងហាងនំ'}
                    </span>
                    {isPlaying && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        កំពុងចាក់...
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black tracking-tight mt-1 line-clamp-1">
                    {currentTrack ? currentTrack.title : 'មិនទាន់មានបទចម្រៀង'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {currentTrack?.artist || 'SweetBakery Cafe'}
                  </p>
                </div>

                {/* Progress Bar & Timing */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => seek(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Playback Controls & Volume */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {/* Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
                    {/* Shuffle */}
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        toggleShuffle();
                      }}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isShuffle ? 'text-pink-400 bg-pink-500/20' : 'text-slate-400 hover:text-white'
                      }`}
                      title="សាប់បទ (Shuffle)"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>

                    {/* Previous */}
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        prevTrack();
                      }}
                      className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                      title="បទមុន"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>

                    {/* Play/Pause Main */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title={isPlaying ? 'ផ្អាក (Pause)' : 'ចាក់ (Play)'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
                      )}
                    </button>

                    {/* Next */}
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        nextTrack();
                      }}
                      className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                      title="បទបន្ទាប់"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>

                    {/* Loop */}
                    <button
                      type="button"
                      onClick={cycleLoopMode}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        loopMode !== 'none' ? 'text-pink-400 bg-pink-500/20' : 'text-slate-400 hover:text-white'
                      }`}
                      title={`Loop: ${loopMode}`}
                    >
                      {loopMode === 'one' ? (
                        <Repeat1 className="w-4 h-4" />
                      ) : (
                        <Repeat className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 mx-auto sm:mx-0 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="text-slate-300 hover:text-white cursor-pointer"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-16 sm:w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Multi-Upload Progress Bar */}
          {isUploading && uploadProgress && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-200 space-y-2.5 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-800 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-pink-600 stroke-[2.5]" />
                  <span>កំពុង Upload បទចម្រៀង... ({uploadProgress.current} នៃ {uploadProgress.total} បទ)</span>
                </span>
                <span className="font-mono font-black text-pink-600 bg-white px-2 py-0.5 rounded-full border border-pink-200 text-[11px]">
                  {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-pink-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 truncate font-medium flex items-center gap-1.5">
                <span className="text-pink-600 font-bold">🎵 បទបច្ចុប្បន្ន៖</span>
                <span className="font-bold text-slate-700 truncate">{uploadProgress.currentFileName}</span>
              </div>
            </div>
          )}

          {/* Quick Actions: 1. Upload MP3 | 2. Add Song by URL | 3. Birthday Celebration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Upload Custom Song Files from PC / Phone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3 group shadow-2xs hover:shadow-sm ${
                isDragging
                  ? 'bg-pink-100/80 border-pink-500 scale-[1.02]'
                  : 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:border-pink-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform shrink-0">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-800 group-hover:text-pink-600 transition-colors truncate">
                  + Upload MP3 / File
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  ជ្រើសរើសពី PC / Phone
                </p>
              </div>
            </div>

            {/* 2. Add by URL / Online Stream */}
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsAddUrlOpen((prev) => !prev);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group shadow-2xs hover:shadow-sm text-left ${
                isAddUrlOpen
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 text-slate-800'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform shrink-0 ${
                  isAddUrlOpen
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-600 text-white shadow-blue-500/25 group-hover:scale-105'
                }`}
              >
                <Link2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black truncate flex items-center gap-1">
                  <span>+ ដាក់លីងចម្រៀង</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      isAddUrlOpen ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    URL
                  </span>
                </div>
                <p
                  className={`text-[10px] truncate mt-0.5 ${
                    isAddUrlOpen ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  Direct MP3 / Stream Link
                </p>
              </div>
            </button>

            {/* 3. Instant Birthday Celebration Button */}
            <button
              type="button"
              onClick={playBirthdayCelebration}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center gap-3 group cursor-pointer active:scale-95 text-left sm:col-span-1"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Cake className="w-5 h-5 animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black flex items-center gap-1 truncate">
                  <span>🎉 បទ Birthday 🎂</span>
                </div>
                <p className="text-[10px] text-orange-100 truncate mt-0.5">
                  ចាក់ពេលកាត់នំ + Confetti
                </p>
              </div>
            </button>
          </div>

          {/* Expandable Add Song by URL Section */}
          {isAddUrlOpen && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-pink-50/60 border-2 border-blue-200/80 shadow-md animate-in slide-in-from-top duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">
                      បញ្ចូលបទចម្រៀងតាមរយៈលីង URL (Direct Web Audio / Cloud Link)
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      មិនបាច់ Upload ចំណាយទំហំម៉ាស៊ីន ចាក់អនឡាញភ្លាមៗ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddUrlOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddUrl} className="space-y-3">
                {/* Audio URL Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    🔗 លីងចម្រៀង (Audio URL / Direct MP3 Link) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlError(null);
                      }}
                      placeholder="https://example.com/song.mp3 ឬ Google Drive / Dropbox / Stream URL"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-2xs font-mono text-slate-800 placeholder:text-slate-400"
                      required
                    />
                    {urlInput && (
                      <button
                        type="button"
                        onClick={() => setUrlInput('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1 py-0.5 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Title & Artist Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      🏷️ ចំណងជើងបទចម្រៀង (Title)
                    </label>
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder="ទុកចោលដើម្បីដាក់ឈ្មោះស្វ័យប្រវត្តិ"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      🎤 ឈ្មោះអ្នកច្រៀង / ប្រភព (Artist)
                    </label>
                    <input
                      type="text"
                      value={artistInput}
                      onChange={(e) => setArtistInput(e.target.value)}
                      placeholder="ឧ. Bakery Jazz, Radio Stream"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {urlError && (
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{urlError}</span>
                  </div>
                )}

                {/* Sample Presets for Fast Testing */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>លីងគំរូសម្រាប់សាកល្បងចុចភ្លាមៗ (Quick Sample Links)៖</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetUrl(
                          'https://assets.mixkit.co/music/preview/mixkit-coffee-chill-out-1094.mp3',
                          'Sweet Morning Cafe ☕',
                          'Acoustic Ambiance'
                        )
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 transition-colors cursor-pointer"
                    >
                      ☕ Cafe Chill Out
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetUrl(
                          'https://assets.mixkit.co/music/preview/mixkit-sweet-melody-789.mp3',
                          'Pastry Shop Sweet Melody 🍰',
                          'Chillout Vibes'
                        )
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 transition-colors cursor-pointer"
                    >
                      🍰 Sweet Pastry Melody
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetUrl(
                          'https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-522.mp3',
                          'Acoustic Bakery Guitar 🥐',
                          'Bakery Acoustic'
                        )
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 transition-colors cursor-pointer"
                    >
                      🥐 Acoustic Guitar
                    </button>
                  </div>
                </div>

                {/* Audiomack & Cloud Link Tips */}
                <div className="p-2.5 rounded-xl bg-blue-100/60 border border-blue-200/80 text-[10px] text-slate-600 leading-relaxed">
                  <div className="font-bold text-blue-900 flex items-center gap-1 mb-0.5">
                    <span>💡 ព័ត៌មានបន្ថែម៖</span>
                  </div>
                  <span>
                    • <strong>Google Drive / Dropbox</strong>: អាចដាក់ Link ចែករំលែកបាន ប្រព័ន្ធនឹងបំលែងជា Direct Stream ដោយស្វ័យប្រវត្តិ។<br />
                    • <strong>Audiomack / YouTube</strong>: សូមចុច Download ជា File MP3 ពីលើវេបសាយនោះ រួច Upload ចូលប្រព័ន្ធតាមប៊ូតុង <strong>+ Upload MP3</strong>។
                  </span>
                </div>

                {/* Submit / Add Button */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddUrlOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingUrl || !urlInput.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {isSubmittingUrl ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>កំពុងបញ្ចូល...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>បញ្ចូល & ចាក់ភ្លាមៗ 🎶</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Playlist Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-pink-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  បញ្ជីបទចម្រៀងទាំងអស់ ({playlist.length} បទ)
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ចាក់បន្តបន្ទាប់ស្វ័យប្រវត្តិ</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {customTracksCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('តើអ្នកពិតជាចង់សម្អាតបទចម្រៀងផ្ទាល់ខ្លួនទាំងអស់ចេញពីបញ្ជីមែនទេ?')) {
                        clearCustomTracks();
                      }
                    }}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-rose-200"
                  >
                    🗑️ សម្អាតបទផ្ទាល់ខ្លួន
                  </button>
                )}
                <span className="text-[10px] text-slate-400 font-medium">
                  ចុចលើបទណាមួយដើម្បីចាក់
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-200/60">
              {playlist.map((track, index) => {
                const isCurrent = currentTrackIndex === index;
                const isUrlTrack =
                  track.id.startsWith('url-') ||
                  (!track.storagePath && typeof track.url === 'string' && track.url.startsWith('http') && track.isCustom);

                return (
                  <div
                    key={track.id}
                    onClick={() => playTrackById(track.id)}
                    className={`p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                      isCurrent
                        ? 'bg-pink-100/60 border-l-4 border-l-pink-600'
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Track number or Playing icon */}
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0">
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3.5">
                            <span className="w-1 h-3 bg-pink-600 rounded-full animate-pulse" />
                            <span className="w-1 h-3.5 bg-pink-500 rounded-full animate-pulse delay-75" />
                            <span className="w-1 h-2 bg-pink-600 rounded-full animate-pulse delay-150" />
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-pink-600">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Title & Artist */}
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-black truncate ${
                            isCurrent ? 'text-pink-700' : 'text-slate-800 group-hover:text-pink-600'
                          }`}
                        >
                          {track.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span>{track.artist || 'SweetBakery'}</span>
                          {track.isCustom && (
                            <>
                              {isUrlTrack ? (
                                <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center gap-0.5">
                                  🌐 លីង Web
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 text-[9px] font-bold flex items-center gap-0.5">
                                  {track.isCloudSynced ? '☁️ Cloud' : '📱 ក្នុងម៉ាស៊ីន'}
                                </span>
                              )}
                            </>
                          )}
                          {track.category === 'birthday' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold">
                              🎂 ខួបកំណើត
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {track.duration && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatTime(track.duration)}
                        </span>
                      )}

                      {/* Delete button only for user-uploaded custom tracks */}
                      {track.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTrack(track.id);
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="លុបបទចម្រៀងនេះ"
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

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-rose-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>បទចម្រៀងនឹងបន្តចាក់ស្វ័យប្រវត្តិកំឡុងពេលប្រើប្រាស់ប្រព័ន្ធ</span>
          <button
            type="button"
            onClick={() => setIsPlayerOpen(false)}
            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-xl cursor-pointer shadow-2xs"
          >
            បង្រួមតូច
          </button>
        </div>
      </div>
    </div>
  );
};
