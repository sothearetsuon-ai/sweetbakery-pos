import React, { useState } from 'react';
import { Lock, Key, ShieldAlert, Phone, Send, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { applyLicenseKey } from '../../utils/licenseManager';
import { soundFx } from '../../utils/audio';

interface LicenseExpiredModalProps {
  isOpen: boolean;
  onRenewSuccess: () => void;
  isTamper?: boolean;
}

export const LicenseExpiredModal: React.FC<LicenseExpiredModalProps> = ({
  isOpen,
  onRenewSuccess,
  isTamper = false,
}) => {
  const [keyCode, setKeyCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  if (!isOpen) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!keyCode.trim()) {
      setErrorMsg('សូមបញ្ចូលកូដបន្តសុពលភាព');
      soundFx.playPop();
      return;
    }

    setIsActivating(true);

    setTimeout(() => {
      const result = applyLicenseKey(keyCode);
      setIsActivating(false);

      if (result.success) {
        soundFx.playSuccess();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        setSuccessMsg(result.message);
        setTimeout(() => {
          onRenewSuccess();
        }, 1200);
      } else {
        soundFx.playPop();
        setErrorMsg(result.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Alert */}
        <div className="p-6 bg-gradient-to-br from-rose-600 via-pink-600 to-amber-600 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30 mb-3 animate-bounce">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl font-black tracking-tight mb-1">
            {isTamper ? 'កាលបរិច្ឆេទប្រព័ន្ធមិនប្រក្រតី' : 'សុពលភាពប្រើប្រាស់ត្រូវបានផុតកំណត់'}
          </h2>
          <p className="text-xs text-rose-100 font-medium max-w-xs mx-auto">
            {isTamper
              ? 'ម៉ោង ឬកាលបរិច្ឆេទនៅលើឧបករណ៍ត្រូវបានកែសម្រួលថយក្រោយ។ សូមកែម៉ោងឱ្យត្រូវ ឬបញ្ចូលកូដដោះសោ។'
              : 'រយៈពេលសាកល្បង ៣៥ ថ្ងៃនៃប្រព័ន្ធ SweetBakery POS ត្រូវបានបញ្ចប់។ សូមទាក់ទងមកកាន់អ្នកគ្រប់គ្រងដើម្បីបន្តសុពលភាពថ្មី។'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {successMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center space-y-1 animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-black text-sm">{successMsg}</div>
              <div className="text-xs text-emerald-600">កំពុងបើកដំណើរការប្រព័ន្ធឡើងវិញ...</div>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-pink-600" />
                  <span>វាយបញ្ចូលកូដបន្តសុពលភាព (License Key / PIN)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="ឧ. BAKERY-35D-EXTEND ឬ PIN"
                    value={keyCode}
                    onChange={(e) => {
                      setKeyCode(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    className="w-full px-4 py-3 text-sm font-mono font-black text-center tracking-wider bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 uppercase transition-all"
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-xl">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isActivating}
                className="w-full py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-pink-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isActivating ? (
                  <span>កំពុងត្រួតពិនិត្យ...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ដោះសោ / បន្តសុពលភាព</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Contact Admin Quick Links */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 text-center">
              ទាក់ទងអ្នកគ្រប់គ្រងដើម្បីទិញ ឬទទួលកូដបន្តសុពលភាព៖
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram Support</span>
              </a>

              <a
                href="tel:012345678"
                className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Admin</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
