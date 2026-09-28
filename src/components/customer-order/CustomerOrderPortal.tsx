import React, { useState, useMemo } from 'react';
import {
  Cake,
  Calendar,
  Clock,
  Phone,
  User,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  QrCode,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  Upload,
  ArrowRight,
  Info,
  DollarSign,
  Heart,
  Share2,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { Product, CustomCakeOrder, OrderStatus } from '../../types';
import { soundFx } from '../../utils/audio';
import { compressImageBase64 } from '../../utils/imageCompressor';
import { getProductImageUrl } from '../../utils/imagePath';

const CAKE_SIZES = [
  { id: '1.5 ទឹក', label: '1.5 ទឹក (~15cm)', desc: 'សម្រាប់ 2-4 នាក់', priceUsd: 12 },
  { id: '2 ទឹក', label: '2 ទឹក (~20cm)', desc: 'សម្រាប់ 6-8 នាក់ (ពេញនិយម)', priceUsd: 16 },
  { id: '2.5 ទឹក', label: '2.5 ទឹក (~25cm)', desc: 'សម្រាប់ 10-14 នាក់', priceUsd: 22 },
  { id: '3 ទឹក', label: '3 ទឹក (~30cm)', desc: 'សម្រាប់ 15-20 នាក់', priceUsd: 28 },
  { id: '2 ជាន់', label: '2 ជាន់ (2-Tier)', desc: 'សម្រាប់កម្មវិធីធំ / 20+ នាក់', priceUsd: 45 },
];

export const CustomerOrderPortal: React.FC = () => {
  const {
    products,
    categories,
    flavors,
    partyAddons,
    storeInfo,
    exchangeRate,
    addCustomOrder,
  } = useBakery();

  // Current Step: 1 = Catalog/Design, 2 = Customization, 3 = Pickup & Contact, 4 = Deposit & KHQR, 5 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Search & Filter in Step 1
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selected Cake Design
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customCakeName, setCustomCakeName] = useState('នំខួបកំណើតម៉ូដពិសេស (Custom Cake)');

  // Customization State
  const [selectedSize, setSelectedSize] = useState(CAKE_SIZES[1].id);
  const [selectedSizePrice, setSelectedSizePrice] = useState(CAKE_SIZES[1].priceUsd);
  const [selectedFlavor, setSelectedFlavor] = useState(flavors[0] || 'វ៉ានីឡា (Vanilla)');
  const [inscription, setInscription] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [referenceImage, setReferenceImage] = useState<string>('');
  const [isUploadingRefImage, setIsUploadingRefImage] = useState(false);

  // Selected Addons
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Pickup & Contact State
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Default to tomorrow
    return d.toISOString().slice(0, 10);
  });
  const [pickupTime, setPickupTime] = useState('14:00');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerTelegram, setCustomerTelegram] = useState('');

  // Deposit Payment State
  // '50%' | '30%' | '100%' | 'custom'
  const [depositOption, setDepositOption] = useState<'50%' | '30%' | '100%' | 'custom'>('50%');
  const [customDepositUsd, setCustomDepositUsd] = useState<number>(0);
  const [bankSlipImage, setBankSlipImage] = useState<string>('');
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmed Order
  const [confirmedOrder, setConfirmedOrder] = useState<CustomCakeOrder | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  // Available party addons - connected dynamically to POS partyAddons
  const availableAddons = useMemo(() => {
    if (partyAddons && partyAddons.length > 0) {
      return partyAddons.map((addon) => ({
        id: addon.id,
        nameKh: addon.nameKh,
        priceUsd: addon.priceUsd,
        priceKhr: addon.priceKhr ?? Math.round(addon.priceUsd * exchangeRate),
      }));
    }
    return [
      { id: 'sparkler', nameKh: 'ទៀនភ្លើងពណ៌ (Sparkler Candle)', priceUsd: 1, priceKhr: 4100 },
      { id: 'number_candle', nameKh: 'ទៀនលេខអាយុ (Number Candles)', priceUsd: 1, priceKhr: 4100 },
      { id: 'party_hats', nameKh: 'មួកខួបកំណើត (Party Hats)', priceUsd: 1.5, priceKhr: 6000 },
      { id: 'plates_forks', nameKh: 'ចាន & ស្លាបព្រាបន្ថែម (Extra Plates & Forks)', priceUsd: 1, priceKhr: 4100 },
    ];
  }, [partyAddons, exchangeRate]);

  // Filtered Products for Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.nameKh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Calculations
  const addonsTotalUsd = useMemo(() => {
    return selectedAddons.reduce((acc, addonId) => {
      const item = availableAddons.find((a) => a.id === addonId);
      return acc + (item ? item.priceUsd : 0);
    }, 0);
  }, [selectedAddons, availableAddons]);

  const basePriceUsd = selectedProduct
    ? (selectedProduct.priceUsd > 0 ? selectedProduct.priceUsd : selectedSizePrice)
    : selectedSizePrice;

  const totalUsd = Number((basePriceUsd + addonsTotalUsd).toFixed(2));
  const totalKhr = Math.round(totalUsd * exchangeRate);

  const depositUsd = useMemo(() => {
    if (depositOption === '100%') return totalUsd;
    if (depositOption === '50%') return Number((totalUsd * 0.5).toFixed(2));
    if (depositOption === '30%') return Number((totalUsd * 0.3).toFixed(2));
    if (depositOption === 'custom') return Math.min(totalUsd, Math.max(0, customDepositUsd));
    return Number((totalUsd * 0.5).toFixed(2));
  }, [depositOption, totalUsd, customDepositUsd]);

  const depositKhr = Math.round(depositUsd * exchangeRate);
  const remainingUsd = Number((totalUsd - depositUsd).toFixed(2));
  const remainingKhr = Math.round(remainingUsd * exchangeRate);

  // Handle Cake Selection
  const handleSelectProduct = (product: Product) => {
    soundFx.playPop();
    setSelectedProduct(product);
    setCustomCakeName(product.nameKh);
    if (product.imageUrl) {
      setReferenceImage(product.imageUrl);
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Custom Design from Scratch
  const handleStartCustomDesign = () => {
    soundFx.playPop();
    setSelectedProduct(null);
    setCustomCakeName('នំខួបកំណើតម៉ូដពិសេស (Custom Cake)');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reference Image Upload
  const handleRefImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingRefImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const rawBase64 = reader.result as string;
        const compressed = await compressImageBase64(rawBase64, 800, 800, 0.75);
        setReferenceImage(compressed);
        setIsUploadingRefImage(false);
        soundFx.playPop();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      setIsUploadingRefImage(false);
    }
  };

  // Bank Slip Upload
  const handleBankSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSlip(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const rawBase64 = reader.result as string;
        const compressed = await compressImageBase64(rawBase64, 900, 900, 0.78);
        setBankSlipImage(compressed);
        setIsUploadingSlip(false);
        soundFx.playSuccess();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading slip:', err);
      setIsUploadingSlip(false);
    }
  };

  // Copy Account Number
  const handleCopyAccount = () => {
    const num = storeInfo.khqrAccountNumber || '012629160';
    navigator.clipboard.writeText(num);
    setCopiedAccount(true);
    soundFx.playPop();
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  // Final Order Submission
  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      alert('សូមបញ្ចូលឈ្មោះរបស់អ្នក (Customer Name)');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      alert('សូមបញ្ចូលលេខទូរស័ព្ទឱ្យបានត្រឹមត្រូវ (Phone Number)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build addon summary
      const addonNames = selectedAddons
        .map((id) => availableAddons.find((a) => a.id === id)?.nameKh)
        .filter(Boolean)
        .join(', ');

      const combinedNotes = [
        specialNotes.trim(),
        addonNames ? `គ្រឿងបន្ថែម៖ ${addonNames}` : '',
        customerTelegram.trim() ? `Telegram: ${customerTelegram.trim()}` : '',
      ]
        .filter(Boolean)
        .join(' • ');

      const orderData: Omit<CustomCakeOrder, 'id' | 'orderNumber' | 'createdAt'> = {
        orderType: 'CAKE',
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        pickupDate,
        pickupTime,
        cakeName: customCakeName,
        size: selectedSize,
        flavor: selectedFlavor,
        inscription: inscription.trim(),
        themeNotes: combinedNotes || undefined,
        referenceImage: referenceImage || undefined,
        status: 'PENDING' as OrderStatus,
        totalUsd,
        totalKhr,
        depositUsd,
        depositKhr,
        paymentMethod: 'KHQR_BAKONG',
        bankSlipImage: bankSlipImage || undefined,
        orderSource: 'CUSTOMER_ONLINE',
      };

      // Add to Bakery Context
      addCustomOrder(orderData);

      // Create confirmed order representation for display
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `CK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomSuffix}`;
      const completed: CustomCakeOrder = {
        ...orderData,
        id: `ord-${Date.now()}`,
        orderNumber,
        createdAt: new Date().toISOString(),
      };

      setConfirmedOrder(completed);
      setIsSubmitting(false);
      setStep(5);
      soundFx.playSuccess();
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.5 },
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      console.error('Submit order error:', e);
      alert('មានបញ្ហាក្នុងការបញ្ជូនការកុម្ម៉ង់ សូមព្យាយាមម្តងទៀត');
      setIsSubmitting(false);
    }
  };

  const merchantName = storeInfo.khqrMerchantName || storeInfo.nameKh || 'SWEET BAKERY & CAFE';
  const bakongId = storeInfo.khqrBakongId || 'sweet_bakery@aba';
  const accountNum = storeInfo.khqrAccountNumber || '012629160';
  const bankName = storeInfo.khqrBankName || 'ABA Bank / Bakong';

  // Fallback QR code with exact deposit amount
  const qrData = depositKhr > 0
    ? `bakong://pay?merchant=${encodeURIComponent(merchantName)}&account=${encodeURIComponent(bakongId)}&amount=${depositKhr}&currency=KHR`
    : `bakong://pay?merchant=${encodeURIComponent(merchantName)}&account=${encodeURIComponent(bakongId)}`;
  const autoQrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
  const displayQrImage = storeInfo.khqrQrImage ? getProductImageUrl(storeInfo.khqrQrImage) : autoQrSrc;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-pink-50/30 text-slate-800 pb-20 font-sans selection:bg-pink-100 selection:text-pink-700">
      {/* Top Store Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {storeInfo.logoUrl ? (
              <img
                src={getProductImageUrl(storeInfo.logoUrl)}
                alt={storeInfo.nameKh}
                className="w-10 h-10 rounded-2xl object-cover border border-rose-200 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-black text-xl shadow-xs">
                🎂
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                {storeInfo.nameKh || 'ហាងនំបុ័ង & នំខួបកំណើត វិជ្ជតា'}
              </h1>
              <p className="text-[11px] text-pink-600 font-semibold mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>បើកទទួលការកុម្ម៉ង់ជារៀងរាល់ថ្ងៃ</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{storeInfo.phone || '012 345 678'}</span>
              </p>
            </div>
          </div>

          {/* Customer Support Contact */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${storeInfo.phone || '012345678'}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200/80 active:scale-95 shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>ទំនាក់ទំនង</span>
            </a>
          </div>
        </div>

        {/* Step Progression Bar (only steps 1 to 4) */}
        {step < 5 && (
          <div className="max-w-4xl mx-auto px-4 py-2 border-t border-rose-50 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <button
              onClick={() => { soundFx.playPop(); setStep(1); }}
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                step === 1 ? 'text-pink-600 font-black' : step > 1 ? 'text-emerald-600' : ''
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 1 ? 'bg-pink-600 text-white' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span>រើសម៉ូដនំ</span>
            </button>

            <span className="text-slate-300">›</span>

            <button
              onClick={() => { if (step >= 2) { soundFx.playPop(); setStep(2); } }}
              className={`flex items-center gap-1 transition-colors ${
                step === 2 ? 'text-pink-600 font-black' : step > 2 ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 2 ? 'bg-pink-600 text-white' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span>កំណត់ម៉ូដ & អក្សរ</span>
            </button>

            <span className="text-slate-300">›</span>

            <button
              onClick={() => { if (step >= 3) { soundFx.playPop(); setStep(3); } }}
              className={`flex items-center gap-1 transition-colors ${
                step === 3 ? 'text-pink-600 font-black' : step > 3 ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 3 ? 'bg-pink-600 text-white' : step > 3 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {step > 3 ? '✓' : '3'}
              </span>
              <span>ថ្ងៃមកយក & ព័ត៌មាន</span>
            </button>

            <span className="text-slate-300">›</span>

            <button
              onClick={() => { if (step >= 4) { soundFx.playPop(); setStep(4); } }}
              className={`flex items-center gap-1 transition-colors ${
                step === 4 ? 'text-pink-600 font-black' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 4 ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                4
              </span>
              <span>កក់ប្រាក់ KHQR</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {/* ========================================================================= */}
        {/* STEP 1: BROWSE CATALOG & CHOOSE DESIGN */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-pink-500/15 relative overflow-hidden">
              <div className="relative z-10 max-w-lg space-y-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-wide inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>កុម្ម៉ង់នំខួបកំណើតតាមចិត្ត ជាមួយប្រាក់កក់ងាយស្រួល</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  នំខួបកំណើតស្រស់ថ្មីៗ ដុតជារៀងរាល់ថ្ងៃ
                </h2>
                <p className="text-xs sm:text-sm text-pink-100 font-medium">
                  ជ្រើសរើសម៉ូដនំក្នុងមឺនុយ ឬបញ្ចូលរូបភាពគំរូនំដែលអ្នកស្រឡាញ់ដើម្បីឱ្យជាងនំយើងខ្ញុំធ្វើជូន!
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={handleStartCustomDesign}
                    className="px-4 py-2.5 bg-white text-pink-700 hover:bg-pink-50 rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🎨 កុម្ម៉ង់ម៉ូដតាមរូបភាពផ្ទាល់ខ្លួន</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Decorative Background Shape */}
              <div className="absolute right-[-20px] bottom-[-20px] text-8xl sm:text-9xl opacity-20 select-none pointer-events-none">
                🎂
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => { soundFx.playPop(); setSelectedCategory('all'); }}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-rose-100 hover:bg-rose-50'
                  }`}
                >
                  ទាំងអស់
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { soundFx.playPop(); setSelectedCategory(c.id); }}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      selectedCategory === c.id
                        ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-rose-100 hover:bg-rose-50'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.nameKh}</span>
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកនំដែលអ្នកចូលចិត្ត..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-rose-100 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 0: Custom Photo Order Card */}
              <div
                onClick={handleStartCustomDesign}
                className="bg-gradient-to-b from-pink-50/70 to-rose-100/60 border-2 border-dashed border-pink-300 rounded-3xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-500 hover:scale-[1.02] transition-all shadow-sm group min-h-[220px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-white text-pink-500 shadow-md flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform mb-3">
                  ✨
                </div>
                <h3 className="font-black text-sm text-pink-800">
                  កុម្ម៉ង់ម៉ូដតាមរូបភាព
                </h3>
                <p className="text-[11px] text-pink-600 mt-1 leading-snug">
                  មានរូបនំក្នុងចិត្ត? ចុចទីនេះដើម្បី Upload រូបគំរូនំ
                </p>
                <span className="mt-3 px-3 py-1 bg-pink-600 text-white rounded-xl text-[10px] font-black group-hover:bg-pink-700 transition-colors">
                  + បង្កើតម៉ូដផ្ទាល់ខ្លួន
                </span>
              </div>

              {/* Catalog Products */}
              {filteredProducts.map((p) => {
                const priceKhr = p.priceKhr ?? Math.round(p.priceUsd * exchangeRate);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-2xs hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="relative w-full h-36 sm:h-44 bg-rose-50 overflow-hidden">
                      <img
                        src={getProductImageUrl(p.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500')}
                        alt={p.nameKh}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white rounded-lg text-[10px] font-black">
                        ${p.priceUsd > 0 ? p.priceUsd.toFixed(2) : '16.00'}
                      </span>
                    </div>

                    <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-slate-800 text-xs sm:text-sm line-clamp-1 group-hover:text-pink-600 transition-colors">
                          {p.nameKh}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {p.nameEn}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-rose-50 flex items-center justify-between">
                        <div className="text-pink-600 font-black text-xs sm:text-sm">
                          {priceKhr.toLocaleString()} ៛
                        </div>
                        <button className="px-2.5 py-1 bg-pink-50 group-hover:bg-pink-600 text-pink-700 group-hover:text-white rounded-xl text-[10px] font-black transition-all">
                          កុម្ម៉ង់
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CUSTOMIZATION (SIZE, FLAVOR, INSCRIPTION, REFERENCE IMAGE) */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>🎨</span>
                  <span>កំណត់ព័ត៌មាននំ & អក្សរជូនពរ</span>
                </h2>
                <p className="text-xs text-slate-500">
                  ជ្រើសរើសទំហំ រសជាតិ និងសរសេរអក្សរដែលអ្នកចង់ឱ្យជាងនំសរសេរលើនំ
                </p>
              </div>

              <button
                onClick={() => { soundFx.playPop(); setStep(1); }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>ប្តូរម៉ូដនំ</span>
              </button>
            </div>

            {/* Selected Cake Card Summary */}
            <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-sm flex items-center gap-4">
              {referenceImage ? (
                <img
                  src={getProductImageUrl(referenceImage)}
                  alt="Cake preview"
                  className="w-16 h-16 rounded-2xl object-cover border border-rose-200 shadow-2xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-3xl font-black">
                  🎂
                </div>
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={customCakeName}
                  onChange={(e) => setCustomCakeName(e.target.value)}
                  className="font-black text-slate-800 text-sm sm:text-base border-b border-transparent hover:border-pink-300 focus:border-pink-500 focus:outline-none w-full"
                  placeholder="ឈ្មោះនំ (Cake Name)..."
                />
                <p className="text-xs text-pink-600 font-bold mt-0.5">
                  តម្លៃប៉ាន់ស្មាន៖ ${totalUsd.toFixed(2)} ({totalKhr.toLocaleString()} ៛)
                </p>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>📏 ជ្រើសរើសទំហំនំ (Cake Size)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CAKE_SIZES.map((sz) => {
                  const isSel = selectedSize === sz.id;
                  const khr = Math.round(sz.priceUsd * exchangeRate);
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedSize(sz.id);
                        setSelectedSizePrice(sz.priceUsd);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-pink-50/90 border-pink-500 text-pink-900 shadow-xs ring-2 ring-pink-500/20'
                          : 'bg-white border-rose-100 hover:border-rose-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs">{sz.label}</span>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-pink-600" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{sz.desc}</div>
                      <div className="text-xs font-black text-pink-600 mt-1.5">
                        ${sz.priceUsd.toFixed(2)} ({khr.toLocaleString()} ៛)
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flavor Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>🍰 ជ្រើសរើសរសជាតិនំ (Cake Flavor)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {flavors.map((fl) => {
                  const isSel = selectedFlavor === fl;
                  return (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedFlavor(fl);
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                          : 'bg-white border border-rose-100 hover:bg-rose-50 text-slate-700'
                      }`}
                    >
                      {fl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inscription on Cake */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>✍️ អក្សរជូនពរលើនំ (Inscription on Cake)</span>
                </span>
                <span className="text-[10px] text-slate-400">ឥតគិតថ្លៃ (Free)</span>
              </label>
              <input
                type="text"
                placeholder='ឧទាហរណ៍៖ "Happy Birthday Dara", "រីករាយថ្ងៃខួបកំណើតកូនសំឡាញ់"...'
                value={inscription}
                onChange={(e) => setInscription(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-rose-100 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-2xs"
              />

              {/* Live Preview on Cake Tag */}
              {inscription.trim() && (
                <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/80 rounded-2xl flex items-center gap-2.5 text-pink-700">
                  <span className="text-xl">🎂</span>
                  <div className="text-xs font-bold italic">
                    "{inscription.trim()}"
                  </div>
                </div>
              )}
            </div>

            {/* Reference Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                <span>📷 បញ្ចូលរូបភាពគំរូនំ (Upload Reference Photo)</span>
                <span className="text-[10px] text-pink-600 font-bold">មានរូបគំរូកាន់តែស្រួល</span>
              </label>

              <div className="flex items-center gap-3">
                {referenceImage ? (
                  <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-pink-400 shadow-sm shrink-0">
                    <img
                      src={getProductImageUrl(referenceImage)}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setReferenceImage('')}
                      className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity"
                    >
                      លុប
                    </button>
                  </div>
                ) : null}

                <label className="flex-1 border-2 border-dashed border-rose-200 hover:border-pink-400 bg-white/70 hover:bg-pink-50/50 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center">
                  <Upload className="w-5 h-5 text-pink-500 mb-1" />
                  <span className="text-xs font-bold text-slate-700">
                    {isUploadingRefImage ? 'កំពុងបញ្ចូលរូបភាព...' : 'ជ្រើសរើសរូបពីទូរស័ព្ទ / កុំព្យូទ័រ'}
                  </span>
                  <span className="text-[10px] text-slate-400">JPG, PNG ឬ WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleRefImageUpload}
                    className="hidden"
                    disabled={isUploadingRefImage}
                  />
                </label>
              </div>
            </div>

            {/* Party Addons */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                🎉 គ្រឿងបន្ថែមសម្រាប់កម្មវិធី (Party Accessories)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableAddons.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedAddons((prev) =>
                          isChecked ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
                        );
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-pink-50/80 border-pink-400 shadow-2xs'
                          : 'bg-white border-rose-100 hover:border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">{addon.nameKh}</span>
                      </div>
                      <span className="text-xs font-black text-pink-600">
                        +${addon.priceUsd.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions Note */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                📝 ចំណាំបន្ថែមសម្រាប់ជាងនំ (Special Notes)
              </label>
              <textarea
                rows={2}
                placeholder="ឧទាហរណ៍៖ ដាក់ស្ករតិច, តែងផ្កាពណ៌ផ្កាឈូកស្រាល, ដាក់ទៀនភ្លើងពណ៌..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-rose-100 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-2xs"
              />
            </div>

            {/* Bottom Navigation */}
            <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { soundFx.playPop(); setStep(1); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                ត្រឡប់ក្រោយ
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-pink-500/25 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>បន្តទៅថ្ងៃមកយក & ព័ត៌មាន</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PICKUP TIME & CUSTOMER CONTACT */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>📅</span>
                  <span>កាលបរិច្ឆេទមកយក & ព័ត៌មានទំនាក់ទំនង</span>
                </h2>
                <p className="text-xs text-slate-500">
                  សូមជ្រើសរើសថ្ងៃ និងម៉ោងមកយកនំ រួមទាំងលេខទូរស័ព្ទរបស់អ្នក
                </p>
              </div>

              <button
                onClick={() => { soundFx.playPop(); setStep(2); }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>កែប្រែនំ</span>
              </button>
            </div>

            {/* Pickup Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-pink-500" />
                  <span>កាលបរិច្ឆេទមកយកនំ (Pickup Date) *</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-rose-100 rounded-2xl text-xs sm:text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-2xs cursor-pointer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pink-500" />
                  <span>ម៉ោងមកទទួលនំ (Pickup Time) *</span>
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-rose-100 rounded-2xl text-xs sm:text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-2xs cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-pink-500" />
                <span>ព័ត៌មានអ្នកកុម្ម៉ង់ (Customer Details)</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  ឈ្មោះរបស់អ្នក (Full Name) *
                </label>
                <input
                  type="text"
                  placeholder="ឧទាហរណ៍៖ សុខ វិជ្ជតា / Sok Vicheata"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  លេខទូរស័ព្ទ (Phone Number) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="012 345 678 / 098 765 432"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Telegram Username (បើមាន)</span>
                  <span className="text-[10px] text-slate-400">ស្រេចចិត្ត (Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    placeholder="username (ឧ. dara_cake)"
                    value={customerTelegram}
                    onChange={(e) => setCustomerTelegram(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Store Location Info Reminder */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">ទីតាំងទទួលនំ៖ {storeInfo.nameKh}</span>
                <span className="text-amber-800 text-[11px] block mt-0.5">
                  {storeInfo.address || 'រាជធានីភ្នំពេញ'} • ទូរស័ព្ទ៖ {storeInfo.phone || '012 345 678'}
                </span>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { soundFx.playPop(); setStep(2); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                ត្រឡប់ក្រោយ
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!customerName.trim()) {
                    alert('សូមបញ្ចូលឈ្មោះរបស់អ្នក');
                    return;
                  }
                  if (!customerPhone.trim() || customerPhone.trim().length < 8) {
                    alert('សូមបញ្ចូលលេខទូរស័ព្ទឱ្យបានត្រឹមត្រូវ');
                    return;
                  }
                  soundFx.playPop();
                  setStep(4);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-pink-500/25 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>បន្តទៅបង់ប្រាក់កក់ KHQR</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: DEPOSIT SELECTION & BAKONG KHQR PAYMENT */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>📲</span>
                  <span>បង់ប្រាក់កក់តាម KHQR Bakong</span>
                </h2>
                <p className="text-xs text-slate-500">
                  បង់ប្រាក់កក់ដើម្បីឱ្យជាងនំយើងខ្ញុំចាប់ផ្តើមរៀបចំផលិតនំជូនអ្នក
                </p>
              </div>

              <button
                onClick={() => { soundFx.playPop(); setStep(3); }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>កែព័ត៌មាន</span>
              </button>
            </div>

            {/* Transparent Bill Breakdown Card */}
            <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold">នំកុម្ម៉ង់៖</span>
                <span className="font-black text-slate-800">{customCakeName} ({selectedSize})</span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold">តម្លៃសរុប (Total Amount)៖</span>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900">${totalUsd.toFixed(2)}</span>
                  <span className="text-[11px] text-slate-400 font-bold block">
                    {totalKhr.toLocaleString()} ៛
                  </span>
                </div>
              </div>

              {/* Deposit Option Selector */}
              <div className="pt-1">
                <label className="text-xs font-black text-slate-700 block mb-2">
                  ជ្រើសរើសចំនួនប្រាក់កក់ (Deposit Options)៖
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => { soundFx.playPop(); setDepositOption('50%'); }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      depositOption === '50%'
                        ? 'bg-pink-50 border-pink-500 text-pink-900 ring-2 ring-pink-500/20'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black block">កក់ 50%</span>
                    <span className="text-[10px] text-pink-600 font-bold block mt-0.5">
                      ${(totalUsd * 0.5).toFixed(2)}
                    </span>
                    <span className="text-[9px] bg-pink-600 text-white px-1.5 py-0.2 rounded-full font-bold mt-1 inline-block">
                      ពេញនិយម
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundFx.playPop(); setDepositOption('30%'); }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      depositOption === '30%'
                        ? 'bg-pink-50 border-pink-500 text-pink-900 ring-2 ring-pink-500/20'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black block">កក់ 30%</span>
                    <span className="text-[10px] text-pink-600 font-bold block mt-0.5">
                      ${(totalUsd * 0.3).toFixed(2)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundFx.playPop(); setDepositOption('100%'); }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      depositOption === '100%'
                        ? 'bg-pink-50 border-pink-500 text-pink-900 ring-2 ring-pink-500/20'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black block">បង់ពេញ 100%</span>
                    <span className="text-[10px] text-pink-600 font-bold block mt-0.5">
                      ${totalUsd.toFixed(2)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundFx.playPop(); setDepositOption('custom'); }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      depositOption === 'custom'
                        ? 'bg-pink-50 border-pink-500 text-pink-900 ring-2 ring-pink-500/20'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black block">កក់តាមចិត្ត</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                      បញ្ចូលចំនួន
                    </span>
                  </button>
                </div>

                {depositOption === 'custom' && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">ចំនួនប្រាក់កក់ ($ USD)៖</span>
                    <input
                      type="number"
                      min={1}
                      max={totalUsd}
                      step={0.5}
                      value={customDepositUsd}
                      onChange={(e) => setCustomDepositUsd(Number(e.target.value))}
                      className="w-32 px-3 py-1.5 bg-white border border-pink-300 rounded-xl text-xs font-black text-pink-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Deposit & Remaining Summary Highlight */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-rose-700 font-bold block">ប្រាក់កក់ត្រូវបង់ឥឡូវនេះ៖</span>
                  <span className="text-xl font-black text-rose-600">${depositUsd.toFixed(2)}</span>
                  <span className="text-[11px] text-slate-500 font-bold ml-1.5">({depositKhr.toLocaleString()} ៛)</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-bold block">នៅសល់ពេលមកយកនំ៖</span>
                  <span className="text-sm font-black text-slate-700">${remainingUsd.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block font-bold">({remainingKhr.toLocaleString()} ៛)</span>
                </div>
              </div>
            </div>

            {/* Bakong KHQR Standee Card */}
            <div className="bg-white rounded-3xl p-5 border-2 border-rose-400 shadow-xl text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-rose-600 font-black text-sm flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" />
                  <span>ស្កេនទូទាត់ប្រាក់កក់តាម KHQR Bakong</span>
                </span>
              </div>

              {/* Red Header Banner */}
              <div className="bg-[#D32F2F] text-white py-2.5 px-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="text-left leading-tight">
                  <span className="text-[8px] uppercase tracking-wider block text-red-200 font-bold">Cambodia Standard</span>
                  <span className="text-xl font-black tracking-tight">KHQR</span>
                </div>
                <div className="text-right text-xs font-black">
                  <span>{depositKhr.toLocaleString()} ៛</span>
                  <span className="text-[10px] text-red-200 block">(~${depositUsd.toFixed(2)})</span>
                </div>
              </div>

              {/* QR Image */}
              <div className="flex justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100 max-w-[260px] mx-auto shadow-inner">
                <img
                  src={displayQrImage}
                  alt="Bakong KHQR"
                  className="w-56 h-56 object-contain rounded-xl"
                />
              </div>

              {/* Merchant Details */}
              <div className="space-y-1">
                <div className="font-black text-slate-800 text-sm">{merchantName}</div>
                <div className="text-xs font-bold text-pink-600">
                  {bankName} • {accountNum}
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="mt-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAccount ? 'បានចម្លងរួច!' : 'ចម្លងលេខគណនី'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                អាចស្កេនទូទាត់បានជាមួយគ្រប់ App ធនាគារ (ABA, ACLEDA, Bakong, Wing, Canadia...)
              </p>
            </div>

            {/* Payment Slip Upload */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                <span>🧾 បញ្ចូលរូបបង្កាន់ដៃបង់ប្រាក់កក់ (Upload Payment Slip / Screenshot) *</span>
                <span className="text-[10px] text-rose-500 font-bold">សំខាន់ដើម្បីបញ្ជាក់</span>
              </label>

              <div className="flex items-center gap-3">
                {bankSlipImage ? (
                  <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
                    <img
                      src={getProductImageUrl(bankSlipImage)}
                      alt="Bank Slip"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBankSlipImage('')}
                      className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity"
                    >
                      ប្តូរ
                    </button>
                  </div>
                ) : null}

                <label className="flex-1 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center">
                  <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-bold text-slate-700">
                    {isUploadingSlip ? 'កំពុងបញ្ចូលរូប...' : bankSlipImage ? 'បានជ្រើសរូបវិក្កយបត្ររួច ✓' : 'ចុចទីនេះដើម្បី Upload រូប Screenshot ពី App ធនាគារ'}
                  </span>
                  <span className="text-[10px] text-slate-400">ដើម្បីឱ្យហាងយើងខ្ញុំដឹងថាលោកអ្នកបានបង់ប្រាក់កក់</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBankSlipUpload}
                    className="hidden"
                    disabled={isUploadingSlip}
                  />
                </label>
              </div>
            </div>

            {/* Submit Order Button */}
            <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { soundFx.playPop(); setStep(3); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                ត្រឡប់ក្រោយ
              </button>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-xl shadow-pink-500/30 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>កំពុងបញ្ជូនការកុម្ម៉ង់...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>បញ្ជាក់ការកុម្ម៉ង់ & បង់ប្រាក់កក់ឥឡូវនេះ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: CONFIRMATION & CELEBRATION */}
        {/* ========================================================================= */}
        {step === 5 && confirmedOrder && (
          <div className="max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
            {/* Celebration Banner */}
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-xl text-center space-y-3 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-md animate-bounce">
                🎉
              </div>

              <div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full inline-block">
                  ការកុម្ម៉ង់ទទួលបានជោគជ័យ!
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
                  អរគុណសម្រាប់ការកុម្ម៉ង់នំ!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ហាងយើងខ្ញុំបានទទួលការកុម្ម៉ង់ និងប្រាក់កក់របស់អ្នករួចរាល់ហើយ។
                </p>
              </div>

              {/* Order Number Badge */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">លេខកូដកុម្ម៉ង់ (Order ID)៖</span>
                  <span className="text-base font-black text-pink-600">{confirmedOrder.orderNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(confirmedOrder.orderNumber);
                    setCopiedOrderNumber(true);
                    soundFx.playPop();
                    setTimeout(() => setCopiedOrderNumber(false), 2000);
                  }}
                  className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors"
                  title="ចម្លងលេខកូដ"
                >
                  {copiedOrderNumber ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Summary Details */}
              <div className="text-left bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">នំកុម្ម៉ង់៖</span>
                  <span className="font-black text-slate-800">{confirmedOrder.cakeName} ({confirmedOrder.size})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">រសជាតិ៖</span>
                  <span className="font-bold text-slate-700">{confirmedOrder.flavor}</span>
                </div>
                {confirmedOrder.inscription && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">អក្សរលើនំ៖</span>
                    <span className="font-bold text-pink-700 italic">"{confirmedOrder.inscription}"</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">ថ្ងៃ & ម៉ោងមកយក៖</span>
                  <span className="font-black text-amber-700">
                    {confirmedOrder.pickupDate} ម៉ោង {confirmedOrder.pickupTime}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-rose-100">
                  <span className="text-slate-500">ប្រាក់កក់បានបង់៖</span>
                  <span className="font-black text-emerald-600">
                    ${confirmedOrder.depositUsd.toFixed(2)} ({(confirmedOrder.depositKhr || 0).toLocaleString()} ៛)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">នៅសល់ពេលមកយក៖</span>
                  <span className="font-black text-rose-600">
                    ${(confirmedOrder.totalUsd - confirmedOrder.depositUsd).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions: Chat on Telegram / Call / New Order */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={`tel:${storeInfo.phone || '012345678'}`}
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>ខលទាក់ទងមកហាង ({storeInfo.phone || '012 345 678'})</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setStep(1);
                    setSelectedProduct(null);
                    setReferenceImage('');
                    setBankSlipImage('');
                    setInscription('');
                    setSpecialNotes('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
                >
                  + កុម្ម៉ង់នំមួយទៀត
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
