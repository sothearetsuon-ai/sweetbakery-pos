import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Receipt,
  DollarSign,
  Calendar,
  User,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  FileText,
  Calculator,
  Hash,
  Scale,
  Sparkles,
  Tag,
  Trash2,
  Edit2,
  Wand2,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { Expense, ExpenseCategory } from '../../types';
import { soundFx } from '../../utils/audio';
import { compressImageFile } from '../../utils/imageCompressor';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

const COMMON_UNITS = [
  'គីឡូ (kg)',
  'ក្រាម (g)',
  'ប្រអប់ (box)',
  'កញ្ចប់ (pack)',
  'បាវ (sack)',
  'ដប (bottle)',
  'លីត្រ (L)',
  'ដុំ (pcs)',
  'ឡូ (dozen)',
  'ដើម (unit)',
  'ធុង (can/tub)',
];

const QUICK_TITLES = [
  { label: '🥚 ស៊ុតមាន់', cat: 'INGREDIENTS' as ExpenseCategory },
  { label: '🌾 ម្សៅមីពិសេស', cat: 'INGREDIENTS' as ExpenseCategory },
  { label: '🧈 ប៊័រ Anchor', cat: 'INGREDIENTS' as ExpenseCategory },
  { label: '🥛 ទឹកដោះគោស្រស់', cat: 'INGREDIENTS' as ExpenseCategory },
  { label: '🍫 សូកូឡាដុំ', cat: 'INGREDIENTS' as ExpenseCategory },
  { label: '🍓 ផ្លែស្ត្រប៊ឺរី', cat: 'INGREDIENTS' as ExpenseCategory },
  { label: '📦 ប្រអប់នំខេក', cat: 'PACKAGING' as ExpenseCategory },
  { label: '🎉 សម្ភារៈពិធី (Party Supplies)', cat: 'PACKAGING' as ExpenseCategory },
  { label: '⚡ អគ្គិសនី EDC', cat: 'UTILITIES' as ExpenseCategory },
  { label: '💧 ទឹកស្អាតរដ្ឋ', cat: 'UTILITIES' as ExpenseCategory },
  { label: '🔥 ហ្គាសឡដុតនំ', cat: 'UTILITIES' as ExpenseCategory },
];

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const { lang, addExpense, updateExpense, deleteExpense, exchangeRate, currentStaff, staffMembers } = useBakery();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('INGREDIENTS');
  
  // New detailed expense fields: ចំនួន ខ្នាត តម្លៃរាយ សរុប
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('គីឡូ (kg)');
  const [unitPriceKhr, setUnitPriceKhr] = useState('');
  const [amountKhr, setAmountKhr] = useState('');

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paidBy, setPaidBy] = useState(currentStaff?.name || 'មេការហាង (Manager)');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_USD' | 'CASH_KHR' | 'BANK_TRANSFER'>('CASH_KHR');
  const [receiptImage, setReceiptImage] = useState('');
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill fields when editing an existing expense
  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setCategory(expenseToEdit.category);
      const q = expenseToEdit.quantity ?? 1;
      setQuantity(q.toString());
      setUnit(expenseToEdit.unit || 'គីឡូ (kg)');
      const p = expenseToEdit.unitPriceKhr ?? Math.round(expenseToEdit.amountKhr / q);
      setUnitPriceKhr(p.toString());
      setAmountKhr(expenseToEdit.amountKhr.toString());
      setDate(expenseToEdit.date);
      setPaidBy(expenseToEdit.paidBy);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setReceiptImage(expenseToEdit.receiptImage || '');
      setNotes(expenseToEdit.notes || '');
    } else {
      setTitle('');
      setCategory('INGREDIENTS');
      setQuantity('1');
      setUnit('គីឡូ (kg)');
      setUnitPriceKhr('');
      setAmountKhr('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaidBy(currentStaff?.name || 'មេការហាង (Manager)');
      setPaymentMethod('CASH_KHR');
      setReceiptImage('');
      setNotes('');
    }
  }, [expenseToEdit, isOpen, currentStaff]);

  if (!isOpen) return null;

  // Handlers for dynamic quantity, unit price & total auto-calculation
  const handleQuantityChange = (newQtyStr: string) => {
    setQuantity(newQtyStr);
    const q = parseFloat(newQtyStr) || 0;
    const p = parseFloat(unitPriceKhr) || 0;
    if (p > 0) {
      setAmountKhr(Math.round(q * p).toString());
    } else if (parseFloat(amountKhr) > 0 && q > 0) {
      setUnitPriceKhr(Math.round(parseFloat(amountKhr) / q).toString());
    }
  };

  const handleUnitPriceChange = (newPriceStr: string) => {
    setUnitPriceKhr(newPriceStr);
    const p = parseFloat(newPriceStr) || 0;
    const q = parseFloat(quantity) || 1;
    setAmountKhr(Math.round(q * p).toString());
  };

  const handleTotalAmountChange = (newTotalStr: string) => {
    setAmountKhr(newTotalStr);
    const t = parseFloat(newTotalStr) || 0;
    const q = parseFloat(quantity) || 1;
    if (q > 0) {
      setUnitPriceKhr(Math.round(t / q).toString());
    }
  };

  const roundAmountTo = (precision: number, mode: 'nearest' | 'up' | 'down' = 'nearest') => {
    soundFx.playPop();
    const current = parseFloat(amountKhr) || (parseFloat(quantity) || 1) * (parseFloat(unitPriceKhr) || 0) || 0;
    if (current <= 0) return;
    let rounded = current;
    if (mode === 'nearest') {
      rounded = Math.round(current / precision) * precision;
    } else if (mode === 'up') {
      rounded = Math.ceil(current / precision) * precision;
    } else if (mode === 'down') {
      rounded = Math.floor(current / precision) * precision;
    }
    handleTotalAmountChange(rounded.toString());
  };

  const numQuantity = parseFloat(quantity) || 1;
  const numUnitPriceKhr = parseFloat(unitPriceKhr) || 0;
  const numUnitPriceUsd = Number((numUnitPriceKhr / exchangeRate).toFixed(2));
  const numAmountKhr = parseInt(amountKhr, 10) || Math.round(numQuantity * numUnitPriceKhr);
  const numAmountUsd = Number((numAmountKhr / exchangeRate).toFixed(2));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playPop();
      try {
        const compressedBase64 = await compressImageFile(file, 800, 800, 0.7);
        setReceiptImage(compressedBase64);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numAmountKhr <= 0) return;

    soundFx.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    const expensePayload: Omit<Expense, 'id' | 'createdAt'> = {
      title: title.trim(),
      category,
      quantity: numQuantity,
      unit: unit.trim() || 'ដុំ',
      unitPriceKhr: numUnitPriceKhr > 0 ? numUnitPriceKhr : Math.round(numAmountKhr / numQuantity),
      unitPriceUsd: numUnitPriceUsd > 0 ? numUnitPriceUsd : Number((numAmountUsd / numQuantity).toFixed(2)),
      amountUsd: numAmountUsd,
      amountKhr: numAmountKhr,
      paidBy,
      paymentMethod,
      receiptImage: receiptImage.trim() ? receiptImage : '',
      notes: notes.trim(),
      date,
    };

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, expensePayload);
    } else {
      addExpense(expensePayload);
    }

    // Reset Form
    setTitle('');
    setQuantity('1');
    setUnitPriceKhr('');
    setAmountKhr('');
    setReceiptImage('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-3 sm:pt-6 pb-6 px-3 sm:px-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-pink-50/60 to-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-rose-500 to-pink-600 text-white rounded-2xl shadow-md shadow-rose-500/20">
              {expenseToEdit ? <Edit2 className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                {expenseToEdit ? 'កែប្រែការចំណាយ (Edit Expense)' : 'កត់ត្រាការចំណាយថ្មី (Record New Expense)'}
              </h3>
              <p className="text-xs text-slate-500">
                {expenseToEdit
                  ? `កំពុងកែប្រែទិន្នន័យចំណាយ # ${expenseToEdit.id}`
                  : 'បញ្ចូលបរិមាណ ចំនួន ខ្នាត តម្លៃរាយ និងគណនាតម្លៃសរុបស្វ័យប្រវត្តិក្នងលុយរៀល'}
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Shortcuts (only for new expense) */}
          {!expenseToEdit && (
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>មុខទំនិញចំណាយញឹកញាប់ (ចុចជ្រើសរើសរហ័ស)៖</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TITLES.map((qt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setTitle(qt.label);
                      setCategory(qt.cat);
                    }}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50/80 hover:bg-pink-100 text-slate-700 hover:text-pink-700 border border-rose-100 transition-colors cursor-pointer"
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                បរិយាយមុខទំនិញ / ការចំណាយ *
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. ស៊ុតមាន់ស្រស់ CP, ម្សៅមី Anchor, ប្រអប់នំ..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-bold text-slate-800"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                ប្រភេទចំណាយ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold text-slate-800"
              >
                <option value="INGREDIENTS">🥚 គ្រឿងផ្សំធ្វើនំ (Ingredients)</option>
                <option value="PACKAGING">📦 ប្រអប់ & វេចខ្ចប់ (Packaging)</option>
                <option value="UTILITIES">⚡ ទឹក ភ្លើង ហ្គាស (Utilities)</option>
                <option value="SALARY">👤 ប្រាក់ខែ & ថ្លៃឈ្នួល (Salary)</option>
                <option value="RENT">🏠 ថ្លៃជួលទីតាំង (Rent)</option>
                <option value="MAINTENANCE">🔧 ជួសជុលឧបករណ៍/ឡ</option>
                <option value="MARKETING">📢 ផ្សព្វផ្សាយ / Boost Ads</option>
                <option value="OTHER">📌 ផ្សេងៗ (Other)</option>
              </select>
            </div>
          </div>

          {/* Core Feature: ចំនួន, ខ្នាត, តម្លៃរាយ, សរុប */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-amber-50/50 border border-rose-200/90 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-black text-rose-950 uppercase tracking-wider">
                  គណនាថ្លៃទិញ (ចំនួន × តម្លៃរាយ = សរុប)
                </span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                គិតជាលុយរៀល ៛ KHR
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 1. ចំនួន (Quantity) */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-rose-500" />
                  <span>ចំនួន (Qty) *</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full px-3 py-2 text-base font-black text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="flex gap-1">
                    {['+1', '+5', '+10'].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => {
                          const nextVal = (parseFloat(quantity) || 0) + parseInt(inc.replace('+', ''), 10);
                          handleQuantityChange(nextVal.toString());
                        }}
                        className="px-1.5 py-0.5 text-[9px] font-bold bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md transition-colors cursor-pointer"
                      >
                        {inc}
                      </button>
                    ))}
                  </div>
                  {numQuantity > 0 && (
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {numQuantity.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* 2. ខ្នាត (Unit) */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-rose-500" />
                  <span>ខ្នាត (Unit) *</span>
                </label>
                <input
                  type="text"
                  required
                  list="common-units-list"
                  placeholder="គីឡូ, ប្រអប់..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <datalist id="common-units-list">
                  {COMMON_UNITS.map((u, i) => (
                    <option key={i} value={u} />
                  ))}
                </datalist>
                <div className="text-[10px] text-slate-400 mt-1">
                  អាចជ្រើសរើស ឬវាយខ្នាតថ្មី
                </div>
              </div>

              {/* 3. តម្លៃរាយ (Unit Price KHR) */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  តម្លៃរាយ (Unit Price)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="100"
                    placeholder="12000"
                    value={unitPriceKhr}
                    onChange={(e) => handleUnitPriceChange(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 text-base font-black text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ៛
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-1">
                  <span>{numUnitPriceKhr > 0 ? `~ $${numUnitPriceUsd.toFixed(2)} USD` : '៛ / ខ្នាត'}</span>
                  {numUnitPriceKhr > 0 && (
                    <span className="font-bold text-slate-600 font-mono">
                      {numUnitPriceKhr.toLocaleString()} ៛
                    </span>
                  )}
                </div>
              </div>

              {/* 4. សរុប (Total Amount KHR) */}
              <div>
                <label className="block text-xs font-black text-rose-800 mb-1">
                  សរុប (Total KHR) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="60000"
                    value={amountKhr}
                    onChange={(e) => handleTotalAmountChange(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 text-base font-black text-rose-600 bg-white border-2 border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-rose-500 font-black text-xs">
                    ៛
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-rose-700 font-bold font-mono">
                    {numAmountKhr > 0 ? `${numAmountKhr.toLocaleString()} ៛` : ''} (~ ${numAmountUsd.toFixed(2)})
                  </span>
                  {numAmountKhr > 0 && numAmountKhr % 100 !== 0 && (
                    <button
                      type="button"
                      onClick={() => roundAmountTo(100, 'nearest')}
                      className="text-[9px] font-black text-rose-600 bg-rose-100/80 hover:bg-rose-200 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                      title="ចុចដើម្បីបង្គត់ 100 ៛"
                    >
                      ✨ បង្គត់ 100៛
                    </button>
                  )}
                </div>

                {/* Smart One-Click Rounding Buttons */}
                {numAmountKhr > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1.5">
                    <button
                      type="button"
                      onClick={() => roundAmountTo(100, 'nearest')}
                      className="px-1.5 py-0.5 text-[9px] font-bold bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md transition-all shadow-2xs active:scale-95 cursor-pointer"
                      title="បង្គត់ទៅខ្ទង់រយ (ឧ. 465,700 ៛)"
                    >
                      ~{(Math.round(numAmountKhr / 100) * 100).toLocaleString()} ៛
                    </button>
                    <button
                      type="button"
                      onClick={() => roundAmountTo(1000, 'nearest')}
                      className="px-1.5 py-0.5 text-[9px] font-bold bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md transition-all shadow-2xs active:scale-95 cursor-pointer"
                      title="បង្គត់ទៅខ្ទង់ពាន់ (ឧ. 466,000 ៛)"
                    >
                      ~{(Math.round(numAmountKhr / 1000) * 1000).toLocaleString()} ៛
                    </button>
                    <button
                      type="button"
                      onClick={() => roundAmountTo(1000, 'down')}
                      className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-md transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-0.5"
                      title="បង្គត់ចុះ (Floor)"
                    >
                      <ArrowDown className="w-2 h-2" />
                      <span>{(Math.floor(numAmountKhr / 1000) * 1000).toLocaleString()} ៛</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => roundAmountTo(1000, 'up')}
                      className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-md transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-0.5"
                      title="បង្គត់ឡើង (Ceil)"
                    >
                      <ArrowUp className="w-2 h-2" />
                      <span>{(Math.ceil(numAmountKhr / 1000) * 1000).toLocaleString()} ៛</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Unit Chips for 1-click selection */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] text-slate-400 font-bold">ខ្នាតទូទៅ៖</span>
              {COMMON_UNITS.slice(0, 6).map((u, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    unit === u
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>

            {/* Summary Visual Box */}
            {numAmountKhr > 0 && (
              <div className="p-2.5 rounded-xl bg-white border border-rose-200/90 flex flex-wrap items-center justify-between text-xs text-slate-700 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">គណនា៖</span>
                  <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {numQuantity} {unit}
                  </span>
                  <span>×</span>
                  <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {numUnitPriceKhr > 0 ? numUnitPriceKhr.toLocaleString() : Math.round(numAmountKhr / numQuantity).toLocaleString()} ៛
                  </span>
                  <span>=</span>
                </div>
                <div className="font-black text-sm text-rose-600">
                  {numAmountKhr.toLocaleString()} ៛ ({`$${numAmountUsd.toFixed(2)}`})
                </div>
              </div>
            )}
          </div>

          {/* Date & Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>កាលបរិច្ឆេទចំណាយ</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span>អ្នកចំណាយ (Paid By)</span>
              </label>
              <input
                type="text"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-bold"
              />
              <div className="flex gap-1 mt-1 overflow-x-auto">
                {staffMembers.slice(0, 4).map((staff) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => setPaidBy(`${staff.name} (${staff.role})`)}
                    className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-50 hover:bg-rose-50 text-slate-600 rounded border border-slate-200 whitespace-nowrap cursor-pointer"
                  >
                    {staff.avatar} {staff.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">វិធីសាស្ត្រទូទាត់ប្រាក់</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CASH_KHR', label: 'សាច់ប្រាក់ (៛ KHR)' },
                { id: 'BANK_TRANSFER', label: 'ផ្ទេរធនាគារ / ABA' },
                { id: 'CASH_USD', label: 'សាច់ប្រាក់ ($ USD)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`py-2 px-2 text-xs rounded-xl font-bold border transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-2xs ring-1 ring-rose-400/30'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Receipt Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              រូបភាពវិក្កយបត្រ / បង្កាន់ដៃទិញ (Receipt / Invoice Photo)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/50 transition-all cursor-pointer flex items-center justify-center overflow-hidden relative group"
            >
              {receiptImage ? (
                <>
                  <img
                    src={receiptImage}
                    alt="Receipt preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Upload className="w-4 h-4" />
                    <span>ចុចដើម្បីប្តូររូបវិក្កយបត្រ</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="w-5 h-5 text-rose-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-600">
                    ចុចដើម្បី Upload រូបវិក្កយបត្រ (ទុកជាភស្តុតាង)
                  </span>
                  <p className="text-[10px] text-slate-400">គាំទ្ររូបភាពពីកាមេរ៉ាទូរស័ព្ទ ឬកុំព្យូទ័រ</p>
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">កំណត់សម្គាល់បន្ថែម</label>
            <input
              type="text"
              placeholder="ឧ. ទិញនៅផ្សារដើមគ, ហាងផ្គត់ផ្គង់ Euro Gourmet, លេខវិក្កយបត្រ #1042..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-rose-100 flex items-center justify-between gap-3">
            {expenseToEdit ? (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  deleteExpense(expenseToEdit.id);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបការចំណាយនេះ</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {expenseToEdit
                    ? 'រក្សាទុកការកែប្រែ'
                    : `កត់ត្រាការចំណាយ (${numAmountKhr.toLocaleString()} ៛)`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
