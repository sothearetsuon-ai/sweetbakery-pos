import React, { useState } from 'react';
import {
  Monitor,
  X,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface CustomerDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInAppPreview?: () => void;
}

export const getCustomerDisplayUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const isLocalOrContainer =
      !origin ||
      origin.startsWith('file:') ||
      origin === 'null' ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('androidplatform.net') ||
      origin.includes('appassets') ||
      Boolean((window as any).SweetBakeryDesktop) ||
      Boolean((window as any).SweetBakeryNative);

    if (!isLocalOrContainer && (origin.startsWith('http://') || origin.startsWith('https://'))) {
      const cleanPath = (window.location.pathname || '/').replace(/\/index\.html$/, '').replace(/\/+$/, '');
      return `${origin}${cleanPath}/?display=true`;
    }
  }
  return 'https://sothearetsuon-ai.github.io/sweetbakery-pos/?display=true';
};

export const CustomerDisplayModal: React.FC<CustomerDisplayModalProps> = ({
  isOpen,
  onClose,
  onOpenInAppPreview,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayUrl = getCustomerDisplayUrl();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(displayUrl)}`;

  const handleCopyLink = () => {
    soundFx.playPop();
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWindow = () => {
    soundFx.playSuccess();
    if (typeof window !== 'undefined') {
      window.open(displayUrl, 'SweetBakeryCustomerDisplay', 'width=1100,height=750,menubar=no,toolbar=no');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-sky-100 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                អេក្រង់ទី ២ សម្រាប់អតិថិជន (Dual Screen)
              </h3>
              <p className="text-[11px] text-sky-100/90 font-medium">
                Customer-Facing Secondary Display • Real-time Sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200/80 space-y-1.5 text-xs text-sky-900">
            <div className="font-black flex items-center gap-1.5 text-sky-800">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>ងាយស្រួលភ្ជាប់ជាមួយគ្រប់ Tablet & Monitor៖</span>
            </div>
            <p className="text-[11px] text-sky-700 leading-relaxed font-medium">
              នៅពេលគិតលុយ អេក្រង់ភ្ញៀវនឹងបង្ហាញទំនិញក្នុងកន្ត្រក តម្លៃសរុប និង <strong>Bakong KHQR ធំច្បាស់ពេញអេក្រង់</strong> ដោយស្វ័យប្រវត្តិតាមរយៈ Real-time BroadcastChannel & LocalSync។
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-slate-50 rounded-3xl p-5 border-2 border-dashed border-sky-300 text-center space-y-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-sky-600 block">
                ស្កេនដើម្បីបើកលើ Tablet / Phone ទី ២
              </span>
              <h4 className="text-sm font-black text-slate-800">
                ដាក់បង្ហាញលើតុទល់មុខភ្ញៀវ
              </h4>
            </div>

            <div className="w-44 h-44 mx-auto p-2.5 bg-white rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
              <img
                src={qrUrl}
                alt="Scan Customer Display"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              បើកកាមេរ៉ា Tablet ឬទូរសព្ទទី ២ រួចស្កេន QR នេះដើម្បីបើកអេក្រង់ភ្ញៀវភ្លាមៗ
            </p>
          </div>

          {/* Direct Link Input & Copy */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              🔗 តំណភ្ជាប់អេក្រង់ភ្ញៀវ (Display Link)៖
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={displayUrl}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'បានចម្លង!' : 'ចម្លង'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            បិទ
          </button>

          <div className="flex items-center gap-2">
            {onOpenInAppPreview && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onClose();
                  onOpenInAppPreview();
                }}
                className="px-3.5 py-2.5 bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span>មើលក្នុង App</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenWindow}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>បើកផ្ទាំងដាច់ដោយឡែក (Popout)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
