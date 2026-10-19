import { getGeminiApiKey, getGeminiApiKeyAsync, getUsableGeminiModels } from './geminiInvoiceService';

export interface AiBankSlipResult {
  isValid: boolean;
  bankName: string;
  bankLogoEmoji: string;
  amountPaid: number;
  currency: 'USD' | 'KHR';
  amountKhr: number;
  amountUsd: number;
  transactionId: string;
  transactionDate: string; // YYYY-MM-DD
  transactionTime: string; // HH:mm
  senderName: string;
  receiverName: string;
  receiverAccount: string;
  verificationStatus: 'VERIFIED' | 'AMOUNT_MISMATCH' | 'DATE_MISMATCH' | 'UNCLEAR' | 'SUSPICIOUS';
  statusMessageKh: string;
  depositMatched: boolean;
}

/**
 * Perform AI OCR & Financial Verification on Bank Transfer Slip / Bakong KHQR receipt
 */
export async function verifyBankSlipWithGemini(
  slipImageBase64: string,
  expectedDepositKhr: number,
  exchangeRate = 4100,
  customApiKey?: string
): Promise<AiBankSlipResult> {
  let apiKey = (customApiKey || getGeminiApiKey()).trim();
  if (!apiKey) {
    apiKey = await getGeminiApiKeyAsync();
  }
  if (!apiKey) {
    throw new Error('សូមបញ្ចូល ឬកំណត់ Google Gemini API Key ជាមុនសិន');
  }

  // Extract base64 and mime type
  const match = slipImageBase64.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = match ? match[1] : 'image/jpeg';
  const base64Data = match ? match[2] : slipImageBase64;

  const prompt = `You are a bank receipt and payment verification AI expert in Cambodia.
Analyze this bank transfer slip / screenshot / transaction receipt (ABA Mobile, ACLEDA mobile, Bakong, Wing, Canadia, TrueMoney, Chip Mong, etc.).
Carefully read the exact transaction details printed on the slip.

Required fields to extract:
1. bankName: The bank name (e.g., "ABA Bank", "ACLEDA Bank", "Bakong", "Wing Bank", "Canadia Bank").
2. amountPaid: Numeric amount transferred (e.g. 10.00 or 40000).
3. currency: "USD" or "KHR".
4. transactionId: The Transaction ID, Reference No, REF#, or Hash (e.g. "TRX8492019", "Ref: 9382103").
5. transactionDate: Transaction date formatted as YYYY-MM-DD (e.g. 2026-10-17).
6. transactionTime: Transaction time (e.g. "14:32:05" or "14:32").
7. senderName: Name of the person who sent money.
8. receiverName: Name of the bakery / receiver account.
9. receiverAccount: Account number or phone number of the receiver if shown.
10. isLegitimateReceipt: Boolean true if this looks like a genuine bank transaction receipt, false if it's random/fake/blank.

Return ONLY a valid JSON object matching this schema without any markdown formatting:
{
  "bankName": "ABA Bank",
  "amountPaid": 10.0,
  "currency": "USD",
  "transactionId": "TRX9384728",
  "transactionDate": "2026-10-17",
  "transactionTime": "14:30",
  "senderName": "SOK CHANTHA",
  "receiverName": "SWEET BAKERY",
  "receiverAccount": "001 234 567",
  "isLegitimateReceipt": true
}`;

  const candidateModels = await getUsableGeminiModels(apiKey);

  let rawJson = '';
  let lastError: any = null;

  for (const model of candidateModels) {
    const cleanModel = (model || '').replace(/^models\//, '').trim();
    if (!cleanModel) continue;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim(),
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
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

      if (!res.ok) {
        const errText = await res.text();
        lastError = new Error(`Gemini ${model} error ${res.status}: ${errText}`);
        continue;
      }

      const json = await res.json();
      const parts = json.candidates?.[0]?.content?.parts || [];
      const candidateText = parts.map((p: any) => p.text || '').join('\n').trim();
      if (candidateText) {
        rawJson = candidateText;
        break;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!rawJson) {
    throw lastError || new Error('មិនអាចអានវិក្កយបត្រធនាគារនេះបានទេ');
  }

  try {
    const parsed = safeExtractJsonObject(rawJson);

    const currency: 'USD' | 'KHR' = (parsed.currency || 'KHR').toUpperCase() === 'USD' ? 'USD' : 'KHR';
    const amountPaid = Number(parsed.amountPaid) || 0;

    let amountKhr = 0;
    let amountUsd = 0;

    if (currency === 'USD') {
      amountUsd = amountPaid;
      amountKhr = Math.round(amountPaid * exchangeRate);
    } else {
      amountKhr = amountPaid;
      amountUsd = Number((amountPaid / exchangeRate).toFixed(2));
    }

    const bankName = parsed.bankName || 'Bakong KHQR';
    let bankLogoEmoji = '💳';
    if (bankName.toLowerCase().includes('aba')) bankLogoEmoji = '🏦';
    else if (bankName.toLowerCase().includes('acleda')) bankLogoEmoji = '🏛️';
    else if (bankName.toLowerCase().includes('wing')) bankLogoEmoji = '🦅';
    else if (bankName.toLowerCase().includes('bakong')) bankLogoEmoji = '🔴';

    // Deposit check: allow 5% grace margin for currency rounding
    const minAcceptableKhr = Math.max(0, expectedDepositKhr * 0.95);
    const depositMatched = amountKhr >= minAcceptableKhr;

    let verificationStatus: AiBankSlipResult['verificationStatus'] = 'VERIFIED';
    let statusMessageKh = `✅ ផ្ទៀងផ្ទាត់ជោគជ័យ៖ បានទទួលប្រាក់កក់ ${amountKhr.toLocaleString()} ៛ ($${amountUsd.toFixed(2)}) តាមរយៈ ${bankName} ត្រឹមត្រូវ!`;

    if (!parsed.isLegitimateReceipt) {
      verificationStatus = 'UNCLEAR';
      statusMessageKh = '⚠️ រូបភាពមិនច្បាស់ ឬមិនមែនជាវិក្កយបត្រធនាគារត្រឹមត្រូវឡើយ។';
    } else if (!depositMatched && expectedDepositKhr > 0) {
      verificationStatus = 'AMOUNT_MISMATCH';
      statusMessageKh = `⚠️ ចំនួនទឹកប្រាក់មិនទាន់គ្រប់៖ វិក្កយបត្របង្ហាញបង់ ${amountKhr.toLocaleString()} ៛ ($${amountUsd.toFixed(2)}) ប៉ុន្តែប្រាក់កក់តម្រូវការគឺ ${(expectedDepositKhr || 0).toLocaleString()} ៛។`;
    }

    return {
      isValid: parsed.isLegitimateReceipt && depositMatched,
      bankName,
      bankLogoEmoji,
      amountPaid,
      currency,
      amountKhr,
      amountUsd,
      transactionId: parsed.transactionId || 'N/A',
      transactionDate: parsed.transactionDate || new Date().toISOString().slice(0, 10),
      transactionTime: parsed.transactionTime || '',
      senderName: parsed.senderName || '',
      receiverName: parsed.receiverName || '',
      receiverAccount: parsed.receiverAccount || '',
      verificationStatus,
      statusMessageKh,
      depositMatched,
    };
  } catch (err: any) {
    throw new Error('ការអានវិក្កយបត្របរាជ័យ៖ ' + err.message);
  }
}

/**
 * Robust JSON object extractor that handles markdown blocks, preambles, and bullet points
 */
function safeExtractJsonObject(text: string): any {
  if (!text || typeof text !== 'string') {
    throw new Error('ទិន្នន័យពី AI ទទេស្អាត');
  }

  const trimmed = text.trim();

  // 1. Direct parse
  try {
    return JSON.parse(trimmed);
  } catch (_) {}

  // 2. Extract from markdown code block ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (_) {}
  }

  // 3. Find outermost JSON object { ... }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const rawSubstring = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(rawSubstring);
    } catch (_) {}

    // 4. Sanitize trailing commas and unicode quotes
    try {
      const sanitized = rawSubstring
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
      return JSON.parse(sanitized);
    } catch (_) {}
  }

  // 5. Regex field extraction fallback
  const extractField = (key: string): string => {
    const m = trimmed.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'i'));
    return m ? m[1] : '';
  };
  const extractNum = (key: string): number => {
    const m = trimmed.match(new RegExp(`"${key}"\\s*:\\s*([0-9.]+)`, 'i'));
    return m ? Number(m[1]) : 0;
  };

  const amountPaid = extractNum('amountPaid');
  if (amountPaid > 0 || extractField('transactionId')) {
    return {
      isLegitimateReceipt: true,
      bankName: extractField('bankName') || 'Bakong KHQR',
      amountPaid: amountPaid,
      currency: extractField('currency') || 'KHR',
      transactionId: extractField('transactionId') || 'N/A',
      transactionDate: extractField('transactionDate') || new Date().toISOString().slice(0, 10),
      transactionTime: extractField('transactionTime') || '',
      senderName: extractField('senderName') || '',
      receiverName: extractField('receiverName') || '',
      receiverAccount: extractField('receiverAccount') || '',
    };
  }

  throw new Error('រកមិនឃើញទិន្នន័យ JSON ត្រឹមត្រូវនៅក្នុងចម្លើយរបស់ AI ឡើយ');
}
