/**
 * App License & Expiration Management Utility
 * Manages 35-day trial period, anti-tampering clock checks,
 * license renewal keys, and Firebase cloud sync.
 */

import { idbGet, idbSet } from './idbStorage';

export interface LicenseInfo {
  isExpired: boolean;
  isWarning: boolean; // true when <= 5 days remaining
  daysRemaining: number;
  expiresAt: number; // timestamp in ms
  activatedAt: number; // timestamp in ms
  isPermanent: boolean;
  tamperDetected: boolean;
}

const STORAGE_ACTIVATED_AT = 'bakery_license_activated_at';
const STORAGE_EXPIRES_AT = 'bakery_license_expires_at';
const STORAGE_IS_PERMANENT = 'bakery_license_is_permanent';
const STORAGE_LAST_TIMESTAMP = 'bakery_license_last_timestamp';

// 35 Days in milliseconds
export const DEFAULT_TRIAL_DAYS = 35;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TRIAL_DURATION_MS = DEFAULT_TRIAL_DAYS * MS_PER_DAY;

// Valid License Activation Keys
const VALID_KEYS: Record<string, { days?: number; permanent?: boolean; label: string }> = {
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
 * Initializes or retrieves license details with IndexedDB persistence
 */
export const getLicenseInfo = (): LicenseInfo => {
  const now = Date.now();

  // Check if permanent license
  const isPermanent = localStorage.getItem(STORAGE_IS_PERMANENT) === 'true';
  if (isPermanent) {
    return {
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
    // If device time is more than 1 hour earlier than last recorded run time
    tamperDetected = true;
  }
  localStorage.setItem(STORAGE_LAST_TIMESTAMP, now.toString());

  // Calculate remaining time
  const remainingMs = expiresAt - now;
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / MS_PER_DAY));
  const isExpired = tamperDetected || remainingMs <= 0;
  const isWarning = !isExpired && daysRemaining <= 5;

  return {
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
    const idbPermanent = await idbGet(STORAGE_IS_PERMANENT);
    if (idbPermanent === 'true') {
      localStorage.setItem(STORAGE_IS_PERMANENT, 'true');
      return;
    }

    const idbActivatedAt = await idbGet(STORAGE_ACTIVATED_AT);
    const idbExpiresAt = await idbGet(STORAGE_EXPIRES_AT);
    
    const localActivatedAt = localStorage.getItem(STORAGE_ACTIVATED_AT);
    const localExpiresAt = localStorage.getItem(STORAGE_EXPIRES_AT);

    // If localStorage was cleared but IndexedDB preserved the true activation date
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
 * Validates and applies a license activation key
 */
export const applyLicenseKey = (rawCode: string): { success: boolean; message: string; daysAdded?: number } => {
  const cleanCode = rawCode.trim().toUpperCase();

  if (!cleanCode) {
    return { success: false, message: 'សូមបញ្ចូលកូដបន្តសុពលភាព' };
  }

  const match = VALID_KEYS[cleanCode];
  if (!match) {
    return { success: false, message: 'កូដបន្តសុពលភាពមិនត្រឹមត្រូវឡើយ (Invalid License Key)' };
  }

  const now = Date.now();

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
    // If already expired, extend from now; otherwise add to current expiry
    const baseTimestamp = currentInfo.isExpired ? now : Math.max(now, currentInfo.expiresAt);
    const newExpiresAt = baseTimestamp + match.days * MS_PER_DAY;

    localStorage.setItem(STORAGE_EXPIRES_AT, newExpiresAt.toString());
    idbSet(STORAGE_EXPIRES_AT, newExpiresAt.toString()).catch(() => {});
    // Reset tamper flag
    localStorage.setItem(STORAGE_LAST_TIMESTAMP, now.toString());

    return {
      success: true,
      message: `ជោគជ័យ! ${match.label}`,
      daysAdded: match.days,
    };
  }

  return { success: false, message: 'កំហុសមិនស្គាល់' };
};
