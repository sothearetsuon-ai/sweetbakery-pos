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
  Cpu,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  applyLicenseKey,
  getDeviceId,
  generateDeviceBoundKey,
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

  // App Super Admin state & Key Generator
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => isSuperAdminAuthenticated());
  const [activeTab, setActiveTab] = useState<'thisDevice' | 'generator'>(() => {
    return isSuperAdminAuthenticated() && licenseInfo.isPermanent ? 'generator' : 'thisDevice';
  });
  const [targetDevId, setTargetDevId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'35D' | '180D' | '365D' | 'VIP'>('35D');
  const [generatedKey, setGeneratedKey] = useState('');
  const [copiedGenKey, setCopiedGenKey] = useState(false);
  const [genError, setGenError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const superAuth = isSuperAdminAuthenticated();
      setIsSuperAdmin(superAuth);
      setShowAdminLogin(false);
      setAdminPinInput('');
      setAdminPinError('');
      setErrorMsg('');
      setSuccessMsg('');
      setGeneratedKey('');
      setGenError('');
      if (superAuth && licenseInfo.isPermanent) {
        setActiveTab('generator');
      } else {
        setActiveTab('thisDevice');
      }
    }
  }, [isOpen, licenseInfo.isPermanent]);

  if (!isOpen) return null;

  const currentDeviceId = licenseInfo.deviceId || getDeviceId();

  const handleGenerateForOther = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundFx.playPop();
    setGenError('');
    if (!targetDevId.trim()) {
      setGenError('សូមបញ្ចូលលេខសម្គាល់ម៉ាស៊ីនភ្ញៀវ (Client Device ID) ឧ. DEV-XXXX-XXXX');
      return;
    }
    const cleanId = targetDevId.trim().toUpperCase();
    const key = generateDeviceBoundKey(cleanId, selectedPlan);
    setGeneratedKey(key);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {}
  };

  const handleCopyGenKey = () => {
    if (!generatedKey) return;
    soundFx.playPop();
    navigator.clipboard.writeText(generatedKey);
    setCopiedGenKey(true);
    setTimeout(() => setCopiedGenKey(false), 2000);
  };

  const handleShareGenKeyTelegram = () => {
    if (!generatedKey) return;
    soundFx.playPop();
    const planText =
      selectedPlan === 'VIP'
        ? 'ពេញមួយជីវិត (Lifetime Access)'
        : selectedPlan === '365D'
        ? '១ ឆ្នាំ (+365 Days)'
        : selectedPlan === '180D'
        ? '៦ ខែ (+180 Days)'
        : '៣៥ ថ្ងៃ (+35 Days)';
    const text = encodeURIComponent(
      `ជំរាបសួរ! នេះជាកូដបន្តសុពលភាពសម្រាប់កម្មវិធី SweetBakery POS:\n\n` +
        `🔑 License Key: ${generatedKey}\n` +
        `💻 សម្រាប់ម៉ាស៊ីន (Device ID): ${targetDevId.trim().toUpperCase()}\n` +
        `⏳ រយៈពេល: ${planText}\n\n` +
        `សូមបើកកម្មវិធី POS -> ចុច "បញ្ចូលកូដ" ហើយបិទភ្ជាប់កូដខាងលើ។ សូមអរគុណ!`
    );
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
  };

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

        {/* Super Admin Mode Tab Selector */}
        {isSuperAdmin && (
          <div className="flex border-b border-rose-100 bg-slate-50/80 px-4 pt-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setActiveTab('thisDevice');
              }}
              className={`pb-2 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'thisDevice'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>ម៉ាស៊ីននេះ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setActiveTab('generator');
              }}
              className={`pb-2 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'generator'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>⚡ បង្កើត Key ឱ្យអ្នកដទៃ</span>
              <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-black">
                Generator
              </span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {activeTab === 'generator' && isSuperAdmin ? (
            /* TAB 2: Generate Key for Others */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-pink-50/60 border border-amber-200/80 rounded-2xl space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">
                      បង្កើត License Key ជាប់ម៉ាស៊ីនឱ្យអ្នកដទៃ
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      កូដដែលបង្កើតចេញពីទីនេះ អាចដំណើរការបានតែលើ Device ID របស់ភ្ញៀវប៉ុណ្ណោះ
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Device ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-pink-600" />
                  <span>លេខសម្គាល់ម៉ាស៊ីនភ្ញៀវ (Target Device ID) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. DEV-4A82-9B7C"
                  value={targetDevId}
                  onChange={(e) => {
                    setTargetDevId(e.target.value.toUpperCase());
                    setGeneratedKey('');
                    setGenError('');
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-black uppercase bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-pink-500 shadow-2xs tracking-wider"
                />
              </div>

              {/* Duration Plan Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ជ្រើសរើសរយៈពេលសុពលភាព (Duration) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '35D', label: '៣៥ ថ្ងៃ', desc: '+35 Days' },
                    { id: '180D', label: '៦ ខែ', desc: '+180 Days' },
                    { id: '365D', label: '១ ឆ្នាំ', desc: '+365 Days' },
                    { id: 'VIP', label: 'ពេញមួយជីវិត', desc: 'Lifetime VIP ⭐' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedPlan(p.id as any);
                        setGeneratedKey('');
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedPlan === p.id
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm shadow-pink-500/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-pink-300 hover:bg-pink-50/30'
                      }`}
                    >
                      <div className="text-xs font-black">{p.label}</div>
                      <div className={`text-[10px] ${selectedPlan === p.id ? 'text-pink-100' : 'text-slate-400'}`}>
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {genError && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{genError}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                type="button"
                onClick={() => handleGenerateForOther()}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-pink-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>បង្កើត License Key ឥឡូវនេះ</span>
              </button>

              {/* Generated Key Output Box */}
              {generatedKey && (
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl space-y-2.5 shadow-xs animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>កូដត្រូវបានបង្កើតដោយជោគជ័យ</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      សម្រាប់ {targetDevId.trim().toUpperCase()}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white border border-emerald-300 rounded-xl text-center">
                    <div className="text-xs font-mono font-black text-emerald-950 tracking-widest select-all">
                      {generatedKey}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleCopyGenKey}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                    >
                      {copiedGenKey ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>បានចម្លង!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>ចម្លងកូដ</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleShareGenKeyTelegram}
                      className="py-2 px-3 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ផ្ញើតាម Telegram</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Link to Full Master Hub */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  ត្រូវការដោះសោតាម Cloud ឬមើលម៉ាស៊ីនភ្ញៀវ?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    onClose();
                    if (onOpenSuperAdminPortal) onOpenSuperAdminPortal();
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>ផ្ទាំងគ្រប់គ្រងពេញលេញ</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            /* TAB 1: This Device */
            <>
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

                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <p className="text-[11px] text-slate-600 font-semibold font-battambang">
                    ប្រសិនបើអ្នកមានចំណាប់អារម្មណ៍ចង់ប្រើប្រាស់កម្មវិធីនេះសូមទាក់ទង
                  </p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <a
                      href="tel:012629160"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>លេខទូរសព្ទ័៖ 012 629 160</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleTelegramShare}
                      className="text-pink-600 hover:text-pink-700 text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>ផ្ញើតាម Telegram</span>
                    </button>
                  </div>
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

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setActiveTab('generator');
                        }}
                        className="px-2.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                        title="បង្កើត License Key ឱ្យអ្នកដទៃភ្លាមៗ"
                      >
                        <Cpu className="w-3 h-3" />
                        <span>បង្កើត Key</span>
                      </button>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
