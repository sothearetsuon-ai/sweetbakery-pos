import React, { useState } from 'react';
import {
  X,
  Flame,
  CheckCircle2,
  AlertTriangle,
  History,
  ChefHat,
  Package,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
import { formatKhr } from '../../utils/currencyUtils';

const formatUsd = (val: number | undefined | null) => `$${Number(val || 0).toFixed(2)}`;

interface BatchBakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRecipeId?: string;
}

export const BatchBakeModal: React.FC<BatchBakeModalProps> = ({
  isOpen,
  onClose,
  preselectedRecipeId,
}) => {
  const {
    recipes,
    ingredients,
    products,
    currentStaff,
    executeBatchBake,
    batchBakeLogs,
    lang,
  } = useBakery();

  const [activeTab, setActiveTab] = useState<'bake' | 'history'>('bake');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    preselectedRecipeId || (recipes[0]?.id || '')
  );
  const [batchQty, setBatchQty] = useState<number>(10);
  const [targetProductId, setTargetProductId] = useState<string>('');
  const [bakedBy, setBakedBy] = useState<string>(currentStaff?.name || 'មេជាងនំ Bakery Chef');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  // Set default target product when recipe changes
  const currentTargetProductId = targetProductId || selectedRecipe?.productId || '';

  const multiplier = selectedRecipe ? batchQty / (selectedRecipe.yieldQty || 1) : 1;

  // Check ingredient requirements & availability
  const ingredientsCheck = (selectedRecipe?.items || []).map((item) => {
    const requiredQty = (item.quantity || 0) * multiplier;
    const ing = ingredients.find((i) => i.id === item.ingredientId || i.nameKh === item.nameKh);
    const available = ing ? ing.currentStock : 0;
    const isSufficient = available >= requiredQty;
    return {
      nameKh: item.nameKh,
      requiredQty: Math.round(requiredQty * 100) / 100,
      unit: item.unit,
      availableQty: available,
      isSufficient,
      costUsd: (item.itemCostUsd || 0) * multiplier,
    };
  });

  const hasShortage = ingredientsCheck.some((i) => !i.isSufficient);
  const totalBatchCostUsd = (selectedRecipe?.costPerUnitUsd || 0) * batchQty;
  const totalBatchCostKhr = (selectedRecipe?.costPerUnitKhr || 0) * batchQty;

  const handleConfirmBake = () => {
    if (!selectedRecipe) return;
    setIsSubmitting(true);
    soundFx.playPop();

    try {
      const res = executeBatchBake(selectedRecipe.id, batchQty, bakedBy, currentTargetProductId);
      if (res.success) {
        soundFx.playSuccess();
        setFeedbackMsg({ type: 'success', text: res.message });
        setTimeout(() => {
          setFeedbackMsg(null);
          setActiveTab('history');
        }, 1200);
      } else {
        soundFx.playWarning();
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      soundFx.playWarning();
      setFeedbackMsg({ type: 'error', text: e.message || 'មានបញ្ហាក្នុងការដុតនំ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.15)] rounded-3xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-amber-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>ដុតនំជាឡូ & កាត់ស្តុកគ្រឿងផ្សំ</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  Batch Baking BOM
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                គណនាគ្រឿងផ្សំតាមរូបមន្ត ផលិតនំ និងកាត់ស្តុកវត្ថុធាតុដើមស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('bake')}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'bake'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>កាលវិភាគដុតនំថ្មី (New Batch)</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'history'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ប្រវត្តិដុតនំ ({batchBakeLogs.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-2xl text-sm font-medium flex items-center gap-3 animate-fade-in ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {activeTab === 'bake' ? (
            <div className="space-y-6">
              {/* Recipe Selector & Batch Qty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ជ្រើសរើសរូបមន្តនំ (Select Recipe) *
                  </label>
                  <select
                    value={selectedRecipeId}
                    onChange={(e) => {
                      setSelectedRecipeId(e.target.value);
                      const rec = recipes.find((r) => r.id === e.target.value);
                      if (rec?.productId) setTargetProductId(rec.productId);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                  >
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.cakeNameKh} ({formatUsd(r.costPerUnitUsd || 0)} / {r.yieldUnit || 'នំ'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ចំនួនដុត (Batch Quantity) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={batchQty}
                      onChange={(e) => setBatchQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                    />
                    <span className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm">
                      {selectedRecipe?.yieldUnit || 'នំ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Product to Restock & Baker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-rose-500" />
                    <span>បញ្ចូលស្តុកទំនិញលក់ POS (Restock Product)</span>
                  </label>
                  <select
                    value={currentTargetProductId}
                    onChange={(e) => setTargetProductId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                  >
                    <option value="">-- មិនបញ្ចូលស្តុក POS (ដុតប្រើផ្ទាល់) --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameKh} (ស្តុកបច្ចុប្បន្ន: {p.stockQty} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                    <span>ឈ្មោះមេជាងនំ (Baked By)</span>
                  </label>
                  <input
                    type="text"
                    value={bakedBy}
                    onChange={(e) => setBakedBy(e.target.value)}
                    placeholder="ឈ្មោះចុងភៅដុតនំ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Recipe Cost Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-rose-50/50 to-white border border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                    ថ្លៃដើមផលិតសរុប (Total Batch Cost)
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-rose-600">{formatUsd(totalBatchCostUsd)}</span>
                    <span className="text-sm font-bold text-slate-600">({formatKhr(totalBatchCostKhr)})</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">ថ្លៃដើមក្នុង ១ {selectedRecipe?.yieldUnit || 'នំ'}</p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatUsd(selectedRecipe?.costPerUnitUsd || 0)} / {formatKhr(selectedRecipe?.costPerUnitKhr || 0)}
                  </p>
                </div>
              </div>

              {/* Ingredients Requirement & Stock Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>តម្រូវការគ្រឿងផ្សំ & ពិនិត្យស្តុក (Ingredients Needed)</span>
                  </h4>
                  {hasShortage && (
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      មានគ្រឿងផ្សំខ្វះស្តុកខ្លះ (នឹងកាត់ស្តុកចុះសូន្យ)
                    </span>
                  )}
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {ingredientsCheck.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 flex items-center justify-between text-sm transition-colors ${
                          item.isSufficient ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.isSufficient ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold text-slate-800">{item.nameKh}</span>
                            <div className="text-xs text-slate-500">
                              ស្តុកបច្ចុប្បន្ន: <span className="font-medium">{item.availableQty} {item.unit}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-800">
                            - {item.requiredQty} {item.unit}
                          </span>
                          <p className="text-xs text-slate-500 font-mono">
                            {formatUsd(item.costUsd)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-4">
              {batchBakeLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ChefHat className="w-12 h-12 mx-auto stroke-1 opacity-50 mb-2" />
                  <p className="text-sm font-medium">មិនទាន់មានប្រវត្តិដុតនំនៅឡើយទេ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {batchBakeLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-rose-200 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-base">{log.recipeNameKh}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                              +{log.batchQty} {log.unit}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{log.date}</span>
                            <span>•</span>
                            <span>មេជាង: {log.bakedBy}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-rose-600 text-base">{formatUsd(log.totalCostUsd)}</span>
                          <p className="text-xs text-slate-500 font-medium">({formatKhr(log.totalCostKhr)})</p>
                        </div>
                      </div>

                      {log.deductedIngredients && log.deductedIngredients.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {log.deductedIngredients.map((ing, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                            >
                              {ing.ingredientNameKh}: {ing.quantityUsed} {ing.unit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'bake' && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              បោះបង់
            </button>
            <button
              onClick={handleConfirmBake}
              disabled={isSubmitting || !selectedRecipe}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Flame className="w-4 h-4" />
              <span>{isSubmitting ? 'កំពុងដំណើរការ...' : 'បញ្ជាក់ការដុតនំ & កាត់ស្តុក'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
