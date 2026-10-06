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
  Camera,
  Bell,
  AlertCircle,
  Clock,
  Boxes,
  Percent,
  Check,
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
  onOpenScanner?: () => void;
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

const QUICK_SUPPLIES = [
  { label: '📦 ប្រអប់នំខេកកញ្ចក់ថ្លា 8-Inch', cat: 'PACKAGING' as ExpenseCategory, unit: 'ប្រអប់ (box)', unitPriceKhr: 3500, supplier: 'Cambodia Packaging' },
  { label: '🎂 ស្លាក Topper រីករាយថ្ងៃខួបកំណើត', cat: 'SUPPLIES' as ExpenseCategory, unit: 'ដុំ (pcs)', unitPriceKhr: 1500, supplier: 'Party Supplies' },
  { label: '🕯️ ទៀនខួបកំណើតពណ៌មាស Spiral', cat: 'SUPPLIES' as ExpenseCategory, unit: 'កញ្ចប់ (pack)', unitPriceKhr: 2000, supplier: 'Party Supplies' },
  { label: '🎀 ខ្សែបូចងប្រអប់នំ Satin Ribbon', cat: 'PACKAGING' as ExpenseCategory, unit: 'ដុំ (pcs)', unitPriceKhr: 6000, supplier: 'ផ្សារអូឡាំពិក' },
  { label: '🔪 កាំបិតកាត់នំ & សមជ័រអនាម័យ', cat: 'SUPPLIES' as ExpenseCategory, unit: 'ឈុត', unitPriceKhr: 800, supplier: 'Cambodia Packaging' },
  { label: '🛍️ ថង់យួរក្រដាសកាតុងពិសេស', cat: 'PACKAGING' as ExpenseCategory, unit: 'ដុំ (pcs)', unitPriceKhr: 2000, supplier: 'Khmer Packaging' },
  { label: '📜 ក្រដាសទ្រាប់នំ Baking Paper', cat: 'SUPPLIES' as ExpenseCategory, unit: 'ដុំ (pcs)', unitPriceKhr: 8000, supplier: 'Euro Gourmet' },
  { label: '🧁 កែវ & ពុម្ពក្រដាស Cupcake', cat: 'PACKAGING' as ExpenseCategory, unit: 'កញ្ចប់ (pack)', unitPriceKhr: 4500, supplier: 'Bakery Supplies' },
  { label: '☕ កែវកាហ្វេ & បំពង់បឺតអនាម័យ', cat: 'SUPPLIES' as ExpenseCategory, unit: 'កញ្ចប់ (pack)', unitPriceKhr: 12000, supplier: 'Eco Supplies' },
];

const QUICK_GENERAL_EXPENSES = [
  { label: '⚡ អគ្គិសនី EDC (ភ្លើងឡ & ទូក្លាសេ)', cat: 'UTILITIES' as ExpenseCategory, unit: 'ខែ (month)', supplier: 'អគ្គិសនីកម្ពុជា EDC' },
  { label: '💧 ទឹកស្អាតរដ្ឋ (Water Bill)', cat: 'UTILITIES' as ExpenseCategory, unit: 'ខែ (month)', supplier: 'រដ្ឋាករទឹកស្វយ័ត' },
  { label: '🔥 ហ្គាសឡដុតនំ (Gas Refill 48kg)', cat: 'UTILITIES' as ExpenseCategory, unit: 'ធុង (48kg)', supplier: 'ហាងហ្គាស' },
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
  onOpenScanner,
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
  const [paymentMethod, setPaymentMethod] = useState<'CASH_USD' | 'CASH_KHR' | 'BANK_TRANSFER' | 'RESERVE_FUND'>('RESERVE_FUND');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('PAID');
  const [dueDate, setDueDate] = useState<string>('');
  const [remindBeforeDays, setRemindBeforeDays] = useState<number>(1);
  const [receiptImage, setReceiptImage] = useState('');
  const [notes, setNotes] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Wholesale to Retail Auto-Calculator state (គណនាទិញដុំ -> លក់រាយ)
  const [isWholesaleCalcOpen, setIsWholesaleCalcOpen] = useState(false);
  const [wholesalePacks, setWholesalePacks] = useState('1'); // ចំនួនដុំធំ/កេស
  const [wholesalePackUnit, setWholesalePackUnit] = useState('កេស (case)');
  const [itemsPerPack, setItemsPerPack] = useState('24'); // ចំនួនរាយក្នុង ១ ដុំធំ
  const [retailUnit, setRetailUnit] = useState('ដុំ (pcs)');
  const [profitMarginPct, setProfitMarginPct] = useState('30'); // ភាគរយចំណេញ % (default 30%)
  const [retailRoundingMode, setRetailRoundingMode] = useState<'100' | '500' | '1000' | 'none'>('100');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill fields when editing an existing expense
  useEffect(() => {
    if (expenseToEdit) {
      const type: ExpenseType =
        expenseToEdit.expenseType ||
        (expenseToEdit.category === 'INGREDIENTS'
          ? 'INGREDIENT'
          : expenseToEdit.category === 'PACKAGING' || expenseToEdit.category === 'SUPPLIES'
          ? 'SUPPLY'
          : 'GENERAL');
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

      // Pre-fill wholesale calculation if previously configured
      setIsWholesaleCalcOpen(!!expenseToEdit.retailSellingPriceKhr);
      setWholesalePacks('1');
      setWholesalePackUnit(expenseToEdit.wholesalePackUnit || 'កេស (case)');
      setItemsPerPack(expenseToEdit.wholesalePackQty ? String(expenseToEdit.wholesalePackQty) : '24');
      setRetailUnit(expenseToEdit.retailUnit || 'ដុំ (pcs)');
      setProfitMarginPct(expenseToEdit.retailProfitMarginPct ? String(expenseToEdit.retailProfitMarginPct) : '30');
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
      setPaymentMethod('RESERVE_FUND');
      setPaymentStatus('PAID');
      setDueDate('');
      setRemindBeforeDays(1);
      setReceiptImage('');
      setNotes('');

      // Reset wholesale calculator
      setIsWholesaleCalcOpen(false);
      setWholesalePacks('1');
      setWholesalePackUnit('កេស (case)');
      setItemsPerPack('24');
      setRetailUnit('ដុំ (pcs)');
      setProfitMarginPct('30');
      setRetailRoundingMode('100');
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

  const numQuantity = parseFloat(quantity) || 1;
  const numUnitPriceKhr = parseFloat(unitPriceKhr) || 0;
  const numUnitPriceUsd = Number((numUnitPriceKhr / exchangeRate).toFixed(2));
  const numAmountKhr = parseInt(amountKhr, 10) || Math.round(numQuantity * numUnitPriceKhr);
  const numAmountUsd = Number((numAmountKhr / exchangeRate).toFixed(2));

  // Wholesale to Retail dynamic calculations
  const numWholesalePacks = Math.max(1, parseFloat(wholesalePacks) || 1);
  const numItemsPerPack = Math.max(1, parseFloat(itemsPerPack) || 1);
  const totalRetailItems = Math.max(1, Math.round(numWholesalePacks * numItemsPerPack));

  const wholesaleTotalKhr = parseInt(amountKhr, 10) || Math.round(numQuantity * numUnitPriceKhr) || 0;
  const retailUnitCostKhr = wholesaleTotalKhr > 0 && totalRetailItems > 0 ? Math.round(wholesaleTotalKhr / totalRetailItems) : 0;
  const retailUnitCostUsd = Number((retailUnitCostKhr / exchangeRate).toFixed(2));

  const marginPct = parseFloat(profitMarginPct) || 0;
  const rawSellingPriceKhr = retailUnitCostKhr * (1 + marginPct / 100);

  const calcRoundedSellingPrice = (raw: number, mode: '100' | '500' | '1000' | 'none') => {
    if (raw <= 0) return 0;
    if (mode === 'none') return Math.round(raw);
    const step = parseInt(mode, 10) || 100;
    return Math.ceil(raw / step) * step;
  };

  const retailSellingPriceKhr = calcRoundedSellingPrice(rawSellingPriceKhr, retailRoundingMode);
  const retailSellingPriceUsd = Number((retailSellingPriceKhr / exchangeRate).toFixed(2));

  const profitPerItemKhr = Math.max(0, retailSellingPriceKhr - retailUnitCostKhr);
  const totalExpectedProfitKhr = profitPerItemKhr * totalRetailItems;

  const handleApplyRetailUnits = () => {
    soundFx.playSuccess();
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setQuantity(totalRetailItems.toString());
    setUnit(retailUnit);
    setUnitPriceKhr(retailUnitCostKhr.toString());
    setAmountKhr(wholesaleTotalKhr.toString());
    const retailNote = `💡 [ទិញដុំ ${numWholesalePacks} ${wholesalePackUnit} (${totalRetailItems} ${retailUnit}) | ថ្លៃដើមរាយ ${retailUnitCostKhr.toLocaleString()} ៛ | តម្លៃលក់រាយណែនាំ ${retailSellingPriceKhr.toLocaleString()} ៛ (+${marginPct}%)]`;
    if (!notes.includes('តម្លៃលក់រាយណែនាំ')) {
      setNotes(notes ? `${notes}\n${retailNote}` : retailNote);
    }
  };

  const handleApplyWholesaleUnits = () => {
    soundFx.playSuccess();
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setQuantity(numWholesalePacks.toString());
    setUnit(wholesalePackUnit);
    const unitPriceWholesale = Math.round(wholesaleTotalKhr / numWholesalePacks);
    setUnitPriceKhr(unitPriceWholesale.toString());
    setAmountKhr(wholesaleTotalKhr.toString());
    const retailNote = `💡 [ទិញដុំ ${numWholesalePacks} ${wholesalePackUnit} (${totalRetailItems} ${retailUnit}) | ថ្លៃដើមរាយ ${retailUnitCostKhr.toLocaleString()} ៛ | តម្លៃលក់រាយណែនាំ ${retailSellingPriceKhr.toLocaleString()} ៛ (+${marginPct}%)]`;
    if (!notes.includes('តម្លៃលក់រាយណែនាំ')) {
      setNotes(notes ? `${notes}\n${retailNote}` : retailNote);
    }
  };

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

    let finalCategory: ExpenseCategory = category;
    if (expenseType === 'INGREDIENT') {
      finalCategory = 'INGREDIENTS';
    } else if (expenseType === 'SUPPLY') {
      finalCategory = (category === 'SUPPLIES' || category === 'PACKAGING' || category === 'MAINTENANCE') ? category : 'PACKAGING';
    }

    const expensePayload: Omit<Expense, 'id' | 'createdAt'> = {
      title: title.trim(),
      expenseType,
      category: finalCategory,
      ingredientId: expenseType === 'INGREDIENT' && selectedIngredientId ? selectedIngredientId : undefined,
      supplier: supplier.trim() || undefined,
      quantity: numQuantity,
      unit: unit.trim() || 'ដុំ',
      unitPriceKhr: numUnitPriceKhr > 0 ? numUnitPriceKhr : Math.round(numAmountKhr / numQuantity),
      unitPriceUsd: numUnitPriceUsd > 0 ? numUnitPriceUsd : Number((numAmountUsd / numQuantity).toFixed(2)),
      amountUsd: numAmountUsd,
      amountKhr: numAmountKhr,
      // Wholesale to retail metadata
      wholesalePackQty: isWholesaleCalcOpen ? numItemsPerPack : undefined,
      wholesalePackUnit: isWholesaleCalcOpen ? wholesalePackUnit : undefined,
      retailUnit: isWholesaleCalcOpen ? retailUnit : undefined,
      retailUnitCostKhr: isWholesaleCalcOpen && retailUnitCostKhr > 0 ? retailUnitCostKhr : undefined,
      retailProfitMarginPct: isWholesaleCalcOpen && marginPct > 0 ? marginPct : undefined,
      retailSellingPriceKhr: isWholesaleCalcOpen && retailSellingPriceKhr > 0 ? retailSellingPriceKhr : undefined,
      retailSellingPriceUsd: isWholesaleCalcOpen && retailSellingPriceUsd > 0 ? retailSellingPriceUsd : undefined,
      paidBy,
      paymentMethod,
      paymentStatus,
      dueDate: dueDate.trim() ? dueDate : undefined,
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
          {/* AI Invoice Scanner Prompt Banner */}
          {onOpenScanner && !expenseToEdit && (
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <span>មានវិក្កយបត្រក្រដាសមែនទេ?</span>
                    <span className="text-[9px] bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded font-bold">
                      AI OCR
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ស្កេនរូបភាពដើម្បីបំបែកមុខទំនិញ គណនាតម្លៃដើម និងបញ្ចូលស្វ័យប្រវត្តិ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onClose();
                  onOpenScanner();
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span>ស្កេនរូប</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          )}

          {/* Main Segmented Toggle: 🌾 ចំណាយគ្រឿងផ្សំ vs 📦 ទិញសម្ភារៈ vs 🏢 ចំណាយទូទៅ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              បែងចែកប្រភេទចំណាយ (Expense Category Type) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 gap-1.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setExpenseType('INGREDIENT');
                  setCategory('INGREDIENTS');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  expenseType === 'INGREDIENT'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="text-base">🌾</span>
                <span>ទិញគ្រឿងផ្សំ (Ingredients)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setExpenseType('SUPPLY');
                  setCategory('PACKAGING');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  expenseType === 'SUPPLY'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="text-base">📦</span>
                <span>ទិញសម្ភារៈ (Supplies)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setExpenseType('GENERAL');
                  if (category === 'INGREDIENTS' || category === 'PACKAGING' || category === 'SUPPLIES') {
                    setCategory('UTILITIES');
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  expenseType === 'GENERAL'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="text-base">🏢</span>
                <span>ចំណាយទូទៅ (General OPEX)</span>
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
                    : expenseType === 'SUPPLY'
                    ? 'សម្ភារៈ & ប្រអប់ញឹកញាប់ (ចុចបំពេញរហ័ស)៖'
                    : 'ចំណាយទូទៅញឹកញាប់ (ចុចបំពេញរហ័ស)៖'}
                </span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {expenseType === 'INGREDIENT' &&
                  QUICK_INGREDIENTS.map((qi, idx) => (
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
                  ))}
                {expenseType === 'SUPPLY' &&
                  QUICK_SUPPLIES.map((qs, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setTitle(qs.label);
                        setCategory(qs.cat);
                        setUnit(qs.unit);
                        setUnitPriceKhr(qs.unitPriceKhr.toString());
                        if (qs.supplier) setSupplier(qs.supplier);
                        const q = parseFloat(quantity) || 1;
                        setAmountKhr(Math.round(q * qs.unitPriceKhr).toString());
                      }}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 transition-colors cursor-pointer"
                    >
                      {qs.label}
                    </button>
                  ))}
                {expenseType === 'GENERAL' &&
                  QUICK_GENERAL_EXPENSES.map((qg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setTitle(qg.label);
                        setCategory(qg.cat);
                        setUnit(qg.unit);
                        if (qg.supplier) setSupplier(qg.supplier);
                        if (!dueDate) {
                          const d = new Date();
                          const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                          setDueDate(lastDay.toISOString().slice(0, 10));
                        }
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
                  <span>🌾</span>
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
            <div className={expenseType === 'INGREDIENT' ? 'sm:col-span-7' : 'sm:col-span-5'}>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                {expenseType === 'INGREDIENT'
                  ? 'ឈ្មោះគ្រឿងផ្សំធ្វើនំ *'
                  : expenseType === 'SUPPLY'
                  ? 'ឈ្មោះសម្ភារៈ / ប្រអប់ / ប្រដាប់ប្រដា *'
                  : 'បរិយាយការចំណាយទូទៅ *'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  expenseType === 'INGREDIENT'
                    ? 'ឧ. ស៊ុតមាន់ស្រស់ CP, ម្សៅខេកជប៉ុន, ប៊័របារាំង...'
                    : expenseType === 'SUPPLY'
                    ? 'ឧ. ប្រអប់នំខេកកញ្ចក់ថ្លា, ទៀនខួបកំណើត, ស្លាក Topper...'
                    : 'ឧ. វិក្កយបត្រភ្លើង EDC, ទឹកស្អាត, ថ្លៃជួលទីតាំង...'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-bold text-slate-800"
              />
            </div>

            {expenseType === 'SUPPLY' && (
              <div className="sm:col-span-4">
                <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                  ប្រភេទសម្ភារៈ *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-800"
                >
                  <option value="PACKAGING">📦 ប្រអប់ & វេចខ្ចប់ (Packaging)</option>
                  <option value="SUPPLIES">🎀 សម្ភារៈតុបតែង & ប្រដាប់ប្រដា (Supplies)</option>
                  <option value="MAINTENANCE">🔪 ឧបករណ៍ធ្វើនំ / ពុម្ព / ថាស (Utensils)</option>
                  <option value="OTHER">📌 សម្ភារៈផ្សេងៗ (Other)</option>
                </select>
              </div>
            )}

            {expenseType === 'GENERAL' && (
              <div className="sm:col-span-4">
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
                  <option value="MAINTENANCE">🔧 ជួសជុលឧបករណ៍ / ថែទាំ</option>
                  <option value="MARKETING">📢 ផ្សព្វផ្សាយ / Boost Ads</option>
                  <option value="OTHER">📌 ផ្សេងៗ (Other)</option>
                </select>
              </div>
            )}

            <div className={expenseType === 'INGREDIENT' ? 'sm:col-span-5' : 'sm:col-span-3'}>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                {expenseType === 'INGREDIENT' ? 'ហាង / អ្នកផ្គត់ផ្គង់' : 'ហាង / ក្រុមហ៊ុន'}
              </label>
              <input
                type="text"
                placeholder={expenseType === 'INGREDIENT' ? 'ឧ. CP, Euro Gourmet...' : 'ឧ. Cambodia Packaging, ផ្សារ...'}
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold text-slate-800"
              />
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
                    onBlur={() => {
                      if (amountKhr) {
                        const num = parseFloat(amountKhr);
                        if (!isNaN(num)) {
                          // បង្គត់ធម្មតាជាចំនួនគត់រៀល (Normal integer rounding)
                          setAmountKhr(Math.round(num).toString());
                        }
                      }
                    }}
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
                </div>
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

          {/* Wholesale Bulk to Retail Selling Price Auto-Calculator */}
          <div className="rounded-2xl border border-purple-200/90 bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-pink-50/30 overflow-hidden shadow-2xs transition-all">
            <div
              onClick={() => {
                soundFx.playPop();
                setIsWholesaleCalcOpen(!isWholesaleCalcOpen);
              }}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-purple-100/40 transition-colors select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-xs">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-800">
                      🧮 គណនាតម្លៃទិញដុំ & តម្លៃលក់រាយស្វ័យប្រវត្តិ (Wholesale to Retail Auto-Calculator)
                    </span>
                    <span className="text-[10px] font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                      ✨ Auto-Price
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ទិញចូលគិតជាកេស/ឡូ/បាវ ចែកចេញជាថ្លៃដើមរាយ និងគណនាតម្លៃលក់រាយចំណេញស្វ័យប្រវត្តិ
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-2.5 py-1 text-xs font-bold text-purple-700 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors shrink-0"
              >
                {isWholesaleCalcOpen ? '▲ បង្រួម' : '▼ បើកគណនា'}
              </button>
            </div>

            {isWholesaleCalcOpen && (
              <div className="p-4 pt-1 border-t border-purple-100 space-y-3.5">
                {/* Step 1: Pack Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ចំនួនដុំធំ/កេស (Bulk Qty)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={wholesalePacks}
                      onChange={(e) => setWholesalePacks(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-black text-slate-800 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ខ្នាតទិញដុំ (Bulk Unit)
                    </label>
                    <input
                      type="text"
                      list="bulk-pack-units"
                      value={wholesalePackUnit}
                      onChange={(e) => setWholesalePackUnit(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <datalist id="bulk-pack-units">
                      <option value="កេស (case)" />
                      <option value="ឡូ (dozen)" />
                      <option value="បាវ (sack)" />
                      <option value="ប្រអប់ធំ (big box)" />
                      <option value="ធុង (carton)" />
                      <option value="កញ្ចប់ធំ (pack)" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ចំនួនរាយក្នុង ១ ដុំធំ
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="24"
                      value={itemsPerPack}
                      onChange={(e) => setItemsPerPack(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-black text-purple-700 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <div className="flex gap-1 mt-1">
                      {['12', '20', '24', '50', '100'].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setItemsPerPack(n)}
                          className="px-1.5 py-0.5 text-[9px] font-bold bg-white text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ខ្នាតរាយ (Retail Unit)
                    </label>
                    <input
                      type="text"
                      list="retail-units-list"
                      value={retailUnit}
                      onChange={(e) => setRetailUnit(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <datalist id="retail-units-list">
                      <option value="ដុំ (pcs)" />
                      <option value="ប្រអប់ (box)" />
                      <option value="គីឡូ (kg)" />
                      <option value="កំប៉ុង (can)" />
                      <option value="ដើម (stick)" />
                      <option value="កញ្ចប់ (pack)" />
                      <option value="កែវ (cup)" />
                    </datalist>
                  </div>
                </div>

                {/* Step 2: Desired Profit Margin % */}
                <div className="p-3 bg-white/90 rounded-2xl border border-purple-200/80 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-purple-600" />
                      <span>ភាគរយប្រាក់ចំណេញចង់បាន (Profit Markup)៖</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['20', '30', '40', '50', '70', '100'].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setProfitMarginPct(pct);
                          }}
                          className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            profitMarginPct === pct
                              ? 'bg-purple-600 text-white shadow-2xs font-black'
                              : 'bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-900'
                          }`}
                        >
                          +{pct}%
                        </button>
                      ))}
                      <div className="relative w-20">
                        <input
                          type="number"
                          step="5"
                          min="0"
                          value={profitMarginPct}
                          onChange={(e) => setProfitMarginPct(e.target.value)}
                          className="w-full pl-2 pr-5 py-0.5 text-xs font-black text-purple-700 border border-purple-300 rounded-lg text-right"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-purple-500 font-bold">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500 flex-wrap gap-1">
                    <span>ការបង្គត់តម្លៃលក់៖</span>
                    <div className="flex items-center gap-1">
                      {[
                        { label: '✨ បង្គត់ 100៛', value: '100' },
                        { label: '500៛', value: '500' },
                        { label: '1,000៛', value: '1000' },
                        { label: 'មិនបង្គត់', value: 'none' },
                      ].map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRetailRoundingMode(r.value as any)}
                          className={`px-2 py-0.5 text-[10px] rounded-md font-bold transition-all cursor-pointer ${
                            retailRoundingMode === r.value
                              ? 'bg-purple-600 text-white font-black'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 3: Crystal Clear Calculation Result Box */}
                <div className="p-3.5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl shadow-md space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xs">
                      <div className="text-[10px] text-purple-200 font-medium">ចំនួនរាយសរុប</div>
                      <div className="text-base font-black font-sans">
                        {totalRetailItems.toLocaleString()} <span className="text-xs font-normal opacity-80">{retailUnit}</span>
                      </div>
                    </div>

                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xs">
                      <div className="text-[10px] text-purple-200 font-medium">ថ្លៃដើមរាយ (Unit Cost)</div>
                      <div className="text-base font-black font-sans">
                        {retailUnitCostKhr.toLocaleString()} ៛
                      </div>
                      <div className="text-[9px] text-purple-200 font-sans">~ ${retailUnitCostUsd.toFixed(2)}</div>
                    </div>

                    <div className="bg-white/25 p-2 rounded-xl border border-white/30 shadow-xs">
                      <div className="text-[10px] text-amber-200 font-black">🎯 តម្លៃលក់រាយណែនាំ</div>
                      <div className="text-lg font-black text-amber-300 font-sans">
                        {retailSellingPriceKhr.toLocaleString()} ៛
                      </div>
                      <div className="text-[9px] text-white/90 font-sans">~ ${retailSellingPriceUsd.toFixed(2)}</div>
                    </div>

                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xs">
                      <div className="text-[10px] text-emerald-200 font-medium">ចំណេញក្នុង ១ {retailUnit}</div>
                      <div className="text-base font-black text-emerald-300 font-sans">
                        +{profitPerItemKhr.toLocaleString()} ៛
                      </div>
                      <div className="text-[9px] text-emerald-200 font-sans">+{marginPct}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/20 text-xs text-purple-100 flex-wrap gap-1">
                    <span>
                      ចំណេញសរុបបើលក់អស់៖ <strong className="text-emerald-300 font-sans font-black">+{totalExpectedProfitKhr.toLocaleString()} ៛</strong>
                    </span>
                    <span className="text-[10px] opacity-80 font-sans">
                      (ថ្លៃទិញសរុប {wholesaleTotalKhr.toLocaleString()} ៛)
                    </span>
                  </div>
                </div>

                {/* Step 4: Apply Buttons */}
                <div className="flex items-center justify-end gap-2 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={handleApplyRetailUnits}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    title="ប្តូរបរិមាណក្នុងវិក្កយបត្រជាខ្នាតរាយ (ឧ. 24 ដុំ @ 2,500៛)"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>✓ អនុវត្តជាខ្នាតរាយ ({totalRetailItems} {retailUnit} @ {retailUnitCostKhr.toLocaleString()} ៛)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyWholesaleUnits}
                    className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 rounded-xl text-xs font-black shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    title="រក្សាទុកបរិមាណជាខ្នាតដុំធំ (ឧ. 1 កេស @ 60,000៛) និងរក្សាទុកតម្លៃលក់រាយ"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>✓ អនុវត្តជាខ្នាតដុំ ({numWholesalePacks} {wholesalePackUnit})</span>
                  </button>
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">វិធីសាស្ត្រទូទាត់ប្រាក់ (Payment Method)</label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                paymentMethod === 'RESERVE_FUND'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {paymentMethod === 'RESERVE_FUND' ? '⚡ នឹងកាត់ចេញពីទុនបម្រុងហាង' : 'មិនកាត់ពីទុនបម្រុង'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'RESERVE_FUND', label: '🏦 ដកពីទុនបម្រុង', sub: 'Petty Cash' },
                { id: 'CASH_KHR', label: '💵 សាច់ប្រាក់ (៛)', sub: 'Cash KHR' },
                { id: 'BANK_TRANSFER', label: '📱 ផ្ទេរធនាគារ', sub: 'ABA / Bakong' },
                { id: 'CASH_USD', label: '💵 សាច់ប្រាក់ ($)', sub: 'Cash USD' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setPaymentMethod(m.id as any);
                  }}
                  className={`py-2 px-2 text-xs rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    paymentMethod === m.id
                      ? m.id === 'RESERVE_FUND'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                        : 'bg-rose-50 border-rose-500 text-rose-700 shadow-2xs ring-1 ring-rose-400/30'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-black">{m.label}</span>
                  <span className={`text-[9px] ${paymentMethod === m.id && m.id === 'RESERVE_FUND' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {m.sub}
                  </span>
                </button>
              ))}
            </div>

            {paymentMethod === 'RESERVE_FUND' && (
              <div className="mt-2.5 p-3.5 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-2 border-emerald-300 rounded-2xl text-xs space-y-2 text-emerald-950 shadow-sm animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏦</span>
                    <span className="font-black text-emerald-900 text-sm">ដកចេញពីទុនបម្រុងហាង (Petty Cash)</span>
                  </div>
                  <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    ✓ កាត់ស្វ័យប្រវត្តិ
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200/80 text-center">
                  <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-bold">ទុនបច្ចុប្បន្ន</div>
                    <div className="font-black text-slate-800 text-xs sm:text-sm font-sans">
                      {reserveFund.currentBalanceKhr.toLocaleString()} ៛
                    </div>
                  </div>
                  <div className="bg-rose-50/95 p-2 rounded-xl border border-rose-200 shadow-2xs">
                    <div className="text-[10px] text-rose-600 font-bold">កាត់ចំណាយនេះ</div>
                    <div className="font-black text-rose-600 text-xs sm:text-sm font-sans">
                      -{numAmountKhr.toLocaleString()} ៛
                    </div>
                  </div>
                  <div className="bg-emerald-100/90 p-2 rounded-xl border border-emerald-300 shadow-2xs">
                    <div className="text-[10px] text-emerald-800 font-bold">ទុននៅសល់ជាក់ស្តែង</div>
                    <div className="font-black text-emerald-800 text-xs sm:text-sm font-sans">
                      {Math.max(0, reserveFund.currentBalanceKhr - numAmountKhr).toLocaleString()} ៛
                    </div>
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

            {paymentStatus === 'UNPAID' ? (
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
            ) : (
              <div className="pt-2.5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>កាលបរិច្ឆេទផុតកំណត់នៃវិក្កយបត្រ (Invoice Due Date - បើមាន)</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {[
                      { label: 'ថ្ងៃនេះ', days: 0 },
                      { label: 'ស្អែក', days: 1 },
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
                        className="px-1.5 py-0.5 text-[9px] font-bold bg-white hover:bg-slate-100 text-slate-600 rounded border border-slate-200 cursor-pointer shadow-2xs"
                      >
                        {opt.label}
                      </button>
                    ))}
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setDueDate('');
                        }}
                        className="px-1.5 py-0.5 text-[9px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        លុប
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-xs text-slate-500 pt-2">
                  <span>💡 សម្រាប់កត់ត្រាកាលបរិច្ឆេទផុតកំណត់នៃវិក្កយបត្រភ្លើង EDC ទឹក ឬជួលតូប ដើម្បីស្រួលផ្ទៀងផ្ទាត់</span>
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
                className={`px-6 py-2.5 text-white text-xs font-black rounded-2xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  paymentMethod === 'RESERVE_FUND'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/30 ring-2 ring-emerald-400/30'
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-rose-600/25'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {expenseToEdit
                    ? 'រក្សាទុកការកែប្រែ'
                    : paymentMethod === 'RESERVE_FUND'
                    ? `✓ កត់ត្រា និងកាត់ពីទុនបម្រុង (${numAmountKhr.toLocaleString()} ៛)`
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
