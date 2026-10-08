/**
 * Date formatting utilities for SweetBakery POS System
 * Standardizes all date displays across receipts, reports, orders, and sales history
 * to the Cambodian standard DD/MM/YYYY (ថ្ងៃ/ខែ/ឆ្នាំ) instead of MM/DD/YYYY or YYYY-MM-DD.
 */

/**
 * Format any date input (YYYY-MM-DD, ISO string, timestamp, or Date object)
 * into standard DD/MM/YYYY format with zero padding.
 * 
 * Example:
 * formatDateDMY('2026-10-06') => '06/10/2026'
 * formatDateDMY(new Date()) => '06/10/2026'
 */
export const formatDateDMY = (
  dateInput?: string | Date | number | null,
  separator: string = '/'
): string => {
  if (!dateInput) return '';

  // Direct fast-path for pure YYYY-MM-DD strings to avoid UTC-to-local timezone shift
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const [year, month, day] = dateInput.trim().split('-');
    return `${day}${separator}${month}${separator}${year}`;
  }

  const d = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(d.getTime())) {
    return String(dateInput);
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}${separator}${month}${separator}${year}`;
};

/**
 * Format time into HH:mm (or HH:mm:ss).
 * Example: formatTime(new Date()) => '19:43'
 */
export const formatTime = (
  dateInput?: string | Date | number | null,
  includeSeconds: boolean = false
): string => {
  if (!dateInput) return '';

  const d = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(d.getTime())) return '';

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  if (includeSeconds) {
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  return `${hours}:${minutes}`;
};

/**
 * Format full date and time into DD/MM/YYYY HH:mm.
 * Example: formatDateTimeDMY(sale.createdAt) => '06/10/2026 19:43'
 */
export const formatDateTimeDMY = (
  dateInput?: string | Date | number | null,
  separator: string = '/',
  includeSeconds: boolean = false
): string => {
  if (!dateInput) return '';

  const dateStr = formatDateDMY(dateInput, separator);
  const timeStr = formatTime(dateInput, includeSeconds);

  return timeStr ? `${dateStr} ${timeStr}` : dateStr;
};

/**
 * Format date in full readable Khmer format:
 * Example: 'ថ្ងៃទី ០៦ ខែ ១០ ឆ្នាំ ២០២៦'
 */
export const formatDateKhmer = (dateInput?: string | Date | number | null): string => {
  if (!dateInput) return '';
  const dmy = formatDateDMY(dateInput, '/');
  const [day, month, year] = dmy.split('/');
  return `ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
};

/**
 * Universal date normalizer (handles YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, MM/DD/YYYY, ISO, timestamps, etc.)
 * Always returns standard YYYY-MM-DD string
 */
export const normalizeDateToYMD = (raw?: any): string => {
  if (!raw && raw !== 0) return '';
  const str = String(raw).trim();
  if (!str || str === 'undefined' || str === 'null' || str === 'Invalid Date') return '';

  // 1. Numeric timestamp (10 digits for seconds or 13 digits for ms)
  if (/^\d{10,14}$/.test(str)) {
    try {
      const num = Number(str);
      const d = new Date(num > 10000000000 ? num : num * 1000);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    } catch {}
  }

  // 2. Starts with YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD (1 or 2 digits for M and D)
  const ymdMatch = str.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 3. DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY (e.g. 07-10-2026 13:12)
  const dmyMatch = str.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})/);
  if (dmyMatch) {
    const p1 = Number(dmyMatch[1]);
    const p2 = Number(dmyMatch[2]);
    const y = dmyMatch[3];
    // If p1 > 12, p1 must be day (DD/MM/YYYY)
    // If p2 > 12, p2 must be day (MM/DD/YYYY)
    let day = p1;
    let month = p2;
    if (p2 > 12 && p1 <= 12) {
      month = p1;
      day = p2;
    }
    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${y}-${mStr}-${dStr}`;
  }

  // 4. ISO or standard JS Date parser fallback (e.g. "2026-10-08T08:15:30.000Z")
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  } catch {}

  return str.slice(0, 10);
};
