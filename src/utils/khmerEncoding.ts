/**
 * Utility to detect and auto-repair Khmer text mojibake (double-encoded UTF-8 in Windows-1252/ISO-8859-1).
 * Example: 'ážŸáž¼áž€áž¼áž¡áž¶' -> 'សូកូឡា'
 */

const win1252Map: Record<number, number> = {
  8364: 0x80,
  8218: 0x82,
  402: 0x83,
  8222: 0x84,
  8230: 0x85,
  8224: 0x86,
  8225: 0x87,
  710: 0x88,
  8240: 0x89,
  352: 0x8A,
  8249: 0x8B,
  338: 0x8C,
  381: 0x8E,
  8216: 0x91,
  8217: 0x92,
  8220: 0x93,
  8221: 0x94,
  8226: 0x95,
  8211: 0x96,
  8212: 0x97,
  732: 0x98,
  8482: 0x99,
  353: 0x9A,
  8250: 0x9B,
  339: 0x9C,
  382: 0x9E,
  376: 0x9F,
};

/**
 * Returns true if the string appears to be corrupted with Khmer UTF-8 mojibake
 */
export const isKhmerMojibake = (text?: string | null): boolean => {
  if (!text || typeof text !== 'string') return false;
  return (
    text.includes('áž') ||
    text.includes('áŸ') ||
    text.includes('Ã') ||
    text.includes('â€') ||
    /[\u00C0-\u00FF]{2,}/.test(text)
  );
};

/**
 * Fixes double-encoded UTF-8 characters back to clean Khmer Unicode
 */
export const fixKhmerMojibake = (text?: string | null): string => {
  if (!text || typeof text !== 'string') return text || '';
  if (!isKhmerMojibake(text)) return text;

  try {
    const bytes: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (win1252Map[code] !== undefined) {
        bytes.push(win1252Map[code]);
      } else if (code <= 255) {
        bytes.push(code);
      } else {
        bytes.push(code & 0xff);
      }
    }
    const decoded = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    if (decoded && !decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch (e) {
    // If decoding fails, return original
  }
  return text;
};
