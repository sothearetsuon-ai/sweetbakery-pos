import React, { useState, useMemo } from 'react';
import {
  X,
  Cake,
  Calendar,
  Gift,
  Send,
  Phone,
  Copy,
  Check,
  Sparkles,
  Heart,
  AlertCircle
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { extractUpcomingBirthdays, BirthdayCustomer } from '../../services/smartBirthdayCrmService';
import { soundFx } from '../../utils/audio';
import { sendTelegramOrderNotification } from '../../services/telegram';

interface SmartBirthdayCrmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartBirthdayCrmModal: React.FC<SmartBirthdayCrmModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customOrders, storeInfo } = useBakery();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  const upcomingBirthdays = useMemo(
    () => extractUpcomingBirthdays(customOrders, 14),
    [customOrders]
  );

  const todayBirthdaysCount = useMemo(
    () => upcomingBirthdays.filter((b) => b.isToday).length,
    [upcomingBirthdays]
  );

  const handleCopyGreeting = (customer: BirthdayCustomer) => {
    soundFx.playPop();
    navigator.clipboard.writeText(customer.suggestedGreetingKh);
    setCopiedId(customer.customerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTelegramGreeting = async (customer: BirthdayCustomer) => {
    soundFx.playSuccess();
    setDispatchedId(customer.customerId);
    try {
      await sendTelegramOrderNotification(customer.suggestedGreetingKh);
    } catch (e) {}
    setTimeout(() => setDispatchedId(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-pink-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">
              🎂
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm sm:text-base tracking-tight leading-tight">
                  Smart Birthday CRM & Auto-Greeting
                </h3>
                <span className="px-2 py-0.5 bg-white/20 text-yellow-300 rounded-full text-[10px] font-black uppercase">
                  ថែទាំភ្ញៀវស្វ័យប្រវត្តិ
                </span>
              </div>
              <p className="text-[11px] text-pink-100 mt-0.5">
                រំលឹកថ្ងៃខួបកំណើតភ្ញៀវក្នុង ១៤ ថ្ងៃខាងមុខ និងផ្ញើសារជូនពរ + Voucher
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 block">
                ខួបកំណើតថ្ងៃនេះ (Today)
              </span>
              <div className="text-xl font-black text-pink-700 mt-0.5">
                {todayBirthdaysCount} នាក់
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 block">
                ខួបកំណើតក្នុង ១៤ ថ្ងៃខាងមុខ
              </span>
              <div className="text-xl font-black text-amber-700 mt-0.5">
                {upcomingBirthdays.length} នាក់
              </div>
            </div>
          </div>

          {/* List of Customers */}
          <div className="space-y-3">
            {upcomingBirthdays.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="text-4xl">🎉</div>
                <h4 className="font-bold text-xs text-slate-700">
                  មិនទាន់មានភ្ញៀវដល់ថ្ងៃខួបកំណើតក្នុង ២ សប្តាហ៍នេះទេ
                </h4>
                <p className="text-[11px] text-slate-400">
                  រាល់ពេលមានភ្ញៀវកុម្ម៉ង់នំខួបកំណើតថ្មី ប្រព័ន្ធនឹងកត់ត្រា និងរំលឹកដោយស្វ័យប្រវត្តិជារៀងរាល់ឆ្នាំ!
                </p>
              </div>
            ) : (
              upcomingBirthdays.map((cust) => {
                const isCopied = copiedId === cust.customerId;
                const isDispatched = dispatchedId === cust.customerId;

                return (
                  <div
                    key={cust.customerId}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2.5 hover:border-pink-300 transition-all"
                  >
                    {/* Top Row: Customer info & countdown */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-sm text-slate-800">
                            {cust.customerName}
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">
                            ({cust.customerPhone})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          នំធ្លាប់កុម្ម៉ង់៖ <span className="font-bold text-pink-700">{cust.cakeName || 'នំខេកខួបកំណើត'}</span> ({cust.flavor || 'សូកូឡា'})
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                          cust.isToday
                            ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {cust.isToday
                          ? '🎉 ខួបកំណើតថ្ងៃនេះ!'
                          : `នៅសល់ ${cust.daysUntilBirthday} ថ្ងៃ`}
                      </span>
                    </div>

                    {/* Inscription preview if any */}
                    {cust.inscription && (
                      <div className="text-[10px] bg-pink-50/70 p-2 rounded-xl text-pink-900 border border-pink-100 italic">
                        ✍️ អក្សរធ្លាប់ដាក់លើនំ៖ "{cust.inscription}"
                      </div>
                    )}

                    {/* Actions: Send Greeting, Copy, Call */}
                    <div className="pt-1 flex items-center gap-1.5 flex-wrap border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleSendTelegramGreeting(cust)}
                        disabled={isDispatched}
                        className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                      >
                        {isDispatched ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{isDispatched ? 'បានផ្ញើរួច' : 'ផ្ញើសារជូនពរ Telegram'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyGreeting(cust)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'បានចម្លង' : 'ចម្លងពាក្យជូនពរ'}</span>
                      </button>

                      <a
                        href={`tel:${cust.customerPhone}`}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>ខលជូនពរ</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
