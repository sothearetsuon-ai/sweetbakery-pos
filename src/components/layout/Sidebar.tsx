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
  LogOut,
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
  const { lang, customOrders, lowStockCount, expenses, sales, currentStaff, hasPermission, staffMembers, storeInfo, logoutAndLock } = useBakery();
  const { isPlaying: isMusicPlaying, setIsPlayerOpen: setIsMusicPlayerOpen } = useMusic();
  const text = t[lang];

  const pendingCakeOrdersCount = customOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'BAKING' || o.status === 'DECORATING'
  ).length;

  interface NavItem {
    id: TabType;
    label: string;
    subLabel: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    badge: any;
    badgeColor: string;
    permission?: keyof StaffPermissions;
  }

  interface NavSection {
    sectionTitle: string;
    sectionIcon: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      sectionTitle: 'ការលក់ & សេវាកម្ម',
      sectionIcon: '🛒',
      items: [
        {
          id: 'pos',
          label: text.pos || 'ផ្ទាំងលក់ទំនិញ (POS)',
          subLabel: 'Quick Cashier & Cart',
          icon: ShoppingBag,
          iconBg: 'bg-pink-100 text-pink-600',
          iconColor: 'text-pink-600',
          badge: null,
          badgeColor: '',
          permission: 'canAccessPos',
        },
        {
          id: 'showcase',
          label: 'កាតាឡុកបង្ហាញភ្ញៀវ 🎨',
          subLabel: 'Customer Showcase',
          icon: Images,
          iconBg: 'bg-emerald-100 text-emerald-600',
          iconColor: 'text-emerald-600',
          badge: 'Showcase',
          badgeColor: 'bg-emerald-500 text-white font-bold',
          permission: 'canAccessShowcase',
        },
        {
          id: 'custom-orders',
          label: text.customOrders || 'កុម្ម៉ង់នំខួបកំណើត 🎂',
          subLabel: 'Custom Cake Orders',
          icon: Cake,
          iconBg: 'bg-purple-100 text-purple-600',
          iconColor: 'text-purple-600',
          badge: pendingCakeOrdersCount > 0 ? pendingCakeOrdersCount : null,
          badgeColor: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white animate-pulse',
          permission: 'canAccessCustomOrders',
        },
      ],
    },
    {
      sectionTitle: 'គ្រប់គ្រង & ហិរញ្ញវត្ថុ',
      sectionIcon: '📊',
      items: [
        {
          id: 'sales',
          label: 'ប្រវត្តិលក់ & វិក្កយបត្រ 🧾',
          subLabel: 'Sales & Receipts',
          icon: FileText,
          iconBg: 'bg-blue-100 text-blue-600',
          iconColor: 'text-blue-600',
          badge: sales.length > 0 ? `${sales.length}` : null,
          badgeColor: 'bg-blue-600 text-white font-bold',
          permission: 'canAccessSalesHistory',
        },
        {
          id: 'expenses',
          label: 'គ្រប់គ្រងការចំណាយ 💸',
          subLabel: 'Store Expenses',
          icon: Wallet,
          iconBg: 'bg-rose-100 text-rose-600',
          iconColor: 'text-rose-600',
          badge: expenses.length > 0 ? `${expenses.length}` : null,
          badgeColor: 'bg-rose-500 text-white font-bold',
          permission: 'canAccessExpenses',
        },
        {
          id: 'inventory',
          label: text.inventory || 'ស្តុកទំនិញ & វត្ថុធាតុដើម 📦',
          subLabel: 'Stock & Raw Materials',
          icon: Package,
          iconBg: 'bg-amber-100 text-amber-600',
          iconColor: 'text-amber-600',
          badge: lowStockCount > 0 ? lowStockCount : null,
          badgeColor: 'bg-amber-500 text-white animate-bounce',
          permission: 'canAccessInventory',
        },
        {
          id: 'reports',
          label: text.reports || 'របាយការណ៍សង្ខេប 📊',
          subLabel: 'Analytics & Revenue',
          icon: BarChart3,
          iconBg: 'bg-indigo-100 text-indigo-600',
          iconColor: 'text-indigo-600',
          badge: null,
          badgeColor: '',
          permission: 'canAccessReports',
        },
      ],
    },
    {
      sectionTitle: 'រដ្ឋបាល & បុគ្គលិក',
      sectionIcon: '👥',
      items: [
        {
          id: 'staff',
          label: 'បុគ្គលិក & សិទ្ធិ 👥',
          subLabel: 'Staff Management',
          icon: Users,
          iconBg: 'bg-violet-100 text-violet-600',
          iconColor: 'text-violet-600',
          badge: `${staffMembers.length}`,
          badgeColor: 'bg-purple-600 text-white font-bold',
          permission: 'canAccessSettings',
        },
        {
          id: 'shifts',
          label: text.shifts || 'វេនលក់បុគ្គលិក ⏰',
          subLabel: 'Shift Cash Control',
          icon: Clock3,
          iconBg: 'bg-cyan-100 text-cyan-600',
          iconColor: 'text-cyan-600',
          badge: null,
          badgeColor: '',
          permission: 'canAccessPos',
        },
      ],
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
      <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto">
        {/* Main Menu Hero Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 border border-pink-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 text-white flex items-center justify-center text-sm shadow-md shadow-pink-500/20 animate-pulse">
              ✨
            </span>
            <div>
              <div className="font-muol text-xs text-slate-900 tracking-wide flex items-center gap-1.5">
                <span>មឺនុយចម្បង</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="text-[9px] font-bold text-pink-600 uppercase tracking-widest font-sans">
                Main Menu • Navigation
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white text-pink-700 text-[10px] font-black border border-pink-200/80 shadow-2xs">
            POS Pro
          </span>
        </div>

        {/* Categorized Menu Groups */}
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <span>{section.sectionIcon}</span>
                <span>{section.sectionTitle}</span>
              </span>
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isAllowed = !item.permission || hasPermission(item.permission);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id, item.permission)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl font-bold text-xs tracking-normal transition-all duration-200 relative group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white shadow-md shadow-pink-500/30 scale-[1.02] ring-2 ring-pink-300'
                        : isAllowed
                        ? 'text-slate-700 hover:bg-white hover:text-pink-600 hover:shadow-xs hover:border hover:border-pink-100/80'
                        : 'text-slate-400 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                          isActive
                            ? 'bg-white/25 text-white shadow-xs'
                            : isAllowed
                            ? `${item.iconBg} shadow-2xs`
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left truncate">
                        <div className={`truncate leading-tight font-battambang ${isActive ? 'font-black text-white' : 'font-bold'}`}>
                          {item.label}
                        </div>
                        <div className={`text-[9px] truncate ${isActive ? 'text-pink-100' : 'text-slate-400'}`}>
                          {item.subLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
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
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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

        {/* Logout / Lock Store Button */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`តើអ្នកពិតជាចង់ចាកចេញពីគណនី «${currentStaff.name}» និងចាក់សោប្រព័ន្ធមែនទេ?`)) {
              onCloseMobile?.();
              logoutAndLock();
            }
          }}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl font-bold text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border border-transparent hover:border-rose-200/80 shadow-2xs cursor-pointer group"
          title="ចាកចេញពីគណនី និងចាក់សោហាង"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-rose-500 transition-transform group-hover:scale-110" />
            <span>ចាកចេញ (Logout) 🚪</span>
          </div>
          <span className="text-[10px] text-rose-600 font-bold bg-rose-100/70 px-2 py-0.5 rounded-full border border-rose-200">
            Lock
          </span>
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
                  <div className="font-muol text-xs text-slate-800 tracking-wide">{storeInfo.nameKh || 'ម៉ឺនុយហាងនំ'}</div>
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
