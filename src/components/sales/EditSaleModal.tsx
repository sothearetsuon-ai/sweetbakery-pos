import React, { useState } from 'react';
import { X, Edit3, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { CompletedSale } from '../../types';
import { soundFx } from '../../utils/audio';

interface EditSaleModalProps {
  sale: CompletedSale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditSaleModal: React.FC<EditSaleModalProps> = ({ sale, isOpen, onClose }) => {
  const { updateSale, exchangeRate } = useBakery();

  if (!isOpen || !sale) return null;

  const saleDateObj = new Date(sale.createdAt);
  const initialDate = !isNaN(saleDateObj.getTime())
    ? saleDateObj.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const initialTime = !isNaN(saleDateObj.getTime())
    ? saleDateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '12:00';

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [orderNumber, setOrderNumber] = useState(sale.orderNumber);
  const [customerName, setCustomerName] = useState(sale.customerName || '');
  const [amountKhr, setAmountKhr] = useState(sale.totalKhr.toString());
  const [paymentMethod, setPaymentMethod] = useState(sale.paymentMethod);
  const [cashierName, setCashierName] = useState(sale.cashierName);
  const [notes, setNotes] = useState(sale.notes || '');

  const numKhr = parseFloat(amountKhr) || 0;
  const numUsd = parseFloat((numKhr / exchangeRate).toFixed(2));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (numKhr <= 0) return;

    soundFx.playSuccess();

    const updatedCreatedAt = new Date(`${date}T${time}:00`).toISOString();

    updateSale({
      ...sale,
      orderNumber,
      customerName: customerName || undefined,
      totalKhr: numKhr,
      totalUsd: numUsd,
      subtotalUsd: numUsd,
      paymentMethod,
      cashierName,
      notes,
      createdAt: updatedCreatedAt,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100/70 flex items-center justify-between bg-gradient-to-r from-rose-50/60 to-pink-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                កែប្រែទិន្នន័យការលក់ (Edit Sale)
              </h3>
              <p className="text-xs text-slate-500">{sale.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4 bg-rose-50/30 p-3.5 rounded-2xl border border-rose-100/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ថ្ងៃលក់ (Sale Date)
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ម៉ោងលក់ (Sale Time)
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
          </div>

          {/* Order number & Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                លេខវិក្កយបត្រ (Invoice #)
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឈ្មោះអតិថិជន (Customer Name)
              </label>
              <input
                type="text"
                placeholder="ឧ. អតិថិជនទូទៅ"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
          </div>

          {/* Amount in KHR ៛ FIRST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                ទឹកប្រាក់គិតជាលុយខ្មែរ (KHR ៛) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  value={amountKhr}
                  onChange={(e) => setAmountKhr(e.target.value)}
                  className="w-full px-3 py-2 text-base font-black text-pink-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ៛
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                សមមូលជាដុល្លារ (~ USD $)
              </label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700">
                ${numUsd.toFixed(2)} (អត្រា $1 = {exchangeRate.toLocaleString()} ៛)
              </div>
            </div>
          </div>

          {/* Payment Method & Cashier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">វិធីសាស្ត្រទូទាត់</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-bold text-slate-800"
              >
                <option value="CASH_KHR">សាច់ប្រាក់ (៛ រៀល)</option>
                <option value="CASH_USD">សាច់ប្រាក់ ($ ដុល្លារ)</option>
                <option value="KHQR_BAKONG">ស្កេន KHQR Bakong / ABA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">បេឡាធិការ / អ្នកលក់</label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-medium"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ចំណាំ</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-rose-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-600/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>រក្សាទុកការកែប្រែ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
