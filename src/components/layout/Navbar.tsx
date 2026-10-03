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
    <header className="bg-white/95 backdrop-blur-md border-b border-[#F2DBD3] sticky top-0 z-40 px-2 sm:px-6 py-2 sm:py-2.5 shadow-xs">
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

          {/* Festival Season Pill */}
          {currentTheme?.category === 'festival' && currentTheme.seasonTagKh && (
            <div
              onClick={onOpenThemePicker}
              className={`hidden 2xl:flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-bold border shadow-2xs cursor-pointer transition-all hover:scale-105 font-battambang ${currentTheme.badgeClass}`}
              title="ចុចដើម្បីប្តូរ Theme រដូវកាលពិធីបុណ្យ"
            >
              <span className="text-sm animate-bounce">{currentTheme.ambientMotif || currentTheme.emoji}</span>
              <span>{currentTheme.seasonTagKh}</span>
            </div>
          )}

          {/* Low Stock Badge (Compact) */}
          {lowStockCount > 0 && (
            <div className="hidden lg:flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-2xl text-[11px] font-bold shadow-2xs animate-bounce">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>{lowStockCount} អស់ស្តុក!</span>
            </div>
          )}
        </div>

        {/* Right Side: Live Clock & Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 justify-end">
          {/* Live Digital Clock (Large screens only) */}
          <div className="hidden 2xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-2.5 py-1 rounded-2xl text-xs shadow-2xs font-mono font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
            <span>{timeString}</span>
          </div>

          {/* Exchange Rate Badge (Compact - Large screens only) */}
          <div
            onClick={() => onOpenSettingsModal('store')}
            title="អត្រាប្តូរប្រាក់ (ចុចដើម្បីកែប្រែ)"
            className="hidden xl:flex items-center gap-1 bg-amber-50/80 border border-amber-200 px-2 py-1 rounded-2xl text-xs shadow-2xs text-amber-900 font-black cursor-pointer hover:bg-amber-100 transition-all active:scale-95"
          >
            <span className="text-amber-700 text-[11px]">$1 =</span>
            <span>{exchangeRate.toLocaleString()}៛</span>
          </div>

          {/* Unified Cloud Auto-Sync & Status Indicator (Single Pill) */}
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
                : 'Google Cloud Live (ចុចដើម្បី Re-Sync / Settings)'
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

          {/* Demo Sandbox Mode Quick Toggle */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              if (isDemoMode) {
                requestExitDemoMode();
              } else {
                if (window.confirm('តើអ្នកចង់បើករបៀបសាកល្បង (Demo Sandbox Mode) មែនទេ? \n\n✨ រាល់ការលក់ បញ្ចូលនំ ឬកែប្រែទិន្នន័យ នឹងត្រូវបានញែកដាច់ដោយឡែក ហើយមិនប៉ះពាល់ទិន្នន័យជាក់ស្តែងរបស់ហាងឡើយ!')) {
                  enterDemoMode();
                }
              }
            }}
            title={
              isDemoMode
                ? `🧪 កំពុងស្ថិតក្នុង Demo Sandbox Mode (ឧបករណ៍សាកល្បងសរុប៖ ${demoDevicesCount} គ្រឿង - ចុចដើម្បីចាកចេញ)`
                : `🧪 បើករបៀបសាកល្បង Demo (ឧបករណ៍បានចូលសាកល្បងសរុប៖ ${demoDevicesCount} គ្រឿង)`
            }
            className={`flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl text-xs font-black transition-all border shadow-2xs cursor-pointer active:scale-95 ${
              isDemoMode
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-300 animate-pulse'
                : 'bg-amber-50/90 text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
            }`}
          >
            <FlaskConical className={`w-3.5 h-3.5 ${isDemoMode ? 'text-white' : 'text-amber-600'}`} />
            <span className="hidden sm:inline">{isDemoMode ? 'Demo សកម្ម' : '🧪 Demo'}</span>
            {demoDevicesCount > 0 && (
              <span className={`text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isDemoMode ? 'bg-white/30 text-white' : 'bg-amber-200/80 text-amber-950'
              }`}>
                {demoDevicesCount}
              </span>
            )}
          </button>

          {/* Quick Counter KHQR Standee Button (Tablet & Desktop only) */}
          <button
            onClick={() => {
              soundFx.playPop();
              setIsStandeeOpen(true);
            }}
            title="បង្ហាញផ្ទាំង KHQR លើតុគិតប្រាក់ (Counter Standee)"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>KHQR</span>
          </button>

          {/* Customer Order Link & QR Button */}
          {onOpenCustomerOrderLinkModal && (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onOpenCustomerOrderLinkModal();
              }}
              title="លីងកុម្ម៉ង់សម្រាប់ភ្ញៀវ (Customer Self-Ordering Link & QR)"
              className="hidden 2xl:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">លីងភ្ញៀវ</span>
            </button>
          )}

          {/* Contact System Button (Accessible on both Desktop and Mobile) */}
          {onOpenContact && (
            <>
              {/* Desktop / Tablet Contact Button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onOpenContact();
                }}
                title="ទំនាក់ទំនងទិញ ឬប្រើប្រាស់ប្រព័ន្ធ (012 629 160)"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer border border-emerald-400/40 shrink-0"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-200" />
                <span>Contact</span>
                <span className="hidden xl:inline text-[11px] font-mono text-emerald-200">012 629 160</span>
              </button>

              {/* Mobile Phone Quick Action Icon */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onOpenContact();
                }}
                title="ទំនាក់ទំនងទិញ ឬប្រើប្រាស់ប្រព័ន្ធ (012 629 160)"
                className="flex sm:hidden p-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs items-center justify-center cursor-pointer border border-emerald-500/40 active:scale-95 shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Direct Settings Shortcut (Laptop/Desktop) */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenSettingsModal();
            }}
            title="ការកំណត់ហាង (Store Settings)"
            className="hidden xl:flex w-8 h-8 rounded-xl items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Quick Tools Dropdown (Consolidated Tools Menu - ALWAYS VISIBLE TO PREVENT OVERFLOW) */}
          <div className="relative" ref={quickToolsRef}>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsQuickToolsOpen((prev) => !prev);
              }}
              title="ឧបករណ៍បន្ថែម (More Tools)"
              className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
                isQuickToolsOpen
                  ? 'bg-pink-100 border-pink-400 text-pink-900'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span className="hidden sm:inline">ឧបករណ៍</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform hidden sm:inline ${isQuickToolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickToolsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                {/* Music */}
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickToolsOpen(false);
                    setIsMusicPlayerOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition-colors text-left cursor-pointer"
                >
                  <Music className="w-4 h-4 text-pink-500" />
                  <span>ម៉ាស៊ីនចាក់ភ្លេងហាងនំ {isMusicPlaying ? '🎵' : ''}</span>
                </button>

                {/* Theme */}
                {onOpenThemePicker && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickToolsOpen(false);
                      onOpenThemePicker();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition-colors text-left cursor-pointer font-battambang"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{currentTheme?.emoji || '🎨'}</span>
                      <span>ពណ៌ផ្ទៃ & Theme</span>
                    </div>
                    <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                      {currentTheme?.nameKh?.split(' ')[0] || 'Theme'}
                    </span>
                  </button>
                )}

                {/* Mobile Connect */}
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickToolsOpen(false);
                    setIsMobileConnectOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors text-left cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  <span>ទូរស័ព្ទបុគ្គលិក / Demo QR 📱</span>
                </button>

                {/* Sound */}
                <button
                  type="button"
                  onClick={() => {
                    toggleSound();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span>សំឡេងកម្មវិធី</span>
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${soundEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {soundEnabled ? 'បើក' : 'បិទ'}
                  </span>
                </button>

                {/* Notifications */}
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickToolsOpen(false);
                    onOpenSettingsModal('notifications');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-pink-500" />
                  <span>ការដាស់តឿនលើទូរសព្ទ 🔔</span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickToolsOpen(false);
                    onOpenSettingsModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>ការកំណត់ហាង ⚙️</span>
                </button>

                {/* Super Admin */}
                {isSuperAdmin && onOpenSuperAdminPortal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickToolsOpen(false);
                      onOpenSuperAdminPortal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors text-left cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>Super Admin 👑</span>
                  </button>
                )}

                {/* System Contact Button */}
                {onOpenContact && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickToolsOpen(false);
                      onOpenContact();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left cursor-pointer border border-emerald-200/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>ទំនាក់ទំនងប្រព័ន្ធ</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded-md border border-emerald-200">
                      012 629 160
                    </span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickToolsOpen(false);
                    if (window.confirm(`តើអ្នកពិតជាចង់ចាកចេញពីគណនី «${currentStaff.name}» និងចាក់សោប្រព័ន្ធមែនទេ?`)) {
                      logoutAndLock();
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors text-left cursor-pointer border-t border-rose-100 mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>ចាកចេញពីគណនី (Logout) 🚪</span>
                </button>
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
