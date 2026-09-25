import React, { useState, useEffect } from 'react';
import {
  X,
  Cake,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Layers,
  Heart,
  Palette,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

interface SelectDesignPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (customizedProduct: Product, size: string, flavor: string, notes: string) => void;
  onOpenCustomOrder: (orderData: {
    cakeName: string;
    size: string;
    flavor: string;
    filling?: string;
    themeNotes?: string;
    referenceImage?: string;
    totalKhr?: number;
    depositKhr?: number;
  }) => void;
}

const COMMON_SIZES = [
  '1.5 ទឹក (~15cm)',
  '2 ទឹក (~20cm)',
  '2.5 ទឹក (~25cm)',
  '3 ទឹក (~30cm)',
  '4 ទឹក (~40cm)',
  '2 ជាន់ (2-Tier)',
  '3 ជាន់ (3-Tier)',
];

const COMMON_FLAVORS = [
  'វ៉ានីឡា (Vanilla)',
  'សូកូឡា (Chocolate Fudge)',
  'ស្ត្រប៊ឺរីស្រស់ (Fresh Strawberry)',
  'ស្លឹកតើយឈ្ងុយ (Pandan)',
  'ត្រាវ (Taro)',
  'កាហ្វេម៉ូកា (Coffee Mocha)',
  'ឈីសខេក (Cheesecake)',
  'ទឹកដោះគោស្រស់ (Fresh Milk)',
];

const PRICE_PRESETS_KHR = [
  30000, 40000, 50000, 60000, 80000, 100000, 120000, 150000, 200000,
];

export const SelectDesignPriceModal: React.FC<SelectDesignPriceModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onOpenCustomOrder,
}) => {
  const { exchangeRate, lang, flavors } = useBakery();

  const [selectedSize, setSelectedSize] = useState('2 ទឹក (~20cm)');
  const [customSize, setCustomSize] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('វ៉ានីឡា (Vanilla)');
  const [customFlavor, setCustomFlavor] = useState('');
  const [priceKhrStr, setPriceKhrStr] = useState('60000');
  const [inscription, setInscription] = useState('');
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  // Sync default price and details when product changes
  useEffect(() => {
    if (product) {
      const baseKhr = product.priceKhr ?? Math.round(product.priceUsd * exchangeRate);
      setPriceKhrStr(baseKhr > 0 ? baseKhr.toString() : '60000');
      setSelectedSize('2 ទឹក (~20cm)');
      setCustomSize('');
      setSelectedFlavor(flavors[0] || 'វ៉ានីឡា (Vanilla)');
      setCustomFlavor('');
      setInscription('');
      setSelectedImgIdx(0);
    }
  }, [product, exchangeRate, flavors]);

  if (!isOpen || !product) return null;

  const rawImages =
    product.images && product.images.length > 0
      ? product.images.filter(Boolean)
      : [product.imageUrl].filter(Boolean);
  const images =
    rawImages.length > 0
      ? rawImages
      : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80'];

  const finalSize = customSize.trim() || selectedSize;
  const finalFlavor = customFlavor.trim() || selectedFlavor;
  const finalPriceKhr = Number(priceKhrStr.replace(/[^0-9]/g, '')) || 0;
  const finalPriceUsd = Number((finalPriceKhr / exchangeRate).toFixed(2));
  const basePriceKhr = product.priceKhr ?? Math.round(product.priceUsd * exchangeRate);

  const handleAddToCartClick = () => {
    soundFx.playSuccess();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });

    const customizedProduct: Product = {
      ...product,
      nameKh: `${product.nameKh} (${finalSize})`,
      priceKhr: finalPriceKhr,
      priceUsd: finalPriceUsd,
      imageUrl: images[selectedImgIdx] || product.imageUrl,
    };

    onAddToCart(customizedProduct, finalSize, finalFlavor, inscription);
    onClose();
  };

  const handleCustomOrderClick = () => {
    soundFx.playPop();
    const depositSuggested = Math.round(finalPriceKhr * 0.5);

    onOpenCustomOrder({
      cakeName: `${product.nameKh} (${product.nameEn || ''})`,
      size: finalSize,
      flavor: finalFlavor,
      themeNotes: inscription ? `សរសេរអក្សរលើនំ៖ ${inscription}` : `ម៉ូដនំកាតាឡុក៖ ${product.nameKh}`,
      referenceImage: images[selectedImgIdx] || product.imageUrl,
      totalKhr: finalPriceKhr,
      depositKhr: depositSuggested,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">
                រើសម៉ូដនំ & កំណត់តម្លៃលក់ជាក់ស្តែង
              </h3>
              <p className="text-[11px] text-pink-100 font-medium">
                កំណត់ទំហំ រសជាតិ និងតម្លៃលក់តាមការចរចាជាមួយភ្ញៀវ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Cake Model Overview Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 bg-rose-50/60 border border-rose-100 rounded-3xl">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-pink-200 shadow-sm bg-white">
              <img
                src={images[selectedImgIdx] || images[0]}
                alt={product.nameKh}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                  {selectedImgIdx + 1}/{images.length}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-white px-2.5 py-0.5 rounded-full border border-pink-100">
                ម៉ូដនំដែលភ្ញៀវជ្រើសរើស
              </span>
              <h4 className="font-black text-slate-800 text-base sm:text-lg leading-tight">
                {lang === 'km' ? product.nameKh : product.nameEn}
              </h4>
              {product.description && (
                <p className="text-xs text-slate-500 line-clamp-2">
                  {product.description}
                </p>
              )}

              {/* Multi-image thumbnail switcher */}
              {images.length > 1 && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedImgIdx(idx);
                      }}
                      className={`w-8 h-8 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        selectedImgIdx === idx
                          ? 'border-pink-500 ring-2 ring-pink-400/40 scale-105'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Selling Price Section */}
          <div className="space-y-2.5 p-4 bg-gradient-to-br from-amber-50/70 via-pink-50/40 to-rose-50/60 rounded-3xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                  ៛
                </span>
                <span>កំណត់តម្លៃលក់ជាក់ស្តែង (Selling Price) *</span>
              </label>

              {basePriceKhr > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPriceKhrStr(basePriceKhr.toString());
                  }}
                  className="text-[10px] font-bold text-pink-600 hover:text-pink-700 bg-white px-2 py-0.5 rounded-lg border border-pink-200 transition-colors cursor-pointer"
                >
                  🔄 ប្រើតម្លៃដើម ({basePriceKhr.toLocaleString()} ៛)
                </button>
              )}
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">
                  តម្លៃជារៀល (KHR ៛)
                </span>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceKhrStr}
                    onChange={(e) => setPriceKhrStr(e.target.value)}
                    placeholder="ឧ. 60000"
                    className="w-full pl-3 pr-8 py-2.5 bg-white border-2 border-pink-200 rounded-2xl text-base font-black text-pink-600 focus:outline-none focus:border-pink-500 shadow-inner"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-pink-400">
                    ៛
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">
                  តម្លៃប្រហាក់ប្រហែលជាដុល្លារ (~USD $)
                </span>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={`$${finalPriceUsd.toFixed(2)}`}
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-base font-bold text-slate-600 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">
                    1$ = {exchangeRate}៛
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
                ជ្រើសរើសតម្លៃរហ័ស (Quick Presets)៖
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRICE_PRESETS_KHR.map((pr) => {
                  const isSelected = finalPriceKhr === pr;
                  return (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setPriceKhrStr(pr.toString());
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-pink-600 text-white shadow-xs scale-105'
                          : 'bg-white text-slate-700 hover:bg-pink-50 border border-rose-100'
                      }`}
                    >
                      {pr.toLocaleString()} ៛
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-pink-500" />
              <span>ជ្រើសរើសទំហំនំ (Cake Size)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SIZES.map((sz) => {
                const isSelected = selectedSize === sz && !customSize;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedSize(sz);
                      setCustomSize('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="ឬវាយបញ្ចូលទំហំផ្សេងទៀត (ឧ. 1.2 kg, 5 ទឹក)..."
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>

          {/* Flavor Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-500" />
              <span>ជ្រើសរើសរសជាតិ (Cake Flavor)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_FLAVORS.map((fl) => {
                const isSelected = selectedFlavor === fl && !customFlavor;
                return (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedFlavor(fl);
                      setCustomFlavor('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {fl}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="ឬវាយបញ្ចូលរសជាតិផ្សេងទៀត (ឧ. សូកូឡា + គ្រាប់អាល់ម៉ុន)..."
              value={customFlavor}
              onChange={(e) => setCustomFlavor(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>

          {/* Inscription & Special Request */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              សរសេរអក្សរជូនពរលើនំ ឬចំណាំបន្ថែម (Inscription & Notes)
            </label>
            <input
              type="text"
              placeholder="ឧ. Happy Birthday Dara, អាយុ 18 ឆ្នាំ, ពណ៌ផ្កាឈូក..."
              value={inscription}
              onChange={(e) => setInscription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>
        </div>

        {/* Modal Footer with 2 Action Choices */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          {/* Action 1: Add to POS Cart */}
          <button
            type="button"
            onClick={handleAddToCartClick}
            className="w-full sm:w-1/2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-pink-400" />
            <span>បញ្ចូលកន្ត្រក POS (លក់ភ្លាម)</span>
          </button>

          {/* Action 2: Create Custom Order Pipeline */}
          <button
            type="button"
            onClick={handleCustomOrderClick}
            className="w-full sm:w-1/2 py-3.5 px-4 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-pink-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>កុម្ម៉ង់ទុកជាមុន (Custom Order)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
