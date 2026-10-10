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
  Table,
  LayoutGrid,
  Image,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { Expense, ExpenseCategory } from '../../types';
import { NewExpenseModal } from './NewExpenseModal';
import { ReserveFundModal } from './ReserveFundModal';
import { InvoiceScannerModal } from './InvoiceScannerModal';
import { soundFx } from '../../utils/audio';
import { formatDateDMY, normalizeDateToYMD } from '../../utils/dateUtils';

export { normalizeDateToYMD };

type DateFilterPreset = 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'SPECIFIC_MONTH' | 'CUSTOM_RANGE';

export const formatKhmerDate = (dateStr: string) => {
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

export const formatKhmerMonthYear = (monthStr: string) => {
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
    deleteExpensesByDateRange,
    clearAllExpenses,
    updateExpenseDatesFrom2024To2026,
    sales,
    exchangeRate,
    reserveFund,
    batchDeductExpensesToReserveFund,
    reconcileReserveFundWithExpenses,
  } = useBakery();

  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isInvoiceScannerOpen, setIsInvoiceScannerOpen] = useState(false);
  const [isReserveFundOpen, setIsReserveFundOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mainTypeFilter, setMainTypeFilter] = useState<'ALL' | 'INGREDIENTS' | 'SUPPLIES' | 'GENERAL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID' | 'UNDEDUCTED_RESERVE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [receiptFilter, setReceiptFilter] = useState<'ALL' | 'WITH_RECEIPT' | 'WITHOUT_RECEIPT'>('ALL');
  const [previewReceiptImage, setPreviewReceiptImage] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isConfirmClearModalOpen, setIsConfirmClearModalOpen] = useState(false);
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
  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateStr(d);
  }, []);
  const thisMonthStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);
  const lastMonthStr = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  // Dynamically extract all available months that actually contain recorded expenses
  const availableExpenseMonths = useMemo(() => {
    const monthMap = new Map<string, number>();
    expenses.forEach((e) => {
      const raw = e.date || e.createdAt || (e as any).timestamp || (e as any).created_at || '';
      const ym = normalizeDateToYMD(raw).slice(0, 7);
      if (ym && ym.length === 7 && !ym.includes('NaN')) {
        monthMap.set(ym, (monthMap.get(ym) || 0) + 1);
      }
    });
    return Array.from(monthMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([ym, count]) => ({ ym, count, labelKh: formatKhmerMonthYear(ym) }));
  }, [expenses]);

  // Date filtering state - Defaults to ALL so all recorded data is ALWAYS visible immediately without blank screen
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });
  // Custom Date Range: ចាប់ពីថ្ងៃទី (Start Date) ដល់ថ្ងៃទី (End Date)
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getLocalDateStr(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => getLocalDateStr(new Date()));

  // One-click sample expenses generator so the list is never empty when testing
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
        dueDate: today,
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
    return undeductedCashExpenses.reduce(
      (sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)),
      0
    );
  }, [undeductedCashExpenses, exchangeRate]);
  const undeductedCashTotalUsd = useMemo(() => {
    return Number((undeductedCashTotalKhr / exchangeRate).toFixed(2));
  }, [undeductedCashTotalKhr, exchangeRate]);

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

  // Helper to get item/product code (e.g. P0006568)
  const getExpenseItemCode = (e?: Partial<Expense> | null): string | undefined => {
    if (!e) return undefined;
    if (e.itemCode && e.itemCode.trim()) return e.itemCode.trim();
    if (e.notes) {
      const m = e.notes.match(/Code:\s*([A-Za-z0-9_-]+)/i);
      if (m) return m[1];
    }
    if (e.id && e.id.startsWith('exp-cake-')) {
      const raw = e.id.replace('exp-cake-', '');
      if (raw.startsWith('P')) return raw;
    }
    return undefined;
  };

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
    TRANSPORTATION: { labelKh: '🚚 ធ្វើដំណើរ & ដឹកជញ្ជូន', color: 'bg-teal-50 text-teal-800 border-teal-200' },
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

      // Status filter (All vs Unpaid vs Paid vs Undeducted Reserve)
      if (statusFilter === 'UNPAID' && e.paymentStatus !== 'UNPAID') return false;
      if (statusFilter === 'PAID' && e.paymentStatus === 'UNPAID') return false;
      if (
        statusFilter === 'UNDEDUCTED_RESERVE' &&
        (e.paymentMethod === 'RESERVE_FUND' || e.paymentStatus === 'UNPAID')
      )
        return false;

      const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchReceipt =
        receiptFilter === 'ALL' ||
        (receiptFilter === 'WITH_RECEIPT' && !!e.receiptImage) ||
        (receiptFilter === 'WITHOUT_RECEIPT' && !e.receiptImage);

      // Date matching (robust universal parser for all formats)
      let matchDate = true;
      const normalizedExpDate = normalizeDateToYMD(e.date || e.createdAt || '');
      const expMonth = normalizedExpDate.slice(0, 7);

      if (datePreset === 'TODAY') {
        matchDate = normalizedExpDate === todayStr;
      } else if (datePreset === 'YESTERDAY') {
        matchDate = normalizedExpDate === yesterdayStr;
      } else if (datePreset === 'WEEK') {
        matchDate = normalizedExpDate >= sevenDaysAgoStr && normalizedExpDate <= todayStr;
      } else if (datePreset === 'THIS_MONTH') {
        matchDate = expMonth === thisMonthStr;
      } else if (datePreset === 'LAST_MONTH') {
        matchDate = expMonth === lastMonthStr;
      } else if (datePreset === 'SPECIFIC_MONTH') {
        matchDate = expMonth === selectedMonth;
      } else if (datePreset === 'CUSTOM_RANGE') {
        const start = customStartDate || '1970-01-01';
        const end = customEndDate || '2099-12-31';
        matchDate = normalizedExpDate >= start && normalizedExpDate <= end;
      }

      const q = searchQuery.toLowerCase().trim();
      const code = (getExpenseItemCode(e) || '').toLowerCase();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        code.includes(q) ||
        e.paidBy.toLowerCase().includes(q) ||
        (e.supplier && e.supplier.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q));

      return matchCat && matchReceipt && matchDate && matchSearch;
    });
  }, [expenses, mainTypeFilter, statusFilter, selectedCategory, receiptFilter, datePreset, customStartDate, customEndDate, selectedMonth, todayStr, yesterdayStr, sevenDaysAgoStr, thisMonthStr, lastMonthStr, searchQuery]);

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
    if (datePreset === 'WEEK') return `៧ ថ្ងៃចុងក្រោយ (${formatKhmerDate(sevenDaysAgoStr)} ដល់ ${formatKhmerDate(todayStr)})`;
    if (datePreset === 'THIS_MONTH') return `ខែនេះ (${formatKhmerMonthYear(thisMonthStr)})`;
    if (datePreset === 'LAST_MONTH') return `ខែមុន (${formatKhmerMonthYear(lastMonthStr)})`;
    if (datePreset === 'SPECIFIC_MONTH') return `ខែ ${formatKhmerMonthYear(selectedMonth)}`;
    return `ចន្លោះពីថ្ងៃ ${formatKhmerDate(customStartDate)} ដល់ ${formatKhmerDate(customEndDate)}`;
  }, [datePreset, todayStr, yesterdayStr, sevenDaysAgoStr, thisMonthStr, lastMonthStr, selectedMonth, customStartDate, customEndDate]);

  // Undeducted expenses matching the current date/month filter
  const undeductedInActiveDate = useMemo(() => {
    return filteredExpenses.filter(
      (e) => e.paymentMethod !== 'RESERVE_FUND' && (!e.paymentStatus || e.paymentStatus === 'PAID')
    );
  }, [filteredExpenses]);

  const undeductedInActiveDateTotalKhr = useMemo(() => {
    return undeductedInActiveDate.reduce(
      (sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)),
      0
    );
  }, [undeductedInActiveDate, exchangeRate]);

  const undeductedInActiveDateTotalUsd = useMemo(() => {
    return Number((undeductedInActiveDateTotalKhr / exchangeRate).toFixed(2));
  }, [undeductedInActiveDateTotalKhr, exchangeRate]);

  // Expenses that will be cleaned based on chosen cleanup mode in the modal
  const targetExpensesToClean = useMemo(() => {
    if (cleanupMode === 'CURRENT_FILTER') {
      return filteredExpenses;
    }
    if (cleanupMode === 'CUSTOM_RANGE') {
      return expenses.filter((e) => {
        const d = normalizeDateToYMD(e.date || e.createdAt || '');
        if (cleanupStartDate && d < cleanupStartDate) return false;
        if (cleanupEndDate && d > cleanupEndDate) return false;
        return true;
      });
    }
    if (cleanupMode === 'OLDER_THAN') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - cleanupOlderDays);
      const cutoffStr = getLocalDateStr(cutoff);
      return expenses.filter((e) => {
        const d = normalizeDateToYMD(e.date || e.createdAt || '');
        return d < cutoffStr;
      });
    }
    return expenses;
  }, [cleanupMode, filteredExpenses, expenses, cleanupStartDate, cleanupEndDate, cleanupOlderDays]);

  const cleanupTotalKhr = useMemo(() => {
    return targetExpensesToClean.reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  }, [targetExpensesToClean, exchangeRate]);

  const cleanupTotalUsd = useMemo(() => {
    return targetExpensesToClean.reduce((sum, e) => sum + e.amountUsd, 0);
  }, [targetExpensesToClean]);

  const handleExecuteCleanup = () => {
    if (targetExpensesToClean.length === 0) return;
    soundFx.playSuccess();
    if (cleanupMode === 'ALL') {
      clearAllExpenses();
    } else {
      deleteExpensesByDateRange(undefined, undefined, targetExpensesToClean.map((e) => e.id));
    }
    setIsConfirmClearModalOpen(false);
  };

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
    const dateLabel = datePreset !== 'ALL' ? (datePreset === 'CUSTOM_RANGE' ? `${customStartDate}_to_${customEndDate}` : datePreset.toLowerCase()) : 'all';
    a.download = `bakery-expenses-${mainTypeFilter.toLowerCase()}-${dateLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Reserve Fund calculations
  const deficitKhr = Math.max(0, reserveFund.targetAmountKhr - reserveFund.currentBalanceKhr);
  const deficitUsd = Number((deficitKhr / exchangeRate).toFixed(2));
  const reserveFundPct = reserveFund.targetAmountKhr > 0
    ? Math.min(100, Math.max(0, Math.round((reserveFund.currentBalanceKhr / reserveFund.targetAmountKhr) * 100)))
    : 100;

  // Detect any expenses that have year 2024
  const count2024 = useMemo(() => {
    return expenses.filter(
      (e) => (e.date && e.date.includes('2024')) || (e.createdAt && e.createdAt.includes('2024'))
    ).length;
  }, [expenses]);

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 pb-40 md:pb-36">
      {/* 2024 to 2026 Quick Migration Banner */}
      {count2024 > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              🗓️
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-800">
                រកឃើញមាន {count2024} ប្រតិបត្តិការដែលជាប់កាលបរិច្ឆេទឆ្នាំ ២០២៤
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                ចុចប៊ូតុងខាងស្តាំដើម្បីប្តូរចូលឆ្នាំ ២០២៦ (តុលា ២០២៦) ដោយស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const count = updateExpenseDatesFrom2024To2026();
              soundFx.playSuccess();
              confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 self-stretch sm:self-auto justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🔄 ប្តូរមកឆ្នាំ ២០២៦ ឥឡូវនេះ</span>
          </button>
        </div>
      )}

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
                setIsConfirmClearModalOpen(true);
              }}
              className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="សម្អាតកំណត់ត្រាចំណាយតាមថ្ងៃខែ ឬទាំងអស់ (Clean Expenses by Date/All)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>សម្អាតទិន្នន័យ</span>
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

      {/* Undeducted Cash Expenses Alert Banner */}
      {undeductedCashExpenses.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/25 shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-amber-950 flex items-center gap-2 flex-wrap">
                <span>
                  {datePreset !== 'ALL'
                    ? `ចំណាយមិនទាន់កាត់ពីទុន (${activeDateLabel})៖`
                    : 'ចំណាយមិនទាន់កាត់ចេញពីទុនបម្រុង៖'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-black">
                  {datePreset !== 'ALL' ? undeductedInActiveDate.length : undeductedCashExpenses.length} ប្រតិបត្តិការ
                </span>
                {datePreset !== 'ALL' && (
                  <span className="text-[11px] text-amber-800 font-normal">
                    (សរុបគ្រប់ខែ៖ {undeductedCashExpenses.length} មុខ)
                  </span>
                )}
              </h4>
              <p className="text-xs text-amber-900/90 mt-0.5 font-medium">
                ទឹកប្រាក់ចំណាយសរុប៖{' '}
                <strong className="font-sans font-black text-rose-600 text-sm">
                  {(datePreset !== 'ALL' ? undeductedInActiveDateTotalKhr : undeductedCashTotalKhr).toLocaleString()} ៛
                </strong>{' '}
                <span className="text-slate-500 font-sans font-bold">
                  (~${(datePreset !== 'ALL' ? undeductedInActiveDateTotalUsd : undeductedCashTotalUsd).toFixed(2)} USD)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setStatusFilter(statusFilter === 'UNDEDUCTED_RESERVE' ? 'ALL' : 'UNDEDUCTED_RESERVE');
              }}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                statusFilter === 'UNDEDUCTED_RESERVE'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white hover:bg-amber-100 text-amber-950 border border-amber-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {statusFilter === 'UNDEDUCTED_RESERVE'
                  ? 'បង្ហាញទាំងអស់'
                  : `មើលបញ្ជី ${datePreset !== 'ALL' ? undeductedInActiveDate.length : undeductedCashExpenses.length} មុខ`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                const listToDeduct = datePreset !== 'ALL' ? undeductedInActiveDate : undeductedCashExpenses;
                if (listToDeduct.length === 0) {
                  alert('មិនមានមុខចំណាយដែលមិនទាន់កាត់នៅក្នុងកាលបរិច្ឆេទដែលបានរើសនេះទេ!');
                  return;
                }
                const label = datePreset !== 'ALL' ? ` (${activeDateLabel})` : '';
                if (
                  confirm(
                    `តើអ្នកចង់កាត់ចំណាយសាច់ប្រាក់ចំនួន ${listToDeduct.length} មុខ${label} (សរុប ${(datePreset !== 'ALL' ? undeductedInActiveDateTotalKhr : undeductedCashTotalKhr).toLocaleString()} ៛) ចេញពីទុនបម្រុងហាងភ្លាមៗមែនទេ?`
                  )
                ) {
                  soundFx.playSuccess();
                  confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
                  batchDeductExpensesToReserveFund(listToDeduct.map((e) => e.id));
                }
              }}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs rounded-2xl shadow-md shadow-amber-600/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                កាត់ទុន ({datePreset !== 'ALL' ? undeductedInActiveDate.length : undeductedCashExpenses.length}) ភ្លាម
              </span>
            </button>

            {onNavigateToReserveFund && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onNavigateToReserveFund();
                }}
                className="p-2.5 bg-white hover:bg-slate-50 border border-amber-300 text-amber-900 rounded-2xl transition shadow-2xs cursor-pointer"
                title="ទៅកាន់ទំព័រគ្រប់គ្រងទុនបម្រុង"
              >
                <ArrowRight className="w-4 h-4 text-amber-800" />
              </button>
            )}
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
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-2xl border border-rose-100 shrink-0">
              <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
              <span>មើលតាមកាលបរិច្ឆេទ៖</span>
            </div>

            {/* Quick Date Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* All Time button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setDatePreset('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  datePreset === 'ALL'
                    ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-400/40'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>🌐 ទាំងអស់</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  datePreset === 'ALL' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {expenses.length}
                </span>
              </button>

              {/* Render all months that contain recorded expense transactions */}
              {availableExpenseMonths.length > 0 ? (
                availableExpenseMonths.map((m) => {
                  const isSelected =
                    (datePreset === 'THIS_MONTH' && m.ym === thisMonthStr) ||
                    (datePreset === 'LAST_MONTH' && m.ym === lastMonthStr) ||
                    (datePreset === 'SPECIFIC_MONTH' && selectedMonth === m.ym);

                  return (
                    <button
                      key={m.ym}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedMonth(m.ym);
                        if (m.ym === thisMonthStr) {
                          setDatePreset('THIS_MONTH');
                        } else if (m.ym === lastMonthStr) {
                          setDatePreset('LAST_MONTH');
                        } else {
                          setDatePreset('SPECIFIC_MONTH');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm ring-2 ring-rose-400/40'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                      }`}
                    >
                      <span>
                        {m.ym === thisMonthStr
                          ? `📅 ខែនេះ (${m.labelKh})`
                          : m.ym === lastMonthStr
                          ? `⏳ ខែមុន (${m.labelKh})`
                          : `🗓️ ${m.labelKh}`}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-rose-200 text-rose-900'
                      }`}>
                        {m.count}
                      </span>
                    </button>
                  );
                })
              ) : (
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
                    0
                  </span>
                </button>
              )}

              {/* 7 Days */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setDatePreset('WEEK');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  datePreset === 'WEEK'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>📆 ៧ ថ្ងៃចុងក្រោយ</span>
                <span className="text-[10px] opacity-80">
                  ({expenses.filter((e) => {
                    const norm = normalizeDateToYMD(e.date || e.createdAt);
                    return norm >= sevenDaysAgoStr && norm <= todayStr;
                  }).length})
                </span>
              </button>

              {/* Today */}
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
                <span className="text-[10px] opacity-80">
                  ({expenses.filter((e) => normalizeDateToYMD(e.date || e.createdAt) === todayStr).length})
                </span>
              </button>

              {/* Yesterday */}
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
                <span className="text-[10px] opacity-80">
                  ({expenses.filter((e) => normalizeDateToYMD(e.date || e.createdAt) === yesterdayStr).length})
                </span>
              </button>

              {/* Date Range Preset Button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setDatePreset('CUSTOM_RANGE');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  datePreset === 'CUSTOM_RANGE'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm ring-2 ring-rose-400/40'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                }`}
              >
                <span>🎯 ចន្លោះកាលបរិច្ឆេទ (Range)</span>
              </button>
            </div>
          </div>

          {/* Custom Month & Date Range Pickers */}
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
                    setDatePreset('ALL');
                  }}
                  className="p-0.5 hover:bg-rose-100 text-rose-500 rounded-md transition-colors cursor-pointer"
                  title="បង្ហាញទាំងអស់"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Range Inputs (ចាប់ពីថ្ងៃទី ... ដល់ថ្ងៃទី ...) */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl transition-all shadow-2xs border flex-wrap ${
              datePreset === 'CUSTOM_RANGE'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/30'
                : 'bg-slate-50 hover:bg-rose-50/50 border-slate-200 hover:border-rose-300'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-slate-600">ចាប់ពីថ្ងៃទី៖</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      soundFx.playPop();
                      setCustomStartDate(e.target.value);
                      setDatePreset('CUSTOM_RANGE');
                    }
                  }}
                  className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>

              <span className="text-slate-300 text-xs hidden sm:inline">➔</span>

              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-slate-600">ដល់ថ្ងៃទី៖</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      soundFx.playPop();
                      setCustomEndDate(e.target.value);
                      setDatePreset('CUSTOM_RANGE');
                    }
                  }}
                  className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>

              {datePreset === 'CUSTOM_RANGE' && (
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
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setStatusFilter(statusFilter === 'UNDEDUCTED_RESERVE' ? 'ALL' : 'UNDEDUCTED_RESERVE');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'UNDEDUCTED_RESERVE'
                    ? 'bg-amber-600 text-white shadow-xs font-black'
                    : 'text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 border border-amber-300'
                }`}
              >
                <span>⚡ មិនទាន់កាត់ពីទុន</span>
                {(datePreset !== 'ALL' ? undeductedInActiveDate.length : undeductedCashExpenses.length) > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      statusFilter === 'UNDEDUCTED_RESERVE'
                        ? 'bg-white/25 text-white'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {datePreset !== 'ALL' ? undeductedInActiveDate.length : undeductedCashExpenses.length}
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

      {/* Expenses Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-rose-100/90 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-base shadow-2xs">
            💸
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm text-slate-800">
                បញ្ជីប្រតិបត្តិការចំណាយ (Expenses List)
              </h3>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                {filteredExpenses.length} ប្រតិបត្តិការ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              បង្ហាញព័ត៌មានលម្អិត តម្លៃ ចំនួន ស្ថានភាពទូទាត់ និងវិក្កយបត្រភ្ជាប់
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
          {/* View Mode Toggle Switch (Table vs Cards) */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setViewMode('TABLE');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>📋 តារាង (Table)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setViewMode('CARDS');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>🗂️ កាត (Cards)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setIsInvoiceScannerOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="ស្កេនរូបភាពវិក្កយបត្រដោយ AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>📷 ស្កេនវិក្កយបត្រ (AI)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-2xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ បញ្ចូលចំណាយ</span>
          </button>
        </div>
      </div>

      {/* Main Expenses View: Table vs Cards */}
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
        ) : viewMode === 'TABLE' ? (
          /* Table View */
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-[11px] font-bold tracking-wider">
                    <th className="py-2.5 px-2.5 text-center whitespace-nowrap w-16"># / ថ្ងៃ</th>
                    <th className="py-2.5 px-3 whitespace-nowrap min-w-[170px]">📝 ឈ្មោះចំណាយ / មុខទំនិញ</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">🏷️ ប្រភេទ</th>
                    <th className="py-2.5 px-2.5 text-right whitespace-nowrap">📦 បរិមាណ & តម្លៃរាយ</th>
                    <th className="py-2.5 px-2.5 text-right whitespace-nowrap">💰 សរុប (៛ KHR)</th>
                    <th className="py-2.5 px-2.5 whitespace-nowrap">👤 អ្នកចំណាយ & វិធីទូទាត់</th>
                    <th className="py-2.5 px-2.5 text-center whitespace-nowrap">⏰ ស្ថានភាព & វិក្កយបត្រ</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap sticky right-0 bg-slate-900 z-20 shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.3)]">
                      ⚙️ សកម្មភាព
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((expense, idx) => {
                    const catInfo = categoryLabels[expense.category] || {
                      labelKh: expense.category,
                      color: 'bg-slate-100 text-slate-700 border-slate-200',
                    };
                    const displayQty = expense.quantity ?? 1;
                    const displayUnitPriceKhr =
                      expense.unitPriceKhr ?? Math.round(expense.amountKhr / displayQty);

                    return (
                      <tr
                        key={expense.id}
                        className="group hover:bg-rose-50/50 transition-colors"
                      >
                        {/* Index & Date */}
                        <td className="py-2.5 px-2.5 whitespace-nowrap text-center">
                          <span className="text-[10px] text-slate-400 font-mono font-bold block leading-tight">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playPop();
                              const expD = (expense.date || expense.createdAt || '').slice(0, 10);
                              setCustomStartDate(expD);
                              setCustomEndDate(expD);
                              setDatePreset('CUSTOM_RANGE');
                            }}
                            className="font-bold text-slate-700 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer text-[11px] mt-0.5"
                            title="ចុចដើម្បីមើលតែថ្ងៃនេះ"
                          >
                            <Calendar className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>{formatDateDMY(expense.date)}</span>
                          </button>
                        </td>

                        {/* Title, Item Code, Supplier, & Notes */}
                        <td className="py-2.5 px-3 min-w-[170px] max-w-[260px]">
                          <div className="font-black text-slate-900 text-xs leading-snug line-clamp-2" title={expense.title}>
                            {expense.title}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            {getExpenseItemCode(expense) && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs" title={`លេខកូដទំនិញ៖ ${getExpenseItemCode(expense)}`}>
                                🏷️ {getExpenseItemCode(expense)}
                              </span>
                            )}
                            {expense.supplier && (
                              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]" title={expense.supplier}>
                                🏪 {expense.supplier}
                              </span>
                            )}
                          </div>
                          {expense.notes && !expense.notes.startsWith('Code: ' + (getExpenseItemCode(expense) || '')) && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={expense.notes}>
                              📝 {expense.notes}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black border ${
                                getExpenseMainType(expense) === 'INGREDIENT'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : getExpenseMainType(expense) === 'SUPPLY'
                                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                                  : 'bg-sky-100 text-sky-900 border-sky-300'
                              }`}
                            >
                              {getExpenseMainType(expense) === 'INGREDIENT'
                                ? '🌾 គ្រឿងផ្សំ'
                                : getExpenseMainType(expense) === 'SUPPLY'
                                ? '📦 សម្ភារៈ'
                                : '🏢 ទូទៅ'}
                            </span>
                            <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold border ${catInfo.color}`}>
                              {catInfo.labelKh}
                            </span>
                          </div>
                        </td>

                        {/* Quantity & Unit Price */}
                        <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                          <div className="font-black text-slate-800 text-xs">
                            {displayQty} <span className="text-slate-500 text-[10px] font-normal">{expense.unit || 'ដុំ'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            @ {displayUnitPriceKhr.toLocaleString()} ៛
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                          <div className="font-black text-rose-600 text-xs">
                            {expense.amountKhr.toLocaleString()} ៛
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">
                            ~ ${expense.amountUsd.toFixed(2)} USD
                          </div>
                        </td>

                        {/* Paid By & Payment Method */}
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          <div className="text-xs font-bold text-slate-800">{expense.paidBy}</div>
                          <div className="mt-1">
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
                              className={`text-[9px] px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer border inline-flex items-center gap-1 ${
                                expense.paymentMethod === 'RESERVE_FUND'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
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
                                  <span>🏦 ទុនបម្រុង</span>
                                </>
                              ) : (
                                <>
                                  <span>🏦 {expense.paymentMethod === 'CASH_KHR' ? 'សាច់ប្រាក់ (៛)' : expense.paymentMethod === 'BANK_TRANSFER' ? 'ABA/ធនាគារ' : 'ដុល្លារ ($)'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Payment Status & Receipt */}
                        <td className="py-2.5 px-2.5 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-1">
                            {expense.paymentStatus === 'UNPAID' ? (
                              <button
                                type="button"
                                onClick={() => handleMarkAsPaid(expense)}
                                className="px-2 py-0.5 bg-amber-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black shadow-2xs transition-all flex items-center gap-0.5 cursor-pointer"
                                title="ចុចដើម្បីកំណត់ថាបានបង់ប្រាក់រួច"
                              >
                                <Clock className="w-2.5 h-2.5" />
                                <span>ជំពាក់ (បង់ឥឡូវ)</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>បង់រួច</span>
                              </span>
                            )}

                            {expense.receiptImage ? (
                              <div className="flex items-center justify-center gap-1">
                                <img
                                  src={expense.receiptImage}
                                  alt="Thumbnail"
                                  onClick={() => setPreviewReceiptImage(expense.receiptImage || null)}
                                  className="w-5 h-5 rounded object-cover border border-rose-200 cursor-pointer shadow-2xs hover:scale-125 transition-transform"
                                  title="ចុចដើម្បីពង្រីករូបវិក្កយបត្រ"
                                />
                                <button
                                  type="button"
                                  onClick={() => setPreviewReceiptImage(expense.receiptImage || null)}
                                  className="px-1.5 py-0.2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[9px] font-bold transition-colors cursor-pointer"
                                  title="មើលរូបភាពវិក្កយបត្រធំ"
                                >
                                  មើលរូប
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  soundFx.playPop();
                                  setEditingExpense(expense);
                                  setIsAddExpenseOpen(true);
                                }}
                                className="px-1.5 py-0.2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded border border-slate-200 text-[9px] font-medium flex items-center gap-0.5 cursor-pointer transition-colors"
                                title="ចុចដើម្បីភ្ជាប់រូបភាពវិក្កយបត្រ"
                              >
                                <Camera className="w-2.5 h-2.5" />
                                <span>+ រូប</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Actions (Sticky Right) */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap sticky right-0 bg-white/95 group-hover:bg-rose-50/95 backdrop-blur-xs shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.08)] z-10">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playPop();
                                setEditingExpense(expense);
                                setIsAddExpenseOpen(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-pink-700 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-90"
                              title="កែប្រែ (Edit)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playPop();
                                setExpenseToDelete(expense);
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-90"
                              title="លុប (Delete)"
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
        ) : (
          /* Cards View */
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
                {/* Header: Title, Item Code & Total */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-slate-900 text-sm">{expense.title}</h4>
                      {getExpenseItemCode(expense) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
                          <span>🏷️ កូដ៖</span>
                          <span className="text-rose-600 font-black">{getExpenseItemCode(expense)}</span>
                        </span>
                      )}
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
                          const expD = (expense.date || expense.createdAt || '').slice(0, 10);
                          setCustomStartDate(expD);
                          setCustomEndDate(expD);
                          setDatePreset('CUSTOM_RANGE');
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
                                <span className="text-[10px] text-rose-600 font-medium">({formatDateDMY(expense.dueDate)})</span>
                              </div>
                            );
                          }
                          if (st.isDueToday) {
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-white bg-amber-500 px-1.5 py-0.5 rounded text-[10px] animate-pulse">
                                  ⏰ ដល់ថ្ងៃបង់ថ្ងៃនេះ!
                                </span>
                                <span className="text-[10px] text-amber-700 font-medium">({formatDateDMY(expense.dueDate)})</span>
                              </div>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded text-[10px]">
                                ⏳ សល់ {st.diffDays} ថ្ងៃ
                              </span>
                              <span className="text-[10px] text-amber-700 font-medium">({formatDateDMY(expense.dueDate)})</span>
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
                    {expense.dueDate && (
                      <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200/70 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>ផុតកំណត់៖ {formatDateDMY(expense.dueDate)}</span>
                      </span>
                    )}
                    {expense.paidAt && (
                      <span className="text-slate-500 font-normal">({formatDateDMY(expense.paidAt)})</span>
                    )}
                    {expense.dueDate && expense.paidAt && expense.paidAt <= expense.dueDate && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        ✓ បង់ទាន់ពេល
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: Receipt & Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  {expense.receiptImage ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={expense.receiptImage}
                        alt="Receipt"
                        onClick={() => setPreviewReceiptImage(expense.receiptImage || null)}
                        className="w-8 h-8 rounded-lg object-cover border border-rose-200 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewReceiptImage(expense.receiptImage || null)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>មើលរូបវិក្កយបត្រ</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setEditingExpense(expense);
                        setIsAddExpenseOpen(true);
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl border border-slate-200 transition-all inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>+ ភ្ជាប់វិក្កយបត្រ</span>
                    </button>
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

        {/* List Footer Summary */}
        {filteredExpenses.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-semibold shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                កំពុងបង្ហាញ <strong>{filteredExpenses.length}</strong> នៃ <strong>{expenses.length}</strong> ប្រតិបត្តិការចំណាយ
                {datePreset !== 'ALL' && <span className="text-rose-600 ml-1">({activeDateLabel})</span>}
              </span>
            </div>
            <div className="text-right">
              សរុបចំណាយ៖ <strong className="font-black text-rose-600">{filteredExpensesKhr.toLocaleString()} ៛</strong> (~${filteredExpensesUsd.toFixed(2)})
            </div>
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

      {/* Clear Expenses Manager Modal with Date Filtering (Portal to Body) */}
      {isConfirmClearModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 flex flex-col space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    សម្អាតទិន្នន័យចំណាយ (Expense Cleanup)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ជ្រើសរើសជម្រើសសម្អាតតាមថ្ងៃខែ តាមការច្រោះ ឬទាំងអស់
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmClearModalOpen(false)}
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
                <span className="text-[10px] opacity-75">({filteredExpenses.length})</span>
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
                <span className="text-[10px] opacity-75">({expenses.length})</span>
              </button>
            </div>

            {/* Mode-specific configuration body */}
            {cleanupMode === 'CURRENT_FILTER' && (
              <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-black">
                  <Filter className="w-3.5 h-3.5" />
                  <span>លក្ខខណ្ឌកំពុងច្រោះលើតារាងបច្ចុប្បន្ន</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  <p>• <strong>កាលបរិច្ឆេទ:</strong> {activeDateLabel}</p>
                  {selectedCategory !== 'ALL' && (
                    <p>• <strong>ប្រភេទចំណាយ:</strong> {categoryLabels[selectedCategory as ExpenseCategory]?.labelKh || selectedCategory}</p>
                  )}
                  {statusFilter !== 'ALL' && (
                    <p>• <strong>ស្ថានភាព:</strong> {statusFilter === 'PAID' ? 'បានទូទាត់រួច' : 'ជំពាក់/មិនទាន់ទូទាត់'}</p>
                  )}
                  {searchQuery && (
                    <p>• <strong>ពាក្យស្វែងរក:</strong> "{searchQuery}"</p>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  💡 នឹងសម្អាតតែទិន្នន័យចំនួន <strong>{filteredExpenses.length}</strong> ប្រតិបត្តិការ ដែលត្រូវគ្នានឹងការច្រោះខាងលើប៉ុណ្ណោះ។
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
                        setCleanupStartDate(`${thisMonthStr}-01`);
                        setCleanupEndDate(todayStr);
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      ខែនេះ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(1);
                        d.setMonth(d.getMonth() - 1);
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
                        setCleanupStartDate(`${y}-${m}-01`);
                        setCleanupEndDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      ខែមុន
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
                  លុបតែទិន្នន័យចំណាយដែលចាស់ជាង៖
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
                  💡 នឹងលុបចំណាយទាំងអស់ដែលបានកត់ត្រាចាស់ជាង {cleanupOlderDays} ថ្ងៃមុន។
                </p>
              </div>
            )}

            {cleanupMode === 'ALL' && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-amber-800 text-xs font-black">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>ប្រុងប្រយ័ត្ន៖ សម្អាតទិន្នន័យចំណាយទាំងអស់</span>
                </div>
                <p className="text-xs text-slate-600">
                  រាល់កំណត់ត្រាចំណាយទាំងអស់ចំនួន <strong>{expenses.length}</strong> ប្រតិបត្តិការ នឹងត្រូវលុបចេញទាំងស្រុង។
                </p>
              </div>
            )}

            {/* Live Impact Preview Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  ទិន្នន័យដែលនឹងត្រូវសម្អាត
                </span>
                <span className="text-base font-black text-rose-400">
                  {targetExpensesToClean.length} ប្រតិបត្តិការ
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
                onClick={() => setIsConfirmClearModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                disabled={targetExpensesToClean.length === 0}
                onClick={handleExecuteCleanup}
                className={`flex-1 py-3 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                  targetExpensesToClean.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25 cursor-pointer active:scale-95'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {targetExpensesToClean.length === 0
                    ? 'គ្មានទិន្នន័យត្រូវលុប'
                    : `យល់ព្រមសម្អាត (${targetExpensesToClean.length})`}
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
