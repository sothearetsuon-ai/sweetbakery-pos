import React, { useState } from 'react';
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
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

interface ReserveFundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReserveFundModal: React.FC<ReserveFundModalProps> = ({ isOpen, onClose }) => {
  const { reserveFund, updateReserveTarget, replenishReserveFund, exchangeRate } = useBakery();

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

  // Feedback banner
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPercent = reserveFund.targetAmountKhr > 0
    ? Math.min(100, Math.max(0, Math.round((reserveFund.currentBalanceKhr / reserveFund.targetAmountKhr) * 100)))
    : 100;

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

    updateReserveTarget(targetKhr, targetUsd);
    soundFx.playSuccess();
    setSuccessMessage(`បានកែប្រែទុនបម្រុងគោលដៅទៅ ${targetKhr.toLocaleString()} ៛ ($${targetUsd.toFixed(2)}) រួចរាល់!`);
    setTimeout(() => setSuccessMessage(null), 4000);
    setActiveTab('overview');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 px-6 py-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-battambang tracking-wide flex items-center gap-2">
                ទុនបម្រុងហាង (Reserve Fund & Petty Cash)
              </h2>
              <p className="text-xs text-emerald-100 font-battambang">
                គ្រប់គ្រងប្រាក់កក់ទុនបម្រុង តាមដានការដកចំណាយ និងបូកបង្គ្រប់ត្រឡប់មកវិញ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/80 px-4 pt-2 gap-2 overflow-x-auto text-sm font-battambang">
          <button
            onClick={() => { soundFx.playPop(); setActiveTab('overview'); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-medium transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-gray-800 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
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
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-medium transition-all ${
              activeTab === 'replenish'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-gray-800 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            + បូកបង្គ្រប់ទុន
            {deficitKhr > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full font-sans">
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
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-medium transition-all ${
              activeTab === 'target'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-gray-800 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <Settings className="w-4 h-4" />
            កំណត់ទុនគោលដៅ
          </button>

          <button
            onClick={() => { soundFx.playPop(); setActiveTab('history'); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-medium transition-all ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-gray-800 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <History className="w-4 h-4" />
            ប្រវត្តិចរន្ត ({reserveFund.history?.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 font-battambang space-y-5">
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-900 rounded-3xl border border-emerald-100 dark:border-gray-700 relative overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> ទុនបម្រុងបច្ចុប្បន្ន (Current Balance)
                    </span>
                    <div className="flex items-baseline gap-3 mt-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight font-sans">
                        {reserveFund.currentBalanceKhr.toLocaleString()} <span className="text-xl font-normal text-emerald-600">៛</span>
                      </span>
                      <span className="text-base text-gray-500 dark:text-gray-400 font-sans">
                        ≈ ${reserveFund.currentBalanceUsd.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">ទុនគោលដៅកំណត់ (Target)</span>
                    <div className="text-xl font-bold text-gray-800 dark:text-gray-200 font-sans">
                      {reserveFund.targetAmountKhr.toLocaleString()} ៛ <span className="text-sm font-normal text-gray-500">(${reserveFund.targetAmountUsd.toFixed(2)})</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 font-sans font-medium">
                    <span>ភាពពេញលេញនៃទុនបម្រុង៖ {currentPercent}%</span>
                    <span>{currentPercent >= 100 ? 'គ្រប់ចំនួន ១០០%' : `នៅសល់ ${currentPercent}%`}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentPercent >= 100
                          ? 'bg-emerald-500'
                          : currentPercent >= 60
                          ? 'bg-teal-500'
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
                  <div className="mt-4 p-3.5 bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-sm">
                          ខ្វះទុនបម្រុងត្រូវបូកបង្គ្រប់៖ {deficitKhr.toLocaleString()} ៛ (${deficitUsd.toFixed(2)})
                        </div>
                        <div className="text-xs text-amber-700 dark:text-amber-400">
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
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow whitespace-nowrap"
                    >
                      + បូកបង្គ្រប់ឥឡូវ
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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
                  className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 bg-white dark:bg-gray-800 text-left transition hover:shadow-md group flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white pt-2 group-hover:text-emerald-600 transition">
                      បូកបង្គ្រប់ទុនបម្រុង
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
                  className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 bg-white dark:bg-gray-800 text-left transition hover:shadow-md group flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                      <Settings className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white pt-2 group-hover:text-blue-600 transition">
                      កែប្រែទុនគោលដៅ
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      កំណត់ចំនួនទុនបម្រុងអតិបរមាដែលហាងត្រូវរក្សាទុក
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-blue-600 transition" />
                </button>
              </div>

              {/* Recent Transactions Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">ចរន្តដក-បង្គ្រប់ចុងក្រោយ</h4>
                  <button
                    onClick={() => { soundFx.playPop(); setActiveTab('history'); }}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    មើលទាំងអស់ →
                  </button>
                </div>
                <div className="space-y-2">
                  {(reserveFund.history || []).slice(0, 4).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
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
                        <div>
                          <div className="font-bold text-gray-800 dark:text-gray-200">{tx.reason}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-[11px]">
                            {tx.date} • {tx.performedBy} {tx.source ? `(${tx.source})` : ''}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-sans font-bold text-right ${
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
                    </div>
                  ))}
                  {(!reserveFund.history || reserveFund.history.length === 0) && (
                    <div className="text-center py-6 text-gray-400 text-xs">មិនទាន់មានប្រវត្តិចរន្តនៅឡើយទេ</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPLENISH FORM */}
          {activeTab === 'replenish' && (
            <form onSubmit={handleReplenishSubmit} className="space-y-5">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold">ស្ថានភាពខ្វះទុនបម្រុង៖</span>
                  <span className="text-xs bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    គោលដៅ: {reserveFund.targetAmountKhr.toLocaleString()} ៛
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white font-sans">
                  ខ្វះ {deficitKhr.toLocaleString()} ៛ <span className="text-sm font-normal text-gray-500">(${deficitUsd.toFixed(2)})</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  ជ្រើសរើសចំនួនប្រាក់ដែលត្រូវបូកបង្គ្រប់ត្រឡប់ទៅក្នុងទុនបម្រុងវិញ
                </p>
              </div>

              {/* Quick Fill Buttons */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
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
                      className="p-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
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
                      className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      +{amt.toLocaleString()} ៛
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    ចំនួនទឹកប្រាក់បូកបង្គ្រប់ *
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => { soundFx.playPop(); setReplenishCurrency('KHR'); }}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        replenishCurrency === 'KHR'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      រៀល (៛)
                    </button>
                    <button
                      type="button"
                      onClick={() => { soundFx.playPop(); setReplenishCurrency('USD'); }}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        replenishCurrency === 'USD'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300'
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
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl text-lg font-bold font-sans text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 font-bold">៛</span>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={customUsdAmount}
                      onChange={(e) => setCustomUsdAmount(e.target.value)}
                      placeholder="ឧ. 50.00"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl text-lg font-bold font-sans text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 font-bold">$</span>
                  </div>
                )}
              </div>

              {/* Source of replenishment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
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
                      className={`p-3 rounded-xl border text-center font-medium transition ${
                        replenishSource === s.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  កំណត់ចំណាំបន្ថែម (Optional)
                </label>
                <input
                  type="text"
                  value={replenishNotes}
                  onChange={(e) => setReplenishNotes(e.target.value)}
                  placeholder="ឧ. បង្គ្រប់ទុនក្រោយទិញគ្រឿងផ្សំរួច..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { soundFx.playPop(); setActiveTab('overview'); }}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  ត្រឡប់ក្រោយ
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
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
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-sm">
                <span className="text-blue-800 dark:text-blue-300 font-bold">កំណត់ទុនបម្រុងគោលដៅ (Base Reserve Fund)</span>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  ចំនួនទឹកប្រាក់គោលដែលហាងត្រូវមានបម្រុងទុកជាប់ជានិច្ច សម្រាប់ចំណាយបន្ទាន់ ចំណាយទិញទំនិញ ឬប្រើប្រាស់ជា Petty Cash។
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
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
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl text-lg font-bold font-sans text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-bold">៛</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
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
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl text-lg font-bold font-sans text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-bold">$</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { soundFx.playPop(); setActiveTab('overview'); }}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  ត្រឡប់ក្រោយ
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  រក្សាទុកការកំណត់ទុនគោលដៅ
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">ប្រវត្តិប្រតិបត្តិការទុនបម្រុងទាំងអស់</h4>
                <span className="text-xs text-gray-500">{reserveFund.history?.length || 0} កំណត់ត្រា</span>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                {(reserveFund.history || []).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
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
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{tx.reason}</div>
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

                    <div className="text-right flex-shrink-0">
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
