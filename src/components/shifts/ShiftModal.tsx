import React, { useState } from 'react';
import { X, Clock, ShieldCheck, DollarSign, Banknote, AlertCircle, CheckCircle } from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose }) => {
  const { lang, currentShift, openShift, closeShift, exchangeRate, currentStaff } = useBakery();
  const text = t[lang];

  const [cashierName, setCashierName] = useState(currentStaff?.name || 'សុធារិទ្ធ (Sothearith)');
  const [openingUsd, setOpeningUsd] = useState('50.00');
  const [openingKhr, setOpeningKhr] = useState('200000');

  const [closingUsd, setClosingUsd] = useState('');
  const [closingKhr, setClosingKhr] = useState('');

  if (!isOpen) return null;

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    openShift(cashierName, parseFloat(openingUsd) || 0, parseFloat(openingKhr) || 0);
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    closeShift(parseFloat(closingUsd) || 0, parseFloat(closingKhr) || 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{text.shifts}</h3>
              <p className="text-xs text-slate-500">គ្រប់គ្រងវេនការងារ និងផ្ទៀងផ្ទាត់សាច់ប្រាក់ក្នុងកេះ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentShift && currentShift.status === 'OPEN' ? (
            /* Active Shift Overview & Close Form */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>វេនកំពុងដំណើរការ (Shift Active)</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>បេឡាធិការ៖</span>
                    <span className="font-bold text-slate-800">{currentShift.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ពេលចាប់ផ្តើម៖</span>
                    <span>{new Date(currentShift.startTime).toLocaleTimeString('km-KH')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>លុយដើមគ្រា (Float):</span>
                    <span className="font-semibold">
                      {currentShift.openingCashKhr.toLocaleString()} ៛ + ${currentShift.openingCashUsd.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-200/60 pt-1 font-bold">
                    <span>ចំណូលលក់ក្នុងវេននេះ៖</span>
                    <span className="text-pink-600">
                      {Math.round(currentShift.totalSalesUsd * exchangeRate).toLocaleString()} ៛ (~${currentShift.totalSalesUsd.toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Shift inputs (KHR ៛ FIRST) */}
              <form onSubmit={handleCloseShift} className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  រាប់សាច់ប្រាក់ចុងវេនដើម្បីបិទបញ្ជី (End Cash)
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">លុយរៀល (៛ KHR) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0"
                      value={closingKhr}
                      onChange={(e) => setClosingKhr(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">លុយដុល្លារ ($ USD)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0.00"
                      value={closingUsd}
                      onChange={(e) => setClosingUsd(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/20 mt-2"
                >
                  បិទវេនការងារ (Close Shift)
                </button>
              </form>
            </div>
          ) : (
            /* Open New Shift Form */
            <form onSubmit={handleStartShift} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                សូមបញ្ចូលឈ្មោះបេឡាធិការ និងសាច់ប្រាក់ដើមគ្រាក្នុងកេះ ដើម្បីចាប់ផ្តើមវេនលក់ថ្មី
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះអ្នកកាន់វេន (Cashier Name)
                </label>
                <input
                  type="text"
                  required
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    លុយរៀលដើមគ្រា (៛ KHR)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={openingKhr}
                    onChange={(e) => setOpeningKhr(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    លុយដុល្លារដើមគ្រា ($ USD)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={openingUsd}
                    onChange={(e) => setOpeningUsd(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-pink-600/20 mt-2"
              >
                បើកវេនលក់ (Open Shift)
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
