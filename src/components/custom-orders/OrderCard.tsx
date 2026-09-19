import React from 'react';
import { Clock, Phone, ChevronRight, CheckCircle2, Flame, Palette, Sparkles, CheckSquare, Wallet, Trash2, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomCakeOrder, OrderStatus } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

interface OrderCardProps {
  order: CustomCakeOrder;
  onAdvanceStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onAddDeposit?: (order: CustomCakeOrder) => void;
  onDelete?: (order: CustomCakeOrder) => void;
  onViewReceipt?: (order: CustomCakeOrder) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onAdvanceStatus, onAddDeposit, onDelete, onViewReceipt }) => {
  const { exchangeRate } = useBakery();

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'PENDING':
        return 'BAKING';
      case 'BAKING':
        return 'DECORATING';
      case 'DECORATING':
        return 'READY';
      case 'READY':
        return 'DELIVERED';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  const isBreadOrder = order.orderType === 'BREAD';

  const getNextStatusLabel = (next: OrderStatus | null): string => {
    switch (next) {
      case 'BAKING':
        return isBreadOrder ? 'ចាប់ផ្តើមដុតនំបុ័ង 🔥' : 'ចាប់ផ្តើមដុតនំ 🔥';
      case 'DECORATING':
        return isBreadOrder ? 'វេចខ្ចប់ / ហាន់នំបុ័ង 🥖' : 'ចាប់ផ្តើមតែងនំ 🎨';
      case 'READY':
        return isBreadOrder ? 'នំបុ័ងរួចរាល់ អាចមកយក 🎉' : 'នំរួចរាល់ អាចមកយក 🎉';
      case 'DELIVERED':
        return 'ប្រគល់ជូនភ្ញៀវរួចរាល់ ✔';
      default:
        return '';
    }
  };

  const getProgressPercent = (st: OrderStatus): number => {
    switch (st) {
      case 'PENDING':
        return 20;
      case 'BAKING':
        return 45;
      case 'DECORATING':
        return 70;
      case 'READY':
        return 90;
      case 'DELIVERED':
        return 100;
      default:
        return 0;
    }
  };

  const handleAdvance = () => {
    if (!nextStatus) return;

    if (nextStatus === 'READY' || nextStatus === 'DELIVERED') {
      soundFx.playSuccess();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      soundFx.playChime();
    }

    onAdvanceStatus(order.id, nextStatus);
  };

  const remainingUsd = order.totalUsd - order.depositUsd;
  const progress = getProgressPercent(order.status);

  return (
    <div className={`bg-white rounded-3xl border ${isBreadOrder ? 'border-amber-200/90 hover:border-amber-300 hover:shadow-amber-500/10' : 'border-rose-100/90 hover:border-pink-300 hover:shadow-pink-500/10'} p-4 shadow-sm hover:shadow-xl transition-all duration-300 space-y-3 group`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 border-b border-rose-50 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-black tracking-wider ${isBreadOrder ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-pink-600 bg-pink-50'} px-2.5 py-0.5 rounded-full`}>
              {order.orderNumber}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isBreadOrder ? 'bg-amber-500 text-white' : 'bg-pink-100 text-pink-700'}`}>
              {isBreadOrder ? '🥖 នំបុ័ង & នំដុត' : '🎂 នំខួបកំណើត'}
            </span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm mt-1">{order.customerName}</h4>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${order.phone}`}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-pink-600 bg-slate-50 hover:bg-pink-50 px-2.5 py-1 rounded-xl border border-slate-100 transition-colors"
          >
            <Phone className="w-3 h-3 text-pink-500" />
            <span>{order.phone}</span>
          </a>

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                soundFx.playPop();
                onDelete(order);
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 flex items-center justify-center transition-all active:scale-90 cursor-pointer border border-rose-200/70 shrink-0"
              title="លុបការកុម្ម៉ង់នេះចេញ"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
          <span>ដំណើរការផលិត</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${isBreadOrder ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400' : 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400'} rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Order Item Details */}
      {isBreadOrder && order.breadItems && order.breadItems.length > 0 ? (
        <div className="space-y-2">
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-2.5 space-y-1.5">
            <div className="text-[11px] font-black text-amber-800 flex items-center justify-between">
              <span>🥖 បញ្ជីមុខទំនិញនំបុ័ង ({order.breadItems.length} មុខ)៖</span>
              <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">
                សរុប {order.breadItems.reduce((acc, it) => acc + it.quantity, 0)} {order.breadItems[0]?.unit || 'ដុំ'}
              </span>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {order.breadItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-slate-700 bg-white/80 px-2 py-1 rounded-lg border border-amber-100/50">
                  <span className="font-bold text-slate-800">
                    {item.nameKh} <span className="text-amber-700">× {item.quantity} {item.unit}</span>
                  </span>
                  <span className="font-semibold text-slate-600">
                    {item.totalKhr.toLocaleString()} ៛
                  </span>
                </div>
              ))}
            </div>
          </div>

          {order.packagingOption && (
            <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
              <span>📦</span>
              <span className="font-semibold">វេចខ្ចប់៖</span>
              <span>{order.packagingOption}</span>
            </div>
          )}

          {order.themeNotes && (
            <div className="text-[11px] text-slate-500 leading-snug">
              ចំណាំ៖ {order.themeNotes}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">{order.cakeName}</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-md">
              {order.size}
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            រសជាតិ៖ <span className="font-semibold text-slate-700">{order.flavor}</span>
          </div>

          {/* Inscription quote box */}
          {order.inscription && (
            <div className="p-2.5 bg-gradient-to-r from-pink-50/80 to-rose-50/40 border border-pink-200/60 rounded-2xl text-pink-700 text-[11px] font-medium italic">
              "{order.inscription}"
            </div>
          )}

          {order.themeNotes && (
            <div className="text-[11px] text-slate-400 leading-snug">
              ចំណាំ៖ {order.themeNotes}
            </div>
          )}
        </div>
      )}

      {/* Pickup Timing */}
      <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/90 px-3 py-1.5 rounded-2xl border border-amber-200/80">
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="font-bold">
          មកយក៖ {order.pickupDate} ម៉ោង {order.pickupTime}
        </span>
      </div>

      {/* Pricing & Deposit (KHR ៛ FIRST) */}
      <div className="pt-2 border-t border-rose-50 flex items-center justify-between text-xs">
        <div>
          <div className="font-black text-pink-600 text-sm">
            {(order.totalKhr ?? Math.round(order.totalUsd * exchangeRate)).toLocaleString()} ៛
          </div>
          <div className="text-[10px] text-slate-400 font-semibold">
            ~ ${order.totalUsd.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            បានកក់៖ {(order.depositKhr ?? Math.round(order.depositUsd * exchangeRate)).toLocaleString()} ៛ (${order.depositUsd.toFixed(2)})
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-1">
          {remainingUsd > 0 ? (
            <>
              <div className="text-[11px] text-rose-500 font-black leading-tight">
                នៅខ្វះ {Math.round(remainingUsd * exchangeRate).toLocaleString()} ៛
                <div className="text-[9px] text-slate-400 font-semibold">
                  (~${remainingUsd.toFixed(2)})
                </div>
              </div>
              {onAddDeposit && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    onAddDeposit(order);
                  }}
                  className="px-2 py-0.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 hover:border-pink-300 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                  title="បន្ថែមប្រាក់កក់លើនំកុម្ម៉ង់នេះ"
                >
                  <Wallet className="w-3 h-3 text-pink-600" />
                  <span>+ បន្ថែមប្រាក់កក់</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3" /> បង់គ្រប់
              </span>
              {onAddDeposit && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    onAddDeposit(order);
                  }}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="កែប្រែ ឬបន្ថែមប្រាក់កក់"
                >
                  <Wallet className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Advance Status Button */}
      {nextStatus && (
        <button
          onClick={handleAdvance}
          className="w-full py-2.5 bg-slate-900 hover:bg-pink-600 text-white rounded-2xl text-xs font-black transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 active:scale-95 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-rose-500"
        >
          <span>{getNextStatusLabel(nextStatus)}</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Delivered Status: Completion Banner & Receipt Button */}
      {order.status === 'DELIVERED' && (
        <div className="pt-2 border-t border-emerald-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-bold border border-emerald-200/70">
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>បានប្រគល់រួច • ចូលចំណូលរួចរាល់</span>
            </span>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-black">
              100%
            </span>
          </div>

          {onViewReceipt && (
            <button
              type="button"
              onClick={() => {
                soundFx.playChime();
                onViewReceipt(order);
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>មើលវិក្កយបត្រ / បោះពុម្ព (Receipt)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
