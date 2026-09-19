import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Plus, DollarSign, Sparkles, Trash2, Star, Check, Loader2, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { compressImageFile } from '../../utils/imageCompressor';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { Product } from '../../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { lang, categories, addProduct, updateProduct, exchangeRate } = useBakery();
  const text = t[lang];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [categoryId, setCategoryId] = useState('birthday');
  const [priceKhr, setPriceKhr] = useState('90000');
  const [costPriceKhr, setCostPriceKhr] = useState('40000');
  const [stockQty, setStockQty] = useState('10');
  const [unit, setUnit] = useState('នំ');
  const [description, setDescription] = useState('');
  
  // Multi-image state
  const [images, setImages] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (productToEdit) {
      setNameKh(productToEdit.nameKh || '');
      setNameEn(productToEdit.nameEn || '');
      setCategoryId(productToEdit.categoryId || 'birthday');
      const khr = productToEdit.priceKhr ?? Math.round(productToEdit.priceUsd * exchangeRate);
      setPriceKhr(String(khr));
      const costKhr = productToEdit.costPriceKhr ?? Math.round((productToEdit.costPriceUsd || 0) * exchangeRate);
      setCostPriceKhr(String(costKhr));
      setStockQty(String(productToEdit.stockQty ?? 10));
      setUnit(productToEdit.unit || 'នំ');
      setDescription(productToEdit.description || '');
      const prodImages = productToEdit.images && productToEdit.images.length > 0
        ? productToEdit.images
        : productToEdit.imageUrl
        ? [productToEdit.imageUrl]
        : [];
      setImages(prodImages);
      setPrimaryIndex(0);
    } else {
      setNameKh('');
      setNameEn('');
      setCategoryId('birthday');
      setPriceKhr('90000');
      setCostPriceKhr('40000');
      setStockQty('10');
      setUnit('នំ');
      setDescription('');
      setImages([]);
      setPrimaryIndex(0);
    }
  }, [productToEdit, isOpen, exchangeRate]);

  if (!isOpen) return null;

  const numPriceKhr = parseInt(priceKhr, 10) || 0;
  const numPriceUsd = Number((numPriceKhr / exchangeRate).toFixed(2));
  const numCostKhr = parseInt(costPriceKhr, 10) || 0;
  const numCostUsd = Number((numCostKhr / exchangeRate).toFixed(2));

  // Handle Multi-File Upload from Computer with auto-compression
  const handleMultipleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    soundFx.playPop();
    setIsCompressing(true);
    try {
      const compressionPromises = files.map((file) => compressImageFile(file, 800, 800, 0.82));
      const compressedImages = await Promise.all(compressionPromises);
      setImages((prev) => [...prev, ...compressedImages]);
      if (files.length > 1) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Error compressing images:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    soundFx.playPop();
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (primaryIndex === indexToRemove) {
      setPrimaryIndex(0);
    } else if (primaryIndex > indexToRemove) {
      setPrimaryIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKh.trim() || !priceKhr.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const primaryImage =
        images[primaryIndex] ||
        images[0] ||
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80';

      // Ensure primary image is at the front of images array
      const orderedImages = [
        primaryImage,
        ...images.filter((_, idx) => idx !== primaryIndex),
      ];

      // Save images to server disk for fast loading
      let finalImages = orderedImages;
      try {
        finalImages = await Promise.all(
          orderedImages.map(async (img) => {
            if (img && img.startsWith('data:image/')) {
              try {
                const res = await fetch('/api/upload-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ imageBase64: img }),
                });
                if (res.ok) {
                  const d = await res.json();
                  if (d.url) return d.url;
                }
              } catch (e) {
                console.warn('Image upload failed, keeping base64:', e);
              }
            }
            return img;
          })
        );
      } catch (e) {}

      const finalPrimary = finalImages[0] || primaryImage;

      if (productToEdit) {
        await updateProduct({
          ...productToEdit,
          nameKh: nameKh.trim(),
          nameEn: (nameEn || nameKh).trim(),
          categoryId,
          priceUsd: numPriceUsd,
          priceKhr: numPriceKhr,
          costPriceUsd: numCostUsd,
          costPriceKhr: numCostKhr,
          stockQty: parseInt(stockQty) || 0,
          unit,
          description: description.trim(),
          imageUrl: finalPrimary,
          images: finalImages.length > 0 ? finalImages : [finalPrimary],
        });
      } else {
        await addProduct({
          nameKh: nameKh.trim(),
          nameEn: (nameEn || nameKh).trim(),
          categoryId,
          priceUsd: numPriceUsd,
          priceKhr: numPriceKhr,
          costPriceUsd: numCostUsd,
          costPriceKhr: numCostKhr,
          stockQty: parseInt(stockQty) || 0,
          unit,
          description: description.trim(),
          imageUrl: finalPrimary,
          images: finalImages.length > 0 ? finalImages : [finalPrimary],
        });
      }

      soundFx.playSuccess();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });

      // Reset and close
      setNameKh('');
      setNameEn('');
      setDescription('');
      setImages([]);
      setPrimaryIndex(0);
      onClose();
    } catch (err) {
      console.error('Failed to add product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCoverImage = images[primaryIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-rose-50/60 to-pink-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                {productToEdit ? 'កែប្រែព័ត៌មានមុខទំនិញ / នំ (Edit Product)' : 'បញ្ចូលមុខនំថ្មី & Upload រូបភាពច្រើន (Multi-Image Cake Upload)'}
              </h3>
              <p className="text-xs text-slate-500">
                {productToEdit ? 'កែប្រែឈ្មោះ តម្លៃថ្លៃដើម/លក់ ប្រភេទ និងរូបភាពទំនិញ' : 'អាច Upload រូបភាពនំច្រើនជ្រុងក្នុងពេលតែមួយ និងមានចលនាស្លាយស្វ័យប្រវត្តិ'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Multi-Image Upload Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>រូបភាពនំ (Cake Photos - អាចរើសច្រើនរូបក្នុងពេលតែមួយ) *</span>
              </label>
              {images.length > 0 && (
                <span className="text-[11px] bg-pink-50 text-pink-700 font-bold px-2 py-0.5 rounded-lg border border-pink-200">
                  {images.length} រូបភាព (ចលនាផ្លាស់ប្តូរស្វ័យប្រវត្តិ ✨)
                </span>
              )}
            </div>

            {/* Dual Upload Options: File Picker & Live Camera */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* File Upload Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl border-2 border-dashed border-rose-300 hover:border-pink-500 bg-rose-50/40 hover:bg-rose-50/80 transition-all cursor-pointer flex flex-col items-center justify-center group shadow-2xs text-center"
              >
                <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center mb-1 text-pink-500 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-slate-800">
                  Upload រូបភាពនំ
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  ជ្រើសរើសរូបភាពច្រើនសន្លឹកពី File
                </p>
              </div>

              {/* Live Camera Button */}
              <div
                onClick={() => {
                  soundFx.playPop();
                  setIsCameraOpen(true);
                }}
                className="p-3.5 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/80 transition-all cursor-pointer flex flex-col items-center justify-center group shadow-2xs text-center"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-xs flex items-center justify-center mb-1 text-white group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-purple-900 flex items-center gap-1">
                  <span>📸 ថតរូបផ្ទាល់ពីកាម៉េរ៉ា</span>
                </p>
                <p className="text-[10px] text-purple-600/80 mt-0.5">
                  បើកកាម៉េរ៉ាទូរស័ព្ទ ឬកុំព្យូទ័រថតភ្លាមៗ
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleMultipleImageChange}
              className="hidden"
            />

            {/* Uploaded Images Thumbnails Grid */}
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>ចុចលើរូបដើម្បីកំណត់ជា **រូបគម្របមុខគេ (Cover)**៖</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ បន្ថែមរូបទៀត</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                  {images.map((img, idx) => {
                    const isCover = primaryIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          soundFx.playPop();
                          setPrimaryIndex(idx);
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer group shadow-2xs transition-all ${
                          isCover
                            ? 'border-pink-500 ring-2 ring-pink-400/40 scale-102'
                            : 'border-slate-200 hover:border-pink-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Uploaded ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Cover Tag */}
                        {isCover && (
                          <div className="absolute top-1 left-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>គម្រប</span>
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                          title="លុបរូបនេះ"
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <div className="absolute bottom-1 right-1 bg-black/40 text-white text-[8px] font-mono px-1 rounded">
                          #{idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Product Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឈ្មោះនំ (ភាសាខ្មែរ) *
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. នំខេកសូកូឡាស្ត្រប៊ែរី"
                value={nameKh}
                onChange={(e) => setNameKh(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឈ្មោះនំ (English)
              </label>
              <input
                type="text"
                placeholder="e.g. Chocolate Strawberry Cake"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ប្រភេទនំ / ទំនិញ (Category)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
              >
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === 'km' ? c.nameKh : c.nameEn}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ឯកតា (Unit)</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              >
                <option value="នំ">នំ (Cake)</option>
                <option value="ដុំ">ដុំ (Piece / Pastry)</option>
                <option value="ចំណិត">ចំណិត (Slice)</option>
                <option value="កែវ">កែវ (Cup / Drink)</option>
                <option value="ឈុត">ឈុត (Set)</option>
              </select>
            </div>
          </div>

          {/* Prices & Stock (KHR ៛ FIRST) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                តម្លៃលក់ (៛ KHR) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  value={priceKhr}
                  onChange={(e) => setPriceKhr(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 text-sm font-black text-pink-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ៛
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                ~ ${numPriceUsd.toFixed(2)} USD
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ថ្លៃដើមផលិត (៛ KHR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={costPriceKhr}
                  onChange={(e) => setCostPriceKhr(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ៛
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                ~ ${numCostUsd.toFixed(2)} USD
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ចំនួនក្នុងស្តុក
              </label>
              <input
                type="number"
                step="1"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ការពិពណ៌នានំ / គ្រឿងផ្សំពិសេស
            </label>
            <input
              type="text"
              placeholder="ឧ. សាច់នំទន់ ស្រោបក្រែមស្រស់ និងផ្លែឈើស្រស់..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-rose-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-600/25 flex items-center gap-2 transition-all active:scale-95 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : productToEdit ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>រក្សាទុកការកែប្រែ</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>រក្សាទុកមុខនំថ្មី</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(capturedBase64) => {
          setImages((prev) => [...prev, capturedBase64]);
        }}
        title="ថតរូបភាពនំផ្ទាល់ (Cake Photo)"
        subtitle="ថតរូបនំជាក់ស្តែងពីកាម៉េរ៉ាដើម្បីដាក់លក់ និងបង្ហាញក្នុងប្រព័ន្ធ"
      />
    </div>
  );
};
