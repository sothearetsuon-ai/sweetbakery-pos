import React from 'react';
import { ShoppingBag, Images, Cake, Wallet, Menu } from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { TabType } from './Sidebar';
import { soundFx } from '../../utils/audio';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMoreMenu,
}) => {
  const { customOrders, cart, expenses } = useBakery();

  const pendingCakeCount = customOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'BAKING' || o.status === 'DECORATING'
  ).length;

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    {
      id: 'pos' as TabType,
      label: 'លក់ (POS)',
      icon: ShoppingBag,
      badge: totalCartItems > 0 ? totalCartItems : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'showcase' as TabType,
      label: 'កាតាឡុក',
      icon: Images,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'custom-orders' as TabType,
      label: 'នំកុម្ម៉ង់',
      icon: Cake,
      badge: pendingCakeCount > 0 ? pendingCakeCount : null,
      badgeColor: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white animate-pulse',
    },
    {
      id: 'expenses' as TabType,
      label: 'ចំណាយ',
      icon: Wallet,
      badge: expenses.length > 0 ? `${expenses.length}` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-rose-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveTab(item.id);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl relative transition-all duration-200 cursor-pointer active:scale-90 ${
              isActive
                ? 'text-pink-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            {/* Active Indicator Pill */}
            {isActive && (
              <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
            )}

            <div className="relative mt-0.5">
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-pink-100/70 text-pink-600'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {item.badge !== null && (
                <span
                  className={`absolute -top-1 -right-1.5 px-1.5 py-0.2 text-[9px] font-black rounded-full shadow-2xs border border-white ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* More / Menu Button */}
      <button
        type="button"
        onClick={() => {
          soundFx.playPop();
          onOpenMoreMenu();
        }}
        className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl text-slate-500 hover:text-slate-800 font-bold relative transition-all duration-200 cursor-pointer active:scale-90"
      >
        <div className="p-1.5 rounded-xl mt-0.5 bg-slate-100 text-slate-600">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
          ច្រើនទៀត ☰
        </span>
      </button>
    </nav>
  );
};
