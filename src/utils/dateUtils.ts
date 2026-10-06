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
