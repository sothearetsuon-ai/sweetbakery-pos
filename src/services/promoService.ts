import { PromoCode } from '../types';
export type { PromoCode };
import { getStoreId, saveFirestoreDoc, getFirestoreDoc } from './firebase';

const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo_welcome',
    code: 'WELCOME',
    discountType: 'PERCENT',
    discountValue: 10,
    minSpendKhr: 10000,
    descriptionKh: 'បញ្ចុះតម្លៃ 10% សម្រាប់ស្វាគមន៍អតិថិជនថ្មី',
    isActive: true,
  },
  {
    id: 'promo_bakery5k',
    code: 'BAKERY5K',
    discountType: 'FIXED_KHR',
    discountValue: 5000,
    minSpendKhr: 40000,
    descriptionKh: 'បញ្ចុះតម្លៃ 5,000 ៛ ពេលទិញចាប់ពី 40,000 ៛ ឡើង',
    isActive: true,
  },
  {
    id: 'promo_sweet15',
    code: 'SWEET15',
    discountType: 'PERCENT',
    discountValue: 15,
    minSpendKhr: 60000,
    descriptionKh: 'បញ្ចុះតម្លៃពិសេស 15% សម្រាប់នំខេក & នំដុត',
    isActive: true,
  },
  {
    id: 'promo_vip20',
    code: 'VIP20',
    discountType: 'PERCENT',
    discountValue: 20,
    minSpendKhr: 80000,
    descriptionKh: 'បញ្ចុះតម្លៃ 20% ជូនសមាជិក VIP',
    isActive: true,
  },
];

const getStorageKey = () => {
  const storeId = getStoreId ? getStoreId() : 'default';
  return `sweetbakery_promo_codes_${storeId}`;
};

export const getStoredPromoCodes = (): PromoCode[] => {
  if (typeof window === 'undefined') return DEFAULT_PROMO_CODES;
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[PromoService] Error loading promo codes:', e);
  }
  return DEFAULT_PROMO_CODES;
};

export const saveStoredPromoCodes = (codes: PromoCode[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(codes));
    window.dispatchEvent(new CustomEvent('bakery_promo_codes_changed', { detail: codes }));
  } catch (e) {
    console.warn('[PromoService] Error saving promo codes:', e);
  }

  // Non-blocking Cloud sync
  saveFirestoreDoc('settings', 'promoCodes', {
    codes,
    updatedAt: new Date().toISOString(),
  }).catch((err) => console.warn('[PromoService] Cloud sync error:', err));
};

export const fetchCloudPromoCodes = async (): Promise<PromoCode[] | null> => {
  try {
    const doc = await getFirestoreDoc<{ codes: PromoCode[] }>('settings', 'promoCodes');
    if (doc && Array.isArray(doc.codes) && doc.codes.length > 0) {
      saveStoredPromoCodes(doc.codes);
      return doc.codes;
    }
  } catch (e) {
    console.warn('[PromoService] Failed to fetch cloud promo codes:', e);
  }
  return null;
};

export interface PromoValidationResult {
  valid: boolean;
  messageKh: string;
  promo?: PromoCode;
  discountKhr: number;
  discountUsd: number;
}

export const validatePromoCode = (
  rawCode: string,
  subtotalKhr: number,
  exchangeRate: number
): PromoValidationResult => {
  const clean = rawCode.trim().toUpperCase();
  if (!clean) {
    return { valid: false, messageKh: 'សូមបញ្ចូលលេខកូដ Promo Code', discountKhr: 0, discountUsd: 0 };
  }

  const allCodes = getStoredPromoCodes();
  const matched = allCodes.find((p) => p.code.trim().toUpperCase() === clean);

  if (!matched) {
    return { valid: false, messageKh: `កូដ "${clean}" មិនត្រឹមត្រូវឡើយ!`, discountKhr: 0, discountUsd: 0 };
  }

  if (!matched.isActive) {
    return { valid: false, messageKh: `កូដ "${clean}" ត្រូវបានបិទដំណើរការជាបណ្ដោះអាសន្ន!`, discountKhr: 0, discountUsd: 0 };
  }

  if (matched.expiresAt && new Date(matched.expiresAt).getTime() < Date.now()) {
    return { valid: false, messageKh: `កូដ "${clean}" បានផុតកំណត់ប្រើប្រាស់ហើយ!`, discountKhr: 0, discountUsd: 0 };
  }

  if (matched.minSpendKhr && subtotalKhr < matched.minSpendKhr) {
    return {
      valid: false,
      messageKh: `កូដ "${clean}" ត្រូវការទិញយ៉ាងតិច ${matched.minSpendKhr.toLocaleString()} ៛ ឡើងទៅ!`,
      discountKhr: 0,
      discountUsd: 0,
    };
  }

  let discountKhr = 0;
  if (matched.discountType === 'PERCENT') {
    discountKhr = Math.round((subtotalKhr * matched.discountValue) / 100);
  } else if (matched.discountType === 'FIXED_KHR') {
    discountKhr = Math.min(matched.discountValue, subtotalKhr);
  } else if (matched.discountType === 'FIXED_USD') {
    discountKhr = Math.min(Math.round(matched.discountValue * exchangeRate), subtotalKhr);
  }

  const discountUsd = Number((discountKhr / exchangeRate).toFixed(2));

  return {
    valid: true,
    messageKh: `បានបញ្ចុះតម្លៃ ${discountKhr.toLocaleString()} ៛ (-${matched.discountValue}${matched.discountType === 'PERCENT' ? '%' : '៛'})`,
    promo: matched,
    discountKhr,
    discountUsd,
  };
};
