import React from 'react';
import { X, Printer, QrCode, Sparkles } from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

interface KhqrStandeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  customAmountKhr?: number;
  customAmountUsd?: number;
}

export const KhqrStandeeModal: React.FC<KhqrStandeeModalProps> = ({
  isOpen,
  onClose,
  customAmountKhr,
  customAmountUsd,
}) => {
  const { storeInfo } = useBakery();

  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playPop();
    window.print();
  };

  const merchantName = storeInfo.khqrMerchantName || storeInfo.nameEn || 'SWEET BAKERY & CAFE';
  const bakongId = storeInfo.khqrBakongId || 'sweet_bakery@aba';
  const accountNum = storeInfo.khqrAccountNumber || '001 234 567';
  const bankName = storeInfo.khqrBankName || 'ABA Bank / Bakong';

  const qrData = customAmountKhr
    ? `bakong://pay?merchant=${encodeURIComponent(merchantName)}&account=${encodeURIComponent(bakongId)}&amount=${customAmountKhr}&currency=KHR`
    : `bakong://pay?merchant=${encodeURIComponent(merchantName)}&account=${encodeURIComponent(bakongId)}`;

  const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrData)}`;
  const displayQrSrc = storeInfo.khqrQrImage || fallbackQrUrl;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
            <QrCode className="w-4 h-4" />
            <span>ផ្ទាំង KHQR លើតុគិតប្រាក់ (Counter Standee)</span>
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

        {/* Printable Standee Card */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100/60">
          <div
            id="printable-khqr-standee"
            className="w-full max-w-[340px] bg-white rounded-3xl shadow-xl border-4 border-rose-500 overflow-hidden text-center"
          >
            {/* Red KHQR Top Banner */}
            <div className="bg-[#D32F2F] text-white py-3.5 px-4 shadow-sm flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold tracking-widest block text-red-100">
                  Cambodia Standard
                </span>
                <span className="text-2xl font-black tracking-tight leading-none">KHQR</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold">
                <span>៛ KHR</span>
                <span>•</span>
                <span>$ USD</span>
              </div>
            </div>

            {/* Store & QR Body */}
            <div className="p-5 space-y-3 bg-white">
              {/* Bakery Name & Logo */}
              <div className="flex items-center justify-center gap-2.5 pb-2 border-b border-dashed border-slate-200">
                {storeInfo.logoUrl ? (
                  <img
                    src={storeInfo.logoUrl}
                    alt={storeInfo.nameKh}
                    className="w-10 h-10 object-cover rounded-xl border border-rose-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 font-black text-sm">
                    🍰
                  </div>
                )}
                <div className="text-left">
                  <h4 className="font-black text-slate-800 text-sm leading-tight">
                    {storeInfo.nameKh}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold">{merchantName}</p>
                </div>
              </div>

              {/* Amount Badge if from checkout */}
              {customAmountKhr !== undefined && (
                <div className="bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-2xl">
                  <span className="text-[11px] text-rose-700 font-semibold block">ចំនួនទឹកប្រាក់ត្រូវបង់៖</span>
                  <span className="text-lg font-black text-rose-600">
                    {customAmountKhr.toLocaleString()} ៛
                  </span>
                  {customAmountUsd !== undefined && (
                    <span className="text-xs text-slate-500 ml-1.5 font-bold">
                      (${customAmountUsd.toFixed(2)})
                    </span>
                  )}
                </div>
              )}

              {/* Big KHQR Code Box */}
              <div className="relative w-56 h-56 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-rose-300 shadow-inner flex items-center justify-center">
                <img
                  src={displayQrSrc}
                  alt="Shop KHQR"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              {/* Merchant Details */}
              <div className="space-y-0.5 text-xs">
                <div className="font-black text-slate-800 text-sm">{merchantName}</div>
                <div className="text-slate-500 font-mono text-[11px]">{bakongId}</div>
                <div className="text-[11px] font-bold text-pink-600">
                  {bankName} • {accountNum}
                </div>
              </div>

              {/* Accepted Banks Footer */}
              <div className="pt-2.5 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium mb-1.5">
                  ស្កេនទូទាត់ជាមួយគ្រប់ App ធនាគារក្នុងស្រុក
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 flex-wrap">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">Bakong</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">ABA</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">ACLEDA</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">Canadia</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">Wing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ព Standee ដាក់លើតុ (Print)</span>
          </button>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
