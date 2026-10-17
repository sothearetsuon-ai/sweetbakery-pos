import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, Disc3, ChevronDown, GripVertical, MapPin, X, RotateCcw } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { soundFx } from '../../utils/audio';

export const MINI_PLAYER_POS_STORAGE_KEY = 'bakery_pos_mini_music_pos';

export type PositionPreset = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center';

interface Position {
  x: number;
  y: number;
}

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

  const [position, setPosition] = useState<Position | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(MINI_PLAYER_POS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isPositionMenuOpen, setIsPositionMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoCollapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // References for drag calculation
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
    hasDragged: boolean;
  }>({ startX: 0, startY: 0, elemX: 0, elemY: 0, hasDragged: false });

  // Clamp position within visible screen bounds
  const clampPosition = useCallback((x: number, y: number, elemWidth = 300, elemHeight = 54): Position => {
    if (typeof window === 'undefined') return { x, y };
    const margin = 10;
    const maxX = Math.max(margin, window.innerWidth - elemWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - elemHeight - margin);
    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  }, []);

  // Compute default initial position if not yet placed by user
  useEffect(() => {
    if (position === null && typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const width = isMinimized ? 60 : (isMobile ? 280 : 320);
      const height = isMinimized ? 50 : 54;
      const defaultX = isMobile ? 12 : window.innerWidth - width - 24; // Bottom-right corner by default
      const defaultY = isMobile ? window.innerHeight - 90 : window.innerHeight - 74;
      const clamped = clampPosition(defaultX, defaultY, width, height);
      setPosition(clamped);
    }
  }, [position, clampPosition, isMinimized]);

  // Adjust on window resize so it never goes off-screen
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const width = containerRef.current?.offsetWidth || (isMinimized ? 60 : 300);
        const height = containerRef.current?.offsetHeight || 50;
        return clampPosition(prev.x, prev.y, width, height);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition, isMinimized]);

  // Listen to external reposition events
  useEffect(() => {
    const handleExternalPos = (e: any) => {
      if (e.detail?.preset) {
        moveToPreset(e.detail.preset);
      }
    };
    window.addEventListener('sweetbakery_set_music_pos', handleExternalPos);
    return () => window.removeEventListener('sweetbakery_set_music_pos', handleExternalPos);
  }, [isMinimized, clampPosition]);

  // Move directly to preset corner
  const moveToPreset = (preset: PositionPreset) => {
    if (typeof window === 'undefined') return;
    const width = containerRef.current?.offsetWidth || (isMinimized ? 60 : 300);
    const height = containerRef.current?.offsetHeight || 52;
    let targetX = 16;
    let targetY = window.innerHeight - height - 16;

    if (preset === 'bottom-right') {
      targetX = window.innerWidth - width - 16;
      targetY = window.innerHeight - height - 16;
    } else if (preset === 'bottom-left') {
      targetX = 16;
      targetY = window.innerHeight - height - 16;
    } else if (preset === 'top-right') {
      targetX = window.innerWidth - width - 16;
      targetY = 16;
    } else if (preset === 'top-left') {
      targetX = 16;
      targetY = 16;
    } else if (preset === 'bottom-center') {
      targetX = Math.round((window.innerWidth - width) / 2);
      targetY = window.innerHeight - height - 16;
    }

    const clamped = clampPosition(targetX, targetY, width, height);
    setPosition(clamped);
    try {
      localStorage.setItem(MINI_PLAYER_POS_STORAGE_KEY, JSON.stringify(clamped));
    } catch {}
    soundFx.playPop();
    setIsPositionMenuOpen(false);
  };

  // Auto-collapse after 6 seconds of inactivity when expanded on mobile
  const resetAutoCollapseTimer = useCallback(() => {
    if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
    if (!isMinimized && typeof window !== 'undefined' && window.innerWidth < 768) {
      autoCollapseTimerRef.current = setTimeout(() => {
        setIsMinimized(true);
        setIsPositionMenuOpen(false);
      }, 6000);
    }
  }, [isMinimized]);

  useEffect(() => {
    resetAutoCollapseTimer();
    return () => {
      if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
    };
  }, [isMinimized, currentTrack?.id, isPlaying, resetAutoCollapseTimer]);

  // --- Drag and Drop Handlers (Mouse & Touch) ---
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!position) return;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      elemX: position.x,
      elemY: position.y,
      hasDragged: false,
    };
    setIsDragging(true);
    setIsPositionMenuOpen(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') && !target.closest('.drag-handle')) {
      return;
    }
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') && !target.closest('.drag-handle')) {
      return;
    }
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (clientX: number, clientY: number) => {
      const deltaX = clientX - dragStartRef.current.startX;
      const deltaY = clientY - dragStartRef.current.startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragStartRef.current.hasDragged = true;
      }

      const targetX = dragStartRef.current.elemX + deltaX;
      const targetY = dragStartRef.current.elemY + deltaY;

      const width = containerRef.current?.offsetWidth || (isMinimized ? 60 : 300);
      const height = containerRef.current?.offsetHeight || 50;
      const clamped = clampPosition(targetX, targetY, width, height);

      setPosition(clamped);
    };

    const handleMouseMoveWindow = (e: MouseEvent) => {
      e.preventDefault();
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMoveWindow = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      setPosition((current) => {
        if (current) {
          try {
            localStorage.setItem(MINI_PLAYER_POS_STORAGE_KEY, JSON.stringify(current));
          } catch {
            // ignore
          }
        }
        return current;
      });
    };

    window.addEventListener('mousemove', handleMouseMoveWindow, { passive: false });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMoveWindow, { passive: true });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWindow);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMoveWindow);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging, clampPosition, isMinimized]);

  if (!currentTrack) return null;

  const stylePosition: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }
    : {
        position: 'fixed',
        bottom: '1rem',
        right: '1.5rem',
      };

  // Minimized Compact Floating Bubble (Draggable)
  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        style={stylePosition}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`z-40 flex items-center select-none ${
          isDragging ? 'cursor-grabbing scale-105 transition-none shadow-2xl' : 'cursor-grab transition-all duration-200'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            if (dragStartRef.current.hasDragged) return;
            soundFx.playPop();
            setIsMinimized(false);
            resetAutoCollapseTimer();
          }}
          className="relative group flex items-center gap-2 p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full border border-pink-500/40 shadow-xl shadow-pink-950/30 backdrop-blur-md transition-transform active:scale-95 hover:scale-105"
          title={`កំពុងចាក់: ${currentTrack.title}\n(ចុចដើម្បីពង្រីក | អូសទាញផ្លាស់ទីបាន)`}
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

  // Expanded Floating Bar (Draggable + Preset Position Switcher)
  return (
    <div
      ref={containerRef}
      style={stylePosition}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => {
        if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
      }}
      onMouseLeave={() => resetAutoCollapseTimer()}
      className={`relative z-40 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md text-white pl-2 pr-2.5 py-2 rounded-2xl border border-pink-500/30 shadow-xl shadow-pink-950/20 max-w-[310px] sm:max-w-[360px] select-none ${
        isDragging ? 'cursor-grabbing scale-102 shadow-2xl transition-none border-pink-400' : 'cursor-grab transition-all duration-200'
      }`}
    >
      {/* Position Selector Popup Dropdown */}
      {isPositionMenuOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute bottom-full mb-2 left-0 right-0 bg-slate-900/95 border border-pink-500/40 backdrop-blur-xl rounded-2xl p-2.5 shadow-2xl text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150 z-50"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-300 font-bold text-[11px]">
            <span className="flex items-center gap-1 text-pink-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>ជ្រើសរើសទីតាំងចាក់ភ្លេង៖</span>
            </span>
            <button
              type="button"
              onClick={() => setIsPositionMenuOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => moveToPreset('bottom-right')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-pink-600/30 text-white rounded-xl border border-slate-700/60 hover:border-pink-500/40 text-left flex items-center gap-1.5 font-medium transition-colors"
            >
              <span>↘️</span> ក្រោមស្តាំ (ស្តង់ដារ)
            </button>
            <button
              type="button"
              onClick={() => moveToPreset('bottom-left')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-pink-600/30 text-white rounded-xl border border-slate-700/60 hover:border-pink-500/40 text-left flex items-center gap-1.5 font-medium transition-colors"
            >
              <span>↙️</span> ក្រោមឆ្វេង
            </button>
            <button
              type="button"
              onClick={() => moveToPreset('top-right')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-pink-600/30 text-white rounded-xl border border-slate-700/60 hover:border-pink-500/40 text-left flex items-center gap-1.5 font-medium transition-colors"
            >
              <span>↗️</span> លើស្តាំ
            </button>
            <button
              type="button"
              onClick={() => moveToPreset('top-left')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-pink-600/30 text-white rounded-xl border border-slate-700/60 hover:border-pink-500/40 text-left flex items-center gap-1.5 font-medium transition-colors"
            >
              <span>↖️</span> លើឆ្វេង
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
            <span>💡 ឬចុចអូសទាញដាក់កន្លែងណាស្រេចចិត្ត</span>
            <button
              type="button"
              onClick={() => moveToPreset('bottom-right')}
              className="text-pink-400 hover:underline flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" /> ដើម
            </button>
          </div>
        </div>
      )}

      {/* Drag Handle Indicator */}
      <div
        className="drag-handle text-slate-500 hover:text-pink-400 cursor-grab active:cursor-grabbing p-0.5 -mr-1 flex items-center justify-center shrink-0"
        title="ចុចអូសទាញដាក់ត្រង់ណាដែលចង់បាន (Drag to move)"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Clickable Area to Open Full Music Modal */}
      <div
        onClick={() => {
          if (dragStartRef.current.hasDragged) return;
          soundFx.playPop();
          setIsPlayerOpen(true);
        }}
        className="flex items-center gap-2 min-w-0 cursor-pointer flex-1 group"
        title="ចុចដើម្បីបើកម៉ាស៊ីនចាក់ភ្លេងពេញលេញ (Drag ដើម្បីផ្លាស់ទី)"
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

      {/* Change Position Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          soundFx.playPop();
          setIsPositionMenuOpen((prev) => !prev);
        }}
        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0 ${
          isPositionMenuOpen
            ? 'bg-pink-600 text-white'
            : 'text-slate-400 hover:text-pink-300 hover:bg-white/10'
        }`}
        title="ប្តូរទីតាំង (Reposition Player)"
      >
        <MapPin className="w-3.5 h-3.5" />
      </button>

      {/* Minimize Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          soundFx.playPop();
          setIsMinimized(true);
          setIsPositionMenuOpen(false);
        }}
        className="w-7 h-7 rounded-xl text-slate-400 hover:text-pink-400 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
        title="បង្រួមតូច (Minimize / Hide)"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
};
