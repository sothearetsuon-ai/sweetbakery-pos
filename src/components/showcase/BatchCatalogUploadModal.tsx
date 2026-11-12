import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Layers,
  Tag,
  FolderPlus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { compressImageFile } from '../../utils/imageCompressor';
import { soundFx } from '../../utils/audio';
import { Product } from '../../types';

interface BatchCatalogUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdCount: number) => void;
}

interface ImageItem {
  file: File;
  previewUrl: string;
  name: string;
}

export const BatchCatalogUploadModal: React.FC<BatchCatalogUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { batchAddProducts, categories, exchangeRate } = useBakery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('cake');
  const [namePrefix, setNamePrefix] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Clean filename to friendly Khmer/English cake name
  const cleanFileName = (filename: string, index: number): string => {
    // Remove extension
    const base = filename.replace(/\.[^/.]+$/, '').trim();
    // If prefix is specified, use prefix + index
    if (namePrefix.trim()) {
      return `${namePrefix.trim()} #${String(index + 1).padStart(2, '0')}`;
    }
    // Clean underscores/dashes
    const cleaned = base.replace(/[-_]+/g, ' ').trim();
    // If name is meaningless (like IMG_1234 or DCIM), use default
    if (/^(img|image|photo|p|pic|screenshot|camera|\d+)/i.test(cleaned) || cleaned.length < 3) {
      return `ម៉ូដនំកាតាឡុក #${index + 1}`;
    }
    return cleaned;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundFx.playPop();
    const newItems: ImageItem[] = [];
    const startIndex = images.length;

    Array.from(files).forEach((file, idx) => {
      if (!file.type.startsWith('image/')) return;
      const previewUrl = URL.createObjectURL(file);
      const name = cleanFileName(file.name, startIndex + idx);
      newItems.push({ file, previewUrl, name });
    });

    setImages((prev) => [...prev, ...newItems]);
    setErrorMsg('');

    // Reset input so user can re-select same files if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    soundFx.playPop();
    setImages((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      const updated = prev.filter((_, i) => i !== index);
      // Re-index names if prefix is used
      if (namePrefix.trim()) {
        return updated.map((item, idx) => ({
          ...item,
          name: `${namePrefix.trim()} #${String(idx + 1).padStart(2, '0')}`,
        }));
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    soundFx.playPop();
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setErrorMsg('');
  };

  const handleApplyPrefix = (prefix: string) => {
    setNamePrefix(prefix);
    if (!prefix.trim()) return;
    setImages((prev) =>
      prev.map((item, idx) => ({
        ...item,
        name: `${prefix.trim()} #${String(idx + 1).padStart(2, '0')}`,
      }))
    );
  };

  const handleUploadAndSave = async () => {
    if (images.length === 0) {
      setErrorMsg('សូមជ្រើសរើសរូបភាពនំយ៉ាងហោចណាស់ ១ សន្លឹក');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: images.length });
    setErrorMsg('');

    try {
      const productsToCreate: Array<Omit<Product, 'id'>> = [];

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setProgress({ current: i + 1, total: images.length });

        // Compress image using client-side canvas compressor (800x800 ~50KB)
        let compressedDataUrl = '';
        try {
          compressedDataUrl = await compressImageFile(item.file, 800, 800, 0.82);
        } catch {
          // Fallback to FileReader if compression fails
          compressedDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) || '');
            reader.readAsDataURL(item.file);
          });
        }

        const finalName = item.name.trim() || `ម៉ូដនំកាតាឡុក #${i + 1}`;

        productsToCreate.push({
          nameKh: finalName,
          nameEn: finalName,
          priceUsd: 0,
          priceKhr: 0,
          costPriceUsd: 0,
          costPriceKhr: 0,
          stockQty: 999, // Catalog pre-order items don't have stock limits
          unit: 'ដុំ',
          categoryId: selectedCategory || 'cake',
          imageUrl: compressedDataUrl,
          images: [compressedDataUrl],
          displayTarget: 'CATALOG', // Placed specifically in Catalog (separated from POS showcase)
          description: 'ម៉ូដនំសម្រាប់កុម្ម៉ង់ (តម្លៃផ្អែកលើទំហំ និងម៉ូដ)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Batch save all products into BakeryContext atomically
      const created = batchAddProducts(productsToCreate);

      // Play success celebration
      soundFx.playSuccess();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Cleanup preview URLs
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
      setIsProcessing(false);

      if (onSuccess) {
        onSuccess(created.length);
      }
      onClose();
    } catch (err: any) {
      console.error('Batch upload error:', err);
      setIsProcessing(false);
      setErrorMsg('មានបញ្ហាក្នុងការ Upload រូបភាព៖ ' + (err?.message || 'សូមព្យាយាមម្តងទៀត'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-rose-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-500 via-pink-500 to-[#E6514D] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">
              📸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg font-muol tracking-tight">
                  Upload រូបនំកាតាឡុកម្តងច្រើន
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] uppercase shadow-xs">
                  Bulk Upload
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-pink-100 font-battambang font-medium">
                ជ្រើសរើសរូបនំច្រើនសន្លឹកក្នុងពេលតែមួយ ប្រព័ន្ធនឹងរៀបចំជានំមួយៗក្នុងកាតាឡុកដោយស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-white cursor-pointer disabled:opacity-50"
            title="បិទ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 font-battambang flex-1">
          {/* Info Banner: Explains that prices and names are NOT required */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl flex items-start gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div className="text-xs text-amber-900 leading-relaxed font-medium">
              <strong className="font-black text-amber-950 block mb-0.5">
                មិនចាំបាច់កំណត់តម្លៃ និងឈ្មោះនំឡើយ៖
              </strong>
              រូបភាពនំនីមួយៗនឹងត្រូវបង្កើតជាកាតាឡុកដាច់ដោយឡែកពីគ្នា (១ រូប = ១ ម៉ូដនំ) និងកំណត់ជា{' '}
              <span className="font-bold text-rose-700">«📖 កាតាឡុកភ្ញៀវមើល»</span> ស្វ័យប្រវត្តិ (មិនចូលលាយឡំជាមួយផ្ទាំងលក់ POS ឡើយ)។ តម្លៃនឹងបង្ហាញជា{' '}
              <span className="font-bold text-slate-800">«តម្លៃតាមម៉ូដ & ទំហំ»</span> យ៉ាងស្រស់ស្អាត!
            </div>
          </div>

          {/* Drag & Drop Upload Trigger Zone */}
          <div
            onClick={() => {
              if (!isProcessing) fileInputRef.current?.click();
            }}
            className="border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50/80 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all group flex flex-col items-center justify-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-rose-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-800 group-hover:text-rose-600 transition-colors">
                ចុចទីនេះដើម្បីជ្រើសរើសរូបភាពនំច្រើនសន្លឹក
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                អាចជ្រើសរើស 5, 10, 20 ឬ 50+ រូបក្នុងពេលតែមួយ (JPG, PNG, WebP)
              </div>
            </div>
            <div className="mt-1 px-3 py-1 rounded-full bg-white text-rose-600 border border-rose-200 text-[11px] font-bold shadow-2xs">
              + ចុចរើសរូបពីទូរស័ព្ទ ឬកុំព្យូទ័រ
            </div>
          </div>

          {/* Quick Optional Configuration Bar (Category & Name Prefix) */}
          {images.length > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-500" />
                  <span>ប្រភេទទំនិញ (Category)</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={isProcessing}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="cake">🎂 នំខួបកំណើត (Cake - លំនាំដើម)</option>
                  {categories
                    .filter((c) => c.id !== 'party' && c.id !== 'cake')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameKh} ({c.nameEn})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  <span>ឈ្មោះសម្គាល់រួម (ស្រេចចិត្ត / Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ម៉ូដនំកាតាឡុក, នំរូបតុក្កតា..."
                  value={namePrefix}
                  onChange={(e) => handleApplyPrefix(e.target.value)}
                  disabled={isProcessing}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Selected Images List / Preview Grid */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>រូបនំបានជ្រើសរើស៖</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-mono font-black">
                    {images.length} សន្លឹក
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>សម្អាតទាំងអស់</span>
                </button>
              </div>

              {/* Grid of thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 sm:max-h-72 overflow-y-auto p-2 bg-slate-50/70 border border-slate-200/60 rounded-2xl">
                {images.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Index Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-black px-1.5 py-0.2 rounded-md">
                      #{idx + 1}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      disabled={isProcessing}
                      className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 active:scale-90 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      title="លុបរូបនេះចេញ"
                    >
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    {/* Thumbnail Image */}
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-100">
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Name Input for this specific cake item */}
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setImages((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, name: newName } : it))
                        );
                      }}
                      disabled={isProcessing}
                      className="text-[11px] font-bold text-slate-800 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-300 rounded-lg px-1.5 py-1 w-full truncate focus:outline-none focus:border-rose-400"
                      title="ចុចដើម្បីកែឈ្មោះរូបនេះ (ស្រេចចិត្ត)"
                    />
                  </div>
                ))}

                {/* Add More button inside grid */}
                <div
                  onClick={() => {
                    if (!isProcessing) fileInputRef.current?.click();
                  }}
                  className="aspect-square rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 bg-white hover:bg-rose-50/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-slate-400 hover:text-rose-600"
                >
                  <FolderPlus className="w-6 h-6" />
                  <span className="text-[11px] font-bold">+ បន្ថែមរូបទៀត</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar during compression & save */}
          {isProcessing && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-black text-rose-700">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុង Optimize និងបញ្ចូលរូបភាពចូលកាតាឡុក...</span>
                </span>
                <span className="font-mono">
                  {progress.current} / {progress.total} (
                  {Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-rose-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-200 rounded-full"
                  style={{
                    width: `${Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block font-battambang">
            {images.length > 0 ? (
              <span>
                រួចរាល់សម្រាប់ Upload៖ <strong className="text-rose-600">{images.length} ម៉ូដនំ</strong>
              </span>
            ) : (
              <span>សូមជ្រើសរើសរូបភាពនំដើម្បីចាប់ផ្តើម</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              onClick={handleUploadAndSave}
              disabled={isProcessing || images.length === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-[#E6514D] hover:brightness-110 text-white font-black text-xs transition-all shadow-md shadow-rose-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុងបញ្ចូល ({progress.current}/{progress.total})...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    Upload ចូលកាតាឡុក {images.length > 0 ? `(${images.length} ម៉ូដនំ)` : ''} 🚀
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
