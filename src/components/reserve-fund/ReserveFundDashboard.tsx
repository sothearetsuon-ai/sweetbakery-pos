import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Wallet,
  Plus,
  RotateCcw,
  Zap,
  Trash2,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
import { formatDateDMY } from '../../utils/dateUtils';
import { ReserveFundModal } from '../expenses/ReserveFundModal';

interface ReserveFundDashboardProps {
  onNavigateToExpenses?: () => void;
}

export const ReserveFundDashboard: React.FC<ReserveFundDashboardProps> = ({
  onNavigateToExpenses,
}) => {
  const {
    reserveFund,
    updateReserveTarget,
    adjustCurrentBalance,
    replenishReserveFund,
    exchangeRate,
    expenses,
    reconcileReserveFundWithExpenses,
    batchDeductExpensesToReserveFund,
    deleteReserveFundTransaction,
    clearReserveFundHistory,
    triggerAutoCloudSync,
  } = useBakery();

  // Modal / Action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeActionTab, setActiveActionTab] = useState<'quick-replenish' | 'target-setting' | 'balance-adjust' | null>(null);
  const [isUndeductedListOpen, setIsUndeductedListOpen] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Quick replenish inline form state
  const deficitKhr = Math.max(0, reserveFund.targetAmountKhr - reserveFund.currentBalanceKhr);
  const deficitUsd = Number((deficitKhr / exchangeRate).toFixed(2));
  const reserveFundPct = reserveFund.targetAmountKhr > 0
    ? Math.min(100, Math.max(0, Math.round((reserveFund.currentBalanceKhr / reserveFund.targetAmountKhr) * 100)))
    : 100;

  const [replenishAmountKhr, setReplenishAmountKhr] = useState<number>(deficitKhr > 0 ? deficitKhr : 100000);
  const [replenishSource, setReplenishSource] = useState<string>('ពីប្រាក់ចំណូលលក់ប្រចាំថ្ងៃ');
  const [replenishNotes, setReplenishNotes] = useState<string>('');
  const [replenishCurrency, setReplenishCurrency] = useState<'KHR' | 'USD'>('KHR');
  const [customUsdAmount, setCustomUsdAmount] = useState<string>(deficitUsd > 0 ? deficitUsd.toString() : '25');

  // Target inline edit state
  const [targetKhrInput, setTargetKhrInput] = useState<number>(reserveFund.targetAmountKhr);
  const [syncTargetBalance, setSyncTargetBalance] = useState<boolean>(true);

  // Direct balance adjustment inline state
  const [directBalanceKhr, setDirectBalanceKhr] = useState<number>(reserveFund.currentBalanceKhr);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // History filtering & search
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyFilterType, setHistoryFilterType] = useState<string>('ALL');

  // Banner feedback
  const [statusFeedback, setStatusFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showFeedback = (msg: string, type: 'success' | 'info' = 'success') => {
    setStatusFeedback({ message: msg, type });
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleSyncCloud = async () => {
    try {
      soundFx.playPop();
      setIsSyncingCloud(true);
      await triggerAutoCloudSync();
      soundFx.playSuccess();
      showFeedback('បានធ្វើសមកាលកម្មទិន្នន័យ (Cloud Sync) ទៅកាន់ទូរស័ព្ទដោយជោគជ័យ!');
    } catch (err) {
      console.error('Manual sync error:', err);
    } finally {
      setIsSyncingCloud(false);
    }
  };


  // Undeducted cash expenses
  const undeductedCashExpenses = useMemo(() => {
    return expenses.filter(
      (e) =>
        e.paymentMethod !== 'RESERVE_FUND' &&
        (!e.paymentStatus || e.paymentStatus === 'PAID')
    );
  }, [expenses]);

  const undeductedCashTotalKhr = useMemo(() => {
    return undeductedCashExpenses.reduce(
      (sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)),
      0
    );
  }, [undeductedCashExpenses, exchangeRate]);

  // Total withdrawn from reserve fund
  const totalWithdrawnKhr = useMemo(() => {
    return (reserveFund.history || [])
      .filter((tx) => tx.type === 'WITHDRAW')
      .reduce((sum, tx) => sum + (tx.amountKhr || 0), 0);
  }, [reserveFund.history]);

  // Filtered transactions history
  const filteredHistory = useMemo(() => {
    const list = [...(reserveFund.history || [])].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date).getTime();
      const timeB = new Date(b.createdAt || b.date).getTime();
      return timeB - timeA;
    });

    return list.filter((tx) => {
      if (historyFilterType !== 'ALL' && tx.type !== historyFilterType) {
        return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase().trim();
        const matchReason = tx.reason?.toLowerCase().includes(q);
        const matchSource = tx.source?.toLowerCase().includes(q);
        const matchBy = tx.performedBy?.toLowerCase().includes(q);
        return matchReason || matchSource || matchBy;
      }
      return true;
    });
  }, [reserveFund.history, historyFilterType, historySearch]);

  // Quick preset replenish handler
  const handleQuickPresetReplenish = (khrAmount: number) => {
    soundFx.playPop();
    const usd = Number((khrAmount / exchangeRate).toFixed(2));
    replenishReserveFund(
      khrAmount,
      usd,
      'ពីប្រាក់ចំណូលលក់ប្រចាំថ្ងៃ',
      `បូកបង្គ្រប់ទុនបម្រុងរហ័ស (+${khrAmount.toLocaleString()} ៛)`
    );
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}
    soundFx.playSuccess();
    showFeedback(`បានបូកបង្គ្រប់ទុនបម្រុងចំនួន +${khrAmount.toLocaleString()} ៛ ($${usd}) ដោយជោគជ័យ!`);
  };

  // Submit replenish
  const handleReplenishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();

    let finalKhr = 0;
    let finalUsd = 0;

    if (replenishCurrency === 'KHR') {
      finalKhr = Number(replenishAmountKhr) || 0;
      finalUsd = Number((finalKhr / exchangeRate).toFixed(2));
    } else {
      finalUsd = parseFloat(customUsdAmount) || 0;
      finalKhr = Math.round(finalUsd * exchangeRate);
    }

    if (finalKhr <= 0) {
      alert('សូមបញ្ចូលចំនួនទឹកប្រាក់ដែលត្រូវបូកបង្គ្រប់!');
      return;
    }

    replenishReserveFund(
      finalKhr,
      finalUsd,
      replenishSource,
      replenishNotes.trim() || `បូកបង្គ្រប់ទុនបម្រុងពី (${replenishSource})`
    );

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    soundFx.playSuccess();
    showFeedback(`បានបូកបង្គ្រប់ទុនបម្រុងចំនួន ${finalKhr.toLocaleString()} ៛ ($${finalUsd.toFixed(2)}) ដោយជោគជ័យ!`);
    setActiveActionTab(null);
  };

  // Submit target update
  const handleTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();
    const khr = Number(targetKhrInput);
    if (khr <= 0) {
      alert('សូមបញ្ចូលចំនួនទុនបម្រុងគោលដៅត្រឹមត្រូវ!');
      return;
    }
    const usd = Number((khr / exchangeRate).toFixed(2));
    updateReserveTarget(khr, usd, syncTargetBalance);
    soundFx.playSuccess();
    showFeedback(`បានកែប្រែទុនបម្រុងគោលដៅទៅ ${khr.toLocaleString()} ៛ ($${usd}) រួចរាល់!`);
    setActiveActionTab(null);
  };

  // Submit direct balance adjust
  const handleBalanceAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();
    const khr = Number(directBalanceKhr);
    if (khr < 0) {
      alert('សូមបញ្ចូលចំនួនទឹកប្រាក់ទុនជាក់ស្តែងត្រឹមត្រូវ!');
      return;
    }
    const usd = Number((khr / exchangeRate).toFixed(2));
    adjustCurrentBalance(khr, usd, adjustReason.trim() || undefined);
    soundFx.playSuccess();
    showFeedback(`បានកែសម្រួលទុនជាក់ស្តែងក្នុងថតទៅ ${khr.toLocaleString()} ៛ ($${usd}) រួចរាល់!`);
    setActiveActionTab(null);
  };

  // Reconcile with expenses
  const handleReconcile = () => {
    soundFx.playPop();
    const rf = reconcileReserveFundWithExpenses();
    soundFx.playSuccess();
    showFeedback(
      `បានគណនាកាត់រាល់ចំណាយចេញពីទុនបម្រុងរួចរាល់! សមតុល្យជាក់ស្តែងនៅសល់៖ ${rf.currentBalanceKhr.toLocaleString()} ៛ ($${rf.currentBalanceUsd.toFixed(2)})`
    );
  };

  // Export CSV
  const handleExportHistoryCsv = () => {
    const list = filteredHistory.length > 0 ? filteredHistory : (reserveFund.history || []);
    const csvRows = [
      ['Date', 'Type', 'AmountKHR', 'AmountUSD', 'Reason', 'Source', 'PerformedBy'].join(','),
      ...list.map((tx) =>
        [
          `"${tx.date || tx.createdAt}"`,
          tx.type,
          tx.amountKhr,
          tx.amountUsd?.toFixed(2) || '0.00',
          `"${(tx.reason || '').replace(/"/g, '""')}"`,
          `"${(tx.source || '').replace(/"/g, '""')}"`,
          `"${tx.performedBy || 'Cashier'}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reserve-fund-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Clear history
  const handleClearHistory = () => {
    soundFx.playPop();
    if (window.confirm('តើអ្នកពិតជាចង់សម្អាតប្រវត្តិប្រតិបត្តិការទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។')) {
      clearReserveFundHistory();
      soundFx.playSuccess();
      showFeedback('បានសម្អាតប្រវត្តិប្រតិបត្តិការទាំងអស់រួចរាល់!');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 pb-24 md:pb-6">
      {/* Top Banner Feedback */}
      {statusFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{statusFeedback.message}</span>
          </div>
          <button
            onClick={() => setStatusFeedback(null)}
            className="text-xs text-emerald-600 hover:text-emerald-900 font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <span>🏦</span>
                <span>គ្រប់គ្រងទុនបម្រុងហាង & សាច់ប្រាក់រាយ</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Reserve Fund & Petty Cash Management • តាមដានសមតុល្យជាក់ស្តែង និងការបូកបង្គ្រប់ទុន
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {onNavigateToExpenses && (
            <button
              onClick={() => {
                soundFx.playPop();
                onNavigateToExpenses();
              }}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-black transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="ទៅកាន់តារាងគ្រប់គ្រងការចំណាយ"
            >
              <Receipt className="w-4 h-4 text-rose-500" />
              <span>💸 មើលចំណាយ</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReconcile}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-black transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="គណនាកាត់រាល់ចំណាយសាច់ប្រាក់ទាំងអស់ចេញពីទុនបម្រុងឡើងវិញ"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>🔄 គណនាកាត់ពីទុន</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setActiveActionTab(activeActionTab === 'quick-replenish' ? null : 'quick-replenish');
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ បូកបង្គ្រប់ទុន</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setIsModalOpen(true);
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="បើកផ្ទាំងលម្អិតពេញលេញ"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>ការកំណត់</span>
          </button>
        </div>
      </div>

      {/* Undeducted Cash Expenses Alert Banner */}
      {undeductedCashExpenses.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl flex-shrink-0">
                <Zap className="w-6 h-6 fill-amber-500 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-amber-950 text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                  <span>⚡ មានចំណាយសាច់ប្រាក់ {undeductedCashExpenses.length} ប្រតិបត្តិការមិនទាន់កាត់ចេញពីទុនបម្រុង</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  ទឹកប្រាក់ចំណាយសរុប៖ <strong className="font-sans font-black text-rose-600">{undeductedCashTotalKhr.toLocaleString()} ៛</strong> (~${(undeductedCashTotalKhr / exchangeRate).toFixed(2)})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <button
                type="button"
                onClick={handleSyncCloud}
                disabled={isSyncingCloud}
                className="flex-1 md:flex-initial px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="រុញទិន្នន័យចំណាយទាំងអស់ឡើងទៅ Cloud ដើម្បីឱ្យទូរស័ព្ទ sync ស្មើគ្នា"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin text-amber-600' : 'text-slate-600'}`} />
                <span>{isSyncingCloud ? 'កំពុង Sync...' : 'Sync Cloud ទៅទូរស័ព្ទ'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsUndeductedListOpen(!isUndeductedListOpen);
                }}
                className="flex-1 md:flex-initial px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isUndeductedListOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isUndeductedListOpen ? 'លាក់បញ្ជី' : `ពិនិត្យ ${undeductedCashExpenses.length} មុខ`}</span>
                {isUndeductedListOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  if (
                    confirm(
                      `តើអ្នកចង់កាត់ចំណាយសាច់ប្រាក់ចំនួន ${undeductedCashExpenses.length} ប្រតិបត្តិការ (សរុប ${undeductedCashTotalKhr.toLocaleString()} ៛) ចេញពីទុនបម្រុងឥឡូវនេះមែនទេ?`
                    )
                  ) {
                    soundFx.playSuccess();
                    batchDeductExpensesToReserveFund(undeductedCashExpenses.map((e) => e.id));
                    showFeedback(`បានកាត់ចំណាយសាច់ប្រាក់ចំនួន ${undeductedCashExpenses.length} មុខចេញពីទុនបម្រុងដោយជោគជ័យ!`);
                  }
                }}
                className="w-full md:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>កាត់ចំណាយទាំងអស់ ({undeductedCashExpenses.length}) ភ្លាម</span>
              </button>
            </div>
          </div>

          {/* Expandable Table for undeducted cash expenses */}
          {isUndeductedListOpen && (
            <div className="mt-3 pt-3 border-t border-amber-200 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-950">
                  📋 បញ្ជីមុខចំណាយសាច់ប្រាក់ទាំង {undeductedCashExpenses.length} មិនទាន់កាត់ចេញពីទុន៖
                </span>
                <span className="text-[11px] text-amber-800">
                  (ចុច "កាត់ទុន" លើមុខនីមួយៗ ឬកាត់ទាំងអស់ខាងលើ)
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {undeductedCashExpenses.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-2.5 bg-white/90 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2 shadow-xs hover:bg-white transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold font-sans text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate text-xs">
                          {exp.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>📅 {exp.date}</span>
                          <span>• {exp.category}</span>
                          <span>• ដោយ៖ {exp.paidBy || 'Admin'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-sans font-black text-rose-600 text-xs">
                          {exp.amountKhr.toLocaleString()} ៛
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          ${(exp.amountKhr / exchangeRate).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          batchDeductExpensesToReserveFund([exp.id]);
                          showFeedback(`បានកាត់ចំណាយ "${exp.title}" ចេញពីទុនបម្រុង!`);
                        }}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold cursor-pointer transition"
                      >
                        កាត់ទុន
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      {/* 4 Core Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: សមតុល្យជាក់ស្តែងបច្ចុប្បន្ន */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-emerald-500/80 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <span>🏦</span>
              <span>សមតុល្យជាក់ស្តែង (Balance)</span>
            </span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                deficitKhr > 0
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {deficitKhr > 0 ? `នៅសល់ ${reserveFundPct}%` : 'គ្រប់ ១០០%'}
            </span>
          </div>

          <div className="pt-1">
            <div className="text-2xl sm:text-3xl font-black font-sans text-emerald-700 dark:text-emerald-400 tracking-tight">
              {reserveFund.currentBalanceKhr.toLocaleString()} ៛
            </div>
            <div className="text-xs font-bold font-sans text-slate-500 dark:text-slate-400 mt-0.5">
              ~${reserveFund.currentBalanceUsd.toFixed(2)} USD
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
            <span className="text-[11px] text-slate-500">សាច់ប្រាក់រាយក្នុងថត</span>
            <button
              onClick={() => {
                soundFx.playPop();
                setDirectBalanceKhr(reserveFund.currentBalanceKhr);
                setActiveActionTab(activeActionTab === 'balance-adjust' ? null : 'balance-adjust');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
            >
              កែសម្រួលផ្ទាល់
            </button>
          </div>
        </div>

        {/* Card 2: ទុនបម្រុងគោលដៅ */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🎯</span>
              <span>គោលដៅកំណត់ (Target)</span>
            </span>
            <button
              onClick={() => {
                soundFx.playPop();
                setTargetKhrInput(reserveFund.targetAmountKhr);
                setActiveActionTab(activeActionTab === 'target-setting' ? null : 'target-setting');
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              កែប្រែ
            </button>
          </div>

          <div className="pt-1">
            <div className="text-2xl sm:text-3xl font-black font-sans text-slate-800 dark:text-white tracking-tight">
              {reserveFund.targetAmountKhr.toLocaleString()} ៛
            </div>
            <div className="text-xs font-bold font-sans text-slate-500 dark:text-slate-400 mt-0.5">
              ~${reserveFund.targetAmountUsd.toFixed(2)} USD
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
            <span className="text-[11px] text-slate-500">ទុនស្តង់ដារប្រចាំហាង</span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">អត្រា {exchangeRate}៛/$</span>
          </div>
        </div>

        {/* Card 3: ចំនួនខ្វះត្រូវបង្គ្រប់ */}
        <div className={`p-5 rounded-3xl border shadow-sm space-y-2 ${
          deficitKhr > 0
            ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
            : 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>⚖️</span>
              <span>{deficitKhr > 0 ? 'ចំនួនត្រូវបូកបង្គ្រប់ (Deficit)' : 'ស្ថានភាពទុន (Status)'}</span>
            </span>
            {deficitKhr > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>

          <div className="pt-1">
            {deficitKhr > 0 ? (
              <>
                <div className="text-2xl sm:text-3xl font-black font-sans text-rose-600 dark:text-rose-400 tracking-tight">
                  +{deficitKhr.toLocaleString()} ៛
                </div>
                <div className="text-xs font-bold font-sans text-rose-500 mt-0.5">
                  ~${deficitUsd.toFixed(2)} USD
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl sm:text-3xl font-black font-sans text-emerald-600 dark:text-emerald-400 tracking-tight">
                  គ្រប់ ១០០%
                </div>
                <div className="text-xs font-bold text-emerald-600 mt-0.5">
                  ទុនបម្រុងពេញលេញល្អ
                </div>
              </>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700">
            <span className="text-[11px] text-slate-500">
              {deficitKhr > 0 ? 'ខ្វះធៀបនឹងគោលដៅ' : 'គ្មានការខ្វះខាត'}
            </span>
            {deficitKhr > 0 && (
              <button
                onClick={() => handleQuickPresetReplenish(deficitKhr)}
                className="text-xs font-black text-rose-600 hover:text-rose-700 underline cursor-pointer"
              >
                + បង្គ្រប់ភ្លាម
              </button>
            )}
          </div>
        </div>

        {/* Card 4: សរុបដកចំណាយចេញពីទុន */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>📉</span>
              <span>ដកចំណាយសរុប (Deducted)</span>
            </span>
            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-xl">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="pt-1">
            <div className="text-2xl sm:text-3xl font-black font-sans text-slate-800 dark:text-white tracking-tight">
              {totalWithdrawnKhr.toLocaleString()} ៛
            </div>
            <div className="text-xs font-bold font-sans text-slate-500 mt-0.5">
              ~${(totalWithdrawnKhr / exchangeRate).toFixed(2)} USD
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
            <span className="text-[11px] text-slate-500">ចំណាយទំនិញ/សម្ភារៈ</span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {(reserveFund.history || []).filter((t) => t.type === 'WITHDRAW').length} លើក
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Widget */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-800 dark:text-white">
          <span className="flex items-center gap-2">
            <span>📊</span>
            <span>ភាគរយទុនបម្រុងធៀបនឹងគោលដៅ (Reserve Fulfillment):</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-sans text-base">{reserveFundPct}%</strong>
          </span>
          <span className="text-slate-500 font-sans font-medium">
            {reserveFund.currentBalanceKhr.toLocaleString()} ៛ / {reserveFund.targetAmountKhr.toLocaleString()} ៛
          </span>
        </div>

        {/* Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              reserveFundPct >= 90
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : reserveFundPct >= 50
                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                : 'bg-gradient-to-r from-rose-500 to-red-600'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, reserveFundPct))}%` }}
          />
        </div>

        {/* Quick Replenish Presets */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-slate-500 font-bold mr-1">⚡ បូកបង្គ្រប់លឿន៖</span>
          <button
            onClick={() => handleQuickPresetReplenish(50000)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-sans font-bold transition-colors cursor-pointer border border-slate-200"
          >
            +50,000 ៛
          </button>
          <button
            onClick={() => handleQuickPresetReplenish(100000)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-sans font-bold transition-colors cursor-pointer border border-slate-200"
          >
            +100,000 ៛
          </button>
          <button
            onClick={() => handleQuickPresetReplenish(200000)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-sans font-bold transition-colors cursor-pointer border border-slate-200"
          >
            +200,000 ៛
          </button>
          <button
            onClick={() => handleQuickPresetReplenish(500000)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-sans font-bold transition-colors cursor-pointer border border-slate-200"
          >
            +500,000 ៛
          </button>
          {deficitKhr > 0 && (
            <button
              onClick={() => handleQuickPresetReplenish(deficitKhr)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-sans font-black transition-colors cursor-pointer shadow-xs"
            >
              + បង្គ្រប់ទាំងអស់ ({deficitKhr.toLocaleString()} ៛)
            </button>
          )}
        </div>
      </div>

      {/* Inline Forms Panel (Expandable) */}
      {activeActionTab === 'quick-replenish' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-emerald-500 shadow-md animate-in slide-in-from-top duration-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-slate-800 dark:text-white text-base flex items-center gap-2">
              <span>➕</span>
              <span>ទម្រង់បូកបង្គ្រប់ទុនបម្រុង (Replenish Fund Form)</span>
            </h3>
            <button
              onClick={() => setActiveActionTab(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
            >
              បិទ ✕
            </button>
          </div>

          <form onSubmit={handleReplenishSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  រូបិយប័ណ្ណ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReplenishCurrency('KHR')}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      replenishCurrency === 'KHR'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ៛ ប្រាក់រៀល (KHR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplenishCurrency('USD')}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      replenishCurrency === 'USD'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    $ ដុល្លារ (USD)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ចំនួនទឹកប្រាក់ត្រូវបូកបង្គ្រប់ {replenishCurrency === 'KHR' ? '(៛)' : '($)'}
                </label>
                {replenishCurrency === 'KHR' ? (
                  <input
                    type="number"
                    value={replenishAmountKhr}
                    onChange={(e) => setReplenishAmountKhr(Number(e.target.value))}
                    step="1000"
                    min="1000"
                    required
                    className="w-full px-3.5 py-2 text-sm font-sans font-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                ) : (
                  <input
                    type="number"
                    value={customUsdAmount}
                    onChange={(e) => setCustomUsdAmount(e.target.value)}
                    step="0.1"
                    min="0.1"
                    required
                    className="w-full px-3.5 py-2 text-sm font-sans font-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ប្រភពថវិកា (Source)
                </label>
                <select
                  value={replenishSource}
                  onChange={(e) => setReplenishSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ពីប្រាក់ចំណូលលក់ប្រចាំថ្ងៃ">ពីប្រាក់ចំណូលលក់ប្រចាំថ្ងៃ (Daily Sales)</option>
                  <option value="ម្ចាស់ហាងបញ្ចូលបង្គ្រប់ផ្ទាល់">ម្ចាស់ហាងបញ្ចូលបង្គ្រប់ផ្ទាល់ (Owner Deposit)</option>
                  <option value="ពីគណនីធនាគារហាង (KHQR)">ពីគណនីធនាគារហាង (Bank Transfer)</option>
                  <option value="ប្រាក់សន្សំហាង">ប្រាក់សន្សំហាង (Store Savings)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  កំណត់ចំណាំបន្ថែម (Notes)
                </label>
                <input
                  type="text"
                  placeholder="ឧ. បូកបង្គ្រប់សម្រាប់ទិញគ្រឿងផ្សំសប្តាហ៍ថ្មី"
                  value={replenishNotes}
                  onChange={(e) => setReplenishNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveActionTab(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>រក្សាទុកការបូកបង្គ្រប់ទុន</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Target Setting Inline Form */}
      {activeActionTab === 'target-setting' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-indigo-400 shadow-md animate-in slide-in-from-top duration-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-slate-800 dark:text-white text-base flex items-center gap-2">
              <span>🎯</span>
              <span>កំណត់កម្រិតទុនបម្រុងគោលដៅ (Set Target Amount)</span>
            </h3>
            <button
              onClick={() => setActiveActionTab(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
            >
              បិទ ✕
            </button>
          </div>

          <form onSubmit={handleTargetSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ទុនបម្រុងគោលដៅគិតជាប្រាក់រៀល (៛)
                </label>
                <input
                  type="number"
                  value={targetKhrInput}
                  onChange={(e) => setTargetKhrInput(Number(e.target.value))}
                  step="10000"
                  min="10000"
                  required
                  className="w-full px-3.5 py-2 text-sm font-sans font-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  ស្មើប្រមាណ ${(targetKhrInput / exchangeRate).toFixed(2)} USD
                </span>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="syncBalance"
                  checked={syncTargetBalance}
                  onChange={(e) => setSyncTargetBalance(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="syncBalance" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  កែសម្រួលសមតុល្យបច្ចុប្បន្នឱ្យស្មើគោលដៅថ្មីនេះដែរ (Sync Balance)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveActionTab(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>រក្សាទុកគោលដៅ</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Direct Balance Adjust Inline Form */}
      {activeActionTab === 'balance-adjust' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-emerald-500 shadow-md animate-in slide-in-from-top duration-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-slate-800 dark:text-white text-base flex items-center gap-2">
              <span>✏️</span>
              <span>កែសម្រួលសមតុល្យជាក់ស្តែងក្នុងថត (Direct Balance Adjustment)</span>
            </h3>
            <button
              onClick={() => setActiveActionTab(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
            >
              បិទ ✕
            </button>
          </div>

          <form onSubmit={handleBalanceAdjustSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ចំនួនទឹកប្រាក់ជាក់ស្តែងក្នុងថតគិតជាប្រាក់រៀល (៛)
                </label>
                <input
                  type="number"
                  value={directBalanceKhr}
                  onChange={(e) => setDirectBalanceKhr(Number(e.target.value))}
                  step="1000"
                  min="0"
                  required
                  className="w-full px-3.5 py-2 text-sm font-sans font-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  មូលហេតុនៃការកែសម្រួល
                </label>
                <input
                  type="text"
                  placeholder="ឧ. រាប់សាច់ប្រាក់ជាក់ស្តែងពេលបិទវេន"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveActionTab(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>រក្សាទុកសមតុល្យថ្មី</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-slate-800 dark:text-white text-base sm:text-lg flex items-center gap-2">
              <span>📜</span>
              <span>ប្រវត្តិប្រតិបត្តិការទុនបម្រុង (Reserve Fund History)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-sans font-bold">
                {filteredHistory.length} កំណត់ត្រា
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              រាល់ការបូកបង្គ្រប់ ការកាត់ចំណាយ និងការកែសម្រួលត្រូវបានកត់ត្រាទុកយ៉ាងលម្អិត
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកកំណត់ត្រា..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-36 sm:w-48"
              />
            </div>

            {/* Type Filter */}
            <select
              value={historyFilterType}
              onChange={(e) => setHistoryFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="ALL">គ្រប់ប្រភេទ</option>
              <option value="REPLENISH">បូកបង្គ្រប់ (Replenish)</option>
              <option value="WITHDRAW">ដកចំណាយ (Withdraw)</option>
              <option value="ADJUST_BALANCE">កែសម្រួលសមតុល្យ</option>
              <option value="ADJUST_TARGET">កែប្រែគោលដៅ</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={handleExportHistoryCsv}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="ទាញយកជា CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>

            {/* Clear All */}
            {(reserveFund.history || []).length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-rose-200"
                title="សម្អាតប្រវត្តិទាំងអស់"
              >
                <Trash2 className="w-3 h-3 text-rose-500" />
                <span>សម្អាត</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="text-3xl">📭</div>
            <p className="text-sm font-bold">មិនទាន់មានប្រវត្តិប្រតិបត្តិការទុនបម្រុងនៅឡើយទេ</p>
            <p className="text-xs text-slate-400">
              រាល់ការកាត់ចំណាយសាច់ប្រាក់ ឬការបូកបង្គ្រប់ទុន នឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-black border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">កាលបរិច្ឆេទ & ម៉ោង</th>
                  <th className="px-4 py-3">ប្រភេទប្រតិបត្តិការ</th>
                  <th className="px-4 py-3">ចំនួនទឹកប្រាក់</th>
                  <th className="px-4 py-3">មូលហេតុ & កំណត់ត្រា</th>
                  <th className="px-4 py-3">ប្រភពថវិកា</th>
                  <th className="px-4 py-3">អ្នកប្រតិបត្តិ</th>
                  <th className="px-4 py-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {filteredHistory.map((tx) => {
                  const isReplenish = tx.type === 'REPLENISH';
                  const isWithdraw = tx.type === 'WITHDRAW';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <div className="font-bold">
                          {formatDateDMY(tx.date || tx.createdAt?.slice(0, 10))}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isReplenish && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                            + បូកបង្គ្រប់ទុន
                          </span>
                        )}
                        {isWithdraw && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <ArrowDownRight className="w-3 h-3 text-rose-700" />
                            - ដកចំណាយ
                          </span>
                        )}
                        {tx.type === 'ADJUST_BALANCE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-300">
                            ⚙️ កែសម្រួលសមតុល្យ
                          </span>
                        )}
                        {tx.type === 'ADJUST_TARGET' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                            🎯 កែប្រែគោលដៅ
                          </span>
                        )}
                        {tx.type === 'INITIAL_SET' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-800 border border-slate-300">
                            📌 កំណត់ដំបូង
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 whitespace-nowrap font-sans font-black">
                        <div
                          className={`text-sm ${
                            isReplenish
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : isWithdraw
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-800 dark:text-white'
                          }`}
                        >
                          {isReplenish ? '+' : isWithdraw ? '-' : ''}
                          {(tx.amountKhr || 0).toLocaleString()} ៛
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          ~${(tx.amountUsd || 0).toFixed(2)} USD
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200 max-w-xs">
                        <div className="font-bold truncate" title={tx.reason}>
                          {tx.reason || 'ប្រតិបត្តិការទុនបម្រុង'}
                        </div>
                        {tx.expenseId && (
                          <span className="text-[10px] text-slate-400">ID: {tx.expenseId.slice(0, 8)}</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-lg text-[11px]">
                          {tx.source || 'ទូទៅ'}
                        </span>
                      </td>

                      {/* Performed By */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {tx.performedBy || 'Cashier'}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            soundFx.playPop();
                            if (window.confirm(`តើអ្នកពិតជាចង់លុបកំណត់ត្រានេះមែនទេ?\n"${tx.reason}"`)) {
                              deleteReserveFundTransaction(tx.id);
                              soundFx.playSuccess();
                              showFeedback('បានលុបកំណត់ត្រាដោយជោគជ័យ!');
                            }
                          }}
                          className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="លុបកំណត់ត្រានេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Modal Popup (Optional Detailed View) */}
      <ReserveFundModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
