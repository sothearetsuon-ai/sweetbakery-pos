import React, { useState, useEffect } from 'react';
import {
  Rocket,
  CheckCircle2,
  RefreshCw,
  Download,
  Smartphone,
  Monitor,
  Globe,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileCode2,
  Check,
  Volume2,
  QrCode,
  FileArchive,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';
import { khmerVoiceSoundbox } from '../../utils/khmerVoice';
import {
  CURRENT_APP_VERSION,
  CURRENT_BUILD_DATE,
  isAndroidNativeApp,
  isDesktopElectronApp,
  isElectronWindowsApp,
  isWindowsPlatform,
  isIOSDevice,
  isAndroidDevice,
  getNativeAppVersion,
  checkForAppUpdates,
  triggerInAppAndroidUpdate,
  triggerInAppDesktopUpdate,
  getStoredUpdateUrl,
  setStoredUpdateUrl,
  AppUpdateInfo,
  openExternalUrl,
} from '../../services/appUpdateService';

export const AppUpdateTab: React.FC = () => {
  const [currentVersion] = useState(getNativeAppVersion());
  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDesktopUpdating, setIsDesktopUpdating] = useState(false);
  const [desktopProgress, setDesktopProgress] = useState<{ percent: number; downloadedMB: string; totalMB: string } | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [customApkUrl, setCustomApkUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manifestUrlInput, setManifestUrlInput] = useState(getStoredUpdateUrl());
  const [copiedUrl, setCopiedUrl] = useState(false);

  const isAndroidNative = isAndroidNativeApp();
  const isAndroid = isAndroidDevice();
  const isDesktop = isDesktopElectronApp();
  const isWindows = isWindowsPlatform();
  const isIOS = isIOSDevice();

  // Listen to Android native progress callbacks
  useEffect(() => {
    (window as any).onUpdateDownloadStart = () => {
      setIsDownloading(true);
      setDownloadProgress(0);
    };

    (window as any).onUpdateDownloadProgress = (percent: number) => {
      setIsDownloading(true);
      setDownloadProgress(percent);
    };

    (window as any).onUpdateDownloadComplete = () => {
      setIsDownloading(false);
      setDownloadProgress(100);
      soundFx.playSuccess();
      confetti({ particleCount: 70, spread: 70 });
    };

    (window as any).onUpdateDownloadError = (msg: string) => {
      setIsDownloading(false);
      setDownloadProgress(null);
      alert('កំហុសពេលទាញយកកំណែថ្មី៖ ' + msg);
    };

    return () => {
      delete (window as any).onUpdateDownloadStart;
      delete (window as any).onUpdateDownloadProgress;
      delete (window as any).onUpdateDownloadComplete;
      delete (window as any).onUpdateDownloadError;
    };
  }, []);

  // Automatically check for updates whenever the tab opens
  useEffect(() => {
    handleCheckUpdate();
  }, []);

  const handleCheckUpdate = async () => {
    soundFx.playPop();
    setIsChecking(true);
    setHasChecked(false);
    try {
      const res = await checkForAppUpdates();
      setUpdateInfo(res);
      setHasChecked(true);
      if (res.hasUpdate) {
        soundFx.playSuccess();
        confetti({ particleCount: 60, spread: 60 });
      } else {
        soundFx.playPop();
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleStartUpdate = (urlToUse?: string) => {
    soundFx.playPop();
    const apkUrl =
      urlToUse ||
      customApkUrl.trim() ||
      updateInfo?.apkDownloadUrl ||
      'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.6.6/SweetBakery-Android.apk';

    if (isAndroidNative) {
      setIsDownloading(true);
      setDownloadProgress(0);
      const started = triggerInAppAndroidUpdate(apkUrl);
      if (!started) {
        window.location.href = apkUrl;
      }
    } else if (isAndroid) {
      window.location.href = apkUrl;
    } else if (isDesktop) {
      handleOneClickDesktopUpdate();
    } else {
      handleDownloadWindows();
    }
  };

  const handleOneClickDesktopUpdate = () => {
    soundFx.playPop();
    const winUrl =
      updateInfo?.windowsInstallerUrl ||
      updateInfo?.windowsDownloadUrl ||
      'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Setup.exe';

    if (isDesktop) {
      setIsDesktopUpdating(true);
      setIsRestarting(false);
      setDesktopProgress({ percent: 0, downloadedMB: '0', totalMB: '...' });

      const started = triggerInAppDesktopUpdate(
        winUrl,
        (progress) => {
          setDesktopProgress(progress);
        },
        () => {
          setIsRestarting(true);
          soundFx.playSuccess();
          confetti({ particleCount: 90, spread: 80 });
        },
        (err) => {
          setIsDesktopUpdating(false);
          setDesktopProgress(null);
          // Automatically fallback to browser download so user is never blocked
          handleDownloadWindows();
        }
      );

      if (!started) {
        handleDownloadWindows();
      }
    } else {
      handleDownloadWindows();
    }
  };

  const handleDownloadWindows = () => {
    soundFx.playSuccess();
    const winUrl =
      updateInfo?.windowsInstallerUrl ||
      updateInfo?.windowsDownloadUrl ||
      'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.6.6/SweetBakery-POS-Setup.exe';
    openExternalUrl(winUrl);
  };

  const handleDownloadAndroid = () => {
    soundFx.playSuccess();
    const apkUrl =
      updateInfo?.apkDownloadUrl ||
      'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.6.6/SweetBakery-Android.apk';
    if (isAndroidNative) {
      handleStartUpdate(apkUrl);
    } else {
      openExternalUrl(apkUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 border-2 border-pink-200/90 rounded-3xl p-5 sm:p-6 flex items-start gap-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
          <Rocket className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base sm:text-lg font-black text-slate-800">
              ប្រព័ន្ធអាប់ដែតកម្មវិធីក្នុង App ផ្ទាល់ (In-App Auto Update)
            </h4>
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-pink-100 text-pink-800 border border-pink-300">
              v{currentVersion}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
            ពិនិត្យមើលកំណែថ្មី និងទាញយកមកដំឡើងលើទូរសព្ទដៃ ឬកុំព្យូទ័រដោយផ្ទាល់ <strong>ដោយមិនបាច់លុប App ចាស់ចោលឡើយ (Safe In-Place Update)</strong> ទិន្នន័យទាំងអស់នឹងនៅរក្សាដដែល ១០០%។
          </p>
        </div>
      </div>

      {/* Device & Version Status Card */}
      <div className="p-5 sm:p-6 rounded-3xl border-2 border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              {isIOS ? (
                <Smartphone className="w-5 h-5 text-purple-600" />
              ) : isAndroid ? (
                <Smartphone className="w-5 h-5 text-emerald-600" />
              ) : isWindows ? (
                <Monitor className="w-5 h-5 text-blue-600" />
              ) : (
                <Globe className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm sm:text-base font-black text-slate-800">
                  {isIOS
                    ? '🍎 ទូរសព្ទ iPhone / iPad (Apple iOS PWA)'
                    : isAndroidNative
                    ? '📱 កម្មវិធីទូរសព្ទ Android (Native In-App Update)'
                    : isAndroid
                    ? '📱 ទូរសព្ទ Android (Chrome / Web Browser)'
                    : isDesktop
                    ? '💻 កម្មវិធីកុំព្យូទ័រ Windows (Desktop 1-Click Update)'
                    : isWindows
                    ? '💻 កុំព្យូទ័រ Windows (Web App)'
                    : '🌐 កម្មវិធី Web App / PWA'}
                </h5>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                កំណែបច្ចុប្បន្ន៖ <strong className="text-slate-800 font-mono">v{currentVersion}</strong> (Build: {CURRENT_BUILD_DATE})
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCheckUpdate}
              disabled={isChecking || isDownloading || isDesktopUpdating}
              className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 border border-slate-300"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'កំពុងពិនិត្យ...' : '🔄 ពិនិត្យកំណែថ្មី'}</span>
            </button>

            {/* 1-Click Windows Telegram-style Update Button */}
            <button
              type="button"
              onClick={handleOneClickDesktopUpdate}
              disabled={isDesktopUpdating || isDownloading}
              className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Monitor className="w-4 h-4" />
              <span>{isDesktop ? '💻 អាប់ដេត Windows (1-Click)' : '💻 ទាញយក Windows Setup'}</span>
            </button>

            {/* Direct Android Update Button */}
            <button
              type="button"
              onClick={handleDownloadAndroid}
              disabled={isDownloading || isDesktopUpdating}
              className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-pink-600 via-rose-500 to-red-600 hover:from-pink-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 Update Android</span>
            </button>
          </div>
        </div>

        {/* Live Download Progress on Windows Desktop (Telegram-style) */}
        {isDesktopUpdating && (
          <div className="p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-3xl space-y-3 shadow-md animate-in fade-in">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-blue-950">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <span>
                  {isRestarting
                    ? '🚀 ទាញយករួចរាល់! កម្មវិធីកំពុងដំឡើង និងចាប់ផ្ដើមឡើងវិញដោយស្វ័យប្រវត្តិក្នង ២ វិនាទី...'
                    : 'កំពុងទាញយកកំណែថ្មីស្វ័យប្រវត្តិតាមរបៀប Telegram (Silent Background Download)...'}
                </span>
              </span>
              <span className="font-mono text-base font-black text-blue-700">
                {desktopProgress?.percent ?? 0}%
              </span>
            </div>
            <div className="w-full h-3.5 bg-white rounded-full overflow-hidden border border-blue-200 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300"
                style={{ width: `${desktopProgress?.percent ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 font-medium flex-wrap gap-2">
              <span>ទំហំទាញយក៖ <strong>{desktopProgress?.downloadedMB || '0'} MB</strong> / {desktopProgress?.totalMB || '...'} MB</span>
              <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                ✨ មិនបាច់ចុច Next ទេ កម្មវិធីនឹង Relaunch ដោយខ្លួនឯង
              </span>
            </div>
          </div>
        )}

        {/* Live Download Progress on Android */}
        {isDownloading && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-pink-900">
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-pink-600 animate-bounce" />
                <span>កំពុងទាញយកឯកសារអាប់ដែតថ្មី...</span>
              </span>
              <span className="font-mono text-base">{downloadProgress ?? 0}%</span>
            </div>
            <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden border border-pink-200">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-200"
                style={{ width: `${downloadProgress ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              💡 នៅពេលទាញយករួច ប្រព័ន្ធ Android នឹងបង្ហាញផ្ទាំងមួយភ្លាមៗ សូមចុចពាក្យ <strong>«Update»</strong> ដើម្បីបញ្ចប់។
            </p>
          </div>
        )}

        {/* Check Result Card */}
        {hasChecked && updateInfo && (
          <div className="space-y-4 pt-2">
            {updateInfo.hasUpdate ? (
              <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h6 className="text-sm sm:text-base font-black text-amber-950">
                      🎉 រកឃើញកំណែថ្មី៖ v{updateInfo.latestVersion}
                    </h6>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    ចេញផ្សាយ៖ {updateInfo.releaseDate}
                  </span>
                </div>

                {updateInfo.releaseNotes && updateInfo.releaseNotes.length > 0 && (
                  <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200 space-y-1.5">
                    <p className="text-xs sm:text-sm font-black text-slate-700">📋 កំណត់ត្រាកែលម្អ (What's New)៖</p>
                    <ul className="text-xs sm:text-sm text-slate-600 space-y-1 list-disc list-inside font-medium">
                      {updateInfo.releaseNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOneClickDesktopUpdate}
                    disabled={isDesktopUpdating || isDownloading}
                    className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Monitor className="w-5 h-5" />
                    <span>{isDesktop ? '💻 អាប់ដេត Windows 1-Click (ដូច Telegram)' : '💻 ទាញយក Windows Setup (.exe)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadAndroid}
                    disabled={isDownloading || isDesktopUpdating}
                    className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>📱 អាប់ដែត Android 1-Click (.apk)</span>
                  </button>
                </div>

                {isDesktop && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadWindows}
                      className="text-xs text-blue-600 hover:text-blue-800 underline font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ប្រសិនបើបណ្តាញយឺត ឬមិនដំណើរការ៖ ចុចទីនេះដើម្បីទាញយក Setup ដំឡើងតាម Browser</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 sm:p-5 bg-emerald-50/80 border-2 border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h6 className="text-sm sm:text-base font-black text-emerald-900">
                      ✅ លោកអ្នកកំពុងប្រើប្រាស់កំណែចុងក្រោយបំផុតហើយ!
                    </h6>
                    <p className="text-xs sm:text-sm text-emerald-700 mt-0.5 font-medium">
                      SweetBakery POS v{currentVersion} ដំណើរការដោយរលូន និងមានសុវត្ថិភាពខ្ពស់។
                    </p>
                  </div>
                </div>

                {updateInfo.releaseNotes && updateInfo.releaseNotes.length > 0 && (
                  <div className="bg-white/95 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5 shadow-2xs">
                    <p className="text-xs sm:text-sm font-black text-slate-700 flex items-center gap-1.5">
                      <span>📋</span>
                      <span>មុខងារថ្មីៗក្នុងកំណែ v{updateInfo.latestVersion || currentVersion} (What's New)៖</span>
                    </p>
                    <ul className="text-xs sm:text-sm text-slate-600 space-y-1 list-disc list-inside font-medium">
                      {updateInfo.releaseNotes.map((note, idx) => (
                        <li key={idx} className="leading-relaxed">{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row items-center gap-2.5">
                  <span className="text-xs font-bold text-slate-600">ចង់ទាញយកដំឡើងឡើងវិញ?</span>
                  <a
                    href={updateInfo?.apkDownloadUrl || 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.6.6/SweetBakery-Android.apk'}
                    target="_blank"
                    rel="noreferrer"
                    download="SweetBakery-Android.apk"
                    onClick={() => soundFx.playSuccess()}
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs text-center"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>📱 ទាញយក APK (v{updateInfo.latestVersion || CURRENT_APP_VERSION})</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleDownloadWindows}
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>💻 ទាញយក Windows Setup</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Direct App Package Downloads Card */}
      <div className="p-5 sm:p-6 rounded-3xl border-2 border-pink-200/90 bg-gradient-to-br from-pink-50/50 via-white to-purple-50/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
              <Download className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h5 className="text-sm sm:text-base font-black text-slate-800">
                📥 ទាញយកឯកសារដំឡើងកម្មវិធីផ្ទាល់ (Direct App Downloads)
              </h5>
              <p className="text-xs text-slate-500 font-medium">
                ទាញយកឯកសារ APK សម្រាប់ទូរសព្ទ ឬ Setup សម្រាប់កុំព្យូទ័រដោយផ្ទាល់ពីក្នុង App
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
            v{currentVersion} រួចរាល់
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Android APK Card */}
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span>📱 ទូរសព្ទ Android (SweetBakery-Android.apk)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                ទំហំ៖ <strong>~9.1 MB</strong> | ដំណើរការលើ Android 7.0 ឡើងទៅ មានប្រព័ន្ធសំឡេងប្រកាស KHQR Soundbox ភាសាខ្មែរភ្ជាប់មកស្រាប់។
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={updateInfo?.apkDownloadUrl || 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.6.6/SweetBakery-Android.apk'}
                target="_blank"
                rel="noreferrer"
                download="SweetBakery-Android.apk"
                onClick={() => soundFx.playSuccess()}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer active:scale-95 text-center"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>📥 ទាញយក APK ដោយផ្ទាល់ (SweetBakery-Android.apk v{updateInfo?.latestVersion || CURRENT_APP_VERSION})</span>
              </a>

              <a
                href="https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/tag/v1.6.6"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-300 cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>មើលទំព័រ GitHub Release v1.6.6 ផ្លូវការ</span>
              </a>
            </div>
          </div>

          {/* Windows Desktop App Card */}
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                <Monitor className="w-5 h-5 text-blue-600" />
                <span>💻 កុំព្យូទ័រ Windows (SweetBakery-POS-Setup.exe)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                ទំហំ៖ <strong>Windows Official Installer</strong> | កម្មវិធីដំឡើងស្តង់ដារ Windows ដំឡើងម្តងប្រើបានរហូត មិនបាត់ពេល restart ឡើយ។
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadWindows}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>📥 ទាញយក Windows Setup (SweetBakery-POS-Setup.exe v{updateInfo?.latestVersion || CURRENT_APP_VERSION})</span>
              </button>

              <a
                href="https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.6.6/SweetBakery-POS-Windows.zip"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-300 cursor-pointer active:scale-95"
              >
                <FileArchive className="w-3.5 h-3.5 text-slate-500" />
                <span>ទាញយក Windows Portable (.zip) v{updateInfo?.latestVersion || CURRENT_APP_VERSION}</span>
              </a>
            </div>
          </div>

          {/* Apple iOS (iPhone & iPad) PWA Card */}
          <div className="p-4 bg-white rounded-2xl border-2 border-purple-200 shadow-xs space-y-3 flex flex-col justify-between md:col-span-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span>🍎 សម្រាប់ទូរសព្ទ iPhone / iPad (Apple iOS)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Apple មិនអនុញ្ញាតឱ្យដំឡើង file ពីក្រៅដូច Android ឡើយ។ ប៉ុន្តែបងអាចដំឡើងប្រើប្រាស់ជា <strong>PWA (Add to Home Screen)</strong> ពេញអេក្រង់ Full Screen ដូច App ពិតៗ និង <strong>Auto-Update ស្វ័យប្រវត្តិតាម Cloud គ្រប់ពេលបើក (មិនបាច់ដំឡើង file អ្វីឡើយ)</strong>៖
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-900 block mb-0.5">ជំហាន ១</span>
                <span className="text-slate-600">បើក <strong>Safari</strong> លើ iPhone</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-900 block mb-0.5">ជំហាន ២</span>
                <span className="text-slate-600 truncate block">ចូល <code>sothearetsuon-ai.github.io/sweetbakery-pos</code></span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-900 block mb-0.5">ជំហាន ៣</span>
                <span className="text-slate-600">ចុចប៊ូតុង <strong>Share</strong> (សញ្ញា 📤)</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-900 block mb-0.5">ជំហាន ៤</span>
                <span className="text-slate-600">ចុច <strong>Add to Home Screen ➕</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  navigator.clipboard.writeText('https://sothearetsuon-ai.github.io/sweetbakery-pos/');
                  alert('បានចម្លង Link សម្រាប់បើកក្នុង Safari លើ iPhone ជោគជ័យ! ✅\nhttps://sothearetsuon-ai.github.io/sweetbakery-pos/');
                }}
                className="w-full sm:flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>📋 ចម្លង Cloud Link សម្រាប់ iPhone / iPad</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scan QR Code to Download on Phone */}
        <div className="p-4 bg-white/90 rounded-2xl border border-pink-200 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 p-1.5 bg-white rounded-xl border-2 border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-Android.apk'
              )}`}
              alt="Scan QR to Download APK"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm font-black text-slate-800">
              <QrCode className="w-4 h-4 text-pink-600" />
              <span>ស្កេន QR Code លើកញ្ចក់អេក្រង់ ដើម្បីទាញយក APK ចូលទូរសព្ទ</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              លោកអ្នកគ្រាន់តែបើកកាមេរ៉ាទូរសព្ទ រួចចង្អុលមកកាន់ QR Code នេះ នោះទូរសព្ទនឹងទាញយក <strong>SweetBakery-Android.apk</strong> មកដំឡើងភ្លាមៗ!
            </p>
          </div>
        </div>
      </div>

      {/* Quick Soundbox Test Row */}
      <div className="p-5 sm:p-6 rounded-3xl border-2 border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-rose-600" />
            <h5 className="text-xs sm:text-sm font-black text-slate-800">
              🔔 សាកល្បងសំឡេងប្រកាស KHQR Soundbox ភាសាខ្មែរ (Soundbox Test)
            </h5>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            Offline Khmer Audio Ready
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          ចុចប៊ូតុងខាងក្រោមដើម្បីសាកល្បងសំឡេងកណ្តឹង និងសំឡេងមនុស្សស្រីប្រកាសជាភាសាខ្មែរ <strong>«ទទួលបានប្រាក់...»</strong> លើឧបករណ៍របស់អ្នក៖
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              khmerVoiceSoundbox.announcePayment(10000, 'KHR', 'ABA KHQR');
              confetti({ particleCount: 30, spread: 45 });
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>តេស្ត ១០,០០០ រៀល (ABA)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              khmerVoiceSoundbox.announcePayment(25000, 'KHR', 'ACLEDA KHQR');
              confetti({ particleCount: 30, spread: 45 });
            }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>តេស្ត ២៥,០០០ រៀល (ACLEDA)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              khmerVoiceSoundbox.announcePayment(5, 'USD', 'Bakong KHQR');
              confetti({ particleCount: 30, spread: 45 });
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>តេស្ត $5.00 ដុល្លារ (Bakong)</span>
          </button>
        </div>
      </div>

      {/* Manual / Direct APK URL In-App Installer */}
      <div className="p-5 sm:p-6 rounded-3xl border-2 border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
            <Download className="w-4 h-4 text-pink-600" />
            <span>អាប់ដែតរហ័សតាមរយៈ Link ផ្ទាល់ (Direct APK In-App Installer)</span>
          </h5>
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-xs text-pink-600 font-bold hover:underline cursor-pointer"
          >
            {showAdvanced ? 'លាក់ជម្រើស' : 'ជម្រើសបន្ថែម'}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          ប្រសិនបើលោកអ្នកមាន Link APK ថ្មីពី Admin ឬ Server ផ្ទាល់ លោកអ្នកគ្រាន់តែបិទភ្ជាប់ Link នោះនៅខាងក្រោម រួចចុច «អាប់ដែតឥឡូវនេះ» ប្រព័ន្ធនឹងទាញយកមកដំឡើងក្នុង App ភ្លាមៗ៖
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <input
            type="url"
            value={customApkUrl}
            onChange={(e) => setCustomApkUrl(e.target.value)}
            placeholder="ឧ. https://example.com/SweetBakery-Android.apk"
            className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 text-xs sm:text-sm border-2 border-slate-200 rounded-xl font-mono focus:outline-none focus:border-pink-500"
          />
          <button
            type="button"
            onClick={() => handleStartUpdate(customApkUrl)}
            disabled={!customApkUrl.trim() || isDownloading}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>អាប់ដែតតាម Link នេះ</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <label className="block font-bold text-slate-700">
              Update Manifest Server URL (កន្លែងពិនិត្យកំណែថ្មីស្វ័យប្រវត្ត)៖
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={manifestUrlInput}
                onChange={(e) => setManifestUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono text-slate-700"
              />
              <button
                type="button"
                onClick={() => {
                  setStoredUpdateUrl(manifestUrlInput);
                  soundFx.playPop();
                  alert('បានរក្សាទុក Update Server URL រួចរាល់!');
                }}
                className="px-3 py-2 bg-slate-800 text-white rounded-lg font-bold"
              >
                រក្សាទុក
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Safety Instructions Card */}
      <div className="bg-slate-50 border-2 border-slate-200/90 rounded-3xl p-5 space-y-3">
        <h5 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>ការធានាសុវត្ថិភាពទិន្នន័យពេលអាប់ដែត (Data Safety Guarantee)</span>
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-600 font-medium">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block">១. មិនបាត់បង់ទិន្នន័យ</span>
            <p className="text-xs text-slate-500">មុខទំនិញ, ប្រវត្តិលក់, និងចំណាយ រក្សាទុកដដែល ១០០% មិនរលុបឡើយ។</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block">២. មិនបាច់លុប App ចាស់</span>
            <p className="text-xs text-slate-500">ប្រព័ន្ធនឹងជំនួសកូដចាស់ដោយស្វ័យប្រវត្តិ មិនបាច់ Uninstall ចោលទេ។</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block">៣. Sync Cloud ជាប់ជានិច្ច</span>
            <p className="text-xs text-slate-500">បើភ្ជាប់ Google Firebase ទិន្នន័យទាំងអស់នៅតែ Sync ឃើញគ្នាធម្មតា។</p>
          </div>
        </div>
      </div>
    </div>
  );
};
