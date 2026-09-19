import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Cake,
  PieChart,
  Croissant,
  Coffee,
  Flame,
  Plus,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { ProductCard } from './ProductCard';
import { CartPanel } from './CartPanel';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { AddProductModal } from './AddProductModal';
import { Product, CompletedSale } from '../../types';
import { soundFx } from '../../utils/audio';

export const PosTerminal: React.FC = () => {
  const { lang, categories, products, addToCart, cart, cartTotalKhr, cartTotalUsd } = useBakery();
  const text = t[lang];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutOptions, setCheckoutOptions] = useState<{ isDeposit?: boolean; depositKhr?: number }>({});
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<CompletedSale | null>(null);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Pressing "/" or "Ctrl+K" focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' && document.activeElement !== searchInputRef.current) || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.categoryId === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.nameKh.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cake':
        return <Cake className="w-4 h-4" />;
      case 'PieChart':
        return <PieChart className="w-4 h-4" />;
      case 'Croissant':
        return <Croissant className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Products catalog area */}
      <div className="flex-1 flex flex-col min-w-0 p-3 sm:p-6 overflow-y-auto pb-28 lg:pb-6">
        {/* Search & Category Tabs */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input with shortcut chip */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.searchPlaceholder}
                className="w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white/90 backdrop-blur-md border border-rose-100 rounded-2xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-2xs transition-all font-medium"
              />
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-mono rounded-lg">
                /
              </span>
            </div>

            {/* Actions: Add New Product & Mobile Cart Trigger */}
            <div className="flex items-center gap-2">
              {/* Quick Cart Button on Mobile */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsMobileCartOpen(true);
                }}
                className="lg:hidden px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-2xl text-xs transition-all border border-pink-200/80 flex items-center gap-1.5 cursor-pointer shadow-2xs relative active:scale-95"
                title="មើលកន្ត្រក"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>កន្ត្រក</span>
                {totalCartItems > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-black">
                    {totalCartItems}
                  </span>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{filteredProducts.length} មុខ</span>
              </div>

              <button
                onClick={() => {
                  soundFx.playPop();
                  setIsAddProductOpen(true);
                }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-2xl text-xs transition-all shadow-2xs border border-pink-200/80 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">+ Upload រូបភាពនំថ្មី</span>
                <span className="sm:hidden">+ នំថ្មី</span>
              </button>
            </div>
          </div>

          {/* Category Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const catName = lang === 'km' ? cat.nameKh : cat.nameEn;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundFx.playPop();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 shadow-2xs active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-102'
                      : 'bg-white/90 text-slate-600 hover:bg-white hover:text-pink-600 border border-rose-100/80 hover:shadow-xs'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 flex items-center justify-center mb-3">
              <Cake className="w-8 h-8 text-pink-300" />
            </div>
            <p className="font-bold text-slate-700">រកមិនឃើញមុខនំ ឬទំនិញដែលស្វែងរកទេ</p>
            <p className="text-xs text-slate-400 mt-1">សូមសាកល្បងស្វែងរកឈ្មោះផ្សេង ឬចុច Upload នំថ្មី</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p: Product) => addToCart(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 1. Desktop Cart Side Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex">
        <CartPanel
          onCheckout={(opts) => {
            setCheckoutOptions(opts || {});
            setIsCheckoutOpen(true);
          }}
        />
      </div>

      {/* 2. Mobile Floating Sticky Cart Bar */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-3 right-3 z-20">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setIsMobileCartOpen(true);
            }}
            className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-pink-600/30 flex items-center justify-between transition-all active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-pink-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartItems}
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs font-black">{totalCartItems} មុខក្នុងកន្ត្រក</div>
                <div className="text-[11px] text-pink-100 font-bold">
                  សរុប៖ {cartTotalKhr.toLocaleString()} ៛
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white text-pink-600 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs">
              <span>មើលកន្ត្រក & គិតលុយ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* 3. Mobile Cart Bottom Sheet Modal */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileCartOpen(false)}
          />
          {/* Sheet Container */}
          <div className="relative z-50 w-full max-h-[92vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <CartPanel
              isMobileSheet={true}
              onClose={() => setIsMobileCartOpen(false)}
              onCheckout={(opts) => {
                setIsMobileCartOpen(false);
                setCheckoutOptions(opts || {});
                setIsCheckoutOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(sale) => setActiveReceiptSale(sale)}
        initialIsDeposit={checkoutOptions.isDeposit}
        initialDepositKhr={checkoutOptions.depositKhr}
      />

      {/* Receipt Print Modal */}
      <ReceiptModal
        isOpen={!!activeReceiptSale}
        sale={activeReceiptSale}
        onClose={() => setActiveReceiptSale(null)}
      />
    </div>
  );
};
