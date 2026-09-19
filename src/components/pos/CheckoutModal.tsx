import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  QrCode,
  Banknote,
  CheckCircle,
  Calculator,
  Sparkles,
  Maximize2,
  Wallet,
  Calendar,
  Phone,
  User,
  Clock,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { CompletedSale } from '../../types';
import { soundFx } from '../../utils/audio';
import { KhqrStandeeModal } from './KhqrStandeeModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sale: CompletedSale) => void;
  initialIsDeposit?: boolean;
  initialDepositKhr?: number;
  initialCustomerName?: string;
  initialCustomerPhone?: string;
  initialPickupDate?: string;
  initialPickupTime?: string;
  initialNotes?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialIsDeposit = false,
  initialDepositKhr,
  initialCustomerName,
  initialCustomerPhone,
  initialPickupDate,
  initialPickupTime,
  initialNotes,
}) => {
  const {
    lang,
    exchangeRate,
    cart,
    cartTotalUsd,
    cartTotalKhr,
    completeSale,
    addCustomOrder,
    currentShift,
    storeInfo,
  } = useBakery();
  const text = t[lang];

  const defaultDeposit50Pct = Math.round((cartTotalKhr * 0.5) / 1000) * 1000;

  // Deposit mode toggle
  const [isDeposit, setIsDeposit] = useState(initialIsDeposit);
  const [depositAmountKhr, setDepositAmountKhr] = useState(
    initialDepositKhr?.toString() || defaultDeposit50Pct.toString()
  );

  // Customer pre-order details
  const [customerName, setCustomerName] = useState(initialCustomerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone || '');
  const [pickupDate, setPickupDate] = useState(() => {
    if (initialPickupDate) return initialPickupDate;
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    return tmr.toISOString().slice(0, 10);
  });
  const [pickupTime, setPickupTime] = useState(initialPickupTime || '15:00');
  const [orderNotes, setOrderNotes] = useState(initialNotes || '');

  // Payment method: CASH_KHR, CASH_USD, or KHQR_BAKONG
  const [paymentMethod, setPaymentMethod] = useState<'CASH_KHR' | 'CASH_USD' | 'KHQR_BAKONG'>('CASH_KHR');
  const [receivedKhr, setReceivedKhr] = useState<string>('');
  const [receivedUsd, setReceivedUsd] = useState<string>('');
  const [isStandeeOpen, setIsStandeeOpen] = useState(false);

  // Sync state when opened or props change
  useEffect(() => {
    if (isOpen) {
      const activeDeposit = initialIsDeposit ?? false;
      setIsDeposit(activeDeposit);
      const depKhr = initialDepositKhr || defaultDeposit50Pct;
      setDepositAmountKhr(depKhr.toString());

      if (initialCustomerName !== undefined) setCustomerName(initialCustomerName);
      if (initialCustomerPhone !== undefined) setCustomerPhone(initialCustomerPhone);
      if (initialPickupDate !== undefined) setPickupDate(initialPickupDate);
      if (initialPickupTime !== undefined) setPickupTime(initialPickupTime);
      if (initialNotes !== undefined) setOrderNotes(initialNotes);

      const dueNow = activeDeposit ? depKhr : cartTotalKhr;
      setReceivedKhr(dueNow.toString());
      setReceivedUsd(Number((dueNow / exchangeRate).toFixed(2)).toString());
    }
  }, [
    isOpen,
    initialIsDeposit,
    initialDepositKhr,
    initialCustomerName,
    initialCustomerPhone,
    initialPickupDate,
    initialPickupTime,
    initialNotes,
    cartTotalKhr,
    defaultDeposit50Pct,
    exchangeRate,
  ]);

  if (!isOpen) return null;

  // Deposit & Due calculations
  const numDepositKhr = isDeposit
    ? Math.min(cartTotalKhr, Math.max(0, parseInt(depositAmountKhr, 10) || 0))
    : cartTotalKhr;
  const numDepositUsd = Number((numDepositKhr / exchangeRate).toFixed(2));
  const remainingKhr = Math.max(0, cartTotalKhr - numDepositKhr);
  const remainingUsd = Number((remainingKhr / exchangeRate).toFixed(2));

  // The actual money being paid in THIS checkout step
  const dueNowKhr = isDeposit ? numDepositKhr : cartTotalKhr;
  const dueNowUsd = isDeposit ? numDepositUsd : cartTotalUsd;

  const numReceivedUsd = parseFloat(receivedUsd) || 0;
  const numReceivedKhr = parseFloat(receivedKhr) || 0;

  let changeUsd = 0;
  let changeKhr = 0;

  if (paymentMethod === 'CASH_KHR') {
    const paidInUsd = numReceivedKhr / exchangeRate;
    changeUsd = Math.max(0, paidInUsd - dueNowUsd);
    changeKhr = Math.max(0, numReceivedKhr - dueNowKhr);
  } else if (paymentMethod === 'CASH_USD') {
    changeUsd = Math.max(0, numReceivedUsd - dueNowUsd);
    changeKhr = Math.round(changeUsd * exchangeRate);
  }

  const handleToggleDeposit = (depositActive: boolean) => {
    soundFx.playPop();
    setIsDeposit(depositActive);
    const depKhr = parseInt(depositAmountKhr, 10) || defaultDeposit50Pct;
    const due = depositActive ? depKhr : cartTotalKhr;
    setReceivedKhr(due.toString());
    setReceivedUsd(Number((due / exchangeRate).toFixed(2)).toString());
  };

  const handleDepositAmountChange = (newVal: string) => {
    setDepositAmountKhr(newVal);
    const dep = Math.min(cartTotalKhr, Math.max(0, parseInt(newVal, 10) || 0));
    setReceivedKhr(dep.toString());
    setReceivedUsd(Number((dep / exchangeRate).toFixed(2)).toString());
  };

  const handleConfirm = () => {
    soundFx.playSuccess();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F43F5E', '#FB7185', '#F59E0B', '#10B981', '#6366F1'],
    });

    const saleItems = cart.map((item) => {
      const itemKhr = item.product.priceKhr ?? Math.round(item.product.priceUsd * exchangeRate);
      const itemUsd = Number((itemKhr / exchangeRate).toFixed(2));
      return {
        productId: item.product.id,
        nameKh: item.product.nameKh,
        nameEn: item.product.nameEn,
        quantity: item.quantity,
        priceUsd: itemUsd,
        priceKhr: itemKhr,
        image: item.product.imageUrl || (item.product.images && item.product.images[0]) || '',
      };
    });

    const newSale = completeSale({
      items: saleItems,
      subtotalUsd: cartTotalUsd,
      discountUsd: 0,
      totalUsd: cartTotalUsd,
      totalKhr: cartTotalKhr,
      paymentMethod,
      paidKhr: paymentMethod === 'CASH_KHR' ? numReceivedKhr : undefined,
      paidUsd: paymentMethod === 'CASH_USD' ? numReceivedUsd : undefined,
      changeKhr,
      changeUsd,
      cashierName: currentShift?.cashierName || 'បេឡាធិការ (Cashier)',
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      isDeposit,
      depositKhr: isDeposit ? numDepositKhr : undefined,
      depositUsd: isDeposit ? numDepositUsd : undefined,
      remainingKhr: isDeposit ? remainingKhr : undefined,
      remainingUsd: isDeposit ? remainingUsd : undefined,
      pickupDate: isDeposit ? pickupDate : undefined,
      pickupTime: isDeposit ? pickupTime : undefined,
      notes: orderNotes.trim() || undefined,
    });

    // If it is a deposit pre-order, also register it in CustomCakeOrder pipeline for kitchen tracking
    if (isDeposit) {
      const firstItemWithImage = cart.find(
        (i) => i.product.imageUrl || (i.product.images && i.product.images.length > 0)
      );
      const refImg =
        firstItemWithImage?.product.imageUrl ||
        (firstItemWithImage?.product.images && firstItemWithImage.product.images[0]) ||
        '';

      addCustomOrder({
        customerName: customerName.trim() || 'ភ្ញៀវកុម្ម៉ង់កក់ប្រាក់ (Deposit Pre-order)',
        phone: customerPhone.trim() || '012 000 000',
        cakeName: cart.map((i) => `${i.product.nameKh} (x${i.quantity})`).join(', '),
        size: `${cart.reduce((s, i) => s + i.quantity, 0)} មុខ`,
        flavor: 'កុម្ម៉ង់ពីកន្ត្រកទំនិញ POS (Cart Items)',
        inscription: orderNotes.trim() || '',
        themeNotes: `វិក្កយបត្រ #${newSale.orderNumber}`,
        referenceImage: refImg,
        pickupDate: pickupDate,
        pickupTime: pickupTime,
        totalUsd: cartTotalUsd,
        totalKhr: cartTotalKhr,
        depositUsd: numDepositUsd,
        depositKhr: numDepositKhr,
        paymentMethod: paymentMethod,
        status: 'PENDING',
      });
    }

    onSuccess(newSale);
    onClose();
  };

  // Quick cash buttons (for dueNow amount)
  const quickKhrAmounts = [dueNowKhr, 20000, 50000, 100000, 200000].filter(
    (amt, idx, arr) => amt >= dueNowKhr && arr.indexOf(amt) === idx
  );
  const quickUsdAmounts = [dueNowUsd, 5, 10, 20, 50, 100].filter(
    (amt, idx, arr) => amt >= dueNowUsd && arr.indexOf(amt) === idx
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-rose-50/60 to-pink-50/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                {isDeposit ? 'កត់ត្រាកក់ប្រាក់ទំនិញ (Deposit)' : text.paymentModalTitle}
              </h3>
              <p className="text-xs text-slate-500">គិតជាលុយខ្មែរ (៛) មុន & គណនាប្រាក់អាប់</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full vs Deposit Mode Tabs */}
        <div className="px-6 pt-3 bg-slate-50/60 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => handleToggleDeposit(false)}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isDeposit
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>ទូទាត់ពេញ ({cartTotalKhr.toLocaleString()} ៛)</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleDeposit(true)}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isDeposit
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>កក់ប្រាក់ (Deposit)</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Total Payable Box */}
          {!isDeposit ? (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700 text-white shadow-lg shadow-pink-500/25 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-15">
                <Sparkles className="w-20 h-20" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-pink-100">
                {text.totalPayable} (គិតជាលុយរៀល)
              </span>
              <div className="text-3xl font-black mt-0.5 tracking-tight">
                {cartTotalKhr.toLocaleString()} ៛
              </div>
              <div className="text-xs font-bold text-pink-100/90 mt-1">
                ~ ${cartTotalUsd.toFixed(2)} USD (អត្រា 1$ = {exchangeRate.toLocaleString()} ៛)
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Deposit Overview Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-15">
                  <Wallet className="w-20 h-20" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-100">
                  ប្រាក់កក់ត្រូវទូទាត់ឥឡូវនេះ (Deposit Due Now)
                </span>
                <div className="text-3xl font-black mt-0.5 tracking-tight">
                  {numDepositKhr.toLocaleString()} ៛
                </div>
                <div className="text-xs font-bold text-amber-100/90 mt-1 flex items-center justify-center gap-3">
                  <span>សរុប៖ {cartTotalKhr.toLocaleString()} ៛</span>
                  <span>•</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full font-black">
                    នៅខ្វះ៖ {remainingKhr.toLocaleString()} ៛ (~${remainingUsd.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Deposit input and quick shortcuts */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <label>ចំនួនប្រាក់កក់ (៛ KHR) *</label>
                  <span className="text-rose-600 text-[11px] font-bold">
                    នៅខ្វះ {remainingKhr.toLocaleString()} ៛
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max={cartTotalKhr}
                    value={depositAmountKhr}
                    onChange={(e) => handleDepositAmountChange(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 text-base font-black text-amber-900 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    ៛
                  </span>
                </div>

                {/* Percentage & Cash Increment Buttons */}
                <div className="flex flex-wrap gap-1">
                  {[30, 50, 70].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        const amt = Math.round((cartTotalKhr * pct) / 100 / 1000) * 1000;
                        handleDepositAmountChange(amt.toString());
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-800 transition-colors cursor-pointer"
                    >
                      កក់ {pct}%
                    </button>
                  ))}
                  {[10000, 20000, 50000].map((add) => (
                    <button
                      key={add}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        const cur = parseInt(depositAmountKhr, 10) || 0;
                        const capped = Math.min(cartTotalKhr, cur + add);
                        handleDepositAmountChange(capped.toString());
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-800 transition-colors cursor-pointer"
                    >
                      + {add.toLocaleString()} ៛
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Customer Info & Pickup Schedule Fields (Always Available) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-pink-600" />
                <span>ព័ត៌មានអ្នកទិញ & កាលវិភាគមកយក (Customer & Schedule)</span>
              </div>
              {!isDeposit && (
                <span className="text-[10px] text-slate-400 font-normal">(ស្រេចចិត្ត / Optional)</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="ឈ្មោះអ្នកទិញ (Customer Name)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold"
              />
              <input
                type="tel"
                placeholder="លេខទូរស័ព្ទ (Phone Number)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  កាលបរិច្ឆេទមកយក (Pickup Date)
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  ម៉ោងមកយក (Pickup Time)
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold"
                />
              </div>
            </div>

            <input
              type="text"
              placeholder="ចំណាំបន្ថែម / សរសេរលើនំ (ឧ. Happy Birthday, ទៀន ៥ដើម...)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
              {isDeposit ? 'វិធីសាស្ត្រទូទាត់ប្រាក់កក់' : 'វិធីសាស្ត្រទូទាត់ប្រាក់'}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setPaymentMethod('CASH_KHR');
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'CASH_KHR'
                    ? 'border-pink-500 bg-pink-50/80 text-pink-700 font-black shadow-xs scale-102'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">សាច់ប្រាក់ (៛)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setPaymentMethod('KHQR_BAKONG');
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'KHQR_BAKONG'
                    ? 'border-pink-500 bg-pink-50/80 text-pink-700 font-black shadow-xs scale-102'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs">KHQR Bakong</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setPaymentMethod('CASH_USD');
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'CASH_USD'
                    ? 'border-pink-500 bg-pink-50/80 text-pink-700 font-black shadow-xs scale-102'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span className="text-xs">សាច់ប្រាក់ ($)</span>
              </button>
            </div>
          </div>

          {/* Cash KHR Input */}
          {paymentMethod === 'CASH_KHR' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {text.receivedAmount} (គិតជាលុយរៀល ៛)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="100"
                    value={receivedKhr}
                    onChange={(e) => setReceivedKhr(e.target.value)}
                    className="w-full pl-4 pr-9 py-2.5 text-lg font-black border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                    ៛
                  </span>
                </div>
              </div>

              {/* Quick KHR buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickKhrAmounts.slice(0, 5).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setReceivedKhr(amt.toString());
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer"
                  >
                    {amt.toLocaleString()} ៛
                  </button>
                ))}
              </div>

              {/* Change Box */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-2xs">
                <span className="text-xs font-bold text-emerald-800">{text.changeDue}:</span>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-700">
                    {changeKhr.toLocaleString()} ៛
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600">
                    ~ ${changeUsd.toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cash USD Input */}
          {paymentMethod === 'CASH_USD' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {text.receivedAmount} (USD $)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={receivedUsd}
                    onChange={(e) => setReceivedUsd(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-lg font-black border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Quick USD buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickUsdAmounts.slice(0, 5).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setReceivedUsd(amt.toFixed(2));
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer"
                  >
                    ${amt.toFixed(2)}
                  </button>
                ))}
              </div>

              {/* Change Box */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-2xs">
                <span className="text-xs font-bold text-emerald-800">{text.changeDue}:</span>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-700">
                    {changeKhr.toLocaleString()} ៛
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600">
                    ~ ${changeUsd.toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KHQR Bakong */}
          {paymentMethod === 'KHQR_BAKONG' && (
            <div className="p-5 bg-gradient-to-b from-slate-50 to-pink-50/20 border border-rose-100 rounded-3xl text-center space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="bg-[#D32F2F] text-white font-black text-xs px-2.5 py-0.5 rounded-lg shadow-sm">
                    KHQR
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {isDeposit ? 'ស្កេនទូទាត់ប្រាក់កក់' : 'Bakong / ABA PayWay'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setIsStandeeOpen(true);
                  }}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>ពង្រីក Standee ធំ</span>
                </button>
              </div>

              {/* QR Display */}
              <div className="relative w-48 h-48 mx-auto bg-white p-2.5 rounded-3xl border-2 border-dashed border-red-300/80 shadow-md flex flex-col items-center justify-center overflow-hidden">
                <img
                  src={
                    storeInfo.khqrQrImage ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=bakong://pay?merchant=${encodeURIComponent(
                      storeInfo.khqrMerchantName || 'SWEET_BAKERY'
                    )}&account=${encodeURIComponent(
                      storeInfo.khqrBakongId || 'sweet_bakery@aba'
                    )}&amount=${dueNowKhr}&currency=KHR`
                  }
                  alt="KHQR Code"
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-lg shadow-red-500/80 animate-scanline" />
              </div>

              {/* Merchant Info */}
              <div className="space-y-0.5">
                <div className="font-black text-slate-800 text-sm">
                  {dueNowKhr.toLocaleString()} ៛ (${dueNowUsd.toFixed(2)})
                </div>
                <div className="text-xs font-bold text-slate-700">
                  {storeInfo.khqrMerchantName || storeInfo.nameEn || 'SWEET BAKERY & CAFE'}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {storeInfo.khqrBakongId || 'sweet_bakery@aba'} {storeInfo.khqrAccountNumber ? `• ${storeInfo.khqrAccountNumber}` : ''}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                ស្កេនជាមួយគ្រប់កម្មវិធីធនាគារក្នុងស្រុក (ABA, ACLEDA, Wing, Canadia...)
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-rose-100/70 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {text.close}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-6 py-2.5 text-white text-xs font-black rounded-2xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
              isDeposit
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
                : 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 shadow-pink-600/25'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {isDeposit
                ? `បញ្ជាក់ការកក់ប្រាក់ (${dueNowKhr.toLocaleString()} ៛)`
                : `${text.confirmPayment} (${cartTotalKhr.toLocaleString()} ៛)`}
            </span>
          </button>
        </div>
      </div>

      {/* Standee Modal for Checkout */}
      <KhqrStandeeModal
        isOpen={isStandeeOpen}
        onClose={() => setIsStandeeOpen(false)}
        customAmountKhr={dueNowKhr}
        customAmountUsd={dueNowUsd}
      />
    </div>
  );
};
