import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, Search, ArrowUpRight, Check, DollarSign, Layers, Cake, RefreshCw, X, Trash2, Pencil } from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { Ingredient, Product } from '../../types';
import { soundFx } from '../../utils/audio';
import { AddProductModal } from '../pos/AddProductModal';
import { AddEditIngredientModal } from './AddEditIngredientModal';

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
    restockProduct,
    deleteProduct,
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

  const filteredIngredients = ingredients.filter((ing) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      ing.nameKh.toLowerCase().includes(q) ||
      ing.nameEn.toLowerCase().includes(q) ||
      (ing.supplier && ing.supplier.toLowerCase().includes(q))
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
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            {activeTab === 'products' ? 'ស្តុកនំ និងទំនិញលក់ (Bakery Stock)' : text.ingredientsTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {activeTab === 'products'
              ? 'ពិនិត្យមើលចំនួននំដែលនៅសល់ នំអស់ពីស្តុក និងបន្ថែមស្តុកថ្មីភ្លាមៗ'
              : 'គ្រប់គ្រងស្តុកគ្រឿងផ្សំដើម និងរូបមន្តនំ (Recipe & BOM Costing)'}
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
          ) : null}

          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'products' ? "ស្វែងរកនំ ឬទំនិញ..." : "ស្វែងរកគ្រឿងផ្សំ..."}
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
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cake className="w-3.5 h-3.5" />
              <span>ស្តុកនំដែលលក់ ({products.length})</span>
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
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>ស្តុកគ្រឿងផ្សំ</span>
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setActiveTab('costing');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'costing'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>គណនាថ្លៃដើម (BOM)</span>
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

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
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
      ) : activeTab === 'stock' ? (
        /* Inventory Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-4">ឈ្មោះគ្រឿងផ្សំ (Ingredient)</th>
                  <th className="p-4">ស្តុកបច្ចុប្បន្ន</th>
                  <th className="p-4">កម្រិតដាស់តឿន</th>
                  <th className="p-4">ថ្លៃដើម/ឯកតា</th>
                  <th className="p-4">ប្រភពផ្គត់ផ្គង់</th>
                  <th className="p-4 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredIngredients.map((ing) => {
                  const isLow = ing.currentStock <= ing.minAlertStock;
                  return (
                    <tr key={ing.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{ing.nameKh}</div>
                        <div className="text-[11px] text-slate-400">{ing.nameEn}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black ${
                              isLow ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {ing.currentStock} {ing.unit}
                          </span>
                          {isLow && (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              ជិតអស់
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-slate-500 font-medium">
                        {ing.minAlertStock} {ing.unit}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {Math.round(ing.costPerUnitUsd * exchangeRate).toLocaleString()} ៛/{ing.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ~ ${ing.costPerUnitUsd.toFixed(2)}
                        </div>
                      </td>

                      <td className="p-4 text-slate-500">
                        {ing.supplier || 'N/A'}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Recipe & BOM Costing Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-y-auto flex-1 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 text-base">
              រូបមន្តនំ និងការគណនាប្រាក់ចំណេញ (Recipe Costing / BOM)
            </h3>
            <p className="text-xs text-slate-500">
              ប្រព័ន្ធនឹងកាត់គ្រឿងផ្សំខាងក្រោមដោយស្វ័យប្រវត្តិ នៅពេលនំត្រូវបានដុតផលិតរួច
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cake Recipe Card 1 */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    🎂 នំខេក សូកូឡាហ្វាដ Belgian (1.5 kg)
                  </h4>
                  <span className="text-xs text-slate-500">តម្លៃលក់៖ 98,400 ៛ ($24.00)</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
                  ចំណេញ 52%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  គ្រឿងផ្សំក្នុងរូបមន្ត (BOM):
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ម្សៅខេកជប៉ុនពិសេស</span>
                  <span className="font-semibold">350g (~$0.49)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ប៊័រស្រស់បារាំង Elle & Vire</span>
                  <span className="font-semibold">250g (~$2.37)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• សូកូឡាកាកាវ Callebaut 54.5%</span>
                  <span className="font-semibold">300g (~$4.26)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ស៊ុតមាន់ស្រស់ CP</span>
                  <span className="font-semibold">6 គ្រាប់ (~$0.72)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ស្ករសម៉ត់ Fine Caster Sugar</span>
                  <span className="font-semibold">200g (~$0.18)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ក្រែមស្រស់ Anchor Whipping Cream</span>
                  <span className="font-semibold">400ml (~$1.92)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ប្រអប់នំខេកកញ្ចក់ថ្លា ១.៥kg</span>
                  <span className="font-semibold">1 ប្រអប់ (~$0.65)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">ថ្លៃដើមគ្រឿងផ្សំសរុប (COGS):</span>
                <span className="font-black text-rose-600 text-sm">43,400 ៛ / នំ ($10.59)</span>
              </div>
            </div>

            {/* Cake Recipe Card 2 */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    🍓 នំខេក ស្ត្រប៊ែរី ក្រែមស្រស់ (1.5 kg)
                  </h4>
                  <span className="text-xs text-slate-500">តម្លៃលក់៖ 106,600 ៛ ($26.00)</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
                  ចំណេញ 56%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  គ្រឿងផ្សំក្នុងរូបមន្ត (BOM):
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ម្សៅខេកជប៉ុនពិសេស</span>
                  <span className="font-semibold">300g (~$0.42)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ផ្លែស្ត្រប៊ែរីស្រស់នាំចូល</span>
                  <span className="font-semibold">350g (~$4.20)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ក្រែមស្រស់ Anchor Whipping Cream</span>
                  <span className="font-semibold">500ml (~$2.40)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ស៊ុតមាន់ស្រស់ CP</span>
                  <span className="font-semibold">5 គ្រាប់ (~$0.60)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ស្ករសម៉ត់ Fine Caster Sugar</span>
                  <span className="font-semibold">180g (~$0.16)</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200/60">
                  <span>• ប្រអប់នំខេកកញ្ចក់ថ្លា</span>
                  <span className="font-semibold">1 ប្រអប់ (~$0.65)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">ថ្លៃដើមគ្រឿងផ្សំសរុប (COGS):</span>
                <span className="font-black text-rose-600 text-sm">34,500 ៛ / នំ ($8.43)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ingredient Restock Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
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
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIngredient(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  បញ្ជាក់ការបញ្ចូល
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Restock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
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
                    className="py-1.5 bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
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
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-600/20 cursor-pointer active:scale-95 transition-all"
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
    </div>
  );
};
