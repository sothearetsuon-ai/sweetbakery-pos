import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  Cpu,
  Lock,
  CloudLightning,
  Loader2,
  Copy,
  Check,
  Download,
  Send,
  Users,
  Clock,
  Sparkles,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  generateDeviceBoundKey,
  remoteUnlockClientDevice,
  subscribeToClientLicenses,
  ClientLicenseRecord,
  GLOBAL_KEYS,
  getDeviceId,
} from '../../utils/licenseManager';
import { deauthenticateSuperAdmin } from '../../utils/superAdminAuth';
import { soundFx } from '../../utils/audio';

interface SuperAdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const VAULT_KEYS_LIST = [
  { code: 'BAKERY-35D-EXTEND', label: 'បន្តបន្ថែម ៣៥ ថ្ងៃ (+35 Days)', badge: '៣៥ ថ្ងៃ' },
  { code: 'BAKERY-180D-PASS', label: 'បន្តបន្ថែម ៦ ខែ (+180 Days)', badge: '៦ ខែ' },
  { code: 'BAKERY-365D-PRO', label: 'បន្តបន្ថែម ១ ឆ្នាំ (+365 Days)', badge: '១ ឆ្នាំ' },
  { code: 'BAKERY-VIP-LIFETIME', label: 'ដោះសោរហូតពេញមួយជីវិត (Lifetime Access)', badge: 'ពេញមួយជីវិត ⭐' },
  { code: '889977', label: 'Master PIN (ថែម ១ ឆ្នាំភ្លាមៗ)', badge: 'PIN ១ ឆ្នាំ ⚡' },
  { code: '999999', label: 'Super PIN (ដោះសោពេញមួយជីវិត)', badge: 'PIN VIP ⚡' },
];

export const SuperAdminPortalModal: React.FC<SuperAdminPortalModalProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'clients' | 'masterKeys'>('generator');
  
  // Generator State
  const [targetDevId, setTargetDevId] = useState('');
  const [targetStoreName, setTargetStoreName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'35D' | '180D' | '365D' | 'VIP'>('35D');
  const [generatedKey, setGeneratedKey] = useState('');
  const [isRemoteUnlocking, setIsRemoteUnlocking] = useState(false);
  const [remoteMessage, setRemoteMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Client Devices List State
  const [clientRecords, setClientRecords] = useState<ClientLicenseRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time listener for client devices
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = subscribeToClientLicenses((records) => {
      setClientRecords(records);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    soundFx.playPop();
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = () => {
    soundFx.playPop();
    if (!targetDevId.trim()) {
      setRemoteMessage({ success: false, text: 'សូមបញ្ចូល Device ID របស់ម៉ាស៊ីនភ្ញៀវ!' });
      return;
    }

    const key = generateDeviceBoundKey(targetDevId.trim().toUpperCase(), selectedPlan);
    setGeneratedKey(key);
    setRemoteMessage(null);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleRemoteCloudUnlock = async () => {
    if (!targetDevId.trim()) {
      setRemoteMessage({ success: false, text: 'សូមបញ្ចូល Device ID របស់ម៉ាស៊ីនភ្ញៀវ!' });
      soundFx.playPop();
      return;
    }

    setIsRemoteUnlocking(true);
    setRemoteMessage(null);

    const planDays = selectedPlan === 'VIP' ? 'permanent' : selectedPlan === '365D' ? 365 : selectedPlan === '180D' ? 180 : 35;
    const res = await remoteUnlockClientDevice(targetDevId.trim().toUpperCase(), planDays);

    setIsRemoteUnlocking(false);
    if (res.success) {
      soundFx.playSuccess();
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      setRemoteMessage({ success: true, text: `✅ ${res.message}! កម្មវិធីរបស់ភ្ញៀវនឹងដោះសោស្វ័យប្រវត្តិ។` });
    } else {
      soundFx.playPop();
      setRemoteMessage({ success: false, text: res.message });
    }
  };

  const handleQuickUnlockRow = async (deviceId: string, days: number | 'permanent') => {
    soundFx.playPop();
    setIsRemoteUnlocking(true);
    const res = await remoteUnlockClientDevice(deviceId, days);
    setIsRemoteUnlocking(false);
    if (res.success) {
      soundFx.playSuccess();
      try {
        confetti({ particleCount: 45, spread: 50, origin: { y: 0.6 } });
      } catch (e) {}
      setRemoteMessage({ success: true, text: `✅ ${res.message} សម្រាប់ ${deviceId}` });
    }
  };

  const handleSelectClientRow = (client: ClientLicenseRecord) => {
    soundFx.playPop();
    setTargetDevId(client.deviceId);
    setTargetStoreName(client.storeName || '');
    setActiveTab('generator');
    setGeneratedKey('');
    setRemoteMessage(null);
  };

  const handleShareKeyViaTelegram = () => {
    soundFx.playPop();
    const planText = selectedPlan === 'VIP' ? 'ពេញមួយជីវិត (Lifetime Access)' : selectedPlan === '365D' ? '១ ឆ្នាំ (+365 Days)' : selectedPlan === '180D' ? '៦ ខែ (+180 Days)' : '៣៥ ថ្ងៃ (+35 Days)';
    const text = encodeURIComponent(
      `ជំរាបសួរ! នេះជាកូដបន្តសុពលភាពសម្រាប់កម្មវិធី SweetBakery POS:\n\n` +
      `🔑 License Key: ${generatedKey}\n` +
      `💻 សម្រាប់ម៉ាស៊ីន (Device ID): ${targetDevId}\n` +
      `⏳ រយៈពេល: ${planText}\n\n` +
      `សូមបើកកម្មវិធី POS -> ចុច "បញ្ចូលកូដ" ហើយបិទភ្ជាប់កូដខាងលើ។ សូមអរគុណ!`
    );
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
  };

  const downloadKeysFile = () => {
    soundFx.playPop();
    const content = `=========================================
🔐 SWEETBAKERY POS - SUPER ADMIN MASTER KEYS
=========================================

1. បន្ត ៣៥ ថ្ងៃ (+35 Days):
   Code: BAKERY-35D-EXTEND

2. បន្ត ៦ ខែ (+180 Days):
   Code: BAKERY-180D-PASS

3. បន្ត ១ ឆ្នាំ (+365 Days):
   Code: BAKERY-365D-PRO

4. ដោះសោពេញមួយជីវិត (Lifetime Access):
   Code: BAKERY-VIP-LIFETIME

5. Master PIN រហ័ស (ថែម ១ ឆ្នាំ):
   PIN: 889977

6. Super Master PIN (ដោះសោពេញមួយជីវិត):
   PIN: 999999

=========================================
Super Admin Master Vault • Confidential
កាលបរិច្ឆេទបង្កើត៖ ${new Date().toLocaleString('km-KH')}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SweetBakery_SuperAdmin_Keys.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredClients = clientRecords.filter((c) => {
    const devId = (c.deviceId || (c as any).id || '');
    if (!devId && !c.storeName && !c.storeId) return false;
    const q = (searchTerm || '').toLowerCase();
    return (
      devId.toLowerCase().includes(q) ||
      ((c.storeName || '').toLowerCase().includes(q)) ||
      ((c.storeId || '').toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-300 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/25">
              <Key className="w-5 h-5 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base">
                  App Super Admin • ផ្ទាំងគ្រប់គ្រង License
                </h3>
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Master
                </span>
              </div>
              <p className="text-xs text-amber-200/80 font-medium">
                បង្កើត License Key ជាប់ម៉ាស៊ីន ឬ ដោះសោតាម Cloud សម្រាប់អតិថិជន
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                deauthenticateSuperAdmin();
                onLogout();
                onClose();
              }}
              title="ចាកចេញពីគណនី App Super Admin"
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ចាកចេញ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="w-8 h-8 rounded-full hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveTab('generator');
            }}
            className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'generator'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>បង្កើត Key & ដោះសោ Cloud</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveTab('clients');
            }}
            className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'clients'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>បញ្ជីម៉ាស៊ីនភ្ញៀវ ({clientRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveTab('masterKeys');
            }}
            className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'masterKeys'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>កូដមេប្រព័ន្ធ (Master Vault)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: Key Generator & Remote Cloud Unlock */}
          {activeTab === 'generator' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-pink-50/70 to-rose-50/50 border border-pink-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-pink-600 text-white rounded-lg">
                      <Cpu className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">
                        បង្កើត License Key ជាប់ម៉ាស៊ីន (Device-Bound Activation)
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        កូដដែលបង្កើតចេញពីទីនេះ អាចប្រើប្រាស់បានតែលើម៉ាស៊ីនភ្ញៀវម្នាក់គត់ ការពារការលួចចែករំលែក
                      </p>
                    </div>
                  </div>
                </div>

                {/* Device ID Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      លេខសម្គាល់ម៉ាស៊ីនភ្ញៀវ (Client Device ID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. DEV-4A82-9B7C"
                      value={targetDevId}
                      onChange={(e) => {
                        setTargetDevId(e.target.value.toUpperCase());
                        setGeneratedKey('');
                        setRemoteMessage(null);
                      }}
                      className="w-full px-3.5 py-2 text-xs font-mono font-black uppercase bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-pink-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ឈ្មោះហាងអតិថិជន (Store Name - ស្រេចចិត្ត)
                    </label>
                    <input
                      type="text"
                      placeholder="ឧ. ហាងនំផ្អែម Sweet Bakery"
                      value={targetStoreName}
                      onChange={(e) => setTargetStoreName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-pink-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Plan Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ជ្រើសរើសរយៈពេលសុពលភាព (License Duration) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: '35D', label: '៣៥ ថ្ងៃ', desc: '+35 Days' },
                      { id: '180D', label: '៦ ខែ', desc: '+180 Days' },
                      { id: '365D', label: '១ ឆ្នាំ', desc: '+365 Days' },
                      { id: 'VIP', label: 'ពេញមួយជីវិត', desc: 'Lifetime VIP' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setSelectedPlan(p.id as any);
                          setGeneratedKey('');
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedPlan === p.id
                            ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-500/20'
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

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateKey}
                    className="py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-pink-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>បង្កើត License Key ជាប់ម៉ាស៊ីន</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRemoteUnlocking}
                    onClick={handleRemoteCloudUnlock}
                    className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isRemoteUnlocking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>កំពុងដោះសោតាម Cloud...</span>
                      </>
                    ) : (
                      <>
                        <CloudLightning className="w-4 h-4" />
                        <span>ដោះសោតាម Cloud ភ្លាមៗ (Auto Unlock)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Key Result */}
                {generatedKey && (
                  <div className="p-3.5 bg-white border-2 border-pink-400 rounded-2xl space-y-2.5 shadow-sm animate-in zoom-in-95">
                    <div className="flex items-center justify-between text-xs font-bold text-pink-700">
                      <span>កូដសុពលភាពចាក់សោសម្រាប់តែម៉ាស៊ីន {targetDevId}៖</span>
                      <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-black">
                        {selectedPlan === 'VIP' ? 'ពេញមួយជីវិត' : selectedPlan === '365D' ? '១ ឆ្នាំ' : selectedPlan === '180D' ? '៦ ខែ' : '៣៥ ថ្ងៃ'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <code className="font-mono font-black text-sm text-pink-700 tracking-wider">
                        {generatedKey}
                      </code>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(generatedKey)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === generatedKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">បានចម្លង</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-600" />
                              <span>ចម្លង</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleShareKeyViaTelegram}
                          className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>ផ្ញើ Telegram</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium">
                      💡 ផ្ញើកូដនេះទៅកាន់ម្ចាស់ហាង។ ប្រសិនបើហាងយកកូដនេះទៅប្រើលើឧបករណ៍ផ្សេង ប្រព័ន្ធនឹងបង្ហាញ Error "Device Mismatch" មិនអាចប្រើបានឡើយ។
                    </div>
                  </div>
                )}

                {/* Remote Unlock Feedback */}
                {remoteMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      remoteMessage.success
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {remoteMessage.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{remoteMessage.text}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Connected Client Devices & Stores Monitor */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="ស្វែងរកតាមឈ្មោះហាង ឬ Device ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="text-xs text-slate-500 font-bold shrink-0">
                  សរុប៖ {filteredClients.length} ឧបករណ៍
                </div>
              </div>

              {filteredClients.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-1">
                  <Radio className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">មិនទាន់មានម៉ាស៊ីនភ្ញៀវណាបានភ្ជាប់មក Firebase ឡើយ</div>
                  <div className="text-[11px] text-slate-400">
                    នៅពេលហាងអតិថិជនបើកដំណើរការកម្មវិធី ម៉ាស៊ីនរបស់ពួកគេនឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredClients.map((client) => {
                    const isPerm = client.isPermanent;
                    const days = client.daysRemaining || 0;
                    const isExp = client.isExpired || (!isPerm && days <= 0);

                    return (
                      <div
                        key={client.deviceId || (client as any).id || Math.random()}
                        className="p-3 bg-white border border-slate-200 hover:border-pink-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {client.deviceId || (client as any).id || 'DEV-UNKNOWN'}
                            </span>
                            {client.storeId && (
                              <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
                                🏬 {client.storeId}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isPerm
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : isExp
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : days <= 5
                                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {isPerm ? '⭐ VIP ពេញមួយជីវិត' : isExp ? '❌ ផុតកំណត់' : `⏳ សល់ ${days} ថ្ងៃ`}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-800">
                            {client.storeName || 'ហាងមិនទាន់កំណត់ឈ្មោះ'}
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>ផុតកំណត់៖ {client.expiresAt ? new Date(Number(client.expiresAt) || client.expiresAt).toLocaleDateString('km-KH') : 'N/A'}</span>
                            {client.lastSeen && (
                              <span>• សកម្មចុងក្រោយ៖ {new Date(client.lastSeen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        </div>

                        {/* Quick Action Buttons for this client */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleSelectClientRow(client)}
                            className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-bold transition-all border border-pink-200 cursor-pointer"
                          >
                            បង្កើត Key
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickUnlockRow(client.deviceId || (client as any).id, 35)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all border border-emerald-200 cursor-pointer"
                          >
                            +35 ថ្ងៃ
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickUnlockRow(client.deviceId || (client as any).id, 365)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition-all border border-teal-200 cursor-pointer"
                          >
                            +1 ឆ្នាំ
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickUnlockRow(client.deviceId || (client as any).id, 'permanent')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-all border border-amber-300 cursor-pointer"
                          >
                            VIP
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Global Master Keys Vault */}
          {activeTab === 'masterKeys' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-amber-900">
                    🔑 កូដមេប្រព័ន្ធ (Global Master Activation Keys)
                  </h4>
                  <p className="text-[10px] text-amber-700">
                    កូដទាំងនេះប្រើសម្រាប់ Admin/Developer ដោះសោផ្ទាល់នៅលើគ្រប់ម៉ាស៊ីនដោយមិនជាប់ Device ID
                  </p>
                </div>

                <button
                  type="button"
                  onClick={downloadKeysFile}
                  className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ទាញយក .txt</span>
                </button>
              </div>

              <div className="space-y-2">
                {VAULT_KEYS_LIST.map((k) => (
                  <div
                    key={k.code}
                    className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {k.code}
                        </code>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          {k.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        {k.label}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(k.code)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedKey === k.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">បានចម្លង</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>ចម្លង</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
