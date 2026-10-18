import React from 'react';
import {
  X,
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Tv,
  Square,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { soundFx } from '../../utils/audio';

export const FloatingMiniVideoPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isPlayerOpen,
    setIsPlayerOpen,
    isFloatingMiniVideo,
    setIsFloatingMiniVideo,
    isCurrentVideo,
    togglePlay,
    stop,
    nextTrack,
    prevTrack,
    isMuted,
    toggleMute,
  } = useMusic();

  // Only display when modal is closed, floating video is enabled, and current track is a video (YouTube or MP4)
  if (isPlayerOpen || !isFloatingMiniVideo || !isCurrentVideo || !currentTrack) {
    return null;
  }

  const handleOpenFull = () => {
    soundFx.playPop();
    setIsPlayerOpen(true);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playPop();
    setIsFloatingMiniVideo(false);
    stop(); // Immediately silence video/audio when user closes the floating player
  };

  return (
    <div
      className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 w-64 sm:w-80 bg-slate-950/95 text-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-2xl transition-all animate-in slide-in-from-bottom-5 duration-300 font-battambang"
      style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15)' }}
    >
      {/* Top Mini Header Bar */}
      <div className="px-3 py-2 bg-gradient-to-r from-pink-950/60 via-purple-950/40 to-slate-950/80 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-lg bg-pink-600 flex items-center justify-center shrink-0">
            <Tv className="w-3 h-3 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-black truncate text-white leading-tight">
              {currentTrack.title}
            </div>
            <div className="text-[9px] text-pink-300/80 truncate">
              {currentTrack.category === 'youtube' ? 'YouTube HD 🔴' : 'វីដេអូ MP4 🎬'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Maximize to full modal */}
          <button
            type="button"
            onClick={handleOpenFull}
            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
            title="ពង្រីកពេញអេក្រង់ (Full Player)"
          >
            <Maximize2 className="w-3 h-3" />
          </button>

          {/* Dismiss Mini Video */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-rose-500/30 flex items-center justify-center text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
            title="បិទ Mini Video"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Video Slot (16:9 Aspect Ratio) */}
      {/* The persistent YouTube or MP4 video element will automatically pin itself exactly over this box */}
      <div
        id="sweetbakery-floating-video-slot"
        className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden cursor-pointer group"
        onClick={handleOpenFull}
      >
        <div className="text-center p-2 opacity-40 group-hover:opacity-80 transition-opacity">
          <Tv className="w-6 h-6 mx-auto mb-1 text-pink-400 animate-pulse" />
          <span className="text-[10px] text-slate-300 font-bold block">
            {currentTrack.category === 'youtube' ? 'YouTube Clip' : 'MP4 Video'}
          </span>
        </div>
      </div>

      {/* Mini Bottom Controls */}
      <div className="px-3 py-2 bg-slate-900/90 border-t border-white/10 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevTrack}
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="បទមុន"
          >
            <SkipBack className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'ផ្អាក' : 'ចាក់'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Direct Stop Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                stop();
              }}
              className="w-7 h-7 rounded-lg bg-rose-500/25 hover:bg-rose-500/40 text-rose-300 flex items-center justify-center transition-all cursor-pointer"
              title="បិទភ្លេង/វីដេអូ (Stop)"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            type="button"
            onClick={nextTrack}
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="បទបន្ទាប់"
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title={isMuted ? 'បើកសំឡេង' : 'បិទសំឡេង'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenFull}
            className="px-2 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-[10px] font-black text-pink-300 flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>ផ្ទាំងធំ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
