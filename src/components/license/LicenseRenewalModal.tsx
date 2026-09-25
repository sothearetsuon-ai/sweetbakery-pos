import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Copy,
  Send,
  Check,
  Radio,
  Lock,
  Phone,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  applyLicenseKey,
  getDeviceId,
  LicenseInfo,
} from '../../utils/licenseManager';
import {
  isSuperAdminAuthenticated,
  authenticateSuperAdmin,
} from '../../utils/superAdminAuth';
import { soundFx } from '../../utils/audio';

interface LicenseRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenewSuccess: () => void;
  licenseInfo: LicenseInfo;
  onOpenSuperAdminPortal?: () => void;
}

export const LicenseRenewalModal: React.FC<LicenseRenewalModalProps> = ({
  isOpen,
  onClose,
  onRenewSuccess,
  licenseInfo,
  onOpenSuperAdminPortal,
}) => {
  const [keyCode, setKeyCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // App Super Admin login prompt state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => isSuperAdminAuthenticated());

  useEffect(() => {
    if (isOpen) {
      setIsSuperAdmin(isSuperAdminAuthenticated());
      setShowAdminLogin(false);
      setAdminPinInput('');
      setAdminPinError('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDeviceId = licenseInfo.deviceId || getDeviceId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleActivate(keyCode);
  };

  const handleActivate = (codeToUse: string) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!codeToUse.trim()) {
      setErrorMsg('សូមបញ្ចូលកូដបន្តសុពលភាព');
      soundFx.playPop();
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = applyLicenseKey(codeToUse);
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

  const handleCopyDeviceId = () => {
    soundFx.playPop();
    navigator.clipboard.writeText(currentDeviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleTelegramShare = () => {
    soundFx.playPop();
    const text = encodeURIComponent(
      `ជំរាបសួរ Admin! ខ្ញុំសូមស្នើសុំបន្តសុពលភាពកម្មវិធី SweetBakery POS:\n- លេខសម្គាល់ម៉ាស៊ីន (Device ID): ${currentDeviceId}\nសូមមេត្តាជួយផ្តល់កូដបន្តសុពលភាព ឬដោះសោតាម Cloud។ សូមអរគុណ!`
    );
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
  };

  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = authenticateSuperAdmin(adminPinInput);
    if (res.success) {
      soundFx.playSuccess();
      setIsSuperAdmin(true);
      setShowAdminLogin(false);
      setAdminPinInput('');
      setAdminPinError('');
      if (onOpenSuperAdminPortal) {
        onClose();
        onOpenSuperAdminPortal();
      }
    } else {
      soundFx.playPop();
      setAdminPinError(res.message);
    }
  };

  const expiryDateFormatted = new Date(licenseInfo.expiresAt).toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
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
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Current Status Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">ស្ថានភាពបច្ចុប្បន្ន</span>
              <span className="text-sm font-black text-slate-800">
                {licenseInfo.isPermanent
                  ? '⭐ គណនីពេញមួយជីវិត (Lifetime)'
                  : `⏳ សាកល្បង៖ សល់ ${licenseInfo.daysRemaining} ថ្ងៃ`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">កាលបរិច្ឆេទផុតកំណត់</span>
              <span className="text-xs font-bold text-slate-700">
                {licenseInfo.isPermanent ? 'គ្មានកំណត់' : expiryDateFormatted}
              </span>
            </div>
          </div>

          {/* Machine Device ID Box */}
          <div className="p-3.5 bg-gradient-to-r from-slate-50 to-pink-50/40 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-pink-600 animate-pulse" />
                <span>លេខសម្គាល់ម៉ាស៊ីននេះ (Device ID)</span>
              </span>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                សម្រាប់ស្នើសុំកូដ
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <code className="font-mono font-black text-xs text-slate-800 tracking-wider">
                {currentDeviceId}
              </code>
              <button
                type="button"
                onClick={handleCopyDeviceId}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
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

            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-0.5">
              <span>ផ្ញើលេខសម្គាល់នេះទៅ Admin៖</span>
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

          {/* Key Input Form */}
          {successMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center space-y-1 animate-in zoom-in-95">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-black text-sm">{successMsg}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-pink-600" />
                  <span>វាយបញ្ចូលកូដបន្តសុពលភាពដែលទទួលបានពី Admin (License Key)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ACT-XXXX-35D-XXXX"
                    value={keyCode}
                    onChange={(e) => {
                      setKeyCode(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    className="w-full px-4 py-2.5 text-xs font-mono font-black text-center tracking-wider bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 uppercase transition-all shadow-2xs"
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-xl">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
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

          {/* App Super Admin Portal Access (Dedicated Protected Entry Point) */}
          <div className="pt-3 border-t border-slate-100">
            {isSuperAdmin ? (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-xs">
                    👑
                  </span>
                  <div>
                    <div className="text-xs font-black text-amber-950">
                      អ្នកបានចូលជា App Super Admin
                    </div>
                    <div className="text-[10px] text-amber-700">
                      អាចបង្កើតកូដ & ដោះសោតាម Cloud សម្រាប់អតិថិជន
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    onClose();
                    if (onOpenSuperAdminPortal) onOpenSuperAdminPortal();
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>បើកផ្ទាំងគ្រប់គ្រង</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : showAdminLogin ? (
              <form onSubmit={handleAdminPinSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>ចូលទៅកាន់ផ្ទាំង App Super Admin</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    បោះបង់
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    required
                    placeholder="បញ្ចូល Master PIN..."
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      setAdminPinError('');
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    បញ្ជាក់
                  </button>
                </div>

                {adminPinError && (
                  <div className="text-[11px] text-rose-600 font-bold">
                    {adminPinError}
                  </div>
                )}
              </form>
            ) : (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="text-[11px]">សម្រាប់ម្ចាស់ហាង • SweetBakery POS</span>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setShowAdminLogin(true);
                  }}
                  className="text-[11px] text-slate-400 hover:text-amber-600 flex items-center gap-1 cursor-pointer hover:underline transition-colors"
                >
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>ច្រកចូល App Super Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
