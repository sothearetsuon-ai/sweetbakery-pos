import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  PieChart,
  Printer,
  Download,
  Calendar,
  Wallet,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { ReceiptModal } from '../pos/ReceiptModal';
import { CompletedSale, ExpenseCategory } from '../../types';
import { soundFx } from '../../utils/audio';

type DateFilterType =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export const ReportsDashboard: React.FC = () => {
  const { lang, sales, expenses, exchangeRate, customOrders } = useBakery();
  const text = t[lang];

  const [dateFilter, setDateFilter] = useState<DateFilterType>('this_month');
  const [selectedSaleForReprint, setSelectedSaleForReprint] = useState<CompletedSale | null>(null);

  // Custom date range state
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Date constants
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const thisMonthStr = todayStr.slice(0, 7); // YYYY-MM

  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthStr = lastMonthDate.toISOString().slice(0, 7); // YYYY-MM

  const thisYearStr = todayStr.slice(0, 4); // YYYY

  // Date filter evaluator
  const isDateInFilter = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    const d = dateStr.slice(0, 10);
    switch (dateFilter) {
      case 'today':
        return d === todayStr;
      case 'yesterday':
        return d === yesterdayStr;
      case 'week':
        return d >= sevenDaysAgoStr && d <= todayStr;
      case 'this_month':
        return d.slice(0, 7) === thisMonthStr;
      case 'last_month':
        return d.slice(0, 7) === lastMonthStr;
      case 'this_year':
        return d.slice(0, 4) === thisYearStr;
      case 'custom':
        if (customStartDate && d < customStartDate) return false;
        if (customEndDate && d > customEndDate) return false;
        return true;
      case 'all':
      default:
        return true;
    }
  };

  // Filtered data
  const filteredSales = useMemo(() => {
    return sales.filter((s) => isDateInFilter(s.createdAt));
  }, [sales, dateFilter, customStartDate, customEndDate, todayStr, yesterdayStr, sevenDaysAgoStr, thisMonthStr, lastMonthStr, thisYearStr]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => isDateInFilter(e.date || e.createdAt));
  }, [expenses, dateFilter, customStartDate, customEndDate, todayStr, yesterdayStr, sevenDaysAgoStr, thisMonthStr, lastMonthStr, thisYearStr]);

  const filteredCustomOrders = useMemo(() => {
    return customOrders.filter((o) => isDateInFilter(o.pickupDate || o.createdAt));
  }, [customOrders, dateFilter, customStartDate, customEndDate, todayStr, yesterdayStr, sevenDaysAgoStr, thisMonthStr, lastMonthStr, thisYearStr]);

  // Financial calculations
  const totalSalesUsd = filteredSales.reduce((acc, sale) => acc + sale.totalUsd, 0);
  const totalSalesKhr = filteredSales.reduce(
    (acc, sale) => acc + (sale.totalKhr || Math.round(sale.totalUsd * exchangeRate)),
    0
  );

  const totalExpensesUsd = filteredExpenses.reduce((acc, exp) => acc + exp.amountUsd, 0);
  const totalExpensesKhr = filteredExpenses.reduce(
    (acc, exp) => acc + (exp.amountKhr || Math.round(exp.amountUsd * exchangeRate)),
    0
  );

  const netProfitUsd = totalSalesUsd - totalExpensesUsd;
  const netProfitKhr = totalSalesKhr - totalExpensesKhr;
  const profitMarginPercent =
    totalSalesUsd > 0 ? ((netProfitUsd / totalSalesUsd) * 100).toFixed(1) : '0';

  const totalCustomOrdersValue = filteredCustomOrders.reduce((acc, o) => acc + o.totalUsd, 0);
  const totalDepositsCollected = filteredCustomOrders.reduce((acc, o) => acc + o.depositUsd, 0);

  // Expense breakdown by category
  const expenseCategoryNames: Record<ExpenseCategory, string> = {
    INGREDIENTS: 'គ្រឿងផ្សំធ្វើនំ (Ingredients)',
    PACKAGING: 'សម្ភារៈវេចខ្ចប់ (Packaging)',
    UTILITIES: 'ទឹក ភ្លើង ហ្គាស (Utilities)',
    SALARY: 'ប្រាក់ខែបុគ្គលិក (Salary)',
    RENT: 'ថ្លៃជួលទីតាំង (Rent)',
    MAINTENANCE: 'ជួសជុល & ថែទាំ (Maintenance)',
    MARKETING: 'ផ្សព្វផ្សាយ & ទីផ្សារ (Marketing)',
    OTHER: 'ចំណាយផ្សេងៗ (Other)',
  };

  const expenseCategoryBreakdown = filteredExpenses.reduce(
    (acc, exp) => {
      const cat = exp.category || 'OTHER';
      const khr = exp.amountKhr ?? Math.round(exp.amountUsd * exchangeRate);
      if (!acc[cat]) {
        acc[cat] = { usd: 0, khr: 0, count: 0 };
      }
      acc[cat].usd += exp.amountUsd;
      acc[cat].khr += khr;
      acc[cat].count += 1;
      return acc;
    },
    {} as Record<string, { usd: number; khr: number; count: number }>
  );

  // Sales by payment method
  const paymentBreakdown = filteredSales.reduce(
    (acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalUsd;
      return acc;
    },
    {} as Record<string, number>
  );

  // Top selling products count
  const productSalesCount: Record<
    string,
    { nameKh: string; nameEn: string; count: number; totalUsd: number }
  > = {};
  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productSalesCount[item.productId]) {
        productSalesCount[item.productId] = {
          nameKh: item.nameKh,
          nameEn: item.nameEn,
          count: 0,
          totalUsd: 0,
        };
      }
      productSalesCount[item.productId].count += item.quantity;
      productSalesCount[item.productId].totalUsd += item.priceUsd * item.quantity;
    });
  });

  const topSellingList = Object.values(productSalesCount).sort((a, b) => b.count - a.count);

  // Export CSV
  const handleExportCsv = () => {
    soundFx.playPop();
    const csvRows = [
      ['OrderNumber', 'Date', 'Cashier', 'Customer', 'PaymentMethod', 'TotalUSD', 'TotalKHR'].join(','),
      ...filteredSales.map((s) =>
        [
          s.orderNumber,
          s.createdAt,
          `"${s.cashierName}"`,
          `"${s.customerName || 'N/A'}"`,
          s.paymentMethod,
          s.totalUsd.toFixed(2),
          s.totalKhr,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakery-report-${dateFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Filter description text
  const getFilterDescription = () => {
    switch (dateFilter) {
      case 'today':
        return `ថ្ងៃនេះ (${todayStr})`;
      case 'yesterday':
        return `ម្សិលមិញ (${yesterdayStr})`;
      case 'week':
        return `៧ ថ្ងៃចុងក្រោយ (${sevenDaysAgoStr} ដល់ ${todayStr})`;
      case 'this_month':
        return `ខែនេះ (${thisMonthStr})`;
      case 'last_month':
        return `ខែមុន (${lastMonthStr})`;
      case 'this_year':
        return `ឆ្នាំនេះ (${thisYearStr})`;
      case 'custom':
        return `ចន្លោះពីថ្ងៃ ${customStartDate} ដល់ ${customEndDate}`;
      case 'all':
      default:
        return 'ទិន្នន័យទាំងអស់តាំងពីដើមមក (All Time)';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>📊</span>
            <span>{text.reports} & របាយការណ៍ចំណេញ/ខាត (P&L)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>ស្ថិតិការលក់ ការចំណាយ និងប្រាក់ចំណេញសុទ្ធ៖</span>
            <span className="font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
              📌 {getFilterDescription()}
            </span>
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>ទាញយករបាយការណ៍ (CSV)</span>
        </button>
      </div>

      {/* Date & Time Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-rose-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-black text-xs text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-pink-600" />
            <span>ជ្រើសរើសចន្លោះកាលបរិច្ឆេទ (Filter by Date / Month / Year):</span>
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            រកឃើញ {filteredSales.length} វិក្កយបត្រ • {filteredExpenses.length} ការចំណាយ
          </span>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: '🌐 ទាំងអស់ (All)' },
            { id: 'today', label: '☀️ ថ្ងៃនេះ' },
            { id: 'yesterday', label: '⏪ ម្សិលមិញ' },
            { id: 'week', label: '📆 ៧ ថ្ងៃចុងក្រោយ' },
            { id: 'this_month', label: '🗓️ ខែនេះ' },
            { id: 'last_month', label: '🗓️ ខែមុន' },
            { id: 'this_year', label: '📅 ឆ្នាំនេះ' },
            { id: 'custom', label: '🎯 ចន្លោះកាលបរិច្ឆេទផ្ទាល់ខ្លួន' },
          ].map((tab) => {
            const isActive = dateFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setDateFilter(tab.id as DateFilterType);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm scale-102'
                    : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200/80 hover:border-pink-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Custom Date Range Inputs */}
        {dateFilter === 'custom' && (
          <div className="p-3 bg-pink-50/50 border border-pink-200 rounded-2xl flex items-center gap-3 flex-wrap animate-in fade-in duration-200">
            <span className="text-xs font-bold text-pink-900">ចន្លោះកាលបរិច្ឆេទ៖</span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-slate-600">ពីថ្ងៃ៖</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  soundFx.playPop();
                  setCustomStartDate(e.target.value);
                }}
                className="px-2.5 py-1 text-xs border border-pink-300 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-slate-600">ដល់ថ្ងៃ៖</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  soundFx.playPop();
                  setCustomEndDate(e.target.value);
                }}
                className="px-2.5 py-1 text-xs border border-pink-300 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalSalesKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            ~ ${totalSalesUsd.toFixed(2)} USD ({filteredSales.length} វិក្កយបត្រ)
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ការចំណាយសរុប (Expenses)
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-2xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            {totalExpensesKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            ~ ${totalExpensesUsd.toFixed(2)} USD ({filteredExpenses.length} ប្រតិបត្តិការ)
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ប្រាក់ចំណេញសុទ្ធ (Net Profit)
            </span>
            <div
              className={`p-2 rounded-2xl ${
                netProfitUsd >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              netProfitUsd >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {netProfitKhr >= 0 ? '+' : ''}{netProfitKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs font-semibold flex items-center justify-between text-slate-500">
            <span>
              {netProfitUsd >= 0 ? 'ចំណេញ៖' : 'ខាត៖'} ~ ${netProfitUsd >= 0 ? '+' : ''}
              {netProfitUsd.toFixed(2)} USD
            </span>
            <span
              className={`px-1.5 py-0.2 rounded-md font-black text-[10px] ${
                netProfitUsd >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              Margin: {profitMarginPercent}%
            </span>
          </div>
        </div>

        {/* Custom Orders Value */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              តម្លៃនំកុម្ម៉ង់ (Custom Orders)
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-2xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 tracking-tight">
            {Math.round(totalCustomOrdersValue * exchangeRate).toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            ~ ${totalCustomOrdersValue.toFixed(2)} USD ({filteredCustomOrders.length} នំ)
          </div>
        </div>
      </div>

      {/* Comprehensive Profit & Loss (P&L) Statement Table */}
      <div className="bg-white rounded-3xl border border-rose-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <span>📑</span>
              <span>តារាងរបាយការណ៍ចំណេញ/ខាតលម្អិត (Profit & Loss Statement - P&L)</span>
            </h3>
            <p className="text-xs text-slate-500">
              ប្រៀបធៀបចំណូលលក់ និងប្រភេទចំណាយប្រតិបត្តិការទាំងអស់ក្នុងអំឡុងពេល៖ {getFilterDescription()}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-xl text-xs font-black border ${
              netProfitUsd >= 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {netProfitUsd >= 0 ? '✅ ស្ថានភាព៖ ចំណេញសុទ្ធ' : '⚠️ ស្ថានភាព៖ ខាតបង់'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">បរិយាយ (Description)</th>
                <th className="p-3 text-center">ចំនួនប្រតិបត្តិការ</th>
                <th className="p-3 text-right">ទឹកប្រាក់ជា KHR (៛)</th>
                <th className="p-3 text-right">ទឹកប្រាក់ជា USD ($)</th>
                <th className="p-3 text-right">ភាគរយ % នៃចំណូល</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Revenue Row */}
              <tr className="bg-emerald-50/40 font-bold">
                <td className="p-3 flex items-center gap-2 text-emerald-900">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>(+) ចំណូលពីការលក់នំ និងទំនិញសរុប (Total Sales Revenue)</span>
                </td>
                <td className="p-3 text-center text-emerald-800">{filteredSales.length} វិក្កយបត្រ</td>
                <td className="p-3 text-right font-black text-emerald-700">
                  +{totalSalesKhr.toLocaleString()} ៛
                </td>
                <td className="p-3 text-right font-black text-emerald-700">
                  +${totalSalesUsd.toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-emerald-800">100%</td>
              </tr>

              {/* Operating Expenses Rows */}
              {Object.keys(expenseCategoryNames).map((key) => {
                const catData = expenseCategoryBreakdown[key] || { usd: 0, khr: 0, count: 0 };
                if (catData.usd === 0 && filteredExpenses.length > 0) return null;
                const percentOfRevenue =
                  totalSalesUsd > 0 ? ((catData.usd / totalSalesUsd) * 100).toFixed(1) : '0';
                return (
                  <tr key={key} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 pl-8 text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>(-) {expenseCategoryNames[key as ExpenseCategory]}</span>
                    </td>
                    <td className="p-3 text-center text-slate-500">
                      {catData.count > 0 ? `${catData.count} ដង` : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-600">
                      {catData.khr > 0 ? `-${catData.khr.toLocaleString()} ៛` : '0 ៛'}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-600">
                      {catData.usd > 0 ? `-$${catData.usd.toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="p-3 text-right text-slate-500">{percentOfRevenue}%</td>
                  </tr>
                );
              })}

              {/* Total Expenses Summary Row */}
              <tr className="bg-rose-50/40 font-bold border-t border-rose-200">
                <td className="p-3 flex items-center gap-2 text-rose-900">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  <span>(-) ការចំណាយប្រតិបត្តិការសរុប (Total Operating Expenses)</span>
                </td>
                <td className="p-3 text-center text-rose-800">{filteredExpenses.length} ប្រតិបត្តិការ</td>
                <td className="p-3 text-right font-black text-rose-600">
                  -{totalExpensesKhr.toLocaleString()} ៛
                </td>
                <td className="p-3 text-right font-black text-rose-600">
                  -${totalExpensesUsd.toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-rose-800">
                  {totalSalesUsd > 0 ? ((totalExpensesUsd / totalSalesUsd) * 100).toFixed(1) : '0'}%
                </td>
              </tr>

              {/* Net Profit Summary Row */}
              <tr
                className={`font-black text-sm border-t-2 ${
                  netProfitUsd >= 0
                    ? 'bg-gradient-to-r from-emerald-100/70 to-teal-50 border-emerald-300 text-emerald-950'
                    : 'bg-gradient-to-r from-rose-100/70 to-pink-50 border-rose-300 text-rose-950'
                }`}
              >
                <td className="p-3.5 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <span>(=) ប្រាក់ចំណេញសុទ្ធពិតប្រាកដ (NET PROFIT / LOSS)</span>
                </td>
                <td className="p-3.5 text-center text-xs font-bold text-slate-600">
                  (ចំណូល ដក ចំណាយ)
                </td>
                <td
                  className={`p-3.5 text-right text-base font-black ${
                    netProfitUsd >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {netProfitKhr >= 0 ? '+' : ''}{netProfitKhr.toLocaleString()} ៛
                </td>
                <td
                  className={`p-3.5 text-right text-base font-black ${
                    netProfitUsd >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {netProfitUsd >= 0 ? '+' : ''}${netProfitUsd.toFixed(2)}
                </td>
                <td
                  className={`p-3.5 text-right font-black ${
                    netProfitUsd >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {profitMarginPercent}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Sellers */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-rose-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>🔥</span>
              <span>{text.topSelling} (តាមកាលបរិច្ឆេទដែលបានរើស)</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {topSellingList.length} មុខទំនិញ
            </span>
          </div>

          <div className="space-y-3">
            {topSellingList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                ពុំទាន់មានទិន្នន័យលក់ក្នុងចន្លោះកាលបរិច្ឆេទនេះនៅឡើយ
              </p>
            ) : (
              topSellingList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-rose-50/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        {lang === 'km' ? item.nameKh : item.nameEn}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        លក់បាន {item.count} ដុំ
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-xs text-pink-600">
                      {Math.round(item.totalUsd * exchangeRate).toLocaleString()} ៛
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      ~ ${item.totalUsd.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-3xl border border-rose-100 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <span>💳</span>
            <span>វិធីសាស្ត្រទូទាត់លុយ</span>
          </h3>
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>KHQR Bakong / ABA</span>
                <span>
                  {Math.round((paymentBreakdown['KHQR_BAKONG'] || 0) * exchangeRate).toLocaleString()} ៛
                  (~${(paymentBreakdown['KHQR_BAKONG'] || 0).toFixed(2)})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-pink-600 h-full rounded-full"
                  style={{
                    width: `${
                      totalSalesUsd > 0
                        ? ((paymentBreakdown['KHQR_BAKONG'] || 0) / totalSalesUsd) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>សាច់ប្រាក់ KHR (៛)</span>
                <span>
                  {Math.round((paymentBreakdown['CASH_KHR'] || 0) * exchangeRate).toLocaleString()} ៛
                  (~${(paymentBreakdown['CASH_KHR'] || 0).toFixed(2)})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{
                    width: `${
                      totalSalesUsd > 0
                        ? ((paymentBreakdown['CASH_KHR'] || 0) / totalSalesUsd) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>សាច់ប្រាក់ USD ($)</span>
                <span>
                  {Math.round((paymentBreakdown['CASH_USD'] || 0) * exchangeRate).toLocaleString()} ៛
                  (~${(paymentBreakdown['CASH_USD'] || 0).toFixed(2)})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${
                      totalSalesUsd > 0
                        ? ((paymentBreakdown['CASH_USD'] || 0) / totalSalesUsd) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-3xl border border-rose-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <span>🧾</span>
            <span>ប្រវត្តិវិក្កយបត្រលក់ (Sales Transactions - {getFilterDescription()})</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            បង្ហាញ {filteredSales.length} វិក្កយបត្រ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">លេខវិក្កយបត្រ</th>
                <th className="p-3">កាលបរិច្ឆេទ & ម៉ោង</th>
                <th className="p-3">ឈ្មោះអតិថិជន</th>
                <th className="p-3">បេឡាធិការ</th>
                <th className="p-3">វិធីសាស្ត្រ</th>
                <th className="p-3">សរុបជា KHR (៛)</th>
                <th className="p-3">សរុបជា USD ($)</th>
                <th className="p-3 text-center">បោះពុម្ព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    ពុំមានទិន្នន័យវិក្កយបត្រលក់ក្នុងចន្លោះកាលបរិច្ឆេទនេះទេ
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{sale.orderNumber}</td>
                    <td className="p-3">
                      <div>{sale.createdAt.slice(0, 10)}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(sale.createdAt).toLocaleTimeString('km-KH')}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {sale.customerName || 'ទូទៅ'}
                    </td>
                    <td className="p-3">{sale.cashierName}</td>
                    <td className="p-3 font-semibold text-slate-700">{sale.paymentMethod}</td>
                    <td className="p-3 font-black text-pink-600">
                      {sale.totalKhr.toLocaleString()} ៛
                    </td>
                    <td className="p-3 text-slate-500 font-semibold">${sale.totalUsd.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          soundFx.playPop();
                          setSelectedSaleForReprint(sale);
                        }}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="text-[11px]">ព្រីន</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reprint Modal */}
      <ReceiptModal
        isOpen={!!selectedSaleForReprint}
        sale={selectedSaleForReprint}
        onClose={() => setSelectedSaleForReprint(null)}
      />
    </div>
  );
};
