import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  X,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Phone,
  Store,
  Laptop,
  Check,
  Copy,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
import { setStoreId, getStoreId, DEFAULT_STORE_ID, isDefaultStore } from '../../services/firebase';
import {
  signUpStore,
  signInStore,
  signInWithGoogle,
  joinStoreById,
  logoutStore,
  getCurrentStoreUser,
  subscribeStoreUser,
  StoreUserAccount,
  formatAuthErrorMessage,
} from '../../services/authService';
import { initialStaffMembers } from '../../data/mockData';
import { StaffMember } from '../../types';

interface RealStoreAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (authenticatedStaff?: StaffMember) => void;
}

export const RealStoreAuthModal: React.FC<RealStoreAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    verifyRealStorePin,
    exitDemoMode,
    enterDemoMode,
    isDemoMode,
    staffMembers,
    currentStaff,
    setCurrentStaff,
    storeInfo,
    updateStoreInfo,
  } = useBakery();

  // Primary mode: 'NEW_FORM' (Default) or 'PIN'
  const [authMode, setAuthMode] = useState<'NEW_FORM' | 'PIN'>(() => {
    try {
      const saved = localStorage.getItem('bakery_auth_preferred_mode');
      if (saved === 'NEW_FORM' || saved === 'PIN') return saved;
    } catch (e) {}
    return 'NEW_FORM';
  });

  // Sub-tabs in NEW_FORM: 'LOGIN' | 'SIGNUP' | 'JOIN'
  const [activeFormTab, setActiveFormTab] = useState<'LOGIN' | 'SIGNUP' | 'JOIN'>('LOGIN');

  // Multi-Store User & Tenant State
  const [currentUser, setCurrentUser] = useState<StoreUserAccount | null>(() => getCurrentStoreUser());
  const [currentStoreId, setCurrentStoreId] = useState<string>(() => getStoreId());

  // Form Fields (Email/Phone, Password, Store Name, Join Store ID)
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [targetStoreId, setTargetStoreId] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [canQuickRegister, setCanQuickRegister] = useState(false);
  const [copiedStoreId, setCopiedStoreId] = useState(false);

  // PIN Keypad State
  const [pinInput, setPinInput] = useState('');
  const pinInputRef = useRef(pinInput);
  pinInputRef.current = pinInput;

  const [pinError, setPinError] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const authenticatedStaffRef = useRef<StaffMember | null>(null);

  // Helper to convert Khmer numbers (០-៩) or Latin digits (0-9) to standard ASCII digits
  const normalizePin = (input: string): string => {
    if (!input) return '';
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    let res = '';
    for (const ch of input.trim()) {
      const idx = khmerDigits.indexOf(ch);
      if (idx !== -1) {
        res += idx.toString();
      } else if (ch >= '0' && ch <= '9') {
        res += ch;
      }
    }
    return res;
  };

  // Real store staff members list
  const realStaffList = useMemo(() => {
    const saved = localStorage.getItem('bakery_staff_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as StaffMember[];
      } catch (e) {}
    }
    if (staffMembers && staffMembers.length > 0 && !isDemoMode) {
      return staffMembers;
    }
    return initialStaffMembers;
  }, [staffMembers, isDemoMode, isOpen]);

  // Reset & sync state when opening
  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      pinInputRef.current = '';
      setPinError('');
      setFormError('');
      setFormSuccess('');
      setIsShaking(false);
      setSelectedStaffId(null);
      authenticatedStaffRef.current = null;
      setCurrentUser(getCurrentStoreUser());
      setCurrentStoreId(getStoreId());
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = subscribeStoreUser((u) => {
      setCurrentUser(u);
      setCurrentStoreId(getStoreId());
    });
    return unsub;
  }, []);

  const handleCopyStoreId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedStoreId(true);
      soundFx.playPop();
      setTimeout(() => setCopiedStoreId(false), 2500);
    } catch (e) {}
  };

  const unlockAndFinish = (staffToPreserve?: StaffMember | null) => {
    sessionStorage.setItem('bakery_real_store_unlocked', 'true');
    const activeTenantId = getStoreId();
    if (isDefaultStore(activeTenantId)) {
      localStorage.setItem('bakery_is_primary_store', 'true');
    } else {
      localStorage.setItem('bakery_is_primary_store', 'false');
    }
    if (rememberDevice) {
      localStorage.setItem('bakery_real_store_authorized_device', 'true');
    } else {
      localStorage.removeItem('bakery_real_store_authorized_device');
    }

    const adminStaff = realStaffList.find((s) => s.role === 'ADMIN') || realStaffList[0];
    const finalStaff = staffToPreserve || authenticatedStaffRef.current || currentStaff || adminStaff;

    // Immediately close modal so UI never freezes or stutters
    onClose();

    // Play pleasant success sound non-blocking
    soundFx.playSuccess();

    // Defer heavy state rehydration and confetti to next animation frame
    setTimeout(() => {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      if (onSuccess) {
        onSuccess(finalStaff);
      } else if (isDemoMode) {
        exitDemoMode(finalStaff);
      }
    }, 16);
  };

  // --- NEW FORM HANDLERS ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setFormError('សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល!');
      return;
    }
    if (!password) {
      setFormError('សូមបញ្ចូលពាក្យសម្ងាត់!');
      return;
    }

    setIsLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await signInStore(emailOrPhone.trim(), password);
      if (res.success && res.account) {
        updateStoreInfo({
          nameKh: res.account.storeName,
          nameEn: res.account.storeName,
          phone: res.account.phone || '',
          storeId: res.account.storeId,
        });
        setFormSuccess(`ចូលហាង «${res.account.storeName}» ជោគជ័យ!`);
        setTimeout(() => {
          const adminStaff = realStaffList.find((s) => s.role === 'ADMIN') || realStaffList[0];
          unlockAndFinish(adminStaff);
        }, 800);
      } else {
        soundFx.playPop();
        if (res.notFound || (res.error && res.error.includes('រកមិនឃើញគណនី'))) {
          setCanQuickRegister(true);
        }
        setFormError(formatAuthErrorMessage(res.error || 'មានបញ្ហាក្នុងការចូលប្រើប្រាស់'));
      }
    } catch (err: any) {
      setFormError(formatAuthErrorMessage(err.message || 'កំហុសបច្ចេកទេស'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setFormError('សូមបញ្ចូលឈ្មោះហាងរបស់អ្នក!');
      return;
    }
    if (!emailOrPhone.trim()) {
      setFormError('សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែលសម្រាប់គណនីហាង!');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់!');
      return;
    }

    setIsLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await signUpStore({
        emailOrPhone: emailOrPhone.trim(),
        password,
        storeName: storeName.trim(),
      });

      if (res.success && res.account) {
        updateStoreInfo({
          nameKh: res.account.storeName,
          nameEn: res.account.storeName,
          phone: res.account.phone || '',
          storeId: res.account.storeId,
        });
        setFormSuccess(`បង្កើតហាង «${res.account.storeName}» (${res.account.storeId}) ជោគជ័យ!`);
        setTimeout(() => {
          const adminStaff = realStaffList.find((s) => s.role === 'ADMIN') || realStaffList[0];
          unlockAndFinish(adminStaff);
        }, 1000);
      } else {
        soundFx.playPop();
        setFormError(formatAuthErrorMessage(res.error || 'មិនអាចបង្កើតហាងថ្មីបានទេ'));
      }
    } catch (err: any) {
      setFormError(formatAuthErrorMessage(err.message || 'កំហុសបច្ចេកទេស'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setFormError('');
    setFormSuccess('');
    try {
      const res = await signInWithGoogle();
      if (res.success && res.account) {
        updateStoreInfo({
          nameKh: res.account.storeName,
          nameEn: res.account.storeName,
          phone: res.account.phone || '',
          storeId: res.account.storeId,
        });
        setFormSuccess(`ចូលហាង «${res.account.storeName}» ដោយ Google ជោគជ័យ!`);
        setTimeout(() => {
          const adminStaff = realStaffList.find((s) => s.role === 'ADMIN') || realStaffList[0];
          unlockAndFinish(adminStaff);
        }, 800);
      } else {
        soundFx.playPop();
        setFormError(formatAuthErrorMessage(res.error || 'មិនអាចចូលដោយ Google បានទេ'));
      }
    } catch (err: any) {
      setFormError(formatAuthErrorMessage(err.message || 'កំហុសបច្ចេកទេស'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStoreId.trim()) {
      setFormError('សូមបញ្ចូល Store ID ឱ្យបានត្រឹមត្រូវ!');
      return;
    }

    setIsLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await joinStoreById(targetStoreId.trim());
      if (res.success && res.account) {
        updateStoreInfo({
          nameKh: res.account.storeName || storeInfo.nameKh,
          nameEn: res.account.storeName || storeInfo.nameEn,
          phone: res.account.phone || storeInfo.phone,
          storeId: res.account.storeId,
        });
        setFormSuccess(`បានភ្ជាប់ទៅកាន់ហាង ${res.account.storeId} រួចរាល់!`);
        setTimeout(() => {
          unlockAndFinish();
        }, 800);
      } else {
        soundFx.playPop();
        setFormError(formatAuthErrorMessage(res.error || 'មិនអាចភ្ជាប់ Store ID បានឡើយ'));
      }
    } catch (err: any) {
      setFormError(formatAuthErrorMessage(err.message || 'កំហុសបច្ចេកទេស'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('តើអ្នកពិតជាចង់ចាកចេញពីគណនីហាងនេះ ហើយត្រឡប់ទៅហាងលំនាំដើមមែនទេ?')) {
      setIsLoading(true);
      await logoutStore();
      soundFx.playPop();
      setCurrentUser(null);
      setCurrentStoreId(DEFAULT_STORE_ID);
      setIsLoading(false);
      setFormSuccess('បានចាកចេញដោយជោគជ័យ!');
      setTimeout(() => setFormSuccess(''), 2500);
    }
  };

  // --- PIN NUMPAD HANDLERS ---
  const checkAndUnlock = (candidatePin: string): boolean => {
    const clean = normalizePin(candidatePin);
    if (!clean || clean.length < 4) return false;

    // Reject demo codes for real store
    if (clean === '1111' || clean === '2222') return false;

    // Check staff pin match
    let matchedStaff: StaffMember | undefined;
    if (selectedStaffId) {
      const staff = realStaffList.find((s) => s.id === selectedStaffId);
      if (staff && staff.pinCode === clean) matchedStaff = staff;
    } else {
      matchedStaff = realStaffList.find((s) => s.isActive && s.pinCode === clean);
    }

    const isValid = Boolean(matchedStaff) || verifyRealStorePin(clean);
    if (isValid) {
      if (matchedStaff) {
        setCurrentStaff(matchedStaff);
      }
      unlockAndFinish(matchedStaff);
      return true;
    }
    return false;
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = normalizePin(pinInputRef.current || pinInput);
    if (!clean) {
      setPinError('សូមវាយបញ្ចូលលេខកូដ PIN ឬពាក្យសម្ងាត់!');
      return;
    }

    if (clean === '1111' || clean === '2222') {
      soundFx.playPop();
      setIsShaking(true);
      setPinError('លេខកូដ 1111 និង 2222 សម្រាប់តែរបៀប Demo ប៉ុណ្ណោះ! សូមប្រើលេខកូដហាងពិត (660168 / 0202)។');
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const unlocked = checkAndUnlock(clean);
    if (!unlocked) {
      soundFx.playPop();
      setIsShaking(true);
      setPinError('លេខសម្ងាត់មិនត្រឹមត្រូវឡើយ! សូមព្យាយាមម្តងទៀត។');
      setTimeout(() => setIsShaking(false), 500);
      pinInputRef.current = '';
      setPinInput('');
    }
  };

  const handleKeyPress = (digit: string) => {
    soundFx.playPop();
    const current = pinInputRef.current;
    if (current.length < 8) {
      const nextPin = normalizePin(current + digit);
      pinInputRef.current = nextPin;
      setPinInput(nextPin);
      setPinError('');
      checkAndUnlock(nextPin);
    }
  };

  const handleBackspace = () => {
    soundFx.playPop();
    const nextPin = pinInputRef.current.slice(0, -1);
    pinInputRef.current = nextPin;
    setPinInput(nextPin);
    setPinError('');
  };

  const handleClearPin = () => {
    soundFx.playPop();
    pinInputRef.current = '';
    setPinInput('');
    setPinError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = normalizePin(e.target.value).slice(0, 8);
    pinInputRef.current = clean;
    setPinInput(clean);
    setPinError('');
    checkAndUnlock(clean);
  };

  // Keyboard shortcut listener for instantaneous PIN entry
  useEffect(() => {
    if (!isOpen || authMode !== 'PIN') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handlePinSubmit();
        return;
      }

      if (e.key === 'Backspace' && !isInput) {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (!isInput) {
        let digit: string | null = null;
        if (e.key >= '0' && e.key <= '9') {
          digit = e.key;
        } else {
          const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
          const idx = khmerDigits.indexOf(e.key);
          if (idx !== -1) digit = idx.toString();
        }

        if (digit !== null) {
          e.preventDefault();
          handleKeyPress(digit);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, authMode, realStaffList, selectedStaffId]);

  const handleCancel = () => {
    if (!isDemoMode) {
      enterDemoMode();
    }
    onClose();
  };

  if (!isOpen) return null;

  const isCustomStore = !isDefaultStore(currentStoreId);

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn overflow-y-auto font-battambang">
      <div
        className={`relative w-full max-w-md sm:max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col max-h-[94vh] overflow-hidden will-change-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-pink-900 text-white p-4 sm:p-5 shrink-0 shadow-xs relative">
          <button
            type="button"
            onClick={handleCancel}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="បិទ (ចូលរបៀប Demo)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 p-0.5 shadow-lg shadow-rose-500/30 flex items-center justify-center text-white shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
                  ផ្ទៀងផ្ទាត់សិទ្ធិចូលហាង & គណនី
                </h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-rose-200/90 leading-tight mt-0.5">
                ចូលប្រើប្រាស់ទម្រង់ថ្មី (Login/Sign Up) ឬវាយ PIN បុគ្គលិក
              </p>
            </div>
          </div>

          {/* Current Active Store Status Badge */}
          <div className="mt-3 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-rose-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-bold">ហាងបច្ចុប្បន្ន៖</span>
                <span className="text-white font-black truncate">
                  {currentUser?.storeName || storeInfo.nameKh || 'ហាងវិជ្ជតា'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-400/30">
                  ID: {currentStoreId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyStoreId(currentStoreId)}
                  className="text-[10px] text-white/90 hover:text-white flex items-center gap-0.5 px-1 py-0.2 rounded hover:bg-white/10 cursor-pointer"
                  title="ចម្លង Store ID"
                >
                  {copiedStoreId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">បានចម្លង!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-rose-300" />
                      <span>ចម្លង ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isCustomStore && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-bold shadow-xs active:scale-95 cursor-pointer"
                title="ចាកចេញពីហាងនេះ ត្រឡប់ទៅហាងដើម"
              >
                <LogOut className="w-3 h-3" />
                <span>ចាកចេញ</span>
              </button>
            )}
          </div>
        </div>

        {/* PRIMARY MODE SWITCHER: 'NEW_FORM' vs 'PIN' */}
        <div className="flex items-center border-b border-rose-100 bg-rose-50/60 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setAuthMode('NEW_FORM');
              try {
                localStorage.setItem('bakery_auth_preferred_mode', 'NEW_FORM');
              } catch (e) {}
              soundFx.playPop();
            }}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'NEW_FORM'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/20 scale-[1.01]'
                : 'bg-white text-slate-700 hover:text-rose-600 border border-slate-200'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${authMode === 'NEW_FORM' ? 'text-amber-200' : 'text-rose-500'}`} />
            <span>✨ ទម្រង់បង្កើតថ្មី & ចូលគណនី</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('PIN');
              try {
                localStorage.setItem('bakery_auth_preferred_mode', 'PIN');
              } catch (e) {}
              soundFx.playPop();
            }}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'PIN'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/20 scale-[1.01]'
                : 'bg-white text-slate-700 hover:text-rose-600 border border-slate-200'
            }`}
          >
            <KeyRound className={`w-3.5 h-3.5 ${authMode === 'PIN' ? 'text-amber-200' : 'text-slate-500'}`} />
            <span>🔢 វាយ PIN កូដរហ័ស</span>
          </button>
        </div>

        {/* MODE 1: NEW LOGIN / SIGN UP / MULTI-STORE FORM */}
        {authMode === 'NEW_FORM' && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Sub Tabs: LOGIN | SIGNUP | JOIN */}
            <div className="flex items-center border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab('LOGIN');
                  setFormError('');
                  setFormSuccess('');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeFormTab === 'LOGIN'
                    ? 'bg-white text-rose-600 shadow-xs border border-rose-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>ចូលគណនី (Login)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveFormTab('SIGNUP');
                  setFormError('');
                  setFormSuccess('');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeFormTab === 'SIGNUP'
                    ? 'bg-white text-rose-600 shadow-xs border border-rose-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>បង្កើតហាងថ្មី (Sign Up)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveFormTab('JOIN');
                  setFormError('');
                  setFormSuccess('');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeFormTab === 'JOIN'
                    ? 'bg-white text-rose-600 shadow-xs border border-rose-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>ភ្ជាប់ Store ID</span>
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
              {/* Feedback messages */}
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold space-y-2.5 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                  {canQuickRegister && activeFormTab === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setActiveFormTab('SIGNUP');
                        setFormError('');
                        setCanQuickRegister(false);
                        if (!storeName.trim()) setStoreName('ហាងនំ SweetBakery');
                      }}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>✨ បង្កើតហាងថ្មីជាមួយលេខ {emailOrPhone || 'នេះ'} ភ្លាមៗ (Sign Up)</span>
                    </button>
                  )}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* TAB 1: LOGIN */}
              {activeFormTab === 'LOGIN' && (
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      លេខទូរស័ព្ទ ឬ អ៊ីមែល (Phone or Email)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        autoFocus
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="ឧ. 012629160 ឬ owner@bakery.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium font-num"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      * អាចប្រើលេខទូរស័ព្ទផ្ទាល់ដូច Telegram / Facebook យ៉ាងងាយស្រួល
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      ពាក្យសម្ងាត់ (Password)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="បញ្ចូលពាក្យសម្ងាត់..."
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium font-num"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Device Checkbox */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-600 hover:text-slate-900 justify-center">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>ចងចាំការអនុញ្ញាតលើឧបករណ៍នេះ (Remember device)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{isLoading ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ចូលហាងពិត (Login) ➜'}</span>
                  </button>

                  <div className="relative my-2.5 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-2 text-[10px] text-slate-400 font-bold uppercase">
                      ឬ ចូលដោយ
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>ចូលដោយ Google 1-Click</span>
                  </button>
                </form>
              )}

              {/* TAB 2: SIGN UP (បង្កើតហាងថ្មី) */}
              {activeFormTab === 'SIGNUP' && (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      ឈ្មោះហាងនំរបស់អ្នក (Store Name)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Store className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="ឧទាហរណ៍៖ Sweet Home Bakery"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      លេខទូរស័ព្ទ ឬ អ៊ីមែលម្ចាស់ហាង
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="ឧ. 012629160"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium font-num"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      ពាក្យសម្ងាត់ (យ៉ាងតិច ៦ ខ្ទង់)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="បង្កើតពាក្យសម្ងាត់..."
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium font-num"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span>{isLoading ? 'កំពុងបង្កើតហាង...' : '✓ បង្កើតហាងថ្មីភ្លាមៗ ➜'}</span>
                  </button>
                </form>
              )}

              {/* TAB 3: JOIN STORE */}
              {activeFormTab === 'JOIN' && (
                <form onSubmit={handleJoinStore} className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      បញ្ចូលលេខកូដ Store ID ហាងរបស់អ្នក
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Store className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={targetStoreId}
                        onChange={(e) => setTargetStoreId(e.target.value)}
                        placeholder="ឧ. store-8a42b9fc"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-mono font-bold"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      * ប្រើសម្រាប់ភ្ជាប់ទូរស័ព្ទ ឬ Tablet បុគ្គលិកទៅកាន់ហាងធំ
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Laptop className="w-4 h-4" />
                    <span>{isLoading ? 'កំពុងភ្ជាប់...' : 'ភ្ជាប់ Store ID ឥឡូវនេះ ➜'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: QUICK PIN KEYPAD */}
        {authMode === 'PIN' && (
          <form
            onSubmit={handlePinSubmit}
            className="p-3.5 sm:p-4 space-y-2.5 overflow-y-auto flex-1 select-none"
          >
            {/* Quick Staff Selection Chips */}
            {realStaffList.length > 0 && (
              <div className="space-y-1 pb-1.5 border-b border-slate-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600">ជ្រើសរើសគណនី ឬវាយ PIN ចូល៖</span>
                  <span className="text-[10px] text-slate-400">({realStaffList.filter((s) => s.isActive).length} នាក់)</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-h-16 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStaffId(null);
                      setPinInput('');
                      pinInputRef.current = '';
                      setPinError('');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer shrink-0 touch-manipulation ${
                      selectedStaffId === null
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ⚡ Auto Detect PIN
                  </button>
                  {realStaffList.filter((s) => s.isActive).map((staff) => {
                    const isSelected = selectedStaffId === staff.id;
                    return (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => {
                          setSelectedStaffId(staff.id);
                          setPinInput('');
                          pinInputRef.current = '';
                          setPinError('');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer shrink-0 touch-manipulation ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs scale-102'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{staff.avatar || '👤'}</span>
                        <span className="truncate max-w-[85px]">{staff.name}</span>
                        <span className={`text-[8px] px-1 py-0.2 rounded font-black ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {staff.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PIN Input Display & Masked Dots */}
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 py-0.5">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const isFilled = pinInput.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-sm sm:text-base border-2 select-none transition-transform duration-75 ${
                        isFilled
                          ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-2xs scale-105'
                          : 'border-slate-200 bg-slate-50 text-slate-300'
                      }`}
                    >
                      {isFilled ? '✱' : '•'}
                    </div>
                  );
                })}
              </div>

              {/* Input Field with Show/Hide toggle */}
              <div className="relative w-full max-w-[280px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={handleInputChange}
                  placeholder="បញ្ចូលលេខសម្ងាត់ PIN"
                  className="w-full pl-9 pr-9 py-2 text-center text-base sm:text-lg font-black tracking-widest bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 font-num"
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPin ? 'លាក់លេខសម្ងាត់' : 'បង្ហាញលេខសម្ងាត់'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error Message */}
              {pinError ? (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 text-center font-medium">
                  វាយលេខលើក្តារចុច (Keyboard) ឬចុចប៊ូតុងខាងក្រោម
                </p>
              )}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-1.5 max-w-[260px] mx-auto w-full select-none touch-manipulation">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="h-9 sm:h-10 rounded-xl bg-slate-50 hover:bg-rose-50 active:bg-rose-100 text-slate-800 hover:text-rose-700 font-black text-lg border border-slate-200 hover:border-rose-300 shadow-2xs active:scale-95 transition-transform duration-75 cursor-pointer font-num touch-manipulation"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClearPin}
                className="h-9 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold text-xs border border-slate-200 active:scale-95 transition-transform duration-75 cursor-pointer touch-manipulation"
              >
                លុប
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-9 sm:h-10 rounded-xl bg-slate-50 hover:bg-rose-50 active:bg-rose-100 text-slate-800 hover:text-rose-700 font-black text-lg border border-slate-200 hover:border-rose-300 shadow-2xs active:scale-95 transition-transform duration-75 cursor-pointer font-num touch-manipulation"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-9 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold text-xs border border-slate-200 active:scale-95 transition-transform duration-75 cursor-pointer flex items-center justify-center touch-manipulation"
                title="លុបថយក្រោយ"
              >
                ⌫
              </button>
            </div>

            {/* Remember Device Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-600 hover:text-slate-900 justify-center">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
              <span>ចងចាំការអនុញ្ញាតលើឧបករណ៍នេះ (Remember device)</span>
            </label>

            {/* Submit Button for PIN */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-rose-500/25 transition-transform duration-75 flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-rose-500/20 touch-manipulation"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>ផ្ទៀងផ្ទាត់ & ចូលហាងពិត (Enter) ➜</span>
            </button>
          </form>
        )}

        {/* Modal Footer - Demo fallback link */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              if (!isDemoMode) enterDemoMode();
              onClose();
            }}
            className="flex-1 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
            <span>🧪 ចូលប្រើប្រាស់របៀបសាកល្បង (Demo Sandbox)</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
