import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Plus,
  Trash2,
  DollarSign,
  Sparkles,
  Calculator,
  Cake,
  TrendingUp,
  Box,
  Flame,
  Check,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { Recipe, RecipeItem, Ingredient, Product } from '../../types';
import { soundFx } from '../../utils/audio';

interface AddEditRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeToEdit?: Recipe | null;
}

export const AddEditRecipeModal: React.FC<AddEditRecipeModalProps> = ({
  isOpen,
  onClose,
  recipeToEdit,
}) => {
  const {
    lang,
    exchangeRate,
    products,
    ingredients,
    addRecipe,
    updateRecipe,
    updateProduct,
  } = useBakery();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [cakeNameKh, setCakeNameKh] = useState('');
  const [cakeNameEn, setCakeNameEn] = useState('');
  const [yieldQty, setYieldQty] = useState<number>(1);
  const [yieldUnit, setYieldUnit] = useState<string>('នំ');

  // Recipe Items (BOM)
  const [items, setItems] = useState<RecipeItem[]>([]);

  // Overhead Costs (in KHR)
  const [packagingCostKhr, setPackagingCostKhr] = useState<string>('2500');
  const [laborCostKhr, setLaborCostKhr] = useState<string>('3000');
  const [overheadCostKhr, setOverheadCostKhr] = useState<string>('1500');

  // Selling Price (in KHR)
  const [sellingPriceKhr, setSellingPriceKhr] = useState<string>('80000');
  const [instructions, setInstructions] = useState('');
  const [syncToProductCost, setSyncToProductCost] = useState(true);

  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      if (recipeToEdit) {
        setSelectedProductId(recipeToEdit.productId || '');
        setCakeNameKh(recipeToEdit.cakeNameKh || '');
        setCakeNameEn(recipeToEdit.cakeNameEn || '');
        setYieldQty(recipeToEdit.yieldQty || 1);
        setYieldUnit(recipeToEdit.yieldUnit || 'នំ');
        setItems(recipeToEdit.items || []);
        setPackagingCostKhr((recipeToEdit.packagingCostKhr ?? Math.round((recipeToEdit.packagingCostUsd || 0) * exchangeRate)).toString());
        setLaborCostKhr((recipeToEdit.laborCostKhr ?? Math.round((recipeToEdit.laborCostUsd || 0) * exchangeRate)).toString());
        setOverheadCostKhr((recipeToEdit.overheadCostKhr ?? Math.round((recipeToEdit.overheadCostUsd || 0) * exchangeRate)).toString());
        setSellingPriceKhr((recipeToEdit.sellingPriceKhr ?? Math.round((recipeToEdit.sellingPriceUsd || 0) * exchangeRate)).toString());
        setInstructions(recipeToEdit.instructions || '');
      } else {
        // Default new recipe
        setSelectedProductId('');
        setCakeNameKh('');
        setCakeNameEn('');
        setYieldQty(1);
        setYieldUnit('នំ');
        setPackagingCostKhr('2600');
        setLaborCostKhr('3200');
        setOverheadCostKhr('1500');
        setSellingPriceKhr('80000');
        setInstructions('');
        
        // Initial default 2 ingredient rows
        const defaultIng1 = ingredients[0];
        const defaultIng2 = ingredients[1];
        const initialRows: RecipeItem[] = [];
        if (defaultIng1) {
          const qty = 300;
          const cost = calculateItemCost(defaultIng1, qty, 'g');
          initialRows.push({
            ingredientId: defaultIng1.id,
            nameKh: defaultIng1.nameKh,
            nameEn: defaultIng1.nameEn,
            quantity: qty,
            unit: 'g',
            costPerUnitUsd: defaultIng1.costPerUnitUsd,
            itemCostUsd: cost,
            itemCostKhr: Math.round(cost * exchangeRate),
          });
        }
        if (defaultIng2) {
          const qty = 200;
          const cost = calculateItemCost(defaultIng2, qty, 'g');
          initialRows.push({
            ingredientId: defaultIng2.id,
            nameKh: defaultIng2.nameKh,
            nameEn: defaultIng2.nameEn,
            quantity: qty,
            unit: 'g',
            costPerUnitUsd: defaultIng2.costPerUnitUsd,
            itemCostUsd: cost,
            itemCostKhr: Math.round(cost * exchangeRate),
          });
        }
        setItems(initialRows);
      }
    }
  }, [isOpen, recipeToEdit, exchangeRate, ingredients]);

  // Helper: calculate single item cost in USD
  function calculateItemCost(
    ing: Ingredient | undefined,
    qty: number,
    unit: string
  ): number {
    if (!ing || !ing.costPerUnitUsd || qty <= 0) return 0;

    const baseCost = ing.costPerUnitUsd;
    const stockUnit = (ing.unit || '').toLowerCase().trim();
    const recipeUnit = (unit || '').toLowerCase().trim();

    // If matching units exactly
    if (stockUnit === recipeUnit) {
      return baseCost * qty;
    }

    // Weight conversions: Stock is kg and Recipe is g (e.g. $1.50/kg -> ($1.50 / 1000) * 250g)
    const isStockKg = stockUnit === 'kg' || stockUnit.startsWith('kg') || stockUnit.includes('គីឡូ');
    const isRecipeG = recipeUnit === 'g' || recipeUnit.startsWith('g') || recipeUnit.includes('ក្រាម');
    if (isStockKg && isRecipeG) {
      return (baseCost / 1000) * qty;
    }

    // Weight conversions: Stock is g and Recipe is kg
    const isStockG = stockUnit === 'g' || stockUnit.startsWith('g') || stockUnit.includes('ក្រាម');
    const isRecipeKg = recipeUnit === 'kg' || recipeUnit.startsWith('kg') || recipeUnit.includes('គីឡូ');
    if (isStockG && isRecipeKg) {
      return baseCost * 1000 * qty;
    }

    // Volume conversions: Stock is L/liter and Recipe is ml or g (for liquids like milk/water: 1L = 1000ml ≈ 1000g)
    const isStockLiter = stockUnit === 'l' || stockUnit === 'liter' || stockUnit.includes('លីត្រ');
    const isRecipeMlOrG = recipeUnit === 'ml' || recipeUnit === 'g';
    if (isStockLiter && isRecipeMlOrG) {
      return (baseCost / 1000) * qty;
    }
    if ((stockUnit === 'ml' || stockUnit === 'g') && isRecipeKg) {
      return baseCost * 1000 * qty;
    }

    // Default 1:1
    return baseCost * qty;
  }

  // Handle selecting a product to auto-fill details
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    if (!productId) return;
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setCakeNameKh(prod.nameKh);
      setCakeNameEn(prod.nameEn);
      const khr = prod.priceKhr ?? Math.round(prod.priceUsd * exchangeRate);
      setSellingPriceKhr(khr.toString());
      setYieldUnit(prod.unit || 'នំ');
    }
  };

  // Add new ingredient row
  const handleAddIngredientRow = () => {
    soundFx.playPop();
    const firstIng = ingredients[0];
    if (firstIng) {
      const defaultQty = firstIng.unit === 'kg' ? 250 : firstIng.unit === 'pcs' ? 2 : 100;
      const defaultUnit = firstIng.unit === 'kg' ? 'g' : firstIng.unit;
      const cost = calculateItemCost(firstIng, defaultQty, defaultUnit);
      setItems((prev) => [
        ...prev,
        {
          ingredientId: firstIng.id,
          nameKh: firstIng.nameKh,
          nameEn: firstIng.nameEn,
          quantity: defaultQty,
          unit: defaultUnit,
          costPerUnitUsd: firstIng.costPerUnitUsd,
          itemCostUsd: cost,
          itemCostKhr: Math.round(cost * exchangeRate),
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          nameKh: 'គ្រឿងផ្សំថ្មី',
          quantity: 100,
          unit: 'g',
          costPerUnitUsd: 0.5,
          itemCostUsd: 0.5,
          itemCostKhr: Math.round(0.5 * exchangeRate),
        },
      ]);
    }
  };

  // Update ingredient in row
  const handleUpdateItemIngredient = (index: number, ingredientId: string) => {
    const targetIng = ingredients.find((i) => i.id === ingredientId);
    if (!targetIng) return;

    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const newUnit = targetIng.unit === 'kg' ? 'g' : targetIng.unit;
        const cost = calculateItemCost(targetIng, item.quantity, newUnit);
        return {
          ...item,
          ingredientId: targetIng.id,
          nameKh: targetIng.nameKh,
          nameEn: targetIng.nameEn,
          unit: newUnit,
          costPerUnitUsd: targetIng.costPerUnitUsd,
          itemCostUsd: cost,
          itemCostKhr: Math.round(cost * exchangeRate),
        };
      })
    );
  };

  // Update quantity in row
  const handleUpdateItemQty = (index: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const targetIng = ingredients.find((i) => i.id === item.ingredientId);
        const cost = targetIng
          ? calculateItemCost(targetIng, qty, item.unit)
          : (item.costPerUnitUsd || 0) * qty;
        return {
          ...item,
          quantity: qty,
          itemCostUsd: cost,
          itemCostKhr: Math.round(cost * exchangeRate),
        };
      })
    );
  };

  // Update unit in row
  const handleUpdateItemUnit = (index: number, unit: string) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const targetIng = ingredients.find((i) => i.id === item.ingredientId);
        const cost = targetIng
          ? calculateItemCost(targetIng, item.quantity, unit)
          : item.itemCostUsd;
        return {
          ...item,
          unit,
          itemCostUsd: cost,
          itemCostKhr: Math.round(cost * exchangeRate),
        };
      })
    );
  };

  // Remove row
  const handleRemoveItem = (index: number) => {
    soundFx.playPop();
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const rawIngredientsCostUsd = items.reduce((sum, item) => sum + (item.itemCostUsd || 0), 0);
  const rawIngredientsCostKhr = Math.round(rawIngredientsCostUsd * exchangeRate);

  const numPackagingKhr = parseInt(packagingCostKhr, 10) || 0;
  const numPackagingUsd = Number((numPackagingKhr / exchangeRate).toFixed(2));

  const numLaborKhr = parseInt(laborCostKhr, 10) || 0;
  const numLaborUsd = Number((numLaborKhr / exchangeRate).toFixed(2));

  const numOverheadKhr = parseInt(overheadCostKhr, 10) || 0;
  const numOverheadUsd = Number((numOverheadKhr / exchangeRate).toFixed(2));

  const totalBatchCostUsd = rawIngredientsCostUsd + numPackagingUsd + numLaborUsd + numOverheadUsd;
  const totalBatchCostKhr = rawIngredientsCostKhr + numPackagingKhr + numLaborKhr + numOverheadKhr;

  const validYield = Math.max(1, yieldQty);
  const costPerUnitUsd = Number((totalBatchCostUsd / validYield).toFixed(2));
  const costPerUnitKhr = Math.round(totalBatchCostKhr / validYield);

  const numSellingPriceKhr = parseInt(sellingPriceKhr, 10) || 0;
  const numSellingPriceUsd = Number((numSellingPriceKhr / exchangeRate).toFixed(2));

  const grossProfitKhr = numSellingPriceKhr - costPerUnitKhr;
  const grossProfitUsd = Number((numSellingPriceUsd - costPerUnitUsd).toFixed(2));
  const profitMarginPercent = numSellingPriceKhr > 0
    ? Number(((grossProfitKhr / numSellingPriceKhr) * 100).toFixed(1))
    : 0;

  // Save recipe
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cakeNameKh.trim()) return;

    soundFx.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    const recipeData: Omit<Recipe, 'id'> = {
      productId: selectedProductId || undefined,
      cakeNameKh: cakeNameKh.trim(),
      cakeNameEn: cakeNameEn.trim() || undefined,
      yieldQty: validYield,
      yieldUnit: yieldUnit.trim() || 'នំ',
      items,
      packagingCostUsd: numPackagingUsd,
      packagingCostKhr: numPackagingKhr,
      laborCostUsd: numLaborUsd,
      laborCostKhr: numLaborKhr,
      overheadCostUsd: numOverheadUsd,
      overheadCostKhr: numOverheadKhr,
      totalCostUsd: totalBatchCostUsd,
      totalCostKhr: totalBatchCostKhr,
      costPerUnitUsd,
      costPerUnitKhr,
      sellingPriceUsd: numSellingPriceUsd,
      sellingPriceKhr: numSellingPriceKhr,
      profitMarginPercent,
      instructions: instructions.trim() || undefined,
    };

    if (recipeToEdit) {
      updateRecipe({ ...recipeData, id: recipeToEdit.id });
    } else {
      addRecipe(recipeData);
    }

    // Optionally update the associated product costPrice
    if (syncToProductCost && selectedProductId) {
      const targetProd = products.find((p) => p.id === selectedProductId);
      if (targetProd) {
        updateProduct({
          ...targetProd,
          costPriceUsd: costPerUnitUsd,
          costPriceKhr: costPerUnitKhr,
        });
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-rose-100 overflow-hidden max-h-[96vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-rose-100/80 bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-amber-50/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {recipeToEdit ? '✏️ កែប្រែរូបមន្ត & គណនាថ្លៃដើម BOM' : '🧁 បង្កើតរូបមន្ត & គណនាថ្លៃដើម BOM (Bill of Materials)'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                គណនាថ្លៃដើមគ្រឿងផ្សំ ថ្លៃប្រអប់ ពលកម្ម និងវិភាគប្រាក់ចំណេញសុទ្ធ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 1: Cake / Product Selector & Yield */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Cake className="w-4 h-4 text-pink-600" />
                <span>១. ព័ត៌មានមុខនំ & បរិមាណផលិត (Cake & Yield)</span>
              </span>
              {selectedProductId && (
                <span className="text-[10px] font-black bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                  បានភ្ជាប់ជាមួយទំនិញលក់ POS
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  ជ្រើសរើសពីមុខទំនិញស្រាប់ (ស្រេចចិត្ត)
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                >
                  <option value="">-- បញ្ចូលឈ្មោះនំដោយផ្ទាល់ --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameKh} ({p.nameEn || p.categoryId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  ឈ្មោះនំ (ភាសាខ្មែរ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. នំខេកសូកូឡាហ្វាដ (1.5kg)"
                  value={cakeNameKh}
                  onChange={(e) => setCakeNameKh(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    បរិមាណផលិត (Yield)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={yieldQty}
                    onChange={(e) => setYieldQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    ខ្នាត (Unit)
                  </label>
                  <input
                    type="text"
                    value={yieldUnit}
                    onChange={(e) => setYieldUnit(e.target.value)}
                    placeholder="នំ / ដុំ / ប្រអប់"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Ingredients BOM Table */}
          <div className="p-4 bg-white border border-rose-200/90 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>២. តារាងគ្រឿងផ្សំក្នុងរូបមន្ត (Ingredients BOM Table)</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ប្រព័ន្ធនឹងគណនាថ្លៃដើមស្វ័យប្រវត្តិតាមតម្លៃគ្រឿងផ្សំក្នុងស្តុក ({ingredients.length} មុខ)
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddIngredientRow}
                className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ ថែមគ្រឿងផ្សំ</span>
              </button>
            </div>

            {/* Gram (g) Weighing Guidance Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-pink-50/70 border border-amber-200/90 rounded-2xl p-3 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <span className="text-base">⚖️</span>
                <span>របៀបបញ្ចូលគ្រឿងផ្សំថ្លឹងជាក្រាម (g) អោយបានត្រឹមត្រូវ៖</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-700">
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                  <div className="font-bold text-amber-950 mb-0.5">១. ក្នុងស្តុក (Inventory)</div>
                  <p className="text-slate-600">
                    ដាក់ខ្នាតជា <strong className="text-rose-600">kg</strong> (ឧ. ម្សៅមី $1.20/kg, ស្ករស $1.00/kg, ប៊័រ $6.00/kg)
                  </p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                  <div className="font-bold text-amber-950 mb-0.5">២. ក្នុងរូបមន្ត (Recipe)</div>
                  <p className="text-slate-600">
                    ជ្រើសខ្នាត <strong className="text-rose-600">g</strong> រួចវាយលេខតាមជញ្ជីង (ឧ. 350, 150, 20...)
                  </p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                  <div className="font-bold text-amber-950 mb-0.5">៣. ប្រព័ន្ធគណនាអូតូ</div>
                  <p className="text-slate-600">
                    ប្រព័ន្ធនឹងយក <strong className="text-rose-600">តម្លៃ/kg ÷ 1000 × ចំនួនក្រាម</strong> ដោយស្វ័យប្រវត្តិ!
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-2.5">មុខគ្រឿងផ្សំ (Ingredient)</th>
                    <th className="p-2.5 w-28 text-center">បរិមាណ (Qty)</th>
                    <th className="p-2.5 w-24 text-center">ខ្នាត (Unit)</th>
                    <th className="p-2.5 w-32 text-right">ថ្លៃដើម (Cost)</th>
                    <th className="p-2.5 w-12 text-center">លុប</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                      <td className="p-2">
                        <select
                          value={item.ingredientId || ''}
                          onChange={(e) => handleUpdateItemIngredient(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500"
                        >
                          <option value="">-- ជ្រើសរើសគ្រឿងផ្សំ --</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.nameKh} (${ing.costPerUnitUsd}/{ing.unit})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQty(idx, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800 text-center focus:outline-none focus:ring-1 focus:ring-pink-500"
                        />
                      </td>

                      <td className="p-2">
                        <select
                          value={item.unit}
                          onChange={(e) => handleUpdateItemUnit(idx, e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-pink-500"
                        >
                          <option value="g">g (ក្រាម)</option>
                          <option value="kg">kg (គីឡូ)</option>
                          <option value="ml">ml (មីលីលីត្រ)</option>
                          <option value="L">L (លីត្រ)</option>
                          <option value="pcs">គ្រាប់/ដុំ</option>
                          <option value="box">ប្រអប់</option>
                        </select>
                      </td>

                      <td className="p-2 text-right">
                        <div className="font-black text-rose-600 text-xs">
                          {(item.itemCostKhr ?? Math.round(item.itemCostUsd * exchangeRate)).toLocaleString()} ៛
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          ${item.itemCostUsd.toFixed(2)}
                        </div>
                      </td>

                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="លុបមុខនេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-rose-50/50 font-bold border-t border-slate-200">
                    <td colSpan={3} className="p-2.5 text-right text-slate-700">
                      សរុបថ្លៃដើមគ្រឿងផ្សំ (Raw Materials Subtotal):
                    </td>
                    <td className="p-2.5 text-right font-black text-rose-600 text-sm">
                      {rawIngredientsCostKhr.toLocaleString()} ៛ (${rawIngredientsCostUsd.toFixed(2)})
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 3: Overhead & Production Costs */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-purple-600" />
              <span>៣. ថ្លៃដើមបន្ថែមសម្រាប់ការផលិត (Packaging, Labor & Overhead)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  📦 ថ្លៃប្រអប់/វេចខ្ចប់ (៛ KHR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={packagingCostKhr}
                    onChange={(e) => setPackagingCostKhr(e.target.value)}
                    className="w-full px-3 py-2 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    ៛
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">~ ${numPackagingUsd.toFixed(2)}</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  👨‍🍳 ថ្លៃកម្លាំងពលកម្ម (៛ KHR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={laborCostKhr}
                    onChange={(e) => setLaborCostKhr(e.target.value)}
                    className="w-full px-3 py-2 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    ៛
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">~ ${numLaborUsd.toFixed(2)}</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  ⚡ ថ្លៃភ្លើង ហ្គាស ទឹក (៛ KHR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={overheadCostKhr}
                    onChange={(e) => setOverheadCostKhr(e.target.value)}
                    className="w-full px-3 py-2 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    ៛
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">~ ${numOverheadUsd.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Live Analytics & Profit Margin Summary Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black tracking-wide text-white">
                  ៤. លទ្ធផលគណនាថ្លៃដើម & វិភាគប្រាក់ចំណេញ (BOM Cost & Margin Analytics)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-300">តម្លៃលក់កំណត់ (Selling Price):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={sellingPriceKhr}
                    onChange={(e) => setSellingPriceKhr(e.target.value)}
                    className="w-32 px-2.5 py-1 pr-6 bg-slate-700/90 border border-slate-600 rounded-xl text-xs font-black text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 text-right"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    ៛
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics 4 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  ថ្លៃដើមសរុប (Total Batch)
                </span>
                <div className="text-lg font-black text-rose-400 mt-1">
                  {totalBatchCostKhr.toLocaleString()} ៛
                </div>
                <div className="text-[11px] font-bold text-slate-400">~ ${totalBatchCostUsd.toFixed(2)}</div>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  ថ្លៃដើមក្នុង ១ {yieldUnit} (COGS)
                </span>
                <div className="text-lg font-black text-rose-300 mt-1">
                  {costPerUnitKhr.toLocaleString()} ៛
                </div>
                <div className="text-[11px] font-bold text-slate-400">~ ${costPerUnitUsd.toFixed(2)}</div>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  ចំណេញក្នុង ១ {yieldUnit} (Gross Profit)
                </span>
                <div className="text-lg font-black text-emerald-400 mt-1">
                  {grossProfitKhr.toLocaleString()} ៛
                </div>
                <div className="text-[11px] font-bold text-slate-400">~ ${grossProfitUsd.toFixed(2)}</div>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  ភាគរយចំណេញ (Margin %)
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-2xl font-black ${profitMarginPercent >= 50 ? 'text-emerald-400' : profitMarginPercent >= 30 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {profitMarginPercent}%
                  </span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit ${profitMarginPercent >= 50 ? 'bg-emerald-500/20 text-emerald-300' : profitMarginPercent >= 30 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {profitMarginPercent >= 50 ? '🌟 ចំណេញខ្ពស់' : profitMarginPercent >= 30 ? '👍 មធ្យម' : '⚠️ ចំណេញតិច'}
                </span>
              </div>
            </div>

            {/* Auto sync checkbox */}
            {selectedProductId && (
              <label className="flex items-center gap-2 text-xs font-bold text-amber-200/90 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={syncToProductCost}
                  onChange={(e) => setSyncToProductCost(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                />
                <span>✓ ធ្វើបច្ចុប្បន្នភាពថ្លៃដើម {costPerUnitKhr.toLocaleString()} ៛ (${costPerUnitUsd}) ទៅក្នុងទំនិញលក់ POS ដោយស្វ័យប្រវត្តិ</span>
              </label>
            )}
          </div>

          {/* Section 5: Baking Instructions / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-pink-600" />
              <span>៥. វិធីធ្វើ & គន្លឹះដុតនំ (Baking Steps & Instructions) (ស្រេចចិត្ត)</span>
            </label>
            <textarea
              rows={3}
              placeholder="កត់ត្រាកម្តៅឡ រយៈពេលដុត ឬគន្លឹះសំខាន់ៗសម្រាប់ចុងភៅ..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-xl shadow-lg shadow-pink-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{recipeToEdit ? 'រក្សាទុកការកែប្រែ' : '💾 រក្សាទុករូបមន្ត & ថ្លៃដើម'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
