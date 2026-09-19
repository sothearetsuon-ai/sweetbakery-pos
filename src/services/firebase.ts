import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
} from 'firebase/storage';
import { BakeryBackupData, CompletedSale, CustomCakeOrder, Expense, Ingredient, Product, StaffMember, StoreInfo } from '../types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const STORAGE_KEY = 'bakery_firebase_config';
const DISABLED_KEY = 'bakery_firebase_disabled';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyAUcTJMNMOAjT_FrtmJsaM68otwUnujrXg',
  authDomain: 'sweetbakery-8040d.firebaseapp.com',
  projectId: 'sweetbakery-8040d',
  storageBucket: 'sweetbakery-8040d.firebasestorage.app',
  messagingSenderId: '1077374283025',
  appId: '1:1077374283025:web:0cf174a5e032226bb470b0',
};

/**
 * Retrieve saved Firebase config from localStorage or default
 */
export const getStoredFirebaseConfig = (): FirebaseConfig | null => {
  try {
    if (localStorage.getItem(DISABLED_KEY) === 'true') {
      return null;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading saved Firebase config:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
};

/**
 * Save Firebase config to localStorage
 */
export const saveStoredFirebaseConfig = (config: FirebaseConfig): void => {
  localStorage.removeItem(DISABLED_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

/**
 * Clear Firebase config from localStorage
 */
export const clearStoredFirebaseConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(DISABLED_KEY, 'true');
};

/**
 * Smart parser to extract Firebase config from raw text
 * Supports JSON, JS object syntax, or pasted config snippet from Firebase Console
 */
export const parseFirebaseConfigInput = (input: string): FirebaseConfig | null => {
  if (!input || !input.trim()) return null;
  const trimmed = input.trim();

  // Try direct JSON parse
  try {
    const obj = JSON.parse(trimmed);
    if (obj.apiKey && obj.projectId) {
      return {
        apiKey: obj.apiKey.trim(),
        authDomain: (obj.authDomain || '').trim(),
        projectId: obj.projectId.trim(),
        storageBucket: (obj.storageBucket || '').trim(),
        messagingSenderId: (obj.messagingSenderId || '').trim(),
        appId: (obj.appId || '').trim(),
      };
    }
  } catch (e) {
    // Not valid JSON, try regex extraction
  }

  // Regex extract for JS object or snippet
  const extractField = (fieldName: string): string => {
    const regex = new RegExp(`${fieldName}['"\\s]*:['"\\s]*([^'",\\s]+)['",]`, 'i');
    const match = trimmed.match(regex);
    return match ? match[1].trim() : '';
  };

  const apiKey = extractField('apiKey');
  const projectId = extractField('projectId');
  const authDomain = extractField('authDomain');
  const storageBucket = extractField('storageBucket');
  const messagingSenderId = extractField('messagingSenderId');
  const appId = extractField('appId');

  if (apiKey && projectId) {
    return {
      apiKey,
      projectId,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      storageBucket: storageBucket || `${projectId}.firebasestorage.app`,
      messagingSenderId,
      appId,
    };
  }

  return null;
};

let currentApp: FirebaseApp | null = null;
let currentDb: Firestore | null = null;

/**
 * Get or initialize Firebase App
 */
export const getFirebaseApp = (customConfig?: FirebaseConfig): FirebaseApp | null => {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  const appName = 'sweet-bakery-pos';
  const existingApps = getApps();
  const existing = existingApps.find((a) => a.name === appName);
  if (existing) {
    currentApp = existing;
    return existing;
  }

  try {
    currentApp = initializeApp(config, appName);
    return currentApp;
  } catch (e) {
    console.error('Firebase App Initialization Error:', e);
    return null;
  }
};

/**
 * Get or initialize Cloud Firestore with offline persistence
 */
export const getFirestoreDb = (customConfig?: FirebaseConfig): Firestore | null => {
  if (currentDb) return currentDb;

  const app = getFirebaseApp(customConfig);
  if (!app) return null;

  try {
    const db = getFirestore(app);
    // Attempt offline persistence if available
    try {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time.
        } else if (err.code === 'unimplemented') {
          // Browser does not support persistence
        }
      });
    } catch (e) {
      // Ignore
    }

    currentDb = db;
    return db;
  } catch (e) {
    console.error('Firestore DB Initialization Error:', e);
    return null;
  }
};

/**
 * Test Firebase Connection and measure latency
 */
export const testFirebaseConnection = async (
  config: FirebaseConfig
): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
  const startTime = performance.now();
  try {
    const tempAppName = `test-conn-${Date.now()}`;
    const testApp = initializeApp(config, tempAppName);
    const testDb = getFirestore(testApp);

    // Try a ping read on a test collection
    const testCollection = collection(testDb, '_connection_test');
    await getDocs(testCollection);

    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: true,
      message: `ការតភ្ជាប់ជោគជ័យ! (ល្បឿនឆ្លើយតប: ${latencyMs}ms)`,
      latencyMs,
    };
  } catch (error: any) {
    console.error('Firebase Connection Test Failed:', error);
    let errorKh = error.message || 'កំហុសមិនស្គាល់';
    if (error.code === 'permission-denied') {
      errorKh = 'គ្មានសិទ្ធិចូលប្រើប្រាស់ (Permission Denied)។ សូមពិនិត្យមើល Firestore Security Rules (ជ្រើសរើស Test Mode)';
    } else if (error.code === 'unavailable') {
      errorKh = 'មិនអាចទាក់ទង Google Server បានឡើយ។ សូមពិនិត្យមើលការតភ្ជាប់អ៊ីនធឺណិត';
    }
    return {
      success: false,
      message: `ការតភ្ជាប់បរាជ័យ: ${errorKh}`,
    };
  }
};

/**
 * Save single document to a collection
 */
export const saveFirestoreDoc = async (
  collectionName: string,
  docId: string,
  data: any
): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) return;
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (e) {
    console.error(`Error saving document to ${collectionName}/${docId}:`, e);
  }
};

/**
 * Delete single document from a collection
 */
export const deleteFirestoreDoc = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) return;
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error(`Error deleting document from ${collectionName}/${docId}:`, e);
  }
};

/**
 * Subscribe to real-time changes in a collection
 */
export const subscribeToFirestoreCollection = <T>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (error: any) => void
): (() => void) => {
  const db = getFirestoreDb();
  if (!db) {
    return () => {};
  }

  const colRef = collection(db, collectionName);
  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as T);
      });
      onUpdate(items);
    },
    (err) => {
      console.warn(`Firestore listener error on ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
};

/**
 * Subscribe to real-time changes in a single document
 */
export const subscribeToFirestoreDoc = <T>(
  collectionName: string,
  docId: string,
  onUpdate: (data: T) => void,
  onError?: (error: any) => void
): (() => void) => {
  const db = getFirestoreDb();
  if (!db) {
    return () => {};
  }

  const docRef = doc(db, collectionName, docId);
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as T);
      }
    },
    (err) => {
      console.warn(`Firestore listener error on ${collectionName}/${docId}:`, err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
};

/**
 * Bulk upload all local store data into Cloud Firestore
 */
export const bulkUploadLocalToFirebase = async (
  data: BakeryBackupData
): Promise<{ success: boolean; message: string; counts: any }> => {
  const db = getFirestoreDb();
  if (!db) {
    return { success: false, message: 'Google Firebase មិនទាន់ត្រូវបានតភ្ជាប់ឡើយ', counts: {} };
  }

  try {
    let uploadedSales = 0;
    let uploadedProducts = 0;
    let uploadedOrders = 0;
    let uploadedExpenses = 0;
    let uploadedStaff = 0;
    let uploadedIngredients = 0;

    // Save Settings
    if (data.storeInfo) {
      await setDoc(doc(db, 'settings', 'storeInfo'), data.storeInfo);
    }
    if (data.exchangeRate) {
      await setDoc(doc(db, 'settings', 'currency'), { exchangeRate: data.exchangeRate });
    }
    if (data.flavors && data.flavors.length) {
      await setDoc(doc(db, 'settings', 'flavors'), { list: data.flavors });
    }

    // Upload Products
    for (const p of data.products || []) {
      await setDoc(doc(db, 'products', p.id), p);
      uploadedProducts++;
    }

    // Upload Sales
    for (const s of data.sales || []) {
      await setDoc(doc(db, 'sales', s.id), s);
      uploadedSales++;
    }

    // Upload Custom Orders
    for (const o of data.customOrders || []) {
      await setDoc(doc(db, 'customOrders', o.id), o);
      uploadedOrders++;
    }

    // Upload Expenses
    for (const e of data.expenses || []) {
      await setDoc(doc(db, 'expenses', e.id), e);
      uploadedExpenses++;
    }

    // Upload Staff
    for (const st of data.staffMembers || []) {
      await setDoc(doc(db, 'staffMembers', st.id), st);
      uploadedStaff++;
    }

    // Upload Ingredients
    for (const ing of data.ingredients || []) {
      await setDoc(doc(db, 'ingredients', ing.id), ing);
      uploadedIngredients++;
    }

    return {
      success: true,
      message: 'បាន Sync ទិន្នន័យឡើង Cloud Firebase ជោគជ័យ!',
      counts: {
        products: uploadedProducts,
        sales: uploadedSales,
        orders: uploadedOrders,
        expenses: uploadedExpenses,
        staff: uploadedStaff,
        ingredients: uploadedIngredients,
      },
    };
  } catch (error: any) {
    console.error('Bulk upload to Firebase failed:', error);
    return {
      success: false,
      message: `កំហុសក្នុងការ Upload: ${error.message || 'Error'}`,
      counts: {},
    };
  }
};

/**
 * Fetch all data from Cloud Firestore to restore locally
 */
export const fetchEntireFirestoreData = async (): Promise<Partial<BakeryBackupData> | null> => {
  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const [
      productsSnap,
      salesSnap,
      ordersSnap,
      expensesSnap,
      staffSnap,
      ingredientsSnap,
      settingsSnap,
    ] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'sales')),
      getDocs(collection(db, 'customOrders')),
      getDocs(collection(db, 'expenses')),
      getDocs(collection(db, 'staffMembers')),
      getDocs(collection(db, 'ingredients')),
      getDocs(collection(db, 'settings')),
    ]);

    const products: Product[] = [];
    productsSnap.forEach((d) => products.push({ id: d.id, ...d.data() } as Product));

    const sales: CompletedSale[] = [];
    salesSnap.forEach((d) => sales.push({ id: d.id, ...d.data() } as CompletedSale));

    const customOrders: CustomCakeOrder[] = [];
    ordersSnap.forEach((d) => customOrders.push({ id: d.id, ...d.data() } as CustomCakeOrder));

    const expenses: Expense[] = [];
    expensesSnap.forEach((d) => expenses.push({ id: d.id, ...d.data() } as Expense));

    const staffMembers: StaffMember[] = [];
    staffSnap.forEach((d) => staffMembers.push({ id: d.id, ...d.data() } as StaffMember));

    const ingredients: Ingredient[] = [];
    ingredientsSnap.forEach((d) => ingredients.push({ id: d.id, ...d.data() } as Ingredient));

    let storeInfo: StoreInfo | undefined;
    let exchangeRate: number | undefined;

    settingsSnap.forEach((d) => {
      if (d.id === 'storeInfo') storeInfo = d.data() as StoreInfo;
      if (d.id === 'currency') exchangeRate = d.data().exchangeRate;
    });

    return {
      products,
      sales,
      customOrders,
      expenses,
      staffMembers,
      ingredients,
      storeInfo,
      exchangeRate,
    };
  } catch (error) {
    console.error('Failed to fetch entire Firestore data:', error);
    return null;
  }
};

let currentStorage: FirebaseStorage | null = null;

/**
 * Get or initialize Firebase Storage
 */
export const getFirebaseStorage = (): FirebaseStorage | null => {
  if (currentStorage) return currentStorage;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    currentStorage = getStorage(app);
    return currentStorage;
  } catch (e) {
    console.error('Firebase Storage Init Error:', e);
    return null;
  }
};

/**
 * Upload Audio file to Firebase Cloud Storage with progress callback
 */
export const uploadAudioToFirebaseStorage = async (
  file: File | Blob,
  fileName: string,
  onProgress?: (percent: number) => void
): Promise<{ downloadUrl: string; storagePath: string } | null> => {
  const storage = getFirebaseStorage();
  if (!storage) return null;

  try {
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `bakery_music/${Date.now()}_${cleanName}`;
    const fileRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.warn('Audio upload to Firebase Storage failed:', error);
          resolve(null);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ downloadUrl, storagePath });
          } catch (err) {
            console.error('Error getting audio download URL:', err);
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.warn('Storage upload exception:', error);
    return null;
  }
};

/**
 * Delete Audio file from Firebase Cloud Storage
 */
export const deleteAudioFromFirebaseStorage = async (storagePath: string): Promise<void> => {
  const storage = getFirebaseStorage();
  if (!storage || !storagePath) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (e) {
    console.warn('Error deleting audio file from storage:', e);
  }
};

