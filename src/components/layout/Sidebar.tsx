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
  Phone,
  PhoneCall,
  Link as LinkIcon,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { useMusic } from '../../context/MusicContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { StaffPermissions } from '../../types';
import { AppTheme } from '../../utils/themeManager';

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
  onOpenContact?: () => void;
  onOpenCustomerOrderLinkModal?: () => void;
  currentTheme?: AppTheme;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenThemePicker,
  onOpenContact,
  onOpenCustomerOrderLinkModal,
  currentTheme,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { lang, customOrders, lowStockCount, expenses, sales, currentStaff, hasPermission, staffMembers, storeInfo, logoutAndLock, isDemoMode } = useBakery();
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
        ...(!isDemoMode
          ? [
              {
                id: 'staff' as TabType,
                label: 'បុគ្គលិក & សិទ្ធិ 👥',
                subLabel: 'Staff Management',
                icon: Users,
                iconBg: 'bg-violet-100 text-violet-600',
                iconColor: 'text-violet-600',
                badge: `${staffMembers.length}`,
                badgeColor: 'bg-purple-600 text-white font-bold',
                permission: 'canAccessSettings' as keyof StaffPermissions,
              },
            ]
          : []),
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
      if (isDemoMode) {
        soundFx.playPop();
        alert('🔒 មុខងារគ្រប់គ្រងបុគ្គលិក & សិទ្ធិ ត្រូវបានបិទក្នុង Demo Mode');
        return;
      }
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
    <div className="flex flex-col justify-between min-h-full">
      <div className="p-3 space-y-2.5">
        {/* Main Menu Hero Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FF6F68]/10 via-[#E6514D]/10 to-amber-500/10 border border-[#FFCCC6]/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6F68] via-[#E6514D] to-amber-500 text-white flex items-center justify-center text-sm shadow-md shadow-[#E6514D]/25 animate-pulse">
              ✨
            </span>
            <div>
              <div className="font-muol text-xs text-slate-900 tracking-wide flex items-center gap-1.5">
                <span>មឺនុយចម្បង</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="text-[9px] font-bold text-[#E6514D] uppercase tracking-widest font-sans">
                Main Menu • Navigation
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white text-[#C93833] text-[10px] font-black border border-[#FFCCC6] shadow-2xs">
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
                        ? 'bg-gradient-to-r from-[#FF6F68] via-[#FA5E57] to-[#E64C47] text-white shadow-md shadow-[#E64C47]/30 scale-[1.02] ring-2 ring-[#FFB4AE]'
                        : isAllowed
                        ? 'text-slate-700 hover:bg-white hover:text-[#E6514D] hover:shadow-xs hover:border hover:border-rose-100/80'
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
      <div className="p-3 space-y-2 border-t border-rose-100/50 bg-white/40">
        {/* Contact System Inquiries Card (Only in Demo Mode) */}
        {isDemoMode && (
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-amber-500/10 border border-rose-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-battambang">
                <Phone className="w-3.5 h-3.5 text-[#E6514D]" />
                <span>ទំនាក់ទំនងប្រព័ន្ធ</span>
              </span>
              <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-full font-mono">
                POS Software
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug font-medium font-battambang">
              ប្រសិនបើអ្នកមានចំណាប់អារម្មណ៍ចង់ប្រើប្រាស់កម្មវិធីនេះសូមទាក់ទង
            </p>
            <div className="flex items-center gap-1.5">
              <a
                href="tel:012629160"
                className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                title="ខលទៅកាន់លេខ 012 629 160"
              >
                <PhoneCall className="w-3 h-3" />
                <span>012 629 160</span>
              </a>
              {onOpenContact && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    onOpenContact();
                    onCloseMobile?.();
                  }}
                  className="py-1.5 px-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-[11px] rounded-xl border border-rose-200 transition-all cursor-pointer shadow-2xs shrink-0"
                  title="ព័ត៌មានលម្អិត"
                >
                  លម្អិត
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Staff Quick Info */}
        <div className="p-2.5 rounded-2xl bg-white border border-purple-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{currentStaff.avatar || '👤'}</span>
            <div className="text-left">
              <div className="text-xs font-black text-slate-800">{currentStaff.name}</div>
              <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{currentStaff.role}</div>
            </div>
          </div>
          {!isDemoMode && (
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
          )}
        </div>

        {/* Customer Self-Ordering Link Button */}
        {onOpenCustomerOrderLinkModal && (
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenCustomerOrderLinkModal();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border border-pink-300/80 shadow-2xs transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center text-sm shadow-sm shadow-pink-500/25 group-hover:scale-105 transition-transform">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-pink-900 flex items-center gap-1.5 font-battambang">
                  <span>លីងកុម្ម៉ង់សម្រាប់ភ្ញៀវ</span>
                </div>
                <div className="text-[10px] text-pink-700/80 font-medium">
                  ចែករំលែក Link & QR Code
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black bg-pink-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
              QR
            </span>
          </button>
        )}

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
              <span className="text-base group-hover:scale-125 transition-transform">
                {currentTheme?.emoji || '🎨'}
              </span>
              <span className="font-battambang">ប្តូរពណ៌ផ្ទៃ & Theme</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-battambang ${
                currentTheme?.category === 'festival'
                  ? currentTheme.badgeClass
                  : 'text-pink-600 bg-pink-50 border-pink-100'
              }`}
            >
              {currentTheme?.category === 'festival' ? '🎉 ' : ''}
              {currentTheme?.nameKh?.split(' ')[0] || 'Themes'}
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
    </div>
  );

  return (
    <>
      {/* 1. Desktop Permanent Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 glass-panel border-r border-[#F2DBD3] flex-col shrink-0 h-full overflow-y-auto scrollbar-thin">
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
            <div className="p-4 border-b border-[#F2DBD3] flex items-center justify-between bg-gradient-to-r from-[#FFF5F2] to-[#FFEFEA]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF6F68] to-[#E6514D] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#E6514D]/25">
                  🎂
                </div>
                <div>
                  <div className="font-muol text-xs text-slate-800 tracking-wide">{storeInfo.nameKh || 'ម៉ឺនុយហាងនំ'}</div>
                  <div className="text-[10px] text-[#E6514D] font-bold">SweetBakery POS</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-xl bg-white border border-[#F2DBD3] text-slate-500 flex items-center justify-center hover:bg-[#FFF5F2] cursor-pointer shadow-2xs"
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
