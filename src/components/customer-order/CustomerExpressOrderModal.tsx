import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Calendar,
  Clock,
  Phone,
  User,
  Check,
  Send,
  PhoneCall,
  QrCode,
  DollarSign,
  Heart,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, CustomCakeOrder } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
import { getProductImageUrl } from '../../utils/imagePath';
import { roundKhr } from '../../utils/currencyUtils';
import { PhoneChooserModal } from '../common/PhoneChooserModal';
import { parsePhoneNumbers, dialPhoneNumber } from '../../utils/phoneUtils';

interface CustomerExpressOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onOrderSuccess?: (order: CustomCakeOrder) => void;
}

const EXPRESS_FLAVORS = [
  { id: 'vanilla', nameKh: 'វ៉ានីឡា', icon: '🍦', label: 'វ៉ានីឡា (Vanilla)' },
  { id: 'chocolate', nameKh: 'សូកូឡា', icon: '🍫', label: 'សូកូឡា (Chocolate)' },
  { id: 'strawberry', nameKh: 'ស្ត្របឺរី', icon: '🍓', label: 'ស្ត្របឺរី (Strawberry)' },
  { id: 'coffee', nameKh: 'កាហ្វេ', icon: '☕', label: 'កាហ្វេ (Coffee)' },
  { id: 'cheesecake', nameKh: 'ឈីសខេក', icon: '🧀', label: 'ឈីសខេក (Cheesecake)' },
  { id: 'matcha', nameKh: 'តែបៃតង', icon: '🍵', label: 'តែបៃតង (Matcha)' },
];

const QUICK_INSCRIPTIONS = [
  '🎂 រីករាយថ្ងៃកំណើត',
  '🎉 Happy Birthday',
  '💖 Happy Anniversary',
  '💐 រីករាយថ្ងៃមង្គលការ',
  '🌟 Congratulations',
];

const POPULAR_BUDGET_KHR = [30000, 40000, 50000, 60000, 80000, 100000, 150000];

export const CustomerExpressOrderModal: React.FC<CustomerExpressOrderModalProps> = ({
  isOpen,
  onClose,
  product,
  onOrderSuccess,
}) => {
  const { storeInfo, exchangeRate, addCustomOrder } = useBakery();

  // Custom Price / Budget Typed by Customer (Defaults to product price or 40,000 KHR)
  const [cakePriceKhrStr, setCakePriceKhrStr] = useState<string>('40000');
  const [selectedFlavor, setSelectedFlavor] = useState(EXPRESS_FLAVORS[0].label);
  const [inscription, setInscription] = useState('');

  // Contact details
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  // Date & Time
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [pickupTime, setPickupTime] = useState('14:00');

  // Payment method
  const [payMethod, setPayMethod] = useState<'PICKUP' | 'KHQR'>('PICKUP');

  // Submitting state & confirmed order
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CustomCakeOrder | null>(null);
  const [isCopiedOrderNum, setIsCopiedOrderNum] = useState(false);
  const [isPhoneChooserOpen, setIsPhoneChooserOpen] = useState(false);

  // Sync initial price when product changes
  useEffect(() => {
    if (product) {
      const initialKhr =
        product.priceKhr && product.priceKhr > 0
          ? product.priceKhr
          : product.priceUsd > 0
          ? Math.round(product.priceUsd * exchangeRate)
          : 40000;
      setCakePriceKhrStr(initialKhr.toString());
      setCompletedOrder(null);
    }
  }, [product?.id, product?.priceKhr, product?.priceUsd, exchangeRate]);

  // Clean numerical price in KHR & USD
  const cakePriceKhr = useMemo(() => {
    const cleaned = cakePriceKhrStr.replace(/[^0-9]/g, '');
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  }, [cakePriceKhrStr]);

  const cakePriceUsd = useMemo(() => {
    return Number((cakePriceKhr / exchangeRate).toFixed(2));
  }, [cakePriceKhr, exchangeRate]);

  // Dynamic estimated size hint based on the customer's typed budget
  const estimatedSizeText = useMemo(() => {
    if (cakePriceKhr <= 0) return 'កំណត់តាមការចរចាជាក់ស្តែង';
    if (cakePriceKhr <= 25000) return '1.5 ទឹក (~15cm) សម្រាប់ 2-4 នាក់';
    if (cakePriceKhr <= 35000) return '1.5 - 2 ទឹក (~18cm) សម្រាប់ 4-6 នាក់';
    if (cakePriceKhr <= 55000) return '2 ទឹក (~20cm) សម្រាប់ 6-8 នាក់ (ពេញនិយម ⭐)';
    if (cakePriceKhr <= 75000) return '2.5 ទឹក (~25cm) សម្រាប់ 10-14 នាក់';
    if (cakePriceKhr <= 110000) return '3 ទឹក (~30cm) សម្រាប់ 15-20 នាក់';
    return 'នំ ២ ជាន់ ឬទំហំធំពិសេស សម្រាប់ 20+ នាក់';
  }, [cakePriceKhr]);

  // Quick Date Selectors
  const setToday = () => {
    soundFx.playPop();
    const d = new Date();
    setPickupDate(d.toISOString().slice(0, 10));
  };

  const setTomorrow = () => {
    soundFx.playPop();
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setPickupDate(d.toISOString().slice(0, 10));
  };

  // Submit Order directly into Bakery POS System
  const handleConfirmOrder = () => {
    if (!product) return;
    if (cakePriceKhr <= 0) {
      soundFx.playPop();
      alert('សូមវាយបញ្ចូលតម្លៃ ឬថវិកានំដែលលោកអ្នកចង់បាន!');
      return;
    }

    if (!phone.trim()) {
      soundFx.playPop();
      alert('សូមបញ្ចូលលេខទូរស័ព្ទរបស់លោកអ្នកដើម្បីឱ្យហាងទាក់ទងបញ្ជាក់ការកុម្ម៉ង់!');
      return;
    }

    soundFx.playPop();
    setIsSubmitting(true);

    try {
      const depositKhr = payMethod === 'KHQR' ? Math.round(cakePriceKhr * 0.5) : 0;
      const depositUsd = Number((depositKhr / exchangeRate).toFixed(2));

      const newOrderData: Omit<CustomCakeOrder, 'id' | 'orderNumber' | 'createdAt'> = {
        orderType: 'CAKE',
        customerName: name.trim() || 'អតិថិជនកុម្ម៉ង់រហ័ស',
        phone: phone.trim(),
        pickupDate: pickupDate,
        pickupTime: pickupTime,
        cakeName: product.nameKh || 'នំខួបកំណើត',
        size: estimatedSizeText.split(' សម្រាប់')[0] || '2 ទឹក (~20cm)',
        flavor: selectedFlavor,
        inscription: inscription.trim() || 'មិនមានអក្សរលើនំ',
        themeNotes: `កុម្ម៉ង់រហ័ស (Express Order) | តម្លៃភ្ញៀវកំណត់៖ ${cakePriceKhr.toLocaleString()} ៛ | ការទូទាត់៖ ${payMethod === 'PICKUP' ? 'បង់ពេលមកយកនំ' : 'កក់តាម KHQR 50%'}`,
        referenceImage: product.imageUrl || (product.images && product.images[0]) || '',
        status: 'PENDING',
        totalUsd: cakePriceUsd,
        totalKhr: cakePriceKhr,
        depositUsd: depositUsd,
        depositKhr: depositKhr,
        paymentMethod: payMethod === 'KHQR' ? 'KHQR_BAKONG' : 'CASH_KHR',
        orderSource: 'CUSTOMER_ONLINE',
      };

      const created = addCustomOrder(newOrderData);
      setCompletedOrder(created);
      soundFx.playSuccess();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });

      if (onOrderSuccess) {
        onOrderSuccess(created);
      }
    } catch (err) {
      console.error('Failed to create express order:', err);
      alert('មានបញ្ហាក្នុងការរក្សាទុកការកុម្ម៉ង់ សូមសាកល្បងម្ដងទៀត!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Order via Telegram
  const handleOrderViaTelegram = () => {
    if (!product) return;
    soundFx.playPop();
    const storeTelegram = (storeInfo.telegramUsername || '').replace(/^@/, '') || 'sweetbakery_admin';

    const orderSummaryText = `🎂 សួស្តី Sweet Bakery! ខ្ញុំចង់កុម្ម៉ង់នំរហ័ស (Express Order)៖
• នំ៖ ${product.nameKh}
• តម្លៃដែលចង់បាន៖ ${cakePriceKhr.toLocaleString()} ៛ (~$${cakePriceUsd})
• ទំហំប្រហែល៖ ${estimatedSizeText}
• រសជាតិ៖ ${selectedFlavor}
• អក្សរលើនំ៖ ${inscription.trim() || 'មិនមាន'}
• ថ្ងៃយកនំ៖ ${pickupDate} វេលាម៉ោង ${pickupTime}
• វិធីទូទាត់៖ ${payMethod === 'PICKUP' ? 'បង់ប្រាក់ពេលមកយកនំ' : 'កក់តាម KHQR'}
• លេខទូរស័ព្ទភ្ញៀវ៖ ${phone.trim() || '(សូមទាក់ទងមក Telegram នេះ)'}
${name.trim() ? `• ឈ្មោះភ្ញៀវ៖ ${name.trim()}` : ''}

សូមជួយពិនិត្យ និងបញ្ជាក់ការកុម្ម៉ង់ជូនខ្ញុំផង អរគុណច្រើន! 🙏`;

    const encodedText = encodeURIComponent(orderSummaryText);
    const telegramUrl = `https://t.me/${storeTelegram}?text=${encodedText}`;
    window.open(telegramUrl, '_blank');
  };

  // 1-Click Phone Call
  const handleCallBakery = () => {
    soundFx.playPop();
    const list = parsePhoneNumbers(storeInfo.phone);
    if (list.length === 1) {
      dialPhoneNumber(list[0].digits);
    } else {
      setIsPhoneChooserOpen(true);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border border-rose-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-200" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                ⚡ កុម្ម៉ង់នំរហ័ស (Express Cake Order)
              </h3>
              <p className="text-[10px] text-pink-100">
                វាយបញ្ចូលតម្លៃតាមចិត្ត ជ្រើសរើសរសជាតិ និងបញ្ជាក់ការកុម្ម៉ង់ក្នុងរយៈពេល ៣០ វិនាទី
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* If order completed, show success screen */}
          {completedOrder ? (
            <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                  អបអរសាទរ! កុម្ម៉ង់ជោគជ័យ
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  ហាងបានទទួលការកុម្ម៉ង់របស់លោកអ្នកហើយ 🎉
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  បុគ្គលិកហាងនឹងរៀបចំដុតនំយ៉ាងសម្រិតសម្រាំង និងទាក់ទងមកកាន់លេខ <span className="font-black text-slate-900">{completedOrder.phone}</span>
                </p>
              </div>

              {/* Order Ticket Card */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">លេខកូដកុម្ម៉ង់៖</span>
                  <div className="flex items-center gap-1.5 font-mono font-black text-rose-600 text-sm">
                    <span>{completedOrder.orderNumber}</span>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        navigator.clipboard.writeText(completedOrder.orderNumber);
                        setIsCopiedOrderNum(true);
                        setTimeout(() => setIsCopiedOrderNum(false), 2000);
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                      title="ចម្លងលេខកូដ"
                    >
                      {isCopiedOrderNum ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">មុខនំ៖</span>
                  <span className="font-bold text-slate-800">{completedOrder.cakeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">តម្លៃកុម្ម៉ង់៖</span>
                  <span className="font-black text-rose-600">{(completedOrder.totalKhr || 0).toLocaleString()} ៛</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ទំហំប្រហែល៖</span>
                  <span className="font-bold text-slate-800">{completedOrder.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">រសជាតិ៖</span>
                  <span className="font-bold text-slate-800">{completedOrder.flavor}</span>
                </div>
                {completedOrder.inscription && completedOrder.inscription !== 'មិនមានអក្សរលើនំ' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">អក្សរលើនំ៖</span>
                    <span className="font-bold text-pink-600">"{completedOrder.inscription}"</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">ថ្ងៃ & ម៉ោងយក៖</span>
                  <span className="font-bold text-slate-800">{completedOrder.pickupDate} វេលាម៉ោង {completedOrder.pickupTime}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleOrderViaTelegram}
                  className="w-full sm:w-1/2 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>ផ្ញើជូនដំណឹងតាម Telegram</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    onClose();
                  }}
                  className="w-full sm:w-1/2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs active:scale-95 transition-all"
                >
                  រួចរាល់
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Product Mini Overview */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50/80 to-amber-50/80 rounded-2xl border border-rose-100">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-rose-200 bg-white shadow-2xs">
                  <img
                    src={getProductImageUrl(product.imageUrl || (product.images && product.images[0]) || '')}
                    alt={product.nameKh}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 text-sm truncate">
                    {product.nameKh}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {product.nameEn || 'Fresh Bakery Custom Cake'}
                  </p>
                  <div className="text-xs font-black text-rose-600 mt-0.5">
                    {cakePriceKhr > 0 ? `${cakePriceKhr.toLocaleString()} ៛` : '០ ៛'}{' '}
                    <span className="text-[10px] text-slate-400 font-semibold">(${cakePriceUsd.toFixed(2)})</span>
                  </div>
                </div>
              </div>

              {/* 1. Custom Price / Budget Typed by Customer */}
              <div className="space-y-2.5 p-3.5 bg-gradient-to-br from-amber-50/70 via-rose-50/40 to-pink-50/60 rounded-2xl border border-amber-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-[10px] font-black">
                      ៛
                    </span>
                    <span>១. វាយបញ្ចូលតម្លៃនំតាមចិត្តចង់បាន (Cake Price / Budget) *</span>
                  </label>
                  <span className="text-[11px] font-black text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                    ${cakePriceUsd.toFixed(2)}
                  </span>
                </div>

                {/* Large Number Input for Price in KHR */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cakePriceKhrStr}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setCakePriceKhrStr(val);
                    }}
                    placeholder="ឧ. 40000"
                    className="w-full pl-3.5 pr-14 py-2.5 bg-white border-2 border-rose-200 focus:border-rose-500 rounded-xl text-base sm:text-lg font-black text-rose-600 focus:outline-none shadow-xs font-num"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    រៀល ៛
                  </span>
                </div>

                {/* Quick Budget Suggestion Chips */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500">
                    ឬចុចរើសតម្លៃរហ័ស (Popular Budgets)៖
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_BUDGET_KHR.map((khrVal) => {
                      const isCurrent = cakePriceKhr === khrVal;
                      return (
                        <button
                          key={khrVal}
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setCakePriceKhrStr(khrVal.toString());
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
                            isCurrent
                              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                              : 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200 shadow-2xs'
                          }`}
                        >
                          {khrVal.toLocaleString()} ៛
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Size Hint based on typed budget */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-rose-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>ទំហំនំប្រហែល៖ </span>
                  <span className="font-black text-rose-700">{estimatedSizeText}</span>
                </div>
              </div>

              {/* 2. Flavor Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>២. ជ្រើសរើសរសជាតិ (Flavor):</span>
                  <span className="text-[11px] text-pink-600 font-bold">{selectedFlavor}</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5">
                  {EXPRESS_FLAVORS.map((fl) => {
                    const isSelected = selectedFlavor === fl.label;
                    return (
                      <button
                        key={fl.id}
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setSelectedFlavor(fl.label);
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-sm'
                            : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="text-sm">{fl.icon}</span>
                        <span className="truncate">{fl.nameKh}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Inscription & Birthday Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>៣. សរសេរអក្សរជូនពរលើនំ (Inscription):</span>
                  <span className="text-[10px] text-slate-400">ស្រេចចិត្ត (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="ឧ. Happy Birthday Dara, រីករាយថ្ងៃកំណើតកូនសំឡាញ់..."
                  value={inscription}
                  onChange={(e) => setInscription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-rose-500 font-medium transition-all"
                />
                {/* Quick Auto-fill Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {QUICK_INSCRIPTIONS.map((msg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setInscription(msg);
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-medium transition-colors cursor-pointer"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Contact & Pickup Date */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-500" />
                  <span>៤. ព័ត៌មានទំនាក់ទំនង & ថ្ងៃទទួលនំ *</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      លេខទូរស័ព្ទរបស់លោកអ្នក (Phone) *
                    </label>
                    <input
                      type="tel"
                      placeholder="012 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      ឈ្មោះរបស់លោកអ្នក (Name)
                    </label>
                    <input
                      type="text"
                      placeholder="ឧ. សុខា"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Pickup Date & Time */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-slate-500">ថ្ងៃយកនំ</label>
                      <div className="flex gap-1 text-[9px]">
                        <button type="button" onClick={setToday} className="text-rose-600 hover:underline">ថ្ងៃនេះ</button>
                        <span>•</span>
                        <button type="button" onClick={setTomorrow} className="text-rose-600 hover:underline">ថ្ងៃស្អែក</button>
                      </div>
                    </div>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ម៉ោងយកនំ</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Fast Payment Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800">
                  ៥. វិធីទូទាត់ប្រាក់ (Payment Method):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setPayMethod('PICKUP');
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all active:scale-95 ${
                      payMethod === 'PICKUP'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 font-black shadow-xs ring-1 ring-rose-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black">💵 បង់ពេលមកយកនំ</div>
                    <div className="text-[10px] text-slate-500">មិនបាច់បង់មុនទេ មកបង់នៅហាង</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setPayMethod('KHQR');
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all active:scale-95 ${
                      payMethod === 'KHQR'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 font-black shadow-xs ring-1 ring-rose-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black">📲 កក់ 50% តាម KHQR</div>
                    <div className="text-[10px] text-slate-500">ស្កេនបាគង ឬធនាគារនានា</div>
                  </button>
                </div>
              </div>

              {/* Fast Action Buttons */}
              <div className="pt-2 space-y-2">
                {/* Button 1: Instant Submit to POS */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmOrder}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isSubmitting ? 'កំពុងបញ្ជូន...' : `✨ បញ្ជាក់ការកុម្ម៉ង់ឥឡូវនេះ (${cakePriceKhr > 0 ? `${cakePriceKhr.toLocaleString()} ៛` : '០ ៛'})`}</span>
                </button>

                {/* Button 2 & 3: Telegram & Call */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOrderViaTelegram}
                    className="py-2.5 px-3 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ផ្ញើតាម Telegram</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCallBakery}
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>ខលកុម្ម៉ង់ផ្ទាល់</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Phone Chooser Modal */}
      <PhoneChooserModal
        isOpen={isPhoneChooserOpen}
        onClose={() => setIsPhoneChooserOpen(false)}
        phoneString={storeInfo.phone}
        storeName={storeInfo.nameKh || 'Sweet Bakery'}
      />
    </div>
  );
};
