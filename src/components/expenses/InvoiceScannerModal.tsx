import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Key,
  RefreshCw,
  FileText,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Boxes,
  Percent,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { ExpenseCategory, ExpenseType } from '../../types';
import { soundFx } from '../../utils/audio';
import {
  getGeminiApiKey,
  getGeminiApiKeyAsync,
  setGeminiApiKey,
  compressImage,
  scanInvoiceWithGemini,
  testGeminiApiKey,
  ExtractedInvoice,
  ExtractedInvoiceItem,
} from '../../services/geminiInvoiceService';

interface InvoiceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InvoiceScannerModal: React.FC<InvoiceScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addExpense, ingredients, addIngredient, restockIngredient, exchangeRate, reserveFund } =
    useBakery();

  // API Key State
  const [apiKey, setApiKeyState] = useState<string>(getGeminiApiKey());
  const [isKeyConfigOpen, setIsKeyConfigOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<'IDLE' | 'TESTING' | 'VALID' | 'INVALID'>('IDLE');
  const [keyTestMessage, setKeyTestMessage] = useState<string>('');

  // Scanning State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Extracted Invoice State
  const [extractedData, setExtractedData] = useState<ExtractedInvoice | null>(null);
  const [supplier, setSupplier] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_KHR' | 'CASH_USD' | 'BANK_TRANSFER' | 'RESERVE_FUND'>('CASH_KHR');
  const [paidBy, setPaidBy] = useState('Admin');
  const [items, setItems] = useState<ExtractedInvoiceItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewImageModalOpen, setIsPreviewImageModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyChange = (e: any) => {
      const newKey = e.detail?.apiKey || getGeminiApiKey();
      if (newKey) {
        setApiKeyState(newKey);
        setKeyInput(newKey);
      }
    };
    window.addEventListener('sweetbakery_gemini_api_key_changed', handleKeyChange);

    if (isOpen) {
      const savedKey = getGeminiApiKey();
      setApiKeyState(savedKey);
      setKeyInput(savedKey);
      if (!savedKey) {
        // Fallback asynchronously check IndexedDB (for mobile devices)
        getGeminiApiKeyAsync().then((asyncKey) => {
          if (asyncKey) {
            setApiKeyState(asyncKey);
            setKeyInput(asyncKey);
          } else {
            setIsKeyConfigOpen(true);
          }
        });
      }
    }

    return () => {
      window.removeEventListener('sweetbakery_gemini_api_key_changed', handleKeyChange);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Save API Key
  const handleSaveApiKey = () => {
    const trimmed = keyInput.trim();
    setGeminiApiKey(trimmed, true);
    setApiKeyState(trimmed);
    soundFx.playSuccess();
    setIsKeyConfigOpen(false);
  };

  // Test API Key
  const handleTestApiKey = async () => {
    if (!keyInput.trim()) return;
    setKeyTestStatus('TESTING');
    setKeyTestMessage('');
    const res = await testGeminiApiKey(keyInput.trim());
    setKeyTestStatus(res.valid ? 'VALID' : 'INVALID');
    setKeyTestMessage(res.message || '');
    if (res.valid) {
      soundFx.playSuccess();
      const trimmed = keyInput.trim();
      setGeminiApiKey(trimmed);
      setApiKeyState(trimmed);
    } else {
      soundFx.playNotificationAlert();
    }
  };

  // Handle Image Selection
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setScanError('សូមជ្រើសរើសឯកសារជារូបភាព (JPG, PNG, WebP)');
      return;
    }

    try {
      soundFx.playPop();
      setScanError(null);
      setIsScanning(true);

      // Fast Canvas Compression
      const compressedBase64 = await compressImage(file, 1600, 1600, 0.85);
      setSelectedImage(compressedBase64);

      // Call Gemini Vision AI using active/entered key
      const effectiveKey = keyInput.trim() || apiKey || getGeminiApiKey();
      const result = await scanInvoiceWithGemini(compressedBase64, effectiveKey, exchangeRate);

      setExtractedData(result);
      setSupplier(result.supplier || 'អ្នកផ្គត់ផ្គង់ទូទៅ');
      setInvoiceDate(result.date || new Date().toISOString().split('T')[0]);
      setItems(result.items);
      // Select all by default
      setSelectedItemIds(new Set(result.items.map((i) => i.id)));

      soundFx.playSuccess();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error('OCR Scan Error:', err);
      setScanError(err.message || 'មិនអាចអានវិក្កយបត្របានទេ សូមពិនិត្យ API Key ឬរូបភាពម្តងទៀត');
      soundFx.playNotificationAlert();
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle item selection
  const toggleSelectItem = (id: string) => {
    soundFx.playPop();
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle all items
  const toggleSelectAll = () => {
    soundFx.playPop();
    if (selectedItemIds.size === items.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(items.map((i) => i.id)));
    }
  };

  // Update item field
  const updateItem = (id: string, updates: Partial<ExtractedInvoiceItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };

        // Recalculate total if qty or unit price changed
        if ('quantity' in updates || 'unitPriceKhr' in updates) {
          updated.totalKhr = Math.round(updated.quantity * updated.unitPriceKhr);
        }

        // Recalculate retail if wholesale changed
        if (updated.isWholesale && updated.wholesalePackQty && updated.wholesalePackQty > 0) {
          updated.retailUnitCostKhr = Math.round(
            updated.totalKhr / (updated.quantity * updated.wholesalePackQty)
          );
          const margin = updated.retailProfitMarginPct || 30;
          updated.retailSellingPriceKhr =
            Math.ceil((updated.retailUnitCostKhr * (1 + margin / 100)) / 100) * 100;
        }

        return updated;
      })
    );
  };

  // Delete item row
  const deleteItem = (id: string) => {
    soundFx.playPop();
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Add a new blank item row
  const addNewItem = () => {
    soundFx.playPop();
    const newItem: ExtractedInvoiceItem = {
      id: `item_manual_${Date.now()}`,
      name: '',
      category: 'INGREDIENTS',
      mainType: 'INGREDIENT',
      quantity: 1,
      unit: 'ដុំ',
      unitPriceKhr: 0,
      totalKhr: 0,
      addToStock: true,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItemIds((prev) => new Set([...prev, newItem.id]));
  };

  // Summary of selected items
  const selectedItems = items.filter((item) => selectedItemIds.has(item.id));
  const totalSelectedKhr = selectedItems.reduce((sum, item) => sum + item.totalKhr, 0);
  const totalSelectedUsd = Number((totalSelectedKhr / exchangeRate).toFixed(2));

  // Batch Import handler
  const handleBatchImport = async () => {
    if (selectedItems.length === 0) {
      alert('សូមជ្រើសរើសមុខទំនិញយ៉ាងហោចណាស់ ១ មុខដើម្បីបញ្ចូល!');
      return;
    }

    try {
      setIsImporting(true);
      soundFx.playPop();

      for (const item of selectedItems) {
        // 1. Save as Expense
        const expensePayload = {
          title: item.name.trim(),
          expenseType: item.mainType,
          category: item.category,
          supplier: supplier.trim(),
          quantity: item.quantity,
          unit: item.unit.trim(),
          unitPriceKhr: item.unitPriceKhr,
          unitPriceUsd: Number((item.unitPriceKhr / exchangeRate).toFixed(2)),
          amountKhr: item.totalKhr,
          amountUsd: Number((item.totalKhr / exchangeRate).toFixed(2)),
          paidBy: paidBy.trim() || 'Admin',
          paymentMethod: paymentMethod,
          paymentStatus: 'PAID' as const,
          date: invoiceDate || new Date().toISOString().split('T')[0],
          notes: extractedData?.invoiceNumber
            ? `វិក្កយបត្រ៖ ${extractedData.invoiceNumber} (ស្កេនដោយ AI)`
            : 'ស្កេនវិក្កយបត្រដោយ AI',
          // Wholesale & Retail Selling Price metadata
          wholesalePackQty: item.isWholesale ? item.wholesalePackQty : undefined,
          wholesalePackUnit: item.isWholesale ? item.wholesalePackUnit || item.unit : undefined,
          retailUnit: item.retailUnit,
          retailUnitCostKhr: item.retailUnitCostKhr,
          retailProfitMarginPct: item.retailProfitMarginPct,
          retailSellingPriceKhr: item.retailSellingPriceKhr,
          retailSellingPriceUsd: item.retailSellingPriceKhr
            ? Number((item.retailSellingPriceKhr / exchangeRate).toFixed(2))
            : undefined,
        };

        addExpense(expensePayload);

        // 2. Add to Stock / Inventory if checked
        if (item.addToStock && item.mainType === 'INGREDIENT') {
          const trimmedName = item.name.trim().toLowerCase();
          const existing = ingredients.find(
            (ing) => ing.nameKh.toLowerCase() === trimmedName || ing.nameEn?.toLowerCase() === trimmedName
          );

          if (existing) {
            restockIngredient(existing.id, item.quantity);
          } else {
            addIngredient({
              nameKh: item.name.trim(),
              nameEn: item.name.trim(),
              currentStock: item.quantity,
              unit: item.unit.trim() || 'ដុំ',
              minAlertStock: 5,
              costPerUnitKhr: item.unitPriceKhr,
              costPerUnitUsd: Number((item.unitPriceKhr / exchangeRate).toFixed(2)),
              supplier: supplier.trim(),
            });
          }
        }
      }

      soundFx.playSuccess();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Batch import failed:', err);
      alert('មានបញ្ហាក្នុងការបញ្ចូលទិន្នន័យ៖ ' + (err.message || 'សូមព្យាយាមម្តងទៀត'));
    } finally {
      setIsImporting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-600 p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <span>ស្កេនវិក្កយបត្រដោយ AI</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900 shadow-xs">
                  Gemini Flash Vision
                </span>
              </h2>
              <p className="text-xs text-rose-100 mt-0.5">
                ថតរូប ឬ Upload វិក្កយបត្រដើម្បីបំបែកមុខទំនិញ គណនាតម្លៃដើម និងបញ្ចូលស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setIsKeyConfigOpen(!isKeyConfigOpen);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                !apiKey
                  ? 'bg-amber-400 text-slate-950 border-amber-300 animate-bounce'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
              }`}
              title="កំណត់ Gemini API Key"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">{!apiKey ? 'បញ្ចូល API Key' : 'API Key'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Drawer / Configuration Modal */}
        {isKeyConfigOpen && (
          <div className="bg-amber-50/95 border-b border-amber-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-amber-950 text-sm">កំណត់ Google Gemini API Key (ឥតគិតថ្លៃ ១០០%)</h3>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
              >
                <span>យក API Key ឥតគិតថ្លៃនៅទីនេះ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-amber-800 leading-relaxed">
              Google Gemini Vision ផ្តល់ការប្រើប្រាស់ Free Tier ដ៏ច្រើនសន្ធឹកសន្ធាប់ជារៀងរាល់ថ្ងៃ។
              សូមចូលទៅកាន់ Google AI Studio ចុច <strong>"Create API Key"</strong> រួចចម្លងមកបិទភ្ជាប់ (Paste) ក្នុងប្រអប់ខាងក្រោម៖
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value);
                    setKeyTestStatus('IDLE');
                  }}
                  placeholder="បិទភ្ជាប់ (Paste) API Key របស់អ្នកនៅទីនេះ..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-amber-300 bg-white text-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title={showKey ? 'លាក់ Key' : 'បង្ហាញ Key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={!keyInput.trim() || keyTestStatus === 'TESTING'}
                  className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  {keyTestStatus === 'TESTING' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : keyTestStatus === 'VALID' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    'តេស្ត'
                  )}
                  <span>
                    {keyTestStatus === 'VALID'
                      ? 'ជោគជ័យ ✓'
                      : keyTestStatus === 'INVALID'
                      ? 'មិនត្រឹមត្រូវ ✗'
                      : 'តេស្ត Key'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={!keyInput.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  រក្សាទុក Key
                </button>
              </div>
            </div>

            {keyTestMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                  keyTestStatus === 'VALID'
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-rose-100 text-rose-950 border border-rose-300'
                }`}
              >
                {keyTestStatus === 'VALID' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{keyTestMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Step 1: Upload / Capture if no items or want to re-scan */}
          {!extractedData && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-3xl p-6 sm:p-10 text-center transition-all">
                {isScanning ? (
                  <div className="py-8 space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-75" />
                      <div className="relative w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30">
                        <Sparkles className="w-10 h-10 animate-spin" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-base">AI កំពុងវិភាគវិក្កយបត្រ...</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        កំពុងអានអក្សរខ្មែរ លេខកត់ដៃ តារាងមុខទំនិញ និងគណនាតម្លៃដើមរាយដោយស្វ័យប្រវត្តិ
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600">
                      <Camera className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 text-base sm:text-lg">
                        ថតរូប ឬ ជ្រើសរើសរូបភាពវិក្កយបត្រ
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        គាំទ្រវិក្កយបត្រទិញគ្រឿងផ្សំ សម្ភារៈតុបតែង និងចំណាយផ្សេងៗ (អានទាំងអក្សរខ្មែរ និងអង់គ្លេស)
                      </p>
                    </div>

                    {/* Hidden inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          cameraInputRef.current?.click();
                        }}
                        className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-5 h-5" />
                        <span>📷 បើកកាមេរ៉ាថតភ្លាមៗ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          fileInputRef.current?.click();
                        }}
                        className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <Upload className="w-5 h-5 text-indigo-600" />
                        <span>🖼️ រូបភាពក្នុងម៉ាស៊ីន (Upload)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {scanError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-rose-900 text-xs">ការស្កេនមិនជោគជ័យ</h4>
                    <p className="text-xs text-rose-700 leading-relaxed">{scanError}</p>
                    {(scanError.toLowerCase().includes('high demand') || scanError.includes('កកកុញ')) && (
                      <div className="text-[11px] text-amber-900 font-bold bg-amber-100/80 p-2.5 rounded-xl border border-amber-300 mt-2 flex items-center gap-2">
                        <span>⏳</span>
                        <span>
                          ម៉ាស៊ីនមេ Google កំពុងមានអ្នកប្រើប្រាស់កកកុញច្រើន (High Demand)។ សូមរង់ចាំប្រហែល ៥ ទៅ ១០ វិនាទី រួចចុចស្កេនរូបភាពម្តងទៀត!
                        </span>
                      </div>
                    )}
                    {!apiKey && (
                      <button
                        type="button"
                        onClick={() => setIsKeyConfigOpen(true)}
                        className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                      >
                        → ចុចទីនេះដើម្បីបញ្ចូល Gemini API Key
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Extracted Results & Review Table */}
          {extractedData && (
            <div className="space-y-5 animate-fade-in">
              {/* Header Bar with Image Thumbnail & Global Invoice Info */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    {selectedImage && (
                      <div
                        onClick={() => setIsPreviewImageModalOpen(true)}
                        className="relative group cursor-pointer w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shadow-xs shrink-0"
                        title="ចុចដើម្បីពង្រីកមើលរូបភាពវិក្កយបត្រ"
                      >
                        <img src={selectedImage} alt="Receipt" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-sm">
                          {supplier || 'អ្នកផ្គត់ផ្គង់'}
                        </h3>
                        {extractedData.invoiceNumber && (
                          <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            #{extractedData.invoiceNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        បានរកឃើញ {items.length} មុខទំនិញ • កាលបរិច្ឆេទ {invoiceDate}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setExtractedData(null);
                      setSelectedImage(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ស្កេនរូបផ្សេង</span>
                  </button>
                </div>

                {/* Editable Global Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">🏪 អ្នកផ្គត់ផ្គង់ / ហាង</label>
                    <input
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="ឧ. ហាងលក់គ្រឿងផ្សំនំ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">📅 កាលបរិច្ឆេទ</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">💳 វិធីទូទាត់</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="CASH_KHR">💵 សាច់ប្រាក់រៀល (៛)</option>
                      <option value="CASH_USD">💵 សាច់ប្រាក់ដុល្លារ ($)</option>
                      <option value="BANK_TRANSFER">📱 ផ្ទេរប្រាក់ (ABA / Bakong)</option>
                      <option value="RESERVE_FUND">🏦 ទុនបម្រុងហាង (Reserve Fund)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">👤 ចំណាយដោយ</label>
                    <input
                      type="text"
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      placeholder="ឧ. Admin / Cashier"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Items List / Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItemIds.size === items.length && items.length > 0}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-0 cursor-pointer pointer-events-none"
                      />
                      <span>ជ្រើសរើសទាំងអស់ ({selectedItemIds.size}/{items.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={addNewItem}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ថែមមុខទំនិញ</span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    អ្នកអាចកែសម្រួលតម្លៃ ចំនួន ឬកំណត់តម្លៃលក់រាយមុននឹងបញ្ចូល
                  </span>
                </div>

                {/* Items Container */}
                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const isSelected = selectedItemIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-3.5 sm:p-4 transition-all space-y-3 ${
                          isSelected
                            ? 'bg-white border-indigo-200 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 opacity-60'
                        }`}
                      >
                        {/* Row 1: Checkbox, Name, Category, MainType, Delete */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectItem(item.id)}
                              className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                            <div className="flex-1 space-y-1">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                placeholder="ឈ្មោះមុខទំនិញ..."
                                className="w-full font-black text-slate-900 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5"
                              />

                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Main Type Badge */}
                                <select
                                  value={item.mainType}
                                  onChange={(e) => {
                                    const val = e.target.value as ExpenseType;
                                    updateItem(item.id, {
                                      mainType: val,
                                      category:
                                        val === 'INGREDIENT'
                                          ? 'INGREDIENTS'
                                          : val === 'SUPPLY'
                                          ? 'SUPPLIES'
                                          : 'OTHER',
                                      addToStock: val === 'INGREDIENT' || val === 'SUPPLY',
                                    });
                                  }}
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-lg border cursor-pointer ${
                                    item.mainType === 'INGREDIENT'
                                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                                      : item.mainType === 'SUPPLY'
                                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                                      : 'bg-sky-100 text-sky-900 border-sky-300'
                                  }`}
                                >
                                  <option value="INGREDIENT">🌾 គ្រឿងផ្សំ</option>
                                  <option value="SUPPLY">📦 សម្ភារៈ</option>
                                  <option value="GENERAL">🏢 ចំណាយទូទៅ</option>
                                </select>

                                {/* Category Dropdown */}
                                <select
                                  value={item.category}
                                  onChange={(e) =>
                                    updateItem(item.id, { category: e.target.value as ExpenseCategory })
                                  }
                                  className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                                >
                                  <option value="INGREDIENTS">គ្រឿងផ្សំធ្វើនំ</option>
                                  <option value="PACKAGING">ប្រអប់/ថង់វិចខ្ចប់</option>
                                  <option value="SUPPLIES">សម្ភារៈតុបតែង/ទៀន</option>
                                  <option value="UTILITIES">ទឹក/ភ្លើង/ហ្គាស</option>
                                  <option value="MAINTENANCE">ជួសជុល/ថែទាំ</option>
                                  <option value="OTHER">ចំណាយផ្សេងៗ</option>
                                </select>

                                {/* Stock Sync Checkbox */}
                                <label className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 cursor-pointer bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(item.addToStock)}
                                    onChange={(e) => updateItem(item.id, { addToStock: e.target.checked })}
                                    className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                                  />
                                  <span>📦 ថែមចូលស្តុក</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="លុបមុខទំនិញនេះចេញ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Row 2: Qty, Unit, Unit Price, Total */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block">ចំនួន</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(item.id, { quantity: Number(e.target.value) || 0 })
                                }
                                className="w-16 px-2 py-1 bg-white rounded-lg border border-slate-300 font-black text-slate-900 text-xs"
                              />
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                                placeholder="ខ្នាត"
                                className="w-14 px-2 py-1 bg-white rounded-lg border border-slate-300 font-bold text-slate-800 text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              តម្លៃឯកតា (៛)
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={item.unitPriceKhr}
                              onChange={(e) =>
                                updateItem(item.id, { unitPriceKhr: Number(e.target.value) || 0 })
                              }
                              className="w-full mt-0.5 px-2 py-1 bg-white rounded-lg border border-slate-300 font-black text-slate-900 text-xs"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block">សរុប (៛)</span>
                            <div className="font-black text-rose-600 text-sm mt-1">
                              {item.totalKhr.toLocaleString()} ៛
                            </div>
                          </div>

                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] text-slate-500 font-semibold block">ជាដុល្លារ</span>
                            <div className="font-bold text-slate-600 text-xs mt-1">
                              ~ ${(item.totalKhr / exchangeRate).toFixed(2)} USD
                            </div>
                          </div>
                        </div>

                        {/* Row 3: Wholesale-to-Retail Auto Calculator inside item */}
                        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-2.5 text-xs space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <label className="inline-flex items-center gap-1.5 font-bold text-emerald-950 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(item.isWholesale)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  updateItem(item.id, {
                                    isWholesale: checked,
                                    wholesalePackQty: checked ? item.wholesalePackQty || 12 : undefined,
                                    wholesalePackUnit: checked ? item.unit || 'កេស' : undefined,
                                    retailUnit: checked ? item.retailUnit || 'ដុំ' : undefined,
                                    retailProfitMarginPct: checked ? item.retailProfitMarginPct || 30 : undefined,
                                  });
                                }}
                                className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                              />
                              <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ទិញដុំ (គណនាតម្លៃដើមរាយ & តម្លៃលក់រាយ)</span>
                            </label>

                            {item.isWholesale && item.retailSellingPriceKhr && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black text-[11px] border border-emerald-300">
                                <span>🏷️ លក់រាយណែនាំ៖ {item.retailSellingPriceKhr.toLocaleString()} ៛</span>
                                <span className="text-emerald-700 font-normal">
                                  (+{item.retailProfitMarginPct}%)
                                </span>
                              </span>
                            )}
                          </div>

                          {item.isWholesale && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-200/60">
                              <div>
                                <span className="text-[10px] text-emerald-900 font-semibold block">
                                  ចំនួនរាយក្នុង ១ {item.unit}
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.wholesalePackQty || 12}
                                  onChange={(e) =>
                                    updateItem(item.id, {
                                      wholesalePackQty: Number(e.target.value) || 1,
                                    })
                                  }
                                  className="w-full mt-0.5 px-2 py-1 bg-white rounded-lg border border-emerald-300 font-bold text-slate-800 text-xs"
                                />
                              </div>

                              <div>
                                <span className="text-[10px] text-emerald-900 font-semibold block">
                                  ខ្នាតរាយ
                                </span>
                                <input
                                  type="text"
                                  value={item.retailUnit || 'ដុំ'}
                                  onChange={(e) => updateItem(item.id, { retailUnit: e.target.value })}
                                  placeholder="ដុំ / ដើម"
                                  className="w-full mt-0.5 px-2 py-1 bg-white rounded-lg border border-emerald-300 font-bold text-slate-800 text-xs"
                                />
                              </div>

                              <div>
                                <span className="text-[10px] text-emerald-900 font-semibold block">
                                  ថ្លៃដើមរាយ
                                </span>
                                <div className="font-black text-emerald-800 text-xs mt-1.5">
                                  {item.retailUnitCostKhr ? item.retailUnitCostKhr.toLocaleString() : 0} ៛/{item.retailUnit || 'រាយ'}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-emerald-900 font-semibold block">
                                  % ចំណេញ
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.retailProfitMarginPct || 30}
                                    onChange={(e) =>
                                      updateItem(item.id, {
                                        retailProfitMarginPct: Number(e.target.value) || 0,
                                      })
                                    }
                                    className="w-16 px-2 py-1 bg-white rounded-lg border border-emerald-300 font-bold text-slate-800 text-xs"
                                  />
                                  <span className="text-emerald-800 font-bold">%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {extractedData && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-500">បានជ្រើសរើស៖</span>
              <span className="text-sm font-black text-slate-900">
                {selectedItems.length} / {items.length} មុខ
              </span>
              <span className="text-slate-300 mx-1">•</span>
              <span className="text-sm font-black text-rose-600">
                {totalSelectedKhr.toLocaleString()} ៛
              </span>
              <span className="text-xs font-bold text-slate-500">
                (~${totalSelectedUsd.toFixed(2)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                បោះបង់
              </button>

              <button
                type="button"
                onClick={handleBatchImport}
                disabled={selectedItems.length === 0 || isImporting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                {isImporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>✓ បញ្ចូល {selectedItems.length} មុខទៅក្នុងប្រព័ន្ធ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enlarged Image Preview Modal */}
      {isPreviewImageModalOpen && selectedImage && (
        <div
          onClick={() => setIsPreviewImageModalOpen(false)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Enlarged Receipt"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setIsPreviewImageModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};
