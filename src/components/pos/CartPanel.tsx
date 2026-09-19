import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Sparkles,
  Flame,
  Wallet,
  CheckCircle2,
  X,
  Edit3,
  Check,
  PlusCircle,
  Cake,
  Pencil,
  User,
  Phone,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { Product, PartyAddon } from '../../types';

interface CartPanelProps {
  onCheckout: (options?: {
    isDeposit?: boolean;
    depositKhr?: number;
    customerName?: string;
    customerPhone?: string;
    pickupDate?: string;
    pickupTime?: string;
    notes?: string;
  }) => void;
  onClose?: () => void;
  isMobileSheet?: boolean;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onCheckout, onClose, isMobileSheet = false }) => {
  const {
    lang,
    cart,
    products,
    partyAddons,
    addPartyAddon,
    updatePartyAddon,
    deletePartyAddon,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartItemPrice,
    addCustomPricedItem,
    clearCart,
    cartTotalUsd,
    cartTotalKhr,
    exchangeRate,
  } = useBakery();
  const text = t[lang];

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [isDepositMode, setIsDepositMode] = useState(false);
  const [depositAmountKhr, setDepositAmountKhr] = useState('');

  // Customer pre-order & schedule details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    return tmr.toISOString().slice(0, 10);
  });
  const [pickupTime, setPickupTime] = useState('15:00');
  const [orderNotes, setOrderNotes] = useState('');

  // Party Add-on Add / Edit state
  const [isAddingNewAddon, setIsAddingNewAddon] = useState(false);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPriceKhr, setNewAddonPriceKhr] = useState('4000');
  const [editingAddon, setEditingAddon] = useState<PartyAddon | null>(null);
  const [editAddonName, setEditAddonName] = useState('');
  const [editAddonPriceKhr, setEditAddonPriceKhr] = useState('');

  // Custom price item form state
  const [showCustomPriceForm, setShowCustomPriceForm] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customCurrency, setCustomCurrency] = useState<'KHR' | 'USD'>('KHR');
  const [customItemQty, setCustomItemQty] = useState(1);
  const [customItemNote, setCustomItemNote] = useState('');

  // Editing existing cart item price
  const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');
  const [editCurrency, setEditCurrency] = useState<'KHR' | 'USD'>('KHR');

  const handleStartEditPrice = (index: number, currentPriceUsd: number) => {
    soundFx.playPop();
    setEditingPriceIndex(index);
    setEditCurrency('KHR');
    setEditPriceInput(Math.round(currentPriceUsd * exchangeRate).toString());
  };

  const handleSaveEditPrice = (index: number) => {
    const rawVal = parseFloat(editPriceInput) || 0;
    const newPriceUsd = editCurrency === 'KHR' ? rawVal / exchangeRate : rawVal;
    updateCartItemPrice(index, Math.max(0, newPriceUsd));
    setEditingPriceIndex(null);
    soundFx.playSuccess();
  };

  const handleAddCustomPriceItem = (e: React.FormEvent) => {
    e.preventDefault();
    const rawPrice = parseFloat(customItemPrice) || 0;
    if (rawPrice <= 0) return;
    const priceUsd = customCurrency === 'KHR' ? rawPrice / exchangeRate : rawPrice;
    const itemName = customItemName.trim() || (lang === 'km' ? 'នំកុម្ម៉ង់ពិសេស' : 'Custom Cake');
    addCustomPricedItem(itemName, priceUsd, customItemQty, customItemNote.trim() || undefined);
    soundFx.playSuccess();
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemQty(1);
    setCustomItemNote('');
    setShowCustomPriceForm(false);
  };

  const partyProducts = products.filter((p) => p.categoryId === 'party').slice(0, 4);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'SWEET10' || promoCode.trim().toUpperCase() === 'BAKERY') {
      setDiscountPercent(10);
      setPromoMessage('បញ្ចុះតម្លៃ 10% បានជោគជ័យ! 🎉');
      soundFx.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } else {
      setDiscountPercent(0);
      setPromoMessage('កូដមិនត្រឹមត្រូវទេ (សាកល្បង: SWEET10)');
    }
  };

  const discountUsd = (cartTotalUsd * discountPercent) / 100;
  const discountKhr = Math.round(discountUsd * exchangeRate);
  const finalTotalUsd = Math.max(0, cartTotalUsd - discountUsd);
  const finalTotalKhr = Math.round(finalTotalUsd * exchangeRate);

  // Deposit calculations
  const defaultDeposit50Pct = Math.round((finalTotalKhr * 0.5) / 1000) * 1000;
  const numDepositKhr = isDepositMode
    ? Math.min(finalTotalKhr, Math.max(0, parseInt(depositAmountKhr, 10) || defaultDeposit50Pct))
    : finalTotalKhr;
  const numDepositUsd = Number((numDepositKhr / exchangeRate).toFixed(2));
  const remainingKhr = Math.max(0, finalTotalKhr - numDepositKhr);
  const remainingUsd = Number((remainingKhr / exchangeRate).toFixed(2));

  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      className={`${
        isMobileSheet
          ? 'w-full h-full max-h-[92vh] bg-white rounded-t-3xl flex flex-col justify-between overflow-hidden shadow-2xl'
          : 'w-96 glass-panel border-l border-rose-100/80 flex flex-col justify-between shrink-0 h-[calc(100vh-65px)] sticky top-[65px] shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-rose-100/60 flex items-center justify-between bg-white/80">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalItemCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-black text-slate-800 text-sm tracking-tight">{text.cart}</h2>
            <p className="text-[11px] text-pink-600 font-bold">
              {totalItemCount > 0 ? `${totalItemCount} មុខទំនិញត្រូវបានជ្រើសរើស` : 'កន្ត្រកទំនេរ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={() => {
                soundFx.playChime();
                clearCart();
              }}
              className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 transition-colors px-2.5 py-1.5 hover:bg-rose-50 rounded-xl cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{text.clearCart}</span>
            </button>
          )}

          {isMobileSheet && onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              title="បិទកន្ត្រក"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Middle Container: Custom Price + Cart Items + Party Add-ons + Promo */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Quick Button: Add Custom-Priced Cake / Item */}
        <div className="px-4 pt-2.5 pb-2 bg-white/90 border-b border-rose-100/50">
          {!showCustomPriceForm ? (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setShowCustomPriceForm(true);
              }}
              className="w-full py-1.5 px-3 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border border-dashed border-pink-300 text-pink-700 hover:text-pink-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-3.5 h-3.5 text-pink-600" />
              <span>+ បញ្ចូលតម្លៃនំដោយផ្ទាល់ (Custom Price)</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddCustomPriceItem}
              className="p-3 bg-pink-50/90 border border-pink-200 rounded-2xl space-y-2 animate-in fade-in zoom-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-pink-900 flex items-center gap-1">
                  <Cake className="w-3.5 h-3.5 text-pink-600" />
                  <span>បញ្ចូលតម្លៃនំ ឬមុខទំនិញផ្ទាល់</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomPriceForm(false)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg hover:bg-white cursor-pointer"
                  title="បិទ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cake / Item Name */}
              <input
                type="text"
                placeholder="ឈ្មោះនំ ឬមុខទំនិញ (ឧ. នំខួបកំណើតកុម្ម៉ង់ពិសេស)"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-pink-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />

              {/* Price Input & Currency */}
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step={customCurrency === 'KHR' ? '500' : '0.1'}
                    placeholder={customCurrency === 'KHR' ? 'តម្លៃជា ៛ (ឧ. 45000)' : 'តម្លៃជា $ (ឧ. 12)'}
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    className="w-full pl-2.5 pr-8 py-1.5 bg-white border border-pink-200 rounded-xl text-xs font-black text-pink-700 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    required
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    {customCurrency === 'KHR' ? '៛' : '$'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setCustomCurrency(customCurrency === 'KHR' ? 'USD' : 'KHR');
                  }}
                  className="px-2.5 py-1.5 bg-white border border-pink-200 text-pink-700 text-xs font-black rounded-xl hover:bg-pink-100 cursor-pointer transition-colors shrink-0"
                >
                  {customCurrency === 'KHR' ? '៛ KHR' : '$ USD'}
                </button>
              </div>

              {/* Quick Price Suggestions */}
              <div className="flex flex-wrap gap-1">
                {[20000, 35000, 50000, 70000, 100000].map((khrVal) => (
                  <button
                    key={khrVal}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      if (customCurrency === 'KHR') {
                        setCustomItemPrice(khrVal.toString());
                      } else {
                        setCustomItemPrice((khrVal / exchangeRate).toFixed(2));
                      }
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-pink-100 text-slate-700 hover:text-pink-800 border border-pink-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    {khrVal.toLocaleString()} ៛
                  </button>
                ))}
              </div>

              {/* Quantity Stepper & Add Button */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex items-center bg-white border border-pink-200 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setCustomItemQty(Math.max(1, customItemQty - 1));
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-pink-700 hover:bg-pink-50 font-bold"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-black text-slate-800">{customItemQty}</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setCustomItemQty(customItemQty + 1);
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-pink-700 hover:bg-pink-50 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1 active:scale-98 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ បញ្ចូលទៅកន្ត្រក</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Cart Items List */}
        <div className="p-3 sm:p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-10 text-center select-none">
              <div className="w-16 h-16 rounded-3xl bg-pink-50/70 border border-pink-100/80 flex items-center justify-center mb-3 text-pink-400">
                <ShoppingBag className="w-8 h-8 animate-bounce" />
              </div>
              <p className="text-sm font-bold text-slate-700">{text.cartEmpty}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[210px] leading-relaxed">
                សូមចុចលើមុខនំ ឬភេសជ្ជៈ ដើម្បីបញ្ចូលទៅកាន់កន្ត្រក និងគិតលុយ
              </p>
            </div>
          ) : (
            cart.map((item, index) => {
              const name = lang === 'km' ? item.product.nameKh : item.product.nameEn;
              const itemPriceKhr = item.product.priceKhr ?? Math.round(item.product.priceUsd * exchangeRate);
              const itemPriceUsd = item.product.priceKhr ? Number((item.product.priceKhr / exchangeRate).toFixed(2)) : item.product.priceUsd;
              const itemTotalKhr = itemPriceKhr * item.quantity;
              const itemTotalUsd = Number((itemTotalKhr / exchangeRate).toFixed(2));

              return (
                <div
                  key={index}
                  className="bg-white/90 rounded-2xl p-3 border border-rose-100/70 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group"
                >
                  <img
                    src={item.product.imageUrl || (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'}
                    alt={name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-rose-100"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-1 group-hover:text-pink-600 transition-colors">
                      {name}
                    </h4>
                    {/* Prioritize KHR ៛ first & Allow inline price editing */}
                    {editingPriceIndex === index ? (
                      <div className="mt-1 p-1.5 bg-pink-50/90 border border-pink-200 rounded-xl space-y-1 animate-in fade-in">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step={editCurrency === 'KHR' ? '500' : '0.1'}
                            value={editPriceInput}
                            onChange={(e) => setEditPriceInput(e.target.value)}
                            autoFocus
                            className="w-full px-2 py-0.5 text-xs font-bold text-slate-800 bg-white border border-pink-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
                            placeholder={editCurrency === 'KHR' ? 'តម្លៃជា ៛' : 'តម្លៃជា $'}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playPop();
                              if (editCurrency === 'KHR') {
                                const usdVal = (parseFloat(editPriceInput) || 0) / exchangeRate;
                                setEditCurrency('USD');
                                setEditPriceInput(usdVal.toFixed(2));
                              } else {
                                const khrVal = Math.round((parseFloat(editPriceInput) || 0) * exchangeRate);
                                setEditCurrency('KHR');
                                setEditPriceInput(khrVal.toString());
                              }
                            }}
                            className="px-1.5 py-0.5 bg-white border border-pink-200 text-pink-700 text-[10px] font-black rounded-lg hover:bg-pink-100 cursor-pointer shrink-0"
                            title="ប្ដូររូបិយប័ណ្ណ"
                          >
                            {editCurrency === 'KHR' ? '៛' : '$'}
                          </button>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingPriceIndex(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-white cursor-pointer"
                            title="បោះបង់"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditPrice(index)}
                            className="px-2 py-0.5 bg-pink-600 hover:bg-pink-700 text-white rounded-md text-[10px] font-bold flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title="រក្សាទុកតម្លៃថ្មី"
                          >
                            <Check className="w-3 h-3" />
                            <span>រក្សាទុក</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-0.5 group/price">
                        <div className="text-[11px] font-black text-pink-600">
                          {itemPriceKhr.toLocaleString()} ៛
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            (${itemPriceUsd.toFixed(2)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartEditPrice(index, item.product.priceUsd)}
                          className="text-slate-400 hover:text-pink-600 p-0.5 rounded hover:bg-pink-50 transition-colors cursor-pointer"
                          title="កែសម្រួលតម្លៃនំនេះ (Edit Price)"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/80">
                        <button
                          onClick={() => {
                            soundFx.playPop();
                            updateCartQuantity(index, item.quantity - 1);
                          }}
                          className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors shadow-2xs active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            soundFx.playPop();
                            updateCartQuantity(index, item.quantity + 1);
                          }}
                          className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-pink-50 hover:text-pink-600 flex items-center justify-center transition-colors shadow-2xs active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-xs text-slate-900">
                          {itemTotalKhr.toLocaleString()} ៛
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ${itemTotalUsd.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playChime();
                      removeFromCart(index);
                    }}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Interactive Party Add-ons */}
        {partyAddons && partyAddons.length > 0 && (
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-amber-50/90 via-rose-50/60 to-pink-50/80 border-t border-amber-200/70 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>ឥវ៉ាន់ទិញបន្ថែមសម្រាប់ពិធី (Party Add-ons)</span>
              </span>
              <div className="flex items-center gap-1.5">
                {cart.filter((item) => item.product.id.startsWith('addon-') || item.product.categoryId === 'party').length > 0 && (
                  <span className="text-[10px] font-black bg-pink-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                    ក្នុងកន្ត្រក {cart.filter((item) => item.product.id.startsWith('addon-') || item.product.categoryId === 'party').reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setIsAddingNewAddon((prev) => !prev);
                    setEditingAddon(null);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                  title="បន្ថែមមុខទំនិញពិធីថ្មី"
                >
                  <Plus className="w-3 h-3 text-amber-600" />
                  <span>+ ថែម</span>
                </button>
              </div>
            </div>

            {/* Inline Add New Party Add-on Form */}
            {isAddingNewAddon && (
              <div className="p-2.5 bg-white rounded-xl border border-amber-300 shadow-sm space-y-2 animate-in fade-in duration-150">
                <div className="text-[11px] font-black text-slate-800 flex items-center justify-between">
                  <span>+ បញ្ចូលមុខទំនិញពិធីបន្ថែមថ្មី</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddon(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="ឈ្មោះទំនិញ (ឧ. 🎈 ប៉េងប៉ោង)"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-medium"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="តម្លៃ (៛ KHR)"
                      value={newAddonPriceKhr}
                      onChange={(e) => setNewAddonPriceKhr(e.target.value)}
                      className="w-full px-2.5 py-1 pr-6 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-bold text-pink-600"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">
                      ៛
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAddon(false);
                      setNewAddonName('');
                    }}
                    className="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAddonName.trim()) return;
                      soundFx.playSuccess();
                      const priceKhr = parseInt(newAddonPriceKhr, 10) || 0;
                      addPartyAddon(newAddonName.trim(), priceKhr);
                      setNewAddonName('');
                      setNewAddonPriceKhr('4000');
                      setIsAddingNewAddon(false);
                    }}
                    className="px-2.5 py-0.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white text-[11px] font-bold rounded-lg shadow-sm active:scale-95 cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>រក្សាទុក</span>
                  </button>
                </div>
              </div>
            )}

            {/* Inline Edit Party Add-on Form */}
            {editingAddon && (
              <div className="p-2.5 bg-white rounded-xl border border-pink-300 shadow-sm space-y-2 animate-in fade-in duration-150">
                <div className="text-[11px] font-black text-slate-800 flex items-center justify-between">
                  <span>✏️ កែប្រែទំនិញ៖ {editingAddon.nameKh}</span>
                  <button
                    type="button"
                    onClick={() => setEditingAddon(null)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="ឈ្មោះទំនិញ"
                    value={editAddonName}
                    onChange={(e) => setEditAddonName(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-medium"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="តម្លៃ (៛ KHR)"
                      value={editAddonPriceKhr}
                      onChange={(e) => setEditAddonPriceKhr(e.target.value)}
                      className="w-full px-2.5 py-1 pr-6 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-bold text-pink-600"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">
                      ៛
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      deletePartyAddon(editingAddon.id);
                      // Also remove from cart if present
                      const addonProductId = `addon-${editingAddon.id}`;
                      const cartIdx = cart.findIndex((i) => i.product.id === addonProductId);
                      if (cartIdx > -1) {
                        removeFromCart(cartIdx);
                      }
                      setEditingAddon(null);
                    }}
                    className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>លុបមុខនេះ</span>
                  </button>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingAddon(null)}
                      className="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editAddonName.trim()) return;
                        soundFx.playSuccess();
                        const priceKhr = parseInt(editAddonPriceKhr, 10) || 0;
                        updatePartyAddon(editingAddon.id, editAddonName.trim(), priceKhr);
                        setEditingAddon(null);
                      }}
                      className="px-2.5 py-0.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white text-[11px] font-bold rounded-lg shadow-sm active:scale-95 cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>រក្សាទុក</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Cards Grid */}
            <div className="grid grid-cols-2 gap-2">
              {partyAddons.map((addon) => {
                const addonProductId = `addon-${addon.id}`;
                const cartIndex = cart.findIndex((item) => item.product.id === addonProductId);
                const cartItem = cartIndex > -1 ? cart[cartIndex] : null;
                const qty = cartItem ? cartItem.quantity : 0;
                const isSelected = qty > 0;
                const addonKhr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);

                const handleCardClick = () => {
                  soundFx.playPop();
                  if (cartIndex > -1) {
                    // Increment existing item in cart
                    updateCartQuantity(cartIndex, qty + 1);
                  } else {
                    // Add as a new item in cart
                    const partyProduct: Product = {
                      id: addonProductId,
                      nameKh: `🎉 ${addon.nameKh}`,
                      nameEn: `🎉 ${addon.nameEn || addon.nameKh}`,
                      categoryId: 'party',
                      priceUsd: addon.priceUsd,
                      priceKhr: addonKhr,
                      costPriceUsd: 0,
                      stockQty: 999,
                      unit: 'pcs',
                      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
                      isCustom: false,
                    };
                    addToCart(partyProduct);
                  }
                };

                const handleDecrement = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  soundFx.playPop();
                  if (cartIndex > -1) {
                    updateCartQuantity(cartIndex, qty - 1);
                  }
                };

                const handleIncrement = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleCardClick();
                };

                return (
                  <div
                    key={addon.id}
                    onClick={handleCardClick}
                    className={`p-2 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between gap-1.5 cursor-pointer relative select-none group ${
                      isSelected
                        ? 'bg-gradient-to-br from-pink-600 to-rose-500 text-white border-pink-700 shadow-md shadow-pink-500/20 ring-2 ring-pink-400/50 scale-[1.02]'
                        : 'bg-white hover:bg-amber-50/90 text-slate-700 border-amber-200/80 shadow-2xs hover:border-amber-400'
                    }`}
                    title={isSelected ? 'ចុចលើម្តងទៀតដើម្បីបូកបន្ថែម (+1) ឬប្រើប៊ូតុង + / -' : 'ចុចដើម្បីទិញថែម (+1)'}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-[11px] leading-tight line-clamp-1">
                        {addon.nameKh}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected ? (
                          <span className="bg-white text-pink-700 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                            x{qty}
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[10px] font-bold group-hover:border-pink-500 group-hover:text-pink-600">
                            +
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playPop();
                            setEditingAddon(addon);
                            setEditAddonName(addon.nameKh);
                            const khr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);
                            setEditAddonPriceKhr(String(khr));
                            setIsAddingNewAddon(false);
                          }}
                          className={`p-1 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'text-white/80 hover:text-white hover:bg-white/20'
                              : 'text-slate-400 hover:text-pink-600 hover:bg-pink-50'
                          }`}
                          title="កែប្រែឈ្មោះ និងតម្លៃ"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-1 pt-0.5">
                      <div className={`text-[10px] ${isSelected ? 'text-pink-100 font-medium' : 'text-slate-500'}`}>
                        <span>+{addonKhr.toLocaleString()} ៛</span>
                        {qty > 1 && (
                          <div className="font-black text-white text-[10px]">
                            = {(addonKhr * qty).toLocaleString()} ៛
                          </div>
                        )}
                      </div>

                      {/* Stepper buttons when selected */}
                      {isSelected && (
                        <div
                          className="flex items-center gap-1 bg-black/20 backdrop-blur-xs p-0.5 rounded-xl shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={handleDecrement}
                            className="w-5 h-5 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                            title="បន្ថយចំនួន (-1)"
                          >
                            <Minus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                          <span className="text-[11px] font-black text-white px-1 min-w-[12px] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={handleIncrement}
                            className="w-5 h-5 rounded-lg bg-white text-pink-600 hover:bg-pink-50 flex items-center justify-center font-black transition-all active:scale-90 shadow-2xs cursor-pointer"
                            title="បូកបន្ថែមចំនួន (+1)"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tip */}
            <div className="flex items-center justify-between text-[10px] text-amber-800/80 bg-white/70 px-2.5 py-1 rounded-xl border border-amber-200/60">
              <span className="flex items-center gap-1 font-medium">
                <span>💡</span>
                <span>ចុចលើកាតម្តងទៀត ឬចុច <strong>[+]</strong> ដើម្បីបូកបន្ថែមចំនួន (x2, x3...)</span>
              </span>
            </div>
          </div>
        )}

        {/* Customer Info & Pickup Schedule Section */}
        {cart.length > 0 && (
          <div className="p-3 sm:p-3.5 bg-gradient-to-br from-rose-50/80 via-pink-50/50 to-amber-50/60 border-t border-rose-100/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                <User className="w-3.5 h-3.5 text-pink-600" />
                <span>ព័ត៌មានអ្នកទិញ & ថ្ងៃមកយក (Customer & Schedule)</span>
              </div>
              {isDepositMode && (
                <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
                  កក់ប្រាក់
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ឈ្មោះអ្នកទិញ (Customer Name)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-rose-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="លេខទូរស័ព្ទ (Phone Number)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-rose-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3 h-3 text-pink-600" />
                  <span>កាលបរិច្ឆេទមកយក (Date)</span>
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-rose-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3 text-pink-600" />
                  <span>ម៉ោងមកយក (Time)</span>
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-rose-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>

            <div className="relative">
              <FileText className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ចំណាំបន្ថែម / សរសេរលើនំ (ឧ. Happy Birthday, ទៀន ៥ដើម...)"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-rose-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Summary & Checkout (KHR ៛ FIRST) */}
      {cart.length > 0 && (
        <div className="shrink-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-rose-200/80 space-y-2.5 shadow-xl">
          {/* Promo code field */}
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="កូដបញ្ចុះតម្លៃ (SWEET10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              អនុវត្ត
            </button>
          </form>

          {promoMessage && (
            <p className={`text-[11px] font-bold ${discountPercent > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {promoMessage}
            </p>
          )}

          {/* Pricing calculations - KHR ៛ FIRST */}
          <div className="space-y-1.5 text-xs text-slate-600 pt-1">
            <div className="flex justify-between font-medium">
              <span>{text.subtotal}:</span>
              <span className="font-bold text-slate-800">
                {cartTotalKhr.toLocaleString()} ៛ (${cartTotalUsd.toFixed(2)})
              </span>
            </div>

            {discountUsd > 0 && (
              <div className="flex justify-between font-bold text-emerald-600">
                <span>{text.discount} ({discountPercent}%):</span>
                <span>-{discountKhr.toLocaleString()} ៛ (-${discountUsd.toFixed(2)})</span>
              </div>
            )}

            {/* Total Payable in KHR ៛ in LARGE font */}
            <div className="border-t border-dashed border-rose-200/80 pt-2 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">{text.totalPayable}:</span>
              <div className="text-right">
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">
                  {finalTotalKhr.toLocaleString()} ៛
                </div>
                <div className="text-xs font-bold text-slate-500">
                  ~ ${finalTotalUsd.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Type Selection: Full vs Deposit */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsDepositMode(false);
              }}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isDepositMode
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ទូទាត់ពេញ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsDepositMode(true);
                if (!depositAmountKhr) {
                  setDepositAmountKhr(defaultDeposit50Pct.toString());
                }
              }}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isDepositMode
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-black'
                  : 'hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>កក់ប្រាក់ (Deposit)</span>
            </button>
          </div>

          {/* If Deposit Mode is selected, show deposit input & shortcuts */}
          {isDepositMode && (
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-black text-amber-900">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-amber-600" />
                  <span>ប្រាក់កក់ត្រូវបង់ (៛ KHR)</span>
                </span>
                <span className="text-rose-600 text-[11px] font-bold">
                  នៅខ្វះ {remainingKhr.toLocaleString()} ៛
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={finalTotalKhr}
                  value={depositAmountKhr || defaultDeposit50Pct}
                  onChange={(e) => setDepositAmountKhr(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-sm font-black text-amber-900 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder={defaultDeposit50Pct.toString()}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  ៛
                </span>
              </div>

              {/* Quick shortcut buttons */}
              <div className="flex gap-1">
                {[30, 50, 70].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      const amt = Math.round((finalTotalKhr * pct) / 100 / 1000) * 1000;
                      setDepositAmountKhr(amt.toString());
                    }}
                    className="flex-1 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-800 transition-colors cursor-pointer"
                  >
                    កក់ {pct}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setDepositAmountKhr(finalTotalKhr.toString());
                  }}
                  className="flex-1 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  ១០០%
                </button>
              </div>
            </div>
          )}

          {/* Glowing Checkout / Deposit Button */}
          {!isDepositMode ? (
            <button
              type="button"
              onClick={() => {
                soundFx.playChime();
                onCheckout({
                  isDeposit: false,
                  depositKhr: finalTotalKhr,
                  customerName: customerName.trim() || undefined,
                  customerPhone: customerPhone.trim() || undefined,
                  pickupDate: pickupDate || undefined,
                  pickupTime: pickupTime || undefined,
                  notes: orderNotes.trim() || undefined,
                });
              }}
              className="w-full py-3.5 bg-pink-600 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-700 hover:via-rose-600 hover:to-pink-700 shimmer-btn animate-pulse-glow text-white font-black rounded-2xl shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2 text-sm transition-all duration-300 active:scale-[0.98] hover:scale-[1.01] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-pink-100 relative z-10 shrink-0" />
              <span className="relative z-10 font-black text-white text-sm tracking-wide drop-shadow-xs">
                {text.checkout} ({finalTotalKhr.toLocaleString()} ៛)
              </span>
              <ArrowRight className="w-4 h-4 ml-1 text-white relative z-10 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundFx.playChime();
                onCheckout({
                  isDeposit: true,
                  depositKhr: numDepositKhr,
                  customerName: customerName.trim() || undefined,
                  customerPhone: customerPhone.trim() || undefined,
                  pickupDate: pickupDate || undefined,
                  pickupTime: pickupTime || undefined,
                  notes: orderNotes.trim() || undefined,
                });
              }}
              className="w-full py-3.5 bg-amber-500 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 shimmer-btn text-white font-black rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 text-sm transition-all duration-300 active:scale-[0.98] hover:scale-[1.01] cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-amber-100 relative z-10 shrink-0" />
              <span className="relative z-10 font-black text-white text-sm tracking-wide drop-shadow-xs">
                កត់ត្រាកក់ប្រាក់ ({numDepositKhr.toLocaleString()} ៛)
              </span>
              <ArrowRight className="w-4 h-4 ml-1 text-white relative z-10 shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
