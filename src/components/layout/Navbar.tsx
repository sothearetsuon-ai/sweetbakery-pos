import React, { useState, useEffect, useRef } from 'react';
import {
  Cake,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Crown,
  Settings,
  QrCode,
  ChevronDown,
  Smartphone,
  Menu,
  Music,
  Cloud,
  Bell,
  Wifi,
  WifiOff,
  Palette,
  Key,
  Link as LinkIcon,
  RefreshCw,
  FlaskConical,
  LogOut,
  Phone,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { useMusic } from '../../context/MusicContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { getProductImageUrl } from '../../utils/imagePath';
import { KhqrStandeeModal } from '../pos/KhqrStandeeModal';
import { SwitchStaffModal } from '../staff/SwitchStaffModal';
import { StaffDropdown } from '../staff/StaffDropdown';
import { MobileConnectModal } from './MobileConnectModal';
import { SettingsTab } from '../settings/SettingsModal';
import { AppTheme } from '../../utils/themeManager';

interface NavbarProps {
  onOpenShiftModal: () => void;
  onOpenSettingsModal: (tab?: SettingsTab) => void;
  onOpenStaffTab?: () => void;
  onToggleMobileDrawer?: () => void;
  onOpenThemePicker?: () => void;
  currentTheme?: AppTheme;
  isSuperAdmin?: boolean;
  onOpenSuperAdminPortal?: () => void;
  onOpenCustomerOrderLinkModal?: () => void;
  onOpenContact?: () => void;
  isButterflyEnabled?: boolean;
  onToggleButterfly?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenShiftModal,
  onOpenSettingsModal,
  onOpenStaffTab,
  onToggleMobileDrawer,
  onOpenThemePicker,
  currentTheme,
  isSuperAdmin = false,
  onOpenSuperAdminPortal,
  onOpenCustomerOrderLinkModal,
  onOpenContact,
  isButterflyEnabled = true,
  onToggleButterfly,
}) => {
  const {
    lang,
    setLang,
    exchangeRate,
    lowStockCount,
    currentShift,
    storeInfo,
    currentStaff,
    isFirebaseConnected,
    offlineSyncStatus,
    pendingSyncCount,
    triggerAutoCloudSync,
    lanSyncStatus,
    forceSyncLan,
    isDemoMode,
    enterDemoMode,
    exitDemoMode,
    requestExitDemoMode,
    logoutAndLock,
    demoDevicesCount,
  } = useBakery();
  const { isPlaying: isMusicPlaying, setIsPlayerOpen: setIsMusicPlayerOpen } = useMusic();
  const text = t[lang];

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isStandeeOpen, setIsStandeeOpen] = useState(false);
  const [isSwitchStaffOpen, setIsSwitchStaffOpen] = useState(false);
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [isMobileConnectOpen, setIsMobileConnectOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const quickToolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickToolsRef.current && !quickToolsRef.current.contains(e.target as Node)) {
        setIsQuickToolsOpen(false);
      }
    };
    if (isQuickToolsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isQuickToolsOpen]);

  // Live real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playPop();
  };

  // Time format
  const hours = currentTime.getHours();
  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const greetingKh =
    hours < 12
      ? 'អរុណសួស្តី 🍰 កំពុងដុតនំស្រស់ៗពេលព្រឹក'
      : hours < 18
      ? 'ទិវាសួស្តី 🎂 នំខេកត្រជាក់ចិត្តពេលរសៀល'
      : 'សាយណ្ហសួស្តី 🧁 ត្រៀមប្រគល់នំកុម្ម៉ង់ជូនភ្ញៀវ';

  const greetingEn =
    hours < 12
      ? 'Good Morning 🍰 Fresh pastries in oven'
      : hours < 18
      ? 'Good Afternoon 🎂 Sweet cakes & coffee ready'
      : 'Good Evening 🧁 Ready for cake pickups';

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#F2DBD3] sticky top-0 z-40 px-2 sm:px-6 py-2 sm:py-2.5 shadow-xs shrink-0">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Side: Mobile Hamburger Menu + Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3.5 min-w-0 flex-1">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={onToggleMobileDrawer}
            className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-white border border-[#EADBCE] text-slate-700 flex items-center justify-center hover:bg-[#FFF5F2] active:scale-95 shadow-2xs cursor-pointer shrink-0"
            title="បើកម៉ឺនុយចម្បង"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
          </button>

          {/* Brand with vibrant luxury look */}
          <div
            onClick={() => {
              soundFx.playPop();
              onOpenSettingsModal();
            }}
            className="flex items-center gap-1.5 sm:gap-3.5 cursor-pointer group min-w-0 flex-1"
            title="ចុចដើម្បីកំណត់ឈ្មោះហាង & Logo (Settings)"
          >
            <div className="relative group shrink-0">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#FF6F68] via-[#E6514D] to-[#361B14] p-0.5 shadow-md shadow-[#E6514D]/25 transition-transform duration-300 group-hover:scale-105 overflow-hidden">
                {storeInfo.logoUrl ? (
                  <img
                    src={getProductImageUrl(storeInfo.logoUrl)}
                    alt={storeInfo.nameKh}
                    className="w-full h-full object-cover rounded-[10px] bg-white"
                  />
                ) : (
                  <div className="w-full h-full bg-white/15 backdrop-blur-xs rounded-[10px] flex items-center justify-center text-white">
                    <Cake className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-float" />
                  </div>
                )}
              </div>
              <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-0.5 rounded-full shadow-xs">
                <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h1 className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-900 flex items-center gap-1 min-w-0">
                  <span className="truncate font-battambang">
                    {lang === 'km' ? storeInfo.nameKh : storeInfo.nameEn}
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6514D] via-[#FF6F68] to-amber-600 font-black text-xs sm:text-sm shrink-0">
                    POS
                  </span>
                </h1>
                <span className="hidden sm:inline-block text-[9px] uppercase font-black tracking-wider bg-gradient-to-r from-[#E6514D] to-[#FF6F68] text-white px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                  PRO ★
                </span>
              </div>
              <p className="hidden md:flex text-[11px] text-slate-500 items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#D43D39]">
                  {lang === 'km' ? greetingKh : greetingEn}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Clean & Consolidated Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 justify-end">
          {/* 1. Unified Cloud Auto-Sync & Status Indicator (Single Clean Pill) */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              triggerAutoCloudSync();
            }}
            className={`flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs ${
              !isOnline || offlineSyncStatus === 'offline'
                ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                : offlineSyncStatus === 'syncing'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : pendingSyncCount > 0
                ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
            title={
              !isOnline
                ? `កំពុង Offline (${pendingSyncCount} ទិន្នន័យរង់ចាំ Auto Sync)`
                : offlineSyncStatus === 'syncing'
                ? 'កំពុងធ្វើសមកាលកម្មទិន្នន័យទៅ Cloud...'
                : pendingSyncCount > 0
                ? `${pendingSyncCount} ទិន្នន័យរង់ចាំ Sync (ចុចដើម្បី Sync)`
                : 'Google Cloud Live (ចុចដើម្បី Sync)'
            }
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Offline {pendingSyncCount > 0 ? `(${pendingSyncCount})` : ''}</span>
              </>
            ) : offlineSyncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span className="hidden sm:inline">Syncing...</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline text-[11px]">Cloud Live</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </>
            )}
          </button>

          {/* 2. Unified Quick Tools & Features Menu Dropdown (All Small Buttons Grouped Here) */}
          <div className="relative" ref={quickToolsRef}>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsQuickToolsOpen((prev) => !prev);
              }}
              title="ឧបករណ៍ និងមុខងារបន្ថែមទាំងអស់ (All Tools & Features)"
              className={`relative flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border text-xs font-black transition-all shadow-2xs cursor-pointer active:scale-95 ${
                isQuickToolsOpen
                  ? 'bg-pink-600 text-white border-pink-700 shadow-md shadow-pink-600/20 ring-2 ring-pink-300'
                  : isDemoMode
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isQuickToolsOpen ? 'text-white' : 'text-pink-600'} animate-pulse`} />
              <span className="hidden sm:inline font-battambang">ឧបករណ៍</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isQuickToolsOpen ? 'rotate-180 text-white' : 'text-slate-400'
                }`}
              />

              {/* Notification Badge if low stock or demo active */}
              {(lowStockCount > 0 || isDemoMode) && (
                <span
                  className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black border border-white shadow-xs ${
                    lowStockCount > 0 ? 'bg-rose-500 text-white animate-bounce' : 'bg-amber-500 text-white'
                  }`}
                >
                  {lowStockCount > 0 ? lowStockCount : 'Demo'}
                </span>
              )}
            </button>

            {/* Comprehensive Quick Tools Dropdown */}
            {isQuickToolsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-rose-100 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto space-y-2">
                {/* Header: Live Clock & Exchange Rate */}
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-pink-950 text-white space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin-slow" />
                      <span>{timeString}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickToolsOpen(false);
                        onOpenSettingsModal('store');
                      }}
                      className="px-2 py-0.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title="អត្រាប្តូរប្រាក់ (ចុចដើម្បីកែប្រែ)"
                    >
                      <span>$1 =</span>
                      <span>{exchangeRate.toLocaleString()}៛</span>
                    </button>
                  </div>

                  {/* Low Stock Notification in Dropdown Header */}
                  {lowStockCount > 0 && (
                    <div
                      onClick={() => {
                        setIsQuickToolsOpen(false);
                        onOpenSettingsModal();
                      }}
                      className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-between cursor-pointer hover:bg-rose-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                        <span>ទំនិញជិតអស់ស្តុក៖</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-black">
                        {lowStockCount} មុខ
                      </span>
                    </div>
                  )}
                </div>

                {/* Main Tools & Quick Action Items */}
                <div className="space-y-1">
                  {/* 1. KHQR Counter Standee */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setIsQuickToolsOpen(false);
                      setIsStandeeOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-red-50 text-slate-800 transition-colors cursor-pointer group text-left border border-transparent hover:border-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-red-600">
                          ផ្ទាំង KHQR លើតុគិតប្រាក់
                        </div>
                        <div className="text-[10px] text-slate-400">
                          បង្ហាញ QR ធំជូនភ្ញៀវ Scan បង់ប្រាក់
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      KHQR
                    </span>
                  </button>

                  {/* 2. Customer Self-Ordering Link & QR */}
                  {onOpenCustomerOrderLinkModal && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setIsQuickToolsOpen(false);
                        onOpenCustomerOrderLinkModal();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-pink-50 text-slate-800 transition-colors cursor-pointer group text-left border border-transparent hover:border-pink-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-800 group-hover:text-pink-600">
                            លីងកុម្ម៉ង់សម្រាប់ភ្ញៀវ & QR
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ភ្ញៀវស្កេនមើលមុខម្ហូប & កុម្ម៉ង់ខ្លួនឯង
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                        Self-Order
                      </span>
                    </button>
                  )}

                  {/* 3. Demo Sandbox Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setIsQuickToolsOpen(false);
                      if (isDemoMode) {
                        requestExitDemoMode();
                      } else {
                        enterDemoMode();
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-colors cursor-pointer group text-left border ${
                      isDemoMode
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'hover:bg-amber-50/50 border-transparent hover:border-amber-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0 ${
                          isDemoMode ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black group-hover:text-amber-700">
                          របៀបសាកល្បង (Demo Sandbox)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isDemoMode ? 'កំពុងស្ថិតក្នុងរបៀបសាកល្បង' : 'សាកល្បងលក់ដោយមិនប៉ះពាល់ទិន្នន័យពិត'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isDemoMode
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isDemoMode ? 'កំពុងបើក' : 'បិទ'}
                    </span>
                  </button>

                  {/* 4. Flying Butterflies Effect Toggle */}
                  {onToggleButterfly && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        onToggleButterfly();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-purple-50 text-slate-800 transition-colors cursor-pointer group text-left border border-transparent hover:border-purple-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0 text-base">
                          🦋
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-800 group-hover:text-purple-700">
                            សត្វមេអំបៅហើរលើអេក្រង់
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Animation មេអំបៅហើរលើផ្ទាំង POS
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isButterflyEnabled
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isButterflyEnabled ? 'បើក (ON)' : 'បិទ (OFF)'}
                      </span>
                    </button>
                  )}

                  {/* 5. Music Player / Bakery Jukebox */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickToolsOpen(false);
                      setIsMusicPlayerOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-pink-50 text-slate-800 transition-colors cursor-pointer group text-left border border-transparent hover:border-pink-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-pink-600 flex items-center gap-1">
                          <span>ម៉ាស៊ីនចាក់ភ្លេងហាងនំ</span>
                          {isMusicPlaying && <span className="animate-spin text-xs">🎵</span>}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ចាក់ចម្រៀងកំដរហាង, បទខួបកំណើត & URL
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      Jukebox
                    </span>
                  </button>

                  {/* 6. Theme Picker */}
                  {onOpenThemePicker && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickToolsOpen(false);
                        onOpenThemePicker();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-pink-50 text-slate-800 transition-colors cursor-pointer group text-left border border-transparent hover:border-pink-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0 text-base">
                          {currentTheme?.emoji || '🎨'}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-800 group-hover:text-pink-600">
                            ពណ៌ផ្ទៃ & Theme រដូវកាល
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ប្ដូររូបរាង & ពណ៌កម្មវិធី
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-battambang">
                        {currentTheme?.nameKh?.split(' ')[0] || 'Theme'}
                      </span>
                    </button>
                  )}

                  {/* 7. Mobile Staff Connect */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickToolsOpen(false);
                      setIsMobileConnectOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-purple-50 text-slate-800 transition-colors cursor-pointer group text-left border border-transparent hover:border-purple-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-purple-600">
                          ទូរស័ព្ទបុគ្គលិក / QR Connect
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ភ្ជាប់ទូរស័ព្ទប្រើជាម៉ាស៊ីន POS
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      Mobile
                    </span>
                  </button>

                  {/* 8. Notifications */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickToolsOpen(false);
                      onOpenSettingsModal('notifications');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group text-left border border-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          ការដាស់តឿនលើទូរសព្ទ
                        </div>
                        <div className="text-[10px] text-slate-400">
                          កំណត់ម៉ោងរំលឹកចំណាយ & នំកុម្ម៉ង់
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 text-xs">🔔</span>
                  </button>

                  {/* 9. Sound FX Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleSound();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group text-left border border-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          សំឡេងកម្មវិធី (Sound FX)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          សម្លេងចុចប៊ូតុង & គិតប្រាក់
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        soundEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {soundEnabled ? 'បើក' : 'បិទ'}
                    </span>
                  </button>

                  {/* 10. Store Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickToolsOpen(false);
                      onOpenSettingsModal();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group text-left border border-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          ការកំណត់ហាង (Settings)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ឈ្មោះហាង, វិក្កយបត្រ, Cloud & ស្តុក
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 text-xs">⚙️</span>
                  </button>

                  {/* 11. System Contact in Demo */}
                  {onOpenContact && isDemoMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickToolsOpen(false);
                        onOpenContact();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors cursor-pointer group text-left border border-emerald-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-emerald-900">
                            ទំនាក់ទំនងប្រព័ន្ធ
                          </div>
                          <div className="text-[10px] text-emerald-700">
                            លេខទូរស័ព្ទ៖ 012 629 160
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
                        012 629 160
                      </span>
                    </button>
                  )}

                  {/* 12. Super Admin Portal */}
                  {isSuperAdmin && onOpenSuperAdminPortal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickToolsOpen(false);
                        onOpenSuperAdminPortal();
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors cursor-pointer text-left border border-amber-200"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-amber-900">
                          Super Admin Portal 👑
                        </div>
                        <div className="text-[10px] text-amber-700">
                          គ្រប់គ្រង License & សោប្រព័ន្ធ
                        </div>
                      </div>
                    </button>
                  )}

                  {/* 13. Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickToolsOpen(false);
                      if (window.confirm(`តើអ្នកពិតជាចង់ចាកចេញពីគណនី «${currentStaff.name}» និងចាក់សោប្រព័ន្ធមែនទេ?`)) {
                        logoutAndLock();
                      }
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer text-left border border-rose-100 mt-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-rose-800">
                        ចាកចេញពីគណនី (Logout) 🚪
                      </div>
                      <div className="text-[10px] text-rose-600">
                        ចាក់សោប្រព័ន្ធ & ប្ដូរបុគ្គលិក
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Staff Button with Dropdown (ALWAYS VISIBLE) */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playPop();
                setIsStaffDropdownOpen((prev) => !prev);
              }}
              title="ចុចដើម្បីប្តូរគណនីបុគ្គលិក / វាយលេខកូដ PIN 4 ខ្ទង់"
              className={`flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border text-xs font-bold shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer group ${
                isStaffDropdownOpen
                  ? 'bg-purple-100 border-purple-400 text-purple-950 ring-2 ring-purple-300/40'
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/80 hover:border-purple-400 text-purple-900'
              }`}
            >
              <span className="text-base group-hover:scale-110 transition-transform">
                {currentStaff.avatar || '👤'}
              </span>
              <div className="text-left hidden md:block max-w-[80px] lg:max-w-[100px] truncate">
                <span className="font-black text-slate-800 leading-tight block truncate">
                  {currentStaff.name}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-purple-600 transition-transform duration-200 hidden sm:inline ${
                  isStaffDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Top Dropdown Menu */}
            <StaffDropdown
              isOpen={isStaffDropdownOpen}
              onClose={() => setIsStaffDropdownOpen(false)}
              onOpenStaffManagement={isDemoMode ? undefined : onOpenStaffTab}
            />
          </div>

          {/* Shift Status Button (Tablet & Desktop only - accessible on mobile via Drawer) */}
          <button
            onClick={onOpenShiftModal}
            title={currentShift?.status === 'OPEN' ? `វេនលក់កំពុងបើក៖ ${currentShift.cashierName}` : 'វេនលក់ត្រូវបានបិទ (ចុចដើម្បីបើកវេន)'}
            className={`hidden sm:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all shadow-2xs shrink-0 cursor-pointer active:scale-95 ${
              currentShift?.status === 'OPEN'
                ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 shadow-emerald-500/20'
                : 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-rose-500/20'
            }`}
          >
            {currentShift?.status === 'OPEN' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {currentShift?.status === 'OPEN' ? 'វេនបើក' : text.shiftClosed}
            </span>
          </button>

          {/* Language Switcher (Compact Flag on mobile, full on tablet/desktop) */}
          <div className="flex items-center bg-white/90 p-0.5 rounded-xl sm:rounded-2xl border border-rose-100 shadow-2xs shrink-0">
            {/* Mobile Single Tap Toggle Flag */}
            <button
              onClick={() => {
                setLang(lang === 'km' ? 'en' : 'km');
                soundFx.playPop();
              }}
              title={lang === 'km' ? 'ប្តូរទៅ English' : 'ប្តូរទៅ ភាសាខ្មែរ'}
              className="sm:hidden px-1.5 py-1 text-xs font-bold transition-all flex items-center gap-0.5 cursor-pointer bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-lg shadow-xs"
            >
              <span>{lang === 'km' ? '🇰🇭' : '🇬🇧'}</span>
              <span className="text-[9px] uppercase font-black">{lang === 'km' ? 'KH' : 'EN'}</span>
            </button>

            {/* Desktop Two-Button Selector */}
            <div className="hidden sm:flex items-center">
              <button
                onClick={() => {
                  setLang('km');
                  soundFx.playPop();
                }}
                title="ភាសាខ្មែរ"
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  lang === 'km'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇰🇭</span>
                <span className="text-[11px]">ខ្មែរ</span>
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  soundFx.playPop();
                }}
                title="English"
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇬🇧</span>
                <span className="text-[11px]">EN</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Connect QR Modal */}
      <MobileConnectModal
        isOpen={isMobileConnectOpen}
        onClose={() => setIsMobileConnectOpen(false)}
      />

      {/* Standee Modal for Counter display */}
      <KhqrStandeeModal
        isOpen={isStandeeOpen}
        onClose={() => setIsStandeeOpen(false)}
      />

      {/* Staff Switcher PIN Modal */}
      <SwitchStaffModal
        isOpen={isSwitchStaffOpen}
        onClose={() => setIsSwitchStaffOpen(false)}
      />
    </header>
  );
};
