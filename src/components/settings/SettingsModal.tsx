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
  EyeOff,
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
  Building2,
  Copy,
  Rocket,
  ChevronRight,
  Lock,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { soundFx } from '../../utils/audio';
import { compressImageFile } from '../../utils/imageCompressor';
import { getProductImageUrl } from '../../utils/imagePath';
import { KhqrStandeeModal } from '../pos/KhqrStandeeModal';
import { StaffManagement } from '../staff/StaffManagement';
import { FirebaseSettingsTab } from './FirebaseSettingsTab';
import { TelegramSettingsTab } from './TelegramSettingsTab';
import { NotificationSettingsTab } from './NotificationSettingsTab';
import { AppUpdateTab } from './AppUpdateTab';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { CakeFlavorsModal } from '../pos/CakeFlavorsModal';
import { PartyAccessoriesModal } from '../pos/PartyAccessoriesModal';
import { isSuperAdminAuthenticated } from '../../utils/superAdminAuth';
import { getStoreId, setStoreId, isDefaultStore, DEFAULT_STORE_ID } from '../../services/firebase';

export type SettingsTab = 'store' | 'khqr' | 'staff' | 'backup' | 'firebase' | 'currency' | 'telegram' | 'notifications' | 'updates';

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
    currentStaff,
    hasPermission,
    downloadBackupFile,
    importBackupData,
    exportSalesCsv,
    exportExpensesCsv,
    isDemoMode,
    logoutAndLock,
  } = useBakery();
  const text = t[lang];

  const isTabAllowedForCurrentStaff = (tabId?: SettingsTab): boolean => {
    if (!tabId) return true;
    if (isDemoMode && (tabId === 'staff' || tabId === 'telegram' || tabId === 'firebase')) {
      return false;
    }
    if (currentStaff.role !== 'ADMIN' && (tabId === 'telegram' || tabId === 'firebase')) {
      return false;
    }
    if (tabId === 'staff' && currentStaff.role !== 'ADMIN' && !hasPermission('canAccessSettings')) {
      return false;
    }
    return true;
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (!isTabAllowedForCurrentStaff(initialTab)) {
      return 'store';
    }
    return initialTab;
  });

  const wasOpenRef = useRef(false);
  const prevInitialTabRef = useRef(initialTab);

  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current || prevInitialTabRef.current !== initialTab) {
        wasOpenRef.current = true;
        prevInitialTabRef.current = initialTab;
        if (initialTab && isTabAllowedForCurrentStaff(initialTab)) {
          setActiveTab(initialTab);
        } else {
          setActiveTab('store');
        }
      }
    } else {
      wasOpenRef.current = false;
      prevInitialTabRef.current = initialTab;
    }
  }, [isOpen, initialTab]);

  // If role/permissions change while modal is open, ensure activeTab is still allowed
  useEffect(() => {
    if (isOpen && !isTabAllowedForCurrentStaff(activeTab)) {
      setActiveTab('store');
    }
  }, [isOpen, isDemoMode, currentStaff, activeTab]);

  const [rateInput, setRateInput] = useState(exchangeRate.toString());
  const [storeIdInput, setStoreIdInput] = useState(() => getStoreId());
  const [copiedStoreId, setCopiedStoreId] = useState(false);
  const [nameKh, setNameKh] = useState(storeInfo?.nameKh || '');
  const [nameEn, setNameEn] = useState(storeInfo?.nameEn || '');
  const [logoUrl, setLogoUrl] = useState(storeInfo?.logoUrl || '');
  const [phone, setPhone] = useState(storeInfo?.phone || '');
  const [address, setAddress] = useState(storeInfo?.address || (storeInfo as any)?.addressKh || '');
  const [tagline, setTagline] = useState(storeInfo?.tagline || '');
  const [mapsUrl, setMapsUrl] = useState(storeInfo?.mapsUrl || '');

  // KHQR state
  const [khqrQrImage, setKhqrQrImage] = useState(storeInfo?.khqrQrImage || '');
  const [khqrMerchantName, setKhqrMerchantName] = useState(storeInfo?.khqrMerchantName || 'SWEET BAKERY & CAFE');
  const [khqrBakongId, setKhqrBakongId] = useState(storeInfo?.khqrBakongId || 'sweet_bakery@aba');
  const [khqrAccountNumber, setKhqrAccountNumber] = useState(storeInfo?.khqrAccountNumber || '001 234 567');
  const [khqrBankName, setKhqrBankName] = useState(storeInfo?.khqrBankName || 'ABA Bank / Bakong');
  const [isStandeeOpen, setIsStandeeOpen] = useState(false);

  // Real Store Security Passcode state
  const [realStorePin, setRealStorePin] = useState(storeInfo?.realStorePin || '660168');
  const [requireRealStorePin, setRequireRealStorePin] = useState(storeInfo?.requireRealStorePin !== false);
  const [alwaysRequireLoginOnStartup, setAlwaysRequireLoginOnStartup] = useState(storeInfo?.alwaysRequireLoginOnStartup !== false);
  const [showRealStorePin, setShowRealStorePin] = useState(false);

  // Chatbot & Direct Store Contact state
  const [telegramUsername, setTelegramUsername] = useState(storeInfo?.telegramUsername || '');
  const [telegramChatLink, setTelegramChatLink] = useState(storeInfo?.telegramChatLink || '');
  const [hotlinePhone, setHotlinePhone] = useState(storeInfo?.hotlinePhone || '');
  const [facebookUrl, setFacebookUrl] = useState(storeInfo?.facebookUrl || '');
  const [hideCustomerPrices, setHideCustomerPrices] = useState(storeInfo?.hideCustomerPrices ?? true);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingKhqr, setIsUploadingKhqr] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'logo' | 'khqr' | null>(null);
  const [isCakeFlavorsModalOpen, setIsCakeFlavorsModalOpen] = useState(false);
  const [isPartyAccessoriesModalOpen, setIsPartyAccessoriesModalOpen] = useState(false);

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
      setMapsUrl(storeInfo.mapsUrl || '');
      setRateInput(exchangeRate.toString());
      const activeTenant = getStoreId();
      const resolvedTenant = !isDefaultStore(activeTenant)
        ? activeTenant
        : (storeInfo.storeId && !isDefaultStore(storeInfo.storeId) ? storeInfo.storeId : DEFAULT_STORE_ID);
      setStoreIdInput(resolvedTenant);
      setKhqrQrImage(storeInfo.khqrQrImage || '');
      setKhqrMerchantName(storeInfo.khqrMerchantName || 'SWEET BAKERY & CAFE');
      setKhqrBakongId(storeInfo.khqrBakongId || 'sweet_bakery@aba');
      setKhqrAccountNumber(storeInfo.khqrAccountNumber || '001 234 567');
      setKhqrBankName(storeInfo.khqrBankName || 'ABA Bank / Bakong');
      setRealStorePin(storeInfo.realStorePin || '660168');
      setRequireRealStorePin(storeInfo.requireRealStorePin !== false);
      setAlwaysRequireLoginOnStartup(storeInfo.alwaysRequireLoginOnStartup !== false);
      setTelegramUsername(storeInfo.telegramUsername || '');
      setTelegramChatLink(storeInfo.telegramChatLink || '');
      setHotlinePhone(storeInfo.hotlinePhone || '');
      setFacebookUrl(storeInfo.facebookUrl || '');
      setHideCustomerPrices(storeInfo.hideCustomerPrices ?? true);
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

    const finalStoreId = storeIdInput.trim().toUpperCase() || getStoreId();
    setStoreId(finalStoreId);

    const updatedStoreData = {
      nameKh: nameKh.trim() || 'ហាងនំខេក ស្វីតបេកខឺរី',
      nameEn: nameEn.trim() || 'SweetBakery & Cafe',
      logoUrl: finalLogo.trim(),
      phone: phone.trim(),
      address: address.trim(),
      addressKh: address.trim(),
      tagline: tagline.trim(),
      mapsUrl: mapsUrl.trim(),
      storeId: finalStoreId,
      khqrQrImage: finalKhqr.trim(),
      khqrMerchantName: khqrMerchantName.trim() || 'SWEET BAKERY & CAFE',
      khqrBakongId: khqrBakongId.trim(),
      khqrAccountNumber: khqrAccountNumber.trim(),
      khqrBankName: khqrBankName.trim(),
      realStorePin: realStorePin.trim() || '660168',
      requireRealStorePin: requireRealStorePin,
      alwaysRequireLoginOnStartup: alwaysRequireLoginOnStartup,
      telegramUsername: telegramUsername.trim(),
      telegramChatLink: telegramChatLink.trim(),
      hotlinePhone: hotlinePhone.trim(),
      facebookUrl: facebookUrl.trim(),
      hideCustomerPrices,
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

  const allTabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'store', label: 'ព័ត៌មានហាង & Logo', icon: Store },
    { id: 'khqr', label: 'ប្រព័ន្ធ KHQR', icon: QrCode },
    { id: 'staff', label: 'បុគ្គលិក & សិទ្ធិ 👥', icon: Users },
    { id: 'backup', label: 'រក្សាទុក & Backup 💾', icon: Database },
    { id: 'firebase', label: 'Google Firebase ☁️', icon: Cloud },
    { id: 'currency', label: 'អត្រាប្តូរប្រាក់ & ប្រព័ន្ធ', icon: DollarSign },
    { id: 'telegram', label: 'Telegram Bot 📬', icon: Send },
    { id: 'notifications', label: 'ការដាស់តឿន 🔔', icon: Bell },
    { id: 'updates', label: 'អាប់ដែត App 🚀', icon: Rocket },
  ];

  const tabs = allTabs.filter((tab) => {
    return isTabAllowedForCurrentStaff(tab.id);
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 sm:backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4">
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
        <div className="px-3 sm:px-6 py-2.5 bg-slate-50 border-b border-rose-100 flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar shrink-0">
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
                className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/25 ring-2 ring-pink-500/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 hover:bg-slate-100 shadow-2xs'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'staff' ? (
            /* Staff & Permissions Tab */
            isDemoMode ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-sm space-y-4 my-6">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  មុខងារគ្រប់គ្រងបុគ្គលិក & សិទ្ធិ ត្រូវបានបិទក្នុង Demo Mode
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  ដើម្បីការពារសុវត្ថិភាព និងទិន្នន័យគណនី ផ្ទាំងគ្រប់គ្រងបុគ្គលិក ការកែប្រែ PIN និងសិទ្ធិប្រើប្រាស់ មិនត្រូវបានអនុញ្ញាតឱ្យចូលមើល ឬកែប្រែក្នុងផ្ទាំង Demo ឡើយ។
                </p>
              </div>
            ) : (
              <StaffManagement isEmbedded={true} />
            )
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
            currentStaff.role !== 'ADMIN' ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-sm space-y-4 my-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-rose-900">
                  សិទ្ធិត្រូវបានកំណត់ (Admin Only) 🔒
                </h3>
                <p className="text-sm text-rose-700 max-w-md mx-auto">
                  សម្រាប់តែគណនីម្ចាស់ហាង (Admin) ប៉ុណ្ណោះដែលអាចចូលមើល និងកែប្រែការកំណត់ Google Firebase Cloud បាន។ គណនី «{currentStaff.name} ({currentStaff.role})» គ្មានសិទ្ធិឡើយ។
                </p>
              </div>
            ) : isDemoMode ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-amber-100 shadow-sm space-y-4 my-6">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  មុខងារ Google Firebase ត្រូវបានបិទក្នុង Demo Mode
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  ដើម្បីការពារសុវត្ថិភាពការភ្ជាប់ Cloud Sync ផ្ទាំងកំណត់ប្រព័ន្ធ Firebase មិនត្រូវបានអនុញ្ញាតឱ្យចូលមើល ឬចុចផ្តាច់ក្នុងផ្ទាំង Demo ឡើយ។
                </p>
              </div>
            ) : (
              <FirebaseSettingsTab />
            )
          ) : activeTab === 'telegram' ? (
            /* Telegram Bot Tab */
            currentStaff.role !== 'ADMIN' ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-sm space-y-4 my-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-rose-900">
                  សិទ្ធិត្រូវបានកំណត់ (Admin Only) 🔒
                </h3>
                <p className="text-sm text-rose-700 max-w-md mx-auto">
                  សម្រាប់តែគណនីម្ចាស់ហាង (Admin) ប៉ុណ្ណោះដែលអាចចូលមើល និងកែប្រែការកំណត់ Telegram Bot បាន។ គណនី «{currentStaff.name} ({currentStaff.role})» គ្មានសិទ្ធិឡើយ។
                </p>
              </div>
            ) : isDemoMode ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-blue-100 shadow-sm space-y-4 my-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  មុខងារ Telegram Bot ត្រូវបានបិទក្នុង Demo Mode
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  ដើម្បីការពារសុវត្ថិភាព Bot Token និង Chat ID ផ្ទាំងកំណត់ប្រព័ន្ធ Telegram Bot មិនត្រូវបានអនុញ្ញាតឱ្យចូលមើល ឬកែប្រែក្នុងផ្ទាំង Demo ឡើយ។
                </p>
              </div>
            ) : (
              <TelegramSettingsTab />
            )
          ) : activeTab === 'notifications' ? (
            /* Device Notifications & Reminders Tab */
            <NotificationSettingsTab />
          ) : activeTab === 'updates' ? (
            /* App Updates & In-App Auto Update Tab */
            <AppUpdateTab />
          ) : (
            /* Other Settings Tabs in Form */
            <form onSubmit={handleSave} id="settings-form" className="space-y-5">
              {activeTab === 'store' && (
                <>
                  {/* Logo Upload Section */}
                  {/* Logo Upload Section */}
                  <div className="p-5 rounded-3xl bg-rose-50/50 border-2 border-rose-100 space-y-3.5 shadow-2xs">
                    <label className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                      LOGO ប្រចាំហាង (Bakery Brand Logo)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {/* Logo Preview Box */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-rose-300 bg-white shadow-xs overflow-hidden flex items-center justify-center shrink-0 relative group">
                        {isUploadingLogo ? (
                          <div className="flex flex-col items-center justify-center text-pink-500">
                            <Loader2 className="w-7 h-7 animate-spin" />
                            <span className="text-[10px] font-bold mt-1">កំពុងផ្ទុក...</span>
                          </div>
                        ) : logoUrl ? (
                          <img src={getProductImageUrl(logoUrl)} alt="Store Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-2 text-slate-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 text-pink-400" />
                            <span className="text-[10px] font-bold block">គ្មាន Logo</span>
                          </div>
                        )}
                      </div>

                      {/* Upload & Clear Buttons */}
                      <div className="flex-1 space-y-2.5 w-full">
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-pink-500/20 flex items-center gap-2 active:scale-95 cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Upload Logo (File)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playPop();
                              setCameraTarget('logo');
                            }}
                            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
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
                              className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>លុប Logo</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
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

                  {/* Store Tenant ID (Multi-Tenant Isolation) */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-pink-50/50 to-amber-50/40 border-2 border-purple-200/90 rounded-3xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
                      <span className="font-black text-slate-800 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <span>លេខសម្គាល់ហាង (Store Tenant ID - ការពារទិន្នន័យដាច់ដោយឡែក)</span>
                      </span>
                      <span className="text-xs font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
                        Multi-Tenant Cloud
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={storeIdInput}
                        onChange={(e) => setStoreIdInput(e.target.value.toUpperCase())}
                        placeholder="ឧ. STORE-SENSOK-01"
                        className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-mono font-black uppercase bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-purple-500 shadow-2xs text-purple-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          navigator.clipboard.writeText(storeIdInput);
                          setCopiedStoreId(true);
                          setTimeout(() => setCopiedStoreId(false), 2000);
                        }}
                        className="px-4 py-2.5 sm:py-3 bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs active:scale-95"
                      >
                        {copiedStoreId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        <span>{copiedStoreId ? 'បានចម្លង' : 'ចម្លង ID'}</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      💡 លេខសម្គាល់នេះធានាថាទិន្នន័យរបស់ហាងលោកអ្នក (មុខទំនិញ, ការលក់, ចំណាយ) រក្សាទុកដាច់ដោយឡែក ១០០% ពីហាងដទៃ (សម្រាប់ហាងវិជ្ជតាដើម សូមទុក <span className="font-bold text-purple-700 font-mono">DEFAULT</span> ដដែល)។ <br />
                      ⚠️ <strong>ចំណាំ៖</strong> «លេខសម្គាល់ហាង» នេះមិនមែនជា License Key ទេ។ បើចង់បន្តសុពលភាព សូមប្រើកូដបន្តសុពលភាព (License Key) ឬផ្ញើ Device ID ទៅកាន់ Admin។
                    </p>
                  </div>

                  {/* Store Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                        ឈ្មោះហាង (ភាសាខ្មែរ) *
                      </label>
                      <input
                        type="text"
                        required
                        value={nameKh}
                        onChange={(e) => setNameKh(e.target.value)}
                        placeholder="ឧ. ហាងនំខេក ស្វីតបេកខឺរី"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                        ឈ្មោះហាង (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder="e.g. SweetBakery & Cafe"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Slogan / Tagline */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                      ពាក្យស្លោក / Tagline (បង្ហាញលើវិក្កយបត្រ)
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="ឧ. នំខេកឆ្ងាញ់ប្រណិត ស្រស់ៗរាល់ថ្ងៃ • មានទទួលកុម្ម៉ង់គ្រប់ម៉ូដ"
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                    />
                  </div>

                  {/* Store Phone & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-pink-500" />
                        <span>លេខទូរស័ព្ទទាក់ទង</span>
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="ឧ. 012 345 678 / 098 765 432"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        <span>អាសយដ្ឋានហាង</span>
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="ឧ. ផ្ទះលេខ 128E, ផ្លូវ 271, ភ្នំពេញ"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
                      />
                    </div>

                    {/* Google Maps URL */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span>Google Maps Link</span>
                        <span className="text-xs text-slate-400 font-normal">(ស្រេចចិត្ត)</span>
                      </label>
                      <input
                        type="url"
                        value={mapsUrl}
                        onChange={(e) => setMapsUrl(e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-emerald-700"
                      />
                      <p className="text-xs text-slate-400 mt-1">បើក Google Maps → ចុច Share → Copy Link → Paste ទីនេះ</p>
                    </div>

                    {/* Customer Chatbot & Direct Contact Section */}
                    <div className="sm:col-span-2 pt-3 border-t border-rose-100/80">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-pink-600" />
                        <span>ការកំណត់ Chatbot & ឆាតមកហាងផ្ទាល់ (Direct Store Chat)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Telegram Username ឬ Chat Link សម្រាប់ភ្ញៀវឆាត
                          </label>
                          <input
                            type="text"
                            value={telegramUsername}
                            onChange={(e) => setTelegramUsername(e.target.value)}
                            placeholder="ឧ. @sweetbakery_admin ឬ t.me/..."
                            className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-semibold"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            ភ្ញៀវអាចចុច 1-Click ដើម្បីឆាតផ្ទាល់ទៅ Telegram របស់ហាង
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            លេខទូរស័ព្ទបន្ទាន់ / Hotline សម្រាប់ Chatbot
                          </label>
                          <input
                            type="tel"
                            value={hotlinePhone}
                            onChange={(e) => setHotlinePhone(e.target.value)}
                            placeholder="ឧ. 097 870 7000"
                            className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            បង្ហាញលើផ្ទាំង Chatbot សម្រាប់ភ្ញៀវចុចខលសួរផ្ទាល់
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Link ផេក Facebook ហាង (Optional)
                          </label>
                          <input
                            type="url"
                            value={facebookUrl}
                            onChange={(e) => setFacebookUrl(e.target.value)}
                            placeholder="https://facebook.com/..."
                            className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer View Price Visibility Option */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-pink-50/40 to-rose-50/50 border border-amber-200/90 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                          <EyeOff className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <span>លាក់តម្លៃនំលើផ្ទាំងភ្ញៀវ (Hide Cake Prices on Customer View)</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            បិទការបង្ហាញតម្លៃលើផ្ទាំងអតិថិជន (Showcase, Kiosk & ផ្ទាំងកុម្ម៉ង់អនឡាញ) និងបង្ហាញជា «✨ តម្លៃតាមទំហំ & ម៉ូដ» ជំនួសវិញ ដើម្បីងាយស្រួលចរចាតាមទំហំ និងការតុបតែងនំ។
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={hideCustomerPrices}
                          onChange={(e) => setHideCustomerPrices(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Real Store Access Security & Passcode (ការការពារទិន្នន័យហាងពិត) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-rose-600 text-white rounded-xl shadow-xs">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                            <span>លេខសម្ងាត់សិទ្ធិចូលហាងពិត (Live Store PIN)</span>
                            <span className="text-[10px] bg-rose-200 text-rose-800 font-black px-1.5 py-0.5 rounded-md">
                              សុវត្ថិភាពទិន្នន័យ
                            </span>
                          </h4>
                          <p className="text-[11px] text-rose-700">
                            ការពារទិន្នន័យជាក់ស្តែងរបស់ហាង មិនឱ្យអ្នកសាកល្បង Demo ឬអ្នកក្រៅចូលមើល/កែប្រែដោយគ្មានការអនុញ្ញាត
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Key className="w-3.5 h-3.5 text-rose-500" />
                          <span>លេខកូដសម្ងាត់ហាងពិត (PIN / Password)</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRealStorePin ? 'text' : 'password'}
                            value={realStorePin}
                            onChange={(e) => setRealStorePin(e.target.value)}
                            placeholder="•••• •••• (****)"
                            className="w-full pl-3 pr-10 py-2 text-sm border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-black tracking-widest text-rose-900 bg-white shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRealStorePin((prev) => !prev)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={showRealStorePin ? 'លាក់លេខសម្ងាត់' : 'បង្ហាញលេខសម្ងាត់'}
                          >
                            {showRealStorePin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          * លេខសម្ងាត់ត្រូវបានការពារជាសញ្ញា (****)
                        </p>
                      </div>

                      <div className="flex flex-col justify-center space-y-2">
                        <label className="flex items-center gap-2.5 p-2.5 bg-white/80 rounded-xl border border-rose-200/80 cursor-pointer select-none hover:bg-white transition-all">
                          <input
                            type="checkbox"
                            checked={requireRealStorePin}
                            onChange={(e) => setRequireRealStorePin(e.target.checked)}
                            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              ទាមទារលេខសម្ងាត់ពេលចូលហាងពិត (Require PIN)
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              (បើបិទ៖ អាចចូលហាងពិតដោយផ្ទាល់មិនបាច់វាយ PIN)
                            </span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-2.5 bg-white/80 rounded-xl border border-rose-200/80 cursor-pointer select-none hover:bg-white transition-all">
                          <input
                            type="checkbox"
                            checked={alwaysRequireLoginOnStartup}
                            onChange={(e) => setAlwaysRequireLoginOnStartup(e.target.checked)}
                            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              🔒 បង្ហាញផ្ទាំង Login / PIN គ្រប់ពេលបើកកម្មវិធី (On Startup)
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              (ទាមទារឱ្យ Login ឬវាយ PIN ចូលរាល់ពេលបើកកម្មវិធីថ្មី ដើម្បីសុវត្ថិភាព)
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Quick Lock & PIN Info Bar */}
                    <div className="pt-2.5 flex items-center justify-between border-t border-rose-200/60 flex-wrap gap-2">
                      <p className="text-[10px] text-slate-500">
                        * PIN ដើមម្ចាស់ហាង៖ <span className="font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">660168</span> | គិតលុយ៖ <span className="font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">0202</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          logoutAndLock();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span>🔒 ចាក់សោ & បង្ហាញផ្ទាំង Login ភ្លាមៗ</span>
                      </button>
                    </div>
                  </div>

                  {/* Cake Flavors & Stock Management Section */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-purple-50/70 border-2 border-purple-100 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-xs">
                          🧁
                        </span>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-800">
                            គ្រប់គ្រងរសជាតិនំ & ស្តុក (Cake Flavors & Stock)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            កំណត់រសជាតិមាន ឬអស់ស្តុក និងបន្ថែមរសជាតិថ្មីៗសម្រាប់បង្ហាញលើផ្ទាំងភ្ញៀវកុម្មង់
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setIsCakeFlavorsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-purple-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <span>បើកតារាងរសជាតិ</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Party Accessories Management Entry */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 to-rose-50/80 border border-amber-200/80 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-xl shadow-xs shrink-0">
                          <Sparkles className="w-5 h-5 text-amber-100" />
                        </div>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-800">
                            🎉 គ្រឿងបន្ថែមសម្រាប់កម្មវិធី (Party Accessories)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            គ្រប់គ្រង បន្ថែមមុខទំនិញថ្មី កែប្រែតម្លៃ ($ USD / ៛ KHR) និងគ្រប់គ្រងស្តុក
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setIsPartyAccessoriesModalOpen(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <span>បើកតារាងគ្រឿងបន្ថែម</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
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
                        <img src={getProductImageUrl(khqrQrImage)} alt="KHQR Preview" className="w-full h-full object-contain p-1" />
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
                <div className="space-y-6">
                  {/* Exchange rate */}
                  <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-pink-50/40 p-5 sm:p-6 rounded-3xl border-2 border-amber-200/90 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
                        <DollarSign className="w-7 h-7 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-amber-950">
                          អត្រាប្តូរប្រាក់ (Exchange Rate: $1 USD = ? ៛ KHR)
                        </h4>
                        <p className="text-xs sm:text-sm text-amber-800/90 font-medium">
                          តម្លៃលក់ទាំងអស់ជា KHR និងប្រាក់អាប់ នឹងត្រូវគណនាដោយស្វ័យប្រវត្តិតាមអត្រានេះ
                        </p>
                      </div>
                    </div>

                    {/* Big Numeric Input Box */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-slate-800 font-black text-lg sm:text-2xl">
                        <span className="text-pink-600 bg-pink-50 px-3 py-1 rounded-xl border border-pink-200">$ 1.00 USD</span>
                        <span className="text-slate-400">=</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="10"
                          min="1000"
                          max="10000"
                          required
                          value={rateInput}
                          onChange={(e) => setRateInput(e.target.value)}
                          className="w-full sm:w-48 px-4 py-3 text-2xl sm:text-3xl font-black text-pink-600 text-center bg-slate-50 border-2 border-pink-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:bg-white transition-all shadow-sm"
                        />
                        <span className="text-slate-800 font-black text-base sm:text-xl whitespace-nowrap">
                          ៛ (KHR)
                        </span>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="space-y-2 pt-1">
                      <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center justify-between">
                        <span>⚡ ចុចជ្រើសរើសអត្រាភ្លាមៗ (Quick Presets)៖</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[4000, 4050, 4100, 4150, 4200].map((preset) => {
                          const isSelected = Number(rateInput) === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                soundFx.playPop();
                                setRateInput(String(preset));
                              }}
                              className={`py-3 px-3 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30 ring-2 ring-pink-500/40'
                                  : 'bg-white hover:bg-pink-50 text-slate-800 border border-slate-200 hover:border-pink-300'
                              }`}
                            >
                              <span>{preset.toLocaleString()}</span>
                              <span className="text-xs opacity-75">៛</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Step Adjust Buttons */}
                      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setRateInput(String(Math.max(1000, Number(rateInput || 4100) - 50)));
                          }}
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-2xs active:scale-95"
                        >
                          - 50 ៛
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setRateInput(String(Math.max(1000, Number(rateInput || 4100) - 10)));
                          }}
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-2xs active:scale-95"
                        >
                          - 10 ៛
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setRateInput(String(Number(rateInput || 4100) + 10));
                          }}
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-2xs active:scale-95"
                        >
                          + 10 ៛
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setRateInput(String(Number(rateInput || 4100) + 50));
                          }}
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-2xs active:scale-95"
                        >
                          + 50 ៛
                        </button>
                      </div>
                    </div>

                    {/* Live Preview Conversion Cards */}
                    <div className="bg-white/95 p-4 sm:p-5 rounded-2xl border border-amber-200/90 space-y-2.5">
                      <div className="text-xs sm:text-sm font-black text-slate-800 flex items-center justify-between">
                        <span>📊 តារាងផ្ទៀងផ្ទាត់ការប្តូរប្រាក់ជាក់ស្តែង (Live Preview)</span>
                        <span className="text-pink-600 font-mono font-bold">$1 = {Number(rateInput || 4100).toLocaleString()} ៛</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                        {[1, 5, 10, 20].map((usd) => {
                          const khrVal = usd * Number(rateInput || 4100);
                          return (
                            <div key={usd} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-center">
                              <span className="text-slate-500 font-bold block">${usd}.00</span>
                              <span className="text-pink-600 font-black text-sm sm:text-base block mt-0.5">{khrVal.toLocaleString()} ៛</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reset Data Danger Zone */}
                  <div className="p-5 rounded-3xl bg-rose-50/70 border-2 border-rose-200 space-y-3">
                    <h4 className="text-sm sm:text-base font-black text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-rose-600" />
                      <span>កំណត់ទិន្នន័យឡើងវិញ (Reset Demo Data)</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-rose-700 leading-relaxed font-medium">
                      ប្រសិនបើលោកអ្នកចង់សម្អាតទិន្នន័យចាស់ៗ និងចាប់ផ្តើមទិន្នន័យគំរូដើមឡើងវិញ លោកអ្នកអាចចុចប៊ូតុងខាងក្រោម៖
                    </p>
                    <button
                      type="button"
                      onClick={handleResetData}
                      className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>កំណត់ទិន្នន័យទាំងអស់ឡើងវិញ (Reset All)</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {activeTab === 'staff' || activeTab === 'backup' || activeTab === 'firebase' || activeTab === 'telegram' || activeTab === 'notifications' || activeTab === 'updates' ? (
            <div className="flex items-center justify-between w-full gap-3">
              <span className="text-xs text-slate-500 hidden sm:inline font-medium">
                {activeTab === 'updates'
                  ? '💡 កម្មវិធីនឹងរក្សាទិន្នន័យចាស់ៗដដែល ១០០% ពេលអាប់ដែតកំណែថ្មី'
                  : activeTab === 'notifications'
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
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
              >
                រួចរាល់ (Done)
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                បោះបង់
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isUploadingLogo || isUploadingKhqr}
                className={`flex-1 sm:flex-initial px-6 py-3 text-white text-xs sm:text-sm font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
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

      {/* Cake Flavors & Stock Modal */}
      <CakeFlavorsModal
        isOpen={isCakeFlavorsModalOpen}
        onClose={() => setIsCakeFlavorsModalOpen(false)}
      />

      {/* Party Accessories Management Modal */}
      <PartyAccessoriesModal
        isOpen={isPartyAccessoriesModalOpen}
        onClose={() => setIsPartyAccessoriesModalOpen(false)}
      />
    </div>
  );
};
