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

// Iconic Chef Hat SVG matching the Renah's Cake logo
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

// Services matching the Pinterest flyer
export const RENAH_SERVICES = [
  { id: 'all', titleFr: 'TOUT AFFICHER', labelKh: 'បង្ហាញទាំងអស់', desc: 'All Cakes & Delights' },
  { id: 'mariage', titleFr: 'GÂTEAUX DE MARIAGE', labelKh: 'នំមង្គលការ (Wedding Cakes)', categoryId: 'birthday', keywords: ['wedding', 'mariage', 'ការ', 'អាពាហ៍ពិពាហ៍', '2 ជាន់', 'tier'] },
  { id: 'anniversaire', titleFr: "GÂTEAUX D'ANNIVERSAIRE", labelKh: 'នំខួបកំណើត (Birthday Cakes)', categoryId: 'birthday', keywords: ['birthday', 'ខួប', 'anniversaire', 'cake', 'សូកូឡា', 'ស្ត្រប៊ែរី'] },
  { id: 'biscuit', titleFr: 'BISCUIT SABLÉ', labelKh: 'នំប្រៃ & ឃុកឃី (Shortbread Cookies)', categoryId: 'pastries', keywords: ['biscuit', 'cookie', 'ឃុកឃី', 'sable', 'sabla', 'cracker'] },
  { id: 'cupcake', titleFr: 'CUPCAKE', labelKh: 'ខាប់ខេក (Cupcakes)', categoryId: 'slices', keywords: ['cupcake', 'ខាប់', 'muffin'] },
  { id: 'pastels', titleFr: 'PASTELS', labelKh: 'នំផាស្តែល & ក្រូសង់ (Pastels & Pastries)', categoryId: 'pastries', keywords: ['pastel', 'croissant', 'ក្រូសង់', 'bread', 'នំប៉័ង'] },
  { id: 'amuses', titleFr: 'AMUSES GUEULE', labelKh: 'អាហារសម្រន់ (Appetizers & Snacks)', categoryId: 'party', keywords: ['snack', 'drink', 'party', 'កាហ្វេ', 'ភេសជ្ជៈ', 'amuse'] },
  { id: 'traiteur', titleFr: 'SERVICE TRAITEUR', labelKh: 'សេវាកម្មរៀបចំកម្មវិធី (Catering)', categoryId: 'party', keywords: ['traiteur', 'catering', 'service', 'ពិធី'] },
];

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
  const [selectedService, setSelectedService] = useState<string>('all');
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

      let matchService = true;
      if (selectedService !== 'all') {
        const srv = RENAH_SERVICES.find((s) => s.id === selectedService);
        if (srv) {
          const textToSearch = `${p.nameKh} ${p.nameEn} ${p.description || ''} ${p.categoryId}`.toLowerCase();
          const matchKw = srv.keywords?.some((kw) => textToSearch.includes(kw.toLowerCase()));
          const matchCat = srv.categoryId ? p.categoryId === srv.categoryId : false;
          matchService = Boolean(matchKw || matchCat);
        }
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.nameKh.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchCategory && matchService && matchSearch;
    });

    if (list.length === 0 && selectedService !== 'all') {
      return sortProductsNewestFirst(
        products.filter((p) => {
          const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
          const q = searchQuery.toLowerCase().trim();
          return (
            matchCategory &&
            (!q ||
              p.nameKh.toLowerCase().includes(q) ||
              p.nameEn.toLowerCase().includes(q) ||
              (p.description && p.description.toLowerCase().includes(q)))
          );
        })
      );
    }

    return sortProductsNewestFirst(list);
  }, [products, selectedCategory, selectedService, searchQuery]);

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
          Pinterest "Renah's Cake" Signature Visual Showcase Flyer
          ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-rose-200/90 bg-chocolate-pattern">
        {/* Top Salmon-Coral Section */}
        <div className="relative bg-renah-coral p-5 sm:p-8 md:p-10 text-white overflow-hidden">
          {/* Subtle Ambient Depth Lighting */}
          <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
          <div className="absolute top-1/3 -right-10 w-56 h-56 rounded-full bg-amber-300/25 blur-3xl pointer-events-none" />

          {/* Grid Layout: Left Hero Cakes Composition | Right SERVICES Panel */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Brand & Signature Pastry Circles */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Brand Logo & Calligraphy Header (Renah's Cake motif) */}
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white text-slate-900 shadow-xl flex items-center justify-center p-2.5 transform -rotate-6 hover:rotate-0 transition-transform">
                  <ChefHatIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900" />
                </div>
                <div>
                  <div className="flex items-baseline leading-none">
                    <span className="font-cursive-bakery text-4xl sm:text-5xl md:text-6xl text-white font-bold drop-shadow-md">
                      Renah’s
                    </span>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 ml-2 tracking-tight drop-shadow-sm font-sans">
                      Cake
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-rose-100 flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                    <span>{storeInfo.nameKh ? `${storeInfo.nameKh} • ` : ''}កាតាឡុកនំខេក & បង្អែមប្រណិត</span>
                  </div>
                </div>
              </div>

              {/* Floating Circular Showcase Photos (Matching Pinterest flyer) */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  {/* Circle 1: Pink Floral Wedding Cake */}
                  <div
                    title="នំមង្គលការ (Wedding Cake)"
                    className="renah-circle-frame w-18 h-18 sm:w-22 sm:h-22 shrink-0 bg-white cursor-pointer"
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedService('mariage');
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=300&q=80"
                      alt="Wedding Cake"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Circle 2: Golden Round Cookies */}
                  <div
                    title="នំប្រៃ & ឃុកឃី (Biscuits)"
                    className="renah-circle-frame w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white cursor-pointer"
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedService('biscuit');
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80"
                      alt="Biscuits"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Circle 3: Birthday Sparkle Drip Cake */}
                  <div
                    title="នំខួបកំណើត (Birthday Cake)"
                    className="renah-circle-frame w-18 h-18 sm:w-22 sm:h-22 shrink-0 bg-white cursor-pointer"
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedService('anniversaire');
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80"
                      alt="Birthday Sparkle Cake"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Circle 4: Flaky Pastries / Croissant */}
                  <div
                    title="ក្រូសង់ & ផាស្តែល (Pastels)"
                    className="renah-circle-frame w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white cursor-pointer"
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedService('pastels');
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=300&q=80"
                      alt="Pastels"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Circle 5: Savory Appetizers / Snacks */}
                  <div
                    title="អាហារសម្រន់ (Appetizers)"
                    className="renah-circle-frame w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white cursor-pointer"
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedService('amuses');
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=300&q=80"
                      alt="Snacks"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Hero Showcase Centerpiece Card */}
                <div className="p-3.5 sm:p-4 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-4 shadow-lg">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 border-white">
                    <img
                      src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80"
                      alt="Chocolate Drip Cake"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/25 text-[10px] sm:text-xs font-black text-amber-200">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>SIGNATURE CAKE • នំប្រចាំហាង</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black truncate mt-0.5 text-white">
                      2-Tier Chocolate Drip & Fresh Berries Cake
                    </h3>
                    <p className="text-xs text-pink-100 font-medium line-clamp-1">
                      ស្រទាប់សូកូឡាទឹកឃ្មុំរលោង តុបតែងដោយផ្លែបឺរីស្រស់ និងស្ត្រប៊ែរីអាវធំ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Iconic Pinterest "SERVICES" Capsule Panel */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#361B14] border-2 border-[#542B20] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
                {/* Header Pill */}
                <div className="text-center mb-3.5">
                  <div className="inline-block px-8 py-2 rounded-full bg-[#200E08] text-white font-black text-sm sm:text-base tracking-[0.25em] uppercase shadow-inner border border-white/10">
                    SERVICES
                  </div>
                </div>

                {/* Service Pills with Arrow Pointers */}
                <div className="space-y-2">
                  {RENAH_SERVICES.map((srv) => {
                    const isActive = selectedService === srv.id;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setSelectedService(srv.id);
                          if (srv.id === 'all') {
                            setSelectedCategory('all');
                          } else if (srv.categoryId) {
                            setSelectedCategory(srv.categoryId);
                          }
                        }}
                        className={`w-full relative flex items-center justify-between px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-black transition-all cursor-pointer select-none ${
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

                        <span className="tracking-wide uppercase text-[11px] sm:text-xs">
                          {srv.titleFr}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-black/10 text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {srv.labelKh}
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

        {/* Bottom Rich Chocolate Contact Banner (Matching flyer footer) */}
        <div className="relative z-10 bg-chocolate-pattern px-4 sm:px-8 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#4A241A]">
          {/* Contact Pill Box */}
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#1F0E09] border border-[#E6514D]/60 shadow-lg text-white">
            <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs sm:text-sm">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{storeInfo.phone || '+228 93166654 / 97542505'}</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1.5 text-rose-200 font-bold text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span className="truncate max-w-[180px] sm:max-w-none">
                {storeInfo.address || 'Tokoin Casablanca'}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
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
              className={`px-3.5 sm:px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 border shadow-lg cursor-pointer ${
                hidePrices
                  ? 'bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border-amber-400/40 ring-2 ring-amber-300/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="ចុចដើម្បីប្តូររវាងលាក់តម្លៃ (សម្រាប់ភ្ញៀវមើល) ឬបង្ហាញតម្លៃ"
            >
              {hidePrices ? (
                <>
                  <EyeOff className="w-4 h-4 text-yellow-300" />
                  <span>លាក់តម្លៃ (Customer Mode) 🙈</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-emerald-300" />
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
              className="px-3.5 sm:px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black rounded-2xl border border-white/20 shadow-lg transition-all active:scale-95 flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Tv className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>ស្លាយ Kiosk (TV)</span>
            </button>

            {/* Add Product Modal */}
            <button
              onClick={() => {
                soundFx.playPop();
                setIsAddProductOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-[#FF6F68] to-[#E6514D] hover:brightness-110 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ នំថ្មី</span>
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
