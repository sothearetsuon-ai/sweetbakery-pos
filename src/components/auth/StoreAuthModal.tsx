import React, { useState, useEffect } from 'react';
import {
  Store,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Check,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  X,
  Smartphone,
  ChevronRight,
  AlertCircle,
  Laptop,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
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
import { getStoreId, isDefaultStore, DEFAULT_STORE_ID } from '../../services/firebase';

interface StoreAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreAuthModal: React.FC<StoreAuthModalProps> = ({ isOpen, onClose }) => {
  const { storeInfo } = useBakery();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP' | 'JOIN'>('LOGIN');
  const [currentUser, setCurrentUser] = useState<StoreUserAccount | null>(() => getCurrentStoreUser());
  const [currentStoreId, setCurrentStoreId] = useState<string>(() => getStoreId());

  // Form fields
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [targetStoreId, setTargetStoreId] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [canQuickRegister, setCanQuickRegister] = useState(false);
  const [copiedStoreId, setCopiedStoreId] = useState(false);

  // Sync state on open & subscribe
  useEffect(() => {
    if (!isOpen) return;
    setCurrentUser(getCurrentStoreUser());
    setCurrentStoreId(getStoreId());
    setErrorMsg('');
    setSuccessMsg('');
    setCopiedStoreId(false);
  }, [isOpen]);

  useEffect(() => {
    const unsub = subscribeStoreUser((u) => {
      setCurrentUser(u);
      setCurrentStoreId(getStoreId());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleCopyStoreId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedStoreId(true);
      soundFx.playPop();
      setTimeout(() => setCopiedStoreId(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMsg('សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល!');
      return;
    }
    if (!password) {
      setErrorMsg('សូមបញ្ចូលពាក្យសម្ងាត់!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await signInStore(emailOrPhone.trim(), password);
      if (res.success && res.account) {
        soundFx.playSuccess();
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        setSuccessMsg(`ចូលហាង «${res.account.storeName}» បានជោគជ័យ!`);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        soundFx.playPop();
        if (res.notFound || (res.error && res.error.includes('រកមិនឃើញគណនី'))) {
          setCanQuickRegister(true);
        }
        setErrorMsg(formatAuthErrorMessage(res.error || 'មានបញ្ហាក្នុងការចូលប្រើប្រាស់'));
      }
    } catch (err: any) {
      setErrorMsg(formatAuthErrorMessage(err.message || 'កំហុសបច្ចេកទេស'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setErrorMsg('សូមបញ្ចូលឈ្មោះហាងរបស់អ្នក!');
      return;
    }
    if (!emailOrPhone.trim()) {
      setErrorMsg('សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែលសម្រាប់គណនីហាង!');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await signUpStore({
        emailOrPhone: emailOrPhone.trim(),
        password,
        storeName: storeName.trim(),
      });

      if (res.success && res.account) {
        soundFx.playSuccess();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setSuccessMsg(`បង្កើតហាង «${res.account.storeName}» (${res.account.storeId}) ជោគជ័យ!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        soundFx.playPop();
        setErrorMsg(formatAuthErrorMessage(res.error || 'មិនអាចបង្កើតហាងថ្មីបានទេ'));
      }
    } catch (err: any) {
      setErrorMsg(formatAuthErrorMessage(err.message || 'កំហុសបច្ចេកទេស'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await signInWithGoogle();
      if (res.success && res.account) {
        soundFx.playSuccess();
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        setSuccessMsg(`ចូលហាង «${res.account.storeName}» ដោយ Google ជោគជ័យ!`);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        soundFx.playPop();
        setErrorMsg(formatAuthErrorMessage(res.error || 'មិនអាចចូលដោយ Google បានទេ'));
      }
    } catch (err: any) {
      setErrorMsg(formatAuthErrorMessage(err.message || 'កំហុសបច្ចេកទេស'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStoreId.trim()) {
      setErrorMsg('សូមបញ្ចូល Store ID ឱ្យបានត្រឹមត្រូវ!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await joinStoreById(targetStoreId.trim());
      if (res.success && res.account) {
        soundFx.playSuccess();
        setSuccessMsg(`បានភ្ជាប់ទៅកាន់ហាង ${res.account.storeId} រួចរាល់!`);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        soundFx.playPop();
        setErrorMsg(formatAuthErrorMessage(res.error || 'មិនអាចភ្ជាប់ Store ID បានឡើយ'));
      }
    } catch (err: any) {
      setErrorMsg(formatAuthErrorMessage(err.message || 'កំហុសបច្ចេកទេស'));
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
      setSuccessMsg('បានចាកចេញដោយជោគជ័យ!');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const isCustomStore = !isDefaultStore(currentStoreId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-rose-950 to-pink-900 text-white p-5 sm:p-6 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="បិទ"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 p-0.5 shadow-lg shadow-rose-500/30 flex items-center justify-center text-white shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-battambang tracking-tight">
                  គណនីហាង & Multi-Store
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/30 text-rose-200 border border-rose-400/30">
                  Cloud Tenant
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5 font-battambang">
                បំបែកទិន្នន័យហាងដាច់ដោយឡែក ១០០% ដោយស្វ័យប្រវត្ត
              </p>
            </div>
          </div>

          {/* Current Active Store Status Badge */}
          <div className="mt-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-rose-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-bold">ហាងកំពុងដំណើរការ៖</span>
              </div>
              <div className="text-sm font-black text-white truncate mt-0.5 font-battambang">
                {currentUser?.storeName || storeInfo.nameKh || 'ហាងវិជ្ជតា'}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                  ID: {currentStoreId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyStoreId(currentStoreId)}
                  className="text-[11px] text-white/90 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="ចម្លង Store ID សម្រាប់ភ្ជាប់ទូរស័ព្ទ / Tablet"
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
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer font-battambang"
                title="ចាកចេញពីហាងនេះ ត្រឡប់ទៅហាងដើម"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ចាកចេញ</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer font-battambang flex items-center justify-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100 ring-2 ring-rose-500/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ចូលគណនី (Login)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('SIGNUP');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer font-battambang flex items-center justify-center gap-1.5 ${
              activeTab === 'SIGNUP'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100 ring-2 ring-rose-500/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>បង្កើតហាងថ្មី (Sign Up)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('JOIN');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer font-battambang flex items-center justify-center gap-1.5 ${
              activeTab === 'JOIN'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100 ring-2 ring-rose-500/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>ភ្ជាប់ Store ID</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold space-y-2.5 animate-in fade-in font-battambang">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              {canQuickRegister && activeTab === 'LOGIN' && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setActiveTab('SIGNUP');
                    setErrorMsg('');
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

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-in fade-in font-battambang">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 font-battambang">
                  លេខទូរស័ព្ទ ឬ អ៊ីមែល (Phone or Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ 012629160 ឬ owner@bakery.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all font-num"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-battambang">
                  * អាចប្រើលេខទូរស័ព្ទផ្ទាល់ដូច Telegram / Facebook ដោយមិនបាច់ចាំ SMS Code
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 font-battambang">
                  ពាក្យសម្ងាត់ (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់..."
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all font-num"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 font-battambang"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងផ្ទៀងផ្ទាត់...</span>
                  </>
                ) : (
                  <>
                    <span>ចូលប្រើប្រាស់គណនីហាង</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 font-battambang">
                  ឬ ចូលដោយចុចតែម្តង
                </span>
              </div>

              {/* Google 1-Click Login */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-3 shadow-2xs font-battambang"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>ចូលដោយប្រើគណនី Google (1-Click)</span>
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP NEW STORE */}
          {activeTab === 'SIGNUP' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200/80 text-amber-900 text-xs font-medium space-y-1 font-battambang">
                <div className="flex items-center gap-1.5 font-black text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>បំបែកហាងដាច់ដោយឡែក (100% Isolated Data)</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  ពេលអ្នកបង្កើតហាងថ្មី ប្រព័ន្ធនឹងបង្កើត Store ID ដោយឡែក។ រាល់មុខទំនិញ របាយការណ៍លក់ និងអតិថិជន នឹងមិនប៉ះពាល់ហាងផ្សេងឡើយ!
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 font-battambang">
                  ឈ្មោះហាងរបស់អ្នក (Store Name)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ ហាងនំខេក សុភមង្គល Sweet Bakery"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all font-battambang"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 font-battambang">
                  លេខទូរស័ព្ទ ឬ អ៊ីមែលម្ចាស់ហាង (Phone or Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ 012629160 ឬ owner@mybakery.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all font-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 font-battambang">
                  ពាក្យសម្ងាត់បង្កើតថ្មី (Password យ៉ាងហោច ៦ ខ្ទង់)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="កំណត់ពាក្យសម្ងាត់..."
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all font-num"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 font-battambang"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងបង្កើតហាង...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>បង្កើតហាងថ្មី និងចាប់ផ្ដើមភ្លាមៗ</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: JOIN BY STORE ID (FOR CASHIERS & TABLETS) */}
          {activeTab === 'JOIN' && (
            <form onSubmit={handleJoinStore} className="space-y-4">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium space-y-1 font-battambang">
                <div className="flex items-center gap-1.5 font-black text-blue-950">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>សម្រាប់ Tablet អ្នកគិតលុយ ឬ ផ្ទះបាយ (Cashier & Staff)</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  ប្រសិនបើម្ចាស់ហាងបានបង្កើតហាងរួចហើយ លោកអ្នកគ្រាន់តែសុំ Store ID ពីគាត់ រួចវាយបញ្ចូលខាងក្រោម ដើម្បីភ្ជាប់ទិន្នន័យហាងដូចគ្នាភ្លាមៗ!
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 font-battambang">
                  លេខកូដសម្គាល់ហាង (Store Tenant ID)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={targetStoreId}
                    onChange={(e) => setTargetStoreId(e.target.value.toUpperCase())}
                    placeholder="ឧទាហរណ៍៖ STORE-012629 ឬ STORE-8F2B"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-black text-slate-900 uppercase placeholder:text-slate-400 transition-all font-mono tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-battambang">
                  * អាចសុំពីម្ចាស់ហាងនៅលើកុំព្យូទ័រមេ (ត្រង់ផ្នែកខាងលើនៃ Navbar)
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 font-battambang"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងភ្ជាប់ហាង...</span>
                  </>
                ) : (
                  <>
                    <span>ភ្ជាប់ទៅកាន់ហាងនេះ (Join Store)</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-battambang shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Cloud Encrypted</span>
          </span>
          <span className="font-mono text-slate-400 font-bold">SweetBakery v1.2</span>
        </div>
      </div>
    </div>
  );
};
