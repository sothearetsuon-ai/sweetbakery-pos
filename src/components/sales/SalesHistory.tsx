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
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'month'>('all');

  // Modals state
  const [isAddPastOpen, setIsAddPastOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<CompletedSale | null>(null);
  const [viewingReceiptSale, setViewingReceiptSale] = useState<CompletedSale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<CompletedSale | null>(null);
  const [isConfirmClearAllSales, setIsConfirmClearAllSales] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Financial totals
  const totalSalesKhr = sales.reduce((sum, s) => sum + s.totalKhr, 0);
  const totalSalesUsd = sales.reduce((sum, s) => sum + s.totalUsd, 0);

  const totalExpensesKhr = expenses.reduce(
    (sum, exp) => sum + (exp.amountKhr ?? Math.round(exp.amountUsd * exchangeRate)),
    0
  );
  const totalExpensesUsd = expenses.reduce((sum, exp) => sum + exp.amountUsd, 0);

  const netProfitKhr = totalSalesKhr - totalExpensesKhr;
  const netProfitUsd = totalSalesUsd - totalExpensesUsd;

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.orderNumber.toLowerCase().includes(q) ||
        s.cashierName.toLowerCase().includes(q) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        s.items.some((item) => item.nameKh.toLowerCase().includes(q));

      const saleDate = s.createdAt.slice(0, 10);
      let matchDate = true;
      if (dateFilter === 'today') {
        matchDate = saleDate === todayStr;
      } else if (dateFilter === 'yesterday') {
        matchDate = saleDate === yesterdayStr;
      } else if (dateFilter === 'month') {
        matchDate = saleDate.slice(0, 7) === todayStr.slice(0, 7);
      }

      return matchSearch && matchDate;
    });
  }, [sales, searchQuery, dateFilter, todayStr, yesterdayStr]);

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

      {/* Summary Cards - KHR ៛ FIRST */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            ចំណូលលក់សរុប (គិតជាលុយរៀល)
          </span>
          <div className="text-2xl font-black text-pink-600 tracking-tight">
            {totalSalesKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            ~ ${totalSalesUsd.toFixed(2)} USD
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            ចំនួនវិក្កយបត្រលក់សរុប
          </span>
          <div className="text-2xl font-black text-slate-800 tracking-tight">
            {sales.length} វិក្កយបត្រ
          </div>
          <div className="text-xs text-emerald-600 font-semibold">
            រួមទាំងការលក់កន្លងមក
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>ប្រាក់ចំណេញសុទ្ធ (Net Profit)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              netProfitKhr >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {netProfitKhr >= 0 ? 'ចំណេញ' : 'ខាត'}
            </span>
          </span>
          <div className={`text-2xl font-black tracking-tight ${
            netProfitKhr >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {netProfitKhr >= 0 ? '+' : ''}{netProfitKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {netProfitUsd >= 0 ? 'ចំណេញ៖' : 'ខាត៖'} ~ ${netProfitUsd >= 0 ? '+' : ''}{netProfitUsd.toFixed(2)} USD (ដកចំណាយ)
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-2xl border border-rose-100 shadow-2xs">
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
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilter === tab.id
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
            </div>

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
                  deleteSale(saleToDelete.id);
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
