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
  ShieldCheck,
  CheckCircle2,
  Bell,
  Clock,
  Zap,
  Camera,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { Expense, ExpenseCategory } from '../../types';
import { NewExpenseModal } from './NewExpenseModal';
import { ReserveFundModal } from './ReserveFundModal';
import { InvoiceScannerModal } from './InvoiceScannerModal';
import { soundFx } from '../../utils/audio';
import { formatDateDMY } from '../../utils/dateUtils';

type DateFilterPreset = 'THIS_MONTH' | 'ALL' | 'TODAY' | 'YESTERDAY' | 'SPECIFIC_MONTH' | 'CUSTOM';

interface ExpenseManagementProps {
  onNavigateToReserveFund?: () => void;
}

export const ExpenseManagement: React.FC<ExpenseManagementProps> = ({
  onNavigateToReserveFund,
}) => {
  const {
    lang,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAllExpenses,
    sales,
    exchangeRate,
    reserveFund,
    batchDeductExpensesToReserveFund,
    reconcileReserveFundWithExpenses,
  } = useBakery();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isInvoiceScannerOpen, setIsInvoiceScannerOpen] = useState(false);
  const [isReserveFundOpen, setIsReserveFundOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mainTypeFilter, setMainTypeFilter] = useState<'ALL' | 'INGREDIENTS' | 'SUPPLIES' | 'GENERAL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [receiptFilter, setReceiptFilter] = useState<'ALL' | 'WITH_RECEIPT' | 'WITHOUT_RECEIPT'>('ALL');
  const [previewReceiptImage, setPreviewReceiptImage] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isConfirmClearAll, setIsConfirmClearAll] = useState(false);

  // Local calendar date helpers (accurate for Cambodia timezone)
  const getLocalDateStr = (d: Date = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = useMemo(() => getLocalDateStr(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateStr(d);
  }, []);
  const thisMonthStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  // Date filtering state - Smartly defaults to THIS_MONTH if has expenses this month, or ALL so recorded data is always visible immediately
  const [datePreset, setDatePreset] = useState<DateFilterPreset>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const thisM = `${y}-${m}`;
    const hasThisMonth = expenses.some((e) => !!e.date && e.date.startsWith(thisM));
    return hasThisMonth ? 'THIS_MONTH' : 'ALL';
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });
  const [customDate, setCustomDate] = useState<string>(() => getLocalDateStr(new Date()));

  // View Mode: Cards (default on mobile for 100% full visibility) vs Table (desktop)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  // One-click sample expenses generator so the table is never mysteriously empty when testing
  const handleSeedSampleExpenses = () => {
    soundFx.playSuccess();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    const today = new Date().toISOString().slice(0, 10);
    const samples = [
      {
        title: 'ទិញស៊ុតមាន់ស្រស់កសិដ្ឋាន CP',
        expenseType: 'INGREDIENT' as const,
        category: 'INGREDIENTS' as const,
        ingredientId: 'ing-4',
        supplier: 'CP Cambodia',
        quantity: 200,
        unit: 'គ្រាប់ (eggs)',
        unitPriceKhr: 492,
        unitPriceUsd: 0.12,
        amountUsd: 24.0,
        amountKhr: 98400,
        paidBy: 'មេការហាង (Manager)',
        paymentMethod: 'CASH_KHR' as const,
        paymentStatus: 'PAID' as const,
        notes: 'ទិញគ្រឿងផ្សំសម្រាប់ដុតនំពេលព្រឹក',
        date: today,
      },
      {
        title: 'ទិញម្សៅខេកជប៉ុនពិសេស (Cake Flour)',
        expenseType: 'INGREDIENT' as const,
        category: 'INGREDIENTS' as const,
        ingredientId: 'ing-1',
        supplier: 'Khmer Food Supply Co.',
        quantity: 25,
        unit: 'kg',
        unitPriceKhr: 5740,
        unitPriceUsd: 1.4,
        amountUsd: 35.0,
        amountKhr: 143500,
        paidBy: 'ចុងភៅដុតនំ (Chef)',
        paymentMethod: 'CASH_KHR' as const,
        paymentStatus: 'PAID' as const,
        notes: 'ម្សៅមីម៉ត់ពិសេសធ្វើនំខេកខួបកំណើត',
        date: today,
      },
      {
        title: 'ទិញប៊័រស្រស់បារាំង Elle & Vire',
        expenseType: 'INGREDIENT' as const,
        category: 'INGREDIENTS' as const,
        ingredientId: 'ing-2',
        supplier: 'Euro Gourmet imports',
        quantity: 10,
        unit: 'kg',
        unitPriceKhr: 38950,
        unitPriceUsd: 9.5,
        amountUsd: 95.0,
        amountKhr: 389500,
        paidBy: 'មេការហាង (Manager)',
        paymentMethod: 'BANK_TRANSFER' as const,
        paymentStatus: 'PAID' as const,
        notes: 'ប៊័រ AOP ក្លិនឈ្ងុយសម្រាប់ធ្វើក្រូសង់',
        date: today,
      },
      {
        title: 'ទិញប្រអប់នំខេកកញ្ចក់ថ្លា & ខ្សែបូ',
        expenseType: 'SUPPLY' as const,
        category: 'PACKAGING' as const,
        supplier: 'Cambodia Packaging Co.',
        quantity: 50,
        unit: 'ប្រអប់ (box)',
        unitPriceKhr: 2665,
        unitPriceUsd: 0.65,
        amountUsd: 32.5,
        amountKhr: 133250,
        paidBy: 'មេការហាង (Manager)',
        paymentMethod: 'BANK_TRANSFER' as const,
        paymentStatus: 'PAID' as const,
        notes: 'Cambodia Packaging Co.',
        date: today,
      },
      {
        title: 'ថ្លៃអគ្គិសនីដំណើរការឡដុតនំ & ទូក្លាសេ (EDC)',
        expenseType: 'GENERAL' as const,
        category: 'UTILITIES' as const,
        quantity: 1,
        unit: 'ខែ (month)',
        unitPriceKhr: 348500,
        unitPriceUsd: 85.0,
        amountUsd: 85.0,
        amountKhr: 348500,
        paidBy: 'គណនេយ្យ (Admin)',
        paymentMethod: 'BANK_TRANSFER' as const,
        paymentStatus: 'PAID' as const,
        notes: 'វិក្កយបត្រ EDC ប្រចាំខែ',
        date: today,
      },
    ];

    samples.forEach((s) => addExpense(s));
    setDatePreset('ALL');
  };

  // Cash expenses that have not been deducted from Reserve Fund
  const undeductedCashExpenses = useMemo(() => {
    return expenses.filter(
      (e) => e.paymentMethod !== 'RESERVE_FUND' && (!e.paymentStatus || e.paymentStatus === 'PAID')
    );
  }, [expenses]);
  const undeductedCashTotalKhr = useMemo(() => {
    return undeductedCashExpenses.reduce((sum, e) => sum + e.amountKhr, 0);
  }, [undeductedCashExpenses]);

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

  const formatKhmerMonthYear = (monthStr: string) => {
    try {
      const [y, m] = monthStr.split('-');
      if (!y || !m) return monthStr;
      const monthNamesKh = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ];
      const mIdx = parseInt(m, 10) - 1;
      return `${monthNamesKh[mIdx] || m} ${y}`;
    } catch {
      return monthStr;
    }
  };

  // Helper to distinguish: INGREDIENTS (ទិញគ្រឿងផ្សំ) vs SUPPLIES (ទិញសម្ភារៈ) vs GENERAL (ចំណាយទូទៅ)
  const getExpenseMainType = (e: Expense): 'INGREDIENT' | 'SUPPLY' | 'GENERAL' => {
    if (e.expenseType) return e.expenseType;
    if (e.category === 'INGREDIENTS') return 'INGREDIENT';
    if (e.category === 'PACKAGING' || e.category === 'SUPPLIES') return 'SUPPLY';
    return 'GENERAL';
  };

  const isIngredientExpense = (e: Expense) => getExpenseMainType(e) === 'INGREDIENT';
  const isSupplyExpense = (e: Expense) => getExpenseMainType(e) === 'SUPPLY';
  const isGeneralExpense = (e: Expense) => getExpenseMainType(e) === 'GENERAL';

  // Financial sums (All-time)
  const totalSalesUsd = sales.reduce((sum, s) => sum + s.totalUsd, 0);
  const totalSalesKhr = sales.reduce((sum, s) => sum + (s.totalKhr || Math.round(s.totalUsd * exchangeRate)), 0);
  const totalExpensesUsd = expenses.reduce((sum, e) => sum + e.amountUsd, 0);
  const totalExpensesKhr = expenses.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  const netProfitUsd = totalSalesUsd - totalExpensesUsd;
  const netProfitKhr = totalSalesKhr - totalExpensesKhr;

  // Breakdown: Ingredients vs Supplies vs General (All-time)
  const ingredientExpenses = useMemo(() => expenses.filter(isIngredientExpense), [expenses]);
  const supplyExpenses = useMemo(() => expenses.filter(isSupplyExpense), [expenses]);
  const generalExpenses = useMemo(() => expenses.filter(isGeneralExpense), [expenses]);

  const totalIngredientsUsd = useMemo(() => ingredientExpenses.reduce((sum, e) => sum + e.amountUsd, 0), [ingredientExpenses]);
  const totalIngredientsKhr = useMemo(() => ingredientExpenses.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0), [ingredientExpenses, exchangeRate]);

  const totalSuppliesUsd = useMemo(() => supplyExpenses.reduce((sum, e) => sum + e.amountUsd, 0), [supplyExpenses]);
  const totalSuppliesKhr = useMemo(() => supplyExpenses.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0), [supplyExpenses, exchangeRate]);

  const totalGeneralUsd = useMemo(() => generalExpenses.reduce((sum, e) => sum + e.amountUsd, 0), [generalExpenses]);
  const totalGeneralKhr = useMemo(() => generalExpenses.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0), [generalExpenses, exchangeRate]);

  // Gross profit = Sales - Ingredient Costs
  const grossProfitUsd = totalSalesUsd - totalIngredientsUsd;
  const grossProfitKhr = totalSalesKhr - totalIngredientsKhr;
  const grossMarginPct = totalSalesUsd > 0 ? ((grossProfitUsd / totalSalesUsd) * 100).toFixed(0) : '0';
  const netMarginPct = totalSalesUsd > 0 ? ((netProfitUsd / totalSalesUsd) * 100).toFixed(0) : '0';

  const ingredientExpensePct = totalExpensesUsd > 0 ? ((totalIngredientsUsd / totalExpensesUsd) * 100).toFixed(0) : '0';
  const supplyExpensePct = totalExpensesUsd > 0 ? ((totalSuppliesUsd / totalExpensesUsd) * 100).toFixed(0) : '0';
  const generalExpensePct = totalExpensesUsd > 0 ? ((totalGeneralUsd / totalExpensesUsd) * 100).toFixed(0) : '0';

  // Unpaid / Due expenses tracking
  const unpaidExpenses = useMemo(() => {
    return expenses.filter((e) => e.paymentStatus === 'UNPAID');
  }, [expenses]);

  const totalUnpaidKhr = useMemo(() => {
    return unpaidExpenses.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  }, [unpaidExpenses, exchangeRate]);

  const totalUnpaidUsd = useMemo(() => {
    return unpaidExpenses.reduce((sum, e) => sum + e.amountUsd, 0);
  }, [unpaidExpenses]);

  // Helper to compute due days
  const getDueStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const [dYear, dMonth, dDay] = dueDate.split('-').map(Number);
    if (!dYear || !dMonth || !dDay) return null;
    const dObj = new Date(dYear, dMonth - 1, dDay);
    const now = new Date();
    const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = dObj.getTime() - todayObj.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return {
      diffDays,
      isOverdue: diffDays < 0,
      isDueToday: diffDays === 0,
      isDueSoon: diffDays > 0 && diffDays <= 3,
    };
  };

  const overdueExpenses = useMemo(() => {
    return unpaidExpenses.filter((e) => {
      const st = getDueStatus(e.dueDate);
      return st && st.isOverdue;
    });
  }, [unpaidExpenses]);

  const dueTodayExpenses = useMemo(() => {
    return unpaidExpenses.filter((e) => {
      const st = getDueStatus(e.dueDate);
      return st && st.isDueToday;
    });
  }, [unpaidExpenses]);

  const handleMarkAsPaid = (expense: Expense) => {
    soundFx.playSuccess();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    updateExpense(expense.id, {
      paymentStatus: 'PAID',
      paidAt: new Date().toISOString().slice(0, 10),
    });
  };

  // Category map
  const categoryLabels: Record<ExpenseCategory, { labelKh: string; color: string }> = {
    INGREDIENTS: { labelKh: '🌾 គ្រឿងផ្សំធ្វើនំ', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    PACKAGING: { labelKh: '📦 ប្រអប់ & វេចខ្ចប់', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    SUPPLIES: { labelKh: '🎀 សម្ភារៈ & តុបតែងនំ', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    UTILITIES: { labelKh: '⚡ ទឹក ភ្លើង ហ្គាស', color: 'bg-orange-50 text-orange-800 border-orange-200' },
    SALARY: { labelKh: '👤 ប្រាក់ខែ & ថ្លៃឈ្នួល', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    RENT: { labelKh: '🏠 ថ្លៃជួលទីតាំង', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    MAINTENANCE: { labelKh: '🔧 ជួសជុលឧបករណ៍', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    MARKETING: { labelKh: '📢 ផ្សព្វផ្សាយ / Ads', color: 'bg-pink-50 text-pink-800 border-pink-200' },
    OTHER: { labelKh: '📌 ផ្សេងៗ', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Main Type filter: 'ALL' | 'INGREDIENTS' | 'SUPPLIES' | 'GENERAL'
      if (mainTypeFilter === 'INGREDIENTS' && !isIngredientExpense(e)) return false;
      if (mainTypeFilter === 'SUPPLIES' && !isSupplyExpense(e)) return false;
      if (mainTypeFilter === 'GENERAL' && !isGeneralExpense(e)) return false;

      // Status filter (All vs Unpaid vs Paid)
      if (statusFilter === 'UNPAID' && e.paymentStatus !== 'UNPAID') return false;
      if (statusFilter === 'PAID' && e.paymentStatus === 'UNPAID') return false;

      const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchReceipt =
        receiptFilter === 'ALL' ||
        (receiptFilter === 'WITH_RECEIPT' && !!e.receiptImage) ||
        (receiptFilter === 'WITHOUT_RECEIPT' && !e.receiptImage);

      // Date matching (robust against ISO strings and timestamps)
      let matchDate = true;
      const rawDate = e.date || e.createdAt || '';
      const expDate = rawDate.slice(0, 10);
      if (datePreset === 'TODAY') {
        matchDate = expDate === todayStr;
      } else if (datePreset === 'YESTERDAY') {
        matchDate = expDate === yesterdayStr;
      } else if (datePreset === 'THIS_MONTH') {
        matchDate = expDate.startsWith(thisMonthStr);
      } else if (datePreset === 'SPECIFIC_MONTH') {
        matchDate = expDate.startsWith(selectedMonth);
      } else if (datePreset === 'CUSTOM') {
        matchDate = expDate === customDate;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.paidBy.toLowerCase().includes(q) ||
        (e.supplier && e.supplier.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q));

      return matchCat && matchReceipt && matchDate && matchSearch;
    });
  }, [expenses, mainTypeFilter, statusFilter, selectedCategory, receiptFilter, datePreset, customDate, selectedMonth, todayStr, yesterdayStr, thisMonthStr, searchQuery]);

  // Filtered sums
  const filteredExpensesKhr = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  }, [filteredExpenses, exchangeRate]);

  const filteredExpensesUsd = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amountUsd, 0);
  }, [filteredExpenses]);

  // Filtered breakdown: Ingredients vs Supplies vs General
  const filteredIngredients = useMemo(() => filteredExpenses.filter(isIngredientExpense), [filteredExpenses]);
  const filteredSupplies = useMemo(() => filteredExpenses.filter(isSupplyExpense), [filteredExpenses]);
  const filteredGeneral = useMemo(() => filteredExpenses.filter(isGeneralExpense), [filteredExpenses]);

  const filteredIngredientsKhr = useMemo(() => {
    return filteredIngredients.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  }, [filteredIngredients, exchangeRate]);

  const filteredIngredientsUsd = useMemo(() => {
    return filteredIngredients.reduce((sum, e) => sum + e.amountUsd, 0);
  }, [filteredIngredients]);

  const filteredSuppliesKhr = useMemo(() => {
    return filteredSupplies.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  }, [filteredSupplies, exchangeRate]);

  const filteredSuppliesUsd = useMemo(() => {
    return filteredSupplies.reduce((sum, e) => sum + e.amountUsd, 0);
  }, [filteredSupplies]);

  const filteredGeneralKhr = useMemo(() => {
    return filteredGeneral.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  }, [filteredGeneral, exchangeRate]);

  const filteredGeneralUsd = useMemo(() => {
    return filteredGeneral.reduce((sum, e) => sum + e.amountUsd, 0);
  }, [filteredGeneral]);

  const activeDateLabel = useMemo(() => {
    if (datePreset === 'ALL') return 'ទិន្នន័យចំណាយទាំងអស់ (All Time)';
    if (datePreset === 'TODAY') return `ថ្ងៃនេះ (${formatKhmerDate(todayStr)})`;
    if (datePreset === 'YESTERDAY') return `ម្សិលមិញ (${formatKhmerDate(yesterdayStr)})`;
    if (datePreset === 'THIS_MONTH') return `ខែនេះ (${formatKhmerMonthYear(thisMonthStr)})`;
    if (datePreset === 'SPECIFIC_MONTH') return `ខែ ${formatKhmerMonthYear(selectedMonth)}`;
    return `ថ្ងៃទី ${formatKhmerDate(customDate)}`;
  }, [datePreset, todayStr, yesterdayStr, thisMonthStr, selectedMonth, customDate]);

  // Export CSV
  const handleExportCsv = () => {
    const listToExport = filteredExpenses.length > 0 ? filteredExpenses : expenses;
    const csvRows = [
      ['Title', 'ExpenseType', 'Category', 'Quantity', 'Unit', 'UnitPriceKHR', 'TotalKHR', 'TotalUSD', 'PaidBy', 'PaymentMethod', 'Supplier', 'Date', 'Notes'].join(','),
      ...listToExport.map((e) =>
        [
          `"${e.title}"`,
          getExpenseMainType(e),
          e.category,
          e.quantity ?? 1,
          `"${e.unit || ''}"`,
          e.unitPriceKhr ?? Math.round(e.amountKhr / (e.quantity || 1)),
          e.amountKhr,
          e.amountUsd.toFixed(2),
          `"${e.paidBy}"`,
          e.paymentMethod,
          `"${e.supplier || ''}"`,
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
    a.download = `bakery-expenses-${mainTypeFilter.toLowerCase()}-${dateLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Reserve Fund calculations
  const deficitKhr = Math.max(0, reserveFund.targetAmountKhr - reserveFund.currentBalanceKhr);
  const deficitUsd = Number((deficitKhr / exchangeRate).toFixed(2));
  const reserveFundPct = reserveFund.targetAmountKhr > 0
    ? Math.min(100, Math.max(0, Math.round((reserveFund.currentBalanceKhr / reserveFund.targetAmountKhr) * 100)))
    : 100;

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
              if (onNavigateToReserveFund) {
                onNavigateToReserveFund();
              } else {
                setIsReserveFundOpen(true);
              }
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-700/30 flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer border border-emerald-600"
            title="គ្រប់គ្រងទុនបម្រុងហាង & Petty Cash"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5] text-white" />
            <span className="text-white font-black">🏦 ទុនបម្រុងហាង</span>
            {deficitKhr > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 text-[10px] font-black rounded-full shadow-2xs">
                ខ្វះ
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setIsInvoiceScannerOpen(true);
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
            title="ស្កេនរូបភាពវិក្កយបត្រដោយ AI (Gemini Vision OCR)"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden xs:inline">📷</span>
            <span>ស្កេនវិក្កយបត្រ (AI)</span>
          </button>

          {expenses.length === 0 && (
            <button
              onClick={handleSeedSampleExpenses}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
              title="បញ្ចូលទិន្នន័យចំណាយគំរូ ៥ មុខភ្លាមៗដើម្បីសាកល្បងតារាង"
            >
              <Sparkles className="w-4 h-4" />
              <span>🌾 បញ្ចូលទិន្នន័យគំរូ</span>
            </button>
          )}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: 🌾 ទិញគ្រឿងផ្សំ (Ingredient Costs / COGS) */}
        <div
          onClick={() => {
            soundFx.playPop();
            setMainTypeFilter(mainTypeFilter === 'INGREDIENTS' ? 'ALL' : 'INGREDIENTS');
          }}
          className={`bg-white p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden shadow-sm space-y-2 hover:shadow-md ${
            mainTypeFilter === 'INGREDIENTS'
              ? 'border-amber-400 ring-2 ring-amber-300/60 bg-gradient-to-b from-amber-50/40 to-white'
              : 'border-amber-200/70 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span>🌾</span>
              <span>ទិញគ្រឿងផ្សំ (Ingredients)</span>
            </span>
            <div className="p-1.5 sm:p-2 bg-amber-100 text-amber-700 rounded-2xl">
              <span className="text-xs font-black">{ingredientExpensePct}%</span>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
            {(datePreset !== 'ALL' ? filteredIngredientsKhr : totalIngredientsKhr).toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>~ ${(datePreset !== 'ALL' ? filteredIngredientsUsd : totalIngredientsUsd).toFixed(2)} USD</span>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              {datePreset !== 'ALL' ? filteredIngredients.length : ingredientExpenses.length} ប្រតិបត្តិការ
            </span>
          </div>
          <div className="text-[10px] text-amber-700/80 pt-1 border-t border-amber-100 flex items-center justify-between">
            <span>ថ្លៃដើមផលិត (COGS)</span>
            <span className="font-bold underline">
              {mainTypeFilter === 'INGREDIENTS' ? '✓ កំពុងជ្រើស' : 'ចុចមើលតែគ្រឿងផ្សំ →'}
            </span>
          </div>
        </div>

        {/* Card 2: 📦 ទិញសម្ភារៈ (Supplies & Packaging) */}
        <div
          onClick={() => {
            soundFx.playPop();
            setMainTypeFilter(mainTypeFilter === 'SUPPLIES' ? 'ALL' : 'SUPPLIES');
          }}
          className={`bg-white p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden shadow-sm space-y-2 hover:shadow-md ${
            mainTypeFilter === 'SUPPLIES'
              ? 'border-purple-400 ring-2 ring-purple-300/60 bg-gradient-to-b from-purple-50/40 to-white'
              : 'border-purple-200/70 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <span>📦</span>
              <span>ទិញសម្ភារៈ (Supplies)</span>
            </span>
            <div className="p-1.5 sm:p-2 bg-purple-100 text-purple-700 rounded-2xl">
              <span className="text-xs font-black">{supplyExpensePct}%</span>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 tracking-tight">
            {(datePreset !== 'ALL' ? filteredSuppliesKhr : totalSuppliesKhr).toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>~ ${(datePreset !== 'ALL' ? filteredSuppliesUsd : totalSuppliesUsd).toFixed(2)} USD</span>
            <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
              {datePreset !== 'ALL' ? filteredSupplies.length : supplyExpenses.length} ប្រតិបត្តិការ
            </span>
          </div>
          <div className="text-[10px] text-purple-700/80 pt-1 border-t border-purple-100 flex items-center justify-between">
            <span>ប្រអប់ ទៀន ខ្សែបូ Topper</span>
            <span className="font-bold underline">
              {mainTypeFilter === 'SUPPLIES' ? '✓ កំពុងជ្រើស' : 'ចុចមើលតែសម្ភារៈ →'}
            </span>
          </div>
        </div>

        {/* Card 3: 🏢 ចំណាយទូទៅ (General Expenses / OPEX) */}
        <div
          onClick={() => {
            soundFx.playPop();
            setMainTypeFilter(mainTypeFilter === 'GENERAL' ? 'ALL' : 'GENERAL');
          }}
          className={`bg-white p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden shadow-sm space-y-2 hover:shadow-md ${
            mainTypeFilter === 'GENERAL'
              ? 'border-sky-400 ring-2 ring-sky-300/60 bg-gradient-to-b from-sky-50/40 to-white'
              : 'border-sky-200/70 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
              <span>🏢</span>
              <span>ចំណាយទូទៅ (OPEX)</span>
            </span>
            <div className="p-1.5 sm:p-2 bg-sky-100 text-sky-700 rounded-2xl">
              <span className="text-xs font-black">{generalExpensePct}%</span>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-600 tracking-tight">
            {(datePreset !== 'ALL' ? filteredGeneralKhr : totalGeneralKhr).toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>~ ${(datePreset !== 'ALL' ? filteredGeneralUsd : totalGeneralUsd).toFixed(2)} USD</span>
            <span className="text-[10px] bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-200">
              {datePreset !== 'ALL' ? filteredGeneral.length : generalExpenses.length} ប្រតិបត្តិការ
            </span>
          </div>
          <div className="text-[10px] text-sky-700/80 pt-1 border-t border-sky-100 flex items-center justify-between">
            <span>ទឹកភ្លើង ប្រាក់ខែ ជួលតូប Ads</span>
            <span className="font-bold underline">
              {mainTypeFilter === 'GENERAL' ? '✓ កំពុងជ្រើស' : 'ចុចមើលតែទូទៅ →'}
            </span>
          </div>
        </div>

        {/* Card 4: 💸 ការចំណាយសរុបរួម (Total Combined Expenses) */}
        <div
          onClick={() => {
            soundFx.playPop();
            setMainTypeFilter('ALL');
          }}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 shadow-sm space-y-2 relative overflow-hidden cursor-pointer hover:border-rose-300 transition-all"
        >
          {datePreset !== 'ALL' && (
            <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl shadow-xs">
              តម្រងថ្ងៃសកម្ម
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {datePreset !== 'ALL' ? `ចំណាយសរុប (${activeDateLabel})` : 'ការចំណាយសរុបរួម (Total)'}
            </span>
            <div className="p-1.5 sm:p-2 bg-rose-50 text-rose-600 rounded-2xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
            {(datePreset !== 'ALL' ? filteredExpensesKhr : totalExpensesKhr).toLocaleString()} ៛
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            ~ ${(datePreset !== 'ALL' ? filteredExpensesUsd : totalExpensesUsd).toFixed(2)} USD (
            {datePreset !== 'ALL' ? filteredExpenses.length : expenses.length} ប្រតិបត្តិការ)
          </div>

          {/* 3-Color Ratio bar */}
          <div className="pt-1 border-t border-rose-50 space-y-1">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${ingredientExpensePct}%` }}
                className="bg-amber-500 h-full"
                title={`គ្រឿងផ្សំ ${ingredientExpensePct}%`}
              />
              <div
                style={{ width: `${supplyExpensePct}%` }}
                className="bg-purple-500 h-full"
                title={`សម្ភារៈ ${supplyExpensePct}%`}
              />
              <div
                style={{ width: `${generalExpensePct}%` }}
                className="bg-sky-500 h-full"
                title={`ចំណាយទូទៅ ${generalExpensePct}%`}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-bold flex-wrap gap-1">
              <span className="text-amber-700">🌾 {ingredientExpensePct}%</span>
              <span className="text-purple-700">📦 {supplyExpensePct}%</span>
              <span className="text-sky-700">🏢 {generalExpensePct}%</span>
            </div>
          </div>
        </div>

        {/* Card 5: 📈 ចំណេញដុល & ចំណេញសុទ្ធ (Profit Analysis) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-sm space-y-2 relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>ប្រាក់ចំណេញ (Profit)</span>
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Net {netMarginPct}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-500">ចំណេញដុល (Gross):</span>
              <span className="text-sm font-black text-emerald-600">
                +{grossProfitKhr.toLocaleString()} ៛
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-1">
              <span className="text-xs font-black text-slate-800">ចំណេញសុទ្ធ (Net):</span>
              <span
                className={`text-lg font-black tracking-tight ${
                  netProfitKhr >= 0 ? 'text-blue-600' : 'text-rose-600'
                }`}
              >
                {netProfitKhr >= 0 ? '+' : ''}{netProfitKhr.toLocaleString()} ៛
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-emerald-50 flex items-center justify-between">
            <span>ចំណូលសរុប៖</span>
            <span className="font-bold text-slate-700">{totalSalesKhr.toLocaleString()} ៛</span>
          </div>
        </div>
      </div>

      {/* Due / Unpaid Expenses Alert Banner */}
      {unpaidExpenses.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                overdueExpenses.length > 0
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/30'
                  : 'bg-amber-500 text-white shadow-amber-500/30'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-slate-900">
                  {overdueExpenses.length > 0
                    ? `🚨 មានវិក្កយបត្រចំនួន ${overdueExpenses.length} ហួសកាលកំណត់បង់ប្រាក់!`
                    : dueTodayExpenses.length > 0
                    ? `⏰ មានវិក្កយបត្រចំនួន ${dueTodayExpenses.length} ដល់ថ្ងៃត្រូវបង់ប្រាក់ថ្ងៃនេះ!`
                    : `⚠️ មានវិក្កយបត្រជំពាក់/មិនទាន់បង់ចំនួន ${unpaidExpenses.length} លើក`}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                  សរុប {totalUnpaidKhr.toLocaleString()} ៛ (${totalUnpaidUsd.toFixed(2)})
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {overdueExpenses.length > 0
                  ? `សូមពិនិត្យទូទាត់ចំណាយជាបន្ទាន់ (${overdueExpenses.map((e) => e.title).slice(0, 2).join(', ')}${overdueExpenses.length > 2 ? '...' : ''}) ដើម្បីចៀសវាងការយឺតយ៉ាវ។`
                  : `ប្រព័ន្ធបានកំណត់រំលឹកកាលបរិច្ឆេទផុតកំណត់បង់ប្រាក់លើទូរសព្ទ & Telegram រួចជាស្រេច។`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setStatusFilter(statusFilter === 'UNPAID' ? 'ALL' : 'UNPAID');
              }}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                statusFilter === 'UNPAID'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {statusFilter === 'UNPAID'
                  ? 'បង្ហាញចំណាយទាំងអស់'
                  : `មើលវិក្កយបត្រត្រូវបង់ (${unpaidExpenses.length})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Expense Type Tabs (បែងចែកដាច់ស្រឡះរវាង គ្រឿងផ្សំ សម្ភារៈ និង ទូទៅ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-1.5 bg-white rounded-3xl border border-rose-100/90 shadow-2xs gap-1.5">
        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            setMainTypeFilter('ALL');
            setSelectedCategory('ALL');
          }}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-2xl font-black text-xs transition-all cursor-pointer ${
            mainTypeFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="text-base">🌟</span>
          <div className="text-left">
            <div>ចំណាយទាំងអស់ (All)</div>
            <div className="text-[10px] font-normal opacity-80">
              {expenses.length} ប្រតិបត្តិការ • {totalExpensesKhr.toLocaleString()} ៛
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            setMainTypeFilter('INGREDIENTS');
            setSelectedCategory('ALL');
          }}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-2xl font-black text-xs transition-all cursor-pointer ${
            mainTypeFilter === 'INGREDIENTS'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.01]'
              : 'text-amber-900 hover:bg-amber-50/70 border border-amber-200/60'
          }`}
        >
          <span className="text-base">🌾</span>
          <div className="text-left">
            <div>ទិញគ្រឿងផ្សំ (Ingredients)</div>
            <div className="text-[10px] font-normal opacity-90">
              {ingredientExpenses.length} ប្រតិបត្តិការ • {totalIngredientsKhr.toLocaleString()} ៛
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            setMainTypeFilter('SUPPLIES');
            setSelectedCategory('ALL');
          }}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-2xl font-black text-xs transition-all cursor-pointer ${
            mainTypeFilter === 'SUPPLIES'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/25 scale-[1.01]'
              : 'text-purple-900 hover:bg-purple-50/70 border border-purple-200/60'
          }`}
        >
          <span className="text-base">📦</span>
          <div className="text-left">
            <div>ទិញសម្ភារៈ (Supplies)</div>
            <div className="text-[10px] font-normal opacity-90">
              {supplyExpenses.length} ប្រតិបត្តិការ • {totalSuppliesKhr.toLocaleString()} ៛
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            setMainTypeFilter('GENERAL');
            setSelectedCategory('ALL');
          }}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-2xl font-black text-xs transition-all cursor-pointer ${
            mainTypeFilter === 'GENERAL'
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/25 scale-[1.01]'
              : 'text-sky-900 hover:bg-sky-50/70 border border-sky-200/60'
          }`}
        >
          <span className="text-base">🏢</span>
          <div className="text-left">
            <div>ចំណាយទូទៅ (General OPEX)</div>
            <div className="text-[10px] font-normal opacity-90">
              {generalExpenses.length} ប្រតិបត្តិការ • {totalGeneralKhr.toLocaleString()} ៛
            </div>
          </div>
        </button>
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
                  setDatePreset('THIS_MONTH');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  datePreset === 'THIS_MONTH'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm ring-2 ring-rose-400/40'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                }`}
              >
                <span>📅 ខែនេះ ({formatKhmerMonthYear(thisMonthStr)})</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  datePreset === 'THIS_MONTH' ? 'bg-white/25 text-white' : 'bg-rose-200 text-rose-900'
                }`}>
                  {expenses.filter((e) => !!e.date && e.date.startsWith(thisMonthStr)).length}
                </span>
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
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  setDatePreset('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  datePreset === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🌐 ទាំងអស់ ({expenses.length})
              </button>
            </div>
          </div>

          {/* Custom Month & Date Pickers */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Specific Month Picker */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all shadow-2xs border ${
              datePreset === 'SPECIFIC_MONTH'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/30'
                : 'bg-slate-50 hover:bg-rose-50/50 border-slate-200 hover:border-rose-300'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-600 hidden sm:inline">រើសខែ៖</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  if (e.target.value) {
                    soundFx.playPop();
                    setSelectedMonth(e.target.value);
                    setDatePreset('SPECIFIC_MONTH');
                  }
                }}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
              {datePreset === 'SPECIFIC_MONTH' && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setDatePreset('THIS_MONTH');
                  }}
                  className="p-0.5 hover:bg-rose-100 text-rose-500 rounded-md transition-colors cursor-pointer"
                  title="ត្រឡប់មកខែនេះ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Specific Day Picker */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all shadow-2xs border ${
              datePreset === 'CUSTOM'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/30'
                : 'bg-slate-50 hover:bg-rose-50/50 border-slate-200 hover:border-rose-300'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-600 hidden sm:inline">រើសថ្ងៃ៖</span>
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
                    setDatePreset('THIS_MONTH');
                  }}
                  className="p-0.5 hover:bg-rose-100 text-rose-500 rounded-md transition-colors cursor-pointer"
                  title="ត្រឡប់មកខែនេះ"
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
            {/* Status Filter Bar */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setStatusFilter('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ស្ថានភាពទាំងអស់
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setStatusFilter('PAID');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                <span>✅ បង់រួច</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    statusFilter === 'PAID'
                      ? 'bg-white/25 text-white'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {expenses.filter((e) => e.paymentStatus !== 'UNPAID').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setStatusFilter('UNPAID');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'UNPAID'
                    ? 'bg-rose-600 text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                <span>⏳ ជំពាក់/ត្រូវបង់</span>
                {unpaidExpenses.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      statusFilter === 'UNPAID'
                        ? 'bg-white/25 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {unpaidExpenses.length}
                  </span>
                )}
              </button>
            </div>

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
                វិក្កយបត្រទាំងអស់ ({expenses.length})
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
              {mainTypeFilter === 'INGREDIENTS' ? (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200 shadow-2xs">
                  <span>🌾</span>
                  <span>គ្រឿងផ្សំធ្វើនំទាំងអស់ ({ingredientExpenses.length} ប្រតិបត្តិការ)</span>
                </div>
              ) : (
                <>
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
                    គ្រប់ប្រភេទ {mainTypeFilter === 'SUPPLIES' ? `(${supplyExpenses.length})` : mainTypeFilter === 'GENERAL' ? `(${generalExpenses.length})` : `(${expenses.length})`}
                  </button>
                  {Object.entries(categoryLabels)
                    .filter(([catKey]) => {
                      if (mainTypeFilter === 'SUPPLIES') {
                        return catKey === 'PACKAGING' || catKey === 'SUPPLIES' || catKey === 'MAINTENANCE';
                      }
                      if (mainTypeFilter === 'GENERAL') {
                        return catKey !== 'INGREDIENTS' && catKey !== 'PACKAGING' && catKey !== 'SUPPLIES';
                      }
                      return true;
                    })
                    .map(([catKey, catVal]) => {
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
                </>
              )}
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

      {/* Table & Cards Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-rose-100/90 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-base shadow-2xs">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm text-slate-800">
                តារាងប្រតិបត្តិការចំណាយ (Expenses Table)
              </h3>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                {filteredExpenses.length} ប្រតិបត្តិការ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {viewMode === 'table' ? 'ទិដ្ឋភាពតារាងពេញលេញ (អាចអូសឆ្វេង-ស្តាំលើទូរស័ព្ទ)' : 'ទិដ្ឋភាពកាតសង្ខេប'}
            </p>
          </div>
        </div>

        {/* View Switcher: Table vs Cards */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setViewMode('table');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📋 តារាង (Table)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setViewMode('cards');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>📱 កាត (Cards)</span>
          </button>
        </div>
      </div>

      {/* Expenses Cards View */}
      {viewMode === 'cards' && (
        <div className="space-y-3 animate-in fade-in duration-200">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-rose-100 p-8 text-center text-slate-400 space-y-3">
            <Receipt className="w-8 h-8 text-rose-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">
              គ្មានទិន្នន័យការចំណាយក្នុងលក្ខខណ្ឌនេះទេ
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setEditingExpense(null);
                  setIsAddExpenseOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ កត់ត្រាចំណាយ</span>
              </button>
              {expenses.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeedSampleExpenses}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🌾 បញ្ចូលទិន្នន័យគំរូ</span>
                </button>
              )}
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
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border ${
                          getExpenseMainType(expense) === 'INGREDIENT'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : getExpenseMainType(expense) === 'SUPPLY'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-sky-100 text-sky-900 border-sky-300'
                        }`}
                      >
                        <span>
                          {getExpenseMainType(expense) === 'INGREDIENT'
                            ? '🌾 គ្រឿងផ្សំ'
                            : getExpenseMainType(expense) === 'SUPPLY'
                            ? '📦 សម្ភារៈ'
                            : '🏢 ទូទៅ'}
                        </span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${catInfo.color}`}>
                        {catInfo.labelKh}
                      </span>
                      {expense.supplier && (
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          🏪 {expense.supplier}
                        </span>
                      )}
                      {expense.retailSellingPriceKhr && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <span>🏷️ លក់រាយ៖ {expense.retailSellingPriceKhr.toLocaleString()} ៛</span>
                          {expense.retailProfitMarginPct && (
                            <span className="text-emerald-600 font-bold">(+{expense.retailProfitMarginPct}%)</span>
                          )}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setCustomDate((expense.date || expense.createdAt || '').slice(0, 10));
                          setDatePreset('CUSTOM');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-rose-50 px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                        title="ចុចដើម្បីមើលចំណាយក្នុងថ្ងៃនេះ"
                      >
                        <Calendar className="w-3 h-3 text-rose-500" />
                        <span>{formatDateDMY(expense.date)}</span>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">
                      {displayQty} {expense.unit || 'ដុំ'}
                    </span>
                    <span className="text-slate-300">@</span>
                    <span className="text-slate-600 font-medium">
                      {displayUnitPriceKhr.toLocaleString()} ៛
                    </span>
                    {expense.retailUnitCostKhr && expense.wholesalePackQty && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        ដើម {expense.retailUnitCostKhr.toLocaleString()} ៛/{expense.retailUnit || 'រាយ'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700 text-[11px]">{expense.paidBy}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (expense.paymentMethod === 'RESERVE_FUND') {
                          soundFx.playPop();
                          updateExpense(expense.id, { paymentMethod: 'CASH_KHR' });
                        } else {
                          soundFx.playSuccess();
                          updateExpense(expense.id, { paymentMethod: 'RESERVE_FUND' });
                        }
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                        expense.paymentMethod === 'RESERVE_FUND'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-emerald-50'
                      }`}
                      title={
                        expense.paymentMethod === 'RESERVE_FUND'
                          ? 'បានកាត់ពីទុនបម្រុងរួច (ចុចដើម្បីបង្វិលសងទុនវិញ)'
                          : 'ចុចដើម្បីកាត់ចំណាយនេះចេញពីទុនបម្រុងភ្លាមៗ'
                      }
                    >
                      {expense.paymentMethod === 'RESERVE_FUND' ? (
                        <>
                          <span className="text-emerald-700 font-black">✓</span>
                          <span>🏦 ដកពីទុនរួច</span>
                        </>
                      ) : (
                        <>
                          <span>+ 🏦 កាត់ពីទុន</span>
                          <span className="text-[9px] text-amber-700">
                            ({expense.paymentMethod === 'CASH_KHR' ? '៛' : expense.paymentMethod === 'BANK_TRANSFER' ? 'ABA' : '$'})
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {expense.notes && (
                  <p className="text-xs text-slate-500 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                    📝 {expense.notes}
                  </p>
                )}

                {/* Due Date & Payment Status Alert for Mobile */}
                {expense.paymentStatus === 'UNPAID' ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="min-w-0">
                        {(() => {
                          const st = getDueStatus(expense.dueDate);
                          if (!st) {
                            return <span className="font-bold text-amber-900">⏳ មិនទាន់បង់ប្រាក់</span>;
                          }
                          if (st.isOverdue) {
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">
                                  🚨 ហួសកំណត់ {Math.abs(st.diffDays)} ថ្ងៃ
                                </span>
                                <span className="text-[10px] text-rose-600 font-mono">({expense.dueDate})</span>
                              </div>
                            );
                          }
                          if (st.isDueToday) {
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-white bg-amber-500 px-1.5 py-0.5 rounded text-[10px] animate-pulse">
                                  ⏰ ដល់ថ្ងៃបង់ថ្ងៃនេះ!
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded text-[10px]">
                                ⏳ សល់ {st.diffDays} ថ្ងៃ
                              </span>
                              <span className="text-[10px] text-amber-700 font-mono">({expense.dueDate})</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMarkAsPaid(expense)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>បង់រួច</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold px-1 flex-wrap">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>បានបង់ប្រាក់រួចរាល់</span>
                    {expense.paidAt && (
                      <span className="text-slate-400 font-normal">({expense.paidAt})</span>
                    )}
                    {expense.dueDate && expense.paidAt && expense.paidAt <= expense.dueDate && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        ✓ បង់មុនថ្ងៃផុតកំណត់
                      </span>
                    )}
                  </div>
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
      )}

      {/* Expenses Table View (Responsive on All Devices with Horizontal Scroll) */}
      {viewMode === 'table' && (
      <div className="bg-white rounded-3xl border border-rose-100/90 shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-200">
        {/* Mobile Swipe Hint */}
        <div className="sm:hidden bg-rose-50/60 border-b border-rose-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 flex items-center justify-between">
          <span>👉 អូសទៅស្តាំ (Swipe ➡️) ដើម្បីមើលគ្រប់ជួរឈរ</span>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className="text-rose-600 font-black underline cursor-pointer"
          >
            ប្តូរទៅមើល «📱 កាត»
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[760px]">
            <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ផ្នែក & បរិយាយការចំណាយ</th>
                <th className="py-3 px-4">ចំនួន & ខ្នាត</th>
                <th className="py-3 px-4">តម្លៃរាយ (Unit Price)</th>
                <th className="py-3 px-4">សរុប (៛ KHR & $)</th>
                <th className="py-3 px-4">កាលបរិច្ឆេទ & អ្នកចំណាយ</th>
                <th className="py-3 px-4">ស្ថានភាព & ផុតកំណត់</th>
                <th className="py-3 px-4 text-center">វិក្កយបត្រ</th>
                <th className="py-3 px-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
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
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setEditingExpense(null);
                          setIsAddExpenseOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>+ កត់ត្រាចំណាយថ្មី (Add Expense)</span>
                      </button>
                      {expenses.length === 0 && (
                        <button
                          type="button"
                          onClick={handleSeedSampleExpenses}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          title="ចុចដើម្បីបញ្ចូលទិន្នន័យចំណាយគំរូ ៥ ប្រតិបត្តិការភ្លាមៗ"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>🌾 បញ្ចូលទិន្នន័យចំណាយគំរូ (Load Sample)</span>
                        </button>
                      )}
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
                        {/* On mobile screens, also show amount & qty directly in first column */}
                        <div className="sm:hidden flex items-center gap-2 mt-0.5 font-sans font-black text-rose-600 text-xs">
                          <span>{expense.amountKhr.toLocaleString()} ៛</span>
                          <span className="text-slate-400 font-normal">(${expense.amountUsd.toFixed(2)})</span>
                          <span className="text-slate-500 font-semibold">• {displayQty} {expense.unit || 'ដុំ'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border ${
                              getExpenseMainType(expense) === 'INGREDIENT'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : getExpenseMainType(expense) === 'SUPPLY'
                                ? 'bg-purple-100 text-purple-900 border-purple-300'
                                : 'bg-sky-100 text-sky-900 border-sky-300'
                            }`}
                          >
                            <span>
                              {getExpenseMainType(expense) === 'INGREDIENT'
                                ? '🌾 គ្រឿងផ្សំ'
                                : getExpenseMainType(expense) === 'SUPPLY'
                                ? '📦 សម្ភារៈ'
                                : '🏢 ទូទៅ'}
                            </span>
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${catInfo.color}`}
                          >
                            {catInfo.labelKh}
                          </span>
                          {expense.supplier && (
                            <span className="text-[10px] text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              🏪 {expense.supplier}
                            </span>
                          )}
                          {expense.retailSellingPriceKhr && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <span>🏷️ លក់រាយ៖ {expense.retailSellingPriceKhr.toLocaleString()} ៛</span>
                              {expense.retailProfitMarginPct && (
                                <span className="text-emerald-600 font-bold">(+{expense.retailProfitMarginPct}%)</span>
                              )}
                            </span>
                          )}
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
                        {expense.retailUnitCostKhr && expense.wholesalePackQty && (
                          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                            ដើម {expense.retailUnitCostKhr.toLocaleString()} ៛/{expense.retailUnit || 'រាយ'}
                          </div>
                        )}
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
                            setCustomDate((expense.date || expense.createdAt || '').slice(0, 10));
                            setDatePreset('CUSTOM');
                          }}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-rose-600 font-semibold text-xs cursor-pointer transition-colors group/date"
                          title="ចុចដើម្បីមើលចំណាយក្នុងថ្ងៃនេះ (Filter by this date)"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover/date:text-rose-500" />
                          <span className="group-hover/date:underline font-bold">{formatDateDMY(expense.date)}</span>
                        </button>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-slate-800 text-[11px]">{expense.paidBy}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (expense.paymentMethod === 'RESERVE_FUND') {
                                soundFx.playPop();
                                updateExpense(expense.id, { paymentMethod: 'CASH_KHR' });
                              } else {
                                soundFx.playSuccess();
                                updateExpense(expense.id, { paymentMethod: 'RESERVE_FUND' });
                              }
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                              expense.paymentMethod === 'RESERVE_FUND'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
                            }`}
                            title={
                              expense.paymentMethod === 'RESERVE_FUND'
                                ? 'បានកាត់ពីទុនបម្រុងរួច (ចុចដើម្បីបង្វិលសងទុនវិញ)'
                                : 'ចុចដើម្បីកាត់ចំណាយនេះចេញពីទុនបម្រុងភ្លាមៗ'
                            }
                          >
                            {expense.paymentMethod === 'RESERVE_FUND' ? (
                              <>
                                <span className="text-emerald-600 font-black">✓</span>
                                <span>🏦 ដកពីទុនរួច</span>
                              </>
                            ) : (
                              <>
                                <span>+ 🏦 កាត់ពីទុន</span>
                                <span className="text-[9px] text-slate-400">
                                  ({expense.paymentMethod === 'CASH_KHR' ? '៛' : expense.paymentMethod === 'BANK_TRANSFER' ? 'ABA' : '$'})
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        {expense.paymentStatus === 'UNPAID' ? (
                          <div className="space-y-1">
                            {(() => {
                              const st = getDueStatus(expense.dueDate);
                              if (!st) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>⏳ មិនទាន់បង់</span>
                                  </span>
                                );
                              }
                              if (st.isOverdue) {
                                return (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                      <span>🚨 ហួស {Math.abs(st.diffDays)} ថ្ងៃ</span>
                                    </span>
                                    <div className="text-[10px] text-rose-600 font-bold font-mono">
                                      ផុតកំណត់៖ {expense.dueDate}
                                    </div>
                                  </div>
                                );
                              }
                              if (st.isDueToday) {
                                return (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500 text-white animate-pulse shadow-2xs">
                                      <span>⏰ ត្រូវបង់ថ្ងៃនេះ!</span>
                                    </span>
                                    <div className="text-[10px] text-amber-700 font-bold font-mono">
                                      {expense.dueDate}
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>សល់ {st.diffDays} ថ្ងៃ</span>
                                  </span>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    ផុតកំណត់៖ {expense.dueDate}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>បានបង់រួច</span>
                            </span>
                            {expense.paidAt && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {expense.paidAt}
                              </div>
                            )}
                            {expense.dueDate && expense.paidAt && expense.paidAt <= expense.dueDate && (
                              <div className="text-[9px] text-emerald-600 font-bold">
                                ✓ បង់មុនថ្ងៃផុតកំណត់
                              </div>
                            )}
                          </div>
                        )}
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
                          {expense.paymentStatus === 'UNPAID' && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsPaid(expense)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 rounded-xl transition-all inline-flex items-center gap-1 text-[10px] font-black cursor-pointer shadow-2xs border border-emerald-200"
                              title="ចុចដើម្បីសម្គាល់ថាបានបង់ប្រាក់រួច (Mark as Paid)"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>បង់រួច</span>
                            </button>
                          )}
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
      )}

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
        onOpenScanner={() => setIsInvoiceScannerOpen(true)}
      />

      {/* AI Invoice Scanner Modal */}
      <InvoiceScannerModal
        isOpen={isInvoiceScannerOpen}
        onClose={() => setIsInvoiceScannerOpen(false)}
      />

      {/* Reserve Fund Management Modal */}
      <ReserveFundModal
        isOpen={isReserveFundOpen}
        onClose={() => setIsReserveFundOpen(false)}
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
