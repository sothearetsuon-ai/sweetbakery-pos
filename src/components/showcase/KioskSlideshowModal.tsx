import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Cake, Eye, EyeOff } from 'lucide-react';
import { Product } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

interface KioskSlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOrderProduct: (product: Product) => void;
  hidePrices?: boolean;
  onToggleHidePrices?: () => void;
}

export const KioskSlideshowModal: React.FC<KioskSlideshowModalProps> = ({
  isOpen,
  onClose,
  products,
  onOrderProduct,
  hidePrices = true,
  onToggleHidePrices,
}) => {
  const { lang, exchangeRate, storeInfo } = useBakery();
  const [currentProductIdx, setCurrentProductIdx] = useState(0);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeProduct = products[currentProductIdx] || products[0];
  const activeImages =
    activeProduct?.images && activeProduct.images.length > 0
      ? activeProduct.images
      : [activeProduct?.imageUrl || ''];

  // Auto-play slideshow timer
  useEffect(() => {
    if (!isOpen || !isPlaying || products.length === 0) return;

    const timer = setInterval(() => {
      setCurrentImageIdx((prevImg) => {
        if (prevImg + 1 < activeImages.length) {
          return prevImg + 1;
        } else {
          // Move to next product
          setCurrentProductIdx((prevProd) => (prevProd + 1) % products.length);
          return 0;
        }
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, activeImages.length, products.length]);

  if (!isOpen || !activeProduct) return null;

  const nextSlide = () => {
    soundFx.playPop();
    if (currentImageIdx + 1 < activeImages.length) {
      setCurrentImageIdx((prev) => prev + 1);
    } else {
      setCurrentProductIdx((prev) => (prev + 1) % products.length);
      setCurrentImageIdx(0);
    }
  };

  const prevSlide = () => {
    soundFx.playPop();
    if (currentImageIdx > 0) {
      setCurrentImageIdx((prev) => prev - 1);
    } else {
      const prevProdIdx = (currentProductIdx - 1 + products.length) % products.length;
      setCurrentProductIdx(prevProdIdx);
      const prevImages = products[prevProdIdx]?.images || [];
      setCurrentImageIdx(prevImages.length > 1 ? prevImages.length - 1 : 0);
    }
  };

  const priceKhr = activeProduct.priceKhr ?? Math.round(activeProduct.priceUsd * exchangeRate);
  const name = lang === 'km' ? activeProduct.nameKh : activeProduct.nameEn;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between text-white animate-in fade-in duration-300 select-none">
      {/* Top Header Bar */}
      <div className="p-6 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 p-0.5 shadow-lg shadow-pink-500/30 overflow-hidden">
            {storeInfo.logoUrl ? (
              <img src={storeInfo.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-[14px]" />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <Cake className="w-5 h-5 text-white animate-float" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-black text-sm text-white tracking-wide">
              {storeInfo.nameKh}
            </h3>
            <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-300 animate-spin-slow" />
              <span>កាតាឡុកបញ្ចាំងស្លាយស្វ័យប្រវត្តិ • Live Cake Slideshow</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Hide / Show Price Toggle */}
          {onToggleHidePrices && (
            <button
              onClick={() => {
                soundFx.playPop();
                onToggleHidePrices();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                hidePrices
                  ? 'bg-amber-500/30 border-amber-300/50 text-amber-200 hover:bg-amber-500/45'
                  : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
              }`}
              title="ចុចដើម្បីប្តូររវាងលាក់តម្លៃ ឬបង្ហាញតម្លៃ"
            >
              {hidePrices ? (
                <>
                  <EyeOff className="w-4 h-4 text-yellow-300" />
                  <span>លាក់តម្លៃ 🙈</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-emerald-300" />
                  <span>បង្ហាញតម្លៃ 👁️</span>
                </>
              )}
            </button>
          )}

          {/* Play/Pause Toggle */}
          <button
            onClick={() => {
              soundFx.playPop();
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-pink-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span>{isPlaying ? 'ផ្អាកស្លាយ' : 'បន្តបញ្ចាំង'}</span>
          </button>

          {/* Close Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slideshow View */}
      <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        {/* Background Blurred Glow */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-25 scale-110 transition-all duration-1000"
          style={{ backgroundImage: `url(${activeImages[currentImageIdx]})` }}
        />

        {/* Big Cake Image Container */}
        <div className="relative max-w-5xl w-full h-[65vh] flex flex-col md:flex-row items-center justify-center gap-8 z-10">
          {/* Photo Frame with subtle Ken Burns zoom */}
          <div className="relative w-full md:w-3/5 h-full rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-pink-500/20 group">
            {activeImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${name} ${idx + 1}`}
                className={`w-full h-full object-cover absolute inset-0 transition-all duration-1000 ease-in-out ${
                  idx === currentImageIdx
                    ? 'opacity-100 scale-105 z-10'
                    : 'opacity-0 scale-95 z-0 pointer-events-none'
                }`}
              />
            ))}

            {/* Photo Counter Badge */}
            {activeImages.length > 1 && (
              <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/15">
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>រូបទី {currentImageIdx + 1} នៃ {activeImages.length}</span>
              </div>
            )}

            {/* Prev / Next Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            {activeImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                {activeImages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentImageIdx ? 'w-6 bg-pink-500' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Ordering */}
          <div className="w-full md:w-2/5 space-y-5 text-left bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-pink-600/30 border border-pink-500/40 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2">
                ★ នំខេកពេញនិយមប្រចាំហាង
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {name}
              </h2>
            </div>

            {/* Price Box or Custom Pricing message */}
            {hidePrices ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-900/30 to-amber-900/30 border border-pink-500/30 space-y-1">
                <span className="text-xs text-pink-200 block font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>តម្លៃតាមទំហំ និងការរចនា (Custom Pricing)</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  លោកអ្នកអាចជ្រើសរើសទំហំ និងរសជាតិ ហើយបុគ្គលិកនឹងជួយកំណត់តម្លៃជូនភ្លាមៗ!
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-900/40 to-rose-900/30 border border-pink-500/30">
                <span className="text-xs text-pink-200 block font-semibold">តម្លៃលក់ជូនភ្ញៀវ៖</span>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-300">
                  {priceKhr.toLocaleString()} ៛
                </div>
                <div className="text-xs text-slate-300 font-semibold">
                  ~ ${activeProduct.priceUsd.toFixed(2)} USD
                </div>
              </div>
            )}

            {activeProduct.description && (
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeProduct.description}
              </p>
            )}

            <div className="text-xs text-slate-400 space-y-1">
              <div>• នំដុតថ្មីៗស្រស់ៗរៀងរាល់ថ្ងៃ</div>
              <div>• អាចជ្រើសរើសទំហំ និងសរសេរអក្សរជូនពរបាន</div>
              <div>• ស្តុកសល់៖ {activeProduct.stockQty} {activeProduct.unit}</div>
            </div>

            {/* Order Button */}
            <button
              onClick={() => {
                onOrderProduct(activeProduct);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-black text-sm shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>រើសម៉ូដនំនេះ & កំណត់តម្លៃ ✨</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Filmstrip */}
      <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center gap-3 overflow-x-auto z-20">
        <span className="text-xs font-bold text-slate-400 shrink-0">មុខនំទាំងអស់៖</span>
        {products.map((p, idx) => {
          const isSelected = idx === currentProductIdx;
          const cover = p.images?.[0] || p.imageUrl;
          return (
            <button
              key={p.id}
              onClick={() => {
                soundFx.playPop();
                setCurrentProductIdx(idx);
                setCurrentImageIdx(0);
              }}
              className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'border-pink-500 ring-2 ring-pink-500/50 scale-110'
                  : 'border-white/20 opacity-60 hover:opacity-100 hover:border-pink-300'
              }`}
            >
              <img src={cover} alt={p.nameKh} className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
