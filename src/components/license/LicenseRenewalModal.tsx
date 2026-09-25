import React, { useState } from 'react';
import { X, Key, ShieldCheck, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { applyLicenseKey, getLicenseInfo, LicenseInfo } from '../../utils/licenseManager';
import { soundFx } from '../../utils/audio';

interface LicenseRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenewSuccess: () => void;
  licenseInfo: LicenseInfo;
}

export const LicenseRenewalModal: React.FC<LicenseRenewalModalProps> = ({
  isOpen,
  onClose,
  onRenewSuccess,
  licenseInfo,
}) => {
  const [keyCode, setKeyCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!keyCode.trim()) {
      setErrorMsg('សូមបញ្ចូលកូដបន្តសុពលភាព');
      soundFx.playPop();
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = applyLicenseKey(keyCode);
      setIsSubmitting(false);

      if (result.success) {
        soundFx.playSuccess();
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        setSuccessMsg(result.message);
        setTimeout(() => {
          onRenewSuccess();
          onClose();
        }, 1200);
      } else {
        soundFx.playPop();
        setErrorMsg(result.message);
      }
    }, 400);
  };

  const expiryDateFormatted = new Date(licenseInfo.expiresAt).toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-pink-600 to-amber-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                សុពលភាពប្រព័ន្ធ (App License)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {licenseInfo.isPermanent
                  ? 'សិទ្ធិប្រើប្រាស់ពេញមួយជីវិត (Lifetime)'
                  : `នៅសល់ ${licenseInfo.daysRemaining} ថ្ងៃ (ផុតកំណត់៖ ${expiryDateFormatted})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">ស្ថានភាពបច្ចុប្បន្ន</span>
              <span className="text-sm font-black text-slate-800">
                {licenseInfo.isPermanent
                  ? '⭐ គណនីពេញមួយជីវិត (Lifetime)'
                  : `⏳ សាកល្បង៖ សល់ ${licenseInfo.daysRemaining} ថ្ងៃ`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">កាលបរិច្ឆេទផុតកំណត់</span>
              <span className="text-xs font-bold text-rose-600 font-mono">
                {licenseInfo.isPermanent ? 'គ្មានកំណត់' : expiryDateFormatted}
              </span>
            </div>
          </div>

          {successMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center space-y-1">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
              <div className="font-black text-sm">{successMsg}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-pink-600" />
                  <span>វាយបញ្ចូលកូដបន្តសុពលភាពថ្មី (License Key / PIN)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. BAKERY-35D-EXTEND ឬ PIN"
                  value={keyCode}
                  onChange={(e) => {
                    setKeyCode(e.target.value.toUpperCase());
                    setErrorMsg('');
                  }}
                  className="w-full px-4 py-2.5 text-sm font-mono font-black text-center tracking-wider bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 uppercase transition-all"
                />

                {errorMsg && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-xl">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  បិទ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-pink-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'កំពុងពិនិត្យ...' : 'បញ្ចូលកូដ'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
