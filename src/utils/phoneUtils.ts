/**
 * Utility functions for parsing multiple store phone numbers and detecting Cambodian carriers.
 */

export interface ParsedPhoneNumber {
  id: number;
  display: string;
  digits: string;
  carrier: 'Metfone' | 'Smart' | 'Cellcard' | null;
  badgeClass: string;
}

export function detectCambodiaCarrier(digits: string): {
  name: 'Metfone' | 'Smart' | 'Cellcard';
  badgeClass: string;
} | null {
  const d = digits.replace(/^(\+?855|0)/, '');
  const prefix2 = d.slice(0, 2);

  const metfone = ['97', '88', '71', '90', '60', '66', '67', '68', '31'];
  const smart = ['10', '15', '16', '69', '70', '81', '86', '87', '93', '96', '98'];
  const cellcard = ['11', '12', '14', '17', '61', '76', '77', '78', '79', '85', '89', '92', '95', '99'];

  if (metfone.includes(prefix2)) {
    return { name: 'Metfone', badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
  }
  if (smart.includes(prefix2)) {
    return { name: 'Smart', badgeClass: 'text-green-700 bg-green-50 border-green-300' };
  }
  if (cellcard.includes(prefix2)) {
    return { name: 'Cellcard', badgeClass: 'text-orange-700 bg-orange-50 border-orange-300' };
  }
  return null;
}

export function parsePhoneNumbers(raw?: string): ParsedPhoneNumber[] {
  if (!raw || typeof raw !== 'string') return [];
  const parts = raw
    .split(/[,/|&;\n]|\s+(?:or|ឬ|and|-)\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts
    .map((part, index) => {
      const digits = part.replace(/[^0-9+]/g, '');
      const carrier = detectCambodiaCarrier(digits);
      return {
        id: index,
        display: part,
        digits,
        carrier: carrier ? carrier.name : null,
        badgeClass: carrier ? carrier.badgeClass : 'text-slate-700 bg-slate-50 border-slate-200',
      };
    })
    .filter((p) => p.digits.length >= 7);
}

export function dialPhoneNumber(digits: string) {
  const clean = digits.replace(/[^0-9+]/g, '');
  if (!clean) return;
  window.location.href = `tel:${clean}`;
}

