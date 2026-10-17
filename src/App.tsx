import { Phone, Rocket, X } from 'lucide-react';
import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { PosTerminal } from './components/pos/PosTerminal';
import { CustomerShowcase } from './components/showcase/CustomerShowcase';
import { CustomOrderPipeline } from './components/custom-orders/CustomOrderPipeline';
import { SalesHistory } from './components/sales/SalesHistory';
import { ExpenseManagement } from './components/expenses/ExpenseManagement';
import { ReserveFundDashboard } from './components/reserve-fund/ReserveFundDashboard';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { ShiftModal } from './components/shifts/ShiftModal';
import { SettingsModal, SettingsTab } from './components/settings/SettingsModal';
import { StaffManagement } from './components/staff/StaffManagement';
import { MusicPlayerModal } from './components/music/MusicPlayerModal';
import { MiniMusicPlayer } from './components/music/MiniMusicPlayer';
import { NotificationReminderScheduler } from './components/layout/NotificationReminderScheduler';
import { getSavedTheme, saveTheme, AppTheme } from './utils/themeManager';
import { ThemePickerModal } from './components/common/ThemePickerModal';
import { ButterflyEffect } from './components/common/ButterflyEffect';
import { getLicenseInfo, syncLicenseFromStorage, syncRemoteLicense, LicenseInfo } from './utils/licenseManager';
import { LicenseExpiredModal } from './components/license/LicenseExpiredModal';
import { LicenseWarningBanner } from './components/license/LicenseWarningBanner';
import { LicenseRenewalModal } from './components/license/LicenseRenewalModal';
import { SuperAdminPortalModal } from './components/license/SuperAdminPortalModal';
import { isSuperAdminAuthenticated, onSuperAdminAuthChange, deauthenticateSuperAdmin } from './utils/superAdminAuth';
import { CustomerOrderPortal } from './components/customer-order/CustomerOrderPortal';
import { CustomerOrderLinkModal } from './components/customer-order/CustomerOrderLinkModal';
import { OfflineAutoSyncToast } from './components/common/OfflineAutoSyncToast';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { RealStoreAuthModal } from './components/auth/RealStoreAuthModal';
import { ContactModal } from './components/common/ContactModal';
import { useBakery } from './context/BakeryContext';
import { soundFx } from './utils/audio';
import confetti from 'canvas-confetti';
import { initTelegramMiniApp, isTelegramWebApp, getTelegramStartParam } from './services/telegramWebApp';
import { checkForAppUpdates, AppUpdateInfo, getNativeAppVersion } from './services/appUpdateService';
import { CakeFlavorsModal } from './components/pos/CakeFlavorsModal';
import { AppUpdateModal } from './components/common/AppUpdateModal';

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
    isRealStoreAuthModalOpen,
    closeRealStoreAuthModal,
    openRealStoreAuthModal,
    realStoreAuthSuccessCallback,
    storeInfo,
  } = useBakery();

  // Check if real store requires authentication on initial visit (if not demo mode and device/session not yet authorized)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDemoMode) return; // In demo mode, auth is only requested when exiting demo

    const isUnlockedSession = sessionStorage.getItem('bakery_real_store_unlocked') === 'true';
    const isTrustedDevice = localStorage.getItem('bakery_real_store_authorized_device') === 'true';

    // If real store passcode is required and neither session nor device is authorized
    if (storeInfo.requireRealStorePin !== false && !isUnlockedSession && !isTrustedDevice) {
      openRealStoreAuthModal();
    }
  }, [isDemoMode, storeInfo.requireRealStorePin]);

  // 35-Day Trial License State
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>(() => getLicenseInfo());
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

  // In-App Update State & Modal Management
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateInfo | null>(() => ({
    hasUpdate: false,
    currentVersion: getNativeAppVersion(),
    latestVersion: '1.3.0',
    releaseDate: '2026-10-15',
    releaseNotes: [
      'ប្រព័ន្ធ In-App Auto Update ស្តង់ដារថ្មី៖ ទាញយកអាប់ដែតបានរលូន និងលឿនរហ័ស ទាំងលើ Windows និង Android',
      'របារទាញយក Progress Bar ផ្ទាល់៖ បង្ហាញភាគរយ % និងទំហំ MB កំពុងទាញយកជាក់ស្តែង',
      'ការដំឡើងស្វ័យប្រវត្ត (1-Click Auto Install) ដោយសុវត្ថិភាព មិនបាត់បង់ទិន្នន័យ',
    ],
    apkDownloadUrl: 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-Android.apk',
    windowsDownloadUrl: 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Setup.exe',
    windowsInstallerUrl: 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Setup.exe',
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
    } else {
      setActiveTab(tab);
    }
  };

  // Render dedicated Customer Self-Order & Deposit Booking Portal if in customer mode (?order=true)
  if (isCustomerPortalOpen) {
    return (
      <>
        <CustomerOrderPortal onBackToPos={() => setIsCustomerPortalOpen(false)} />
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
        />

        {/* Dynamic Views */}
        <main className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
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
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onOpenMoreMenu={() => setIsMobileDrawerOpen(true)}
      />

      {/* Global Modals */}
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

      {/* Bakery Music Player Modal & Floating Mini Player */}
      <MusicPlayerModal />
      <MiniMusicPlayer />

      {/* Flying 3D Butterflies & Swimming Lucky Goldfish Effect (Independent toggles) */}
      <ButterflyEffect
        butterflyEnabled={isButterflyEnabled}
        goldfishEnabled={isGoldfishEnabled}
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

      {/* Floating Auto-Update Available Toast */}
      {availableUpdate && availableUpdate.hasUpdate && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-[calc(100vw-32px)] bg-white/95 backdrop-blur-md border-2 border-pink-400 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-500/30">
              <Rocket className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span>កំណែថ្មី v{availableUpdate.latestVersion}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">
                    New
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setAvailableUpdate(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                {availableUpdate.releaseNotes?.[0] || 'មានការកែលម្អប្រព័ន្ធ និងបន្ថែមមុខងារថ្មី'}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSuccess();
                    setIsUpdateModalOpen(true);
                  }}
                  className="flex-1 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-black rounded-xl shadow-xs hover:from-pink-700 hover:to-rose-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>🚀 អាប់ដេតឥឡូវនេះ (1-Click)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Offline-to-Cloud Auto-Sync Toast */}
      <OfflineAutoSyncToast />

      {/* Real Store Passcode Authentication Lock Modal */}
      <RealStoreAuthModal
        isOpen={isRealStoreAuthModalOpen}
        onClose={closeRealStoreAuthModal}
        onSuccess={realStoreAuthSuccessCallback || undefined}
      />

      {/* Floating System Contact Quick Pill (Only in Demo Mode) */}
      {isDemoMode && (
        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            setIsContactModalOpen(true);
          }}
          title="ប្រសិនបើអ្នកមានចំណាប់អារម្មណ៍ចង់ប្រើប្រាស់កម្មវិធីនេះសូមទាក់ទង លេខទូរសព្ទ័៖ 012 629 160"
          className="fixed bottom-28 sm:bottom-24 right-3 sm:right-5 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white pl-3 pr-3.5 py-2 rounded-full shadow-xl shadow-emerald-950/25 border-2 border-emerald-300/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 group font-battambang"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse shrink-0">
            <Phone className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-emerald-100 font-bold leading-tight hidden xs:block">
              ទំនាក់ទំនងប្រើប្រាស់ប្រព័ន្ធ
            </div>
            <div className="text-xs font-black font-mono tracking-wide flex items-center gap-1">
              <span>012 629 160</span>
              <span className="text-[10px] text-emerald-200 group-hover:translate-x-0.5 transition-transform">✨</span>
            </div>
          </div>
        </button>
      )}

      {/* System Contact & Software Inquiries Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default App;
