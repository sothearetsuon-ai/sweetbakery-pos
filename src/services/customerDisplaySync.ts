import { CartItem } from '../types';
import {
  saveFirestoreDoc,
  subscribeToFirestoreDoc,
  getStoreId,
  setStoreId,
  subscribeToStoreIdChange,
} from './firebase';

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
const FIRESTORE_COLLECTION = 'customer_display';
const FIRESTORE_DOC_ID = 'live';

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
  private cloudUnsub: (() => void) | null = null;
  private cloudDebounceTimer: any = null;
  private isPushingToCloud = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // 1. Detect storeId in URL params if opened via QR or direct link (?storeId=...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStoreId = urlParams.get('storeId');
      if (urlStoreId && urlStoreId.trim()) {
        setStoreId(urlStoreId.trim());
      }
    } catch (_) {}

    // 2. Load persisted state from local storage for instant offline warm start
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.lastUpdated) {
          this.currentState = parsed;
        }
      }
    } catch (e) {}

    // 3. Init Local BroadcastChannel for 0ms same-origin tab/window sync
    try {
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            const incoming = event.data as CustomerDisplayState;
            if (incoming.lastUpdated >= this.currentState.lastUpdated) {
              this.currentState = incoming;
              this.notify();
            }
          }
        };
      }
    } catch (e) {
      console.warn('[CustomerDisplaySync] BroadcastChannel not supported:', e);
    }

    // 4. Also listen to storage events across tabs/windows on same origin
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.lastUpdated >= this.currentState.lastUpdated) {
            this.currentState = parsed;
            this.notify();
          }
        } catch (err) {}
      }
    });

    // 5. Connect to Firestore Cloud Real-time Listener (cross-device sync)
    this.setupCloudSync();

    // 6. Reconnect cloud sync whenever storeId changes
    try {
      subscribeToStoreIdChange(() => {
        this.setupCloudSync();
      });
    } catch (_) {}
  }

  /**
   * Subscribes to real-time Firestore document updates for cross-device synchronization
   * Works across separate phones, tablets, iPads, and PCs anywhere in the world!
   */
  public setupCloudSync() {
    if (this.cloudUnsub) {
      this.cloudUnsub();
      this.cloudUnsub = null;
    }

    try {
      this.cloudUnsub = subscribeToFirestoreDoc<CustomerDisplayState>(
        FIRESTORE_COLLECTION,
        FIRESTORE_DOC_ID,
        (remoteState) => {
          if (!remoteState || !remoteState.lastUpdated) return;

          // Don't overwrite if we are currently broadcasting a newer local state
          if (remoteState.lastUpdated > this.currentState.lastUpdated) {
            this.currentState = {
              ...remoteState,
              items: Array.isArray(remoteState.items) ? remoteState.items : [],
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentState));
            } catch (_) {}
            this.notify();
          }
        },
        (error) => {
          console.warn('[CustomerDisplaySync] Cloud listener warning:', error);
        }
      );
    } catch (err) {
      console.warn('[CustomerDisplaySync] Failed to setup cloud listener:', err);
    }
  }

  private broadcast(state: CustomerDisplayState) {
    this.currentState = state;

    // A. Save to local storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}

    // B. Post to BroadcastChannel (0ms latency for same machine)
    if (this.channel) {
      try {
        this.channel.postMessage(state);
      } catch (e) {}
    }

    // C. Notify in-app local listeners
    this.notify();

    // D. Debounced Push to Firestore Cloud (cross-device real-time sync)
    if (this.cloudDebounceTimer) {
      clearTimeout(this.cloudDebounceTimer);
    }

    this.cloudDebounceTimer = setTimeout(async () => {
      try {
        this.isPushingToCloud = true;
        // Clean and serialize state for Firestore (strip any undefined values)
        const cleanItems = (state.items || []).map((it) => ({
          id: String(it.id || ''),
          nameKh: String(it.nameKh || ''),
          nameEn: String(it.nameEn || ''),
          quantity: Number(it.quantity) || 1,
          unitPriceKhr: Number(it.unitPriceKhr) || 0,
          totalKhr: Number(it.totalKhr) || 0,
          unitPriceUsd: Number(it.unitPriceUsd) || 0,
          totalUsd: Number(it.totalUsd) || 0,
          imageUrl: String(it.imageUrl || ''),
          unit: String(it.unit || 'ដុំ'),
        }));

        const cloudPayload: any = {
          status: state.status,
          items: cleanItems,
          subtotalKhr: Number(state.subtotalKhr) || 0,
          subtotalUsd: Number(state.subtotalUsd) || 0,
          discountKhr: Number(state.discountKhr) || 0,
          totalKhr: Number(state.totalKhr) || 0,
          totalUsd: Number(state.totalUsd) || 0,
          cashierName: String(state.cashierName || ''),
          khqrDataUrl: String(state.khqrDataUrl || ''),
          isDeposit: Boolean(state.isDeposit),
          depositKhr: Number(state.depositKhr) || 0,
          paidAmount: Number(state.paidAmount) || 0,
          paidCurrency: state.paidCurrency || 'KHR',
          paidBankName: String(state.paidBankName || ''),
          lastUpdated: state.lastUpdated,
        };

        await saveFirestoreDoc(FIRESTORE_COLLECTION, FIRESTORE_DOC_ID, cloudPayload);
      } catch (err) {
        console.warn('[CustomerDisplaySync] Cloud sync push error:', err);
      } finally {
        this.isPushingToCloud = false;
      }
    }, 60);
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentState);
      } catch (e) {
        console.error('[CustomerDisplaySync] Listener error:', e);
      }
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

    const rate = Number(exchangeRate) || 4100;
    const items: CustomerDisplayItem[] = cart.map((item) => {
      const p = item?.product || ({} as any);
      const priceKhr =
        typeof p.priceKhr === 'number'
          ? p.priceKhr
          : Math.round((Number(p.priceUsd) || 0) * rate);
      const priceUsd = Number((priceKhr / rate).toFixed(2));
      const qty = Number(item.quantity) || 1;

      return {
        id: String(p.id || `item_${Date.now()}`),
        nameKh: String(p.nameKh || p.nameEn || 'នំខេក'),
        nameEn: String(p.nameEn || p.nameKh || 'Cake'),
        quantity: qty,
        unitPriceKhr: priceKhr,
        totalKhr: priceKhr * qty,
        unitPriceUsd: priceUsd,
        totalUsd: Number((priceUsd * qty).toFixed(2)),
        imageUrl: String(p.imageUrl || (p.images && p.images[0]) || ''),
        unit: String(p.unit || 'ដុំ'),
      };
    });

    const subtotalKhr = items.reduce((acc, it) => acc + it.totalKhr, 0);
    const subtotalUsd = Number(items.reduce((acc, it) => acc + it.totalUsd, 0).toFixed(2));
    const totalKhr = Math.max(0, subtotalKhr - (Number(discountKhr) || 0));
    const totalUsd = Number((totalKhr / rate).toFixed(2));

    this.broadcast({
      status: 'cart',
      items,
      subtotalKhr,
      subtotalUsd,
      discountKhr: Number(discountKhr) || 0,
      totalKhr,
      totalUsd,
      cashierName: cashierName || '',
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
      totalKhr: Number(data.totalKhr) || 0,
      totalUsd: Number(data.totalUsd) || 0,
      khqrDataUrl: data.khqrDataUrl || '',
      isDeposit: Boolean(data.isDeposit),
      depositKhr: Number(data.depositKhr) || 0,
      lastUpdated: Date.now(),
    });
  }

  public paymentSuccess(amount: number, currency: 'KHR' | 'USD' = 'KHR', bankName = 'Bakong KHQR') {
    this.broadcast({
      ...this.currentState,
      status: 'paid',
      paidAmount: Number(amount) || 0,
      paidCurrency: currency,
      paidBankName: bankName || 'Bakong KHQR',
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
