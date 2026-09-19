export type Language = 'km' | 'en';

export interface StoreInfo {
  nameKh: string;
  nameEn: string;
  logoUrl?: string;
  phone: string;
  address: string;
  tagline?: string;
  khqrQrImage?: string;
  khqrMerchantName?: string;
  khqrBakongId?: string;
  khqrAccountNumber?: string;
  khqrBankName?: string;
}

export interface Category {
  id: string;
  nameKh: string;
  nameEn: string;
  icon: string;
}

export interface Product {
  id: string;
  nameKh: string;
  nameEn: string;
  categoryId: string;
  priceUsd: number;
  priceKhr?: number;
  costPriceUsd: number;
  costPriceKhr?: number;
  imageUrl: string;
  images?: string[];
  stockQty: number;
  unit: string;
  isCustom?: boolean;
  description?: string;
  recipeId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedFlavor?: string;
  note?: string;
}

export type OrderStatus = 'PENDING' | 'BAKING' | 'DECORATING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface CustomCakeOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:mm
  cakeName: string;
  size: string;
  flavor: string;
  filling?: string;
  inscription: string;
  themeNotes?: string;
  referenceImage?: string;
  status: OrderStatus;
  totalUsd: number;
  totalKhr?: number;
  depositUsd: number;
  depositKhr?: number;
  paymentMethod: 'CASH_USD' | 'CASH_KHR' | 'KHQR_BAKONG';
  createdAt: string;
}

export interface PartyAddon {
  id: string;
  nameKh: string;
  nameEn?: string;
  priceUsd: number;
  priceKhr?: number;
}

export interface Ingredient {
  id: string;
  nameKh: string;
  nameEn: string;
  currentStock: number;
  unit: string; // 'kg', 'g', 'ml', 'pcs', 'box'
  minAlertStock: number;
  costPerUnitUsd: number;
  supplier?: string;
}

export interface RecipeItem {
  ingredientId?: string;
  nameKh: string;
  nameEn?: string;
  quantity: number; // e.g., 250
  unit: string; // 'g', 'kg', 'ml', 'L', 'pcs', 'box'
  costPerUnitUsd?: number;
  itemCostUsd: number;
  itemCostKhr?: number;
}

export interface Recipe {
  id: string;
  productId?: string;
  cakeNameKh: string;
  cakeNameEn?: string;
  yieldQty: number; // e.g. 1
  yieldUnit: string; // 'នំ', 'ដុំ', 'ប្រអប់', 'pcs'
  items: RecipeItem[];
  packagingCostUsd?: number;
  packagingCostKhr?: number;
  laborCostUsd?: number;
  laborCostKhr?: number;
  overheadCostUsd?: number;
  overheadCostKhr?: number;
  totalCostUsd: number;
  totalCostKhr: number;
  costPerUnitUsd: number;
  costPerUnitKhr: number;
  sellingPriceUsd?: number;
  sellingPriceKhr?: number;
  profitMarginPercent?: number;
  instructions?: string;
  updatedAt?: string;
}

export interface CompletedSale {
  id: string;
  orderNumber: string;
  items: {
    productId: string;
    nameKh: string;
    nameEn: string;
    quantity: number;
    priceUsd: number;
    priceKhr?: number;
    image?: string;
  }[];
  subtotalUsd: number;
  discountUsd: number;
  totalUsd: number;
  totalKhr: number;
  paymentMethod: 'CASH_USD' | 'CASH_KHR' | 'KHQR_BAKONG' | 'SPLIT';
  paidUsd?: number;
  paidKhr?: number;
  changeUsd?: number;
  changeKhr?: number;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  isDeposit?: boolean;
  depositKhr?: number;
  depositUsd?: number;
  remainingKhr?: number;
  remainingUsd?: number;
  pickupDate?: string;
  pickupTime?: string;
  notes?: string;
  createdAt: string;
}

export interface Shift {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingCashUsd: number;
  openingCashKhr: number;
  closingCashUsd?: number;
  closingCashKhr?: number;
  totalSalesUsd: number;
  totalOrdersCount: number;
  status: 'OPEN' | 'CLOSED';
}

export type ExpenseCategory =
  | 'INGREDIENTS'
  | 'PACKAGING'
  | 'UTILITIES'
  | 'SALARY'
  | 'RENT'
  | 'MAINTENANCE'
  | 'MARKETING'
  | 'OTHER';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  quantity?: number;       // ចំនួន (e.g. 5, 10, 2.5)
  unit?: string;           // ខ្នាត (e.g. គីឡូ, ប្រអប់, ដប, កញ្ចប់, បាវ, ដុំ)
  unitPriceKhr?: number;   // តម្លៃរាយ (៛ KHR)
  unitPriceUsd?: number;   // តម្លៃរាយ ($ USD)
  amountUsd: number;       // សរុប ($ USD)
  amountKhr: number;       // សរុប (៛ KHR)
  paidBy: string;
  paymentMethod: 'CASH_USD' | 'CASH_KHR' | 'BANK_TRANSFER';
  receiptImage?: string;
  notes?: string;
  date: string;
  createdAt: string;
}

export type StaffRole = 'ADMIN' | 'CASHIER' | 'BAKER' | 'INVENTORY';

export interface StaffPermissions {
  canAccessPos: boolean;
  canAccessShowcase: boolean;
  canAccessCustomOrders: boolean;
  canAccessSalesHistory: boolean;
  canEditSales: boolean;
  canAccessExpenses: boolean;
  canAccessInventory: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  nameEn: string;
  role: StaffRole;
  pinCode: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  permissions: StaffPermissions;
}

export type MusicLoopMode = 'all' | 'one' | 'none';

export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration?: number;
  isCustom: boolean;
  category?: 'cafe' | 'birthday' | 'custom' | 'acoustic';
  dateAdded?: string;
  storagePath?: string;
  isCloudSynced?: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  remindExpenses: boolean;
  expenseReminderTime1: string; // "12:00"
  expenseReminderTime2: string; // "18:00"
  expenseReminderTime3: string; // "20:30"
  remindCakePickup: boolean;
  cakePickupAdvanceMins: number; // 60
  remindLowStock: boolean;
  soundEnabled: boolean;
}

export interface BakeryBackupData {
  version: string;
  backupDate: string;
  storeInfo: StoreInfo;
  exchangeRate: number;
  products: Product[];
  categories: Category[];
  flavors: string[];
  customOrders: CustomCakeOrder[];
  ingredients: Ingredient[];
  expenses: Expense[];
  sales: CompletedSale[];
  staffMembers: StaffMember[];
  currentShift: Shift | null;
  recipes?: Recipe[];
  partyAddons?: PartyAddon[];
}
