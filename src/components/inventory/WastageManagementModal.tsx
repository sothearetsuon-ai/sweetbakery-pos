import React, { useState, useMemo } from 'react';
import {
  X,
  Trash2,
  AlertTriangle,
  TrendingDown,
  Plus,
  History,
  Calendar,
  Sparkles,
  CheckCircle2,
  DollarSign,
  PackageX,
  FileSpreadsheet,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { WastageReason, WastageRecord } from '../../types';
import { soundFx } from '../../utils/audio';
import { formatKhr, roundKhr } from '../../utils/currencyUtils';

const formatUsd = (val: number | undefined | null) => `$${Number(val || 0).toFixed(2)}`;

interface WastageManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REASON_LABELS: Record<WastageReason, { labelKh: string; color: string }> = {
  DAY_END_LEFTOVER: { labelKh: 'សល់ចុងថ្ងៃ (Day-End Leftover)', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  BURNT_OVERBAKED: { labelKh: 'ខ្លោច/ខូចទ្រង់ទ្រាយពេលដុត', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  EXPIRED: { labelKh: 'ផុតកំណត់ / ផ្អូម', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  DAMAGED_DISPLAY: { labelKh: 'ខូចខាតពេលតាំងបង្ហាញ / ធ្លាក់', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  TASTING_SAMPLE: { labelKh: 'សម្រាប់ភ្ញៀវភ្លក្ស / តេស្ត', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  OTHER: { labelKh: 'មូលហេតុផ្សេងៗ', color: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export const WastageManagementModal: React.FC<WastageManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    products,
    wastageRecords,
    recordWastage,
    deleteWastageRecord,
    currentStaff,
    exchangeRate,
  } = useBakery();

  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<WastageReason>('DAY_END_LEFTOVER');
  const [recordedBy, setRecordedBy] = useState<string>(currentStaff?.name || 'បុគ្គលិក Staff');
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter for history
  const [filterReason, setFilterReason] = useState<string>('ALL');

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const unitCostUsd = selectedProduct?.costPriceUsd || (selectedProduct ? selectedProduct.priceUsd * 0.5 : 0);
  const totalLossUsd = Math.round(unitCostUsd * quantity * 100) / 100;
  const totalLossKhr = roundKhr(totalLossUsd * exchangeRate);

  // Calculate monthly stats
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthRecords = wastageRecords.filter((w) => w.date.startsWith(currentMonthPrefix));

  const totalLossMonthUsd = monthRecords.reduce((acc, curr) => acc + (curr.totalLossUsd || 0), 0);
  const totalLossMonthKhr = monthRecords.reduce((acc, curr) => acc + (curr.totalLossKhr || 0), 0);
  const totalQtyWasted = monthRecords.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    soundFx.playPop();

    const recordData: Omit<WastageRecord, 'id' | 'createdAt'> = {
      productId: selectedProduct.id,
      productNameKh: selectedProduct.nameKh,
      productNameEn: selectedProduct.nameEn,
      categoryName: selectedProduct.categoryId,
      quantity,
      unit: selectedProduct.unit || 'ដុំ',
      unitCostUsd,
      unitCostKhr: roundKhr(unitCostUsd * exchangeRate),
      totalLossUsd,
      totalLossKhr,
      reason,
      recordedBy,
      notes: notes.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    recordWastage(recordData);
    soundFx.playSuccess();
    setFeedback(`បានកត់ត្រានំខូចខាត ${selectedProduct.nameKh} ចំនួន ${quantity} ${selectedProduct.unit} រួចរាល់!`);
    
    // Reset form
    setQuantity(1);
    setNotes('');
    setTimeout(() => {
      setFeedback(null);
      setActiveTab('history');
    }, 1200);
  };

  const filteredHistory = wastageRecords.filter((r) => {
    if (filterReason === 'ALL') return true;
    return r.reason === filterReason;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.15)] rounded-3xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-purple-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <PackageX className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>កត់ត្រានំសល់ & ខូចខាត</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  Bakery Wastage & Write-Off
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                កត់ត្រានំសល់ចុងថ្ងៃ នំខ្លោចខូចទ្រង់ទ្រាយ គណនាការខាតបង់ និងកាត់ស្តុកស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 py-3.5 bg-slate-50/70 border-b border-slate-100">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">ខាតបង់ខែនេះ ($ USD)</p>
              <p className="text-base font-black text-rose-600">{formatUsd(totalLossMonthUsd)}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">ខាតបង់ខែនេះ (៛ KHR)</p>
              <p className="text-base font-black text-amber-700">{formatKhr(totalLossMonthKhr)}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <PackageX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">ចំនួននំខូចខាតខែនេះ</p>
              <p className="text-base font-black text-purple-700">{totalQtyWasted} នំ/ដុំ</p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-white">
          <button
            onClick={() => setActiveTab('record')}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'record'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>កត់ត្រាការខូចខាតថ្មី (New Entry)</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'history'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ប្រវត្តិខូចខាតទាំងអស់ ({wastageRecords.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {feedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {activeTab === 'record' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ជ្រើសរើសមុខនំ / ទំនិញ (Select Pastry) *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameKh} (ស្តុក: {p.stockQty} {p.unit} - ថ្លៃដើម: {formatUsd(p.costPriceUsd || p.priceUsd * 0.5)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ចំនួនខូចខាត (Quantity Wasted) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                    />
                    <span className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm">
                      {selectedProduct?.unit || 'ដុំ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason & Staff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    មូលហេតុនៃការខូចខាត (Wastage Reason) *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as WastageReason)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                  >
                    {Object.entries(REASON_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.labelKh}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    អ្នកកត់ត្រា (Recorded By) *
                  </label>
                  <input
                    type="text"
                    value={recordedBy}
                    onChange={(e) => setRecordedBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Cost Loss Estimation Card */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                    តម្លៃខាតបង់សរុប (Estimated Cost Loss)
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-rose-600">{formatUsd(totalLossUsd)}</span>
                    <span className="text-sm font-bold text-slate-600">({formatKhr(totalLossKhr)})</span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>ថ្លៃដើមរាយ: {formatUsd(unitCostUsd)} / {selectedProduct?.unit}</p>
                  <p className="text-rose-600 font-semibold mt-0.5">ស្តុកនឹងត្រូវកាត់ចេញ: -{quantity} {selectedProduct?.unit}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  កំណត់ចំណាំបន្ថែម (Notes / Description)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ សល់ម៉ោង ៩:០០ យប់, ឬ ខ្លោចពេលកម្តៅខ្លាំង..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <PackageX className="w-4 h-4" />
                  <span>បញ្ជាក់ការកត់ត្រា & កាត់ស្តុក</span>
                </button>
              </div>
            </form>
          ) : (
            /* History Table */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">តម្រងមូលហេតុ:</span>
                  <select
                    value={filterReason}
                    onChange={(e) => setFilterReason(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="ALL">ទាំងអស់ (All Reasons)</option>
                    {Object.entries(REASON_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.labelKh}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  បង្ហាញ {filteredHistory.length} កំណត់ត្រា
                </span>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <PackageX className="w-12 h-12 mx-auto stroke-1 opacity-50 mb-2" />
                  <p className="text-sm font-medium">គ្មានកំណត់ត្រាខូចខាតទេ</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="divide-y divide-slate-100">
                    {filteredHistory.map((item) => {
                      const reasonMeta = REASON_LABELS[item.reason] || REASON_LABELS.OTHER;
                      return (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-sm">{item.productNameKh}</span>
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold">
                                -{item.quantity} {item.unit}
                              </span>
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${reasonMeta.color}`}>
                                {reasonMeta.labelKh}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span>{item.date}</span>
                              <span>•</span>
                              <span>កត់ត្រាដោយ: {item.recordedBy}</span>
                              {item.notes && (
                                <>
                                  <span>•</span>
                                  <span className="italic">"{item.notes}"</span>
                                </>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-black text-rose-600 text-sm">{formatUsd(item.totalLossUsd)}</span>
                              <p className="text-[11px] text-slate-500 font-medium">({formatKhr(item.totalLossKhr)})</p>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm(`តើអ្នកពិតជាចង់លុបកំណត់ត្រា ${item.productNameKh} នេះមែនទេ?`)) {
                                  deleteWastageRecord(item.id);
                                  soundFx.playPop();
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="លុប"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
