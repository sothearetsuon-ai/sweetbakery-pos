import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Disc3, ChevronDown } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { soundFx } from '../../utils/audio';

export const MiniMusicPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    setIsPlayerOpen,
  } = useMusic();

  // On mobile (<768px), default to minimized bubble so it doesn't block screen
  const [isMinimized, setIsMinimized] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const autoCollapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-collapse after 5 seconds of inactivity when expanded on mobile
  const resetAutoCollapseTimer = () => {
    if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
    if (!isMinimized && typeof window !== 'undefined' && window.innerWidth < 768) {
      autoCollapseTimerRef.current = setTimeout(() => {
        setIsMinimized(true);
      }, 5000);
    }
  };

  useEffect(() => {
    resetAutoCollapseTimer();
    return () => {
      if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
    };
  }, [isMinimized, currentTrack?.id, isPlaying]);

  if (!currentTrack) return null;

  // Minimized Compact Floating Bubble (Doesn't block buttons!)
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-3 md:left-[17.5rem] z-20 flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            setIsMinimized(false);
            resetAutoCollapseTimer();
          }}
          className="relative group flex items-center gap-2 p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full border border-pink-500/40 shadow-xl shadow-pink-950/30 backdrop-blur-md cursor-pointer transition-all active:scale-95 hover:scale-105"
          title={`កំពុងចាក់: ${currentTrack.title} (ចុចដើម្បីពង្រីក)`}
        >
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-tr from-pink-600 to-amber-500 flex items-center justify-center shadow-md ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
            style={{ animationDuration: '6s' }}
          >
            <Disc3 className="w-5 h-5 text-white" />
          </div>

          {isPlaying && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          )}

          <span className="hidden sm:inline text-[11px] font-bold text-pink-300 pr-1 truncate max-w-[90px]">
            {currentTrack.title}
          </span>
        </button>
      </div>
    );
  }

  // Expanded Floating Bar with auto-collapse & manual minimize button
  return (
    <div
      onMouseEnter={() => {
        if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
      }}
      onMouseLeave={() => resetAutoCollapseTimer()}
      className="fixed bottom-20 md:bottom-4 left-3 md:left-[17.5rem] z-20 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-2xl border border-pink-500/30 shadow-xl shadow-pink-950/20 max-w-[280px] sm:max-w-[320px] transition-all animate-in fade-in zoom-in duration-200"
    >
      {/* Clickable Area to Open Full Music Modal */}
      <div
        onClick={() => {
          soundFx.playPop();
          setIsPlayerOpen(true);
        }}
        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group"
        title="ចុចដើម្បីបើកម៉ាស៊ីនចាក់ភ្លេងពេញលេញ"
      >
        <div className="relative shrink-0">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-amber-500 flex items-center justify-center shadow-md ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
            style={{ animationDuration: '6s' }}
          >
            <Disc3 className="w-4 h-4 text-white" />
          </div>

          {isPlaying && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          )}
        </div>

        <div className="min-w-0">
          <div className="text-[11px] font-black truncate group-hover:text-pink-400 transition-colors">
            {currentTrack.title}
          </div>
          <div className="text-[9px] text-slate-400 truncate flex items-center gap-1">
            <span>{isPlaying ? 'កំពុងចាក់' : 'បានផ្អាក'}</span>
            <span>•</span>
            <span className="text-pink-400 font-bold">ចុចបើក 🎶</span>
          </div>
        </div>
      </div>

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
          resetAutoCollapseTimer();
        }}
        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
        title={isPlaying ? 'ផ្អាក (Pause)' : 'ចាក់ (Play)'}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-white" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
        )}
      </button>

      {/* Next Track Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          soundFx.playPop();
          nextTrack();
          resetAutoCollapseTimer();
        }}
        className="w-7 h-7 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
        title="បទបន្ទាប់"
      >
        <SkipForward className="w-3.5 h-3.5" />
      </button>

      {/* Minimize Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          soundFx.playPop();
          setIsMinimized(true);
        }}
        className="w-7 h-7 rounded-xl text-slate-400 hover:text-pink-400 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
        title="បង្រួមតូច (Minimize / Hide)"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
};
