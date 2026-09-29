import { DemoDeviceVisitor, DemoDevicesSummary } from '../types';
import { getDeviceId } from '../utils/licenseManager';
import { saveFirestoreDoc, subscribeToFirestoreCollection } from './firebase';

/**
 * Detect client device properties (Mobile vs Desktop vs Tablet, OS, Browser)
 */
export const detectDeviceDetails = (): {
  deviceType: 'MOBILE' | 'TABLET' | 'DESKTOP';
  deviceModel: string;
  os: string;
  browser: string;
} => {
  if (typeof window === 'undefined' || !navigator) {
    return {
      deviceType: 'DESKTOP',
      deviceModel: 'Unknown Device',
      os: 'Unknown OS',
      browser: 'Unknown Browser',
    };
  }

  const ua = navigator.userAgent || '';
  const isTouch = navigator.maxTouchPoints > 0;
  const width = window.innerWidth || window.screen.width || 1024;

  // 1. Detect Device Type
  let deviceType: 'MOBILE' | 'TABLET' | 'DESKTOP' = 'DESKTOP';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua) || (isTouch && width >= 600 && width <= 1024)) {
    deviceType = 'TABLET';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/i.test(ua) || (isTouch && width < 600)) {
    deviceType = 'MOBILE';
  }

  // 2. Detect OS & Model
  let os = 'Unknown OS';
  let deviceModel = deviceType === 'MOBILE' ? 'Smartphone' : deviceType === 'TABLET' ? 'Tablet' : 'PC';

  if (/iphone/i.test(ua)) {
    os = 'iOS (iPhone)';
    deviceModel = 'Apple iPhone';
  } else if (/ipad/i.test(ua)) {
    os = 'iPadOS';
    deviceModel = 'Apple iPad';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
    deviceModel = 'Apple Mac';
  } else if (/android/i.test(ua)) {
    os = 'Android';
    const match = ua.match(/android\s([0-9\.]*)/i);
    if (match) os = `Android ${match[1]}`;
    deviceModel = 'Android Device';
  } else if (/windows nt 10\.0/i.test(ua)) {
    os = 'Windows 10/11';
    deviceModel = 'Windows PC';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
    deviceModel = 'Windows PC';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
    deviceModel = 'Linux Device';
  }

  // 3. Detect Browser
  let browser = 'Browser';
  if (/edg/i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/safari/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/opr\//i.test(ua)) {
    browser = 'Opera';
  }

  return { deviceType, deviceModel, os, browser };
};

const STORAGE_LAST_RECORDED = 'bakery_demo_device_logged_at';
const STORAGE_VISIT_COUNT = 'bakery_demo_device_visit_count';

/**
 * Record or update this device's visit to Demo Mode
 * Safely persists to Cloud Firestore root collection 'demo_devices'
 */
export const recordDemoDeviceVisit = async (): Promise<DemoDeviceVisitor | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const deviceId = getDeviceId();
    const nowIso = new Date().toISOString();
    const { deviceType, deviceModel, os, browser } = detectDeviceDetails();

    // Check existing visits from local storage
    const storedFirstVisit = localStorage.getItem('bakery_demo_first_visit') || nowIso;
    if (!localStorage.getItem('bakery_demo_first_visit')) {
      localStorage.setItem('bakery_demo_first_visit', storedFirstVisit);
    }

    const currentVisits = parseInt(localStorage.getItem(STORAGE_VISIT_COUNT) || '0', 10) + 1;
    localStorage.setItem(STORAGE_VISIT_COUNT, currentVisits.toString());

    const screenRes = typeof window.screen !== 'undefined'
      ? `${window.screen.width}x${window.screen.height}`
      : undefined;

    const visitorRecord: DemoDeviceVisitor = {
      id: deviceId,
      deviceId,
      deviceType,
      deviceModel,
      browser,
      os,
      firstVisit: storedFirstVisit,
      lastVisit: nowIso,
      visitCount: currentVisits,
      screenResolution: screenRes,
      language: navigator.language || 'km-KH',
      userAgent: (navigator.userAgent || '').slice(0, 200),
    };

    // Throttle duplicate Firestore writes within 10 minutes in the same session
    const lastLogged = sessionStorage.getItem(STORAGE_LAST_RECORDED);
    const tenMinutes = 10 * 60 * 1000;
    if (lastLogged && Date.now() - parseInt(lastLogged, 10) < tenMinutes) {
      return visitorRecord;
    }

    sessionStorage.setItem(STORAGE_LAST_RECORDED, Date.now().toString());

    // Save directly to cloud root collection 'demo_devices'
    await saveFirestoreDoc('demo_devices', deviceId, visitorRecord);

    return visitorRecord;
  } catch (error) {
    console.warn('[DemoTracker] Could not record demo device visit:', error);
    return null;
  }
};

/**
 * Real-time subscription to all Demo devices recorded in Cloud Firestore
 */
export const subscribeToDemoDevices = (
  callback: (devices: DemoDeviceVisitor[]) => void
): (() => void) => {
  return subscribeToFirestoreCollection<DemoDeviceVisitor>('demo_devices', (records) => {
    // Sort newest visit first
    const sorted = [...records].sort((a, b) => {
      const timeA = new Date(a.lastVisit || 0).getTime();
      const timeB = new Date(b.lastVisit || 0).getTime();
      return timeB - timeA;
    });
    callback(sorted);
  });
};

/**
 * Compute aggregate summary statistics from a list of demo device visitors
 */
export const calculateDemoDevicesSummary = (devices: DemoDeviceVisitor[]): DemoDevicesSummary => {
  const totalUniqueDevices = devices.length;
  let totalVisits = 0;
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;

  for (const d of devices) {
    totalVisits += d.visitCount || 1;
    if (d.deviceType === 'MOBILE') mobileCount++;
    else if (d.deviceType === 'TABLET') tabletCount++;
    else desktopCount++;
  }

  return {
    totalUniqueDevices,
    totalVisits,
    mobileCount,
    desktopCount,
    tabletCount,
    lastUpdated: new Date().toISOString(),
  };
};
