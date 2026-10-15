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

export const CURRENT_APP_VERSION = '1.2.9';
export const CURRENT_BUILD_DATE = '2026-10-15';

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

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return isAndroidNativeApp() || /android/i.test(navigator.userAgent || '');
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
 * Check for updates from remote manifest or GitHub Releases API
 */
export const checkForAppUpdates = async (): Promise<AppUpdateInfo> => {
  const currentVer = getNativeAppVersion();
  const manifestUrl = getStoredUpdateUrl();
  const cacheBuster = manifestUrl.includes('?') ? `&_t=${Date.now()}` : `?_t=${Date.now()}`;

  const defaultApkUrl = 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-Android.apk';
  const defaultWinExeUrl = 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Setup.exe';
  const defaultWinZipUrl = 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Windows.zip';

  // 1. Try reading the primary version.json manifest
  try {
    const response = await fetch(`${manifestUrl}${cacheBuster}`, {
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
          'កែលម្អប្រព័ន្ធអាប់ដេតស្វ័យប្រវត្តិ (Standard In-App Auto-Update)',
          'បង្ហាញដំណឹងកំណែថ្មីច្បាស់លាស់ទាំងលើ Windows និង Android',
          'ដំណើរការទាញយករលូន និងសុវត្ថិភាពខ្ពស់',
        ],
        apkDownloadUrl: data.apkDownloadUrl || defaultApkUrl,
        windowsDownloadUrl: data.windowsDownloadUrl || data.windowsInstallerUrl || defaultWinExeUrl,
        windowsInstallerUrl: data.windowsInstallerUrl || data.windowsDownloadUrl || defaultWinExeUrl,
        mandatory: Boolean(data.mandatory),
      };
    }
  } catch (err) {
    console.warn('Could not fetch remote version manifest, trying GitHub API fallback:', err);
  }

  // 2. Fallback: Query GitHub Releases API directly if raw manifest was blocked or cached
  try {
    const ghRes = await fetch('https://api.github.com/repos/sothearetsuon-ai/sweetbakery-pos/releases/latest', {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (ghRes.ok) {
      const ghData = await ghRes.json();
      const tagVer = (ghData.tag_name || '').replace(/^v/i, '');
      if (tagVer) {
        const hasNew = isVersionNewer(tagVer, currentVer);
        const apkAsset = ghData.assets?.find((a: any) => a.name?.endsWith('.apk'));
        const exeAsset = ghData.assets?.find((a: any) => a.name?.endsWith('.exe'));

        return {
          hasUpdate: hasNew,
          currentVersion: currentVer,
          latestVersion: tagVer,
          releaseDate: (ghData.published_at || '').slice(0, 10) || CURRENT_BUILD_DATE,
          releaseNotes: ghData.body
            ? ghData.body.split('\n').filter((l: string) => l.trim().startsWith('-') || l.trim().startsWith('*')).map((l: string) => l.replace(/^[-*]\s*/, ''))
            : ['មានកំណែថ្មី និងការកែលម្អប្រព័ន្ធដំណើរការ'],
          apkDownloadUrl: apkAsset?.browser_download_url || defaultApkUrl,
          windowsDownloadUrl: exeAsset?.browser_download_url || defaultWinExeUrl,
          windowsInstallerUrl: exeAsset?.browser_download_url || defaultWinExeUrl,
          mandatory: false,
        };
      }
    }
  } catch (ghErr) {
    console.warn('GitHub API fallback check failed:', ghErr);
  }

  // Fallback info when offline
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
    apkDownloadUrl: defaultApkUrl,
    windowsDownloadUrl: defaultWinExeUrl,
    windowsInstallerUrl: defaultWinExeUrl,
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

