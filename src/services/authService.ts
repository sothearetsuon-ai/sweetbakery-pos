import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirebaseAuth,
  getFirestoreDb,
  setStoreId,
  getStoreId,
  DEFAULT_STORE_ID,
  isDefaultStore,
} from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { idbGet, idbSet } from '../utils/idbStorage';

export interface StoreUserAccount {
  uid: string;
  storeId: string;
  storeName: string;
  email?: string;
  phone?: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER';
  authProvider: 'email' | 'phone' | 'google' | 'telegram' | 'store_id';
  createdAt: string;
  lastLoginAt: string;
}

const STORAGE_STORE_USER = 'bakery_store_user';
const AUTH_CHANGE_EVENT = 'bakery_store_auth_changed';

/**
 * Format phone number to clean digits
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Transform Email or Phone to Firebase-compatible email identifier
 */
export const toFirebaseEmail = (input: string): string => {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  const digits = cleanPhoneNumber(trimmed);
  return `phone_${digits}@phone.sweetbakery.pos`;
};

/**
 * Get current authenticated Store User from local cache
 */
export const getCurrentStoreUser = (): StoreUserAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_STORE_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.storeId) return parsed;
    }
  } catch (e) {}
  return null;
};

/**
 * Save store user session
 */
export const saveStoreUserSession = (account: StoreUserAccount | null): void => {
  if (account) {
    localStorage.setItem(STORAGE_STORE_USER, JSON.stringify(account));
    idbSet(STORAGE_STORE_USER, JSON.stringify(account)).catch(() => {});
  } else {
    localStorage.removeItem(STORAGE_STORE_USER);
    idbSet(STORAGE_STORE_USER, '').catch(() => {});
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: { user: account } }));
  }
};

/**
 * Subscribe to store user auth changes
 */
export const subscribeStoreUser = (callback: (user: StoreUserAccount | null) => void): (() => void) => {
  const handler = (e: any) => {
    callback(e.detail?.user !== undefined ? e.detail.user : getCurrentStoreUser());
  };
  window.addEventListener(AUTH_CHANGE_EVENT, handler);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, handler);
};

/**
 * Register / Sign up a new independent Bakery Store (100% Isolated Tenant)
 */
export const signUpStore = async (params: {
  emailOrPhone: string;
  password?: string;
  storeName: string;
  phone?: string;
  email?: string;
}): Promise<{ success: boolean; error?: string; account?: StoreUserAccount }> => {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const rawIdent = params.emailOrPhone.trim();
  const storeName = params.storeName.trim() || 'ហាងនំខេក SweetBakery';
  const isPhone = !rawIdent.includes('@');
  const firebaseEmail = toFirebaseEmail(rawIdent);
  const password = params.password || 'BakeryPass123!';
  const phone = params.phone || (isPhone ? rawIdent : '');
  const email = params.email || (!isPhone ? rawIdent : '');

  // 1. Try Firebase Auth create
  let uid = `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, firebaseEmail, password);
      uid = cred.user.uid;
    } catch (err: any) {
      // If user already exists, suggest login
      if (err.code === 'auth/email-already-in-use') {
        return {
          success: false,
          error: 'លេខទូរស័ព្ទ ឬអ៊ីមែលនេះមានគណនីរួចហើយ! សូមជ្រើសរើសផ្ទាំង «ចូលប្រើប្រាស់ (Login)» វិញ។',
        };
      }
      if (err.code === 'auth/weak-password') {
        return {
          success: false,
          error: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់ឡើងទៅ!',
        };
      }
      // If offline or network issue, continue with local tenant ID
      console.warn('Firebase Auth error, falling back to local tenant creation:', err);
    }
  }

  // 2. Generate isolated Store Tenant ID (e.g. STORE-012629160 or STORE-8F2B)
  const phonePart = phone ? cleanPhoneNumber(phone).slice(-6) : '';
  const uidPart = uid.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();
  const newStoreId = `STORE-${phonePart || uidPart || Math.floor(100000 + Math.random() * 900000)}`;

  const account: StoreUserAccount = {
    uid,
    storeId: newStoreId,
    storeName,
    email: email || undefined,
    phone: phone || undefined,
    role: 'OWNER',
    authProvider: isPhone ? 'phone' : 'email',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  // 3. Register on Firestore users & tenants
  if (db) {
    try {
      // User mapping
      await setDoc(doc(db, 'users', uid), account, { merge: true });

      // Store profile in isolated tenant
      await setDoc(
        doc(db, 'tenants', newStoreId, 'settings', 'storeInfo'),
        {
          nameKh: storeName,
          nameEn: storeName,
          phone: phone || '',
          storeId: newStoreId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Store registry for directory & devices
      await setDoc(
        doc(db, 'store_registry', newStoreId),
        {
          storeId: newStoreId,
          storeName,
          ownerUid: uid,
          ownerPhone: phone || '',
          ownerEmail: email || '',
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Error saving store profile to cloud:', e);
    }
  }

  // 4. Set active store ID and save session
  setStoreId(newStoreId);
  saveStoreUserSession(account);

  return { success: true, account };
};

/**
 * Sign In / Login to an existing Bakery Store
 */
export const signInStore = async (
  emailOrPhone: string,
  password?: string
): Promise<{ success: boolean; error?: string; account?: StoreUserAccount }> => {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const rawIdent = emailOrPhone.trim();
  const isPhone = !rawIdent.includes('@');
  const firebaseEmail = toFirebaseEmail(rawIdent);
  const pass = password || 'BakeryPass123!';

  if (!auth) {
    return {
      success: false,
      error: 'មិនទាន់ភ្ជាប់ទៅកាន់ Firebase Cloud នៅឡើយទេ!',
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, firebaseEmail, pass);
    const uid = cred.user.uid;

    let account: StoreUserAccount | null = null;

    // Fetch user mapping from Firestore
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          account = userDoc.data() as StoreUserAccount;
        }
      } catch (e) {}
    }

    // Fallback if not found in db
    if (!account) {
      const digits = cleanPhoneNumber(rawIdent);
      const storeId = `STORE-${digits.slice(-6) || uid.slice(0, 6).toUpperCase()}`;
      account = {
        uid,
        storeId,
        storeName: 'ហាងនំ SweetBakery',
        email: !isPhone ? rawIdent : undefined,
        phone: isPhone ? rawIdent : undefined,
        role: 'OWNER',
        authProvider: isPhone ? 'phone' : 'email',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }

    account.lastLoginAt = new Date().toISOString();

    // Switch store ID and establish cloud tenant listeners
    setStoreId(account.storeId);
    saveStoreUserSession(account);

    return { success: true, account };
  } catch (err: any) {
    console.error('Sign In Error:', err);
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      return {
        success: false,
        error: 'លេខទូរស័ព្ទ/អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ!',
      };
    }
    if (err.code === 'auth/wrong-password') {
      return {
        success: false,
        error: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ សូមសាកល្បងម្ដងទៀត!',
      };
    }
    return {
      success: false,
      error: err.message || 'មានបញ្ហាក្នុងការចូលប្រើប្រាស់!',
    };
  }
};

/**
 * 1-Click Google Sign In
 */
export const signInWithGoogle = async (): Promise<{
  success: boolean;
  error?: string;
  account?: StoreUserAccount;
}> => {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  if (!auth) {
    return { success: false, error: 'មិនអាចភ្ជាប់ Firebase Auth បានទេ!' };
  }

  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;

    let account: StoreUserAccount | null = null;

    if (db) {
      try {
        const uDoc = await getDoc(doc(db, 'users', user.uid));
        if (uDoc.exists()) {
          account = uDoc.data() as StoreUserAccount;
        }
      } catch (e) {}
    }

    if (!account) {
      const storeId = `STORE-${user.uid.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()}`;
      const storeName = user.displayName ? `ហាង ${user.displayName}` : 'ហាងនំ SweetBakery';

      account = {
        uid: user.uid,
        storeId,
        storeName,
        email: user.email || undefined,
        role: 'OWNER',
        authProvider: 'google',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      if (db) {
        await setDoc(doc(db, 'users', user.uid), account, { merge: true }).catch(() => {});
        await setDoc(
          doc(db, 'tenants', storeId, 'settings', 'storeInfo'),
          { nameKh: storeName, nameEn: storeName, storeId },
          { merge: true }
        ).catch(() => {});
      }
    }

    account.lastLoginAt = new Date().toISOString();
    setStoreId(account.storeId);
    saveStoreUserSession(account);

    return { success: true, account };
  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    return { success: false, error: err.message || 'មិនអាចចូលគណនី Google បានទេ!' };
  }
};

/**
 * Connect to an existing store using Store ID (for staff, cashiers, kitchen tablets)
 */
export const joinStoreById = async (
  targetStoreId: string,
  passcode?: string
): Promise<{ success: boolean; error?: string; account?: StoreUserAccount }> => {
  const cleanId = targetStoreId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!cleanId) {
    return { success: false, error: 'សូមបញ្ចូល Store ID ឱ្យបានត្រឹមត្រូវ!' };
  }

  const account: StoreUserAccount = {
    uid: `staff_${Date.now()}`,
    storeId: cleanId,
    storeName: `ហាង (${cleanId})`,
    role: 'CASHIER',
    authProvider: 'store_id',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  setStoreId(cleanId);
  saveStoreUserSession(account);

  return { success: true, account };
};

/**
 * Log out from current store account
 */
export const logoutStore = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {}
  }
  saveStoreUserSession(null);
  // Reset store ID to DEFAULT or clean state
  setStoreId(DEFAULT_STORE_ID);
};
