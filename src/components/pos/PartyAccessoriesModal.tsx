import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  Sparkles,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Package,
  PackagePlus,
  AlertTriangle,
  History,
  Calendar,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { PartyAddon, Product } from '../../types';
import { soundFx } from '../../utils/audio';
import { roundKhr } from '../../utils/currencyUtils';

interface PartyAccessoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartyAccessoriesModal: React.FC<PartyAccessoriesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    partyAddons,
    addPartyAddon,
    updatePartyAddon,
    restockPartyAddon,
    deletePartyAddon,
    deductPartyAddonsStockFromPastSales,
    sales,
    exchangeRate,
    addToCart,
    cart,
  } = useBakery();

  // Add new addon state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNameKh, setNewNameKh] = useState('');
  const [newPriceUsd, setNewPriceUsd] = useState('1.00');
  const [newPriceKhr, setNewPriceKhr] = useState('4000');
  const [newStockQty, setNewStockQty] = useState('50');
  const [newMinAlertStock, setNewMinAlertStock] = useState('10');

  // Edit existing addon state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameKh, setEditNameKh] = useState('');
  const [editPriceUsd, setEditPriceUsd] = useState('');
  const [editPriceKhr, setEditPriceKhr] = useState('');
  const [editStockQty, setEditStockQty] = useState('');
  const [editMinAlertStock, setEditMinAlertStock] = useState('');

  // Quick Restock State
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [customRestockQty, setCustomRestockQty] = useState('10');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Retroactive past sales deduction state
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [reconcileSinceDate, setReconcileSinceDate] = useState('2026-10-08');
  const [reconcileResultMsg, setReconcileResultMsg] = useState<string | null>(null);

  const reconcilePreview = useMemo(() => {
    const targetSales = (sales || []).filter((s) => {
      if (!s.createdAt) return false;
      return s.createdAt.slice(0, 10) >= reconcileSinceDate;
    });

    const soldMap: Record<string, number> = {};
    targetSales.forEach((s) => {
      (s.items || []).forEach((item) => {
        if (!item.productId) return;
        const rawId = item.productId.startsWith('addon-') ? item.productId.slice(6) : item.productId;
        const matched = partyAddons.find(
          (a) =>
            a.id === rawId ||
            `addon-${a.id}` === item.productId ||
            (item.nameKh && item.nameKh.includes(a.nameKh))
        );
        if (matched) {
          soldMap[matched.id] = (soldMap[matched.id] || 0) + (Number(item.quantity) || 1);
        }
      });
    });

    const items = partyAddons.map((addon) => {
      const sold = soldMap[addon.id] || 0;
      const current = addon.stockQty ?? 0;
      const remaining = Math.max(0, current - sold);
      return {
        addon,
        sold,
        current,
        remaining,
      };
    });

    const totalSold = Object.values(soldMap).reduce((a, b) => a + b, 0);

    return {
      salesCount: targetSales.length,
      totalSold,
      items,
      soldMap,
    };
  }, [sales, partyAddons, reconcileSinceDate]);

  const handleApplyReconcile = () => {
    soundFx.playSuccess();
    const res = deductPartyAddonsStockFromPastSales(reconcileSinceDate);
    try {
      confetti({ particleCount: 70, spread: 70 });
    } catch (e) {}
    const totalPieces = Object.values(res.soldSummary).reduce((a, b) => a + b, 0);
    if (totalPieces > 0) {
      setReconcileResultMsg(
        `✅ បានកាត់ស្តុកជោគជ័យ! សរុប ${totalPieces} ឯកតា ពីការលក់ចំនួន ${res.totalSalesScanned} វិក្កយបត្រ (គិតចាប់ពីថ្ងៃ ${reconcileSinceDate})។`
      );
    } else {
      setReconcileResultMsg(
        `ℹ️ មិនមានទំនិញគ្រឿងបន្ថែមពិធីត្រូវបានលក់ក្នុងវិក្កយបត្រចាប់ពីថ្ងៃ ${reconcileSinceDate} មកទេ។ បងអាចចុចរូបខ្មៅដៃ ✏️ លើមុខទំនិញខាងក្រោមដើម្បីកំណត់ចំនួនស្តុកជាក់ស្តែងដោយផ្ទាល់បាន។`
      );
    }
  };

  if (!isOpen) return null;

  // Auto conversion handlers for new item
  const handleNewPriceUsdChange = (val: string) => {
    setNewPriceUsd(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setNewPriceKhr(String(roundKhr(num * exchangeRate)));
    }
  };

  const handleNewPriceKhrChange = (val: string) => {
    setNewPriceKhr(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setNewPriceUsd((num / exchangeRate).toFixed(2));
    }
  };

  // Auto conversion handlers for edit item
  const handleEditPriceUsdChange = (val: string) => {
    setEditPriceUsd(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setEditPriceKhr(String(roundKhr(num * exchangeRate)));
    }
  };

  const handleEditPriceKhrChange = (val: string) => {
    setEditPriceKhr(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setEditPriceUsd((num / exchangeRate).toFixed(2));
    }
  };

  // Submit new accessory
  const handleCreateAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameKh.trim()) return;

    soundFx.playSuccess();
    const usd = parseFloat(newPriceUsd) || 0;
    const khr = roundKhr(parseInt(newPriceKhr, 10) || (usd * exchangeRate));
    const stock = Math.max(0, parseInt(newStockQty, 10) || 0);
    const minAlert = Math.max(0, parseInt(newMinAlertStock, 10) || 10);

    addPartyAddon(newNameKh.trim(), khr, usd, stock, minAlert);
    setNewNameKh('');
    setNewPriceUsd('1.00');
    setNewPriceKhr('4000');
    setNewStockQty('50');
    setNewMinAlertStock('10');
    setIsAddingNew(false);
  };

  // Start editing
  const startEditing = (addon: PartyAddon) => {
    soundFx.playPop();
    setEditingId(addon.id);
    setEditNameKh(addon.nameKh);
    const usd = addon.priceUsd;
    const khr = roundKhr(addon.priceKhr ?? (usd * exchangeRate));
    setEditPriceUsd(usd.toString());
    setEditPriceKhr(khr.toString());
    setEditStockQty((addon.stockQty ?? 50).toString());
    setEditMinAlertStock((addon.minAlertStock ?? 10).toString());
  };

  // Save edited accessory
  const handleSaveEdit = (id: string) => {
    if (!editNameKh.trim()) return;

    soundFx.playSuccess();
    const usd = parseFloat(editPriceUsd) || 0;
    const khr = roundKhr(parseInt(editPriceKhr, 10) || (usd * exchangeRate));
    const stock = Math.max(0, parseInt(editStockQty, 10) || 0);
    const minAlert = Math.max(0, parseInt(editMinAlertStock, 10) || 10);

    updatePartyAddon(id, editNameKh.trim(), khr, usd, stock, minAlert);
    setEditingId(null);
  };

  // Quick Restock handler
  const handleQuickRestock = (id: string, amount: number) => {
    soundFx.playSuccess();
    restockPartyAddon(id, amount);
  };

  // Delete accessory
  const handleDelete = (id: string) => {
    soundFx.playPop();
    deletePartyAddon(id);
    setDeletingId(null);
    if (editingId === id) setEditingId(null);
  };

  // Add to POS Cart
  const handleAddDirectToCart = (addon: PartyAddon) => {
    const currentStock = addon.stockQty ?? 0;
    const addonProductId = `addon-${addon.id}`;
    const cartItem = cart.find((i) => i.product.id === addonProductId);
    const qtyInCart = cartItem ? cartItem.quantity : 0;

    if (currentStock <= 0) {
      soundFx.playWarning();
      alert(`⚠️ មុខទំនិញ "${addon.nameKh}" អស់ស្តុកក្នុងហាងហើយ! សូមបញ្ចូលស្តុកបន្ថែមសិន។`);
      return;
    }

    if (qtyInCart >= currentStock) {
      soundFx.playWarning();
      alert(`⚠️ ក្នុងកន្ត្រកមាន ${qtyInCart} ស្មើនឹងចំនួនស្តុកទាំងអស់ (${currentStock}) ក្នុងហាងហើយ!`);
      return;
    }

    soundFx.playPop();
    const addonKhr = roundKhr(addon.priceKhr ?? (addon.priceUsd * exchangeRate));

    const partyProduct: Product = {
      id: addonProductId,
      nameKh: `🎉 ${addon.nameKh}`,
      nameEn: `🎉 ${addon.nameEn || addon.nameKh}`,
      categoryId: 'party',
      priceUsd: addon.priceUsd,
      priceKhr: addonKhr,
      costPriceUsd: 0,
      stockQty: currentStock,
      unit: 'pcs',
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
      isCustom: false,
    };
    addToCart(partyProduct);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-rose-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                🎉 គ្រឿងបន្ថែមសម្រាប់កម្មវិធី (Party Accessories)
              </h2>
              <p className="text-[11px] text-pink-100 font-medium">
                គ្រប់គ្រង បន្ថែមមុខទំនិញថ្មី និងកែប្រែតម្លៃ ($ USD / ៛ KHR)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Action Header: Triggers for Add New and Past Sales Deduction */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
            <div className="text-xs font-bold text-slate-700">
              បញ្ជីមុខទំនិញពិធីបច្ចុប្បន្ន ({partyAddons.length})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsReconcileOpen((prev) => !prev);
                  if (!isReconcileOpen) {
                    setIsAddingNew(false);
                    setEditingId(null);
                    setReconcileResultMsg(null);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer ${
                  isReconcileOpen
                    ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isReconcileOpen ? 'លាក់ផ្ទាំងកាត់ស្តុក' : '🔄 កាត់ស្តុកពីការលក់កន្លងមក'}</span>
              </button>

              {!isAddingNew && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setIsAddingNew(true);
                    setIsReconcileOpen(false);
                    setEditingId(null);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ ថែមមុខទំនិញថ្មី</span>
                </button>
              )}
            </div>
          </div>

          {/* Past Sales Retroactive Stock Deduction Panel */}
          {isReconcileOpen && (
            <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50/50 to-pink-50/40 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-950">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>គណនាកាត់ស្តុកពីការលក់កន្លងមក (Sync Sold Stock from Past Sales)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReconcileOpen(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed font-medium">
                ប្រព័ន្ធនឹងស្កេនរាល់វិក្កយបត្រលក់ក្នុងប្រព័ន្ធចាប់ពីកាលបរិច្ឆេទដែលបានជ្រើសរើស រួចបូកសរុបចំនួនគ្រឿងបន្ថែមដែលបានលក់ និងកាត់ចេញពីស្តុកបច្ចុប្បន្នដោយស្វ័យប្រវត្តិ៖
              </div>

              {/* Date Filter Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-bold text-slate-700">គិតចាប់ពីថ្ងៃ៖</span>
                  <input
                    type="date"
                    value={reconcileSinceDate}
                    onChange={(e) => {
                      setReconcileSinceDate(e.target.value);
                      setReconcileResultMsg(null);
                    }}
                    className="font-mono text-slate-800 font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReconcileSinceDate('2026-10-08');
                    setReconcileResultMsg(null);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    reconcileSinceDate === '2026-10-08'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ⭐ ចាប់ពី 08-10-2026
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    setReconcileSinceDate(today);
                    setReconcileResultMsg(null);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    reconcileSinceDate === new Date().toISOString().slice(0, 10)
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  📅 ថ្ងៃនេះ
                </button>
              </div>

              {/* Stat summary cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">វិក្កយបត្រស្កេនបាន៖</span>
                  <strong className="text-slate-800 font-mono text-sm">{reconcilePreview.salesCount} សន្លឹក</strong>
                </div>
                <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">សម្ភារៈលក់បានសរុប៖</span>
                  <strong className="text-amber-700 font-mono text-sm">{reconcilePreview.totalSold} ឯកតា</strong>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
                <div className="px-3 py-2 bg-amber-100/60 font-black text-[11px] text-amber-900 grid grid-cols-12 gap-1">
                  <div className="col-span-5">ឈ្មោះគ្រឿងបន្ថែម</div>
                  <div className="col-span-2 text-center">លក់បាន</div>
                  <div className="col-span-2 text-center">ស្តុកចាស់</div>
                  <div className="col-span-3 text-right">ស្តុកក្រោយកាត់</div>
                </div>

                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {reconcilePreview.items.map((row) => (
                    <div
                      key={row.addon.id}
                      className={`px-3 py-2 text-xs grid grid-cols-12 gap-1 items-center ${
                        row.sold > 0 ? 'bg-amber-50/40 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <div className="col-span-5 font-bold text-slate-800 line-clamp-1">
                        {row.addon.nameKh}
                      </div>
                      <div className="col-span-2 text-center">
                        {row.sold > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                            -{row.sold}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </div>
                      <div className="col-span-2 text-center font-mono text-slate-700">
                        {row.current}
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold">
                        {row.sold > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {row.remaining}
                          </span>
                        ) : (
                          <span className="text-slate-500">{row.current}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {reconcileResultMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{reconcileResultMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleApplyReconcile}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-black shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    {reconcilePreview.totalSold > 0
                      ? `អនុវត្តកាត់ស្តុក (${reconcilePreview.totalSold} ឯកតា)`
                      : 'កាត់ស្តុកស្វ័យប្រវត្តិតាមការលក់'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReconcileOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  បិទ
                </button>
              </div>
            </div>
          )}

          {/* Add New Accessory Card Form */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateAddon}
              className="p-4 bg-gradient-to-br from-amber-50/80 via-pink-50/50 to-rose-50/60 rounded-2xl border-2 border-pink-400 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span>បញ្ចូលមុខទំនិញពិធីថ្មី (New Accessory)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ឈ្មោះទំនិញ (Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. 🎈 ប៉េងប៉ោងខួបកំណើត"
                    value={newNameKh}
                    onChange={(e) => setNewNameKh(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/25"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    តម្លៃជាដុល្លារ ($ USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      required
                      placeholder="1.00"
                      value={newPriceUsd}
                      onChange={(e) => handleNewPriceUsdChange(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500/25"
                    />
                    <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    តម្លៃជារៀល (៛ KHR)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="4000"
                      value={newPriceKhr}
                      onChange={(e) => handleNewPriceKhrChange(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/25"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      ៛
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ចំនួនស្តុកក្នុងហាង (Stock Quantity)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="50"
                      value={newStockQty}
                      onChange={(e) => setNewStockQty(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-pink-500/25"
                    />
                    <Package className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    កម្រិតប្រកាសអាសន្នស្តុកតិច (Low Alert)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="10"
                      value={newMinAlertStock}
                      onChange={(e) => setNewMinAlertStock(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-pink-500/25"
                    />
                    <AlertTriangle className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-black rounded-xl shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>រក្សាទុកមុខទំនិញថ្មី</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Party Accessories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partyAddons.map((addon) => {
              const isEditing = editingId === addon.id;
              const isDeleting = deletingId === addon.id;
              const isRestocking = restockingId === addon.id;
              const addonProductId = `addon-${addon.id}`;
              const cartItem = cart.find((i) => i.product.id === addonProductId);
              const qtyInCart = cartItem ? cartItem.quantity : 0;
              const displayKhr = roundKhr(addon.priceKhr ?? (addon.priceUsd * exchangeRate));
              const currentStock = addon.stockQty ?? 0;
              const minAlert = addon.minAlertStock ?? 10;
              const isOutOfStock = currentStock <= 0;
              const isLowStock = currentStock > 0 && currentStock <= minAlert;

              if (isEditing) {
                return (
                  <div
                    key={addon.id}
                    className="p-3.5 bg-white rounded-2xl border-2 border-pink-400 shadow-md space-y-2.5 sm:col-span-2 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-pink-700 flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" />
                        <span>កែប្រែទំនិញ៖ {addon.nameKh}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          ឈ្មោះទំនិញ
                        </label>
                        <input
                          type="text"
                          value={editNameKh}
                          onChange={(e) => setEditNameKh(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          តម្លៃ ($ USD)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            value={editPriceUsd}
                            onChange={(e) => handleEditPriceUsdChange(e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          />
                          <DollarSign className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          តម្លៃ (៛ KHR)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="100"
                            min="0"
                            value={editPriceKhr}
                            onChange={(e) => handleEditPriceKhrChange(e.target.value)}
                            className="w-full pl-2 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                            ៛
                          </span>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          ចំនួនស្តុកក្នុងហាង
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={editStockQty}
                            onChange={(e) => setEditStockQty(e.target.value)}
                            className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          />
                          <Package className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          កម្រិតប្រកាសអាសន្នស្តុកតិច
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={editMinAlertStock}
                            onChange={(e) => setEditMinAlertStock(e.target.value)}
                            className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          />
                          <AlertTriangle className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-amber-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(addon.id)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>លុបទំនិញនេះ</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                        >
                          បោះបង់
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(addon.id)}
                          className="px-4 py-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>រក្សាទុកការកែប្រែ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={addon.id}
                  className={`p-3 bg-white rounded-2xl border transition-all flex flex-col justify-between gap-2.5 group ${
                    isOutOfStock
                      ? 'border-rose-300 bg-rose-50/20'
                      : isLowStock
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200/80 hover:border-pink-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="text-xs font-black text-slate-800 group-hover:text-pink-600 transition-colors">
                        {addon.nameKh}
                      </div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-black text-pink-600">
                          ${addon.priceUsd.toFixed(2)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          ({displayKhr.toLocaleString()} ៛)
                        </span>

                        {/* Stock Badge */}
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>អស់ស្តុក</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                            <Package className="w-2.5 h-2.5" />
                            <span>សល់តិច: {currentStock}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Package className="w-2.5 h-2.5" />
                            <span>ស្តុក: {currentStock}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {/* Quick Restock Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setRestockingId(isRestocking ? null : addon.id);
                        }}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isRestocking
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="ថែមស្តុក (Restock)"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditing(addon)}
                        className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all cursor-pointer"
                        title="កែប្រែឈ្មោះ តម្លៃ និងស្តុក"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {isDeleting ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-0.5 rounded-lg border border-rose-200">
                          <button
                            type="button"
                            onClick={() => handleDelete(addon.id)}
                            className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black"
                            title="ចុចដើម្បីបញ្ជាក់ការលុប"
                          >
                            យល់ព្រម
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="px-1 py-0.5 text-slate-500 text-[10px]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingId(addon.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="លុបមុខនេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Restock Drawer */}
                  {isRestocking && (
                    <div className="p-2 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between gap-1.5 animate-in fade-in duration-150">
                      <span className="text-[10px] font-bold text-emerald-900 flex items-center gap-1">
                        <PackagePlus className="w-3 h-3 text-emerald-600" />
                        <span>ថែមស្តុកភ្លាមៗ:</span>
                      </span>
                      <div className="flex items-center gap-1">
                        {[10, 20, 50].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handleQuickRestock(addon.id, amt)}
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer active:scale-95 shadow-2xs"
                          >
                            +{amt}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setRestockingId(null)}
                          className="p-0.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add to POS Cart Trigger */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">
                      {qtyInCart > 0 ? (
                        <span className="text-pink-600 font-black">
                          ក្នុងកន្ត្រក៖ {qtyInCart} មុខ
                        </span>
                      ) : (
                        'សម្រាប់បន្ថែមក្នុងវិក្កយបត្រ'
                      )}
                    </span>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleAddDirectToCart(addon)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : qtyInCart > 0
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-amber-50 hover:bg-pink-50 text-amber-900 hover:text-pink-600 border border-amber-200 hover:border-pink-300'
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>
                        {isOutOfStock
                          ? 'អស់ស្តុក'
                          : qtyInCart > 0
                          ? `+ ថែមទៀត (x${qtyInCart})`
                          : '+ ដាក់កន្ត្រក'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {partyAddons.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">មិនទាន់មានមុខទំនិញពិធីនៅឡើយទេ</p>
              <p className="text-[11px] mt-1">សូមចុចប៊ូតុង "+ ថែមមុខទំនិញថ្មី" ខាងលើដើម្បីចាប់ផ្តើម</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            💡 ទិន្នន័យគ្រឿងបន្ថែមនឹងធ្វើសមកាលកម្ម (Sync) ទៅកាន់ Customer Portal និងទូរស័ព្ទស្វ័យប្រវត្ត
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
