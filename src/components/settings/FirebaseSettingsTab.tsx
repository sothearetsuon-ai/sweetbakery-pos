import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  UploadCloud,
  DownloadCloud,
  Trash2,
  Copy,
  Check,
  Zap,
  HelpCircle,
  KeyRound,
  Database,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FirebaseConfig,
  DEFAULT_FIREBASE_CONFIG,
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
  parseFirebaseConfigInput,
  testFirebaseConnection,
  bulkUploadLocalToFirebase,
  fetchEntireFirestoreData,
  getFirestoreDb,
  getStoreId,
} from '../../services/firebase';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

export const FirebaseSettingsTab: React.FC = () => {
  const {
    products,
    sales,
    customOrders,
    expenses,
    ingredients,
    staffMembers,
    storeInfo,
    exchangeRate,
    exportBackupData,
    importBackupData,
  } = useBakery();

  const [currentConfig, setCurrentConfig] = useState<FirebaseConfig | null>(() =>
    getStoredFirebaseConfig()
  );
  const [rawInput, setRawInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [isSyncingUp, setIsSyncingUp] = useState(false);
  const [syncUpResult, setSyncUpResult] = useState<{
    success?: boolean;
    message: string;
    counts?: any;
  } | null>(null);

  const [isPulling, setIsPulling] = useState(false);
  const [pullResult, setPullResult] = useState<{
    success?: boolean;
    message: string;
  } | null>(null);

  const [showManualFields, setShowManualFields] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [projectIdInput, setProjectIdInput] = useState('');
  const [appIdInput, setAppIdInput] = useState('');
  const [authDomainInput, setAuthDomainInput] = useState('');

  const isConnected = !!currentConfig && !!getFirestoreDb();

  // Handle Save & Connect from Raw Paste
  const handleConnectFromInput = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let configToTest: FirebaseConfig | null = null;

    if (showManualFields) {
      if (!apiKeyInput.trim() || !projectIdInput.trim()) {
        setTestResult({
          success: false,
          message: 'សូមបញ្ចូល API Key និង Project ID ឱ្យបានត្រឹមត្រូវ',
        });
        return;
      }
      configToTest = {
        apiKey: apiKeyInput.trim(),
        projectId: projectIdInput.trim(),
        authDomain: authDomainInput.trim() || `${projectIdInput.trim()}.firebaseapp.com`,
        appId: appIdInput.trim(),
      };
    } else {
      configToTest = parseFirebaseConfigInput(rawInput);
    }

    if (!configToTest) {
      soundFx.playPop();
      setTestResult({
        success: false,
        message:
          'ទម្រង់កូដមិនត្រឹមត្រូវឡើយ! សូមចម្លង (Copy) កូដ const firebaseConfig = { ... } ឬ JSON ពី Firebase Console មកបិទភ្ជាប់។',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testFirebaseConnection(configToTest);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      saveStoredFirebaseConfig(configToTest);
      setCurrentConfig(configToTest);
      soundFx.playSuccess();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else {
      soundFx.playPop();
    }
  };

  // Push Local Data to Firebase Cloud
  const handlePushLocalToCloud = async () => {
    if (!currentConfig) return;

    if (
      !window.confirm(
        'តើអ្នកពិតជាចង់ Sync ទិន្នន័យក្នុងហាងបច្ចុប្បន្ន (នំ, ការលក់, កុម្ម៉ង់, ចំណាយ, បុគ្គលិក) ឡើងទៅកាន់ Google Cloud Firebase មែនទេ?'
      )
    ) {
      return;
    }

    setIsSyncingUp(true);
    setSyncUpResult(null);

    const localData = exportBackupData();
    const result = await bulkUploadLocalToFirebase(localData);

    setIsSyncingUp(false);
    setSyncUpResult(result);

    if (result.success) {
      soundFx.playSuccess();
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
    } else {
      soundFx.playPop();
    }
  };

  // Pull Cloud Data to Local
  const handlePullCloudToLocal = async () => {
    if (!currentConfig) return;

    if (
      !window.confirm(
        'តើអ្នកចង់ទាញយកទិន្នន័យពី Cloud Firebase មកជំនួសទិន្នន័យលើឧបករណ៍នេះមែនទេ? (ទិន្នន័យលើទូរសព្ទ/កុំព្យូទ័រនេះនឹងត្រូវ Update តាម Cloud)'
      )
    ) {
      return;
    }

    setIsPulling(true);
    setPullResult(null);

    const cloudData = await fetchEntireFirestoreData();
    setIsPulling(false);

    if (cloudData) {
      const fullData = {
        version: '1.0',
        backupDate: new Date().toISOString(),
        storeInfo: cloudData.storeInfo || storeInfo,
        exchangeRate: cloudData.exchangeRate || exchangeRate,
        products: cloudData.products || products,
        categories: [],
        flavors: [],
        customOrders: cloudData.customOrders || customOrders,
        ingredients: cloudData.ingredients || ingredients,
        expenses: cloudData.expenses || expenses,
        sales: cloudData.sales || sales,
        staffMembers: cloudData.staffMembers || staffMembers,
        currentShift: null,
      };

      const importRes = importBackupData(JSON.stringify(fullData));
      if (importRes.success) {
        soundFx.playSuccess();
        setPullResult({
          success: true,
          message: 'បានទាញទិន្នន័យពី Cloud មកបញ្ចូលក្នុងឧបករណ៍នេះដោយជោគជ័យ!',
        });
      } else {
        setPullResult({
          success: false,
          message: importRes.message,
        });
      }
    } else {
      soundFx.playPop();
      setPullResult({
        success: false,
        message: 'មិនអាចទាញទិន្នន័យពី Cloud បានឡើយ។ សូមពិនិត្យមើលការតភ្ជាប់អ៊ីនធឺណិត',
      });
    }
  };

  // Reset to Default Cloud Config
  const handleResetToDefault = () => {
    saveStoredFirebaseConfig(DEFAULT_FIREBASE_CONFIG);
    setCurrentConfig(DEFAULT_FIREBASE_CONFIG);
    soundFx.playSuccess();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => window.location.reload(), 400);
  };

  // Disconnect Firebase
  const handleDisconnect = () => {
    if (
      window.confirm(
        'តើអ្នកពិតជាចង់ផ្តាច់ការតភ្ជាប់ពី Google Firebase មែនទេ? (ទិន្នន័យក្នុងឧបករណ៍នឹងនៅតែមានជាធម្មតា)'
      )
    ) {
      clearStoredFirebaseConfig();
      setCurrentConfig(null);
      setTestResult(null);
      setRawInput('');
      soundFx.playPop();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-orange-200/80 rounded-3xl p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
          <Cloud className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-black text-slate-800">
              Google Firebase Cloud Firestore (Real-Time Live Sync)
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              ឥតគិតថ្លៃ $0/ខែ
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            តភ្ជាប់ប្រព័ន្ធ POS ជាមួយ Google Cloud Firestore ដើម្បីឱ្យទូរសព្ទបុគ្គលិកទាំងអស់ និងកុំព្យូទ័រ Cashier ព្រមទាំងទូរសព្ទម្ចាស់ហាង អាច <strong>Sync ទិន្នន័យឃើញគ្នាភ្លាមៗក្នុងពេលជាក់ស្តែង (Live Real-Time)</strong> មិនខ្លាចបាត់ទិន្នន័យឡើយ។
          </p>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="p-5 rounded-3xl border bg-white shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                currentConfig
                  ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse'
                  : 'bg-slate-300'
              }`}
            />
            <div>
              <h5 className="text-sm font-black text-slate-800">
                {currentConfig ? '🟢 បានតភ្ជាប់ជាមួយ Google Firebase Cloud' : '⚪ មិនទាន់បានកំណត់ការតភ្ជាប់ (Local Mode)'}
              </h5>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-xs text-slate-500">
                  {currentConfig
                    ? `Project ID: ${currentConfig.projectId}`
                    : 'ប្រព័ន្ធកំពុងដំណើរការរក្សាទុកទិន្នន័យក្នុង Browser LocalStorage នៃឧបករណ៍នេះ'}
                </p>
                <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded">
                  Store ID: {getStoreId()} (Isolated)
                </span>
              </div>
            </div>
          </div>

          {currentConfig && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ផ្តាច់ការតភ្ជាប់ (Disconnect)</span>
            </button>
          )}
        </div>

        {/* If Connected: Actions & Sync Tools */}
        {currentConfig ? (
          <div className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Push local to cloud */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <h6 className="text-xs font-black text-emerald-900">
                    រុញទិន្នន័យបច្ចុប្បន្នឡើង Cloud (Push to Cloud)
                  </h6>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  បញ្ជូននំទាំងអស់ ({products.length} មុខ), ការលក់ ({sales.length} លើក), កុម្ម៉ង់ ({customOrders.length}), និងចំណាយ ({expenses.length}) ឡើងទៅ Google Cloud។
                </p>
                <button
                  type="button"
                  onClick={handlePushLocalToCloud}
                  disabled={isSyncingUp}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSyncingUp ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  <span>{isSyncingUp ? 'កំពុង Upload...' : 'Sync ទិន្នន័យឡើង Cloud ឥឡូវនេះ'}</span>
                </button>
              </div>

              {/* Pull cloud to local */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-indigo-600" />
                  <h6 className="text-xs font-black text-indigo-900">
                    ទាញទិន្នន័យពី Cloud មកវិញ (Pull from Cloud)
                  </h6>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  ទាញទិន្នន័យថ្មីបំផុតពី Google Cloud មកដាក់លើទូរសព្ទ ឬកុំព្យូទ័រនេះវិញ។
                </p>
                <button
                  type="button"
                  onClick={handlePullCloudToLocal}
                  disabled={isPulling}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isPulling ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <DownloadCloud className="w-4 h-4" />
                  )}
                  <span>{isPulling ? 'កំពុងទាញយក...' : 'ទាញទិន្នន័យពី Cloud មកវិញ'}</span>
                </button>
              </div>
            </div>

            {/* Sync Up Alert */}
            {syncUpResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  syncUpResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                {syncUpResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{syncUpResult.message}</p>
                  {syncUpResult.counts && (
                    <p className="mt-0.5 text-emerald-700">
                      នំ: {syncUpResult.counts.products} | ការលក់: {syncUpResult.counts.sales} | កុម្ម៉ង់: {syncUpResult.counts.orders} | ចំណាយ: {syncUpResult.counts.expenses}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pull Alert */}
            {pullResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  pullResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                {pullResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <p className="font-bold">{pullResult.message}</p>
              </div>
            )}
          </div>
        ) : (
          /* If Not Connected: Input Config Form */
          <div className="pt-4 space-y-4">
            {/* Quick Auto-Connect SweetBakery Cloud */}
            <div className="p-4 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-amber-500/10 border border-orange-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-slate-800">
                  ⚡ តភ្ជាប់ទៅកាន់ Google Cloud ផ្លូវការ (SweetBakery Cloud)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ចុចត្រង់នេះដើម្បីភ្ជាប់ទូរសព្ទ/ឧបករណ៍នេះទៅ Cloud រួមរបស់ហាងដោយស្វ័យប្រវត្តិ មិនបាច់ចម្លងកូដឡើយ។
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-xl text-xs font-black shadow-md shadow-orange-500/20 whitespace-nowrap cursor-pointer transition-all"
              >
                តភ្ជាប់ Cloud ស្វ័យប្រវត្តិ (Auto-Connect)
              </button>
            </div>

            <form onSubmit={handleConnectFromInput} className="space-y-4">
              {!showManualFields ? (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>បិទភ្ជាប់កូដ Firebase Config (Paste Configuration Snippet)</span>
                    <button
                      type="button"
                      onClick={() => setShowManualFields(true)}
                      className="text-pink-600 hover:text-pink-700 font-bold hover:underline cursor-pointer"
                    >
                      បញ្ចូលតាមប្រអប់នីមួយៗ (Manual Fields)
                    </button>
                  </label>
                  <textarea
                    rows={6}
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder={`ឧទាហរណ៍ ចម្លងពី Google Console មកបិទភ្ជាប់៖\nconst firebaseConfig = {\n  apiKey: "AIzaSyD-xxxxx",\n  authDomain: "sweetbakery-pos.firebaseapp.com",\n  projectId: "sweetbakery-pos",\n  storageBucket: "sweetbakery-pos.firebasestorage.app",\n  messagingSenderId: "123456789",\n  appId: "1:123456789:web:xxxxx"\n};`}
                    className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    💡 ប្រព័ន្ធនឹងស្រង់យក apiKey, projectId, authDomain ដោយស្វ័យប្រវត្តិ។
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700">បញ្ចូលព័ត៌មានលម្អិត</span>
                    <button
                      type="button"
                      onClick={() => setShowManualFields(false)}
                      className="text-pink-600 hover:text-pink-700 text-xs font-bold hover:underline cursor-pointer"
                    >
                      បិទភ្ជាប់កូដទាំងមូល (Quick Paste)
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">API Key *</label>
                      <input
                        type="text"
                        required
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Project ID *</label>
                      <input
                        type="text"
                        required
                        value={projectIdInput}
                        onChange={(e) => setProjectIdInput(e.target.value)}
                        placeholder="sweetbakery-pos"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">App ID</label>
                      <input
                        type="text"
                        value={appIdInput}
                        onChange={(e) => setAppIdInput(e.target.value)}
                        placeholder="1:123456789:web:..."
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Auth Domain</label>
                      <input
                        type="text"
                        value={authDomainInput}
                        onChange={(e) => setAuthDomainInput(e.target.value)}
                        placeholder="sweetbakery-pos.firebaseapp.com"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Alert */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{testResult.message}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isTesting}
                className="py-3 px-6 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-2xl text-xs font-black shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>{isTesting ? 'កំពុងតេស្តការតភ្ជាប់...' : 'តេស្តការតភ្ជាប់ & រក្សាទុក (Connect to Cloud)'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Step-by-Step Tutorial Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-orange-500" />
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              របៀបបង្កើត Google Firebase Project ដោយឥតគិតថ្លៃ ($0) ក្នុងរយៈពេល ២ នាទី
            </h5>
          </div>
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline"
          >
            <span>បើក Google Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-slate-600">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[10px]">
              1
            </span>
            <p className="font-bold text-slate-800">បង្កើត Project</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ចូល <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-orange-600 underline">console.firebase.google.com</a> ដោយប្រើ Gmail រួចចុច <strong>Add project</strong> (ដាក់ឈ្មោះ <strong>SweetBakery</strong>)។
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[10px]">
              2
            </span>
            <p className="font-bold text-slate-800">បង្កើត Firestore</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ក្នុងម៉ឺនុយឆ្វេង ចុច <strong>Build &gt; Firestore Database</strong> &gt; ចុច <strong>Create Database</strong> &gt; ជ្រើសរើស <strong>Start in test mode</strong>។
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[10px]">
              3
            </span>
            <p className="font-bold text-slate-800">បន្ថែម Web App</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ចុច <strong>Project Settings ⚙️</strong> &gt; អូសចុះក្រោមចុចសញ្ញា <strong>&lt;/&gt; (Web App)</strong> &gt; ដាក់ឈ្មោះ "POS" រួចចុច Register app។
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[10px]">
              4
            </span>
            <p className="font-bold text-slate-800">Copy &amp; Paste</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ចម្លងកូដ <code>const firebaseConfig = &#123; ... &#125;;</code> យកមកបិទភ្ជាប់ក្នុងប្រអប់ខាងលើ រួចចុច "តេស្ត &amp; រក្សាទុក" ជាការស្រេច!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
