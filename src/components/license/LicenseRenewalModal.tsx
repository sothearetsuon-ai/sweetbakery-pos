import React, { useState } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Send,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { applyLicenseKey, LicenseInfo } from '../../utils/licenseManager';
import { soundFx } from '../../utils/audio';

interface LicenseRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenewSuccess: () => void;
  licenseInfo: LicenseInfo;
}

const VAULT_KEYS = [
  { code: 'BAKERY-35D-EXTEND', label: 'បន្តបន្ថែម ៣៥ ថ្ងៃ (+35 Days)', badge: '៣៥ ថ្ងៃ' },
  { code: 'BAKERY-365D-PRO', label: 'បន្តបន្ថែម ១ ឆ្នាំ (+365 Days)', badge: '១ ឆ្នាំ' },
  { code: 'BAKERY-VIP-LIFETIME', label: 'ដោះសោរហូតពេញមួយជីវិត (Lifetime Access)', badge: 'ពេញមួយជីវិត ⭐' },
  { code: '889977', label: 'Master PIN (ថែម ១ ឆ្នាំភ្លាមៗ)', badge: 'PIN ១ ឆ្នាំ ⚡' },
  { code: '999999', label: 'Super PIN (ដោះសោពេញមួយជីវិត)', badge: 'PIN VIP ⚡' },
];

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
  const [showVault, setShowVault] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const copyToClipboard = (text: string) => {
    soundFx.playPop();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadKeysFile = () => {
    soundFx.playPop();
    const content = `=========================================
🔐 SWEETBAKERY POS - LICENSE KEYS VAULT
=========================================

1. បន្ត ៣៥ ថ្ងៃ (+35 Days):
   Code: BAKERY-35D-EXTEND

2. បន្ត ១ ឆ្នាំ (+365 Days):
   Code: BAKERY-365D-PRO

3. ដោះសោពេញមួយជីវិត (Lifetime Access):
   Code: BAKERY-VIP-LIFETIME

4. Master PIN រហ័ស (ថែម ១ ឆ្នាំ):
   PIN: 889977

5. Super Master PIN (ដោះសោពេញមួយជីវិត):
   PIN: 999999

=========================================
រក្សាទុកដោយ SweetBakery POS System
កាលបរិច្ឆេទរក្សាទុក៖ ${new Date().toLocaleDateString('km-KH')}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SweetBakery_License_Keys.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const expiryDateFormatted = new Date(licenseInfo.expiresAt).toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
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
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center space-y-1 animate-in zoom-in-95">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-black text-sm">{successMsg}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-pink-600" />
                  <span>វាយបញ្ចូលកូដបន្តសុពលភាពថ្មី (License Key / PIN)</span>
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
                    className="w-full px-4 py-2.5 text-sm font-mono font-black text-center tracking-wider bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 uppercase transition-all"
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

          {/* Secure Admin Key Vault Accordion */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setShowVault(!showVault);
              }}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black flex items-center justify-between transition-all cursor-pointer border border-slate-200/80"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px]">
                  🔑
                </span>
                <span>តារាងកូដសម្ងាត់ទាំងអស់ (សម្រាប់ម្ចាស់ហាង / Admin)</span>
              </div>
              {showVault ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showVault && (
              <div className="mt-2.5 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] text-amber-900 font-medium">
                  💡 ខាងក្រោមនេះជាលេខកូដសម្ងាត់ដែលបានកំណត់ក្នុងប្រព័ន្ធ លោកអ្នកអាចចុច **«ប្រើភ្លាម»** ឬ **«ចម្លង»** បាន៖
                </div>

                <div className="space-y-1.5">
                  {VAULT_KEYS.map((k) => (
                    <div
                      key={k.code}
                      className="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <code className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            {k.code}
                          </code>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                            {k.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                          {k.label}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(k.code)}
                          title="ចម្លងកូដ"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {copiedCode === k.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setKeyCode(k.code);
                            handleActivate(k.code);
                          }}
                          className="px-2.5 py-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg text-xs font-black transition-all active:scale-95 cursor-pointer shadow-xs"
                        >
                          ប្រើភ្លាម
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Backup Actions */}
                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={downloadKeysFile}
                    className="flex-1 py-1.5 px-2.5 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-700" />
                    <span>ទាញយកទុកជា File (.txt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const allText = VAULT_KEYS.map((k) => `${k.badge}: ${k.code}`).join('\n');
                      copyToClipboard(allText);
                    }}
                    className="py-1.5 px-3 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-700" />
                    <span>ចម្លងទាំងអស់</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
