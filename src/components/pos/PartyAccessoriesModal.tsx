import React, { useState } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  Sparkles,
  ShoppingBag,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { PartyAddon, Product } from '../../types';
import { soundFx } from '../../utils/audio';

interface PartyAccessoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartyAccessoriesModal: React.FC<PartyAccessoriesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    partyAddons,
    addPartyAddon,
    updatePartyAddon,
    deletePartyAddon,
    exchangeRate,
    addToCart,
    cart,
  } = useBakery();

  // Add new addon state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNameKh, setNewNameKh] = useState('');
  const [newPriceUsd, setNewPriceUsd] = useState('1.00');
  const [newPriceKhr, setNewPriceKhr] = useState('4000');

  // Edit existing addon state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameKh, setEditNameKh] = useState('');
  const [editPriceUsd, setEditPriceUsd] = useState('');
  const [editPriceKhr, setEditPriceKhr] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto conversion handlers for new item
  const handleNewPriceUsdChange = (val: string) => {
    setNewPriceUsd(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setNewPriceKhr(String(Math.round(num * exchangeRate)));
    }
  };

  const handleNewPriceKhrChange = (val: string) => {
    setNewPriceKhr(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setNewPriceUsd((num / exchangeRate).toFixed(2));
    }
  };

  // Auto conversion handlers for edit item
  const handleEditPriceUsdChange = (val: string) => {
    setEditPriceUsd(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setEditPriceKhr(String(Math.round(num * exchangeRate)));
    }
  };

  const handleEditPriceKhrChange = (val: string) => {
    setEditPriceKhr(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setEditPriceUsd((num / exchangeRate).toFixed(2));
    }
  };

  // Submit new accessory
  const handleCreateAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameKh.trim()) return;

    soundFx.playSuccess();
    const usd = parseFloat(newPriceUsd) || 0;
    const khr = parseInt(newPriceKhr, 10) || Math.round(usd * exchangeRate);

    addPartyAddon(newNameKh.trim(), khr, usd);
    setNewNameKh('');
    setNewPriceUsd('1.00');
    setNewPriceKhr('4000');
    setIsAddingNew(false);
  };

  // Start editing
  const startEditing = (addon: PartyAddon) => {
    soundFx.playPop();
    setEditingId(addon.id);
    setEditNameKh(addon.nameKh);
    const usd = addon.priceUsd;
    const khr = addon.priceKhr ?? Math.round(usd * exchangeRate);
    setEditPriceUsd(usd.toString());
    setEditPriceKhr(khr.toString());
  };

  // Save edited accessory
  const handleSaveEdit = (id: string) => {
    if (!editNameKh.trim()) return;

    soundFx.playSuccess();
    const usd = parseFloat(editPriceUsd) || 0;
    const khr = parseInt(editPriceKhr, 10) || Math.round(usd * exchangeRate);

    updatePartyAddon(id, editNameKh.trim(), khr, usd);
    setEditingId(null);
  };

  // Delete accessory
  const handleDelete = (id: string) => {
    soundFx.playPop();
    deletePartyAddon(id);
    setDeletingId(null);
    if (editingId === id) setEditingId(null);
  };

  // Add to POS Cart
  const handleAddDirectToCart = (addon: PartyAddon) => {
    soundFx.playPop();
    const addonProductId = `addon-${addon.id}`;
    const addonKhr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);

    const partyProduct: Product = {
      id: addonProductId,
      nameKh: `🎉 ${addon.nameKh}`,
      nameEn: `🎉 ${addon.nameEn || addon.nameKh}`,
      categoryId: 'party',
      priceUsd: addon.priceUsd,
      priceKhr: addonKhr,
      costPriceUsd: 0,
      stockQty: 999,
      unit: 'pcs',
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
      isCustom: false,
    };
    addToCart(partyProduct);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-rose-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                🎉 គ្រឿងបន្ថែមសម្រាប់កម្មវិធី (Party Accessories)
              </h2>
              <p className="text-[11px] text-pink-100 font-medium">
                គ្រប់គ្រង បន្ថែមមុខទំនិញថ្មី និងកែប្រែតម្លៃ ($ USD / ៛ KHR)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Action Header: Add New Accessory Trigger */}
          <div className="flex items-center justify-between pb-1">
            <div className="text-xs font-bold text-slate-700">
              បញ្ជីមុខទំនិញពិធីបច្ចុប្បន្ន ({partyAddons.length})
            </div>
            {!isAddingNew && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsAddingNew(true);
                  setEditingId(null);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ ថែមមុខទំនិញថ្មី</span>
              </button>
            )}
          </div>

          {/* Add New Accessory Card Form */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateAddon}
              className="p-4 bg-gradient-to-br from-amber-50/80 via-pink-50/50 to-rose-50/60 rounded-2xl border-2 border-pink-400 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span>បញ្ចូលមុខទំនិញពិធីថ្មី (New Accessory)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ឈ្មោះទំនិញ (Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. 🎈 ប៉េងប៉ោងខួបកំណើត"
                    value={newNameKh}
                    onChange={(e) => setNewNameKh(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/25"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    តម្លៃជាដុល្លារ ($ USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      required
                      placeholder="1.00"
                      value={newPriceUsd}
                      onChange={(e) => handleNewPriceUsdChange(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500/25"
                    />
                    <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    តម្លៃជារៀល (៛ KHR)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="4000"
                      value={newPriceKhr}
                      onChange={(e) => handleNewPriceKhrChange(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/25"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      ៛
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-black rounded-xl shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>រក្សាទុកមុខទំនិញថ្មី</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Party Accessories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partyAddons.map((addon) => {
              const isEditing = editingId === addon.id;
              const isDeleting = deletingId === addon.id;
              const addonProductId = `addon-${addon.id}`;
              const cartItem = cart.find((i) => i.product.id === addonProductId);
              const qtyInCart = cartItem ? cartItem.quantity : 0;
              const displayKhr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);

              if (isEditing) {
                return (
                  <div
                    key={addon.id}
                    className="p-3.5 bg-white rounded-2xl border-2 border-pink-400 shadow-md space-y-2.5 sm:col-span-2 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-pink-700 flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" />
                        <span>កែប្រែទំនិញ៖ {addon.nameKh}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          ឈ្មោះទំនិញ
                        </label>
                        <input
                          type="text"
                          value={editNameKh}
                          onChange={(e) => setEditNameKh(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          តម្លៃ ($ USD)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            value={editPriceUsd}
                            onChange={(e) => handleEditPriceUsdChange(e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          />
                          <DollarSign className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          តម្លៃ (៛ KHR)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="100"
                            min="0"
                            value={editPriceKhr}
                            onChange={(e) => handleEditPriceKhrChange(e.target.value)}
                            className="w-full pl-2 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                            ៛
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(addon.id)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>លុបទំនិញនេះ</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                        >
                          បោះបង់
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(addon.id)}
                          className="px-4 py-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>រក្សាទុកការកែប្រែ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={addon.id}
                  className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-pink-300 hover:shadow-sm transition-all flex flex-col justify-between gap-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-800 group-hover:text-pink-600 transition-colors">
                        {addon.nameKh}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-pink-600">
                          ${addon.priceUsd.toFixed(2)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          ({displayKhr.toLocaleString()} ៛)
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(addon)}
                        className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all cursor-pointer"
                        title="កែប្រែឈ្មោះ និងតម្លៃ"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {isDeleting ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-0.5 rounded-lg border border-rose-200">
                          <button
                            type="button"
                            onClick={() => handleDelete(addon.id)}
                            className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black"
                            title="ចុចដើម្បីបញ្ជាក់ការលុប"
                          >
                            យល់ព្រម
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="px-1 py-0.5 text-slate-500 text-[10px]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingId(addon.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="លុបមុខនេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add to POS Cart Trigger */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">
                      {qtyInCart > 0 ? (
                        <span className="text-pink-600 font-black">
                          ក្នុងកន្ត្រក៖ {qtyInCart} មុខ
                        </span>
                      ) : (
                        'សម្រាប់បន្ថែមក្នុងវិក្កយបត្រ'
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddDirectToCart(addon)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                        qtyInCart > 0
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-amber-50 hover:bg-pink-50 text-amber-900 hover:text-pink-600 border border-amber-200 hover:border-pink-300'
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>{qtyInCart > 0 ? `+ ថែមទៀត (x${qtyInCart})` : '+ ដាក់កន្ត្រក'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {partyAddons.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">មិនទាន់មានមុខទំនិញពិធីនៅឡើយទេ</p>
              <p className="text-[11px] mt-1">សូមចុចប៊ូតុង "+ ថែមមុខទំនិញថ្មី" ខាងលើដើម្បីចាប់ផ្តើម</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            💡 ទិន្នន័យគ្រឿងបន្ថែមនឹងធ្វើសមកាលកម្ម (Sync) ទៅកាន់ Customer Portal និងទូរស័ព្ទស្វ័យប្រវត្ត
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
