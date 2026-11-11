import { CompletedSale, StoreInfo } from '../types';
import { roundKhr } from './currencyUtils';

export interface CompactReceiptPayload {
  inv: string;
  dt: number | string;
  cust?: string;
  phone?: string;
  cashier: string;
  pay: string;
  items: {
    n: string;
    q: number;
    u: number;
    usd: number;
    t: number;
  }[];
  totKhr: number;
  totUsd: number;
  isDep?: boolean;
  depKhr?: number;
  depUsd?: number;
  remKhr?: number;
  remUsd?: number;
  pickDate?: string;
  pickTime?: string;
  paidKhr?: number;
  paidUsd?: number;
  changeKhr?: number;
  changeUsd?: number;
  store: {
    nameKh: string;
    nameEn: string;
    addr: string;
    phone: string;
    logo?: string;
    tagline?: string;
    khqrImage?: string;
    khqrMerchant?: string;
    khqrBakongId?: string;
  };
}

export function encodeReceiptData(sale: CompletedSale, storeInfo: StoreInfo, exchangeRate = 4000): string {
  try {
    // Only keep clean URL paths, NEVER include large base64 data URLs in URL query params
    const safeLogo = storeInfo.logoUrl && !storeInfo.logoUrl.startsWith('data:') ? storeInfo.logoUrl : undefined;
    const safeKhqr = storeInfo.khqrQrImage && !storeInfo.khqrQrImage.startsWith('data:') ? storeInfo.khqrQrImage : undefined;

    const payload: CompactReceiptPayload = {
      inv: sale.orderNumber,
      dt: typeof sale.createdAt === 'string' ? new Date(sale.createdAt).getTime() : (sale.createdAt || Date.now()),
      cust: sale.customerName || undefined,
      phone: sale.customerPhone || undefined,
      cashier: sale.cashierName || 'Staff',
      pay: sale.paymentMethod || 'CASH_KHR',
      items: (sale.items || []).map((item) => {
        const unitKhr = item.priceKhr !== undefined ? roundKhr(item.priceKhr) : roundKhr(item.priceUsd * exchangeRate);
        const totalKhr = roundKhr(unitKhr * item.quantity);
        return {
          n: item.nameKh || item.nameEn || 'Item',
          q: item.quantity,
          u: unitKhr,
          usd: item.priceUsd,
          t: totalKhr,
        };
      }),
      totKhr: roundKhr(sale.totalKhr),
      totUsd: sale.totalUsd,
      isDep: sale.isDeposit,
      depKhr: sale.depositKhr,
      depUsd: sale.depositUsd,
      remKhr: sale.remainingKhr,
      remUsd: sale.remainingUsd,
      pickDate: sale.pickupDate,
      pickTime: sale.pickupTime,
      paidKhr: sale.paidKhr,
      paidUsd: sale.paidUsd,
      changeKhr: sale.changeKhr,
      changeUsd: sale.changeUsd,
      store: {
        nameKh: storeInfo.nameKh || 'ហាងនំខេក ស្វីតបេកខឺរី',
        nameEn: storeInfo.nameEn || 'SWEET BAKERY & CAFE',
        addr: storeInfo.address || '',
        phone: storeInfo.phone || '',
        logo: safeLogo,
        tagline: storeInfo.tagline || undefined,
        khqrImage: safeKhqr,
        khqrMerchant: storeInfo.khqrMerchantName || undefined,
        khqrBakongId: storeInfo.khqrBakongId || undefined,
      },
    };

    const json = JSON.stringify(payload);
    const utf8Bytes = encodeURIComponent(json);
    const b64 = btoa(unescape(utf8Bytes));
    return encodeURIComponent(b64);
  } catch (err) {
    console.error('Failed to encode receipt data:', err);
    return '';
  }
}

export function decodeReceiptData(encodedStr: string): CompactReceiptPayload | null {
  try {
    const b64 = decodeURIComponent(encodedStr);
    const utf8Bytes = atob(b64);
    const json = decodeURIComponent(escape(utf8Bytes));
    return JSON.parse(json) as CompactReceiptPayload;
  } catch (err) {
    console.error('Failed to decode receipt data:', err);
    return null;
  }
}

/**
 * Returns the full public web URL for the customer to open the E-Receipt on their smartphone.
 */
export function getEReceiptWebUrl(sale: CompletedSale, storeInfo: StoreInfo, exchangeRate = 4000): string {
  const encoded = encodeReceiptData(sale, storeInfo, exchangeRate);
  
  // Default to public hosted domain so mobile QR scanning connects over internet
  let baseUrl = 'https://sothearetsuon-ai.github.io/sweetbakery-pos/';

  if (typeof window !== 'undefined' && window.location.hostname) {
    const isLocal = window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol.startsWith('file');

    if (!isLocal) {
      // Use the actual deployed production origin & path
      const cleanPath = window.location.pathname.endsWith('/') 
        ? window.location.pathname 
        : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
      baseUrl = `${window.location.origin}${cleanPath}`;
    }
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}receipt=${encoded}#receipt`;
}
