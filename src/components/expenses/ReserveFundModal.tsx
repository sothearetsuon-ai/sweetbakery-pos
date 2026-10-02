import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ArrowRight,
  PlusCircle,
  Settings,
  History,
  AlertCircle,
  CheckCircle2,
  Wallet,
  SlidersHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

interface ReserveFundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReserveFundModal: React.FC<ReserveFundModalProps> = ({ isOpen, onClose }) => {
  const {
    reserveFund,
    updateReserveTarget,
    adjustCurrentBalance,
    replenishReserveFund,
    exchangeRate,
    reconcileReserveFundWithExpenses,
    deleteReserveFundTransaction,
    clearReserveFundHistory,
  } = useBakery();

  const [activeTab, setActiveTab] = useState<'overview' | 'replenish' | 'target' | 'history'>('overview');
  
  // Replenish form state
  const deficitKhr = Math.max(0, reserveFund.targetAmountKhr - reserveFund.currentBalanceKhr);
  const deficitUsd = Number((deficitKhr / exchangeRate).toFixed(2));
  
  const [replenishAmountKhr, setReplenishAmountKhr] = useState<number>(deficitKhr);
  const [replenishSource, setReplenishSource] = useState<string>('ពីប្រាក់ចំណូលលក់ប្រចាំថ្ងៃ');
  const [replenishNotes, setReplenishNotes] = useState<string>('');
  const [replenishCurrency, setReplenishCurrency] = useState<'KHR' | 'USD'>('KHR');
  const [customUsdAmount, setCustomUsdAmount] = useState<string>(deficitUsd > 0 ? deficitUsd.toString() : '');

  // Target edit state
  const [editTargetKhr, setEditTargetKhr] = useState<number>(reserveFund.targetAmountKhr);
  const [editTargetUsd, setEditTargetUsd] = useState<string>(reserveFund.targetAmountUsd.toString());
  const [syncBalanceWithTarget, setSyncBalanceWithTarget] = useState<boolean>(false);

  // Direct balance adjustment state
  const [isAdjustingBalance, setIsAdjustingBalance] = useState<boolean>(false);
  const [editBalanceKhr, setEditBalanceKhr] = useState<number>(reserveFund.currentBalanceKhr);
  const [editBalanceUsd, setEditBalanceUsd] = useState<string>(reserveFund.currentBalanceUsd.toString());
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Keep form fields synced whenever reserveFund or modal opens
  useEffect(() => {
    if (isOpen) {
      setEditTargetKhr(reserveFund.targetAmountKhr);
      setEditTargetUsd(reserveFund.targetAmountUsd.toString());
      setEditBalanceKhr(reserveFund.currentBalanceKhr);
      setEditBalanceUsd(reserveFund.currentBalanceUsd.toString());
      const curDeficit = Math.max(0, reserveFund.targetAmountKhr - reserveFund.currentBalanceKhr);
      setReplenishAmountKhr(curDeficit);
      const curDeficitUsd = Number((curDeficit / exchangeRate).toFixed(2));
      setCustomUsdAmount(curDeficitUsd > 0 ? curDeficitUsd.toString() : '');
    }
  }, [isOpen, reserveFund.targetAmountKhr, reserveFund.targetAmountUsd, reserveFund.currentBalanceKhr, reserveFund.currentBalanceUsd, exchangeRate]);

  // Feedback banner
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPercent = reserveFund.targetAmountKhr > 0
    ? Math.min(100, Math.max(0, Math.round((reserveFund.currentBalanceKhr / reserveFund.targetAmountKhr) * 100)))
    : 100;

  const handleDeleteTransaction = (txId: string, reason: string) => {
    soundFx.playPop();
    if (window.confirm(`តើអ្នកពិតជាចង់លុបកំណត់ត្រាចរន្តនេះមែនទេ?\n"${reason}"`)) {
      deleteReserveFundTransaction(txId);
      setSuccessMessage('បានលុបកំណត់ត្រាដោយជោគជ័យ!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleClearAllHistory = () => {
    soundFx.playPop();
    if (window.confirm('តើអ្នកពិតជាចង់សម្អាតប្រវត្តិប្រតិបត្តិការទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។')) {
      clearReserveFundHistory();
      setSuccessMessage('បានសម្អាតប្រវត្តិប្រតិបត្តិការទាំងអស់រួចរាល់!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

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

    soundFx.playSuccess();
    setSuccessMessage(`បានបូកបង្គ្រប់ទុនបម្រុងចំនួន ${finalKhr.toLocaleString()} ៛ ($${finalUsd.toFixed(2)}) ដោយជោគជ័យ!`);
    setTimeout(() => setSuccessMessage(null), 4000);
    setActiveTab('overview');
  };

  const handleUpdateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();

    const targetKhr = Number(editTargetKhr);
    const targetUsd = parseFloat(editTargetUsd) || Number((targetKhr / exchangeRate).toFixed(2));

    if (targetKhr <= 0) {
      alert('សូមបញ្ចូលចំនួនទុនបម្រុងគោលដៅត្រឹមត្រូវ!');
      return;
    }

    updateReserveTarget(targetKhr, targetUsd, syncBalanceWithTarget);
    soundFx.playSuccess();
    setSuccessMessage(`បានកែប្រែទុនបម្រុងគោលដៅទៅ ${targetKhr.toLocaleString()} ៛ ($${targetUsd.toFixed(2)}) រួចរាល់!`);
    setTimeout(() => setSuccessMessage(null), 4000);
    setActiveTab('overview');
  };

  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();

    const balKhr = Number(editBalanceKhr);
    const balUsd = parseFloat(editBalanceUsd) || Number((balKhr / exchangeRate).toFixed(2));

    if (balKhr < 0) {
      alert('សូមបញ្ចូលចំនួនទឹកប្រាក់ទុនជាក់ស្តែងត្រឹមត្រូវ!');
      return;
    }

    adjustCurrentBalance(balKhr, balUsd, adjustReason.trim() || undefined);
    soundFx.playSuccess();
    setSuccessMessage(`បានកែសម្រួលទុនជាក់ស្តែងក្នុងថតទៅ ${balKhr.toLocaleString()} ៛ ($${balUsd.toFixed(2)}) រួចរាល់!`);
    setTimeout(() => setSuccessMessage(null), 4000);
    setIsAdjustingBalance(false);
    setActiveTab('overview');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 px-6 py-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-battambang tracking-wide flex items-center gap-2 text-white">
                ទុនបម្រុងហាង (Reserve Fund & Petty Cash)
              </h2>
              <p className="text-xs text-white/95 font-medium font-battambang mt-0.5">
                គ្រប់គ្រងប្រាក់កក់ទុនបម្រុង តាមដានការដកចំណាយ និងបូកបង្គ្រប់ត្រឡប់មកវិញ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-4 pt-2 gap-2 overflow-x-auto text-sm font-battambang">
          <button
            onClick={() => { soundFx.playPop(); setActiveTab('overview'); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300 font-black bg-white dark:bg-gray-800 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-300'
            }`}
          >
            <Wallet className="w-4 h-4" />
            ទិដ្ឋភាពទូទៅ
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setReplenishAmountKhr(deficitKhr);
              setCustomUsdAmount(deficitUsd > 0 ? deficitUsd.toString() : '');
              setActiveTab('replenish');
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold transition-all ${
              activeTab === 'replenish'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300 font-black bg-white dark:bg-gray-800 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-300'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            + បូកបង្គ្រប់ទុន
            {deficitKhr > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full font-sans font-bold">
                ខ្វះ
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setEditTargetKhr(reserveFund.targetAmountKhr);
              setEditTargetUsd(reserveFund.targetAmountUsd.toString());
              setActiveTab('target');
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold transition-all ${
              activeTab === 'target'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300 font-black bg-white dark:bg-gray-800 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            កំណត់ទុនគោលដៅ
          </button>

          <button
            onClick={() => { soundFx.playPop(); setActiveTab('history'); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold transition-all ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300 font-black bg-white dark:bg-gray-800 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-gray-300'
            }`}
          >
            <History className="w-4 h-4" />
            ប្រវត្តិចរន្ត ({reserveFund.history?.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 font-battambang space-y-5">
          {successMessage && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center gap-3 text-emerald-950 dark:text-emerald-100 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl border-2 border-emerald-400 dark:border-emerald-600 relative overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-950 dark:text-emerald-300 font-black flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> ទុនបម្រុងបច្ចុប្បន្ន (Current Balance)
                    </span>
                    <div className="flex items-baseline gap-3 mt-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight font-sans">
                        {reserveFund.currentBalanceKhr.toLocaleString()} <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">៛</span>
                      </span>
                      <span className="text-base text-slate-700 dark:text-slate-300 font-sans font-bold">
                        ≈ ${reserveFund.currentBalanceUsd.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">ទុនគោលដៅកំណត់ (Target)</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white font-sans">
                      {reserveFund.targetAmountKhr.toLocaleString()} ៛ <span className="text-sm font-bold text-slate-600 dark:text-slate-400">(${reserveFund.targetAmountUsd.toFixed(2)})</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs text-slate-900 dark:text-white font-sans font-black">
                    <span>ភាពពេញលេញនៃទុនបម្រុង៖ {currentPercent}%</span>
                    <span>{currentPercent >= 100 ? 'គ្រប់ចំនួន ១០០%' : `នៅសល់ ${currentPercent}%`}</span>
                  </div>
                  <div className="w-full h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentPercent >= 100
                          ? 'bg-emerald-600'
                          : currentPercent >= 60
                          ? 'bg-teal-600'
                          : currentPercent >= 30
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${currentPercent}%` }}
                    />
                  </div>
                </div>

                {/* Deficit Alert or All Good Alert */}
                {deficitKhr > 0 ? (
                  <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-600 rounded-2xl flex items-center justify-between gap-3 text-amber-950 dark:text-amber-100">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                      <div>
                        <div className="font-black text-sm text-amber-950 dark:text-amber-100">
                          ខ្វះទុនបម្រុងត្រូវបូកបង្គ្រប់៖ {deficitKhr.toLocaleString()} ៛ (${deficitUsd.toFixed(2)})
                        </div>
                        <div className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                          សូមបូកបង្គ្រប់ពីចំណូលលក់ ឬម្ចាស់ហាង ដើម្បីឲ្យទុនបម្រុងគ្រប់ {reserveFund.targetAmountKhr.toLocaleString()} ៛
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        soundFx.playPop();
                        setReplenishAmountKhr(deficitKhr);
                        setCustomUsdAmount(deficitUsd.toString());
                        setActiveTab('replenish');
                      }}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition shadow whitespace-nowrap cursor-pointer"
                    >
                      + បូកបង្គ្រប់ឥឡូវ
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 p-3.5 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl flex items-center gap-2.5 text-emerald-950 dark:text-emerald-100 text-sm font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                    <span>ទុនបម្រុងគ្រប់ចំនួន ១០០% តាមគោលដៅកំណត់រួចរាល់! គ្មានប្រាក់ខ្វះដែលត្រូវបង្គ្រប់ឡើយ។</span>
                  </div>
                )}
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    soundFx.playPop();
                    setReplenishAmountKhr(deficitKhr);
                    setCustomUsdAmount(deficitUsd > 0 ? deficitUsd.toString() : '');
                    setActiveTab('replenish');
                  }}
                  className="p-5 rounded-2xl border-2 border-slate-200 dark:border-gray-700 hover:border-emerald-500 bg-white dark:bg-gray-800 text-left transition hover:shadow-md group flex items-start justify-between cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white pt-2 group-hover:text-emerald-700 transition">
                      បូកបង្គ្រប់ទុនបម្រុង
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      បញ្ចូលប្រាក់ពីចំណូលលក់ ឬម្ចាស់ហាង ទៅទុនបម្រុង
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition" />
                </button>

                <button
                  onClick={() => {
                    soundFx.playPop();
                    setEditTargetKhr(reserveFund.targetAmountKhr);
                    setEditTargetUsd(reserveFund.targetAmountUsd.toString());
                    setActiveTab('target');
                  }}
                  className="p-5 rounded-2xl border-2 border-slate-200 dark:border-gray-700 hover:border-blue-500 bg-white dark:bg-gray-800 text-left transition hover:shadow-md group flex items-start justify-between cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                      <Settings className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white pt-2 group-hover:text-blue-600 transition">
                      កែប្រែទុនគោលដៅ
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      កំណត់ចំនួនទុនបម្រុងអតិបរមាដែលហាងត្រូវរក្សាទុក
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-blue-600 transition" />
                </button>
              </div>

              {/* Quick Reconcile with Expenses Banner */}
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-700 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-xl">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-950 dark:text-amber-100">
                      គណនាកាត់ចេញពីទុនបម្រុងស្វ័យប្រវត្តិតាមចំណាយ (Auto-Reconcile)
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      កាត់រាល់ចំណាយសាច់ប្រាក់ទាំងអស់ចេញពីទុនគោលដៅ ({reserveFund.targetAmountKhr.toLocaleString()} ៛) ដើម្បីឱ្យសមតុល្យជាក់ស្តែងត្រូវគ្នានឹងការចំណាយ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSuccess();
                    const updated = reconcileReserveFundWithExpenses();
                    setSuccessMessage(`បានគណនាកាត់ចំណាយចេញពីទុនបម្រុងរួចរាល់! សមតុល្យជាក់ស្តែងនៅសល់៖ ${updated.currentBalanceKhr.toLocaleString()} ៛`);
                    setTimeout(() => setSuccessMessage(null), 4000);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition shadow-sm cursor-pointer active:scale-95"
                >
                  🔄 គណនាកាត់ចេញពីទុនឥឡូវ
                </button>
              </div>

              {/* Recent Transactions Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-slate-900 dark:text-gray-100 text-sm">ចរន្តដក-បង្គ្រប់ចុងក្រោយ</h4>
                  <div className="flex items-center gap-2">
                    {(reserveFund.history || []).length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllHistory}
                        title="សម្អាតប្រវត្តិទាំងអស់"
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-1 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        សម្អាត
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { soundFx.playPop(); setActiveTab('history'); }}
                      className="text-xs text-emerald-700 hover:underline font-bold"
                    >
                      មើលទាំងអស់ →
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(reserveFund.history || []).slice(0, 4).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs hover:border-slate-300 dark:hover:border-gray-600 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            tx.type === 'REPLENISH'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                              : tx.type === 'WITHDRAW'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                          }`}
                        >
                          {tx.type === 'REPLENISH' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : tx.type === 'WITHDRAW' ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <Settings className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-gray-100 truncate">{tx.reason}</div>
                          <div className="text-slate-600 dark:text-gray-400 text-[11px] font-medium">
                            {tx.date} • {tx.performedBy} {tx.source ? `(${tx.source})` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className={`font-sans font-black text-right ${
                            tx.type === 'REPLENISH'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : tx.type === 'WITHDRAW'
                              ? 'text-rose-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {tx.type === 'REPLENISH' ? '+' : tx.type === 'WITHDRAW' ? '-' : ''}
                          {tx.amountKhr.toLocaleString()} ៛
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(tx.id, tx.reason)}
                          title="លុបកំណត់ត្រានេះ"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!reserveFund.history || reserveFund.history.length === 0) && (
                    <div className="text-center py-6 text-gray-500 text-xs font-medium">មិនទាន់មានប្រវត្តិចរន្តនៅឡើយទេ</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPLENISH FORM */}
          {activeTab === 'replenish' && (
            <form onSubmit={handleReplenishSubmit} className="space-y-5">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-950 dark:text-emerald-200 font-black">ស្ថានភាពខ្វះទុនបម្រុង៖</span>
                  <span className="text-xs bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                    គោលដៅ: {reserveFund.targetAmountKhr.toLocaleString()} ៛
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                  ខ្វះ {deficitKhr.toLocaleString()} ៛ <span className="text-sm font-bold text-slate-600 dark:text-slate-400">(${deficitUsd.toFixed(2)})</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                  ជ្រើសរើសចំនួនប្រាក់ដែលត្រូវបូកបង្គ្រប់ត្រឡប់ទៅក្នុងទុនបម្រុងវិញ
                </p>
              </div>

              {/* Quick Fill Buttons */}
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white mb-2">
                  ជ្រើសរើសចំនួនរហ័ស (Quick Select):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {deficitKhr > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setReplenishCurrency('KHR');
                        setReplenishAmountKhr(deficitKhr);
                      }}
                      className="p-2.5 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition cursor-pointer shadow-sm"
                    >
                      បង្គ្រប់ពេញ ({deficitKhr.toLocaleString()} ៛)
                    </button>
                  )}
                  {[50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setReplenishCurrency('KHR');
                        setReplenishAmountKhr(amt);
                      }}
                      className="p-2.5 bg-slate-100 dark:bg-gray-700 text-slate-900 dark:text-gray-100 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-gray-600 transition cursor-pointer border border-slate-200 dark:border-gray-600"
                    >
                      +{amt.toLocaleString()} ៛
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-900 dark:text-white">
                    ចំនួនទឹកប្រាក់បូកបង្គ្រប់ *
                  </label>
                  <div className="flex bg-slate-100 dark:bg-gray-700 p-1 rounded-xl text-xs border border-slate-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => { soundFx.playPop(); setReplenishCurrency('KHR'); }}
                      className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                        replenishCurrency === 'KHR'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-700 dark:text-gray-300 font-semibold'
                      }`}
                    >
                      រៀល (៛)
                    </button>
                    <button
                      type="button"
                      onClick={() => { soundFx.playPop(); setReplenishCurrency('USD'); }}
                      className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                        replenishCurrency === 'USD'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-700 dark:text-gray-300 font-semibold'
                      }`}
                    >
                      ដុល្លារ ($)
                    </button>
                  </div>
                </div>

                {replenishCurrency === 'KHR' ? (
                  <div className="relative">
                    <input
                      type="number"
                      value={replenishAmountKhr || ''}
                      onChange={(e) => setReplenishAmountKhr(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="ឧ. 200000"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-2xl text-xl font-black font-sans text-slate-950 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-slate-500 dark:text-gray-300 font-bold text-lg">៛</span>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={customUsdAmount}
                      onChange={(e) => setCustomUsdAmount(e.target.value)}
                      placeholder="ឧ. 50.00"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-2xl text-xl font-black font-sans text-slate-950 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-slate-500 dark:text-gray-300 font-bold text-lg">$</span>
                  </div>
                )}
              </div>

              {/* Source of replenishment */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 dark:text-white">
                  ប្រភពទឹកប្រាក់ (Fund Source)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'ពីប្រាក់ចំណូលលក់ប្រចាំថ្ងៃ', label: '💰 ពីចំណូលលក់' },
                    { id: 'ម្ចាស់ហាងបញ្ចូលបង្គ្រប់', label: '👤 ម្ចាស់ហាងផ្ទាល់' },
                    { id: 'ដកពីធនាគារ/ABA', label: '🏦 ដកពីធនាគារ' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { soundFx.playPop(); setReplenishSource(s.id); }}
                      className={`p-3 rounded-xl border-2 text-center font-bold transition cursor-pointer ${
                        replenishSource === s.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 shadow-xs'
                          : 'border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-900 dark:text-white">
                  កំណត់ចំណាំបន្ថែម (Optional)
                </label>
                <input
                  type="text"
                  value={replenishNotes}
                  onChange={(e) => setReplenishNotes(e.target.value)}
                  placeholder="ឧ. បង្គ្រប់ទុនក្រោយទិញគ្រឿងផ្សំរួច..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border-2 border-slate-200 dark:border-gray-600 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { soundFx.playPop(); setActiveTab('overview'); }}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-300 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-black text-xs hover:bg-slate-100 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  ត្រឡប់ក្រោយ
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  បញ្ជាក់ការបូកបង្គ្រប់ទុន
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ADJUST TARGET */}
          {activeTab === 'target' && (
            <form onSubmit={handleUpdateTarget} className="space-y-5">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-2xl border-2 border-blue-300 dark:border-blue-700 text-sm">
                <span className="text-blue-950 dark:text-blue-200 font-black">កំណត់ទុនបម្រុងគោលដៅ (Base Reserve Fund)</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-1">
                  ចំនួនទឹកប្រាក់គោលដែលហាងត្រូវមានបម្រុងទុកជាប់ជានិច្ច សម្រាប់ចំណាយបន្ទាន់ ចំណាយទិញទំនិញ ឬប្រើប្រាស់ជា Petty Cash។
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 dark:text-white">
                  ទុនគោលដៅជាប្រាក់រៀល (KHR ៛) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editTargetKhr || ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setEditTargetKhr(val);
                      setEditTargetUsd((val / exchangeRate).toFixed(2));
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-2xl text-xl font-black font-sans text-slate-950 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-500 dark:text-gray-300 font-bold text-lg">៛</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 dark:text-white">
                  ទុនគោលដៅជាប្រាក់ដុល្លារ (USD $)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={editTargetUsd}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditTargetUsd(val);
                      const num = parseFloat(val) || 0;
                      setEditTargetKhr(Math.round(num * exchangeRate));
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-2xl text-xl font-black font-sans text-slate-950 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-500 dark:text-gray-300 font-bold text-lg">$</span>
                </div>
              </div>

              {/* Sync Balance Checkbox */}
              <label className="flex items-center gap-2.5 p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncBalanceWithTarget}
                  onChange={(e) => setSyncBalanceWithTarget(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-gray-100 block">
                    កំណត់ទុនជាក់ស្តែងក្នុងថតឱ្យស្មើទុនគោលដៅនេះដែរ
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 block">
                    គូសធីកប្រសិនបើអ្នកបានរាប់សាច់ប្រាក់ក្នុងថតគ្រប់ចំនួនគោលដៅនេះរួចរាល់
                  </span>
                </div>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { soundFx.playPop(); setActiveTab('overview'); }}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-300 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-black text-xs hover:bg-slate-100 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  ត្រឡប់ក្រោយ
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Settings className="w-4 h-4" />
                  រក្សាទុកការកំណត់ទុនគោលដៅ
                </button>
              </div>

              {/* Section to Direct Adjust Current Balance */}
              <div className="pt-4 border-t border-slate-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setIsAdjustingBalance(!isAdjustingBalance);
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-100 dark:bg-gray-700/60 rounded-2xl hover:bg-slate-200 dark:hover:bg-gray-700 transition cursor-pointer text-xs font-black text-slate-800 dark:text-gray-200"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    កែប្រែទុនជាក់ស្តែងក្នុងថតផ្ទាល់ (Direct Adjust Current Cash Balance)
                  </span>
                  <span className="text-slate-500 text-sm">{isAdjustingBalance ? '▲ បិទ' : '▼ បើក'}</span>
                </button>

                {isAdjustingBalance && (
                  <div className="mt-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      ប្រសិនបើចំនួនសាច់ប្រាក់ជាក់ស្តែងក្នុងថតខុសពីប្រព័ន្ធ អ្នកអាចបញ្ចូលចំនួនជាក់ស្តែងនៅទីនេះដើម្បីធ្វើបច្ចុប្បន្នភាពភ្លាមៗ៖
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          សាច់ប្រាក់ជាក់ស្តែង (៛ KHR)
                        </label>
                        <input
                          type="number"
                          value={editBalanceKhr || ''}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setEditBalanceKhr(val);
                            setEditBalanceUsd((val / exchangeRate).toFixed(2));
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-base font-bold font-sans text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          សមមូលជាដុល្លារ ($ USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editBalanceUsd}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditBalanceUsd(val);
                            const num = parseFloat(val) || 0;
                            setEditBalanceKhr(Math.round(num * exchangeRate));
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-base font-bold font-sans text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        មូលហេតុ / ចំណាំ (Reason)
                      </label>
                      <input
                        type="text"
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        placeholder="ឧ. រាប់ប្រាក់ក្នុងថតជាក់ស្តែងពេលបិទវេន..."
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAdjustBalanceSubmit}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition cursor-pointer"
                    >
                      ✓ រក្សាទុកចំនួនទុនជាក់ស្តែង
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">ប្រវត្តិប្រតិបត្តិការទុនបម្រុងទាំងអស់</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{reserveFund.history?.length || 0} កំណត់ត្រា</span>
                  {(reserveFund.history || []).length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      សម្អាតទាំងអស់
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                {(reserveFund.history || []).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-gray-600 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div
                        className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                          tx.type === 'REPLENISH'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                            : tx.type === 'WITHDRAW'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                        }`}
                      >
                        {tx.type === 'REPLENISH' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : tx.type === 'WITHDRAW' ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Settings className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{tx.reason}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 flex flex-wrap gap-x-2">
                          <span>កាលបរិច្ឆេទ៖ {tx.date}</span>
                          <span>•</span>
                          <span>អ្នកធ្វើ៖ {tx.performedBy}</span>
                          {tx.source && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">ប្រភព៖ {tx.source}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div
                          className={`font-sans font-black text-sm ${
                            tx.type === 'REPLENISH'
                              ? 'text-emerald-600'
                              : tx.type === 'WITHDRAW'
                              ? 'text-rose-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {tx.type === 'REPLENISH' ? '+' : tx.type === 'WITHDRAW' ? '-' : ''}
                          {tx.amountKhr.toLocaleString()} ៛
                        </div>
                        <div className="text-[11px] text-gray-400 font-sans">
                          ${tx.amountUsd.toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(tx.id, tx.reason)}
                        title="លុបកំណត់ត្រានេះ"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {(!reserveFund.history || reserveFund.history.length === 0) && (
                  <div className="text-center py-12 text-gray-400 text-xs">មិនទាន់មានប្រវត្តិនៃការដក ឬបង្គ្រប់ទុននៅឡើយទេ</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={() => { soundFx.playPop(); onClose(); }}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-bold font-battambang text-xs transition"
          >
            បិទផ្ទាំង
          </button>
        </div>

      </div>
    </div>
  );
};
