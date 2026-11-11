import React, { useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  ShoppingBag,
  QrCode,
  CheckCircle2,
  Clock,
  Phone,
  Maximize2,
  Minimize2,
  Store,
  ChevronRight,
  ChevronLeft,
  Heart,
  Star,
  Flame,
  Sun,
  Moon,
  Gift,
  Award,
  Layers,
  Check,
  Calendar,
  MessageCircle,
  ZoomIn,
  X,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { Product, CompletedSale } from '../../types';
import { soundFx } from '../../utils/audio';
import {
  customerDisplaySync,
  CustomerDisplayState,
} from '../../services/customerDisplaySync';
import { setStoreId, saveFirestoreDoc, getStoreId } from '../../services/firebase';
import { getProductImageUrl } from '../../utils/imagePath';
import { roundKhr } from '../../utils/currencyUtils';
import { getEReceiptWebUrl } from '../../utils/eReceiptUrl';
import { QrCodeImage } from '../common/QrCodeImage';

type DisplayTheme = 'dark' | 'light';
type IdleTab = 'menu' | 'spotlight' | 'qr' | 'promo';

export const CustomerDisplayView: React.FC = () => {
  const { storeInfo, exchangeRate, products, categories } = useBakery();
  const [displayState, setDisplayState] = useState<CustomerDisplayState>(() =>
    customerDisplaySync.getCurrentState()
  );
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [menuPage, setMenuPage] = useState(0);
  const [idleTab, setIdleTab] = useState<IdleTab>('menu');
  const [theme, setTheme] = useState<DisplayTheme>(() => {
    try {
      return (localStorage.getItem('sweetbakery_customer_display_theme') as DisplayTheme) || 'dark';
    } catch (_) {
      return 'dark';
    }
  });

  const [orderedToast, setOrderedToast] = useState<{ nameKh: string; time: number } | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [imageFitMode, setImageFitMode] = useState<'contain' | 'cover'>(() => {
    try {
      return (
        (localStorage.getItem('sweetbakery_customer_display_img_fit') as 'contain' | 'cover') ||
        'contain'
      );
    } catch (_) {
      return 'contain';
    }
  });

  const customerEReceiptUrl = useMemo(() => {
    const saleLike: CompletedSale = {
      id: displayState.orderNumber || '0001',
      orderNumber: displayState.orderNumber || '0001',
      createdAt: new Date().toISOString(),
      cashierName: displayState.cashierName || 'Staff',
      items: (displayState.items || []).map((i) => ({
        productId: i.id,
        nameKh: i.nameKh,
        nameEn: i.nameEn,
        priceKhr: i.unitPriceKhr,
        priceUsd: i.unitPriceUsd,
        quantity: i.quantity,
      })),
      subtotalUsd: displayState.subtotalUsd,
      discountUsd: displayState.discountKhr ? displayState.discountKhr / exchangeRate : 0,
      discountKhr: displayState.discountKhr,
      totalKhr: displayState.totalKhr,
      totalUsd: displayState.totalUsd,
      paymentMethod: (displayState.paidCurrency === 'KHR' ? 'CASH_KHR' : 'CASH_USD') as any,
      isDeposit: displayState.isDeposit,
      depositKhr: displayState.depositKhr,
      depositUsd: displayState.depositKhr ? displayState.depositKhr / exchangeRate : undefined,
      paidKhr: displayState.paidCurrency === 'KHR' ? displayState.paidAmount : undefined,
      paidUsd: displayState.paidCurrency === 'USD' ? displayState.paidAmount : undefined,
    };
    return getEReceiptWebUrl(saleLike, storeInfo, exchangeRate);
  }, [displayState, storeInfo, exchangeRate]);

  const toggleImageFitMode = () => {
    setImageFitMode((prev) => {
      const next = prev === 'contain' ? 'cover' : 'contain';
      try {
        localStorage.setItem('sweetbakery_customer_display_img_fit', next);
      } catch (_) {}
      return next;
    });
  };

  const handleCustomerOrderProduct = (p: Product) => {
    soundFx.playPop();
    customerDisplaySync.sendCustomerSelection(p);
    setOrderedToast({
      nameKh: p.nameKh || p.nameEn || 'នំខេក',
      time: Date.now(),
    });
  };

  // 5-Star Customer Feedback State (Dual-screen interactive)
  const [customerRating, setCustomerRating] = useState<number | null>(null);
  const [selectedFeedbackTags, setSelectedFeedbackTags] = useState<string[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (displayState.status !== 'paid') {
      setCustomerRating(null);
      setSelectedFeedbackTags([]);
      setFeedbackSubmitted(false);
    }
  }, [displayState.status]);

  const handleRateStar = (star: number) => {
    soundFx.playSuccess();
    setCustomerRating(star);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#F59E0B', '#FBBF24', '#F43F5E', '#10B981'],
    });
  };

  const handleToggleFeedbackTag = (tag: string) => {
    soundFx.playPop();
    setSelectedFeedbackTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitFeedback = async () => {
    soundFx.playSuccess();
    setFeedbackSubmitted(true);

    const feedbackPayload = {
      id: `fb_${Date.now()}`,
      rating: customerRating || 5,
      tags: selectedFeedbackTags,
      orderNumber: displayState.orderNumber || '',
      amountKhr: displayState.paidAmount || displayState.totalKhr || 0,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    };

    // Save locally
    try {
      const key = 'sweetbakery_customer_ratings';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(feedbackPayload);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
    } catch (_) {}

    // Cloud sync
    try {
      saveFirestoreDoc('customer_feedback', feedbackPayload.id, feedbackPayload);
    } catch (_) {}
  };

  useEffect(() => {
    if (!orderedToast) return;
    const timer = setTimeout(() => {
      setOrderedToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [orderedToast]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('sweetbakery_customer_display_theme', next);
      } catch (_) {}
      return next;
    });
  };

  // Ensure storeId is bound from URL if opened on separate device
  useEffect(() => {
    try {
      const urlStoreId = new URLSearchParams(window.location.search).get('storeId');
      if (urlStoreId && urlStoreId.trim()) {
        setStoreId(urlStoreId.trim());
        customerDisplaySync.setupCloudSync();
      }
    } catch (_) {}
  }, []);

  // Subscribe to live dual-screen updates
  useEffect(() => {
    const unsub = customerDisplaySync.subscribe((state) => {
      setDisplayState(state);
      if (state.status === 'paid') {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#F43F5E', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#A855F7'],
        });
      }
    });

    return () => unsub();
  }, []);

  // Update clock & date every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString('km-KH', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Showcase Products for Carousel & Menu Grid
  const validProducts = useMemo(
    () => products.filter((p) => p.categoryId !== 'party'),
    [products]
  );
  const showcaseProducts = useMemo(
    () => (validProducts.length > 0 ? validProducts.slice(0, 12) : products.slice(0, 8)),
    [validProducts, products]
  );

  // Auto-rotate spotlight carousel in idle mode
  useEffect(() => {
    if (displayState.status !== 'idle' || showcaseProducts.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % showcaseProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayState.status, showcaseProducts.length]);

  // Auto-paginate menu grid in idle mode
  const ITEMS_PER_PAGE = 6;
  const totalMenuPages = Math.ceil(showcaseProducts.length / ITEMS_PER_PAGE) || 1;
  useEffect(() => {
    if (displayState.status !== 'idle' || totalMenuPages <= 1 || idleTab !== 'menu') return;
    const interval = setInterval(() => {
      setMenuPage((prev) => (prev + 1) % totalMenuPages);
    }, 7000);
    return () => clearInterval(interval);
  }, [displayState.status, totalMenuPages, idleTab]);

  const pagedMenuProducts = useMemo(() => {
    const start = menuPage * ITEMS_PER_PAGE;
    return showcaseProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [showcaseProducts, menuPage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentShowcaseProduct = showcaseProducts[carouselIndex] || showcaseProducts[0];

  // Store QR code fallback
  const merchantName = storeInfo.khqrMerchantName || storeInfo.nameEn || 'Sweet Bakery';
  const bakongId = storeInfo.khqrBakongId || 'sweetbakery@aclb';
  const fallbackQrData = `bakong://pay?merchant=${encodeURIComponent(merchantName)}&account=${encodeURIComponent(bakongId)}`;
  const autoStoreQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fallbackQrData)}`;
  const storeQrImage = storeInfo.khqrQrImage ? getProductImageUrl(storeInfo.khqrQrImage) : autoStoreQr;

  // Customer Self-Order Link URL
  const customerOrderUrl = useMemo(() => {
    const currentStoreId = getStoreId();
    const storeParam = currentStoreId ? `&storeId=${encodeURIComponent(currentStoreId)}` : '';
    const customUrl = storeInfo.customerPortalUrl || storeInfo.website;
    if (
      customUrl &&
      (customUrl.startsWith('http://') || customUrl.startsWith('https://')) &&
      !customUrl.includes('androidplatform.net') &&
      !customUrl.includes('appassets')
    ) {
      const base = customUrl.replace(/\/+$/, '');
      const withOrder = base.includes('?order=true') ? base : `${base}/?order=true`;
      return `${withOrder}${storeParam}#order`;
    }
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      const pathname = window.location.pathname || '/';
      const isLocalOrContainer =
        !origin ||
        origin.startsWith('file:') ||
        origin === 'null' ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('androidplatform.net') ||
        origin.includes('appassets') ||
        Boolean((window as any).SweetBakeryDesktop) ||
        Boolean((window as any).SweetBakeryNative);

      if (!isLocalOrContainer && (origin.startsWith('http://') || origin.startsWith('https://'))) {
        const cleanPath = pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
        return `${origin}${cleanPath}/?order=true${storeParam}#order`;
      }
    }
    return `https://sothearetsuon-ai.github.io/sweetbakery-pos/?order=true${storeParam}#order`;
  }, [storeInfo.customerPortalUrl, storeInfo.website]);

  // Customer Self-Order with Promo Applied URL
  const promoOrderUrl = useMemo(() => {
    return customerOrderUrl.includes('?') 
      ? customerOrderUrl.replace('?order=true', '?order=true&promo=app')
      : `${customerOrderUrl}?order=true&promo=app`;
  }, [customerOrderUrl]);

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen h-[100dvh] flex flex-col font-sans select-none overflow-hidden relative transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-slate-100'
          : 'bg-gradient-to-br from-rose-50/70 via-white to-pink-50/60 text-slate-800'
      }`}
    >
      {/* Toast Notification when customer taps a cake */}
      {orderedToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center gap-3 animate-in zoom-in-95 duration-200">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg animate-bounce shrink-0">
            🎉
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black flex items-center gap-2">
              <span>បានបញ្ជូន "{orderedToast.nameKh}" ទៅកាន់ Cashier!</span>
              <span className="px-1.5 py-0.5 rounded-md bg-yellow-400 text-black text-[10px] font-mono font-bold">+1</span>
            </div>
            <div className="text-[11px] text-emerald-100 font-medium">
              ទំនិញត្រូវបានបន្ថែមចូលកន្ត្រកគិតលុយរបស់អ្នកដោយស្វ័យប្រវត្តិ
            </div>
          </div>
        </div>
      )}

      {/* Ambient Lighting Glows */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-pink-500/10' : 'bg-pink-400/20'
        }`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-amber-500/10' : 'bg-rose-300/20'
        }`}
      />

      {/* ========================================================================= */}
      {/* TOP HEADER: Store Brand, Live Clock, Mode Status & Controls */}
      {/* ========================================================================= */}
      <header
        className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between shrink-0 z-20 transition-colors ${
          isDark
            ? 'border-slate-800/80 bg-slate-950/80 backdrop-blur-md'
            : 'border-rose-100 bg-white/90 backdrop-blur-md shadow-2xs'
        }`}
      >
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-pink-500/20 shrink-0">
            <div
              className={`w-full h-full rounded-[14px] flex items-center justify-center overflow-hidden ${
                isDark ? 'bg-slate-950' : 'bg-white'
              }`}
            >
              {storeInfo.logoUrl ? (
                <img
                  src={getProductImageUrl(storeInfo.logoUrl)}
                  alt="Store Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">🎂</span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className={`text-base sm:text-xl font-black tracking-wide font-muol truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {storeInfo.nameKh || storeInfo.nameEn || 'ហាងនំខេក និងនំប៉័ង វិជ្ជតា'}
              </h1>
              <span className="text-[10px] font-sans font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-yellow-200" />
                <span>Dual Screen</span>
              </span>
            </div>
            <p
              className={`text-[11px] truncate flex items-center gap-1.5 mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <Store className="w-3 h-3 text-pink-400 shrink-0" />
              <span>{storeInfo.address || 'រតនៈគីរី អូរយ៉ាដាវ'}</span>
              {storeInfo.phone && (
                <>
                  <span className="text-slate-500">•</span>
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{storeInfo.phone}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Center / Right: Idle Tab Switchers (When Idle) */}
        {displayState.status === 'idle' && (
          <div
            className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-rose-50/80 border-rose-200/80'
            }`}
          >
            <button
              type="button"
              onClick={() => setIdleTab('menu')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                idleTab === 'menu'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>កាតាឡុកនំពេញនិយម</span>
            </button>
            <button
              type="button"
              onClick={() => setIdleTab('spotlight')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                idleTab === 'spotlight'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>នំពិសេសប្រចាំថ្ងៃ</span>
            </button>
            <button
              type="button"
              onClick={() => setIdleTab('qr')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                idleTab === 'qr'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR ហាង & កុម្ម៉ង់</span>
            </button>
            {storeInfo.appPromoEnabled !== false && (
              <button
                type="button"
                onClick={() => setIdleTab('promo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  idleTab === 'promo'
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-md shadow-pink-500/20'
                    : isDark
                    ? 'text-amber-400 hover:text-white'
                    : 'text-rose-600 hover:text-rose-700'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                <span>ប្រូម៉ូសិន App (-{storeInfo.appPromoValue || 10}%)</span>
              </button>
            )}
          </div>
        )}

        {/* Right: Live Clock, Theme Toggle & Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Online Badge */}
          <div
            className={`hidden xl:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
              isDark
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>ផ្សាយផ្ទាល់ Real-time</span>
          </div>

          {/* Time & Date */}
          <div
            className={`flex items-center gap-2 text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl border ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-pink-500" />
            <span>{currentTime}</span>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-300'
                : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-700 shadow-2xs'
            }`}
            title={isDark ? 'ប្តូរទៅ Theme ពណ៌ស្រាល (Light Cream)' : 'ប្តូរទៅ Theme ពណ៌រាត្រី (Dark Obsidian)'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
                : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-600 hover:text-pink-600 shadow-2xs'
            }`}
            title={isFullscreen ? 'ចេញពីពេញអេក្រង់' : 'ពេញអេក្រង់ (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* PROMOTIONAL TICKER BANNER (Runs on all states except full paid celebration) */}
      {/* ========================================================================= */}
      {displayState.status !== 'paid' && (
        <div
          className={`px-4 py-2 border-b flex items-center justify-between text-xs font-bold overflow-hidden shrink-0 z-10 ${
            isDark
              ? 'bg-gradient-to-r from-pink-950/60 via-purple-950/40 to-pink-950/60 border-slate-800 text-pink-200'
              : 'bg-gradient-to-r from-pink-100/70 via-rose-50 to-pink-100/70 border-rose-100 text-pink-800'
          }`}
        >
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap font-battambang">
            {storeInfo.appPromoEnabled !== false && (
              <>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse shadow-xs shrink-0">
                  <Gift className="w-3 h-3 text-amber-200" />
                  <span>{storeInfo.appPromoBannerTextKh || `ប្រូម៉ូសិនកុម្ម៉ង់តាម App បញ្ចុះតម្លៃ ${storeInfo.appPromoValue || 10}% ភ្លាមៗ!`}</span>
                </span>
                <span className="text-pink-400">•</span>
              </>
            )}
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider">
              <Flame className="w-3 h-3 text-yellow-200" />
              HOT SPECIAL
            </span>
            <span>នំបុ័ង & នំខេកស្រស់ៗដុតថ្មីៗរាល់ថ្ងៃ</span>
            <span className="text-pink-400">•</span>
            <span>🎂 ទទួលកុម្ម៉ង់នំខួបកំណើតម៉ូដពិសេសតាមចិត្ត</span>
            <span className="text-pink-400">•</span>
            <span>⚡ កុម្ម៉ង់រហ័ស 30s តាម Telegram ហាង</span>
            <span className="text-pink-400">•</span>
            <span>💵 ទូទាត់រហ័សជាមួយ Bakong KHQR គ្រប់ធនាគារ</span>
          </div>

          {storeInfo.phone && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold shrink-0 ml-4">
              <Phone className="w-3 h-3" />
              <span>{storeInfo.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT: State-Driven Dynamic Customer Presentation */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row p-3 sm:p-5 gap-4 sm:gap-5 overflow-hidden z-10">
        {/* ======================================================================= */}
        {/* SCENARIO 1: IDLE STATE (NO ACTIVE SALE IN POS CART) */}
        {/* ======================================================================= */}
        {displayState.status === 'idle' ? (
          <>
            {/* Left Main Panel: Digital Menu Grid or Large Spotlight Banner */}
            <div
              className={`flex-1 flex flex-col min-h-0 rounded-3xl p-4 sm:p-5 border shadow-xl overflow-hidden relative ${
                isDark
                  ? 'bg-slate-900/75 border-slate-800/90'
                  : 'bg-white/95 border-rose-100 shadow-rose-500/5'
              }`}
            >
              {idleTab === 'menu' ? (
                /* Dynamic Paged Menu Grid (6-8 items) */
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between pb-3 border-b mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-sm shadow-xs">
                        🧁
                      </div>
                      <div>
                        <h2
                          className={`text-sm sm:text-base font-black font-muol ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          កាតាឡុកនំពេញនិយមប្រចាំហាង (Popular Bakery Catalog)
                        </h2>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          ជ្រើសរើសពីមុខនំលក់ដាច់បំផុត និងនំខេកស្រស់ៗប្រចាំថ្ងៃ
                        </p>
                      </div>
                    </div>

                    {/* Pagination & Fit View Controls */}
                    <div className="flex items-center gap-2">
                      {/* Fit Mode Switcher: Contain (Full Uncropped) vs Cover (Fill Box) */}
                      <button
                        type="button"
                        onClick={toggleImageFitMode}
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-pink-500/50'
                            : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                        }`}
                        title={
                          imageFitMode === 'contain'
                            ? 'ប្តូរទៅបង្ហាញពេញប្រអប់ (Fill Box)'
                            : 'ប្តូរទៅបង្ហាញរូបពេញ 100% គ្មានកាត់ (Fit 100%)'
                        }
                      >
                        {imageFitMode === 'contain' ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-pink-500" />
                            <span className="hidden sm:inline">រូបពេញ</span>
                            <span className="text-[10px] font-mono text-pink-400">100%</span>
                          </>
                        ) : (
                          <>
                            <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                            <span className="hidden sm:inline">ពេញប្រអប់</span>
                          </>
                        )}
                      </button>

                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-slate-300'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}
                      >
                        ទំព័រ {menuPage + 1}/{totalMenuPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setMenuPage((prev) => (prev - 1 + totalMenuPages) % totalMenuPages)
                        }
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                            : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-700'
                        }`}
                        title="ទំព័រមុន"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuPage((prev) => (prev + 1) % totalMenuPages)}
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                            : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-700'
                        }`}
                        title="ទំព័របន្ទាប់"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 6-Item Product Cards Grid */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1">
                    {pagedMenuProducts.map((prod) => {
                      const priceKhr = roundKhr(
                        prod.priceKhr ?? (prod.priceUsd * exchangeRate)
                      );
                      const priceUsd = prod.priceKhr
                        ? Number((priceKhr / exchangeRate).toFixed(2))
                        : prod.priceUsd;
                      const isHot = prod.id === 'p1' || prod.id === 'p2' || prod.id === 'p5';

                      return (
                        <div
                          key={prod.id}
                          className={`rounded-2xl border p-2.5 flex flex-col justify-between transition-all group overflow-hidden relative shadow-xs ${
                            isDark
                              ? 'bg-slate-950/70 hover:bg-slate-950 border-slate-800 hover:border-pink-500/50'
                              : 'bg-white hover:bg-rose-50/30 border-rose-100 hover:border-pink-300'
                          }`}
                        >
                          {/* Image Box: Full Uncropped with Ambient Backdrop + 1-Click Zoom Lightbox */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewProduct(prod);
                            }}
                            className="relative w-full h-36 sm:h-44 md:h-48 rounded-xl overflow-hidden mb-2 bg-slate-900/40 flex items-center justify-center group/img cursor-zoom-in border border-slate-800/40"
                            title="ចុចដើម្បីមើលរូបភាពធំពេញអេក្រង់ (Click to view full image)"
                          >
                            {prod.imageUrl ? (
                              <>
                                {/* Blurred ambient cake colors in contain mode */}
                                {imageFitMode === 'contain' && (
                                  <img
                                    src={getProductImageUrl(prod.imageUrl)}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 w-full h-full object-cover filter blur-md opacity-30 scale-110 pointer-events-none"
                                  />
                                )}
                                <img
                                  src={getProductImageUrl(prod.imageUrl)}
                                  alt={prod.nameKh}
                                  className={`w-full h-full transition-transform duration-300 group-hover:scale-105 drop-shadow-md ${
                                    imageFitMode === 'contain'
                                      ? 'relative z-1 object-contain p-1.5'
                                      : 'object-cover'
                                  }`}
                                />
                                {/* Quick Zoom Pill Badge */}
                                <div className="absolute bottom-1.5 right-1.5 z-2 bg-black/65 hover:bg-pink-600 text-white p-1 rounded-lg opacity-80 sm:opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 text-[10px] px-1.5 py-0.5 pointer-events-none">
                                  <ZoomIn className="w-3 h-3 text-pink-300" />
                                  <span className="hidden sm:inline">ពង្រីក</span>
                                </div>
                              </>
                            ) : (
                              <span className="text-4xl">🎂</span>
                            )}

                            {isHot && (
                              <span className="absolute top-2 left-2 z-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5 text-yellow-200" />
                                <span>ពេញនិយម</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4
                              className={`text-xs sm:text-sm font-black line-clamp-1 font-battambang ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {prod.nameKh}
                            </h4>
                            <p
                              className={`text-[10px] line-clamp-1 ${
                                isDark ? 'text-slate-400' : 'text-slate-400'
                              }`}
                            >
                              {prod.nameEn || prod.description || 'នំខេកស្រស់ៗ'}
                            </p>
                          </div>

                          <div
                            className={`mt-2 pt-2 border-t flex items-baseline justify-between ${
                              isDark ? 'border-slate-800' : 'border-rose-50'
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-black font-mono text-rose-500">
                              {priceKhr.toLocaleString()} ៛
                            </span>
                            <span
                              className={`text-[10px] font-mono ${
                                isDark ? 'text-slate-400' : 'text-slate-400'
                              }`}
                            >
                              ${priceUsd.toFixed(2)}
                            </span>
                          </div>

                          {/* Quick Customer Touch Order Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCustomerOrderProduct(prod);
                            }}
                            className="w-full mt-2 py-1.5 px-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>កុម្ម៉ង់មុខនេះ (+១)</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : idleTab === 'spotlight' ? (
                /* Spotlight Banner Showcase */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div
                    onClick={() => setPreviewProduct(currentShowcaseProduct)}
                    className="relative w-72 h-72 sm:w-88 sm:h-88 rounded-3xl overflow-hidden border-4 border-pink-500/40 shadow-2xl shadow-pink-500/20 group flex items-center justify-center bg-slate-900/40 cursor-zoom-in"
                    title="ចុចដើម្បីមើលរូបភាពធំពេញអេក្រង់ (Click to view full image)"
                  >
                    {currentShowcaseProduct.imageUrl && (
                      <img
                        src={getProductImageUrl(currentShowcaseProduct.imageUrl)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-35 scale-110 pointer-events-none"
                      />
                    )}
                    <img
                      src={getProductImageUrl(
                        currentShowcaseProduct.imageUrl ||
                          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'
                      )}
                      alt={currentShowcaseProduct.nameKh}
                      className="relative z-1 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl"
                    />
                    <div className="absolute top-3 left-3 z-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>នំពិសេសប្រចាំថ្ងៃ (Daily Special)</span>
                    </div>
                    <div className="absolute bottom-3 right-3 z-2 bg-black/70 text-white px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5 text-pink-300" />
                      <span>មើលរូបធំពេញអេក្រង់</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-w-lg">
                    <h3
                      className={`text-xl sm:text-2xl font-black font-muol ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {currentShowcaseProduct.nameKh}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm font-battambang leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {currentShowcaseProduct.description ||
                        'នំខេកស្រស់ៗ ផលិតពីគ្រឿងផ្សំគុណភាពខ្ពស់ តុបតែងយ៉ាងប្រណិតសម្រាប់កម្មវិធីខួបកំណើត និងពិធីជប់លៀងពិសេស។'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-lg font-mono shadow-lg shadow-pink-500/25">
                      {(
                        currentShowcaseProduct.priceKhr ??
                        Math.round(currentShowcaseProduct.priceUsd * exchangeRate)
                      ).toLocaleString()}{' '}
                      ៛
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl border text-sm font-black font-mono ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      ${currentShowcaseProduct.priceUsd.toFixed(2)} USD
                    </div>
                  </div>
                </div>
              ) : idleTab === 'qr' ? (
                /* Store KHQR Standee & Online Order QR Mode */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-3xl shadow-xl shadow-pink-500/25">
                    📱
                  </div>
                  <div className="space-y-1">
                    <h3
                      className={`text-xl sm:text-2xl font-black font-muol ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      ស្កេនមើលម៉ូដនំ & កុម្ម៉ង់តាមទូរស័ព្ទដៃ
                    </h3>
                    <p
                      className={`text-xs sm:text-sm font-battambang ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      ប្រើកាមេរ៉ាទូរស័ព្ទដៃរបស់អ្នកដើម្បីស្កេនមើលម៉ូដនំទាំងអស់ ឬផ្ញើសារកុម្ម៉ង់នំរហ័ស 30s
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-pink-500/40 inline-block">
                    {storeInfo.khqrQrImage ? (
                      <img
                        src={getProductImageUrl(storeInfo.khqrQrImage)}
                        alt="Store Order QR"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-2xl"
                      />
                    ) : (
                      <QrCodeImage
                        data={customerOrderUrl}
                        size={220}
                        className="w-48 h-48 sm:w-56 sm:h-56"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-pink-500">
                    <Sparkles className="w-4 h-4" />
                    <span>គាំទ្រទាំង iOS, Android & Telegram Mini App</span>
                  </div>
                </div>
              ) : (
                /* In-App Promo Showcase Mode (idleTab === 'promo') */
                <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 text-center overflow-y-auto">
                  {/* Top Badge & Header */}
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-pink-500/30 animate-pulse">
                      <Gift className="w-4 h-4 text-amber-200" />
                      <span>ប្រូម៉ូសិនពិសេសសម្រាប់អតិថិជនកុម្ម៉ង់តាម App</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-muol bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                      {storeInfo.appPromoType === 'FIXED_KHR'
                        ? `បញ្ចុះតម្លៃ ${(storeInfo.appPromoValue || 5000).toLocaleString()} ៛ ភ្លាមៗ!`
                        : `បញ្ចុះតម្លៃ ${storeInfo.appPromoValue || 10}% ភ្លាមៗរាល់ការកុម្ម៉ង់!`}
                    </h2>

                    <p className={`text-xs sm:text-sm font-battambang leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {storeInfo.appPromoBannerTextKh || 'ស្កេន QR កុម្ម៉ង់នំខួបកំណើត ឬនំបុ័ងតាមទូរស័ព្ទដៃផ្ទាល់ ដើម្បីទទួលបានការបញ្ចុះតម្លៃស្វ័យប្រវត្តិ មិនបាច់ចាំយូរ!'}
                    </p>
                  </div>

                  {/* Middle: QR Code Card & 3 Easy Steps */}
                  <div className="my-3 flex flex-col md:flex-row items-center justify-center gap-6 max-w-2xl w-full">
                    {/* QR Standee Card */}
                    <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-pink-500/50 flex flex-col items-center shrink-0 relative group">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>ស្កេនទទួលការបញ្ចុះតម្លៃ</span>
                      </div>
                      <QrCodeImage
                        data={promoOrderUrl}
                        size={210}
                        className="w-44 h-44 sm:w-52 sm:h-52"
                      />
                      <span className="text-[10px] font-mono font-bold text-slate-500 mt-2">
                        In-App Promo Discount: <strong className="text-pink-600 font-black">{storeInfo.appPromoType === 'FIXED_KHR' ? `${(storeInfo.appPromoValue || 5000).toLocaleString()} ៛` : `${storeInfo.appPromoValue || 10}%`}</strong> (Auto)
                      </span>
                    </div>

                    {/* 3 Step Benefits Checklist */}
                    <div className="space-y-3 text-left w-full max-w-sm">
                      <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-transform hover:scale-[1.02] ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-50/60 border-rose-100'}`}>
                        <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-500 flex items-center justify-center font-black shrink-0 text-sm">
                          1
                        </div>
                        <div>
                          <div className={`text-xs sm:text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            ស្កេន QR តាមទូរស័ព្ទដៃ
                          </div>
                          <div className={`text-[11px] font-battambang ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            បើកកាមេរ៉ាស្កេនចូលភ្លាម មិនបាច់ដំឡើង App
                          </div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-transform hover:scale-[1.02] ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-50/60 border-rose-100'}`}>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black shrink-0 text-sm">
                          2
                        </div>
                        <div>
                          <div className={`text-xs sm:text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            ជ្រើសរើសម៉ូដនំ & រសជាតិ
                          </div>
                          <div className={`text-[11px] font-battambang ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            រើសទំហំ រសជាតិ និងសរសេរពាក្យជូនពរតាមចិត្ត
                          </div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-transform hover:scale-[1.02] ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-50/60 border-rose-100'}`}>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black shrink-0 text-sm">
                          3
                        </div>
                        <div>
                          <div className={`text-xs sm:text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            បញ្ចុះតម្លៃស្វ័យប្រវត្តិ
                          </div>
                          <div className={`text-[11px] font-battambang ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            ប្រព័ន្ធកាត់ {storeInfo.appPromoType === 'FIXED_KHR' ? `${(storeInfo.appPromoValue || 5000).toLocaleString()} ៛` : `${storeInfo.appPromoValue || 10}%`} ភ្លាមៗក្នុងវិក្កយបត្រ
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Note */}
                  <div className={`text-[11px] font-battambang flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    <span>គាំទ្រទាំង iOS, Android • បង់ប្រាក់កក់តាម Bakong KHQR គ្រប់ធនាគារ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Sidebar: Spotlight Featured Cake & Store Information */}
            <div className="w-full lg:w-96 flex flex-col shrink-0 gap-4">
              {/* Daily Special Spotlight Card */}
              <div
                className={`flex-1 rounded-3xl p-5 border shadow-xl flex flex-col justify-between overflow-hidden relative ${
                  isDark
                    ? 'bg-slate-900/75 border-slate-800/90'
                    : 'bg-white/95 border-rose-100 shadow-rose-500/5'
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs border-b pb-3 shrink-0 ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-rose-100 text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-bold text-pink-500">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                    <span>នំពិសេសប្រចាំថ្ងៃ</span>
                  </span>
                  <span className="font-mono text-[11px]">
                    {carouselIndex + 1}/{showcaseProducts.length}
                  </span>
                </div>

                <div className="my-auto py-3 flex flex-col items-center text-center space-y-3">
                  <div
                    onClick={() => setPreviewProduct(currentShowcaseProduct)}
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-xl relative group flex items-center justify-center bg-slate-900/40 cursor-zoom-in"
                    title="ចុចដើម្បីមើលរូបភាពធំពេញអេក្រង់ (Click to view full image)"
                  >
                    {currentShowcaseProduct.imageUrl && (
                      <img
                        src={getProductImageUrl(currentShowcaseProduct.imageUrl)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover filter blur-md opacity-30 scale-110 pointer-events-none"
                      />
                    )}
                    <img
                      src={getProductImageUrl(
                        currentShowcaseProduct.imageUrl ||
                          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500'
                      )}
                      alt={currentShowcaseProduct.nameKh}
                      className="relative z-1 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                    />
                    <div className="absolute top-2 right-2 z-2 px-2 py-0.5 rounded-lg bg-black/75 text-[9px] font-black text-amber-300 font-mono">
                      {currentShowcaseProduct.categoryId.toUpperCase()}
                    </div>
                    <div className="absolute bottom-2 right-2 z-2 bg-black/65 text-white p-1 rounded-lg opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] px-2 py-0.5 pointer-events-none">
                      <ZoomIn className="w-3 h-3 text-pink-300" />
                      <span>ពង្រីក</span>
                    </div>
                  </div>

                  <div>
                    <h3
                      className={`text-base font-black font-muol ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {currentShowcaseProduct.nameKh}
                    </h3>
                    <p
                      className={`text-[11px] font-sans ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {currentShowcaseProduct.nameEn}
                    </p>
                  </div>

                  <div className="text-lg font-black font-mono text-rose-500 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1 rounded-xl">
                    {(
                      currentShowcaseProduct.priceKhr ??
                      Math.round(currentShowcaseProduct.priceUsd * exchangeRate)
                    ).toLocaleString()}{' '}
                    ៛
                    <span
                      className={`text-[11px] font-normal ml-2 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      (${currentShowcaseProduct.priceUsd.toFixed(2)})
                    </span>
                  </div>

                  {/* Customer Quick Order Spotlight Button */}
                  <button
                    type="button"
                    onClick={() => handleCustomerOrderProduct(currentShowcaseProduct)}
                    className="w-full mt-2 py-2 px-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white text-xs font-black shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                    <span>ខ្ញុំចង់បាននំពិសេសនេះ (+១)</span>
                  </button>
                </div>

                {/* Dots indicator */}
                <div className="flex justify-center gap-1.5 pt-2">
                  {showcaseProducts.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === carouselIndex
                          ? 'w-6 bg-pink-500'
                          : isDark
                          ? 'w-1.5 bg-slate-800'
                          : 'w-1.5 bg-rose-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Store Official Bakong KHQR Standee Mini Card */}
              <div
                className={`p-4 rounded-3xl border flex items-center gap-3.5 shadow-md ${
                  isDark
                    ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/30'
                    : 'bg-gradient-to-r from-rose-50 via-white to-pink-50 border-rose-200'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-red-500/60 shadow-md shrink-0">
                  <img
                    src={storeQrImage}
                    alt="Bakong KHQR"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-wider">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>BAKONG KHQR ហាង</span>
                  </div>
                  <h4
                    className={`text-xs font-black truncate mt-0.5 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {storeInfo.khqrMerchantName || storeInfo.nameKh || 'Sweet Bakery'}
                  </h4>
                  <p
                    className={`text-[10px] truncate ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {storeInfo.phone || 'ស្កេនបង់ប្រាក់ ឬកុម្ម៉ង់នំ'}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : displayState.status === 'paid' ? (
          /* ======================================================================= */
          /* SCENARIO 2: PAYMENT SUCCESSFUL + DIGITAL E-RECEIPT + 5-STAR RATING      */
          /* ======================================================================= */
          <div className="flex-1 flex flex-col p-4 sm:p-8 bg-gradient-to-b from-emerald-950/90 via-slate-950 to-slate-950 border-2 border-emerald-500/60 rounded-3xl shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-300">
            {/* Top Celebration Header */}
            <div className="flex flex-col items-center text-center space-y-2 mb-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-4 border-emerald-400/60 shadow-2xl shadow-emerald-500/40 animate-bounce">
                  <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14" />
                </div>
                <div className="absolute -inset-2 rounded-full border border-emerald-400/30 animate-ping pointer-events-none" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white font-muol leading-relaxed drop-shadow-md">
                ការទូទាត់ប្រាក់ជោគជ័យ!
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300 font-bold">
                <span>{displayState.paidBankName || 'Bakong KHQR'}</span>
                <span>•</span>
                <span>វិក្កយបត្រ #{displayState.orderNumber || '0001'}</span>
                <span>•</span>
                <span className="text-amber-300 font-mono font-black text-base">
                  {(displayState.paidAmount || displayState.totalKhr).toLocaleString()} {displayState.paidCurrency || 'KHR'}
                </span>
              </div>
            </div>

            {/* Split Grid: Left = Paperless E-Receipt QR | Right = 5-Star Customer Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto w-full flex-1">
              {/* Card 1: 📱 Digital E-Receipt QR */}
              <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                  <QrCode className="w-4 h-4" />
                  <span>📱 វិក្កយបត្រអេឡិចត្រូនិច (Paperless E-Receipt)</span>
                </div>

                <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-emerald-400/40 flex items-center justify-center">
                  <QrCodeImage
                    data={customerEReceiptUrl || `https://sothearetsuon-ai.github.io/sweetbakery-pos/`}
                    size={176}
                    alt="Paperless E-Receipt QR"
                    className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-white font-battambang">
                    ស្កេនដោយទូរស័ព្ទដៃ ដើម្បីរក្សាទុកវិក្កយបត្រ
                  </p>
                  <p className="text-[11px] text-slate-400">
                    🌱 មិនបាច់បោះពុម្ពក្រដាស • ជួយការពារបរិស្ថាន
                  </p>
                </div>
              </div>

              {/* Card 2: ⭐ 5-Star Customer Rating & Feedback */}
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>⭐ វាយតម្លៃបទពិសោធន៍ (Rate Service)</span>
                    </div>
                    {customerRating && (
                      <span className="text-[11px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {customerRating} / 5 ផ្កាយ
                      </span>
                    )}
                  </div>

                  {feedbackSubmitted ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-300">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-400/50 shadow-lg">
                        <Check className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-black text-white font-muol">
                        សូមអរគុណច្រើន! 🙏💖
                      </h4>
                      <p className="text-xs text-slate-300 font-battambang max-w-xs">
                        មតិយោបល់ និងការវាយតម្លៃរបស់អ្នក ជាកម្លាំងចិត្តដ៏ធំធេងដល់ក្រុមការងារយើងខ្ញុំ!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-3">
                      {/* 5 Big Gold Stars */}
                      <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (customerRating || 0) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRateStar(star)}
                              className={`p-1.5 sm:p-2 rounded-2xl transition-all transform hover:scale-125 active:scale-95 cursor-pointer ${
                                isFilled
                                  ? 'bg-amber-500/20 text-amber-400 shadow-md shadow-amber-500/20 scale-110'
                                  : 'text-slate-600 hover:text-amber-300'
                              }`}
                            >
                              <Star
                                className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                                  isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Feedback Chips */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 block text-center">
                          តើលោកអ្នកពេញចិត្តអ្វីជាងគេ? (ចុចជ្រើសរើស)
                        </span>
                        <div className="flex flex-wrap justify-center gap-2">
                          {[
                            '🍰 នំឆ្ងាញ់',
                            '⚡ សេវារហ័ស',
                            '💖 បុគ្គលិករួសរាយ',
                            '✨ ហាងស្អាត',
                            '💯 តម្លៃសមរម្យ',
                          ].map((tag) => {
                            const isSelected = selectedFeedbackTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleToggleFeedbackTag(tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white border-rose-400 shadow-sm'
                                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!feedbackSubmitted && (
                  <button
                    type="button"
                    onClick={handleSubmitFeedback}
                    disabled={!customerRating && selectedFeedbackTags.length === 0}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <span>ផ្ញើការវាយតម្លៃ (Submit Feedback)</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Thank You Note */}
            <div className="text-center text-xs text-slate-400 pt-4 font-battambang">
              🎉 សូមអរគុណច្រើនដែលបានគាំទ្រ {storeInfo.nameKh || 'ហាងរបស់យើងខ្ញុំ'}! សូមអញ្ជើញមកពិសាម្ដងទៀត។
            </div>
          </div>
        ) : (
          /* ======================================================================= */
          /* SCENARIO 3: ACTIVE SALE (CART LIST OR CHECKOUT WITH KHQR) */
          /* ======================================================================= */
          <>
            {/* Left Column: Live Cart Receipt Items Table */}
            <div
              className={`flex-1 flex flex-col min-h-0 rounded-3xl p-4 sm:p-5 border shadow-xl overflow-hidden ${
                isDark
                  ? 'bg-slate-900/75 border-slate-800/90'
                  : 'bg-white/95 border-rose-100 shadow-rose-500/5'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3.5 border-b shrink-0 ${
                  isDark ? 'border-slate-800' : 'border-rose-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-base shadow-xs">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2
                      className={`text-sm sm:text-base font-black font-muol ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      បញ្ជីទំនិញដែលបានជ្រើសរើស (Current Order)
                    </h2>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {displayState.cashierName
                        ? `👩‍🍳 បម្រើដោយ៖ ${displayState.cashierName}`
                        : 'ផ្ទៀងផ្ទាត់ទំនិញរបស់អ្នកជាមួយអ្នកគិតលុយ'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-black px-3 py-1 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  {displayState.items.reduce((s, it) => s + it.quantity, 0)} មុខ
                </span>
              </div>

              {/* Items Scroll List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 py-3">
                {displayState.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all animate-in fade-in slide-in-from-left-2 duration-200 ${
                      isDark
                        ? 'bg-slate-950/70 hover:bg-slate-950 border-slate-800'
                        : 'bg-white hover:bg-rose-50/30 border-rose-100 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={getProductImageUrl(item.imageUrl)}
                          alt={item.nameKh}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700/50 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500/20 to-amber-500/20 border border-slate-700/50 text-pink-400 flex items-center justify-center text-xl shrink-0">
                          🎂
                        </div>
                      )}
                      <div className="min-w-0">
                        <div
                          className={`font-black text-sm truncate font-battambang ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {item.nameKh}
                        </div>
                        <div
                          className={`text-xs font-mono ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {item.unitPriceKhr.toLocaleString()} ៛ ({item.unitPriceUsd.toFixed(2)} $)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div
                        className={`px-3 py-1 rounded-xl border text-xs font-black font-mono text-pink-500 ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-rose-50 border-rose-200'
                        }`}
                      >
                        x{item.quantity} {item.unit || ''}
                      </div>
                      <div className="text-right w-24">
                        <div className="text-sm font-black font-mono text-rose-500">
                          {item.totalKhr.toLocaleString()} ៛
                        </div>
                        <div
                          className={`text-[11px] font-mono ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          ${item.totalUsd.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Payment Bill Summary & KHQR Code Standee */}
            <div className="w-full lg:w-96 flex flex-col shrink-0 gap-4">
              <div
                className={`flex-1 rounded-3xl p-5 border shadow-xl flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/75 border-slate-800/90'
                    : 'bg-white/95 border-rose-100 shadow-rose-500/5'
                }`}
              >
                <div>
                  <h3
                    className={`text-xs font-black uppercase tracking-wider pb-3 border-b ${
                      isDark ? 'border-slate-800 text-slate-400' : 'border-rose-100 text-slate-500'
                    }`}
                  >
                    សរុបការទូទាត់ (Payment Summary)
                  </h3>

                  <div className="space-y-2.5 py-4 text-xs">
                    <div
                      className={`flex justify-between ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      <span>តម្លៃសរុប (Subtotal):</span>
                      <span className="font-mono font-bold">
                        {displayState.subtotalKhr.toLocaleString()} ៛
                      </span>
                    </div>

                    {displayState.discountKhr > 0 && (
                      <div className="flex justify-between text-rose-500 font-bold">
                        <span>បញ្ចុះតម្លៃ (Discount):</span>
                        <span className="font-mono">
                          -{displayState.discountKhr.toLocaleString()} ៛
                        </span>
                      </div>
                    )}

                    {/* Massive Grand Total Due */}
                    <div
                      className={`pt-3 border-t ${
                        isDark ? 'border-slate-800' : 'border-rose-100'
                      }`}
                    >
                      <div className="p-4 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 rounded-3xl text-center space-y-1 shadow-lg shadow-pink-500/25 text-white">
                        <div className="text-[11px] font-black uppercase tracking-wider text-rose-100">
                          {displayState.isDeposit
                            ? 'ទឹកប្រាក់ត្រូវកក់ (Deposit Required)'
                            : 'ទឹកប្រាក់ត្រូវទូទាត់ (Total Due)'}
                        </div>
                        <div className="text-3xl font-black font-mono tracking-tight">
                          {(displayState.isDeposit && displayState.depositKhr
                            ? displayState.depositKhr
                            : displayState.totalKhr
                          ).toLocaleString()}{' '}
                          ៛
                        </div>
                        <div className="text-xs font-mono font-bold text-amber-200">
                          $
                          {(
                            (displayState.isDeposit && displayState.depositKhr
                              ? displayState.depositKhr
                              : displayState.totalKhr) / exchangeRate
                          ).toFixed(2)}{' '}
                          USD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* If Checkout is triggered with KHQR */}
                {displayState.status === 'checkout' && displayState.khqrDataUrl ? (
                  <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-red-500 flex flex-col items-center justify-center text-center space-y-2 animate-in zoom-in-95 duration-200">
                    <div className="text-[11px] font-black tracking-widest text-red-600 uppercase flex items-center gap-1.5">
                      <QrCode className="w-4 h-4" />
                      <span>BAKONG KHQR ស្កេនបង់ប្រាក់</span>
                    </div>
                    <img
                      src={displayState.khqrDataUrl}
                      alt="Bakong KHQR"
                      className="w-44 h-44 object-contain rounded-xl border border-slate-200 shadow-xs"
                    />
                    <div className="text-[10px] font-bold text-slate-600">
                      គាំទ្រគ្រប់ធនាគារ (ABA, ACLEDA, Canadia, Bakong...)
                    </div>
                  </div>
                ) : (
                  /* Mini Store Hint during active cart */
                  <div
                    className={`p-3.5 rounded-2xl border text-center space-y-1 ${
                      isDark
                        ? 'bg-slate-950/70 border-slate-800 text-slate-400'
                        : 'bg-rose-50/70 border-rose-200/80 text-rose-800'
                    }`}
                  >
                    <div className="text-xs font-bold">
                      💳 គាំទ្រការទូទាត់ប្រាក់សុទ្ធ & Bakong KHQR
                    </div>
                    <p className="text-[10px] opacity-80">
                      អ្នកលក់នឹងបង្កើតកូដ KHQR ស្វ័យប្រវត្តិនៅលើអេក្រង់នេះពេលគិតលុយ
                    </p>
                  </div>
                )}

                {displayState.cashierName && (
                  <div
                    className={`text-center text-[10px] pt-2 border-t ${
                      isDark ? 'border-slate-800 text-slate-500' : 'border-rose-100 text-slate-400'
                    }`}
                  >
                    បម្រើដោយ៖ {displayState.cashierName} • សូមអរគុណ!
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN CAKE IMAGE LIGHTBOX MODAL (100% Full Uncropped View) */}
      {/* ========================================================================= */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className={`relative max-w-2xl w-full rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white'
                : 'bg-white border-rose-100 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between p-4 border-b shrink-0 ${
                isDark ? 'border-slate-800' : 'border-rose-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl">🎂</span>
                <div className="min-w-0">
                  <h3 className="font-black text-base sm:text-lg font-muol truncate">
                    {previewProduct.nameKh}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans truncate">
                    {previewProduct.nameEn || previewProduct.categoryId?.toUpperCase() || 'Cake Detail'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-600 text-white transition-colors cursor-pointer shrink-0 ml-2"
                title="បិទ (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body (100% Full Uncropped Preview) */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[440px] max-h-[65vh] bg-slate-950 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
              {/* Subtle blurred ambient backdrop matching cake frosting */}
              {previewProduct.imageUrl && (
                <img
                  src={getProductImageUrl(previewProduct.imageUrl)}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-30 scale-125 pointer-events-none"
                />
              )}
              {/* Crisp uncropped cake image showing 100% of top and bottom */}
              <img
                src={getProductImageUrl(previewProduct.imageUrl)}
                alt={previewProduct.nameKh}
                className="relative z-1 max-h-[58vh] max-w-full w-auto h-auto object-contain drop-shadow-2xl rounded-2xl"
              />
            </div>

            {/* Modal Footer with Price & Quick Customer Order */}
            <div
              className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
                isDark ? 'border-slate-800 bg-slate-950/90' : 'border-rose-100 bg-rose-50/30'
              }`}
            >
              <div className="text-center sm:text-left">
                <div className="text-xs text-slate-400 font-battambang">តម្លៃលក់ផ្លូវការ</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-rose-500">
                    {(
                      previewProduct.priceKhr ??
                      roundKhr(previewProduct.priceUsd * exchangeRate)
                    ).toLocaleString()}{' '}
                    ៛
                  </span>
                  <span className="text-sm font-mono text-slate-400">
                    (${previewProduct.priceUsd.toFixed(2)})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleCustomerOrderProduct(previewProduct);
                  setPreviewProduct(null);
                }}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white font-black text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>កុម្ម៉ង់នំនេះ (+១)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
