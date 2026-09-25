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
