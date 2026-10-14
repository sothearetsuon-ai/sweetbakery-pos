/**
 * SweetBakery POS - In-App Update Service
 * Handles version checking, release notes, and native In-App APK / Web updates.
 */

export interface AppUpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseDate: string;
  releaseNotes: string[];
  apkDownloadUrl: string;
  windowsDownloadUrl?: string;
  windowsInstallerUrl?: string;
  mandatory?: boolean;
}

export const CURRENT_APP_VERSION = '1.2.3';
export const CURRENT_BUILD_DATE = '2026-10-14';

// Storage key for custom update server URL if configured
const STORAGE_KEY_UPDATE_URL = 'sweetbakery_update_manifest_url';

export const getStoredUpdateUrl = (): string => {
  return (
    localStorage.getItem(STORAGE_KEY_UPDATE_URL) ||
    'https://raw.githubusercontent.com/sothearetsuon-ai/sweetbakery-pos/main/version.json'
  );
};

export const setStoredUpdateUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEY_UPDATE_URL, url.trim());
};

export const isAndroidNativeApp = (): boolean => {
  return typeof (window as any).SweetBakeryNative !== 'undefined';
};

export const isDesktopElectronApp = (): boolean => {
  return (
    typeof (window as any).SweetBakeryDesktop !== 'undefined' ||
    typeof (window as any).electron !== 'undefined' ||
    navigator.userAgent.toLowerCase().includes('electron')
  );
};

export const isElectronWindowsApp = (): boolean => {
  return isDesktopElectronApp();
};

export const isWindowsPlatform = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = (navigator.userAgent || '').toLowerCase();
  const platform = ((navigator as any).userAgentData?.platform || navigator.platform || '').toLowerCase();
  return (
    isDesktopElectronApp() ||
    ua.includes('windows') ||
    ua.includes('win32') ||
    ua.includes('win64') ||
    platform.includes('win')
  );
};

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};


export const getNativeAppVersion = (): string => {
  if (isAndroidNativeApp() && (window as any).SweetBakeryNative?.getAppVersion) {
    try {
      return (window as any).SweetBakeryNative.getAppVersion();
    } catch {
      return CURRENT_APP_VERSION;
    }
  }
  return CURRENT_APP_VERSION;
};

/**
 * Compare two semver-like strings (e.g. "1.2.1" vs "1.2.0")
 */
export const isVersionNewer = (latest: string, current: string): boolean => {
  const parse = (v: string) =>
    v
      .replace(/^v/i, '')
      .split('.')
      .map((n) => parseInt(n, 10) || 0);

  const lParts = parse(latest);
  const cParts = parse(current);

  for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
    const l = lParts[i] || 0;
    const c = cParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
};

/**
 * Check for updates from remote manifest or Firebase
 */
export const checkForAppUpdates = async (): Promise<AppUpdateInfo> => {
  const currentVer = getNativeAppVersion();
  const manifestUrl = getStoredUpdateUrl();

  try {
    const response = await fetch(manifestUrl, {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (response.ok) {
      const data = await response.json();
      const latestVer = data.version || currentVer;
      const hasNew = isVersionNewer(latestVer, currentVer);

      return {
        hasUpdate: hasNew,
        currentVersion: currentVer,
        latestVersion: latestVer,
        releaseDate: data.releaseDate || CURRENT_BUILD_DATE,
        releaseNotes: data.releaseNotes || [
          'កែលម្អប្រព័ន្ធអាប់ដែតក្នុង App ផ្ទាល់ (In-App Auto Update)',
          'ពង្រីកទំហំអេក្រង់ និងប៊ូតុងលើទូរសព្ទដៃឱ្យធំច្បាស់',
          'បន្ថែមប៊ូតុង Quick Presets សម្រាប់អត្រាប្តូរប្រាក់',
        ],
        apkDownloadUrl:
          data.apkDownloadUrl ||
          'https://raw.githubusercontent.com/sothearetsuon-ai/sweetbakery-pos/main/SweetBakery-Android.apk',
        windowsDownloadUrl: data.windowsDownloadUrl || data.windowsInstallerUrl,
        windowsInstallerUrl: data.windowsInstallerUrl || data.windowsDownloadUrl,
        mandatory: Boolean(data.mandatory),
      };
    }
  } catch (err) {
    console.warn('Could not fetch remote version manifest, falling back:', err);
  }

  // Fallback demo/mock version info when offline or GitHub not connected yet
  return {
    hasUpdate: false,
    currentVersion: currentVer,
    latestVersion: currentVer,
    releaseDate: CURRENT_BUILD_DATE,
    releaseNotes: [
      'កំណែចុងក្រោយបំផុត (Latest Stable Release)',
      'គាំទ្រការអាប់ដែតក្នុង App ផ្ទាល់ ១០០%',
      'ដំណើរការលឿន និងសន្សំសំចៃទិន្នន័យ',
    ],
    apkDownloadUrl:
      'https://raw.githubusercontent.com/sothearetsuon-ai/sweetbakery-pos/main/SweetBakery-Android.apk',
    windowsDownloadUrl:
      'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Setup.exe',
    windowsInstallerUrl:
      'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Setup.exe',
  };
};

/**
 * Trigger In-App download and installation on native Android
 */
export const triggerInAppAndroidUpdate = (apkUrl: string): boolean => {
  if (isAndroidNativeApp() && (window as any).SweetBakeryNative?.downloadAndInstallUpdate) {
    (window as any).SweetBakeryNative.downloadAndInstallUpdate(apkUrl);
    return true;
  }
  return false;
};

/**
 * Trigger 1-Click Telegram-Style Silent Update on Windows Desktop App
 */
export const triggerInAppDesktopUpdate = (
  installerUrl: string,
  onProgress?: (data: { percent: number; downloadedMB: string; totalMB: string }) => void,
  onComplete?: () => void,
  onError?: (err: string) => void
): boolean => {
  const desktop = (window as any).SweetBakeryDesktop;
  if (desktop && desktop.startSilentUpdate) {
    if (onProgress) desktop.onUpdateProgress(onProgress);
    if (onComplete) desktop.onUpdateComplete(onComplete);
    if (onError) desktop.onUpdateError(onError);
    desktop.startSilentUpdate(installerUrl);
    return true;
  }
  return false;
};

