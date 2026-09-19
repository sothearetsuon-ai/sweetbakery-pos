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
    deleteTrack,
    clearCustomTracks,
    playBirthdayCelebration,
  } = useMusic();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

          {/* Quick Actions: Upload Audio Files & Birthday Celebration Special */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Upload Custom Songs from PC / Phone (Supports Multi-Select & Drag-Drop) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3.5 group shadow-2xs hover:shadow-sm ${
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
              <div className="w-11 h-11 rounded-2xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform shrink-0">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-800 group-hover:text-pink-600 transition-colors flex items-center gap-1.5 flex-wrap">
                  <span>+ Upload បទចម្រៀង</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-pink-100 text-pink-700 text-[9px] font-black border border-pink-200">
                    រើសបានច្រើនបទក្នុងពេលតែមួយ
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  ចុចដើម្បីជ្រើសរើស ឬអូសទម្លាក់ (Drag & Drop) បទចម្រៀងជាច្រើនបទ
                </p>
              </div>
            </div>

            {/* 2. Instant Birthday Celebration Button */}
            <button
              type="button"
              onClick={playBirthdayCelebration}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center gap-3.5 group cursor-pointer active:scale-95 text-left"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Cake className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="text-xs font-black flex items-center gap-1.5">
                  <span>🎉 ចាក់បទ Happy Birthday 🎂</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                </div>
                <p className="text-[10px] text-orange-100 mt-0.5">
                  ចាក់ភ្លេងខួបកំណើតភ្លាមៗជូនភ្ញៀវពេលកាត់នំ + បាញ់ Confetti!
                </p>
              </div>
            </button>
          </div>

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
                            <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 text-[9px] font-bold flex items-center gap-0.5">
                              {track.isCloudSynced ? '☁️ Cloud' : '📱 ក្នុងម៉ាស៊ីន'}
                            </span>
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
