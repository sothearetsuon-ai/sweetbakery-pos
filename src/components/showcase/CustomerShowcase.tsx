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
      className="group bg-white rounded-3xl border border-rose-100/90 overflow-hidden shadow-xs hover:shadow-2xl hover:shadow-pink-500/15 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between transform-gpu"
    >
      {/* Photo with smooth transition */}
      <div className="relative w-full h-56 bg-rose-50 overflow-hidden">
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
                  idx === currentIdx ? 'w-4 bg-pink-400' : 'w-1.5 bg-white/60'
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
        <h3 className="font-bold text-slate-800 text-sm group-hover:text-pink-600 transition-colors line-clamp-1">
          {name}
        </h3>
        {product.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="pt-2 border-t border-rose-50 flex items-center justify-between">
          {hidePrices ? (
            <>
              <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-500" />
                <span>តម្លៃតាមទំហំ & ម៉ូដ</span>
              </span>
              <span className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl text-xs font-black transition-all shadow-2xs group-hover:scale-105">
                រើសម៉ូដនំ ✨
              </span>
            </>
          ) : (
            <>
              <div>
                <div className="text-lg font-black text-pink-600">
                  {priceKhr.toLocaleString()} ៛
                </div>
                <div className="text-[11px] text-slate-400 font-semibold">
                  ~ ${priceUsd.toFixed(2)}
                </div>
              </div>

              <span className="px-3 py-1.5 bg-pink-50 group-hover:bg-pink-600 group-hover:text-white text-pink-600 rounded-xl text-xs font-bold transition-all shadow-2xs">
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
  const { lang, products, categories, exchangeRate, addToCart } = useBakery();
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
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 pb-24 md:pb-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 p-4 sm:p-8 text-white shadow-xl shadow-pink-500/20 overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-15">
          <Cake className="w-56 h-56" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl space-y-1.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              កាតាឡុកបង្ហាញភ្ញៀវ • Customer Showcase Gallery
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              បណ្តុំរូបភាពនំខេកស្អាតៗ & ចលនាស្លាយ 🎂
            </h2>
            <p className="text-xs sm:text-sm text-pink-100 font-medium">
              ភ្ញៀវអាចមើលរូបនំស្អាតៗសិនដោយមិនបាច់គិតតម្លៃ — ពេលភ្ញៀវពេញចិត្តម៉ូដណា បុគ្គលិកអាចចុចកំណត់តម្លៃតាមទំហំ និងការរចនាបានភ្លាមៗ!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Toggle Hide/Show Prices for Customers */}
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
              className={`px-3.5 sm:px-4 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 border shadow-lg cursor-pointer ${
                hidePrices
                  ? 'bg-amber-500/30 hover:bg-amber-500/45 text-amber-100 border-amber-300/40 ring-2 ring-amber-300/30'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
              }`}
              title="ចុចដើម្បីប្តូររវាងលាក់តម្លៃ (សម្រាប់អោយភ្ញៀវមើល) ឬបង្ហាញតម្លៃ"
            >
              {hidePrices ? (
                <>
                  <EyeOff className="w-4 h-4 text-yellow-300" />
                  <span>របៀបបង្ហាញភ្ញៀវ៖ លាក់តម្លៃ 🙈</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-emerald-300" />
                  <span>របៀបទូទៅ៖ បង្ហាញតម្លៃ 👁️</span>
                </>
              )}
            </button>

            {/* Kiosk Slideshow Button */}
            <button
              onClick={() => {
                soundFx.playPop();
                setIsKioskOpen(true);
              }}
              className="px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black rounded-2xl border border-white/20 shadow-lg transition-all active:scale-95 flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <Tv className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>ស្លាយស្វ័យប្រវត្តិ (Kiosk)</span>
            </button>

            {/* Multi-Image Upload Button */}
            <button
              onClick={() => {
                soundFx.playPop();
                setIsAddProductOpen(true);
              }}
              className="px-4 sm:px-5 py-3 bg-white hover:bg-pink-50 text-pink-700 font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>+ បន្ថែមម៉ូដនំថ្មី</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
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
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 shadow-2xs cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-102'
                    : 'bg-white/90 text-slate-600 hover:bg-white hover:text-pink-600 border border-rose-100'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកម៉ូដនំ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-rose-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium shadow-2xs"
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
