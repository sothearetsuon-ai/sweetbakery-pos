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
  Barcode,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { ProductCard } from './ProductCard';
import { CartPanel } from './CartPanel';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { AddProductModal } from './AddProductModal';
import { PartyAccessoriesModal } from './PartyAccessoriesModal';
import { Product, CompletedSale } from '../../types';
import { soundFx } from '../../utils/audio';
import { sortProductsNewestFirst } from '../../utils/productUtils';

export const PosTerminal: React.FC = () => {
  const {
    lang,
    categories,
    products,
    addToCart,
    cart,
    cartTotalKhr,
    cartTotalUsd,
    partyAddons,
    isDemoMode,
    hideDemoPrices,
    toggleHideDemoPrices,
  } = useBakery();
  const text = t[lang];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPartyAccessoriesOpen, setIsPartyAccessoriesOpen] = useState(false);
  const [checkoutOptions, setCheckoutOptions] = useState<{
    isDeposit?: boolean;
    depositKhr?: number;
    customerName?: string;
    customerPhone?: string;
    pickupDate?: string;
    pickupTime?: string;
    notes?: string;
  }>({});
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<CompletedSale | null>(null);

  // Barcode Scanner State & Buffer
  const [scanNotification, setScanNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    barcode: string;
    productName?: string;
  } | null>(null);
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const scanToastTimeoutRef = useRef<any>(null);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle scanned barcode execution
  const processScannedBarcode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Find product by barcode or id
    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === cleanCode.toLowerCase()) ||
        p.id.toLowerCase() === cleanCode.toLowerCase()
    );

    if (scanToastTimeoutRef.current) clearTimeout(scanToastTimeoutRef.current);

    if (matched) {
      addToCart(matched);
      soundFx.playSuccess();
      setScanNotification({
        message: `ស្កេនបានជោគជ័យ! បញ្ចូល «${matched.nameKh}» ក្នុងកន្ត្រក`,
        type: 'success',
        barcode: cleanCode,
        productName: matched.nameKh,
      });
      scanToastTimeoutRef.current = setTimeout(() => {
        setScanNotification(null);
      }, 3500);
    } else {
      soundFx.playPop();
      setScanNotification({
        message: `រកមិនឃើញទំនិញដែលមានបាកូដ [${cleanCode}] ទេ!`,
        type: 'error',
        barcode: cleanCode,
      });
      scanToastTimeoutRef.current = setTimeout(() => {
        setScanNotification(null);
      }, 4000);
    }
  };

  // Keyboard shortcut & Global Barcode Scanner Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      const isInputActive =
        targetTag === 'INPUT' || targetTag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;

      // Shortcut "/" or "Ctrl+K" to focus search input
      if (((e.key === '/' && !isInputActive) || (e.ctrlKey && e.key === 'k')) && !e.altKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Shortcut Escape to close Cart Drawer or F2 to toggle Cart Drawer
      if (e.key === 'Escape') {
        setIsCartDrawerOpen(false);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsCartDrawerOpen((prev) => !prev);
        return;
      }

      // Barcode Scanner Listener:
      // Barcode scanners enter characters rapidly (< 80ms per key) followed by 'Enter'
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If time between keys is too long, reset buffer
      if (timeDiff > 120) {
        barcodeBufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const candidateCode = barcodeBufferRef.current.trim();
        // If a barcode sequence of 3 or more chars was buffered
        if (candidateCode.length >= 3) {
          e.preventDefault();
          processScannedBarcode(candidateCode);
          barcodeBufferRef.current = '';
          return;
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Collect scanner characters
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (scanToastTimeoutRef.current) clearTimeout(scanToastTimeoutRef.current);
    };
  }, [products, addToCart]);

  // Handle Search Input KeyDown (if cashier scans or hits enter inside search input)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim();
      if (!q) return;

      const matched = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === q.toLowerCase()) ||
          p.nameKh.toLowerCase() === q.toLowerCase() ||
          p.id.toLowerCase() === q.toLowerCase()
      );

      if (matched) {
        e.preventDefault();
        addToCart(matched);
        soundFx.playSuccess();
        setSearchQuery('');
        if (scanToastTimeoutRef.current) clearTimeout(scanToastTimeoutRef.current);
        setScanNotification({
          message: `ស្កេនបានជោគជ័យ! បញ្ចូល «${matched.nameKh}» ក្នុងកន្ត្រក`,
          type: 'success',
          barcode: matched.barcode || matched.id,
          productName: matched.nameKh,
        });
        scanToastTimeoutRef.current = setTimeout(() => {
          setScanNotification(null);
        }, 3500);
      }
    }
  };

  // Filter products (newest first, matches category, name, or barcode)
  // Exclude decoration materials / party supplies from POS terminal
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      // Exclude decoration materials / party supplies from POS
      if (p.categoryId === 'party') return false;

      const matchesCategory =
        selectedCategory === 'all' || p.categoryId === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.nameKh.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
    return sortProductsNewestFirst(list);
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
      {/* Barcode Scan Floating Toast Notification */}
      {scanNotification && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md ${
              scanNotification.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-500/50 shadow-emerald-900/30'
                : 'bg-rose-950/95 text-white border-rose-500/50 shadow-rose-950/30'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                scanNotification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {scanNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-xs font-black tracking-tight">{scanNotification.message}</div>
              <div className="text-[10px] text-slate-300 font-mono">
                កូដបាកូដ: {scanNotification.barcode}
              </div>
            </div>
            <button
              onClick={() => setScanNotification(null)}
              className="text-slate-400 hover:text-white ml-1 p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Products catalog area */}
      <div className="flex-1 flex flex-col min-w-0 p-3 sm:p-6 overflow-y-auto pb-28 lg:pb-6">
        {/* Search & Category Tabs (Sticky at top when scrolling products) */}
        <div className="sticky -top-3 sm:-top-6 z-20 bg-white/90 backdrop-blur-md pt-3 sm:pt-6 pb-2.5 mb-3 sm:mb-5 space-y-3 sm:space-y-4 border-b border-rose-100/80 shadow-2xs -mx-3 sm:-mx-6 px-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input with shortcut chip */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="ស្វែងរកនំ ឬស្កេនបាកូដ..."
                className="w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 shadow-2xs transition-all font-semibold"
              />
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-mono rounded-lg">
                /
              </span>
            </div>

            {/* Actions: Add New Product & Mobile Cart Trigger */}
            <div className="flex items-center gap-2">
              {/* Barcode Scanner Ready Badge */}
              <div
                title="ម៉ាស៊ីនស្កេនបាកូដដំណើរការ៖ អាចស្កេនបាកូដទំនិញគ្រប់ពេលដើម្បីបញ្ចូលកន្ត្រកភ្លាមៗ"
                className="hidden xl:flex items-center gap-1.5 text-xs font-black text-pink-700 bg-pink-50 border border-pink-200/80 px-3 py-2 rounded-2xl shadow-2xs"
              >
                <Barcode className="w-4 h-4 text-pink-600 animate-pulse" />
                <span>ស្កេនបាកូដ (Auto)</span>
              </div>
              {/* Cart Drawer Trigger Button (Desktop & Mobile) */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsCartDrawerOpen((prev) => !prev);
                }}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
                  totalCartItems > 0
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-500 text-white shadow-pink-500/25 ring-2 ring-pink-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
                title="បើកមើលកន្ត្រកទំនិញ (Cart) ឬចុច F2"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-white text-pink-600 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {totalCartItems}
                    </span>
                  )}
                </div>
                <span>កន្ត្រក</span>
                {totalCartItems > 0 && (
                  <span className="hidden sm:inline font-mono text-[11px] bg-white/20 px-1.5 py-0.5 rounded-md text-white font-bold">
                    {cartTotalKhr.toLocaleString()} ៛
                  </span>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-black text-slate-600 bg-white px-3 py-2 rounded-2xl border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{filteredProducts.length} មុខទំនិញ</span>
              </div>

              {/* Demo Mode Hide/Show Price Toggle */}
              {isDemoMode && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    toggleHideDemoPrices();
                  }}
                  className={`px-3 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer active:scale-95 ${
                    hideDemoPrices
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border-amber-300 ring-2 ring-amber-300/30'
                      : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                  }`}
                  title={hideDemoPrices ? 'កំពុងបិទតម្លៃនំក្នុង Demo (ចុចដើម្បីបង្ហាញ)' : 'កំពុងបង្ហាញតម្លៃនំ (ចុចដើម្បីបិទ)'}
                >
                  {hideDemoPrices ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="hidden md:inline">បិទតម្លៃនំ (Demo) 🙈</span>
                      <span className="md:hidden">បិទតម្លៃ 🙈</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="hidden md:inline">បង្ហាញតម្លៃ 👁️</span>
                      <span className="md:hidden">បង្ហាញ 👁️</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  soundFx.playPop();
                  setIsAddProductOpen(true);
                }}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#FF6F68] to-[#E6514D] hover:brightness-105 text-white font-black rounded-2xl text-xs transition-all shadow-md shadow-[#E6514D]/25 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">+ Upload រូបភាពនំថ្មី</span>
                <span className="sm:hidden">+ នំថ្មី</span>
              </button>
            </div>
          </div>

          {/* Category Tabs Bar (Excludes decoration/party category) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories
              .filter((cat) => cat.id !== 'party')
              .map((cat) => {
                const isActive = selectedCategory === cat.id;
                const catName = lang === 'km' ? cat.nameKh : cat.nameEn;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-4 py-2 sm:py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 flex items-center gap-2 shadow-2xs active:scale-95 cursor-pointer relative ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF6F68] to-[#E6514D] text-white shadow-md shadow-[#E6514D]/30 scale-102 ring-2 ring-[#FFB4AE]'
                        : 'bg-white text-slate-800 hover:bg-[#FFF5F2] hover:text-[#E6514D] border border-[#F2DBD3] hover:shadow-xs'
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
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

      {/* 1. Mobile Floating Sticky Cart Bar */}
      {cart.length > 0 && !isCartDrawerOpen && (
        <div className="sm:hidden fixed bottom-16 left-3 right-3 z-30">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setIsCartDrawerOpen(true);
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
                <div className="text-[11px] text-pink-100 font-bold font-mono">
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

      {/* 2. Desktop Floating Quick Cart Pill (Always Visible when Cart has items and drawer is closed) */}
      {cart.length > 0 && !isCartDrawerOpen && (
        <div className="hidden sm:flex fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setIsCartDrawerOpen(true);
            }}
            className="bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white pl-4 pr-5 py-2.5 sm:py-3 rounded-full shadow-2xl shadow-pink-900/30 flex items-center gap-3 cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 border-white/40 group font-battambang"
            title="បើកមើលកន្ត្រកទំនិញ (Shortcut: F2)"
          >
            <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center font-black relative">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-white text-pink-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalCartItems}
              </span>
            </div>
            <div className="text-left">
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>{totalCartItems} មុខក្នុងកន្ត្រក</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-[11px] text-pink-100 font-bold font-mono">
                សរុប៖ {cartTotalKhr.toLocaleString()} ៛ (~${cartTotalUsd.toFixed(2)})
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 3. Slide-over Cart Drawer (Both Desktop & Mobile) */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with smooth blur */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            onClick={() => setIsCartDrawerOpen(false)}
          />

          {/* Drawer Slide-in from Right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 z-50">
            <div className="w-screen max-w-md sm:max-w-lg lg:max-w-xl bg-white shadow-2xl border-l border-rose-100 flex flex-col h-full animate-in slide-in-from-right duration-300 transform-gpu overflow-hidden">
              <CartPanel
                isDrawer={true}
                onClose={() => setIsCartDrawerOpen(false)}
                onCheckout={(opts) => {
                  setIsCartDrawerOpen(false);
                  setCheckoutOptions(opts || {});
                  setIsCheckoutOpen(true);
                }}
              />
            </div>
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
        initialCustomerName={checkoutOptions.customerName}
        initialCustomerPhone={checkoutOptions.customerPhone}
        initialPickupDate={checkoutOptions.pickupDate}
        initialPickupTime={checkoutOptions.pickupTime}
        initialNotes={checkoutOptions.notes}
      />

      {/* Receipt Print Modal */}
      <ReceiptModal
        isOpen={!!activeReceiptSale}
        sale={activeReceiptSale}
        onClose={() => setActiveReceiptSale(null)}
      />

      {/* Party Accessories Management Modal */}
      <PartyAccessoriesModal
        isOpen={isPartyAccessoriesOpen}
        onClose={() => setIsPartyAccessoriesOpen(false)}
      />
    </div>
  );
};
