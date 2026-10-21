/**
 * Customer Display & Showcase Ultra-Fast Real-Time Synchronization Service
 * 
 * Provides instant (< 5ms) cross-window, cross-tab, and dual-screen synchronization
 * between POS Cashier terminal and Customer Showcase / Customer Order Portal.
 * Uses BroadcastChannel, window CustomEvents, and Storage events.
 */

import { PartyAddon, Product, StoreInfo } from '../types';

export type CustomerSyncType =
  | 'PRODUCTS_SYNC'
  | 'PARTY_ADDONS_SYNC'
  | 'STORE_INFO_SYNC'
  | 'DELETED_RECORDS_SYNC'
  | 'PURGE_DELETED_ITEM'
  | 'STORE_TENANT_SYNC';

export interface CustomerSyncPayload {
  type: CustomerSyncType;
  storeId?: string;
  products?: Product[];
  partyAddons?: PartyAddon[];
  storeInfo?: StoreInfo;
  deletedIds?: string[];
  deletedItem?: { type: 'product' | 'party_addon' | 'order' | 'sale'; id: string; nameKh?: string };
  timestamp: number;
}

const CHANNEL_NAME = 'sweetbakery_customer_display_channel';
const PING_STORAGE_KEY = 'bakery_customer_sync_ping';
const DOM_EVENT_NAME = 'sweetbakery_customer_sync_event';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported in this environment', e);
  }
}

/**
 * Broadcast an instant update from POS terminal to Customer Display / Showcase
 */
export const broadcastCustomerSync = (payload: Omit<CustomerSyncPayload, 'timestamp'>): void => {
  if (typeof window === 'undefined') return;

  const fullPayload: CustomerSyncPayload = {
    ...payload,
    timestamp: Date.now(),
  };

  // 1. BroadcastChannel (Ultra-fast cross-tab/cross-window on same origin)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(fullPayload);
    } catch (e) {
      console.warn('Error posting to BroadcastChannel:', e);
    }
  }

  // 2. Local DOM CustomEvent (for same window / embedded customer view)
  try {
    window.dispatchEvent(new CustomEvent(DOM_EVENT_NAME, { detail: fullPayload }));
  } catch (e) {}

  // 3. Storage event ping (fires across other tabs/windows even without BroadcastChannel)
  try {
    localStorage.setItem(
      PING_STORAGE_KEY,
      JSON.stringify({ type: fullPayload.type, timestamp: fullPayload.timestamp })
    );
  } catch (e) {}
};

/**
 * Subscribe to instant updates on Customer Showcase / Customer Order Portal
 */
export const subscribeCustomerSync = (
  handler: (payload: CustomerSyncPayload) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  // Handler for BroadcastChannel
  const handleBcMessage = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      handler(e.data as CustomerSyncPayload);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBcMessage);
  }

  // Handler for Local DOM CustomEvent
  const handleDomEvent = (e: any) => {
    if (e.detail && e.detail.type) {
      handler(e.detail as CustomerSyncPayload);
    }
  };
  window.addEventListener(DOM_EVENT_NAME, handleDomEvent);

  // Handler for storage ping fallback
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === PING_STORAGE_KEY && e.newValue) {
      try {
        const ping = JSON.parse(e.newValue);
        if (ping && ping.type) {
          handler({ type: ping.type, timestamp: ping.timestamp || Date.now() });
        }
      } catch (err) {}
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBcMessage);
    }
    window.removeEventListener(DOM_EVENT_NAME, handleDomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};
