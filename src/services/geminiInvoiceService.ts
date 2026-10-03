import { ExpenseCategory, ExpenseType } from '../types';

export interface ExtractedInvoiceItem {
  id: string;
  name: string;
  category: ExpenseCategory;
  mainType: ExpenseType;
  quantity: number;
  unit: string;
  unitPriceKhr: number;
  totalKhr: number;
  // Wholesale & Retail Selling Price auto-calculation
  isWholesale?: boolean;
  wholesalePackQty?: number;
  wholesalePackUnit?: string;
  retailUnit?: string;
  retailUnitCostKhr?: number;
  retailProfitMarginPct?: number;
  retailSellingPriceKhr?: number;
  // Stock option
  addToStock?: boolean;
}

export interface ExtractedInvoice {
  supplier: string;
  date: string;
  invoiceNumber?: string;
  currency: 'KHR' | 'USD';
  totalAmountKhr: number;
  items: ExtractedInvoiceItem[];
  rawNotes?: string;
}

const STORAGE_KEY = 'sweetbakery_gemini_api_key';

export const getGeminiApiKey = (): string => {
  return (
    localStorage.getItem(STORAGE_KEY) ||
    ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) ||
    ''
  );
};

export const setGeminiApiKey = (key: string): void => {
  if (!key) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
};

/**
 * Resizes and compresses an image in browser canvas to speed up AI upload
 */
export const compressImage = (
  file: File | Blob,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export interface ApiKeyTestResult {
  valid: boolean;
  message?: string;
}

/**
 * Quick validation check for Gemini API Key (supports both legacy AIza and new AQ. format)
 * Uses ModelService.ListModels to verify key and discover available models dynamically
 */
export const testGeminiApiKey = async (apiKey: string): Promise<ApiKeyTestResult> => {
  try {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      return { valid: false, message: 'សូមបញ្ចូល API Key ជាមុនសិន' };
    }

    // Call ModelService.ListModels - standard, model-agnostic verification via header
    const listUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    const res = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'x-goog-api-key': trimmed,
      },
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const modelsList: any[] = data.models || [];
      const usableModels = modelsList
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name?.replace('models/', ''));

      // Find the best flash model available for this account
      const bestModel =
        usableModels.find((m: string) => m === 'gemini-2.0-flash') ||
        usableModels.find((m: string) => m.includes('2.0-flash')) ||
        usableModels.find((m: string) => m === 'gemini-2.5-flash') ||
        usableModels.find((m: string) => m.includes('flash')) ||
        usableModels[0] ||
        'gemini-2.0-flash';

      localStorage.setItem('sweetbakery_gemini_active_model', bestModel);

      return {
        valid: true,
        message: `ជោគជ័យ ✓ API Key ត្រឹមត្រូវ (ម៉ូដែលសកម្ម៖ ${bestModel}) អាចដំណើរការបាន!`,
      };
    }

    const data = await res.json().catch(() => ({}));
    const rawMsg = data.error?.message || `HTTP ${res.status}: ${res.statusText}`;

    let khmerMsg = rawMsg;
    if (rawMsg.includes('API key not valid') || rawMsg.includes('invalid authentication credentials')) {
      khmerMsg =
        'Google បដិសេធ៖ API Key មិនត្រឹមត្រូវ (API key not valid)។ សូមប្រាកដថាបាន Copy កូដទាំងអស់ពេញលេញចេញពី Google AI Studio។';
    } else if (rawMsg.includes('User location is not supported')) {
      khmerMsg = 'Google Gemini មិនទាន់គាំទ្រតំបន់/ប្រទេសរបស់អ្នកទេ (សូមសាកល្បងភ្ជាប់ VPN ឬជ្រើស Project ផ្សេង)';
    } else if (rawMsg.includes('Quota exceeded')) {
      khmerMsg = 'Quota ការប្រើប្រាស់ពេញហើយ សូមរង់ចាំបន្តិច';
    }

    return { valid: false, message: khmerMsg };
  } catch (err: any) {
    return { valid: false, message: err.message || 'មិនអាចភ្ជាប់ទៅកាន់ Google API បានទេ' };
  }
};

/**
 * Send invoice image to Google Gemini Vision API to extract line items
 */
export const scanInvoiceWithGemini = async (
  imageBase64: string,
  customApiKey?: string,
  exchangeRate = 4100
): Promise<ExtractedInvoice> => {
  const apiKey = (customApiKey || getGeminiApiKey()).trim();
  if (!apiKey) {
    throw new Error('សូមបញ្ចូល Google Gemini API Key ជាមុនសិន');
  }

  // Extract base64 and mime type
  const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = match ? match[1] : 'image/jpeg';
  const base64Data = match ? match[2] : imageBase64;

  const systemPrompt = `You are an expert Cambodian bakery and grocery accounting invoice analyzer.
Analyze this receipt / invoice image (which could be printed or handwritten in Khmer, English, or Chinese).
Carefully read every line item, table row, quantity, price, and supplier header.

Rules:
1. supplier: Extract store / supplier / vendor name.
2. date: Format as YYYY-MM-DD. If year is missing, assume current year. If date is not found, use today's date.
3. currency: 'KHR' or 'USD'.
4. items: Array of purchased items:
   - name: Clear product name in Khmer or English.
   - category: One of: 'INGREDIENTS' (flour, sugar, butter, yeast, milk, eggs, chocolate, matcha, cheese, cream, fruit), 'PACKAGING' (cake boxes, bread bags, cupcake cups, ribbons, cake boards, plastic bags), 'SUPPLIES' (candles, toppers, knives, baking paper, piping bags, molds, cutlery), 'UTILITIES' (gas, electricity, water, ice), 'MAINTENANCE' (oven repair, cleaning agents), 'OTHER'.
   - mainType: 'INGREDIENT' (for baking ingredients), 'SUPPLY' (for packaging, decorations, tools), or 'GENERAL' (utilities, maintenance, general).
   - quantity: Number of units (default 1).
   - unit: Khmer unit (e.g. 'គីឡូ', 'កេស', 'ដុំ', 'កញ្ចប់', 'ដប', 'បាវ', 'ប្រអប់', 'ឡូ', 'លីត្រ').
   - unitPriceKhr: Unit price in Khmer Riel. If the receipt is in USD, multiply by ${exchangeRate}.
   - totalKhr: Total price in Khmer Riel for this item.
   - isWholesale: true if the unit or name represents a bulk package (e.g. 'កេស', 'បាវ', 'ឡូ', 'ប្រអប់ធំ', 'box', 'sack', 'carton').
   - wholesalePackQty: If wholesale, how many retail units are inside (e.g. 12 for ឡូ, 24 for carton/កេស, 25 for 25kg sack, 50 for box of candles). If unknown, estimate or leave null.
   - retailUnit: Suggested retail selling unit (e.g. 'ដុំ', 'គីឡូ', 'កញ្ចប់', 'ដើម').
5. totalAmountKhr: Sum of all item totals in KHR.

Return ONLY a valid JSON object matching this schema without any markdown formatting or extra text:
{
  "supplier": "ឈ្មោះហាង/អ្នកផ្គត់ផ្គង់",
  "date": "YYYY-MM-DD",
  "invoiceNumber": "លេខវិក្កយបត្រ",
  "currency": "KHR",
  "totalAmountKhr": 0,
  "items": [
    {
      "name": "ឈ្មោះមុខទំនិញ",
      "category": "INGREDIENTS",
      "mainType": "INGREDIENT",
      "quantity": 1,
      "unit": "គីឡូ",
      "unitPriceKhr": 10000,
      "totalKhr": 10000,
      "isWholesale": false,
      "wholesalePackQty": null,
      "retailUnit": "ដុំ"
    }
  ],
  "rawNotes": "ចំណាំបន្ថែម"
}`;

  // 1. Discover active models if not cached
  let activeModel = typeof localStorage !== 'undefined' ? localStorage.getItem('sweetbakery_gemini_active_model') : null;
  if (!activeModel) {
    try {
      const listRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        method: 'GET',
        headers: { 'x-goog-api-key': apiKey },
      });
      if (listRes.ok) {
        const data = await listRes.json();
        const usable: string[] = (data.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name?.replace('models/', ''));
        activeModel =
          usable.find((m) => m === 'gemini-2.0-flash') ||
          usable.find((m) => m.includes('2.0-flash')) ||
          usable.find((m) => m === 'gemini-2.5-flash') ||
          usable.find((m) => m.includes('flash')) ||
          usable[0] ||
          null;
        if (activeModel && typeof localStorage !== 'undefined') {
          localStorage.setItem('sweetbakery_gemini_active_model', activeModel);
        }
      }
    } catch {}
  }

  // Candidates list (strictly modern models, no deprecated 1.5-flash)
  const candidateModels = [
    activeModel,
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash-exp',
  ].filter(Boolean) as string[];

  const models = Array.from(new Set(candidateModels));
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('ពុំទទួលបានចម្លើយពី AI ទេ');
      }

      // Parse JSON safely
      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      // Normalize items and compute IDs and retail margins
      const items: ExtractedInvoiceItem[] = (parsed.items || []).map((it: any, idx: number) => {
        const qty = Math.max(1, Number(it.quantity) || 1);
        let unitPriceKhr = Math.round(Number(it.unitPriceKhr) || 0);
        let totalKhr = Math.round(Number(it.totalKhr) || 0);

        if (totalKhr === 0 && unitPriceKhr > 0) {
          totalKhr = unitPriceKhr * qty;
        } else if (unitPriceKhr === 0 && totalKhr > 0) {
          unitPriceKhr = Math.round(totalKhr / qty);
        }

        const isWholesale = Boolean(it.isWholesale);
        const wholesalePackQty = it.wholesalePackQty ? Number(it.wholesalePackQty) : undefined;
        let retailUnitCostKhr: number | undefined;
        let retailSellingPriceKhr: number | undefined;
        let retailProfitMarginPct: number | undefined;

        if (isWholesale && wholesalePackQty && wholesalePackQty > 0) {
          retailUnitCostKhr = Math.round(totalKhr / (qty * wholesalePackQty));
          retailProfitMarginPct = 30; // default 30% margin
          retailSellingPriceKhr = Math.ceil((retailUnitCostKhr * 1.3) / 100) * 100;
        }

        return {
          id: `inv_item_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
          name: it.name || `ទំនិញទី ${idx + 1}`,
          category: (it.category || 'INGREDIENTS') as ExpenseCategory,
          mainType: (it.mainType || (it.category === 'INGREDIENTS' ? 'INGREDIENT' : it.category === 'PACKAGING' || it.category === 'SUPPLIES' ? 'SUPPLY' : 'GENERAL')) as ExpenseType,
          quantity: qty,
          unit: it.unit || 'ដុំ',
          unitPriceKhr: unitPriceKhr,
          totalKhr: totalKhr,
          isWholesale: isWholesale,
          wholesalePackQty: wholesalePackQty,
          wholesalePackUnit: isWholesale ? (it.unit || 'កេស') : undefined,
          retailUnit: it.retailUnit || (isWholesale ? 'ដុំ' : it.unit || 'ដុំ'),
          retailUnitCostKhr: retailUnitCostKhr,
          retailProfitMarginPct: retailProfitMarginPct,
          retailSellingPriceKhr: retailSellingPriceKhr,
          addToStock: it.mainType === 'INGREDIENT' || it.category === 'INGREDIENTS' || it.mainType === 'SUPPLY',
        };
      });

      const todayStr = new Date().toISOString().split('T')[0];

      return {
        supplier: parsed.supplier || 'អ្នកផ្គត់ផ្គង់ទូទៅ',
        date: parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : todayStr,
        invoiceNumber: parsed.invoiceNumber || undefined,
        currency: parsed.currency === 'USD' ? 'USD' : 'KHR',
        totalAmountKhr: Number(parsed.totalAmountKhr) || items.reduce((sum, item) => sum + item.totalKhr, 0),
        items: items,
        rawNotes: parsed.rawNotes || (parsed.invoiceNumber ? `វិក្កយបត្រលេខ៖ ${parsed.invoiceNumber}` : ''),
      };
    } catch (err: any) {
      lastError = err;
      // If model not found or quota, continue to next model
      continue;
    }
  }

  throw lastError || new Error('មិនអាចស្កេនវិក្កយបត្របានទេ សូមព្យាយាមម្តងទៀត');
};
