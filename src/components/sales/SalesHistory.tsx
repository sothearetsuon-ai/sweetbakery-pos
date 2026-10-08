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
  X,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { CompletedSale } from '../../types';
import { ReceiptModal } from '../pos/ReceiptModal';
import { AddPastSaleModal } from './AddPastSaleModal';
import { EditSaleModal } from './EditSaleModal';
import { soundFx } from '../../utils/audio';
import { formatDateTimeDMY, formatDateDMY } from '../../utils/dateUtils';

export const SalesHistory: React.FC = () => {
  const { sales, expenses, deleteSale, deleteSalesByDateRange, clearAllSales, exchangeRate } = useBakery();

  const [searchQuery, setSearchQuery] = useState('');
  // Always default to current month (ខែជាក់ស្តែងជាប្រចាំ)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  // Modals state
  const [isAddPastOpen, setIsAddPastOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<CompletedSale | null>(null);
  const [viewingReceiptSale, setViewingReceiptSale] = useState<CompletedSale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<CompletedSale | null>(null);
  const [restoreStockOnDelete, setRestoreStockOnDelete] = useState<boolean>(true);
  const [isConfirmClearAllSales, setIsConfirmClearAllSales] = useState(false);
  const [cleanupMode, setCleanupMode] = useState<'CURRENT_FILTER' | 'CUSTOM_RANGE' | 'OLDER_THAN' | 'ALL'>('CURRENT_FILTER');
  const [cleanupStartDate, setCleanupStartDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [cleanupEndDate, setCleanupEndDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [cleanupOlderDays, setCleanupOlderDays] = useState<number>(30);
  const [cleanupRestoreStock, setCleanupRestoreStock] = useState<boolean>(true);

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
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = getLocalDateStr(sevenDaysAgo);
  const currentMonthStr = todayStr.slice(0, 7);

  // Date-filtered sales (strictly updates summary cards according to selected date/month/range)
  const dateFilteredSales = useMemo(() => {
    return sales.filter((s) => {
      const saleDate = getLocalDateStr(s.createdAt);
      if (dateFilter === 'today') return saleDate === todayStr;
      if (dateFilter === 'yesterday') return saleDate === yesterdayStr;
      if (dateFilter === 'week') return saleDate >= sevenDaysAgoStr && saleDate <= todayStr;
      if (dateFilter === 'month') return saleDate.slice(0, 7) === currentMonthStr;
      if (dateFilter === 'custom') {
        const start = customStartDate || '1970-01-01';
        const end = customEndDate || '2099-12-31';
        return saleDate >= start && saleDate <= end;
      }
      return true;
    });
  }, [sales, dateFilter, customStartDate, customEndDate, todayStr, yesterdayStr, sevenDaysAgoStr, currentMonthStr]);

  // Date-filtered expenses (for net profit calculation of that specific period)
  const dateFilteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const expDate = getLocalDateStr(e.date || e.createdAt);
      if (dateFilter === 'today') return expDate === todayStr;
      if (dateFilter === 'yesterday') return expDate === yesterdayStr;
      if (dateFilter === 'week') return expDate >= sevenDaysAgoStr && expDate <= todayStr;
      if (dateFilter === 'month') return expDate.slice(0, 7) === currentMonthStr;
      if (dateFilter === 'custom') {
        const start = customStartDate || '1970-01-01';
        const end = customEndDate || '2099-12-31';
        return expDate >= start && expDate <= end;
      }
      return true;
    });
  }, [expenses, dateFilter, customStartDate, customEndDate, todayStr, yesterdayStr, sevenDaysAgoStr, currentMonthStr]);

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
    if (dateFilter === 'week') return '៧ ថ្ងៃចុងក្រោយ';
    if (dateFilter === 'month') return 'ខែនេះ';
    if (dateFilter === 'custom') {
      if (customStartDate && customEndDate) {
        return `${formatDateDMY(customStartDate)} ដល់ ${formatDateDMY(customEndDate)}`;
      }
      return 'ចន្លោះកាលបរិច្ឆេទ';
    }
    return 'សរុបទាំងអស់';
  }, [dateFilter, customStartDate, customEndDate]);

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

  const targetSalesToClean = useMemo(() => {
    if (cleanupMode === 'CURRENT_FILTER') {
      return filteredSales;
    }
    if (cleanupMode === 'CUSTOM_RANGE') {
      return sales.filter((s) => {
        const d = (s.createdAt || '').split('T')[0];
        if (cleanupStartDate && d < cleanupStartDate) return false;
        if (cleanupEndDate && d > cleanupEndDate) return false;
        return true;
      });
    }
    if (cleanupMode === 'OLDER_THAN') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - cleanupOlderDays);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      return sales.filter((s) => {
        const d = (s.createdAt || '').split('T')[0];
        return d < cutoffStr;
      });
    }
    return sales;
  }, [cleanupMode, filteredSales, sales, cleanupStartDate, cleanupEndDate, cleanupOlderDays]);

  const cleanupTotalKhr = useMemo(() => {
    return targetSalesToClean.reduce((sum, s) => sum + (s.totalKhr || Math.round(s.totalUsd * exchangeRate)), 0);
  }, [targetSalesToClean, exchangeRate]);

  const cleanupTotalUsd = useMemo(() => {
    return targetSalesToClean.reduce((sum, s) => sum + s.totalUsd, 0);
  }, [targetSalesToClean]);

  const handleExecuteCleanupSales = () => {
    if (targetSalesToClean.length === 0) return;
    soundFx.playSuccess();
    if (cleanupMode === 'ALL') {
      clearAllSales();
    } else {
      deleteSalesByDateRange(undefined, undefined, targetSalesToClean.map((s) => s.id), cleanupRestoreStock);
    }
    setIsConfirmClearAllSales(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvRows = [
      ['OrderNumber', 'Date (DD/MM/YYYY)', 'Customer', 'Cashier', 'PaymentMethod', 'TotalKHR', 'TotalUSD', 'Notes'].join(','),
      ...sales.map((s) =>
        [
          s.orderNumber,
          `"${formatDateTimeDMY(s.createdAt)}"`,
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
    <div className="flex-1 min-h-0 min-w-0 flex flex-col p-3 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-6 pb-28 md:pb-8 overscroll-contain">
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
            className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ បញ្ចូលការលក់កន្លងមក</span>
          </button>
        </div>
      </div>

      {/* Summary Cards - KHR ៛ FIRST (Responsive 2 cols on mobile, 3 cols on tablet/desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              ចំណូលសរុប (៛)
            </span>
            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold bg-pink-50 text-pink-700 border border-pink-100">
              {periodLabelKh}
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-pink-600 tracking-tight">
            {totalSalesKhr.toLocaleString()} ៛
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate">
            ~ ${totalSalesUsd.toFixed(2)} USD
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              ចំណេញសុទ្ធ
            </span>
            <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
              netProfitKhr >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {netProfitKhr >= 0 ? 'ចំណេញ' : 'ខាត'}
            </span>
          </div>
          <div className={`text-lg sm:text-2xl font-black tracking-tight ${
            netProfitKhr >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {netProfitKhr >= 0 ? '+' : ''}{netProfitKhr.toLocaleString()} ៛
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate">
            ${netProfitUsd >= 0 ? '+' : ''}{netProfitUsd.toFixed(2)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs flex sm:flex-col justify-between sm:justify-start items-center sm:items-stretch space-y-0 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              ចំនួនវិក្កយបត្រ
            </span>
            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
              {periodLabelKh}
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">
            {dateFilteredSales.length} វិក្កយបត្រ
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-600 font-semibold hidden sm:block">
            {dateFilter === 'all' ? 'រួមទាំងការលក់កន្លងមក' : `វិក្កយបត្រលក់ (${periodLabelKh})`}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white/90 p-1.5 rounded-2xl border border-rose-100 shadow-2xs flex-wrap">
          {[
            { id: 'month', label: '🗓️ ខែនេះ' },
            { id: 'today', label: '☀️ ថ្ងៃនេះ' },
            { id: 'yesterday', label: '⏪ ម្សិលមិញ' },
            { id: 'week', label: '📆 ៧ ថ្ងៃចុងក្រោយ' },
            { id: 'all', label: `🌐 ទាំងអស់ (${sales.length})` },
            { id: 'custom', label: '🎯 ចន្លោះកាលបរិច្ឆេទ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playPop();
                setDateFilter(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Custom Date Range Picker (ចាប់ពីថ្ងៃទី ... ដល់ថ្ងៃទី ...) */}
          <div className={`flex items-center gap-2 pl-2 border-l border-slate-200 flex-wrap py-0.5 ${
            dateFilter === 'custom' ? 'bg-pink-50/60 rounded-xl px-2 py-1' : ''
          }`}>
            <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-600">ចាប់ពីថ្ងៃទី៖</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomStartDate(val);
                  if (val) {
                    soundFx.playPop();
                    setDateFilter('custom');
                  }
                }}
                className="px-2 py-1 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-800 hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer"
                title="ចាប់ពីថ្ងៃទី"
              />
            </div>

            <span className="text-slate-300 text-xs hidden sm:inline">➔</span>

            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-600">ដល់ថ្ងៃទី៖</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomEndDate(val);
                  if (val) {
                    soundFx.playPop();
                    setDateFilter('custom');
                  }
                }}
                className="px-2 py-1 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-800 hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer"
                title="ដល់ថ្ងៃទី"
              />
            </div>

            {dateFilter === 'custom' && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setDateFilter('all');
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 hover:bg-rose-100 rounded-md cursor-pointer transition-colors"
                title="បង្ហាញទាំងអស់"
              >
                ✕ ទាំងអស់
              </button>
            )}
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ, អតិថិជន..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Section Header: Sales Records Count */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black text-slate-800">
            បញ្ជីវិក្កយបត្រលក់ ({filteredSales.length})
          </span>
          <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
            {periodLabelKh}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredSales.length === 0 ? (
        <div className="bg-white rounded-3xl border border-rose-100/90 shadow-sm p-8 sm:p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 text-rose-300 mx-auto mb-2.5" />
          <p className="font-black text-slate-700 text-sm">គ្មានទិន្នន័យការលក់ក្នុងចន្លោះពេលនេះទេ</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            លោកអ្នកអាចជ្រើសរើសចន្លោះពេលផ្សេង ឬចុចប៊ូតុងខាងក្រោមដើម្បីកត់ត្រាការលក់កន្លងមក
          </p>
          <button
            onClick={() => {
              soundFx.playPop();
              setIsAddPastOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ បញ្ចូលការលក់កន្លងមក</span>
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Cards View (Visible on Small Screens / Phones < 768px) */}
          <div className="space-y-3 block md:hidden">
            {filteredSales.map((sale) => {
              const formattedDate = formatDateTimeDMY(sale.createdAt);

              return (
                <div
                  key={sale.id}
                  className="bg-white rounded-2xl p-3.5 border border-rose-100/90 shadow-xs space-y-2.5 hover:border-pink-300 transition-all"
                >
                  {/* Card Header: Order Number, Date, Payment Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <div className="font-mono font-black text-xs text-pink-600">
                        {sale.orderNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formattedDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg bg-pink-50 text-pink-700 border border-pink-200">
                        {sale.paymentMethod || 'CASH'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[100px]">
                        👤 {sale.cashierName}
                      </div>
                    </div>
                  </div>

                  {/* Card Body: Customer & Items */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-400 text-[11px]">អតិថិជន៖</span>
                      <span className="font-bold text-slate-800">
                        {sale.customerName || 'អតិថិជនទូទៅ'}
                      </span>
                    </div>

                    <div className="bg-slate-50/80 rounded-xl p-2 text-[11px] text-slate-600 border border-slate-100">
                      <span className="font-semibold text-slate-500">មុខទំនិញ៖ </span>
                      <span>
                        {sale.items.map((i) => `${i.nameKh} (x${i.quantity})`).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Total Price (KHR First) & Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-pink-600 leading-tight">
                        {sale.totalKhr.toLocaleString()} ៛
                      </div>
                      <div className="text-[11px] text-slate-500 font-bold">
                        ${sale.totalUsd.toFixed(2)} USD
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setViewingReceiptSale(sale);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        title="មើលវិក្កយបត្រ"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>វិក្កយបត្រ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setEditingSale(sale);
                        }}
                        className="p-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        title="កែប្រែ"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-pink-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setRestoreStockOnDelete(true);
                          setSaleToDelete(sale);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-xl transition-colors cursor-pointer border border-rose-200/60"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (Visible on Tablet/Desktop Screens >= 768px) */}
          <div className="hidden md:flex bg-white rounded-3xl border border-rose-100/90 shadow-sm overflow-hidden flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 min-w-[760px]">
                <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                  <tr>
                    <th className="p-4">លេខវិក្កយបត្រ</th>
                    <th className="p-4">កាលបរិច្ឆេទ & ម៉ោង (DD/MM/YYYY)</th>
                    <th className="p-4">អតិថិជន</th>
                    <th className="p-4">មុខទំនិញ</th>
                    <th className="p-4">តម្លៃសរុប (៛ KHR)</th>
                    <th className="p-4">តម្លៃសរុប ($ USD)</th>
                    <th className="p-4">ទូទាត់ & បេឡាធិការ</th>
                    <th className="p-4 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSales.map((sale) => {
                    const formattedDate = formatDateTimeDMY(sale.createdAt);

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
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
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
                              className="p-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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
                កាលបរិច្ឆេទ៖ <span className="font-semibold text-slate-800">{formatDateDMY(saleToDelete.createdAt)}</span>
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

      {/* In-App Modal to Confirm Clear Sales History with Date Filtering (Portal to Body) */}
      {isConfirmClearAllSales && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">សម្អាតប្រវត្តិលក់ (Sales Cleanup)</h3>
                  <p className="text-xs text-slate-500">ជ្រើសរើសជម្រើសសម្អាតតាមថ្ងៃខែ តាមការច្រោះ ឬទាំងអស់</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmClearAllSales(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setCleanupMode('CURRENT_FILTER')}
                className={`py-2 px-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  cleanupMode === 'CURRENT_FILTER'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <span>🎯 តាមការច្រោះ</span>
                <span className="text-[10px] opacity-75">({filteredSales.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCleanupMode('CUSTOM_RANGE')}
                className={`py-2 px-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  cleanupMode === 'CUSTOM_RANGE'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <span>📅 តាមចន្លោះថ្ងៃ</span>
                <span className="text-[10px] opacity-75">ជ្រើសរើស</span>
              </button>

              <button
                type="button"
                onClick={() => setCleanupMode('OLDER_THAN')}
                className={`py-2 px-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  cleanupMode === 'OLDER_THAN'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <span>⏳ ចាស់ជាង</span>
                <span className="text-[10px] opacity-75">{cleanupOlderDays} ថ្ងៃ</span>
              </button>

              <button
                type="button"
                onClick={() => setCleanupMode('ALL')}
                className={`py-2 px-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  cleanupMode === 'ALL'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <span>⚠️ ទាំងអស់</span>
                <span className="text-[10px] opacity-75">({sales.length})</span>
              </button>
            </div>

            {/* Mode configs */}
            {cleanupMode === 'CURRENT_FILTER' && (
              <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-black">
                  <Filter className="w-3.5 h-3.5" />
                  <span>លក្ខខណ្ឌកំពុងច្រោះលើតារាងលក់</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  <p>• <strong>កាលបរិច្ឆេទ:</strong> {periodLabelKh}</p>
                  {searchQuery && (
                    <p>• <strong>ពាក្យស្វែងរក:</strong> "{searchQuery}"</p>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  💡 នឹងសម្អាតតែទិន្នន័យវិក្កយបត្រចំនួន <strong>{filteredSales.length}</strong> វិក្កយបត្រ ដែលត្រូវគ្នានឹងការច្រោះខាងលើប៉ុណ្ណោះ។
                </p>
              </div>
            )}

            {cleanupMode === 'CUSTOM_RANGE' && (
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700">ជ្រើសរើសចន្លោះថ្ងៃ (Date Range)</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setCleanupStartDate(todayStr);
                        setCleanupEndDate(todayStr);
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      ថ្ងៃនេះ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCleanupStartDate(yesterdayStr);
                        setCleanupEndDate(yesterdayStr);
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      ម្សិលមិញ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCleanupStartDate(sevenDaysAgoStr);
                        setCleanupEndDate(todayStr);
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      ៧ ថ្ងៃ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        setCleanupStartDate(`${y}-${m}-01`);
                        setCleanupEndDate(todayStr);
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      ខែនេះ
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      ចាប់ពីថ្ងៃ (Start Date)
                    </label>
                    <input
                      type="date"
                      value={cleanupStartDate}
                      onChange={(e) => setCleanupStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      ដល់ថ្ងៃ (End Date)
                    </label>
                    <input
                      type="date"
                      value={cleanupEndDate}
                      onChange={(e) => setCleanupEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {cleanupMode === 'OLDER_THAN' && (
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-black text-slate-700 block">
                  លុបតែវិក្កយបត្រដែលចាស់ជាង៖
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { days: 30, label: '៣០ ថ្ងៃ' },
                    { days: 60, label: '៦០ ថ្ងៃ' },
                    { days: 90, label: '៩០ ថ្ងៃ' },
                    { days: 365, label: '១ ឆ្នាំ' },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => setCleanupOlderDays(preset.days)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        cleanupOlderDays === preset.days
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  💡 នឹងលុបវិក្កយបត្រទាំងអស់ដែលបានកត់ត្រាចាស់ជាង {cleanupOlderDays} ថ្ងៃមុន។
                </p>
              </div>
            )}

            {cleanupMode === 'ALL' && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-amber-800 text-xs font-black">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>ប្រុងប្រយ័ត្ន៖ សម្អាតប្រវត្តិវិក្កយបត្រទាំងអស់</span>
                </div>
                <p className="text-xs text-slate-600">
                  រាល់ប្រវត្តិវិក្កយបត្រលក់ទាំងអស់ចំនួន <strong>{sales.length}</strong> វិក្កយបត្រ នឹងត្រូវលុបចេញទាំងស្រុង។
                </p>
              </div>
            )}

            {/* Restore stock option */}
            <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={cleanupRestoreStock}
                onChange={(e) => setCleanupRestoreStock(e.target.checked)}
                className="w-4 h-4 rounded-md text-pink-600 focus:ring-pink-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-700">
                ស្ដារចំនួនស្តុកនំក្នុងឃ្លាំងឡើងវិញ (Restore Stock)
              </span>
            </label>

            {/* Live Impact Preview Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  ទិន្នន័យដែលនឹងត្រូវសម្អាត
                </span>
                <span className="text-base font-black text-rose-400">
                  {targetSalesToClean.length} វិក្កយបត្រ
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  ទឹកប្រាក់សរុប
                </span>
                <span className="text-sm font-black text-amber-300">
                  {cleanupTotalKhr.toLocaleString()} ៛
                </span>
                <span className="text-[10px] text-slate-300 ml-1.5 font-bold">
                  (${cleanupTotalUsd.toFixed(2)})
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmClearAllSales(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                disabled={targetSalesToClean.length === 0}
                onClick={handleExecuteCleanupSales}
                className={`flex-1 py-3 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                  targetSalesToClean.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25 cursor-pointer active:scale-95'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {targetSalesToClean.length === 0
                    ? 'គ្មានទិន្នន័យត្រូវលុប'
                    : `យល់ព្រមសម្អាត (${targetSalesToClean.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
