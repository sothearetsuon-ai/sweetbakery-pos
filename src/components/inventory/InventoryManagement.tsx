import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  ArrowUpRight,
  Check,
  DollarSign,
  Layers,
  Cake,
  RefreshCw,
  X,
  Trash2,
  Pencil,
  Printer,
  Eye,
  BookOpen,
  Calculator,
  Sparkles,
  Box,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  MinusCircle,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { Ingredient, Product, Recipe } from '../../types';
import { soundFx } from '../../utils/audio';
import { AddProductModal } from '../pos/AddProductModal';
import { AddEditIngredientModal } from './AddEditIngredientModal';
import { AddEditRecipeModal } from './AddEditRecipeModal';
import { RecipeDetailModal } from './RecipeDetailModal';
import { RecordIngredientUsageModal } from './RecordIngredientUsageModal';

export const InventoryManagement: React.FC = () => {
  const {
    lang,
    ingredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    restockIngredient,
    lowStockCount,
    exchangeRate,
    products,
    updateProduct,
    restockProduct,
    deleteProduct,
    recipes,
    deleteRecipe,
  } = useBakery();
  const text = t[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<string>('10');
  const [activeTab, setActiveTab] = useState<'products' | 'stock' | 'costing'>('products');
  const [productFilter, setProductFilter] = useState<'all' | 'out' | 'low'>('all');

  // Product Add / Edit / Delete modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Ingredient Add / Edit / Delete modal states
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const [usageIngredient, setUsageIngredient] = useState<Ingredient | null>(null);

  // Recipe & BOM modal states
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [syncSuccessRecipeId, setSyncSuccessRecipeId] = useState<string | null>(null);

  const filteredIngredients = ingredients.filter((ing) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      ing.nameKh.toLowerCase().includes(q) ||
      ing.nameEn.toLowerCase().includes(q) ||
      (ing.supplier && ing.supplier.toLowerCase().includes(q))
    );
  });

  const filteredRecipes = recipes.filter((rec) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      rec.cakeNameKh.toLowerCase().includes(q) ||
      (rec.cakeNameEn && rec.cakeNameEn.toLowerCase().includes(q)) ||
      rec.items.some((i) => i.nameKh.toLowerCase().includes(q))
    );
  });

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    const amt = parseFloat(restockAmount) || 0;
    if (amt > 0) {
      restockIngredient(selectedIngredient.id, amt);
      setSelectedIngredient(null);
      setRestockAmount('10');
    }
  };

  const filteredProducts = products.filter((prod) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      prod.nameKh.toLowerCase().includes(q) ||
      prod.nameEn.toLowerCase().includes(q) ||
      (prod.description && prod.description.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (productFilter === 'out') return prod.stockQty === 0;
    if (productFilter === 'low') return prod.stockQty <= 5 && prod.stockQty > 0;
    return true;
  });

  const outOfStockProductsCount = products.filter((p) => p.stockQty === 0).length;
  const lowStockProductsCount = products.filter((p) => p.stockQty <= 5 && p.stockQty > 0).length;

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-hidden pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
            {activeTab === 'products' ? (
              <>
                <Cake className="w-5 h-5 text-pink-600" />
                <span>ស្តុកនំ និងទំនិញលក់ (Bakery Stock)</span>
              </>
            ) : activeTab === 'stock' ? (
              <>
                <Package className="w-5 h-5 text-amber-500" />
                <span>{text.ingredientsTitle}</span>
              </>
            ) : (
              <>
                <Layers className="w-5 h-5 text-rose-600" />
                <span>គណនាថ្លៃដើមរូបមន្តនំ (BOM Recipe Costing)</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'products'
              ? 'ពិនិត្យមើលចំនួននំដែលនៅសល់ នំអស់ពីស្តុក និងបន្ថែមស្តុកថ្មីភ្លាមៗ'
              : activeTab === 'stock'
              ? 'គ្រប់គ្រងស្តុកគ្រឿងផ្សំដើម តម្លៃទិញចូល និងការជូនដំណឹងពេលជិតអស់'
              : 'ទម្រង់គណនាថ្លៃដើមគ្រឿងផ្សំ (BOM) ថ្លៃប្រអប់ ពលកម្ម និងវិភាគប្រាក់ចំណេញសុទ្ធ'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {activeTab === 'products' ? (
            <button
              onClick={() => {
                soundFx.playPop();
                setEditingProduct(null);
                setIsAddProductOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-black shadow-md shadow-pink-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ បន្ថែមទំនិញថ្មី</span>
            </button>
          ) : activeTab === 'stock' ? (
            <button
              onClick={() => {
                soundFx.playPop();
                setEditingIngredient(null);
                setIsAddIngredientOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ បន្ថែមគ្រឿងផ្សំថ្មី</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundFx.playPop();
                setEditingRecipe(null);
                setIsAddRecipeOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ បង្កើតរូបមន្ត & គណនាថ្លៃដើម BOM</span>
            </button>
          )}

          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'products'
                  ? 'ស្វែងរកនំ ឬទំនិញ...'
                  : activeTab === 'stock'
                  ? 'ស្វែងរកគ្រឿងផ្សំ...'
                  : 'ស្វែងរកឈ្មោះរូបមន្តនំ BOM...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 w-full sm:w-56 shadow-xs font-medium"
            />
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => {
                soundFx.playPop();
                setActiveTab('products');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cake className="w-3.5 h-3.5" />
              <span>ស្តុកនំ ({products.length})</span>
              {outOfStockProductsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'products' ? 'bg-white text-rose-600' : 'bg-rose-600 text-white'
                }`}>
                  {outOfStockProductsCount} អស់
                </span>
              )}
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setActiveTab('stock');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'stock'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>ស្តុកគ្រឿងផ្សំ ({ingredients.length})</span>
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setActiveTab('costing');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'costing'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>គណនាថ្លៃដើម BOM ({recipes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'products' ? (
        /* Bakery Products Stock Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          {/* Filters row */}
          <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">តម្រង៖</span>
              <button
                onClick={() => setProductFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  productFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                ទាំងអស់ ({products.length})
              </button>
              <button
                onClick={() => setProductFilter('out')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  productFilter === 'out'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                <span>អស់ពីស្តុក</span>
                <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full text-[10px]">
                  {outOfStockProductsCount}
                </span>
              </button>
              <button
                onClick={() => setProductFilter('low')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  productFilter === 'low'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <span>ជិតអស់ (≤5)</span>
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded-full text-[10px]">
                  {lowStockProductsCount}
                </span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              បង្ហាញ {filteredProducts.length} មុខ
            </span>
          </div>

          {/* Mobile Cards View (Visible on Phones) */}
          <div className="block sm:hidden overflow-y-auto flex-1 p-2.5 space-y-2.5">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">
                មិនមាននំ ឬទំនិញតាមលក្ខខណ្ឌស្វែងរកនេះទេ
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const isOut = prod.stockQty === 0;
                const isLow = prod.stockQty <= 5 && prod.stockQty > 0;
                const priceKhr = prod.priceKhr ?? Math.round(prod.priceUsd * exchangeRate);

                return (
                  <div
                    key={prod.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.nameKh}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Cake className="w-6 h-6 text-pink-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-900 text-sm truncate">
                          {prod.nameKh}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {prod.nameEn}
                        </div>
                        <div className="text-xs font-black text-pink-600 mt-0.5">
                          {priceKhr.toLocaleString()} ៛ <span className="text-[10px] text-slate-400 font-semibold">(${prod.priceUsd.toFixed(2)})</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-base font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                          {prod.stockQty} {prod.unit}
                        </div>
                        {isOut ? (
                          <span className="inline-block bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                            អស់ពីស្តុក
                          </span>
                        ) : isLow ? (
                          <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ជិតអស់
                          </span>
                        ) : (
                          <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            មានគ្រប់
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons with prominent Restock button */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setSelectedProduct(prod);
                          setRestockAmount('10');
                        }}
                        className={`flex-1 py-2 font-black rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                          isOut
                            ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white shadow-rose-500/25 ring-2 ring-rose-400/40'
                            : 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-pink-500/20'
                        }`}
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>+ បន្ថែមស្តុកនំនេះ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setEditingProduct(prod);
                          setIsAddProductOpen(true);
                        }}
                        className="px-3 py-2 font-bold rounded-xl text-xs transition-all bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>កែ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setProductToDelete(prod);
                        }}
                        className="p-2 font-bold rounded-xl text-xs transition-all bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-y-auto flex-1">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 sm:p-4">រូប & ឈ្មោះនំ/ទំនិញ</th>
                    <th className="p-3 sm:p-4">ស្តុកបច្ចុប្បន្ន</th>
                    <th className="p-3 sm:p-4">ស្ថានភាពស្តុក</th>
                    <th className="p-3 sm:p-4">តម្លៃលក់ (៛ / $)</th>
                    <th className="p-3 sm:p-4 text-center">សកម្មភាព (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        មិនមាននំ ឬទំនិញតាមលក្ខខណ្ឌស្វែងរកនេះទេ
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isOut = prod.stockQty === 0;
                      const isLow = prod.stockQty <= 5 && prod.stockQty > 0;
                      const priceKhr = prod.priceKhr ?? Math.round(prod.priceUsd * exchangeRate);

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {prod.imageUrl ? (
                                  <img
                                    src={prod.imageUrl}
                                    alt={prod.nameKh}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Cake className="w-5 h-5 text-pink-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {prod.nameKh}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {prod.nameEn}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 sm:p-4">
                            <span
                              className={`text-sm font-black ${
                                isOut
                                  ? 'text-rose-600'
                                  : isLow
                                  ? 'text-amber-600'
                                  : 'text-slate-800'
                              }`}
                            >
                              {prod.stockQty} {prod.unit}
                            </span>
                          </td>

                          <td className="p-3 sm:p-4">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                                <AlertTriangle className="w-3 h-3" />
                                អស់ពីស្តុក (0 {prod.unit})
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                ជិតអស់ស្តុក (សល់ {prod.stockQty})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                មានក្នុងស្តុកគ្រប់គ្រាន់
                              </span>
                            )}
                          </td>

                          <td className="p-3 sm:p-4">
                            <div className="font-bold text-slate-900">
                              {priceKhr.toLocaleString()} ៛
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ${prod.priceUsd.toFixed(2)}
                            </div>
                          </td>

                          <td className="p-3 sm:p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => {
                                  soundFx.playPop();
                                  setSelectedProduct(prod);
                                  setRestockAmount('10');
                                }}
                                title="បន្ថែមស្តុក"
                                className={`px-2.5 py-1.5 font-bold rounded-xl text-xs transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer active:scale-95 ${
                                  isOut
                                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/20'
                                    : 'bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>+ ស្តុក</span>
                              </button>

                              <button
                                onClick={() => {
                                  soundFx.playPop();
                                  setEditingProduct(prod);
                                  setIsAddProductOpen(true);
                                }}
                                title="កែប្រែព័ត៌មានទំនិញ / នំ"
                                className="px-2.5 py-1.5 font-bold rounded-xl text-xs transition-all bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-500 inline-flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>កែប្រែ</span>
                              </button>

                              <button
                                onClick={() => {
                                  soundFx.playPop();
                                  setProductToDelete(prod);
                                }}
                                title="លុបទំនិញចេញពីប្រព័ន្ធ"
                                className="px-2 py-1.5 font-bold rounded-xl text-xs transition-all bg-slate-100 hover:bg-rose-600 text-slate-500 hover:text-white border border-slate-200 hover:border-rose-600 inline-flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">លុប</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'stock' ? (
        /* Inventory Table & Stats */
        <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
          {/* Ingredient Summary Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase">គ្រឿងផ្សំសរុប</div>
                <div className="text-base font-black text-slate-800 truncate">
                  {ingredients.length} <span className="text-xs font-semibold text-slate-400">មុខ</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                lowStockCount > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase">ជិតអស់ពីស្តុក</div>
                <div className={`text-base font-black truncate ${
                  lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {lowStockCount} <span className="text-xs font-semibold text-slate-400">មុខ</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase">មុខទំនិញមានការប្រើប្រាស់</div>
                <div className="text-base font-black text-purple-700 truncate">
                  {ingredients.filter((i) => (i.totalUsed ?? 0) > 0).length} <span className="text-xs font-semibold text-slate-400">មុខ</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase">តម្លៃស្តុកនៅសល់សរុប</div>
                <div className="text-base font-black text-emerald-700 truncate">
                  ${ingredients
                    .reduce((sum, i) => sum + i.currentStock * i.costPerUnitUsd, 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Table & Mobile Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            {/* Mobile Cards for Ingredients (Visible on Phones) */}
            <div className="block sm:hidden overflow-y-auto flex-1 p-2.5 space-y-2.5">
              {filteredIngredients.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">
                  មិនមានទិន្នន័យគ្រឿងផ្សំត្រូវនឹងការស្វែងរកទេ
                </div>
              ) : (
                filteredIngredients.map((ing) => {
                  const isOut = ing.currentStock <= 0;
                  const isLow = ing.currentStock <= ing.minAlertStock && !isOut;
                  const usedQty = ing.totalUsed ?? 0;
                  const costKhr = Math.round(ing.costPerUnitUsd * exchangeRate);

                  return (
                    <div
                      key={ing.id}
                      className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 text-sm truncate">
                            {ing.nameKh}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {ing.nameEn}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-base font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                            {ing.currentStock} {ing.unit}
                          </div>
                          {isOut ? (
                            <span className="inline-block bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              អស់ពីស្តុក
                            </span>
                          ) : isLow ? (
                            <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ជិតអស់
                            </span>
                          ) : (
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              គ្រប់គ្រាន់
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/80 p-2 rounded-xl">
                        <span>ថ្លៃដើម៖ <strong className="text-slate-800">{costKhr.toLocaleString()} ៛</strong> (${ing.costPerUnitUsd.toFixed(2)})/{ing.unit}</span>
                        <span>ប្រើរួច៖ <strong className="text-purple-700">{usedQty} {ing.unit}</strong></span>
                      </div>

                      {/* Action buttons with prominent Restock button */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setSelectedIngredient(ing);
                          }}
                          className="flex-1 py-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-black rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+ បន្ថែមស្តុក</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setUsageIngredient(ing);
                          }}
                          className="px-2.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-xl text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <MinusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>- ប្រើ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setEditingIngredient(ing);
                            setIsAddIngredientOpen(true);
                          }}
                          className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold rounded-xl text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>កែ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setIngredientToDelete(ing);
                          }}
                          className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-xl text-xs active:scale-95 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-y-auto flex-1">
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-3.5 sm:p-4">ឈ្មោះគ្រឿងផ្សំ (Ingredient)</th>
                      <th className="p-3.5 sm:p-4 text-purple-800">ចំនួនប្រើប្រាស់ (Used)</th>
                      <th className="p-3.5 sm:p-4 text-slate-900">ស្តុកនៅសល់ (Remaining)</th>
                      <th className="p-3.5 sm:p-4">កម្រិតដាស់តឿន</th>
                      <th className="p-3.5 sm:p-4">ថ្លៃដើម/ឯកតា</th>
                      <th className="p-3.5 sm:p-4">ប្រភពផ្គត់ផ្គង់</th>
                      <th className="p-3.5 sm:p-4 text-center">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredIngredients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                          មិនមានទិន្នន័យគ្រឿងផ្សំត្រូវនឹងការស្វែងរកទេ
                        </td>
                      </tr>
                    ) : (
                      filteredIngredients.map((ing) => {
                        const isOut = ing.currentStock <= 0;
                        const isLow = ing.currentStock <= ing.minAlertStock && !isOut;
                        const usedQty = ing.totalUsed ?? 0;

                        return (
                          <tr key={ing.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3.5 sm:p-4">
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{ing.nameKh}</div>
                              <div className="text-[11px] text-slate-400 font-medium">{ing.nameEn}</div>
                            </td>

                            {/* Used Qty */}
                            <td className="p-3.5 sm:p-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 font-black text-xs">
                                <MinusCircle className="w-3.5 h-3.5 text-purple-500" />
                                <span>{usedQty} {ing.unit}</span>
                              </span>
                            </td>

                            {/* Remaining Stock */}
                            <td className="p-3.5 sm:p-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-black ${
                                    isOut
                                      ? 'text-rose-600'
                                      : isLow
                                      ? 'text-amber-600'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {ing.currentStock} {ing.unit}
                                </span>
                                {isOut ? (
                                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <AlertTriangle className="w-3 h-3" />
                                    អស់ពីស្តុក
                                  </span>
                                ) : isLow ? (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <AlertTriangle className="w-3 h-3" />
                                    ជិតអស់
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" />
                                    គ្រប់គ្រាន់
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3.5 sm:p-4 text-slate-500 font-medium">
                              {ing.minAlertStock} {ing.unit}
                            </td>

                            <td className="p-3.5 sm:p-4">
                              <div className="font-bold text-slate-900">
                                {Math.round(ing.costPerUnitUsd * exchangeRate).toLocaleString()} ៛/{ing.unit}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                ~ ${ing.costPerUnitUsd.toFixed(2)}
                              </div>
                            </td>

                            <td className="p-3.5 sm:p-4 text-slate-500">
                              {ing.supplier || 'N/A'}
                            </td>

                            <td className="p-3.5 sm:p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {/* Restock Button */}
                                <button
                                  onClick={() => {
                                    soundFx.playPop();
                                    setSelectedIngredient(ing);
                                  }}
                                  title="បញ្ចូលស្តុកគ្រឿងផ្សំបន្ថែម"
                                  className="px-2.5 py-1.5 bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white font-bold rounded-xl text-xs transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>+ ស្តុក</span>
                                </button>

                                {/* Record Usage Button */}
                                <button
                                  onClick={() => {
                                    soundFx.playPop();
                                    setUsageIngredient(ing);
                                  }}
                                  title="កត់ត្រាការប្រើប្រាស់ / ដកស្តុក"
                                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-purple-600 font-bold rounded-xl text-xs transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <MinusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>- ប្រើប្រាស់</span>
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => {
                                    soundFx.playPop();
                                    setEditingIngredient(ing);
                                    setIsAddIngredientOpen(true);
                                  }}
                                  title="កែប្រែព័ត៌មានគ្រឿងផ្សំ"
                                  className="px-2.5 py-1.5 font-bold rounded-xl text-xs transition-all bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-500 inline-flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>កែប្រែ</span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => {
                                    soundFx.playPop();
                                    setIngredientToDelete(ing);
                                  }}
                                  title="លុបគ្រឿងផ្សំចេញពីប្រព័ន្ធ"
                                  className="px-2 py-1.5 font-bold rounded-xl text-xs transition-all bg-slate-100 hover:bg-rose-600 text-slate-500 hover:text-white border border-slate-200 hover:border-rose-600 inline-flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">លុប</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Recipe & BOM Costing Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm overflow-y-auto flex-1 space-y-5">
          {/* Costing Header & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-600" />
                <span>រូបមន្តនំ និងការគណនាថ្លៃដើម BOM (Recipe Costing / Bill of Materials)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                គណនាថ្លៃដើមគ្រឿងផ្សំ ថ្លៃប្រអប់ ពលកម្ម និងវិភាគប្រាក់ចំណេញសុទ្ធនៃមុខនំនីមួយៗ
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <span>🧁 រូបមន្តសរុប៖</span>
                <span className="font-black text-rose-900">{recipes.length}</span>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span>📈 មធ្យមផលចំណេញ៖</span>
                <span className="font-black text-emerald-900">
                  {recipes.length > 0
                    ? Math.round(
                        recipes.reduce((sum, r) => sum + (r.profitMarginPercent || 0), 0) /
                          recipes.length
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Quick Success Toast when Cost is Applied to POS */}
          {syncSuccessRecipeId && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in zoom-in-95 duration-150">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>បានធ្វើបច្ចុប្បន្នភាពថ្លៃដើម (Cost Price) ទៅក្នុងទំនិញលក់ POS ដោយជោគជ័យ! 🎉</span>
              </span>
              <button
                type="button"
                onClick={() => setSyncSuccessRecipeId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dynamic Recipes Grid */}
          {filteredRecipes.length === 0 ? (
            <div className="p-10 text-center space-y-3 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Layers className="w-7 h-7" />
              </div>
              <h4 className="font-black text-slate-800 text-base">មិនទាន់មានរូបមន្តនំនៅឡើយទេ</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                បង្កើតរូបមន្តនំដំបូងរបស់អ្នក ដើម្បីគណនាថ្លៃដើមគ្រឿងផ្សំ (BOM) និងដឹងពីភាគរយចំណេញសុទ្ធភ្លាមៗ។
              </p>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setEditingRecipe(null);
                  setIsAddRecipeOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-black shadow-md shadow-pink-600/20 inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ បង្កើតរូបមន្ត & គណនាថ្លៃដើម BOM ដំបូង</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredRecipes.map((recipe) => {
                const totalCostKhr =
                  recipe.totalCostKhr ?? Math.round(recipe.totalCostUsd * exchangeRate);
                const costPerUnitKhr =
                  recipe.costPerUnitKhr ??
                  Math.round(
                    (recipe.costPerUnitUsd || recipe.totalCostUsd / Math.max(1, recipe.yieldQty)) *
                      exchangeRate
                  );
                const costPerUnitUsd =
                  recipe.costPerUnitUsd ??
                  Number((recipe.totalCostUsd / Math.max(1, recipe.yieldQty)).toFixed(2));
                const sellingPriceKhr =
                  recipe.sellingPriceKhr ??
                  (recipe.sellingPriceUsd
                    ? Math.round(recipe.sellingPriceUsd * exchangeRate)
                    : 0);
                const sellingPriceUsd =
                  recipe.sellingPriceUsd ?? Number((sellingPriceKhr / exchangeRate).toFixed(2));
                const grossProfitKhr = sellingPriceKhr - costPerUnitKhr;
                const margin = recipe.profitMarginPercent ?? (
                  sellingPriceKhr > 0
                    ? Number(((grossProfitKhr / sellingPriceKhr) * 100).toFixed(1))
                    : 0
                );

                const linkedProduct = products.find((p) => p.id === recipe.productId);

                const handleApplyCostToProduct = () => {
                  if (!recipe.productId) return;
                  const prod = products.find((p) => p.id === recipe.productId);
                  if (prod) {
                    soundFx.playSuccess();
                    updateProduct({
                      ...prod,
                      costPriceUsd: costPerUnitUsd,
                      costPriceKhr: costPerUnitKhr,
                    });
                    setSyncSuccessRecipeId(recipe.id);
                    setTimeout(() => setSyncSuccessRecipeId(null), 3500);
                  }
                };

                return (
                  <div
                    key={recipe.id}
                    className="p-4 sm:p-5 bg-white hover:bg-rose-50/20 rounded-3xl border border-slate-200/90 hover:border-pink-300 shadow-sm hover:shadow-lg transition-all duration-200 space-y-3.5 flex flex-col justify-between"
                  >
                    {/* Card Header */}
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-slate-900 text-sm">
                              🎂 {recipe.cakeNameKh}
                            </h4>
                            <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {recipe.yieldQty} {recipe.yieldUnit}
                            </span>
                          </div>
                          {recipe.cakeNameEn && (
                            <p className="text-[11px] text-slate-500 font-medium">{recipe.cakeNameEn}</p>
                          )}
                        </div>

                        {/* Profit Margin Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-black border shrink-0 ${
                            margin >= 50
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : margin >= 30
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          ចំណេញ {margin}%
                        </span>
                      </div>

                      {/* Linked Product Status */}
                      {linkedProduct ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-pink-600 bg-pink-50/70 px-2 py-0.5 rounded-lg w-fit">
                          <CheckCircle2 className="w-3 h-3 text-pink-500" />
                          <span>ភ្ជាប់ជាមួយទំនិញ៖ {linkedProduct.nameKh}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-medium">
                          រូបមន្តទូទៅ (មិនទាន់ភ្ជាប់ទៅទំនិញលក់)
                        </div>
                      )}
                    </div>

                    {/* Ingredients List Summary */}
                    <div className="space-y-1 text-xs bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>គ្រឿងផ្សំក្នុងរូបមន្ត ({recipe.items.length} មុខ):</span>
                        <span className="text-slate-500">
                          {recipe.items.reduce((sum, i) => sum + (i.itemCostKhr ?? Math.round(i.itemCostUsd * exchangeRate)), 0).toLocaleString()} ៛
                        </span>
                      </div>
                      <div className="space-y-1 pt-1">
                        {recipe.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-slate-600 py-0.5 border-b border-slate-100 last:border-0"
                          >
                            <span className="truncate pr-2 font-medium">• {item.nameKh}</span>
                            <span className="font-bold text-slate-700 shrink-0">
                              {item.quantity}
                              {item.unit} (~${item.itemCostUsd.toFixed(2)})
                            </span>
                          </div>
                        ))}
                        {recipe.items.length > 4 && (
                          <div className="text-[10px] text-pink-600 font-bold pt-0.5">
                            + {recipe.items.length - 4} មុខគ្រឿងផ្សំទៀត...
                          </div>
                        )}
                      </div>

                      {/* Overhead Summary */}
                      <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
                        <span>ថ្លៃប្រអប់/ពលកម្ម/ភ្លើង៖</span>
                        <span className="font-bold text-slate-700">
                          {(
                            (recipe.packagingCostKhr ?? 0) +
                            (recipe.laborCostKhr ?? 0) +
                            (recipe.overheadCostKhr ?? 0)
                          ).toLocaleString()} ៛
                        </span>
                      </div>
                    </div>

                    {/* Cost & Price Summary */}
                    <div className="p-3 bg-gradient-to-r from-rose-50/60 via-pink-50/40 to-slate-50 rounded-2xl border border-rose-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          ថ្លៃដើម/១ {recipe.yieldUnit} (COGS):
                        </span>
                        <span className="font-black text-rose-600 text-sm">
                          {costPerUnitKhr.toLocaleString()} ៛
                          <span className="text-[10px] text-slate-400 font-bold ml-1">
                            (${costPerUnitUsd.toFixed(2)})
                          </span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 block">
                          តម្លៃលក់ (Selling Price):
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          {sellingPriceKhr.toLocaleString()} ៛
                          <span className="text-[10px] text-slate-400 font-bold ml-1">
                            (${sellingPriceUsd.toFixed(2)})
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setViewingRecipe(recipe);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="មើល & បោះពុម្ពសន្លឹករូបមន្ត"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>សន្លឹករូបមន្ត</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setEditingRecipe(recipe);
                            setIsAddRecipeOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="កែប្រែរូបមន្ត & ថ្លៃដើម"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-600" />
                          <span>កែប្រែ</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {linkedProduct && (
                          <button
                            type="button"
                            onClick={handleApplyCostToProduct}
                            className="px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="អាប់ដេតថ្លៃដើមនេះទៅក្នុងទំនិញលក់ POS"
                          >
                            <RefreshCw className="w-3 h-3 text-pink-600" />
                            <span className="hidden sm:inline">ដាក់ចូល POS</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setRecipeToDelete(recipe);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
                          title="លុបរូបមន្តនេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ingredient Restock Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="font-bold text-slate-800 text-base">
              បញ្ចូលស្តុកគ្រឿងផ្សំបន្ថែម (Restock)
            </h3>
            <p className="text-xs text-slate-500">
              {selectedIngredient.nameKh} ({selectedIngredient.nameEn})
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ចំនួនដែលត្រូវបន្ថែម ({selectedIngredient.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-4 py-2.5 text-lg font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRestockAmount(val.toString())}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer active:scale-95"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedIngredient(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-600/20 cursor-pointer active:scale-95 transition-all text-center"
                >
                  ✓ បញ្ជាក់ការបន្ថែមស្តុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Restock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-rose-100/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    បញ្ចូលស្តុកនំថ្មី (Restock Product)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedProduct.nameKh} ({selectedProduct.nameEn})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3 flex items-center justify-between text-xs">
              <span className="text-slate-600">ស្តុកបច្ចុប្បន្ន៖</span>
              <span className={`font-black text-sm ${selectedProduct.stockQty === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {selectedProduct.stockQty} {selectedProduct.unit} {selectedProduct.stockQty === 0 && '(អស់ពីស្តុក)'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ចំនួននំដែលត្រូវបន្ថែម ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-4 py-2.5 text-xl font-black border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-center text-slate-800"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setRestockAmount(val.toString());
                    }}
                    className="py-1.5 bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer active:scale-95"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const amt = parseInt(restockAmount, 10) || 0;
                    if (amt > 0) {
                      soundFx.playSuccess();
                      restockProduct(selectedProduct.id, amt);
                      setSelectedProduct(null);
                      setRestockAmount('10');
                    }
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-600/20 cursor-pointer active:scale-95 transition-all text-center"
                >
                  ✓ បញ្ជាក់ការបន្ថែមស្តុក
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
              <Trash2 className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                សកម្មភាពនេះនឹងលុប <span className="font-bold text-slate-800">"{productToDelete.nameKh}"</span> ចេញពីបញ្ជីលក់ និងស្តុកទាំងស្រុង។
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-colors cursor-pointer active:scale-95"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Ingredient Confirmation Modal */}
      {ingredientToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
              <Trash2 className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                តើអ្នកពិតជាចង់លុបគ្រឿងផ្សំនេះមែនទេ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                សកម្មភាពនេះនឹងលុប <span className="font-bold text-slate-800">"{ingredientToDelete.nameKh}"</span> ចេញពីបញ្ជីស្តុកគ្រឿងផ្សំទាំងស្រុង។
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIngredientToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  deleteIngredient(ingredientToDelete.id);
                  setIngredientToDelete(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-colors cursor-pointer active:scale-95"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Recipe Confirmation Modal */}
      {recipeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
              <Trash2 className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                តើអ្នកពិតជាចង់លុបរូបមន្តនំនេះមែនទេ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                សកម្មភាពនេះនឹងលុបរូបមន្ត <span className="font-bold text-slate-800">"{recipeToDelete.cakeNameKh}"</span> ចេញពីប្រព័ន្ធទាំងស្រុង។
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecipeToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  deleteRecipe(recipeToDelete.id);
                  setRecipeToDelete(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-colors cursor-pointer active:scale-95"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />

      {/* Add / Edit Ingredient Modal */}
      <AddEditIngredientModal
        isOpen={isAddIngredientOpen}
        onClose={() => {
          setIsAddIngredientOpen(false);
          setEditingIngredient(null);
        }}
        ingredientToEdit={editingIngredient}
      />

      {/* Record Ingredient Usage Modal */}
      <RecordIngredientUsageModal
        isOpen={Boolean(usageIngredient)}
        onClose={() => setUsageIngredient(null)}
        ingredient={usageIngredient}
      />

      {/* Add / Edit Recipe & BOM Costing Modal */}
      <AddEditRecipeModal
        isOpen={isAddRecipeOpen}
        onClose={() => {
          setIsAddRecipeOpen(false);
          setEditingRecipe(null);
        }}
        recipeToEdit={editingRecipe}
      />

      {/* View / Print Recipe Detail Sheet Modal */}
      <RecipeDetailModal
        recipe={viewingRecipe}
        onClose={() => setViewingRecipe(null)}
        onEdit={(r) => {
          setViewingRecipe(null);
          setEditingRecipe(r);
          setIsAddRecipeOpen(true);
        }}
        onDelete={(r) => {
          setViewingRecipe(null);
          setRecipeToDelete(r);
        }}
      />
    </div>
  );
};
