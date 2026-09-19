import React, { useState, useRef } from 'react';
import { X, Cake, Calendar, User, Phone, DollarSign, Sparkles, Upload, Image as ImageIcon, Plus, Minus, Check, Pencil, Trash2, Camera } from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { PartyAddon } from '../../types';
import { CameraCaptureModal } from '../common/CameraCaptureModal';

interface NewCustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCustomOrderModal: React.FC<NewCustomOrderModalProps> = ({ isOpen, onClose }) => {
  const {
    lang,
    addCustomOrder,
    flavors,
    addFlavor,
    partyAddons,
    addPartyAddon,
    updatePartyAddon,
    deletePartyAddon,
    exchangeRate,
  } = useBakery();
  const text = t[lang];

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [cakeName, setCakeName] = useState('Birthday Special Cake');
  const [size, setSize] = useState('1.5 kg');
  const [flavor, setFlavor] = useState(flavors[0] || 'Chocolate Fudge + Fresh Strawberry');
  const [filling, setFilling] = useState('Fresh Cream');
  const [inscription, setInscription] = useState('');
  const [themeNotes, setThemeNotes] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Selected party add-ons with quantities
  const [selectedAddonQuantities, setSelectedAddonQuantities] = useState<Record<string, number>>({});

  // Party Add-on custom addition / edit state
  const [isAddingNewAddon, setIsAddingNewAddon] = useState(false);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPriceKhr, setNewAddonPriceKhr] = useState('5000');
  const [editingAddon, setEditingAddon] = useState<PartyAddon | null>(null);
  const [editAddonName, setEditAddonName] = useState('');
  const [editAddonPriceKhr, setEditAddonPriceKhr] = useState('');

  // Add new custom flavor state
  const [isAddingNewFlavor, setIsAddingNewFlavor] = useState(false);
  const [newFlavorInput, setNewFlavorInput] = useState('');

  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [pickupTime, setPickupTime] = useState('15:00');
  const [baseCakePriceKhr, setBaseCakePriceKhr] = useState('100000');
  const [depositKhr, setDepositKhr] = useState('60000');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_USD' | 'CASH_KHR' | 'KHQR_BAKONG'>('CASH_KHR');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Increment party addon quantity (clicking card or +)
  const handleIncrementAddon = (addonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playPop();
    setSelectedAddonQuantities((prev) => {
      const currentQty = prev[addonId] || 0;
      return { ...prev, [addonId]: currentQty + 1 };
    });
  };

  // Decrement party addon quantity (-)
  const handleDecrementAddon = (addonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playPop();
    const currentQty = selectedAddonQuantities[addonId] || 0;
    if (currentQty <= 0) return;

    setSelectedAddonQuantities((prev) => {
      const nextQty = currentQty - 1;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[addonId];
        return copy;
      }
      return { ...prev, [addonId]: nextQty };
    });
  };

  // Calculate total with addons (KHR ៛ FIRST)
  const addonsTotalKhr = Object.entries(selectedAddonQuantities).reduce((sum, [id, qty]) => {
    if (!qty || qty <= 0) return sum;
    const addon = partyAddons.find((a) => a.id === id);
    return sum + (addon ? (addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate)) * qty : 0);
  }, 0);

  const addonsTotalUsd = Number((addonsTotalKhr / exchangeRate).toFixed(2));

  const totalCalculatedKhr = (parseInt(baseCakePriceKhr, 10) || 0) + addonsTotalKhr;
  const totalCalculatedUsd = Number((totalCalculatedKhr / exchangeRate).toFixed(2));
  const numDepositKhr = parseInt(depositKhr, 10) || 0;
  const depositUsd = Number((numDepositKhr / exchangeRate).toFixed(2));

  // Handle saving new flavor
  const handleAddNewFlavor = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newFlavorInput.trim()) return;
    soundFx.playPop();
    addFlavor(newFlavorInput.trim());
    setFlavor(newFlavorInput.trim());
    setNewFlavorInput('');
    setIsAddingNewFlavor(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playPop();
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) return;

    soundFx.playSuccess();

    // Append party addons to notes
    const addonsSummary = Object.entries(selectedAddonQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const addon = partyAddons.find((a) => a.id === id);
        return addon ? `${addon.nameKh}${qty > 1 ? ` (x${qty})` : ''}` : null;
      })
      .filter(Boolean)
      .join(', ');

    const combinedNotes = themeNotes
      ? `${themeNotes} ${addonsSummary ? `[ឥវ៉ាន់បន្ថែម: ${addonsSummary}]` : ''}`
      : addonsSummary
      ? `[ឥវ៉ាន់បន្ថែម: ${addonsSummary}]`
      : '';

    addCustomOrder({
      customerName,
      phone,
      cakeName,
      size,
      flavor,
      filling,
      inscription,
      themeNotes: combinedNotes,
      referenceImage,
      pickupDate,
      pickupTime,
      totalUsd: totalCalculatedUsd,
      totalKhr: totalCalculatedKhr,
      depositUsd: depositUsd,
      depositKhr: numDepositKhr,
      paymentMethod,
      status: 'PENDING',
    });

    onClose();
    // reset
    setCustomerName('');
    setPhone('');
    setInscription('');
    setThemeNotes('');
    setReferenceImage('');
    setSelectedAddonQuantities({});
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-rose-50/60 to-pink-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">កត់ត្រាកុម្ម៉ង់នំខួបកំណើត/ពិសេសថ្មី</h3>
              <p className="text-xs text-slate-500">ជ្រើសរើសរសជាតិ, Upload រូបភាព & ថែមឥវ៉ាន់ពិធី</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឈ្មោះអតិថិជន (Customer Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុខ វិសាល"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                លេខទូរស័ព្ទ (Phone Number) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="ឧ. 012 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Reference Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                រូបភាពគំរូនំដែលភ្ញៀវចង់បាន (Reference Photo)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setIsCameraOpen(true);
                  }}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📸 ថតរូបពីកាម៉េរ៉ា</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            <div className="w-full h-32 rounded-2xl border-2 border-dashed border-rose-200 hover:border-pink-500 bg-rose-50/30 hover:bg-rose-50/60 transition-all cursor-pointer flex items-center justify-center overflow-hidden relative group">
              {referenceImage ? (
                <>
                  <img
                    src={referenceImage}
                    alt="Custom Cake Reference"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playPop();
                        setIsCameraOpen(true);
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>ថតរូបថ្មី</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ប្តូររូប</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-3 p-3">
                  <div
                    onClick={() => {
                      soundFx.playPop();
                      setIsCameraOpen(true);
                    }}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-purple-100/60 transition-colors"
                  >
                    <div className="p-2 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-xl mb-1 shadow-xs">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-purple-900">ថតរូបផ្ទាល់ពីកាម៉េរ៉ា</span>
                    <span className="text-[10px] text-purple-600/80">កាម៉េរ៉ាទូរស័ព្ទ / WebCam</span>
                  </div>

                  <div className="w-[1px] h-12 bg-rose-200" />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-pink-100/60 transition-colors"
                  >
                    <div className="p-2 bg-pink-100 text-pink-600 rounded-xl mb-1">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Upload ពីកុំព្យូទ័រ/File</span>
                    <span className="text-[10px] text-slate-400">សម្រាប់ចុងភៅមើលតាម</span>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Cake Details & Dynamic Flavors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះម៉ូដនំ</label>
              <input
                type="text"
                value={cakeName}
                onChange={(e) => setCakeName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ទំហំ / ទម្ងន់</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
              >
                <option value="0.8 kg (Mini 4-inch)">0.8 kg (Mini 4-inch)</option>
                <option value="1.0 kg (6-inch)">1.0 kg (6-inch)</option>
                <option value="1.5 kg (8-inch)">1.5 kg (8-inch)</option>
                <option value="2.0 kg (10-inch)">2.0 kg (10-inch)</option>
                <option value="2.5 kg (2 Tiers)">2.5 kg (2 Tiers ថ្នាក់ពីរ)</option>
                <option value="4.0 kg (3 Tiers Wedding)">4.0 kg (3 Tiers មង្គលការ)</option>
              </select>
            </div>

            {/* Dynamic Flavor Selector with Add New option */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">រសជាតិនំ (Flavor)</label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewFlavor(!isAddingNewFlavor)}
                  className="text-[10px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingNewFlavor ? 'ជ្រើសរើស' : 'ថែមរសជាតិ'}</span>
                </button>
              </div>

              {isAddingNewFlavor ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="ឧ. ធុរេន, ពងទាប្រៃ..."
                    value={newFlavorInput}
                    onChange={(e) => setNewFlavorInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewFlavor}
                    className="px-2.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    រក្សាទុក
                  </button>
                </div>
              ) : (
                <select
                  value={flavor}
                  onChange={(e) => setFlavor(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold text-slate-800"
                >
                  {flavors.map((f, i) => (
                    <option key={i} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Party Add-ons & Supplies (មួក ទៀន ស្ព្រាយ) */}
          <div className="bg-gradient-to-r from-amber-50/70 to-pink-50/50 p-4 rounded-3xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>ឥវ៉ាន់ទិញបន្ថែមសម្រាប់ពិធី (Party Add-ons)</span>
              </span>
              <div className="flex items-center gap-2">
                {addonsTotalKhr > 0 && (
                  <span className="text-xs font-black text-pink-600 bg-white px-2.5 py-0.5 rounded-full shadow-2xs">
                    ថែម +{addonsTotalKhr.toLocaleString()} ៛ (+${addonsTotalUsd.toFixed(2)})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setIsAddingNewAddon((prev) => !prev);
                    setEditingAddon(null);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ បន្ថែមទំនិញថ្មី</span>
                </button>
              </div>
            </div>

            {/* Inline Add New Party Add-on Form */}
            {isAddingNewAddon && (
              <div className="p-3 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-2 animate-in fade-in duration-150">
                <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>+ បញ្ចូលមុខទំនិញពិធីបន្ថែមថ្មី</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddon(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="ឈ្មោះទំនិញ (ឧ. 🎈 ប៉េងប៉ោងខួបកំណើត)"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="តម្លៃជាលុយរៀល (៛ KHR)"
                      value={newAddonPriceKhr}
                      onChange={(e) => setNewAddonPriceKhr(e.target.value)}
                      className="w-full px-3 py-1.5 pr-7 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold text-pink-600"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                      ៛
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAddon(false);
                      setNewAddonName('');
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAddonName.trim()) return;
                      soundFx.playSuccess();
                      const priceKhr = parseInt(newAddonPriceKhr, 10) || 0;
                      addPartyAddon(newAddonName.trim(), priceKhr);
                      setNewAddonName('');
                      setNewAddonPriceKhr('5000');
                      setIsAddingNewAddon(false);
                    }}
                    className="px-3 py-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>រក្សាទុក</span>
                  </button>
                </div>
              </div>
            )}

            {/* Inline Edit Party Add-on Form */}
            {editingAddon && (
              <div className="p-3 bg-white rounded-2xl border border-pink-300 shadow-sm space-y-2 animate-in fade-in duration-150">
                <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>✏️ កែប្រែទំនិញ៖ {editingAddon.nameKh}</span>
                  <button
                    type="button"
                    onClick={() => setEditingAddon(null)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="ឈ្មោះទំនិញ"
                    value={editAddonName}
                    onChange={(e) => setEditAddonName(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="តម្លៃ (៛ KHR)"
                      value={editAddonPriceKhr}
                      onChange={(e) => setEditAddonPriceKhr(e.target.value)}
                      className="w-full px-3 py-1.5 pr-7 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold text-pink-600"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                      ៛
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      deletePartyAddon(editingAddon.id);
                      setSelectedAddonQuantities((prev) => {
                        const copy = { ...prev };
                        delete copy[editingAddon.id];
                        return copy;
                      });
                      setEditingAddon(null);
                    }}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>លុបមុខនេះ</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingAddon(null)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editAddonName.trim()) return;
                        soundFx.playSuccess();
                        const priceKhr = parseInt(editAddonPriceKhr, 10) || 0;
                        updatePartyAddon(editingAddon.id, editAddonName.trim(), priceKhr);
                        setEditingAddon(null);
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>រក្សាទុក</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add-ons list grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {partyAddons.map((addon) => {
                const qty = selectedAddonQuantities[addon.id] || 0;
                const isSelected = qty > 0;
                const addonKhr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);
                return (
                  <div
                    key={addon.id}
                    onClick={() => handleIncrementAddon(addon.id)}
                    className={`p-2.5 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between gap-2 cursor-pointer relative select-none group ${
                      isSelected
                        ? 'bg-gradient-to-br from-pink-600 to-rose-500 text-white border-pink-700 shadow-md shadow-pink-500/25 ring-2 ring-pink-400/50 scale-[1.02]'
                        : 'bg-white hover:bg-amber-50/90 text-slate-700 border-amber-100 shadow-2xs hover:border-amber-300'
                    }`}
                    title={isSelected ? 'ចុចលើម្តងទៀតដើម្បីបូកបន្ថែម (+1) ឬប្រើប៊ូតុង + / -' : 'ចុចដើម្បីជ្រើសរើស (+1)'}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-[11px] leading-tight line-clamp-2">
                        {addon.nameKh}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected ? (
                          <span className="bg-white text-pink-700 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-2xs">
                            x{qty}
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[10px] font-bold group-hover:border-pink-500 group-hover:text-pink-600">
                            +
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playPop();
                            setEditingAddon(addon);
                            setEditAddonName(addon.nameKh);
                            const khr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);
                            setEditAddonPriceKhr(String(khr));
                            setIsAddingNewAddon(false);
                          }}
                          className={`p-1 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'text-white/80 hover:text-white hover:bg-white/20'
                              : 'text-slate-400 hover:text-pink-600 hover:bg-pink-50'
                          }`}
                          title="កែប្រែឈ្មោះ និងតម្លៃ"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-1 pt-0.5">
                      <div className={`text-[10px] ${isSelected ? 'text-pink-100 font-medium' : 'text-slate-500'}`}>
                        <span>+{addonKhr.toLocaleString()} ៛</span>
                        {qty > 1 && (
                          <div className="font-black text-white text-[10px]">
                            = {(addonKhr * qty).toLocaleString()} ៛
                          </div>
                        )}
                      </div>

                      {/* Stepper buttons when selected */}
                      {isSelected && (
                        <div
                          className="flex items-center gap-1 bg-black/20 backdrop-blur-xs p-0.5 rounded-xl shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleDecrementAddon(addon.id, e)}
                            className="w-5 h-5 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                            title="បន្ថយចំនួន (-1)"
                          >
                            <Minus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                          <span className="text-[11px] font-black text-white px-1 min-w-[14px] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleIncrementAddon(addon.id, e)}
                            className="w-5 h-5 rounded-lg bg-white text-pink-600 hover:bg-pink-50 flex items-center justify-center font-black transition-all active:scale-90 shadow-2xs cursor-pointer"
                            title="បូកបន្ថែមចំនួន (+1)"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Helpful tooltip / hint */}
            <div className="flex items-center justify-between text-[10px] text-amber-800/80 bg-white/60 px-3 py-1.5 rounded-xl border border-amber-200/60">
              <span className="flex items-center gap-1 font-medium">
                <span>💡</span>
                <span>ចុចលើកាតម្តងទៀត ឬចុចប៊ូតុង <strong>[+]</strong> ដើម្បីបូកបន្ថែមចំនួន (x2, x3...)</span>
              </span>
              {addonsTotalKhr > 0 && (
                <span className="font-bold text-pink-600">
                  សរុប {Object.values(selectedAddonQuantities).reduce((a, b) => a + b, 0)} មុខទំនិញ
                </span>
              )}
            </div>
          </div>

          {/* Inscription on Cake */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              អក្សរសរសេរលើនំ (Cake Inscription)
            </label>
            <input
              type="text"
              placeholder="ឧ. រីករាយថ្ងៃកំណើត កូនស្រីសំណព្វចិត្ត ម៉ូនីកា 🎉"
              value={inscription}
              onChange={(e) => setInscription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold text-pink-700"
            />
          </div>

          {/* Theme Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ចំណាំពណ៌ និងស្ទីលតែង (Theme & Decor Notes)
            </label>
            <input
              type="text"
              placeholder="ឧ. ស្ទីល Minimalist កូរ៉េ, ផ្ទៃពណ៌ស អក្សរពណ៌មាស, រូបម្កុដតូច..."
              value={themeNotes}
              onChange={(e) => setThemeNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          {/* Pickup Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-rose-50/40 p-4 rounded-2xl border border-rose-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                កាលបរិច្ឆេទមកយក (Pickup Date)
              </label>
              <input
                type="date"
                required
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ម៉ោងមកយក (Pickup Time)
              </label>
              <input
                type="time"
                required
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold"
              />
            </div>
          </div>

          {/* Pricing & Deposit (KHR ៛ FIRST) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                តម្លៃសរុប (នំ + ឥវ៉ាន់បន្ថែម) ៛ KHR *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  value={totalCalculatedKhr}
                  onChange={(e) => {
                    const newTotal = parseInt(e.target.value, 10) || 0;
                    setBaseCakePriceKhr(String(Math.max(0, newTotal - addonsTotalKhr)));
                  }}
                  className="w-full px-3 py-2 text-base font-black text-pink-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ៛
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                ~ ${totalCalculatedUsd.toFixed(2)} USD
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">ប្រាក់កក់ (Deposit ៛) *</label>
                <span className="text-[10px] font-bold text-rose-500">
                  {totalCalculatedKhr > numDepositKhr
                    ? `នៅខ្វះ ${(totalCalculatedKhr - numDepositKhr).toLocaleString()} ៛`
                    : 'បង់គ្រប់ ១០០%'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={totalCalculatedKhr}
                  required
                  value={depositKhr}
                  onChange={(e) => setDepositKhr(e.target.value)}
                  className="w-full px-3 py-2 text-base font-black text-emerald-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ៛
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>~ ${depositUsd.toFixed(2)} USD</span>
              </div>

              {/* Quick deposit shortcuts */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setDepositKhr('0');
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  គ្មានកក់ (0៛)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    const half = Math.round(totalCalculatedKhr / 2 / 1000) * 1000;
                    setDepositKhr(half.toString());
                  }}
                  className="px-2 py-0.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  កក់ 50%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setDepositKhr(totalCalculatedKhr.toString());
                  }}
                  className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  បង់គ្រប់ 100%
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ទូទាត់ប្រាក់កក់តាម</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold text-slate-800"
              >
                <option value="CASH_KHR">សាច់ប្រាក់ (៛ រៀល)</option>
                <option value="KHQR_BAKONG">ស្កេន KHQR Bakong / ABA</option>
                <option value="CASH_USD">សាច់ប្រាក់ ($ ដុល្លារ)</option>
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-rose-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-600/25 transition-all flex items-center gap-2 active:scale-95"
            >
              <Cake className="w-4 h-4" />
              <span>កត់ត្រាការកុម្ម៉ង់</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Camera Modal for Custom Cake Reference */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setReferenceImage(img);
        }}
        title="ថតរូបគំរូនំខួបកំណើត (Cake Reference)"
        subtitle="ថតរូបគំរូនំពីកាម៉េរ៉ាដើម្បីឱ្យជាងដុតនំ និងតែងនំមើលតាម"
      />
    </div>
  );
};
