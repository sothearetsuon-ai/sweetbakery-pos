/**
 * App License & Expiration Management Utility
 * Supports:
 * 1. 35-day trial period countdown & clock tamper detection
 * 2. Remote Cloud Auto-Unlock via Firebase Firestore (Zero keys needed by client!)
 * 3. Unique Machine-Locked Keys (Device-Bound activation keys that cannot be shared)
 * 4. Owner's Secret Key Generator Tool for issuing custom machine-bound codes
 */

import { idbGet, idbSet } from './idbStorage';
import { saveFirestoreDoc, subscribeToFirestoreDoc, subscribeToFirestoreCollection, getStoreId } from '../services/firebase';

export interface LicenseInfo {
  deviceId: string;
  isExpired: boolean;
  isWarning: boolean; // true when <= 5 days remaining
  daysRemaining: number;
  expiresAt: number; // timestamp in ms
  activatedAt: number; // timestamp in ms
  isPermanent: boolean;
  tamperDetected: boolean;
}

export interface ClientLicenseRecord {
  id?: string;
  deviceId: string;
  storeId?: string;
  storeName?: string;
  expiresAt: number | string;
  isExpired?: boolean;
  isPermanent?: boolean;
  daysRemaining?: number;
  lastSeen?: string;
  active?: boolean;
  updatedAt?: string;
}

const STORAGE_DEVICE_ID = 'bakery_license_device_id';
const STORAGE_ACTIVATED_AT = 'bakery_license_activated_at';
const STORAGE_EXPIRES_AT = 'bakery_license_expires_at';
const STORAGE_IS_PERMANENT = 'bakery_license_is_permanent';
const STORAGE_LAST_TIMESTAMP = 'bakery_license_last_timestamp';

// 35 Days in milliseconds
export const DEFAULT_TRIAL_DAYS = 35;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TRIAL_DURATION_MS = DEFAULT_TRIAL_DAYS * MS_PER_DAY;

// Secret salt for device-bound cryptographic checksums
const SECRET_SALT = 'SWB_BAKERY_KEY_SALT_2026';

// Global Master Activation Keys
export const GLOBAL_KEYS: Record<string, { days?: number; permanent?: boolean; label: string }> = {
  // Lifetime Unlimited Access
  'BAKERY-VIP-LIFETIME': { permanent: true, label: 'សិទ្ធិប្រើប្រាស់ពេញមួយជីវិត (Lifetime Access)' },
  'SWEET-BAKERY-PRO-2026': { permanent: true, label: 'សិទ្ធិប្រើប្រាស់ពេញមួយជីវិត (Lifetime Pro)' },
  
  // 1 Year License (+365 Days)
  'BAKERY-365D-PRO': { days: 365, label: 'បន្តសុពលភាព ១ ឆ្នាំ (365 ថ្ងៃ)' },
  'SWB-YEAR-ACCESS': { days: 365, label: 'បន្តសុពលភាព ១ ឆ្នាំ (365 ថ្ងៃ)' },

  // 6 Months License (+180 Days)
  'BAKERY-180D-PASS': { days: 180, label: 'បន្តសុពលភាព ៦ ខែ (180 ថ្ងៃ)' },

  // 35 Days License (+35 Days)
  'BAKERY-35D-EXTEND': { days: 35, label: 'បន្តសុពលភាព ៣៥ ថ្ងៃ (35 ថ្ងៃ)' },
  'SWB-35D-TRIAL': { days: 35, label: 'បន្តសុពលភាព ៣៥ ថ្ងៃ (35 ថ្ងៃ)' },

  // Master Developer PIN
  '889977': { days: 365, label: 'បន្តសុពលភាព ១ ឆ្នាំ (Master PIN)' },
  '999999': { permanent: true, label: 'ដោះសោអចិន្ត្រៃយ៍ (Developer PIN)' },
};

/**
 * Get or generate unique, persistent Machine / Device ID (e.g. DEV-8B2A-4F91)
 */
export const getDeviceId = (): string => {
  let id = localStorage.getItem(STORAGE_DEVICE_ID);
  if (!id) {
    const randHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
    id = `DEV-${randHex()}-${randHex()}`;
    localStorage.setItem(STORAGE_DEVICE_ID, id);
    idbSet(STORAGE_DEVICE_ID, id).catch(() => {});
  }
  return id;
};

/**
 * Mathematical hashing checksum for binding a key to a specific device ID
 */
const computeKeyChecksum = (deviceIdClean: string, plan: string): string => {
  const str = `${deviceIdClean}_${plan}_${SECRET_SALT}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & 0xffffffff;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(0, 4);
};

/**
 * Generator tool: Creates a unique license key locked strictly to targetDeviceId
 */
export const generateDeviceBoundKey = (
  targetDeviceId: string,
  plan: '35D' | '180D' | '365D' | 'VIP'
): string => {
  const cleanDev = targetDeviceId.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const segments = cleanDev.split('-');
  const shortSegment = segments.length > 1 ? segments[segments.length - 1] : cleanDev.slice(-4);
  const checksum = computeKeyChecksum(cleanDev, plan);
  return `ACT-${shortSegment}-${plan}-${checksum}`;
};

/**
 * Verifies if a device-bound key is valid for currentDeviceId
 */
export const verifyDeviceBoundKey = (
  currentDeviceId: string,
  code: string
): { valid: boolean; plan?: '35D' | '180D' | '365D' | 'VIP'; message?: string } => {
  const cleanCode = code.trim().toUpperCase();
  const cleanDev = currentDeviceId.trim().toUpperCase();

  const plans: ('35D' | '180D' | '365D' | 'VIP')[] = ['35D', '180D', '365D', 'VIP'];

  for (const p of plans) {
    const expectedKey = generateDeviceBoundKey(cleanDev, p);
    if (cleanCode === expectedKey) {
      return { valid: true, plan: p };
    }
  }

  // If the user entered an ACT- key that was generated for another device
  if (cleanCode.startsWith('ACT-')) {
    return {
      valid: false,
      message: '❌ កូដនេះសម្រាប់តែម៉ាស៊ីនផ្សេងប៉ុណ្ណោះ មិនអាចប្រើលើម៉ាស៊ីននេះបានឡើយ (Device ID Mismatch)!',
    };
  }

  return { valid: false };
};

/**
 * Initializes or retrieves license details with IndexedDB persistence
 */
export const getLicenseInfo = (): LicenseInfo => {
  const now = Date.now();
  const deviceId = getDeviceId();

  // Check if permanent license
  const isPermanent = localStorage.getItem(STORAGE_IS_PERMANENT) === 'true';
  if (isPermanent) {
    return {
      deviceId,
      isExpired: false,
      isWarning: false,
      daysRemaining: 9999,
      expiresAt: now + 3650 * MS_PER_DAY,
      activatedAt: now - MS_PER_DAY,
      isPermanent: true,
      tamperDetected: false,
    };
  }

  // Get activation time or initialize
  let activatedAt = parseInt(localStorage.getItem(STORAGE_ACTIVATED_AT) || '0', 10);
  let expiresAt = parseInt(localStorage.getItem(STORAGE_EXPIRES_AT) || '0', 10);

  if (!activatedAt || !expiresAt) {
    activatedAt = now;
    expiresAt = now + TRIAL_DURATION_MS;
    localStorage.setItem(STORAGE_ACTIVATED_AT, activatedAt.toString());
    localStorage.setItem(STORAGE_EXPIRES_AT, expiresAt.toString());
    idbSet(STORAGE_ACTIVATED_AT, activatedAt.toString()).catch(() => {});
    idbSet(STORAGE_EXPIRES_AT, expiresAt.toString()).catch(() => {});
  }

  // Anti-tampering check: verify that system clock hasn't been set backwards
  let tamperDetected = false;
  const lastRecorded = parseInt(localStorage.getItem(STORAGE_LAST_TIMESTAMP) || '0', 10);
  if (lastRecorded > 0 && now < lastRecorded - 3600000) {
    tamperDetected = true;
  }
  localStorage.setItem(STORAGE_LAST_TIMESTAMP, now.toString());

  // Calculate remaining time
  const remainingMs = expiresAt - now;
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / MS_PER_DAY));
  const isExpired = tamperDetected || remainingMs <= 0;
  const isWarning = !isExpired && daysRemaining <= 5;

  return {
    deviceId,
    isExpired,
    isWarning,
    daysRemaining,
    expiresAt,
    activatedAt,
    isPermanent: false,
    tamperDetected,
  };
};

/**
 * Synchronize license state with IndexedDB in background
 */
export const syncLicenseFromStorage = async (): Promise<void> => {
  try {
    const idbDeviceId = await idbGet(STORAGE_DEVICE_ID);
    if (idbDeviceId && !localStorage.getItem(STORAGE_DEVICE_ID)) {
      localStorage.setItem(STORAGE_DEVICE_ID, idbDeviceId);
    }

    const idbPermanent = await idbGet(STORAGE_IS_PERMANENT);
    if (idbPermanent === 'true') {
      localStorage.setItem(STORAGE_IS_PERMANENT, 'true');
      return;
    }

    const idbActivatedAt = await idbGet(STORAGE_ACTIVATED_AT);
    const idbExpiresAt = await idbGet(STORAGE_EXPIRES_AT);
    
    const localActivatedAt = localStorage.getItem(STORAGE_ACTIVATED_AT);
    const localExpiresAt = localStorage.getItem(STORAGE_EXPIRES_AT);

    if (!localActivatedAt && idbActivatedAt) {
      localStorage.setItem(STORAGE_ACTIVATED_AT, idbActivatedAt);
    }
    if (!localExpiresAt && idbExpiresAt) {
      localStorage.setItem(STORAGE_EXPIRES_AT, idbExpiresAt);
    }
  } catch (err) {
    console.warn('License sync error:', err);
  }
};

/**
 * Real-time Remote Auto-Unlock via Firebase Firestore (Zero customer effort!)
 */
export const syncRemoteLicense = (
  onRemoteUnlocked: (info: { message: string }) => void
): (() => void) => {
  const deviceId = getDeviceId();
  const localInfo = getLicenseInfo();

  // 1. Report heartbeat to Firebase so owner sees this client device
  try {
    const storeName = (() => {
      try {
        const saved = localStorage.getItem('bakery_store_info');
        return saved ? JSON.parse(saved).nameKh : 'SweetBakery Store';
      } catch (e) {
        return 'SweetBakery Store';
      }
    })();

    const storeId = getStoreId();
    saveFirestoreDoc('system_licenses', deviceId, {
      deviceId,
      storeId,
      storeName,
      expiresAt: localInfo.expiresAt,
      isExpired: localInfo.isExpired,
      isPermanent: localInfo.isPermanent,
      daysRemaining: localInfo.daysRemaining,
      lastSeen: new Date().toISOString(),
    });
  } catch (e) {}

  // 2. Real-time subscription to cloud changes made by owner
  const unsubscribe = subscribeToFirestoreDoc<{
    active?: boolean;
    expiresAt?: number | string;
    permanent?: boolean;
  }>('system_licenses', deviceId, (remoteData) => {
    if (!remoteData) return;

    const now = Date.now();

    // If owner unlocked permanently
    if (remoteData.permanent === true) {
      localStorage.setItem(STORAGE_IS_PERMANENT, 'true');
      idbSet(STORAGE_IS_PERMANENT, 'true').catch(() => {});
      onRemoteUnlocked({ message: 'បានដោះសោពីចម្ងាយតាម Cloud ដោយជោគជ័យ (Permanent Access)!' });
      return;
    }

    // If owner updated expiration date from Cloud
    if (remoteData.expiresAt) {
      const remoteExp = typeof remoteData.expiresAt === 'number'
        ? remoteData.expiresAt
        : new Date(remoteData.expiresAt).getTime();

      if (remoteExp > localInfo.expiresAt && remoteExp > now) {
        localStorage.setItem(STORAGE_EXPIRES_AT, remoteExp.toString());
        idbSet(STORAGE_EXPIRES_AT, remoteExp.toString()).catch(() => {});
        localStorage.setItem(STORAGE_LAST_TIMESTAMP, now.toString());
        onRemoteUnlocked({
          message: `បានដោះសោពីចម្ងាយតាម Cloud ដោយជោគជ័យ (សុពលភាពដល់៖ ${new Date(remoteExp).toLocaleDateString('km-KH')})!`,
        });
      }
    }
  });

  return unsubscribe;
};

/**
 * Remote Cloud Unlocker tool for Owner/Developer
 */
export const remoteUnlockClientDevice = async (
  targetDeviceId: string,
  durationDays: number | 'permanent'
): Promise<{ success: boolean; message: string }> => {
  try {
    const now = Date.now();
    if (durationDays === 'permanent') {
      await saveFirestoreDoc('system_licenses', targetDeviceId, {
        active: true,
        permanent: true,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: `បានដោះសោអចិន្ត្រៃយ៍ពីចម្ងាយសម្រាប់ ${targetDeviceId}` };
    } else {
      const newExpiresAt = now + durationDays * MS_PER_DAY;
      await saveFirestoreDoc('system_licenses', targetDeviceId, {
        active: true,
        expiresAt: newExpiresAt,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: `បានពន្យារ ${durationDays} ថ្ងៃពីចម្ងាយសម្រាប់ ${targetDeviceId}` };
    }
  } catch (err: any) {
    return { success: false, message: `កំហុសក្នុងការតភ្ជាប់: ${err?.message || 'Error'}` };
  }
};

/**
 * Validates and applies an activation key (both Global Master keys & Device-Bound keys)
 */
export const applyLicenseKey = (rawCode: string): { success: boolean; message: string; daysAdded?: number } => {
  const cleanCode = rawCode.trim().toUpperCase();

  if (!cleanCode) {
    return { success: false, message: 'សូមបញ្ចូលកូដបន្តសុពលភាព' };
  }

  const currentDeviceId = getDeviceId();
  const now = Date.now();

  // 1. Check if it is a Device-Bound Key (Locked strictly to this machine)
  const deviceCheck = verifyDeviceBoundKey(currentDeviceId, cleanCode);
  if (deviceCheck.valid && deviceCheck.plan) {
    if (deviceCheck.plan === 'VIP') {
      localStorage.setItem(STORAGE_IS_PERMANENT, 'true');
      idbSet(STORAGE_IS_PERMANENT, 'true').catch(() => {});
      return {
        success: true,
        message: 'ជោគជ័យ! បានដោះសោសិទ្ធិប្រើប្រាស់ពេញមួយជីវិត (Lifetime Access) សម្រាប់ម៉ាស៊ីននេះ!',
      };
    }

    const daysMap = { '35D': 35, '180D': 180, '365D': 365 };
    const days = daysMap[deviceCheck.plan] || 35;
    const currentInfo = getLicenseInfo();
    const baseTimestamp = currentInfo.isExpired ? now : Math.max(now, currentInfo.expiresAt);
    const newExpiresAt = baseTimestamp + days * MS_PER_DAY;

    localStorage.setItem(STORAGE_EXPIRES_AT, newExpiresAt.toString());
    idbSet(STORAGE_EXPIRES_AT, newExpiresAt.toString()).catch(() => {});
    localStorage.setItem(STORAGE_LAST_TIMESTAMP, now.toString());

    return {
      success: true,
      message: `ជោគជ័យ! បានបន្តសុពលភាព ${days} ថ្ងៃសម្រាប់ម៉ាស៊ីននេះ!`,
      daysAdded: days,
    };
  }

  if (deviceCheck.message) {
    return { success: false, message: deviceCheck.message };
  }

  // 2. Check Global Master Keys / Developer PINs
  const match = GLOBAL_KEYS[cleanCode];
  if (match) {
    if (match.permanent) {
      localStorage.setItem(STORAGE_IS_PERMANENT, 'true');
      idbSet(STORAGE_IS_PERMANENT, 'true').catch(() => {});
      return {
        success: true,
        message: `ជោគជ័យ! បានដោះសោ ${match.label}`,
      };
    }

    if (match.days) {
      const currentInfo = getLicenseInfo();
      const baseTimestamp = currentInfo.isExpired ? now : Math.max(now, currentInfo.expiresAt);
      const newExpiresAt = baseTimestamp + match.days * MS_PER_DAY;

      localStorage.setItem(STORAGE_EXPIRES_AT, newExpiresAt.toString());
      idbSet(STORAGE_EXPIRES_AT, newExpiresAt.toString()).catch(() => {});
      localStorage.setItem(STORAGE_LAST_TIMESTAMP, now.toString());

      return {
        success: true,
        message: `ជោគជ័យ! ${match.label}`,
        daysAdded: match.days,
      };
    }
  }

  return { success: false, message: 'កូដបន្តសុពលភាពមិនត្រឹមត្រូវឡើយ (Invalid License Key)' };
};

/**
 * Subscribe to real-time client licenses list for Super Admin monitor
 */
export const subscribeToClientLicenses = (
  onUpdate: (clients: ClientLicenseRecord[]) => void
): (() => void) => {
  return subscribeToFirestoreCollection<ClientLicenseRecord>('system_licenses', onUpdate);
};
