import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Download,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { decodeReceiptData, CompactReceiptPayload } from '../../utils/eReceiptUrl';
import { getProductImageUrl } from '../../utils/imagePath';
import { formatDateDMY, formatDateTimeDMY } from '../../utils/dateUtils';
import { roundKhr } from '../../utils/currencyUtils';
import { QrCodeImage } from '../common/QrCodeImage';

export const DigitalReceiptView: React.FC = () => {
  const [receipt, setReceipt] = useState<CompactReceiptPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const receiptParam = params.get('receipt');

      if (receiptParam) {
        const decoded = decodeReceiptData(receiptParam);
        if (decoded) {
          setReceipt(decoded);
          setIsLoading(false);
          return;
        }
      }

      // Fallback: check hash if passed as #receipt=...
      const hash = window.location.hash;
      if (hash && hash.includes('receipt=')) {
        const hashMatch = hash.match(/receipt=([^&]+)/);
        if (hashMatch && hashMatch[1]) {
          const decoded = decodeReceiptData(hashMatch[1]);
          if (decoded) {
            setReceipt(decoded);
            setIsLoading(false);
            return;
          }
        }
      }

      // Check localStorage for most recent receipt if opened on same device
      const cached = localStorage.getItem('bakery_last_completed_sale');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.orderNumber) {
            setReceipt({
              inv: parsed.orderNumber,
              dt: parsed.createdAt || Date.now(),
              cust: parsed.customerName,
              phone: parsed.customerPhone,
              cashier: parsed.cashierName || 'Staff',
              pay: parsed.paymentMethod || 'CASH_KHR',
              items: (parsed.items || []).map((i: any) => ({
                n: i.nameKh || i.nameEn || 'Item',
                q: i.quantity || 1,
                u: i.priceKhr || 0,
                usd: i.priceUsd || 0,
                t: (i.priceKhr || 0) * (i.quantity || 1),
              })),
              totKhr: parsed.totalKhr || 0,
              totUsd: parsed.totalUsd || 0,
              isDep: parsed.isDeposit,
              depKhr: parsed.depositKhr,
              depUsd: parsed.depositUsd,
              remKhr: parsed.remainingKhr,
              remUsd: parsed.remainingUsd,
              paidKhr: parsed.paidKhr,
              paidUsd: parsed.paidUsd,
              changeKhr: parsed.changeKhr,
              changeUsd: parsed.changeUsd,
              store: {
                nameKh: 'ហាងនំខេក ស្វីតបេកខឺរី',
                nameEn: 'SWEET BAKERY & CAFE',
                addr: '',
                phone: '',
              },
            });
            setIsLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      setIsLoading(false);
    } catch (e) {
      console.error('Failed to load receipt:', e);
      setIsLoading(false);
    }
  }, []);

  const handleSaveReceipt = async () => {
    if (!receiptRef.current || isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Capture crystal-clear receipt screenshot using html2canvas
      const card = receiptRef.current;
      const canvas = await html2canvas(card, {
        scale: 3, // 3x retina sharp resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const fileName = `Receipt-${receipt?.inv || 'SweetBakery'}.png`;

      // 2. Convert to Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
      });

      if (!blob) {
        throw new Error('Canvas blob creation failed');
      }

      const file = new File([blob], fileName, { type: 'image/png' });

      // 3. Try Native Mobile Web Share (Opens "Save Image" to Photos / Save to Files on iOS/Android)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `វិក្កយបត្រ ${receipt?.inv || 'SweetBakery'}`,
            text: `វិក្កយបត្រផ្លូវការ ${receipt?.store.nameKh || 'Sweet Bakery'} #${receipt?.inv}`,
          });
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          return;
        } catch (shareErr: any) {
          // If user dismissed share sheet, don't fallback to forceful download unless error
          if (shareErr?.name === 'AbortError') {
            return;
          }
        }
      }

      // 4. Direct Browser Download fallback
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('html2canvas image saving failed, falling back to window.print():', err);
      // Fallback: window.print() (which natively provides "Save as PDF" on mobile browsers)
      window.print();
    } finally {
      setIsSaving(false);
    }
  };

  const handleBrowseMenu = () => {
    const base = window.location.origin + window.location.pathname;
    window.location.href = `${base}?order=true#order`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-battambang">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center animate-pulse mb-3 shadow-lg">
          <span className="text-2xl">🧾</span>
        </div>
        <p className="text-sm font-bold text-slate-300">កំពុងទាញយកវិក្កយបត្រអេឡិចត្រូនិច...</p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-battambang text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mb-4">
          ⚠️
        </div>
        <h2 className="text-lg font-black mb-2">មិនមានទិន្នន័យវិក្កយបត្រ</h2>
        <p className="text-xs text-slate-400 max-w-xs mb-6">
          សូមស្កេន QR កូដលើអេក្រង់គិតលុយរបស់ហាងម្តងទៀត ដើម្បីពិនិត្យមើលវិក្កយបត្រ
        </p>
        <button
          onClick={handleBrowseMenu}
          className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>មើលម៉ឺនុយហាង & កុម្ម៉ង់នំ</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 font-sans flex flex-col items-center py-4 px-3 sm:py-8 sm:px-4">
      {/* Print Stylesheet Overrides */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-card {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Mobile Top App Header (Paperless Notification) */}
      <div className="w-full max-w-sm mb-3 no-print">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-2.5 text-emerald-300 flex items-center justify-between shadow-xs font-battambang">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-xs font-bold">📱 វិក្កយបត្រអេឡិចត្រូនិច (Paperless E-Receipt)</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-200 font-mono font-bold">
            100% Verified
          </span>
        </div>
      </div>

      {/* Main Official Receipt Card Matching User's Image */}
      <div
        ref={receiptRef}
        className="printable-card bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col font-sans transition-all"
      >
        {/* Card Header with Green Check */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs font-battambang">
            <CheckCircle2 className="w-4 h-4" />
            <span>វិក្កយបត្រផ្លូវការ (Official Receipt)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>SECURE</span>
          </div>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div className="p-6 bg-white">
          <div className="text-slate-900 text-xs font-mono leading-relaxed space-y-3">
            {/* Store Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
              <div className="w-14 h-14 mx-auto mb-1.5 rounded-xl overflow-hidden border border-slate-200 p-0.5 bg-white">
                <img
                  src={getProductImageUrl(receipt.store.logo || '/uploads/products/prod_1789651345094_x6k2.jpg')}
                  alt="Store Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/uploads/products/prod_1789651345094_x6k2.jpg';
                  }}
                />
              </div>
              <h2 className="text-base font-black tracking-tight font-sans text-slate-900 uppercase">
                {receipt.store.nameEn || 'SWEET BAKERY & CAFE'}
              </h2>
              <p className="text-[11px] font-sans text-slate-700 font-bold font-battambang">
                {receipt.store.nameKh || 'ហាងនំខេក ស្វីតបេកខឺរី'}
              </p>
              {receipt.store.addr && (
                <p className="text-[10px] text-slate-500 font-battambang">{receipt.store.addr}</p>
              )}
              {receipt.store.phone && (
                <p className="text-[10px] text-slate-500 font-battambang">ទូរស័ព្ទ៖ {receipt.store.phone}</p>
              )}
            </div>

            {/* Receipt Metadata */}
            <div className="text-[10px] space-y-1 border-b border-dashed border-slate-300 pb-2 font-battambang">
              {receipt.isDep && (
                <div className="py-1 px-2 bg-amber-100 text-amber-900 font-black text-center rounded-md uppercase tracking-wider text-[10px] mb-1">
                  *** បង្កាន់ដៃកក់ប្រាក់ (DEPOSIT RECEIPT) ***
                </div>
              )}
              <div className="flex justify-between">
                <span>វិក្កយបត្រ (Inv #):</span>
                <span className="font-bold font-mono text-slate-900">{receipt.inv}</span>
              </div>
              <div className="flex justify-between">
                <span>កាលបរិច្ឆេទ (Date):</span>
                <span className="font-bold font-mono">
                  {formatDateTimeDMY(receipt.dt)}
                </span>
              </div>
              {receipt.cust && (
                <div className="flex justify-between">
                  <span>អតិថិជន:</span>
                  <span className="font-bold text-slate-900">{receipt.cust}</span>
                </div>
              )}
              {receipt.phone && (
                <div className="flex justify-between">
                  <span>ទូរស័ព្ទ:</span>
                  <span className="font-bold font-mono">{receipt.phone}</span>
                </div>
              )}
              {receipt.pickDate && (
                <div className="flex justify-between font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">
                  <span>ពេលមកយក (Pickup):</span>
                  <span>{formatDateDMY(receipt.pickDate)} {receipt.pickTime || ''}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>បេឡាធិការ (Cashier):</span>
                <span>{receipt.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span>ការទូទាត់:</span>
                <span className="font-bold font-mono">{receipt.pay}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-slate-300 pb-2">
              <table className="w-full text-left font-battambang">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px]">
                    <th className="py-1">ទំនិញ (Item)</th>
                    <th className="text-center py-1">ចំនួន</th>
                    <th className="text-right py-1 font-mono">សរុប (៛)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipt.items.map((item, idx) => (
                    <tr key={idx} className="text-[11px]">
                      <td className="py-1.5">
                        <div className="font-semibold text-slate-800">{item.n}</div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {roundKhr(item.u).toLocaleString()} ៛ (~${item.usd.toFixed(2)}) / នំ
                        </div>
                      </td>
                      <td className="text-center py-1.5 font-bold font-mono">{item.q}</td>
                      <td className="text-right py-1.5 font-bold font-mono">
                        {roundKhr(item.t).toLocaleString()} ៛
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Calculation - KHR ៛ FIRST */}
            <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3 font-battambang">
              <div className="flex justify-between font-black text-sm pt-1 text-slate-900">
                <span>{receipt.isDep ? 'តម្លៃទំនិញសរុប (Total):' : 'សរុបត្រូវបង់ (KHR ៛):'}</span>
                <span className="font-mono text-base text-pink-700">
                  {roundKhr(receipt.totKhr).toLocaleString()} ៛
                </span>
              </div>
              <div className="flex justify-between font-bold text-xs text-slate-500 font-mono">
                <span>សមមូល (USD $):</span>
                <span>${receipt.totUsd.toFixed(2)}</span>
              </div>

              {receipt.isDep && (
                <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>ប្រាក់បានកក់ (Deposit Paid):</span>
                    <span className="font-black font-mono">
                      {receipt.depKhr !== undefined ? roundKhr(receipt.depKhr).toLocaleString() : '0'} ៛ (~${receipt.depUsd?.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-rose-600">
                    <span>នៅខ្វះពេលមកយក (Remaining):</span>
                    <span className="font-mono">
                      {receipt.remKhr !== undefined ? roundKhr(receipt.remKhr).toLocaleString() : '0'} ៛ (~${receipt.remUsd?.toFixed(2)})
                    </span>
                  </div>
                </div>
              )}

              {receipt.paidKhr !== undefined && (
                <div className="flex justify-between text-[11px] pt-1">
                  <span>ប្រាក់ទទួលបាន (៛):</span>
                  <span className="font-mono">{roundKhr(receipt.paidKhr).toLocaleString()} ៛</span>
                </div>
              )}
              {receipt.paidUsd !== undefined && (
                <div className="flex justify-between text-[11px] pt-1">
                  <span>ប្រាក់ទទួលបាន ($):</span>
                  <span className="font-mono">${receipt.paidUsd.toFixed(2)}</span>
                </div>
              )}
              {receipt.changeKhr !== undefined && receipt.changeKhr > 0 && (
                <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                  <span>ប្រាក់អាប់ជូន (៛ / $):</span>
                  <span className="font-mono">
                    {roundKhr(receipt.changeKhr).toLocaleString()} ៛ (~${receipt.changeUsd?.toFixed(2)})
                  </span>
                </div>
              )}
            </div>

            {/* Footer / Thank You / Store KHQR */}
            <div className="text-center space-y-2 pt-1 font-battambang">
              <p className="text-[11px] font-bold text-slate-800">
                សូមអរគុណ! សូមអញ្ជើញមកពិសារម្តងទៀត 🙏
              </p>
              <p className="text-[9px] text-slate-500 font-medium">
                {receipt.store.tagline || 'នំស្រស់ៗដុតជារៀងរាល់ថ្ងៃ • មានទទួលកុម្ម៉ង់នំខួបកំណើតគ្រប់ម៉ូដ'}
              </p>
              <div className="w-20 h-20 mx-auto bg-slate-50 p-1 rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center">
                {receipt.store.khqrImage ? (
                  <img
                    src={getProductImageUrl(receipt.store.khqrImage)}
                    alt="Store KHQR"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCodeImage
                    data={`bakong://pay?merchant=${encodeURIComponent(
                      receipt.store.khqrMerchant || receipt.store.nameEn || 'SWEET_BAKERY'
                    )}&account=${encodeURIComponent(
                      receipt.store.khqrBakongId || 'sweet_bakery@aba'
                    )}`}
                    size={80}
                    alt="Store KHQR"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <p className="text-[8px] text-slate-400">
                {receipt.pay === 'KHQR_BAKONG'
                  ? 'ទូទាត់តាម KHQR Bakong ជោគជ័យ'
                  : 'ស្កេន KHQR ដើម្បីទូទាត់ ឬវាយតម្លៃសេវាកម្ម'}
              </p>
              <p className="text-[7.5px] text-slate-400 pt-1 border-t border-slate-100">
                SweetBakery POS • បង្កើតដោយ សុធារិទ្ធ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 📥 1-Click Save to Phone Action Button (Clean, Pure, No Distractions) */}
      <div className="w-full max-w-sm mt-4 mb-8 no-print space-y-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveReceipt}
          className={`w-full py-3.5 px-4 rounded-2xl text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer font-battambang active:scale-98 ${
            saveSuccess
              ? 'bg-emerald-600 shadow-emerald-900/30'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-950/40 border border-emerald-400/30'
          } ${isSaving ? 'opacity-80 cursor-wait' : ''}`}
        >
          <Download className={`w-5 h-5 shrink-0 ${isSaving ? 'animate-bounce' : ''}`} />
          <span>
            {isSaving
              ? 'កំពុងរក្សាទុកវិក្កយបត្រ...'
              : saveSuccess
              ? 'បានរក្សាទុកវិក្កយបត្រក្នុងទូរស័ព្ទជោគជ័យ! ✅'
              : '📥 រក្សាទុកវិក្កយបត្រក្នុងទូរស័ព្ទ (Save to Phone)'}
          </span>
        </button>

        <p className="text-[10px] text-center text-slate-400 font-battambang">
          💡 ចុចប៊ូតុងខាងលើ ដើម្បីទាញយករូបភាពវិក្កយបត្រទុកក្នុង Album រូបភាព ឬ Files ទូរស័ព្ទរបស់អ្នក
        </p>
      </div>
    </div>
  );
};
