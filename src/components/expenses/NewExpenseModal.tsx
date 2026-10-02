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
  Camera,
  Bell,
  AlertCircle,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { Expense, ExpenseCategory, ExpenseType } from '../../types';
import { soundFx } from '../../utils/audio';
import { compressImageFile } from '../../utils/imageCompressor';
import { CameraCaptureModal } from '../common/CameraCaptureModal';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

interface CommonUnitItem {
  label: string;
  value: string;
  aliases?: string[];
}

const COMMON_UNITS: CommonUnitItem[] = [
  { label: 'ដង', value: 'ដង', aliases: ['ដង', 'ដង (times)', 'times'] },
  { label: 'ដប', value: 'ដប', aliases: ['ដប', 'ដប (bottle)', 'bottle'] },
  { label: 'ដើម', value: 'ដើម', aliases: ['ដើម', 'ដើម (loaf)', 'loaf', 'ដើម (Loaf/Stick)'] },
  { label: 'គ្រាប់ (គ្រាប)', value: 'គ្រាប់', aliases: ['គ្រាប់', 'គ្រាប', 'គ្រាប់ (eggs)', 'eggs', 'pcs'] },
  { label: 'លីត្រ (លិត្រ)', value: 'លីត្រ', aliases: ['លីត្រ', 'លិត្រ', 'លីត្រ (L)', 'liter', 'L'] },
  { label: 'គីឡូ (kg)', value: 'គីឡូ (kg)', aliases: ['គីឡូ', 'គីឡូ (kg)', 'kg'] },
  { label: 'ក្រាម (g)', value: 'ក្រាម (g)', aliases: ['ក្រាម', 'ក្រាម (g)', 'g'] },
  { label: 'កំប៉ុង (can)', value: 'កំប៉ុង', aliases: ['កំប៉ុង', 'កំប៉ុង (can)', 'can'] },
  { label: 'ប្រអប់ (box)', value: 'ប្រអប់', aliases: ['ប្រអប់', 'ប្រអប់ (box)', 'box'] },
  { label: 'កញ្ចប់ (pack)', value: 'កញ្ចប់', aliases: ['កញ្ចប់', 'កញ្ចប់ (pack)', 'pack'] },
  { label: 'បាវ (sack)', value: 'បាវ', aliases: ['បាវ', 'បាវ (sack)', 'sack'] },
  { label: 'ដុំ (pcs)', value: 'ដុំ', aliases: ['ដុំ', 'ដុំ (pcs)', 'pcs'] },
  { label: 'ឡូ (dozen)', value: 'ឡូ', aliases: ['ឡូ', 'ឡូ (dozen)', 'dozen'] },
  { label: 'ធុង (tub)', value: 'ធុង', aliases: ['ធុង', 'ធុង (can/tub)', 'tub'] },
  { label: 'ខែ (month)', value: 'ខែ', aliases: ['ខែ', 'ខែ (month)', 'month'] },
];

const ALL_SUGGESTED_UNITS = [
  'ដង',
  'ដប',
  'ដើម',
  'គ្រាប់',
  'គ្រាប',
  'លីត្រ',
  'លិត្រ',
  'គីឡូ',
  'គីឡូ (kg)',
  'ក្រាម',
  'ក្រាម (g)',
  'កំប៉ុង',
  'កំប៉ុង (can)',
  'ប្រអប់',
  'ប្រអប់ (box)',
  'កញ្ចប់',
  'កញ្ចប់ (pack)',
  'បាវ',
  'បាវ (sack)',
  'ដប (bottle)',
  'លីត្រ (L)',
  'គ្រាប់ (eggs)',
  'ដង (times)',
  'ដើម (loaf)',
  'ដុំ',
  'ដុំ (pcs)',
  'ឡូ',
  'ឡូ (dozen)',
  'ធុង',
  'ធុង (can/tub)',
  'ខែ',
  'ខែ (month)',
];

const QUICK_INGREDIENTS = [
  { label: '🥚 ស៊ុតមាន់ស្រស់កសិដ្ឋាន CP', unit: 'គ្រាប់ (eggs)', unitPriceKhr: 500, supplier: 'CP Cambodia' },
  { label: '🌾 ម្សៅខេកជប៉ុនពិសេស', unit: 'kg', unitPriceKhr: 5800, supplier: 'Khmer Food Supply Co.' },
  { label: '🧈 ប៊័រស្រស់បារាំង Elle & Vire', unit: 'kg', unitPriceKhr: 39000, supplier: 'Euro Gourmet' },
  { label: '🥛 ក្រែមស្រស់ Anchor Whipping Cream', unit: 'liter', unitPriceKhr: 19500, supplier: 'Fonterra Dairy' },
  { label: '🍫 សូកូឡាកាកាវ Callebaut 54.5%', unit: 'kg', unitPriceKhr: 58000, supplier: 'Euro Gourmet' },
  { label: '🍓 ផ្លែស្ត្រប៊ែរីស្រស់នាំចូល', unit: 'kg', unitPriceKhr: 49000, supplier: 'Royal Fresh Fruits' },
  { label: '🧀 ឈីស Philadelphia Cream Cheese', unit: 'kg', unitPriceKhr: 45000, supplier: 'Euro Gourmet' },
  { label: '🍯 ស្ករសម៉ត់ Caster Sugar', unit: 'kg', unitPriceKhr: 3800, supplier: 'Local Market' },
  { label: '🍵 ម្សៅតែបៃតង Uji Matcha', unit: 'kg', unitPriceKhr: 130000, supplier: 'Japan Direct' },
  { label: '🥥 ខ្ទិះដូងស្រស់', unit: 'kg', unitPriceKhr: 8000, supplier: 'ផ្សារដើមគ' },
];

const QUICK_GENERAL_EXPENSES = [
  { label: '⚡ អគ្គិសនី EDC (ភ្លើងឡ & ទូក្លាសេ)', cat: 'UTILITIES' as ExpenseCategory, unit: 'ខែ (month)', supplier: 'អគ្គិសនីកម្ពុជា EDC' },
  { label: '💧 ទឹកស្អាតរដ្ឋ (Water Bill)', cat: 'UTILITIES' as ExpenseCategory, unit: 'ខែ (month)', supplier: 'រដ្ឋាករទឹកស្វយ័ត' },
  { label: '🔥 ហ្គាសឡដុតនំ (Gas Refill 48kg)', cat: 'UTILITIES' as ExpenseCategory, unit: 'ធុង (48kg)', supplier: 'ហាងហ្គាស' },
  { label: '📦 ប្រអប់នំខេកកញ្ចក់ថ្លា & ខ្សែបូ', cat: 'PACKAGING' as ExpenseCategory, unit: 'ប្រអប់ (box)', supplier: 'Cambodia Packaging' },
  { label: '👤 ប្រាក់ខែបុគ្គលិក / ថ្លៃឈ្នួល', cat: 'SALARY' as ExpenseCategory, unit: 'ខែ (month)', supplier: 'បុគ្គលិកហាង' },
  { label: '🏠 ថ្លៃជួលទីតាំងហាងប្រចាំខែ', cat: 'RENT' as ExpenseCategory, unit: 'ខែ (month)', supplier: 'ម្ចាស់ផ្ទះ' },
  { label: '📢 ប៊ូសផេក Facebook / TikTok Ads', cat: 'MARKETING' as ExpenseCategory, unit: 'ដង', supplier: 'Meta / TikTok' },
  { label: '🔧 ជួសជុលឧបករណ៍ / ឡដុតនំ', cat: 'MAINTENANCE' as ExpenseCategory, unit: 'ដង', supplier: 'ជាងជួសជុល' },
  { label: '🧹 សម្ភារៈសម្អាត & អនាម័យហាង', cat: 'OTHER' as ExpenseCategory, unit: 'ឈុត', supplier: 'ផ្សារ' },
];

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const {
    lang,
    addExpense,
    updateExpense,
    deleteExpense,
    exchangeRate,
    currentStaff,
    staffMembers,
    ingredients,
    restockIngredient,
    reserveFund,
  } = useBakery();

  const [expenseType, setExpenseType] = useState<ExpenseType>('INGREDIENT');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [autoRestock, setAutoRestock] = useState<boolean>(true);
  const [supplier, setSupplier] = useState<string>('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('INGREDIENTS');
  
  // Detailed fields: ចំនួន ខ្នាត តម្លៃរាយ សរុប
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('គីឡូ (kg)');
  const [unitPriceKhr, setUnitPriceKhr] = useState('');
  const [amountKhr, setAmountKhr] = useState('');

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paidBy, setPaidBy] = useState(currentStaff?.name || 'មេការហាង (Manager)');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_USD' | 'CASH_KHR' | 'BANK_TRANSFER' | 'RESERVE_FUND'>('CASH_KHR');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('PAID');
  const [dueDate, setDueDate] = useState<string>('');
  const [remindBeforeDays, setRemindBeforeDays] = useState<number>(1);
  const [receiptImage, setReceiptImage] = useState('');
  const [notes, setNotes] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill fields when editing an existing expense
  useEffect(() => {
    if (expenseToEdit) {
      const type: ExpenseType =
        expenseToEdit.expenseType ||
        (expenseToEdit.category === 'INGREDIENTS' ? 'INGREDIENT' : 'GENERAL');
      setExpenseType(type);
      setSelectedIngredientId(expenseToEdit.ingredientId || '');
      setSupplier(expenseToEdit.supplier || '');
      setAutoRestock(false);
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
      setPaymentStatus(expenseToEdit.paymentStatus || 'PAID');
      setDueDate(expenseToEdit.dueDate || '');
      setRemindBeforeDays(expenseToEdit.remindBeforeDays ?? 1);
      setReceiptImage(expenseToEdit.receiptImage || '');
      setNotes(expenseToEdit.notes || '');
    } else {
      setExpenseType('INGREDIENT');
      setSelectedIngredientId('');
      setSupplier('');
      setAutoRestock(true);
      setTitle('');
      setCategory('INGREDIENTS');
      setQuantity('1');
      setUnit('គីឡូ (kg)');
      setUnitPriceKhr('');
      setAmountKhr('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaidBy(currentStaff?.name || 'មេការហាង (Manager)');
      setPaymentMethod('CASH_KHR');
      setPaymentStatus('PAID');
      setDueDate('');
      setRemindBeforeDays(1);
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

  const handleSelectInventoryIngredient = (ingId: string) => {
    setSelectedIngredientId(ingId);
    if (!ingId) return;
    const found = ingredients.find((i) => i.id === ingId);
    if (found) {
      soundFx.playPop();
      setTitle(found.nameKh);
      setUnit(found.unit);
      if (found.supplier) setSupplier(found.supplier);
      const estPriceKhr = found.costPerUnitKhr || Math.round(found.costPerUnitUsd * exchangeRate);
      if (estPriceKhr > 0) {
        setUnitPriceKhr(estPriceKhr.toString());
        const q = parseFloat(quantity) || 1;
        setAmountKhr(Math.round(q * estPriceKhr).toString());
      }
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
      expenseType,
      category: expenseType === 'INGREDIENT' ? 'INGREDIENTS' : category,
      ingredientId: expenseType === 'INGREDIENT' && selectedIngredientId ? selectedIngredientId : undefined,
      supplier: supplier.trim() || undefined,
      quantity: numQuantity,
      unit: unit.trim() || 'ដុំ',
      unitPriceKhr: numUnitPriceKhr > 0 ? numUnitPriceKhr : Math.round(numAmountKhr / numQuantity),
      unitPriceUsd: numUnitPriceUsd > 0 ? numUnitPriceUsd : Number((numAmountUsd / numQuantity).toFixed(2)),
      amountUsd: numAmountUsd,
      amountKhr: numAmountKhr,
      paidBy,
      paymentMethod,
      paymentStatus,
      dueDate: paymentStatus === 'UNPAID' ? (dueDate || date) : undefined,
      remindBeforeDays: paymentStatus === 'UNPAID' ? remindBeforeDays : undefined,
      paidAt: paymentStatus === 'PAID' ? (expenseToEdit?.paidAt || new Date().toISOString().slice(0, 10)) : undefined,
      receiptImage: receiptImage.trim() ? receiptImage : '',
      notes: notes.trim(),
      date,
    };

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, expensePayload);
    } else {
      addExpense(expensePayload);
      // Auto-restock ingredient in inventory if enabled
      if (expenseType === 'INGREDIENT' && selectedIngredientId && autoRestock && numQuantity > 0) {
        restockIngredient(selectedIngredientId, numQuantity);
      }
    }

    // Reset Form
    setTitle('');
    setSelectedIngredientId('');
    setSupplier('');
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
          {/* Main Segmented Toggle: 🥚 ចំណាយគ្រឿងផ្សំ vs 🏢 ចំណាយទូទៅ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              បែងចែកប្រភេទចំណាយ (Expense Category Type) *
            </label>
            <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 gap-1.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setExpenseType('INGREDIENT');
                  setCategory('INGREDIENTS');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  expenseType === 'INGREDIENT'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="text-base">🥚</span>
                <span>ចំណាយគ្រឿងផ្សំ (Ingredients)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setExpenseType('GENERAL');
                  if (category === 'INGREDIENTS') {
                    setCategory('UTILITIES');
                  }
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  expenseType === 'GENERAL'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="text-base">🏢</span>
                <span>ចំណាយទូទៅ (General / OPEX)</span>
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          {!expenseToEdit && (
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>
                  {expenseType === 'INGREDIENT'
                    ? 'គ្រឿងផ្សំញឹកញាប់ (ចុចបំពេញរហ័ស)៖'
                    : 'ចំណាយទូទៅញឹកញាប់ (ចុចបំពេញរហ័ស)៖'}
                </span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {expenseType === 'INGREDIENT'
                  ? QUICK_INGREDIENTS.map((qi, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setTitle(qi.label);
                          setUnit(qi.unit);
                          setUnitPriceKhr(qi.unitPriceKhr.toString());
                          if (qi.supplier) setSupplier(qi.supplier);
                          const q = parseFloat(quantity) || 1;
                          setAmountKhr(Math.round(q * qi.unitPriceKhr).toString());
                        }}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors cursor-pointer"
                      >
                        {qi.label}
                      </button>
                    ))
                  : QUICK_GENERAL_EXPENSES.map((qg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setTitle(qg.label);
                          setCategory(qg.cat);
                          setUnit(qg.unit);
                          if (qg.supplier) setSupplier(qg.supplier);
                        }}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/80 transition-colors cursor-pointer"
                      >
                        {qg.label}
                      </button>
                    ))}
              </div>
            </div>
          )}

          {/* INGREDIENT MODE: Link with Inventory Stock */}
          {expenseType === 'INGREDIENT' && ingredients.length > 0 && !expenseToEdit && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span>📦</span>
                  <span>ភ្ជាប់ជាមួយគ្រឿងផ្សំក្នុងស្តុក Inventory (ជម្រើសងាយស្រួល)៖</span>
                </span>
                {selectedIngredientId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIngredientId('');
                    }}
                    className="text-[10px] text-amber-700 hover:underline font-bold"
                  >
                    សម្អាតការភ្ជាប់
                  </button>
                )}
              </div>
              <select
                value={selectedIngredientId}
                onChange={(e) => handleSelectInventoryIngredient(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">-- ជ្រើសរើសគ្រឿងផ្សំក្នុងស្តុក ឬវាយបញ្ចូលឈ្មោះខាងក្រោម --</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.nameKh} (ស្តុកនៅសល់: {ing.currentStock} {ing.unit})
                  </option>
                ))}
              </select>

              {selectedIngredientId && (
                <label className="flex items-center gap-2 pt-1 text-xs font-bold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRestock}
                    onChange={(e) => setAutoRestock(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>
                    បញ្ចូលចំនួននេះបន្ថែមទៅក្នុងស្តុកគ្រឿងផ្សំ Inventory ដោយស្វ័យប្រវត្តិ (+{quantity} {unit})
                  </span>
                </label>
              )}
            </div>
          )}

          {/* Title, Category & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className={expenseType === 'INGREDIENT' ? 'sm:col-span-7' : 'sm:col-span-6'}>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                {expenseType === 'INGREDIENT' ? 'ឈ្មោះគ្រឿងផ្សំធ្វើនំ *' : 'បរិយាយមុខទំនិញ / ការចំណាយទូទៅ *'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  expenseType === 'INGREDIENT'
                    ? 'ឧ. ស៊ុតមាន់ស្រស់ CP, ម្សៅខេកជប៉ុន, ប៊័របារាំង...'
                    : 'ឧ. វិក្កយបត្រភ្លើង EDC, ទឹកស្អាត, ប្រអប់នំខេក...'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-bold text-slate-800"
              />
            </div>

            {expenseType === 'GENERAL' ? (
              <div className="sm:col-span-6">
                <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                  ប្រភេទចំណាយទូទៅ *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold text-slate-800"
                >
                  <option value="UTILITIES">⚡ ទឹក ភ្លើង ហ្គាស (Utilities)</option>
                  <option value="SALARY">👤 ប្រាក់ខែ & ថ្លៃឈ្នួល (Salary)</option>
                  <option value="RENT">🏠 ថ្លៃជួលទីតាំង (Rent)</option>
                  <option value="PACKAGING">📦 ប្រអប់ & វេចខ្ចប់ (Packaging)</option>
                  <option value="MAINTENANCE">🔧 ជួសជុលឧបករណ៍ / ថែទាំ</option>
                  <option value="MARKETING">📢 ផ្សព្វផ្សាយ / Boost Ads</option>
                  <option value="OTHER">📌 ផ្សេងៗ (Other)</option>
                </select>
              </div>
            ) : (
              <div className="sm:col-span-5">
                <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                  ហាង / អ្នកផ្គត់ផ្គង់ (Supplier)
                </label>
                <input
                  type="text"
                  placeholder="ឧ. CP Cambodia, Euro Gourmet, ផ្សារ..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold text-slate-800"
                />
              </div>
            )}
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
                  placeholder="គីឡូ, ដប, ដើម, គ្រាប់, លីត្រ..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <datalist id="common-units-list">
                  {ALL_SUGGESTED_UNITS.map((u, i) => (
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
              <span className="text-[10px] text-slate-400 font-bold shrink-0">ខ្នាតទូទៅ៖</span>
              {COMMON_UNITS.map((u, i) => {
                const isSelected = unit === u.value || u.aliases?.includes(unit);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setUnit(u.value);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-2xs font-black ring-1 ring-rose-400'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    {u.label}
                  </button>
                );
              })}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CASH_KHR', label: 'សាច់ប្រាក់ (៛ KHR)' },
                { id: 'BANK_TRANSFER', label: 'ផ្ទេរធនាគារ / ABA' },
                { id: 'CASH_USD', label: 'សាច់ប្រាក់ ($ USD)' },
                { id: 'RESERVE_FUND', label: '🏦 ដកពីទុនបម្រុង' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`py-2 px-2 text-xs rounded-xl font-bold border transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? m.id === 'RESERVE_FUND'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs ring-1 ring-emerald-400/30'
                        : 'bg-rose-50 border-rose-500 text-rose-700 shadow-2xs ring-1 ring-rose-400/30'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'RESERVE_FUND' && (
              <div className="mt-2.5 p-3 bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200">
                <span className="text-base">🏦</span>
                <div>
                  <div className="font-bold">
                    ទុនបម្រុងបច្ចុប្បន្ន៖ {reserveFund.currentBalanceKhr.toLocaleString()} ៛ (${reserveFund.currentBalanceUsd.toFixed(2)})
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    ប្រព័ន្ធនឹងកាត់ចេញពីទុនបម្រុងដោយស្វ័យប្រវត្ត។ នៅពេលដកចំណាយរួច អ្នកអាចបូកបង្គ្រប់ត្រឡប់ទៅទុនបម្រុងវិញគ្រប់ចំនួនគោលដៅ ({reserveFund.targetAmountKhr.toLocaleString()} ៛)។
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Status & Due Date (ស្ថានភាពបង់ប្រាក់ & ថ្ងៃផុតកំណត់) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>ស្ថានភាពទូទាត់ប្រាក់ (Payment Status)</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  ជ្រើសរើស «មិនទាន់បង់» ប្រសិនជាត្រូវបង់នៅថ្ងៃក្រោយ ដើម្បីឱ្យប្រព័ន្ធដាស់តឿន
                </p>
              </div>

              <div className="inline-flex p-0.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPaymentStatus('PAID');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentStatus === 'PAID'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✅ បង់រួចរាល់ (Paid)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPaymentStatus('UNPAID');
                    if (!dueDate) {
                      const d = new Date();
                      d.setDate(d.getDate() + 3);
                      setDueDate(d.toISOString().slice(0, 10));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentStatus === 'UNPAID'
                      ? 'bg-amber-500 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⏳ មិនទាន់បង់ / ជំពាក់ (Pay Later)
                </button>
              </div>
            </div>

            {paymentStatus === 'UNPAID' && (
              <div className="pt-2.5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>កាលបរិច្ឆេទផុតកំណត់បង់ប្រាក់ (Due Date) *</span>
                  </label>
                  <input
                    type="date"
                    required={paymentStatus === 'UNPAID'}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-amber-300 rounded-xl bg-amber-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {[
                      { label: 'ថ្ងៃនេះ', days: 0 },
                      { label: 'ស្អែក', days: 1 },
                      { label: '៣ ថ្ងៃទៀត', days: 3 },
                      { label: '៧ ថ្ងៃទៀត', days: 7 },
                      { label: 'ចុងខែនេះ', endOfMonth: true },
                    ].map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          const d = new Date();
                          if (opt.endOfMonth) {
                            const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                            setDueDate(lastDay.toISOString().slice(0, 10));
                          } else {
                            d.setDate(d.getDate() + (opt.days || 0));
                            setDueDate(d.toISOString().slice(0, 10));
                          }
                        }}
                        className="px-1.5 py-0.5 text-[9px] font-bold bg-white hover:bg-amber-100 text-amber-800 rounded border border-amber-200 cursor-pointer shadow-2xs"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>រំលឹកសារដាស់តឿនជាមុន (Notification Alert)</span>
                  </label>
                  <select
                    value={remindBeforeDays}
                    onChange={(e) => setRemindBeforeDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value={0}>📢 រំលឹកចំថ្ងៃផុតកំណត់ (On Due Date)</option>
                    <option value={1}>🔔 រំលឹកមុន ១ ថ្ងៃ (1 Day Before - ណែនាំ)</option>
                    <option value={2}>🔔 រំលឹកមុន ២ ថ្ងៃ (2 Days Before)</option>
                    <option value={3}>🔔 រំលឹកមុន ៣ ថ្ងៃ (3 Days Before)</option>
                    <option value={7}>🔔 រំលឹកមុន ១ សប្តាហ៍ (1 Week Before)</option>
                  </select>
                  <p className="text-[10px] text-amber-700 mt-1">
                    ⚡ ប្រព័ន្ធនឹងផ្ញើសារដាស់តឿនលើអេក្រង់ទូរសព្ទ និង Telegram ស្វ័យប្រវត្តិ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Receipt Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                រូបភាពវិក្កយបត្រ / បង្កាន់ដៃទិញ (Receipt Photo)
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
                  <span>📸 ថតបង្កាន់ដៃ</span>
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

            <div className="w-full h-28 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/50 transition-all cursor-pointer flex items-center justify-center overflow-hidden relative group">
              {receiptImage ? (
                <>
                  <img
                    src={receiptImage}
                    alt="Receipt preview"
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
                      <span>ថតថ្មី</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1 cursor-pointer"
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
                    <span className="text-xs font-black text-purple-900">ថតបង្កាន់ដៃពីកាម៉េរ៉ា</span>
                    <span className="text-[10px] text-purple-600/80">ថតវិក្កយបត្រជាក់ស្តែង</span>
                  </div>

                  <div className="w-[1px] h-10 bg-rose-200" />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-rose-100/60 transition-colors"
                  >
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-xl mb-1">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Upload ពី File</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, PDF</span>
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

      {/* Live Camera Modal for Expense Receipt */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setReceiptImage(img);
        }}
        title="ថតរូបវិក្កយបត្រ / បង្កាន់ដៃទិញ (Receipt)"
        subtitle="ថតរូបបង្កាន់ដៃចំណាយជាក់ស្តែងដើម្បីកត់ត្រាទុកជាភស្តុតាង"
      />
    </div>
  );
};
