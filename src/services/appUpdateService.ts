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

export const CURRENT_APP_VERSION = '1.6.6';
export const CURRENT_BUILD_DATE = '2026-10-21';

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
  if ((window as any).SweetBakeryDesktop?.getAppVersion) {
    try {
      return (window as any).SweetBakeryDesktop.getAppVersion();
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

  const defaultApkUrl = 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.6.6/SweetBakery-Android.apk';
  const defaultWinExeUrl = 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/download/v1.6.6/SweetBakery-POS-Setup.exe';

  let foundLatestVersion = currentVer;
  let foundReleaseDate = CURRENT_BUILD_DATE;
  let foundReleaseNotes: string[] = [];
  let foundApkUrl = defaultApkUrl;
  let foundWinExeUrl = defaultWinExeUrl;

  const fetchWithTimeout = async (url: string, headers: Record<string, string> = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(url, {
        headers,
        signal: controller.signal,
        cache: 'no-cache',
      });
      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  // 1. Check GitHub Releases API (direct, official, uncached)
  try {
    const ghRes = await fetchWithTimeout(
      'https://api.github.com/repos/sothearetsuon-ai/sweetbakery-pos/releases/latest',
      { Accept: 'application/vnd.github.v3+json' }
    );
    if (ghRes && ghRes.ok) {
      const ghData = await ghRes.json();
      const tagVer = (ghData.tag_name || '').replace(/^v/i, '').trim();
      if (tagVer) {
        foundLatestVersion = tagVer;
        foundReleaseDate = (ghData.published_at || '').slice(0, 10) || CURRENT_BUILD_DATE;
        if (ghData.body) {
          foundReleaseNotes = ghData.body
            .split('\n')
            .filter((l: string) => l.trim().startsWith('-') || l.trim().startsWith('*'))
            .map((l: string) => l.replace(/^[-*]\s*/, '').trim());
        }
        const apkAsset = ghData.assets?.find((a: any) => a.name?.endsWith('.apk'));
        const exeAsset = ghData.assets?.find((a: any) => a.name?.endsWith('.exe'));
        if (apkAsset?.browser_download_url) foundApkUrl = apkAsset.browser_download_url;
        if (exeAsset?.browser_download_url) foundWinExeUrl = exeAsset.browser_download_url;
      }
    }
  } catch (ghErr) {
    console.warn('GitHub API check note:', ghErr);
  }

  // 2. Also check version.json manifests (checking multiple reliable endpoints)
  const candidateUrls = [
    manifestUrl,
    'https://raw.githubusercontent.com/sothearetsuon-ai/sweetbakery-pos/main/version.json',
    'https://sothearetsuon-ai.github.io/sweetbakery-pos/version.json',
    './version.json',
    '/version.json',
  ];

  for (const cUrl of candidateUrls) {
    if (!cUrl) continue;
    try {
      const sep = cUrl.includes('?') ? '&' : '?';
      const manifestRes = await fetchWithTimeout(`${cUrl}${sep}_t=${Date.now()}`);
      if (manifestRes && manifestRes.ok) {
        const data = await manifestRes.json();
        const rawVer = (data.version || '').replace(/^v/i, '').trim();
        if (rawVer && isVersionNewer(rawVer, foundLatestVersion)) {
          foundLatestVersion = rawVer;
          if (data.releaseDate) foundReleaseDate = data.releaseDate;
          if (Array.isArray(data.releaseNotes) && data.releaseNotes.length > 0) {
            foundReleaseNotes = data.releaseNotes;
          }
          if (data.apkDownloadUrl) foundApkUrl = data.apkDownloadUrl;
          if (data.windowsInstallerUrl || data.windowsDownloadUrl) {
            foundWinExeUrl = data.windowsInstallerUrl || data.windowsDownloadUrl;
          }
        } else if (!foundReleaseNotes.length && Array.isArray(data.releaseNotes)) {
          foundReleaseNotes = data.releaseNotes;
        }
      }
    } catch (err) {
      // Continue to next candidate
    }
  }

  const hasNew = isVersionNewer(foundLatestVersion, currentVer);

  return {
    hasUpdate: hasNew,
    currentVersion: currentVer,
    latestVersion: foundLatestVersion,
    releaseDate: foundReleaseDate,
    releaseNotes: foundReleaseNotes.length > 0 ? foundReleaseNotes : [
      '🤖 ជំនួយការ AI ណែនាំកុម្ម៉ង់នំខេក (Customer Order AI Guide)៖ ឆ្លាតវៃជួយណែនាំភ្ញៀវជ្រើសរើសទំហំ រសជាតិ និងអក្សរលើនំ គាំទ្រសំឡេង (Voice) & Khmer Audio TTS',
      '📊 ជំនួយការបូកសរុបរបាយការណ៍លក់ និងចំណាយប្រចាំថ្ងៃ + ប្រចាំខែស្វ័យប្រវត្តិ៖ ផ្ញើចូល Telegram រៀងរាល់ម៉ោង ៩:០០ (ចំណូល, KHQR, ចំណាយ COGS/OPEX, ចំណេញសុទ្ធ & AI Insights)',
      '✈️ ប៊ូតុងផ្ញើរបាយការណ៍ទៅ Telegram ភ្លាមៗ (Instant Report Dispatch) ក្នុងផ្ទាំង Reports Dashboard',
      '⚡ ពង្រឹងស្ថេរភាព និងល្បឿនប្រព័ន្ធទូទាត់ POS ព្រមទាំង In-App Auto Update ស្តង់ដារថ្មី មិនបាត់បង់ទិន្នន័យ',
    ],
    apkDownloadUrl: foundApkUrl,
    windowsDownloadUrl: foundWinExeUrl,
    windowsInstallerUrl: foundWinExeUrl,
    mandatory: false,
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

/**
 * Safely open download or external links across Desktop Electron and standard browsers
 */
export const openExternalUrl = (url: string) => {
  if (typeof window === 'undefined') return;
  const desktop = (window as any).SweetBakeryDesktop;
  if (desktop && typeof desktop.openExternal === 'function') {
    desktop.openExternal(url);
    return;
  }
  // Standard Web / Mobile Browser
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try { document.body.removeChild(a); } catch (e) {}
    }, 100);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};


