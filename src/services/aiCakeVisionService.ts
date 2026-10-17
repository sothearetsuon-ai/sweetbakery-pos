import { getGeminiApiKey, getGeminiApiKeyAsync } from './geminiInvoiceService';

export interface AiCakeAnalysisResult {
  cakeNameKh: string;
  cakeNameEn: string;
  styleCategory: 'MINIMALIST_KOREAN' | 'VINTAGE_LUXURY' | 'CARTOON_KIDS' | 'FLORAL_ROMANTIC' | 'CHOCOLATE_DRIP' | 'TWO_TIER' | 'CUSTOM_3D' | 'STANDARD';
  styleCategoryKh: string;
  estimatedSize: string;
  suggestedPriceKhr: number;
  suggestedPriceUsd: number;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'COMPLEX' | 'MASTER';
  difficultyKh: string;
  primaryColors: string[];
  recommendedFlavors: string[];
  recommendedInscriptions: string[];
  bakingNotes: string;
  occasionKh: string;
  confidence: number;
}

/**
 * Analyze an uploaded cake reference image using Google Gemini Multimodal Vision API
 */
export async function analyzeCakeImageWithGemini(
  imageBase64: string,
  exchangeRate = 4100,
  customApiKey?: string
): Promise<AiCakeAnalysisResult> {
  let apiKey = (customApiKey || getGeminiApiKey()).trim();
  if (!apiKey) {
    apiKey = await getGeminiApiKeyAsync();
  }
  if (!apiKey) {
    throw new Error('សូមបញ្ចូល ឬកំណត់ Google Gemini API Key ជាមុនសិន');
  }

  // Extract base64 and mime type
  const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = match ? match[1] : 'image/jpeg';
  const base64Data = match ? match[2] : imageBase64;

  const prompt = `You are an expert Cambodian pastry chef and cake designer at a premium bakery.
Analyze this birthday/celebration cake photo carefully.
Your task is to analyze the cake's design, style, decoration complexity, recommended size, and calculate an estimated fair retail price in Cambodian Riel (KHR) and USD.

Guidelines for Pricing & Sizing (Cambodian Bakery Market Standards):
- Simple Minimalist / Korean Bento / 1.5 ទឹក (~15cm): 20,000 KHR - 30,000 KHR ($5 - $7.5)
- Standard 2 ទឹក (~20cm, 6-8 people, common birthday): 40,000 KHR - 50,000 KHR ($10 - $12.5)
- Decorative Floral / Chocolate Drip / 2.5 ទឹក (~25cm, 10-14 people): 60,000 KHR - 80,000 KHR ($15 - $20)
- Elaborate Vintage / Fondant Figures / 3 ទឹក (~30cm, 15-20 people): 90,000 KHR - 120,000 KHR ($22 - $30)
- 2-Tier or Multi-Tier Grand Celebration Cake (20+ people): 150,000 KHR - 220,000 KHR+ ($37 - $55+)

Return ONLY a valid JSON object matching the following schema without any markdown formatting or extra text:
{
  "cakeNameKh": "ឈ្មោះម៉ូដនំជាភាសាខ្មែរពិរោះៗ (ឧ. នំខេកកូរ៉េ Daisy Pastel រចនាផ្កាស្រស់)",
  "cakeNameEn": "English Cake Style Name (e.g. Korean Daisy Pastel Birthday Cake)",
  "styleCategory": "MINIMALIST_KOREAN",
  "styleCategoryKh": "ម៉ូដកូរ៉េទាន់សម័យ (Korean Minimalist)",
  "estimatedSize": "2 ទឹក (~20cm) - សម្រាប់ 6-8 នាក់",
  "suggestedPriceKhr": 45000,
  "suggestedPriceUsd": 11.0,
  "difficultyLevel": "MEDIUM",
  "difficultyKh": "កម្រិតមធ្យម",
  "primaryColors": ["ពណ៌ផ្កាឈូកស្រាល", "ពណ៌សក្រែម", "ពណ៌លឿងខ្ចី"],
  "recommendedFlavors": ["សូកូឡា", "ស្ត្រប៊ែរី", "តយដូង"],
  "recommendedInscriptions": [
    "Happy Birthday My Love ❤️🎂",
    "រីករាយថ្ងៃខួបកំណើតកូនសំឡាញ់ 🌟",
    "Happy Birthday to You 🎉"
  ],
  "bakingNotes": "ចំណាំសំខាន់សម្រាប់ជាងនំ៖ ក្រឡុកក្រែមស្រស់ពណ៌ pastel, ប្រើក្បាលបាញ់ផ្កាតូចៗ, និងតុបតែងជាមួយទៀនពណ៌មាស។",
  "occasionKh": "ខួបកំណើត (Birthday)",
  "confidence": 0.95
}

styleCategory can be: 'MINIMALIST_KOREAN', 'VINTAGE_LUXURY', 'CARTOON_KIDS', 'FLORAL_ROMANTIC', 'CHOCOLATE_DRIP', 'TWO_TIER', 'CUSTOM_3D', or 'STANDARD'.
difficultyLevel can be: 'EASY', 'MEDIUM', 'COMPLEX', or 'MASTER'.`;

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
  ];

  let rawJson = '';
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
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
            temperature: 0.2,
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
      const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) {
        rawJson = candidateText;
        break;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!rawJson) {
    throw lastError || new Error('មិនអាចទទួលបានការវិភាគពីរូបភាពនំនេះបានទេ');
  }

  try {
    // Clean potential markdown blocks
    const cleaned = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const priceKhr = parsed.suggestedPriceKhr || Math.round((parsed.suggestedPriceUsd || 10) * exchangeRate);
    const priceUsd = parsed.suggestedPriceUsd || Number((priceKhr / exchangeRate).toFixed(2));

    return {
      cakeNameKh: parsed.cakeNameKh || 'នំខេកខួបកំណើតស្អាតពិសេស',
      cakeNameEn: parsed.cakeNameEn || 'Special Celebration Cake',
      styleCategory: parsed.styleCategory || 'MINIMALIST_KOREAN',
      styleCategoryKh: parsed.styleCategoryKh || 'ម៉ូដពេញនិយម (Standard Style)',
      estimatedSize: parsed.estimatedSize || '2 ទឹក (~20cm) - សម្រាប់ 6-8 នាក់',
      suggestedPriceKhr: priceKhr,
      suggestedPriceUsd: priceUsd,
      difficultyLevel: parsed.difficultyLevel || 'MEDIUM',
      difficultyKh: parsed.difficultyKh || 'កម្រិតមធ្យម',
      primaryColors: Array.isArray(parsed.primaryColors) ? parsed.primaryColors : ['ពណ៌ធម្មជាតិ'],
      recommendedFlavors: Array.isArray(parsed.recommendedFlavors) ? parsed.recommendedFlavors : ['សូកូឡា', 'តយដូង'],
      recommendedInscriptions: Array.isArray(parsed.recommendedInscriptions) ? parsed.recommendedInscriptions : ['Happy Birthday 🎂🎉'],
      bakingNotes: parsed.bakingNotes || 'រៀបចំតុបតែងម៉ូដនំតាមរូបភាពគំរូ។',
      occasionKh: parsed.occasionKh || 'ខួបកំណើត (Birthday)',
      confidence: parsed.confidence || 0.9,
    };
  } catch (parseErr: any) {
    throw new Error('ការអានទិន្នន័យវិភាគនំមានបញ្ហា៖ ' + parseErr.message);
  }
}
