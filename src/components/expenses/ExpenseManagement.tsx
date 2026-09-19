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
  Trash2,
  Download,
  Eye,
  X,
  FileText,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { Expense, ExpenseCategory } from '../../types';
import { NewExpenseModal } from './NewExpenseModal';
import { soundFx } from '../../utils/audio';

export const ExpenseManagement: React.FC = () => {
  const { lang, expenses, deleteExpense, clearAllExpenses, sales, exchangeRate } = useBakery();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewReceiptImage, setPreviewReceiptImage] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isConfirmClearAll, setIsConfirmClearAll] = useState(false);

  // Financial sums
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
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.paidBy.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [expenses, selectedCategory, searchQuery]);

  // Export CSV
  const handleExportCsv = () => {
    const csvRows = [
      ['Title', 'Category', 'Quantity', 'Unit', 'UnitPriceKHR', 'TotalKHR', 'TotalUSD', 'PaidBy', 'PaymentMethod', 'Date', 'Notes'].join(','),
      ...expenses.map((e) =>
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
    a.download = `bakery-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
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
            ~ ${totalExpensesUsd.toFixed(2)} USD ({expenses.length} ប្រតិបត្តិការ)
          </div>
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

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              soundFx.playPop();
              setSelectedCategory('ALL');
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ទាំងអស់ ({expenses.length})
          </button>
          {Object.entries(categoryLabels).map(([catKey, catVal]) => {
            const isActive = selectedCategory === catKey;
            const count = expenses.filter((e) => e.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => {
                  soundFx.playPop();
                  setSelectedCategory(catKey);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
                }`}
              >
                {catVal.labelKh} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-64">
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

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-rose-100/90 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="p-4">បរិយាយការចំណាយ</th>
                <th className="p-4">ចំនួន & ខ្នាត</th>
                <th className="p-4">តម្លៃរាយ (Unit Price)</th>
                <th className="p-4">សរុប (៛ KHR & $)</th>
                <th className="p-4">កាលបរិច្ឆេទ & អ្នកចំណាយ</th>
                <th className="p-4 text-center">វិក្កយបត្រ</th>
                <th className="p-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">គ្មានទិន្នន័យការចំណាយក្នុងប្រភេទនេះទេ</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ចុចប៊ូតុង «+ កត់ត្រាការចំណាយថ្មី» ដើម្បីបន្ថែម
                    </p>
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
                      <td className="p-4">
                        <div className="font-black text-slate-900 text-sm">{expense.title}</div>
                        <div className="flex items-center gap-2 mt-1">
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

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm">
                          <span>{displayQty}</span>
                          <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                            {expense.unit || 'ដុំ'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-xs">
                          {displayUnitPriceKhr.toLocaleString()} ៛
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          ~ ${displayUnitPriceUsd.toFixed(2)} USD
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-black text-rose-600 text-sm">
                          {expense.amountKhr.toLocaleString()} ៛
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold">
                          ~ ${expense.amountUsd.toFixed(2)} USD
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{expense.date}</span>
                        </div>
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

                      <td className="p-4 text-center">
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

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playPop();
                              setEditingExpense(expense);
                              setIsAddExpenseOpen(true);
                            }}
                            className="p-2 hover:bg-pink-50 text-slate-400 hover:text-pink-600 rounded-xl transition-colors cursor-pointer"
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
                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
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
