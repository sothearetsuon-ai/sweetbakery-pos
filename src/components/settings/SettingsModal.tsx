import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Settings,
  Store,
  RefreshCw,
  Check,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Phone,
  MapPin,
  DollarSign,
  QrCode,
  Eye,
  Users,
  Database,
  Download,
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  Smartphone,
  Cloud,
  Send,
  Loader2,
  Bell,
  Camera,
  Key,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { compressImageFile } from '../../utils/imageCompressor';
import { KhqrStandeeModal } from '../pos/KhqrStandeeModal';
import { StaffManagement } from '../staff/StaffManagement';
import { FirebaseSettingsTab } from './FirebaseSettingsTab';
import { TelegramSettingsTab } from './TelegramSettingsTab';
import { NotificationSettingsTab } from './NotificationSettingsTab';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { isSuperAdminAuthenticated } from '../../utils/superAdminAuth';

export type SettingsTab = 'store' | 'khqr' | 'staff' | 'backup' | 'firebase' | 'currency' | 'telegram' | 'notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  onOpenLicenseModal?: () => void;
  onOpenSuperAdminPortal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'store',
  onOpenLicenseModal,
  onOpenSuperAdminPortal,
}) => {
  const {
    lang,
    exchangeRate,
    setExchangeRate,
    storeInfo,
    updateStoreInfo,
    products,
    sales,
    customOrders,
    expenses,
    ingredients,
    staffMembers,
    downloadBackupFile,
    importBackupData,
    exportSalesCsv,
    exportExpensesCsv,
  } = useBakery();
  const text = t[lang];

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [rateInput, setRateInput] = useState(exchangeRate.toString());
  const [nameKh, setNameKh] = useState(storeInfo?.nameKh || '');
  const [nameEn, setNameEn] = useState(storeInfo?.nameEn || '');
  const [logoUrl, setLogoUrl] = useState(storeInfo?.logoUrl || '');
  const [phone, setPhone] = useState(storeInfo?.phone || '');
  const [address, setAddress] = useState(storeInfo?.address || (storeInfo as any)?.addressKh || '');
  const [tagline, setTagline] = useState(storeInfo?.tagline || '');

  // KHQR state
  const [khqrQrImage, setKhqrQrImage] = useState(storeInfo?.khqrQrImage || '');
  const [khqrMerchantName, setKhqrMerchantName] = useState(storeInfo?.khqrMerchantName || 'SWEET BAKERY & CAFE');
  const [khqrBakongId, setKhqrBakongId] = useState(storeInfo?.khqrBakongId || 'sweet_bakery@aba');
  const [khqrAccountNumber, setKhqrAccountNumber] = useState(storeInfo?.khqrAccountNumber || '001 234 567');
  const [khqrBankName, setKhqrBankName] = useState(storeInfo?.khqrBankName || 'ABA Bank / Bakong');
  const [isStandeeOpen, setIsStandeeOpen] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingKhqr, setIsUploadingKhqr] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'logo' | 'khqr' | null>(null);

  const isInitializedRef = useRef(false);

  // Synchronize inputs ONLY when modal opens, never wipe while user is editing
  useEffect(() => {
    if (isOpen && !isInitializedRef.current && storeInfo) {
      isInitializedRef.current = true;
      setNameKh(storeInfo.nameKh || '');
      setNameEn(storeInfo.nameEn || '');
      setLogoUrl(storeInfo.logoUrl || '');
      setPhone(storeInfo.phone || '');
      setAddress(storeInfo.address || (storeInfo as any)?.addressKh || '');
      setTagline(storeInfo.tagline || '');
      setRateInput(exchangeRate.toString());
      setKhqrQrImage(storeInfo.khqrQrImage || '');
      setKhqrMerchantName(storeInfo.khqrMerchantName || 'SWEET BAKERY & CAFE');
      setKhqrBakongId(storeInfo.khqrBakongId || 'sweet_bakery@aba');
      setKhqrAccountNumber(storeInfo.khqrAccountNumber || '001 234 567');
      setKhqrBankName(storeInfo.khqrBankName || 'ABA Bank / Bakong');
    } else if (!isOpen) {
      isInitializedRef.current = false;
    }
  }, [isOpen, storeInfo, exchangeRate]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
    stats?: any;
  }>({ type: 'idle', message: '' });

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (
        window.confirm(
          `តើអ្នកពិតជាចង់បញ្ចូលទិន្នន័យពីឯកសារ "${file.name}" នេះមែនទេ? (ទិន្នន័យចាស់នឹងត្រូវជំនួសដោយទិន្នន័យក្នុងឯកសារនេះ)`
        )
      ) {
        const result = importBackupData(content);
        if (result.success) {
          soundFx.playSuccess();
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
          setImportStatus({
            type: 'success',
            message: result.message,
            stats: result.stats,
          });
        } else {
          soundFx.playPop();
          setImportStatus({
            type: 'error',
            message: result.message,
          });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  // Handle Logo Upload from Computer or Phone with smart compression
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playPop();
      setIsUploadingLogo(true);
      try {
        const compressedBase64 = await compressImageFile(file, 600, 600, 0.85);
        setLogoUrl(compressedBase64); // Show preview immediately!
        updateStoreInfo({ logoUrl: compressedBase64 });
        
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: compressedBase64, filename: file.name }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setLogoUrl(data.url);
            updateStoreInfo({ logoUrl: data.url });
            // Also sync to server atomic endpoint
            fetch('/api/save-store-info', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ storeInfo: { ...storeInfo, logoUrl: data.url } }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Logo upload to disk failed:', err);
      } finally {
        setIsUploadingLogo(false);
      }
    }
    e.target.value = '';
  };

  // Handle KHQR QR Code Upload from Computer or Phone with smart compression
  const handleKhqrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playPop();
      setIsUploadingKhqr(true);
      try {
        const compressedBase64 = await compressImageFile(file, 800, 800, 0.9);
        setKhqrQrImage(compressedBase64); // Show preview immediately!
        updateStoreInfo({ khqrQrImage: compressedBase64 });

        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: compressedBase64, filename: file.name }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setKhqrQrImage(data.url);
            updateStoreInfo({ khqrQrImage: data.url });
            // Also sync to server atomic endpoint
            fetch('/api/save-store-info', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ storeInfo: { ...storeInfo, khqrQrImage: data.url } }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('KHQR upload to disk failed:', err);
      } finally {
        setIsUploadingKhqr(false);
      }
    }
    e.target.value = '';
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    let finalLogo = logoUrl;
    if (finalLogo && finalLogo.startsWith('data:image/')) {
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: finalLogo }),
        });
        if (res.ok) {
          const d = await res.json();
          if (d.url) finalLogo = d.url;
        }
      } catch (err) {
        console.warn('Logo upload failed during save:', err);
      }
    }

    let finalKhqr = khqrQrImage;
    if (finalKhqr && finalKhqr.startsWith('data:image/')) {
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: finalKhqr }),
        });
        if (res.ok) {
          const d = await res.json();
          if (d.url) finalKhqr = d.url;
        }
      } catch (err) {
        console.warn('KHQR upload failed during save:', err);
      }
    }

    const rate = parseFloat(rateInput);
    if (rate > 0) {
      setExchangeRate(rate);
    }

    const updatedStoreData = {
      nameKh: nameKh.trim() || 'ហាងនំខេក ស្វីតបេកខឺរី',
      nameEn: nameEn.trim() || 'SweetBakery & Cafe',
      logoUrl: finalLogo.trim(),
      phone: phone.trim(),
      address: address.trim(),
      addressKh: address.trim(),
      tagline: tagline.trim(),
      khqrQrImage: finalKhqr.trim(),
      khqrMerchantName: khqrMerchantName.trim() || 'SWEET BAKERY & CAFE',
      khqrBakongId: khqrBakongId.trim(),
      khqrAccountNumber: khqrAccountNumber.trim(),
      khqrBankName: khqrBankName.trim(),
    };

    updateStoreInfo(updatedStoreData);

    try {
      await fetch('/api/save-store-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeInfo: updatedStoreData,
          exchangeRate: rate > 0 ? rate : undefined,
        }),
      });
    } catch (err) {
      console.error('Error saving store info to server:', err);
    }

    setIsSaving(false);
    soundFx.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូឡើងវិញមែនទេ? (ទិន្នន័យចាស់ៗនឹងត្រូវលុប និងដាក់ទិន្នន័យដើមឡើងវិញ)'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'store', label: 'ព័ត៌មានហាង & Logo', icon: Store },
    { id: 'khqr', label: 'ប្រព័ន្ធ KHQR', icon: QrCode },
    { id: 'staff', label: 'បុគ្គលិក & សិទ្ធិ 👥', icon: Users },
    { id: 'backup', label: 'រក្សាទុក & Backup 💾', icon: Database },
    { id: 'firebase', label: 'Google Firebase ☁️', icon: Cloud },
    { id: 'currency', label: 'អត្រាប្តូរប្រាក់ & ប្រព័ន្ធ', icon: DollarSign },
    { id: 'telegram', label: 'Telegram Bot 📬', icon: Send },
    { id: 'notifications', label: 'ការដាស់តឿន 🔔', icon: Bell },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-pink-50/60 to-purple-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                ការកំណត់ប្រព័ន្ធ (Store & System Settings)
              </h3>
              <p className="text-xs text-slate-500">កំណត់ឈ្មោះហាង, Logo, ប្រព័ន្ធ KHQR, សិទ្ធិបុគ្គលិក និងអត្រាប្តូរប្រាក់</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSuperAdminAuthenticated() && onOpenSuperAdminPortal && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onOpenSuperAdminPortal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95"
                title="បើកផ្ទាំងគ្រប់គ្រង App Super Admin & License Master"
              >
                <Key className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Super Admin Hub 👑</span>
                <span className="sm:hidden">Admin 👑</span>
              </button>
            )}

            {onOpenLicenseModal && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onOpenLicenseModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs"
                title="ពិនិត្យមើលសុពលភាព ឬបញ្ចូលកូដបន្តសុពលភាព"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">សុពលភាព App (35 ថ្ងៃ)</span>
                <span className="sm:hidden">សុពលភាព</span>
              </button>
            )}

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
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-2.5 bg-slate-50 border-b border-rose-100 flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-black text-xs transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'bg-white text-pink-600 border-pink-500 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'staff' ? (
            /* Staff & Permissions Tab */
            <StaffManagement isEmbedded={true} />
          ) : activeTab === 'backup' ? (
            /* Backup & Restore Tab */
            <div className="space-y-6">
              {/* Auto-Save Status Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-emerald-900">
                      ប្រព័ន្ធរក្សាទុកស្វ័យប្រវត្តិ (Real-time Auto-Save Active)
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ● ដំណើរការជាប្រចាំ
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    រាល់ការលក់ ការបន្ថែមនំ ការកត់ត្រាចំណាយ ការកុម្ម៉ង់ និងព័ត៌មានបុគ្គលិក ត្រូវបាន <strong>រក្សាទុកក្នុង Browser Storage (LocalStorage & IndexedDB)</strong> ភ្លាមៗដោយស្វ័យប្រវត្តិ។ ទោះបីបិទកុំព្យូទ័រ បិទ Tab ឬ Refresh ក៏មិនបាត់បង់ទិន្នន័យឡើយ។
                  </p>
                </div>
              </div>

              {/* Current Data Overview Counters */}
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">
                  សង្ខេបទិន្នន័យក្នុងប្រព័ន្ធបច្ចុប្បន្ន (Current Store Data)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">នំ & ទំនិញ</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{products.length}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">ប្រវត្តិលក់</p>
                    <p className="text-lg font-black text-emerald-600 mt-0.5">{sales.length}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">កុម្ម៉ង់នំខេក</p>
                    <p className="text-lg font-black text-pink-600 mt-0.5">{customOrders.length}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">កត់ត្រាចំណាយ</p>
                    <p className="text-lg font-black text-amber-600 mt-0.5">{expenses.length}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">គ្រឿងផ្សំស្តុក</p>
                    <p className="text-lg font-black text-indigo-600 mt-0.5">{ingredients.length}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">បុគ្គលិក</p>
                    <p className="text-lg font-black text-purple-600 mt-0.5">{staffMembers.length}</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Backup & Restore */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Download Backup */}
                <div className="bg-gradient-to-br from-pink-50/60 to-rose-50/50 p-5 rounded-3xl border border-pink-100 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">
                      ១. ទាញយកឯកសារបម្រុងទុក (Export Backup .JSON)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      ទាញទិន្នន័យហាងទាំងអស់ រួមមាន នំ, ការលក់, កុម្ម៉ង់, ចំណាយ, ស្តុក, បុគ្គលិក និង KHQR ទៅជាឯកសារមួយគត់ រក្សាទុកក្នុងកុំព្យូទ័រ ឬទូរសព្ទ។ លោកអ្នកអាចផ្ញើឯកសារនេះទុកក្នុង Telegram ឬ Google Drive ដើម្បីការពារកុំឱ្យបាត់បង់។
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playSuccess();
                      downloadBackupFile();
                    }}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-2xl shadow-md shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>ទាញយកទិន្នន័យបម្រុងទុក (.JSON)</span>
                  </button>
                </div>

                {/* Restore / Import */}
                <div className="bg-gradient-to-br from-indigo-50/60 to-blue-50/50 p-5 rounded-3xl border border-indigo-100 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">
                      ២. បញ្ចូលទិន្នន័យឡើងវិញ (Restore / Import .JSON)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      នៅពេលលោកអ្នកប្តូរទៅប្រើទូរសព្ទថ្មី ឬកុំព្យូទ័រផ្សេងទៀត លោកអ្នកគ្រាន់តែជ្រើសរើសឯកសារ Backup .JSON នោះមកវិញ នោះទិន្នន័យទាំងអស់នឹងត្រូវស្ដារឡើងវិញភ្លាមៗ 100%។
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <input
                      type="file"
                      ref={backupFileInputRef}
                      accept=".json"
                      onChange={handleBackupFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        backupFileInputRef.current?.click();
                      }}
                      className="w-full py-3 bg-white hover:bg-indigo-50 text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 text-xs font-black rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <FileJson className="w-4 h-4 text-indigo-500" />
                      <span>ជ្រើសរើសឯកសារ Backup ដើម្បីបញ្ចូលឡើងវិញ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback Alert for Import */}
              {importStatus.type === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800">
                    <p className="font-bold">{importStatus.message}</p>
                    {importStatus.stats && (
                      <p className="mt-1 text-emerald-700">
                        បានបញ្ចូល៖ នំ {importStatus.stats.productsCount} មុខ | ការលក់ {importStatus.stats.salesCount} លើក | កុម្ម៉ង់ {importStatus.stats.ordersCount} | ចំណាយ {importStatus.stats.expensesCount} | បុគ្គលិក {importStatus.stats.staffCount} នាក់
                      </p>
                    )}
                  </div>
                </div>
              )}

              {importStatus.type === 'error' && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-rose-800">{importStatus.message}</p>
                </div>
              )}

              {/* Section 2: Excel / CSV Reports Export */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-xl">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">
                      ៣. ទាញយកជារបាយការណ៍ Excel / Google Sheets (.CSV)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      ទាញយកឯកសារ CSV ដែលគាំទ្រភាសាខ្មែរ 100% សម្រាប់បើកមើល ឬគណនាក្នុង Microsoft Excel
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      exportSalesCsv();
                    }}
                    className="py-2.5 px-4 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>ទាញយករបាយការណ៍លក់ (.CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      exportExpensesCsv();
                    }}
                    className="py-2.5 px-4 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 hover:border-amber-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <span>ទាញយករបាយការណ៍ចំណាយ (.CSV)</span>
                  </button>
                </div>
              </div>

              {/* Section 3: Tips for Data Safety */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 space-y-2">
                <h5 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>គន្លឹះផ្ទេរទិន្នន័យទៅទូរសព្ទដៃ ឬឧបករណ៍ផ្សេង (Data Transfer Tip)</span>
                </h5>
                <p className="text-xs text-blue-800/90 leading-relaxed">
                  ដើម្បីប្រើប្រាស់ទិន្នន័យដូចគ្នារវាងកុំព្យូទ័រនិងទូរសព្ទ៖ លោកអ្នកគ្រាន់តែចុច <strong>«ទាញយកទិន្នន័យបម្រុងទុក (.JSON)»</strong> លើកុំព្យូទ័រ រួចផ្ញើ File នោះតាម Telegram ទៅកាន់ទូរសព្ទ។ បន្ទាប់មកបើកវេបសាយលើទូរសព្ទ ចូលមកកាន់ Settings &gt; រក្សាទុក &amp; Backup ហើយចុច <strong>«ជ្រើសរើសឯកសារ Backup ដើម្បីបញ្ចូលឡើងវិញ»</strong> ជាការស្រេច!
                </p>
              </div>
            </div>
          ) : activeTab === 'firebase' ? (
            /* Google Firebase Cloud Tab */
            <FirebaseSettingsTab />
          ) : activeTab === 'telegram' ? (
            /* Telegram Bot Tab */
            <TelegramSettingsTab />
          ) : activeTab === 'notifications' ? (
            /* Device Notifications & Reminders Tab */
            <NotificationSettingsTab />
          ) : (
            /* Other Settings Tabs in Form */
            <form onSubmit={handleSave} id="settings-form" className="space-y-5">
              {activeTab === 'store' && (
                <>
                  {/* Logo Upload Section */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                      Logo ប្រចាំហាង (Bakery Brand Logo)
                    </label>
                    <div className="flex items-center gap-4">
                      {/* Logo Preview Box */}
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-rose-300 bg-white shadow-xs overflow-hidden flex items-center justify-center shrink-0 relative group">
                        {isUploadingLogo ? (
                          <div className="flex flex-col items-center justify-center text-pink-500">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-[9px] font-bold mt-1">កំពុងផ្ទុក...</span>
                          </div>
                        ) : logoUrl ? (
                          <img src={logoUrl} alt="Store Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-2 text-slate-400">
                            <ImageIcon className="w-7 h-7 mx-auto mb-1 text-pink-400" />
                            <span className="text-[9px] font-bold block">គ្មាន Logo</span>
                          </div>
                        )}
                      </div>

                      {/* Upload & Clear Buttons */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-500/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Logo (File)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playPop();
                              setCameraTarget('logo');
                            }}
                            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>📸 ថត Logo</span>
                          </button>

                          {logoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playPop();
                                setLogoUrl('');
                                updateStoreInfo({ logoUrl: '' });
                                fetch('/api/save-store-info', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ storeInfo: { ...storeInfo, logoUrl: '' } }),
                                }).catch(() => {});
                              }}
                              className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>លុប Logo</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Logo នេះនឹងត្រូវបង្ហាញលើរបារខាងលើ Navbar និងលើវិក្កយបត្រព្រីនជូនភ្ញៀវ
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Store Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ឈ្មោះហាង (ភាសាខ្មែរ) *
                      </label>
                      <input
                        type="text"
                        required
                        value={nameKh}
                        onChange={(e) => setNameKh(e.target.value)}
                        placeholder="ឧ. ហាងនំខេក ស្វីតបេកខឺរី"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ឈ្មោះហាង (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder="e.g. SweetBakery & Cafe"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Slogan / Tagline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ពាក្យស្លោក / Tagline (បង្ហាញលើវិក្កយបត្រ)
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="ឧ. នំខេកឆ្ងាញ់ប្រណិត ស្រស់ៗរាល់ថ្ងៃ • មានទទួលកុម្ម៉ង់គ្រប់ម៉ូដ"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                    />
                  </div>

                  {/* Store Phone & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-pink-500" />
                        <span>លេខទូរស័ព្ទទាក់ទង</span>
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="ឧ. 012 345 678 / 098 765 432"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-pink-500" />
                        <span>អាសយដ្ឋានហាង</span>
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="ឧ. ផ្ទះលេខ 128E, ផ្លូវ 271, ភ្នំពេញ"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'khqr' && (
                /* KHQR Settings Section */
                <div className="p-4 rounded-2xl bg-red-50/40 border border-red-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#D32F2F] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                        KHQR
                      </div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                        កំណត់ប្រព័ន្ធ KHQR របស់ហាង (Bakery KHQR Payment)
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setIsStandeeOpen(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>មើលផ្ទាំង Standee លើតុ</span>
                    </button>
                  </div>

                  {/* QR Image Upload Box */}
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-red-300 bg-white shadow-xs overflow-hidden flex items-center justify-center shrink-0 relative">
                      {isUploadingKhqr ? (
                        <div className="flex flex-col items-center justify-center text-red-500">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-[9px] font-bold mt-1">កំពុងផ្ទុក...</span>
                        </div>
                      ) : khqrQrImage ? (
                        <img src={khqrQrImage} alt="KHQR Preview" className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="text-center p-2 text-slate-400">
                          <QrCode className="w-7 h-7 mx-auto mb-1 text-red-500" />
                          <span className="text-[9px] font-bold block text-slate-500">QR គំរូស្វ័យប្រវត្តិ</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => qrFileInputRef.current?.click()}
                          className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload រូបភាព KHQR (ពីធនាគារ)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setCameraTarget('khqr');
                          }}
                          className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>📸 ថតរូប QR</span>
                        </button>

                        {khqrQrImage && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playPop();
                              setKhqrQrImage('');
                              updateStoreInfo({ khqrQrImage: '' });
                              fetch('/api/save-store-info', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ storeInfo: { ...storeInfo, khqrQrImage: '' } }),
                              }).catch(() => {});
                            }}
                            className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>លុប QR រូបភាព</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        លោកអ្នកអាច Upload រូបភាព KHQR ផ្ទាល់ពី ABA Merchant, Bakong, ឬ ACLEDA ដើម្បីឱ្យភ្ញៀវស្កេនបង់លុយត្រង់ទៅកុងធនាគារហាង។
                      </p>
                    </div>
                  </div>
                  <input
                    ref={qrFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleKhqrUpload}
                    className="hidden"
                  />

                  {/* Merchant Info Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ឈ្មោះគណនី / ម្ចាស់អាជីវកម្ម (Merchant Name)
                      </label>
                      <input
                        type="text"
                        value={khqrMerchantName}
                        onChange={(e) => setKhqrMerchantName(e.target.value)}
                        placeholder="ឧ. SWEET BAKERY & CAFE"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bakong Account ID
                      </label>
                      <input
                        type="text"
                        value={khqrBakongId}
                        onChange={(e) => setKhqrBakongId(e.target.value)}
                        placeholder="ឧ. sweet_bakery@aba ឬ 012345678@aclb"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ឈ្មោះធនាគារ (Bank Name)
                      </label>
                      <input
                        type="text"
                        value={khqrBankName}
                        onChange={(e) => setKhqrBankName(e.target.value)}
                        placeholder="ឧ. ABA Bank, ACLEDA Bank, Canadia"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        លេខគណនីធនាគារ (Bank Account #)
                      </label>
                      <input
                        type="text"
                        value={khqrAccountNumber}
                        onChange={(e) => setKhqrAccountNumber(e.target.value)}
                        placeholder="ឧ. 001 234 567"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'currency' && (
                <div className="space-y-5">
                  {/* Exchange rate */}
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
                    <label className="block text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                      <span>អត្រាប្តូរប្រាក់ (Exchange Rate: $1 = ? ៛ KHR)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        ៛ / USD
                      </span>
                      <input
                        type="number"
                        step="10"
                        required
                        value={rateInput}
                        onChange={(e) => setRateInput(e.target.value)}
                        className="w-full px-3 py-2 text-base font-black text-pink-600 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                      />
                    </div>
                    <p className="text-[11px] text-amber-800/80">
                      តម្លៃលក់ទាំងអស់ជា KHR និងប្រាក់អាប់នឹងត្រូវគណនាដោយស្វ័យប្រវត្តិតាមអត្រានេះ
                    </p>
                  </div>

                  {/* Reset Data Danger Zone */}
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                    <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">
                      កំណត់ទិន្នន័យឡើងវិញ (Reset Demo Data)
                    </h4>
                    <p className="text-xs text-rose-700">
                      ប្រសិនបើលោកអ្នកចង់សម្អាតទិន្នន័យចាស់ៗ និងចាប់ផ្តើមទិន្នន័យគំរូដើមឡើងវិញ លោកអ្នកអាចចុចប៊ូតុងខាងក្រោម៖
                    </p>
                    <button
                      type="button"
                      onClick={handleResetData}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>កំណត់ទិន្នន័យទាំងអស់ឡើងវិញ (Reset All)</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {activeTab === 'staff' || activeTab === 'backup' || activeTab === 'firebase' || activeTab === 'telegram' || activeTab === 'notifications' ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                {activeTab === 'notifications'
                  ? '💡 ការកំណត់ការជូនដំណឹងត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ'
                  : activeTab === 'firebase'
                  ? '💡 ការកំណត់ Google Firebase ត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ'
                  : activeTab === 'telegram'
                  ? '💡 ការកំណត់ Telegram Bot ត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ'
                  : activeTab === 'backup'
                  ? '💡 សូមទាញយកឯកសារបម្រុងទុក (Backup) ឱ្យបានទៀងទាត់ដើម្បីសុវត្ថិភាពទិន្នន័យ'
                  : '💡 រាល់ការបន្ថែម ឬកែប្រែសិទ្ធិបុគ្គលិក ត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
              >
                រួចរាល់ (Done)
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer"
              >
                បោះបង់
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isUploadingLogo || isUploadingKhqr}
                className={`px-6 py-2.5 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer ${
                  savedSuccess
                    ? 'bg-emerald-600 shadow-emerald-600/30'
                    : isSaving || isUploadingLogo || isUploadingKhqr
                    ? 'bg-pink-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 shadow-pink-500/25'
                }`}
              >
                {savedSuccess ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {savedSuccess
                    ? 'បានរក្សាទុកដោយជោគជ័យ!'
                    : isSaving
                    ? 'កំពុងរក្សាទុក...'
                    : 'រក្សាទុកការផ្លាស់ប្តូរ'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Standee Modal Preview */}
      <KhqrStandeeModal
        isOpen={isStandeeOpen}
        onClose={() => setIsStandeeOpen(false)}
      />

      {/* Live Camera Capture Modal for Logo & KHQR */}
      <CameraCaptureModal
        isOpen={Boolean(cameraTarget)}
        onClose={() => setCameraTarget(null)}
        onCapture={(img) => {
          if (cameraTarget === 'logo') {
            setLogoUrl(img);
            updateStoreInfo({ logoUrl: img });
          } else if (cameraTarget === 'khqr') {
            setKhqrQrImage(img);
            updateStoreInfo({ khqrQrImage: img });
          }
        }}
        title={cameraTarget === 'logo' ? 'ថតរូប Logo ហាង (Store Logo)' : 'ថតរូបភាព KHQR ធនាគារ'}
        subtitle="ថតរូបភាពពីកាម៉េរ៉ាដើម្បីបញ្ចូលក្នុងប្រព័ន្ធភ្លាមៗ"
      />
    </div>
  );
};
