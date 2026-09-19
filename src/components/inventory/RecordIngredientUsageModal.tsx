import React, { useState, useEffect } from 'react';
import {
  X,
  MinusCircle,
  AlertTriangle,
  Check,
  TrendingDown,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { Ingredient } from '../../types';
import { soundFx } from '../../utils/audio';

interface RecordIngredientUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
}

const QUICK_AMOUNTS = [0.5, 1, 2, 5, 10];

export const RecordIngredientUsageModal: React.FC<RecordIngredientUsageModalProps> = ({
  isOpen,
  onClose,
  ingredient,
}) => {
  const { useIngredientStock, exchangeRate } = useBakery();
  const [usedAmount, setUsedAmount] = useState<string>('1');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (ingredient && isOpen) {
      setUsedAmount('1');
      setNote('');
    }
  }, [ingredient, isOpen]);

  if (!isOpen || !ingredient) return null;

  const currentStock = ingredient.currentStock ?? 0;
  const numUsed = parseFloat(usedAmount) || 0;
  const remainingAfter = Math.max(0, Number((currentStock - numUsed).toFixed(3)));
  const willBeLow = remainingAfter <= ingredient.minAlertStock;
  const isOutOfStock = remainingAfter <= 0 && numUsed >= currentStock;

  const estimatedCostUsedUsd = Number((numUsed * ingredient.costPerUnitUsd).toFixed(2));
  const estimatedCostUsedKhr = Math.round(estimatedCostUsedUsd * exchangeRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient || numUsed <= 0) return;

    useIngredientStock(ingredient.id, numUsed);
    soundFx.playSuccess();

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch (e) {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100/80 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-pink-50/50 to-rose-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-2xl shadow-md shadow-purple-500/20">
              <MinusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                កត់ត្រាការប្រើប្រាស់គ្រឿងផ្សំ
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ដកស្តុកគ្រឿងផ្សំដែលបានយកទៅធ្វើនំជាក់ស្តែង
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Selected Ingredient Info Card */}
          <div className="p-3.5 bg-gradient-to-r from-slate-50 to-purple-50/40 rounded-2xl border border-purple-100/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                គ្រឿងផ្សំដែលបានជ្រើសរើស
              </span>
              <h4 className="text-sm font-black text-slate-800">{ingredient.nameKh}</h4>
              <p className="text-[11px] text-slate-400 font-medium">{ingredient.nameEn}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400">ស្តុកបច្ចុប្បន្ន</span>
              <div className="text-base font-black text-slate-900">
                {currentStock} {ingredient.unit}
              </div>
            </div>
          </div>

          {/* Usage Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-black text-slate-700">
                បរិមាណដែលបានប្រើប្រាស់ ({ingredient.unit}) <span className="text-rose-500">*</span>
              </label>
              {numUsed > currentStock && (
                <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  លើសពីស្តុកដែលមាន ({currentStock})
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={usedAmount}
                onChange={(e) => setUsedAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 text-lg font-black bg-purple-50/30 border border-purple-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-purple-900"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {ingredient.unit}
              </span>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-400 font-medium">ចំនួនរហ័ស៖</span>
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setUsedAmount(String(amt));
                  }}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    parseFloat(usedAmount) === amt
                      ? 'bg-purple-600 text-white shadow-xs font-black'
                      : 'bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600'
                  }`}
                >
                  +{amt} {ingredient.unit}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium">ស្តុកដើមមុនដក៖</span>
              <span className="font-bold text-slate-800">
                {currentStock} {ingredient.unit}
              </span>
            </div>
            <div className="flex items-center justify-between text-purple-700 font-semibold">
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                បរិមាណប្រើប្រាស់ (-):
              </span>
              <span className="font-black">
                -{numUsed || 0} {ingredient.unit}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800">ស្តុកនៅសល់ជាក់ស្តែង (=)៖</span>
              <span
                className={`text-sm font-black ${
                  isOutOfStock
                    ? 'text-rose-600'
                    : willBeLow
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {remainingAfter} {ingredient.unit}
              </span>
            </div>

            {/* Warning Alert if low stock */}
            {willBeLow && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center gap-1.5 text-[11px] font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  {isOutOfStock
                    ? 'ស្តុកនឹងអស់ពីឃ្លាំងទាំងស្រុង (0)!'
                    : `ស្តុកនឹងធ្លាក់ចុះក្រោមចំនួនដាស់តឿន (${ingredient.minAlertStock} ${ingredient.unit})`}
                </span>
              </div>
            )}

            {/* Cost of used ingredient */}
            <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
              <span>តម្លៃថ្លៃដើមដែលបានប្រើ៖</span>
              <span className="font-bold text-slate-700">
                ${estimatedCostUsedUsd} (~ {estimatedCostUsedKhr.toLocaleString()} ៛)
              </span>
            </div>
          </div>

          {/* Quick Note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              មូលហេតុ / មុខនំដែលយកទៅធ្វើ (កំណត់សម្គាល់)
            </label>
            <input
              type="text"
              placeholder="ឧ. ដុតនំខេកខួបកំណើត 4 នំ, នំបុ័ងព្រឹក, សាកល្បងរូបមន្ត..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={numUsed <= 0}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>✓ កត់ត្រាការប្រើប្រាស់</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
