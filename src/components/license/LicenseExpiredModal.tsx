import React, { useState, useEffect } from 'react';
import { Lock, Key, ShieldAlert, Phone, Send, CheckCircle2, Sparkles, Copy, Check, Radio, Wifi } from 'lucide-react';
import confetti from 'canvas-confetti';
import { applyLicenseKey, getDeviceId } from '../../utils/licenseManager';
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
  const [copiedId, setCopiedId] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDeviceId(getDeviceId());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyDeviceId = () => {
    soundFx.playPop();
    navigator.clipboard.writeText(deviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleTelegramShare = () => {
    soundFx.playPop();
    const text = encodeURIComponent(
      `ជំរាបសួរ Admin! ខ្ញុំសូមស្នើសុំបន្តសុពលភាពកម្មវិធី SweetBakery POS:\n- លេខសម្គាល់ម៉ាស៊ីន (Machine ID): ${deviceId}\nសូមមេត្តាជួយដោះសោពីចម្ងាយ ឬផ្តល់កូដបន្តសុពលភាព។ សូមអរគុណ!`
    );
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
  };

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
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-300">
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
              : 'រយៈពេលកំណត់នៃប្រព័ន្ធ SweetBakery POS ត្រូវបានបញ្ចប់។ សូមទាក់ទងមកកាន់អ្នកគ្រប់គ្រងដើម្បីដោះសោ។'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Unique Machine ID Box */}
          <div className="p-3.5 bg-gradient-to-r from-slate-50 to-pink-50/40 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-pink-600 animate-pulse" />
                <span>លេខសម្គាល់ម៉ាស៊ីន (Machine ID)</span>
              </span>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                ឧបករណ៍ជាក់លាក់
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs">
              <code className="font-mono font-black text-sm text-slate-800 tracking-wider">
                {deviceId || 'DEV-....'}
              </code>
              <button
                type="button"
                onClick={handleCopyDeviceId}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">បានចម្លង</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>ចម្លង</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1">
              <span>ផ្ញើលេខ ID នេះទៅកាន់ម្ចាស់ប្រព័ន្ធដើម្បីដោះសោ</span>
              <button
                type="button"
                onClick={handleTelegramShare}
                className="text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>ផ្ញើតាម Telegram</span>
              </button>
            </div>
          </div>

          {/* Cloud Auto-Unlock Status Pulse */}
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-emerald-800">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-[11px] font-bold leading-tight">
              📡 ប្រព័ន្ធ Cloud កំពុងភ្ជាប់៖ ម្ចាស់ប្រព័ន្ធអាចដោះសោពីចម្ងាយដោយស្វ័យប្រវត្តិ (មិនបាច់វាយកូដ)
            </div>
          </div>

          {successMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center space-y-1 animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-black text-sm">{successMsg}</div>
              <div className="text-xs text-emerald-600">កំពុងបើកដំណើរការប្រព័ន្ធឡើងវិញ...</div>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-pink-600" />
                  <span>ឬបញ្ចូលកូដដោះសោដែលម្ចាស់ផ្ញើមក (Locked Key / PIN)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ACT-....-35D-.... ឬ PIN"
                    value={keyCode}
                    onChange={(e) => {
                      setKeyCode(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    className="w-full px-4 py-2.5 text-sm font-mono font-black text-center tracking-wider bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 uppercase transition-all"
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl animate-in shake">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isActivating}
                className="w-full py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-pink-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isActivating ? (
                  <span>កំពុងត្រួតពិនិត្យ...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>បញ្ជាក់កូដដោះសោ</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Contact Admin Quick Links */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
            <button
              type="button"
              onClick={handleTelegramShare}
              className="flex items-center gap-1 text-sky-600 hover:text-sky-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>
            <span>•</span>
            <a
              href="tel:012345678"
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>ទូរស័ព្ទ Admin</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

