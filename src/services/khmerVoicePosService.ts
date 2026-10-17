import { Product } from '../types';

export interface VoicePosAction {
  type: 'ADD_PRODUCT' | 'CHECKOUT' | 'CLEAR_CART' | 'APPLY_DISCOUNT' | 'UNKNOWN';
  product?: Product;
  quantity?: number;
  discountPercent?: number;
  rawText: string;
}

const KHMER_NUMBER_MAP: Record<string, number> = {
  'មួយ': 1,
  'ពីរ': 2,
  'បី': 3,
  'បួន': 4,
  'ប្រាំ': 5,
  'ប្រាំមួយ': 6,
  'ប្រាំពីរ': 7,
  'ប្រាំបី': 8,
  'ប្រាំបួន': 9,
  'ដប់': 10,
  '១': 1,
  '២': 2,
  '៣': 3,
  '៤': 4,
  '៥': 5,
  '៦': 6,
  '៧': 7,
  '៨': 8,
  '៩': 9,
  '១០': 10,
};

/**
 * Parse Khmer spoken speech into concrete POS Actions
 */
export function parseKhmerVoiceCommand(
  speechText: string,
  products: Product[]
): VoicePosAction[] {
  const text = speechText.trim().toLowerCase();
  const actions: VoicePosAction[] = [];

  // 1. Checkout command
  if (
    text.includes('គិតលុយ') ||
    text.includes('បង់លុយ') ||
    text.includes('checkout') ||
    text.includes('ទូទាត់')
  ) {
    actions.push({
      type: 'CHECKOUT',
      rawText: text,
    });
    return actions;
  }

  // 2. Clear Cart command
  if (
    text.includes('លុបចោល') ||
    text.includes('សម្អាតកន្ត្រក') ||
    text.includes('clear cart') ||
    text.includes('ចាប់ផ្តើមថ្មី')
  ) {
    actions.push({
      type: 'CLEAR_CART',
      rawText: text,
    });
    return actions;
  }

  // 3. Discount command (e.g. "បញ្ចុះតម្លៃ 10 ភាគរយ")
  const discountMatch = text.match(/បញ្ចុះតម្លៃ\s*(\d+)/i) || text.match(/discount\s*(\d+)/i);
  if (discountMatch) {
    const pct = parseInt(discountMatch[1], 10);
    if (!isNaN(pct)) {
      actions.push({
        type: 'APPLY_DISCOUNT',
        discountPercent: pct,
        rawText: text,
      });
      return actions;
    }
  }

  // 4. Product matching
  // Split multiple items joined with "និង" or ","
  const segments = text.split(/និង|,|\+/).map((s) => s.trim()).filter(Boolean);

  for (const seg of segments) {
    // Extract quantity from segment
    let qty = 1;
    // Check digits (e.g. 2, 3)
    const digitMatch = seg.match(/\b(\d+)\b/);
    if (digitMatch) {
      qty = parseInt(digitMatch[1], 10) || 1;
    } else {
      // Check Khmer written numbers
      for (const [kNum, val] of Object.entries(KHMER_NUMBER_MAP)) {
        if (seg.includes(kNum)) {
          qty = val;
          break;
        }
      }
    }

    // Match product against catalog
    let matchedProduct: Product | undefined;
    let highestScore = 0;

    for (const p of products) {
      const pNameKh = (p.nameKh || '').toLowerCase();
      const pNameEn = (p.nameEn || '').toLowerCase();

      let score = 0;
      if (seg.includes(pNameKh) && pNameKh.length > 2) score = pNameKh.length * 2;
      else if (seg.includes(pNameEn) && pNameEn.length > 2) score = pNameEn.length;
      else {
        // Keyword partial matching
        const keywords = pNameKh.split(/\s+/).filter((w) => w.length > 2);
        for (const kw of keywords) {
          if (seg.includes(kw)) score += kw.length;
        }
      }

      if (score > highestScore && score >= 3) {
        highestScore = score;
        matchedProduct = p;
      }
    }

    if (matchedProduct) {
      actions.push({
        type: 'ADD_PRODUCT',
        product: matchedProduct,
        quantity: qty,
        rawText: seg,
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      type: 'UNKNOWN',
      rawText: text,
    });
  }

  return actions;
}
