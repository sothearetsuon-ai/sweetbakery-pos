import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle2, Sparkles } from 'lucide-react';
import { CompletedSale } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { getProductImageUrl } from '../../utils/imagePath';
import { formatDateTimeDMY, formatDateDMY } from '../../utils/dateUtils';
import { roundKhr } from '../../utils/currencyUtils';
import { AddPartyAddonsToSaleModal } from './AddPartyAddonsToSaleModal';

interface ReceiptModalProps {
  sale: CompletedSale | null;
  isOpen: boolean;
  onClose: () => void;
  onSaleUpdated?: (sale: CompletedSale) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, isOpen, onClose, onSaleUpdated }) => {
  const { lang, exchangeRate, storeInfo } = useBakery();
  const text = t[lang];

  const [activeSale, setActiveSale] = useState<CompletedSale | null>(sale);
  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);

  useEffect(() => {
    setActiveSale(sale);
  }, [sale]);

  const currentSale = activeSale || sale;

  if (!isOpen || !currentSale) return null;

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
                    src={getProductImageUrl(storeInfo.logoUrl)}
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
              {currentSale.isDeposit && (
                <div className="py-1 px-2 bg-amber-100 text-amber-900 font-black text-center rounded-md uppercase tracking-wider text-[10px] mb-1">
                  *** បង្កាន់ដៃកក់ប្រាក់ (DEPOSIT RECEIPT) ***
                </div>
              )}
              <div className="flex justify-between">
                <span>វិក្កយបត្រ (Inv #):</span>
                <span className="font-bold">{currentSale.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>កាលបរិច្ឆេទ (Date):</span>
                <span className="font-bold">{formatDateTimeDMY(currentSale.createdAt)}</span>
              </div>
              {currentSale.customerName && (
                <div className="flex justify-between">
                  <span>អតិថិជន:</span>
                  <span className="font-bold">{currentSale.customerName}</span>
                </div>
              )}
              {currentSale.customerPhone && (
                <div className="flex justify-between">
                  <span>ទូរស័ព្ទ:</span>
                  <span className="font-bold">{currentSale.customerPhone}</span>
                </div>
              )}
              {currentSale.pickupDate && (
                <div className="flex justify-between font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">
                  <span>ពេលមកយក (Pickup):</span>
                  <span>{formatDateDMY(currentSale.pickupDate)} {currentSale.pickupTime || ''}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>បេឡាធិការ (Cashier):</span>
                <span>{currentSale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>ការទូទាត់:</span>
                <span className="font-bold">{currentSale.paymentMethod}</span>
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
                  {currentSale.items.map((item, idx) => {
                    const unitKhr = item.priceKhr !== undefined ? roundKhr(item.priceKhr) : roundKhr(item.priceUsd * exchangeRate);
                    const itemKhr = roundKhr(unitKhr * item.quantity);
                    return (
                      <tr key={idx} className="text-[11px]">
                        <td className="py-1.5 font-sans">
                          <div className="font-semibold text-slate-800">{item.nameKh}</div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {unitKhr.toLocaleString()} ៛ (~${item.priceUsd.toFixed(2)}) / នំ
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
                <span>{currentSale.isDeposit ? 'តម្លៃទំនិញសរុប (Total):' : 'សរុបត្រូវបង់ (KHR ៛):'}</span>
                <span>{roundKhr(currentSale.totalKhr).toLocaleString()} ៛</span>
              </div>
              {/* Secondary USD */}
              <div className="flex justify-between font-bold text-xs text-slate-500">
                <span>សមមូល (USD $):</span>
                <span>${currentSale.totalUsd.toFixed(2)}</span>
              </div>

              {/* Deposit breakdown if applicable */}
              {currentSale.isDeposit && (
                <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>ប្រាក់បានកក់ (Deposit Paid):</span>
                    <span className="font-black">
                      {currentSale.depositKhr !== undefined ? roundKhr(currentSale.depositKhr).toLocaleString() : '0'} ៛ (~${currentSale.depositUsd?.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-rose-600">
                    <span>នៅខ្វះពេលមកយក (Remaining):</span>
                    <span>
                      {currentSale.remainingKhr !== undefined ? roundKhr(currentSale.remainingKhr).toLocaleString() : '0'} ៛ (~${currentSale.remainingUsd?.toFixed(2)})
                    </span>
                  </div>
                </div>
              )}

              {currentSale.paidKhr !== undefined && (
                <div className="flex justify-between text-[11px] pt-1">
                  <span>ប្រាក់ទទួលបាន (៛):</span>
                  <span>{roundKhr(currentSale.paidKhr).toLocaleString()} ៛</span>
                </div>
              )}
              {currentSale.paidUsd !== undefined && (
                <div className="flex justify-between text-[11px] pt-1">
                  <span>ប្រាក់ទទួលបាន ($):</span>
                  <span>${currentSale.paidUsd.toFixed(2)}</span>
                </div>
              )}
              {currentSale.changeKhr !== undefined && currentSale.changeKhr > 0 && (
                <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                  <span>ប្រាក់អាប់ជូន (៛ / $):</span>
                  <span>{roundKhr(currentSale.changeKhr).toLocaleString()} ៛ (~${currentSale.changeUsd?.toFixed(2)})</span>
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
                    (storeInfo.khqrQrImage ? getProductImageUrl(storeInfo.khqrQrImage) : undefined) ||
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
                {currentSale.paymentMethod === 'KHQR_BAKONG'
                  ? 'ទូទាត់តាម KHQR Bakong ជោគជ័យ'
                  : 'ស្កេន KHQR ដើម្បីទូទាត់ ឬវាយតម្លៃសេវាកម្ម'}
              </p>
              <p className="text-[7.5px] text-slate-400 pt-1 border-t border-slate-100 font-battambang">
                SweetBakery POS • បង្កើតដោយ សុធារិទ្ធ
              </p>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 space-y-2">
          {/* Post-purchase Add Party Add-ons Button */}
          <button
            type="button"
            onClick={() => setIsAddPartyOpen(true)}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>🎉 + ថែម Party Add-ons (ក្រោយទិញរួច)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{text.printReceipt}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {text.close}
            </button>
          </div>
        </div>
      </div>

      {/* Add Party Add-ons to Sale Modal */}
      <AddPartyAddonsToSaleModal
        isOpen={isAddPartyOpen}
        onClose={() => setIsAddPartyOpen(false)}
        sale={currentSale}
        onSuccess={(updated) => {
          setActiveSale(updated);
          if (onSaleUpdated) {
            onSaleUpdated(updated);
          }
        }}
      />
    </div>
  );
};
