import React, { useState } from 'react';
import { Plus, Check, Sparkles, Flame, Heart, Cake, RefreshCw, X } from 'lucide-react';
import { Product } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { lang, exchangeRate, restockProduct } = useBakery();
  const text = t[lang];
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [addQty, setAddQty] = useState('10');

  // Reset imgError if product changes
  React.useEffect(() => {
    setImgError(false);
  }, [product.id, product.imageUrl, product.images]);

  const handleAdd = () => {
    soundFx.playPop();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  const name = lang === 'km' ? product.nameKh : product.nameEn;
  const priceKhr = product.priceKhr ?? Math.round(product.priceUsd * exchangeRate);
  const priceUsd = product.priceKhr ? Number((product.priceKhr / exchangeRate).toFixed(2)) : product.priceUsd;

  const isBestSeller = product.id === 'p1' || product.id === 'p5';
  const isFresh = product.id === 'p2' || product.id === 'p6';

  const defaultCakeFallback =
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80';

  const displayImage =
    (!imgError && (product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : ''))) ||
    defaultCakeFallback;

  return (
    <div
      onClick={handleAdd}
      className="group bg-white rounded-3xl border border-rose-100/80 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-pink-500/15 hover:border-pink-300 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between select-none relative"
    >
      <div>
        {/* Image Frame */}
        <div className="relative w-full h-32 sm:h-40 bg-gradient-to-br from-rose-50 to-pink-100 overflow-hidden flex items-center justify-center">
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            onError={() => {
              if (!imgError) setImgError(true);
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10">
            {isBestSeller && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-yellow-200" />
                Best
              </span>
            )}
            {isFresh && (
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs">
                <Flame className="w-3 h-3 text-emerald-200 animate-pulse" />
                ស្រស់ៗ
              </span>
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playChime();
              setIsLiked(!isLiked);
            }}
            className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 shadow-sm z-10"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Stock remaining tag */}
          {product.stockQty <= 5 && product.stockQty > 0 && (
            <span className="absolute bottom-1.5 left-2 bg-rose-600/90 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
              សល់ {product.stockQty} {product.unit}
            </span>
          )}

          {product.stockQty === 0 && (
            <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center p-2 z-20 text-center gap-2">
              <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-md">
                {text.outOfStock}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playPop();
                  setIsRestockOpen(true);
                }}
                className="px-2.5 py-1.5 bg-white hover:bg-pink-50 text-pink-600 font-bold text-[11px] rounded-xl shadow-md border border-pink-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 animate-spin-slow" />
                <span>+ បន្ថែមស្តុក</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-2.5 sm:p-3.5 space-y-0.5 sm:space-y-1">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-1 sm:line-clamp-2 group-hover:text-pink-600 transition-colors">
            {name}
          </h3>
          {product.description && (
            <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Pricing & Add Button (Prioritizing KHR ៛ First!) */}
      <div className="px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5 pt-1 flex items-center justify-between border-t border-slate-100/80 mt-0.5">
        <div>
          {/* KHR FIRST in large bold font */}
          <div className="text-xs sm:text-base font-black text-pink-600 tracking-tight">
            {priceKhr.toLocaleString()} ៛
          </div>
          {/* USD second */}
          <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">
            ${priceUsd.toFixed(2)}
          </div>
        </div>

        {product.stockQty === 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playPop();
              setIsRestockOpen(true);
            }}
            className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
            title="បញ្ចូលស្តុកនំនេះ"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>ថែមស្តុក</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md ${
              justAdded
                ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/30'
                : 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white hover:shadow-pink-500/30 group-hover:scale-105 active:scale-95'
            }`}
          >
            {justAdded ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            )}
          </button>
        )}
      </div>

      {/* Quick Restock Modal */}
      {isRestockOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-rose-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-rose-100/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">បញ្ចូលស្តុកនំថ្មី</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRestockOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600">ស្តុកបច្ចុប្បន្ន៖</span>
                <span className="font-black text-rose-600 text-sm">
                  {product.stockQty} {product.unit} (អស់ពីស្តុក)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ចំនួនដែលត្រូវបន្ថែម ({product.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  className="w-full px-4 py-2.5 text-lg font-black border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800 text-center"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setAddQty(val.toString());
                    }}
                    className="py-1.5 bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRestockOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  const qty = parseInt(addQty, 10) || 0;
                  if (qty > 0) {
                    soundFx.playSuccess();
                    restockProduct(product.id, qty);
                    setIsRestockOpen(false);
                  }
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-600/20 active:scale-95 transition-all"
              >
                ✓ បញ្ជាក់ការថែមស្តុក
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
