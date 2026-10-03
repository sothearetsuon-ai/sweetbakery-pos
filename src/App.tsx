import { Phone } from 'lucide-react';
import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { PosTerminal } from './components/pos/PosTerminal';
import { CustomerShowcase } from './components/showcase/CustomerShowcase';
import { CustomOrderPipeline } from './components/custom-orders/CustomOrderPipeline';
import { SalesHistory } from './components/sales/SalesHistory';
import { ExpenseManagement } from './components/expenses/ExpenseManagement';
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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pos');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('store');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => getSavedTheme());
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [dismissedBannerThemeId, setDismissedBannerThemeId] = useState<string | null>(null);

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
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
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
        <CustomerOrderPortal />
        <OfflineAutoSyncToast />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen ${currentTheme.bgClass} flex flex-col font-sans selection:bg-pink-100 selection:text-pink-700 overflow-x-hidden transition-colors duration-300`}
      style={currentTheme.bgStyle}
    >
      {/* Demo Sandbox Mode Sticky Banner */}
      <DemoModeBanner />

      {/* Background Notification Scheduler & Polite Banner */}
      <NotificationReminderScheduler />

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
        onOpenContact={() => setIsContactModalOpen(true)}
      />

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onOpenSettings={handleOpenSettings}
          onOpenThemePicker={() => setIsThemePickerOpen(true)}
          onOpenContact={() => setIsContactModalOpen(true)}
          currentTheme={currentTheme}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Dynamic Views */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
          {activeTab === 'pos' && <PosTerminal />}
          {activeTab === 'showcase' && <CustomerShowcase />}
          {activeTab === 'custom-orders' && <CustomOrderPipeline />}
          {activeTab === 'sales' && <SalesHistory />}
          {activeTab === 'expenses' && <ExpenseManagement />}
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

      {/* Background Theme Customizer Modal */}
      <ThemePickerModal
        isOpen={isThemePickerOpen}
        onClose={() => setIsThemePickerOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
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
          setIsCustomerPortalOpen(true);
          window.history.pushState({}, '', '?order=true');
        }}
      />

      {/* Floating Offline-to-Cloud Auto-Sync Toast */}
      <OfflineAutoSyncToast />

      {/* Real Store Passcode Authentication Lock Modal */}
      <RealStoreAuthModal
        isOpen={isRealStoreAuthModalOpen}
        onClose={closeRealStoreAuthModal}
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
