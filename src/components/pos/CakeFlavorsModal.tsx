import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
import { PRESET_CAKE_FLAVORS, CakeFlavorItem } from '../customer-order/CustomerOrderPortal';
import { getFlavorEmoji } from '../../utils/flavorUtils';

interface CakeFlavorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CakeFlavorsModal: React.FC<CakeFlavorsModalProps> = ({ isOpen, onClose }) => {
  const {
    flavors,
    unavailableFlavors = [],
    deletedFlavorIds = [],
    flavorOverrides = {},
    addFlavor,
    updateFlavor,
    deleteFlavor,
    toggleFlavorAvailability,
    setFlavorAvailability,
    markAllFlavorsAvailable,
    restoreDefaultFlavors,
  } = useBakery();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'available' | 'out_of_stock'>('all');
  const [newFlavorNameKh, setNewFlavorNameKh] = useState('');
  const [newFlavorNameEn, setNewFlavorNameEn] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Inline editing state
  const [editingFlavorId, setEditingFlavorId] = useState<string | null>(null);
  const [editNameKh, setEditNameKh] = useState('');
  const [editNameEn, setEditNameEn] = useState('');

  // Combine PRESET_CAKE_FLAVORS with custom store flavors, respecting deleted and overridden flavors
  const allFlavors = useMemo(() => {
    const deletedSet = new Set((deletedFlavorIds || []).map((d) => d.toLowerCase().trim()));

    // 1. Process PRESET_CAKE_FLAVORS
    const list: (CakeFlavorItem & { isCustom?: boolean })[] = PRESET_CAKE_FLAVORS
      .filter((f) => {
        if (f.id === 'other') return false;
        const idLower = f.id.toLowerCase().trim();
        const khLower = f.nameKh.toLowerCase().trim();
        const lblLower = f.label.toLowerCase().trim();
        return !deletedSet.has(idLower) && !deletedSet.has(khLower) && !deletedSet.has(lblLower);
      })
      .map((f) => {
        const idLower = f.id.toLowerCase().trim();
        const khLower = f.nameKh.toLowerCase().trim();
        const lblLower = f.label.toLowerCase().trim();
        const override =
          flavorOverrides[idLower] ||
          flavorOverrides[khLower] ||
          flavorOverrides[lblLower];

        if (override) {
          const nameKh = override.nameKh || f.nameKh;
          const nameEn = override.nameEn !== undefined ? override.nameEn : f.nameEn;
          return {
            ...f,
            nameKh,
            nameEn,
            label: nameEn ? `${nameKh} (${nameEn})` : nameKh,
            icon: getFlavorEmoji(nameKh),
            isCustom: false,
          };
        }
        return {
          ...f,
          icon: f.icon || getFlavorEmoji(f.nameKh),
          isCustom: false,
        };
      });

    // 2. Process custom flavors from flavors array
    if (flavors && flavors.length > 0) {
      flavors.forEach((fl, idx) => {
        const clean = fl.trim();
        if (!clean) return;
        const cleanLower = clean.toLowerCase();
        if (deletedSet.has(cleanLower)) return;

        const exists = list.some(
          (item) =>
            item.label.toLowerCase() === cleanLower ||
            item.nameKh.toLowerCase() === cleanLower ||
            cleanLower.includes(item.nameKh.toLowerCase())
        );

        if (!exists) {
          list.push({
            id: `store-fl-${idx}-${clean}`,
            nameKh: clean,
            nameEn: 'រសជាតិហាងថែម',
            icon: getFlavorEmoji(clean),
            label: clean,
            isCustom: true,
          });
        }
      });
    }

    return list;
  }, [flavors, deletedFlavorIds, flavorOverrides]);

  // Check if a flavor is unavailable
  const isOutOfStock = (item: CakeFlavorItem) => {
    const lbl = item.label.toLowerCase().trim();
    const id = item.id.toLowerCase().trim();
    const kh = item.nameKh.toLowerCase().trim();
    return unavailableFlavors.some((u) => {
      const uClean = u.toLowerCase().trim();
      return uClean === lbl || uClean === id || uClean === kh;
    });
  };

  // Filtered flavors based on tab and search
  const filteredFlavors = useMemo(() => {
    return allFlavors.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.nameKh.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q);

      const outOfStock = isOutOfStock(item);
      if (filterTab === 'available') return matchSearch && !outOfStock;
      if (filterTab === 'out_of_stock') return matchSearch && outOfStock;
      return matchSearch;
    });
  }, [allFlavors, searchQuery, filterTab, unavailableFlavors]);

  const totalCount = allFlavors.length;
  const outOfStockCount = allFlavors.filter((f) => isOutOfStock(f)).length;
  const inStockCount = totalCount - outOfStockCount;

  const handleAddNewFlavor = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKh = newFlavorNameKh.trim();
    const cleanEn = newFlavorNameEn.trim();
    if (!cleanKh) return;

    soundFx.playSuccess();
    const fullLabel = cleanEn ? `${cleanKh} (${cleanEn})` : cleanKh;
    addFlavor(fullLabel);
    setNewFlavorNameKh('');
    setNewFlavorNameEn('');
    setIsAddingNew(false);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleStartEdit = (item: CakeFlavorItem) => {
    soundFx.playPop();
    setEditingFlavorId(item.id);
    setEditNameKh(item.nameKh);
    setEditNameEn(item.nameEn || '');
  };

  const handleCancelEdit = () => {
    soundFx.playPop();
    setEditingFlavorId(null);
    setEditNameKh('');
    setEditNameEn('');
  };

  const handleSaveEdit = (item: CakeFlavorItem) => {
    const cleanKh = editNameKh.trim();
    const cleanEn = editNameEn.trim();
    if (!cleanKh) return;

    soundFx.playSuccess();
    updateFlavor(item.id, cleanKh, cleanEn);
    if (item.nameKh && item.nameKh !== item.id) {
      updateFlavor(item.nameKh, cleanKh, cleanEn);
    }
    if (item.label && item.label !== item.id) {
      updateFlavor(item.label, cleanKh, cleanEn);
    }

    setEditingFlavorId(null);
    setEditNameKh('');
    setEditNameEn('');
  };

  const handleDeleteFlavor = (item: CakeFlavorItem) => {
    soundFx.playPop();
    if (confirm(`តើអ្នកពិតជាចង់លុបរ៉សជាតិ "${item.nameKh}" នេះមែនទេ?`)) {
      deleteFlavor(item.id);
      deleteFlavor(item.nameKh);
      if (item.label) deleteFlavor(item.label);
      soundFx.playSuccess();
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    }
  };

  const handleToggle = (item: CakeFlavorItem) => {
    soundFx.playPop();
    const out = isOutOfStock(item);
    if (out) {
      setFlavorAvailability(item.label, true);
      setFlavorAvailability(item.id, true);
      setFlavorAvailability(item.nameKh, true);
    } else {
      toggleFlavorAvailability(item.label);
    }
  };

  const handleMarkAllInStock = () => {
    soundFx.playSuccess();
    markAllFlavorsAvailable();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleRestoreDefaults = () => {
    if (
      confirm(
        'តើអ្នកចង់ផ្ទុកបញ្ជីរសជាតិពេញលេញលំនាំដើម (12 មុខ) និងកំណត់ឱ្យមានក្នុងស្តុកទាំងអស់ឡើងវិញមែនទេ?'
      )
    ) {
      soundFx.playSuccess();
      restoreDefaultFlavors();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🧁
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                <span>គ្រប់គ្រងរសជាតិនំ & ស្តុក</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {inStockCount}/{totalCount} មានក្នុងហាង
                </span>
              </h3>
              <p className="text-[11px] text-pink-100 font-medium">
                កែឈ្មោះ លុប ឬកំណត់រសជាតិណាមាន/អស់ស្តុក សម្រាប់ផ្ទាំងកុម្មង់
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Counts & Add Button */}
        <div className="p-3 sm:p-4 bg-rose-50/50 border-b border-rose-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-rose-100 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setFilterTab('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ទាំងអស់ ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setFilterTab('available');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'available'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>មាន ({inStockCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setFilterTab('out_of_stock');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'out_of_stock'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 hover:text-rose-800'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>អស់ ({outOfStockCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {outOfStockCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllInStock}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                title="កំណត់ថារសជាតិទាំងអស់មានក្នុងស្តុកឡើងវិញ"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>ដាក់មានទាំងអស់</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
              title="ផ្ទុករសជាតិពេញលេញលំនាំដើម (12 មុខ) និងកំណត់មានក្នុងស្តុកទាំងអស់"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">ម៉ឺនុយពេញ (12 មុខ)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsAddingNew((prev) => !prev);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isAddingNew ? 'បិទ' : 'ថែមរសជាតិថ្មី'}</span>
            </button>
          </div>
        </div>

        {/* Add New Flavor Input Box (Expandable) */}
        {isAddingNew && (
          <form
            onSubmit={handleAddNewFlavor}
            className="p-3.5 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in slide-in-from-top duration-200 shrink-0"
          >
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🧁</span>
              <input
                type="text"
                autoFocus
                placeholder="ឈ្មោះរសជាតិខ្មែរ (ឧ. សូកូឡាខ្មៅ, ស្វាយស្រស់, ខារ៉ាមែល)..."
                value={newFlavorNameKh}
                onChange={(e) => setNewFlavorNameKh(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-pink-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 shadow-2xs"
              />
            </div>
            <div className="relative sm:w-48">
              <input
                type="text"
                placeholder="អង់គ្លេស (ឧ. Dark Chocolate)..."
                value={newFlavorNameEn}
                onChange={(e) => setNewFlavorNameEn(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-pink-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              disabled={!newFlavorNameKh.trim()}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>រក្សាទុក</span>
            </button>
          </form>
        )}

        {/* Search Bar */}
        <div className="p-3 border-b border-rose-50 bg-white shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះរសជាតិនំ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Flavors List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
          {filteredFlavors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <span className="text-3xl">🔍</span>
              <p className="text-xs font-bold">រកមិនឃើញរសជាតិដែលត្រូវគ្នានោះទេ</p>
            </div>
          ) : (
            filteredFlavors.map((item) => {
              const outOfStock = isOutOfStock(item);
              const isEditing = editingFlavorId === item.id;

              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border-2 border-pink-400 bg-pink-50/70 shadow-md transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-10 h-10 rounded-2xl bg-white border border-pink-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                        {getFlavorEmoji(editNameKh || item.nameKh)}
                      </span>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div>
                          <label className="text-[10px] font-bold text-pink-700 block mb-0.5">
                            ឈ្មោះរសជាតិ (ខ្មែរ)
                          </label>
                          <input
                            type="text"
                            autoFocus
                            value={editNameKh}
                            onChange={(e) => setEditNameKh(e.target.value)}
                            placeholder="ឈ្មោះខ្មែរ..."
                            className="w-full px-3 py-1.5 bg-white border border-pink-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            ការពិពណ៌នា / ឈ្មោះអង់គ្លេស (Optional)
                          </label>
                          <input
                            type="text"
                            value={editNameEn}
                            onChange={(e) => setEditNameEn(e.target.value)}
                            placeholder="ឈ្មោះអង់គ្លេស..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item)}
                        disabled={!editNameKh.trim()}
                        className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>រក្សាទុក</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>បោះបង់</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 sm:gap-3 ${
                    outOfStock
                      ? 'bg-slate-50 border-slate-200 opacity-75'
                      : 'bg-white border-rose-100 hover:border-pink-300 shadow-2xs'
                  }`}
                >
                  {/* Left: Icon and Flavor Names */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-black text-xs sm:text-sm truncate ${
                            outOfStock ? 'text-slate-500 line-through' : 'text-slate-800'
                          }`}
                        >
                          {item.nameKh}
                        </span>
                        {item.isCustom && (
                          <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 shrink-0">
                            រសជាតិហាងថែម
                          </span>
                        )}
                        {outOfStock ? (
                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>អស់ស្តុក</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>មានក្នុងហាង</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.nameEn || item.label}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Toggle Stock Button */}
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95 ${
                        outOfStock
                          ? 'bg-rose-100 hover:bg-emerald-500 hover:text-white text-rose-700 border border-rose-300'
                          : 'bg-emerald-100 hover:bg-rose-500 hover:text-white text-emerald-800 border border-emerald-300'
                      }`}
                      title={
                        outOfStock
                          ? 'ចុចដើម្បីបើកថារសជាតិនេះមានក្នុងហាង'
                          : 'ចុចដើម្បីដាក់ថារសជាតិនេះអស់ស្តុក'
                      }
                    >
                      {outOfStock ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">អស់ស្តុក (ចុចបើក)</span>
                          <span className="sm:hidden">អស់</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">មាន (ចុចបិទ)</span>
                          <span className="sm:hidden">មាន</span>
                        </>
                      )}
                    </button>

                    {/* Edit Flavor Button (Every Flavor can be edited!) */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="កែឈ្មោះរសជាតិនេះ"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Flavor Button (Every Flavor can be deleted!) */}
                    <button
                      type="button"
                      onClick={() => handleDeleteFlavor(item)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="លុបរ៉សជាតិនេះ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-rose-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span>
              លោកអ្នកអាចចុច <Pencil className="w-3 h-3 inline text-blue-500" /> ដើម្បីកែឈ្មោះ ឬចុច{' '}
              <Trash2 className="w-3 h-3 inline text-rose-500" /> ដើម្បីលុបរ៉សជាតិណាមួយបានយ៉ាងងាយ។
            </span>
          </p>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs shrink-0 ml-2"
          >
            រួចរាល់
          </button>
        </div>
      </div>
    </div>
  );
};
