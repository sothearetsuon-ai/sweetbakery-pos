import React, { useRef } from 'react';
import {
  X,
  Printer,
  Cake,
  Layers,
  Sparkles,
  Box,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Recipe } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { exchangeRate, storeInfo } = useBakery();
  const printRef = useRef<HTMLDivElement>(null);

  if (!recipe) return null;

  const handlePrint = () => {
    soundFx.playPop();
    window.print();
  };

  const totalCostKhr = recipe.totalCostKhr ?? Math.round(recipe.totalCostUsd * exchangeRate);
  const costPerUnitKhr = recipe.costPerUnitKhr ?? Math.round((recipe.costPerUnitUsd || recipe.totalCostUsd / recipe.yieldQty) * exchangeRate);
  const sellingPriceKhr = recipe.sellingPriceKhr ?? (recipe.sellingPriceUsd ? Math.round(recipe.sellingPriceUsd * exchangeRate) : 0);
  const grossProfitKhr = sellingPriceKhr - costPerUnitKhr;
  const grossProfitUsd = recipe.sellingPriceUsd ? recipe.sellingPriceUsd - recipe.costPerUnitUsd : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 overflow-hidden max-h-[96vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-rose-50/70 to-pink-50/50 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                សន្លឹករូបមន្ត & ថ្លៃដើម BOM (Recipe & Cost Sheet)
              </h3>
              <p className="text-[11px] text-slate-500">{recipe.cakeNameKh}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>បោះពុម្ព (Print)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-slate-800">
          {/* Top Banner */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                  {storeInfo.nameKh || 'SWEET BAKERY & CAFE'}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1.5">
                  🎂 {recipe.cakeNameKh}
                </h2>
                {recipe.cakeNameEn && (
                  <p className="text-xs text-slate-500 font-semibold">{recipe.cakeNameEn}</p>
                )}
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 block">បរិមាណផលិត (Yield):</span>
                <span className="text-base font-black text-slate-900">
                  {recipe.yieldQty} {recipe.yieldUnit}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Metric Badges */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 block">ថ្លៃដើម/ឯកតា (COGS)</span>
              <div className="text-sm font-black text-rose-600 mt-0.5">
                {costPerUnitKhr.toLocaleString()} ៛
              </div>
              <div className="text-[10px] text-slate-400 font-bold">~ ${recipe.costPerUnitUsd.toFixed(2)}</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 block">តម្លៃលក់ (Price)</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {sellingPriceKhr.toLocaleString()} ៛
              </div>
              <div className="text-[10px] text-slate-400 font-bold">~ ${(recipe.sellingPriceUsd || 0).toFixed(2)}</div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-800 block">ចំណេញ (Margin %)</span>
              <div className="text-sm font-black text-emerald-600 mt-0.5">
                {recipe.profitMarginPercent ?? 0}%
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">
                +{grossProfitKhr.toLocaleString()} ៛
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>បញ្ជីគ្រឿងផ្សំ (Bill of Materials - BOM):</span>
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">មុខគ្រឿងផ្សំ</th>
                    <th className="p-2.5 text-center">បរិមាណ</th>
                    <th className="p-2.5 text-right">ថ្លៃដើម (KHR / USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recipe.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-800">
                        • {item.nameKh}
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-2.5 text-right font-black text-slate-700">
                        {(item.itemCostKhr ?? Math.round(item.itemCostUsd * exchangeRate)).toLocaleString()} ៛
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          (${item.itemCostUsd.toFixed(2)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td colSpan={2} className="p-2.5 text-right text-slate-600">
                      សរុបគ្រឿងផ្សំ៖
                    </td>
                    <td className="p-2.5 text-right font-black text-rose-600">
                      {recipe.items.reduce((sum, i) => sum + (i.itemCostKhr ?? Math.round(i.itemCostUsd * exchangeRate)), 0).toLocaleString()} ៛
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Production Costs Breakdown */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <span className="font-bold text-slate-700 block mb-1">ថ្លៃដើមផលិតបន្ថែម (Overhead Breakdown):</span>
            <div className="flex justify-between text-slate-600">
              <span>• ថ្លៃប្រអប់/វេចខ្ចប់៖</span>
              <span className="font-bold">{(recipe.packagingCostKhr ?? Math.round((recipe.packagingCostUsd || 0) * exchangeRate)).toLocaleString()} ៛ (~${(recipe.packagingCostUsd || 0).toFixed(2)})</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>• ថ្លៃកម្លាំងពលកម្ម (Labor)៖</span>
              <span className="font-bold">{(recipe.laborCostKhr ?? Math.round((recipe.laborCostUsd || 0) * exchangeRate)).toLocaleString()} ៛ (~${(recipe.laborCostUsd || 0).toFixed(2)})</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>• ថ្លៃភ្លើង ហ្គាស ទឹក (Utilities)៖</span>
              <span className="font-bold">{(recipe.overheadCostKhr ?? Math.round((recipe.overheadCostUsd || 0) * exchangeRate)).toLocaleString()} ៛ (~${(recipe.overheadCostUsd || 0).toFixed(2)})</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-sm">
              <span className="text-slate-900">ថ្លៃដើមសរុប (Total Batch Cost):</span>
              <span className="text-rose-600">{totalCostKhr.toLocaleString()} ៛ (~${recipe.totalCostUsd.toFixed(2)})</span>
            </div>
          </div>

          {/* Instructions */}
          {recipe.instructions && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-1 text-xs">
              <span className="font-black text-amber-950 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>វិធីធ្វើ & គន្លឹះដុតនំ (Baking Instructions):</span>
              </span>
              <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed pl-1 pt-1">
                {recipe.instructions}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 print:hidden">
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onDelete(recipe);
                onClose();
              }}
              className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>លុបរូបមន្ត</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer"
            >
              បិទ
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onEdit(recipe);
                  onClose();
                }}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-xl shadow-md shadow-pink-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>កែប្រែរូបមន្ត</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
