/**
 * Universal Currency & Khmer Riel (KHR) Rounding Utility
 * 
 * In Cambodia, 100 ៛ is the minimum circulating denomination.
 * Amounts with fractional riel (like 10៛, 20៛, 40៛, 60៛, 80៛) must be rounded to the nearest 100 ៛.
 */

/**
 * Rounds any KHR amount to the nearest 100 ៛.
 * Example:
 *   roundKhr(55520) => 55500
 *   roundKhr(55570) => 55600
 *   roundKhr(1234)  => 1200
 *   roundKhr(0)     => 0
 */
export const roundKhr = (amount: number | string | undefined | null): number => {
  if (amount === undefined || amount === null) return 0;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 0;
  return Math.round(num / 100) * 100;
};

/**
 * Converts a USD amount to clean, rounded KHR (always rounded to nearest 100 ៛).
 * Example:
 *   usdToKhr(13.88, 4000) => 55500 (instead of 55520)
 *   usdToKhr(1.23, 4000)  => 4900  (instead of 4920)
 */
export const usdToKhr = (
  usd: number | string | undefined | null,
  exchangeRate: number = 4000
): number => {
  if (usd === undefined || usd === null) return 0;
  const num = typeof usd === 'string' ? parseFloat(usd) : usd;
  if (isNaN(num)) return 0;
  return roundKhr(num * exchangeRate);
};

/**
 * Formats a KHR number with commas and always rounded to nearest 100 ៛.
 * Example:
 *   formatKhr(55520) => "55,500"
 */
export const formatKhr = (amount: number | string | undefined | null): string => {
  return roundKhr(amount).toLocaleString();
};
