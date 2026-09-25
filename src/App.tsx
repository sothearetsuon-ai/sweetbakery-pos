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
import { soundFx } from './utils/audio';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pos');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('store');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => getSavedTheme());
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  // 35-Day Trial License State
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>(() => getLicenseInfo());
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

  const refreshLicense = () => {
    setLicenseInfo(getLicenseInfo());
  };

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
  };

  const handleOpenSettings = (tab: SettingsTab = 'store') => {
    setSettingsTab(tab);
    setIsSettingsModalOpen(true);
  };

  const handleSelectTab = (tab: TabType) => {
    if (tab === 'shifts') {
      setIsShiftModalOpen(true);
    } else if (tab === 'staff') {
      handleOpenSettings('staff');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div
      className={`min-h-screen ${currentTheme.bgClass} flex flex-col font-sans selection:bg-pink-100 selection:text-pink-700 overflow-x-hidden transition-colors duration-300`}
      style={currentTheme.bgStyle}
    >
      {/* Background Notification Scheduler & Polite Banner */}
      <NotificationReminderScheduler />

      {/* 35-Day Trial Expiring Soon Warning Banner (<= 5 days) */}
      {licenseInfo.isWarning && !licenseInfo.isExpired && (
        <LicenseWarningBanner
          daysRemaining={licenseInfo.daysRemaining}
          onOpenRenewModal={() => setIsRenewModalOpen(true)}
        />
      )}

      {/* Top Navigation */}
      <Navbar
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        onOpenSettingsModal={handleOpenSettings}
        onOpenStaffTab={() => handleOpenSettings('staff')}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
        onOpenThemePicker={() => setIsThemePickerOpen(true)}
      />

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onOpenSettings={handleOpenSettings}
          onOpenThemePicker={() => setIsThemePickerOpen(true)}
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
          {activeTab === 'staff' && <StaffManagement />}
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

      {/* Manual License Renewal Modal */}
      <LicenseRenewalModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        onRenewSuccess={refreshLicense}
        licenseInfo={licenseInfo}
      />
    </div>
  );
};

export default App;
