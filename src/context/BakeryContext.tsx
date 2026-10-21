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
import { roundKhr, usdToKhr, formatKhr } from '../utils/currencyUtils';
import { isKhmerMojibake, fixKhmerMojibake } from '../utils/khmerEncoding';
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
  isDefaultStore,
  DEFAULT_STORE_ID,
} from '../services/firebase';
import { getCurrentStoreUser } from '../services/authService';
import {
  notifyTelegramSale as rawNotifyTelegramSale,
  notifyTelegramCustomOrder as rawNotifyTelegramCustomOrder,
  notifyTelegramExpense as rawNotifyTelegramExpense,
  notifyTelegramShiftClose as rawNotifyTelegramShiftClose,
  getStoredTelegramConfig,
  saveStoredTelegramConfig,
  areTelegramConfigsEqual,
  TelegramConfig,
} from '../services/telegram';
import { setGeminiApiKeyLocally } from '../services/geminiInvoiceService';
import { offlineSyncService, SyncState } from '../services/offlineSyncService';
import { soundFx } from '../utils/audio';
import { formatDateDMY, formatDateTimeDMY, normalizeDateToYMD } from '../utils/dateUtils';
import { broadcastCustomerSync, subscribeCustomerSync } from '../services/customerSyncService';

// Global demo mode flag to safely block cloud sync, LAN disk writes, and Telegram alerts during Demo mode
let globalIsDemoMode = false;
export const setGlobalIsDemoMode = (val: boolean) => {
  globalIsDemoMode = val;
};
export const getGlobalIsDemoMode = () => globalIsDemoMode;

export const checkInitialDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  // If customer is opening direct customer ordering portal (?order=true), prioritize real store unless explicitly demo (?demo=true)
  if ((params.get('order') === 'true' || window.location.hash === '#order') && params.get('demo') !== 'true') {
    return false;
  }
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

export const isLanEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
  );
};

// Safe LAN Fetch: prevents any write/sync to backend JSON disk files during Demo Mode OR when running on Cloud Hosting (where /api/ does not exist)
const fetch: typeof window.fetch = (input, init) => {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  if (urlStr.includes('/api/')) {
    if (globalIsDemoMode || !isLanEnvironment()) {
      return Promise.resolve(
        new Response(JSON.stringify({ success: true, cloudOnly: true, exists: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
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
  alwaysRequireLoginOnStartup: true,
  hideCustomerPrices: true,
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
  realStorePin: '660168',
  requireRealStorePin: true,
  alwaysRequireLoginOnStartup: true,
  hideCustomerPrices: true,
};

export const initialPartyAddons: PartyAddon[] = [
  { id: 'hat', nameKh: '🎩 មួកខួបកំណើត (Pack 5)', priceUsd: 0.63, priceKhr: 2500, stockQty: 50, minAlertStock: 10 },
  { id: 'num-candle', nameKh: '🕯️ ទៀនលេខ 0-9 ពណ៌មាស', priceUsd: 1.0, priceKhr: 4000, stockQty: 100, minAlertStock: 20 },
  { id: 'sparkler', nameKh: '🎆 ទៀនកាំជ្រួចភ្លើង (Fountain)', priceUsd: 0.5, priceKhr: 2000, stockQty: 60, minAlertStock: 15 },
  { id: 'spray', nameKh: '❄️ ស្ព្រាយបាញ់ព្រិល/ខ្សែពណ៌', priceUsd: 0.63, priceKhr: 2500, stockQty: 40, minAlertStock: 10 },
  { id: 'topper', nameKh: '✨ ស្លាក Happy Birthday Acrylic', priceUsd: 1.2, priceKhr: 5000, stockQty: 80, minAlertStock: 15 },
  { id: 'card', nameKh: '💌 កាតជូនពរប្រណិត', priceUsd: 1.0, priceKhr: 4000, stockQty: 120, minAlertStock: 25 },
  { id: 'money-box', nameKh: 'មូលដ្ឋានដុល្លារខ្លី១កេស', priceUsd: 1.25, priceKhr: 5000, stockQty: 50, minAlertStock: 10 },
];

export const ensurePartyAddonDefaults = (list: any[], deletedIds?: Set<string>): PartyAddon[] => {
  const currentDeleted = deletedIds ? new Set(deletedIds) : loadDeletedIds('party_addons');
  currentDeleted.add('money-gun');

  if (!Array.isArray(list) || list.length === 0) {
    if (!isDefaultStore(getStoreId())) {
      return [];
    }
    return initialPartyAddons.filter((item) => !currentDeleted.has(item.id));
  }

  // Purge any deleted items and zombie money-gun / បាញ់លុយ
  const filteredList = list.filter((item) => {
    if (!item || !item.id) return false;
    if (currentDeleted.has(item.id)) return false;
    if (item.id === 'money-gun') return false;
    if (item.nameKh && (item.nameKh.includes('បាញ់លុយ') || item.nameKh.toLowerCase().includes('money-gun'))) return false;
    return true;
  });

  const existingIds = new Set(filteredList.map((item) => item.id));
  const merged: PartyAddon[] = filteredList.map((item) => {
    let priceUsd = item.priceUsd;
    let priceKhr = item.priceKhr;

    // Migrate any older initial template prices to user's updated standard pricing
    if (item.id === 'hat' && item.priceUsd === 2.0) {
      priceUsd = 0.63;
      priceKhr = 2500;
    } else if (item.id === 'num-candle' && item.priceUsd === 0.75) {
      priceUsd = 1.0;
      priceKhr = 4000;
    } else if (item.id === 'sparkler' && item.priceUsd === 1.5) {
      priceUsd = 0.5;
      priceKhr = 2000;
    } else if (item.id === 'spray' && item.priceUsd === 1.5) {
      priceUsd = 0.63;
      priceKhr = 2500;
    } else if (item.id === 'topper' && item.priceKhr === 4800) {
      priceKhr = 5000;
    }

    return {
      ...item,
      priceUsd: typeof priceUsd === 'number' && !isNaN(priceUsd) ? priceUsd : 1.0,
      priceKhr: typeof priceKhr === 'number' && !isNaN(priceKhr) ? priceKhr : 4000,
      stockQty: typeof item.stockQty === 'number' && !isNaN(item.stockQty) ? item.stockQty : 50,
      minAlertStock: typeof item.minAlertStock === 'number' && !isNaN(item.minAlertStock) ? item.minAlertStock : 10,
    };
  });

  // Only re-add initial items if they have NOT been deleted by the user (and only for default store)
  if (isDefaultStore(getStoreId())) {
    for (const initial of initialPartyAddons) {
      if (
        !existingIds.has(initial.id) &&
        !currentDeleted.has(initial.id) &&
        !merged.some((m) => m.nameKh === initial.nameKh)
      ) {
        merged.push(initial);
      }
    }
  }

  return merged;
};

export const seedDemoDataIfMissing = () => {
  if (typeof window === 'undefined') return;

  const demoKeys = [
    'demo_bakery_products',
    'demo_bakery_sales',
    'demo_bakery_custom_orders',
    'demo_bakery_expenses',
    'demo_bakery_ingredients',
    'demo_bakery_recipes',
    'demo_bakery_party_addons',
    'demo_bakery_flavors',
    'demo_bakery_shift',
    'demo_bakery_store_info',
    'demo_bakery_staff_members',
  ];

  // Purge any corrupted mojibake keys so they cleanly reseed with pristine Khmer Unicode
  demoKeys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw && (raw.includes('áž') || raw.includes('áŸ') || raw.includes('Ã'))) {
        localStorage.removeItem(key);
      }
    } catch (e) {}
  });

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

  const nonMock = (Array.isArray(items) ? items : []).filter((e) => {
    if (!e || !e.id || mockExpenseIds.has(e.id) || deletedIds.has(e.id)) return false;
    return true;
  });

  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();
  const result: Expense[] = [];

  // 1. Prioritize user-provided items (all 87 store expenses from database)
  for (const exp of nonMock) {
    if (!exp || !exp.id || seenIds.has(exp.id) || deletedIds.has(exp.id)) continue;
    seenIds.add(exp.id);

    const d = normalizeDateToYMD(exp.date || exp.createdAt || '');
    const cleanTitle = (exp.title || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const amt = Number(exp.amountUsd || 0).toFixed(2);
    const sig = `${d}|${cleanTitle}|${amt}`;

    if (seenSignatures.has(sig)) continue;
    seenSignatures.add(sig);

    result.push({
      ...exp,
      amountKhr: roundKhr(exp.amountKhr !== undefined ? exp.amountKhr : (exp.amountUsd * 4000)),
      unitPriceKhr: exp.unitPriceKhr !== undefined ? roundKhr(exp.unitPriceKhr) : undefined,
    });
  }

  // 2. Only inject initialExpenses if the store dataset is COMPLETELY EMPTY and it is the default store
  if (result.length === 0 && (!items || items.length === 0)) {
    if (!isDefaultStore(getStoreId())) {
      return [];
    }
    const officialInitials = (initialExpenses as any[]).filter((e: any) => e && e.id && !deletedIds.has(e.id) && !seenIds.has(e.id));
    for (const exp of officialInitials) {
      const d = normalizeDateToYMD(exp.date || exp.createdAt || '');
      const cleanTitle = (exp.title || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const amt = Number(exp.amountUsd || 0).toFixed(2);
      const sig = `${d}|${cleanTitle}|${amt}`;

      if (seenSignatures.has(sig) || seenIds.has(exp.id)) continue;
      seenIds.add(exp.id);
      seenSignatures.add(sig);

      result.push({
        ...exp,
        amountKhr: roundKhr(exp.amountKhr !== undefined ? exp.amountKhr : (exp.amountUsd * 4000)),
        unitPriceKhr: exp.unitPriceKhr !== undefined ? roundKhr(exp.unitPriceKhr) : undefined,
      });
    }
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
  exitDemoMode: (targetStaff?: StaffMember) => void;
  requestExitDemoMode: () => void;
  lockRealStoreToDemo: () => void;
  resetDemoData: () => void;
  demoDevices: DemoDeviceVisitor[];
  demoDevicesCount: number;

  // Real Store Passcode Authentication & Logout
  isRealStoreAuthModalOpen: boolean;
  openRealStoreAuthModal: (onSuccessCallback?: (authenticatedStaff?: StaffMember) => void) => void;
  closeRealStoreAuthModal: () => void;
  verifyRealStorePin: (pin: string) => boolean;
  realStoreAuthSuccessCallback: ((authenticatedStaff?: StaffMember) => void) | null;
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
  unavailableFlavors: string[];
  deletedFlavorIds: string[];
  flavorOverrides: Record<string, { nameKh: string; nameEn?: string }>;
  addFlavor: (flavorName: string) => void;
  updateFlavor: (oldFlavorOrId: string, newFlavorKh: string, newFlavorEn?: string) => void;
  deleteFlavor: (flavorNameOrId: string) => void;
  toggleFlavorAvailability: (flavorIdOrLabel: string) => void;
  setFlavorAvailability: (flavorIdOrLabel: string, isAvailable: boolean) => void;
  markAllFlavorsAvailable: () => void;
  restoreDefaultFlavors: () => void;

  partyAddons: PartyAddon[];
  addPartyAddon: (nameKh: string, priceKhr: number, priceUsd?: number, stockQty?: number, minAlertStock?: number) => PartyAddon;
  updatePartyAddon: (id: string, nameKh: string, priceKhr: number, priceUsd?: number, stockQty?: number, minAlertStock?: number) => void;
  restockPartyAddon: (id: string, additionalStock: number) => void;
  deletePartyAddon: (id: string) => void;
  restoreDefaultPartyAddons: () => void;
  deductPartyAddonsStockFromPastSales: (sinceDate?: string) => {
    totalSalesScanned: number;
    soldSummary: Record<string, number>;
    updatedAddons: PartyAddon[];
  };

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
  deleteCustomOrder: (orderId: string, restoreStock?: boolean) => void;
  clearAllCustomOrders: (restoreStock?: boolean) => void;

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
  batchAddExpenses: (expensesData: Array<Omit<Expense, 'id' | 'createdAt'>>) => Expense[];
  updateExpense: (id: string, updatedData: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  deleteExpensesByDateRange: (startDate?: string, endDate?: string, targetIds?: string[]) => number;
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
  deleteSalesByDateRange: (startDate?: string, endDate?: string, targetIds?: string[], restoreStock?: boolean) => number;
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

  roundKhr: (amount: number | string | undefined | null) => number;
  usdToKhr: (usd: number | string | undefined | null, rate?: number) => number;
  formatKhr: (amount: number | string | undefined | null) => string;
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
            // Only fix display name/avatar migrations for default store
            if (isDefaultStore(getStoreId())) {
              if (staff.name?.includes('ម៉ារី') || staff.name?.includes('Mary') || staff.id === 'staff-1') {
                return {
                  ...staff,
                  name: staff.name?.includes('ម៉ារី') || staff.name?.includes('Mary') ? 'ម្ចាស់ហាង (Admin)' : staff.name,
                  nameEn: staff.nameEn?.includes('Mary') ? 'Store Owner (Admin)' : staff.nameEn,
                  avatar: staff.avatar === '👩‍🍳' ? '👑' : staff.avatar,
                  pinCode: staff.pinCode || '660168',
                };
              }
              if (staff.id === 'staff-2' || staff.id === 'staff-1789379117825' || staff.name?.includes('វិជ្ជតា') || staff.name?.includes('សុធារិទ្ធ') || staff.name?.includes('Sothearith')) {
                return {
                  ...staff,
                  name: staff.name?.includes('សុធារិទ្ធ') || staff.name?.includes('Sothearith') ? 'វិជ្ជតា (Vicheta)' : staff.name,
                  nameEn: staff.nameEn?.includes('Sothearith') ? 'Vicheta (Cashier)' : staff.nameEn,
                  avatar: staff.avatar === '👨‍💼' ? '👩‍💼' : staff.avatar,
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
            }
            return staff;
          });
          localStorage.setItem('bakery_staff_members', JSON.stringify(sanitized));
          return sanitized;
        }
      } catch (e) {}
    }
    if (!isDefaultStore(getStoreId())) {
      const storeUser = getCurrentStoreUser();
      const ownerStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: storeUser?.storeName ? `ម្ចាស់ហាង (${storeUser.storeName})` : 'ម្ចាស់ហាង (Admin)',
        nameEn: 'Store Owner (Admin)',
        role: 'ADMIN',
        avatar: '👑',
        pinCode: '1234',
        isActive: true,
        permissions: {
          canAccessPos: true,
          canAccessShowcase: true,
          canAccessCustomOrders: true,
          canAccessSalesHistory: true,
          canEditSales: true,
          canAccessExpenses: true,
          canAccessInventory: true,
          canAccessReports: true,
          canAccessSettings: true,
        },
      };
      localStorage.setItem('bakery_staff_members', JSON.stringify([ownerStaff]));
      return [ownerStaff];
    }
    return initialStaffMembers;
  });

  const [currentStaff, setCurrentStaffState] = useState<StaffMember>(() => {
    const saved = localStorage.getItem('bakery_current_staff');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isDefaultStore(getStoreId())) {
          if (parsed && (parsed.name?.includes('ម៉ារី') || parsed.name?.includes('Mary') || parsed.id === 'staff-1')) {
            const sanitized = {
              ...parsed,
              name: parsed.name?.includes('ម៉ារី') || parsed.name?.includes('Mary') ? 'ម្ចាស់ហាង (Admin)' : parsed.name,
              nameEn: parsed.nameEn?.includes('Mary') ? 'Store Owner (Admin)' : parsed.nameEn,
              avatar: parsed.avatar === '👩‍🍳' ? '👑' : parsed.avatar,
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
        }
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {}
    }
    if (!isDefaultStore(getStoreId())) {
      const storeUser = getCurrentStoreUser();
      return {
        id: `staff-${Date.now()}`,
        name: storeUser?.storeName ? `ម្ចាស់ហាង (${storeUser.storeName})` : 'ម្ចាស់ហាង (Admin)',
        nameEn: 'Store Owner (Admin)',
        role: 'ADMIN',
        avatar: '👑',
        pinCode: '1234',
        isActive: true,
        permissions: {
          canAccessPos: true,
          canAccessShowcase: true,
          canAccessCustomOrders: true,
          canAccessSalesHistory: true,
          canEditSales: true,
          canAccessExpenses: true,
          canAccessInventory: true,
          canAccessReports: true,
          canAccessSettings: true,
        },
      };
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

    const currentSid = getStoreId();
    if (!isDefaultStore(currentSid)) {
      const storeUser = getCurrentStoreUser();
      const cleanStoreInfo: StoreInfo = {
        storeId: currentSid,
        nameKh: (storeUser?.storeId === currentSid ? storeUser.storeName : '') || `ហាងនំ (${currentSid})`,
        nameEn: (storeUser?.storeId === currentSid ? storeUser.storeName : '') || 'SweetBakery',
        logoUrl: '',
        phone: (storeUser?.storeId === currentSid ? storeUser.phone : '') || '',
        address: '',
        tagline: '',
        khqrQrImage: '',
        khqrMerchantName: '',
        khqrBakongId: '',
        khqrAccountNumber: '',
        khqrBankName: '',
        realStorePin: '',
        requireRealStorePin: false,
        alwaysRequireLoginOnStartup: false,
        hideCustomerPrices: false,
      };

      const saved = localStorage.getItem('bakery_store_info');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return {
              ...cleanStoreInfo,
              ...parsed,
              storeId: currentSid,
            };
          }
        } catch (e) {}
      }
      return cleanStoreInfo;
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
      hideCustomerPrices: true,
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

  // Helper to repair missing images or convert base64/broken images to official upload paths & heal Khmer text mojibake
  const healProductItem = (p: Product): { product: Product; changed: boolean } => {
    let changed = false;
    const updated = { ...p };

    // 1. Text repair (Khmer Mojibake auto-healing)
    const match =
      initialProducts.find((ip: Product) => ip.id === p.id) ||
      initialProducts.find(
        (ip: Product) =>
          ip.imageUrl &&
          (ip.imageUrl === p.imageUrl || (p.images && p.images.includes(ip.imageUrl)))
      );

    if (match) {
      if (isKhmerMojibake(updated.nameKh) || !updated.nameKh) {
        updated.nameKh = match.nameKh;
        changed = true;
      }
      if (isKhmerMojibake(updated.nameEn) || !updated.nameEn) {
        updated.nameEn = match.nameEn;
        changed = true;
      }
      if (isKhmerMojibake(updated.unit) || !updated.unit) {
        updated.unit = match.unit || 'នំ';
        changed = true;
      }
      if (isKhmerMojibake(updated.description)) {
        updated.description = match.description || '';
        changed = true;
      }
    }

    // Fallback algorithmic repair if still corrupted
    if (isKhmerMojibake(updated.nameKh)) {
      const fixed = fixKhmerMojibake(updated.nameKh);
      if (fixed && fixed !== updated.nameKh) {
        updated.nameKh = fixed;
        changed = true;
      }
    }
    if (isKhmerMojibake(updated.nameEn)) {
      const fixed = fixKhmerMojibake(updated.nameEn);
      if (fixed && fixed !== updated.nameEn) {
        updated.nameEn = fixed;
        changed = true;
      }
    }
    if (isKhmerMojibake(updated.unit)) {
      const fixed = fixKhmerMojibake(updated.unit);
      if (fixed && fixed !== updated.unit) {
        updated.unit = fixed;
        changed = true;
      }
    }
    if (isKhmerMojibake(updated.description)) {
      const fixed = fixKhmerMojibake(updated.description);
      if (fixed && fixed !== updated.description) {
        updated.description = fixed;
        changed = true;
      }
    }

    // 2. Image repair
    if (match) {
      const currentImg = (updated.imageUrl || '').trim();
      const needsImageFix =
        !currentImg ||
        currentImg.startsWith('data:') ||
        currentImg.length < 5 ||
        (match.imageUrl && match.imageUrl.startsWith('/uploads/products/') && currentImg !== match.imageUrl);

      if (needsImageFix && match.imageUrl) {
        updated.imageUrl = match.imageUrl;
        updated.images = match.images && match.images.length > 0 ? match.images : [match.imageUrl];
        changed = true;
      }
    }

    if ((!updated.images || updated.images.length === 0) && updated.imageUrl) {
      updated.images = [updated.imageUrl];
      changed = true;
    }

    return { product: updated, changed };
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
            const healed = parsed.map((p) => healProductItem(p).product);
            return sortProductsNewestFirst(healed);
          }
        } catch (e) {}
      }
      return sortProductsNewestFirst(initialProducts);
    }

    if (!isDefaultStore(getStoreId())) {
      const saved = localStorage.getItem('bakery_products');
      if (saved) {
        try {
          const parsed: Product[] = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const healed = parsed.map((p) => healProductItem(p).product);
            return sortProductsNewestFirst(healed);
          }
        } catch (e) {}
      }
      return [];
    }

    const saved = localStorage.getItem('bakery_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const healed = parsed.map((p) => healProductItem(p).product);
          const missingItems = initialProducts.filter(
            (ip: Product) => !healed.some((existing) => existing.id === ip.id)
          );
          return sortProductsNewestFirst([...healed, ...missingItems]);
        }
      } catch (e) {
        return sortProductsNewestFirst(initialProducts);
      }
    }
    return sortProductsNewestFirst(initialProducts);
  });

  // Emergency Auto-Recovery: Never allow products to become 0 unless store is explicitly reset (only for default store)
  useEffect(() => {
    if (products.length === 0) {
      if (!isDefaultStore(getStoreId()) || globalIsDemoMode) return;
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

  // Auto-heal products in localStorage and IndexedDB on mount
  useEffect(() => {
    try {
      // 1. Heal demo products
      const savedDemo = localStorage.getItem('demo_bakery_products');
      if (savedDemo) {
        try {
          const parsedDemo: Product[] = JSON.parse(savedDemo);
          if (Array.isArray(parsedDemo)) {
            let changedDemo = false;
            const healedDemo = parsedDemo.map((p) => {
              const res = healProductItem(p);
              if (res.changed) changedDemo = true;
              return res.product;
            });
            if (changedDemo) {
              const sortedDemo = sortProductsNewestFirst(healedDemo);
              localStorage.setItem('demo_bakery_products', JSON.stringify(sortedDemo));
              if (globalIsDemoMode) {
                setProducts(sortedDemo);
              }
            }
          }
        } catch (e) {}
      }

      // 2. Heal real bakery products (only for default store to avoid injecting initial products into custom store)
      if (isDefaultStore(getStoreId())) {
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
            (ip: Product) => !healed.some((existing) => existing.id === ip.id)
          );
          if (missingItems.length > 0) changed = true;

          if (changed) {
            const sorted = sortProductsNewestFirst([...healed, ...missingItems]);
            if (!globalIsDemoMode) {
              setProducts(sorted);
            }
            localStorage.setItem('bakery_products', JSON.stringify(sorted));
            idbSet('bakery_products', JSON.stringify(sorted));
          }
        }
      }
    } catch (e) {}
  }, []);

  // Auto-heal expenses in localStorage on mount
  useEffect(() => {
    if (globalIsDemoMode) return;
    try {
      const saved = localStorage.getItem('bakery_expenses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deduped = cleanDeduplicateExpenses(parsed);
          setExpenses(deduped);
          safeSetStorage('bakery_expenses', JSON.stringify(deduped));
        }
      }
    } catch (e) {}
  }, []);

  // High-speed durable IndexedDB hydration for mobile devices (instant boot within 20ms)
  useEffect(() => {
    if (globalIsDemoMode) return;
    let isMounted = true;
    const hydrateFromIdb = async () => {
      try {
        const [
          savedProducts,
          savedSales,
          savedOrders,
          savedExpenses,
          savedStoreInfo,
          savedStaff,
          savedFlavors,
          savedAddons,
          savedIngredients,
          savedRecipes,
          savedReserveFund,
        ] = await Promise.all([
          idbGet('bakery_products'),
          idbGet('bakery_sales'),
          idbGet('bakery_custom_orders'),
          idbGet('bakery_expenses'),
          idbGet('bakery_store_info'),
          idbGet('bakery_staff_members'),
          idbGet('bakery_flavors'),
          idbGet('bakery_party_addons'),
          idbGet('bakery_ingredients'),
          idbGet('bakery_recipes'),
          idbGet('bakery_reserve_fund'),
        ]);

        if (!isMounted) return;

        if (savedProducts) {
          try {
            const parsed = JSON.parse(savedProducts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts((prev) => {
                if (prev.length <= 10 && prev[0]?.id?.startsWith('cake-')) {
                  return sortProductsNewestFirst(parsed);
                }
                return prev;
              });
              try { localStorage.setItem('bakery_products', savedProducts); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedStoreInfo) {
          try {
            const parsed = JSON.parse(savedStoreInfo);
            if (parsed && parsed.nameKh) {
              setStoreInfo((prev) => ({ ...prev, ...parsed }));
              try { localStorage.setItem('bakery_store_info', savedStoreInfo); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedStaff) {
          try {
            const parsed = JSON.parse(savedStaff);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setStaffMembers(parsed);
              try { localStorage.setItem('bakery_staff_members', savedStaff); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedSales) {
          try {
            const parsed = JSON.parse(savedSales);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSales((prev) => (prev.length <= 2 ? parsed : prev));
              try { localStorage.setItem('bakery_sales', JSON.stringify(parsed.slice(-30))); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedOrders) {
          try {
            const parsed = JSON.parse(savedOrders);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCustomOrders((prev) => (prev.length <= 2 ? parsed : prev));
              try { localStorage.setItem('bakery_custom_orders', savedOrders); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedExpenses) {
          try {
            const parsed = JSON.parse(savedExpenses);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const deduped = cleanDeduplicateExpenses(parsed);
              setExpenses((prev) => (prev.length <= 5 ? deduped : prev));
              try { localStorage.setItem('bakery_expenses', JSON.stringify(deduped)); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedFlavors) {
          try {
            const parsed = JSON.parse(savedFlavors);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFlavors(parsed);
              try { localStorage.setItem('bakery_flavors', savedFlavors); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedAddons) {
          try {
            const parsed = JSON.parse(savedAddons);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const withDefaults = ensurePartyAddonDefaults(parsed);
              setPartyAddons(withDefaults);
              try { localStorage.setItem('bakery_party_addons', JSON.stringify(withDefaults)); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedIngredients) {
          try {
            const parsed = JSON.parse(savedIngredients);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setIngredients(parsed);
              try { localStorage.setItem('bakery_ingredients', savedIngredients); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedRecipes) {
          try {
            const parsed = JSON.parse(savedRecipes);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setRecipes(parsed);
              try { localStorage.setItem('bakery_recipes', savedRecipes); } catch (e) {}
            }
          } catch (e) {}
        }

        if (savedReserveFund) {
          try {
            const parsed = JSON.parse(savedReserveFund);
            if (parsed && typeof parsed.targetAmountKhr === 'number') {
              setReserveFund(parsed);
              reserveFundRef.current = parsed;
              try { localStorage.setItem('bakery_reserve_fund', savedReserveFund); } catch (e) {}
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn('[IDB] Mobile hydration skipped:', err);
      }
    };
    hydrateFromIdb();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic Flavors list
  const [flavors, setFlavors] = useState<string[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_flavors');
      return saved ? JSON.parse(saved) : initialFlavors;
    }
    const saved = localStorage.getItem('bakery_flavors');
    if (!isDefaultStore(getStoreId())) {
      return saved ? JSON.parse(saved) : [];
    }
    return saved ? JSON.parse(saved) : initialFlavors;
  });

  // Out of stock / unavailable flavors
  const [unavailableFlavors, setUnavailableFlavors] = useState<string[]>(() => {
    try {
      const key = globalIsDemoMode ? 'demo_bakery_unavailable_flavors' : 'bakery_unavailable_flavors';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const key = globalIsDemoMode ? 'demo_bakery_unavailable_flavors' : 'bakery_unavailable_flavors';
    safeSetStorage(key, JSON.stringify(unavailableFlavors));
  }, [unavailableFlavors]);

  // Deleted flavor IDs (presets or custom)
  const [deletedFlavorIds, setDeletedFlavorIds] = useState<string[]>(() => {
    try {
      const key = globalIsDemoMode ? 'demo_bakery_deleted_flavor_ids' : 'bakery_deleted_flavor_ids';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const key = globalIsDemoMode ? 'demo_bakery_deleted_flavor_ids' : 'bakery_deleted_flavor_ids';
    safeSetStorage(key, JSON.stringify(deletedFlavorIds));
  }, [deletedFlavorIds]);

  // Flavor name overrides (for presets or custom renaming)
  const [flavorOverrides, setFlavorOverrides] = useState<Record<string, { nameKh: string; nameEn?: string }>>(() => {
    try {
      const key = globalIsDemoMode ? 'demo_bakery_flavor_overrides' : 'bakery_flavor_overrides';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const key = globalIsDemoMode ? 'demo_bakery_flavor_overrides' : 'bakery_flavor_overrides';
    safeSetStorage(key, JSON.stringify(flavorOverrides));
  }, [flavorOverrides]);

  const [partyAddons, setPartyAddons] = useState<PartyAddon[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_party_addons');
      if (saved) {
        try {
          return ensurePartyAddonDefaults(JSON.parse(saved));
        } catch (e) {}
      }
      return initialPartyAddons;
    }
    const saved = localStorage.getItem('bakery_party_addons');
    if (!isDefaultStore(getStoreId())) {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return ensurePartyAddonDefaults(parsed);
        } catch (e) {}
      }
      return [];
    }
    if (saved) {
      try {
        return ensurePartyAddonDefaults(JSON.parse(saved));
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

  // Purge zombie 'money-gun' / 'បាញ់លុយ' from memory & storage on startup
  useEffect(() => {
    recordDeletedId('party_addons', 'money-gun', deletedPartyAddonIds);
    setPartyAddons((prev) => {
      const cleaned = prev.filter(
        (a) => a.id !== 'money-gun' && (!a.nameKh || (!a.nameKh.includes('បាញ់លុយ') && !a.nameKh.toLowerCase().includes('money-gun')))
      );
      if (cleaned.length !== prev.length) {
        safeSetStorage('bakery_party_addons', JSON.stringify(cleaned));
        saveToLanSync({ partyAddons: cleaned });
        syncSaveDoc('settings', 'partyAddons', { items: cleaned, updatedAt: new Date().toISOString() });
        broadcastCustomerSync({
          type: 'PARTY_ADDONS_SYNC',
          partyAddons: cleaned,
          deletedItem: { type: 'party_addon', id: 'money-gun' },
        });
      }
      return cleaned;
    });
  }, []);

  // Ultra-fast cross-window & customer display sync (< 5ms)
  useEffect(() => {
    const unsub = subscribeCustomerSync((payload) => {
      if (payload.type === 'PARTY_ADDONS_SYNC') {
        if (payload.deletedItem?.id) {
          deletedPartyAddonIds.current.add(payload.deletedItem.id);
        }
        if (Array.isArray(payload.partyAddons)) {
          setPartyAddons(
            payload.partyAddons.filter((a) => !deletedPartyAddonIds.current.has(a.id) && a.id !== 'money-gun')
          );
        }
      } else if (payload.type === 'PRODUCTS_SYNC') {
        if (payload.deletedItem?.id) {
          deletedProductIds.current.add(payload.deletedItem.id);
        }
        if (Array.isArray(payload.products)) {
          setProducts(payload.products.filter((p) => !deletedProductIds.current.has(p.id)));
        }
      } else if (payload.type === 'DELETED_RECORDS_SYNC' && payload.deletedIds) {
        payload.deletedIds.forEach((id) => {
          deletedPartyAddonIds.current.add(id);
          deletedProductIds.current.add(id);
        });
      }
    });
    return unsub;
  }, []);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [customOrders, setCustomOrders] = useState<CustomCakeOrder[]>(() => {
    let saved: string | null = null;
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      saved = localStorage.getItem('demo_bakery_custom_orders');
    } else {
      saved = localStorage.getItem('bakery_custom_orders');
    }
    const isCustomStore = !globalIsDemoMode && !isDefaultStore(getStoreId());
    const rawList: CustomCakeOrder[] = saved
      ? JSON.parse(saved)
      : isCustomStore
      ? []
      : initialOrders;
    return (Array.isArray(rawList) ? rawList : []).map((o) => {
      if (!o) return o;
      const cleanTotal = o.totalKhr !== undefined
        ? Math.round(o.totalKhr / 100) * 100
        : Math.round(((o.totalUsd || 0) * 4000) / 100) * 100;
      const cleanDeposit = o.depositKhr !== undefined
        ? Math.round(o.depositKhr / 100) * 100
        : Math.round(((o.depositUsd || 0) * 4000) / 100) * 100;
      return {
        ...o,
        totalKhr: cleanTotal,
        depositKhr: cleanDeposit,
      };
    });
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_ingredients');
      return saved ? JSON.parse(saved) : initialIngredients;
    }
    const saved = localStorage.getItem('bakery_ingredients');
    if (!isDefaultStore(getStoreId())) {
      return saved ? JSON.parse(saved) : [];
    }
    return saved ? JSON.parse(saved) : initialIngredients;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_recipes');
      return saved ? JSON.parse(saved) : initialRecipes;
    }
    const saved = localStorage.getItem('bakery_recipes');
    if (!isDefaultStore(getStoreId())) {
      return saved ? JSON.parse(saved) : [];
    }
    return saved ? JSON.parse(saved) : initialRecipes;
  });

  // Expenses management
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    let list: Expense[] = [];
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_expenses');
      list = saved ? autoMigrateExpenseDates(JSON.parse(saved)) : demoExpenses;
    } else {
      const saved = localStorage.getItem('bakery_expenses');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            list = cleanDeduplicateExpenses(parsed);
          }
        } catch (e) {}
      } else {
        list = !isDefaultStore(getStoreId()) ? [] : initialExpenses;
      }
    }
    return (Array.isArray(list) ? list : []).map((e) => ({
      ...e,
      amountKhr: roundKhr(e.amountKhr !== undefined ? e.amountKhr : (e.amountUsd * 4000)),
      unitPriceKhr: e.unitPriceKhr !== undefined ? roundKhr(e.unitPriceKhr) : undefined,
    }));
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
            return {
              ...parsed,
              targetAmountKhr: roundKhr(parsed.targetAmountKhr),
              currentBalanceKhr: roundKhr(parsed.currentBalanceKhr),
              history: (parsed.history || []).map((h: any) => ({
                ...h,
                amountKhr: roundKhr(h.amountKhr),
              })),
            };
          }
        } catch (e) {}
      }
    }
    const saved = localStorage.getItem('bakery_reserve_fund');
    if (!isDefaultStore(getStoreId())) {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.targetAmountKhr === 'number') {
            return {
              ...parsed,
              targetAmountKhr: roundKhr(parsed.targetAmountKhr),
              currentBalanceKhr: roundKhr(parsed.currentBalanceKhr),
              history: (parsed.history || []).map((h: any) => ({
                ...h,
                amountKhr: roundKhr(h.amountKhr),
              })),
            };
          }
        } catch (e) {}
      }
      return {
        targetAmountKhr: 0,
        targetAmountUsd: 0,
        currentBalanceKhr: 0,
        currentBalanceUsd: 0,
        history: [],
        updatedAt: new Date().toISOString(),
      };
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.targetAmountKhr === 'number') {
          return {
            ...parsed,
            targetAmountKhr: roundKhr(parsed.targetAmountKhr),
            currentBalanceKhr: roundKhr(parsed.currentBalanceKhr),
            history: (parsed.history || []).map((h: any) => ({
              ...h,
              amountKhr: roundKhr(h.amountKhr),
            })),
          };
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
    const targetKhr = roundKhr(Number(reserveFund.targetAmountKhr) || 4000000);
    const targetUsd = Number(reserveFund.targetAmountUsd) || Number((targetKhr / exchangeRate).toFixed(2));

    // Sum all expenses explicitly paid from Reserve Fund
    const totalReserveExpensesKhr = roundKhr(
      expenses
        .filter((e) => isExpensePaidFromReserve(e))
        .reduce((sum, e) => {
          const amt = roundKhr(Number(e.amountKhr) || (Number(e.amountUsd) || 0) * exchangeRate);
          return sum + amt;
        }, 0)
    );

    // Sum all top-ups (replenishments)
    const totalReplenishedKhr = roundKhr(
      (reserveFund.history || [])
        .filter((tx) => tx.type === 'REPLENISH')
        .reduce((sum, tx) => sum + roundKhr(Number(tx.amountKhr) || 0), 0)
    );

    // Calculated balance: Target Float - Reserve Expenses + Replenishments
    const calculatedBalKhr = roundKhr(Math.max(0, targetKhr - totalReserveExpensesKhr + totalReplenishedKhr));
    const calculatedBalUsd = Number((calculatedBalKhr / exchangeRate).toFixed(2));

    const cleanHistory = (reserveFund.history || []).map((h) => ({
      ...h,
      amountKhr: roundKhr(h.amountKhr),
    }));

    return {
      ...reserveFund,
      targetAmountKhr: targetKhr,
      targetAmountUsd: targetUsd,
      currentBalanceKhr: calculatedBalKhr,
      currentBalanceUsd: calculatedBalUsd,
      history: cleanHistory,
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
    let saved: string | null = null;
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      saved = localStorage.getItem('demo_bakery_sales');
    } else {
      saved = localStorage.getItem('bakery_sales');
    }
    const isCustomStore = !globalIsDemoMode && !isDefaultStore(getStoreId());
    const rawList: CompletedSale[] = saved
      ? JSON.parse(saved)
      : isCustomStore
      ? []
      : initialSales;
    return (Array.isArray(rawList) ? rawList : []).map((s) => {
      if (!s) return s;
      const cleanTotal = s.totalKhr !== undefined ? roundKhr(s.totalKhr) : usdToKhr(s.totalUsd, 4000);
      const cleanPaid = s.paidKhr !== undefined ? roundKhr(s.paidKhr) : (s.paidUsd !== undefined ? usdToKhr(s.paidUsd, 4000) : undefined);
      const cleanChange = s.changeKhr !== undefined ? roundKhr(s.changeKhr) : (s.changeUsd !== undefined ? usdToKhr(s.changeUsd, 4000) : undefined);
      const cleanDeposit = s.depositKhr !== undefined ? roundKhr(s.depositKhr) : (s.depositUsd !== undefined ? usdToKhr(s.depositUsd, 4000) : undefined);
      const cleanRemaining = s.remainingKhr !== undefined ? roundKhr(s.remainingKhr) : (s.remainingUsd !== undefined ? usdToKhr(s.remainingUsd, 4000) : undefined);
      return {
        ...s,
        totalKhr: cleanTotal,
        paidKhr: cleanPaid,
        changeKhr: cleanChange,
        depositKhr: cleanDeposit,
        remainingKhr: cleanRemaining,
        items: (s.items || []).map((it) => ({
          ...it,
          priceKhr: it.priceKhr !== undefined ? roundKhr(it.priceKhr) : usdToKhr(it.priceUsd, 4000),
        })),
      };
    });
  });

  const [activeReceipt, setActiveReceipt] = useState<CompletedSale | null>(null);

  const [currentShift, setCurrentShift] = useState<Shift | null>(() => {
    if (globalIsDemoMode) {
      seedDemoDataIfMissing();
      const saved = localStorage.getItem('demo_bakery_shift');
      return saved ? JSON.parse(saved) : initialShift;
    }
    const saved = localStorage.getItem('bakery_shift');
    if (!isDefaultStore(getStoreId())) {
      return saved && saved !== 'null' ? JSON.parse(saved) : null;
    }
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
  const deletedPartyAddonIds = useRef<Set<string>>((() => {
    const s = loadDeletedIds('party_addons');
    s.add('money-gun');
    return s;
  })());
  const customOrdersRef = useRef<CustomCakeOrder[]>(customOrders);
  customOrdersRef.current = customOrders;
  const salesRef = useRef<CompletedSale[]>(sales);
  salesRef.current = sales;
  const productsRef = useRef<Product[]>(products);
  productsRef.current = products;
  const expensesRef = useRef<Expense[]>(expenses);
  expensesRef.current = expenses;
  const storeInfoRef = useRef<StoreInfo>(storeInfo);
  storeInfoRef.current = storeInfo;
  const staffMembersRef = useRef<StaffMember[]>(staffMembers);
  staffMembersRef.current = staffMembers;
  const currentStaffRef = useRef<StaffMember>(currentStaff);
  currentStaffRef.current = currentStaff;
  const flavorsRef = useRef<string[]>(flavors);
  flavorsRef.current = flavors;
  const partyAddonsRef = useRef<PartyAddon[]>(partyAddons);
  partyAddonsRef.current = partyAddons;
  const ingredientsRef = useRef<Ingredient[]>(ingredients);
  ingredientsRef.current = ingredients;
  const recipesRef = useRef<Recipe[]>(recipes);
  recipesRef.current = recipes;
  const currentShiftRef = useRef<Shift | null>(currentShift);
  currentShiftRef.current = currentShift;

  const saveToLanSync = (payload: any, force: boolean = true) => {
    if (globalIsDemoMode || !isLanEnvironment()) return;
    if (!force && isUpdatingFromLan.current) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const tenant = activeTenantIdRef.current || getStoreId();
      fetch(`/api/lan-sync?tenant=${encodeURIComponent(tenant)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenant,
        },
        signal: controller.signal,
        body: JSON.stringify({
          ...payload,
          deletedSaleIds: Array.from(deletedSaleIds.current),
          deletedOrderIds: Array.from(deletedOrderIds.current),
          deletedExpenseIds: Array.from(deletedExpenseIds.current),
          deletedProductIds: Array.from(deletedProductIds.current),
          deletedPartyAddonIds: Array.from(deletedPartyAddonIds.current),
        }),
      })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.version) {
          lastLanVersion.current = data.version;
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });
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
    if (Array.isArray(data.deletedPartyAddonIds)) {
      data.deletedPartyAddonIds.forEach((id: string) => recordDeletedId('party_addons', id, deletedPartyAddonIds));
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
    if (Array.isArray(data.partyAddons)) {
      const filtered = data.partyAddons.filter((a: any) => a && a.id && !deletedPartyAddonIds.current.has(a.id) && a.id !== 'money-gun');
      setPartyAddons((prev) => {
        if (
          filtered.length === prev.length &&
          filtered.every((a: any, idx: number) => a.id === prev[idx]?.id && a.priceUsd === prev[idx]?.priceUsd && a.stockQty === prev[idx]?.stockQty)
        ) {
          return prev;
        }
        safeSetStorage('bakery_party_addons', JSON.stringify(filtered));
        return filtered;
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
    if (Array.isArray(data.unavailableFlavors)) {
      setUnavailableFlavors((prev) => {
        if (data.unavailableFlavors.length === prev.length && data.unavailableFlavors.every((f: any, idx: number) => f === prev[idx])) {
          return prev;
        }
        try { localStorage.setItem('bakery_unavailable_flavors', JSON.stringify(data.unavailableFlavors)); } catch (e) {}
        return data.unavailableFlavors;
      });
    }
    if (data.telegramConfig && data.telegramConfig.botToken) {
      const currentTg = getStoredTelegramConfig();
      if (!areTelegramConfigsEqual(currentTg, data.telegramConfig)) {
        saveStoredTelegramConfig(data.telegramConfig, false, false);
      }
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
    if (globalIsDemoMode || !isLanEnvironment()) return { salesCount: sales.length, expensesCount: expenses.length };
    setLanSyncStatus('syncing');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      // 1. Push local deletions & current state to LAN server first
      const activeTenant = activeTenantIdRef.current || getStoreId();
      const postRes = await fetch(`/api/lan-sync?tenant=${encodeURIComponent(activeTenant)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': activeTenant,
        },
        signal: controller.signal,
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
        const postData = await postRes.json().catch(() => null);
        if (postData?.version) {
          lastLanVersion.current = postData.version;
        }
      }

      // 2. Fetch the authoritative merged state
      const res = await fetch(`/api/lan-sync?tenant=${encodeURIComponent(activeTenant)}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json().catch(() => null);
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
    // If running on cloud hosting (Firebase Hosting, Vercel, etc.) or mobile cellular data,
    // skip LAN endpoints entirely to avoid 404/405 errors and connection pool starvation.
    if (!isLanEnvironment() || globalIsDemoMode) {
      setLanSyncStatus('idle');
      return;
    }

    let isSubscribed = true;
    let sse: EventSource | null = null;
    let sseRetryTimer: any = null;
    let sseFailCount = 0;

    // 1. Initial LAN fetch on mount with timeout
    const fetchController = new AbortController();
    const fetchTimeout = setTimeout(() => fetchController.abort(), 2000);
    const initialTenant = activeTenantIdRef.current || getStoreId();

    fetch(`/api/lan-sync?tenant=${encodeURIComponent(initialTenant)}`, { signal: fetchController.signal })
      .then((res) => {
        clearTimeout(fetchTimeout);
        if (!res.ok) throw new Error('LAN sync not available');
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Not JSON');
        return res.json();
      })
      .then((data) => {
        if (!isSubscribed) return;
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
      .catch((err) => {
        clearTimeout(fetchTimeout);
        if (isSubscribed) setLanSyncStatus('idle');
      });

    // 2. High-speed window focus & visibility sync (with version check)
    const handleSyncOnFocus = (targetVersion?: number) => {
      if (globalIsDemoMode || !isLanEnvironment() || !isSubscribed) return;
      const currentTenant = activeTenantIdRef.current || getStoreId();
      const verParam = lastLanVersion.current
        ? `?v=${lastLanVersion.current}&tenant=${encodeURIComponent(currentTenant)}`
        : `?tenant=${encodeURIComponent(currentTenant)}`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      fetch(`/api/lan-sync${verParam}`, { signal: ctrl.signal })
        .then((res) => {
          clearTimeout(t);
          if (!res.ok) return null;
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) return null;
          return res.json();
        })
        .then((data) => {
          if (data && isSubscribed) applyLanData(data);
        })
        .catch(() => clearTimeout(t));
    };
    const onFocus = () => handleSyncOnFocus();
    window.addEventListener('focus', onFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleSyncOnFocus();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 3. Lightweight fallback interval: 5 seconds with version caching
    const intervalTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleSyncOnFocus();
      }
    }, 5000);

    // 4. Robust auto-reconnecting SSE stream for instantaneous (<50ms) sync
    const connectSSE = () => {
      if (!isSubscribed || globalIsDemoMode || !isLanEnvironment()) return;
      try {
        if (sse) sse.close();
        sse = new EventSource('/api/lan-events');
        sse.onopen = () => {
          sseFailCount = 0;
          if (isSubscribed) setLanSyncStatus('connected');
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
          sseFailCount++;
          if (isSubscribed) {
            clearTimeout(sseRetryTimer);
            const delay = sseFailCount > 3 ? 20000 : 3000;
            sseRetryTimer = setTimeout(connectSSE, delay);
          }
        };
      } catch (e) {
        if (isSubscribed) {
          clearTimeout(sseRetryTimer);
          sseRetryTimer = setTimeout(connectSSE, 5000);
        }
      }
    };
    connectSSE();

    return () => {
      isSubscribed = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(intervalTimer);
      if (sseRetryTimer) clearTimeout(sseRetryTimer);
      if (sse) sse.close();
    };
  }, []);

  // Tenant switching protection & isolated tenant state
  const isSwitchingTenant = useRef<boolean>(false);
  const activeTenantIdRef = useRef<string>(getStoreId());

  // Broadcast any state updates to LAN server (debounced background sync only)
  const isInitialMount = useRef<boolean>(true);
  useEffect(() => {
    if (globalIsDemoMode || !isLanEnvironment() || isSwitchingTenant.current) return;
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
    }, 1000);
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
      if (newId === activeTenantIdRef.current) return;
      console.log(`[StoreSwitch] Switching store tenant from ${activeTenantIdRef.current} to ${newId}`);
      isSwitchingTenant.current = true;
      const oldId = activeTenantIdRef.current;
      activeTenantIdRef.current = newId;

      if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

      // 1. Snapshot previous store's data into tenant storage so switching back restores it perfectly!
      try {
        const oldKey = `bakery_tenant_snapshot_${oldId}`;
        const snapshot = {
          sales: salesRef.current,
          customOrders: customOrdersRef.current,
          expenses: expensesRef.current,
          products: productsRef.current,
          storeInfo: storeInfoRef.current,
          staffMembers: staffMembersRef.current,
          currentStaff: currentStaffRef.current,
          flavors: flavorsRef.current,
          partyAddons: partyAddonsRef.current,
          ingredients: ingredientsRef.current,
          recipes: recipesRef.current,
          currentShift: currentShiftRef.current,
          reserveFund: reserveFundRef.current,
        };
        localStorage.setItem(oldKey, JSON.stringify(snapshot));
        idbSet(oldKey, JSON.stringify(snapshot)).catch(() => {});
      } catch (e) {}

      // 2. Load cached data for newId if it was previously saved, or start clean
      const newKey = `bakery_tenant_snapshot_${newId}`;
      const savedRaw = localStorage.getItem(newKey);
      let loadedSnapshot: any = null;
      if (savedRaw) {
        try {
          loadedSnapshot = JSON.parse(savedRaw);
        } catch (e) {}
      }

      const storeUser = getCurrentStoreUser();

      if (loadedSnapshot) {
        // Restore previously cached data for this tenant
        const restoredSales = Array.isArray(loadedSnapshot.sales) ? loadedSnapshot.sales : [];
        const restoredOrders = Array.isArray(loadedSnapshot.customOrders) ? loadedSnapshot.customOrders : [];
        const restoredExpenses = Array.isArray(loadedSnapshot.expenses) ? loadedSnapshot.expenses : [];
        const restoredProducts = Array.isArray(loadedSnapshot.products)
          ? sortProductsNewestFirst(loadedSnapshot.products)
          : (isDefaultStore(newId) ? sortProductsNewestFirst(initialProducts) : []);
        const restoredFlavors = Array.isArray(loadedSnapshot.flavors) ? loadedSnapshot.flavors : (isDefaultStore(newId) ? initialFlavors : []);
        const restoredAddons = Array.isArray(loadedSnapshot.partyAddons) ? loadedSnapshot.partyAddons : (isDefaultStore(newId) ? initialPartyAddons : []);
        const restoredIngredients = Array.isArray(loadedSnapshot.ingredients) ? loadedSnapshot.ingredients : (isDefaultStore(newId) ? initialIngredients : []);
        const restoredRecipes = Array.isArray(loadedSnapshot.recipes) ? loadedSnapshot.recipes : (isDefaultStore(newId) ? initialRecipes : []);
        const restoredStaff = Array.isArray(loadedSnapshot.staffMembers) && loadedSnapshot.staffMembers.length > 0
          ? loadedSnapshot.staffMembers
          : (isDefaultStore(newId)
              ? initialStaffMembers
              : [
                  {
                    id: `staff-${Date.now()}`,
                    name: storeUser?.storeName ? `ម្ចាស់ហាង (${storeUser.storeName})` : 'ម្ចាស់ហាង (Admin)',
                    nameEn: 'Store Owner (Admin)',
                    role: 'ADMIN',
                    avatar: '👑',
                    pinCode: '1234',
                    isActive: true,
                    permissions: {
                      canAccessPos: true,
                      canAccessShowcase: true,
                      canAccessCustomOrders: true,
                      canAccessSalesHistory: true,
                      canEditSales: true,
                      canAccessExpenses: true,
                      canAccessInventory: true,
                      canAccessReports: true,
                      canAccessSettings: true,
                    },
                  },
                ]);
        const restoredCurrentStaff = loadedSnapshot.currentStaff || restoredStaff[0];
        const restoredShift = loadedSnapshot.currentShift || null;
        const restoredReserveFund = loadedSnapshot.reserveFund || {
          targetAmountKhr: isDefaultStore(newId) ? 4000000 : 0,
          targetAmountUsd: isDefaultStore(newId) ? 1000 : 0,
          currentBalanceKhr: isDefaultStore(newId) ? 4000000 : 0,
          currentBalanceUsd: isDefaultStore(newId) ? 1000 : 0,
          history: [],
          updatedAt: new Date().toISOString(),
        };

        setSales(restoredSales);
        setCustomOrders(restoredOrders);
        setExpenses(restoredExpenses);
        setProducts(restoredProducts);
        setFlavors(restoredFlavors);
        setPartyAddons(restoredAddons);
        setIngredients(restoredIngredients);
        setRecipes(restoredRecipes);
        setStaffMembers(restoredStaff);
        setCurrentStaffState(restoredCurrentStaff);
        setCurrentShift(restoredShift);
        setReserveFund(restoredReserveFund);

        const effectiveStoreInfo = loadedSnapshot.storeInfo || (isDefaultStore(newId)
          ? defaultStoreInfo
          : {
              storeId: newId,
              nameKh: (storeUser?.storeId === newId ? storeUser.storeName : '') || `ហាងនំ (${newId})`,
              nameEn: (storeUser?.storeId === newId ? storeUser.storeName : '') || 'SweetBakery',
              logoUrl: '',
              phone: (storeUser?.storeId === newId ? storeUser.phone : '') || '',
              address: '',
              tagline: '',
              khqrQrImage: '',
              khqrMerchantName: '',
              khqrBakongId: '',
              khqrAccountNumber: '',
              khqrBankName: '',
              realStorePin: '',
              requireRealStorePin: false,
              alwaysRequireLoginOnStartup: false,
              hideCustomerPrices: false,
            });
        effectiveStoreInfo.storeId = newId;
        setStoreInfo(effectiveStoreInfo);

        // Update active localStorage keys
        localStorage.setItem('bakery_store_info', JSON.stringify(effectiveStoreInfo));
        localStorage.setItem('bakery_sales', JSON.stringify(restoredSales));
        localStorage.setItem('bakery_custom_orders', JSON.stringify(restoredOrders));
        localStorage.setItem('bakery_expenses', JSON.stringify(restoredExpenses));
        localStorage.setItem('bakery_products', JSON.stringify(restoredProducts));
        localStorage.setItem('bakery_flavors', JSON.stringify(restoredFlavors));
        localStorage.setItem('bakery_party_addons', JSON.stringify(restoredAddons));
        localStorage.setItem('bakery_ingredients', JSON.stringify(restoredIngredients));
        localStorage.setItem('bakery_recipes', JSON.stringify(restoredRecipes));
        localStorage.setItem('bakery_staff_members', JSON.stringify(restoredStaff));
        localStorage.setItem('bakery_current_staff', JSON.stringify(restoredCurrentStaff));
        localStorage.setItem('bakery_shift', JSON.stringify(restoredShift));
        localStorage.setItem('bakery_reserve_fund', JSON.stringify(restoredReserveFund));

        idbSet('bakery_sales', JSON.stringify(restoredSales)).catch(() => {});
        idbSet('bakery_custom_orders', JSON.stringify(restoredOrders)).catch(() => {});
        idbSet('bakery_expenses', JSON.stringify(restoredExpenses)).catch(() => {});
        idbSet('bakery_products', JSON.stringify(restoredProducts)).catch(() => {});
        idbSet('bakery_flavors', JSON.stringify(restoredFlavors)).catch(() => {});
        idbSet('bakery_party_addons', JSON.stringify(restoredAddons)).catch(() => {});
        idbSet('bakery_ingredients', JSON.stringify(restoredIngredients)).catch(() => {});
        idbSet('bakery_recipes', JSON.stringify(restoredRecipes)).catch(() => {});
        idbSet('bakery_staff_members', JSON.stringify(restoredStaff)).catch(() => {});
        idbSet('bakery_reserve_fund', JSON.stringify(restoredReserveFund)).catch(() => {});
      } else {
        // Brand new isolated store! COMPLETELY EMPTY!
        const cleanProducts: Product[] = isDefaultStore(newId) ? sortProductsNewestFirst(initialProducts) : [];
        const cleanSales: CompletedSale[] = isDefaultStore(newId) ? initialSales : [];
        const cleanOrders: CustomCakeOrder[] = isDefaultStore(newId) ? initialOrders : [];
        const cleanExpenses: Expense[] = isDefaultStore(newId) ? initialExpenses : [];
        const cleanFlavors: string[] = isDefaultStore(newId) ? initialFlavors : [];
        const cleanAddons: PartyAddon[] = isDefaultStore(newId) ? initialPartyAddons : [];
        const cleanIngredients: Ingredient[] = isDefaultStore(newId) ? initialIngredients : [];
        const cleanRecipes: Recipe[] = isDefaultStore(newId) ? initialRecipes : [];
        const cleanStaff: StaffMember[] = isDefaultStore(newId)
          ? initialStaffMembers
          : [
              {
                id: `staff-${Date.now()}`,
                name: storeUser?.storeName ? `ម្ចាស់ហាង (${storeUser.storeName})` : 'ម្ចាស់ហាង (Admin)',
                nameEn: 'Store Owner (Admin)',
                role: 'ADMIN',
                avatar: '👑',
                pinCode: '1234',
                isActive: true,
                permissions: {
                  canAccessPos: true,
                  canAccessShowcase: true,
                  canAccessCustomOrders: true,
                  canAccessSalesHistory: true,
                  canEditSales: true,
                  canAccessExpenses: true,
                  canAccessInventory: true,
                  canAccessReports: true,
                  canAccessSettings: true,
                },
              },
            ];
        const cleanStoreInfo: StoreInfo = isDefaultStore(newId)
          ? defaultStoreInfo
          : {
              storeId: newId,
              nameKh: (storeUser?.storeId === newId ? storeUser.storeName : '') || `ហាងនំ (${newId})`,
              nameEn: (storeUser?.storeId === newId ? storeUser.storeName : '') || 'SweetBakery',
              logoUrl: '',
              phone: (storeUser?.storeId === newId ? storeUser.phone : '') || '',
              address: '',
              tagline: '',
              khqrQrImage: '',
              khqrMerchantName: '',
              khqrBakongId: '',
              khqrAccountNumber: '',
              khqrBankName: '',
              realStorePin: '',
              requireRealStorePin: false,
              alwaysRequireLoginOnStartup: false,
              hideCustomerPrices: false,
            };
        const cleanReserveFund: ReserveFund = {
          targetAmountKhr: isDefaultStore(newId) ? 4000000 : 0,
          targetAmountUsd: isDefaultStore(newId) ? 1000 : 0,
          currentBalanceKhr: isDefaultStore(newId) ? 4000000 : 0,
          currentBalanceUsd: isDefaultStore(newId) ? 1000 : 0,
          history: [],
          updatedAt: new Date().toISOString(),
        };

        setSales(cleanSales);
        setCustomOrders(cleanOrders);
        setExpenses(cleanExpenses);
        setProducts(cleanProducts);
        setFlavors(cleanFlavors);
        setPartyAddons(cleanAddons);
        setIngredients(cleanIngredients);
        setRecipes(cleanRecipes);
        setStaffMembers(cleanStaff);
        setCurrentStaffState(cleanStaff[0]);
        setCurrentShift(null);
        setReserveFund(cleanReserveFund);
        setStoreInfo(cleanStoreInfo);

        // Update active localStorage and IndexedDB so app reload doesn't pull old store's data
        localStorage.setItem('bakery_store_info', JSON.stringify(cleanStoreInfo));
        localStorage.setItem('bakery_sales', JSON.stringify(cleanSales));
        localStorage.setItem('bakery_custom_orders', JSON.stringify(cleanOrders));
        localStorage.setItem('bakery_expenses', JSON.stringify(cleanExpenses));
        localStorage.setItem('bakery_products', JSON.stringify(cleanProducts));
        localStorage.setItem('bakery_flavors', JSON.stringify(cleanFlavors));
        localStorage.setItem('bakery_party_addons', JSON.stringify(cleanAddons));
        localStorage.setItem('bakery_ingredients', JSON.stringify(cleanIngredients));
        localStorage.setItem('bakery_recipes', JSON.stringify(cleanRecipes));
        localStorage.setItem('bakery_staff_members', JSON.stringify(cleanStaff));
        localStorage.setItem('bakery_current_staff', JSON.stringify(cleanStaff[0]));
        localStorage.setItem('bakery_shift', 'null');
        localStorage.setItem('bakery_reserve_fund', JSON.stringify(cleanReserveFund));

        idbSet('bakery_sales', JSON.stringify(cleanSales)).catch(() => {});
        idbSet('bakery_custom_orders', JSON.stringify(cleanOrders)).catch(() => {});
        idbSet('bakery_expenses', JSON.stringify(cleanExpenses)).catch(() => {});
        idbSet('bakery_products', JSON.stringify(cleanProducts)).catch(() => {});
        idbSet('bakery_flavors', JSON.stringify(cleanFlavors)).catch(() => {});
        idbSet('bakery_party_addons', JSON.stringify(cleanAddons)).catch(() => {});
        idbSet('bakery_ingredients', JSON.stringify(cleanIngredients)).catch(() => {});
        idbSet('bakery_recipes', JSON.stringify(cleanRecipes)).catch(() => {});
        idbSet('bakery_staff_members', JSON.stringify(cleanStaff)).catch(() => {});
        idbSet('bakery_reserve_fund', JSON.stringify(cleanReserveFund)).catch(() => {});
      }

      deletedSaleIds.current = new Set();
      deletedOrderIds.current = new Set();
      deletedExpenseIds.current = new Set();
      deletedProductIds.current = new Set();
      deletedStaffIds.current = new Set();
      deletedPartyAddonIds.current = new Set();

      setCurrentStoreTenantId(newId);
      lastLanVersion.current = 0;

      // Immediately fetch new tenant's LAN DB if available
      if (isLanEnvironment()) {
        fetch(`/api/lan-sync?tenant=${encodeURIComponent(newId)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data && data.exists !== false) {
              applyLanData(data);
            }
          })
          .catch(() => {});
      }

      setTimeout(() => {
        isSwitchingTenant.current = false;
      }, 1500);
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

    const isSameProductList = (a: Product[], b: Product[]): boolean => {
      if (a === b) return true;
      if (!a || !b || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        const p1 = a[i];
        const p2 = b[i];
        if (
          p1.id !== p2.id ||
          p1.stockQty !== p2.stockQty ||
          p1.priceUsd !== p2.priceUsd ||
          p1.priceKhr !== p2.priceKhr ||
          p1.updatedAt !== p2.updatedAt ||
          p1.nameKh !== p2.nameKh ||
          p1.nameEn !== p2.nameEn ||
          p1.imageUrl !== p2.imageUrl ||
          p1.categoryId !== p2.categoryId
        ) {
          return false;
        }
      }
      return true;
    };

    const isSameSaleList = (a: CompletedSale[], b: CompletedSale[]): boolean => {
      if (a === b) return true;
      if (!a || !b || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        const s1 = a[i];
        const s2 = b[i];
        if (
          s1.id !== s2.id ||
          s1.totalUsd !== s2.totalUsd ||
          s1.totalKhr !== s2.totalKhr ||
          s1.paidUsd !== s2.paidUsd ||
          s1.paidKhr !== s2.paidKhr ||
          s1.remainingUsd !== s2.remainingUsd ||
          s1.remainingKhr !== s2.remainingKhr ||
          s1.isDeposit !== s2.isDeposit ||
          s1.paymentMethod !== s2.paymentMethod
        ) {
          return false;
        }
      }
      return true;
    };

    const isSameCustomOrderList = (a: CustomCakeOrder[], b: CustomCakeOrder[]): boolean => {
      if (a === b) return true;
      if (!a || !b || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        const o1 = a[i];
        const o2 = b[i];
        if (
          o1.id !== o2.id ||
          o1.status !== o2.status ||
          o1.depositKhr !== o2.depositKhr ||
          o1.depositUsd !== o2.depositUsd ||
          o1.totalKhr !== o2.totalKhr ||
          o1.totalUsd !== o2.totalUsd ||
          o1.pickupDate !== o2.pickupDate ||
          o1.pickupTime !== o2.pickupTime ||
          o1.customerName !== o2.customerName ||
          o1.phone !== o2.phone
        ) {
          return false;
        }
      }
      return true;
    };

    const isSameExpenseList = (a: Expense[], b: Expense[]): boolean => {
      if (a === b) return true;
      if (!a || !b || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        const e1 = a[i];
        const e2 = b[i];
        if (
          e1.id !== e2.id ||
          e1.amountUsd !== e2.amountUsd ||
          e1.amountKhr !== e2.amountKhr ||
          e1.category !== e2.category ||
          e1.title !== e2.title ||
          e1.paymentMethod !== e2.paymentMethod ||
          e1.paymentStatus !== e2.paymentStatus
        ) {
          return false;
        }
      }
      return true;
    };

    // Subscribe to products (High-speed real-time sync)
    const unsubProducts = subscribeToFirestoreCollection<Product>('products', (cloudProducts) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudProducts)) {
        if (cloudProducts.length === 0 && !isDefaultStore(getStoreId())) {
          setProducts([]);
          safeSetStorage('bakery_products', JSON.stringify([]));
          return;
        }
        if (cloudProducts.length > 0) {
          const filtered = sortProductsNewestFirst(
            cloudProducts
              .filter((p) => p && p.id && !deletedProductIds.current.has(p.id))
              .map((p) => healProductItem(p).product)
          );
          setProducts((prev) => {
            if (isSameProductList(prev, filtered)) {
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
      if (Array.isArray(cloudSales)) {
        if (cloudSales.length === 0) {
          setSales([]);
          safeSetStorage('bakery_sales', JSON.stringify([]));
          return;
        }
        const filtered = cloudSales
          .filter((s) => s && s.id && !deletedSaleIds.current.has(s.id))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setSales((prev) => {
          if (isSameSaleList(prev, filtered)) {
            return prev;
          }
          safeSetStorage('bakery_sales', JSON.stringify(filtered));
          return filtered;
        });
      }
    });

    // Subscribe to custom orders
    const unsubOrders = subscribeToFirestoreCollection<CustomCakeOrder>('customOrders', (cloudOrders) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudOrders)) {
        if (cloudOrders.length === 0) {
          setCustomOrders([]);
          safeSetStorage('bakery_custom_orders', JSON.stringify([]));
          return;
        }
        const filtered = cloudOrders.filter((o) => o && o.id && !deletedOrderIds.current.has(o.id));
        setCustomOrders((prev) => {
          if (isSameCustomOrderList(prev, filtered)) {
            return prev;
          }
          safeSetStorage('bakery_custom_orders', JSON.stringify(filtered));
          return filtered;
        });
      }
    });

    // Subscribe to expenses (Instantly syncs edits, payment methods, reserve fund changes across all devices)
    const unsubExpenses = subscribeToFirestoreCollection<Expense>('expenses', (cloudExpenses) => {
      if (globalIsDemoMode) return;
      if (Array.isArray(cloudExpenses)) {
        if (cloudExpenses.length === 0) {
          setExpenses([]);
          safeSetStorage('bakery_expenses', JSON.stringify([]));
          return;
        }
        const deduped = cleanDeduplicateExpenses(cloudExpenses);

        setExpenses((prev) => {
          if (isSameExpenseList(prev, deduped)) {
            return prev;
          }
          safeSetStorage('bakery_expenses', JSON.stringify(deduped));
          return deduped;
        });
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

      const cloudDeletedAddons = (cloudDeleted as any).deletedPartyAddonIds || (cloudDeleted as any).deletedPartyAddonsIds || (cloudDeleted as any).deletedParty_addonsIds;
      if (Array.isArray(cloudDeletedAddons)) {
        let changed = false;
        cloudDeletedAddons.forEach((id: string) => {
          if (!deletedPartyAddonIds.current.has(id)) {
            deletedPartyAddonIds.current.add(id);
            changed = true;
          }
        });
        if (changed) {
          try {
            localStorage.setItem('bakery_deleted_party_addons_ids', JSON.stringify(Array.from(deletedPartyAddonIds.current).slice(-500)));
          } catch (e) {}
          setPartyAddons((prev) => {
            const updated = prev.filter((a) => !deletedPartyAddonIds.current.has(a.id));
            safeSetStorage('bakery_party_addons', JSON.stringify(updated));
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
      const currentTg = getStoredTelegramConfig();
      if (areTelegramConfigsEqual(currentTg, cloudTelegram)) return;
      saveStoredTelegramConfig(cloudTelegram, false, false);
    });

    // Subscribe to shared Party Add-ons across all devices (PC & Phone sync automatically)
    const unsubPartyAddons = subscribeToFirestoreDoc<{ items?: PartyAddon[] }>('settings', 'partyAddons', (cloudData) => {
      if (globalIsDemoMode || !cloudData) return;
      const items = cloudData.items;
      if (Array.isArray(items)) {
        setPartyAddons((prev) => {
          // Keep any locally created items that haven't arrived in cloud yet
          const cloudIds = new Set(items.map((i) => i.id));
          const localPending = prev.filter((p) => !cloudIds.has(p.id) && p.id.startsWith('addon-') && !deletedPartyAddonIds.current.has(p.id));
          const merged = ensurePartyAddonDefaults([...items, ...localPending], deletedPartyAddonIds.current);

          if (
            merged.length === prev.length &&
            merged.every(
              (a, idx) =>
                a.id === prev[idx]?.id &&
                a.stockQty === prev[idx]?.stockQty &&
                a.nameKh === prev[idx]?.nameKh &&
                a.priceKhr === prev[idx]?.priceKhr &&
                a.priceUsd === prev[idx]?.priceUsd
            )
          ) {
            return prev;
          }
          safeSetStorage('bakery_party_addons', JSON.stringify(merged));
          return merged;
        });
      }
    });

    // Subscribe to shared Flavors across all devices (PC & Phone sync automatically)
    const unsubFlavors = subscribeToFirestoreDoc<{ list?: string[]; unavailable?: string[]; deletedIds?: string[]; overrides?: Record<string, { nameKh: string; nameEn?: string }> }>('settings', 'flavors', (cloudData) => {
      if (globalIsDemoMode || !cloudData) return;
      const list = cloudData.list;
      if (Array.isArray(list) && list.length > 0) {
        setFlavors((prev) => {
          if (
            list.length === prev.length &&
            list.every((f, idx) => f === prev[idx])
          ) {
            return prev;
          }
          safeSetStorage('bakery_flavors', JSON.stringify(list));
          return list;
        });
      }
      const unavailable = cloudData.unavailable;
      if (Array.isArray(unavailable)) {
        setUnavailableFlavors((prev) => {
          if (
            unavailable.length === prev.length &&
            unavailable.every((f, idx) => f === prev[idx])
          ) {
            return prev;
          }
          safeSetStorage('bakery_unavailable_flavors', JSON.stringify(unavailable));
          return unavailable;
        });
      }
      if (Array.isArray(cloudData.deletedIds)) {
        setDeletedFlavorIds((prev) => {
          if (
            cloudData.deletedIds!.length === prev.length &&
            cloudData.deletedIds!.every((d, idx) => d === prev[idx])
          ) {
            return prev;
          }
          safeSetStorage('bakery_deleted_flavor_ids', JSON.stringify(cloudData.deletedIds));
          return cloudData.deletedIds!;
        });
      }
      if (cloudData.overrides && typeof cloudData.overrides === 'object') {
        setFlavorOverrides(cloudData.overrides);
        safeSetStorage('bakery_flavor_overrides', JSON.stringify(cloudData.overrides));
      }
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
      unsubPartyAddons();
      unsubFlavors();
    };
  }, [currentStoreTenantId]);

  // Synchronous persist helper for Reserve Fund across storage, server disk & LAN
  const persistReserveFund = (nextRf: ReserveFund) => {
    isUpdatingFromLan.current = false;
    const cleanRf: ReserveFund = {
      ...nextRf,
      targetAmountKhr: roundKhr(nextRf.targetAmountKhr),
      currentBalanceKhr: roundKhr(nextRf.currentBalanceKhr),
      history: (nextRf.history || []).map((h) => ({
        ...h,
        amountKhr: roundKhr(h.amountKhr),
      })),
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
    const validKhr = roundKhr(Math.max(0, targetKhr));
    const validUsd = targetUsd !== undefined ? targetUsd : Number((validKhr / exchangeRate).toFixed(2));
    const current = reserveFundRef.current;
    
    // If updateCurrentBalance is true, deduct existing paid cash expenses
    let newBalanceKhr = roundKhr(current.currentBalanceKhr);
    let newBalanceUsd = current.currentBalanceUsd;
    if (updateCurrentBalance) {
      const totalCashExpensesKhr = roundKhr(
        expenses
          .filter((e) => isExpensePaidFromReserve(e))
          .reduce((sum, e) => sum + roundKhr(e.amountKhr || (e.amountUsd * exchangeRate)), 0)
      );
      newBalanceKhr = roundKhr(Math.max(0, validKhr - totalCashExpensesKhr));
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
    const baseTarget = roundKhr(customBaseTargetKhr || current.targetAmountKhr || 4000000);
    const totalDeductibleKhr = roundKhr(
      expenses
        .filter((e) => isExpensePaidFromReserve(e))
        .reduce((sum, e) => sum + roundKhr(e.amountKhr || (e.amountUsd * exchangeRate)), 0)
    );

    const newBalanceKhr = roundKhr(Math.max(0, baseTarget - totalDeductibleKhr));
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

    const totalCashPaidKhr = roundKhr(
      expenses
        .filter((e) => isExpensePaidFromReserve(e))
        .reduce((sum, e) => sum + roundKhr(e.amountKhr || (e.amountUsd * exchangeRate)), 0)
    );

    if (totalCashPaidKhr <= 0) return;

    const hasEverDeducted = (current.history || []).some((tx) => tx.type === 'WITHDRAW');
    if (!hasEverDeducted && current.currentBalanceKhr === current.targetAmountKhr) {
      reconcileReserveFundWithExpenses(current.targetAmountKhr);
    }
  }, [expenses]);

  // Auto-sanitize existing expenses: guarantee all amounts in Riel are strictly rounded to 100 Riel
  useEffect(() => {
    if (!expenses || expenses.length === 0) return;
    let hadUnrounded = false;
    const sanitized = expenses.map((e) => {
      const roundedAmt = roundKhr(e.amountKhr !== undefined ? e.amountKhr : (e.amountUsd * exchangeRate));
      const roundedUnit = e.unitPriceKhr !== undefined ? roundKhr(e.unitPriceKhr) : undefined;
      if (e.amountKhr !== roundedAmt || (e.unitPriceKhr !== undefined && e.unitPriceKhr !== roundedUnit)) {
        hadUnrounded = true;
        return {
          ...e,
          amountKhr: roundedAmt,
          unitPriceKhr: roundedUnit,
        };
      }
      return e;
    });

    if (hadUnrounded) {
      setExpenses(sanitized);
      safeSetStorage('bakery_expenses', JSON.stringify(sanitized));
      saveToLanSync({ expenses: sanitized }, true);
    }
  }, [expenses, exchangeRate]);

  const adjustCurrentBalance = (balanceKhr: number, balanceUsd?: number, reason?: string) => {
    const validKhr = roundKhr(Math.max(0, balanceKhr));
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
    const validKhr = roundKhr(Math.max(0, amountKhr));
    const validUsd = Math.max(0, amountUsd);
    const current = reserveFundRef.current;
    const newBalKhr = roundKhr(Math.max(0, current.currentBalanceKhr - validKhr));
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
    const validKhr = roundKhr(Math.max(0, amountKhr));
    const validUsd = amountUsd !== undefined ? amountUsd : Number((validKhr / exchangeRate).toFixed(2));
    const current = reserveFundRef.current;
    const newBalKhr = roundKhr(current.currentBalanceKhr + validKhr);
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

    const validAmountKhr = roundKhr(expenseData.amountKhr !== undefined ? expenseData.amountKhr : (expenseData.amountUsd * exchangeRate));
    const validUnitPriceKhr = expenseData.unitPriceKhr !== undefined ? roundKhr(expenseData.unitPriceKhr) : undefined;

    const newExpense: Expense = {
      ...expenseData,
      amountKhr: validAmountKhr,
      unitPriceKhr: validUnitPriceKhr,
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

  const batchAddExpenses = (expensesData: Array<Omit<Expense, 'id' | 'createdAt'>>): Expense[] => {
    if (!expensesData || expensesData.length === 0) return [];
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const now = Date.now();
    const newExpenses: Expense[] = expensesData.map((data, idx) => ({
      ...data,
      amountKhr: roundKhr(data.amountKhr !== undefined ? data.amountKhr : (data.amountUsd * exchangeRate)),
      unitPriceKhr: data.unitPriceKhr !== undefined ? roundKhr(data.unitPriceKhr) : undefined,
      id: `exp-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date(now + idx * 10).toISOString(),
    }));

    // Calculate total Reserve Fund deduction for all items that are paid from reserve in one batch
    let totalRfKhr = 0;
    let totalRfUsd = 0;
    const rfItems: Expense[] = [];

    newExpenses.forEach((exp) => {
      const isPaid = !exp.paymentStatus || exp.paymentStatus === 'PAID';
      if (isExpensePaidFromReserve(exp) && isPaid) {
        totalRfKhr += roundKhr(exp.amountKhr || 0);
        totalRfUsd += exp.amountUsd || 0;
        rfItems.push(exp);
      }
    });

    let nextRf: ReserveFund | undefined = undefined;
    if (rfItems.length > 0 && totalRfKhr > 0) {
      nextRf = withdrawReserveFund(
        roundKhr(totalRfKhr),
        totalRfUsd,
        `ដកចំណាយ (${rfItems.length} មុខទំនិញស្កេន AI)៖ ${rfItems[0].title}${rfItems.length > 1 ? ` និង ${rfItems.length - 1} មុខទៀត` : ''}`,
        rfItems[0].id
      );
    }

    // 1. Update React state & LocalStorage in a single pass
    setExpenses((prev) => {
      const updated = [...newExpenses, ...prev];
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

    // 2. Asynchronous background sync to Firebase & server (non-blocking)
    setTimeout(() => {
      newExpenses.forEach((exp) => {
        syncSaveDoc('expenses', exp.id, exp);
        fetch('/api/save-expense', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expense: exp, reserveFund: nextRf }),
        }).catch(() => {});
      });

      // Send single Telegram notification for batch
      if (newExpenses.length > 0) {
        notifyTelegramExpense(newExpenses[0], storeInfo, exchangeRate);
      }
    }, 50);

    return newExpenses;
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

      const totalDeductKhr = roundKhr(targets.reduce((sum, e) => sum + roundKhr(e.amountKhr || 0), 0));
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

  const deleteExpensesByDateRange = (startDate?: string, endDate?: string, targetIds?: string[]): number => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    let toDelete: Expense[] = [];
    if (targetIds && targetIds.length > 0) {
      const idSet = new Set(targetIds);
      toDelete = expenses.filter((e) => idSet.has(e.id));
    } else if (startDate || endDate) {
      toDelete = expenses.filter((e) => {
        const itemDate = (e.date || e.createdAt || '').split('T')[0];
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }

    if (toDelete.length === 0) return 0;

    const toDeleteIds = new Set(toDelete.map((e) => e.id));

    // Register deleted IDs and sync delete to Firebase & backend
    toDelete.forEach((e) => {
      recordDeletedId('expenses', e.id, deletedExpenseIds);
      syncDeleteDoc('expenses', e.id);
      fetch('/api/delete-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: e.id }),
      }).catch(() => {});
    });

    let updatedExpenses: Expense[] = [];
    setExpenses((prev) => {
      updatedExpenses = prev.filter((e) => !toDeleteIds.has(e.id));
      safeSetStorage('bakery_expenses', JSON.stringify(updatedExpenses));
      saveToLanSync({
        products,
        sales,
        customOrders,
        expenses: updatedExpenses,
        storeInfo,
        flavors,
        reserveFund: reserveFundRef.current,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updatedExpenses;
    });

    return toDelete.length;
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
  const totalExpensesKhr = roundKhr(expenses.reduce((acc, exp) => acc + roundKhr(exp.amountKhr || (exp.amountUsd * exchangeRate)), 0));

  // Flavor actions
  const addFlavor = (flavorName: string) => {
    const trimmed = flavorName.trim();
    if (!trimmed || flavors.includes(trimmed)) return;
    setFlavors((prev) => {
      const updated = [trimmed, ...prev];
      const storageKey = globalIsDemoMode ? 'demo_bakery_flavors' : 'bakery_flavors';
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ flavors: updated });
      syncSaveDoc('settings', 'flavors', { list: updated, unavailable: unavailableFlavors, deletedIds: deletedFlavorIds, overrides: flavorOverrides });
      return updated;
    });
    setDeletedFlavorIds((prev) => prev.filter((d) => d !== trimmed.toLowerCase()));
  };

  const updateFlavor = (oldFlavorOrId: string, newFlavorKh: string, newFlavorEn?: string) => {
    const oldKey = (oldFlavorOrId || '').trim();
    const newKh = (newFlavorKh || '').trim();
    const newEn = (newFlavorEn || '').trim();
    if (!newKh) return;

    // 1. Update in flavors array
    setFlavors((prev) => {
      const formatted = newEn ? `${newKh} (${newEn})` : newKh;
      const updated = prev.map((f) => {
        const cleanF = f.trim().toLowerCase();
        if (cleanF === oldKey.toLowerCase() || cleanF.includes(oldKey.toLowerCase())) {
          return formatted;
        }
        return f;
      });
      const storageKey = globalIsDemoMode ? 'demo_bakery_flavors' : 'bakery_flavors';
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ flavors: updated });
      return updated;
    });

    // 2. Track in flavorOverrides (covers preset IDs like 'chocolate', 'durian', or custom keys)
    setFlavorOverrides((prev) => {
      const updated = {
        ...prev,
        [oldKey.toLowerCase()]: { nameKh: newKh, nameEn: newEn },
      };
      const storageKey = globalIsDemoMode ? 'demo_bakery_flavor_overrides' : 'bakery_flavor_overrides';
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ flavorOverrides: updated });
      syncSaveDoc('settings', 'flavors', { list: flavors, unavailable: unavailableFlavors, deletedIds: deletedFlavorIds, overrides: updated });
      return updated;
    });
  };

  const deleteFlavor = (flavorNameOrId: string) => {
    const key = (flavorNameOrId || '').trim();
    if (!key) return;

    // 1. Remove from flavors state
    setFlavors((prev) => {
      const updated = prev.filter((f) => {
        const cleanF = f.trim().toLowerCase();
        return cleanF !== key.toLowerCase() && !cleanF.includes(key.toLowerCase());
      });
      const storageKey = globalIsDemoMode ? 'demo_bakery_flavors' : 'bakery_flavors';
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ flavors: updated });
      return updated;
    });

    // 2. Track in deletedFlavorIds (for presets and custom items)
    setDeletedFlavorIds((prev) => {
      const low = key.toLowerCase();
      if (prev.includes(low)) return prev;
      const updated = [...prev, low];
      const storageKey = globalIsDemoMode ? 'demo_bakery_deleted_flavor_ids' : 'bakery_deleted_flavor_ids';
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ deletedFlavorIds: updated });
      syncSaveDoc('settings', 'flavors', { list: flavors, unavailable: unavailableFlavors, deletedIds: updated, overrides: flavorOverrides });
      return updated;
    });
  };

  const toggleFlavorAvailability = (flavorIdOrLabel: string) => {
    const key = flavorIdOrLabel.trim();
    if (!key) return;
    setUnavailableFlavors((prev) => {
      const isUnavailable = prev.some((f) => f.trim().toLowerCase() === key.toLowerCase());
      const updated = isUnavailable
        ? prev.filter((f) => f.trim().toLowerCase() !== key.toLowerCase())
        : [...prev, key];
      const storageKey = globalIsDemoMode ? 'demo_bakery_unavailable_flavors' : 'bakery_unavailable_flavors';
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ unavailableFlavors: updated });
      syncSaveDoc('settings', 'flavors', { list: flavors, unavailable: updated });
      return updated;
    });
  };

  const setFlavorAvailability = (flavorIdOrLabel: string, isAvailable: boolean) => {
    const key = flavorIdOrLabel.trim();
    if (!key) return;
    setUnavailableFlavors((prev) => {
      const updated = isAvailable
        ? prev.filter((f) => f.trim().toLowerCase() !== key.toLowerCase())
        : prev.some((f) => f.trim().toLowerCase() === key.toLowerCase())
        ? prev
        : [...prev, key];
      const storageKey = globalIsDemoMode ? 'demo_bakery_unavailable_flavors' : 'bakery_unavailable_flavors';
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ unavailableFlavors: updated });
      syncSaveDoc('settings', 'flavors', { list: flavors, unavailable: updated });
      return updated;
    });
  };

  const markAllFlavorsAvailable = () => {
    setUnavailableFlavors([]);
    const storageKey = globalIsDemoMode ? 'demo_bakery_unavailable_flavors' : 'bakery_unavailable_flavors';
    try { localStorage.setItem(storageKey, JSON.stringify([])); } catch (e) {}
    saveToLanSync({ unavailableFlavors: [] });
    syncSaveDoc('settings', 'flavors', { list: flavors, unavailable: [] });
  };

  const restoreDefaultFlavors = () => {
    // Reset deletedFlavorIds and flavorOverrides
    setDeletedFlavorIds([]);
    const delKey = globalIsDemoMode ? 'demo_bakery_deleted_flavor_ids' : 'bakery_deleted_flavor_ids';
    try { localStorage.removeItem(delKey); } catch (e) {}

    setFlavorOverrides({});
    const ovrKey = globalIsDemoMode ? 'demo_bakery_flavor_overrides' : 'bakery_flavor_overrides';
    try { localStorage.removeItem(ovrKey); } catch (e) {}

    saveToLanSync({ deletedFlavorIds: [], flavorOverrides: {} });

    const COMPREHENSIVE_DEFAULT_FLAVORS = [
      'សូកូឡា (Chocolate Fudge Cake)',
      'Red Velvet + Cream Cheese (រ៉េដវ៉េលវែត & ក្រីមឈីស)',
      'Matcha Green Tea + Red Bean (តែបៃតងម៉ាត់ឆា)',
      'Taro Coconut Mousse (ត្រាវដូងក្រអូប)',
      'Durian Kampot Chiffon (ធុរេនកំពតពិសេស)',
      'Lotus Biscoff Caramel (ខារ៉ាមែល ប៊ីស្គូហ្វ)',
      'Mango Passionfruit Cream (ស្វាយ & ផាសិន)',
      'Coffee Mocha Hazelnut (កាហ្វេម៉ូកា)',
      'Classic Vanilla Bean (វ៉ានីឡាស្អាត)',
      'ស្ត្រប៊ែរី (Strawberry Fresh Cream)',
      'ប៊្លូប៊ែរី (Blueberry Cream Cheese)',
      'តយដូង (Pandan Coconut)',
    ];

    setFlavors((prev) => {
      const combined = [...COMPREHENSIVE_DEFAULT_FLAVORS];
      (prev || []).forEach((f) => {
        const clean = f.trim();
        if (clean && !combined.some((c) => c.toLowerCase() === clean.toLowerCase())) {
          combined.push(clean);
        }
      });
      const storageKey = globalIsDemoMode ? 'demo_bakery_flavors' : 'bakery_flavors';
      try { localStorage.setItem(storageKey, JSON.stringify(combined)); } catch (e) {}
      saveToLanSync({ flavors: combined });
      syncSaveDoc('settings', 'flavors', { list: combined, unavailable: [], deletedIds: [], overrides: {} });
      return combined;
    });

    setUnavailableFlavors([]);
    const unavKey = globalIsDemoMode ? 'demo_bakery_unavailable_flavors' : 'bakery_unavailable_flavors';
    try { localStorage.setItem(unavKey, JSON.stringify([])); } catch (e) {}
    saveToLanSync({ unavailableFlavors: [] });
  };

  // Party Addon actions
  const addPartyAddon = (
    nameKh: string,
    priceKhr: number,
    priceUsd?: number,
    stockQty: number = 50,
    minAlertStock: number = 10
  ) => {
    const validKhr = Math.max(0, Number(priceKhr) || 0);
    const validUsd = priceUsd !== undefined ? Number(priceUsd) : Number((validKhr / exchangeRate).toFixed(2));
    const newAddon: PartyAddon = {
      id: `addon-${Date.now()}`,
      nameKh: nameKh.trim(),
      priceKhr: validKhr,
      priceUsd: validUsd,
      stockQty: Math.max(0, Number(stockQty) || 0),
      minAlertStock: Math.max(0, Number(minAlertStock) || 0),
    };
    setPartyAddons((prev) => {
      const updated = [...prev, newAddon];
      safeSetStorage('bakery_party_addons', JSON.stringify(updated));
      saveToLanSync({ partyAddons: updated });
      syncSaveDoc('settings', 'partyAddons', { items: updated });
      broadcastCustomerSync({
        type: 'PARTY_ADDONS_SYNC',
        partyAddons: updated,
      });
      return updated;
    });
    return newAddon;
  };

  const updatePartyAddon = (
    id: string,
    nameKh: string,
    priceKhr: number,
    priceUsd?: number,
    stockQty?: number,
    minAlertStock?: number
  ) => {
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
              stockQty: stockQty !== undefined ? Math.max(0, Number(stockQty) || 0) : (a.stockQty ?? 50),
              minAlertStock: minAlertStock !== undefined ? Math.max(0, Number(minAlertStock) || 0) : (a.minAlertStock ?? 10),
            }
          : a
      );
      safeSetStorage('bakery_party_addons', JSON.stringify(updated));
      saveToLanSync({ partyAddons: updated });
      syncSaveDoc('settings', 'partyAddons', { items: updated });
      broadcastCustomerSync({
        type: 'PARTY_ADDONS_SYNC',
        partyAddons: updated,
      });
      return updated;
    });
  };

  const restockPartyAddon = (id: string, additionalStock: number) => {
    const addQty = Number(additionalStock) || 0;
    if (addQty === 0) return;
    setPartyAddons((prev) => {
      const updated = prev.map((a) =>
        a.id === id
          ? { ...a, stockQty: Math.max(0, (a.stockQty ?? 0) + addQty) }
          : a
      );
      safeSetStorage('bakery_party_addons', JSON.stringify(updated));
      saveToLanSync({ partyAddons: updated });
      syncSaveDoc('settings', 'partyAddons', { items: updated });
      broadcastCustomerSync({
        type: 'PARTY_ADDONS_SYNC',
        partyAddons: updated,
      });
      return updated;
    });
  };

  const deletePartyAddon = (id: string) => {
    recordDeletedId('party_addons', id, deletedPartyAddonIds);
    setPartyAddons((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      safeSetStorage('bakery_party_addons', JSON.stringify(updated));
      saveToLanSync({ partyAddons: updated });
      syncSaveDoc('settings', 'partyAddons', { items: updated, updatedAt: new Date().toISOString() });
      broadcastCustomerSync({
        type: 'PARTY_ADDONS_SYNC',
        partyAddons: updated,
        deletedItem: { type: 'party_addon', id },
      });
      return updated;
    });
  };

  const restoreDefaultPartyAddons = () => {
    const cleaned = initialPartyAddons.filter((a) => a.id !== 'money-gun');
    setPartyAddons(cleaned);
    safeSetStorage('bakery_party_addons', JSON.stringify(cleaned));
    if (globalIsDemoMode) {
      try { localStorage.setItem('demo_bakery_party_addons', JSON.stringify(cleaned)); } catch (e) {}
    }
    saveToLanSync({ partyAddons: cleaned });
    syncSaveDoc('settings', 'partyAddons', { items: cleaned, updatedAt: new Date().toISOString() });
    broadcastCustomerSync({
      type: 'PARTY_ADDONS_SYNC',
      partyAddons: cleaned,
    });
  };

  const deductPartyAddonsStockFromPastSales = (sinceDate: string = '2026-10-08') => {
    const pastSales = sales.filter((s) => {
      if (!s.createdAt) return false;
      const dateStr = s.createdAt.slice(0, 10);
      return dateStr >= sinceDate;
    });

    const soldSummary: Record<string, number> = {};
    pastSales.forEach((s) => {
      (s.items || []).forEach((item) => {
        if (!item.productId) return;
        const rawAddonId = item.productId.startsWith('addon-') ? item.productId.slice(6) : item.productId;
        const matched = partyAddons.find(
          (a) =>
            a.id === rawAddonId ||
            `addon-${a.id}` === item.productId ||
            (item.nameKh && item.nameKh.includes(a.nameKh))
        );
        if (matched) {
          soldSummary[matched.id] = (soldSummary[matched.id] || 0) + (Number(item.quantity) || 1);
        }
      });
    });

    const updated = partyAddons.map((a) => {
      const sold = soldSummary[a.id] || 0;
      if (sold > 0) {
        return {
          ...a,
          stockQty: Math.max(0, (a.stockQty ?? 0) - sold),
        };
      }
      return a;
    });

    setPartyAddons(updated);
    safeSetStorage('bakery_party_addons', JSON.stringify(updated));
    saveToLanSync({ partyAddons: updated });
    syncSaveDoc('settings', 'partyAddons', { items: updated });

    return {
      totalSalesScanned: pastSales.length,
      soldSummary,
      updatedAddons: updated,
    };
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
      broadcastCustomerSync({
        type: 'PRODUCTS_SYNC',
        products: updated,
      });
      return updated;
    });

    // Save atomically and instantly to server
    fetch('/api/save-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: newProduct }),
    }).catch((err) => console.error('Error saving product to LAN:', err));

    syncSaveDoc('products', newProduct.id, newProduct);

    // If added as party/decoration supply, also mirror into partyAddons for quick POS drawer
    if (newProduct.categoryId === 'party') {
      const partyItem: PartyAddon = {
        id: newProduct.id.replace('p-', ''),
        nameKh: newProduct.nameKh,
        nameEn: newProduct.nameEn,
        priceUsd: newProduct.priceUsd,
        priceKhr: newProduct.priceKhr,
        stockQty: newProduct.stockQty ?? 50,
        minAlertStock: 10,
      };
      setPartyAddons((prev) => {
        if (prev.some((a) => a.id === partyItem.id || a.nameKh === partyItem.nameKh)) return prev;
        const updated = [...prev, partyItem];
        safeSetStorage('bakery_party_addons', JSON.stringify(updated));
        saveToLanSync({ partyAddons: updated });
        syncSaveDoc('settings', 'partyAddons', { items: updated });
        broadcastCustomerSync({
          type: 'PARTY_ADDONS_SYNC',
          partyAddons: updated,
        });
        return updated;
      });
    }
  };

  const updateProduct = (product: Product) => {
    const updatedProd: Product = {
      ...product,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === updatedProd.id ? updatedProd : p));
      safeSetStorage('bakery_products', JSON.stringify(updated));
      broadcastCustomerSync({
        type: 'PRODUCTS_SYNC',
        products: updated,
      });
      return updated;
    });

    fetch('/api/save-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: updatedProd }),
    }).catch((err) => console.error('Error saving product to LAN:', err));

    syncSaveDoc('products', updatedProd.id, updatedProd);

    // Sync partyAddons if it is a party supply
    if (updatedProd.categoryId === 'party') {
      const rawId = updatedProd.id.replace('p-', '');
      setPartyAddons((prev) => {
        const updated = prev.map((a) =>
          a.id === rawId || a.nameKh === updatedProd.nameKh
            ? {
                ...a,
                nameKh: updatedProd.nameKh,
                nameEn: updatedProd.nameEn,
                priceUsd: updatedProd.priceUsd,
                priceKhr: updatedProd.priceKhr,
                stockQty: updatedProd.stockQty ?? a.stockQty ?? 50,
              }
            : a
        );
        safeSetStorage('bakery_party_addons', JSON.stringify(updated));
        saveToLanSync({ partyAddons: updated });
        syncSaveDoc('settings', 'partyAddons', { items: updated });
        broadcastCustomerSync({
          type: 'PARTY_ADDONS_SYNC',
          partyAddons: updated,
        });
        return updated;
      });
    }
  };

  const deleteProduct = (productId: string) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    recordDeletedId('products', productId, deletedProductIds);

    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      safeSetStorage('bakery_products', JSON.stringify(updated));
      broadcastCustomerSync({
        type: 'PRODUCTS_SYNC',
        products: updated,
        deletedItem: { type: 'product', id: productId },
      });
      return updated;
    });

    fetch('/api/delete-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId }),
    }).catch((err) => console.error('Error deleting product from LAN:', err));

    syncDeleteDoc('products', productId);

    const rawId = productId.replace('p-', '');
    setPartyAddons((prev) => {
      if (!prev.some((a) => a.id === rawId)) return prev;
      const updated = prev.filter((a) => a.id !== rawId);
      safeSetStorage('bakery_party_addons', JSON.stringify(updated));
      saveToLanSync({ partyAddons: updated });
      syncSaveDoc('settings', 'partyAddons', { items: updated });
      broadcastCustomerSync({
        type: 'PARTY_ADDONS_SYNC',
        partyAddons: updated,
        deletedItem: { type: 'party_addon', id: rawId },
      });
      return updated;
    });
  };

  const restockProduct = (productId: string, additionalStock: number) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    let updatedTarget: Product | null = null;
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, (p.stockQty || 0) + additionalStock);
          const updatedProd = { ...p, stockQty: newStock, updatedAt: new Date().toISOString() };
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
            priceKhr: roundKhr(validUsd * exchangeRate),
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
      priceKhr: roundKhr(validUsd * exchangeRate),
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

  const cartTotalKhr = roundKhr(
    cart.reduce(
      (total, item) =>
        total +
        (item.product.priceKhr ? roundKhr(item.product.priceKhr) : roundKhr(item.product.priceUsd * exchangeRate)) *
          item.quantity,
      0
    )
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

  // Helper to ensure all KHR currency fields in a sale are strictly rounded to 100 Riel
  const sanitizeSaleKhr = (sale: CompletedSale): CompletedSale => {
    return {
      ...sale,
      items: (sale.items || []).map((it) => ({
        ...it,
        priceKhr: roundKhr(it.priceKhr ?? (it.priceUsd * exchangeRate)),
      })),
      totalKhr: roundKhr(sale.totalKhr ?? (sale.totalUsd * exchangeRate)),
      paidKhr: sale.paidKhr !== undefined
        ? roundKhr(sale.paidKhr)
        : (sale.paidUsd !== undefined ? roundKhr(sale.paidUsd * exchangeRate) : undefined),
      changeKhr: roundKhr(sale.changeKhr ?? 0),
      depositKhr: sale.depositKhr !== undefined ? roundKhr(sale.depositKhr) : undefined,
      remainingKhr: sale.remainingKhr !== undefined ? roundKhr(sale.remainingKhr) : undefined,
    };
  };

  // Complete Live Sale
  const completeSale = (saleData: Omit<CompletedSale, 'id' | 'orderNumber' | 'createdAt'>): CompletedSale => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todayPrefix = `POS-${todayStr}-`;
    let maxSuffix = 0;
    sales.forEach((s) => {
      if (s.orderNumber && s.orderNumber.startsWith(todayPrefix)) {
        const numPart = parseInt(s.orderNumber.slice(todayPrefix.length), 10);
        if (!isNaN(numPart) && numPart > maxSuffix) {
          maxSuffix = numPart;
        }
      }
    });
    const orderNumber = `${todayPrefix}${String(maxSuffix + 1).padStart(3, '0')}`;
    const rawSale: CompletedSale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };
    const newSale = sanitizeSaleKhr(rawSale);

    // Deduct stock for products sold (Aggregate quantities in case same product is in cart multiple times)
    const soldQuantities: Record<string, number> = {};
    (saleData.items || []).forEach((item) => {
      if (item.productId && item.quantity > 0) {
        soldQuantities[item.productId] = (soldQuantities[item.productId] || 0) + item.quantity;
      }
    });

    const nowIso = new Date().toISOString();

    const updatedProducts = products.map((p) => {
      const soldQty = soldQuantities[p.id];
      if (soldQty && soldQty > 0) {
        const updated = {
          ...p,
          stockQty: Math.max(0, p.stockQty - soldQty),
          updatedAt: nowIso,
        };
        syncSaveDoc('products', p.id, updated);
        return updated;
      }
      return p;
    });

    // Deduct stock for party accessories/addons sold
    const soldPartyAddonsMap: Record<string, number> = {};
    (saleData.items || []).forEach((item) => {
      if (!item.productId) return;
      const rawAddonId = item.productId.startsWith('addon-') ? item.productId.slice(6) : item.productId;
      const matched = partyAddons.find((a) => a.id === rawAddonId || `addon-${a.id}` === item.productId);
      if (matched) {
        soldPartyAddonsMap[matched.id] = (soldPartyAddonsMap[matched.id] || 0) + item.quantity;
      }
    });

    let updatedPartyAddons = partyAddons;
    if (Object.keys(soldPartyAddonsMap).length > 0) {
      updatedPartyAddons = partyAddons.map((a) => {
        if (soldPartyAddonsMap[a.id]) {
          return { ...a, stockQty: Math.max(0, (a.stockQty ?? 0) - soldPartyAddonsMap[a.id]) };
        }
        return a;
      });
      setPartyAddons(updatedPartyAddons);
      safeSetStorage('bakery_party_addons', JSON.stringify(updatedPartyAddons));
      syncSaveDoc('settings', 'partyAddons', { items: updatedPartyAddons, updatedAt: nowIso });
    }

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
        partyAddons: updatedPartyAddons,
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

    // If it's a deposit pre-order, custom cake order alert (notifyTelegramCustomOrder) handles the alert
    // so we skip notifyTelegramSale here to prevent duplicate alerts.
    if (!newSale.isDeposit) {
      notifyTelegramSale(newSale, storeInfo, exchangeRate).catch((err) => {
        console.error('[BakeryContext] notifyTelegramSale error:', err);
      });
    }

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

    const rawSale: CompletedSale = {
      ...saleData,
      id: `sale-past-${Date.now()}`,
    };
    const newSale = sanitizeSaleKhr(rawSale);

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

    const cleanSale = sanitizeSaleKhr(updatedSale);

    fetch('/api/save-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sale: cleanSale }),
    }).catch(() => {});

    setSales((prev) => {
      const updated = prev.map((s) => (s.id === cleanSale.id ? cleanSale : s));
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
    syncSaveDoc('sales', cleanSale.id, cleanSale);
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
      const nowIso = new Date().toISOString();
      updatedProducts = products.map((p) => {
        const itemToRestore = saleToDelete.items.find((item) => item.productId === p.id);
        if (itemToRestore && itemToRestore.quantity > 0) {
          const restoredStock = (p.stockQty || 0) + itemToRestore.quantity;
          const updatedProd = { ...p, stockQty: restoredStock, updatedAt: nowIso };
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

      // Restore party addons stock
      const restorePartyAddonsMap: Record<string, number> = {};
      saleToDelete.items.forEach((item) => {
        if (!item.productId || item.quantity <= 0) return;
        const rawAddonId = item.productId.startsWith('addon-') ? item.productId.slice(6) : item.productId;
        const matched = partyAddons.find((a) => a.id === rawAddonId || `addon-${a.id}` === item.productId);
        if (matched) {
          restorePartyAddonsMap[matched.id] = (restorePartyAddonsMap[matched.id] || 0) + item.quantity;
        }
      });

      if (Object.keys(restorePartyAddonsMap).length > 0) {
        setPartyAddons((prev) => {
          const updated = prev.map((a) => {
            if (restorePartyAddonsMap[a.id]) {
              return { ...a, stockQty: (a.stockQty ?? 0) + restorePartyAddonsMap[a.id] };
            }
            return a;
          });
          safeSetStorage('bakery_party_addons', JSON.stringify(updated));
          saveToLanSync({ partyAddons: updated });
          syncSaveDoc('settings', 'partyAddons', { items: updated, updatedAt: nowIso });
          return updated;
        });
      }
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

  const deleteSalesByDateRange = (startDate?: string, endDate?: string, targetIds?: string[], restoreStock: boolean = true): number => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    let toDelete: CompletedSale[] = [];
    if (targetIds && targetIds.length > 0) {
      const idSet = new Set(targetIds);
      toDelete = sales.filter((s) => idSet.has(s.id));
    } else if (startDate || endDate) {
      toDelete = sales.filter((s) => {
        const itemDate = (s.createdAt || '').split('T')[0];
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }

    if (toDelete.length === 0) return 0;

    const toDeleteIds = new Set(toDelete.map((s) => s.id));

    // Restore stock if requested
    let updatedProducts = products;
    if (restoreStock) {
      const stockRestoreMap: Record<string, number> = {};
      toDelete.forEach((sale) => {
        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach((item) => {
            if (item.productId && item.quantity > 0) {
              stockRestoreMap[item.productId] = (stockRestoreMap[item.productId] || 0) + item.quantity;
            }
          });
        }
      });

      const nowIso = new Date().toISOString();
      if (Object.keys(stockRestoreMap).length > 0) {
        updatedProducts = products.map((p) => {
          if (stockRestoreMap[p.id]) {
            const restored = { ...p, stockQty: (p.stockQty || 0) + stockRestoreMap[p.id], updatedAt: nowIso };
            syncSaveDoc('products', p.id, restored);
            return restored;
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

      // Restore party addons stock
      const partyStockRestoreMap: Record<string, number> = {};
      toDelete.forEach((sale) => {
        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach((item) => {
            if (!item.productId || item.quantity <= 0) return;
            const rawAddonId = item.productId.startsWith('addon-') ? item.productId.slice(6) : item.productId;
            const matched = partyAddons.find((a) => a.id === rawAddonId || `addon-${a.id}` === item.productId);
            if (matched) {
              partyStockRestoreMap[matched.id] = (partyStockRestoreMap[matched.id] || 0) + item.quantity;
            }
          });
        }
      });

      if (Object.keys(partyStockRestoreMap).length > 0) {
        setPartyAddons((prev) => {
          const updated = prev.map((a) => {
            if (partyStockRestoreMap[a.id]) {
              return { ...a, stockQty: (a.stockQty ?? 0) + partyStockRestoreMap[a.id] };
            }
            return a;
          });
          safeSetStorage('bakery_party_addons', JSON.stringify(updated));
          saveToLanSync({ partyAddons: updated });
          syncSaveDoc('settings', 'partyAddons', { items: updated, updatedAt: nowIso });
          return updated;
        });
      }
    }

    toDelete.forEach((s) => {
      recordDeletedId('sales', s.id, deletedSaleIds);
      if (s.id.startsWith('sale-custom-')) {
        const orderId = s.id.replace('sale-custom-', '');
        recordDeletedId('orders', orderId, deletedOrderIds);
      }
      syncDeleteDoc('sales', s.id);
      fetch('/api/delete-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id }),
      }).catch(() => {});
    });

    setSales((prev) => {
      const updated = prev.filter((s) => !toDeleteIds.has(s.id));
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

    return toDelete.length;
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
    const cleanTotalKhr = orderData.totalKhr !== undefined
      ? Math.round(orderData.totalKhr / 100) * 100
      : Math.round(((orderData.totalUsd || 0) * exchangeRate) / 100) * 100;
    const cleanDepositKhr = orderData.depositKhr !== undefined
      ? Math.round(orderData.depositKhr / 100) * 100
      : Math.round(((orderData.depositUsd || 0) * exchangeRate) / 100) * 100;

    const nowIso = new Date().toISOString();
    let updatedProducts = products;
    let updatedPartyAddons = partyAddons;

    // Track what items & accessories were deducted
    let finalDeductedItems: { productId: string; quantity: number }[] = orderData.deductedItems ? [...orderData.deductedItems] : [];
    let finalDeductedAddons: { addonId: string; quantity: number }[] = orderData.deductedAddons ? [...orderData.deductedAddons] : [];
    let finalStockDeducted = Boolean(orderData.stockDeducted);

    // If stock was NOT already deducted by POS (e.g. online order or new custom order modal)
    if (!orderData.stockDeducted) {
      const itemsToDeduct: { productId: string; quantity: number }[] = [...finalDeductedItems];
      const addonsToDeduct: { addonId: string; quantity: number }[] = [...finalDeductedAddons];

      // Auto-match bread items if not already in deductedItems
      if (itemsToDeduct.length === 0 && orderData.orderType === 'BREAD' && orderData.breadItems && orderData.breadItems.length > 0) {
        orderData.breadItems.forEach((b) => {
          const match = products.find(
            (p) =>
              p.nameKh.trim().toLowerCase() === b.nameKh.trim().toLowerCase() ||
              (p.nameEn && p.nameEn.trim().toLowerCase() === (b.nameEn || b.nameKh).trim().toLowerCase())
          );
          if (match) {
            itemsToDeduct.push({ productId: match.id, quantity: b.quantity });
          }
        });
      }

      // Auto-match cake product if not already in deductedItems
      if (itemsToDeduct.length === 0 && orderData.cakeName) {
        const match = products.find(
          (p) =>
            p.nameKh.trim().toLowerCase() === orderData.cakeName.trim().toLowerCase() ||
            (p.nameEn && p.nameEn.trim().toLowerCase() === orderData.cakeName.trim().toLowerCase())
        );
        if (match) {
          itemsToDeduct.push({ productId: match.id, quantity: 1 });
        }
      }

      // Auto-match party addons from notes if not provided
      if (addonsToDeduct.length === 0 && orderData.themeNotes) {
        partyAddons.forEach((a) => {
          if (orderData.themeNotes && orderData.themeNotes.includes(a.nameKh)) {
            addonsToDeduct.push({ addonId: a.id, quantity: 1 });
          }
        });
      }

      // Deduct product stock
      if (itemsToDeduct.length > 0) {
        const deductProdMap: Record<string, number> = {};
        itemsToDeduct.forEach((it) => {
          deductProdMap[it.productId] = (deductProdMap[it.productId] || 0) + it.quantity;
        });

        updatedProducts = products.map((p) => {
          const qty = deductProdMap[p.id];
          if (qty && qty > 0) {
            const updated = {
              ...p,
              stockQty: Math.max(0, (p.stockQty || 0) - qty),
              updatedAt: nowIso,
            };
            syncSaveDoc('products', p.id, updated);
            return updated;
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

      // Deduct party addons stock
      if (addonsToDeduct.length > 0) {
        const deductAddonMap: Record<string, number> = {};
        addonsToDeduct.forEach((ad) => {
          deductAddonMap[ad.addonId] = (deductAddonMap[ad.addonId] || 0) + ad.quantity;
        });

        updatedPartyAddons = partyAddons.map((a) => {
          const qty = deductAddonMap[a.id];
          if (qty && qty > 0) {
            return {
              ...a,
              stockQty: Math.max(0, (a.stockQty || 0) - qty),
            };
          }
          return a;
        });

        setPartyAddons(updatedPartyAddons);
        safeSetStorage('bakery_party_addons', JSON.stringify(updatedPartyAddons));
        saveToLanSync({ partyAddons: updatedPartyAddons });
        syncSaveDoc('settings', 'partyAddons', { items: updatedPartyAddons, updatedAt: nowIso });
      }

      if (itemsToDeduct.length > 0 || addonsToDeduct.length > 0) {
        finalStockDeducted = true;
        finalDeductedItems = itemsToDeduct;
        finalDeductedAddons = addonsToDeduct;
      }
    }

    const newOrder: CustomCakeOrder = {
      ...orderData,
      totalKhr: cleanTotalKhr,
      depositKhr: cleanDepositKhr,
      id: `ord-${Date.now()}`,
      orderNumber,
      stockDeducted: finalStockDeducted,
      deductedItems: finalDeductedItems.length > 0 ? finalDeductedItems : undefined,
      deductedAddons: finalDeductedAddons.length > 0 ? finalDeductedAddons : undefined,
      createdAt: nowIso,
    };
    setCustomOrders((prev) => {
      const updated = [newOrder, ...prev];
      safeSetStorage('bakery_custom_orders', JSON.stringify(updated));
      saveToLanSync({
        products: updatedProducts,
        partyAddons: updatedPartyAddons,
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
      body: JSON.stringify({
        order: newOrder,
        updatedProducts: finalStockDeducted && finalDeductedItems.length > 0 ? updatedProducts : undefined,
        updatedPartyAddons: finalStockDeducted && finalDeductedAddons.length > 0 ? updatedPartyAddons : undefined,
      }),
    }).catch(() => {});

    syncSaveDoc('customOrders', newOrder.id, newOrder);
    notifyTelegramCustomOrder(newOrder, storeInfo, exchangeRate);
    return newOrder;
  };

  // Helper to construct a completed sale record from a custom cake/bread order
  const buildSaleFromCustomOrder = (order: CustomCakeOrder): CompletedSale => {
    const orderTotalKhr = roundKhr(order.totalKhr ?? (order.totalUsd * exchangeRate));
    const receiptItems =
      order.orderType === 'BREAD' && order.breadItems && order.breadItems.length > 0
        ? order.breadItems.map((it, idx) => ({
            productId: `bread-${order.id}-${idx}`,
            nameKh: `${it.nameKh} (${it.unit})`,
            nameEn: `${it.nameEn || it.nameKh} (${it.unit})`,
            quantity: it.quantity,
            priceUsd: it.pricePerUnitUsd,
            priceKhr: roundKhr(it.pricePerUnitKhr ?? (it.pricePerUnitUsd * exchangeRate)),
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
      depositKhr: order.depositKhr !== undefined ? roundKhr(order.depositKhr) : undefined,
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
    const cleanUpdates = { ...updates };
    if (cleanUpdates.totalKhr !== undefined) cleanUpdates.totalKhr = roundKhr(cleanUpdates.totalKhr);
    if (cleanUpdates.depositKhr !== undefined) cleanUpdates.depositKhr = roundKhr(cleanUpdates.depositKhr);
    if (cleanUpdates.breadItems) {
      cleanUpdates.breadItems = cleanUpdates.breadItems.map((b) => ({
        ...b,
        pricePerUnitKhr: roundKhr(b.pricePerUnitKhr ?? (b.pricePerUnitUsd * exchangeRate)),
      }));
    }
    if (cleanUpdates.status) {
      updateOrderStatus(orderId, cleanUpdates.status);
    }
    setCustomOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...cleanUpdates } : o));
      safeSetStorage('bakery_custom_orders', JSON.stringify(updated));
      return updated;
    });
    syncSaveDoc('customOrders', orderId, cleanUpdates);
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
        const currentDepKhr = roundKhr(o.depositKhr ?? (o.depositUsd * exchangeRate));
        const orderTotalKhr = roundKhr(o.totalKhr ?? (o.totalUsd * exchangeRate));
        const newDepKhr = roundKhr(Math.min(orderTotalKhr, currentDepKhr + additionalDepositKhr));
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

  const deleteCustomOrder = (orderId: string, restoreStock: boolean = true) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const currentOrders = customOrdersRef.current || customOrders;
    const targetOrder = currentOrders.find((o) => o.id === orderId);

    recordDeletedId('orders', orderId, deletedOrderIds);

    const autoSaleId = `sale-custom-${orderId}`;
    const currentSales = salesRef.current || sales;
    const matchingSales = currentSales.filter((s) =>
      s.id === autoSaleId ||
      (targetOrder && s.orderNumber && s.orderNumber === targetOrder.orderNumber) ||
      (targetOrder && targetOrder.themeNotes && s.orderNumber && targetOrder.themeNotes.includes(s.orderNumber))
    );

    const matchingSaleIds = new Set<string>();
    matchingSaleIds.add(autoSaleId);
    matchingSales.forEach((s) => matchingSaleIds.add(s.id));

    let updatedProducts = products;
    let updatedPartyAddons = partyAddons;
    const nowIso = new Date().toISOString();

    const stockRestoreMap: Record<string, number> = {};
    const restorePartyAddonsMap: Record<string, number> = {};

    // Restore stock if requested and order has not already had stock restored
    if (restoreStock && (!targetOrder || !targetOrder.stockRestored)) {
      // 1. Restore from matching sales items if available
      matchingSales.forEach((s) => {
        (s.items || []).forEach((item) => {
          if (!item.productId || item.quantity <= 0) return;
          const rawAddonId = item.productId.startsWith('addon-') ? item.productId.slice(6) : item.productId;
          const matchedAddon = partyAddons.find((a) => a.id === rawAddonId || `addon-${a.id}` === item.productId);
          if (matchedAddon) {
            restorePartyAddonsMap[matchedAddon.id] = (restorePartyAddonsMap[matchedAddon.id] || 0) + item.quantity;
          } else {
            const prod = products.find((p) => p.id === item.productId);
            if (prod) {
              stockRestoreMap[prod.id] = (stockRestoreMap[prod.id] || 0) + item.quantity;
            }
          }
        });
      });

      // 2. Restore from targetOrder.deductedItems if not already restored from sales
      if (targetOrder?.deductedItems && targetOrder.deductedItems.length > 0) {
        targetOrder.deductedItems.forEach((it) => {
          if (matchingSales.length === 0 || !stockRestoreMap[it.productId]) {
            stockRestoreMap[it.productId] = (stockRestoreMap[it.productId] || 0) + it.quantity;
          }
        });
      }

      // 3. Restore from targetOrder.deductedAddons
      if (targetOrder?.deductedAddons && targetOrder.deductedAddons.length > 0) {
        targetOrder.deductedAddons.forEach((ad) => {
          if (matchingSales.length === 0 || !restorePartyAddonsMap[ad.addonId]) {
            restorePartyAddonsMap[ad.addonId] = (restorePartyAddonsMap[ad.addonId] || 0) + ad.quantity;
          }
        });
      }

      // 4. Fallback for orders without explicit deductedItems: match products by name
      if (Object.keys(stockRestoreMap).length === 0 && targetOrder) {
        if (targetOrder.orderType === 'BREAD' && targetOrder.breadItems && targetOrder.breadItems.length > 0) {
          targetOrder.breadItems.forEach((b) => {
            const match = products.find(
              (p) =>
                p.nameKh.trim().toLowerCase() === b.nameKh.trim().toLowerCase() ||
                (p.nameEn && p.nameEn.trim().toLowerCase() === (b.nameEn || b.nameKh).trim().toLowerCase())
            );
            if (match) {
              stockRestoreMap[match.id] = (stockRestoreMap[match.id] || 0) + b.quantity;
            }
          });
        } else if (targetOrder.cakeName) {
          const match = products.find(
            (p) =>
              p.nameKh.trim().toLowerCase() === targetOrder.cakeName.trim().toLowerCase() ||
              (p.nameEn && p.nameEn.trim().toLowerCase() === targetOrder.cakeName.trim().toLowerCase()) ||
              (targetOrder.cakeName.toLowerCase().includes(p.nameKh.toLowerCase()) && p.nameKh.length > 3)
          );
          if (match) {
            stockRestoreMap[match.id] = (stockRestoreMap[match.id] || 0) + 1;
          }
        }
      }

      // 5. Fallback for party addons mentioned in themeNotes
      if (Object.keys(restorePartyAddonsMap).length === 0 && targetOrder?.themeNotes) {
        partyAddons.forEach((a) => {
          if (targetOrder.themeNotes && targetOrder.themeNotes.includes(a.nameKh)) {
            restorePartyAddonsMap[a.id] = (restorePartyAddonsMap[a.id] || 0) + 1;
          }
        });
      }

      // Apply product stock restoration
      if (Object.keys(stockRestoreMap).length > 0) {
        updatedProducts = products.map((p) => {
          const qty = stockRestoreMap[p.id];
          if (qty && qty > 0) {
            const restoredStock = (p.stockQty || 0) + qty;
            const updatedProd = { ...p, stockQty: restoredStock, updatedAt: nowIso };
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

      // Apply party addons restoration
      if (Object.keys(restorePartyAddonsMap).length > 0) {
        updatedPartyAddons = partyAddons.map((a) => {
          const qty = restorePartyAddonsMap[a.id];
          if (qty && qty > 0) {
            return { ...a, stockQty: (a.stockQty || 0) + qty };
          }
          return a;
        });

        setPartyAddons(updatedPartyAddons);
        safeSetStorage('bakery_party_addons', JSON.stringify(updatedPartyAddons));
        saveToLanSync({ partyAddons: updatedPartyAddons });
        syncSaveDoc('settings', 'partyAddons', { items: updatedPartyAddons, updatedAt: nowIso });
      }
    }

    // Delete matching sales
    matchingSaleIds.forEach((sId) => {
      recordDeletedId('sales', sId, deletedSaleIds);
      syncDeleteDoc('sales', sId);
      fetch('/api/delete-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sId }),
      }).catch(() => {});
    });

    const updatedSales = sales.filter((s) => !matchingSaleIds.has(s.id));
    setSales(updatedSales);
    safeSetStorage('bakery_sales', JSON.stringify(updatedSales));

    // Delete custom order
    syncDeleteDoc('customOrders', orderId);
    fetch('/api/delete-custom-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId,
        matchingSaleIds: Array.from(matchingSaleIds),
        updatedProducts: Object.keys(stockRestoreMap).length > 0 ? updatedProducts : undefined,
        updatedPartyAddons: Object.keys(restorePartyAddonsMap).length > 0 ? updatedPartyAddons : undefined,
      }),
    }).catch(() => {});

    setCustomOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      safeSetStorage('bakery_custom_orders', JSON.stringify(updated));
      saveToLanSync({
        products: updatedProducts,
        partyAddons: updatedPartyAddons,
        sales: updatedSales,
        customOrders: updated,
        expenses,
        storeInfo,
        flavors,
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });
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

  const exitDemoMode = async (targetStaff?: StaffMember) => {
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
      const currentTenant = getStoreId();
      const isCustomTenant = !isDefaultStore(currentTenant);
      if (isCustomTenant) {
        const tenantSnapshotKey = `bakery_tenant_snapshot_${currentTenant}`;
        const savedSnap = localStorage.getItem(tenantSnapshotKey);
        if (savedSnap) {
          try {
            const snap = JSON.parse(savedSnap);
            if (Array.isArray(snap.products)) setProducts(sortProductsNewestFirst(snap.products));
            if (Array.isArray(snap.sales)) setSales(snap.sales);
            if (Array.isArray(snap.customOrders)) setCustomOrders(snap.customOrders);
            if (Array.isArray(snap.expenses)) setExpenses(snap.expenses);
            if (snap.storeInfo) setStoreInfo(snap.storeInfo);
            const liveStaff = localStorage.getItem('bakery_staff_members');
            if (liveStaff) {
              try {
                const parsed = JSON.parse(liveStaff);
                if (Array.isArray(parsed) && parsed.length > 0) setStaffMembers(parsed);
              } catch (e) {}
            }
            return;
          } catch (e) {}
        }
      }

      const [
        liveProd,
        liveSales,
        liveOrders,
        liveExpenses,
        liveIngredients,
        liveRecipes,
      ] = await Promise.all([
        idbGet('bakery_products').then((res) => res || localStorage.getItem('bakery_products')),
        idbGet('bakery_sales').then((res) => res || localStorage.getItem('bakery_sales')),
        idbGet('bakery_custom_orders').then((res) => res || localStorage.getItem('bakery_custom_orders')),
        idbGet('bakery_expenses').then((res) => res || localStorage.getItem('bakery_expenses')),
        idbGet('bakery_ingredients').then((res) => res || localStorage.getItem('bakery_ingredients')),
        idbGet('bakery_recipes').then((res) => res || localStorage.getItem('bakery_recipes')),
      ]);

      let prodList = isDefaultStore(currentTenant) ? initialProducts : [];
      if (liveProd) {
        try {
          const parsed = JSON.parse(liveProd);
          if (Array.isArray(parsed)) prodList = parsed;
        } catch (e) {}
      }
      setProducts(sortProductsNewestFirst(prodList));

      if (liveSales) {
        try { setSales(JSON.parse(liveSales)); } catch (e) {}
      }
      if (liveOrders) {
        try { setCustomOrders(JSON.parse(liveOrders)); } catch (e) {}
      }
      if (liveExpenses) {
        try { setExpenses(JSON.parse(liveExpenses)); } catch (e) {}
      }
      if (liveIngredients) {
        try { setIngredients(JSON.parse(liveIngredients)); } catch (e) {}
      }
      if (liveRecipes) {
        try { setRecipes(JSON.parse(liveRecipes)); } catch (e) {}
      }

      const liveAddons = localStorage.getItem('bakery_party_addons');
      if (liveAddons) setPartyAddons(JSON.parse(liveAddons));

      const liveFlavors = localStorage.getItem('bakery_flavors');
      if (liveFlavors) setFlavors(JSON.parse(liveFlavors));

      const liveShift = localStorage.getItem('bakery_shift');
      if (liveShift) setCurrentShift(JSON.parse(liveShift));

      const liveStore = localStorage.getItem('bakery_store_info');
      if (liveStore) setStoreInfo(JSON.parse(liveStore));

      const liveStaff = localStorage.getItem('bakery_staff_members');
      let effectiveStaffList: StaffMember[] = initialStaffMembers;
      if (liveStaff) {
        try {
          const parsed = JSON.parse(liveStaff);
          if (Array.isArray(parsed) && parsed.length > 0) {
            effectiveStaffList = parsed;
          }
        } catch (e) {}
      }
      setStaffMembers(effectiveStaffList);

      // Preserve the specific staff who logged in (e.g. Vicheta) rather than blindly resetting to Admin!
      let staffToSet: StaffMember | undefined = targetStaff;
      if (!staffToSet) {
        const savedCurrent = localStorage.getItem('bakery_current_staff');
        if (savedCurrent) {
          try {
            const parsedSaved = JSON.parse(savedCurrent);
            if (parsedSaved?.id) {
              staffToSet = effectiveStaffList.find(
                (s) => s.id === parsedSaved.id || s.pinCode === parsedSaved.pinCode || s.name === parsedSaved.name
              );
            }
          } catch (e) {}
        }
      }
      if (!staffToSet && currentStaff) {
        staffToSet = effectiveStaffList.find(
          (s) => s.id === currentStaff.id || s.pinCode === currentStaff.pinCode || s.name === currentStaff.name
        );
      }
      setCurrentStaff(staffToSet || effectiveStaffList[0]);

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

  // Real Store Security Passcode Authentication Modal State (Synchronously initialized for 0ms instant display)
  const [isRealStoreAuthModalOpen, setIsRealStoreAuthModalOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    // If customer order portal or tv showcase link, never show staff auth modal
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (params.get('order') === 'true' || hash === '#order' || hash === '#customer-view') {
      return false;
    }

    // Explicit demo requested in URL (?demo=true or #demo)
    if (params.get('demo') === 'true' || hash === '#demo') {
      return false;
    }

    // Check if session in this window/tab is already unlocked
    const isUnlockedSession = sessionStorage.getItem('bakery_real_store_unlocked') === 'true';
    if (isUnlockedSession) return false;

    // Check store security configuration
    let requirePin = true;
    let alwaysRequireLogin = true;
    try {
      const saved = localStorage.getItem('bakery_store_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.requireRealStorePin === false) requirePin = false;
        if (parsed.alwaysRequireLoginOnStartup === false) alwaysRequireLogin = false;
      }
    } catch (e) {}

    if (!requirePin) return false;

    // By default (alwaysRequireLogin = true), always prompt for login / PIN on fresh launch
    if (alwaysRequireLogin) {
      return true;
    }

    // If startup login is disabled in settings, check if device was remembered
    const isTrustedDevice = localStorage.getItem('bakery_real_store_authorized_device') === 'true';
    if (isTrustedDevice) return false;

    return true;
  });
  const [realStoreAuthSuccessCallback, setRealStoreAuthSuccessCallback] = useState<((authenticatedStaff?: StaffMember) => void) | null>(null);

  const openRealStoreAuthModal = (onSuccess?: (authenticatedStaff?: StaffMember) => void) => {
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

    // Load actual real store staff list (so PIN lookup works accurately even if in Demo mode)
    let realStaffList: StaffMember[] = initialStaffMembers;
    const savedStaff = localStorage.getItem('bakery_staff_members');
    if (savedStaff) {
      try {
        const parsed = JSON.parse(savedStaff);
        if (Array.isArray(parsed) && parsed.length > 0) {
          realStaffList = parsed;
        }
      } catch (e) {}
    } else if (staffMembers && staffMembers.length > 0 && !globalIsDemoMode) {
      realStaffList = staffMembers;
    }

    // 1. App Super Admin Master Keys (for emergency access only)
    if (cleanPin === '889977' || cleanPin === '999999' || cleanPin === 'admin@bakery2026') {
      const adminStaff = realStaffList.find((s) => s.role === 'ADMIN') || realStaffList[0];
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
      const adminStaff = realStaffList.find((s) => s.role === 'ADMIN') || realStaffList[0];
      setCurrentStaff(adminStaff);
      return true;
    }

    // 4. Cashier PIN: 0202 (Real Cashier PIN for វិជ្ជតា Vicheta)
    if (cleanPin === '0202') {
      const cashierStaff =
        realStaffList.find((s) => s.role === 'CASHIER' || s.pinCode === '0202') ||
        realStaffList.find((s) => s.name?.includes('វិជ្ជតា')) ||
        realStaffList.find((s) => s.role === 'CASHIER');
      if (cashierStaff) {
        setCurrentStaff(cashierStaff);
        return true;
      }
    }

    // 5. Match against any active staff member's actual saved/changed PIN (excluding 1111 & 2222)
    // This respects all custom staff PIN changes (3333, 4444, etc.)
    const matchedStaff = realStaffList.find(
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
      openRealStoreAuthModal((authenticatedStaff?: StaffMember) => {
        exitDemoMode(authenticatedStaff);
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
        realStoreAuthSuccessCallback,
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
        unavailableFlavors,
        deletedFlavorIds,
        flavorOverrides,
        addFlavor,
        updateFlavor,
        deleteFlavor,
        toggleFlavorAvailability,
        setFlavorAvailability,
        markAllFlavorsAvailable,
        restoreDefaultFlavors,
        partyAddons,
        addPartyAddon,
        updatePartyAddon,
        restockPartyAddon,
        deletePartyAddon,
        restoreDefaultPartyAddons,
        deductPartyAddonsStockFromPastSales,
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
        batchAddExpenses,
        updateExpense,
        deleteExpense,
        deleteExpensesByDateRange,
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
        deleteSalesByDateRange,
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
        roundKhr,
        usdToKhr: (usd, rate) => usdToKhr(usd, rate || exchangeRate),
        formatKhr,
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
