import React, { useState, useEffect, useRef } from 'react';
import { X, Barcode, Check, Search, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { soundFx } from '../../utils/audio';
import { getProductImageUrl } from '../../utils/imagePath';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Product, quantity: number) => void;
  exchangeRate: number;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  exchangeRate,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [lastScannedMsg, setLastScannedMsg] = useState<string | null>(null);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBarcodeInput('');
      setMatchedProduct(null);
      setNotFoundMsg(null);
      setLastScannedMsg(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanCode = (code: string) => {
    const clean = code.trim().toLowerCase();
    if (!clean) return;

    // Search by exact barcode, or product id, or matching SKU
    const found = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === clean) ||
        p.id.toLowerCase() === clean ||
        (p.barcode && p.barcode.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
    );

    if (found) {
      soundFx.playSuccess();
      setMatchedProduct(found);
      setNotFoundMsg(null);
      onAddProduct(found, 1);
      setLastScannedMsg(`បានបន្ថែម "${found.nameKh}" ចូលកន្ត្រកជោគជ័យ! (+1)`);
      setBarcodeInput('');
      setTimeout(() => {
        setLastScannedMsg(null);
        inputRef.current?.focus();
      }, 2000);
    } else {
      soundFx.playPop();
      setMatchedProduct(null);
      setNotFoundMsg(`មិនមានទំនិញដែលមានលេខកូដ "${code}" នេះទេ!`);
      setTimeout(() => setNotFoundMsg(null), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanCode(barcodeInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-rose-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                ស្កេន Barcode លក់ទំនិញ (Barcode Scanner)
              </h3>
              <p className="text-[11px] text-slate-400">
                ប្រើកាំភ្លើងបាញ់ Barcode USB ឬវាយលេខកូដទំនិញ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scan Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="ស្កេន ឬវាយលេខ Barcode ទីនេះ (ឧ. 884...)"
              className="w-full pl-10 pr-20 py-3 rounded-2xl border-2 border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm tracking-wider focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 shadow-inner"
              autoFocus
            />
            <Barcode className="w-5 h-5 text-rose-500 absolute left-3.5 top-3.5" />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              ស្កេន
            </button>
          </div>
          <p className="text-[10.5px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>កាំភ្លើងបាញ់ Barcode នឹងស្កេនចូលកន្ត្រកស្វ័យប្រវត្តិដោយមិនបាច់ចុចប៊ូតុង។</span>
          </p>
        </form>

        {/* Success Alert Banner */}
        {lastScannedMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lastScannedMsg}</span>
          </div>
        )}

        {/* Not Found Alert */}
        {notFoundMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{notFoundMsg}</span>
          </div>
        )}

        {/* Matched Product Preview Card */}
        {matchedProduct && (
          <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
              <img
                src={getProductImageUrl(matchedProduct.imageUrl || (matchedProduct.images && matchedProduct.images[0]))}
                alt={matchedProduct.nameKh}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {matchedProduct.nameKh}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Barcode: {matchedProduct.barcode || matchedProduct.id}
              </p>
              <div className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {(matchedProduct.priceKhr || Math.round(matchedProduct.priceUsd * exchangeRate)).toLocaleString()} ៛
                <span className="text-[10px] text-slate-400 font-normal ml-1">
                  (${matchedProduct.priceUsd.toFixed(2)})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onAddProduct(matchedProduct, 1);
                soundFx.playPop();
              }}
              className="px-2.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ថែម ១</span>
            </button>
          </div>
        )}

        {/* Sample Barcode List to Quick-Add */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 block mb-2">
            ទំនិញដែលមាន Barcode ស្រាប់ក្នុងហាង (ចុចដើម្បីសាកល្បង)៖
          </span>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {products
              .filter((p) => p.barcode)
              .slice(0, 6)
              .map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleScanCode(p.barcode || p.id)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">🍞</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {p.nameKh}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">
                    {p.barcode}
                  </span>
                </button>
              ))}
            {products.filter((p) => p.barcode).length === 0 && (
              <p className="text-[11px] text-slate-400 text-center py-2">
                * មិនទាន់មានទំនិញណាដាក់លេខ Barcode នៅឡើយទេ។ លោកអ្នកអាចកែប្រែទំនិញដើម្បីដាក់ Barcode បាន។
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition-colors"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};

