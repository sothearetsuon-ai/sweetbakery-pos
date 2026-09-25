import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  CalendarDays,
  Trash2,
  Download,
  Eye,
  X,
  FileText,
  Edit2,
  AlertTriangle,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { Expense, ExpenseCategory } from '../../types';
import { NewExpenseModal } from './NewExpenseModal';
import { soundFx } from '../../utils/audio';

type DateFilterPreset = 'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_MONTH' | 'CUSTOM';

export const ExpenseManagement: React.FC = () => {
  const { lang, expenses, deleteExpense, clearAllExpenses, sales, exchangeRate } = useBakery();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [receiptFilter, setReceiptFilter] = useState<'ALL' | 'WITH_RECEIPT' | 'WITHOUT_RECEIPT'>('ALL');
  const [previewReceiptImage, setPreviewReceiptImage] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isConfirmClearAll, setIsConfirmClearAll] = useState(false);

  // Date filtering state
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('ALL');
  const [customDate, setCustomDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Date helpers
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const thisMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const formatKhmerDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      if (!y || !m || !d) return dateStr;
      const monthNamesKh = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ];
      const mIdx = parseInt(m, 10) - 1;
      return `${parseInt(d, 10)} ${monthNamesKh[mIdx] || m} ${y}`;
    } catch {
      return dateStr;
    }
  };

  // Financial sums (All-time)
  const totalSalesUsd = sales.reduce((sum, s) => sum + s.totalUsd, 0);
  const totalSalesKhr = sales.reduce((sum, s) => sum + (s.totalKhr || Math.round(s.totalUsd * exchangeRate)), 0);
  const totalExpensesUsd = expenses.reduce((sum, e) => sum + e.amountUsd, 0);
  const totalExpensesKhr = expenses.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  const netProfitUsd = totalSalesUsd - totalExpensesUsd;
  const netProfitKhr = totalSalesKhr - totalExpensesKhr;

  // Category map
  const categoryLabels: Record<ExpenseCategory, { labelKh: string; color: string }> = {
    INGREDIENTS: { labelKh: '🥚 គ្រឿងផ្សំធ្វើនំ', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    PACKAGING: { labelKh: '📦 ប្រអប់ & វេចខ្ចប់', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    UTILITIES: { labelKh: '⚡ ទឹក ភ្លើង ហ្គាស', color: 'bg-orange-50 text-orange-800 border-orange-200' },
    SALARY: { labelKh: '👤 ប្រាក់ខែ & ថ្លៃឈ្នួល', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    RENT: { labelKh: '🏠 ថ្លៃជួលទីតាំង', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    MAINTENANCE: { labelKh: '🔧 ជួសជុលឧបករណ៍', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    MARKETING: { labelKh: '📢 ផ្សព្វផ្សាយ / Ads', color: 'bg-pink-50 text-pink-800 border-pink-200' },
    OTHER: { labelKh: '📌 ផ្សេងៗ', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchReceipt =
        receiptFilter === 'ALL' ||
        (receiptFilter === 'WITH_RECEIPT' && !!e.receiptImage) ||
        (receiptFilter === 'WITHOUT_RECEIPT' && !e.receiptImage);

      // Date matching
      let matchDate = true;
      if (datePreset === 'TODAY') {
        matchDate = e.date === todayStr;
      } else if (datePreset === 'YESTERDAY') {
        matchDate = e.date === yesterdayStr;
      } else if (datePreset === 'THIS_MONTH') {
        matchDate = !!e.date && e.date.startsWith(thisMonthStr);
      } else if (datePreset === 'CUSTOM') {
        matchDate = e.date === customDate;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.paidBy.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q));

      return matchCat && matchReceipt && matchDate && matchSearch;
    });
  }, [expenses, selectedCategory, receiptFilter, datePreset, customDate, todayStr, yesterdayStr, thisMonthStr, searchQuery]);

  // Filtered sums
  const filteredExpensesKhr = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  }, [filteredExpenses, exchangeRate]);

  const filteredExpensesUsd = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amountUsd, 0);
  }, [filteredExpenses]);

  const activeDateLabel = useMemo(() => {
    if (datePreset === 'ALL') return null;
    if (datePreset === 'TODAY') return `ថ្ងៃនេះ (${formatKhmerDate(todayStr)})`;
    if (datePreset === 'YESTERDAY') return `ម្សិលមិញ (${formatKhmerDate(yesterdayStr)})`;
    if (datePreset === 'THIS_MONTH') return `ខែនេះ (${thisMonthStr})`;
    return `ថ្ងៃទី ${formatKhmerDate(customDate)}`;
  }, [datePreset, todayStr, yesterdayStr, thisMonthStr, customDate]);

  // Export CSV
  const handleExportCsv = () => {
    const listToExport = filteredExpenses.length > 0 ? filteredExpenses : expenses;
    const csvRows = [
      ['Title', 'Category', 'Quantity', 'Unit', 'UnitPriceKHR', 'TotalKHR', 'TotalUSD', 'PaidBy', 'PaymentMethod', 'Date', 'Notes'].join(','),
      ...listToExport.map((e) =>
        [
          `"${e.title}"`,
          e.category,
          e.quantity ?? 1,
          `"${e.unit || ''}"`,
          e.unitPriceKhr ?? Math.round(e.amountKhr / (e.quantity || 1)),
          e.amountKhr,
          e.amountUsd.toFixed(2),
          `"${e.paidBy}"`,
          e.paymentMethod,
          e.date,
          `"${e.notes || ''}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateLabel = datePreset !== 'ALL' ? (datePreset === 'CUSTOM' ? customDate : datePreset.toLowerCase()) : 'all';
    a.download = `bakery-expenses-${dateLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>💸</span>
            <span>ផ្ទាំងគ្រប់គ្រងការចំណាយ (Expense Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            កត់ត្រាថ្លៃទិញគ្រឿងផ្សំ ប្រអប់នំ ទឹកភ្លើង ប្រាក់ខែ និងគណនាប្រាក់ចំណេញសុទ្ធ
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {expenses.length > 0 && (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsConfirmClearAll(true);
              }}
              className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="លុបកំណត់ត្រាចំណាយទាំងអស់ (Clear All Expenses)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>សម្អាតទាំងអស់</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-rose-600/25 flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ កត់ត្រាចំណាយ</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Expenses (Adapts when date filter is active) */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2 relative overflow-hidden">
          {datePreset !== 'ALL' && (
            <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl shadow-xs">
              តម្រងថ្ងៃសកម្ម
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {datePreset !== 'ALL' ? `ចំណាយ (${activeDateLabel})` : 'ការចំណាយសរុប (Expenses)'}
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-2xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            {(datePreset !== 'ALL' ? filteredExpensesKhr : totalExpensesKhr).toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            ~ ${(datePreset !== 'ALL' ? filteredExpensesUsd : totalExpensesUsd).toFixed(2)} USD (
            {datePreset !== 'ALL' ? filteredExpenses.length : expenses.length} ប្រតិបត្តិការ)
          </div>
          {datePreset !== 'ALL' && (
            <div className="text-[10px] text-slate-400 pt-1 border-t border-rose-50 flex items-center justify-between">
              <span>សរុបគ្រប់ពេល៖</span>
              <span className="font-bold text-slate-600">{totalExpensesKhr.toLocaleString()} ៛</span>
            </div>
          )}
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ចំណូលលក់សរុប (Revenue)
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {totalSalesKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            ~ ${totalSalesUsd.toFixed(2)} USD (ពីការលក់នៅបញ្ជរ និងនំកុម្ម៉ង់)
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ប្រាក់ចំណេញសុទ្ធពិតប្រាកដ (Net Profit)
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              netProfitUsd >= 0 ? 'text-blue-600' : 'text-rose-600'
            }`}
          >
            {netProfitKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {netProfitUsd >= 0 ? 'ចំណេញ៖' : 'ខាត៖'} ~ ${netProfitUsd.toFixed(2)} USD
          </div>
        </div>

        {/* Top Expense Category */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ចំណាយច្រើនជាងគេ
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-2xl">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-800 tracking-tight">
            ⚡ ទឹក ភ្លើង ហ្គាស
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            ប្រហែល 45% នៃការចំណាយសរុប
          </div>
        </div>
      </div>

      {/* Date Filter & Search Section */}
      <div className="bg-white p-4 rounded-3xl border border-rose-100/90 shadow-2xs space-y-3">
        {/* Date Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-2xl border border-rose-100 shrink-0">
              <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
              <span>មើលតាមថ្ងៃខែ៖</span>
            </div>

            {/* Quick Date Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setDatePreset('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  datePreset === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ទាំងអស់
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setDatePreset('TODAY');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  datePreset === 'TODAY'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                }`}
              >
                <span>⚡ ថ្ងៃនេះ</span>
                <span className="text-[10px] opacity-80">({expenses.filter((e) => e.date === todayStr).length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setDatePreset('YESTERDAY');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  datePreset === 'YESTERDAY'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>⏳ ម្សិលមិញ</span>
                <span className="text-[10px] opacity-80">({expenses.filter((e) => e.date === yesterdayStr).length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setDatePreset('THIS_MONTH');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  datePreset === 'THIS_MONTH'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>📅 ខែនេះ</span>
                <span className="text-[10px] opacity-80">({expenses.filter((e) => !!e.date && e.date.startsWith(thisMonthStr)).length})</span>
              </button>
            </div>
          </div>

          {/* Custom Date Picker */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 px-3 py-1.5 rounded-2xl transition-all shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-600 hidden sm:inline">រើសថ្ងៃជាក់លាក់៖</span>
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  if (e.target.value) {
                    soundFx.playPop();
                    setCustomDate(e.target.value);
                    setDatePreset('CUSTOM');
                  }
                }}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
              {datePreset === 'CUSTOM' && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setDatePreset('ALL');
                  }}
                  className="p-0.5 hover:bg-rose-100 text-rose-500 rounded-md transition-colors cursor-pointer"
                  title="បង្ហាញទាំងអស់"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category & Receipt Pills & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Receipt Filter Bar */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 text-xs shadow-2xs">
              <button
                onClick={() => {
                  soundFx.playPop();
                  setReceiptFilter('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  receiptFilter === 'ALL'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ទាំងអស់ ({expenses.length})
              </button>
              <button
                onClick={() => {
                  soundFx.playPop();
                  setReceiptFilter('WITH_RECEIPT');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  receiptFilter === 'WITH_RECEIPT'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                <span>📷 មានវិក្កយបត្រ</span>
                <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded-full font-black">
                  {expenses.filter((e) => !!e.receiptImage).length}
                </span>
              </button>
              <button
                onClick={() => {
                  soundFx.playPop();
                  setReceiptFilter('WITHOUT_RECEIPT');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  receiptFilter === 'WITHOUT_RECEIPT'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-500 hover:text-amber-600'
                }`}
              >
                <span>📄 គ្មានវិក្កយបត្រ</span>
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.2 rounded-full font-black">
                  {expenses.filter((e) => !e.receiptImage).length}
                </span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  soundFx.playPop();
                  setSelectedCategory('ALL');
                }}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                គ្រប់ប្រភេទ
              </button>
              {Object.entries(categoryLabels).map(([catKey, catVal]) => {
                const isActive = selectedCategory === catKey;
                const totalCatCount = expenses.filter((e) => e.category === catKey).length;
                return (
                  <button
                    key={catKey}
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedCategory(catKey);
                    }}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
                    }`}
                  >
                    {catVal.labelKh} {totalCatCount > 0 ? `(${totalCatCount})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកការចំណាយ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
            />
          </div>
        </div>

        {/* Active Filter Feedback Banner */}
        {datePreset !== 'ALL' && (
          <div className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-1.5 bg-rose-500 text-white rounded-xl shadow-xs">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-700">
                កំពុងបង្ហាញចំណាយសម្រាប់៖{' '}
                <span className="font-black text-rose-700 bg-white px-2 py-0.5 rounded-lg border border-rose-200 shadow-2xs">
                  {activeDateLabel}
                </span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="font-bold text-slate-700">
                សរុបចំណាយ៖ <strong className="font-black text-rose-600">{filteredExpensesKhr.toLocaleString()} ៛</strong>
                <span className="text-slate-500 ml-1">(~ ${filteredExpensesUsd.toFixed(2)} USD)</span>
              </div>
              <span className="text-[11px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                {filteredExpenses.length} ប្រតិបត្តិការ
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setDatePreset('ALL');
              }}
              className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs transition-all shadow-2xs flex items-center gap-1 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>បង្ហាញទាំងអស់ (Reset)</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Expenses Cards View (Visible on Small Screens) */}
      <div className="md:hidden space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-rose-100 p-8 text-center text-slate-400 space-y-3">
            <Receipt className="w-8 h-8 text-rose-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">
              គ្មានទិន្នន័យការចំណាយក្នុងលក្ខខណ្ឌនេះទេ
            </p>
            {datePreset !== 'ALL' && (
              <button
                type="button"
                onClick={() => setDatePreset('ALL')}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>បង្ហាញចំណាយទាំងអស់</span>
              </button>
            )}
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const catInfo = categoryLabels[expense.category] || {
              labelKh: expense.category,
              color: 'bg-slate-100 text-slate-700 border-slate-200',
            };
            const displayQty = expense.quantity ?? 1;
            const displayUnitPriceKhr =
              expense.unitPriceKhr ?? Math.round(expense.amountKhr / displayQty);

            return (
              <div
                key={expense.id}
                className="bg-white rounded-2xl border border-rose-100/90 p-3.5 shadow-2xs space-y-2.5"
              >
                {/* Header: Title & Total */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{expense.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${catInfo.color}`}>
                        {catInfo.labelKh}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setCustomDate(expense.date);
                          setDatePreset('CUSTOM');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-rose-50 px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                        title="ចុចដើម្បីមើលចំណាយក្នុងថ្ងៃនេះ"
                      >
                        <Calendar className="w-3 h-3 text-rose-500" />
                        <span>{expense.date}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-rose-600 text-base">
                      {expense.amountKhr.toLocaleString()} ៛
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      ~ ${expense.amountUsd.toFixed(2)} USD
                    </div>
                  </div>
                </div>

                {/* Details: Qty, Unit price, Paid by */}
                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {displayQty} {expense.unit || 'ដុំ'}
                    </span>
                    <span className="text-slate-300">@</span>
                    <span className="text-slate-600 font-medium">
                      {displayUnitPriceKhr.toLocaleString()} ៛
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700 text-[11px]">{expense.paidBy}</span>
                    <span className="text-[9px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                      {expense.paymentMethod === 'CASH_KHR'
                        ? 'សាច់ប្រាក់ ៛'
                        : expense.paymentMethod === 'BANK_TRANSFER'
                        ? 'ABA'
                        : 'សាច់ប្រាក់ $'}
                    </span>
                  </div>
                </div>

                {expense.notes && (
                  <p className="text-xs text-slate-500 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                    📝 {expense.notes}
                  </p>
                )}

                {/* Footer: Receipt & Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  {expense.receiptImage ? (
                    <button
                      type="button"
                      onClick={() => setPreviewReceiptImage(expense.receiptImage || null)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>មើលរូបវិក្កយបត្រ</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">គ្មានរូបវិក្កយបត្រ</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setEditingExpense(expense);
                        setIsAddExpenseOpen(true);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600 rounded-xl transition-colors cursor-pointer"
                      title="កែប្រែ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setExpenseToDelete(expense);
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="លុប"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Expenses Table (Hidden on Mobile) */}
      <div className="hidden md:flex bg-white rounded-3xl border border-rose-100/90 shadow-sm overflow-hidden flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">បរិយាយការចំណាយ</th>
                <th className="py-3 px-4">ចំនួន & ខ្នាត</th>
                <th className="py-3 px-4">តម្លៃរាយ (Unit Price)</th>
                <th className="py-3 px-4">សរុប (៛ KHR & $)</th>
                <th className="py-3 px-4">កាលបរិច្ឆេទ & អ្នកចំណាយ</th>
                <th className="py-3 px-4 text-center">វិក្កយបត្រ</th>
                <th className="py-3 px-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <Receipt className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">
                      {selectedCategory !== 'ALL' && receiptFilter !== 'ALL'
                        ? `គ្មានទិន្នន័យចំណាយ ${categoryLabels[selectedCategory as ExpenseCategory]?.labelKh || ''} ដែល${receiptFilter === 'WITH_RECEIPT' ? 'មានរូបវិក្កយបត្រ' : 'គ្មានរូបវិក្កយបត្រ'}ឡើយ`
                        : 'គ្មានទិន្នន័យការចំណាយក្នុងលក្ខខណ្ឌនេះទេ'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      {datePreset !== 'ALL'
                        ? 'មិនមានប្រតិបត្តិការចំណាយក្នុងកាលបរិច្ឆេទនេះទេ សូមសាកល្បងជ្រើសរើសថ្ងៃផ្សេង ឬចុចបង្ហាញទាំងអស់'
                        : 'លោកអ្នកអាចចុចប៊ូតុងខាងក្រោមដើម្បីមើលទិន្នន័យទាំងអស់'}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                      {datePreset !== 'ALL' && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setDatePreset('ALL');
                          }}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>បង្ហាញចំណាយទាំងអស់ (All Dates)</span>
                        </button>
                      )}
                      {selectedCategory !== 'ALL' && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setSelectedCategory('ALL');
                          }}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>បង្ហាញគ្រប់ប្រភេទ (Show All Categories)</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const catInfo = categoryLabels[expense.category] || {
                    labelKh: expense.category,
                    color: 'bg-slate-100 text-slate-700',
                  };

                  const displayQty = expense.quantity ?? 1;
                  const displayUnitPriceKhr =
                    expense.unitPriceKhr ?? Math.round(expense.amountKhr / displayQty);
                  const displayUnitPriceUsd =
                    expense.unitPriceUsd ?? Number((displayUnitPriceKhr / exchangeRate).toFixed(2));

                  return (
                    <tr key={expense.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-black text-slate-900 text-sm">{expense.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${catInfo.color}`}
                          >
                            {catInfo.labelKh}
                          </span>
                          {expense.notes && (
                            <span
                              className="text-[11px] text-slate-400 truncate max-w-[200px]"
                              title={expense.notes}
                            >
                              {expense.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm">
                          <span>{displayQty}</span>
                          <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                            {expense.unit || 'ដុំ'}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-800 text-xs">
                          {displayUnitPriceKhr.toLocaleString()} ៛
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          ~ ${displayUnitPriceUsd.toFixed(2)} USD
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-black text-rose-600 text-sm">
                          {expense.amountKhr.toLocaleString()} ៛
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold">
                          ~ ${expense.amountUsd.toFixed(2)} USD
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setCustomDate(expense.date);
                            setDatePreset('CUSTOM');
                          }}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-rose-600 font-semibold text-xs cursor-pointer transition-colors group/date"
                          title="ចុចដើម្បីមើលចំណាយក្នុងថ្ងៃនេះ (Filter by this date)"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover/date:text-rose-500" />
                          <span className="group-hover/date:underline font-bold">{expense.date}</span>
                        </button>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-slate-800 text-[11px]">{expense.paidBy}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            {expense.paymentMethod === 'CASH_KHR'
                              ? 'សាច់ប្រាក់ ៛'
                              : expense.paymentMethod === 'BANK_TRANSFER'
                              ? 'ផ្ទេរ/ABA'
                              : 'សាច់ប្រាក់ $'}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        {expense.receiptImage ? (
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptImage(expense.receiptImage || null)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>មើលរូប</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-300">គ្មានរូប</span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playPop();
                              setEditingExpense(expense);
                              setIsAddExpenseOpen(true);
                            }}
                            className="p-1.5 hover:bg-pink-50 text-slate-400 hover:text-pink-600 rounded-xl transition-colors cursor-pointer"
                            title="កែប្រែការចំណាយនេះ (Edit Expense)"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playPop();
                              setExpenseToDelete(expense);
                            }}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                            title="លុបការចំណាយនេះ (Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Table Footer Summary and Scroll Indicator */}
        {filteredExpenses.length > 0 && (
          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                កំពុងបង្ហាញ <strong>{filteredExpenses.length}</strong> នៃ <strong>{expenses.length}</strong> ប្រតិបត្តិការចំណាយ
                {datePreset !== 'ALL' && <span className="text-rose-600 ml-1">({activeDateLabel})</span>}
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              💡 (លោកអ្នកអាចចុចលើកាលបរិច្ឆេទក្នុងតារាង ដើម្បីមើលការចំណាយក្នុងថ្ងៃនោះបានភ្លាមៗ)
            </span>
          </div>
        )}
      </div>

      {/* Receipt Image Zoom Modal */}
      {previewReceiptImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="font-bold text-slate-800 text-sm">វិក្កយបត្រចំណាយ (Receipt / Invoice Photo)</h4>
              <button
                onClick={() => setPreviewReceiptImage(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewReceiptImage}
              alt="Receipt Full View"
              className="w-full max-h-[70vh] object-contain rounded-2xl bg-slate-50"
            />
          </div>
        </div>
      )}

      {/* New / Edit Expense Modal */}
      <NewExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        expenseToEdit={editingExpense}
      />

      {/* Touch-Friendly Delete Expense Modal (Portal to Body) */}
      {expenseToDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                តើអ្នកពិតជាចង់លុបកំណត់ត្រាចំណាយនេះមែនទេ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ចំណាយ «{expenseToDelete.title}» ចំនួន ${expenseToDelete.amountUsd.toFixed(2)} ({expenseToDelete.amountKhr.toLocaleString()} ៛) នឹងត្រូវលុបចេញពីប្រព័ន្ធ។
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                ថយក្រោយ (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playSuccess();
                  deleteExpense(expenseToDelete.id);
                  setExpenseToDelete(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>លុបចេញ (Delete)</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Clear All Expenses Confirmation Modal (Portal to Body) */}
      {isConfirmClearAll && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                សម្អាតកំណត់ត្រាចំណាយទាំងអស់?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ការចំណាយទាំងអស់ចំនួន {expenses.length} ប្រតិបត្តិការ នឹងត្រូវលុបចេញទាំងស្រុងពីប្រព័ន្ធ។
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearAll(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                ថយក្រោយ
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playSuccess();
                  clearAllExpenses();
                  setIsConfirmClearAll(false);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>យល់ព្រមសម្អាត</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
