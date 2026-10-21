import React, { useState, useMemo } from 'react';
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
  Globe,
  Lock,
  FlaskConical,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

import { getStoreId } from '../../services/firebase';

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
  const { storeInfo, isDemoMode, requestExitDemoMode } = useBakery();
  const [copied, setCopied] = useState(false);

  // Always prefer real store name for the counter standee card & customer sharing
  const effectiveStoreName = useMemo(() => {
    try {
      const raw = localStorage.getItem('bakery_store_info');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.nameKh && !parsed.nameKh.includes('Demo') && !parsed.nameKh.includes('សាកល្បង')) {
          return parsed.nameKh;
        }
      }
    } catch (e) {}
    if (storeInfo.nameKh && !storeInfo.nameKh.includes('Demo') && !storeInfo.nameKh.includes('សាកល្បង')) {
      return storeInfo.nameKh;
    }
    return 'ហាងនំខកនិងនំបុ័ងវិជ្ជតា';
  }, [storeInfo.nameKh]);

  // Compute public shareable Customer Order Link URL
  // If running locally in Electron desktop (file://) or Android WebView (file:///android_asset/...),
  // window.location.origin is "file://" which cannot be accessed by customer phones.
  // Therefore, fallback to the official live hosted GitHub Pages URL or storeInfo.website.
  const customerOrderUrl = useMemo(() => {
    const currentStoreId = getStoreId();
    const storeParam = currentStoreId ? `&storeId=${encodeURIComponent(currentStoreId)}` : '';

    // 1. If store has a custom website or custom customer portal URL configured
    const customUrl = storeInfo.customerPortalUrl || storeInfo.website;
    if (
      customUrl &&
      (customUrl.startsWith('http://') || customUrl.startsWith('https://')) &&
      !customUrl.includes('androidplatform.net') &&
      !customUrl.includes('appassets')
    ) {
      const base = customUrl.replace(/\/+$/, '');
      const withOrder = base.includes('?order=true') ? base : `${base}/?order=true`;
      return withOrder.includes('storeId=') ? withOrder : `${withOrder}${storeParam}`;
    }

    // 2. Check if current window is running on a live HTTP/HTTPS public server
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      const pathname = window.location.pathname || '/';

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
        const cleanPath = pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
        return `${origin}${cleanPath}/?order=true${storeParam}`;
      }
    }

    // 3. Default to official production GitHub Pages hosted app
    return `https://sothearetsuon-ai.github.io/sweetbakery-pos/?order=true${storeParam}`;
  }, [storeInfo.customerPortalUrl, storeInfo.website]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customerOrderUrl);
    setCopied(true);
    soundFx.playPop();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTelegram = () => {
    const message = `🎂 ជំរាបសួរ! សូមចូលទៅកាន់ Link នេះដើម្បីធ្វើការកុម្ម៉ង់នំខួបកំណើត ឬនំបុ័ងពិសេស និងបង់ប្រាក់កក់តាម KHQR ដោយងាយស្រួលពីហាង ${effectiveStoreName}៖\n👉 ${customerOrderUrl}`;
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
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[85vh]">
          {/* Demo Mode Notice Banner if POS is currently in Demo Sandbox */}
          {isDemoMode && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-3 text-amber-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <span>កម្មវិធី POS កំពុងស្ថិតក្នុង «របៀបសាកល្បង (Demo)»</span>
                  </div>
                  <div className="text-[11px] text-amber-800">
                    សូមចុច <strong>«ចូលហាងពិត»</strong> (PIN: 1111) ដើម្បីប្តូរមកទិន្នន័យជាក់ស្តែង!
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onClose();
                  requestExitDemoMode();
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-xs font-black shadow-md shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer transition-all border border-rose-500/20"
              >
                <Lock className="w-3.5 h-3.5 text-amber-200" />
                <span>ចូលហាងពិត 🔐</span>
              </button>
            </div>
          )}

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
                {effectiveStoreName}
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
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareTelegram}
                className="py-2.5 px-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-[#2AABEE]/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ផ្ញើតាម Telegram</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>បោះពុម្ព QR</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* In-App Direct Preview */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onClose();
                  if (onOpenCustomerView) {
                    onOpenCustomerView();
                  } else {
                    window.dispatchEvent(new CustomEvent('open_customer_portal'));
                  }
                }}
                className="py-2.5 px-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-pink-500/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>📱 បើកក្នុងកម្មវិធី (In-App)</span>
              </button>

              {/* Open in Default Web Browser (Chrome/Edge) */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  if (typeof (window as any).SweetBakeryNative?.openBrowser === 'function') {
                    (window as any).SweetBakeryNative.openBrowser(customerOrderUrl);
                  } else if ((window as any).SweetBakeryDesktop?.openExternal) {
                    (window as any).SweetBakeryDesktop.openExternal(customerOrderUrl);
                  } else {
                    window.open(customerOrderUrl, '_blank');
                  }
                }}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>🌐 បើកក្នុង Browser</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
