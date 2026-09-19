import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Wifi,
  QrCode,
  Copy,
  Check,
  Globe,
  Share2,
  Lock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileConnectModal: React.FC<MobileConnectModalProps> = ({ isOpen, onClose }) => {
  const { staffMembers } = useBakery();

  // Local IP (Wi-Fi IP found via ipconfig)
  const [localIp, setLocalIp] = useState('192.168.1.4');
  const [port, setPort] = useState('3000');
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'cloud' | 'wifi'>('cloud');

  if (!isOpen) return null;

  const cloudUrl =
    typeof window !== 'undefined' && window.location.origin.includes('surge.sh')
      ? window.location.origin
      : 'https://sweetbakery-pos.surge.sh';

  const mobileUrl = activeTab === 'cloud' ? cloudUrl : `http://${localIp}:${port}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    mobileUrl
  )}`;

  const handleCopyLink = () => {
    soundFx.playPop();
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-pink-50/80 via-rose-50/60 to-purple-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-pink-500 to-purple-600 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                ដំណើរការប្រើប្រាស់តាមទូរស័ព្ទដៃ (Mobile Phone Access)
              </h3>
              <p className="text-xs text-slate-500">ស្កេនភ្ជាប់ទូរស័ព្ទបុគ្គលិកដើម្បីប្រើប្រាស់គ្រប់ទីកន្លែង</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs: Online Cloud vs Wi-Fi Local */}
        <div className="px-6 pt-4 bg-slate-50/50">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setActiveTab('cloud');
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'cloud'
                  ? 'bg-white text-purple-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cloud className="w-4 h-4 text-purple-600" />
              <span>១. តាម Cloud Online (ណែនាំ) 🚀</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setActiveTab('wifi');
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'wifi'
                  ? 'bg-white text-pink-600 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wifi className="w-4 h-4 text-pink-600" />
              <span>២. តាម Wi-Fi ក្នុងហាង</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* QR Code Card */}
          <div className="p-5 bg-gradient-to-b from-purple-50/40 via-pink-50/30 to-white border border-rose-100 rounded-3xl text-center space-y-3">
            {activeTab === 'cloud' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ដំណើរការលើ Cloud Online រួចរាល់ (Free ១០០%)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>ដំណើរការលើ Wi-Fi ក្នុងហាង ({localIp}:{port})</span>
              </div>
            )}

            {/* QR Display */}
            <div className="relative w-52 h-52 mx-auto bg-white p-3 rounded-3xl border-2 border-dashed border-purple-300 shadow-xl flex flex-col items-center justify-center overflow-hidden">
              <img
                src={qrCodeUrl}
                alt="Scan to open on phone"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* Direct Link & Copy */}
            <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
              <div className="px-3 py-1.5 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-700 border border-slate-200 truncate select-all">
                {mobileUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'បានចម្លង!' : 'ចម្លង Link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {activeTab === 'cloud'
                ? '✨ បុគ្គលិកអាចប្រើបានពីគ្រប់ទីកន្លែង ទោះនៅហាង ក្រៅហាង តាម Wi-Fi ឬ 4G/5G'
                : '⚠️ ទូរស័ព្ទបុគ្គលិក និងកុំព្យូទ័រត្រូវភ្ជាប់ Wi-Fi តែមួយក្នុងហាង'}
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>📱</span>
              <span>របៀបភ្ជាប់ឱ្យបុគ្គលិកប្រើប្រាស់ (៤ ជំហានងាយៗ)៖</span>
            </h4>

            <div className="space-y-2 text-xs">
              {/* Step 1 */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-black text-slate-800 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-purple-600" />
                    <span>ស្កេនកូដ QR ឬបើក Link</span>
                  </div>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    ឱ្យបុគ្គលិកបើកកាមេរ៉ាទូរស័ព្ទ (iPhone ឬ Android) ស្កេនលើកូដ QR ខាងលើ ឬចុចលើ Link <code className="bg-white px-1.5 py-0.5 rounded border border-purple-200 text-purple-700 font-bold">{mobileUrl}</code>។
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-black text-slate-800 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>ដាក់ជា App លើអេក្រង់ទូរស័ព្ទ (Add to Home Screen)</span>
                  </div>
                  <div className="text-slate-500 mt-0.5 text-[11px] space-y-1">
                    <p>• <b>លើ iPhone (Safari)</b>៖ ចុចប៊ូតុង Share (សញ្ញាព្រួញឡើងលើ ⬆️) ➔ ចុច <b>«Add to Home Screen (បន្ថែមទៅអេក្រង់ដើម)»</b>។</p>
                    <p>• <b>លើ Android (Chrome)</b>៖ ចុចសញ្ញាចុច ៣ (⋮) នៅជ្រុងស្តាំលើ ➔ ចុច <b>«Add to Home screen»</b> ឬ <b>«Install app»</b>។</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-black text-purple-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span>បុគ្គលិករើសឈ្មោះខ្លួនឯង និងវាយលេខសម្ងាត់ PIN</span>
                  </div>
                  <p className="text-purple-700 text-[11px] mt-0.5 mb-2">
                    បុគ្គលិកគ្រាន់តែចុចលើរូប Profile នៅខាងលើ រើសឈ្មោះខ្លួនឯង និងវាយលេខកូដសម្ងាត់ ៤ ខ្ទង់៖
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {staffMembers.map((s) => (
                      <div key={s.id} className="p-2 bg-white rounded-xl border border-purple-200/80 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-base shrink-0">{s.avatar}</span>
                          <span className="font-bold text-slate-800 truncate">{s.name}</span>
                        </div>
                        <span className="font-mono bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded text-[10px] shrink-0">
                          PIN: {s.pinCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <div className="font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ទិន្នន័យ Sync ស្វ័យប្រវត្តិគ្រប់ឧបករណ៍ (Real-time Cloud)</span>
                  </div>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    នៅពេលបុគ្គលិកលក់ ទទួលកុម្ម៉ង់ ឬធ្វើនំ ទិន្នន័យទាំងអស់នឹងរត់ចូលក្នុងម៉ាស៊ីនមេ និងបង្ហាញលើទូរស័ព្ទម្ចាស់ហាងភ្លាមៗ មិនបាច់ចុច Refresh ឡើយ!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-medium">
            អាយភីកុំព្យូទ័រ៖ <b className="text-slate-600">{localIp}:{port}</b>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            រួចរាល់ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
