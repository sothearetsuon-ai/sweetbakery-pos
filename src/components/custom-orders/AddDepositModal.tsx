import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  DollarSign,
  QrCode,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Cake,
  Phone,
  User,
  CreditCard,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomCakeOrder } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
import { KhqrStandeeModal } from '../pos/KhqrStandeeModal';

interface AddDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomCakeOrder | null;
}

export const AddDepositModal: React.FC<AddDepositModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { exchangeRate, addCustomOrderDeposit, storeInfo } = useBakery();

  const [additionalAmountKhr, setAdditionalAmountKhr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_KHR' | 'KHQR_BAKONG' | 'CASH_USD'>('CASH_KHR');
  const [isStandeeOpen, setIsStandeeOpen] = useState<boolean>(false);

  // Calculate order metrics
  const totalKhr = order
    ? (order.totalKhr ?? Math.round(order.totalUsd * exchangeRate))
    : 0;
  const currentDepositKhr = order
    ? (order.depositKhr ?? Math.round(order.depositUsd * exchangeRate))
    : 0;
  const remainingKhr = Math.max(0, totalKhr - currentDepositKhr);
  const remainingUsd = Number((remainingKhr / exchangeRate).toFixed(2));

  // Default additional amount to remaining balance when opened
  useEffect(() => {
    if (order && remainingKhr > 0) {
      // By default set to remaining
      setAdditionalAmountKhr(remainingKhr.toString());
      setPaymentMethod('CASH_KHR');
    } else {
      setAdditionalAmountKhr('');
    }
  }, [order, remainingKhr, isOpen]);

  if (!isOpen || !order) return null;

  const numAdditionalKhr = Math.max(0, parseInt(additionalAmountKhr, 10) || 0);
  const numAdditionalUsd = Number((numAdditionalKhr / exchangeRate).toFixed(2));

  const newTotalDepositKhr = Math.min(totalKhr, currentDepositKhr + numAdditionalKhr);
  const newTotalDepositUsd = Number((newTotalDepositKhr / exchangeRate).toFixed(2));
  const newRemainingKhr = Math.max(0, totalKhr - newTotalDepositKhr);
  const newRemainingUsd = Number((newRemainingKhr / exchangeRate).toFixed(2));
  const isWillBeFullyPaid = newRemainingKhr === 0 && numAdditionalKhr > 0;

  const handleQuickAdd = (addKhr: number) => {
    soundFx.playPop();
    const currentInput = parseInt(additionalAmountKhr, 10) || 0;
    const capped = Math.min(remainingKhr, currentInput + addKhr);
    setAdditionalAmountKhr(capped.toString());
  };

  const handlePayFullRemaining = () => {
    soundFx.playPop();
    setAdditionalAmountKhr(remainingKhr.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAdditionalKhr <= 0) return;

    soundFx.playSuccess();
    if (isWillBeFullyPaid) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    addCustomOrderDeposit(order.id, numAdditionalKhr, paymentMethod);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-amber-50/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-800 text-base">បន្ថែមប្រាក់កក់ / បង់បង្គ្រប់</h3>
                  <span className="text-[10px] font-black text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded-full">
                    {order.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  កត់ត្រាប្រាក់កក់បន្ថែមលើនំកុម្ម៉ង់ {order.cakeName}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
            {/* Customer & Cake Info Snippet */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-black shrink-0">
                  <Cake className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-slate-800">{order.customerName}</div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{order.phone}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-600">{order.cakeName}</div>
                <div className="text-[10px] text-slate-400">ទំហំ {order.size} • {order.flavor}</div>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              {/* Total Price */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  តម្លៃសរុប (Total)
                </span>
                <div className="text-sm font-black text-slate-800 mt-0.5">
                  {totalKhr.toLocaleString()} ៛
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  ~${order.totalUsd.toFixed(2)}
                </span>
              </div>

              {/* Current Deposit */}
              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                  បានកក់រួច (Paid)
                </span>
                <div className="text-sm font-black text-emerald-700 mt-0.5">
                  {currentDepositKhr.toLocaleString()} ៛
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  ~${order.depositUsd.toFixed(2)}
                </span>
              </div>

              {/* Remaining Due */}
              <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200/80">
                <span className="text-[10px] font-bold text-rose-600 block uppercase">
                  នៅខ្វះ (Remaining)
                </span>
                <div className="text-sm font-black text-rose-600 mt-0.5">
                  {remainingKhr.toLocaleString()} ៛
                </div>
                <span className="text-[10px] text-rose-500 font-semibold">
                  ~${remainingUsd.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Additional Deposit Input Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800">
                  ចំនួនប្រាក់កក់ត្រូវបន្ថែម (Additional Deposit ៛ KHR) *
                </label>
                {remainingKhr > 0 && (
                  <button
                    type="button"
                    onClick={handlePayFullRemaining}
                    className="text-[11px] font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>បង់បង្គ្រប់ទាំងអស់ ({remainingKhr.toLocaleString()} ៛)</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={remainingKhr > 0 ? remainingKhr : totalKhr}
                  required
                  value={additionalAmountKhr}
                  onChange={(e) => setAdditionalAmountKhr(e.target.value)}
                  placeholder="0"
                  className="w-full pl-4 pr-12 py-3 text-xl font-black text-pink-600 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
                  ៛ KHR
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>ប្រហាក់ប្រហែលជាដុល្លារ៖ <b className="text-slate-700">${numAdditionalUsd.toFixed(2)} USD</b></span>
                {numAdditionalKhr > remainingKhr && (
                  <span className="text-rose-500 font-bold text-[11px]">
                    លើសចំនួននៅខ្វះ ({remainingKhr.toLocaleString()} ៛)
                  </span>
                )}
              </div>

              {/* Quick Increment Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[10000, 20000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAdd(amt)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    + {amt.toLocaleString()} ៛
                  </button>
                ))}
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="p-4 bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-2xl border border-pink-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>ស្ថានភាពក្រោយការបន្ថែមប្រាក់កក់៖</span>
                {isWillBeFullyPaid && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>នឹងក្លាយជា បង់គ្រប់ ១០០%</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>ប្រាក់កក់សរុបថ្មី៖</span>
                <span className="text-emerald-700 font-black text-sm">
                  {newTotalDepositKhr.toLocaleString()} ៛ (~${newTotalDepositUsd.toFixed(2)})
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1 border-t border-pink-100">
                <span>នៅខ្វះនៅសល់៖</span>
                <span className={`font-black ${newRemainingKhr === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {newRemainingKhr === 0 ? '០ ៛ (បង់គ្រប់)' : `${newRemainingKhr.toLocaleString()} ៛ (~$${newRemainingUsd.toFixed(2)})`}
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                វិធីសាស្ត្រទទួលប្រាក់កក់ (Payment Method)
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPaymentMethod('CASH_KHR');
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'CASH_KHR'
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>សាច់ប្រាក់ ៛</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPaymentMethod('KHQR_BAKONG');
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'KHQR_BAKONG'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-red-600" />
                  <span>ស្កេន KHQR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPaymentMethod('CASH_USD');
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'CASH_USD'
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span>សាច់ប្រាក់ $</span>
                </button>
              </div>

              {/* If KHQR selected, option to display Standee QR */}
              {paymentMethod === 'KHQR_BAKONG' && (
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#D32F2F] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      KHQR
                    </span>
                    <span className="font-bold text-slate-700">
                      {numAdditionalKhr > 0
                        ? `ស្កេនទូទាត់ ${numAdditionalKhr.toLocaleString()} ៛`
                        : 'ស្កេនទូទាត់ប្រាក់កក់'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setIsStandeeOpen(true);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>បង្ហាញ QR លើតុ</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onClose();
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>

              <button
                type="submit"
                disabled={numAdditionalKhr <= 0}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  រក្សាទុកការបន្ថែមប្រាក់កក់ {numAdditionalKhr > 0 ? `(${numAdditionalKhr.toLocaleString()} ៛)` : ''}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Standee Modal if requested for KHQR scanning */}
      <KhqrStandeeModal
        isOpen={isStandeeOpen}
        onClose={() => setIsStandeeOpen(false)}
        customAmountKhr={numAdditionalKhr}
        customAmountUsd={numAdditionalUsd}
      />
    </>
  );
};
