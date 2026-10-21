import { Product } from '../types';

/**
 * Returns a numerical timestamp for a product.
 * Prioritizes:
 * 1. updatedAt
 * 2. createdAt
 * 3. Numeric timestamp embedded in the ID (e.g. p-1789396549872)
 * 4. Fallback to 0 for default seed items (p1..p12, party-1..party-7)
 */
export const getProductTimestamp = (p: Product): number => {
  if (!p) return 0;
  if (p.updatedAt) {
    const t = new Date(p.updatedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (p.createdAt) {
    const t = new Date(p.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (typeof p.id === 'string' && p.id.startsWith('p-')) {
    const raw = p.id.replace('p-', '');
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 1000000) return num;
  }
  return 0;
};

/**
 * Sorts products so that newly added items (and items with newer photos)
 * appear first at the top of the showcase and catalog.
 */
export const sortProductsNewestFirst = (list: Product[]): Product[] => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const timeA = getProductTimestamp(a);
    const timeB = getProductTimestamp(b);
    if (timeA !== timeB) return timeB - timeA;
    return 0;
  });
};

export type PosSortMode = 'smart_stock' | 'newest_first' | 'name_asc' | 'stock_desc';

/**
 * Sorts products for POS (Point of Sale - Quick Cashier & Cart):
 * 1. In-stock products ((stockQty ?? 0) > 0) appear at the top.
 * 2. Newly added/updated items (highest timestamp) appear at the very top of in-stock items.
 * 3. Out-of-stock products ((stockQty ?? 0) <= 0) are moved to the bottom.
 * 4. Out-of-stock products are also ordered newest first among themselves at the bottom.
 */
export const sortProductsForPos = (
  list: Product[],
  mode: PosSortMode = 'smart_stock'
): Product[] => {
  if (!Array.isArray(list)) return [];
  const items = [...list];

  if (mode === 'name_asc') {
    return items.sort((a, b) => (a.nameKh || a.nameEn || '').localeCompare(b.nameKh || b.nameEn || ''));
  }

  if (mode === 'stock_desc') {
    return items.sort((a, b) => (b.stockQty ?? 0) - (a.stockQty ?? 0));
  }

  if (mode === 'newest_first') {
    return sortProductsNewestFirst(items);
  }

  // Default: 'smart_stock' (User requirement:
  // - In-stock items at top
  // - Newly added/updated items at the very top of in-stock items
  // - Out-of-stock items at bottom)
  return items.sort((a, b) => {
    const stockA = Number(a.stockQty ?? 0);
    const stockB = Number(b.stockQty ?? 0);
    const hasStockA = stockA > 0 ? 1 : 0;
    const hasStockB = stockB > 0 ? 1 : 0;

    // 1. In-stock items (hasStock = 1) at the top, out-of-stock (hasStock = 0) at the bottom
    if (hasStockA !== hasStockB) {
      return hasStockB - hasStockA;
    }

    // 2. Newly added / updated items appear at the very top
    const timeA = getProductTimestamp(a);
    const timeB = getProductTimestamp(b);
    if (timeA !== timeB) {
      return timeB - timeA;
    }

    // 3. Fallback: Stable sort by Khmer name
    return (a.nameKh || '').localeCompare(b.nameKh || '');
  });
};

