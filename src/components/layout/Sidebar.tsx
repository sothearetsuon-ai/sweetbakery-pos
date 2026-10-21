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
  Palette,
  LogOut,
  Phone,
  PhoneCall,
  Link as LinkIcon,
  ShieldCheck,
  Rocket,
  Store,
  MessageCircle,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { StaffPermissions, ChatChannel } from '../../types';
import { AppTheme } from '../../utils/themeManager';
import { getStaffUnreadChatCount, subscribeToCustomerSessions } from '../../services/liveChatService';

export type TabType =
  | 'pos'
  | 'showcase'
  | 'custom-orders'
  | 'sales'
  | 'expenses'
  | 'reserve-fund'
  | 'inventory'
  | 'reports'
  | 'shifts'
  | 'staff'
  | 'chat';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSettings: (tab?: 'store' | 'khqr' | 'staff' | 'currency' | 'updates') => void;
  onOpenThemePicker?: () => void;
  onOpenContact?: () => void;
  onOpenCustomerOrderLinkModal?: () => void;
  onOpenCakeFlavors?: () => void;
  currentTheme?: AppTheme;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  availableUpdate?: import('../../services/appUpdateService').AppUpdateInfo | null;
  onOpenUpdateModal?: () => void;
  onOpenVoicePos?: () => void;
  onOpenKds?: () => void;
  onOpenBirthdayCrm?: () => void;
  onOpenBakingForecast?: () => void;
  onOpenStoreAuthModal?: () => void;
  onOpenChatModal?: (channel?: ChatChannel) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenThemePicker,
  onOpenContact,
  onOpenCustomerOrderLinkModal,
  onOpenCakeFlavors,
  currentTheme,
  isMobileOpen = false,
  onCloseMobile,
  availableUpdate,
  onOpenUpdateModal,
  onOpenVoicePos,
  onOpenKds,
  onOpenBirthdayCrm,
  onOpenBakingForecast,
  onOpenStoreAuthModal,
  onOpenChatModal,
}) => {
  const { lang, customOrders, lowStockCount, expenses, sales, currentStaff, hasPermission, staffMembers, storeInfo, logoutAndLock, isDemoMode, reserveFund } = useBakery();
  const text = t[lang];

  // Unread live chat count
  const [unreadChatCount, setUnreadChatCount] = React.useState<number>(() => getStaffUnreadChatCount());

  React.useEffect(() => {
    const unsub = subscribeToCustomerSessions((sessions) => {
      const total = sessions.reduce((acc, s) => acc + (s.unreadCountStaff || 0), 0);
      setUnreadChatCount(total);
    });
    return unsub;
  }, []);

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
        {
          id: 'chat' as TabType,
          label: 'ឆាតផ្ទាល់លើ App 💬',
          subLabel: 'Live In-App Chat',
          icon: MessageCircle,
          iconBg: 'bg-rose-100 text-rose-600',
          iconColor: 'text-rose-600',
          badge: unreadChatCount > 0 ? `${unreadChatCount}` : 'Live',
          badgeColor: unreadChatCount > 0 ? 'bg-rose-600 text-white font-bold animate-pulse' : 'bg-emerald-500 text-white font-bold',
          permission: 'canAccessPos',
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
          id: 'reserve-fund',
          label: 'ទុនបម្រុងហាង 🏦',
          subLabel: 'Reserve Fund & Petty Cash',
          icon: ShieldCheck,
          iconBg: 'bg-emerald-100 text-emerald-600',
          iconColor: 'text-emerald-600',
          badge:
            reserveFund &&
            Math.max(0, reserveFund.targetAmountKhr - reserveFund.currentBalanceKhr) > 0
              ? 'ខ្វះ'
              : null,
          badgeColor: 'bg-amber-500 text-white font-bold animate-pulse',
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
    if (tab === 'chat') {
      soundFx.playPop();
      onOpenChatModal?.('CUSTOMER');
      onCloseMobile?.();
      return;
    }
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
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">{currentStaff.avatar || '👤'}</span>
            <div className="text-left min-w-0">
              <div className="text-xs font-black text-slate-800 truncate">{currentStaff.name}</div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${
                currentStaff.role === 'ADMIN' ? 'text-amber-700' : 'text-purple-600'
              }`}>
                {currentStaff.role}
              </div>
            </div>
          </div>
          {!isDemoMode && (currentStaff.role === 'ADMIN' || hasPermission('canAccessSettings')) ? (
            <button
              onClick={() => {
                onOpenSettings('staff');
                onCloseMobile?.();
              }}
              className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer shrink-0"
              title="កំណត់សិទ្ធិបុគ្គលិកក្នុង Settings"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span
              className="px-2 py-0.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 text-[10px] font-bold shrink-0"
              title="តួនាទីបច្ចុប្បន្ន"
            >
              {currentStaff.role === 'CASHIER' ? 'បេឡាធិការ' : currentStaff.role}
            </span>
          )}
        </div>

        {/* In-App Live Chat Suite Button */}
        {onOpenChatModal && (
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenChatModal('CUSTOMER');
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-300/80 shadow-2xs transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-blue-950 flex items-center gap-1.5 font-battambang">
                  <span>ឆាតផ្ទាល់លើ App</span>
                </div>
                <div className="text-[10px] text-blue-700/80 font-medium">
                  ភ្ញៀវ ↔ អ្នកលក់ • AI • ក្រុមការងារ
                </div>
              </div>
            </div>
            {unreadChatCount > 0 ? (
              <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs animate-bounce">
                {unreadChatCount} ថ្មី
              </span>
            ) : (
              <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                Live
              </span>
            )}
          </button>
        )}

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

        {/* Cake Flavors & Stock Button */}
        {onOpenCakeFlavors && (
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenCakeFlavors();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-300/80 shadow-2xs transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center text-sm shadow-sm shadow-purple-500/25 group-hover:scale-105 transition-transform">
                🧁
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-purple-950 flex items-center gap-1.5 font-battambang">
                  <span>រសជាតិនំ & ស្តុក</span>
                </div>
                <div className="text-[10px] text-purple-700/80 font-medium">
                  កំណត់រសជាតិមាន ឬអស់ស្តុក
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
              ស្តុក
            </span>
          </button>
        )}

        {/* Kitchen Oven Status Card / KDS Trigger */}
        <div
          onClick={() => {
            soundFx.playPop();
            onOpenKds?.();
            onCloseMobile?.();
          }}
          className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-orange-200/80 shadow-2xs hover:border-orange-300 transition-all cursor-pointer group"
          title="ចុចដើម្បីបើកអេក្រង់ផ្ទះបាយ KDS (Kitchen Display System)"
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
              <span className="group-hover:text-orange-700">ផ្ទះបាយ KDS • កំពុងដុត</span>
            </span>
            <span className="text-[10px] bg-orange-200/60 text-orange-800 px-1.5 py-0.5 rounded-md font-mono font-bold">
              {pendingCakeOrdersCount > 0 ? `${pendingCakeOrdersCount} នំ` : '180°C'}
            </span>
          </div>
          <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(20, pendingCakeOrdersCount * 25))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-amber-700/80 mt-1.5 font-medium">
            <span>នំរង់ចាំ៖ {pendingCakeOrdersCount} នំ</span>
            <span className="font-bold text-orange-600 group-hover:underline">បើក KDS →</span>
          </div>
        </div>

        {/* Khmer Voice POS button */}
        {onOpenVoicePos && (
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenVoicePos();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl font-bold text-xs text-pink-700 bg-pink-50/70 hover:bg-pink-100/80 transition-all border border-pink-200/70 shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm group-hover:scale-125 transition-transform">🎙️</span>
              <span>POS បញ្ជាសំឡេងខ្មែរ</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-200/80 text-pink-800 font-mono">
              Voice
            </span>
          </button>
        )}

        {/* Birthday CRM button */}
        {onOpenBirthdayCrm && (
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenBirthdayCrm();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl font-bold text-xs text-purple-700 bg-purple-50/70 hover:bg-purple-100/80 transition-all border border-purple-200/70 shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm group-hover:scale-125 transition-transform">🎂</span>
              <span>CRM រំលឹកខួបកំណើត</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-800 font-mono">
              CRM
            </span>
          </button>
        )}

        {/* AI Baking Forecast button */}
        {onOpenBakingForecast && (
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenBakingForecast();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl font-bold text-xs text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all border border-emerald-200/70 shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm group-hover:scale-125 transition-transform">📊</span>
              <span>ផែនការដុតនំ AI</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 font-mono">
              Plan
            </span>
          </button>
        )}


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

        {/* In-App Update Button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            if (onOpenUpdateModal) {
              onOpenUpdateModal();
            } else {
              onOpenSettings('updates');
            }
            onCloseMobile?.();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl font-bold text-xs transition-all shadow-2xs cursor-pointer group ${
            availableUpdate?.hasUpdate
              ? 'text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md shadow-pink-500/25 border border-pink-400/80 animate-pulse'
              : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80'
          }`}
          title="ពិនិត្យមើលកំណែថ្មី & ទាញយកអាប់ដែតក្នុង App"
        >
          <div className="flex items-center gap-2.5">
            <Rocket className={`w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
              availableUpdate?.hasUpdate ? 'text-amber-300 animate-bounce' : 'text-indigo-600'
            }`} />
            <span className="font-battambang">ទាញយកកំណែអាប់ដេត 🚀</span>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
            availableUpdate?.hasUpdate
              ? 'bg-amber-300 text-slate-900 border-amber-400 font-mono shadow-xs'
              : 'bg-indigo-200/80 text-indigo-700 border-indigo-300 font-mono'
          }`}>
            {availableUpdate?.hasUpdate ? `v${availableUpdate.latestVersion} NEW` : `v${availableUpdate?.latestVersion || '1.6.7'}`}
          </span>
        </button>


        {/* Multi-Store & Cloud Tenant Account */}
        {onOpenStoreAuthModal && (
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onOpenStoreAuthModal();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl font-bold text-xs text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/80 transition-all shadow-2xs cursor-pointer group"
            title="គណនីហាង & Multi-Store (ចូលគណនី / បង្កើតហាងថ្មី / ភ្ជាប់ Store ID)"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-rose-600 transition-transform group-hover:scale-110" />
              <span className="font-battambang">គណនីហាង (Multi-Store)</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-800 font-battambang">
              Tenant
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
