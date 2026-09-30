import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  EyeOff,
  Cake,
  Plus,
  Search,
  ShoppingBag,
  X,
  CheckCircle2,
  Tv,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Layers,
  DollarSign,
  Palette,
  Phone,
  MapPin,
  MessageCircle,
  PieChart,
  Croissant,
  Flame,
  Coffee,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { Product } from '../../types';
import { soundFx } from '../../utils/audio';
import { AddProductModal } from '../pos/AddProductModal';
import { KioskSlideshowModal } from './KioskSlideshowModal';
import { SelectDesignPriceModal } from './SelectDesignPriceModal';
import { NewCustomOrderModal } from '../custom-orders/NewCustomOrderModal';
import { sortProductsNewestFirst } from '../../utils/productUtils';
import { getProductImageUrl } from '../../utils/imagePath';

// Iconic Chef Hat SVG matching the bakery logo aesthetic
export const ChefHatIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      d="M12 2C8.8 2 6.2 4.1 5.4 7 3.4 7.6 2 9.5 2 11.7c0 2.6 2 4.8 4.6 5.1V20c0 .6.4 1 1 1h8.8c.6 0 1-.4 1-1v-3.2c2.6-.3 4.6-2.5 4.6-5.1 0-2.2-1.4-4.1-3.4-4.7C17.8 4.1 15.2 2 12 2zM7.5 19H16.5V17.5H7.5V19zm9-3H7.5v-1.2c1.4-.4 2.5-1.5 2.8-3 .5 1.5 2 2.6 3.7 2.6.4 0 .7 0 1.1-.1.4 1.1 1.4 1.7 1.4 1.7V16z"
    />
  </svg>
);

export const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Cake':
      return <Cake className="w-4 h-4 text-pink-500" />;
    case 'PieChart':
      return <PieChart className="w-4 h-4 text-purple-500" />;
    case 'Croissant':
      return <Croissant className="w-4 h-4 text-amber-500" />;
    case 'Flame':
      return <Flame className="w-4 h-4 text-rose-500" />;
    case 'Coffee':
      return <Coffee className="w-4 h-4 text-amber-700" />;
    default:
      return <Sparkles className="w-4 h-4 text-amber-400" />;
  }
};

// Animated Individual Cake Card with Auto-Transitions
interface ShowcaseCardProps {
  product: Product;
  onClick: () => void;
  exchangeRate: number;
  lang: string;
  hidePrices?: boolean;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  product,
  onClick,
  exchangeRate,
  lang,
  hidePrices = true,
}) => {
  const fallbackCake =
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80';
  const rawImages =
    product.images && product.images.length > 0
      ? product.images.filter(Boolean)
      : [product.imageUrl].filter(Boolean);
  const images = rawImages.length > 0 ? rawImages : [fallbackCake];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // IntersectionObserver to only animate / interval when card is visible in viewport
  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '120px 0px', threshold: 0.05 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-transition between cake photos ONLY when visible in viewport
  useEffect(() => {
    if (!isInView || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isInView, images.length]);

  const name = lang === 'km' ? product.nameKh : product.nameEn;
  const priceKhr = product.priceKhr ?? Math.round(product.priceUsd * exchangeRate);
  const priceUsd = product.priceKhr ? Number((product.priceKhr / exchangeRate).toFixed(2)) : product.priceUsd;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '360px' }}
      className="group bg-white rounded-3xl border-2 border-[#F3DFD8]/80 hover:border-[#E6514D]/40 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#E6514D]/15 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between transform-gpu"
    >
      {/* Photo with smooth transition */}
      <div className="relative w-full h-56 bg-[#FFF5F2] overflow-hidden">
        {images.map((img, idx) => {
          const isActive = idx === currentIdx;
          return (
            <img
              key={idx}
              src={getProductImageUrl(img)}
              alt={`${name} ${idx + 1}`}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackCake;
              }}
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ease-out transform-gpu group-hover:scale-105 ${
                isActive
                  ? 'opacity-100 z-10'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
            />
          );
        })}

        {/* Multi-image badge */}
        {images.length > 1 && (
          <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-white/10">
            <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
            <span>
              {currentIdx + 1}/{images.length} • ស្លាយ
            </span>
          </div>
        )}

        {/* Dot indicators at bottom */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/35 backdrop-blur-md px-2.5 py-1 rounded-full">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIdx ? 'w-4 bg-[#FF6F68]' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-20">
          <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl">
            <Eye className="w-4 h-4" />
            <span>{hidePrices ? 'ចុចមើលម៉ូដនំ & កំណត់តម្លៃ' : 'ចុចមើលរូបធំ & កុម្ម៉ង់'}</span>
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#E6514D] transition-colors line-clamp-1 font-battambang">
          {name}
        </h3>
        {product.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="pt-2 border-t border-[#F8EAE5] flex items-center justify-between">
          {hidePrices ? (
            <>
              <span className="text-[11px] font-bold text-[#A82B27] bg-[#FFEAE7] px-2.5 py-1 rounded-xl flex items-center gap-1 border border-[#FFCCC6]">
                <Sparkles className="w-3 h-3 text-[#E6514D]" />
                <span>តម្លៃតាមទំហំ & ម៉ូដ</span>
              </span>
              <span className="px-3 py-1.5 bg-gradient-to-r from-[#FF6F68] to-[#E6514D] text-white rounded-xl text-xs font-black transition-all shadow-2xs group-hover:scale-105">
                រើសម៉ូដនំ ✨
              </span>
            </>
          ) : (
            <>
              <div>
                <div className="text-lg font-black text-[#E6514D]">
                  {priceKhr.toLocaleString()} ៛
                </div>
                <div className="text-[11px] text-slate-400 font-semibold">
                  ~ ${priceUsd.toFixed(2)}
                </div>
              </div>

              <span className="px-3 py-1.5 bg-[#FFF0ED] group-hover:bg-[#E6514D] group-hover:text-white text-[#E6514D] rounded-xl text-xs font-bold transition-all shadow-2xs">
                មើលលម្អិត
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const CustomerShowcase: React.FC = () => {
  const { lang, products, categories, exchangeRate, addToCart, storeInfo } = useBakery();
  const text = t[lang];

  // Default to true (Hide prices for customer viewing so customer picks model first)
  const [hidePrices, setHidePrices] = useState<boolean>(() => {
    const saved = localStorage.getItem('showcase_hide_prices');
    return saved !== null ? saved === 'true' : true;
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Custom price selection modal state
  const [productForCustomPricing, setProductForCustomPricing] = useState<Product | null>(null);
  const [isSelectPriceModalOpen, setIsSelectPriceModalOpen] = useState(false);

  // Custom order modal state (if customer wants pre-order with deposit)
  const [isCustomOrderModalOpen, setIsCustomOrderModalOpen] = useState(false);
  const [customOrderInitialData, setCustomOrderInitialData] = useState<any>(null);

  // Lightbox slideshow state
  const [lightboxImgIdx, setLightboxImgIdx] = useState(0);
  const [isLightboxAutoPlay, setIsLightboxAutoPlay] = useState(true);

  // Reset lightbox image index when previewProduct changes
  useEffect(() => {
    setLightboxImgIdx(0);
    setIsLightboxAutoPlay(true);
  }, [previewProduct?.id]);

  const previewImages = useMemo(() => {
    if (!previewProduct) return [];
    return previewProduct.images && previewProduct.images.length > 0
      ? previewProduct.images
      : [previewProduct.imageUrl];
  }, [previewProduct]);

  // Lightbox auto-slideshow timer
  useEffect(() => {
    if (!previewProduct || !isLightboxAutoPlay || previewImages.length <= 1) return;

    const timer = setInterval(() => {
      setLightboxImgIdx((prev) => (prev + 1) % previewImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [previewProduct, isLightboxAutoPlay, previewImages.length]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.nameKh.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });

    return sortProductsNewestFirst(list);
  }, [products, selectedCategory, searchQuery]);

  // Real products with images for circular showcase cutouts & centerpiece showpiece
  const showcaseProducts = useMemo(() => {
    const list = products.filter(
      (p) => (p.imageUrl && p.imageUrl.trim() !== '') || (p.images && p.images.length > 0)
    );
    return list.length > 0 ? list : products;
  }, [products]);

  const featuredProduct = showcaseProducts[0] || null;
  const circularItems = showcaseProducts.slice(1, 6);

  // Backup bakery images for filling remaining slots if user has fewer than 5 products
  const fallbackCutouts = [
    'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=300&q=80',
  ];

  // Open custom price setup modal
  const handleOpenCustomPrice = (product: Product) => {
    soundFx.playPop();
    setProductForCustomPricing(product);
    setIsSelectPriceModalOpen(true);
  };

  const nextLightboxImg = () => {
    soundFx.playPop();
    setLightboxImgIdx((prev) => (prev + 1) % previewImages.length);
  };

  const prevLightboxImg = () => {
    soundFx.playPop();
    setLightboxImgIdx((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 pb-24 md:pb-6">
      {/* ========================================================
          Pinterest Flyer Layout Form Powered by User's Real Data
          ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-rose-200/90 bg-chocolate-pattern">
        {/* Top Salmon-Coral Section */}
        <div className="relative bg-renah-coral p-5 sm:p-8 md:p-10 text-white overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
          <div className="absolute top-1/3 -right-10 w-56 h-56 rounded-full bg-amber-300/25 blur-3xl pointer-events-none" />

          {/* Grid Layout: Left Store Showcase | Right User's Services/Categories Panel */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
            {/* Left Column: Real Store Brand & Circular Product Cutouts */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-6">
              {/* Store Logo & Dynamic Store Name in Flyer Typography */}
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white text-slate-900 shadow-xl flex items-center justify-center p-1.5 sm:p-2 transform -rotate-6 hover:rotate-0 transition-transform overflow-hidden shrink-0">
                  {storeInfo.logoUrl ? (
                    <img
                      src={getProductImageUrl(storeInfo.logoUrl)}
                      alt={storeInfo.nameKh}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <ChefHatIcon className="w-7 h-7 sm:w-10 sm:h-10 text-slate-900" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline leading-none flex-wrap gap-1.5 sm:gap-2">
                    <span className="font-cursive-bakery text-2xl sm:text-4xl md:text-5xl text-white font-bold drop-shadow-md truncate">
                      {storeInfo.nameEn || 'Sweet Bakery'}
                    </span>
                    {storeInfo.nameKh && (
                      <span className="text-base sm:text-xl md:text-2xl font-black text-slate-950 tracking-tight drop-shadow-sm font-muol truncate">
                        {storeInfo.nameKh}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] sm:text-sm font-bold text-rose-100 flex items-center gap-1.5 sm:gap-2 mt-1 font-battambang">
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping shrink-0" />
                    <span className="truncate">កាតាឡុកបង្ហាញភ្ញៀវ & សេវាកម្មកុម្ម៉ង់នំ</span>
                  </div>
                </div>
              </div>

              {/* Floating Circular Product Cutouts with User's Real Bakery Items */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3.5 overflow-x-auto pb-1 scrollbar-none">
                  {/* Map user's real product items */}
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const item = circularItems[idx] || products[idx];
                    const itemImg = item?.imageUrl || item?.images?.[0] || fallbackCutouts[idx % fallbackCutouts.length];
                    const itemName = item ? (lang === 'km' ? item.nameKh : item.nameEn) : `ម៉ូដនំពិសេស ${idx + 1}`;

                    return (
                      <div
                        key={idx}
                        title={`${itemName} (ចុចមើលរូបធំ)`}
                        style={{ width: '56px', height: '56px' }}
                        className="renah-circle-frame sm:w-16 md:w-20 sm:h-16 md:h-20 shrink-0 bg-white cursor-pointer group/circle relative"
                        onClick={() => {
                          if (item) {
                            soundFx.playPop();
                            setPreviewProduct(item);
                          }
                        }}
                      >
                        <img
                          src={getProductImageUrl(itemImg)}
                          alt={itemName}
                          className="w-full h-full object-cover group-hover/circle:scale-110 transition-transform duration-300"
                        />
                        {item && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/circle:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold text-center px-1">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Hero Showcase Centerpiece Card (User's Real Featured Item) */}
                {featuredProduct && (
                  <div
                    onClick={() => {
                      soundFx.playPop();
                      setPreviewProduct(featuredProduct);
                    }}
                    className="p-3 sm:p-4 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-3 sm:gap-4 shadow-lg cursor-pointer hover:bg-white/25 transition-all group/hero"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 border-white bg-white">
                      <img
                        src={getProductImageUrl(featuredProduct.imageUrl || featuredProduct.images?.[0])}
                        alt={featuredProduct.nameKh}
                        className="w-full h-full object-cover group-hover/hero:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/25 text-[10px] sm:text-xs font-black text-amber-200">
                        <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />
                        <span className="truncate">FEATURED • នំលក់ដាច់ប្រចាំហាង</span>
                      </div>
                      <h3 className="text-xs sm:text-base font-black truncate mt-0.5 text-white font-battambang">
                        {lang === 'km' ? featuredProduct.nameKh : featuredProduct.nameEn}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-rose-100 font-semibold mt-0.5 flex-wrap">
                        <span className="font-black text-white text-xs sm:text-sm">
                          {(featuredProduct.priceKhr ?? Math.round(featuredProduct.priceUsd * exchangeRate)).toLocaleString()} ៛
                        </span>
                        <span className="text-[11px] sm:text-xs">(~${featuredProduct.priceUsd.toFixed(2)})</span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.2 rounded-md text-amber-200 ml-auto hidden sm:inline-block">
                          ចុចមើលលម្អិត 👁️
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: User's Real Web App Menu Categories in the Flyer's SERVICES Panel */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#361B14] border-2 border-[#542B20] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
                {/* Header Pill */}
                <div className="text-center mb-3.5">
                  <div className="inline-block px-8 py-2 rounded-full bg-[#200E08] text-white font-black text-xs sm:text-sm tracking-[0.2em] uppercase shadow-inner border border-white/10 font-battambang">
                    សេវាកម្ម & ម៉ឺនុយទំនិញ (SERVICES)
                  </div>
                </div>

                {/* Dynamic Category Capsule Pills with Left Arrow Pointers */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    const catName = lang === 'km' ? cat.nameKh : cat.nameEn;
                    const count = cat.id === 'all'
                      ? products.length
                      : products.filter((p) => p.categoryId === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setSelectedCategory(cat.id);
                        }}
                        className={`w-full relative flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs font-black transition-all cursor-pointer select-none ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 scale-102 ring-2 ring-white font-black'
                            : 'bg-white text-slate-800 hover:bg-rose-50 hover:text-[#E6514D] shadow-sm'
                        }`}
                      >
                        {/* Pointer Arrow */}
                        <span
                          className={`renah-arrow-tag ${
                            isActive ? 'renah-arrow-tag-active' : ''
                          }`}
                        />

                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="shrink-0">{getCategoryIcon(cat.icon)}</span>
                          <span className="truncate font-battambang text-xs sm:text-[13px] tracking-normal">
                            {catName}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                            isActive ? 'bg-black/10 text-slate-900' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {count} មុខ
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curved White Wave Ribbon Divider */}
        <div className="relative w-full overflow-hidden leading-none z-10 -mt-1">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-8 sm:h-12 text-[#2D1610] fill-current"
          >
            <path d="M0,0 C150,90 400,110 600,60 C800,10 1050,40 1200,90 L1200,120 L0,120 Z" />
          </svg>
        </div>

        {/* Bottom Rich Chocolate Contact Banner with User's Real Store Info */}
        <div className="relative z-10 bg-chocolate-pattern px-3 sm:px-8 py-3.5 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-[#4A241A]">
          {/* Real Store Phone & Address Pill Box */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#1F0E09] border border-[#E6514D]/60 shadow-lg text-white w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs sm:text-sm shrink-0">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>{storeInfo.phone || '012 345 678'}</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1.5 text-rose-200 font-bold text-xs sm:text-sm min-w-0">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
              <span className="truncate max-w-[170px] sm:max-w-none">
                {storeInfo.address || 'រាជធានីភ្នំពេញ'}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
            {/* Toggle Hide/Show Prices */}
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setHidePrices((prev) => {
                  const next = !prev;
                  localStorage.setItem('showcase_hide_prices', String(next));
                  return next;
                });
              }}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 sm:gap-2 border shadow-lg cursor-pointer ${
                hidePrices
                  ? 'bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border-amber-400/40 ring-2 ring-amber-300/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="ចុចដើម្បីប្តូររវាងលាក់តម្លៃ (សម្រាប់ភ្ញៀវមើល) ឬបង្ហាញតម្លៃ"
            >
              {hidePrices ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 shrink-0" />
                  <span className="hidden sm:inline">លាក់តម្លៃ (Customer Mode) 🙈</span>
                  <span className="sm:hidden">លាក់តម្លៃ 🙈</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
                  <span>បង្ហាញតម្លៃ 👁️</span>
                </>
              )}
            </button>

            {/* Kiosk Slideshow */}
            <button
              onClick={() => {
                soundFx.playPop();
                setIsKioskOpen(true);
              }}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black rounded-2xl border border-white/20 shadow-lg transition-all active:scale-95 flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 animate-pulse" />
              <span>ស្លាយ TV</span>
            </button>

            {/* Add Product Modal */}
            <button
              onClick={() => {
                soundFx.playPop();
                setIsAddProductOpen(true);
              }}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#FF6F68] to-[#E6514D] hover:brightness-110 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              <span>+ នំថ្មី</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Status & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Active Category Indicator Chip */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 bg-white px-3.5 py-2 rounded-2xl border border-[#F2DBD3] shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>
              {selectedCategory === 'all'
                ? 'បង្ហាញមុខទំនិញទាំងអស់'
                : `ប្រភេទ៖ ${categories.find((c) => c.id === selectedCategory)?.nameKh || ''}`}
            </span>
            <span className="px-2 py-0.2 rounded-full bg-rose-50 text-[#E6514D] font-black text-[11px]">
              {filteredProducts.length} មុខ
            </span>
          </span>

          {selectedCategory !== 'all' && (
            <button
              onClick={() => {
                soundFx.playPop();
                setSelectedCategory('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
            >
              បង្ហាញទាំងអស់
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកម៉ូដនំ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#F2DBD3] rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E6514D]/25 focus:border-[#E6514D] font-medium shadow-2xs"
          />
        </div>
      </div>

      {/* Gallery Grid with Auto-transitioning cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ShowcaseCard
            key={product.id}
            product={product}
            onClick={() => {
              soundFx.playPop();
              setPreviewProduct(product);
            }}
            exchangeRate={exchangeRate}
            lang={lang}
            hidePrices={hidePrices}
          />
        ))}
      </div>

      {/* Lightbox Preview Modal with Auto-Slideshow Carousel */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Left side: Photo with Auto-Slideshow, Arrows & Filmstrip */}
            <div className="md:w-1/2 bg-slate-950 relative flex flex-col justify-between overflow-hidden min-h-[320px] md:min-h-[460px]">
              {/* Auto countdown progress bar */}
              {isLightboxAutoPlay && previewImages.length > 1 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
                  <div
                    key={lightboxImgIdx}
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 w-full animate-pulse"
                  />
                </div>
              )}

              {/* Photos with smooth crossfade */}
              <div className="relative flex-1 overflow-hidden flex items-center justify-center">
                {previewImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={getProductImageUrl(img)}
                    alt={`${previewProduct.nameKh} ${idx + 1}`}
                    className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ease-in-out ${
                      idx === lightboxImgIdx
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-95 z-0 pointer-events-none'
                    }`}
                  />
                ))}

                {/* Counter & Auto-play toggle badge */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/10">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span>
                      {lightboxImgIdx + 1}/{previewImages.length}
                    </span>
                  </span>

                  {previewImages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playPop();
                        setIsLightboxAutoPlay(!isLightboxAutoPlay);
                      }}
                      title={isLightboxAutoPlay ? 'ចុចដើម្បីផ្អាកចលនា' : 'ចុចដើម្បីបើកចលនាស្លាយ'}
                      className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                    >
                      {isLightboxAutoPlay ? (
                        <>
                          <Pause className="w-3 h-3 text-pink-400" />
                          <span>ផ្អាកចលនា</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-emerald-400" />
                          <span>ចាក់ស្លាយ</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Mobile close button */}
                <button
                  onClick={() => setPreviewProduct(null)}
                  className="md:hidden absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Prev / Next Arrows */}
                {previewImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevLightboxImg();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextLightboxImg();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              {previewImages.length > 1 && (
                <div className="p-2.5 bg-black/60 backdrop-blur-md flex items-center justify-center gap-2 overflow-x-auto z-20">
                  {previewImages.map((img, idx) => {
                    const isActive = idx === lightboxImgIdx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setLightboxImgIdx(idx);
                        }}
                        className={`w-11 h-11 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? 'border-pink-500 ring-2 ring-pink-500/40 scale-105'
                            : 'border-white/20 opacity-60 hover:opacity-100 hover:border-pink-300'
                        }`}
                      >
                        <img src={getProductImageUrl(img)} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right side: Details & Order Action */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                      ម៉ូដនំពេញនិយមប្រចាំហាង
                    </span>
                    <h3 className="text-xl font-black text-slate-800 mt-1">
                      {lang === 'km' ? previewProduct.nameKh : previewProduct.nameEn}
                    </h3>
                  </div>

                  <button
                    onClick={() => setPreviewProduct(null)}
                    className="hidden md:flex w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price Section: either fixed or custom sizing message */}
                {hidePrices ? (
                  <div className="p-3 bg-gradient-to-r from-pink-50 to-amber-50 border border-pink-200/80 rounded-2xl space-y-1">
                    <span className="text-xs font-black text-pink-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      <span>តម្លៃគិតតាមទំហំ និងការរចនា (Custom Pricing)</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      លោកអ្នកអាចជ្រើសរើសទំហំនំ និងរសជាតិ ហើយបុគ្គលិកនឹងជួយកំណត់តម្លៃជូន!
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-2xl">
                    <div className="text-2xl font-black text-pink-600">
                      {((previewProduct.priceKhr ?? previewProduct.priceUsd * exchangeRate)).toLocaleString()} ៛
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      ~ ${previewProduct.priceUsd.toFixed(2)} USD
                    </div>
                  </div>
                )}

                {previewProduct.description && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ការពិពណ៌នា & គ្រឿងផ្សំ
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {previewProduct.description}
                    </p>
                  </div>
                )}

                <div className="text-xs text-slate-500 space-y-1">
                  <div>• នំដុតថ្មីៗស្រស់ៗរាល់ថ្ងៃ គុណភាពខ្ពស់</div>
                  <div>• អាចជ្រើសរើសទំហំ និងសរសេរអក្សរជូនពរបានតាមចិត្ត</div>
                  <div>
                    • ស្តុកសល់៖ {previewProduct.stockQty} {previewProduct.unit}
                  </div>
                  {previewImages.length > 1 && (
                    <div className="text-pink-600 font-bold">
                      • មានរូបភាពចំនួន {previewImages.length} ជ្រុងបង្ហាញជូនភ្ញៀវ
                    </div>
                  )}
                </div>
              </div>

              {/* Order / Select design button */}
              <button
                type="button"
                onClick={() => {
                  handleOpenCustomPrice(previewProduct);
                  setPreviewProduct(null);
                }}
                className="w-full py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>រើសម៉ូដនំនេះ & កំណត់តម្លៃ ✨ (Select Design & Set Price)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Image Upload Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      {/* Auto-play Kiosk Slideshow Modal */}
      <KioskSlideshowModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        products={filteredProducts}
        onOrderProduct={(prod) => {
          handleOpenCustomPrice(prod);
          setIsKioskOpen(false);
        }}
        hidePrices={hidePrices}
        onToggleHidePrices={() => {
          setHidePrices((prev) => {
            const next = !prev;
            localStorage.setItem('showcase_hide_prices', String(next));
            return next;
          });
        }}
      />

      {/* Modal to configure custom size, flavor, notes, and agreed price */}
      <SelectDesignPriceModal
        isOpen={isSelectPriceModalOpen}
        onClose={() => {
          setIsSelectPriceModalOpen(false);
          setProductForCustomPricing(null);
        }}
        product={productForCustomPricing}
        onAddToCart={(customizedProduct, size, flavor, notes) => {
          addToCart(customizedProduct, size, flavor);
        }}
        onOpenCustomOrder={(orderData) => {
          setCustomOrderInitialData({
            orderType: 'CAKE',
            cakeName: orderData.cakeName,
            size: orderData.size,
            flavor: orderData.flavor,
            themeNotes: orderData.themeNotes,
            referenceImage: orderData.referenceImage,
            totalKhr: orderData.totalKhr,
            depositKhr: orderData.depositKhr,
          });
          setIsCustomOrderModalOpen(true);
        }}
      />

      {/* New Custom Order Modal pre-filled with design details */}
      <NewCustomOrderModal
        isOpen={isCustomOrderModalOpen}
        onClose={() => {
          setIsCustomOrderModalOpen(false);
          setCustomOrderInitialData(null);
        }}
        initialData={customOrderInitialData}
      />
    </div>
  );
};
