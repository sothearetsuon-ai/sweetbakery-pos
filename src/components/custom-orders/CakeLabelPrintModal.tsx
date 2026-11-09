import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Sparkles,
  Cake,
  Calendar,
  Clock,
  Phone,
  User,
  ShieldAlert,
  QrCode,
  Tag,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { CakeBoxLabelData } from '../../types';
import { soundFx } from '../../utils/audio';
import { formatKhr } from '../../utils/currencyUtils';

const formatUsd = (val: number | undefined | null) => `$${Number(val || 0).toFixed(2)}`;

interface CakeLabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<CakeBoxLabelData>;
}

export const CakeLabelPrintModal: React.FC<CakeLabelPrintModalProps> = ({
  isOpen,
  onClose,
  initialData = {},
}) => {
  const { storeInfo, exchangeRate } = useBakery();

  const now = new Date();
  const defaultMfgDate = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  const expiryDateObj = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days default
  const defaultExpiryDate = expiryDateObj.toISOString().slice(0, 16);

  const [labelData, setLabelData] = useState<CakeBoxLabelData>({
    orderNumber: initialData.orderNumber || `CK-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: initialData.customerName || '',
    customerPhone: initialData.customerPhone || '',
    cakeName: initialData.cakeName || 'នំខួបកំណើត Signature Cake',
    size: initialData.size || '1.0 kg (6-inch)',
    flavor: initialData.flavor || 'សូកូឡា (Chocolate Fudge)',
    inscription: initialData.inscription || 'Happy Birthday! 🎉',
    pickupDate: initialData.pickupDate || now.toISOString().split('T')[0],
    pickupTime: initialData.pickupTime || '14:00',
    mfgDate: initialData.mfgDate || defaultMfgDate,
    expiryDate: initialData.expiryDate || defaultExpiryDate,
    shelfLifeDays: initialData.shelfLifeDays || 3,
    storageTemp: initialData.storageTemp || 'រក្សាទុកក្នុងទូរទឹកកក (0°C - 4°C)',
    priceUsd: initialData.priceUsd,
    priceKhr: initialData.priceKhr,
    notes: initialData.notes || '',
  });

  const [labelSize, setLabelSize] = useState<'60x40' | '50x30' | '80mm'>('60x40');
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleShelfLifeChange = (days: number) => {
    const mfg = new Date(labelData.mfgDate);
    const exp = new Date(mfg.getTime() + days * 24 * 60 * 60 * 1000);
    setLabelData((prev) => ({
      ...prev,
      shelfLifeDays: days,
      expiryDate: exp.toISOString().slice(0, 16),
    }));
  };

  const handlePrint = () => {
    soundFx.playSuccess();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.15)] rounded-3xl w-full max-w-4xl overflow-hidden max-h-[94vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        {/* Header - Screen only */}
        <div className="px-6 py-4 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-amber-50/40 to-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>បោះពុម្ពស្លាក Sticker ប្រអប់នំ & ថ្ងៃផុតកំណត់</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  Cake Box Label
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                ស្លាក Sticker គុណភាពខ្ពស់សម្រាប់បិទលើប្រអប់នំខួបកំណើត ឬកញ្ចប់នំប៉័ង
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 print:p-0 print:block">
          {/* Form Settings (Left Side - 5 cols) - Screen only */}
          <div className="lg:col-span-5 space-y-4 print:hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                ទំហំស្លាក (Sticker Size)
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setLabelSize('60x40')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    labelSize === '60x40' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  60x40mm
                </button>
                <button
                  onClick={() => setLabelSize('50x30')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    labelSize === '50x30' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  50x30mm
                </button>
                <button
                  onClick={() => setLabelSize('80mm')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    labelSize === '80mm' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  80mm
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ឈ្មោះនំ (Cake Name)</label>
                <input
                  type="text"
                  value={labelData.cakeName}
                  onChange={(e) => setLabelData({ ...labelData, cakeName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ទំហំ (Size)</label>
                  <input
                    type="text"
                    value={labelData.size || ''}
                    onChange={(e) => setLabelData({ ...labelData, size: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">រសជាតិ (Flavor)</label>
                  <input
                    type="text"
                    value={labelData.flavor || ''}
                    onChange={(e) => setLabelData({ ...labelData, flavor: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">អតិថិជន (Customer)</label>
                  <input
                    type="text"
                    value={labelData.customerName || ''}
                    onChange={(e) => setLabelData({ ...labelData, customerName: e.target.value })}
                    placeholder="ឈ្មោះភ្ញៀវ"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ទូរស័ព្ទ (Phone)</label>
                  <input
                    type="text"
                    value={labelData.customerPhone || ''}
                    onChange={(e) => setLabelData({ ...labelData, customerPhone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">អក្សរជូនពរលើនំ (Inscription)</label>
                <input
                  type="text"
                  value={labelData.inscription || ''}
                  onChange={(e) => setLabelData({ ...labelData, inscription: e.target.value })}
                  placeholder="Happy Birthday..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              {/* Shelf Life Selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  រយៈពេលទុក (Shelf Life / Expiry)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleShelfLifeChange(d)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                        labelData.shelfLifeDays === d
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {d} ថ្ងៃ ({d}d)
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">ថ្ងៃផលិត (Mfg)</label>
                  <input
                    type="datetime-local"
                    value={labelData.mfgDate}
                    onChange={(e) => setLabelData({ ...labelData, mfgDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">ផុតកំណត់ (Expiry)</label>
                  <input
                    type="datetime-local"
                    value={labelData.expiryDate}
                    onChange={(e) => setLabelData({ ...labelData, expiryDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ការណែនាំរក្សាទុក (Storage)</label>
                <input
                  type="text"
                  value={labelData.storageTemp || ''}
                  onChange={(e) => setLabelData({ ...labelData, storageTemp: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Label Preview (Right Side - 7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-100/70 rounded-3xl border border-slate-200/80 print:p-0 print:bg-white print:border-none">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 print:hidden">
              គំរូស្លាក Sticker មើលមុន (Label Preview)
            </p>

            {/* Sticker Paper Simulation */}
            <div
              ref={printAreaRef}
              id="printable-cake-label"
              className={`bg-white text-slate-900 border-2 border-dashed border-slate-300 shadow-md p-4 flex flex-col justify-between font-sans print:border-none print:shadow-none print:m-0 print:p-2 ${
                labelSize === '60x40'
                  ? 'w-[360px] min-h-[240px] rounded-2xl'
                  : labelSize === '50x30'
                  ? 'w-[300px] min-h-[190px] rounded-xl'
                  : 'w-[420px] min-h-[280px] rounded-2xl'
              }`}
            >
              {/* Bakery Header */}
              <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm tracking-tight uppercase flex items-center gap-1.5">
                    <span>{storeInfo.nameKh || 'SweetBakery'}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-white">
                      PREMIUM
                    </span>
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-600">
                    {storeInfo.phone || '012 345 678'} • {storeInfo.address?.slice(0, 30) || 'Phnom Penh'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                    {labelData.orderNumber || 'CAKE'}
                  </span>
                </div>
              </div>

              {/* Cake Main Info */}
              <div className="py-2.5 space-y-1">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-black text-base leading-tight text-slate-900">
                    {labelData.cakeName}
                  </h4>
                  {labelData.size && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {labelData.size}
                    </span>
                  )}
                </div>

                {labelData.flavor && (
                  <p className="text-xs font-semibold text-slate-700">
                    រសជាតិ: <span className="font-bold">{labelData.flavor}</span>
                  </p>
                )}

                {labelData.inscription && (
                  <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/80 my-1">
                    <p className="text-[11px] font-bold text-amber-900 italic">
                      ✍️ "{labelData.inscription}"
                    </p>
                  </div>
                )}

                {labelData.customerName && (
                  <p className="text-xs font-medium text-slate-800">
                    ភ្ញៀវ: <span className="font-bold">{labelData.customerName}</span>
                    {labelData.customerPhone ? ` (${labelData.customerPhone})` : ''}
                  </p>
                )}
              </div>

              {/* Dates & Expiry Box */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] font-medium">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">ថ្ងៃផលិត (Mfg Date):</span>
                  <span className="font-bold font-mono text-slate-800">
                    {labelData.mfgDate.replace('T', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-rose-600 block text-[9px] uppercase font-bold">ផុតកំណត់ (Best Before):</span>
                  <span className="font-black font-mono text-rose-700 bg-rose-50 px-1 py-0.5 rounded">
                    {labelData.expiryDate.replace('T', ' ')}
                  </span>
                </div>
              </div>

              {/* Storage Footer */}
              <div className="mt-2 pt-1.5 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-600">
                <span className="font-semibold flex items-center gap-1">
                  ❄️ {labelData.storageTemp || 'Keep Refrigerated 0-4°C'}
                </span>
                <span className="font-bold">Sweet & Fresh Guarantee</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 text-center print:hidden">
              💡 គាំទ្រម៉ាស៊ីនបោះពុម្ពកម្ដៅ (Thermal Label Printer) គ្រប់ប្រភេទ ដូចជា Xprinter, Gprinter, HPRT...
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            បិទ
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ពស្លាក Sticker (Print Label)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
