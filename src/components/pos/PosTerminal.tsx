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
  QrCode,
  Volume2,
  ArrowUpDown,
  PackageCheck,
  PackageX,
  Clock,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { ProductCard } from './ProductCard';
import { CartPanel } from './CartPanel';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { AddProductModal } from './AddProductModal';
import { PartyAccessoriesModal } from './PartyAccessoriesModal';
import { KhqrStandeeModal } from './KhqrStandeeModal';
import { Product, CompletedSale } from '../../types';
import { soundFx } from '../../utils/audio';
import { sortProductsForPos, PosSortMode } from '../../utils/productUtils';
import { paymentListener, PaymentNotification } from '../../services/paymentListener';

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
  const [isKhqrStandeeOpen, setIsKhqrStandeeOpen] = useState(false);
  const [checkoutOptions, setCheckoutOptions] = useState<{
    isDeposit?: boolean;
    depositKhr?: number;
    customerName?: string;
    customerPhone?: string;
    pickupDate?: string;
    pickupTime?: string;
    notes?: string;
    paymentMethod?: 'CASH_KHR' | 'CASH_USD' | 'KHQR_BAKONG';
  }>({});
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<CompletedSale | null>(null);

  // POS Sorting & Stock Filter State
  const [posSortMode, setPosSortMode] = useState<PosSortMode>(() => {
    try {
      return (localStorage.getItem('sweetbakery_pos_sort_mode') as PosSortMode) || 'smart_stock';
    } catch (_) {
      return 'smart_stock';
    }
  });
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const handleSortChange = (newMode: PosSortMode) => {
    setPosSortMode(newMode);
    try {
      localStorage.setItem('sweetbakery_pos_sort_mode', newMode);
    } catch (_) {}
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Live Payment Soundbox Toast State
  const [livePaymentNotification, setLivePaymentNotification] = useState<PaymentNotification | null>(null);
  const livePaymentTimeoutRef = useRef<any>(null);

  // Subscribe to real-time incoming payments while on the main POS screen
  useEffect(() => {
    const unsub = paymentListener.subscribe((payment) => {
      // Show floating soundbox toast
      setLivePaymentNotification(payment);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.1 },
      });

      if (livePaymentTimeoutRef.current) clearTimeout(livePaymentTimeoutRef.current);
      livePaymentTimeoutRef.current = setTimeout(() => {
        setLivePaymentNotification(null);
      }, 7000);
    });

    return () => {
      unsub();
      if (livePaymentTimeoutRef.current) clearTimeout(livePaymentTimeoutRef.current);
    };
  }, []);

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

  // Category-filtered products (excluding decoration materials / party supplies from POS)
  const baseCategoryProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.categoryId === 'party') return false;
      return selectedCategory === 'all' || p.categoryId === selectedCategory;
    });
  }, [products, selectedCategory]);

  // Current category stock counts
  const inStockCount = useMemo(() => {
    return baseCategoryProducts.filter((p) => Number(p.stockQty ?? 0) > 0).length;
  }, [baseCategoryProducts]);

  const outOfStockCount = useMemo(() => {
    return baseCategoryProducts.filter((p) => Number(p.stockQty ?? 0) <= 0).length;
  }, [baseCategoryProducts]);

  // Filter products for POS terminal with smart sorting
  // (In-stock items on top, newest items at very top, out-of-stock items at bottom)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = baseCategoryProducts.filter((p) => {
      const matchesSearch =
        !q ||
        p.nameKh.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const currentStock = Number(p.stockQty ?? 0);
      if (stockFilter === 'in_stock') return currentStock > 0;
      if (stockFilter === 'out_of_stock') return currentStock <= 0;
      return true;
    });

    return sortProductsForPos(list, posSortMode);
  }, [baseCategoryProducts, searchQuery, stockFilter, posSortMode]);

  const inStockProducts = useMemo(() => {
    return filteredProducts.filter((p) => Number(p.stockQty ?? 0) > 0);
  }, [filteredProducts]);

  const outOfStockProducts = useMemo(() => {
    return filteredProducts.filter((p) => Number(p.stockQty ?? 0) <= 0);
  }, [filteredProducts]);

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

      {/* Live KHQR Payment Soundbox Floating Toast */}
      {livePaymentNotification && (
        <div className="absolute top-3 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
          <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-2xl shadow-emerald-900/40 border-2 border-emerald-300/60 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                  <span>🔔 KHQR សារប្រាក់ចូល (Soundbox)</span>
                </div>
                <div className="text-base font-black text-white leading-tight">
                  +{livePaymentNotification.amount.toLocaleString()} {livePaymentNotification.currency}
                </div>
                <div className="text-[10px] text-emerald-100">
                  {livePaymentNotification.bankName || 'Bakong KHQR'} • បានផ្ទៀងផ្ទាត់
                </div>
              </div>
            </div>
            <button
              onClick={() => setLivePaymentNotification(null)}
              className="text-emerald-200 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Products catalog area */}
      <div className="flex-1 flex flex-col min-w-0 p-3 sm:p-6 overflow-y-auto pb-28 lg:pb-6">
        {/* Search & Category Tabs (Sticky at top when scrolling products) */}
        <div className="sticky -top-3 sm:-top-6 z-20 bg-white/95 backdrop-blur-md pt-2 sm:pt-6 pb-2 sm:pb-2.5 mb-2.5 sm:mb-5 space-y-2 sm:space-y-4 border-b border-rose-100/80 shadow-2xs -mx-3 sm:-mx-6 px-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            {/* Search Input with shortcut chip & instant clear button */}
            <div className="relative flex-1 min-w-[170px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="ស្វែងរកនំ ឬស្កេនបាកូដ..."
                className="w-full pl-9 sm:pl-11 pr-14 sm:pr-20 py-2 sm:py-3 bg-white/95 border border-rose-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-400 shadow-xs transition-all font-semibold"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="សម្អាតការស្វែងរក"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-mono rounded-lg">
                  /
                </span>
              </div>
            </div>

            {/* Actions: Add New Product & Mobile Cart Trigger */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Quick KHQR Standee Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsKhqrStandeeOpen(true);
                }}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                title="បង្ហាញផ្ទាំងស្កេន KHQR លើតុគិតប្រាក់ (Counter Standee)"
              >
                <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                <span className="hidden sm:inline">KHQR ហាង</span>
                <span className="sm:hidden">KHQR</span>
              </button>

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
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs font-black transition-all shadow-md flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 ${
                  totalCartItems > 0
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-500 text-white shadow-pink-500/25 ring-2 ring-pink-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
                title="បើកមើលកន្ត្រកទំនិញ (Cart) ឬចុច F2"
              >
                <div className="relative">
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 border shadow-2xs cursor-pointer active:scale-95 ${
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

              {/* Party Accessories Trigger */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsPartyAccessoriesOpen(true);
                }}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 hover:from-amber-500/20 hover:to-pink-500/20 text-pink-700 border border-pink-200/80 rounded-2xl text-[11px] sm:text-xs font-black transition-all shadow-2xs flex items-center gap-1 active:scale-95 cursor-pointer"
                title="គ្រប់គ្រង & ទិញគ្រឿងបន្ថែមសម្រាប់កម្មវិធី (Party Accessories)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">🎉 Party Add-ons</span>
                <span className="sm:hidden">Party</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playPop();
                  setIsAddProductOpen(true);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-[#FF6F68] to-[#E6514D] hover:brightness-105 text-white font-black rounded-2xl text-[11px] sm:text-xs transition-all shadow-md shadow-[#E6514D]/25 flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span className="hidden sm:inline">+ បញ្ចូលទំនិញ / នំថ្មី</span>
                <span className="sm:hidden">+ នំថ្មី</span>
              </button>
            </div>
          </div>

          {/* Category Tabs Bar (Includes all categories with product count badges) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const catName = lang === 'km' ? cat.nameKh : cat.nameEn;
              const count = cat.id === 'all'
                ? products.filter((p) => p.categoryId !== 'party').length
                : products.filter((p) => p.categoryId === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundFx.playPop();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-black whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer relative ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6F68] to-[#E6514D] text-white shadow-md shadow-[#E6514D]/30 scale-102 ring-2 ring-[#FFB4AE]'
                      : 'bg-white/95 text-slate-700 hover:bg-rose-50/70 hover:text-[#E6514D] border border-rose-100/80 hover:shadow-xs'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                  <span>{catName}</span>
                  <span
                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stock Filter & Smart Sort Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-100/70 text-xs">
            {/* Left: Stock Status Filters */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] font-bold text-slate-400 hidden lg:inline mr-0.5">ស្តុក៖</span>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setStockFilter('all');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                  stockFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                <span>ទាំងអស់</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  stockFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                }`}>
                  {baseCategoryProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setStockFilter('in_stock');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                  stockFilter === 'in_stock'
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30 ring-2 ring-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/70'
                }`}
                title="បង្ហាញតែនំដែលមានស្តុកក្នុងហាង"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>មានស្តុក</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  stockFilter === 'in_stock' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {inStockCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setStockFilter('out_of_stock');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                  stockFilter === 'out_of_stock'
                    ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30 ring-2 ring-rose-300'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70'
                }`}
                title="បង្ហាញតែនំដែលអស់ស្តុក ដើម្បីងាយស្រួលបន្ថែមស្តុក"
              >
                <PackageX className="w-3.5 h-3.5" />
                <span>អស់ស្តុក</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  stockFilter === 'out_of_stock' ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {outOfStockCount}
                </span>
              </button>
            </div>

            {/* Right: Smart Sort Mode Dropdown */}
            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsSortMenuOpen((prev) => !prev);
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1.5 border shadow-2xs active:scale-95 cursor-pointer ${
                  posSortMode === 'smart_stock'
                    ? 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200/90'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title="ជ្រើសរើសរបៀបតម្រៀបទំនិញក្នុង POS"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-pink-600" />
                <span>
                  {posSortMode === 'smart_stock' && '⚡ ស្តុក & ថ្មីមុន (ឆ្លាតវៃ)'}
                  {posSortMode === 'newest_first' && '🕒 នំថ្មីមុនគេ'}
                  {posSortMode === 'name_asc' && '🔤 តាមឈ្មោះ (A-Z)'}
                  {posSortMode === 'stock_desc' && '📊 ស្តុកច្រើនមុន'}
                </span>
              </button>

              {isSortMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-rose-100 p-1.5 z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    របៀបតម្រៀបទំនិញ POS
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleSortChange('smart_stock');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      posSortMode === 'smart_stock'
                        ? 'bg-pink-50 text-pink-700 font-black'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                      <div>
                        <div>⚡ ស្តុក & ថ្មីមុន (លំនាំដើម)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          មានស្តុកនៅលើ នំថ្មីលើបំផុត អស់ស្តុកទៅក្រោម
                        </div>
                      </div>
                    </div>
                    {posSortMode === 'smart_stock' && <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0 ml-1" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSortChange('newest_first');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      posSortMode === 'newest_first'
                        ? 'bg-pink-50 text-pink-700 font-black'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div>
                        <div>🕒 នំទើបបញ្ចូលថ្មីមុនគេ</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          តម្រៀបតាមថ្ងៃបញ្ចូលថ្មី ដោយមិនគិតស្តុក
                        </div>
                      </div>
                    </div>
                    {posSortMode === 'newest_first' && <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0 ml-1" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSortChange('name_asc');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      posSortMode === 'name_asc'
                        ? 'bg-pink-50 text-pink-700 font-black'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-500 shrink-0">A-Z</span>
                      <div>
                        <div>🔤 តាមឈ្មោះ (A-Z)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          តម្រៀបតាមលំដាប់តួអក្សរឈ្មោះនំ
                        </div>
                      </div>
                    </div>
                    {posSortMode === 'name_asc' && <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0 ml-1" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSortChange('stock_desc');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      posSortMode === 'stock_desc'
                        ? 'bg-pink-50 text-pink-700 font-black'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PackageCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div>
                        <div>📊 ស្តុកច្រើនទៅតិច</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          នំដែលមានចំនួនស្តុកច្រើនជាងគេនៅខាងលើ
                        </div>
                      </div>
                    </div>
                    {posSortMode === 'stock_desc' && <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0 ml-1" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16 px-4">
            <div className="w-20 h-20 rounded-3xl bg-pink-50 border border-pink-100 flex items-center justify-center mb-4 shadow-sm">
              <Cake className="w-10 h-10 text-pink-400 animate-bounce" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 text-center">
              ហាងថ្មីទទេរស្អាត មិនទាន់មានទំនិញនៅឡើយទេ
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md text-center leading-relaxed">
              អ្នកអាចចាប់ផ្តើមបញ្ចូលមុខទំនិញ នំខេក ឬភេសជ្ជៈដំបូងសម្រាប់ហាងរបស់អ្នកបានយ៉ាងងាយស្រួល
            </p>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsAddProductOpen(true);
              }}
              className="mt-5 px-5 py-2.5 bg-gradient-to-r from-[#FF6F68] to-[#E6514D] hover:brightness-105 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-rose-500/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ បន្ថែមនំដំបូងឥឡូវនេះ</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 flex items-center justify-center mb-3">
              <Cake className="w-8 h-8 text-pink-300" />
            </div>
            <p className="font-bold text-slate-700">
              {stockFilter === 'out_of_stock'
                ? 'អបអរសាទរ! មិនមានមុខនំណាអស់ស្តុកពីហាងឡើយ 🎉'
                : 'រកមិនឃើញមុខនំ ឬទំនិញដែលស្វែងរកទេ'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {stockFilter === 'out_of_stock'
                ? 'គ្រប់មុខនំទាំងអស់សុទ្ធតែមានស្តុកសម្រាប់លក់'
                : 'សូមសាកល្បងស្វែងរកឈ្មោះផ្សេង ឬចុច + នំថ្មី'}
            </p>
            {stockFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className="mt-3 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                បង្ហាញមុខទំនិញទាំងអស់វិញ
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4 pt-1 sm:pt-2">
            {/* If in smart_stock mode and showing all, render in-stock first, then banner, then out-of-stock */}
            {posSortMode === 'smart_stock' && stockFilter === 'all' && outOfStockProducts.length > 0 ? (
              <>
                {/* 1. In-stock products at the top (newest first) */}
                {inStockProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p: Product) => addToCart(p)}
                  />
                ))}

                {/* 2. Visual Divider Banner separating In-stock and Out-of-stock */}
                <div className="col-span-full my-1 sm:my-2 p-2.5 sm:p-3 bg-gradient-to-r from-rose-50/90 via-slate-50 to-amber-50/90 border border-rose-200/70 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span className="text-xs font-black text-rose-800">
                      មុខនំអស់ស្តុកពីហាង ({outOfStockProducts.length} មុខ)
                    </span>
                    <span className="text-[11px] text-slate-500 hidden md:inline">
                      — បានតម្រៀបទៅក្រោមគេ ដើម្បីកុំឱ្យរំខានដល់ការគិតប្រាក់
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setStockFilter('in_stock');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 text-[11px] transition-colors cursor-pointer"
                    >
                      លាក់នំអស់ស្តុក
                    </button>
                  </div>
                </div>

                {/* 3. Out-of-stock products at the bottom */}
                {outOfStockProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p: Product) => addToCart(p)}
                  />
                ))}
              </>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p: Product) => addToCart(p)}
                />
              ))
            )}
          </div>
        )}
      </div>
      {cart.length > 0 && !isCartDrawerOpen && (
        <div className="sm:hidden fixed bottom-16 left-3 right-3 z-30 flex gap-2">
          {/* Quick KHQR Direct Action on Mobile */}
          <button
            type="button"
            onClick={() => {
              soundFx.playChime();
              setCheckoutOptions({ paymentMethod: 'KHQR_BAKONG' });
              setIsCheckoutOpen(true);
            }}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-3.5 py-2.5 rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ring-2 ring-red-300 shrink-0 font-battambang"
            title="ស្កេន KHQR ភ្លាមៗ"
          >
            <QrCode className="w-5 h-5 text-white animate-pulse" />
            <span className="text-xs font-black">KHQR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setIsCartDrawerOpen(true);
            }}
            className="flex-1 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white p-2.5 rounded-2xl shadow-xl shadow-pink-600/30 flex items-center justify-between transition-all active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black relative">
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-pink-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartItems}
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs font-black">{totalCartItems} មុខ</div>
                <div className="text-[11px] text-pink-100 font-bold font-mono">
                  {cartTotalKhr.toLocaleString()} ៛
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white text-pink-600 px-2.5 py-1 rounded-xl text-xs font-black shadow-xs">
              <span>កន្ត្រក</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* 2. Desktop Floating Quick Cart Pill (Always Visible when Cart has items and drawer is closed) */}
      {cart.length > 0 && !isCartDrawerOpen && (
        <div className="hidden sm:flex fixed bottom-6 right-6 z-40 items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            type="button"
            onClick={() => {
              soundFx.playChime();
              setCheckoutOptions({ paymentMethod: 'KHQR_BAKONG' });
              setIsCheckoutOpen(true);
            }}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-3 rounded-full shadow-2xl shadow-red-600/35 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 border-white/50 font-battambang ring-2 ring-red-300"
            title="ស្កេន KHQR ភ្លាមៗ"
          >
            <QrCode className="w-4.5 h-4.5 text-white animate-pulse" />
            <span className="text-xs font-black">ស្កេន KHQR ({cartTotalKhr.toLocaleString()} ៛)</span>
          </button>

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
                onOpenKhqrStandee={() => setIsKhqrStandeeOpen(true)}
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
        initialPaymentMethod={checkoutOptions.paymentMethod}
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

      {/* Quick Counter Standee Modal */}
      <KhqrStandeeModal
        isOpen={isKhqrStandeeOpen}
        onClose={() => setIsKhqrStandeeOpen(false)}
      />
    </div>
  );
};
