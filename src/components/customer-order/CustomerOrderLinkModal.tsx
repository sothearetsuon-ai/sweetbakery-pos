import React, { useState } from 'react';
import {
  X,
  Link as LinkIcon,
  Copy,
  Check,
  QrCode,
  Share2,
  ExternalLink,
  Printer,
  Sparkles,
  Smartphone,
  MessageCircle,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

interface CustomerOrderLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomerView?: () => void;
}

export const CustomerOrderLinkModal: React.FC<CustomerOrderLinkModalProps> = ({
  isOpen,
  onClose,
  onOpenCustomerView,
}) => {
  const { storeInfo } = useBakery();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Determine Customer Order Link URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sweetbakery.app';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const customerOrderUrl = `${origin}${pathname}?order=true`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customerOrderUrl);
    setCopied(true);
    soundFx.playPop();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTelegram = () => {
    const message = `🎂 ជំរាបសួរ! សូមចូលទៅកាន់ Link នេះដើម្បីធ្វើការកុម្ម៉ង់នំខួបកំណើត ឬនំបុ័ងពិសេស និងបង់ប្រាក់កក់តាម KHQR ដោយងាយស្រួលពីហាង ${storeInfo.nameKh}៖\n👉 ${customerOrderUrl}`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(customerOrderUrl)}&text=${encodeURIComponent(message)}`;
    window.open(tgUrl, '_blank');
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(customerOrderUrl)}`;

  const handlePrint = () => {
    soundFx.playPop();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-pink-50/70 to-rose-50/40 shrink-0">
          <div className="flex items-center gap-2 text-pink-700 font-black text-sm">
            <LinkIcon className="w-4 h-4 text-pink-600" />
            <span>លីងកុម្ម៉ង់ & បង់ប្រាក់កក់សម្រាប់ភ្ញៀវ</span>
          </div>

          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[85vh]">
          {/* Quick Explainer */}
          <div className="bg-pink-50/80 border border-pink-200/80 rounded-2xl p-3.5 text-xs text-pink-900 space-y-1">
            <span className="font-black flex items-center gap-1.5 text-pink-800">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>ភាពងាយស្រួលសម្រាប់អតិថិជន៖</span>
            </span>
            <p className="text-[11px] leading-relaxed text-pink-700">
              ភ្ញៀវអាចបើកមើលរូបភាពនំ, ជ្រើសរើសទំហំ, រសជាតិ, សរសេរអក្សរជូនពរលើនំ, ជ្រើសរើសថ្ងៃមកយក និងស្កេនបង់ប្រាក់កក់តាម Bakong KHQR ដោយខ្លួនឯងយ៉ាងរហ័ស!
            </p>
          </div>

          {/* Copyable Link Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              🔗 លីងផ្ទាល់ (Direct Order Link)៖
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={customerOrderUrl}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-700 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-pink-600 to-rose-500 text-white hover:from-pink-700 hover:to-rose-600'
                }`}
              >
                {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'បានចម្លង!' : 'ចម្លង'}</span>
              </button>
            </div>
          </div>

          {/* QR Code Standee Card for Counter Scanning */}
          <div
            id="printable-order-qr"
            className="bg-white rounded-3xl p-5 border-2 border-pink-400 shadow-md text-center space-y-3"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-pink-600 block">
                {storeInfo.nameKh || 'ហាងនំបុ័ង & នំខួបកំណើត វិជ្ជតា'}
              </span>
              <h4 className="text-sm font-black text-slate-900">
                ស្កេនដើម្បីកុម្ម៉ង់នំ & បង់ប្រាក់កក់
              </h4>
            </div>

            <div className="flex justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100 max-w-[210px] mx-auto shadow-inner">
              <img
                src={qrImageUrl}
                alt="Order QR Code"
                className="w-44 h-44 object-contain"
              />
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              ប្រើកាមេរ៉ាទូរស័ព្ទ (iPhone / Android) ដើម្បីស្កេនកុម្ម៉ង់ភ្លាមៗ
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleShareTelegram}
              className="py-2.5 px-4 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-[#2AABEE]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>ផ្ញើតាម Telegram</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenCustomerView) {
                  onClose();
                  onOpenCustomerView();
                } else {
                  window.open(customerOrderUrl, '_blank');
                }
              }}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>បើកមើលទំព័រភ្ញៀវ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
