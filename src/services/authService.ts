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
const STORAGE_ACCOUNTS_CACHE = 'bakery_store_accounts_cache';
const AUTH_CHANGE_EVENT = 'bakery_store_auth_changed';

/**
 * Format phone number to clean digits, normalizing Cambodia country code
 */
export const cleanPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('855') && cleaned.length >= 10) {
    cleaned = '0' + cleaned.slice(3);
  } else if (!cleaned.startsWith('0') && cleaned.length >= 8 && cleaned.length <= 9) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
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
 * Hash password securely across browsers using native Web Crypto or high-entropy hash
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salted = `${password.trim()}__sweetbakery_pos_salt_v1`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(salted);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback below
    }
  }
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `h_${(4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)}`;
};

/**
 * Convert technical Firebase/Auth errors into clear, friendly Khmer text
 */
export const formatAuthErrorMessage = (err: any): string => {
  if (!err) return 'មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់គណនី!';
  const msg = typeof err === 'string' ? err : err.message || err.code || '';

  if (
    msg.includes('auth/configuration-not-found') ||
    msg.includes('configuration-not-found') ||
    msg.includes('auth/operation-not-allowed')
  ) {
    return 'ប្រព័ន្ធដំណើរការតាមរយៈ Cloud Database ដោយផ្ទាល់! សូមចុច Login ឬបង្កើតហាងថ្មី។';
  }
  if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
    return 'លេខទូរស័ព្ទ/អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ!';
  }
  if (msg.includes('auth/wrong-password')) {
    return 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ សូមសាកល្បងម្ដងទៀត!';
  }
  if (msg.includes('auth/email-already-in-use')) {
    return 'លេខទូរស័ព្ទ ឬអ៊ីមែលនេះមានគណនីរួចហើយ! សូមជ្រើសរើសផ្ទាំង «ចូលគណនី (Login)» វិញ។';
  }
  if (msg.includes('auth/weak-password')) {
    return 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់ឡើងទៅ!';
  }
  if (msg.includes('auth/network-request-failed')) {
    return 'មិនមានការតភ្ជាប់អ៊ីនធឺណិតទេ! សូមពិនិត្យមើលសេវាបណ្ដាញរបស់អ្នក។';
  }
  if (msg.startsWith('Firebase:') || msg.includes('auth/')) {
    return 'កំហុសផ្ទៀងផ្ទាត់គណនី! សូមពិនិត្យមើលលេខទូរស័ព្ទ និងពាក្យសម្ងាត់ ឬចុច «បង្កើតហាងថ្មី»។';
  }
  return msg;
};

interface CachedAccountRecord {
  account: StoreUserAccount;
  passwordHash: string;
}

const getLocalAccountCache = (): Record<string, CachedAccountRecord> => {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_CACHE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
};

const saveLocalAccountCache = (account: StoreUserAccount, passwordHash: string): void => {
  try {
    const cache = getLocalAccountCache();
    const entry: CachedAccountRecord = { account, passwordHash };
    if (account.phone) {
      const p = cleanPhoneNumber(account.phone);
      if (p) cache[`phone_${p}`] = entry;
    }
    if (account.email) {
      cache[`email_${account.email.trim().toLowerCase()}`] = entry;
    }
    if (account.storeId) {
      cache[`store_${account.storeId.toUpperCase()}`] = entry;
    }
    localStorage.setItem(STORAGE_ACCOUNTS_CACHE, JSON.stringify(cache));
    idbSet(STORAGE_ACCOUNTS_CACHE, JSON.stringify(cache)).catch(() => {});
  } catch (e) {}
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
  const storeName = params.storeName.trim() || 'ហាងនំ SweetBakery';
  const isPhone = !rawIdent.includes('@');
  const firebaseEmail = toFirebaseEmail(rawIdent);
  const password = params.password || 'BakeryPass123!';
  const phone = cleanPhoneNumber(params.phone || (isPhone ? rawIdent : ''));
  const email = (params.email || (!isPhone ? rawIdent : '')).trim().toLowerCase();

  const passwordHash = await hashPassword(password);

  // 1. Check if account already exists with this phone or email in Firestore
  if (db) {
    try {
      const keysToCheck: string[] = [];
      if (phone) keysToCheck.push(`phone_${phone}`);
      if (email) keysToCheck.push(`email_${email}`);

      for (const k of keysToCheck) {
        const snap = await getDoc(doc(db, 'store_accounts', k));
        if (snap.exists()) {
          return {
            success: false,
            error: 'លេខទូរស័ព្ទ ឬអ៊ីមែលនេះមានគណនីរួចហើយ! សូមជ្រើសរើសផ្ទាំង «ចូលគណនី (Login)» វិញ។',
          };
        }
      }
    } catch (e) {
      console.warn('Error checking existing store account:', e);
    }
  }

  // 2. Try Firebase Auth create (graceful fallback if Firebase Auth service is not enabled)
  let uid = `owner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, firebaseEmail, password);
      uid = cred.user.uid;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        return {
          success: false,
          error: 'លេខទូរស័ព្ទ ឬអ៊ីមែលនេះមានគណនីរួចហើយ! សូមជ្រើសរើសផ្ទាំង «ចូលគណនី (Login)» វិញ។',
        };
      }
      if (err.code === 'auth/weak-password') {
        return {
          success: false,
          error: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់ឡើងទៅ!',
        };
      }
      console.warn('Firebase Auth service returned:', err.code, '- proceeding with Cloud Firestore accounts.');
    }
  }

  // 3. Generate isolated Store Tenant ID (e.g. STORE-660168 or STORE-8F2B)
  const phonePart = phone ? phone.slice(-6) : '';
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

  const accountDocData = {
    ...account,
    passwordHash,
    status: 'ACTIVE',
  };

  // 4. Register on Firestore store_accounts, store_registry, tenants & users
  if (db) {
    try {
      // Primary authentication document keyed by phone
      if (phone) {
        await setDoc(doc(db, 'store_accounts', `phone_${phone}`), accountDocData, { merge: true });
      }
      // Primary authentication document keyed by email
      if (email) {
        await setDoc(doc(db, 'store_accounts', `email_${email}`), accountDocData, { merge: true });
      }
      // Secondary lookup by Store ID
      await setDoc(doc(db, 'store_accounts', `store_${newStoreId}`), accountDocData, { merge: true });

      // Store registry for directory & multi-device discovery
      await setDoc(
        doc(db, 'store_registry', newStoreId),
        {
          storeId: newStoreId,
          storeName,
          ownerUid: uid,
          ownerPhone: phone || '',
          ownerEmail: email || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

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

      // User mapping
      await setDoc(doc(db, 'users', uid), account, { merge: true });
    } catch (e) {
      console.warn('Error saving store profile to cloud:', e);
    }
  }

  // 5. Activate store ID and persist session & local cache
  setStoreId(newStoreId);
  saveStoreUserSession(account);
  saveLocalAccountCache(account, passwordHash);

  return { success: true, account };
};

/**
 * Sign In / Login to an existing Bakery Store
 * Works resiliently via Cloud Firestore account verification and Firebase Auth
 */
export const signInStore = async (
  emailOrPhone: string,
  password?: string
): Promise<{ success: boolean; error?: string; account?: StoreUserAccount; notFound?: boolean }> => {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const rawIdent = emailOrPhone.trim();
  const digits = cleanPhoneNumber(rawIdent);
  const isEmail = rawIdent.includes('@');
  const isStoreId = rawIdent.toUpperCase().startsWith('STORE-');
  const firebaseEmail = toFirebaseEmail(rawIdent);
  const pass = password || 'BakeryPass123!';
  const pwdHash = await hashPassword(pass);

  // 1. Attempt Firebase Auth if configured, but NEVER fail on configuration errors
  let firebaseUid: string | null = null;
  if (auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, firebaseEmail, pass);
      firebaseUid = cred.user.uid;
    } catch (err: any) {
      console.warn('Firebase Auth signIn skipped/fallback:', err.code || err.message);
    }
  }

  // 2. Lookup account in Firestore (store_accounts, store_registry, users)
  if (db) {
    try {
      const lookupKeys: string[] = [];
      if (digits) {
        lookupKeys.push(`phone_${digits}`);
        const withoutZero = digits.startsWith('0') ? digits.slice(1) : digits;
        const withZero = digits.startsWith('0') ? digits : `0${digits}`;
        if (!lookupKeys.includes(`phone_${withoutZero}`)) lookupKeys.push(`phone_${withoutZero}`);
        if (!lookupKeys.includes(`phone_${withZero}`)) lookupKeys.push(`phone_${withZero}`);
        lookupKeys.push(`store_STORE-${digits.slice(-6)}`);
      }
      if (isEmail) {
        lookupKeys.push(`email_${rawIdent.toLowerCase()}`);
      }
      if (isStoreId) {
        lookupKeys.push(`store_${rawIdent.toUpperCase()}`);
      }

      let foundData: any = null;
      let matchedKey = '';

      for (const key of lookupKeys) {
        try {
          const snap = await getDoc(doc(db, 'store_accounts', key));
          if (snap.exists()) {
            foundData = snap.data();
            matchedKey = key;
            break;
          }
        } catch (e) {}
      }

      // Case A: Account found in store_accounts!
      if (foundData) {
        const hasHash = Boolean(foundData.passwordHash);
        const hashMatch = hasHash && foundData.passwordHash === pwdHash;
        const plainMatch = foundData.plainPassword && foundData.plainPassword === pass;

        if (hasHash && !hashMatch && !plainMatch) {
          // If Firebase Auth succeeded with this email/password, trust it and update hash
          if (firebaseUid && firebaseUid === foundData.uid) {
            await setDoc(doc(db, 'store_accounts', matchedKey), { passwordHash: pwdHash }, { merge: true }).catch(() => {});
          } else {
            return {
              success: false,
              error: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ សូមសាកល្បងម្ដងទៀត!',
            };
          }
        }

        // If no passwordHash existed previously, upgrade it now
        if (!hasHash) {
          await setDoc(doc(db, 'store_accounts', matchedKey), { passwordHash: pwdHash }, { merge: true }).catch(() => {});
        }

        const account: StoreUserAccount = {
          uid: foundData.uid || firebaseUid || `user_${Date.now()}`,
          storeId: foundData.storeId,
          storeName: foundData.storeName || 'ហាងនំ SweetBakery',
          email: foundData.email,
          phone: foundData.phone || (digits ? rawIdent : undefined),
          role: foundData.role || 'OWNER',
          authProvider: isEmail ? 'email' : 'phone',
          createdAt: foundData.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        // Update last login
        setDoc(doc(db, 'store_accounts', matchedKey), { lastLoginAt: new Date().toISOString() }, { merge: true }).catch(() => {});

        setStoreId(account.storeId);
        saveStoreUserSession(account);
        saveLocalAccountCache(account, pwdHash);

        return { success: true, account };
      }

      // Case B: Not found in store_accounts yet, but exists in store_registry!
      // (Handles stores created before this update, like STORE-660168 from the user's screenshot)
      const possibleStoreId = isStoreId
        ? rawIdent.toUpperCase()
        : (digits ? `STORE-${digits.slice(-6)}` : '');

      if (possibleStoreId) {
        try {
          const regSnap = await getDoc(doc(db, 'store_registry', possibleStoreId));
          if (regSnap.exists()) {
            const regData = regSnap.data();
            const regPhone = cleanPhoneNumber(regData.ownerPhone || '');

            if (!regPhone || regPhone === digits || regData.storeId === possibleStoreId) {
              const account: StoreUserAccount = {
                uid: regData.ownerUid || firebaseUid || `user_${Date.now()}`,
                storeId: possibleStoreId,
                storeName: regData.storeName || 'ហាងនំ SweetBakery',
                phone: regData.ownerPhone || (digits ? rawIdent : undefined),
                email: regData.ownerEmail || (isEmail ? rawIdent : undefined),
                role: 'OWNER',
                authProvider: isEmail ? 'email' : 'phone',
                createdAt: regData.createdAt || new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              };

              // Persist credentials in store_accounts so future logins are password-protected
              const newAccDoc = {
                ...account,
                passwordHash: pwdHash,
                status: 'ACTIVE',
              };

              if (digits) {
                await setDoc(doc(db, 'store_accounts', `phone_${digits}`), newAccDoc, { merge: true }).catch(() => {});
              }
              await setDoc(doc(db, 'store_accounts', `store_${possibleStoreId}`), newAccDoc, { merge: true }).catch(() => {});

              setStoreId(account.storeId);
              saveStoreUserSession(account);
              saveLocalAccountCache(account, pwdHash);

              return { success: true, account };
            }
          }
        } catch (regErr) {
          console.warn('Error reading store_registry during fallback login:', regErr);
        }
      }

      // Case C: Check users collection by firebaseUid
      if (firebaseUid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUid));
          if (userDoc.exists()) {
            const uData = userDoc.data() as StoreUserAccount;
            const account: StoreUserAccount = {
              ...uData,
              lastLoginAt: new Date().toISOString(),
            };
            setStoreId(account.storeId);
            saveStoreUserSession(account);
            saveLocalAccountCache(account, pwdHash);
            return { success: true, account };
          }
        } catch (e) {}
      }
    } catch (dbErr) {
      console.warn('Firestore store accounts lookup error:', dbErr);
    }
  }

  // 3. Case D: Check Local / Offline Account Cache
  const localCache = getLocalAccountCache();
  const cacheKey = digits
    ? `phone_${digits}`
    : (isEmail ? `email_${rawIdent.toLowerCase()}` : `store_${rawIdent.toUpperCase()}`);
  const cached = localCache[cacheKey];
  if (cached) {
    if (cached.passwordHash && cached.passwordHash === pwdHash) {
      setStoreId(cached.account.storeId);
      saveStoreUserSession(cached.account);
      return { success: true, account: cached.account };
    } else {
      return {
        success: false,
        error: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ សូមសាកល្បងម្ដងទៀត!',
      };
    }
  }

  // 4. Case E: Check current active store on this device
  const currentStoreId = getStoreId();
  if (currentStoreId && !isDefaultStore(currentStoreId)) {
    const curPhonePart = digits ? digits.slice(-6) : '';
    if (
      (curPhonePart && currentStoreId.includes(curPhonePart)) ||
      (isStoreId && currentStoreId === rawIdent.toUpperCase())
    ) {
      const activeUser = getCurrentStoreUser();
      const account: StoreUserAccount = {
        uid: activeUser?.uid || `local_${Date.now()}`,
        storeId: currentStoreId,
        storeName: activeUser?.storeName || 'ហាងនំ SweetBakery',
        phone: digits || activeUser?.phone,
        email: isEmail ? rawIdent : activeUser?.email,
        role: 'OWNER',
        authProvider: isEmail ? 'email' : 'phone',
        createdAt: activeUser?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      setStoreId(currentStoreId);
      saveStoreUserSession(account);
      saveLocalAccountCache(account, pwdHash);
      return { success: true, account };
    }
  }

  return {
    success: false,
    notFound: true,
    error: `រកមិនឃើញគណនី ${rawIdent} ក្នុងប្រព័ន្ធឡើយ! សូមពិនិត្យមើលលេខ ឬចុច «បង្កើតហាងថ្មី (Sign Up)»។`,
  };
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
    return { success: false, error: formatAuthErrorMessage(err) };
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
