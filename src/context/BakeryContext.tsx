import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialOrders,
  initialIngredients,
  initialSales,
  initialShift,
  initialFlavors,
  initialExpenses,
  initialStaffMembers,
  initialRecipes,
} from '../data/mockData';
import { sortProductsNewestFirst } from '../utils/productUtils';
import { idbGet, idbSet } from '../utils/idbStorage';
import {
  getStoredFirebaseConfig,
  getFirestoreDb,
  subscribeToFirestoreCollection,
  subscribeToFirestoreDoc,
  saveFirestoreDoc,
  deleteFirestoreDoc,
} from '../services/firebase';
import {
  notifyTelegramSale,
  notifyTelegramCustomOrder,
  notifyTelegramExpense,
  notifyTelegramShiftClose,
  getStoredTelegramConfig,
  saveStoredTelegramConfig,
} from '../services/telegram';

interface BakeryContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  exchangeRate: number; // e.g. 4100
  setExchangeRate: (rate: number) => void;

  isFirebaseConnected: boolean;
  firebaseSyncStatus: 'connected' | 'disconnected' | 'syncing';

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
  addCustomOrder: (order: Omit<CustomCakeOrder, 'id' | 'orderNumber' | 'createdAt'>) => void;
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
  totalExpensesUsd: number;
  totalExpensesKhr: number;

  sales: CompletedSale[];
  completeSale: (sale: Omit<CompletedSale, 'id' | 'orderNumber' | 'createdAt'>) => CompletedSale;
  addPastSale: (sale: Omit<CompletedSale, 'id'>) => void;
  updateSale: (sale: CompletedSale) => void;
  deleteSale: (id: string) => void;
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
            if (s.name?.includes('ម៉ារី') || s.name?.includes('Mary') || s.id === 'staff-1') {
              return {
                ...s,
                name: s.name?.includes('ម៉ារី') || s.name?.includes('Mary') ? 'ម្ចាស់ហាង (Admin)' : s.name,
                nameEn: s.nameEn?.includes('Mary') ? 'Store Owner (Admin)' : s.nameEn,
                avatar: s.avatar === '👩‍🍳' ? '👑' : s.avatar,
              };
            }
            return s;
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
    const found = staffMembers.find((s) => s.pinCode === pin && s.isActive);
    if (found) {
      setCurrentStaff(found);
      return true;
    }
    return false;
  };

  const addStaffMember = (staffData: Omit<StaffMember, 'id'>) => {
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
    setStaffMembers((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      localStorage.setItem('bakery_staff_members', JSON.stringify(updated));
      return updated;
    });
    saveFirestoreDoc('staffMembers', id, updates);
    if (currentStaff.id === id) {
      setCurrentStaffState((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteStaffMember = (id: string) => {
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
    const saved = localStorage.getItem('bakery_store_info');
    const defaultInfo: StoreInfo = {
      nameKh: 'មិត្តភាព & ខេក',
      nameEn: 'Friends Cake & Bakery',
      logoUrl: '/uploads/products/prod_1789651345094_x6k2.jpg',
      phone: '081 55 66 99',
      address: 'ផ្ទះលេខ #123, ផ្លូវ 2004, សង្កាត់កាកាប, ខណ្ឌពោធិ៍សែនជ័យ, ភ្នំពេញ',
      tagline: 'នំខេកឆ្ងាញ់ប្រណិត ស្រស់ៗរាល់ថ្ងៃ • មានទទួលកុម្ម៉ង់គ្រប់ម៉ូដ',
      khqrQrImage: '/uploads/products/prod_1789651425146_asp0.jpg',
      khqrMerchantName: 'SUON SOTHEARET',
      khqrBakongId: 'sweet_bakery@aba',
      khqrAccountNumber: '001 234 567',
      khqrBankName: 'ACLEDA Bank',
    };

    if (saved) {
      try {
        return {
          ...defaultInfo,
          ...JSON.parse(saved),
        };
      } catch (e) {
        // fallback
      }
    }
    return defaultInfo;
  });

  const updateStoreInfo = (info: Partial<StoreInfo>) => {
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
      saveFirestoreDoc('settings', 'storeInfo', updated);
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

  // Products with seamless merge for party supplies (newest images/products first)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bakery_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        const partyItems = initialProducts.filter((p) => p.categoryId === 'party');
        const missingPartyItems = partyItems.filter(
          (pi) => !parsed.some((existing) => existing.id === pi.id)
        );
        return sortProductsNewestFirst([...parsed, ...missingPartyItems]);
      } catch (e) {
        return sortProductsNewestFirst(initialProducts);
      }
    }
    return sortProductsNewestFirst(initialProducts);
  });

  // Dynamic Flavors list
  const [flavors, setFlavors] = useState<string[]>(() => {
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

      // 2. Strip heavy base64 images from bakery_products in localStorage cache
      const prodRaw = localStorage.getItem('bakery_products');
      if (prodRaw && prodRaw.length > 600000) {
        try {
          const prods = JSON.parse(prodRaw);
          if (Array.isArray(prods)) {
            const slim = prods.map((p: any) => ({
              ...p,
              images: undefined,
              imageUrl: (p.imageUrl && p.imageUrl.startsWith('data:') && p.imageUrl.length > 30000) ? undefined : p.imageUrl,
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
            images: undefined,
            imageUrl: (p.imageUrl && p.imageUrl.startsWith('data:') && p.imageUrl.length > 30000) ? undefined : p.imageUrl,
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
    const saved = localStorage.getItem('bakery_custom_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('bakery_ingredients');
    return saved ? JSON.parse(saved) : initialIngredients;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('bakery_recipes');
    return saved ? JSON.parse(saved) : initialRecipes;
  });

  // Expenses management
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('bakery_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  // Sales management (including past sales)
  const [sales, setSales] = useState<CompletedSale[]>(() => {
    const saved = localStorage.getItem('bakery_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [activeReceipt, setActiveReceipt] = useState<CompletedSale | null>(null);

  const [currentShift, setCurrentShift] = useState<Shift | null>(() => {
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

  // Initial mount: Hydrate complete dataset from IndexedDB (preserves all high-res photos and full collections)
  const isIdbHydrated = useRef(false);
  useEffect(() => {
    if (isIdbHydrated.current) return;
    isIdbHydrated.current = true;

    const hydrateFromIdb = async () => {
      try {
        const idbProductsStr = await idbGet('bakery_products');
        if (idbProductsStr) {
          try {
            const parsed = JSON.parse(idbProductsStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(sortProductsNewestFirst(parsed));
            }
          } catch (e) {}
        }

        const idbSalesStr = await idbGet('bakery_sales');
        if (idbSalesStr) {
          try {
            const parsed = JSON.parse(idbSalesStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSales(parsed);
            }
          } catch (e) {}
        }

        const idbOrdersStr = await idbGet('bakery_custom_orders');
        if (idbOrdersStr) {
          try {
            const parsed = JSON.parse(idbOrdersStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCustomOrders(parsed);
            }
          } catch (e) {}
        }

        const idbExpensesStr = await idbGet('bakery_expenses');
        if (idbExpensesStr) {
          try {
            const parsed = JSON.parse(idbExpensesStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setExpenses(parsed);
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
      try {
        localStorage.setItem('bakery_sales', JSON.stringify(updated));
      } catch (e) {}
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
  const isUpdatingFromLan = useRef<boolean>(true);
  const lanSyncTimer = useRef<any>(null);
  const deletedSaleIds = useRef<Set<string>>(new Set());
  const deletedExpenseIds = useRef<Set<string>>(new Set());
  const deletedProductIds = useRef<Set<string>>(new Set());

  const saveToLanSync = (payload: any, force: boolean = false) => {
    if (!force && isUpdatingFromLan.current) return;
    try {
      fetch('/api/lan-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) {}
  };

  const applyLanData = (data: any) => {
    if (!data || data.exists === false) return;
    isUpdatingFromLan.current = true;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    if (Array.isArray(data.products) && data.products.length > 0) {
      setProducts((prev) => {
        const prodMap = new Map();
        data.products.forEach((p: any) => {
          if (p && p.id && !deletedProductIds.current.has(p.id)) {
            prodMap.set(p.id, p);
          }
        });
        // Preserve any recent locally added product so it never disappears
        prev.forEach((p: any) => {
          if (p && p.id && !deletedProductIds.current.has(p.id) && !prodMap.has(p.id)) {
            prodMap.set(p.id, p);
            fetch('/api/save-product', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ product: p }),
            }).catch(() => {});
          }
        });
        const merged = sortProductsNewestFirst(Array.from(prodMap.values()));
        try { localStorage.setItem('bakery_products', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    }
    if (Array.isArray(data.sales)) {
      setSales((prev) => {
        const salesMap = new Map();
        data.sales.forEach((s: any) => {
          if (s && s.id && !deletedSaleIds.current.has(s.id)) salesMap.set(s.id, s);
        });
        // Preserve any recent locally created sale (< 5 mins old) so it never disappears!
        prev.forEach((s: any) => {
          if (s && s.id && !deletedSaleIds.current.has(s.id) && !salesMap.has(s.id)) {
            const ageMs = Date.now() - new Date(s.createdAt).getTime();
            if (ageMs < 300000) {
              salesMap.set(s.id, s);
              // Re-post to server to ensure it stays in db
              fetch('/api/save-sale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sale: s }),
              }).catch(() => {});
            }
          }
        });
        const merged = Array.from(salesMap.values()).sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        try { localStorage.setItem('bakery_sales', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    }
    if (Array.isArray(data.customOrders)) {
      setCustomOrders(data.customOrders);
      try { localStorage.setItem('bakery_custom_orders', JSON.stringify(data.customOrders)); } catch (e) {}
    }
    if (Array.isArray(data.expenses)) {
      const filtered = data.expenses
        .filter((e: any) => e && e.id && !deletedExpenseIds.current.has(e.id))
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
        );
      setExpenses(filtered);
      safeSetStorage('bakery_expenses', JSON.stringify(filtered));
    }
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
          (prev.khqrBankName || '') === (data.storeInfo.khqrBankName || '')
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
      setFlavors(data.flavors);
      try { localStorage.setItem('bakery_flavors', JSON.stringify(data.flavors)); } catch (e) {}
    }
    if (data.telegramConfig && data.telegramConfig.botToken) {
      saveStoredTelegramConfig(data.telegramConfig);
    }
    if (data.exchangeRate && Number(data.exchangeRate) > 0) {
      const rate = Number(data.exchangeRate);
      setExchangeRate(rate);
      try { localStorage.setItem('bakery_exchange_rate', String(rate)); } catch (e) {}
    }
    setTimeout(() => {
      isUpdatingFromLan.current = false;
    }, 1500);
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
            telegramConfig: getStoredTelegramConfig(),
          });
        }
      })
      .catch((err) => console.log('LAN sync endpoint inactive', err));

    // 2. Window focus & visibility sync (immediately sync when switching tabs/windows)
    const handleSyncOnFocus = () => {
      fetch('/api/lan-sync')
        .then((res) => res.json())
        .then((data) => applyLanData(data))
        .catch(() => {});
    };
    window.addEventListener('focus', handleSyncOnFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleSyncOnFocus();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 3. Fallback interval sync every 5 seconds to guarantee all devices stay in sync
    const intervalTimer = setInterval(handleSyncOnFocus, 5000);

    // 4. Listen to SSE events for real-time LAN updates
    let sse: EventSource | null = null;
    try {
      sse = new EventSource('/api/lan-events');
      sse.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'SYNC_UPDATE') {
            handleSyncOnFocus();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      window.removeEventListener('focus', handleSyncOnFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(intervalTimer);
      if (sse) sse.close();
    };
  }, []);

  // Broadcast any state updates to LAN server (debounced)
  const isInitialMount = useRef<boolean>(true);
  useEffect(() => {
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
        telegramConfig: getStoredTelegramConfig(),
      });
    }, 600);
  }, [products, sales, customOrders, expenses, storeInfo, flavors]);

  // Firebase Real-time listeners & sync state
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(() => {
    return !!getStoredFirebaseConfig();
  });
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected');

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

    // Subscribe to products
    const unsubProducts = subscribeToFirestoreCollection<Product>('products', (cloudProducts) => {
      if (Array.isArray(cloudProducts)) {
        const filtered = sortProductsNewestFirst(cloudProducts.filter((p) => p && p.id && !deletedProductIds.current.has(p.id)));
        setProducts(filtered);
        safeSetStorage('bakery_products', JSON.stringify(filtered));
      }
    });

    // Subscribe to sales
    const unsubSales = subscribeToFirestoreCollection<CompletedSale>('sales', (cloudSales) => {
      if (Array.isArray(cloudSales)) {
        const filtered = cloudSales
          .filter((s) => s && s.id && !deletedSaleIds.current.has(s.id))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSales(filtered);
        try { localStorage.setItem('bakery_sales', JSON.stringify(filtered)); } catch (e) {}
      }
    });

    // Subscribe to custom orders
    const unsubOrders = subscribeToFirestoreCollection<CustomCakeOrder>('customOrders', (cloudOrders) => {
      if (Array.isArray(cloudOrders)) {
        const sorted = [...cloudOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCustomOrders(sorted);
        try { localStorage.setItem('bakery_custom_orders', JSON.stringify(sorted)); } catch (e) {}
      }
    });

    // Subscribe to expenses
    const unsubExpenses = subscribeToFirestoreCollection<Expense>('expenses', (cloudExpenses) => {
      if (Array.isArray(cloudExpenses)) {
        const sorted = cloudExpenses
          .filter((e) => e && e.id && !deletedExpenseIds.current.has(e.id))
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
          );
        setExpenses(sorted);
        safeSetStorage('bakery_expenses', JSON.stringify(sorted));
      }
    });

    // Subscribe to staff members
    const unsubStaff = subscribeToFirestoreCollection<StaffMember>('staffMembers', (cloudStaff) => {
      if (cloudStaff && cloudStaff.length > 0) {
        const sanitizedCloud = cloudStaff.map((s) => {
          if (s.name?.includes('ម៉ារី') || s.name?.includes('Mary') || s.id === 'staff-1') {
            const clean = {
              ...s,
              name: s.name?.includes('ម៉ារី') || s.name?.includes('Mary') ? 'ម្ចាស់ហាង (Admin)' : s.name,
              nameEn: s.nameEn?.includes('Mary') ? 'Store Owner (Admin)' : s.nameEn,
              avatar: s.avatar === '👩‍🍳' ? '👑' : s.avatar,
            };
            // Automatically update Cloud doc as well
            saveFirestoreDoc('staffMembers', clean.id, clean);
            return clean;
          }
          return s;
        });
        setStaffMembers(sanitizedCloud);
        localStorage.setItem('bakery_staff_members', JSON.stringify(sanitizedCloud));
      }
    });

    // Subscribe to ingredients
    const unsubIngredients = subscribeToFirestoreCollection<Ingredient>('ingredients', (cloudIngredients) => {
      if (Array.isArray(cloudIngredients)) {
        setIngredients(cloudIngredients);
        safeSetStorage('bakery_ingredients', JSON.stringify(cloudIngredients));
      }
    });

    // Subscribe to recipes
    const unsubRecipes = subscribeToFirestoreCollection<Recipe>('recipes', (cloudRecipes) => {
      if (Array.isArray(cloudRecipes)) {
        setRecipes(cloudRecipes);
        safeSetStorage('bakery_recipes', JSON.stringify(cloudRecipes));
      }
    });

    // Subscribe to store info
    const unsubStoreInfo = subscribeToFirestoreDoc<StoreInfo>('settings', 'storeInfo', (cloudStoreInfo) => {
      if (cloudStoreInfo && cloudStoreInfo.nameKh) {
        setStoreInfo((prev) => {
          const merged = { ...prev, ...cloudStoreInfo };
          try { localStorage.setItem('bakery_store_info', JSON.stringify(merged)); } catch (e) {}
          return merged;
        });
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
    };
  }, []);

  // Expenses actions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    fetch('/api/save-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense: newExpense }),
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
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });
    saveFirestoreDoc('expenses', newExpense.id, newExpense);
    notifyTelegramExpense(newExpense, storeInfo, exchangeRate);
  };

  const updateExpense = (id: string, updatedData: Partial<Expense>) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    setExpenses((prev) => {
      const updated = prev.map((exp) => (exp.id === id ? { ...exp, ...updatedData } : exp));
      const target = updated.find((e) => e.id === id);
      if (target) {
        fetch('/api/save-expense', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expense: target }),
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
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });
    saveFirestoreDoc('expenses', id, updatedData);
  };

  const deleteExpense = (id: string) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    deletedExpenseIds.current.add(id);

    // 1. Immediately call atomic server deletion endpoint
    fetch('/api/delete-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
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
        telegramConfig: getStoredTelegramConfig(),
      }, true);
      return updated;
    });

    // 3. Delete from Firebase if configured
    deleteFirestoreDoc('expenses', id);
  };

  const clearAllExpenses = () => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    expenses.forEach((e) => {
      deletedExpenseIds.current.add(e.id);
      deleteFirestoreDoc('expenses', e.id);
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
    const validUsd = priceUsd ?? Number((validKhr / exchangeRate).toFixed(2));
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
      return updated;
    });
    saveFirestoreDoc('settings', 'partyAddons', { items: [...partyAddons, newAddon] });
  };

  const updatePartyAddon = (id: string, nameKh: string, priceKhr: number, priceUsd?: number) => {
    const validKhr = Math.max(0, Number(priceKhr) || 0);
    const validUsd = priceUsd ?? Number((validKhr / exchangeRate).toFixed(2));
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
      return updated;
    });
  };

  const deletePartyAddon = (id: string) => {
    setPartyAddons((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try { localStorage.setItem('bakery_party_addons', JSON.stringify(updated)); } catch (e) {}
      saveToLanSync({ partyAddons: updated });
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

    saveFirestoreDoc('products', newProduct.id, newProduct);
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

    saveFirestoreDoc('products', updatedProd.id, updatedProd);
  };

  const deleteProduct = (productId: string) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    deletedProductIds.current.add(productId);

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

    deleteFirestoreDoc('products', productId);
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
      saveFirestoreDoc('products', productId, updatedTarget);
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
        saveFirestoreDoc('products', p.id, updated);
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
      try { localStorage.setItem('bakery_sales', JSON.stringify(updated)); } catch (e) {}
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
    try { localStorage.setItem('bakery_products', JSON.stringify(updatedProducts)); } catch (e) {}

    saveFirestoreDoc('sales', newSale.id, newSale);
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
    saveFirestoreDoc('sales', newSale.id, newSale);
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
    saveFirestoreDoc('sales', updatedSale.id, updatedSale);
  };

  // Delete Sale
  const deleteSale = (id: string) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    deletedSaleIds.current.add(id);

    // 1. Immediately call atomic server deletion endpoint
    fetch('/api/delete-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});

    // 2. Optimistically update local React state & LocalStorage
    setSales((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('bakery_sales', JSON.stringify(updated));
      } catch (e) {}
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
    deleteFirestoreDoc('sales', id);
  };

  const clearAllSales = () => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);
    sales.forEach((s) => deletedSaleIds.current.add(s.id));

    // 1. Immediately call atomic server clear endpoint
    fetch('/api/clear-all-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});

    sales.forEach((s) => {
      deleteFirestoreDoc('sales', s.id);
    });
    setSales([]);
    try {
      localStorage.setItem('bakery_sales', JSON.stringify([]));
    } catch (e) {}
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
  const addCustomOrder = (orderData: Omit<CustomCakeOrder, 'id' | 'orderNumber' | 'createdAt'>) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomSuffix}`;
    const newOrder: CustomCakeOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };
    setCustomOrders((prev) => [newOrder, ...prev]);
    saveFirestoreDoc('customOrders', newOrder.id, newOrder);
    notifyTelegramCustomOrder(newOrder, storeInfo, exchangeRate);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    let targetOrder: CustomCakeOrder | undefined;
    let oldStatus: OrderStatus | undefined;

    setCustomOrders((prev) => {
      targetOrder = prev.find((o) => o.id === orderId);
      if (!targetOrder) return prev;
      oldStatus = targetOrder.status;
      return prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    });

    if (!targetOrder) return;

    saveFirestoreDoc('customOrders', orderId, { status: newStatus });

    // Transition TO 'DELIVERED': Record sale & revenue
    if (newStatus === 'DELIVERED' && oldStatus !== 'DELIVERED') {
      const order = targetOrder;
      const orderTotalKhr = order.totalKhr ?? Math.round(order.totalUsd * exchangeRate);

      const existingSaleIndex = sales.findIndex(
        (s) =>
          s.id === `sale-custom-${order.id}` ||
          s.orderNumber === order.orderNumber ||
          (order.themeNotes && order.themeNotes.includes(s.orderNumber))
      );

      if (existingSaleIndex >= 0) {
        const existingSale = sales[existingSaleIndex];
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
      } else {
        const newSale: CompletedSale = {
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
          createdAt: new Date().toISOString(),
        };

        setSales((prevSales) => {
          const updatedSales = [newSale, ...prevSales.filter((s) => s.id !== newSale.id)];
          try {
            localStorage.setItem('bakery_sales', JSON.stringify(updatedSales));
          } catch (e) {}
          saveToLanSync(
            {
              products,
              sales: updatedSales,
              customOrders: customOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
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

        saveFirestoreDoc('sales', newSale.id, newSale);
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
        try {
          localStorage.setItem('bakery_sales', JSON.stringify(updatedSales));
        } catch (e) {}
        saveToLanSync(
          {
            products,
            sales: updatedSales,
            customOrders: customOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
            expenses,
            storeInfo,
            flavors,
            telegramConfig: getStoredTelegramConfig(),
          },
          true
        );
        return updatedSales;
      });

      deleteFirestoreDoc('sales', autoSaleId);
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
                totalSalesUsd: Math.max(0, prevShift.totalSalesUsd - targetOrder!.totalUsd),
                totalOrdersCount: Math.max(0, prevShift.totalOrdersCount - 1),
              }
            : prevShift
        );
      }
    }
  };

  const updateCustomOrder = (orderId: string, updates: Partial<CustomCakeOrder>) => {
    setCustomOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
    saveFirestoreDoc('customOrders', orderId, updates);
  };

  const addCustomOrderDeposit = (
    orderId: string,
    additionalDepositKhr: number,
    paymentMethod?: 'CASH_USD' | 'CASH_KHR' | 'KHQR_BAKONG'
  ) => {
    setCustomOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const currentDepKhr = o.depositKhr ?? Math.round(o.depositUsd * exchangeRate);
        const orderTotalKhr = o.totalKhr ?? Math.round(o.totalUsd * exchangeRate);
        const newDepKhr = Math.min(orderTotalKhr, currentDepKhr + additionalDepositKhr);
        const newDepUsd = Number((newDepKhr / exchangeRate).toFixed(2));
        const updated = {
          ...o,
          depositKhr: newDepKhr,
          depositUsd: newDepUsd,
          paymentMethod: paymentMethod || o.paymentMethod,
        };
        saveFirestoreDoc('customOrders', orderId, updated);
        return updated;
      })
    );
  };

  const deleteCustomOrder = (orderId: string) => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    const autoSaleId = `sale-custom-${orderId}`;
    setSales((prevSales) => {
      const updatedSales = prevSales.filter((s) => s.id !== autoSaleId);
      try {
        localStorage.setItem('bakery_sales', JSON.stringify(updatedSales));
      } catch (e) {}
      return updatedSales;
    });
    deleteFirestoreDoc('sales', autoSaleId);
    fetch('/api/delete-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: autoSaleId }),
    }).catch(() => {});

    setCustomOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      try {
        localStorage.setItem('bakery_custom_orders', JSON.stringify(updated));
      } catch (e) {}
      saveToLanSync({
        products,
        sales: sales.filter((s) => s.id !== autoSaleId),
        customOrders: updated,
        expenses,
        storeInfo,
        flavors,
        telegramConfig: getStoredTelegramConfig(),
      });
      return updated;
    });
    deleteFirestoreDoc('customOrders', orderId);
  };

  const clearAllCustomOrders = () => {
    isUpdatingFromLan.current = false;
    if (lanSyncTimer.current) clearTimeout(lanSyncTimer.current);

    // Clean up any custom sales created for these orders
    setSales((prevSales) => {
      const updatedSales = prevSales.filter((s) => !s.id.startsWith('sale-custom-'));
      try {
        localStorage.setItem('bakery_sales', JSON.stringify(updatedSales));
      } catch (e) {}
      return updatedSales;
    });

    customOrders.forEach((o) => {
      deleteFirestoreDoc('customOrders', o.id);
      deleteFirestoreDoc('sales', `sale-custom-${o.id}`);
    });
    setCustomOrders([]);
    try {
      localStorage.setItem('bakery_custom_orders', JSON.stringify([]));
    } catch (e) {}
    saveToLanSync({
      products,
      sales: sales.filter((s) => !s.id.startsWith('sale-custom-')),
      customOrders: [],
      expenses,
      storeInfo,
      flavors,
      telegramConfig: getStoredTelegramConfig(),
    });
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
        `"${new Date(s.createdAt).toLocaleString('km-KH')}"`,
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
      'កាលបរិច្ឆេទ',
      'ចំណងជើងចំណាយ',
      'ប្រភេទ',
      'ចំនួន (USD)',
      'ចំនួន (KHR)',
      'អ្នកចំណាយ',
      'កំណត់ចំណាំ',
    ];
    const rows = expenses.map((e) => [
      `"${new Date(e.createdAt).toLocaleDateString('km-KH')}"`,
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

  return (
    <BakeryContext.Provider
      value={{
        lang,
        setLang,
        exchangeRate,
        setExchangeRate,
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
        totalExpensesUsd,
        totalExpensesKhr,
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
