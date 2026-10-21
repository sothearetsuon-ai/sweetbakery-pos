import { Phone, Rocket, X } from 'lucide-react';
import React, { useState, Suspense, lazy } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { PosTerminal } from './components/pos/PosTerminal';
import { NotificationReminderScheduler } from './components/layout/NotificationReminderScheduler';
import { getSavedTheme, saveTheme, AppTheme } from './utils/themeManager';
import { ButterflyEffect } from './components/common/ButterflyEffect';
import { getLicenseInfo, syncLicenseFromStorage, syncRemoteLicense, LicenseInfo } from './utils/licenseManager';
import { LicenseWarningBanner } from './components/license/LicenseWarningBanner';
import { isSuperAdminAuthenticated, onSuperAdminAuthChange, deauthenticateSuperAdmin } from './utils/superAdminAuth';
import { OfflineAutoSyncToast } from './components/common/OfflineAutoSyncToast';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { useBakery } from './context/BakeryContext';
import { soundFx } from './utils/audio';
import confetti from 'canvas-confetti';
import { initTelegramMiniApp, isTelegramWebApp, getTelegramStartParam } from './services/telegramWebApp';
import { checkForAppUpdates, AppUpdateInfo, getNativeAppVersion } from './services/appUpdateService';
import { getStaffUnreadChatCount, subscribeToCustomerSessions } from './services/liveChatService';
import { RealStoreAuthModal } from './components/auth/RealStoreAuthModal';
import type { SettingsTab } from './components/settings/SettingsModal';
import type { ChatChannel } from './types';

// High-performance Lazy Loaded Components (Chunks are dynamically loaded on-demand)
const CustomerShowcase = lazy(() => import('./components/showcase/CustomerShowcase').then((m) => ({ default: m.CustomerShowcase })));
const CustomOrderPipeline = lazy(() => import('./components/custom-orders/CustomOrderPipeline').then((m) => ({ default: m.CustomOrderPipeline })));
const SalesHistory = lazy(() => import('./components/sales/SalesHistory').then((m) => ({ default: m.SalesHistory })));
const ExpenseManagement = lazy(() => import('./components/expenses/ExpenseManagement').then((m) => ({ default: m.ExpenseManagement })));
const ReserveFundDashboard = lazy(() => import('./components/reserve-fund/ReserveFundDashboard').then((m) => ({ default: m.ReserveFundDashboard })));
const InventoryManagement = lazy(() => import('./components/inventory/InventoryManagement').then((m) => ({ default: m.InventoryManagement })));
const ReportsDashboard = lazy(() => import('./components/reports/ReportsDashboard').then((m) => ({ default: m.ReportsDashboard })));
const StaffManagement = lazy(() => import('./components/staff/StaffManagement').then((m) => ({ default: m.StaffManagement })));
const ShiftModal = lazy(() => import('./components/shifts/ShiftModal').then((m) => ({ default: m.ShiftModal })));
const SettingsModal = lazy(() => import('./components/settings/SettingsModal').then((m) => ({ default: m.SettingsModal })));
const ThemePickerModal = lazy(() => import('./components/common/ThemePickerModal').then((m) => ({ default: m.ThemePickerModal })));
const LicenseExpiredModal = lazy(() => import('./components/license/LicenseExpiredModal').then((m) => ({ default: m.LicenseExpiredModal })));
const LicenseRenewalModal = lazy(() => import('./components/license/LicenseRenewalModal').then((m) => ({ default: m.LicenseRenewalModal })));
const SuperAdminPortalModal = lazy(() => import('./components/license/SuperAdminPortalModal').then((m) => ({ default: m.SuperAdminPortalModal })));
const CustomerOrderPortal = lazy(() => import('./components/customer-order/CustomerOrderPortal').then((m) => ({ default: m.CustomerOrderPortal })));
const CustomerOrderLinkModal = lazy(() => import('./components/customer-order/CustomerOrderLinkModal').then((m) => ({ default: m.CustomerOrderLinkModal })));
const StoreAuthModal = lazy(() => import('./components/auth/StoreAuthModal').then((m) => ({ default: m.StoreAuthModal })));
const ContactModal = lazy(() => import('./components/common/ContactModal').then((m) => ({ default: m.ContactModal })));
const CakeFlavorsModal = lazy(() => import('./components/pos/CakeFlavorsModal').then((m) => ({ default: m.CakeFlavorsModal })));
const AppUpdateModal = lazy(() => import('./components/common/AppUpdateModal').then((m) => ({ default: m.AppUpdateModal })));
const KhmerVoicePosModal = lazy(() => import('./components/pos/KhmerVoicePosModal').then((m) => ({ default: m.KhmerVoicePosModal })));
const KitchenDisplayModal = lazy(() => import('./components/kds/KitchenDisplayModal').then((m) => ({ default: m.KitchenDisplayModal })));
const SmartBirthdayCrmModal = lazy(() => import('./components/crm/SmartBirthdayCrmModal').then((m) => ({ default: m.SmartBirthdayCrmModal })));
const AiDemandForecastModal = lazy(() => import('./components/reports/AiDemandForecastModal').then((m) => ({ default: m.AiDemandForecastModal })));
const InAppChatModal = lazy(() => import('./components/chat/InAppChatModal').then((m) => ({ default: m.InAppChatModal })));

// Sleek modern frosted loading skeleton for seamless view transitions
const ViewLoadingFallback: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[380px] p-8 text-center animate-in fade-in duration-200">
    <div className="relative">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-pink-500/20 animate-pulse">
        <span className="text-2xl">🎂</span>
      </div>
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 opacity-20 blur-sm animate-ping" />
    </div>
    <div className="mt-4 flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" />
    </div>
    <p className="text-xs font-black text-slate-500 font-battambang mt-2.5 tracking-wide">
      កំពុងដំណើរការទិន្នន័យរហ័ស...
    </p>
  </div>
);

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pos');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCakeFlavorsModalOpen, setIsCakeFlavorsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('store');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => getSavedTheme());
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [dismissedBannerThemeId, setDismissedBannerThemeId] = useState<string | null>(null);

  // Smart AI Suite Modals
  const [isVoicePosOpen, setIsVoicePosOpen] = useState(false);
  const [isKdsOpen, setIsKdsOpen] = useState(false);
  const [isBirthdayCrmOpen, setIsBirthdayCrmOpen] = useState(false);
  const [isBakingForecastOpen, setIsBakingForecastOpen] = useState(false);

  // In-App Live Chat Suite Modal (Customer Live Chat, AI Assistant, Staff Team Chat)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatModalInitialTab, setChatModalInitialTab] = useState<ChatChannel>('CUSTOMER');

  const handleOpenChatModal = (channel?: ChatChannel) => {
    soundFx.playPop();
    if (channel) setChatModalInitialTab(channel);
    setIsChatModalOpen(true);
  };

  // Real-time In-App Live Chat Unread Messages Counter (From Customers)
  const [unreadChatCount, setUnreadChatCount] = useState<number>(() => getStaffUnreadChatCount());

  React.useEffect(() => {
    const unsub = subscribeToCustomerSessions((sessions) => {
      const total = sessions.reduce((acc, s) => acc + (s.unreadCountStaff || 0), 0);
      setUnreadChatCount(total);
    });
    return unsub;
  }, []);

  // Store Multi-Tenant Auth Modal (Email/Phone Login, Sign Up, Store ID Join)
  const [isStoreAuthModalOpen, setIsStoreAuthModalOpen] = useState(false);

  // Flying Butterflies Effect State (Independent control - disabled by default for maximum performance)
  const [isButterflyEnabled, setIsButterflyEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('bakery_butterfly_effect');
    if (saved !== null) return saved === 'true';
    return false; // Disabled by default for maximum speed
  });

  const handleToggleButterfly = () => {
    setIsButterflyEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('bakery_butterfly_effect', next ? 'true' : 'false');
      return next;
    });
  };

  // Swimming Lucky Goldfish Effect State (Independent control - disabled by default for maximum performance)
  const [isGoldfishEnabled, setIsGoldfishEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('bakery_goldfish_effect');
    if (saved !== null) return saved === 'true';
    return false; // Disabled by default for maximum speed
  });

  const handleToggleGoldfish = () => {
    setIsGoldfishEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('bakery_goldfish_effect', next ? 'true' : 'false');
      return next;
    });
  };

  // App Super Admin Portal State
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => isSuperAdminAuthenticated());
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);

  // System Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Bakery Context for Demo & Real Store Security
  const {
    isDemoMode,
    exitDemoMode,
    isRealStoreAuthModalOpen,
    closeRealStoreAuthModal,
    openRealStoreAuthModal,
    realStoreAuthSuccessCallback,
    storeInfo,
    products,
    addToCart,
    clearCart,
    exchangeRate,
  } = useBakery();

  // Check if real store requires authentication on initial visit (if not customer portal or demo URL)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (params.get('order') === 'true' || hash === '#order' || hash === '#customer-view') return;
    if (params.get('demo') === 'true' || hash === '#demo') return;

    const isUnlockedSession = sessionStorage.getItem('bakery_real_store_unlocked') === 'true';
    const isTrustedDevice = localStorage.getItem('bakery_real_store_authorized_device') === 'true';
    const alwaysRequireLogin = storeInfo.alwaysRequireLoginOnStartup !== false;

    // If real store authentication is required and session is not yet unlocked
    if (storeInfo.requireRealStorePin !== false) {
      if (!isUnlockedSession && (alwaysRequireLogin || !isTrustedDevice)) {
        openRealStoreAuthModal();
      }
    }
  }, [storeInfo.requireRealStorePin, storeInfo.alwaysRequireLoginOnStartup]);

  // 35-Day Trial License State
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>(() => getLicenseInfo());
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

  // In-App Update State & Modal Management
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateInfo | null>(() => ({
    hasUpdate: false,
    currentVersion: getNativeAppVersion(),
    latestVersion: '1.5.8',
    releaseDate: '2026-10-20',
    releaseNotes: [
      '🔒 ទាមទារ Login / វាយ PIN ពេលបើកកម្មវិធី (Require Login on Startup): បង្ហាញផ្ទាំង Login/PIN ជាបន្ទាន់រាល់ពេលបើកកម្មវិធីថ្មីដើម្បីសុវត្ថិភាព ជាមួយជម្រើសចងចាំឧបករណ៍ និងប៊ូតុងចាក់សោរហ័ស',
      '🎉 គ្រប់គ្រងគ្រឿងបន្ថែមកម្មវិធី (Party Accessories Management): គ្រប់គ្រង បន្ថែមមុខទំនិញថ្មី និងកែប្រែតម្លៃ ($ USD / ៛ KHR) សម្រាប់លក់ និងជូនភ្ញៀវជ្រើសរើស',
      '🎂 ផ្ទាំងភ្ញៀវបិទតម្លៃនំកុំបង្ហាញ (Hide Cake Prices on Customer View): បិទការបង្ហាញតម្លៃលេខលើផ្ទាំងស្លាយ TV និង QR កុម្ម៉ង់',
      '🤖 Customer Smart Chatbot & Cake Ordering: ប៊ូតុង Chatbot ឆ្លាតវៃសម្រាប់សួរនាំព័ត៌មាន មើលកាតាឡុក និងកុម្ម៉ងនំ',
      '💬 Telegram Live Chat: ឆាតទៅកាន់ Telegram របស់ហាងផ្ទាល់ និងផ្ញើដំណឹងកុម្ម៉ងនំស្វ័យប្រវត្តិ',
    ],
    apkDownloadUrl: 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.5.8/SweetBakery-Android.apk',
    windowsDownloadUrl: 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.5.8/SweetBakery-POS-Setup.exe',
    windowsInstallerUrl: 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.5.8/SweetBakery-POS-Setup.exe',
  }));
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const performUpdateCheck = React.useCallback(async (notifyIfNoUpdate = false) => {
    try {
      const info = await checkForAppUpdates();
      if (info) {
        setAvailableUpdate(info);
      }
      return info;
    } catch {
      return null;
    }
  }, []);

  React.useEffect(() => {
    // Check for updates on startup
    performUpdateCheck();

    // Check periodically every 20 minutes
    const interval = setInterval(() => {
      performUpdateCheck();
    }, 20 * 60 * 1000);

    // Also check when window regains focus
    const handleFocus = () => {
      performUpdateCheck();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [performUpdateCheck]);

  // Customer Self-Order Link & Portal Mode
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const tgParam = getTelegramStartParam();
    return (
      new URLSearchParams(window.location.search).get('order') === 'true' ||
      window.location.hash === '#order' ||
      tgParam === 'order' ||
      tgParam === 'catalog'
    );
  });
  const [isCustomerOrderLinkModalOpen, setIsCustomerOrderLinkModalOpen] = useState(false);

  // Initialize Telegram Mini App Native SDK
  React.useEffect(() => {
    initTelegramMiniApp();
  }, []);

  React.useEffect(() => {
    const handleUrlChange = () => {
      const tgParam = getTelegramStartParam();
      const isOrder =
        new URLSearchParams(window.location.search).get('order') === 'true' ||
        window.location.hash === '#order' ||
        tgParam === 'order' ||
        tgParam === 'catalog';
      setIsCustomerPortalOpen(isOrder);
    };
    const handleOpenPortal = () => setIsCustomerPortalOpen(true);
    const handleClosePortal = () => setIsCustomerPortalOpen(false);
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('open_customer_portal', handleOpenPortal);
    window.addEventListener('close_customer_portal', handleClosePortal);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('open_customer_portal', handleOpenPortal);
      window.removeEventListener('close_customer_portal', handleClosePortal);
    };
  }, []);

  const refreshLicense = () => {
    setLicenseInfo(getLicenseInfo());
  };

  React.useEffect(() => {
    const unsubAuth = onSuperAdminAuthChange((auth) => {
      setIsSuperAdmin(auth);
    });
    return unsubAuth;
  }, []);

  React.useEffect(() => {
    syncLicenseFromStorage().then(() => {
      refreshLicense();
    });

    // Real-time remote cloud auto-unlock subscription
    const unsubscribe = syncRemoteLicense(() => {
      refreshLicense();
      try {
        soundFx.playSuccess();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSelectTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    saveTheme(theme.id);
    setDismissedBannerThemeId(null);
  };

  const handleOpenSettings = (tab: SettingsTab = 'store') => {
    if (isDemoMode && (tab === 'staff' || tab === 'telegram' || tab === 'firebase')) {
      setSettingsTab('store');
    } else {
      setSettingsTab(tab);
    }
    setIsSettingsModalOpen(true);
  };

  const handleSelectTab = (tab: TabType) => {
    if (tab === 'shifts') {
      setIsShiftModalOpen(true);
    } else if (tab === 'staff') {
      if (!isDemoMode) {
        handleOpenSettings('staff');
      }
    } else if (tab === 'chat') {
      handleOpenChatModal('CUSTOMER');
    } else {
      setActiveTab(tab);
    }
  };

  // Render dedicated Customer Self-Order & Deposit Booking Portal if in customer mode (?order=true)
  if (isCustomerPortalOpen) {
    const isUrlCustomerOrder =
      typeof window !== 'undefined' &&
      (new URLSearchParams(window.location.search).get('order') === 'true' ||
        window.location.hash === '#order');

    return (
      <>
        {/* Discreet Staff Preview Exit Bar: only shown when staff previews inside POS app, NEVER shown to customers */}
        {!isUrlCustomerOrder && (
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50 border-b border-slate-800 shrink-0">
            <span className="font-bold flex items-center gap-2 text-pink-300">
              <span>👁️ ផ្ទាំងមើលគំរូសម្រាប់ភ្ញៀវ (Staff Preview)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsCustomerPortalOpen(false);
              }}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-black rounded-lg text-xs flex items-center gap-1 active:scale-95 cursor-pointer transition-all border border-white/20"
            >
              <span>✕ ត្រឡប់ទៅ POS វិញ</span>
            </button>
          </div>
        )}
        <Suspense fallback={<ViewLoadingFallback />}>
          <CustomerOrderPortal onBackToPos={() => setIsCustomerPortalOpen(false)} />
        </Suspense>
        <OfflineAutoSyncToast />
      </>
    );
  }

  return (
    <div
      className={`h-screen h-[100dvh] max-h-screen ${currentTheme.bgClass} flex flex-col font-sans selection:bg-pink-100 selection:text-pink-700 overflow-hidden transition-colors duration-300`}
      style={currentTheme.bgStyle}
    >
      {/* Demo Sandbox Mode Sticky Banner */}
      <DemoModeBanner />

      {/* Auto In-App Update Alert Banner (Prominently shows when a new version is published) */}
      {availableUpdate && availableUpdate.hasUpdate && (
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white px-3 sm:px-4 py-2 text-xs font-black flex items-center justify-between shadow-md shrink-0 animate-in slide-in-from-top duration-300 font-battambang z-30">
          <div
            className="flex items-center gap-2 truncate cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => {
              soundFx.playPop();
              setIsUpdateModalOpen(true);
            }}
          >
            <span className="animate-bounce shrink-0 text-sm">🚀</span>
            <span className="truncate">
              មានកំណែអាប់ដែតថ្មី៖ <strong>SweetBakery POS v{availableUpdate.latestVersion}</strong> (ចុចដើម្បីដំឡើងភ្លាមៗ)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsUpdateModalOpen(true);
              }}
              className="bg-white text-pink-700 hover:bg-white/95 px-3 py-1 rounded-xl text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1"
            >
              <span>អាប់ដែតឥឡូវនេះ 🚀</span>
            </button>
            <button
              type="button"
              onClick={() => setAvailableUpdate(null)}
              className="text-white/80 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
              title="បិទបដានេះជាបណ្ដោះអាសន្ន"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Background Notification Scheduler & Polite Banner (Completely disabled in Demo mode) */}
      {!isDemoMode && <NotificationReminderScheduler />}

      {/* 35-Day Trial Expiring Soon Warning Banner (<= 5 days) */}
      {licenseInfo.isWarning && !licenseInfo.isExpired && (
        <LicenseWarningBanner
          daysRemaining={licenseInfo.daysRemaining}
          onOpenRenewModal={() => setIsRenewModalOpen(true)}
        />
      )}

      {/* Festive Holiday Celebration Top Banner */}
      {currentTheme.category === 'festival' && currentTheme.festiveBannerKh && dismissedBannerThemeId !== currentTheme.id && (
        <div
          className={`px-3 sm:px-4 py-1.5 text-xs font-bold flex items-center justify-between border-b shadow-2xs animate-in slide-in-from-top duration-300 font-battambang shrink-0 ${currentTheme.badgeClass}`}
        >
          <div className="flex-1 flex items-center justify-center gap-2 text-center truncate">
            <span className="text-sm animate-bounce shrink-0">{currentTheme.ambientMotif || currentTheme.emoji}</span>
            <span className="truncate">{currentTheme.festiveBannerKh}</span>
            <span className="text-sm animate-bounce shrink-0">{currentTheme.ambientMotif || currentTheme.emoji}</span>
          </div>
          <button
            type="button"
            onClick={() => setDismissedBannerThemeId(currentTheme.id)}
            className="text-slate-500 hover:text-slate-800 text-xs px-2 py-0.5 rounded-lg hover:bg-black/5 cursor-pointer shrink-0 transition-colors ml-2"
            title="បិទបដានេះ"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        onOpenSettingsModal={handleOpenSettings}
        onOpenStaffTab={() => {
          if (!isDemoMode) {
            handleOpenSettings('staff');
          }
        }}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
        onOpenThemePicker={() => setIsThemePickerOpen(true)}
        currentTheme={currentTheme}
        isSuperAdmin={isSuperAdmin}
        onOpenSuperAdminPortal={() => setIsSuperAdminModalOpen(true)}
        onOpenCustomerOrderLinkModal={() => setIsCustomerOrderLinkModalOpen(true)}
        onOpenCakeFlavors={() => setIsCakeFlavorsModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        isButterflyEnabled={isButterflyEnabled}
        onToggleButterfly={handleToggleButterfly}
        isGoldfishEnabled={isGoldfishEnabled}
        onToggleGoldfish={handleToggleGoldfish}
        availableUpdate={availableUpdate}
        onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
        onOpenVoicePos={() => setIsVoicePosOpen(true)}
        onOpenKds={() => setIsKdsOpen(true)}
        onOpenBirthdayCrm={() => setIsBirthdayCrmOpen(true)}
        onOpenBakingForecast={() => setIsBakingForecastOpen(true)}
        onOpenStoreAuthModal={() => setIsStoreAuthModalOpen(true)}
        onOpenChatModal={handleOpenChatModal}
      />

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onOpenSettings={handleOpenSettings}
          onOpenThemePicker={() => setIsThemePickerOpen(true)}
          onOpenContact={() => setIsContactModalOpen(true)}
          onOpenCustomerOrderLinkModal={() => setIsCustomerOrderLinkModalOpen(true)}
          onOpenCakeFlavors={() => setIsCakeFlavorsModalOpen(true)}
          currentTheme={currentTheme}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
          availableUpdate={availableUpdate}
          onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
          onOpenVoicePos={() => setIsVoicePosOpen(true)}
          onOpenKds={() => setIsKdsOpen(true)}
          onOpenBirthdayCrm={() => setIsBirthdayCrmOpen(true)}
          onOpenBakingForecast={() => setIsBakingForecastOpen(true)}
          onOpenStoreAuthModal={() => setIsStoreAuthModalOpen(true)}
          onOpenChatModal={handleOpenChatModal}
        />

        {/* Dynamic Views */}
        <main className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
          <Suspense fallback={<ViewLoadingFallback />}>
            {activeTab === 'pos' && <PosTerminal />}
            {activeTab === 'showcase' && <CustomerShowcase />}
            {activeTab === 'custom-orders' && <CustomOrderPipeline />}
            {activeTab === 'sales' && <SalesHistory />}
            {activeTab === 'expenses' && (
              <ExpenseManagement onNavigateToReserveFund={() => handleSelectTab('reserve-fund')} />
            )}
            {activeTab === 'reserve-fund' && (
              <ReserveFundDashboard onNavigateToExpenses={() => handleSelectTab('expenses')} />
            )}
            {activeTab === 'inventory' && <InventoryManagement />}
            {activeTab === 'reports' && <ReportsDashboard />}
            {activeTab === 'staff' && !isDemoMode && <StaffManagement />}
          </Suspense>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onOpenMoreMenu={() => setIsMobileDrawerOpen(true)}
      />

      {/* Floating In-App Live Chat Action Bubble on POS screen */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => handleOpenChatModal('CUSTOMER')}
          title="ឆាតផ្ទាល់លើ App (In-App Live Chat: ភ្ញៀវ ↔ អ្នកលក់ • AI • ក្រុមការងារ)"
          className={`group flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-xl border-2 border-white transition-all active:scale-95 cursor-pointer ${
            unreadChatCount > 0
              ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white shadow-pink-500/40 animate-pulse ring-4 ring-pink-300/60'
              : 'bg-gradient-to-r from-slate-950 via-slate-900 to-pink-950 text-white hover:from-pink-600 hover:to-rose-600 shadow-slate-900/30'
          }`}
        >
          <div className="relative shrink-0">
            <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform block">
              💬
            </span>
            {unreadChatCount > 0 ? (
              <span className="w-3.5 h-3.5 rounded-full bg-amber-300 border-2 border-white absolute -top-1 -right-1 animate-ping" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white absolute -top-0.5 -right-0.5" />
            )}
          </div>
          <div className="text-left font-battambang">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs sm:text-sm font-black tracking-tight">ឆាតលើ App</span>
              {unreadChatCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-white text-rose-600 shadow-xs">
                  {unreadChatCount} ថ្មី
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] text-pink-200 font-medium block mt-0.5">
              {unreadChatCount > 0 ? 'មានសារភ្ញៀវថ្មី!' : 'ភ្ញៀវ ↔ អ្នកលក់'}
            </span>
          </div>
        </button>
      </div>

      {/* Global Modals (Lazy Loaded on Demand) */}
      <Suspense fallback={null}>
        <ShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          initialTab={settingsTab}
          onOpenLicenseModal={() => setIsRenewModalOpen(true)}
          onOpenSuperAdminPortal={() => setIsSuperAdminModalOpen(true)}
        />


        {/* Flying 3D Butterflies & Swimming Lucky Goldfish Effect (Independent toggles, paused during Auth Modal for zero lag) */}
        <ButterflyEffect
          butterflyEnabled={isButterflyEnabled && !isRealStoreAuthModalOpen}
          goldfishEnabled={isGoldfishEnabled && !isRealStoreAuthModalOpen}
          butterflyCount={14}
          goldfishCount={7}
        />

        {/* Background Theme Customizer Modal */}
        <ThemePickerModal
          isOpen={isThemePickerOpen}
          onClose={() => setIsThemePickerOpen(false)}
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          isButterflyEnabled={isButterflyEnabled}
          onToggleButterfly={handleToggleButterfly}
          isGoldfishEnabled={isGoldfishEnabled}
          onToggleGoldfish={handleToggleGoldfish}
        />

        {/* 35-Day Expiration Lock Modal */}
        <LicenseExpiredModal
          isOpen={licenseInfo.isExpired}
          onRenewSuccess={refreshLicense}
          isTamper={licenseInfo.tamperDetected}
        />

        {/* Manual License Renewal Modal (Client Facing Only) */}
        <LicenseRenewalModal
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          onRenewSuccess={refreshLicense}
          licenseInfo={licenseInfo}
          onOpenSuperAdminPortal={() => setIsSuperAdminModalOpen(true)}
        />

        {/* App Super Admin Portal Modal (License Generator & Remote Unlock) */}
        <SuperAdminPortalModal
          isOpen={isSuperAdminModalOpen}
          onClose={() => setIsSuperAdminModalOpen(false)}
          onLogout={() => {
            deauthenticateSuperAdmin();
            setIsSuperAdmin(false);
            setIsSuperAdminModalOpen(false);
          }}
        />

        {/* Customer Order Link & QR Sharing Modal */}
        <CustomerOrderLinkModal
          isOpen={isCustomerOrderLinkModalOpen}
          onClose={() => setIsCustomerOrderLinkModalOpen(false)}
          onOpenCustomerView={() => {
            setIsCustomerOrderLinkModalOpen(false);
            setIsCustomerPortalOpen(true);
            try {
              if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
                window.history.pushState({}, '', '?order=true');
              }
            } catch (e) {}
          }}
        />

        {/* Global Cake Flavors & Stock Modal */}
        <CakeFlavorsModal
          isOpen={isCakeFlavorsModalOpen}
          onClose={() => setIsCakeFlavorsModalOpen(false)}
        />

        {/* Dedicated Standard In-App Update Modal */}
        <AppUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          updateInfo={availableUpdate}
          onCheckAgain={async () => {
            await performUpdateCheck(true);
          }}
        />

        {/* System Contact & Software Inquiries Modal */}
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />

        {/* Smart Voice POS Assistant */}
        <KhmerVoicePosModal
          isOpen={isVoicePosOpen}
          onClose={() => setIsVoicePosOpen(false)}
          products={products}
          onAddProduct={(prod, qty) => {
            for (let i = 0; i < (qty || 1); i++) {
              addToCart(prod);
            }
            setActiveTab('pos');
          }}
          onCheckout={() => {
            setActiveTab('pos');
          }}
          onClearCart={clearCart}
          exchangeRate={exchangeRate}
        />

        {/* Real-time Kitchen Display System (KDS) */}
        <KitchenDisplayModal
          isOpen={isKdsOpen}
          onClose={() => setIsKdsOpen(false)}
        />

        {/* Smart Birthday CRM Modal */}
        <SmartBirthdayCrmModal
          isOpen={isBirthdayCrmOpen}
          onClose={() => setIsBirthdayCrmOpen(false)}
        />

        {/* AI Demand Forecasting & Daily Baking Plan */}
        <AiDemandForecastModal
          isOpen={isBakingForecastOpen}
          onClose={() => setIsBakingForecastOpen(false)}
        />

        {/* Store Multi-Tenant Account & Auth Modal */}
        <StoreAuthModal
          isOpen={isStoreAuthModalOpen}
          onClose={() => setIsStoreAuthModalOpen(false)}
        />

        {/* Full In-App Live Chat Suite (Customer ↔ Staff Live Chat, AI Chatbot, Staff Internal Team) */}
        <InAppChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          initialTab={chatModalInitialTab}
        />
      </Suspense>

      {/* Real Store Passcode & Account Authentication Lock Screen (0ms Instant Direct Render on Frame 0) */}
      <RealStoreAuthModal
        isOpen={isRealStoreAuthModalOpen}
        onClose={closeRealStoreAuthModal}
        onSuccess={(authenticatedStaff) => {
          exitDemoMode(authenticatedStaff);
          if (realStoreAuthSuccessCallback) {
            realStoreAuthSuccessCallback(authenticatedStaff);
          }
        }}
      />
    </div>
  );
};

export default App;
