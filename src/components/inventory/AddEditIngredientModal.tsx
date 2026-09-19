import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, AlertTriangle, Truck, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { Ingredient } from '../../types';
import { soundFx } from '../../utils/audio';

interface AddEditIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientToEdit?: Ingredient | null;
}

const COMMON_UNITS = [
  { label: 'kg (គីឡូក្រាម)', value: 'kg' },
  { label: 'g (ក្រាម)', value: 'g' },
  { label: 'liter (លីត្រ)', value: 'liter' },
  { label: 'ml (មីលីលីត្រ)', value: 'ml' },
  { label: 'pcs (គ្រាប់/ដុំ)', value: 'pcs' },
  { label: 'box (ប្រអប់)', value: 'box' },
  { label: 'can (កំប៉ុង)', value: 'can' },
  { label: 'bottle (ដប)', value: 'bottle' },
  { label: 'pack (កញ្ចប់)', value: 'pack' },
];

export const AddEditIngredientModal: React.FC<AddEditIngredientModalProps> = ({
  isOpen,
  onClose,
  ingredientToEdit,
}) => {
  const { addIngredient, updateIngredient, exchangeRate } = useBakery();

  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [currentStock, setCurrentStock] = useState('10');
  const [totalUsed, setTotalUsed] = useState('0');
  const [unit, setUnit] = useState('kg');
  const [customUnit, setCustomUnit] = useState('');
  const [minAlertStock, setMinAlertStock] = useState('5');
  const [costPerUnitUsd, setCostPerUnitUsd] = useState('1.5');
  const [supplier, setSupplier] = useState('');

  useEffect(() => {
    if (ingredientToEdit) {
      setNameKh(ingredientToEdit.nameKh || '');
      setNameEn(ingredientToEdit.nameEn || '');
      setCurrentStock(String(ingredientToEdit.currentStock ?? 0));
      setTotalUsed(String(ingredientToEdit.totalUsed ?? 0));
      const matchedUnit = COMMON_UNITS.find((u) => u.value === ingredientToEdit.unit);
      if (matchedUnit) {
        setUnit(ingredientToEdit.unit);
        setCustomUnit('');
      } else {
        setUnit('custom');
        setCustomUnit(ingredientToEdit.unit || '');
      }
      setMinAlertStock(String(ingredientToEdit.minAlertStock ?? 5));
      setCostPerUnitUsd(String(ingredientToEdit.costPerUnitUsd ?? 0));
      setSupplier(ingredientToEdit.supplier || '');
    } else {
      setNameKh('');
      setNameEn('');
      setCurrentStock('10');
      setTotalUsed('0');
      setUnit('kg');
      setCustomUnit('');
      setMinAlertStock('5');
      setCostPerUnitUsd('1.5');
      setSupplier('');
    }
  }, [ingredientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameKh.trim()) return;

    const finalUnit = unit === 'custom' ? customUnit.trim() || 'kg' : unit;
    const parsedStock = parseFloat(currentStock) || 0;
    const parsedUsed = parseFloat(totalUsed) || 0;
    const parsedMinAlert = parseFloat(minAlertStock) || 0;
    const parsedCostUsd = parseFloat(costPerUnitUsd) || 0;

    if (ingredientToEdit) {
      updateIngredient({
        ...ingredientToEdit,
        nameKh: nameKh.trim(),
        nameEn: nameEn.trim() || nameKh.trim(),
        currentStock: parsedStock,
        totalUsed: parsedUsed,
        unit: finalUnit,
        minAlertStock: parsedMinAlert,
        costPerUnitUsd: parsedCostUsd,
        supplier: supplier.trim() || undefined,
      });
      soundFx.playSuccess();
    } else {
      addIngredient({
        nameKh: nameKh.trim(),
        nameEn: nameEn.trim() || nameKh.trim(),
        currentStock: parsedStock,
        totalUsed: parsedUsed,
        unit: finalUnit,
        minAlertStock: parsedMinAlert,
        costPerUnitUsd: parsedCostUsd,
        supplier: supplier.trim() || undefined,
      });
      soundFx.playSuccess();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {}
    }

    onClose();
  };

  const costKhrEstimated = Math.round((parseFloat(costPerUnitUsd) || 0) * exchangeRate);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100/80 flex items-center justify-between bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-pink-500 text-white rounded-2xl shadow-md shadow-amber-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                {ingredientToEdit
                  ? 'កែប្រែព័ត៌មានគ្រឿងផ្សំ (Edit Ingredient)'
                  : 'បន្ថែមគ្រឿងផ្សំថ្មី (New Raw Ingredient)'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {ingredientToEdit
                  ? `កែប្រែទិន្នន័យ៖ ${ingredientToEdit.nameKh}`
                  : 'បញ្ចូលគ្រឿងផ្សំធ្វើនំសម្រាប់គណនាស្តុក និងរូបមន្ត BOM'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Ingredient Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                ឈ្មោះគ្រឿងផ្សំ (ភាសាខ្មែរ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. ម្សៅខេកជប៉ុនពិសេស"
                value={nameKh}
                onChange={(e) => setNameKh(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                ឈ្មោះជាភាសាអង់គ្លេស (English)
              </label>
              <input
                type="text"
                placeholder="e.g. Japanese Cake Flour"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              ឯកតារង្វាស់ (Measurement Unit) <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_UNITS.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setUnit(u.value);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    unit === u.value
                      ? 'bg-amber-500 text-white shadow-xs font-black'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {u.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setUnit('custom');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  unit === 'custom'
                    ? 'bg-amber-500 text-white shadow-xs font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                + ឯកតាផ្សេងទៀត
              </button>
            </div>

            {unit === 'custom' && (
              <input
                type="text"
                required
                placeholder="វាយឯកតាផ្ទាល់ខ្លួន (ឧ. ដប, កែវ, ធុង...)"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold border border-amber-300 rounded-xl bg-amber-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            )}
          </div>

          {/* Stock, Usage & Alert */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <label className="block font-black text-slate-700 text-[11px]">
                ស្តុកនៅសល់ ({unit === 'custom' ? customUnit || 'ឯកតា' : unit}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm font-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800"
              />
              <span className="text-[10px] text-slate-400 block">ចំនួនជាក់ស្តែងក្នុងឃ្លាំង</span>
            </div>

            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-1">
              <label className="block font-black text-purple-800 text-[11px]">
                ចំនួនប្រើប្រាស់ ({unit === 'custom' ? customUnit || 'ឯកតា' : unit})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={totalUsed}
                onChange={(e) => setTotalUsed(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm font-black bg-white border border-purple-200 rounded-xl text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <span className="text-[10px] text-purple-600/80 block">បានយកទៅធ្វើនំកន្លងមក</span>
            </div>

            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-1">
              <label className="block font-black text-rose-800 text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>កម្រិតដាស់តឿន</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={minAlertStock}
                onChange={(e) => setMinAlertStock(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm font-black bg-white border border-rose-200 rounded-xl text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <span className="text-[10px] text-rose-600/80 block">Alert ពេលទាបជាងនេះ</span>
            </div>
          </div>

          {/* Cost Price per Unit */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 border border-emerald-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-black text-emerald-900 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>ថ្លៃដើមទិញចូលក្នុង ១ {unit === 'custom' ? customUnit || 'ឯកតា' : unit} ($ USD)</span>
              </label>
              <span className="text-xs font-black text-emerald-700">
                ~ {costKhrEstimated.toLocaleString()} ៛
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={costPerUnitUsd}
              onChange={(e) => setCostPerUnitUsd(e.target.value)}
              className="w-full px-3.5 py-2 text-base font-black bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[10px] text-emerald-700/80">
              ថ្លៃដើមនេះនឹងត្រូវយកទៅគណនាស្វ័យប្រវត្តិក្នុងរូបមន្តនំ (Recipe Costing / BOM)
            </p>
          </div>

          {/* Supplier */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>ប្រភពផ្គត់ផ្គង់ / ឈ្មោះអ្នកលក់ (Supplier)</span>
            </label>
            <input
              type="text"
              placeholder="ឧ. ផ្សារអូឡាំពិក, CP Cambodia, Euro Gourmet, Makro..."
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white rounded-xl text-xs font-black shadow-md shadow-pink-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{ingredientToEdit ? 'រក្សាទុកការកែប្រែ' : '✓ រក្សាទុកគ្រឿងផ្សំ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
