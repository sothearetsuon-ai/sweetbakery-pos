import { CartItem } from '../types';

export interface CustomerDisplayItem {
  id: string;
  nameKh: string;
  nameEn: string;
  quantity: number;
  unitPriceKhr: number;
  totalKhr: number;
  unitPriceUsd: number;
  totalUsd: number;
  imageUrl?: string;
  unit?: string;
}

export interface CustomerDisplayState {
  status: 'idle' | 'cart' | 'checkout' | 'paid';
  items: CustomerDisplayItem[];
  subtotalKhr: number;
  subtotalUsd: number;
  discountKhr: number;
  totalKhr: number;
  totalUsd: number;
  cashierName?: string;
  khqrDataUrl?: string;
  isDeposit?: boolean;
  depositKhr?: number;
  paidAmount?: number;
  paidCurrency?: 'KHR' | 'USD';
  paidBankName?: string;
  lastUpdated: number;
}

const STORAGE_KEY = 'sweetbakery_customer_display_state';
const CHANNEL_NAME = 'sweetbakery_customer_display_channel';

const defaultState: CustomerDisplayState = {
  status: 'idle',
  items: [],
  subtotalKhr: 0,
  subtotalUsd: 0,
  discountKhr: 0,
  totalKhr: 0,
  totalUsd: 0,
  lastUpdated: Date.now(),
};

class CustomerDisplaySyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(state: CustomerDisplayState) => void> = new Set();
  private currentState: CustomerDisplayState = defaultState;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Load persisted state from storage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.currentState = JSON.parse(saved);
      }
    } catch (e) {}

    // Init BroadcastChannel
    try {
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data) {
            this.currentState = event.data;
            this.notify();
          }
        };
      }
    } catch (e) {
      console.warn('[CustomerDisplaySync] BroadcastChannel not supported:', e);
    }

    // Also listen to storage events across tabs/windows
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          this.currentState = JSON.parse(e.newValue);
          this.notify();
        } catch (err) {}
      }
    });
  }

  private broadcast(state: CustomerDisplayState) {
    this.currentState = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}

    if (this.channel) {
      try {
        this.channel.postMessage(state);
      } catch (e) {}
    }
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentState);
    }
  }

  public subscribe(listener: (state: CustomerDisplayState) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getCurrentState(): CustomerDisplayState {
    return this.currentState;
  }

  public updateCart(
    cart: CartItem[],
    exchangeRate = 4100,
    cashierName?: string,
    discountKhr = 0
  ) {
    if (!cart || cart.length === 0) {
      this.resetIdle();
      return;
    }

    const items: CustomerDisplayItem[] = cart.map((item) => {
      const priceKhr = item.product.priceKhr ?? Math.round(item.product.priceUsd * exchangeRate);
      const priceUsd = Number((priceKhr / exchangeRate).toFixed(2));
      return {
        id: item.product.id,
        nameKh: item.product.nameKh,
        nameEn: item.product.nameEn,
        quantity: item.quantity,
        unitPriceKhr: priceKhr,
        totalKhr: priceKhr * item.quantity,
        unitPriceUsd: priceUsd,
        totalUsd: Number((priceUsd * item.quantity).toFixed(2)),
        imageUrl: item.product.imageUrl || (item.product.images && item.product.images[0]) || '',
        unit: item.product.unit || 'ដុំ',
      };
    });

    const subtotalKhr = items.reduce((acc, it) => acc + it.totalKhr, 0);
    const subtotalUsd = items.reduce((acc, it) => acc + it.totalUsd, 0);
    const totalKhr = Math.max(0, subtotalKhr - discountKhr);
    const totalUsd = Number((totalKhr / exchangeRate).toFixed(2));

    this.broadcast({
      status: 'cart',
      items,
      subtotalKhr,
      subtotalUsd,
      discountKhr,
      totalKhr,
      totalUsd,
      cashierName,
      lastUpdated: Date.now(),
    });
  }

  public startCheckout(data: {
    totalKhr: number;
    totalUsd: number;
    khqrDataUrl?: string;
    isDeposit?: boolean;
    depositKhr?: number;
  }) {
    this.broadcast({
      ...this.currentState,
      status: 'checkout',
      totalKhr: data.totalKhr,
      totalUsd: data.totalUsd,
      khqrDataUrl: data.khqrDataUrl,
      isDeposit: data.isDeposit,
      depositKhr: data.depositKhr,
      lastUpdated: Date.now(),
    });
  }

  public paymentSuccess(amount: number, currency: 'KHR' | 'USD' = 'KHR', bankName = 'Bakong KHQR') {
    this.broadcast({
      ...this.currentState,
      status: 'paid',
      paidAmount: amount,
      paidCurrency: currency,
      paidBankName: bankName,
      lastUpdated: Date.now(),
    });

    // Auto-reset to idle after 8 seconds
    setTimeout(() => {
      if (this.currentState.status === 'paid') {
        this.resetIdle();
      }
    }, 8000);
  }

  public resetIdle() {
    this.broadcast({
      ...defaultState,
      status: 'idle',
      lastUpdated: Date.now(),
    });
  }
}

export const customerDisplaySync = new CustomerDisplaySyncManager();
