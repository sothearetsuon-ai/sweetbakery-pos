import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Disc3,
  GripVertical,
  MapPin,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Heart,
  Clock,
  Sparkles,
  Eye,
  Square,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { soundFx } from '../../utils/audio';

export const MINI_PLAYER_POS_STORAGE_KEY = 'bakery_pos_mini_music_pos';
export const MINI_PLAYER_GLASS_STORAGE_KEY = 'bakery_pos_mini_music_glass';

export type PositionPreset = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center';
export type GlassOpacity = 'ultra' | 'medium' | 'solid';

interface Position {
  x: number;
  y: number;
}

export const MiniMusicPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    stop,
    nextTrack,
    setIsPlayerOpen,
    sleepTimerRemaining,
    favoriteTrackIds,
    toggleFavorite,
  } = useMusic();

  // Glass transparency mode: 'ultra' (35%), 'medium' (60%), 'solid' (85%)
  const [glassMode, setGlassMode] = useState<GlassOpacity>(() => {
    try {
      return (localStorage.getItem(MINI_PLAYER_GLASS_STORAGE_KEY) as GlassOpacity) || 'medium';
    } catch {
      return 'medium';
    }
  });

  // Dynamic Island / Pill Mode (compact mode on mobile)
  const [isPillMode, setIsPillMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  // Dismissed state (allows user to easily close/hide the mini widget)
  const [isDismissed, setIsDismissed] = useState(false);

  // Re-enable if current track changes
  useEffect(() => {
    setIsDismissed(false);
  }, [currentTrack?.id]);

  const [position, setPosition] = useState<Position | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(MINI_PLAYER_POS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const isMobile = window.innerWidth < 768;
          // If on mobile and previously saved y was near the top (< 120), reset to bottom so it never blocks top menu
          if (isMobile && parsed.y < 120) {
            return { x: 12, y: Math.max(120, window.innerHeight - 135) };
          }
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References for drag calculation
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
    hasDragged: boolean;
  }>({ startX: 0, startY: 0, elemX: 0, elemY: 0, hasDragged: false });

  // Clamp position within visible screen bounds
  const clampPosition = useCallback((x: number, y: number, elemWidth = 320, elemHeight = 56): Position => {
    if (typeof window === 'undefined') return { x, y };
    const margin = 8;
    const isMobile = window.innerWidth < 768;
    const minY = isMobile ? 120 : margin; // Never cover the top navbar / search bar on mobile!
    const maxX = Math.max(margin, window.innerWidth - elemWidth - margin);
    const maxY = Math.max(minY, window.innerHeight - elemHeight - (isMobile ? 75 : margin));
    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(minY, y), maxY),
    };
  }, []);

  // Compute default initial position if not yet placed by user
  useEffect(() => {
    if (position === null && typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const width = isPillMode ? 180 : (isMobile ? 290 : 330);
      const height = isPillMode ? 44 : 56;
      const defaultX = isMobile ? 12 : window.innerWidth - width - 20;
      const defaultY = isMobile ? Math.max(120, window.innerHeight - 135) : window.innerHeight - 76;
      const clamped = clampPosition(defaultX, defaultY, width, height);
      setPosition(clamped);
    }
  }, [position, clampPosition, isPillMode]);

  // Adjust on window resize so it never goes off-screen
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const width = containerRef.current?.offsetWidth || (isPillMode ? 180 : 320);
        const height = containerRef.current?.offsetHeight || 56;
        return clampPosition(prev.x, prev.y, width, height);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition, isPillMode]);

  // Cycle Glass Transparency mode
  const cycleGlassMode = () => {
    soundFx.playPop();
    const modes: GlassOpacity[] = ['ultra', 'medium', 'solid'];
    const nextIdx = (modes.indexOf(glassMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setGlassMode(nextMode);
    try {
      localStorage.setItem(MINI_PLAYER_GLASS_STORAGE_KEY, nextMode);
    } catch {}
  };

  // Move directly to preset corner or edge dock
  const moveToPreset = (preset: PositionPreset) => {
    if (typeof window === 'undefined') return;
    const width = containerRef.current?.offsetWidth || (isPillMode ? 180 : 320);
    const height = containerRef.current?.offsetHeight || 56;
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
    setIsMenuOpen(false);
  };

  // Smart snapping to nearest edge on drag release (especially useful on mobile!)
  const snapToNearestEdge = (curX: number, curY: number) => {
    if (typeof window === 'undefined') return;
    const width = containerRef.current?.offsetWidth || (isPillMode ? 180 : 320);
    const height = containerRef.current?.offsetHeight || 56;
    const margin = 12;

    const midScreenX = window.innerWidth / 2;
    // Snap horizontally to left or right if dragged near edges
    let snappedX = curX;
    if (curX < 80) {
      snappedX = margin; // Snap to Left
    } else if (curX > window.innerWidth - width - 80) {
      snappedX = window.innerWidth - width - margin; // Snap to Right
    } else if (Math.abs(curX + width / 2 - midScreenX) < 60) {
      snappedX = Math.round((window.innerWidth - width) / 2); // Snap to Center
    }

    const clamped = clampPosition(snappedX, curY, width, height);
    setPosition(clamped);
    try {
      localStorage.setItem(MINI_PLAYER_POS_STORAGE_KEY, JSON.stringify(clamped));
    } catch {}
  };

  // Touch Drag Handling for Mobile Phones
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      elemX: position?.x || 16,
      elemY: position?.y || 16,
      hasDragged: false,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.startX;
    const dy = touch.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.hasDragged = true;
    }

    const width = containerRef.current?.offsetWidth || 200;
    const height = containerRef.current?.offsetHeight || 56;
    const nextX = dragStartRef.current.elemX + dx;
    const nextY = dragStartRef.current.elemY + dy;

    setPosition(clampPosition(nextX, nextY, width, height));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (position && dragStartRef.current.hasDragged) {
      snapToNearestEdge(position.x, position.y);
    }
  };

  // Mouse Drag Handling for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    e.preventDefault();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX: position?.x || 16,
      elemY: position?.y || 16,
      hasDragged: false,
    };
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragStartRef.current.hasDragged = true;
      }

      const width = containerRef.current?.offsetWidth || 200;
      const height = containerRef.current?.offsetHeight || 56;
      const nextX = dragStartRef.current.elemX + dx;
      const nextY = dragStartRef.current.elemY + dy;

      setPosition(clampPosition(nextX, nextY, width, height));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (position && dragStartRef.current.hasDragged) {
        snapToNearestEdge(position.x, position.y);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (isDismissed || !currentTrack || position === null) return null;

  const isFavorited = favoriteTrackIds.includes(currentTrack.id);

  // Glass styles depending on glassMode
  const glassBackdropClass =
    glassMode === 'ultra'
      ? 'backdrop-blur-xl bg-slate-950/40 border border-white/25 shadow-2xl text-white'
      : glassMode === 'solid'
      ? 'backdrop-blur-2xl bg-slate-950/90 border border-slate-700/80 shadow-2xl text-white'
      : 'backdrop-blur-xl bg-slate-950/65 border border-white/20 shadow-2xl text-white'; // medium default

  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      className={`fixed z-40 select-none transition-shadow ${
        isDragging ? 'cursor-grabbing scale-102 shadow-pink-500/25 ring-2 ring-pink-500/50' : 'cursor-grab'
      }`}
    >
      {/* ============================================================== */}
      {/* COMPACT PILL MODE (Dynamic Island for Mobile)                 */}
      {/* ============================================================== */}
      {isPillMode ? (
        <div
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full ${glassBackdropClass} transition-all duration-300 animate-in fade-in`}
        >
          {/* Rotating Disc & Equalizer */}
          <div
            onClick={() => {
              if (dragStartRef.current.hasDragged) return;
              soundFx.playPop();
              setIsPlayerOpen(true);
            }}
            className="relative cursor-pointer shrink-0"
            title="ចុចដើម្បីបើកផ្ទាំងពេញលេញ"
          >
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-xs ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{ animationDuration: '5s' }}
            >
              <Disc3 className="w-3.5 h-3.5 text-white" />
            </div>
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </div>

          {/* Title & Live Status */}
          <div
            onClick={() => {
              if (dragStartRef.current.hasDragged) return;
              soundFx.playPop();
              setIsPlayerOpen(true);
            }}
            className="cursor-pointer min-w-0 max-w-[110px] xs:max-w-[140px]"
            title={currentTrack.title}
          >
            <div className="text-[11px] font-black truncate leading-tight">
              {currentTrack.title}
            </div>
            <div className="text-[9px] text-pink-300/80 font-bold truncate flex items-center gap-1">
              {isPlaying ? (
                <span className="flex items-center gap-0.5">
                  <span className="inline-block w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="inline-block w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="inline-block w-1 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="ml-0.5">កំពុងចាក់</span>
                </span>
              ) : (
                'បានផ្អាក ⏸️'
              )}
            </div>
          </div>

          {/* Mini Play / Pause */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title={isPlaying ? 'ផ្អាក (Pause)' : 'ចាក់ (Play)'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          {/* Mini Stop Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playPop();
                stop();
              }}
              className="w-7 h-7 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="បិទភ្លេង (Stop)"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          )}

          {/* Expand to Full Mini Bar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playPop();
              setIsPillMode(false);
            }}
            className="w-6 h-6 rounded-full hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="ពង្រីកផ្ទាំងចាក់"
          >
            <Maximize2 className="w-3 h-3" />
          </button>

          {/* Dismiss / Close Pill Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playPop();
              setIsDismissed(true);
            }}
            className="w-6 h-6 rounded-full hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="បិទផ្ទាំងនេះជាបណ្ដោះអាសន្ន"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* ============================================================== */
        /* FULL GLASS MINI BAR MODE                                       */
        /* ============================================================== */
        <div
          className={`flex items-center gap-2 sm:gap-2.5 px-3 py-2 rounded-2xl ${glassBackdropClass} transition-all duration-300 animate-in fade-in min-w-[270px] max-w-[340px]`}
        >
          {/* Drag Handle Indicator */}
          <div
            className="text-slate-400/80 hover:text-pink-400 cursor-grab active:cursor-grabbing p-0.5 -ml-1 flex items-center justify-center shrink-0"
            title="ចុចអូសទាញដាក់កន្លែងណាស្រេចចិត្ត (Drag to move)"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Rotating Disc & Thumbnail */}
          <div
            onClick={() => {
              if (dragStartRef.current.hasDragged) return;
              soundFx.playPop();
              setIsPlayerOpen(true);
            }}
            className="relative cursor-pointer shrink-0 group"
            title="ចុចដើម្បីបើកផ្ទាំងពេញលេញ (Spotify/Apple Style)"
          >
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-md overflow-hidden ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{ animationDuration: '6s' }}
            >
              {currentTrack.thumbnailUrl ? (
                <img
                  src={currentTrack.thumbnailUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Disc3 className="w-5 h-5 text-white" />
              )}
            </div>

            {isPlaying && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            )}
          </div>

          {/* Song Info (Click opens full player) */}
          <div
            onClick={() => {
              if (dragStartRef.current.hasDragged) return;
              soundFx.playPop();
              setIsPlayerOpen(true);
            }}
            className="min-w-0 flex-1 cursor-pointer group"
          >
            <div className="text-[11px] font-black truncate group-hover:text-pink-300 transition-colors">
              {currentTrack.title}
            </div>
            <div className="text-[9px] text-slate-300/80 truncate flex items-center gap-1.5 mt-0.5">
              {isPlaying ? (
                <span className="flex items-center gap-0.5 text-emerald-300 font-bold">
                  <span className="inline-block w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="inline-block w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="inline-block w-1 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="ml-0.5">កំពុងចាក់</span>
                </span>
              ) : (
                <span className="text-slate-400">បានផ្អាក ⏸️</span>
              )}
              {sleepTimerRemaining !== null && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{Math.ceil(sleepTimerRemaining / 60)}m</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Favorite Heart */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(currentTrack.id);
            }}
            className="w-7 h-7 rounded-xl hover:bg-white/15 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title={isFavorited ? 'ដកចេញពីបទចូលចិត្ត' : 'ដាក់ជាបទចូលចិត្ត (Favorite)'}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
              }`}
            />
          </button>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-8 h-8 rounded-xl bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center transition-all shadow-md shadow-pink-600/30 cursor-pointer active:scale-90 shrink-0"
            title={isPlaying ? 'ផ្អាក (Pause)' : 'ចាក់ (Play)'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Direct Stop Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playPop();
                stop();
              }}
              className="w-7 h-7 rounded-xl bg-rose-500/25 hover:bg-rose-500/40 text-rose-300 flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0 border border-rose-500/30"
              title="បិទភ្លេង (Stop Music)"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Next Track */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playPop();
              nextTrack();
            }}
            className="w-7 h-7 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
            title="បទបន្ទាប់ (Next)"
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Corner Preset / Glass Settings Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playPop();
              setIsMenuOpen((prev) => !prev);
            }}
            className="w-6 h-6 rounded-lg hover:bg-white/15 text-slate-300 hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="ប្ដូរទីតាំង និងកម្រិតកញ្ចក់ថ្លា"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>

          {/* Shrink to Pill Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playPop();
              setIsPillMode(true);
            }}
            className="w-6 h-6 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="បង្រួមជាគ្រាប់ថ្នាំតូច (Pill Mode)"
          >
            <Minimize2 className="w-3 h-3" />
          </button>

          {/* Dismiss / Close Mini Bar Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playPop();
              setIsDismissed(true);
            }}
            className="w-6 h-6 rounded-lg hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer shrink-0 ml-0.5"
            title="បិទផ្ទាំងនេះជាបណ្ដោះអាសន្ន"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK POSITION & GLASS SETTINGS POPUP MENU                     */}
      {/* ============================================================== */}
      {isMenuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full mb-2 right-0 sm:left-0 sm:right-auto bg-slate-950/95 backdrop-blur-2xl text-white rounded-2xl border border-white/20 shadow-2xl p-3 w-64 space-y-2.5 animate-in fade-in zoom-in-95 text-xs z-50 font-battambang"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-black text-pink-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ការកំណត់ផ្ទាំងចាក់ភ្លេង</span>
            </span>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Glass Transparency Selector */}
          <div>
            <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-between">
              <span>កម្រិតកញ្ចក់ថ្លា (Glass Translucency)៖</span>
              <span className="text-amber-300 uppercase font-mono font-bold">
                {glassMode === 'ultra' ? 'ថ្លាខ្លាំង 35%' : glassMode === 'medium' ? 'មធ្យម 65%' : 'ក្រាស់ 85%'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setGlassMode('ultra');
                  localStorage.setItem(MINI_PLAYER_GLASS_STORAGE_KEY, 'ultra');
                  soundFx.playPop();
                }}
                className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                  glassMode === 'ultra'
                    ? 'bg-pink-600 border-pink-400 text-white font-black'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                💎 ថ្លាខ្លាំង
              </button>
              <button
                type="button"
                onClick={() => {
                  setGlassMode('medium');
                  localStorage.setItem(MINI_PLAYER_GLASS_STORAGE_KEY, 'medium');
                  soundFx.playPop();
                }}
                className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                  glassMode === 'medium'
                    ? 'bg-pink-600 border-pink-400 text-white font-black'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                🧊 មធ្យម
              </button>
              <button
                type="button"
                onClick={() => {
                  setGlassMode('solid');
                  localStorage.setItem(MINI_PLAYER_GLASS_STORAGE_KEY, 'solid');
                  soundFx.playPop();
                }}
                className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                  glassMode === 'solid'
                    ? 'bg-pink-600 border-pink-400 text-white font-black'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                🌑 ក្រាស់
              </button>
            </div>
          </div>

          {/* Quick Corner Preset Placement */}
          <div>
            <div className="text-[10px] text-slate-400 font-bold mb-1">
              ទីតាំងជ្រុងអេក្រង់ (Corner Presets)៖
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => moveToPreset('bottom-right')}
                className="px-2 py-1.5 bg-white/5 hover:bg-pink-600/30 text-white rounded-xl border border-white/10 text-left flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>↘️</span> ក្រោមស្តាំ (ស្តង់ដារ)
              </button>
              <button
                type="button"
                onClick={() => moveToPreset('bottom-left')}
                className="px-2 py-1.5 bg-white/5 hover:bg-pink-600/30 text-white rounded-xl border border-white/10 text-left flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>↙️</span> ក្រោមឆ្វេង
              </button>
              <button
                type="button"
                onClick={() => moveToPreset('top-right')}
                className="px-2 py-1.5 bg-white/5 hover:bg-pink-600/30 text-white rounded-xl border border-white/10 text-left flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>↗️</span> លើស្តាំ
              </button>
              <button
                type="button"
                onClick={() => moveToPreset('top-left')}
                className="px-2 py-1.5 bg-white/5 hover:bg-pink-600/30 text-white rounded-xl border border-white/10 text-left flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>↖️</span> លើឆ្វេង
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[9px] text-slate-400">
            <span>💡 អាចចុចអូសទាញដាក់ទីណាស្រេចចិត្ត</span>
            <button
              type="button"
              onClick={() => moveToPreset('bottom-right')}
              className="text-pink-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" /> ដើម
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
