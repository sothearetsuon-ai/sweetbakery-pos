import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  Language,
  Product,
  Category,
  CartItem,
  CustomCakeOrder,
  OrderStatus,
  Ingredient,
  CompletedSale,
  Shift,
  Expense,
  StoreInfo,
  StaffMember,
  StaffRole,
  StaffPermissions,
  BakeryBackupData,
  PartyAddon,
  Recipe,
  ReserveFund,
  ReserveFundTransaction,
  DemoDeviceVisitor,
} from '../types';
import { recordDemoDeviceVisit, subscribeToDemoDevices } from '../services/demoTracker';
import {
  initialCategories,
  initialProducts,
  initialOrders,
  initialIngredients,
  initialSales,
  initialShift,
  initialFlavors,
  initialExpenses,
  demoExpenses,
  initialStaffMembers,
  demoStaffMembers,
  initialRecipes,
} from '../data/mockData';
import { sortProductsNewestFirst } from '../utils/productUtils';
import { idbGet, idbSet } from '../utils/idbStorage';
import {
  getStoredFirebaseConfig,
  getFirestoreDb,
  subscribeToFirestoreCollection,
  subscribeToFirestoreDoc,
  saveFirestoreDoc as rawSaveFirestoreDoc,
  deleteFirestoreDoc as rawDeleteFirestoreDoc,
  subscribeToStoreIdChange,
  getStoreId,
} from '../services/firebase';
import {
  notifyTelegramSale as rawNotifyTelegramSale,
  notifyTelegramCustomOrder as rawNotifyTelegramCustomOrder,
  notifyTelegramExpense as rawNotifyTelegramExpense,
  notifyTelegramShiftClose as rawNotifyTelegramShiftClose,
  getStoredTelegramConfig,
  saveStoredTelegramConfig,
  TelegramConfig,
} from '../services/telegram';
import { setGeminiApiKeyLocally } from '../services/geminiInvoiceService';
import { offlineSyncService, SyncState } from '../services/offlineSyncService';
import { soundFx } from '../utils/audio';
import { formatDateDMY, formatDateTimeDMY, normalizeDateToYMD } from '../utils/dateUtils';

// Global demo mode flag to safely block cloud sync, LAN disk writes, and Telegram alerts during Demo mode
let globalIsDemoMode = false;
export const setGlobalIsDemoMode = (val: boolean) => {
  globalIsDemoMode = val;
};
export const getGlobalIsDemoMode = () => globalIsDemoMode;

export const checkInitialDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === 'true' || window.location.hash === '#demo') {
    return true;
  }
  return localStorage.getItem('bakery_is_demo_mode') === 'true';
};

globalIsDemoMode = checkInitialDemoMode();

// Safely block writes and notifications during Demo Mode
const saveFirestoreDoc = (collectionName: string, docId: string, data: any) => {
  if (globalIsDemoMode) return Promise.resolve(false);
  return rawSaveFirestoreDoc(collectionName, docId, data);
};

const deleteFirestoreDoc = (collectionName: string, docId: string) => {
  if (globalIsDemoMode) return Promise.resolve(false);
  return rawDeleteFirestoreDoc(collectionName, docId);
};

const notifyTelegramSale = async (...args: Parameters<typeof rawNotifyTelegramSale>) => {
  if (globalIsDemoMode) return null;
  return rawNotifyTelegramSale(...args);
};

const notifyTelegramCustomOrder = async (...args: Parameters<typeof rawNotifyTelegramCustomOrder>) => {
  if (globalIsDemoMode) return null;
  return rawNotifyTelegramCustomOrder(...args);
};

// Persistent deletion tracking across sessions & page reloads
const loadDeletedIds = (key: string): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`bakery_deleted_${key}_ids`);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
};

const recordDeletedId = (key: string, id: string, setRef?: React.MutableRefObject<Set<string>>) => {
  if (setRef?.current) {
    setRef.current.add(id);
  }
  if (typeof window === 'undefined') return;
  try {
    let currentArr: string[] = [];
    const raw = localStorage.getItem(`bakery_deleted_${key}_ids`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) currentArr = parsed;
    }
    if (!currentArr.includes(id)) {
      currentArr.push(id);
    }
    const trimmed = currentArr.slice(-500);
    localStorage.setItem(`bakery_deleted_${key}_ids`, JSON.stringify(trimmed));

    // Propagate deletion to cloud so all devices (mobile phones & PC) purge the item immediately
    if (!globalIsDemoMode) {
      const propKey = `deleted${key.charAt(0).toUpperCase() + key.slice(1)}Ids`;
      saveFirestoreDoc('settings', 'deletedRecords', {
        [propKey]: trimmed,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (e) {}
};

const notifyTelegramExpense = async (...args: Parameters<typeof rawNotifyTelegramExpense>) => {
  if (globalIsDemoMode) return null;
  return rawNotifyTelegramExpense(...args);
};

const notifyTelegramShiftClose = async (...args: Parameters<typeof rawNotifyTelegramShiftClose>) => {
  if (globalIsDemoMode) return null;
  return rawNotifyTelegramShiftClose(...args);
};

// Safe LAN Fetch: prevents any write/sync to backend JSON disk files during Demo Mode
const fetch: typeof window.fetch = (input, init) => {
  if (globalIsDemoMode) {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
    if (urlStr.includes('/api/')) {
      return Promise.resolve(new Response(JSON.stringify({ success: true, demo: true, exists: false })));
    }
  }
  return window.fetch(input, init);
};

export const demoStoreInfo: StoreInfo = {
  nameKh: 'ហាងនំគំរូ សាកល្បង (SweetBakery Demo)',
  nameEn: 'SweetBakery Demo Sandbox',
  logoUrl: '/uploads/products/prod_1789651345094_x6k2.jpg',
  phone: '012 345 678',
  address: 'រាជធានីភ្នំពេញ (ទីតាំងគំរូ Demo)',
  tagline: '✨ របៀបសាកល្បង Demo - មិនប៉ះពាល់ទិន្នន័យជាក់ស្តែងរបស់ហាងឡើយ',
  khqrQrImage: '/uploads/products/prod_1789651425146_asp0.jpg',
  khqrMerchantName: 'SWEET BAKERY DEMO',
  khqrBakongId: 'demo_bakery@aba',
  khqrAccountNumber: '000000000',
  khqrBankName: 'Demo Bank / Bakong',
};

export const defaultStoreInfo: StoreInfo = {
  nameKh: 'ហាងនំខកនិងនំបុ័ងវិជ្ជតា',
  nameEn: 'SweetBakery & Cafe',
  logoUrl: '/uploads/products/prod_1789651345094_x6k2.jpg',
  phone: '0978707000',
  address: 'រតនៈគីរី អូរយ៉ាដាវ',
  mapsUrl: 'https://www.google.com/maps/place/%E1%9E%A0%E1%9E%B6%E1%9E%84%E1%9E%93%E1%9F%86%E1%9E%81%E1%9F%81%E1%9E%80%E1%9E%A2%E1%9E%BC%E1%9E%9A%E1%9E%99%E1%9F%89%E1%9E%B6%E1%9E%8A%E1%9E%B6%E1%9E%9C/@13.6703078,107.3446576,15z/data=!4m7!3m6!1s0x316c55bd358df1af:0xfb9f7bddaf65d259!4b1!8m2!3d13.6708499!4d107.346106!16s%2Fg%2F11n9w1vt9r',
  tagline: 'នំខេកឆ្ងាញ់ប្រណិត ស្រស់ៗរាល់ថ្ងៃ • មានទទួលកុម្ម៉ង់គ្រប់ម៉ូដ',
  khqrQrImage: '/uploads/products/prod_1789651425146_asp0.jpg',
  khqrMerchantName: 'Suon Sothearet',
  khqrBakongId: 'sweet_bakery@aba',
  khqrAccountNumber: '012629160',
  khqrBankName: 'ACLEDA Bank / Bakong',
  realStorePin: '1111',
  requireRealStorePin: true,
};

export const initialPartyAddons: PartyAddon[] = [
  { id: 'hat', nameKh: '🎩 មួកខួបកំណើត (Pack 5)', priceUsd: 2.0, priceKhr: 8000 },
  { id: 'num-candle', nameKh: '🕯️ ទៀនលេខ 0-9 ពណ៌មាស', priceUsd: 0.75, priceKhr: 3000 },
  { id: 'sparkler', nameKh: '🎆 ទៀនកាំជ្រួចភ្លើង (Fountain)', priceUsd: 1.5, priceKhr: 6000 },
  { id: 'spray', nameKh: '❄️ ស្ព្រាយបាញ់ព្រិល/ខ្សែពណ៌', priceUsd: 1.5, priceKhr: 6000 },
  { id: 'topper', nameKh: '✨ ស្លាក Happy Birthday Acrylic', priceUsd: 1.2, priceKhr: 4800 },
  { id: 'card', nameKh: '💌 កាតជូនពរប្រណិត', priceUsd: 1.0, priceKhr: 4000 },
];

export const seedDemoDataIfMissing = () => {
  if (typeof window === 'undefined') return;
  
  const checkIsEmpty = (key: string) => {
    const raw = localStorage.getItem(key);
    if (!raw || raw === '[]' || raw === 'null' || raw === '{}') return true;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 0) return true;
    } catch (e) {
      return true;
    }
    return false;
  };

  if (checkIsEmpty('demo_bakery_products')) {
    localStorage.setItem('demo_bakery_products', JSON.stringify(initialProducts));
  }
  if (checkIsEmpty('demo_bakery_sales')) {
    localStorage.setItem('demo_bakery_sales', JSON.stringify(initialSales));
  }
  if (checkIsEmpty('demo_bakery_custom_orders')) {
    localStorage.setItem('demo_bakery_custom_orders', JSON.stringify(initialOrders));
  }
  if (checkIsEmpty('demo_bakery_expenses')) {
    localStorage.setItem('demo_bakery_expenses', JSON.stringify(demoExpenses));
  }
  if (checkIsEmpty('demo_bakery_ingredients')) {
    localStorage.setItem('demo_bakery_ingredients', JSON.stringify(initialIngredients));
  }
  if (checkIsEmpty('demo_bakery_recipes')) {
    localStorage.setItem('demo_bakery_recipes', JSON.stringify(initialRecipes));
  }
  if (checkIsEmpty('demo_bakery_party_addons')) {
    localStorage.setItem('demo_bakery_party_addons', JSON.stringify(initialPartyAddons));
  }
  if (checkIsEmpty('demo_bakery_flavors')) {
    localStorage.setItem('demo_bakery_flavors', JSON.stringify(initialFlavors));
  }
  if (checkIsEmpty('demo_bakery_shift')) {
    localStorage.setItem('demo_bakery_shift', JSON.stringify(initialShift));
  }
  if (checkIsEmpty('demo_bakery_store_info')) {
    localStorage.setItem('demo_bakery_store_info', JSON.stringify(demoStoreInfo));
  }
  if (checkIsEmpty('demo_bakery_staff_members')) {
    localStorage.setItem('demo_bakery_staff_members', JSON.stringify(demoStaffMembers));
  }
};

// Unified wrapper to guarantee every write & delete is queued for offline-to-cloud automatic sync
const syncSaveDoc = (collectionName: string, docId: string, data: any) => {
  if (globalIsDemoMode) return; // Completely isolated from cloud in Demo mode
  saveFirestoreDoc(collectionName, docId, data);
  offlineSyncService.queueMutation(collectionName, docId, 'set', data);
};

const syncDeleteDoc = (collectionName: string, docId: string) => {
  if (globalIsDemoMode) return; // Completely isolated from cloud in Demo mode
  deleteFirestoreDoc(collectionName, docId);
  offlineSyncService.queueMutation(collectionName, docId, 'delete');
};

// Helper to determine if an expense is drawn from petty cash / reserve fund
export const isExpensePaidFromReserve = (exp?: Partial<Expense> | null) => {
  if (!exp) return false;
  const isPaid = !exp.paymentStatus || exp.paymentStatus === 'PAID';
  return isPaid && exp.paymentMethod === 'RESERVE_FUND';
};

// Helper to auto-migrate any 2024 expense dates to 2026
export const autoMigrateExpenseDates = (items: Expense[]): Expense[] => {
  let changed = false;
  const migrated = items.map((e) => {
    let itemChanged = false;
    let newDate = e.date;
    let newCreatedAt = e.createdAt;
    let newDueDate = e.dueDate;

    if (e.date && e.date.includes('2024')) {
      newDate = e.date.replace(/2024/g, '2026');
      itemChanged = true;
    }
    if (e.createdAt && e.createdAt.includes('2024')) {
      newCreatedAt = e.createdAt.replace(/2024/g, '2026');
      itemChanged = true;
    }
    if (e.dueDate && e.dueDate.includes('2024')) {
      newDueDate = e.dueDate.replace(/2024/g, '2026');
      itemChanged = true;
    }

    if (itemChanged) {
      changed = true;
      return {
        ...e,
        date: newDate,
        createdAt: newCreatedAt,
        dueDate: newDueDate,
      };
    }
    return e;
  });

  return migrated;
};

// Helper to cleanly deduplicate and merge expenses (strictly guarantees no duplicate items and respects deletions)
export const cleanDeduplicateExpenses = (items: Expense[]): Expense[] => {
  const deletedIds = loadDeletedIds('expenses');
  const mockExpenseIds = new Set(['exp-1', 'exp-2', 'exp-4', 'exp-5', 'exp-6', 'exp-7']);
  const nonMock = (Array.isArray(items) ? items : []).filter(
    (e) => e && e.id && !mockExpenseIds.has(e.id) && !deletedIds.has(e.id)
  );

  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();
  const result: Expense[] = [];

  // 1. First, prioritize user-provided items (which include their edits, paymentMethod updates, and reserve fund allocations)
  for (const exp of nonMock) {
    if (!exp || !exp.id || seenIds.has(exp.id) || deletedIds.has(exp.id)) continue;
    seenIds.add(exp.id);

    const d = normalizeDateToYMD(exp.date || exp.createdAt || '');
    const cleanTitle = (exp.title || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const amt = Number(exp.amountUsd || 0).toFixed(2);
    const sig = `${d}|${cleanTitle}|${amt}`;

    if (seenSignatures.has(sig)) continue;
    seenSignatures.add(sig);

    result.push(exp);
  }

  // 2. Only add initialExpenses if the item is not already present or deleted
  const officialInitials = initialExpenses.filter((e) => e && e.id && !deletedIds.has(e.id) && !seenIds.has(e.id));
  for (const exp of officialInitials) {
    const d = normalizeDateToYMD(exp.date || exp.createdAt || '');
    const cleanTitle = (exp.title || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const amt = Number(exp.amountUsd || 0).toFixed(2);
    const sig = `${d}|${cleanTitle}|${amt}`;

    if (seenSignatures.has(sig) || seenIds.has(exp.id)) continue;
    seenIds.add(exp.id);
    seenSignatures.add(sig);

    result.push(exp);
  }

  return autoMigrateExpenseDates(
    result.sort(
      (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    )
  );
};

interface BakeryContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  exchangeRate: number; // e.g. 4100
  setExchangeRate: (rate: number) => void;

  // Demo Sandbox Mode
  isDemoMode: boolean;
  hideDemoPrices: boolean;
  setHideDemoPrices: React.Dispatch<React.SetStateAction<boolean>>;
  toggleHideDemoPrices: () => void;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  requestExitDemoMode: () => void;
  lockRealStoreToDemo: () => void;
  resetDemoData: () => void;
  demoDevices: DemoDeviceVisitor[];
  demoDevicesCount: number;

  // Real Store Passcode Authentication & Logout
  isRealStoreAuthModalOpen: boolean;
  openRealStoreAuthModal: (onSuccessCallback?: () => void) => void;
  closeRealStoreAuthModal: () => void;
  verifyRealStorePin: (pin: string) => boolean;
  logoutAndLock: () => void;

  isFirebaseConnected: boolean;
  firebaseSyncStatus: 'connected' | 'disconnected' | 'syncing';
  offlineSyncStatus: SyncState;
  pendingSyncCount: number;
  triggerAutoCloudSync: () => Promise<void>;
  lanSyncStatus: 'connected' | 'syncing' | 'idle';
  forceSyncLan: () => Promise<{ salesCount: number; expensesCount: number }>;

  staffMembers: StaffMember[];
  currentStaff: StaffMember;
  setCurrentStaff: (staff: StaffMember) => void;
  switchStaffByPin: (pin: string) => boolean;
  addStaffMember: (staff: Omit<StaffMember, 'id'>) => void;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  hasPermission: (permission: keyof StaffPermissions) => boolean;

  storeInfo: StoreInfo;
  updateStoreInfo: (info: Partial<StoreInfo>) => void;

  categories: Category[];
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  restockProduct: (productId: string, additionalStock: number) => void;

  flavors: string[];
  addFlavor: (flavorName: string) => void;
  updateFlavor: (oldFlavor: string, newFlavor: string) => void;
  deleteFlavor: (flavorName: string) => void;

  partyAddons: PartyAddon[];
  addPartyAddon: (nameKh: string, priceKhr: number, priceUsd?: number) => void;
  updatePartyAddon: (id: string, nameKh: string, priceKhr: number, priceUsd?: number) => void;
  deletePartyAddon: (id: string) => void;

  cart: CartItem[];
  addToCart: (product: Product, size?: string, flavor?: string) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  updateCartItemPrice: (index: number, newPriceUsd: number) => void;
  addCustomPricedItem: (nameKh: string, priceUsd: number, quantity?: number, note?: string) => void;
  clearCart: () => void;
  cartTotalUsd: number;
  cartTotalKhr: number;

  customOrders: CustomCakeOrder[];
  addCustomOrder: (order: Omit<CustomCakeOrder, 'id' | 'orderNumber' | 'createdAt'>) => CustomCakeOrder;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  addCustomOrderDeposit: (
    orderId: string,
    additionalDepositKhr: number,
    paymentMethod?: 'CASH_USD' | 'CASH_KHR' | 'KHQR_BAKONG'
  ) => void;
  updateCustomOrder: (orderId: string, updates: Partial<CustomCakeOrder>) => void;
  deleteCustomOrder: (orderId: string) => void;
  clearAllCustomOrders: () => void;

  ingredients: Ingredient[];
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  restockIngredient: (id: string, amount: number) => void;
  useIngredientStock: (id: string, usedAmount: number) => void;
  lowStockCount: number;

  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Recipe;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updatedData: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  clearAllExpenses: () => void;
  updateExpenseDatesFrom2024To2026: () => number;
  totalExpensesUsd: number;
  totalExpensesKhr: number;

  // Reserve Fund (ទុនបម្រុងហាង & Petty Cash)
  reserveFund: ReserveFund;
  updateReserveTarget: (targetKhr: number, targetUsd?: number, updateCurrentBalance?: boolean) => void;
  adjustCurrentBalance: (balanceKhr: number, balanceUsd?: number, reason?: string) => void;
  replenishReserveFund: (amountKhr: number, amountUsd?: number, source?: string, notes?: string) => void;
  withdrawReserveFund: (amountKhr: number, amountUsd: number, reason: string, expenseId?: string) => void;
  batchDeductExpensesToReserveFund: (expenseIds: string[]) => void;
  reconcileReserveFundWithExpenses: (customBaseTargetKhr?: number) => ReserveFund;
  deleteReserveFundTransaction: (txId: string) => void;
  clearReserveFundHistory: () => void;

  sales: CompletedSale[];
  completeSale: (sale: Omit<CompletedSale, 'id' | 'orderNumber' | 'createdAt'>) => CompletedSale;
  addPastSale: (sale: Omit<CompletedSale, 'id'>) => void;
  updateSale: (sale: CompletedSale) => void;
  deleteSale: (id: string, restoreStock?: boolean) => void;
  clearAllSales: () => void;

  activeReceipt: CompletedSale | null;
  setActiveReceipt: (sale: CompletedSale | null) => void;

  currentShift: Shift | null;
  closeShift: (closingCashUsd: number, closingCashKhr: number) => void;
  openShift: (cashierName: string, openingCashUsd: number, openingCashKhr: number) => void;

  exportBackupData: () => BakeryBackupData;
  downloadBackupFile: () => void;
  importBackupData: (jsonData: string) => {
    success: boolean;
    message: string;
    stats?: {
      productsCount: number;
      salesCount: number;
      ordersCount: number;
      expensesCount: number;
      staffCount: number;
    };
  };
  exportSalesCsv: () => void;
  exportExpensesCsv: () => void;
}

const BakeryContext = createContext<BakeryContextType | undefined>(undefined);

export const BakeryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo Sandbox Mode state
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const isDemo = checkInitialDemoMode();
    if (isDemo) {
      seedDemoDataIfMissing();
    }
    return isDemo;
  });

  const [demoDevices, setDemoDevices] = useState<DemoDeviceVisitor[]>([]);

  // Option to hide all cake/product prices in Demo Mode (defaults to true)
  const [hideDemoPrices, setHideDemoPrices] = useState<boolean>(() => {
    const saved = localStorage.getItem('bakery_demo_hide_prices');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleHideDemoPrices = () => {
    setHideDemoPrices((prev) => {
      const next = !prev;
      localStorage.setItem('bakery_demo_hide_prices', String(next));
      return next;
    });
  };

  useEffect(() => {
    setGlobalIsDemoMode(isDemoMode);
    if (isDemoMode) {
      localStorage.setItem('bakery_is_demo_mode', 'true');
      recordDemoDeviceVisit().catch(() => {});
    } else {
      localStorage.removeItem('bakery_is_demo_mode');
    }
  }, [isDemoMode]);

  // Subscribe to real-time distinct demo devices from Cloud Firestore
  useEffect(() => {
    const unsub = subscribeToDemoDevices((devices) => {
      setDemoDevices(devices);
    });
    return () => unsub();
  }, []);

  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('bakery_lang') as Language) || 'km';
  });

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem('bakery_exchange_rate');
    return saved ? Number(saved) : 4000;
  });

  // Staff & Permissions state
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('bakery_staff_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((s: StaffMember) => {
            // Ensure isActive defaults to true for old data that may not have this field
            const staff = { ...s, isActive: s.isActive !== false ? true : false };
            // Only fix display name/avatar migrations — do NOT override pinCode
            if (staff.name?.includes('ម៉ារី') || staff.name?.includes('Mary') || staff.id === 'staff-1') {
              return {
                ...staff,
                name: staff.name?.includes('ម៉ារី') || staff.name?.includes('Mary') ? 'ម្ចាស់ហាង (Admin)' : staff.name,
                nameEn: staff.nameEn?.includes('Mary') ? 'Store Owner (Admin)' : staff.nameEn,
                avatar: staff.avatar === '👩‍🍳' ? '👑' : staff.avatar,
                // preserve saved pinCode; only use real store PIN default if no pin set at all
                pinCode: staff.pinCode || '660168',
              };
            }
            if (staff.id === 'staff-2' || staff.id === 'staff-1789379117825' || staff.name?.includes('វិជ្ជតា') || staff.name?.includes('សុធារិទ្ធ') || staff.name?.includes('Sothearith')) {
              return {
                ...staff,
                name: staff.name?.includes('សុធារិទ្ធ') || staff.name?.includes('Sothearith') ? 'វិជ្ជតា (Vicheta)' : staff.name,
                nameEn: staff.nameEn?.includes('Sothearith') ? 'Vicheta (Cashier)' : staff.nameEn,
                avatar: staff.avatar === '👨‍💼' ? '👩‍💼' : staff.avatar,
                // preserve saved pinCode; only default to 0202 if missing
                pinCode: staff.pinCode || '0202',
                permissions: {
                  ...staff.permissions,
                  canAccessPos: true,
                  canAccessShowcase: true,
                  canAccessCustomOrders: true,
                  canAccessSalesHistory: true,
                  canEditSales: true,
                },
              };
            }
            return staff;
          });
          localStorage.setItem('bakery_staff_members', JSON.stringify(sanitized));
          return sanitized;
        }
      } catch (e) {}
    }
    return initialStaffMembers;
  });

  const [currentStaff, setCurrentStaffState] = useState<StaffMember>(() => {
    const saved = localStorage.getItem('bakery_current_staff');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.name?.includes('ម៉ារី') || parsed.name?.includes('Mary') || parsed.id === 'staff-1')) {
          const sanitized = {
            ...parsed,
            name: parsed.name?.includes('ម៉ារី') || parsed.name?.includes('Mary') ? 'ម្ចាស់ហាង (Admin)' : parsed.name,
            nameEn: parsed.nameEn?.includes('Mary') ? 'Store Owner (Admin)' : parsed.nameEn,
            avatar: parsed.avatar === '👩‍🍳' ? '👑' : parsed.avatar,
            // preserve saved pinCode; fallback to 660168
            pinCode: parsed.pinCode || '660168',
          };
          localStorage.setItem('bakery_current_staff', JSON.stringify(sanitized));
          return sanitized;
        }
        if (parsed && (parsed.id === 'staff-2' || parsed.id === 'staff-1789379117825' || parsed.name?.includes('វិជ្ជតា') || parsed.name?.includes('សុធារិទ្ធ') || parsed.name?.includes('Sothearith'))) {
          const sanitized = {
            ...parsed,
            name: parsed.name?.includes('សុធារិទ្ធ') || parsed.name?.includes('Sothearith') ? 'វិជ្ជតា (Vicheta)' : parsed.name,
            nameEn: parsed.nameEn?.includes('Sothearith') ? 'Vicheta (Cashier)' : parsed.nameEn,
            avatar: parsed.avatar === '👨‍💼' ? '👩‍💼' : parsed.avatar,
            // preserve saved pinCode; fallback to 0202
            pinCode: parsed.pinCode || '0202',
            permissions: {
              ...parsed.permissions,
              canAccessPos: true,
              canAccessShowcase: true,
              canAccessCustomOrders: true,
              canAccessSalesHistory: true,
              canEditSales: true,
            },
          };
          localStorage.setItem('bakery_current_staff', JSON.stringify(sanitized));
          return sanitized;
        }
        return parsed;
      } catch (e) {}
    }
    return initialStaffMembers[0]; // Default: Store Owner (Admin)
  });

  const setCurrentStaff = (staff: StaffMember) => {
    setCurrentStaffState(staff);
    localStorage.setItem('bakery_current_staff', JSON.stringify(staff));
  };

  const switchStaffByPin = (pin: string): boolean => {
    const cleanPin = pin.trim();
    // Always match against actual saved PIN from staffMembers — no hardcoded bypasses
    // Use isActive !== false to default missing field to active (backward compat with old data)
    const found = staffMembers.find((s) => s.isActive !== false && s.pinCode === cleanPin);
    if (found) {
      setCurrentStaff(found);
      return true;
    }
    return false;
  };

  const addStaffMember = (staffData: Omit<StaffMember, 'id'>) => {
    if (globalIsDemoMode) return;
    const newStaff: StaffMember = {
      ...staffData,
      id: `staff-${Date.now()}`,
    };
    setStaffMembers((prev) => {
      const updated = [...prev, newStaff];
      localStorage.setItem('bakery_staff_members', JSON.stringify(updated));
      return updated;
    });
    saveFirestoreDoc('staffMembers', newStaff.id, newStaff);
  };

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    if (globalIsDemoMode) return;
    setStaffMembers((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      localStorage.setItem('bakery_staff_members', JSON.stringify(updated));
      // Save the FULL merged document to Firestore (not just partial updates)
      // so new pinCode overwrites the old pinCode in the cloud
      const fullUpdated = updated.find((s) => s.id === id);
      if (fullUpdated) saveFirestoreDoc('staffMembers', id, fullUpdated);
      return updated;
    });
    if (currentStaff.id === id) {
      setCurrentStaffState((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteStaffMember = (id: string) => {
    if (globalIsDemoMode) return;
    recordDeletedId('staff', id, deletedStaffIds);
    setStaffMembers((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem('bakery_staff_members', JSON.stringify(updated));
      return updated;
    });
    deleteFirestoreDoc('staffMembers', id);
  };

  const hasPermission = (perm: keyof StaffPermissions): boolean => {
    if (!currentStaff) return false;
    if (currentStaff.role === 'ADMIN') return true;
    return !!currentStaff.permissions[perm];
  };

  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const savedDemo = localStorage.getItem('demo_bakery_store_info');
      if (savedDemo) {
        try {
          return { ...demoStoreInfo, ...JSON.parse(savedDemo) };
        } catch (e) {}
      }
      return demoStoreInfo;
    }

    const saved = localStorage.getItem('bakery_store_info');
    const defaultInfo: StoreInfo = {
      nameKh: 'ហាងនំខកនិងនំបុ័ងវិជ្ជតា',
      nameEn: 'SweetBakery & Cafe',
      logoUrl: '/uploads/products/prod_1789651345094_x6k2.jpg',
      phone: '0978707000',
      address: 'រតនៈគីរី អូរយ៉ាដាវ',
      tagline: 'នំខេកឆ្ងាញ់ប្រណិត ស្រស់ៗរាល់ថ្ងៃ • មានទទួលកុម្ម៉ង់គ្រប់ម៉ូដ',
      khqrQrImage: '/uploads/products/prod_1789651425146_asp0.jpg',
      khqrMerchantName: 'Suon Sothearet',
      khqrBakongId: 'sweet_bakery@aba',
      khqrAccountNumber: '012629160',
      khqrBankName: 'ACLEDA Bank / Bakong',
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nameKh === 'មិត្តភាព & ខេក' || !parsed.nameKh) {
          parsed.nameKh = 'ហាងនំខកនិងនំបុ័ងវិជ្ជតា';
          parsed.phone = parsed.phone || '0978707000';
          parsed.address = parsed.address || 'រតនៈគីរី អូរយ៉ាដាវ';
        }
        return {
          ...defaultInfo,
          ...parsed,
        };
      } catch (e) {
        // fallback
      }
    }
    return defaultInfo;
  });

  const updateStoreInfo = (info: Partial<StoreInfo>) => {
    if (globalIsDemoMode) {
      setStoreInfo((prev) => {
        const updated = {
          ...prev,
          ...info,
          address: info.address || (info as any).addressKh || prev.address || '',
        };
        try { localStorage.setItem('demo_bakery_store_info', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
      return;
    }

    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    let updatedTarget: StoreInfo | null = null;
    setStoreInfo((prev) => {
      const updated = {
        ...prev,
        ...info,
        address: info.address || (info as any).addressKh || prev.address || '',
      };
      updatedTarget = updated;
      try { localStorage.setItem('bakery_store_info', JSON.stringify(updated)); } catch (e) {}
      syncSaveDoc('settings', 'storeInfo', updated);
      return updated;
    });

    if (updatedTarget) {
      fetch('/api/save-store-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeInfo: updatedTarget }),
      }).catch((err) => console.error('Error saving store info to LAN:', err));
    }
  };

  const [categories] = useState<Category[]>(initialCategories);

  // Helper to repair missing images or convert base64/broken images to official upload paths
  const healProductItem = (p: Product): { product: Product; changed: boolean } => {
    const match = initialProducts.find((ip) => ip.id === p.id);
    if (!match) return { product: p, changed: false };

    const currentImg = (p.imageUrl || '').trim();
    const needsImageFix =
      !currentImg ||
      currentImg.startsWith('data:') ||
      currentImg.length < 5 ||
      (match.imageUrl && match.imageUrl.startsWith('/uploads/products/') && currentImg !== match.imageUrl);

    if (needsImageFix && match.imageUrl) {
      return {
        product: {
          ...p,
          imageUrl: match.imageUrl,
          images: match.images && match.images.length > 0 ? match.images : [match.imageUrl],
        },
        changed: true,
      };
    }

    if ((!p.images || p.images.length === 0) && currentImg) {
      return {
        product: {
          ...p,
          images: [currentImg],
        },
        changed: true,
      };
    }

    return { product: p, changed: false };
  };

  // Products with seamless merge for party supplies & cake items (newest images/products first)
  const [products, setProducts] = useState<Product[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const savedDemo = localStorage.getItem('demo_bakery_products');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return sortProductsNewestFirst(parsed);
          }
        } catch (e) {}
      }
      return sortProductsNewestFirst(initialProducts);
    }

    const saved = localStorage.getItem('bakery_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const healed = parsed.map((p) => healProductItem(p).product);
          const missingItems = initialProducts.filter(
            (ip) => !healed.some((existing) => existing.id === ip.id)
          );
          return sortProductsNewestFirst([...healed, ...missingItems]);
        }
      } catch (e) {
        return sortProductsNewestFirst(initialProducts);
      }
    }
    return sortProductsNewestFirst(initialProducts);
  });

  // Emergency Auto-Recovery: Never allow products to become 0 unless store is explicitly reset
  useEffect(() => {
    if (products.length === 0) {
      console.warn('⚠️ Products list is 0! Auto-restoring default bakery products catalog...');
      const fallback = sortProductsNewestFirst(initialProducts);
      setProducts(fallback);
      if (globalIsDemoMode) {
        localStorage.setItem('demo_bakery_products', JSON.stringify(fallback));
      } else {
        safeSetStorage('bakery_products', JSON.stringify(fallback));
        fallback.forEach((p) => {
          saveFirestoreDoc('products', p.id, p);
        });
      }
    }
  }, [products.length]);

  // Auto-heal products in localStorage on mount
  useEffect(() => {
    if (globalIsDemoMode) return;
    try {
      const saved = localStorage.getItem('bakery_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        let changed = false;
        const healed = parsed.map((p) => {
          const res = healProductItem(p);
          if (res.changed) changed = true;
          return res.product;
        });
        const missingItems = initialProducts.filter(
          (ip) => !healed.some((existing) => existing.id === ip.id)
        );
        if (missingItems.length > 0) changed = true;

        if (changed) {
          const sorted = sortProductsNewestFirst([...healed, ...missingItems]);
          setProducts(sorted);
          localStorage.setItem('bakery_products', JSON.stringify(sorted));
        }
      }
    } catch (e) {}
  }, []);

  // Auto-heal expenses in localStorage on mount
  useEffect(() => {
    if (globalIsDemoMode) return;
    try {
      const saved = localStorage.getItem('bakery_expenses');
      const parsed = saved ? JSON.parse(saved) : [];
      const deduped = cleanDeduplicateExpenses(Array.isArray(parsed) ? parsed : []);
      setExpenses(deduped);
      safeSetStorage('bakery_expenses', JSON.stringify(deduped));
    } catch (e) {}
  }, []);

  // Dynamic Flavors list
  const [flavors, setFlavors] = useState<string[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_flavors');
      return saved ? JSON.parse(saved) : initialFlavors;
    }
    const saved = localStorage.getItem('bakery_flavors');
    return saved ? JSON.parse(saved) : initialFlavors;
  });

  // Dynamic Party Add-ons list
  const initialPartyAddons: PartyAddon[] = [
    { id: 'hat', nameKh: '🎩 មួកខួបកំណើត (Pack 5)', priceUsd: 2.0, priceKhr: 8000 },
    { id: 'num-candle', nameKh: '🕯️ ទៀនលេខ 0-9 ពណ៌មាស', priceUsd: 0.75, priceKhr: 3000 },
    { id: 'sparkler', nameKh: '🎆 ទៀនកាំជ្រួចភ្លើង (Fountain)', priceUsd: 1.5, priceKhr: 6000 },
    { id: 'spray', nameKh: '❄️ ស្ព្រាយបាញ់ព្រិល/ខ្សែពណ៌', priceUsd: 1.5, priceKhr: 6000 },
    { id: 'topper', nameKh: '✨ ស្លាក Happy Birthday Acrylic', priceUsd: 1.2, priceKhr: 4800 },
    { id: 'card', nameKh: '💌 កាតជូនពរប្រណិត', priceUsd: 1.0, priceKhr: 4000 },
  ];

  const [partyAddons, setPartyAddons] = useState<PartyAddon[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_party_addons');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return initialPartyAddons;
    }
    const saved = localStorage.getItem('bakery_party_addons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialPartyAddons;
  });

  const trimLocalStorageCache = () => {
    try {
      // 1. Trim sales cache in localStorage to last 30 if large
      const salesRaw = localStorage.getItem('bakery_sales');
      if (salesRaw && salesRaw.length > 250000) {
        try {
          const sales = JSON.parse(salesRaw);
          if (Array.isArray(sales)) {
            localStorage.setItem('bakery_sales', JSON.stringify(sales.slice(-30)));
          }
        } catch (e) {}
      }

      // 2. Safely trim bakery_products in localStorage cache (preserve imageUrl!)
      const prodRaw = localStorage.getItem('bakery_products');
      if (prodRaw && prodRaw.length > 600000) {
        try {
          const prods = JSON.parse(prodRaw);
          if (Array.isArray(prods)) {
            const slim = prods.map((p: any) => ({
              ...p,
              images: p.images && p.images.length > 1 ? [p.imageUrl || p.images[0]] : p.images,
            }));
            localStorage.setItem('bakery_products', JSON.stringify(slim));
          }
        } catch (e) {}
      }

      // 3. Strip large receipt images from bakery_expenses in localStorage cache
      const expRaw = localStorage.getItem('bakery_expenses');
      if (expRaw && expRaw.length > 250000) {
        try {
          const exps = JSON.parse(expRaw);
          if (Array.isArray(exps)) {
            const slim = exps.map((e: any) => ({ ...e, receiptImage: undefined }));
            localStorage.setItem('bakery_expenses', JSON.stringify(slim));
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn('LocalStorage trimming error:', e);
    }
  };

  const safeSetStorage = (key: string, value: string) => {
    if (globalIsDemoMode) {
      try {
        localStorage.setItem(`demo_${key}`, value);
      } catch (e) {}
      return;
    }

    // 1. Always persist full durable data to IndexedDB (asynchronously, unlimited capacity)
    idbSet(key, value).catch(() => {});

    // 2. Persist to localStorage for instant synchronous boots
    try {
      localStorage.setItem(key, value);
    } catch (err: any) {
      console.warn(`[LocalStorage Quota Handled] "${key}" exceeded quota. Using IndexedDB and compacting localStorage:`, err);
      trimLocalStorageCache();
      try {
        if (key === 'bakery_products') {
          const parsed = JSON.parse(value);
          const slim = parsed.map((p: any) => ({
            ...p,
            images: p.images && p.images.length > 1 ? [p.imageUrl || p.images[0]] : p.images,
          }));
          localStorage.setItem(key, JSON.stringify(slim));
        } else if (key === 'bakery_expenses') {
          const parsed = JSON.parse(value);
          const slim = parsed.map((e: any) => ({
            ...e,
            receiptImage: undefined,
          }));
          localStorage.setItem(key, JSON.stringify(slim));
        } else if (key === 'bakery_sales') {
          const parsed = JSON.parse(value);
          const slim = Array.isArray(parsed) ? parsed.slice(-30) : parsed;
          localStorage.setItem(key, JSON.stringify(slim));
        } else {
          localStorage.setItem(key, value);
        }
      } catch (fallbackErr) {
        // Safe to ignore because IndexedDB holds 100% of the data
        console.warn(`LocalStorage fallback for "${key}" skipped. Safe in IndexedDB:`, fallbackErr);
      }
    }
  };

  useEffect(() => {
    safeSetStorage('bakery_party_addons', JSON.stringify(partyAddons));
  }, [partyAddons]);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [customOrders, setCustomOrders] = useState<CustomCakeOrder[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_custom_orders');
      return saved ? JSON.parse(saved) : initialOrders;
    }
    const saved = localStorage.getItem('bakery_custom_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_ingredients');
      return saved ? JSON.parse(saved) : initialIngredients;
    }
    const saved = localStorage.getItem('bakery_ingredients');
    return saved ? JSON.parse(saved) : initialIngredients;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_recipes');
      return saved ? JSON.parse(saved) : initialRecipes;
    }
    const saved = localStorage.getItem('bakery_recipes');
    return saved ? JSON.parse(saved) : initialRecipes;
  });

  // Expenses management
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_expenses');
      return saved ? autoMigrateExpenseDates(JSON.parse(saved)) : demoExpenses;
    }
    const saved = localStorage.getItem('bakery_expenses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return cleanDeduplicateExpenses(parsed);
        }
      } catch (e) {}
    }
    return initialExpenses;
  });

  // Reserve Fund (ទុនបម្រុងហាង & Petty Cash) state
  const [reserveFund, setReserveFund] = useState<ReserveFund>(() => {
    const defaultTargetKhr = 4000000;
    const defaultTargetUsd = 1000;
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const savedDemo = localStorage.getItem('demo_bakery_reserve_fund');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          if (parsed && typeof parsed.targetAmountKhr === 'number') {
            return parsed;
          }
        } catch (e) {}
      }
    }
    const saved = localStorage.getItem('bakery_reserve_fund');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.targetAmountKhr === 'number') {
          return parsed;
        }
      } catch (e) {}
    }
    return {
      targetAmountKhr: defaultTargetKhr,
      targetAmountUsd: defaultTargetUsd,
      currentBalanceKhr: defaultTargetKhr,
      currentBalanceUsd: defaultTargetUsd,
      history: [
        {
          id: 'rf-init',
          type: 'INITIAL_SET',
          amountKhr: defaultTargetKhr,
          amountUsd: defaultTargetUsd,
          reason: 'កំណត់ទុនបម្រុងដំបូង',
          source: 'ម្ចាស់ហាង',
          performedBy: 'ម្ចាស់ហាង (Admin)',
          date: new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: '1970-01-01T00:00:00.000Z',
      isInitialDefault: true,
    };
  });

  // Live dynamic reserve fund calculation: Target Float - Paid Cash Expenses + Replenishments
  const dynamicReserveFund: ReserveFund = useMemo(() => {
    const targetKhr = Number(reserveFund.targetAmountKhr) || 4000000;
    const targetUsd = Number(reserveFund.targetAmountUsd) || Number((targetKhr / exchangeRate).toFixed(2));

    // Sum all expenses explicitly paid from Reserve Fund
    const totalReserveExpensesKhr = expenses
      .filter((e) => isExpensePaidFromReserve(e))
      .reduce((sum, e) => {
        const amt = Number(e.amountKhr) || Math.round((Number(e.amountUsd) || 0) * exchangeRate);
        return sum + amt;
      }, 0);

    // Sum all top-ups (replenishments)
    const totalReplenishedKhr = (reserveFund.history || [])
      .filter((tx) => tx.type === 'REPLENISH')
      .reduce((sum, tx) => sum + (Number(tx.amountKhr) || 0), 0);

    // Calculated balance: Target Float - Reserve Expenses + Replenishments
    const calculatedBalKhr = Math.max(0, targetKhr - totalReserveExpensesKhr + totalReplenishedKhr);
    const calculatedBalUsd = Number((calculatedBalKhr / exchangeRate).toFixed(2));

    return {
      ...reserveFund,
      targetAmountKhr: targetKhr,
      targetAmountUsd: targetUsd,
      currentBalanceKhr: calculatedBalKhr,
      currentBalanceUsd: calculatedBalUsd,
    };
  }, [reserveFund, expenses, exchangeRate]);

  const reserveFundRef = useRef<ReserveFund>(dynamicReserveFund);
  reserveFundRef.current = dynamicReserveFund;

  useEffect(() => {
    if (globalIsDemoMode) {
      localStorage.setItem('demo_bakery_reserve_fund', JSON.stringify(dynamicReserveFund));
    } else {
      safeSetStorage('bakery_reserve_fund', JSON.stringify(dynamicReserveFund));
    }
  }, [dynamicReserveFund]);


  // Sales management (including past sales)
  const [sales, setSales] = useState<CompletedSale[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_sales');
      return saved ? JSON.parse(saved) : initialSales;
    }
    const saved = localStorage.getItem('bakery_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [activeReceipt, setActiveReceipt] = useState<CompletedSale | null>(null);

  const [currentShift, setCurrentShift] = useState<Shift | null>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_shift');
      return saved ? JSON.parse(saved) : initialShift;
    }
    const saved = localStorage.getItem('bakery_shift');
    return saved ? JSON.parse(saved) : initialShift;
  });

  // Sync to local storage
  useEffect(() => {
    safeSetStorage('bakery_lang', lang);
  }, [lang]);

  useEffect(() => {
    safeSetStorage('bakery_exchange_rate', exchangeRate.toString());
  }, [exchangeRate]);

  useEffect(() => {
    safeSetStorage('bakery_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeSetStorage('bakery_flavors', JSON.stringify(flavors));
  }, [flavors]);

  useEffect(() => {
    safeSetStorage('bakery_custom_orders', JSON.stringify(customOrders));
  }, [customOrders]);

  useEffect(() => {
    safeSetStorage('bakery_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    safeSetStorage('bakery_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    safeSetStorage('bakery_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    safeSetStorage('bakery_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    safeSetStorage('bakery_shift', JSON.stringify(currentShift));
  }, [currentShift]);

  // Auto-sync active shift's cashier name to current logged-in staff member when staff switches
  useEffect(() => {
    if (currentStaff?.name && currentShift && currentShift.status === 'OPEN') {
      if (currentShift.cashierName !== currentStaff.name && (currentStaff.role === 'CASHIER' || currentStaff.role === 'ADMIN')) {
        setCurrentShift((prev) => (prev ? { ...prev, cashierName: currentStaff.name } : null));
      }
    }
  }, [currentStaff]);

  // Initial mount: Hydrate complete dataset from IndexedDB (preserves all high-res photos and full collections)
  const isIdbHydrated = useRef(false);
  useEffect(() => {
    if (isIdbHydrated.current) return;
    if (globalIsDemoMode) return;
    isIdbHydrated.current = true;

    const hydrateFromIdb = async () => {
      try {
        const idbProductsStr = await idbGet('bakery_products');
        if (idbProductsStr) {
          try {
            const parsed = JSON.parse(idbProductsStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const active = parsed.filter((p: any) => p && p.id && !deletedProductIds.current.has(p.id));
              setProducts(sortProductsNewestFirst(active));
            }
          } catch (e) {}
        }

        const idbSalesStr = await idbGet('bakery_sales');
        if (idbSalesStr) {
          try {
            const parsed = JSON.parse(idbSalesStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const active = parsed.filter((s: any) => s && s.id && !deletedSaleIds.current.has(s.id));
              setSales(active);
            }
          } catch (e) {}
        }

        const idbOrdersStr = await idbGet('bakery_custom_orders');
        if (idbOrdersStr) {
          try {
            const parsed = JSON.parse(idbOrdersStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const active = parsed.filter((o: any) => o && o.id && !deletedOrderIds.current.has(o.id));
              setCustomOrders(active);
            }
          } catch (e) {}
        }

        const idbExpensesStr = await idbGet('bakery_expenses');
        if (idbExpensesStr) {
          try {
            const parsed = JSON.parse(idbExpensesStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const mockExpenseIds = new Set(['exp-1', 'exp-2', 'exp-3', 'exp-4', 'exp-5', 'exp-6', 'exp-7']);
              const active = parsed.filter((e: any) => e && e.id && !deletedExpenseIds.current.has(e.id) && !mockExpenseIds.has(e.id));
              setExpenses(autoMigrateExpenseDates(active));
            }
          } catch (e) {}
        }

        const idbIngredientsStr = await idbGet('bakery_ingredients');
        if (idbIngredientsStr) {
          try {
            const parsed = JSON.parse(idbIngredientsStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setIngredients(parsed);
            }
          } catch (e) {}
        }

        const idbRecipesStr = await idbGet('bakery_recipes');
        if (idbRecipesStr) {
          try {
            const parsed = JSON.parse(idbRecipesStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setRecipes(parsed);
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn('IndexedDB initial hydration error:', err);
      }
    };

    hydrateFromIdb();
  }, []);

  // Auto-sync any DELIVERED custom orders that are not yet recorded in sales (e.g. historical/existing orders)
  useEffect(() => {
    if (globalIsDemoMode) return;
    const deliveredOrders = customOrders.filter((o) => o.status === 'DELIVERED');
    if (deliveredOrders.length === 0) return;

    const unrecordedOrders = deliveredOrders.filter((order) => {
      return !sales.some(
        (s) =>
          s.id === `sale-custom-${order.id}` ||
          s.orderNumber === order.orderNumber ||
          (order.themeNotes && order.themeNotes.includes(s.orderNumber))
      );
    });

    if (unrecordedOrders.length === 0) return;

    const newSales: CompletedSale[] = unrecordedOrders.map((order) => {
      const orderTotalKhr = order.totalKhr ?? Math.round(order.totalUsd * exchangeRate);
      return {
        id: `sale-custom-${order.id}`,
        orderNumber: order.orderNumber,
        items: [
          {
            productId: `custom-${order.id}`,
            nameKh: `នំកុម្ម៉ង់៖ ${order.cakeName} (${order.size})`,
            nameEn: `Custom Cake: ${order.cakeName} (${order.size})`,
            quantity: 1,
            priceUsd: order.totalUsd,
            priceKhr: orderTotalKhr,
            image: order.referenceImage || undefined,
          },
        ],
        subtotalUsd: order.totalUsd,
        discountUsd: 0,
        totalUsd: order.totalUsd,
        totalKhr: orderTotalKhr,
        paymentMethod: order.paymentMethod || 'CASH_KHR',
        paidUsd: order.totalUsd,
        paidKhr: orderTotalKhr,
        changeUsd: 0,
        changeKhr: 0,
        cashierName: currentStaff?.name || 'ម្ចាស់ហាង (Admin)',
        customerName: order.customerName,
        customerPhone: order.phone,
        isDeposit: false,
        depositKhr: order.depositKhr,
        depositUsd: order.depositUsd,
        remainingKhr: 0,
        remainingUsd: 0,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
        notes: `នំកុម្ម៉ង់ពិសេស (រសជាតិ៖ ${order.flavor}${order.inscription ? ' • អក្សរលើនំ៖ ' + order.inscription : ''}) • បានប្រគល់ជូនភ្ញៀវរួចរាល់`,
        createdAt: order.createdAt || new Date().toISOString(),
      };
    });

    setSales((prev) => {
      const updated = [...newSales, ...prev];
      safeSetStorage('bakery_sales', JSON.stringify(updated));
      return updated;
    });

    newSales.forEach((s) => {
      saveFirestoreDoc('sales', s.id, s);
      fetch('/api/save-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale: s }),
      }).catch(() => {});
    });
  }, [customOrders]);

  // Local Area Network (LAN) Sync - Synchronizes PC and phones in real-time over local Wi-Fi even without internet
  const [lanSyncStatus, setLanSyncStatus] = useState<'connected' | 'syncing' | 'idle'>('idle');
  const isUpdatingFromLan = useRef<boolean>(false);
  const lastLanVersion = useRef<number>(0);
  const lanSyncTimer = useRef<any>(null);
  const deletedSaleIds = useRef<Set<string>>(loadDeletedIds('sales'));
  const deletedExpenseIds = useRef<Set<string>>(loadDeletedIds('expenses'));
  const deletedProductIds = useRef<Set<string>>(loadDeletedIds('products'));
  const deletedOrderIds = useRef<Set<string>>(loadDeletedIds('orders'));
  const deletedStaffIds = useRef<Set<string>>(loadDeletedIds('staff'));
  const customOrdersRef = useRef<CustomCakeOrder[]>(customOrders);
  customOrdersRef.current = customOrders;
  const salesRef = useRef<CompletedSale[]>(sales);
  salesRef.current = sales;

  const saveToLanSync = (payload: any, force: boolean = true) => {
    if (globalIsDemoMode) return;
    if (!force && isUpdatingFromLan.current) return;
    try {
      fetch('/api/lan-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          deletedSaleIds: Array.from(deletedSaleIds.current),
          deletedOrderIds: Array.from(deletedOrderIds.current),
          deletedExpenseIds: Array.from(deletedExpenseIds.current),
          deletedProductIds: Array.from(deletedProductIds.current),
        }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data?.version) {
          lastLanVersion.current = data.version;
        }
      })
      .catch(() => {});
    } catch (e) {}
  };

  const applyLanData = (data: any) => {
    if (globalIsDemoMode) return;
    if (!data || data.exists === false) return;
    if (data.upToDate === true) {
      setLanSyncStatus('connected');
      return;
    }
    if (data.version && data.version === lastLanVersion.current) {
      setLanSyncStatus('connected');
      return;
    }
    if (data.version) {
      lastLanVersion.current = data.version;
    }
    isUpdatingFromLan.current = true;
    setLanSyncStatus('syncing');
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    // 1. Ingest any remote deletions so all devices stay strictly consistent
    if (Array.isArray(data.deletedSaleIds)) {
      data.deletedSaleIds.forEach((id: string) => recordDeletedId('sales', id, deletedSaleIds));
    }
    if (Array.isArray(data.deletedOrderIds)) {
      data.deletedOrderIds.forEach((id: string) => recordDeletedId('orders', id, deletedOrderIds));
    }
    if (Array.isArray(data.deletedExpenseIds)) {
      data.deletedExpenseIds.forEach((id: string) => recordDeletedId('expenses', id, deletedExpenseIds));
    }
    if (Array.isArray(data.deletedProductIds)) {
      data.deletedProductIds.forEach((id: string) => recordDeletedId('products', id, deletedProductIds));
    }

    // 2. Sync Products (Smart diff to avoid redundant re-renders and I/O on mobile)
    if (Array.isArray(data.products) && data.products.length > 0) {
      setProducts((prev) => {
        const prodMap = new Map();
        data.products.forEach((p: any) => {
          if (p && p.id && !deletedProductIds.current.has(p.id)) {
            prodMap.set(p.id, p);
          }
        });
        const recentCutoff = Date.now() - 20000;
        prev.forEach((p: any) => {
          if (p && p.id && !deletedProductIds.current.has(p.id) && !prodMap.has(p.id)) {
            const time = new Date(p.createdAt || p.updatedAt).getTime();
            if (time > recentCutoff) {
              prodMap.set(p.id, p);
            }
          }
        });
        const merged = sortProductsNewestFirst(Array.from(prodMap.values()));
        if (
          merged.length === prev.length &&
          merged.every(
            (p, idx) =>
              p.id === prev[idx]?.id &&
              p.updatedAt === prev[idx]?.updatedAt &&
              p.stockQty === prev[idx]?.stockQty &&
              p.priceUsd === prev[idx]?.priceUsd
          )
        ) {
          return prev;
        }
        safeSetStorage('bakery_products', JSON.stringify(merged));
        return merged;
      });
    }

    // 3. Sync Sales (Smart diff to eliminate mobile UI stutter)
    if (Array.isArray(data.sales)) {
      setSales((prev) => {
        const salesMap = new Map();
        data.sales.forEach((s: any) => {
          if (s && s.id && !deletedSaleIds.current.has(s.id)) {
            salesMap.set(s.id, s);
          }
        });
        prev.forEach((s: any) => {
          if (s && s.id && !deletedSaleIds.current.has(s.id) && !salesMap.has(s.id)) {
            salesMap.set(s.id, s);
          }
        });
        const merged = Array.from(salesMap.values())
          .filter((s: any) => !deletedSaleIds.current.has(s.id))
          .sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (
          merged.length === prev.length &&
          merged.every((s, idx) => s.id === prev[idx]?.id && s.totalUsd === prev[idx]?.totalUsd)
        ) {
          return prev;
        }
        safeSetStorage('bakery_sales', JSON.stringify(merged));
        return merged;
      });
    }

    // 4. Sync Custom Orders (Smart diff)
    if (Array.isArray(data.customOrders)) {
      setCustomOrders((prev) => {
        const ordersMap = new Map();
        data.customOrders.forEach((o: any) => {
          if (o && o.id && !deletedOrderIds.current.has(o.id)) {
            ordersMap.set(o.id, o);
          }
        });
        prev.forEach((o: any) => {
          if (o && o.id && !deletedOrderIds.current.has(o.id) && !ordersMap.has(o.id)) {
            ordersMap.set(o.id, o);
          }
        });
        const merged = Array.from(ordersMap.values())
          .filter((o: any) => !deletedOrderIds.current.has(o.id))
          .sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (
          merged.length === prev.length &&
          merged.every((o, idx) => o.id === prev[idx]?.id && o.status === prev[idx]?.status && o.totalUsd === prev[idx]?.totalUsd)
        ) {
          return prev;
        }
        safeSetStorage('bakery_custom_orders', JSON.stringify(merged));
        return merged;
      });
    }

    // 5. Sync Expenses (Smart diff)
    if (Array.isArray(data.expenses)) {
      setExpenses((prev) => {
        const expensesMap = new Map();
        data.expenses.forEach((e: any) => {
          if (e && e.id && !deletedExpenseIds.current.has(e.id)) {
            expensesMap.set(e.id, e);
          }
        });
        prev.forEach((e: any) => {
          if (e && e.id && !deletedExpenseIds.current.has(e.id) && !expensesMap.has(e.id)) {
            expensesMap.set(e.id, e);
          }
        });
        const deduped = cleanDeduplicateExpenses(Array.from(expensesMap.values()));
        if (
          deduped.length === prev.length &&
          deduped.every((e, idx) => e.id === prev[idx]?.id && e.amountUsd === prev[idx]?.amountUsd)
        ) {
          return prev;
        }
        safeSetStorage('bakery_expenses', JSON.stringify(deduped));
        return deduped;
      });
    }

    // 6. Sync Stock / Ingredients
    if (Array.isArray(data.ingredients) && data.ingredients.length > 0) {
      setIngredients((prev) => {
        if (
          data.ingredients.length === prev.length &&
          data.ingredients.every((ing: any, idx: number) => ing.id === prev[idx]?.id && ing.currentStock === prev[idx]?.currentStock)
        ) {
          return prev;
        }
        safeSetStorage('bakery_ingredients', JSON.stringify(data.ingredients));
        return data.ingredients;
      });
    }

    // 7. Sync Recipes
    if (Array.isArray(data.recipes) && data.recipes.length > 0) {
      setRecipes((prev) => {
        if (
          data.recipes.length === prev.length &&
          data.recipes.every((r: any, idx: number) => r.id === prev[idx]?.id)
        ) {
          return prev;
        }
        safeSetStorage('bakery_recipes', JSON.stringify(data.recipes));
        return data.recipes;
      });
    }

    // 8. Sync Staff Members & Passwords/PINs
    if (Array.isArray(data.staffMembers) && data.staffMembers.length > 0) {
      setStaffMembers((prev) => {
        if (
          data.staffMembers.length === prev.length &&
          data.staffMembers.every((s: any, idx: number) => s.id === prev[idx]?.id && s.pinCode === prev[idx]?.pinCode && s.role === prev[idx]?.role)
        ) {
          return prev;
        }
        try { localStorage.setItem('bakery_staff_members', JSON.stringify(data.staffMembers)); } catch (e) {}
        return data.staffMembers;
      });
    }

    // 9. Sync Party Add-ons
    if (Array.isArray(data.partyAddons) && data.partyAddons.length > 0) {
      setPartyAddons((prev) => {
        if (
          data.partyAddons.length === prev.length &&
          data.partyAddons.every((a: any, idx: number) => a.id === prev[idx]?.id && a.priceUsd === prev[idx]?.priceUsd)
        ) {
          return prev;
        }
        safeSetStorage('bakery_party_addons', JSON.stringify(data.partyAddons));
        return data.partyAddons;
      });
    }

    // 10. Sync Reserve Fund (timestamp protected to avoid race condition rollbacks)
    if (data.reserveFund) {
      setReserveFund((currentLocal) => {
        const incomingTime = data.reserveFund.updatedAt ? new Date(data.reserveFund.updatedAt).getTime() : 0;
        const localTime = currentLocal?.updatedAt ? new Date(currentLocal.updatedAt).getTime() : 0;
        if (incomingTime >= localTime) {
          if (
            currentLocal &&
            currentLocal.currentBalanceKhr === data.reserveFund.currentBalanceKhr &&
            currentLocal.currentBalanceUsd === data.reserveFund.currentBalanceUsd &&
            currentLocal.updatedAt === data.reserveFund.updatedAt
          ) {
            return currentLocal;
          }
          safeSetStorage('bakery_reserve_fund', JSON.stringify(data.reserveFund));
          reserveFundRef.current = data.reserveFund;
          return data.reserveFund;
        }
        return currentLocal;
      });
    }

    // 11. Sync Store Info & Settings
    if (data.storeInfo) {
      setStoreInfo((prev) => {
        const newAddress = data.storeInfo.address || data.storeInfo.addressKh || prev.address || '';
        if (
          prev.nameKh === data.storeInfo.nameKh &&
          prev.nameEn === data.storeInfo.nameEn &&
          (prev.logoUrl || '') === (data.storeInfo.logoUrl || '') &&
          prev.phone === data.storeInfo.phone &&
          prev.address === newAddress &&
          (prev.tagline || '') === (data.storeInfo.tagline || '') &&
          (prev.khqrQrImage || '') === (data.storeInfo.khqrQrImage || '') &&
          (prev.khqrMerchantName || '') === (data.storeInfo.khqrMerchantName || '') &&
          (prev.khqrBakongId || '') === (data.storeInfo.khqrBakongId || '') &&
          (prev.khqrAccountNumber || '') === (data.storeInfo.khqrAccountNumber || '') &&
          (prev.khqrBankName || '') === (data.storeInfo.khqrBankName || '') &&
          (prev.realStorePin || '') === (data.storeInfo.realStorePin || '')
        ) {
          return prev;
        }
        const merged: StoreInfo = {
          ...prev,
          ...data.storeInfo,
          logoUrl: (data.storeInfo.logoUrl !== undefined && data.storeInfo.logoUrl !== '')
            ? data.storeInfo.logoUrl
            : (prev.logoUrl || ''),
          khqrQrImage: (data.storeInfo.khqrQrImage !== undefined && data.storeInfo.khqrQrImage !== '')
            ? data.storeInfo.khqrQrImage
            : (prev.khqrQrImage || ''),
          address: newAddress,
        };
        try { localStorage.setItem('bakery_store_info', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    }
    if (Array.isArray(data.flavors)) {
      setFlavors((prev) => {
        if (data.flavors.length === prev.length && data.flavors.every((f: any, idx: number) => f === prev[idx])) {
          return prev;
        }
        try { localStorage.setItem('bakery_flavors', JSON.stringify(data.flavors)); } catch (e) {}
        return data.flavors;
      });
    }
    if (data.telegramConfig && data.telegramConfig.botToken) {
      saveStoredTelegramConfig(data.telegramConfig);
    }
    if (data.exchangeRate && Number(data.exchangeRate) > 0) {
      const rate = Number(data.exchangeRate);
      setExchangeRate((prev) => {
        if (prev === rate) return prev;
        try { localStorage.setItem('bakery_exchange_rate', String(rate)); } catch (e) {}
        return rate;
      });
    }

    setLanSyncStatus('connected');
    setTimeout(() => {
      isUpdatingFromLan.current = false;
    }, 150);
  };

  const forceSyncLan = async (): Promise<{ salesCount: number; expensesCount: number }> => {
    if (globalIsDemoMode) return { salesCount: sales.length, expensesCount: expenses.length };
    setLanSyncStatus('syncing');
    try {
      // 1. Push local deletions & current state to LAN server first
      const postRes = await fetch('/api/lan-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          sales,
          customOrders,
          expenses,
          storeInfo,
          flavors,
          ingredients,
          recipes,
          staffMembers,
          partyAddons,
          reserveFund,
          telegramConfig: getStoredTelegramConfig(),
          deletedSaleIds: Array.from(deletedSaleIds.current),
          deletedOrderIds: Array.from(deletedOrderIds.current),
          deletedExpenseIds: Array.from(deletedExpenseIds.current),
          deletedProductIds: Array.from(deletedProductIds.current),
        }),
      }).catch(() => null);

      if (postRes && postRes.ok) {
        const postData = await postRes.json();
        if (postData?.version) {
          lastLanVersion.current = postData.version;
        }
      }

      // 2. Fetch the authoritative merged state
      const res = await fetch('/api/lan-sync');
      if (res.ok) {
        const data = await res.json();
        if (data && data.exists !== false) {
          applyLanData(data);
          setLanSyncStatus('connected');
          return {
            salesCount: Array.isArray(data.sales) ? data.sales.length : sales.length,
            expensesCount: Array.isArray(data.expenses) ? data.expenses.length : expenses.length,
          };
        }
      }
    } catch (e) {}
    setLanSyncStatus('idle');
    return { salesCount: sales.length, expensesCount: expenses.length };
  };

  useEffect(() => {
    // 1. Initial LAN fetch on mount
    fetch('/api/lan-sync')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.exists !== false) {
          applyLanData(data);
        } else {
          // If server file doesn't exist yet, save current state to server
          saveToLanSync({
            products,
            sales,
            customOrders,
            expenses,
            storeInfo,
            flavors,
            ingredients,
            recipes,
            staffMembers,
            partyAddons,
            reserveFund,
            telegramConfig: getStoredTelegramConfig(),
          }, true);
        }
      })
      .catch((err) => console.log('LAN sync endpoint inactive', err));

    // 2. High-speed window focus & visibility sync (with version check)
    const handleSyncOnFocus = (targetVersion?: number) => {
      if (globalIsDemoMode) return;
      const verParam = lastLanVersion.current ? `?v=${lastLanVersion.current}` : '';
      fetch(`/api/lan-sync${verParam}`)
        .then((res) => res.json())
        .then((data) => applyLanData(data))
        .catch(() => {});
    };
    const onFocus = () => handleSyncOnFocus();
    window.addEventListener('focus', onFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleSyncOnFocus();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 3. Ultra lightweight fallback interval: 3.5 seconds with version caching (38 bytes if unchanged)
    const intervalTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleSyncOnFocus();
      }
    }, 3500);

    // 4. Robust auto-reconnecting SSE stream for instantaneous (<50ms) sync with mobile keep-alive
    let sse: EventSource | null = null;
    let isSseActive = true;
    let sseRetryTimer: any = null;

    const connectSSE = () => {
      if (!isSseActive || globalIsDemoMode) return;
      try {
        if (sse) sse.close();
        sse = new EventSource('/api/lan-events');
        sse.onopen = () => {
          setLanSyncStatus('connected');
        };
        sse.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'SYNC_UPDATE') {
              if (parsed.version && parsed.version === lastLanVersion.current) {
                return; // Already up-to-date
              }
              handleSyncOnFocus(parsed.version);
            }
          } catch (e) {}
        };
        sse.onerror = () => {
          if (sse) sse.close();
          if (isSseActive) {
            clearTimeout(sseRetryTimer);
            sseRetryTimer = setTimeout(connectSSE, 2000);
          }
        };
      } catch (e) {
        if (isSseActive) {
          clearTimeout(sseRetryTimer);
          sseRetryTimer = setTimeout(connectSSE, 3000);
        }
      }
    };
    connectSSE();

    return () => {
      isSseActive = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(intervalTimer);
      if (sseRetryTimer) clearTimeout(sseRetryTimer);
      if (sse) sse.close();
    };
  }, []);

  // Broadcast any state updates to LAN server (debounced background sync only)
  const isInitialMount = useRef<boolean>(true);
  useEffect(() => {
    if (globalIsDemoMode) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isUpdatingFromLan.current) return;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    lanSyncTimer.current = setTimeout(() => {
      saveToLanSync({
        products,
        sales,
        customOrders,
        expenses,
        storeInfo,
        flavors,
        ingredients,
        recipes,
        staffMembers,
        partyAddons,
        reserveFund,
        telegramConfig: getStoredTelegramConfig(),
      }, false);
    }, 600);
  }, [products, sales, customOrders, expenses, storeInfo, flavors, ingredients, recipes, staffMembers, partyAddons, reserveFund]);

  // Firebase Real-time listeners & sync state
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(() => {
    return !!getStoredFirebaseConfig();
  });
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected');
  const [offlineSyncStatus, setOfflineSyncStatus] = useState<SyncState>(() => offlineSyncService.getStatus());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => offlineSyncService.getPendingCount());

  useEffect(() => {
    const unsub = offlineSyncService.subscribe((state) => {
      setOfflineSyncStatus(state.status);
      setPendingSyncCount(state.pendingCount);
    });
    return unsub;
  }, []);

  const [currentStoreTenantId, setCurrentStoreTenantId] = useState<string>(() => getStoreId());

  useEffect(() => {
    const unsub = subscribeToStoreIdChange((newId) => {
      setCurrentStoreTenantId(newId);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const config = getStoredFirebaseConfig();
    if (!config) {
      setIsFirebaseConnected(false);
      setFirebaseSyncStatus('disconnected');
      return;
    }

    const db = getFirestoreDb(config);
    if (!db) {
      setIsFirebaseConnected(false);
      setFirebaseSyncStatus('disconnected');
      return;
    }

    setIsFirebaseConnected(true);
    setFirebaseSyncStatus('connected');

    // Automatically trigger queue processing and reconciliation when Firebase initializes & connects
    // Automatically trigger queue processing when Firebase initializes & connects
    if (!globalIsDemoMode) {
      offlineSyncService.processQueue().catch(() => {});
    }

    // Subscribe to products (High-speed real-time sync)
    const unsubProducts = subscribeToFirestoreCollection<Product>('products', (cloudProducts) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
        const filtered = sortProductsNewestFirst(
          cloudProducts.filter((p) => p && p.id && !deletedProductIds.current.has(p.id))
        );
        if (filtered.length > 0) {
          setProducts((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(filtered)) {
              return prev;
            }
            safeSetStorage('bakery_products', JSON.stringify(filtered));
            return filtered;
          });
        }
      }
    });

    // Subscribe to sales (Preserves real-time cloud sales)
    const unsubSales = subscribeToFirestoreCollection<CompletedSale>('sales', (cloudSales) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudSales) && cloudSales.length > 0) {
        const filtered = cloudSales
          .filter((s) => s && s.id && !deletedSaleIds.current.has(s.id))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (filtered.length > 0) {
          setSales((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(filtered)) {
              return prev;
            }
            safeSetStorage('bakery_sales', JSON.stringify(filtered));
            return filtered;
          });
        }
      }
    });

    // Subscribe to custom orders
    const unsubOrders = subscribeToFirestoreCollection<CustomCakeOrder>('customOrders', (cloudOrders) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
        const filtered = cloudOrders.filter((o) => o && o.id && !deletedOrderIds.current.has(o.id));
        if (filtered.length > 0) {
          setCustomOrders((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(filtered)) {
              return prev;
            }
            safeSetStorage('bakery_custom_orders', JSON.stringify(filtered));
            return filtered;
          });
        }
      }
    });

    // Subscribe to expenses (Instantly syncs edits, payment methods, reserve fund changes across all devices)
    const unsubExpenses = subscribeToFirestoreCollection<Expense>('expenses', (cloudExpenses) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudExpenses) && cloudExpenses.length > 0) {
        const deduped = cleanDeduplicateExpenses(cloudExpenses);

        if (deduped.length > 0) {
          setExpenses((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(deduped)) {
              return prev;
            }
            safeSetStorage('bakery_expenses', JSON.stringify(deduped));
            return deduped;
          });
        }
      }
    });

    // Subscribe to staff members
    const unsubStaff = subscribeToFirestoreCollection<StaffMember>('staffMembers', (cloudStaff) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudStaff) && cloudStaff.length > 0) {
        const sanitizedCloud = cloudStaff
          .filter((s) => s && s.id && !deletedStaffIds.current.has(s.id))
          .map((s) => {
            const staff = { ...s, isActive: s.isActive !== false ? true : false };
            if (staff.name?.includes('ម៉ារី') || staff.name?.includes('Mary') || staff.id === 'staff-1') {
              return {
                ...staff,
                name: staff.name?.includes('ម៉ារី') || staff.name?.includes('Mary') ? 'ម្ចាស់ហាង (Admin)' : staff.name,
                nameEn: staff.nameEn?.includes('Mary') ? 'Store Owner (Admin)' : staff.nameEn,
                avatar: staff.avatar === '👩‍🍳' ? '👑' : staff.avatar,
                pinCode: staff.pinCode || '1111',
              };
            }
            if (staff.id === 'staff-2' || staff.name?.includes('សុធារិទ្ធ') || staff.name?.includes('Sothearith')) {
              return {
                ...staff,
                name: staff.name?.includes('សុធារិទ្ធ') || staff.name?.includes('Sothearith') ? 'វិជ្ជតា (Vicheta)' : staff.name,
                nameEn: staff.nameEn?.includes('Sothearith') ? 'Vicheta (Cashier)' : staff.nameEn,
                avatar: '👩‍💼',
                pinCode: staff.pinCode || '2222',
              };
            }
            return staff;
          });
        setStaffMembers(sanitizedCloud);
        localStorage.setItem('bakery_staff_members', JSON.stringify(sanitizedCloud));
      }
    });

    // Subscribe to ingredients (Stock)
    const unsubIngredients = subscribeToFirestoreCollection<Ingredient>('ingredients', (cloudIngredients) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudIngredients) && cloudIngredients.length > 0) {
        setIngredients((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(cloudIngredients)) {
            return prev;
          }
          safeSetStorage('bakery_ingredients', JSON.stringify(cloudIngredients));
          return cloudIngredients;
        });
      }
    });

    // Subscribe to recipes
    const unsubRecipes = subscribeToFirestoreCollection<Recipe>('recipes', (cloudRecipes) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudRecipes) && cloudRecipes.length > 0) {
        setRecipes((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(cloudRecipes)) {
            return prev;
          }
          safeSetStorage('bakery_recipes', JSON.stringify(cloudRecipes));
          return cloudRecipes;
        });
      }
    });

    // Subscribe to store info
    const unsubStoreInfo = subscribeToFirestoreDoc<StoreInfo>('settings', 'storeInfo', (cloudStoreInfo) => {
      if (globalIsDemoMode) return;
      if (cloudStoreInfo && cloudStoreInfo.nameKh) {
        setStoreInfo((prev) => {
          const merged = { ...prev, ...cloudStoreInfo };
          try { localStorage.setItem('bakery_store_info', JSON.stringify(merged)); } catch (e) {}
          return merged;
        });
      }
    });

    // Subscribe to shared deleted records across all devices (PC & Phone sync deletions instantly)
    const unsubDeletedRecords = subscribeToFirestoreDoc<any>('settings', 'deletedRecords', (cloudDeleted) => {
      if (globalIsDemoMode || !cloudDeleted) return;

      if (Array.isArray(cloudDeleted.deletedExpensesIds)) {
        let changed = false;
        cloudDeleted.deletedExpensesIds.forEach((id: string) => {
          if (!deletedExpenseIds.current.has(id)) {
            deletedExpenseIds.current.add(id);
            changed = true;
          }
        });
        if (changed) {
          try {
            localStorage.setItem('bakery_deleted_expenses_ids', JSON.stringify(Array.from(deletedExpenseIds.current).slice(-500)));
          } catch (e) {}
          setExpenses((prev) => {
            const updated = prev.filter((e) => !deletedExpenseIds.current.has(e.id));
            safeSetStorage('bakery_expenses', JSON.stringify(updated));
            return updated;
          });
        }
      }

      if (Array.isArray(cloudDeleted.deletedSalesIds)) {
        let changed = false;
        cloudDeleted.deletedSalesIds.forEach((id: string) => {
          if (!deletedSaleIds.current.has(id)) {
            deletedSaleIds.current.add(id);
            changed = true;
          }
        });
        if (changed) {
          try {
            localStorage.setItem('bakery_deleted_sales_ids', JSON.stringify(Array.from(deletedSaleIds.current).slice(-500)));
          } catch (e) {}
          setSales((prev) => {
            const updated = prev.filter((s) => !deletedSaleIds.current.has(s.id));
            safeSetStorage('bakery_sales', JSON.stringify(updated));
            return updated;
          });
        }
      }

      if (Array.isArray(cloudDeleted.deletedOrdersIds)) {
        let changed = false;
        cloudDeleted.deletedOrdersIds.forEach((id: string) => {
          if (!deletedOrderIds.current.has(id)) {
            deletedOrderIds.current.add(id);
            changed = true;
          }
        });
        if (changed) {
          try {
            localStorage.setItem('bakery_deleted_orders_ids', JSON.stringify(Array.from(deletedOrderIds.current).slice(-500)));
          } catch (e) {}
          setCustomOrders((prev) => {
            const updated = prev.filter((o) => !deletedOrderIds.current.has(o.id));
            safeSetStorage('bakery_custom_orders', JSON.stringify(updated));
            return updated;
          });
        }
      }

      if (Array.isArray(cloudDeleted.deletedProductsIds)) {
        let changed = false;
        cloudDeleted.deletedProductsIds.forEach((id: string) => {
          if (!deletedProductIds.current.has(id)) {
            deletedProductIds.current.add(id);
            changed = true;
          }
        });
        if (changed) {
          try {
            localStorage.setItem('bakery_deleted_products_ids', JSON.stringify(Array.from(deletedProductIds.current).slice(-500)));
          } catch (e) {}
          setProducts((prev) => {
            const updated = prev.filter((p) => !deletedProductIds.current.has(p.id));
            safeSetStorage('bakery_products', JSON.stringify(updated));
            return updated;
          });
        }
      }
    });

    // Subscribe to reserve fund (timestamp protected & instant adoption of cloud over initial default)
    const unsubReserveFund = subscribeToFirestoreDoc<ReserveFund>('settings', 'reserveFund', (cloudRf) => {
      if (globalIsDemoMode || !cloudRf) return;
      if (typeof cloudRf.targetAmountKhr === 'number') {
        setReserveFund((currentLocal) => {
          const cloudTime = cloudRf.updatedAt ? new Date(cloudRf.updatedAt).getTime() : 0;
          const localTime = currentLocal?.updatedAt ? new Date(currentLocal.updatedAt).getTime() : 0;
          const isLocalDefault = (currentLocal as any)?.isInitialDefault || localTime === 0 || currentLocal?.updatedAt === '1970-01-01T00:00:00.000Z';
          if (isLocalDefault || cloudTime >= localTime) {
            safeSetStorage('bakery_reserve_fund', JSON.stringify(cloudRf));
            reserveFundRef.current = cloudRf;
            return cloudRf;
          }
          return currentLocal;
        });
      }
    });

    // Subscribe to shared Gemini AI Key across all devices (PC & Phone sync automatically)
    const unsubGemini = subscribeToFirestoreDoc<{ apiKey?: string }>('settings', 'geminiApiKey', (cloudGemini) => {
      if (globalIsDemoMode || !cloudGemini?.apiKey) return;
      setGeminiApiKeyLocally(cloudGemini.apiKey);
    });

    // Subscribe to shared Telegram config across all devices (PC & Phone sync automatically)
    const unsubTelegram = subscribeToFirestoreDoc<TelegramConfig>('settings', 'telegram', (cloudTelegram) => {
      if (globalIsDemoMode || !cloudTelegram?.botToken) return;
      saveStoredTelegramConfig(cloudTelegram);
    });

    return () => {
      unsubProducts();
      unsubSales();
      unsubOrders();
      unsubExpenses();
      unsubStaff();
      unsubIngredients();
      unsubRecipes();
      unsubStoreInfo();
      unsubDeletedRecords();
      unsubReserveFund();
      unsubGemini();
      unsubTelegram();
    };
  }, [currentStoreTenantId]);

  // Synchronous persist helper for Reserve Fund across storage, server disk & LAN
  const persistReserveFund = (nextRf: ReserveFund) => {
    isUpdatingFromLan.current = false;
    const cleanRf: ReserveFund = {
      ...nextRf,
      isInitialDefault: false,
      updatedAt: new Date().toISOString(),
    };
    reserveFundRef.current = cleanRf;
    setReserveFund(cleanRf);

    if (globalIsDemoMode) {
      localStorage.setItem('demo_bakery_reserve_fund', JSON.stringify(cleanRf));
    } else {
      safeSetStorage('bakery_reserve_fund', JSON.stringify(cleanRf));
      syncSaveDoc('settings', 'reserveFund', cleanRf);

      // Fast atomic write to backend disk JSON
      fetch('/api/save-reserve-fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserveFund: cleanRf }),
      }).catch(() => {});

      // Instant broadcast
      saveToLanSync({ reserveFund: cleanRf }, true);
    }
  };


  // Reserve Fund actions
  const updateReserveTarget = (targetKhr: number, targetUsd?: number, updateCurrentBalance?: boolean) => {
    const validKhr = Math.max(0, targetKhr);
    const validUsd = targetUsd !== undefined ? targetUsd : Number((validKhr / exchangeRate).toFixed(2));
    const current = reserveFundRef.current;
    
    // If updateCurrentBalance is true, deduct existing paid cash expenses
    let newBalanceKhr = current.currentBalanceKhr;
    let newBalanceUsd = current.currentBalanceUsd;
    if (updateCurrentBalance) {
      const totalCashExpensesKhr = expenses
        .filter((e) => isExpensePaidFromReserve(e))
        .reduce((sum, e) => sum + e.amountKhr, 0);
      newBalanceKhr = Math.max(0, validKhr - totalCashExpensesKhr);
      newBalanceUsd = Number((newBalanceKhr / exchangeRate).toFixed(2));
    }

    const tx: ReserveFundTransaction = {
      id: `rf-adj-${Date.now()}`,
      type: 'ADJUST_TARGET',
      amountKhr: validKhr,
      amountUsd: validUsd,
      reason: `កែប្រែទុនបម្រុងគោលដៅទៅ ${validKhr.toLocaleString()} ៛`,
      performedBy: currentStaff?.name || 'ម្ចាស់ហាង (Admin)',
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    const nextRf: ReserveFund = {
      ...current,
      targetAmountKhr: validKhr,
      targetAmountUsd: validUsd,
      currentBalanceKhr: newBalanceKhr,
      currentBalanceUsd: newBalanceUsd,
      history: [tx, ...(current.history || [])].slice(0, 100),
      updatedAt: new Date().toISOString(),
    };
    persistReserveFund(nextRf);
  };

  const reconcileReserveFundWithExpenses = (customBaseTargetKhr?: number): ReserveFund => {
    isUpdatingFromLan.current = false;
    const current = reserveFundRef.current;
    const baseTarget = customBaseTargetKhr || current.targetAmountKhr || 4000000;
    const totalDeductibleKhr = expenses
      .filter((e) => isExpensePaidFromReserve(e))
      .reduce((sum, e) => sum + e.amountKhr, 0);

    const newBalanceKhr = Math.max(0, baseTarget - totalDeductibleKhr);
    const newBalanceUsd = Number((newBalanceKhr / exchangeRate).toFixed(2));
    const baseTargetUsd = Number((baseTarget / exchangeRate).toFixed(2));

    const nextRf: ReserveFund = {
      ...current,
      targetAmountKhr: baseTarget,
      targetAmountUsd: baseTargetUsd,
      currentBalanceKhr: newBalanceKhr,
      currentBalanceUsd: newBalanceUsd,
      history: [
        {
          id: `rf-rec-${Date.now()}`,
          type: 'ADJUST_BALANCE' as const,
          amountKhr: newBalanceKhr,
          amountUsd: newBalanceUsd,
          reason: `គណនាសមតុល្យស្វ័យប្រវត្តិតាមការចំណាយ (ទុនគោល ${baseTarget.toLocaleString()} ៛ - ចំណាយ ${totalDeductibleKhr.toLocaleString()} ៛)`,
          performedBy: currentStaff?.name || 'ម្ចាស់ហាង (Admin)',
          date: new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
        },
        ...(current.history || []),
      ].slice(0, 100),
      updatedAt: new Date().toISOString(),
    };

    persistReserveFund(nextRf);
    return nextRf;
  };

  // Auto-reconcile reserve fund on startup if current balance equals target (meaning expenses were never deducted from it)
  useEffect(() => {
    if (expenses.length === 0) return;
    const current = reserveFundRef.current;
    if (!current || !current.targetAmountKhr) return;

    const totalCashPaidKhr = expenses
      .filter((e) => isExpensePaidFromReserve(e))
      .reduce((sum, e) => sum + e.amountKhr, 0);

    if (totalCashPaidKhr <= 0) return;

    const hasEverDeducted = (current.history || []).some((tx) => tx.type === 'WITHDRAW');
    if (!hasEverDeducted && current.currentBalanceKhr === current.targetAmountKhr) {
      reconcileReserveFundWithExpenses(current.targetAmountKhr);
    }
  }, [expenses]);

  const adjustCurrentBalance = (balanceKhr: number, balanceUsd?: number, reason?: string) => {
    const validKhr = Math.max(0, balanceKhr);
    const validUsd = balanceUsd !== undefined ? balanceUsd : Number((validKhr / exchangeRate).toFixed(2));
    const current = reserveFundRef.current;
    const tx: ReserveFundTransaction = {
      id: `rf-bal-${Date.now()}`,
      type: 'ADJUST_BALANCE',
      amountKhr: validKhr,
      amountUsd: validUsd,
      reason: reason || `កែសម្រួលទុនជាក់ស្តែងក្នុងថតទៅ ${validKhr.toLocaleString()} ៛`,
      performedBy: currentStaff?.name || 'ម្ចាស់ហាង (Admin)',
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    const nextRf: ReserveFund = {
      ...current,
      currentBalanceKhr: validKhr,
      currentBalanceUsd: validUsd,
      history: [tx, ...(current.history || [])].slice(0, 100),
      updatedAt: new Date().toISOString(),
    };
    persistReserveFund(nextRf);
  };

  const withdrawReserveFund = (amountKhr: number, amountUsd: number, reason: string, expenseId?: string): ReserveFund => {
    const validKhr = Math.max(0, amountKhr);
    const validUsd = Math.max(0, amountUsd);
    const current = reserveFundRef.current;
    const newBalKhr = Math.max(0, current.currentBalanceKhr - validKhr);
    const newBalUsd = Math.max(0, Number((newBalKhr / exchangeRate).toFixed(2)));
    const tx: ReserveFundTransaction = {
      id: `rf-wd-${Date.now()}`,
      type: 'WITHDRAW',
      amountKhr: validKhr,
      amountUsd: validUsd,
      reason,
      expenseId,
      performedBy: currentStaff?.name || 'ម្ចាស់ហាង (Admin)',
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    const nextRf: ReserveFund = {
      ...current,
      currentBalanceKhr: newBalKhr,
      currentBalanceUsd: newBalUsd,
      history: [tx, ...(current.history || [])].slice(0, 100),
      updatedAt: new Date().toISOString(),
    };
    persistReserveFund(nextRf);
    return nextRf;
  };

  const replenishReserveFund = (amountKhr: number, amountUsd?: number, source?: string, notes?: string): ReserveFund => {
    const validKhr = Math.max(0, amountKhr);
    const validUsd = amountUsd !== undefined ? amountUsd : Number((validKhr / exchangeRate).toFixed(2));
    const current = reserveFundRef.current;
    const newBalKhr = current.currentBalanceKhr + validKhr;
    const newBalUsd = Number((newBalKhr / exchangeRate).toFixed(2));
    const tx: ReserveFundTransaction = {
      id: `rf-rep-${Date.now()}`,
      type: 'REPLENISH',
      amountKhr: validKhr,
      amountUsd: validUsd,
      reason: notes || 'បូកបង្គ្រប់ទុនបម្រុងហាង',
      source: source || 'ពីប្រាក់ចំណូលលក់ប្រចាំថ្ងៃ',
      performedBy: currentStaff?.name || 'ម្ចាស់ហាង (Admin)',
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    const nextRf: ReserveFund = {
      ...current,
      currentBalanceKhr: newBalKhr,
      currentBalanceUsd: newBalUsd,
      history: [tx, ...(current.history || [])].slice(0, 100),
      updatedAt: new Date().toISOString(),
    };
    persistReserveFund(nextRf);
    return nextRf;
  };

  const deleteReserveFundTransaction = (txId: string) => {
    const current = reserveFundRef.current;
    const updatedHistory = (current.history || []).filter((tx) => tx.id !== txId);
    const nextRf: ReserveFund = {
      ...current,
      history: updatedHistory,
      updatedAt: new Date().toISOString(),
    };
    persistReserveFund(nextRf);
  };

  const clearReserveFundHistory = () => {
    const current = reserveFundRef.current;
    const nextRf: ReserveFund = {
      ...current,
      history: [],
      updatedAt: new Date().toISOString(),
    };
    persistReserveFund(nextRf);
  };

  // Expenses actions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // If paid via Reserve Fund or Cash, automatically withdraw from reserve fund
    let nextRf: ReserveFund | undefined = undefined;
    const isPaid = !newExpense.paymentStatus || newExpense.paymentStatus === 'PAID';
    if (isExpensePaidFromReserve(newExpense) && isPaid) {
      nextRf = withdrawReserveFund(
        newExpense.amountKhr,
        newExpense.amountUsd,
        `ដកចំណាយ៖ ${newExpense.title}`,
        newExpense.id
      );
    }

    fetch('/api/save-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense: newExpense, reserveFund: nextRf }),
    }).catch(() => {});

    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      safeSetStorage('bakery_expenses', JSON.stringify(updated));
      saveToLanSync({
        products,
        sales,
        customOrders,
        expenses: updated,
        storeInfo,
        flavors,
        reserveFund: nextRf || reserveFundRef.current,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });
    syncSaveDoc('expenses', newExpense.id, newExpense);
    notifyTelegramExpense(newExpense, storeInfo, exchangeRate);
  };

  const updateExpense = (id: string, updatedData: Partial<Expense>) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    let nextRf: ReserveFund | undefined = undefined;
    let fullTarget: Expense | undefined = undefined;

    setExpenses((prev) => {
      const oldExpense = prev.find((e) => e.id === id);
      const updated = prev.map((exp) => (exp.id === id ? { ...exp, ...updatedData } : exp));
      const target = updated.find((e) => e.id === id);
      fullTarget = target;

      if (target && oldExpense) {
        const oldWasRfPaid = isExpensePaidFromReserve(oldExpense);
        const newIsRfPaid = isExpensePaidFromReserve(target);

        let rfDeltaKhr = 0; // Positive means deduct more, negative means refund
        let reason = '';

        if (!oldWasRfPaid && newIsRfPaid) {
          rfDeltaKhr = target.amountKhr;
          reason = `ដកចំណាយ (កែប្រែវិធីបង់)៖ ${target.title}`;
        } else if (oldWasRfPaid && !newIsRfPaid) {
          rfDeltaKhr = -oldExpense.amountKhr;
          reason = `បង្វិលសងវិញ (កែប្រែវិធីបង់)៖ ${target.title}`;
        } else if (oldWasRfPaid && newIsRfPaid) {
          rfDeltaKhr = target.amountKhr - oldExpense.amountKhr;
          if (rfDeltaKhr > 0) {
            reason = `ដកបន្ថែម (កែប្រែចំនួនទឹកប្រាក់)៖ ${target.title}`;
          } else if (rfDeltaKhr < 0) {
            reason = `បង្វិលសងវិញ (កែប្រែបន្ថយចំនួន)៖ ${target.title}`;
          }
        }

        if (rfDeltaKhr > 0) {
          nextRf = withdrawReserveFund(rfDeltaKhr, Number((rfDeltaKhr / exchangeRate).toFixed(2)), reason, target.id);
        } else if (rfDeltaKhr < 0) {
          nextRf = replenishReserveFund(Math.abs(rfDeltaKhr), Number((Math.abs(rfDeltaKhr) / exchangeRate).toFixed(2)), 'កែប្រែចំណាយ', reason);
        }

        fetch('/api/save-expense', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expense: target, reserveFund: nextRf }),
        }).catch(() => {});
      }

      safeSetStorage('bakery_expenses', JSON.stringify(updated));
      saveToLanSync({
        products,
        sales,
        customOrders,
        expenses: updated,
        storeInfo,
        flavors,
        reserveFund: nextRf || reserveFundRef.current,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });

    syncSaveDoc('expenses', id, fullTarget || updatedData);
  };

  const batchDeductExpensesToReserveFund = (expenseIds: string[]) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    setExpenses((prev) => {
      const targets = prev.filter((e) => expenseIds.includes(e.id) && e.paymentMethod !== 'RESERVE_FUND');
      if (targets.length === 0) return prev;

      const totalDeductKhr = targets.reduce((sum, e) => sum + e.amountKhr, 0);
      const totalDeductUsd = Number((totalDeductKhr / exchangeRate).toFixed(2));

      const updated = prev.map((exp) =>
        expenseIds.includes(exp.id) ? { ...exp, paymentMethod: 'RESERVE_FUND' as const } : exp
      );

      const nextRf = withdrawReserveFund(
        totalDeductKhr,
        totalDeductUsd,
        `កាត់ចំណាយសាច់ប្រាក់សរុប ${targets.length} ប្រតិបត្តិការ ចូលទុនបម្រុង`
      );

      safeSetStorage('bakery_expenses', JSON.stringify(updated));
      saveToLanSync({
        products,
        sales,
        customOrders,
        expenses: updated,
        storeInfo,
        flavors,
        reserveFund: nextRf,
        telegramConfig: getStoredTelegramConfig(),
      }, true);

      // Save each updated expense to disk & cloud
      targets.forEach((t) => {
        const updatedTarget = { ...t, paymentMethod: 'RESERVE_FUND' as const };
        fetch('/api/save-expense', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expense: updatedTarget, reserveFund: nextRf }),
        }).catch(() => {});
        syncSaveDoc('expenses', t.id, updatedTarget);
      });

      return updated;
    });
  };

  const deleteExpense = (id: string) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    recordDeletedId('expenses', id, deletedExpenseIds);

    const targetExp = expenses.find((e) => e.id === id);
    let nextRf: ReserveFund | undefined = undefined;

    // If the deleted expense was from Reserve Fund or cash and paid, automatically refund it back
    const wasRfPaid = targetExp && isExpensePaidFromReserve(targetExp);
    if (wasRfPaid && targetExp) {
      nextRf = replenishReserveFund(
        targetExp.amountKhr,
        targetExp.amountUsd,
        'បង្វិលសងវិញពីការលុបចំណាយ',
        `លុបចំណាយ៖ ${targetExp.title}`
      );
    }

    // 1. Immediately call atomic server deletion endpoint
    fetch('/api/delete-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reserveFund: nextRf }),
    }).catch(() => {});

    // 2. Optimistically update local React state & LocalStorage
    setExpenses((prev) => {
      const updated = prev.filter((exp) => exp.id !== id);
      safeSetStorage('bakery_expenses', JSON.stringify(updated));
      saveToLanSync({
        products,
        sales,
        customOrders,
        expenses: updated,
        storeInfo,
        flavors,
        reserveFund: nextRf || reserveFundRef.current,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });

    // 3. Delete from Firebase if configured
    syncDeleteDoc('expenses', id);
  };

  const clearAllExpenses = () => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    expenses.forEach((e) => {
      deletedExpenseIds.current.add(e.id);
      syncDeleteDoc('expenses', e.id);
    });

    // 1. Call atomic server clear endpoint
    fetch('/api/clear-all-expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});

    // 2. Clear local state
    setExpenses([]);
    safeSetStorage('bakery_expenses', JSON.stringify([]));
    saveToLanSync({
      products,
      sales,
      customOrders,
      expenses: [],
      storeInfo,
      flavors,
      telegramConfig: getStoredTelegramConfig(),
    }, true);
  };

  const updateExpenseDatesFrom2024To2026 = (): number => {
    let count = 0;
    setExpenses((prev) => {
      const updated = prev.map((e) => {
        let changed = false;
        let newDate = e.date;
        let newCreatedAt = e.createdAt;
        let newDueDate = e.dueDate;

        if (e.date && e.date.includes('2024')) {
          newDate = e.date.replace(/2024/g, '2026');
          changed = true;
        }
        if (e.createdAt && e.createdAt.includes('2024')) {
          newCreatedAt = e.createdAt.replace(/2024/g, '2026');
          changed = true;
        }
        if (e.dueDate && e.dueDate.includes('2024')) {
          newDueDate = e.dueDate.replace(/2024/g, '2026');
          changed = true;
        }

        if (changed) {
          count++;
          const updatedItem = {
            ...e,
            date: newDate,
            createdAt: newCreatedAt,
            dueDate: newDueDate,
          };
          syncSaveDoc('expenses', e.id, updatedItem);
          return updatedItem;
        }
        return e;
      });

      if (count > 0) {
        safeSetStorage('bakery_expenses', JSON.stringify(updated));
        saveToLanSync({
          products,
          sales,
          customOrders,
          expenses: updated,
          storeInfo,
          flavors,
          reserveFund: reserveFundRef.current,
          telegramConfig: getStoredTelegramConfig(),
        }, true);
      }
      return updated;
    });

    return count;
  };

  const totalExpensesUsd = expenses.reduce((acc, exp) => acc + exp.amountUsd, 0);
  const totalExpensesKhr = Math.round(totalExpensesUsd * exchangeRate);

  // Flavor actions
  const addFlavor = (flavorName: string) => {
    const trimmed = flavorName.trim();
    if (!trimmed || flavors.includes(trimmed)) return;
    setFlavors((prev) => {
      const updated = [trimmed, ...prev];
      try { localStorage.setItem('bakery_flavors', JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ flavors: updated });
      return updated;
    });
  };

  const updateFlavor = (oldFlavor: string, newFlavor: string) => {
    const trimmed = newFlavor.trim();
    if (!trimmed) return;
    setFlavors((prev) => {
      const updated = prev.map((f) => (f === oldFlavor ? trimmed : f));
      try { localStorage.setItem('bakery_flavors', JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ flavors: updated });
      return updated;
    });
  };

  const deleteFlavor = (flavorName: string) => {
    setFlavors((prev) => {
      const updated = prev.filter((f) => f !== flavorName);
      try { localStorage.setItem('bakery_flavors', JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ flavors: updated });
      return updated;
    });
  };

  // Party Addon actions
  const addPartyAddon = (nameKh: string, priceKhr: number, priceUsd?: number) => {
    const validKhr = Math.max(0, Number(priceKhr) || 0);
    const validUsd = priceUsd !== undefined ? Number(priceUsd) : Number((validKhr / exchangeRate).toFixed(2));
    const newAddon: PartyAddon = {
      id: `addon-${Date.now()}`,
      nameKh: nameKh.trim(),
      priceKhr: validKhr,
      priceUsd: validUsd,
    };
    setPartyAddons((prev) => {
      const updated = [...prev, newAddon];
      try { localStorage.setItem('bakery_party_addons', JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ partyAddons: updated });
      syncSaveDoc('settings', 'partyAddons', { items: updated });
      return updated;
    });
  };

  const updatePartyAddon = (id: string, nameKh: string, priceKhr: number, priceUsd?: number) => {
    const validKhr = Math.max(0, Number(priceKhr) || 0);
    const validUsd = priceUsd !== undefined ? Number(priceUsd) : Number((validKhr / exchangeRate).toFixed(2));
    setPartyAddons((prev) => {
      const updated = prev.map((a) =>
        a.id === id
          ? {
              ...a,
              nameKh: nameKh.trim() || a.nameKh,
              priceKhr: validKhr,
              priceUsd: validUsd,
            }
          : a
      );
      try { localStorage.setItem('bakery_party_addons', JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ partyAddons: updated });
      syncSaveDoc('settings', 'partyAddons', { items: updated });
      return updated;
    });
  };

  const deletePartyAddon = (id: string) => {
    setPartyAddons((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try { localStorage.setItem('bakery_party_addons', JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ partyAddons: updated });
      syncSaveDoc('settings', 'partyAddons', { items: updated });
      return updated;
    });
  };

  // Product actions
  const addProduct = (product: Omit<Product, 'id'>) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setProducts((prev) => {
      const updated = sortProductsNewestFirst([newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
      safeSetStorage('bakery_products', JSON.stringify(updated));
      return updated;
    });

    // Save atomically and instantly to server
    fetch('/api/save-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: newProduct }),
    }).catch((err) => console.error('Error saving product to LAN:', err));

    syncSaveDoc('products', newProduct.id, newProduct);
  };

  const updateProduct = (product: Product) => {
    const updatedProd: Product = {
      ...product,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === updatedProd.id ? updatedProd : p));
      safeSetStorage('bakery_products', JSON.stringify(updated));
      return updated;
    });

    fetch('/api/save-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: updatedProd }),
    }).catch((err) => console.error('Error saving product to LAN:', err));

    syncSaveDoc('products', updatedProd.id, updatedProd);
  };

  const deleteProduct = (productId: string) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    recordDeletedId('products', productId, deletedProductIds);

    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      safeSetStorage('bakery_products', JSON.stringify(updated));
      return updated;
    });

    fetch('/api/delete-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId }),
    }).catch((err) => console.error('Error deleting product from LAN:', err));

    syncDeleteDoc('products', productId);
  };

  const restockProduct = (productId: string, additionalStock: number) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    let updatedTarget: Product | null = null;
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, (p.stockQty || 0) + additionalStock);
          const updatedProd = { ...p, stockQty: newStock };
          updatedTarget = updatedProd;
          return updatedProd;
        }
        return p;
      });
      safeSetStorage('bakery_products', JSON.stringify(updated));
      return updated;
    });

    if (updatedTarget) {
      fetch('/api/save-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: updatedTarget }),
      }).catch(() => {});
      syncSaveDoc('products', productId, updatedTarget);
    }
  };

  // Cart actions
  const addToCart = (product: Product, size?: string, flavor?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedFlavor === flavor
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [...prev, { product, quantity: 1, selectedSize: size, selectedFlavor: flavor }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const next = [...prev];
      next[index].quantity = quantity;
      return next;
    });
  };

  const updateCartItemPrice = (index: number, newPriceUsd: number) => {
    setCart((prev) => {
      const next = [...prev];
      if (next[index]) {
        const validUsd = Math.max(0, Number(newPriceUsd) || 0);
        next[index] = {
          ...next[index],
          product: {
            ...next[index].product,
            priceUsd: validUsd,
            priceKhr: Math.round(validUsd * exchangeRate),
          },
        };
      }
      return next;
    });
  };

  const addCustomPricedItem = (nameKh: string, priceUsd: number, quantity = 1, note?: string) => {
    const validUsd = Math.max(0, Number(priceUsd) || 0);
    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      nameKh: nameKh.trim() || 'នំកុម្ម៉ង់ពិសេស (Custom Cake)',
      nameEn: 'Custom Cake / Item',
      categoryId: 'custom',
      priceUsd: validUsd,
      priceKhr: Math.round(validUsd * exchangeRate),
      costPriceUsd: 0,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
      stockQty: 999,
      unit: 'នំ',
      isCustom: true,
      description: note?.trim() || undefined,
    };
    setCart((prev) => [
      ...prev,
      { product: customProduct, quantity: Math.max(1, quantity), note: note?.trim() || undefined },
    ]);
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalKhr = cart.reduce(
    (total, item) =>
      total +
      (item.product.priceKhr ?? Math.round(item.product.priceUsd * exchangeRate)) *
        item.quantity,
    0
  );
  const cartTotalUsd = Number((cartTotalKhr / exchangeRate).toFixed(2));


  // Inventory actions
  const addIngredient = (ingredientData: Omit<Ingredient, 'id'>) => {
    const newIngredient: Ingredient = {
      ...ingredientData,
      id: `ing-${Date.now()}`,
    };
    setIngredients((prev) => {
      const updated = [newIngredient, ...prev];
      try {
        localStorage.setItem('bakery_ingredients', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    saveFirestoreDoc('ingredients', newIngredient.id, newIngredient);
  };

  const updateIngredient = (updatedIngredient: Ingredient) => {
    setIngredients((prev) => {
      const updated = prev.map((ing) => (ing.id === updatedIngredient.id ? updatedIngredient : ing));
      try {
        localStorage.setItem('bakery_ingredients', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    saveFirestoreDoc('ingredients', updatedIngredient.id, updatedIngredient);
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => {
      const updated = prev.filter((ing) => ing.id !== id);
      try {
        localStorage.setItem('bakery_ingredients', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    deleteFirestoreDoc('ingredients', id);
  };

  const restockIngredient = (id: string, amount: number) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id === id) {
          const newStock = Math.max(0, Number((ing.currentStock + amount).toFixed(3)));
          const updated = { ...ing, currentStock: newStock };
          saveFirestoreDoc('ingredients', id, updated);
          return updated;
        }
        return ing;
      })
    );
  };

  const useIngredientStock = (id: string, usedAmount: number) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id === id) {
          const newStock = Math.max(0, Number((ing.currentStock - usedAmount).toFixed(3)));
          const newUsed = Number(((ing.totalUsed || 0) + usedAmount).toFixed(3));
          const updated = { ...ing, currentStock: newStock, totalUsed: newUsed };
          saveFirestoreDoc('ingredients', id, updated);
          return updated;
        }
        return ing;
      })
    );
  };

  const lowStockCount = ingredients.filter((ing) => ing.currentStock <= ing.minAlertStock).length;

  // Recipe & BOM Costing actions
  const addRecipe = (recipeData: Omit<Recipe, 'id'>): Recipe => {
    isUpdatingFromLan.current = false;
    const newRecipe: Recipe = {
      ...recipeData,
      id: `recipe-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    setRecipes((prev) => {
      const updated = [newRecipe, ...prev];
      try {
        localStorage.setItem('bakery_recipes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    saveFirestoreDoc('recipes', newRecipe.id, newRecipe);
    return newRecipe;
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    isUpdatingFromLan.current = false;
    const recipeWithTime: Recipe = {
      ...updatedRecipe,
      updatedAt: new Date().toISOString(),
    };

    setRecipes((prev) => {
      const updated = prev.map((r) => (r.id === updatedRecipe.id ? recipeWithTime : r));
      try {
        localStorage.setItem('bakery_recipes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    saveFirestoreDoc('recipes', updatedRecipe.id, recipeWithTime);
  };

  const deleteRecipe = (id: string) => {
    isUpdatingFromLan.current = false;
    setRecipes((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('bakery_recipes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    deleteFirestoreDoc('recipes', id);
  };

  // Complete Live Sale
  const completeSale = (saleData: Omit<CompletedSale, 'id' | 'orderNumber' | 'createdAt'>): CompletedSale => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const randomSuffix = String(sales.length + 1).padStart(3, '0');
    const orderNumber = `POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomSuffix}`;
    const newSale: CompletedSale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };

    // Deduct stock for products sold
    const updatedProducts = products.map((p) => {
      const soldItem = saleData.items.find((item) => item.productId === p.id);
      if (soldItem) {
        const updated = { ...p, stockQty: Math.max(0, p.stockQty - soldItem.quantity) };
        syncSaveDoc('products', p.id, updated);
        return updated;
      }
      return p;
    });

    // 1. Immediately atomic save to server
    fetch('/api/save-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sale: newSale, updatedProducts }),
    }).catch(() => {});

    // 2. Optimistic local state & LocalStorage update
    setSales((prev) => {
      const updated = [newSale, ...prev.filter((s) => s.id !== newSale.id)];
      safeSetStorage('bakery_sales', JSON.stringify(updated));
      saveToLanSync({
        products: updatedProducts,
        sales: updated,
        customOrders,
        expenses,
        storeInfo,
        flavors,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });

    setProducts(updatedProducts);
    safeSetStorage('bakery_products', JSON.stringify(updatedProducts));

    syncSaveDoc('sales', newSale.id, newSale);
    clearCart();
    notifyTelegramSale(newSale, storeInfo, exchangeRate);

    // Update shift sales
    if (currentShift && currentShift.status === 'OPEN') {
      setCurrentShift({
        ...currentShift,
        totalSalesUsd: currentShift.totalSalesUsd + newSale.totalUsd,
        totalOrdersCount: currentShift.totalOrdersCount + 1,
      });
    }

    return newSale;
  };

  // Add Past / Backdated Sale
  const addPastSale = (saleData: Omit<CompletedSale, 'id'>) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const newSale: CompletedSale = {
      ...saleData,
      id: `sale-past-${Date.now()}`,
    };

    fetch('/api/save-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sale: newSale }),
    }).catch(() => {});

    setSales((prev) => {
      const updated = [newSale, ...prev];
      try { localStorage.setItem('bakery_sales', JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({
        products,
        sales: updated,
        customOrders,
        expenses,
        storeInfo,
        flavors,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });
    syncSaveDoc('sales', newSale.id, newSale);
  };

  // Update Existing Sale
  const updateSale = (updatedSale: CompletedSale) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    fetch('/api/save-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sale: updatedSale }),
    }).catch(() => {});

    setSales((prev) => {
      const updated = prev.map((s) => (s.id === updatedSale.id ? updatedSale : s));
      safeSetStorage('bakery_sales', JSON.stringify(updated));
      saveToLanSync({
        products,
        sales: updated,
        customOrders,
        expenses,
        storeInfo,
        flavors,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });
    syncSaveDoc('sales', updatedSale.id, updatedSale);
  };

  // Delete Sale with stock restoration support
  const deleteSale = (id: string, restoreStock: boolean = true) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    recordDeletedId('sales', id, deletedSaleIds);

    // If this sale was generated from a custom order, also mark the corresponding order
    // to prevent self-healing auto-regeneration
    if (id.startsWith('sale-custom-')) {
      const orderId = id.replace('sale-custom-', '');
      recordDeletedId('orders', orderId, deletedOrderIds);
    }

    // 1. Immediately call atomic server deletion endpoint
    fetch('/api/delete-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});

    // Find the sale being deleted to inspect purchased items
    const saleToDelete = sales.find((s) => s.id === id);
    let updatedProducts = products;

    // Restore stock if requested and items exist in the sale
    if (restoreStock && saleToDelete && saleToDelete.items && saleToDelete.items.length > 0) {
      updatedProducts = products.map((p) => {
        const itemToRestore = saleToDelete.items.find((item) => item.productId === p.id);
        if (itemToRestore && itemToRestore.quantity > 0) {
          const restoredStock = (p.stockQty || 0) + itemToRestore.quantity;
          const updatedProd = { ...p, stockQty: restoredStock };
          syncSaveDoc('products', p.id, updatedProd);
          return updatedProd;
        }
        return p;
      });

      setProducts(updatedProducts);
      safeSetStorage('bakery_products', JSON.stringify(updatedProducts));

      fetch('/api/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updatedProducts }),
      }).catch(() => {});
    }

    // 2. Optimistically update local React state & LocalStorage + IndexedDB
    setSales((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      safeSetStorage('bakery_sales', JSON.stringify(updated));
      saveToLanSync({
        products: updatedProducts,
        sales: updated,
        customOrders,
        expenses,
        storeInfo,
        flavors,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });
    syncDeleteDoc('sales', id);

    // Adjust open shift if the deleted sale belonged to it
    if (saleToDelete && currentShift && currentShift.status === 'OPEN') {
      const saleTime = new Date(saleToDelete.createdAt).getTime();
      const shiftStartTime = new Date(currentShift.startTime).getTime();
      if (!isNaN(saleTime) && !isNaN(shiftStartTime) && saleTime >= shiftStartTime) {
        setCurrentShift({
          ...currentShift,
          totalSalesUsd: Math.max(0, currentShift.totalSalesUsd - saleToDelete.totalUsd),
          totalOrdersCount: Math.max(0, currentShift.totalOrdersCount - 1),
        });
      }
    }
  };

  const clearAllSales = () => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    sales.forEach((s) => {
      recordDeletedId('sales', s.id, deletedSaleIds);
      if (s.id.startsWith('sale-custom-')) {
        const orderId = s.id.replace('sale-custom-', '');
        recordDeletedId('orders', orderId, deletedOrderIds);
      }
    });

    // 1. Immediately call atomic server clear endpoint
    fetch('/api/clear-all-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});

    sales.forEach((s) => {
      syncDeleteDoc('sales', s.id);
    });
    setSales([]);
    safeSetStorage('bakery_sales', JSON.stringify([]));
    saveToLanSync({
      products,
      sales: [],
      customOrders,
      expenses,
      storeInfo,
      flavors,
      telegramConfig: getStoredTelegramConfig(),
    }, true);
  };

  // Custom cake orders actions
  const addCustomOrder = (orderData: Omit<CustomCakeOrder, 'id' | 'orderNumber' | 'createdAt'>): CustomCakeOrder => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomSuffix}`;
    const newOrder: CustomCakeOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };
    setCustomOrders((prev) => {
      const updated = [newOrder, ...prev];
      safeSetStorage('bakery_custom_orders', JSON.stringify(updated));
      saveToLanSync({
        products,
        sales,
        customOrders: updated,
        expenses,
        storeInfo,
        flavors,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });

    // Save to LAN server atomically
    fetch('/api/save-custom-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder }),
    }).catch(() => {});

    syncSaveDoc('customOrders', newOrder.id, newOrder);
    notifyTelegramCustomOrder(newOrder, storeInfo, exchangeRate);
    return newOrder;
  };

  // Helper to construct a completed sale record from a custom cake/bread order
  const buildSaleFromCustomOrder = (order: CustomCakeOrder): CompletedSale => {
    const orderTotalKhr = order.totalKhr ?? Math.round(order.totalUsd * exchangeRate);
    const receiptItems =
      order.orderType === 'BREAD' && order.breadItems && order.breadItems.length > 0
        ? order.breadItems.map((it, idx) => ({
            productId: `bread-${order.id}-${idx}`,
            nameKh: `${it.nameKh} (${it.unit})`,
            nameEn: `${it.nameEn || it.nameKh} (${it.unit})`,
            quantity: it.quantity,
            priceUsd: it.pricePerUnitUsd,
            priceKhr: it.pricePerUnitKhr,
          }))
        : [
            {
              productId: `custom-${order.id}`,
              nameKh:
                order.orderType === 'BREAD'
                  ? `កុម្ម៉ង់នំបុ័ង៖ ${order.cakeName || 'នំបុ័ងពិសេស'}`
                  : `នំកុម្ម៉ង់៖ ${order.cakeName} (${order.size})`,
              nameEn:
                order.orderType === 'BREAD'
                  ? `Bread Order: ${order.cakeName || 'Custom Bread'}`
                  : `Custom Cake: ${order.cakeName} (${order.size})`,
              quantity: 1,
              priceUsd: order.totalUsd,
              priceKhr: orderTotalKhr,
              image: order.referenceImage || undefined,
            },
          ];

    return {
      id: `sale-custom-${order.id}`,
      orderNumber: order.orderNumber,
      items: receiptItems,
      subtotalUsd: order.totalUsd,
      discountUsd: 0,
      totalUsd: order.totalUsd,
      totalKhr: orderTotalKhr,
      paymentMethod: order.paymentMethod || 'CASH_KHR',
      paidUsd: order.totalUsd,
      paidKhr: orderTotalKhr,
      changeUsd: 0,
      changeKhr: 0,
      cashierName: currentStaff?.name || 'ម្ចាស់ហាង (Admin)',
      customerName: order.customerName,
      customerPhone: order.phone,
      isDeposit: false,
      depositKhr: order.depositKhr,
      depositUsd: order.depositUsd,
      remainingKhr: 0,
      remainingUsd: 0,
      pickupDate: order.pickupDate,
      pickupTime: order.pickupTime,
      notes:
        order.orderType === 'BREAD'
          ? `កុម្ម៉ង់នំបុ័ង & នំដុត (${order.packagingOption || 'ច្រកធម្មតា'}) • បានប្រគល់ជូនរួចរាល់`
          : `នំកុម្ម៉ង់ពិសេស (រសជាតិ៖ ${order.flavor}${order.inscription ? ' • អក្សរលើនំ៖ ' + order.inscription : ''}) • បានប្រគល់ជូនភ្ញៀវរួចរាល់`,
      createdAt: new Date().toISOString(),
    };
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const currentOrders = customOrdersRef.current;
    const targetOrder = currentOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;
    const oldStatus = targetOrder.status;

    // Immediately update customOrders state and storage
    const updatedOrders = currentOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setCustomOrders(updatedOrders);
    safeSetStorage('bakery_custom_orders', JSON.stringify(updatedOrders));

    syncSaveDoc('customOrders', orderId, { status: newStatus });
    fetch('/api/save-custom-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: { ...targetOrder, status: newStatus } }),
    }).catch(() => {});

    // Transition TO 'DELIVERED': Record sale & revenue
    if (newStatus === 'DELIVERED' && oldStatus !== 'DELIVERED') {
      const order = { ...targetOrder, status: newStatus };
      const currentSales = salesRef.current;

      const existingSaleIndex = currentSales.findIndex(
        (s) =>
          s.id === `sale-custom-${order.id}` ||
          s.orderNumber === order.orderNumber ||
          (order.themeNotes && order.themeNotes.includes(s.orderNumber))
      );

      if (existingSaleIndex >= 0) {
        const existingSale = currentSales[existingSaleIndex];
        const updatedSale: CompletedSale = {
          ...existingSale,
          isDeposit: false,
          remainingKhr: 0,
          remainingUsd: 0,
          paidUsd: existingSale.totalUsd,
          paidKhr: existingSale.totalKhr,
          notes: existingSale.notes
            ? `${existingSale.notes} • បានប្រគល់ជូនភ្ញៀវ & បង់គ្រប់ចំនួន`
            : 'បានប្រគល់ជូនភ្ញៀវ & បង់គ្រប់ចំនួន',
        };
        updateSale(updatedSale);
        notifyTelegramSale(updatedSale, storeInfo, exchangeRate);
      } else {
        const newSale = buildSaleFromCustomOrder(order);

        setSales((prevSales) => {
          const updatedSales = [newSale, ...prevSales.filter((s) => s.id !== newSale.id)];
          safeSetStorage('bakery_sales', JSON.stringify(updatedSales));
          saveToLanSync(
            {
              products,
              sales: updatedSales,
              customOrders: updatedOrders,
              expenses,
              storeInfo,
              flavors,
              telegramConfig: getStoredTelegramConfig(),
            },
            true
          );
          return updatedSales;
        });

        fetch('/api/save-sale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sale: newSale }),
        }).catch(() => {});

        syncSaveDoc('sales', newSale.id, newSale);
        notifyTelegramSale(newSale, storeInfo, exchangeRate);

        if (currentShift && currentShift.status === 'OPEN') {
          setCurrentShift((prevShift) =>
            prevShift
              ? {
                  ...prevShift,
                  totalSalesUsd: prevShift.totalSalesUsd + newSale.totalUsd,
                  totalOrdersCount: prevShift.totalOrdersCount + 1,
                }
              : prevShift
          );
        }
      }
    } else if (oldStatus === 'DELIVERED' && newStatus !== 'DELIVERED') {
      const autoSaleId = `sale-custom-${orderId}`;
      setSales((prevSales) => {
        const updatedSales = prevSales.filter((s) => s.id !== autoSaleId);
        safeSetStorage('bakery_sales', JSON.stringify(updatedSales));
        saveToLanSync(
          {
            products,
            sales: updatedSales,
            customOrders: updatedOrders,
            expenses,
            storeInfo,
            flavors,
            telegramConfig: getStoredTelegramConfig(),
          },
          true
        );
        return updatedSales;
      });

      syncDeleteDoc('sales', autoSaleId);
      fetch('/api/delete-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: autoSaleId }),
      }).catch(() => {});

      if (currentShift && currentShift.status === 'OPEN') {
        setCurrentShift((prevShift) =>
          prevShift
            ? {
                ...prevShift,
                totalSalesUsd: Math.max(0, prevShift.totalSalesUsd - targetOrder.totalUsd),
                totalOrdersCount: Math.max(0, prevShift.totalOrdersCount - 1),
              }
            : prevShift
        );
      }
    }
  };

  const updateCustomOrder = (orderId: string, updates: Partial<CustomCakeOrder>) => {
    if (updates.status) {
      updateOrderStatus(orderId, updates.status);
    }
    setCustomOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
      safeSetStorage('bakery_custom_orders', JSON.stringify(updated));
      return updated;
    });
    syncSaveDoc('customOrders', orderId, updates);
  };

  const addCustomOrderDeposit = (
    orderId: string,
    additionalDepositKhr: number,
    paymentMethod?: 'CASH_USD' | 'CASH_KHR' | 'KHQR_BAKONG'
  ) => {
    let updatedOrder: CustomCakeOrder | undefined;
    setCustomOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id !== orderId) return o;
        const currentDepKhr = o.depositKhr ?? Math.round(o.depositUsd * exchangeRate);
        const orderTotalKhr = o.totalKhr ?? Math.round(o.totalUsd * exchangeRate);
        const newDepKhr = Math.min(orderTotalKhr, currentDepKhr + additionalDepositKhr);
        const newDepUsd = Number((newDepKhr / exchangeRate).toFixed(2));
        const res: CustomCakeOrder = {
          ...o,
          depositKhr: newDepKhr,
          depositUsd: newDepUsd,
          paymentMethod: paymentMethod || o.paymentMethod,
        };
        updatedOrder = res;
        return res;
      });
      safeSetStorage('bakery_custom_orders', JSON.stringify(updated));
      return updated;
    });

    if (updatedOrder) {
      syncSaveDoc('customOrders', orderId, updatedOrder);
      // Also update sales record if it exists
      const currentSales = salesRef.current;
      const targetSale = currentSales.find(
        (s) =>
          s.id === `sale-custom-${orderId}` ||
          s.orderNumber === (updatedOrder as CustomCakeOrder).orderNumber
      );
      if (targetSale) {
        const orderTotalKhr = (updatedOrder as CustomCakeOrder).totalKhr ?? Math.round((updatedOrder as CustomCakeOrder).totalUsd * exchangeRate);
        const isFullyPaid = ((updatedOrder as CustomCakeOrder).depositKhr ?? 0) >= orderTotalKhr;
        const remainingKhr = Math.max(0, orderTotalKhr - ((updatedOrder as CustomCakeOrder).depositKhr ?? 0));
        const remainingUsd = Number((remainingKhr / exchangeRate).toFixed(2));

        const updatedSale: CompletedSale = {
          ...targetSale,
          paidUsd: (updatedOrder as CustomCakeOrder).depositUsd,
          paidKhr: (updatedOrder as CustomCakeOrder).depositKhr ?? 0,
          depositUsd: (updatedOrder as CustomCakeOrder).depositUsd,
          depositKhr: (updatedOrder as CustomCakeOrder).depositKhr,
          remainingUsd,
          remainingKhr,
          isDeposit: !isFullyPaid,
          notes: isFullyPaid
            ? `${targetSale.notes || ''} • បានបង់គ្រប់ចំនួន`.trim()
            : targetSale.notes,
        };
        updateSale(updatedSale);
      }
    }
  };

  // Self-Healing Hook: Automatically generate missing sales for custom orders that were marked DELIVERED
  useEffect(() => {
    if (customOrders.length === 0) return;

    const deliveredWithoutSale = customOrders.filter((order) => {
      if (order.status !== 'DELIVERED') return false;
      const expectedSaleId = `sale-custom-${order.id}`;
      // CRITICAL GUARD: If this sale or order was explicitly deleted, NEVER resurrect it!
      if (
        deletedSaleIds.current.has(expectedSaleId) ||
        deletedOrderIds.current.has(order.id)
      ) {
        return false;
      }
      const hasSale = sales.some(
        (s) =>
          s.id === expectedSaleId ||
          s.orderNumber === order.orderNumber ||
          (order.themeNotes && order.themeNotes.includes(s.orderNumber))
      );
      return !hasSale;
    });

    if (deliveredWithoutSale.length > 0) {
      console.log(`[BakeryContext] Auto-syncing ${deliveredWithoutSale.length} delivered custom order(s) into sales history & revenue.`);
      const newSalesToInsert: CompletedSale[] = deliveredWithoutSale.map((order) => {
        return buildSaleFromCustomOrder(order);
      });

      setSales((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const filteredNew = newSalesToInsert.filter(
          (s) => !existingIds.has(s.id) && !deletedSaleIds.current.has(s.id)
        );
        if (filteredNew.length === 0) return prev;
        const combined = [...filteredNew, ...prev];
        safeSetStorage('bakery_sales', JSON.stringify(combined));
        filteredNew.forEach((s) => {
          syncSaveDoc('sales', s.id, s);
          fetch('/api/save-sale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sale: s }),
          }).catch(() => {});
        });
        return combined;
      });
    }
  }, [customOrders, sales, exchangeRate]);

  const deleteCustomOrder = (orderId: string) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    recordDeletedId('orders', orderId, deletedOrderIds);

    const autoSaleId = `sale-custom-${orderId}`;
    recordDeletedId('sales', autoSaleId, deletedSaleIds);

    setSales((prevSales) => {
      const updatedSales = prevSales.filter((s) => s.id !== autoSaleId);
      safeSetStorage('bakery_sales', JSON.stringify(updatedSales));
      return updatedSales;
    });
    syncDeleteDoc('sales', autoSaleId);
    fetch('/api/delete-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: autoSaleId }),
    }).catch(() => {});

    setCustomOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      safeSetStorage('bakery_custom_orders', JSON.stringify(updated));
      saveToLanSync({
        products,
        sales: sales.filter((s) => s.id !== autoSaleId),
        customOrders: updated,
        expenses,
        storeInfo,
        flavors,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });
    syncDeleteDoc('customOrders', orderId);
    fetch('/api/delete-custom-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId }),
    }).catch(() => {});
  };

  const clearAllCustomOrders = () => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    fetch('/api/clear-all-custom-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});

    // Clean up any custom sales created for these orders
    customOrders.forEach((o) => {
      recordDeletedId('orders', o.id, deletedOrderIds);
      const autoSaleId = `sale-custom-${o.id}`;
      recordDeletedId('sales', autoSaleId, deletedSaleIds);
      syncDeleteDoc('customOrders', o.id);
      syncDeleteDoc('sales', autoSaleId);
    });

    setSales((prevSales) => {
      const updatedSales = prevSales.filter((s) => !s.id.startsWith('sale-custom-'));
      safeSetStorage('bakery_sales', JSON.stringify(updatedSales));
      return updatedSales;
    });

    setCustomOrders([]);
    safeSetStorage('bakery_custom_orders', JSON.stringify([]));
    saveToLanSync({
      products,
      sales: sales.filter((s) => !s.id.startsWith('sale-custom-')),
      customOrders: [],
      expenses,
      storeInfo,
      flavors,
      telegramConfig: getStoredTelegramConfig(),
    }, true);
  };


  // Shift Management
  const openShift = (cashierName: string, openingCashUsd: number, openingCashKhr: number) => {
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      cashierName,
      startTime: new Date().toISOString(),
      openingCashUsd,
      openingCashKhr,
      totalSalesUsd: 0,
      totalOrdersCount: 0,
      status: 'OPEN',
    };
    setCurrentShift(newShift);
  };

  const closeShift = (closingCashUsd: number, closingCashKhr: number) => {
    if (!currentShift) return;
    const closedShift: Shift = {
      ...currentShift,
      endTime: new Date().toISOString(),
      closingCashUsd,
      closingCashKhr,
      status: 'CLOSED',
    };
    setCurrentShift(closedShift);
    notifyTelegramShiftClose(closedShift, storeInfo, exchangeRate);
  };

  // Full System Backup Export
  const exportBackupData = (): BakeryBackupData => {
    return {
      version: '1.0',
      backupDate: new Date().toISOString(),
      storeInfo,
      exchangeRate,
      products,
      categories,
      flavors,
      customOrders,
      ingredients,
      recipes,
      partyAddons,
      expenses,
      sales,
      staffMembers,
      currentShift,
    };
  };

  const downloadBackupFile = () => {
    const data = exportBackupData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `SweetBakery_Backup_${dateStr}_${timeStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackupData = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'ឯកសារមិនត្រឹមត្រូវ (Invalid JSON file)' };
      }

      if (!data.products && !data.sales && !data.storeInfo && !data.expenses) {
        return { success: false, message: 'ឯកសារនេះមិនមែនជាទិន្នន័យបម្រុងទុករបស់ SweetBakery ឡើយ' };
      }

      // Proactively trim old cache in localStorage before importing
      trimLocalStorageCache();

      if (data.storeInfo) {
        setStoreInfo(data.storeInfo);
        safeSetStorage('bakery_store_info', JSON.stringify(data.storeInfo));
      }
      if (data.exchangeRate) {
        const rate = Number(data.exchangeRate);
        setExchangeRate(rate);
        safeSetStorage('bakery_exchange_rate', String(rate));
      }
      if (Array.isArray(data.products)) {
        const sorted = sortProductsNewestFirst(data.products);
        setProducts(sorted);
        safeSetStorage('bakery_products', JSON.stringify(sorted));
      }
      if (Array.isArray(data.flavors)) {
        setFlavors(data.flavors);
        safeSetStorage('bakery_flavors', JSON.stringify(data.flavors));
      }
      if (Array.isArray(data.customOrders)) {
        setCustomOrders(data.customOrders);
        safeSetStorage('bakery_custom_orders', JSON.stringify(data.customOrders));
      }
      if (Array.isArray(data.ingredients)) {
        setIngredients(data.ingredients);
        safeSetStorage('bakery_ingredients', JSON.stringify(data.ingredients));
      }
      if (Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
        safeSetStorage('bakery_recipes', JSON.stringify(data.recipes));
      }
      if (Array.isArray(data.partyAddons)) {
        setPartyAddons(data.partyAddons);
        safeSetStorage('bakery_party_addons', JSON.stringify(data.partyAddons));
      }
      if (Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
        safeSetStorage('bakery_expenses', JSON.stringify(data.expenses));
      }
      if (Array.isArray(data.sales)) {
        setSales(data.sales);
        safeSetStorage('bakery_sales', JSON.stringify(data.sales));
      }
      if (Array.isArray(data.staffMembers)) {
        setStaffMembers(data.staffMembers);
        safeSetStorage('bakery_staff_members', JSON.stringify(data.staffMembers));
      }
      if (data.currentShift !== undefined) {
        setCurrentShift(data.currentShift);
        safeSetStorage('bakery_shift', JSON.stringify(data.currentShift));
      }

      return {
        success: true,
        message: 'បានបញ្ចូលទិន្នន័យជោគជ័យ!',
        stats: {
          productsCount: data.products?.length || 0,
          salesCount: data.sales?.length || 0,
          ordersCount: data.customOrders?.length || 0,
          expensesCount: data.expenses?.length || 0,
          staffCount: data.staffMembers?.length || 0,
          recipesCount: data.recipes?.length || 0,
        },
      };
    } catch (err: any) {
      return { success: false, message: `កំហុសក្នុងការអានឯកសារ: ${err?.message || 'Error'}` };
    }
  };

  const exportSalesCsv = () => {
    const BOM = '\uFEFF';
    const headers = [
      'លេខវិក្កយបត្រ',
      'កាលបរិច្ឆេទ',
      'អ្នកគិតលុយ',
      'អតិថិជន',
      'សរុប (USD)',
      'សរុប (KHR)',
      'វិធីទូទាត់',
      'ចំនួនមុខទំនិញ',
      'រាយមុខទំនិញ',
    ];
    const rows = sales.map((s) => {
      const itemsSummary = s.items
        .map((i) => `${i.nameKh || i.nameEn} x${i.quantity}`)
        .join('; ');
      return [
        `"${s.orderNumber}"`,
        `"${formatDateTimeDMY(s.createdAt)}"`,
        `"${s.cashierName || '-'}"`,
        `"${s.customerName || '-'}"`,
        s.totalUsd.toFixed(2),
        Math.round(s.totalKhr),
        `"${s.paymentMethod}"`,
        s.items.length,
        `"${itemsSummary.replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csvContent = BOM + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SweetBakery_Sales_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportExpensesCsv = () => {
    const BOM = '\uFEFF';
    const headers = [
      'កាលបរិច្ឆេទ (DD/MM/YYYY)',
      'ចំណងជើងចំណាយ',
      'ប្រភេទ',
      'ចំនួន (USD)',
      'ចំនួន (KHR)',
      'អ្នកចំណាយ',
      'កំណត់ចំណាំ',
    ];
    const rows = expenses.map((e) => [
      `"${formatDateDMY(e.date || e.createdAt)}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      e.amountUsd.toFixed(2),
      Math.round(e.amountKhr),
      `"${(e.paidBy || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ].join(','));
    const csvContent = BOM + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SweetBakery_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const enterDemoMode = () => {
    seedDemoDataIfMissing();
    setGlobalIsDemoMode(true);
    localStorage.setItem('bakery_is_demo_mode', 'true');
    setIsDemoMode(true);
    recordDemoDeviceVisit().catch(() => {});

    try {
      const demoProd = localStorage.getItem('demo_bakery_products');
      let prodList = initialProducts;
      if (demoProd) {
        try {
          const parsed = JSON.parse(demoProd);
          if (Array.isArray(parsed) && parsed.length > 0) prodList = parsed;
        } catch (e) {}
      }
      setProducts(sortProductsNewestFirst(prodList));

      const demoSales = localStorage.getItem('demo_bakery_sales');
      setSales(demoSales ? JSON.parse(demoSales) : initialSales);

      const demoOrders = localStorage.getItem('demo_bakery_custom_orders');
      setCustomOrders(demoOrders ? JSON.parse(demoOrders) : initialOrders);

      const demoExpensesData = localStorage.getItem('demo_bakery_expenses');
      setExpenses(demoExpensesData ? JSON.parse(demoExpensesData) : demoExpenses);

      const demoIngredients = localStorage.getItem('demo_bakery_ingredients');
      setIngredients(demoIngredients ? JSON.parse(demoIngredients) : initialIngredients);

      const demoRecipes = localStorage.getItem('demo_bakery_recipes');
      setRecipes(demoRecipes ? JSON.parse(demoRecipes) : initialRecipes);

      const demoAddons = localStorage.getItem('demo_bakery_party_addons');
      setPartyAddons(demoAddons ? JSON.parse(demoAddons) : initialPartyAddons);

      const demoFlavorsList = localStorage.getItem('demo_bakery_flavors');
      setFlavors(demoFlavorsList ? JSON.parse(demoFlavorsList) : initialFlavors);

      const demoShiftData = localStorage.getItem('demo_bakery_shift');
      setCurrentShift(demoShiftData ? JSON.parse(demoShiftData) : initialShift);

      const demoStore = localStorage.getItem('demo_bakery_store_info');
      setStoreInfo(demoStore ? JSON.parse(demoStore) : demoStoreInfo);

      const demoStaff = localStorage.getItem('demo_bakery_staff_members');
      const staffList = demoStaff ? JSON.parse(demoStaff) : demoStaffMembers;
      setStaffMembers(staffList);
      if (staffList.length > 0) {
        setCurrentStaff(staffList[0]);
      }

      setCart([]);
      setActiveReceipt(null);
    } catch (e) {
      console.error('Error entering demo mode:', e);
    }
  };

  const exitDemoMode = async () => {
    setGlobalIsDemoMode(false);
    localStorage.removeItem('bakery_is_demo_mode');
    setIsDemoMode(false);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('demo')) {
        url.searchParams.delete('demo');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
      }
    }

    try {
      const liveProd = (await idbGet('bakery_products')) || localStorage.getItem('bakery_products');
      let prodList = initialProducts;
      if (liveProd) {
        try {
          const parsed = JSON.parse(liveProd);
          if (Array.isArray(parsed) && parsed.length > 0) prodList = parsed;
        } catch (e) {}
      }
      setProducts(sortProductsNewestFirst(prodList));

      const liveSales = (await idbGet('bakery_sales')) || localStorage.getItem('bakery_sales');
      if (liveSales) setSales(JSON.parse(liveSales));

      const liveOrders = (await idbGet('bakery_custom_orders')) || localStorage.getItem('bakery_custom_orders');
      if (liveOrders) setCustomOrders(JSON.parse(liveOrders));

      const liveExpenses = (await idbGet('bakery_expenses')) || localStorage.getItem('bakery_expenses');
      if (liveExpenses) setExpenses(JSON.parse(liveExpenses));

      const liveIngredients = (await idbGet('bakery_ingredients')) || localStorage.getItem('bakery_ingredients');
      if (liveIngredients) setIngredients(JSON.parse(liveIngredients));

      const liveRecipes = (await idbGet('bakery_recipes')) || localStorage.getItem('bakery_recipes');
      if (liveRecipes) setRecipes(JSON.parse(liveRecipes));

      const liveAddons = localStorage.getItem('bakery_party_addons');
      if (liveAddons) setPartyAddons(JSON.parse(liveAddons));

      const liveFlavors = localStorage.getItem('bakery_flavors');
      if (liveFlavors) setFlavors(JSON.parse(liveFlavors));

      const liveShift = localStorage.getItem('bakery_shift');
      if (liveShift) setCurrentShift(JSON.parse(liveShift));

      const liveStore = localStorage.getItem('bakery_store_info');
      if (liveStore) setStoreInfo(JSON.parse(liveStore));

      const liveStaff = localStorage.getItem('bakery_staff_members');
      if (liveStaff) {
        try {
          const parsed = JSON.parse(liveStaff);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStaffMembers(parsed);
            setCurrentStaff(parsed[0]);
          }
        } catch (e) {}
      } else {
        setStaffMembers(initialStaffMembers);
        setCurrentStaff(initialStaffMembers[0]);
      }

      setCart([]);
      setActiveReceipt(null);
    } catch (e) {
      console.error('Error reloading live store data:', e);
    }
  };

  const resetDemoData = () => {
    localStorage.setItem('demo_bakery_products', JSON.stringify(initialProducts));
    localStorage.setItem('demo_bakery_sales', JSON.stringify(initialSales));
    localStorage.setItem('demo_bakery_custom_orders', JSON.stringify(initialOrders));
    localStorage.setItem('demo_bakery_expenses', JSON.stringify(demoExpenses));
    localStorage.setItem('demo_bakery_ingredients', JSON.stringify(initialIngredients));
    localStorage.setItem('demo_bakery_recipes', JSON.stringify(initialRecipes));
    localStorage.setItem('demo_bakery_party_addons', JSON.stringify(initialPartyAddons));
    localStorage.setItem('demo_bakery_flavors', JSON.stringify(initialFlavors));
    localStorage.setItem('demo_bakery_shift', JSON.stringify(initialShift));
    localStorage.setItem('demo_bakery_store_info', JSON.stringify(demoStoreInfo));
    localStorage.setItem('demo_bakery_staff_members', JSON.stringify(demoStaffMembers));

    setProducts(sortProductsNewestFirst(initialProducts));
    setSales(initialSales);
    setCustomOrders(initialOrders);
    setExpenses(demoExpenses);
    setIngredients(initialIngredients);
    setRecipes(initialRecipes);
    setPartyAddons(initialPartyAddons);
    setFlavors(initialFlavors);
    setCurrentShift(initialShift);
    setStoreInfo(demoStoreInfo);
    setCart([]);
    setActiveReceipt(null);
  };

  const [isRealStoreAuthModalOpen, setIsRealStoreAuthModalOpen] = useState(false);
  const [realStoreAuthSuccessCallback, setRealStoreAuthSuccessCallback] = useState<(() => void) | null>(null);

  const openRealStoreAuthModal = (onSuccess?: () => void) => {
    if (onSuccess) {
      setRealStoreAuthSuccessCallback(() => onSuccess);
    } else {
      setRealStoreAuthSuccessCallback(null);
    }
    setIsRealStoreAuthModalOpen(true);
  };

  const closeRealStoreAuthModal = () => {
    setIsRealStoreAuthModalOpen(false);
    setRealStoreAuthSuccessCallback(null);
  };

  const verifyRealStorePin = (pin: string): boolean => {
    const cleanPin = pin.trim();
    if (!cleanPin) return false;

    // 1. App Super Admin Master Keys (for emergency access only)
    if (cleanPin === '889977' || cleanPin === '999999' || cleanPin === 'admin@bakery2026') {
      const adminStaff = staffMembers.find((s) => s.role === 'ADMIN') || currentStaff;
      setCurrentStaff(adminStaff);
      return true;
    }

    // 2. Explicitly reject 1111 and 2222 for Real Store access (reserved strictly for Demo & new tenant sandboxes)
    if (cleanPin === '1111' || cleanPin === '2222') {
      return false;
    }

    // 3. Primary Owner PINs: 660168 (Store Owner PIN) or storeInfo.realStorePin (if changed and not 1111)
    if (
      cleanPin === '660168' ||
      (storeInfo?.realStorePin && cleanPin === storeInfo.realStorePin.trim() && cleanPin !== '1111')
    ) {
      const adminStaff = staffMembers.find((s) => s.role === 'ADMIN') || currentStaff;
      setCurrentStaff(adminStaff);
      return true;
    }

    // 4. Cashier PIN: 0202 (Real Cashier PIN)
    if (cleanPin === '0202') {
      const cashierStaff = staffMembers.find((s) => s.role === 'CASHIER') || currentStaff;
      setCurrentStaff(cashierStaff);
      return true;
    }

    // 5. Match against any active staff member's actual saved/changed PIN (excluding 1111 & 2222)
    // This respects all custom staff PIN changes (3333, 4444, etc.)
    const matchedStaff = staffMembers.find(
      (s) => s.isActive !== false && s.pinCode === cleanPin && s.pinCode !== '1111' && s.pinCode !== '2222'
    );
    if (matchedStaff) {
      setCurrentStaff(matchedStaff);
      return true;
    }

    return false;
  };

  const requestExitDemoMode = () => {
    // If PIN protection is enabled, require authentication
    if (storeInfo.requireRealStorePin !== false) {
      openRealStoreAuthModal(() => {
        exitDemoMode();
      });
    } else {
      exitDemoMode();
    }
  };

  const lockRealStoreToDemo = () => {
    sessionStorage.removeItem('bakery_real_store_unlocked');
    enterDemoMode();
  };

  const logoutAndLock = () => {
    sessionStorage.removeItem('bakery_real_store_unlocked');
    localStorage.removeItem('bakery_real_store_authorized_device');
    soundFx.playPop();
    openRealStoreAuthModal();
  };

  return (
    <BakeryContext.Provider
      value={{
        lang,
        setLang,
        exchangeRate,
        setExchangeRate,
        isDemoMode,
        hideDemoPrices,
        setHideDemoPrices,
        toggleHideDemoPrices,
        enterDemoMode,
        exitDemoMode,
        requestExitDemoMode,
        lockRealStoreToDemo,
        logoutAndLock,
        resetDemoData,
        demoDevices,
        demoDevicesCount: demoDevices.length,
        isRealStoreAuthModalOpen,
        openRealStoreAuthModal,
        closeRealStoreAuthModal,
        verifyRealStorePin,
        storeInfo,
        updateStoreInfo,
        staffMembers,
        currentStaff,
        setCurrentStaff,
        switchStaffByPin,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        hasPermission,
        categories,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        flavors,
        addFlavor,
        updateFlavor,
        deleteFlavor,
        partyAddons,
        addPartyAddon,
        updatePartyAddon,
        deletePartyAddon,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartItemPrice,
        addCustomPricedItem,
        clearCart,
        cartTotalUsd,
        cartTotalKhr,
        customOrders,
        addCustomOrder,
        updateOrderStatus,
        addCustomOrderDeposit,
        updateCustomOrder,
        deleteCustomOrder,
        clearAllCustomOrders,
        ingredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        restockIngredient,
        useIngredientStock,
        lowStockCount,
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        clearAllExpenses,
        updateExpenseDatesFrom2024To2026,
        totalExpensesUsd,
        totalExpensesKhr,
        reserveFund: dynamicReserveFund,
        updateReserveTarget,
        adjustCurrentBalance,
        replenishReserveFund,
        withdrawReserveFund,
        batchDeductExpensesToReserveFund,
        reconcileReserveFundWithExpenses,
        deleteReserveFundTransaction,
        clearReserveFundHistory,
        sales,
        completeSale,
        addPastSale,
        updateSale,
        deleteSale,
        clearAllSales,
        activeReceipt,
        setActiveReceipt,
        currentShift,
        openShift,
        closeShift,
        exportBackupData,
        downloadBackupFile,
        importBackupData,
        exportSalesCsv,
        exportExpensesCsv,
        isFirebaseConnected,
        firebaseSyncStatus,
        offlineSyncStatus,
        pendingSyncCount,
        lanSyncStatus,
        forceSyncLan,
        triggerAutoCloudSync: async () => {
          setFirebaseSyncStatus('syncing');
          await offlineSyncService.processQueue();
          await offlineSyncService.reconcileLocalDataToCloud({
            sales,
            customOrders,
            expenses,
            products,
            storeInfo,
            ingredients,
            recipes,
            staffMembers,
            reserveFund,
          });
          setFirebaseSyncStatus('connected');
        },
      }}
    >
      {children}
    </BakeryContext.Provider>
  );
};

export const useBakery = () => {
  const context = useContext(BakeryContext);
  if (!context) {
    throw new Error('useBakery must be used within a BakeryProvider');
  }
  return context;
};
