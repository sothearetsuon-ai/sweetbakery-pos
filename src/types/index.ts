export type Language = 'km' | 'en';

export interface StoreInfo {
  nameKh: string;
  nameEn: string;
  logoUrl?: string;
  phone: string;
  address: string;
  mapsUrl?: string;
  tagline?: string;
  storeId?: string;
  khqrQrImage?: string;
  khqrMerchantName?: string;
  khqrBakongId?: string;
  khqrAccountNumber?: string;
  khqrBankName?: string;
  realStorePin?: string;
  requireRealStorePin?: boolean;
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
  barcode?: string;
  recipeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedFlavor?: string;
  note?: string;
}

export type OrderStatus = 'PENDING' | 'BAKING' | 'DECORATING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface BreadOrderItem {
  nameKh: string;
  nameEn?: string;
  quantity: number;
  unit: string; // 'ដើម', 'ដុំ', 'ថង់', 'ឡូ', 'ប្រអប់'
  pricePerUnitKhr: number;
  pricePerUnitUsd: number;
  totalKhr: number;
  totalUsd: number;
}

export interface CustomCakeOrder {
  id: string;
  orderNumber: string;
  orderType?: 'CAKE' | 'BREAD'; // 'CAKE' = នំខួបកំណើត, 'BREAD' = នំបុ័ង & នំដុត
  customerName: string;
  phone: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:mm
  cakeName: string; // Cake Name OR Bread Order Summary
  size: string;
  flavor: string;
  filling?: string;
  inscription: string;
  themeNotes?: string;
  referenceImage?: string;
  breadItems?: BreadOrderItem[];
  packagingOption?: string; // 'ទាំងមូល (Whole)', 'ហាន់ជាបន្ទះ (Sliced)', 'ច្រកថង់មួយៗ (Individual)'
  status: OrderStatus;
  totalUsd: number;
  totalKhr?: number;
  depositUsd: number;
  depositKhr?: number;
  paymentMethod: 'CASH_USD' | 'CASH_KHR' | 'KHQR_BAKONG';
  bankSlipImage?: string;
  orderSource?: 'CUSTOMER_ONLINE' | 'POS_STAFF';
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
  totalUsed?: number;
  unit: string; // 'kg', 'g', 'ml', 'pcs', 'box'
  minAlertStock: number;
  costPerUnitUsd: number;
  costPerUnitKhr?: number;
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

export type ExpenseType = 'INGREDIENT' | 'SUPPLY' | 'GENERAL';

export type ExpenseCategory =
  | 'INGREDIENTS'
  | 'PACKAGING'
  | 'SUPPLIES'
  | 'UTILITIES'
  | 'SALARY'
  | 'RENT'
  | 'MAINTENANCE'
  | 'MARKETING'
  | 'TRANSPORTATION'
  | 'OTHER';

export interface Expense {
  id: string;
  itemCode?: string;         // លេខកូដទំនិញ / Barcode / Code (e.g. P0006568, P0004874)
  title: string;
  expenseType?: ExpenseType; // 'INGREDIENT' (ចំណាយគ្រឿងផ្សំ), 'SUPPLY' (ទិញសម្ភារៈ), 'GENERAL' (ចំណាយទូទៅ)
  category: ExpenseCategory;
  ingredientId?: string;     // ភ្ជាប់ទៅគ្រឿងផ្សំក្នុងស្តុក inventory (បើមាន)
  supplier?: string;         // ហាង ឬអ្នកផ្គត់ផ្គង់
  quantity?: number;       // ចំនួន (e.g. 5, 10, 2.5)
  unit?: string;           // ខ្នាត (e.g. គីឡូ, ប្រអប់, ដប, កញ្ចប់, បាវ, ដុំ)
  unitPriceKhr?: number;   // តម្លៃរាយ (៛ KHR)
  unitPriceUsd?: number;   // តម្លៃរាយ ($ USD)
  amountUsd: number;       // សរុប ($ USD)
  amountKhr: number;       // សរុប (៛ KHR)
  paidBy: string;
  paymentMethod: 'CASH_USD' | 'CASH_KHR' | 'BANK_TRANSFER' | 'RESERVE_FUND';
  paymentStatus?: 'PAID' | 'UNPAID'; // 'PAID' (បង់រួច) ឬ 'UNPAID' (មិនទាន់បង់/ជំពាក់)
  dueDate?: string;                 // កាលបរិច្ឆេទផុតកំណត់បង់ប្រាក់ (YYYY-MM-DD)
  remindBeforeDays?: number;        // រំលឹកមុនប៉ុន្មានថ្ងៃ (0 = ចំថ្ងៃ, 1 = មុន ១ ថ្ងៃ, 2, 3...)
  paidAt?: string;                  // កាលបរិច្ឆេទដែលបានទូទាត់រួច
  lastDueAlertDate?: string;        // កាលបរិច្ឆេទចុងក្រោយដែលបានជូនដំណឹង (YYYY-MM-DD) ដើម្បីកុំឱ្យផ្ញើលើសពី ១ ដងក្នុងមួយថ្ងៃ
  receiptImage?: string;
  notes?: string;
  // Wholesale to Retail Auto-Calculation (ទិញដុំ & គណនាតម្លៃលក់រាយ)
  wholesalePackQty?: number;          // ចំនួនរាយក្នុង ១ ដុំធំ/កេស (e.g. 24, 12, 50)
  wholesalePackUnit?: string;         // ខ្នាតដុំធំ (e.g. 'កេស', 'ឡូ', 'បាវ', 'ប្រអប់ធំ')
  retailUnit?: string;                // ខ្នាតរាយ (e.g. 'ដុំ', 'កំប៉ុង', 'គីឡូ', 'កញ្ចប់')
  retailUnitCostKhr?: number;         // ថ្លៃដើមរាយក្នុង ១ ឯកតា (៛ KHR)
  retailProfitMarginPct?: number;     // ភាគរយចំណេញដែលចង់បាន (e.g. 30%, 50%)
  retailSellingPriceKhr?: number;     // តម្លៃលក់រាយណែនាំ (៛ KHR)
  retailSellingPriceUsd?: number;     // តម្លៃលក់រាយណែនាំ ($ USD)
  date: string;
  createdAt: string;
}

export interface ReserveFundTransaction {
  id: string;
  type: 'WITHDRAW' | 'REPLENISH' | 'ADJUST_TARGET' | 'ADJUST_BALANCE' | 'INITIAL_SET';
  amountKhr: number;
  amountUsd: number;
  reason: string;
  source?: string; // e.g. 'ពីប្រាក់ចំណូលលក់', 'ម្ចាស់ហាងបញ្ចូលបង្គ្រប់', 'ដកទិញទំនិញ/គ្រឿងផ្សំ'
  expenseId?: string;
  performedBy: string;
  date: string;
  createdAt: string;
}

export interface ReserveFund {
  targetAmountKhr: number;
  targetAmountUsd: number;
  currentBalanceKhr: number;
  currentBalanceUsd: number;
  history: ReserveFundTransaction[];
  updatedAt: string;
  isInitialDefault?: boolean;
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
  remindExpenseDueDate?: boolean; // ដាស់តឿនកាលបរិច្ឆេទផុតកំណត់បង់ប្រាក់ចំណាយទូទៅ
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

export interface DemoDeviceVisitor {
  id: string; // Device ID, e.g. 'DEV-8B2A-4F91'
  deviceId: string;
  deviceType: 'MOBILE' | 'TABLET' | 'DESKTOP';
  deviceModel: string;
  browser: string;
  os: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  screenResolution?: string;
  language?: string;
  userAgent?: string;
}

export interface DemoDevicesSummary {
  totalUniqueDevices: number;
  totalVisits: number;
  mobileCount: number;
  desktopCount: number;
  tabletCount: number;
  lastUpdated: string;
}
