import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  FileText,
  ShoppingBag,
  Sparkles,
  Plus,
  Minus,
  Check,
  Cake,
  Gift,
  RefreshCw,
  Pencil,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { CompletedSale } from '../../types';
import { soundFx } from '../../utils/audio';

interface AddPastSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPastSaleModal: React.FC<AddPastSaleModalProps> = ({ isOpen, onClose }) => {
  const { addPastSale, exchangeRate, partyAddons, flavors, addPartyAddon, updatePartyAddon, deletePartyAddon, currentStaff } = useBakery();

  const generateNewOrderNumber = () => `POS-PAST-${Math.floor(1000 + Math.random() * 9000)}`;

  const [date, setDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState('14:30');

  const [orderNumber, setOrderNumber] = useState(generateNewOrderNumber);

  // Cake Name & Flavor
  const [cakeName, setCakeName] = useState('នំខេកខួបកំណើត');
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [customFlavor, setCustomFlavor] = useState('');
  const [isCustomFlavor, setIsCustomFlavor] = useState(false);

  // Party Add-ons (សម្ភារៈពិធី) - Store quantities per addon ID
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  const [isAddingNewAddon, setIsAddingNewAddon] = useState(false);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPriceKhr, setNewAddonPriceKhr] = useState('4000');
  const [editingAddon, setEditingAddon] = useState<typeof partyAddons[0] | null>(null);
  const [editAddonName, setEditAddonName] = useState('');
  const [editAddonPriceKhr, setEditAddonPriceKhr] = useState('');

  // Base Cake Price & Total Price
  const [cakePriceKhr, setCakePriceKhr] = useState('80000');
  const [amountKhr, setAmountKhr] = useState('80000');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_KHR' | 'CASH_USD' | 'KHQR_BAKONG'>('CASH_KHR');
  const [cashierName, setCashierName] = useState(() => currentStaff?.name || 'សុធារិទ្ធ (Sothearith)');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('ការលក់កន្លងមក (Backdated record)');

  // Refresh invoice number and cashier when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrderNumber(generateNewOrderNumber());
      setCashierName(currentStaff?.name || 'សុធារិទ្ធ (Sothearith)');
    }
  }, [isOpen, currentStaff]);

  if (!isOpen) return null;

  // Calculate Party Add-ons Total
  const addonsTotalKhr = Object.entries(addonQuantities).reduce((sum, [id, qty]) => {
    if (!qty || qty <= 0) return sum;
    const addon = partyAddons.find((a) => a.id === id);
    const price = addon ? addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate) : 0;
    return sum + price * qty;
  }, 0);
  const addonsTotalUsd = Number((addonsTotalKhr / exchangeRate).toFixed(2));

  // Increment Addon Quantity (or add first one, clicking card or clicking +)
  const handleIncrementAddon = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playPop();
    const addon = partyAddons.find((a) => a.id === id);
    const addonPrice = addon ? addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate) : 0;

    setAddonQuantities((prev) => {
      const currentQty = prev[id] || 0;
      return { ...prev, [id]: currentQty + 1 };
    });

    // Auto-update amountKhr by adding 1 unit price
    setAmountKhr((prevAmt) => {
      const current = parseFloat(prevAmt) || 0;
      return String(current + addonPrice);
    });
  };

  // Decrement Addon Quantity (reduces count, or removes when reaching 0)
  const handleDecrementAddon = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playPop();
    const currentQty = addonQuantities[id] || 0;
    if (currentQty <= 0) return;

    const addon = partyAddons.find((a) => a.id === id);
    const addonPrice = addon ? addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate) : 0;

    setAddonQuantities((prev) => {
      const nextQty = currentQty - 1;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: nextQty };
    });

    // Auto-update amountKhr by deducting 1 unit price
    setAmountKhr((prevAmt) => {
      const current = parseFloat(prevAmt) || 0;
      return String(Math.max(0, current - addonPrice));
    });
  };

  // Handle adding new party addon on the fly
  const handleAddNewAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonName.trim()) return;

    const priceKhr = parseFloat(newAddonPriceKhr) || 4000;
    const priceUsd = Number((priceKhr / exchangeRate).toFixed(2));

    addPartyAddon(newAddonName.trim(), priceKhr, priceUsd);
    soundFx.playSuccess();
    setNewAddonName('');
    setNewAddonPriceKhr('4000');
    setIsAddingNewAddon(false);
  };

  const finalFlavor = isCustomFlavor ? customFlavor.trim() : selectedFlavor;

  // Selected addons list with quantities > 0
  const selectedAddonsList = Object.entries(addonQuantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const addon = partyAddons.find((a) => a.id === id);
      return addon ? { ...addon, quantity: qty } : null;
    })
    .filter((item): item is (typeof partyAddons[0] & { quantity: number }) => item !== null);

  // Summary of items for display
  const itemsSummaryText = [
    `${cakeName}${finalFlavor ? ` (${finalFlavor})` : ''}`,
    ...selectedAddonsList.map((a) => `🎉 ${a.nameKh}${a.quantity > 1 ? ` (x${a.quantity})` : ''}`),
  ].join(' + ');

  const numKhr = parseFloat(amountKhr) || 0;
  const numUsd = parseFloat((numKhr / exchangeRate).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numKhr <= 0) return;

    soundFx.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    const saleTimestamp = new Date(`${date}T${time}:00`).toISOString();

    // Calculate base cake price
    const cakePortionKhr = Math.max(0, numKhr - addonsTotalKhr);
    const cakePortionUsd = Number((cakePortionKhr / exchangeRate).toFixed(2));

    // Build items array: Cake + each selected Party Add-on with quantity
    const itemsList = [
      {
        productId: 'custom-past',
        nameKh: `${cakeName}${finalFlavor ? ` (${finalFlavor})` : ''}`,
        nameEn: `${cakeName}${finalFlavor ? ` (${finalFlavor})` : ''}`,
        quantity: 1,
        priceUsd: cakePortionUsd,
        priceKhr: cakePortionKhr,
      },
      ...selectedAddonsList.map((addon) => {
        const khr = addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate);
        return {
          productId: `addon-${addon.id}`,
          nameKh: `🎉 ${addon.nameKh}${addon.quantity > 1 ? ` (x${addon.quantity})` : ''}`,
          nameEn: `🎉 ${addon.nameEn || addon.nameKh}${addon.quantity > 1 ? ` (x${addon.quantity})` : ''}`,
          quantity: addon.quantity,
          priceUsd: addon.priceUsd,
          priceKhr: khr,
        };
      }),
    ];

    // Combine notes
    const extraNotes = [
      notes,
      finalFlavor ? `រសជាតិ: ${finalFlavor}` : '',
      selectedAddonsList.length
        ? `ឥវ៉ាន់ពិធី: ${selectedAddonsList.map((a) => `${a.nameKh}${a.quantity > 1 ? ` x${a.quantity}` : ''}`).join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join(' • ');

    addPastSale({
      orderNumber,
      items: itemsList,
      subtotalUsd: numUsd,
      discountUsd: 0,
      totalUsd: numUsd,
      totalKhr: numKhr,
      paymentMethod,
      cashierName,
      customerName: customerName || undefined,
      notes: extraNotes,
      createdAt: saleTimestamp,
    });

    // Reset form and generate fresh invoice number for next entry
    setOrderNumber(generateNewOrderNumber());
    setCustomerName('');
    setCakeName('នំខេកខួបកំណើត');
    setSelectedFlavor('');
    setCustomFlavor('');
    setIsCustomFlavor(false);
    setAddonQuantities({});
    setNotes('ការលក់កន្លងមក (Backdated record)');

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                បញ្ចូលការលក់កន្លងមក (Add Past Sale Record)
              </h3>
              <p className="text-xs text-slate-500">កត់ត្រាការលក់ពីមុន • ជ្រើសរើសរសជាតិ & ឥវ៉ាន់ពិធី</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 bg-rose-50/30 p-3.5 rounded-2xl border border-rose-100/80">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ថ្ងៃលក់ជាក់ស្តែង (Sale Date) *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ម៉ោងលក់ (Sale Time) *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
          </div>

          {/* Invoice # & Customer Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  លេខកូដវិក្កយបត្រ (Invoice #) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setOrderNumber(generateNewOrderNumber());
                  }}
                  className="text-[10px] text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1 cursor-pointer bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-lg border border-pink-200 transition-colors"
                  title="ចុចដើម្បីបង្កើតលេខកូដវិក្កយបត្រថ្មី"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>ប្តូរលេខថ្មី</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-mono font-bold text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ឈ្មោះអ្នកទិញ (Customer Name)
              </label>
              <input
                type="text"
                placeholder="ឧ. លីហួយ"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-semibold"
              />
            </div>
          </div>

          {/* Main Item Name & Cake Flavor */}
          <div className="p-3.5 bg-pink-50/40 border border-pink-100 rounded-2xl space-y-3">
            <div>
              <label className="block font-black text-slate-800 mb-1 flex items-center gap-1.5">
                <Cake className="w-4 h-4 text-pink-600" />
                <span>ឈ្មោះនំ / ទំនិញដែលបានលក់ (Item Name) *</span>
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. នំខេកខួបកំណើត, នំខេកទុរ៉េន..."
                value={cakeName}
                onChange={(e) => setCakeName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-bold text-slate-900 bg-white"
              />
            </div>

            {/* Cake Flavor Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-black text-slate-700 flex items-center gap-1">
                  <span>🎂</span>
                  <span>រសជាតិនំ (Cake Flavor)</span>
                </label>
                {finalFlavor && (
                  <span className="text-[11px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                    រសជាតិ៖ {finalFlavor}
                  </span>
                )}
              </div>

              {/* Flavor Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={isCustomFlavor ? 'CUSTOM' : selectedFlavor}
                  onChange={(e) => {
                    soundFx.playPop();
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomFlavor(true);
                    } else {
                      setIsCustomFlavor(false);
                      setSelectedFlavor(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-semibold text-slate-800 bg-white"
                >
                  <option value="">-- ជ្រើសរើសរសជាតិនំ --</option>
                  {flavors.map((f, i) => (
                    <option key={i} value={f}>
                      {f}
                    </option>
                  ))}
                  <option value="CUSTOM">✍️ វាយបញ្ចូលរសជាតិផ្សេងទៀត...</option>
                </select>

                {isCustomFlavor && (
                  <input
                    type="text"
                    placeholder="វាយឈ្មោះរសជាតិ (ឧ. ធុរេនកំពត, ស្រកានាគ...)"
                    value={customFlavor}
                    onChange={(e) => setCustomFlavor(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-pink-300 bg-pink-50/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-bold text-pink-700"
                  />
                )}
              </div>

              {/* Quick Flavor Chips */}
              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  'ធុរេនកំពតពិសេស',
                  'សូកូឡា & ស្ត្រប៊ែរី',
                  'ស្ត្រប៊ែរីក្រែមស្រស់',
                  'តែបៃតងម៉ាត់ឆា',
                  'វ៉ានីឡាសុទ្ធ',
                  'ត្រាវដូងក្រអូប',
                  'រ៉េដវ៉េលវែត & ឈីស',
                ].map((quickF) => {
                  const isActive = selectedFlavor.includes(quickF) || customFlavor === quickF;
                  return (
                    <button
                      key={quickF}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setIsCustomFlavor(false);
                        const matched = flavors.find((f) => f.includes(quickF)) || quickF;
                        setSelectedFlavor(matched);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-pink-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-pink-100 hover:text-pink-700 border border-slate-200'
                      }`}
                    >
                      {quickF}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Party Add-ons & Supplies (មួក ទៀន ស្ព្រាយ) */}
          <div className="bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-pink-50/60 p-4 rounded-3xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>ឥវ៉ាន់ទិញបន្ថែមសម្រាប់ពិធី (Party Add-ons)</span>
              </span>
              <div className="flex items-center gap-2">
                {addonsTotalKhr > 0 && (
                  <span className="text-xs font-black text-pink-600 bg-white px-2.5 py-0.5 rounded-full shadow-2xs border border-pink-100">
                    ថែម +{addonsTotalKhr.toLocaleString()} ៛ (+${addonsTotalUsd.toFixed(2)})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setIsAddingNewAddon((prev) => !prev);
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
                <div className="font-black text-slate-800 flex items-center justify-between text-xs">
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
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-medium"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="តម្លៃជាលុយរៀល (៛)"
                      value={newAddonPriceKhr}
                      onChange={(e) => setNewAddonPriceKhr(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">
                      ៛
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddon(false)}
                    className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded-lg text-xs"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewAddon}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    រក្សាទុក
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
                      setAddonQuantities((prev) => {
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

            {/* Add-ons List Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {partyAddons.map((addon) => {
                const qty = addonQuantities[addon.id] || 0;
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
                  សរុប {selectedAddonsList.reduce((acc, a) => acc + a.quantity, 0)} មុខទំនិញ
                </span>
              )}
            </div>
          </div>

          {/* Preview of Items to Record */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
            <span className="font-bold text-slate-500 text-[11px]">
              ទំនិញនឹងត្រូវកត់ត្រា៖
            </span>
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 flex-wrap">
              <span>🎂 {cakeName}{finalFlavor ? ` (${finalFlavor})` : ''}</span>
              {selectedAddonsList.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                >
                  +{a.nameKh}
                  {a.quantity > 1 && (
                    <span className="bg-amber-200 text-amber-950 px-1 py-0.2 rounded font-black text-[9px]">
                      x{a.quantity}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Amount in KHR ៛ FIRST, then USD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-slate-800 mb-1 uppercase tracking-wider">
                ទឹកប្រាក់សរុបគិតជាលុយខ្មែរ (KHR ៛) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="100000"
                  value={amountKhr}
                  onChange={(e) => setAmountKhr(e.target.value)}
                  className="w-full px-3 py-2 text-base font-black text-pink-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ៛
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                សមមូលជាដុល្លារ (~ USD $)
              </label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                ${numUsd.toFixed(2)} (អត្រា $1 = {exchangeRate.toLocaleString()} ៛)
              </div>
            </div>
          </div>

          {/* Payment Method & Cashier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">វិធីសាស្ត្រទូទាត់</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-bold text-slate-800 bg-white"
              >
                <option value="CASH_KHR">សាច់ប្រាក់ (៛ រៀល)</option>
                <option value="CASH_USD">សាច់ប្រាក់ ($ ដុល្លារ)</option>
                <option value="KHQR_BAKONG">ស្កេន KHQR Bakong / ABA</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">បេឡាធិការ / អ្នកលក់</label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-medium"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ចំណាំបន្ថែម</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-rose-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>រក្សាទុកការលក់កន្លងមក</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

