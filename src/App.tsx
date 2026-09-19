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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pos');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('store');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans selection:bg-pink-100 selection:text-pink-700 overflow-x-hidden">
      {/* Background Notification Scheduler & Polite Banner */}
      <NotificationReminderScheduler />

      {/* Top Navigation */}
      <Navbar
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        onOpenSettingsModal={handleOpenSettings}
        onOpenStaffTab={() => handleOpenSettings('staff')}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
      />

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onOpenSettings={handleOpenSettings}
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
      />

      {/* Bakery Music Player Modal & Floating Mini Player */}
      <MusicPlayerModal />
      <MiniMusicPlayer />
    </div>
  );
};

export default App;
