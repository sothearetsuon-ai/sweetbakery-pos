import React from 'react';
import {
  ShoppingBag,
  Cake,
  Package,
  BarChart3,
  Clock3,
  Settings,
  Flame,
  Sparkles,
  Images,
  Wallet,
  FileText,
  Users,
  Lock,
  X,
  Music,
  Palette,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { useMusic } from '../../context/MusicContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { StaffPermissions } from '../../types';

export type TabType =
  | 'pos'
  | 'showcase'
  | 'custom-orders'
  | 'sales'
  | 'expenses'
  | 'inventory'
  | 'reports'
  | 'shifts'
  | 'staff';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSettings: (tab?: 'store' | 'khqr' | 'staff' | 'currency') => void;
  onOpenThemePicker?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenThemePicker,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { lang, customOrders, lowStockCount, expenses, sales, currentStaff, hasPermission, staffMembers } = useBakery();
  const { isPlaying: isMusicPlaying, setIsPlayerOpen: setIsMusicPlayerOpen } = useMusic();
  const text = t[lang];

  const pendingCakeOrdersCount = customOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'BAKING' || o.status === 'DECORATING'
  ).length;

  const navItems: {
    id: TabType;
    label: string;
    icon: any;
    badge: any;
    badgeColor: string;
    permission?: keyof StaffPermissions;
  }[] = [
    {
      id: 'pos',
      label: text.pos,
      icon: ShoppingBag,
      badge: null,
      badgeColor: '',
      permission: 'canAccessPos',
    },
    {
      id: 'showcase',
      label: 'កាតាឡុកបង្ហាញភ្ញៀវ 🎨',
      icon: Images,
      badge: 'Showcase',
      badgeColor: 'bg-emerald-500 text-white font-bold',
      permission: 'canAccessShowcase',
    },
    {
      id: 'custom-orders',
      label: text.customOrders,
      icon: Cake,
      badge: pendingCakeOrdersCount > 0 ? pendingCakeOrdersCount : null,
      badgeColor: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white animate-pulse',
      permission: 'canAccessCustomOrders',
    },
    {
      id: 'sales',
      label: 'ប្រវត្តិលក់ & វិក្កយបត្រ 🧾',
      icon: FileText,
      badge: sales.length > 0 ? `${sales.length}` : null,
      badgeColor: 'bg-blue-600 text-white font-bold',
      permission: 'canAccessSalesHistory',
    },
    {
      id: 'expenses',
      label: 'គ្រប់គ្រងការចំណាយ 💸',
      icon: Wallet,
      badge: expenses.length > 0 ? `${expenses.length}` : null,
      badgeColor: 'bg-rose-500 text-white font-bold',
      permission: 'canAccessExpenses',
    },
    {
      id: 'inventory',
      label: text.inventory,
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-white',
      permission: 'canAccessInventory',
    },
    {
      id: 'reports',
      label: text.reports,
      icon: BarChart3,
      badge: null,
      badgeColor: '',
      permission: 'canAccessReports',
    },
    {
      id: 'staff',
      label: 'បុគ្គលិក & សិទ្ធិ 👥',
      icon: Users,
      badge: `${staffMembers.length}`,
      badgeColor: 'bg-purple-600 text-white font-bold',
      permission: 'canAccessSettings',
    },
    {
      id: 'shifts',
      label: text.shifts,
      icon: Clock3,
      badge: null,
      badgeColor: '',
      permission: 'canAccessPos',
    },
  ];

  const handleTabClick = (tab: TabType, permission?: keyof StaffPermissions) => {
    if (tab === 'staff') {
      soundFx.playPop();
      onOpenSettings('staff');
      onCloseMobile?.();
      return;
    }
    if (permission && !hasPermission(permission)) {
      soundFx.playPop();
      alert(
        `⚠️ សិទ្ធិប្រើប្រាស់ត្រូវបានកំណត់៖ គណនី «${currentStaff.name} (${currentStaff.role})» មិនទាន់មានសិទ្ធិចូលមើលផ្ទាំងនេះឡើយ។\n\nសូមប្តូរទៅគណនី Admin ឬស្នើសុំម្ចាស់ហាងបើកសិទ្ធិក្នុង Settings > «បុគ្គលិក & សិទ្ធិ»។`
      );
      return;
    }
    soundFx.playPop();
    setActiveTab(tab);
    onCloseMobile?.();
  };

  const renderNavList = () => (
    <>
      <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
          <span>មឺនុយចម្បង</span>
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAllowed = !item.permission || hasPermission(item.permission);
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id, item.permission)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-black text-xs tracking-wide transition-all duration-200 relative group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white shadow-md shadow-rose-500/30 scale-[1.02] ring-2 ring-rose-400/25'
                  : isAllowed
                  ? 'text-slate-700 hover:bg-white hover:text-rose-600 hover:shadow-xs hover:border hover:border-slate-200/90'
                  : 'text-slate-400 opacity-60 hover:opacity-80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-white' : isAllowed ? 'text-slate-400 group-hover:text-pink-500' : 'text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!isAllowed && (
                  <span title="ជាប់សោរ (គ្មានសិទ្ធិ)">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                )}
                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full shadow-2xs ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Staff Card & Kitchen Status Widget & Settings */}
      <div className="p-4 space-y-3 shrink-0 border-t border-rose-100/50 bg-white/40">
        {/* Active Staff Quick Info */}
        <div className="p-2.5 rounded-2xl bg-white border border-purple-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{currentStaff.avatar || '👤'}</span>
            <div className="text-left">
              <div className="text-xs font-black text-slate-800">{currentStaff.name}</div>
              <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{currentStaff.role}</div>
            </div>
          </div>
          <button
            onClick={() => {
              onOpenSettings('staff');
              onCloseMobile?.();
            }}
            className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
            title="កំណត់សិទ្ធិបុគ្គលិកក្នុង Settings"
          >
            <Users className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Kitchen Oven Status Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
              <span>ឡដុតនំកំពុងដុត</span>
            </span>
            <span className="text-[10px] bg-orange-200/60 text-orange-800 px-1.5 py-0.5 rounded-md">
              180°C
            </span>
          </div>
          <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-rose-500 h-full w-[70%] rounded-full animate-pulse" />
          </div>
          <div className="flex justify-between text-[10px] text-amber-700/80 mt-1.5 font-medium">
            <span>នំកំពុងដុត៖ 2 នំ</span>
            <span>សមត្ថភាព 70%</span>
          </div>
        </div>

        {/* Music Player button */}
        <button
          onClick={() => {
            soundFx.playPop();
            setIsMusicPlayerOpen(true);
            onCloseMobile?.();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl font-bold text-xs text-slate-600 hover:bg-white hover:text-pink-600 transition-all border border-transparent hover:border-pink-200/60 shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <Music className={`w-4 h-4 transition-transform group-hover:scale-110 ${isMusicPlaying ? 'text-pink-600 animate-bounce' : 'text-slate-400'}`} />
            <span>តន្ត្រីហាងនំ 🎶</span>
          </div>
          {isMusicPlaying && (
            <span className="px-1.5 py-0.2 bg-pink-100 text-pink-700 text-[9px] font-black rounded-full animate-pulse">
              កំពុងចាក់
            </span>
          )}
        </button>

        {/* Background Theme Switcher button */}
        {onOpenThemePicker && (
          <button
            onClick={() => {
              soundFx.playPop();
              onOpenThemePicker();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl font-bold text-xs text-slate-600 hover:bg-white hover:text-pink-600 transition-all border border-transparent hover:border-pink-200/60 shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-pink-500 transition-transform group-hover:rotate-45" />
              <span>ប្តូរពណ៌ផ្ទៃ 🎨</span>
            </div>
            <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
              Themes
            </span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={() => {
            soundFx.playPop();
            onOpenSettings();
            onCloseMobile?.();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl font-bold text-xs text-slate-600 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200/60 shadow-2xs cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>{text.settings}</span>
        </button>

        <div className="text-center text-[10px] text-slate-400 font-medium">
          SweetBakery POS v1.0 • Made with ❤️
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Permanent Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 glass-panel border-r border-rose-100/70 flex-col justify-between shrink-0 min-h-[calc(100vh-65px)] overflow-hidden">
        {renderNavList()}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer (Shown on Mobile when toggled) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />

          {/* Sliding Drawer */}
          <aside className="relative z-50 w-72 max-w-[82vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            {/* Mobile Drawer Header */}
            <div className="p-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-pink-500/20">
                  🎂
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800">ម៉ឺនុយហាងនំ</div>
                  <div className="text-[10px] text-pink-600 font-bold">SweetBakery POS</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-xl bg-white border border-rose-200 text-slate-500 flex items-center justify-center hover:bg-rose-50 cursor-pointer shadow-2xs"
                title="បិទម៉ឺនុយ"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Nav list */}
            {renderNavList()}
          </aside>
        </div>
      )}
    </>
  );
};
