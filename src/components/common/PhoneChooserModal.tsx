import React, { useState } from 'react';
import { Phone, PhoneCall, Copy, Check, X, Sparkles } from 'lucide-react';
import { parsePhoneNumbers, dialPhoneNumber, ParsedPhoneNumber } from '../../utils/phoneUtils';
import { soundFx } from '../../utils/audio';

interface PhoneChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneString?: string;
  storeName?: string;
}

export const PhoneChooserModal: React.FC<PhoneChooserModalProps> = ({
  isOpen,
  onClose,
  phoneString,
  storeName = 'Sweet Bakery',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const phoneList: ParsedPhoneNumber[] = parsePhoneNumbers(phoneString);

  const handleCall = (digits: string) => {
    soundFx.playPop();
    dialPhoneNumber(digits);
    onClose();
  };

  const handleCopy = (num: string, idx: number) => {
    soundFx.playPop();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col font-battambang animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center shadow-xs">
              <PhoneCall className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">
                ជ្រើសរើសលេខទូរស័ព្ទ
              </h3>
              <p className="text-[10px] text-pink-100 font-medium">
                {storeName} • ទំនាក់ទំនងហាង
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5 bg-slate-50/50">
          <p className="text-xs text-slate-600 text-center font-medium">
            សូមជ្រើសរើសប្រព័ន្ធទូរស័ព្ទដែលលោកអ្នកចង់ខលទាក់ទងមកហាង៖
          </p>

          {phoneList.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              មិនមានលេខទូរស័ព្ទក្នុងប្រព័ន្ធឡើយ
            </div>
          ) : (
            phoneList.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 transition-all hover:border-pink-300 hover:shadow-md"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-slate-900 text-sm tracking-wide">
                        {item.display}
                      </span>
                      {item.carrier && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${item.badgeClass}`}
                        >
                          {item.carrier}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      ចុចដើម្បីខលចេញភ្លាមៗ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.digits, idx)}
                    title="ចម្លងលេខ"
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCall(item.digits)}
                    className="py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>ខល</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

