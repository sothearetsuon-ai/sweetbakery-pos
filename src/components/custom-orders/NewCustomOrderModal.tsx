import React, { useState, useRef } from 'react';
import {
  X,
  Cake,
  Calendar,
  User,
  Phone,
  DollarSign,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Plus,
  Minus,
  Check,
  Pencil,
  Trash2,
  Camera,
  Layers,
  ShoppingBag,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { PartyAddon } from '../../types';
import { CameraCaptureModal } from '../common/CameraCaptureModal';

interface NewCustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    orderType?: 'CAKE' | 'BREAD';
    cakeName?: string;
    size?: string;
    flavor?: string;
    filling?: string;
    inscription?: string;
    themeNotes?: string;
    referenceImage?: string;
    totalKhr?: number;
    depositKhr?: number;
  };
}

const BREAD_PRESETS = [
  { nameKh: 'នំបុ័ងបាហ្គេតបារាំង (French Baguette)', defaultPriceKhr: 4000, unit: 'ដើម' },
  { nameKh: 'នំបុ័ងសាំងវិច / ថូស (Sandwich Toast Loaf)', defaultPriceKhr: 8000, unit: 'ដើម' },
  { nameKh: 'ក្រូសង់ប៊័របារាំង AOP (Butter Croissant)', defaultPriceKhr: 6000, unit: 'ដុំ' },
  { nameKh: 'នំបុ័ងស្រូវសាលីសុខភាព (Whole Wheat Bread)', defaultPriceKhr: 9000, unit: 'ដើម' },
  { nameKh: 'នំបុ័ងផ្អែមស្នូលដូង / សណ្តែក (Sweet Buns)', defaultPriceKhr: 3000, unit: 'ដុំ' },
  { nameKh: 'នំបុ័ងសាច់ប៉ាតេ / សាច់ជ្រូក (Meat Buns)', defaultPriceKhr: 4500, unit: 'ដុំ' },
  { nameKh: 'នំបុ័ងមូលប៊ឺហ្គឺ (Burger Buns Pack)', defaultPriceKhr: 10000, unit: 'កញ្ចប់' },
  { nameKh: 'នំបុ័ងខ្ទឹមបារាំងឈ្ងុយ (Garlic Bread)', defaultPriceKhr: 5000, unit: 'ដើម' },
  { nameKh: 'នំបុ័ងហតដក (Hotdog Buns Pack)', defaultPriceKhr: 10000, unit: 'កញ្ចប់' },
];

const PACKAGING_OPTIONS = [
  'ទាំងមូល (Whole Loaf / មិនកាត់)',
  'ហាន់ជាបន្ទះស្តើង (Thin Sliced)',
  'ហាន់ជាបន្ទះក្រាស់ (Thick Sliced)',
  'ច្រកថង់មួយៗដាច់ដោយឡែក (Individual Bags)',
  'វេចខ្ចប់ប្រអប់ធំសម្រាប់កម្មវិធី (Bulk Catering Box)',
];

export const NewCustomOrderModal: React.FC<NewCustomOrderModalProps> = ({ isOpen, onClose, initialData }) => {
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

  // Order Type: Cake vs Bread
  const [orderType, setOrderType] = useState<'CAKE' | 'BREAD'>('CAKE');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  // Cake specific state
  const [cakeName, setCakeName] = useState('Birthday Special Cake');
  const [size, setSize] = useState('1.5 kg');
  const [flavor, setFlavor] = useState(flavors[0] || 'Chocolate Fudge + Fresh Strawberry');
  const [filling, setFilling] = useState('Fresh Cream');
  const [inscription, setInscription] = useState('');
  const [themeNotes, setThemeNotes] = useState('');
  const [selectedAddonQuantities, setSelectedAddonQuantities] = useState<Record<string, number>>({});
  const [baseCakePriceKhr, setBaseCakePriceKhr] = useState('100000');
  const [depositKhr, setDepositKhr] = useState('60000');

  // Bread specific state
  const [breadItems, setBreadItems] = useState<
    { id: string; nameKh: string; quantity: number; unit: string; pricePerUnitKhr: number }[]
  >([
    {
      id: 'bread-1',
      nameKh: 'នំបុ័ងបាហ្គេតបារាំង (French Baguette)',
      quantity: 20,
      unit: 'ដើម',
      pricePerUnitKhr: 4000,
    },
  ]);
  const [packagingOption, setPackagingOption] = useState('ទាំងមូល (Whole Loaf / មិនកាត់)');
  const [breadBakingNotes, setBreadBakingNotes] = useState('');
  const [breadDepositKhr, setBreadDepositKhr] = useState('');

  // Common photo & date/time state
  const [referenceImage, setReferenceImage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH_USD' | 'CASH_KHR' | 'KHQR_BAKONG'>('CASH_KHR');
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [pickupTime, setPickupTime] = useState('08:00');

  // Sync initialData if provided when opening modal
  React.useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.orderType) setOrderType(initialData.orderType);
      if (initialData.cakeName) setCakeName(initialData.cakeName);
      if (initialData.size) setSize(initialData.size);
      if (initialData.flavor) setFlavor(initialData.flavor);
      if (initialData.filling) setFilling(initialData.filling);
      if (initialData.inscription) setInscription(initialData.inscription);
      if (initialData.themeNotes) setThemeNotes(initialData.themeNotes);
      if (initialData.referenceImage) setReferenceImage(initialData.referenceImage);
      if (initialData.totalKhr) setBaseCakePriceKhr(initialData.totalKhr.toString());
      if (initialData.depositKhr) setDepositKhr(initialData.depositKhr.toString());
    }
  }, [isOpen, initialData]);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Addon handlers
  const handleIncrementAddon = (addonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playPop();
    setSelectedAddonQuantities((prev) => {
      const currentQty = prev[addonId] || 0;
      return { ...prev, [addonId]: currentQty + 1 };
    });
  };

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

  // Calculations for Cake
  const addonsTotalKhr = Object.entries(selectedAddonQuantities).reduce((sum, [id, qty]) => {
    if (!qty || qty <= 0) return sum;
    const addon = partyAddons.find((a) => a.id === id);
    return sum + (addon ? (addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate)) * qty : 0);
  }, 0);
  const addonsTotalUsd = Number((addonsTotalKhr / exchangeRate).toFixed(2));

  const numBaseCakeKhr = parseInt(baseCakePriceKhr, 10) || 0;
  const cakeTotalCalculatedKhr = numBaseCakeKhr + addonsTotalKhr;
  const cakeTotalCalculatedUsd = Number((cakeTotalCalculatedKhr / exchangeRate).toFixed(2));

  const numCakeDepositKhr = parseInt(depositKhr, 10) || 0;
  const cakeDepositUsd = Number((numCakeDepositKhr / exchangeRate).toFixed(2));

  // Calculations for Bread Pre-orders
  const breadTotalKhr = breadItems.reduce((sum, item) => sum + item.quantity * item.pricePerUnitKhr, 0);
  const breadTotalUsd = Number((breadTotalKhr / exchangeRate).toFixed(2));

  const numBreadDepositKhr =
    breadDepositKhr !== '' ? parseInt(breadDepositKhr, 10) || 0 : Math.round(breadTotalKhr * 0.5);
  const breadDepositUsd = Number((numBreadDepositKhr / exchangeRate).toFixed(2));

  // Active totals depending on Order Type
  const finalTotalKhr = orderType === 'CAKE' ? cakeTotalCalculatedKhr : breadTotalKhr;
  const finalTotalUsd = orderType === 'CAKE' ? cakeTotalCalculatedUsd : breadTotalUsd;
  const finalDepositKhr = orderType === 'CAKE' ? numCakeDepositKhr : numBreadDepositKhr;
  const finalDepositUsd = orderType === 'CAKE' ? cakeDepositUsd : breadDepositUsd;

  // Bread Items operations
  const handleAddBreadItem = () => {
    soundFx.playPop();
    const nextId = `bread-${Date.now()}`;
    const defaultPreset = BREAD_PRESETS[breadItems.length % BREAD_PRESETS.length];
    setBreadItems((prev) => [
      ...prev,
      {
        id: nextId,
        nameKh: defaultPreset.nameKh,
        quantity: 10,
        unit: defaultPreset.unit,
        pricePerUnitKhr: defaultPreset.defaultPriceKhr,
      },
    ]);
  };

  const handleUpdateBreadItem = (
    id: string,
    updates: Partial<{ nameKh: string; quantity: number; unit: string; pricePerUnitKhr: number }>
  ) => {
    setBreadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteBreadItem = (id: string) => {
    soundFx.playPop();
    if (breadItems.length <= 1) return;
    setBreadItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNewFlavor = () => {
    if (newFlavorInput.trim()) {
      soundFx.playSuccess();
      addFlavor(newFlavorInput.trim());
      setFlavor(newFlavorInput.trim());
      setNewFlavorInput('');
      setIsAddingNewFlavor(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) return;

    soundFx.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {}

    if (orderType === 'BREAD') {
      const activeItems = breadItems.filter((b) => b.quantity > 0);
      const itemsSummary = activeItems.map((b) => `${b.nameKh} (${b.quantity} ${b.unit})`).join(' + ');
      const totalQty = activeItems.reduce((sum, b) => sum + b.quantity, 0);

      addCustomOrder({
        orderType: 'BREAD',
        customerName: customerName.trim(),
        phone: phone.trim(),
        pickupDate,
        pickupTime,
        cakeName: itemsSummary || 'កុម្ម៉ង់នំបុ័ង & នំដុតចម្រុះ',
        size: `${totalQty} ${activeItems[0]?.unit || 'ដុំ'}`,
        flavor: 'នំបុ័ង & នំដុតស្រស់',
        filling: packagingOption,
        inscription: packagingOption,
        themeNotes: breadBakingNotes.trim() || undefined,
        referenceImage: referenceImage || undefined,
        breadItems: activeItems.map((b) => ({
          nameKh: b.nameKh,
          quantity: b.quantity,
          unit: b.unit,
          pricePerUnitKhr: b.pricePerUnitKhr,
          pricePerUnitUsd: Number((b.pricePerUnitKhr / exchangeRate).toFixed(2)),
          totalKhr: b.quantity * b.pricePerUnitKhr,
          totalUsd: Number(((b.quantity * b.pricePerUnitKhr) / exchangeRate).toFixed(2)),
        })),
        packagingOption,
        totalKhr: finalTotalKhr,
        totalUsd: finalTotalUsd,
        depositKhr: finalDepositKhr,
        depositUsd: finalDepositUsd,
        paymentMethod,
        status: 'PENDING',
      });
    } else {
      // Cake Order
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
        orderType: 'CAKE',
        customerName: customerName.trim(),
        phone: phone.trim(),
        cakeName: cakeName.trim(),
        size,
        flavor,
        filling,
        inscription: inscription.trim(),
        themeNotes: combinedNotes,
        referenceImage: referenceImage || undefined,
        pickupDate,
        pickupTime,
        totalUsd: finalTotalUsd,
        totalKhr: finalTotalKhr,
        depositUsd: finalDepositUsd,
        depositKhr: finalDepositKhr,
        paymentMethod,
        status: 'PENDING',
      });
    }

    onClose();
    // reset
    setCustomerName('');
    setPhone('');
    setInscription('');
    setThemeNotes('');
    setBreadBakingNotes('');
    setReferenceImage('');
    setSelectedAddonQuantities({});
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-amber-50/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-2xl text-white shadow-md ${
                orderType === 'CAKE'
                  ? 'bg-gradient-to-tr from-pink-500 to-rose-500 shadow-pink-500/20'
                  : 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/20'
              }`}
            >
              {orderType === 'CAKE' ? <Cake className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                {orderType === 'CAKE'
                  ? 'កត់ត្រាកុម្ម៉ង់នំខួបកំណើត / Cake ពិសេស'
                  : 'កត់ត្រាកុម្ម៉ង់នំបុ័ង & នំដុតទុកជាមុន (Bread Pre-Order)'}
              </h3>
              <p className="text-xs text-slate-500">
                {orderType === 'CAKE'
                  ? 'ជ្រើសរើសទំហំ, រសជាតិ, អក្សរលើនំ & ឥវ៉ាន់ពិធី'
                  : 'កុម្ម៉ង់នំបុ័ងបាហ្គេត, ក្រូសង់, សាំងវិច, នំដុតជាដុំ ឬចំនួនច្រើន'}
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

        {/* Order Type Switcher Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setOrderType('CAKE');
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              orderType === 'CAKE'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-[1.01]'
                : 'bg-white text-slate-600 hover:bg-pink-50 hover:text-pink-600 border border-slate-200'
            }`}
          >
            <Cake className="w-4 h-4" />
            <span>🎂 កុម្ម៉ង់នំខួបកំណើត (Custom Cake)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setOrderType('BREAD');
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              orderType === 'BREAD'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-amber-500/25 scale-[1.01]'
                : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>🥖 កុម្ម៉ង់នំបុ័ង & នំដុត (Bread Pre-Order)</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឈ្មោះអតិថិជន (Customer Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុខ វិសាល / ហាងកាហ្វេ អាម៉ាហ្សូន"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                លេខទូរស័ព្ទ (Phone Number) <span className="text-rose-500">*</span>
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

          {/* Reference Image Upload & Live Camera */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {orderType === 'CAKE'
                  ? 'រូបភាពគំរូនំដែលភ្ញៀវចង់បាន (Reference Photo)'
                  : 'រូបភាពគំរូនំបុ័ង / កញ្ចប់វេចខ្ចប់ (Reference Photo)'}
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

            <div className="w-full h-28 sm:h-32 rounded-2xl border-2 border-dashed border-rose-200 hover:border-pink-500 bg-rose-50/30 hover:bg-rose-50/60 transition-all cursor-pointer flex items-center justify-center overflow-hidden relative group">
              {referenceImage ? (
                <>
                  <img
                    src={referenceImage}
                    alt="Order Reference"
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

                  <div className="w-[1px] h-10 bg-rose-200" />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-pink-100/60 transition-colors"
                  >
                    <div className="p-2 bg-pink-100 text-pink-600 rounded-xl mb-1">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Upload ពី File</span>
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

          {/* ==================== BREAD PRE-ORDER SECTION ==================== */}
          {orderType === 'BREAD' ? (
            <div className="space-y-4">
              {/* Bread Items List Table */}
              <div className="p-4 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-amber-50/70 rounded-3xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <span>មុខនំបុ័ងដែលកុម្ម៉ង់ ({breadItems.length} មុខ)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBreadItem}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ បន្ថែមមុខនំបុ័ង</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {breadItems.map((item, idx) => {
                    const lineTotalKhr = item.quantity * item.pricePerUnitKhr;
                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-white rounded-2xl border border-amber-200/70 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            #{idx + 1}
                          </span>

                          {/* Quick Preset Selector */}
                          <select
                            onChange={(e) => {
                              const preset = BREAD_PRESETS.find((p) => p.nameKh === e.target.value);
                              if (preset) {
                                handleUpdateBreadItem(item.id, {
                                  nameKh: preset.nameKh,
                                  unit: preset.unit,
                                  pricePerUnitKhr: preset.defaultPriceKhr,
                                });
                              }
                            }}
                            className="text-[11px] font-semibold text-amber-900 bg-amber-50/80 border border-amber-200 rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="">-- រើសនំបុ័ងពេញនិយម --</option>
                            {BREAD_PRESETS.map((p, pIdx) => (
                              <option key={pIdx} value={p.nameKh}>
                                {p.nameKh} ({p.defaultPriceKhr.toLocaleString()}៛/{p.unit})
                              </option>
                            ))}
                          </select>

                          {breadItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteBreadItem(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="លុបមុខនេះ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Item Name Input */}
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="ឈ្មោះនំបុ័ង (ឧ. នំបុ័ងបាហ្គេតបារាំង, ក្រូសង់ប៊័រ...)"
                            value={item.nameKh}
                            onChange={(e) => handleUpdateBreadItem(item.id, { nameKh: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          />
                        </div>

                        {/* Quantity, Unit & Price Grid */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {/* Quantity */}
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                              ចំនួនកុម្ម៉ង់
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              required
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateBreadItem(item.id, {
                                  quantity: parseInt(e.target.value, 10) || 1,
                                })
                              }
                              className="w-full px-2.5 py-1.5 text-sm font-black border border-slate-200 rounded-xl text-center focus:outline-none focus:border-amber-500 text-slate-800"
                            />
                          </div>

                          {/* Unit */}
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">ខ្នាត</label>
                            <select
                              value={item.unit}
                              onChange={(e) => handleUpdateBreadItem(item.id, { unit: e.target.value })}
                              className="w-full px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none"
                            >
                              <option value="ដើម">ដើម (Loaf/Stick)</option>
                              <option value="ដុំ">ដុំ (Pieces)</option>
                              <option value="ថង់">ថង់ (Bags)</option>
                              <option value="កញ្ចប់">កញ្ចប់ (Packs)</option>
                              <option value="ឡូ">ឡូ (Dozens / 12)</option>
                              <option value="ប្រអប់">ប្រអប់ (Boxes)</option>
                            </select>
                          </div>

                          {/* Price per unit */}
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                              តម្លៃ/១{item.unit} (៛)
                            </label>
                            <input
                              type="number"
                              step="100"
                              min="0"
                              required
                              value={item.pricePerUnitKhr}
                              onChange={(e) =>
                                handleUpdateBreadItem(item.id, {
                                  pricePerUnitKhr: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-full px-2 py-1.5 text-xs font-black border border-slate-200 rounded-xl text-right text-amber-800 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-100">
                          <span className="text-slate-500">
                            សរុប ({item.quantity} {item.unit} × {item.pricePerUnitKhr.toLocaleString()}៛)៖
                          </span>
                          <span className="font-black text-amber-900 text-xs">
                            {lineTotalKhr.toLocaleString()} ៛ (~ ${(lineTotalKhr / exchangeRate).toFixed(2)})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slicing & Packaging Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>ជម្រើសកាត់ & វេចខ្ចប់ (Slicing & Packaging)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PACKAGING_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setPackagingOption(opt);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        packagingOption === opt
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Baking Notes / Requirements */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ចំណាំការដុត និងតម្រូវការពិសេស (Baking Notes)
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ដុតកម្រិតក្រៀមស្រួយ, មិនដាក់ល្ង, យកក្តៅៗនៅម៉ោង ៦:៣០ ព្រឹក..."
                  value={breadBakingNotes}
                  onChange={(e) => setBreadBakingNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          ) : (
            /* ==================== CUSTOM CAKE SECTION ==================== */
            <div className="space-y-4">
              {/* Cake Details & Dynamic Flavors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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

                {/* Dynamic Flavor Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">រសជាតិនំ (Flavor)</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewFlavor(!isAddingNewFlavor)}
                      className="text-[10px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-0.5 cursor-pointer"
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
                        className="px-2.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
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
                      <span>{isAddingNewAddon ? 'បិទ' : '+ បង្កើតឥវ៉ាន់ថ្មី'}</span>
                    </button>
                  </div>
                </div>

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

                          {isSelected && (
                            <div
                              className="flex items-center gap-1 bg-black/20 backdrop-blur-xs p-0.5 rounded-xl shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => handleDecrementAddon(addon.id, e)}
                                className="w-5 h-5 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
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
            </div>
          )}

          {/* Pickup Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-rose-50/40 p-4 rounded-2xl border border-rose-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                កាលបរិច្ឆេទមកយក (Pickup Date) <span className="text-rose-500">*</span>
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
                ម៉ោងមកយក (Pickup Time) <span className="text-rose-500">*</span>
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
                តម្លៃសរុប (Total Amount) ៛ KHR <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  value={finalTotalKhr}
                  onChange={(e) => {
                    const newTotal = parseInt(e.target.value, 10) || 0;
                    if (orderType === 'CAKE') {
                      setBaseCakePriceKhr(String(Math.max(0, newTotal - addonsTotalKhr)));
                    }
                  }}
                  className="w-full px-3 py-2 text-base font-black text-pink-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ៛
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                ~ ${finalTotalUsd.toFixed(2)} USD
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">ប្រាក់កក់ (Deposit ៛) <span className="text-rose-500">*</span></label>
                <span className="text-[10px] font-bold text-rose-500">
                  {finalTotalKhr > finalDepositKhr
                    ? `នៅខ្វះ ${(finalTotalKhr - finalDepositKhr).toLocaleString()} ៛`
                    : 'បង់គ្រប់ ១០០%'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={finalTotalKhr}
                  required
                  value={orderType === 'CAKE' ? depositKhr : breadDepositKhr || String(finalDepositKhr)}
                  onChange={(e) => {
                    if (orderType === 'CAKE') setDepositKhr(e.target.value);
                    else setBreadDepositKhr(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-base font-black text-emerald-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ៛
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>~ ${finalDepositUsd.toFixed(2)} USD</span>
              </div>

              {/* Quick deposit shortcuts */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    if (orderType === 'CAKE') setDepositKhr('0');
                    else setBreadDepositKhr('0');
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  គ្មានកក់ (0៛)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    const half = Math.round(finalTotalKhr / 2 / 1000) * 1000;
                    if (orderType === 'CAKE') setDepositKhr(half.toString());
                    else setBreadDepositKhr(half.toString());
                  }}
                  className="px-2 py-0.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  កក់ 50%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    if (orderType === 'CAKE') setDepositKhr(finalTotalKhr.toString());
                    else setBreadDepositKhr(finalTotalKhr.toString());
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
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer ${
                orderType === 'CAKE'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 shadow-pink-600/25'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
              }`}
            >
              {orderType === 'CAKE' ? <Cake className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              <span>
                {orderType === 'CAKE'
                  ? `កត់ត្រាកុម្ម៉ង់នំខួបកំណើត (${finalTotalKhr.toLocaleString()} ៛)`
                  : `កត់ត្រាកុម្ម៉ង់នំបុ័ង (${finalTotalKhr.toLocaleString()} ៛)`}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setReferenceImage(img);
        }}
        title={orderType === 'CAKE' ? 'ថតរូបគំរូនំខួបកំណើត (Cake Reference)' : 'ថតរូបគំរូនំបុ័ង (Bread Reference)'}
        subtitle="ថតរូបភាពគំរូពីកាម៉េរ៉ាដើម្បីឱ្យជាងដុតនំមើលតាម"
      />
    </div>
  );
};
