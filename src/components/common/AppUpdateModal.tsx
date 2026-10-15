import React, { useState, useEffect } from 'react';
import {
  Rocket,
  CheckCircle2,
  Download,
  Smartphone,
  Monitor,
  Globe,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
  RefreshCw,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';
import {
  AppUpdateInfo,
  isAndroidNativeApp,
  isDesktopElectronApp,
  isWindowsPlatform,
  isAndroidDevice,
  triggerInAppAndroidUpdate,
  triggerInAppDesktopUpdate,
  openExternalUrl,
  getNativeAppVersion,
  isVersionNewer,
  CURRENT_BUILD_DATE,
} from '../../services/appUpdateService';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: AppUpdateInfo | null;
  onCheckAgain?: () => Promise<any> | void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onCheckAgain,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [desktopStats, setDesktopStats] = useState<{ downloadedMB: string; totalMB: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCheckingAgain, setIsCheckingAgain] = useState(false);

  const isAndroidNative = isAndroidNativeApp();
  const isAndroid = isAndroidDevice();
  const isDesktop = isDesktopElectronApp();
  const isWindows = isWindowsPlatform();

  // Listen for Android Native Download callbacks
  useEffect(() => {
    (window as any).onUpdateDownloadStart = () => {
      setIsDownloading(true);
      setDownloadProgress(0);
      setStatusMessage('កំពុងចាប់ផ្តើមទាញយកឯកសារ APK...');
    };

    (window as any).onUpdateDownloadProgress = (percent: number) => {
      setIsDownloading(true);
      setDownloadProgress(percent);
      setStatusMessage(`កំពុងទាញយក... ${percent}%`);
    };

    (window as any).onUpdateDownloadComplete = () => {
      setIsDownloading(false);
      setDownloadProgress(100);
      setStatusMessage('ទាញយករួចរាល់ ១០០%! កំពុងបើកផ្ទាំងដំឡើង...');
      soundFx.playSuccess();
      confetti({ particleCount: 80, spread: 70 });
    };

    (window as any).onUpdateDownloadError = (msg: string) => {
      setIsDownloading(false);
      setDownloadProgress(null);
      setStatusMessage(`កំហុស៖ ${msg}`);
      soundFx.playChime();
    };

    return () => {
      delete (window as any).onUpdateDownloadStart;
      delete (window as any).onUpdateDownloadProgress;
      delete (window as any).onUpdateDownloadComplete;
      delete (window as any).onUpdateDownloadError;
    };
  }, []);

  // Auto-check for updates if modal is opened without updateInfo
  useEffect(() => {
    if (isOpen && !updateInfo && onCheckAgain) {
      onCheckAgain();
    }
  }, [isOpen, updateInfo, onCheckAgain]);

  if (!isOpen) return null;

  const currentVersion = updateInfo?.currentVersion || getNativeAppVersion();
  const latestVersion = updateInfo?.latestVersion || '1.3.0';
  const releaseDate = updateInfo?.releaseDate || CURRENT_BUILD_DATE;
  const hasUpdate = updateInfo ? updateInfo.hasUpdate : isVersionNewer(latestVersion, currentVersion);

  const releaseNotes = updateInfo?.releaseNotes?.length
    ? updateInfo.releaseNotes
    : [
        'ប្រព័ន្ធអាប់ដេតស្វ័យប្រវត្តិកម្រិតស្តង់ដារ (Standard In-App Auto-Update)',
        'បង្ហាញដំណឹងកំណែថ្មីច្បាស់លាស់ទាំងលើ Windows និង Android',
        'ដំណើរការទាញយករលូន និងសុវត្ថិភាពខ្ពស់',
      ];

  const apkUrl =
    updateInfo?.apkDownloadUrl ||
    'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-Android.apk';
  const winUrl =
    updateInfo?.windowsInstallerUrl ||
    updateInfo?.windowsDownloadUrl ||
    'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Setup.exe';

  const handleStartUpdate = () => {
    soundFx.playSuccess();
    confetti({ particleCount: 50, spread: 60 });

    if (isDesktop) {
      // 1-Click Silent Desktop Update
      setIsDownloading(true);
      setDownloadProgress(0);
      setStatusMessage('កំពុងទាញយកកំណែអាប់ដេត Windows Setup...');

      const started = triggerInAppDesktopUpdate(
        winUrl,
        (progress) => {
          setDownloadProgress(progress.percent);
          setDesktopStats({
            downloadedMB: progress.downloadedMB,
            totalMB: progress.totalMB,
          });
          setStatusMessage(`កំពុងទាញយក... ${progress.percent}% (${progress.downloadedMB}MB / ${progress.totalMB}MB)`);
        },
        () => {
          setIsDownloading(false);
          setDownloadProgress(100);
          setStatusMessage('ទាញយករួចរាល់! កំពុងដំឡើង និងចាប់ផ្តើមកម្មវិធីឡើងវិញ...');
          soundFx.playSuccess();
          confetti({ particleCount: 90, spread: 80 });
        },
        (error) => {
          setIsDownloading(false);
          setDownloadProgress(null);
          setStatusMessage(`ការទាញយកស្វ័យប្រវត្តិមានបញ្ហា។ កំពុងបើក Browser...`);
          openExternalUrl(winUrl);
        }
      );

      if (!started) {
        openExternalUrl(winUrl);
        setIsDownloading(false);
      }
    } else if (isAndroidNative) {
      // Native Android Container
      setIsDownloading(true);
      setDownloadProgress(0);
      setStatusMessage('កំពុងទាញយក SweetBakery-Android.apk...');

      const started = triggerInAppAndroidUpdate(apkUrl);
      if (!started) {
        openExternalUrl(apkUrl);
        setIsDownloading(false);
      }
    } else if (isAndroid) {
      // Android Browser / PWA
      setIsDownloading(true);
      setStatusMessage('កំពុងបញ្ជូនទៅទាញយកឯកសារ APK តាម Browser...');
      openExternalUrl(apkUrl);
      setTimeout(() => {
        setIsDownloading(false);
        setStatusMessage('សូមចុចលើ File APK ដែលបានទាញយកដើម្បីដំឡើង!');
      }, 2000);
    } else if (isWindows) {
      // Windows Browser / Web
      setIsDownloading(true);
      setStatusMessage('កំពុងទាញយក SweetBakery-POS-Setup.exe...');
      openExternalUrl(winUrl);
      setTimeout(() => {
        setIsDownloading(false);
        setStatusMessage('សូមបើកឯកសារ SweetBakery-POS-Setup.exe ដើម្បីដំឡើង!');
      }, 2000);
    } else {
      // General Web
      window.location.reload();
    }
  };

  const handleCopyLink = () => {
    soundFx.playPop();
    const link = isAndroid ? apkUrl : winUrl;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRefreshCheck = async () => {
    if (!onCheckAgain || isCheckingAgain) return;
    soundFx.playPop();
    setIsCheckingAgain(true);
    try {
      await onCheckAgain();
    } finally {
      setIsCheckingAgain(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header with Radiant Gradient */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white shrink-0 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shadow-pink-900/20 shrink-0">
                <Rocket className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white font-battambang">
                    {hasUpdate ? 'មានកំណែអាប់ដេតថ្មី!' : 'ប្រព័ន្ធដំណើរការកំណែចុងក្រោយ'}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs uppercase tracking-wider ${
                    hasUpdate ? 'bg-amber-300 text-amber-950' : 'bg-emerald-300 text-emerald-950'
                  }`}>
                    {hasUpdate ? 'New Update' : 'Up to Date'}
                  </span>
                </div>
                <p className="text-xs text-pink-100/90 font-medium mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>SweetBakery POS • កំណែស្តង់ដារចុងក្រោយ</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="បិទ (Close)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Version Comparison Badges */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-pink-100">កំណែបច្ចុប្បន្ន៖</span>
              <span className="px-2 py-0.5 rounded-lg bg-black/20 text-white font-mono font-bold text-[11px]">
                v{currentVersion}
              </span>
            </div>
            {hasUpdate ? (
              <div className="flex items-center gap-2">
                <span className="text-pink-200 font-black">➔</span>
                <span className="text-[11px] text-pink-100">កំណែថ្មី៖</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white text-rose-600 font-mono font-black text-xs shadow-md">
                  v{latestVersion}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-emerald-200 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>កំណែចុងក្រោយបំផុត (v{currentVersion})</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Platform Status Badge */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              {isDesktop ? (
                <Monitor className="w-4 h-4 text-indigo-600 shrink-0" />
              ) : isAndroid ? (
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>
                {isDesktop
                  ? 'Windows App (គាំទ្រការអាប់ដេតស្ងាត់ 1-Click)'
                  : isAndroidNative
                  ? 'Android Native App (ដំឡើង APK ស្វ័យប្រវត្តិ)'
                  : isAndroid
                  ? 'Android Browser (ទាញយក APK ផ្ទាល់)'
                  : 'Web / Desktop Browser'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {releaseDate}
            </span>
          </div>

          {/* Release Notes / What's New */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>មុខងារថ្មីៗ & ការកែលម្អ (What's New)</span>
            </h4>
            <div className="bg-rose-50/50 rounded-2xl p-3.5 border border-rose-100/80 space-y-2">
              {releaseNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <div className="w-4 h-4 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                    ✓
                  </div>
                  <span className="flex-1 font-medium">{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Progress Bar (When Active) */}
          {isDownloading && (
            <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                  <span>{statusMessage || 'កំពុងទាញយក...'}</span>
                </span>
                <span className="font-mono font-black text-pink-600 text-sm">
                  {downloadProgress !== null ? `${downloadProgress}%` : '...'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${Math.max(5, downloadProgress || 0)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              {desktopStats && (
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>ទាញយកបាន: {desktopStats.downloadedMB} MB</span>
                  <span>ទំហំសរុប: {desktopStats.totalMB} MB</span>
                </div>
              )}
            </div>
          )}

          {/* Fallback Direct Download Option */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>សុវត្ថិភាពខ្ពស់ពី GitHub Official</span>
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-pink-600 hover:text-pink-700 font-bold hover:underline cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'បានចម្លង Link!' : 'ចម្លង Link ទាញយក'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            បិទ (ទុកពេលក្រោយ)
          </button>

          <div className="flex items-center gap-2">
            {onCheckAgain && (
              <button
                type="button"
                disabled={isCheckingAgain || isDownloading}
                onClick={handleRefreshCheck}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="ពិនិត្យមើលកំណែថ្មីឡើងវិញ"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingAgain ? 'animate-spin text-pink-600' : ''}`} />
              </button>
            )}

            <button
              type="button"
              disabled={isDownloading}
              onClick={handleStartUpdate}
              className={`px-5 py-2.5 rounded-2xl text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                isDownloading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-700 hover:to-rose-700 shadow-pink-600/30 active:scale-95'
              }`}
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុងដំណើរការ...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>
                    {hasUpdate
                      ? isDesktop
                        ? '🚀 អាប់ដេតស្វ័យប្រវត្តិ (1-Click)'
                        : isAndroid
                        ? '🚀 ទាញយក & ដំឡើង APK'
                        : '🚀 អាប់ដេតឥឡូវនេះ'
                      : isDesktop
                      ? '🚀 ទាញយក Setup (EXE) ឡើងវិញ'
                      : isAndroid
                      ? '🚀 ទាញយក APK ឡើងវិញ'
                      : '🚀 ទាញយកកំណែចុងក្រោយ'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
