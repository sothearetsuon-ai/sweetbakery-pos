import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Minus,
  CheckCircle,
  Banknote,
  DollarSign,
  QrCode,
  Gift,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { CompletedSale, PartyAddon } from '../../types';
import { soundFx } from '../../utils/audio';

interface AddPartyAddonsToSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: CompletedSale | null;
  onSuccess?: (updatedSale: CompletedSale) => void;
}

export const AddPartyAddonsToSaleModal: React.FC<AddPartyAddonsToSaleModalProps> = ({
  isOpen,
  onClose,
  sale,
  onSuccess,
}) => {
  const { partyAddons, exchangeRate, updateSale, customOrders, updateCustomOrder } = useBakery();

  // Quantities for each party addon: { [addonId]: quantity }
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  // Optional custom accessory item
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPriceKhr, setCustomPriceKhr] = useState('4000');
  const [customQty, setCustomQty] = useState(1);

  // Payment method for the additional party items
  const [paymentMethod, setPaymentMethod] = useState<'CASH_KHR' | 'CASH_USD' | 'KHQR_BAKONG'>('CASH_KHR');
  const [note, setNote] = useState('');

  if (!isOpen || !sale) return null;

  const handleIncrement = (addonId: string) => {
    soundFx.playPop();
    setSelectedQuantities((prev) => ({
      ...prev,
      [addonId]: (prev[addonId] || 0) + 1,
    }));
  };

  const handleDecrement = (addonId: string) => {
    soundFx.playPop();
    setSelectedQuantities((prev) => {
      const current = prev[addonId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[addonId];
        return copy;
      }
      return { ...prev, [addonId]: current - 1 };
    });
  };

  // Calculations for added addons
  const standardAddedKhr = Object.entries(selectedQuantities).reduce((sum, [id, qty]) => {
    if (!qty || qty <= 0) return sum;
    const addon = partyAddons.find((a) => a.id === id);
    if (!addon) return sum;
    const itemKhr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);
    return sum + itemKhr * qty;
  }, 0);

  const customAddedKhr =
    isCustomOpen && customName.trim()
      ? (parseInt(customPriceKhr, 10) || 0) * Math.max(1, customQty)
      : 0;

  const totalAddedKhr = standardAddedKhr + customAddedKhr;
  const totalAddedUsd = Number((totalAddedKhr / exchangeRate).toFixed(2));

  const newTotalKhr = sale.totalKhr + totalAddedKhr;
  const newTotalUsd = Number((newTotalKhr / exchangeRate).toFixed(2));

  const totalAddedItemsCount =
    Object.values(selectedQuantities).reduce((sum, q) => sum + q, 0) +
    (isCustomOpen && customName.trim() ? customQty : 0);

  const handleConfirm = () => {
    if (totalAddedKhr <= 0) return;

    soundFx.playSuccess();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    // 1. Build list of newly added items
    const newItems = [...sale.items];
    const addedDescriptions: string[] = [];

    // Add standard selected addons
    Object.entries(selectedQuantities).forEach(([id, qty]) => {
      if (!qty || qty <= 0) return;
      const addon = partyAddons.find((a) => a.id === id);
      if (!addon) return;

      const itemKhr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);
      const itemUsd = addon.priceUsd;
      const productId = `addon-${addon.id}`;
      const nameKh = `🎉 ${addon.nameKh}`;
      const nameEn = `🎉 ${addon.nameEn || addon.nameKh}`;

      addedDescriptions.push(`${addon.nameKh} (x${qty})`);

      // Check if already in items
      const existingIdx = newItems.findIndex((it) => it.productId === productId);
      if (existingIdx >= 0) {
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          quantity: newItems[existingIdx].quantity + qty,
        };
      } else {
        newItems.push({
          productId,
          nameKh,
          nameEn,
          quantity: qty,
          priceUsd: itemUsd,
          priceKhr: itemKhr,
        });
      }
    });

    // Add custom item if specified
    if (isCustomOpen && customName.trim()) {
      const cQty = Math.max(1, customQty);
      const cKhr = parseInt(customPriceKhr, 10) || 0;
      const cUsd = Number((cKhr / exchangeRate).toFixed(2));
      addedDescriptions.push(`${customName.trim()} (x${cQty})`);

      newItems.push({
        productId: `addon-custom-${Date.now()}`,
        nameKh: `🎉 ${customName.trim()}`,
        nameEn: `🎉 ${customName.trim()}`,
        quantity: cQty,
        priceUsd: cUsd,
        priceKhr: cKhr,
      });
    }

    // 2. Prepare updated sale object
    const addonNoteSummary = `[ថែម Party Add-ons: ${addedDescriptions.join(', ')}]`;
    const updatedNotes = sale.notes
      ? `${sale.notes} • ${addonNoteSummary}`
      : addonNoteSummary;

    const updatedSale: CompletedSale = {
      ...sale,
      items: newItems,
      subtotalUsd: Number((sale.subtotalUsd + totalAddedUsd).toFixed(2)),
      totalUsd: newTotalUsd,
      totalKhr: newTotalKhr,
      // If it is deposit sale, adjust remaining balance
      remainingKhr: sale.isDeposit
        ? (sale.remainingKhr || 0) + totalAddedKhr
        : undefined,
      remainingUsd: sale.isDeposit
        ? Number(((sale.remainingUsd || 0) + totalAddedUsd).toFixed(2))
        : undefined,
      // If full sale, adjust paid amount
      paidKhr: !sale.isDeposit
        ? (sale.paidKhr || sale.totalKhr) + totalAddedKhr
        : sale.paidKhr,
      paidUsd: !sale.isDeposit
        ? Number(((sale.paidUsd || sale.totalUsd) + totalAddedUsd).toFixed(2))
        : sale.paidUsd,
      notes: note.trim() ? `${updatedNotes} (${note.trim()})` : updatedNotes,
    };

    // 3. Save to BakeryContext
    updateSale(updatedSale);

    // 4. If linked to a custom order, sync total and notes to custom order as well
    const linkedOrderId = sale.id.startsWith('sale-custom-')
      ? sale.id.replace('sale-custom-', '')
      : null;

    if (linkedOrderId) {
      const targetOrder = customOrders.find((o) => o.id === linkedOrderId);
      if (targetOrder) {
        updateCustomOrder(linkedOrderId, {
          totalKhr: newTotalKhr,
          totalUsd: newTotalUsd,
          themeNotes: targetOrder.themeNotes
            ? `${targetOrder.themeNotes} • ${addonNoteSummary}`
            : addonNoteSummary,
        });
      }
    }

    if (onSuccess) {
      onSuccess(updatedSale);
    }

    // Reset state & close
    setSelectedQuantities({});
    setIsCustomOpen(false);
    setCustomName('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                🎉 ថែមឥវ៉ាន់កម្មវិធី (Party Add-ons)
              </h3>
              <p className="text-[11px] text-pink-100 font-medium">
                វិក្កយបត្រ #{sale.orderNumber} {sale.customerName ? `• ភ្ញៀវ៖ ${sale.customerName}` : ''}
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

        {/* Info Banner */}
        <div className="px-5 py-2.5 bg-amber-50/80 border-b border-amber-200/60 flex items-center gap-2 text-xs text-amber-900 shrink-0">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            ជ្រើសរើសឥវ៉ាន់បន្ថែមដែលភ្ញៀវទិញក្រោយគិតលុយរួច (ទៀន, មួក, ស្លាក HBD...) ដើម្បីបញ្ចូលក្នុងវិក្កយបត្រនេះផ្ទាល់។
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Party Add-ons Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              មុខទំនិញ Party Add-ons ដែលមានក្នុងហាង
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {partyAddons.map((addon) => {
                const qty = selectedQuantities[addon.id] || 0;
                const priceKhr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);
                const isSelected = qty > 0;

                return (
                  <div
                    key={addon.id}
                    onClick={() => handleIncrement(addon.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/70 shadow-xs ring-1 ring-pink-500/30'
                        : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div className="font-bold text-xs text-slate-800 leading-tight">
                        {addon.nameKh}
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-pink-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs">
                          {qty}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div>
                        <div className="text-xs font-black text-pink-600">
                          {priceKhr.toLocaleString()} ៛
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          ~${addon.priceUsd.toFixed(2)}
                        </div>
                      </div>

                      {/* Stepper buttons */}
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {qty > 0 && (
                          <button
                            type="button"
                            onClick={() => handleDecrement(addon.id)}
                            className="w-7 h-7 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="បន្ថយ"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleIncrement(addon.id)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 ${
                            isSelected
                              ? 'bg-pink-600 text-white hover:bg-pink-700'
                              : 'bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-pink-700'
                          }`}
                          title="បន្ថែម"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Custom Accessory Toggle */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                ✨ ឥវ៉ាន់កម្មវិធីផ្សេងៗ (Special / Custom Item)
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsCustomOpen(!isCustomOpen);
                }}
                className="text-[11px] font-bold text-pink-600 hover:text-pink-700 cursor-pointer"
              >
                {isCustomOpen ? 'បិទ' : '+ បញ្ចូលមុខទំនិញក្រៅបញ្ជី'}
              </button>
            </div>

            {isCustomOpen && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <input
                  type="text"
                  placeholder="ឈ្មោះឥវ៉ាន់បន្ថែម (ឧ. ទៀនភ្លើងចម្រុះ, មួកពិសេស...)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="500"
                      placeholder="តម្លៃ (៛)"
                      value={customPriceKhr}
                      onChange={(e) => setCustomPriceKhr(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                      ៛
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs font-bold text-slate-500">ចំនួន:</span>
                    <button
                      type="button"
                      onClick={() => setCustomQty((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-black text-xs min-w-5 text-center">
                      {customQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomQty((q) => q + 1)}
                      className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector for the extra items */}
          {totalAddedKhr > 0 && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 block">
                វិធីសាស្ត្រទូទាត់សម្រាប់ឥវ៉ាន់បន្ថែមនេះ
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPaymentMethod('CASH_KHR');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold ${
                    paymentMethod === 'CASH_KHR'
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>សាច់ប្រាក់ (៛)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPaymentMethod('KHQR_BAKONG');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold ${
                    paymentMethod === 'KHQR_BAKONG'
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>KHQR Bakong</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPaymentMethod('CASH_USD');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold ${
                    paymentMethod === 'CASH_USD'
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>សាច់ប្រាក់ ($)</span>
                </button>
              </div>
            </div>
          )}

          {/* Pricing Comparison Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white space-y-2 shadow-lg">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>តម្លៃវិក្កយបត្រចាស់ (Original Total):</span>
              <span className="font-mono font-bold">
                {sale.totalKhr.toLocaleString()} ៛ (${sale.totalUsd.toFixed(2)})
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-amber-300 font-bold border-b border-white/10 pb-2">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>តម្លៃឥវ៉ាន់ថែម ({totalAddedItemsCount} មុខ):</span>
              </span>
              <span className="font-mono text-sm font-black">
                + {totalAddedKhr.toLocaleString()} ៛ (+${totalAddedUsd.toFixed(2)})
              </span>
            </div>

            <div className="flex justify-between items-center pt-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-pink-300">
                សរុបថ្មីត្រូវបង់ (New Grand Total):
              </span>
              <div className="text-right">
                <div className="text-base sm:text-lg font-black text-white font-mono leading-none">
                  {newTotalKhr.toLocaleString()} ៛
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  ~ ${newTotalUsd.toFixed(2)} USD
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-rose-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            បោះបង់
          </button>
          <button
            type="button"
            disabled={totalAddedKhr <= 0}
            onClick={handleConfirm}
            className={`px-6 py-2.5 text-white text-xs font-black rounded-2xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
              totalAddedKhr > 0
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 shadow-pink-500/25'
                : 'bg-slate-300 cursor-not-allowed opacity-60 shadow-none'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {totalAddedKhr > 0
                ? `បញ្ជាក់ថែមលើវិក្កយបត្រ (+${totalAddedKhr.toLocaleString()} ៛)`
                : 'សូមជ្រើសរើសឥវ៉ាន់ថែម'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
