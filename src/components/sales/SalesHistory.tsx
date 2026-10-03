import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { CompletedSale } from '../../types';
import { ReceiptModal } from '../pos/ReceiptModal';
import { AddPastSaleModal } from './AddPastSaleModal';
import { EditSaleModal } from './EditSaleModal';
import { soundFx } from '../../utils/audio';

export const SalesHistory: React.FC = () => {
  const { sales, expenses, deleteSale, clearAllSales, exchangeRate } = useBakery();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');

  // Modals state
  const [isAddPastOpen, setIsAddPastOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<CompletedSale | null>(null);
  const [viewingReceiptSale, setViewingReceiptSale] = useState<CompletedSale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<CompletedSale | null>(null);
  const [restoreStockOnDelete, setRestoreStockOnDelete] = useState<boolean>(true);
  const [isConfirmClearAllSales, setIsConfirmClearAllSales] = useState(false);

  // Helper to extract local YYYY-MM-DD
  const getLocalDateStr = (d?: string | Date) => {
    if (!d) return '';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) {
      return d.trim();
    }
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return String(d).slice(0, 10);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getLocalDateStr(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateStr(yesterday);
  const currentMonthStr = todayStr.slice(0, 7);

  // Date-filtered sales (strictly updates summary cards according to selected date/month)
  const dateFilteredSales = useMemo(() => {
    return sales.filter((s) => {
      const saleDate = getLocalDateStr(s.createdAt);
      if (dateFilter === 'today') return saleDate === todayStr;
      if (dateFilter === 'yesterday') return saleDate === yesterdayStr;
      if (dateFilter === 'month') return saleDate.slice(0, 7) === currentMonthStr;
      if (dateFilter === 'custom' && customDate) return saleDate === customDate;
      return true;
    });
  }, [sales, dateFilter, customDate, todayStr, yesterdayStr, currentMonthStr]);

  // Date-filtered expenses (for net profit calculation of that specific period)
  const dateFilteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const expDate = getLocalDateStr(e.date || e.createdAt);
      if (dateFilter === 'today') return expDate === todayStr;
      if (dateFilter === 'yesterday') return expDate === yesterdayStr;
      if (dateFilter === 'month') return expDate.slice(0, 7) === currentMonthStr;
      if (dateFilter === 'custom' && customDate) return expDate === customDate;
      return true;
    });
  }, [expenses, dateFilter, customDate, todayStr, yesterdayStr, currentMonthStr]);

  // Financial totals calculated strictly according to selected date period
  const totalSalesKhr = useMemo(
    () => dateFilteredSales.reduce((sum, s) => sum + s.totalKhr, 0),
    [dateFilteredSales]
  );
  const totalSalesUsd = useMemo(
    () => dateFilteredSales.reduce((sum, s) => sum + s.totalUsd, 0),
    [dateFilteredSales]
  );

  const totalExpensesKhr = useMemo(
    () =>
      dateFilteredExpenses.reduce(
        (sum, exp) => sum + (exp.amountKhr ?? Math.round(exp.amountUsd * exchangeRate)),
        0
      ),
    [dateFilteredExpenses, exchangeRate]
  );
  const totalExpensesUsd = useMemo(
    () => dateFilteredExpenses.reduce((sum, exp) => sum + exp.amountUsd, 0),
    [dateFilteredExpenses]
  );

  const netProfitKhr = totalSalesKhr - totalExpensesKhr;
  const netProfitUsd = totalSalesUsd - totalExpensesUsd;

  const periodLabelKh = useMemo(() => {
    if (dateFilter === 'today') return 'ថ្ងៃនេះ';
    if (dateFilter === 'yesterday') return 'ម្សិលមិញ';
    if (dateFilter === 'month') return 'ខែនេះ';
    if (dateFilter === 'custom' && customDate) return `ថ្ងៃទី ${customDate}`;
    return 'សរុបទាំងអស់';
  }, [dateFilter, customDate]);

  const filteredSales = useMemo(() => {
    return dateFilteredSales.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        s.orderNumber.toLowerCase().includes(q) ||
        s.cashierName.toLowerCase().includes(q) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        s.items.some((item) => item.nameKh.toLowerCase().includes(q))
      );
    });
  }, [dateFilteredSales, searchQuery]);

  // Export CSV
  const handleExportCsv = () => {
    const csvRows = [
      ['OrderNumber', 'Date', 'Customer', 'Cashier', 'PaymentMethod', 'TotalKHR', 'TotalUSD', 'Notes'].join(','),
      ...sales.map((s) =>
        [
          s.orderNumber,
          s.createdAt,
          `"${s.customerName || 'N/A'}"`,
          `"${s.cashierName}"`,
          s.paymentMethod,
          s.totalKhr,
          s.totalUsd.toFixed(2),
          `"${s.notes || ''}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakery-sales-history-${todayStr}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>🧾</span>
            <span>ប្រវត្តិការលក់ & វិក្កយបត្រ (Sales History)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            មើលវិក្កយបត្រ, កែប្រែទិន្នន័យលក់, និងបញ្ចូលការលក់កន្លងមក (គិតជាលុយខ្មែរមុន)
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Clear All Sales Button */}
          {sales.length > 0 && (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsConfirmClearAllSales(true);
              }}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="សម្អាតប្រវត្តិវិក្កយបត្រទាំងអស់"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>សម្អាតប្រវត្តិលក់</span>
            </button>
          )}

          {/* Add Past Sale Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              setIsAddPastOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-600/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ បញ្ចូលការលក់កន្លងមក</span>
          </button>
        </div>
      </div>

      {/* Summary Cards - KHR ៛ FIRST (Dynamically updates with selected Date/Month) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ចំណូលលក់សរុប (គិតជាលុយរៀល)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-pink-50 text-pink-700 border border-pink-100">
              {periodLabelKh}
            </span>
          </div>
          <div className="text-2xl font-black text-pink-600 tracking-tight">
            {totalSalesKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            ~ ${totalSalesUsd.toFixed(2)} USD
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ចំនួនវិក្កយបត្រលក់សរុប
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
              {periodLabelKh}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">
            {dateFilteredSales.length} វិក្កយបត្រ
          </div>
          <div className="text-xs text-emerald-600 font-semibold">
            {dateFilter === 'all' ? 'រួមទាំងការលក់កន្លងមក' : `វិក្កយបត្រលក់ (${periodLabelKh})`}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>ប្រាក់ចំណេញសុទ្ធ (Net Profit)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              netProfitKhr >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {netProfitKhr >= 0 ? 'ចំណេញ' : 'ខាត'} • {periodLabelKh}
            </span>
          </span>
          <div className={`text-2xl font-black tracking-tight ${
            netProfitKhr >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {netProfitKhr >= 0 ? '+' : ''}{netProfitKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {netProfitUsd >= 0 ? 'ចំណេញ៖' : 'ខាត៖'} ~ ${netProfitUsd >= 0 ? '+' : ''}{netProfitUsd.toFixed(2)} USD (ដកចំណាយ {periodLabelKh})
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-white/90 p-1.5 rounded-2xl border border-rose-100 shadow-2xs flex-wrap">
          {[
            { id: 'all', label: `ទាំងអស់ (${sales.length})` },
            { id: 'today', label: 'ថ្ងៃនេះ' },
            { id: 'yesterday', label: 'ម្សិលមិញ' },
            { id: 'month', label: 'ខែនេះ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playPop();
                setDateFilter(tab.id as any);
                setCustomDate('');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === tab.id && !customDate
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Custom Date Picker */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                const val = e.target.value;
                setCustomDate(val);
                if (val) {
                  soundFx.playPop();
                  setDateFilter('custom');
                } else {
                  setDateFilter('all');
                }
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                dateFilter === 'custom' && customDate
                  ? 'bg-pink-50 border-pink-400 text-pink-700 font-black'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
              title="ជ្រើសរើសថ្ងៃជាក់លាក់"
            />
            {customDate && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setCustomDate('');
                  setDateFilter('all');
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold px-1"
                title="លុបការជ្រើសរើសថ្ងៃ"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ, អតិថិជន..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-white rounded-3xl border border-rose-100/90 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="p-4">លេខវិក្កយបត្រ</th>
                <th className="p-4">កាលបរិច្ឆេទ & ម៉ោង</th>
                <th className="p-4">អតិថិជន</th>
                <th className="p-4">មុខទំនិញ</th>
                <th className="p-4">តម្លៃសរុប (៛ KHR)</th>
                <th className="p-4">តម្លៃសរុប ($ USD)</th>
                <th className="p-4">ទូទាត់ & បេឡាធិការ</th>
                <th className="p-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">គ្មានទិន្នន័យការលក់ក្នុងចន្លោះពេលនេះទេ</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ចុចប៊ូតុង «+ បញ្ចូលការលក់កន្លងមក» ដើម្បីកត់ត្រាទិន្នន័យចាស់ៗ
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const saleDate = new Date(sale.createdAt);
                  const formattedDate = !isNaN(saleDate.getTime())
                    ? saleDate.toLocaleString('km-KH')
                    : sale.createdAt;

                  return (
                    <tr key={sale.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="p-4 font-mono font-black text-slate-900">
                        {sale.orderNumber}
                      </td>

                      <td className="p-4 text-slate-600">
                        {formattedDate}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800">
                          {sale.customerName || 'អតិថិជនទូទៅ'}
                        </div>
                      </td>

                      <td className="p-4 max-w-xs truncate">
                        {sale.items.map((i) => `${i.nameKh} (x${i.quantity})`).join(', ')}
                      </td>

                      {/* KHR FIRST in prominent bold */}
                      <td className="p-4 font-black text-pink-600 text-sm">
                        {sale.totalKhr.toLocaleString()} ៛
                      </td>

                      {/* USD SECOND */}
                      <td className="p-4 text-slate-500 font-bold">
                        ${sale.totalUsd.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{sale.paymentMethod}</div>
                        <div className="text-[10px] text-slate-400">{sale.cashierName}</div>
                      </td>

                      {/* Actions: View/Print, Edit, Delete */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View/Print Receipt */}
                          <button
                            type="button"
                            title="មើលវិក្កយបត្រ"
                            onClick={() => {
                              soundFx.playPop();
                              setViewingReceiptSale(sale);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>វិក្កយបត្រ</span>
                          </button>

                          {/* Edit Sale */}
                          <button
                            type="button"
                            title="កែប្រែការលក់"
                            onClick={() => {
                              soundFx.playPop();
                              setEditingSale(sale);
                            }}
                            className="p-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-pink-600" />
                            <span>កែប្រែ</span>
                          </button>

                          {/* Delete Sale */}
                          <button
                            type="button"
                            title="លុបការលក់"
                            onClick={() => {
                              soundFx.playPop();
                              setRestoreStockOnDelete(true);
                              setSaleToDelete(sale);
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-xl transition-colors cursor-pointer border border-rose-200/60 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Add Past Sale */}
      <AddPastSaleModal
        isOpen={isAddPastOpen}
        onClose={() => setIsAddPastOpen(false)}
      />

      {/* Modal to Edit Sale */}
      <EditSaleModal
        sale={editingSale}
        isOpen={!!editingSale}
        onClose={() => setEditingSale(null)}
      />

      {/* Modal to View/Print Receipt */}
      <ReceiptModal
        isOpen={!!viewingReceiptSale}
        sale={viewingReceiptSale}
        onClose={() => setViewingReceiptSale(null)}
      />

      {/* In-App Modal to Confirm Delete Single Sale (Touch Friendly, Portal to Body) */}
      {saleToDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base">លុបវិក្កយបត្រលក់?</h3>
                <p className="text-xs text-slate-400">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-1 text-xs text-slate-700">
              <div className="font-bold text-rose-700 text-sm">{saleToDelete.orderNumber}</div>
              <div className="text-[11px] text-slate-500">
                អតិថិជន៖ <span className="font-semibold text-slate-800">{saleToDelete.customerName || 'អតិថិជនទូទៅ'}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                កាលបរិច្ឆេទ៖ <span className="font-semibold text-slate-800">{saleToDelete.createdAt.slice(0, 10)}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                តម្លៃសរុប៖ <span className="font-black text-pink-600">{saleToDelete.totalKhr.toLocaleString()} ៛ (${saleToDelete.totalUsd.toFixed(2)})</span>
              </div>

              {/* Items in this Sale */}
              {saleToDelete.items && saleToDelete.items.length > 0 && (
                <div className="pt-2 mt-2 border-t border-rose-200/60">
                  <div className="text-[11px] font-bold text-slate-600 mb-1">មុខទំនិញក្នុងវិក្កយបត្រ៖</div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                    {saleToDelete.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] text-slate-600">
                        <span className="truncate max-w-[190px]">{it.nameKh || it.nameEn || 'ទំនិញ'}</span>
                        <span className="font-bold font-mono text-slate-800">x{it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox Option 2: Restore Stock to Inventory */}
            {saleToDelete.items && saleToDelete.items.length > 0 && (
              <label className="flex items-start gap-3 p-3 bg-amber-50/90 border border-amber-200 rounded-2xl cursor-pointer select-none transition-all hover:bg-amber-100/70">
                <input
                  type="checkbox"
                  checked={restoreStockOnDelete}
                  onChange={(e) => setRestoreStockOnDelete(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-pink-600 focus:ring-pink-500 border-slate-300 accent-pink-600 cursor-pointer shrink-0"
                />
                <div className="text-left">
                  <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <span>📦 ត្រឡប់ចំនួនទំនិញចូលស្តុកវិញ</span>
                  </div>
                  <div className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                    {restoreStockOnDelete ? (
                      <>
                        បូក{' '}
                        <span className="font-bold underline">
                          {saleToDelete.items.reduce((sum, it) => sum + it.quantity, 0)} មុខទំនិញ
                        </span>{' '}
                        ចូលស្តុកវិញដោយស្វ័យប្រវត្តិ
                      </>
                    ) : (
                      <span className="text-rose-600 font-bold">
                        ⚠️ មិនត្រឡប់ចូលស្តុកវិញទេ (ចាត់ទុកជាទំនិញខូច ឬបាត់បង់)
                      </span>
                    )}
                  </div>
                </div>
              </label>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playSuccess();
                  deleteSale(saleToDelete.id, restoreStockOnDelete);
                  setSaleToDelete(null);
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>យល់ព្រមលុប</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* In-App Modal to Confirm Clear All Sales History (Portal to Body) */}
      {isConfirmClearAllSales && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base">សម្អាតប្រវត្តិលក់ទាំងអស់?</h3>
                <p className="text-xs text-slate-400">លុបវិក្កយបត្រទាំងអស់ ({sales.length} វិក្កយបត្រ)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              តើលោកអ្នកពិតជាចង់សម្អាត និងលុបប្រវត្តិវិក្កយបត្រលក់ទាំងអស់ចេញពីប្រព័ន្ធមែនទេ?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmClearAllSales(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playSuccess();
                  clearAllSales();
                  setIsConfirmClearAllSales(false);
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>សម្អាតទាំងអស់</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
