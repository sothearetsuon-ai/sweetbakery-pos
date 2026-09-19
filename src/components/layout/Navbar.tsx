import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { useMusic } from '../../context/MusicContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { KhqrStandeeModal } from '../pos/KhqrStandeeModal';
import { SwitchStaffModal } from '../staff/SwitchStaffModal';
import { StaffDropdown } from '../staff/StaffDropdown';
import { MobileConnectModal } from './MobileConnectModal';
import { SettingsTab } from '../settings/SettingsModal';

interface NavbarProps {
  onOpenShiftModal: () => void;
  onOpenSettingsModal: (tab?: SettingsTab) => void;
  onOpenStaffTab?: () => void;
  onToggleMobileDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenShiftModal,
  onOpenSettingsModal,
  onOpenStaffTab,
  onToggleMobileDrawer,
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
  } = useBakery();
  const { isPlaying: isMusicPlaying, setIsPlayerOpen: setIsMusicPlayerOpen } = useMusic();
  const text = t[lang];

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isStandeeOpen, setIsStandeeOpen] = useState(false);
  const [isSwitchStaffOpen, setIsSwitchStaffOpen] = useState(false);
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [isMobileConnectOpen, setIsMobileConnectOpen] = useState(false);

  // Live real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Mobile Hamburger Menu + Brand */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={onToggleMobileDrawer}
            className="md:hidden w-9 h-9 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 active:scale-95 shadow-2xs cursor-pointer"
            title="បើកម៉ឺនុយចម្បង"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          {/* Brand with vibrant luxury look */}
          <div
            onClick={() => {
              soundFx.playPop();
              onOpenSettingsModal();
            }}
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group"
            title="ចុចដើម្បីកំណត់ឈ្មោះហាង & Logo (Settings)"
          >
            <div className="relative group shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-pink-500/25 transition-transform duration-300 group-hover:scale-105 overflow-hidden">
                {storeInfo.logoUrl ? (
                  <img
                    src={storeInfo.logoUrl}
                    alt={storeInfo.nameKh}
                    className="w-full h-full object-cover rounded-[14px] bg-white"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 backdrop-blur-xs rounded-[14px] flex items-center justify-center text-white">
                    <Cake className="w-5 h-5 sm:w-6 sm:h-6 animate-float" />
                  </div>
                )}
              </div>
              <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-0.5 rounded-full shadow-xs">
                <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  <span className="max-w-[120px] sm:max-w-none truncate">
                    {lang === 'km' ? storeInfo.nameKh : storeInfo.nameEn}
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600">
                    POS
                  </span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-wider bg-gradient-to-r from-rose-600 to-pink-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  PRO ★
                </span>
              </div>
              <p className="hidden md:flex text-xs text-slate-600 items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-rose-700">
                  {lang === 'km' ? greetingKh : greetingEn}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Live Clock & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Live Digital Clock */}
          <div className="hidden lg:flex items-center gap-2 bg-white border border-slate-200/90 px-3 py-1.5 rounded-2xl text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
            <span className="font-mono font-black text-slate-800">{timeString}</span>
          </div>

          {/* Exchange Rate Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 px-3 py-1.5 rounded-2xl text-xs shadow-2xs">
            <span className="text-amber-800 font-bold">{text.exchangeRateLabel}:</span>
            <strong className="text-amber-950 font-black">$1 = {exchangeRate.toLocaleString()} ៛</strong>
          </div>

          {/* Low Stock Badge */}
          {lowStockCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-2xl text-xs font-bold shadow-2xs animate-bounce">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>{lowStockCount} គ្រឿងផ្សំជិតអស់!</span>
            </div>
          )}

          {/* Sound Toggle (Desktop/Tablet) */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'បិទសំឡេង (Mute)' : 'បើកសំឡេង (Unmute)'}
            className={`hidden sm:flex w-9 h-9 rounded-2xl border items-center justify-center transition-all ${
              soundEnabled
                ? 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100 shadow-2xs'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Counter KHQR Standee Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              setIsStandeeOpen(true);
            }}
            title="បង្ហាញផ្ទាំង KHQR លើតុគិតប្រាក់ (Counter Standee)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black shadow-md shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <QrCode className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">KHQR លើតុ</span>
          </button>

          {/* Bakery Music Player Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setIsMusicPlayerOpen(true);
            }}
            title="ម៉ាស៊ីនចាក់ភ្លេងហាងនំ (Bakery Music Player & Upload)"
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-2xs border cursor-pointer active:scale-95 ${
              isMusicPlaying
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white border-pink-500 shadow-pink-500/25'
                : 'bg-white border-slate-200/80 hover:bg-pink-50 hover:border-pink-300 text-slate-700 hover:text-pink-600'
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${isMusicPlaying ? 'text-white animate-bounce' : 'text-pink-500'}`} />
            <span className="hidden md:inline">ភ្លេងហាងនំ</span>
            {isMusicPlaying && (
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-white rounded-full animate-pulse" />
                <span className="w-0.5 h-3 bg-white rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-white rounded-full animate-pulse delay-150" />
              </span>
            )}
          </button>

          {/* Cloud Sync Status Indicator */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenSettingsModal('firebase');
            }}
            title={
              isFirebaseConnected
                ? '🟢 បានភ្ជាប់ Google Firebase Cloud (ទិន្នន័យ Live Sync គ្រប់ឧបករណ៍)'
                : '⚪ Google Firebase Cloud Sync (ចុចទីនេះដើម្បីភ្ជាប់)'
            }
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-2xl text-xs font-black transition-all border shadow-2xs cursor-pointer active:scale-95 ${
              isFirebaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Cloud
              className={`w-3.5 h-3.5 ${
                isFirebaseConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
              }`}
            />
            <span className="hidden lg:inline text-[11px]">
              {isFirebaseConnected ? 'Cloud Live' : 'Cloud'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isFirebaseConnected ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'
              }`}
            />
          </button>

          {/* Push Notification & Reminder Settings Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenSettingsModal('notifications');
            }}
            title="ការដាស់តឿនលើទូរសព្ទ (Staff Reminders & Push Notifications)"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl border border-slate-200/80 bg-white hover:bg-pink-50 hover:border-pink-300 text-slate-600 hover:text-pink-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer relative"
          >
            <Bell className="w-4 h-4 text-pink-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              onOpenSettingsModal();
            }}
            title="កំណត់ឈ្មោះហាង Logo និងរូបិយប័ណ្ណ (Store Settings)"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl border border-slate-200/80 bg-white hover:bg-pink-50 hover:border-pink-300 text-slate-600 hover:text-pink-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Active Staff Button with Dropdown right at the top */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playPop();
                setIsStaffDropdownOpen((prev) => !prev);
              }}
              title="ចុចដើម្បីប្តូរគណនីបុគ្គលិក / វាយលេខកូដ PIN 4 ខ្ទង់"
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-2xl border text-xs font-bold shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer group ${
                isStaffDropdownOpen
                  ? 'bg-purple-100 border-purple-400 text-purple-950 ring-2 ring-purple-300/40'
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/80 hover:border-purple-400 text-purple-900'
              }`}
            >
              <span className="text-base group-hover:scale-110 transition-transform">
                {currentStaff.avatar || '👤'}
              </span>
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5 font-black text-slate-800 leading-tight">
                  <span>{currentStaff.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-600 text-white rounded-md font-medium">
                    {currentStaff.role}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-purple-600 transition-transform duration-200 ${
                  isStaffDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Top Dropdown Menu */}
            <StaffDropdown
              isOpen={isStaffDropdownOpen}
              onClose={() => setIsStaffDropdownOpen(false)}
              onOpenStaffManagement={onOpenStaffTab}
            />
          </div>

          {/* Mobile Connect Button (Shown only on Desktop/Tablet) */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setIsMobileConnectOpen(true);
            }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border border-purple-200/80 rounded-2xl text-xs font-black transition-all shadow-2xs cursor-pointer active:scale-95"
            title="ភ្ជាប់ទូរស័ព្ទដៃបុគ្គលិក (Mobile Phone Connect)"
          >
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span>ទូរស័ព្ទបុគ្គលិក 📱</span>
          </button>

          {/* Shift Status Button */}
          <button
            onClick={onOpenShiftModal}
            className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl text-xs font-bold border transition-all shadow-2xs shrink-0 ${
              currentShift?.status === 'OPEN'
                ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 shadow-emerald-500/20'
                : 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-rose-500/20'
            }`}
          >
            {currentShift?.status === 'OPEN' ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="hidden sm:inline max-w-[130px] truncate">
              {currentShift?.status === 'OPEN' ? currentShift.cashierName : text.shiftClosed}
            </span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-white/90 p-0.5 sm:p-1 rounded-2xl border border-rose-100 shadow-2xs shrink-0">
            <button
              onClick={() => {
                setLang('km');
                soundFx.playPop();
              }}
              className={`px-2 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                lang === 'km'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇰🇭</span>
              <span className="hidden sm:inline">ខ្មែរ</span>
            </button>
            <button
              onClick={() => {
                setLang('en');
                soundFx.playPop();
              }}
              className={`px-2 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                lang === 'en'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇬🇧</span>
              <span className="hidden sm:inline">EN</span>
            </button>
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
