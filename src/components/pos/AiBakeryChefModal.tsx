import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ChefHat,
  Scale,
  Flame,
  Clock,
  DollarSign,
  TrendingUp,
  PackageCheck,
  Check,
  Send,
  Loader2,
  BookmarkPlus,
  ShoppingBag,
  Info,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';
import { useBakery } from '../../context/BakeryContext';
import {
  generateBakeryRecipeWithAi,
  AiGeneratedRecipe,
} from '../../services/aiBakeryChefService';
import { Product, Recipe } from '../../types';

interface AiBakeryChefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiBakeryChefModal: React.FC<AiBakeryChefModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { ingredients, recipes, addRecipe, addProduct, exchangeRate } = useBakery();

  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<AiGeneratedRecipe | null>(null);
  const [savedToBom, setSavedToBom] = useState(false);
  const [addedToPos, setAddedToPos] = useState(false);

  const PRESETS = [
    '🥐 នំក្រូសង់ស្នូលពីស្តាស៊ីអូ & ស្ករត្នោតធម្មជាតិ',
    '🎂 នំខេកទុរេនកំពតឈីហ្វុនទន់ដូចពពក',
    '🍞 នំបុ័ងជប៉ុន Hokkaido Milk Shokupan',
    '🧁 French Macarons កាហ្វេទឹកដោះគោខ្មែរ',
    '🍰 Basque Burnt Cheesecake តែបៃតង Matcha',
  ];

  if (!isOpen) return null;

  const handleGenerate = async (query?: string) => {
    const textToUse = (query || promptInput).trim();
    if (!textToUse) return;

    soundFx.playPop();
    setIsGenerating(true);
    setRecipe(null);
    setSavedToBom(false);
    setAddedToPos(false);

    try {
      const res = await generateBakeryRecipeWithAi(textToUse, ingredients, exchangeRate);
      setRecipe(res);
      soundFx.playSuccess();
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      console.error('Error generating recipe:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToBom = () => {
    if (!recipe) return;
    soundFx.playSuccess();

    const totalCostUsd = recipe.totalBatchCostUsd + 1.5 + 0.8;
    const totalCostKhr = Math.round(totalCostUsd * (exchangeRate || 4100));
    const costPerUnitUsd = recipe.costPerPieceUsd;
    const costPerUnitKhr = Math.round(costPerUnitUsd * (exchangeRate || 4100));

    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}`,
      cakeNameKh: recipe.nameKh,
      cakeNameEn: recipe.nameEn,
      productId: `prod-chef-${Date.now()}`,
      yieldQty: recipe.yieldQuantity,
      yieldUnit: recipe.yieldUnit || 'ដុំ',
      items: recipe.ingredientsList.map((item) => ({
        ingredientId: item.matchedIngredientId,
        nameKh: item.name,
        quantity: item.quantity,
        unit: item.unit,
        costPerUnitUsd: item.unitCostUsd,
        itemCostUsd: item.totalCostUsd,
        itemCostKhr: Math.round(item.totalCostUsd * (exchangeRate || 4100)),
      })),
      instructions: recipe.instructionsKh.map((step, idx) => `${idx + 1}. ${step}`).join('\n'),
      laborCostUsd: 1.5,
      packagingCostUsd: 0.8,
      totalCostUsd,
      totalCostKhr,
      costPerUnitUsd,
      costPerUnitKhr,
      sellingPriceUsd: recipe.suggestedSellPriceUsd,
      sellingPriceKhr: Math.round(recipe.suggestedSellPriceUsd * (exchangeRate || 4100)),
      profitMarginPercent: recipe.profitMarginPercent,
    };

    addRecipe(newRecipe);
    setSavedToBom(true);
    confetti({ particleCount: 40, spread: 50 });
  };

  const handlePublishToPos = () => {
    if (!recipe) return;
    soundFx.playSuccess();

    const priceUsd = recipe.suggestedSellPriceUsd;
    const priceKhr = Math.round((priceUsd * (exchangeRate || 4100)) / 100) * 100;
    const costUsd = recipe.costPerPieceUsd;
    const costKhr = Math.round((costUsd * (exchangeRate || 4100)) / 100) * 100;

    const newProduct: Product = {
      id: `prod-chef-${Date.now()}`,
      nameKh: recipe.nameKh,
      nameEn: recipe.nameEn,
      barcode: `CHEF-${Math.floor(100 + Math.random() * 900)}`,
      priceUsd,
      priceKhr,
      costPriceUsd: costUsd,
      costPriceKhr: costKhr,
      categoryId: 'cat-pastries',
      stockQty: recipe.yieldQuantity * 2,
      unit: recipe.yieldUnit || 'ដុំ',
      description: `${recipe.descriptionKh} • ថ្លៃដើម: $${costUsd.toFixed(2)} (${recipe.profitMarginPercent}% Margin) • គន្លឹះ: ${recipe.chefSecretTipKh}`,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
    };

    addProduct(newProduct);
    setAddedToPos(true);
    confetti({ particleCount: 60, spread: 60 });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-amber-100 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base leading-tight font-battambang">
                  មេចុងភៅឆ្លាតវៃ AI (AI Bakery Chef R&D & Costing)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-300 text-amber-950 uppercase tracking-wider">
                  Baker's Formula
                </span>
              </div>
              <p className="text-[11px] text-amber-100/90 font-medium">
                បង្កើតរូបមន្តនំថ្មី គណនា Baker’s % ថ្លៃដើមគ្រឿងផ្សំក្នុងស្តុក និងប្រាក់ចំណេញ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Prompt Input */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200/80 shrink-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="វាយគំនិតនំដែលចង់បង្កើត ឧ. Croissant ពីស្តាស៊ីអូ, Chiffon ទុរេន, Shokupan..."
                className="w-full pl-4 pr-10 py-2.5 bg-white border-2 border-amber-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-inner"
              />
              <Sparkles className="w-4 h-4 text-amber-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              disabled={isGenerating || !promptInput.trim()}
              onClick={() => handleGenerate()}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងគណនា...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>បង្កើតរូបមន្ត</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              គំនិតពេញនិយម៖
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setPromptInput(preset);
                  handleGenerate(preset);
                }}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Body Result */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isGenerating ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center animate-bounce">
                <ChefHat className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-slate-800">
                AI Master Baker កំពុងស្រាវជ្រាវ និងគណនា Baker’s Percentage...
              </h4>
              <p className="text-xs text-slate-500">
                កំពុងផ្ទៀងផ្ទាត់ថ្លៃដើមគ្រឿងផ្សំក្នុងស្តុក និងកំណត់ផលចំណេញខ្ពស់បំផុត
              </p>
            </div>
          ) : recipe ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Recipe Title & Overview Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 font-battambang">
                      {recipe.nameKh}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200 text-amber-950">
                      {recipe.nameEn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    {recipe.descriptionKh}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-white/90 p-2 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-500 block">ទិន្នផល (Yield)</span>
                    <span className="text-xs font-black text-slate-800">
                      {recipe.yieldQuantity} {recipe.yieldUnit}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-500 block">កម្តៅដុត</span>
                    <span className="text-xs font-black text-orange-600">
                      {recipe.bakingTempC}°C
                    </span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-500 block">ពេលដុត</span>
                    <span className="text-xs font-black text-slate-800">
                      {recipe.bakingTimeMinutes} នាទី
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial & Food Costing Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">ថ្លៃដើមសរុប/មួយឆ្នាំង</span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    ${recipe.totalBatchCostUsd.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ~ {Math.round(recipe.totalBatchCostUsd * (exchangeRate || 4100)).toLocaleString()} ៛
                  </span>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                  <span className="text-[10px] text-rose-700 font-bold block">ថ្លៃដើមក្នុង ១ ដុំ (Food Cost)</span>
                  <span className="text-base font-black text-rose-600 font-mono">
                    ${recipe.costPerPieceUsd.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-rose-500 block">
                    ~ {Math.round(recipe.costPerPieceUsd * (exchangeRate || 4100)).toLocaleString()} ៛
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 font-bold block">តម្លៃលក់ណែនាំ (Sell Price)</span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    ${recipe.suggestedSellPriceUsd.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-500 block">
                    ~ {Math.round(recipe.suggestedSellPriceUsd * (exchangeRate || 4100)).toLocaleString()} ៛
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-800 font-bold block">ផលចំណេញសុទ្ធ (Profit Margin)</span>
                  <span className="text-base font-black text-amber-700 font-mono">
                    +{recipe.profitMarginPercent}%
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold block">
                    ចំណេញខ្ពស់ ⭐
                  </span>
                </div>
              </div>

              {/* Baker's Percentages & Ingredients Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Baker's % Table */}
                <div className="md:col-span-6 space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <span>រូបមន្តស្តង់ដារបារាំង (Baker's Percentages)</span>
                  </h4>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
                    {recipe.bakerPercentages.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-0">
                        <span className="font-bold text-slate-700">{item.ingredientName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">{item.weightGrams}g</span>
                          <span className="font-mono font-black text-amber-600 px-1.5 py-0.2 rounded bg-amber-100 text-[11px]">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Store Ingredients Matcher */}
                <div className="md:col-span-6 space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <span>គ្រឿងផ្សំក្នុងស្តុក & ថ្លៃដើមជាក់ស្តែង</span>
                  </h4>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5 text-xs max-h-52 overflow-y-auto">
                    {recipe.ingredientsList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full ${item.inStock ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          <span className="font-bold text-slate-800 truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className="text-slate-500">{item.quantity}{item.unit}</span>
                          <span className="font-bold text-slate-700">${item.totalCostUsd.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions & Secret Tip */}
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-amber-950 block">💡 គន្លឹះសម្ងាត់ពី Master Chef៖</span>
                    <p className="mt-0.5 leading-relaxed font-medium">{recipe.chefSecretTipKh}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
                  <span className="font-black text-slate-900 uppercase tracking-wider block mb-1">
                    👨‍🍳 ដំណាក់កាលធ្វើ (Step-by-Step Method)៖
                  </span>
                  {recipe.instructionsKh.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 leading-relaxed font-medium">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100/70 text-amber-600 flex items-center justify-center">
                <ChefHat className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-slate-800 font-battambang">
                សូមវាយគំនិតនំដែលចង់បាន ឬចុចលើ «គំនិតពេញនិយម» ខាងលើ
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                AI នឹងវិភាគក្បួនដុតនំស្តង់ដារអន្តរជាតិ Baker’s Percentages ផ្ទៀងផ្ទាត់ជាមួយតម្លៃគ្រឿងផ្សំក្នុងស្តុក និងគណនាប្រាក់ចំណេញជូនភ្លាមៗ!
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {recipe && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">
              បង្កើតដោយ SweetBakery AI Chef
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={savedToBom}
                onClick={handleSaveToBom}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  savedToBom
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs active:scale-95'
                }`}
              >
                {savedToBom ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{savedToBom ? 'បានរក្សាទុកក្នុងស្តុក BOM' : 'រក្សាទុកក្នុងរូបមន្តស្តុក'}</span>
              </button>

              <button
                type="button"
                disabled={addedToPos}
                onClick={handlePublishToPos}
                className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 ${
                  addedToPos
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-amber-600/25'
                }`}
              >
                {addedToPos ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{addedToPos ? 'បានដាក់លក់លើ POS រួចរាល់' : '🛒 ដាក់លក់លើ POS ភ្លាមៗ'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
