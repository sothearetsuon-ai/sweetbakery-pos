import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { CompletedSale } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';

interface ReceiptModalProps {
  sale: CompletedSale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, isOpen, onClose }) => {
  const { lang, exchangeRate, storeInfo } = useBakery();
  const text = t[lang];

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Actions */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>វិក្កយបត្រផ្លូវការ (Official Receipt)</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div
            id="printable-receipt"
            className="text-slate-900 text-xs font-mono leading-relaxed space-y-3"
          >
            {/* Store Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
              {storeInfo.logoUrl && (
                <div className="w-14 h-14 mx-auto mb-1.5 rounded-xl overflow-hidden border border-slate-200 p-0.5">
                  <img
                    src={storeInfo.logoUrl}
                    alt="Store Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <h2 className="text-base font-black tracking-tight font-sans text-slate-900 uppercase">
                {storeInfo.nameEn || 'SWEET BAKERY & CAFE'}
              </h2>
              <p className="text-[11px] font-sans text-slate-700 font-bold">
                {storeInfo.nameKh || 'ហាងនំខេក ស្វីតបេកខឺរី'}
              </p>
              <p className="text-[10px] text-slate-500">{storeInfo.address}</p>
              <p className="text-[10px] text-slate-500">ទូរស័ព្ទ៖ {storeInfo.phone}</p>
            </div>

            {/* Receipt Metadata */}
            <div className="text-[10px] space-y-1 border-b border-dashed border-slate-300 pb-2">
              {sale.isDeposit && (
                <div className="py-1 px-2 bg-amber-100 text-amber-900 font-black text-center rounded-md uppercase tracking-wider text-[10px] mb-1">
                  *** បង្កាន់ដៃកក់ប្រាក់ (DEPOSIT RECEIPT) ***
                </div>
              )}
              <div className="flex justify-between">
                <span>វិក្កយបត្រ (Inv #):</span>
                <span className="font-bold">{sale.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>កាលបរិច្ឆេទ:</span>
                <span>{new Date(sale.createdAt).toLocaleString('km-KH')}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span>អតិថិជន:</span>
                  <span className="font-bold">{sale.customerName}</span>
                </div>
              )}
              {sale.customerPhone && (
                <div className="flex justify-between">
                  <span>ទូរស័ព្ទ:</span>
                  <span className="font-bold">{sale.customerPhone}</span>
                </div>
              )}
              {sale.pickupDate && (
                <div className="flex justify-between font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">
                  <span>ពេលមកយក (Pickup):</span>
                  <span>{sale.pickupDate} {sale.pickupTime || ''}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>បេឡាធិការ (Cashier):</span>
                <span>{sale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>ការទូទាត់:</span>
                <span className="font-bold">{sale.paymentMethod}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-slate-300 pb-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px]">
                    <th className="py-1">ទំនិញ (Item)</th>
                    <th className="text-center py-1">ចំនួន</th>
                    <th className="text-right py-1">សរុប (៛)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item, idx) => {
                    const itemKhr = Math.round(item.priceUsd * exchangeRate * item.quantity);
                    return (
                      <tr key={idx} className="text-[11px]">
                        <td className="py-1.5 font-sans">
                          <div className="font-semibold text-slate-800">{item.nameKh}</div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {Math.round(item.priceUsd * exchangeRate).toLocaleString()} ៛ (~${item.priceUsd.toFixed(2)}) / នំ
                          </div>
                        </td>
                        <td className="text-center py-1.5 font-bold">{item.quantity}</td>
                        <td className="text-right py-1.5 font-bold font-mono">
                          {itemKhr.toLocaleString()} ៛
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Calculation - KHR ៛ FIRST */}
            <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
              {/* Grand Total KHR First in Large Font */}
              <div className="flex justify-between font-black text-sm pt-1 text-slate-900">
                <span>{sale.isDeposit ? 'តម្លៃទំនិញសរុប (Total):' : 'សរុបត្រូវបង់ (KHR ៛):'}</span>
                <span>{sale.totalKhr.toLocaleString()} ៛</span>
              </div>
              {/* Secondary USD */}
              <div className="flex justify-between font-bold text-xs text-slate-500">
                <span>សមមូល (USD $):</span>
                <span>${sale.totalUsd.toFixed(2)}</span>
              </div>

              {/* Deposit breakdown if applicable */}
              {sale.isDeposit && (
                <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>ប្រាក់បានកក់ (Deposit Paid):</span>
                    <span className="font-black">{sale.depositKhr?.toLocaleString()} ៛ (~${sale.depositUsd?.toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between font-black text-rose-600">
                    <span>នៅខ្វះពេលមកយក (Remaining):</span>
                    <span>{sale.remainingKhr?.toLocaleString()} ៛ (~${sale.remainingUsd?.toFixed(2)})</span>
                  </div>
                </div>
              )}

              {sale.paidKhr !== undefined && (
                <div className="flex justify-between text-[11px] pt-1">
                  <span>ប្រាក់ទទួលបាន (៛):</span>
                  <span>{sale.paidKhr.toLocaleString()} ៛</span>
                </div>
              )}
              {sale.paidUsd !== undefined && (
                <div className="flex justify-between text-[11px] pt-1">
                  <span>ប្រាក់ទទួលបាន ($):</span>
                  <span>${sale.paidUsd.toFixed(2)}</span>
                </div>
              )}
              {sale.changeKhr !== undefined && sale.changeKhr > 0 && (
                <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                  <span>ប្រាក់អាប់ជូន (៛ / $):</span>
                  <span>{sale.changeKhr.toLocaleString()} ៛ (~${sale.changeUsd?.toFixed(2)})</span>
                </div>
              )}
            </div>

            {/* Footer / Thank You / QR */}
            <div className="text-center space-y-2 pt-1 font-sans">
              <p className="text-[11px] font-bold text-slate-800">
                សូមអរគុណ! សូមអញ្ជើញមកពិសារម្តងទៀត 🙏
              </p>
              <p className="text-[9px] text-slate-500 font-medium">
                {storeInfo.tagline || 'នំស្រស់ៗដុតជារៀងរាល់ថ្ងៃ • មានទទួលកុម្ម៉ង់នំខួបកំណើតគ្រប់ម៉ូដ'}
              </p>
              <div className="w-20 h-20 mx-auto bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-hidden">
                <img
                  src={
                    storeInfo.khqrQrImage ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=bakong://pay?merchant=${encodeURIComponent(
                      storeInfo.khqrMerchantName || 'SWEET_BAKERY'
                    )}&account=${encodeURIComponent(
                      storeInfo.khqrBakongId || 'sweet_bakery@aba'
                    )}`
                  }
                  alt="KHQR / Feedback"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[8px] text-slate-400">
                {sale.paymentMethod === 'KHQR_BAKONG'
                  ? 'ទូទាត់តាម KHQR Bakong ជោគជ័យ'
                  : 'ស្កេន KHQR ដើម្បីទូទាត់ ឬវាយតម្លៃសេវាកម្ម'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>{text.printReceipt}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            {text.close}
          </button>
        </div>
      </div>
    </div>
  );
};
