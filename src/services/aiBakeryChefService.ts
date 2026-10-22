import { Ingredient, Recipe } from '../types';
import { getGeminiApiKey, getGeminiApiKeyAsync, getUsableGeminiModels } from './geminiInvoiceService';

export interface BakerPercentageItem {
  ingredientName: string;
  percentage: number; // e.g. 100 for flour, 62 for water
  weightGrams: number;
}

export interface RecipeIngredientCost {
  name: string;
  quantity: number;
  unit: string;
  matchedIngredientId?: string;
  unitCostUsd: number;
  totalCostUsd: number;
  inStock: boolean;
}

export interface AiGeneratedRecipe {
  id: string;
  nameKh: string;
  nameEn: string;
  category: string;
  descriptionKh: string;
  yieldQuantity: number;
  yieldUnit: string;
  bakerPercentages: BakerPercentageItem[];
  ingredientsList: RecipeIngredientCost[];
  instructionsKh: string[];
  bakingTempC: number;
  bakingTimeMinutes: number;
  proofingTimeMinutes: number;
  chefSecretTipKh: string;
  totalBatchCostUsd: number;
  costPerPieceUsd: number;
  suggestedSellPriceUsd: number;
  profitMarginPercent: number;
}

/**
 * AI Bakery Chef Formulation Engine
 */
export async function generateBakeryRecipeWithAi(
  conceptPrompt: string,
  storeIngredients: Ingredient[],
  exchangeRate = 4100,
  customApiKey?: string
): Promise<AiGeneratedRecipe> {
  let apiKey = (customApiKey || getGeminiApiKey()).trim();
  if (!apiKey) {
    apiKey = await getGeminiApiKeyAsync();
  }

  // Fallback to rich master baker preset formulas if offline or no key
  if (!apiKey) {
    return generateOfflineArtisanRecipe(conceptPrompt, storeIngredients, exchangeRate);
  }

  const ingredientsSummary = storeIngredients.slice(0, 50).map((ing) => ({
    id: ing.id,
    nameKh: ing.nameKh,
    nameEn: ing.nameEn,
    unit: ing.unit,
    costPerUnitUsd: ing.costPerUnitUsd,
    currentStock: ing.currentStock,
  }));

  const systemPrompt = `You are a World Master Baker & Pastry Chef (Meilleur Ouvrier de France) and professional Food Costing Consultant.
The user wants to formulate a new bakery recipe for: "${conceptPrompt}".

Current available raw materials in the bakery:
${JSON.stringify(ingredientsSummary)}

Return ONLY valid JSON (without backticks or markdown) matching this exact JSON schema:
{
  "nameKh": "ឈ្មោះនំជាភាសាខ្មែរ (ឧ. នំក្រូសង់ស្នូលពីស្តាស៊ីអូ)",
  "nameEn": "English Name (e.g. Pistachio Cream Croissant)",
  "category": "pastries | cakes | breads | cookies | specials",
  "descriptionKh": "ការពិពណ៌នាសង្ខេបអំពីរសជាតិ និងភាពទាក់ទាញ",
  "yieldQuantity": 12,
  "yieldUnit": "ដុំ",
  "bakerPercentages": [
    {"ingredientName": "Flour (ម្សៅមី)", "percentage": 100, "weightGrams": 500},
    {"ingredientName": "Water/Milk (ទឹក/ទឹកដោះគោ)", "percentage": 58, "weightGrams": 290},
    {"ingredientName": "Butter (ប៊័រ)", "percentage": 50, "weightGrams": 250},
    {"ingredientName": "Yeast (មេនំបុ័ង)", "percentage": 2, "weightGrams": 10},
    {"ingredientName": "Sugar (ស្ករស)", "percentage": 10, "weightGrams": 50},
    {"ingredientName": "Salt (អំបិល)", "percentage": 2, "weightGrams": 10}
  ],
  "ingredientsList": [
    {
      "name": "ម្សៅមី Bread Flour",
      "quantity": 500,
      "unit": "g",
      "unitCostUsd": 0.0015,
      "totalCostUsd": 0.75
    }
  ],
  "instructionsKh": [
    "ជំហានទី ១: លាយម្សៅ...",
    "ជំហានទី ២: ផ្អាប់ម្សៅ...",
    "ជំហានទី ៣: ដុតនំ..."
  ],
  "bakingTempC": 190,
  "bakingTimeMinutes": 18,
  "proofingTimeMinutes": 90,
  "chefSecretTipKh": "គន្លឹះសម្ងាត់ចុងភៅដើម្បីឱ្យនំស្រួយ និងក្រអូបបំផុត...",
  "suggestedSellPriceUsd": 2.50
}`;

  try {
    const candidateModels = await getUsableGeminiModels();
    let responseText = '';

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (responseText.trim()) break;
        }
      } catch (e) {
        console.warn(`Model ${model} failed, trying next:`, e);
      }
    }

    if (!responseText) {
      return generateOfflineArtisanRecipe(conceptPrompt, storeIngredients, exchangeRate);
    }

    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJson);
    return enrichRecipeWithCosts(parsed, storeIngredients);
  } catch (err) {
    console.error('AI Chef generation failed, using artisan preset:', err);
    return generateOfflineArtisanRecipe(conceptPrompt, storeIngredients, exchangeRate);
  }
}

function enrichRecipeWithCosts(raw: any, storeIngredients: Ingredient[]): AiGeneratedRecipe {
  const yieldQty = raw.yieldQuantity || 12;

  // Match ingredients with store inventory
  const enrichedIngredients: RecipeIngredientCost[] = (raw.ingredientsList || []).map((item: any) => {
    const itemName = (item.name || '').toLowerCase();
    const matched = storeIngredients.find((ing) => {
      const kh = (ing.nameKh || '').toLowerCase();
      const en = (ing.nameEn || '').toLowerCase();
      return (kh && itemName.includes(kh)) || (en && itemName.includes(en)) || (kh && kh.includes(itemName));
    });

    const unitCost = matched ? matched.costPerUnitUsd : (item.unitCostUsd || 0.002);
    const totalCost = unitCost * (item.quantity || 1);

    return {
      name: item.name,
      quantity: item.quantity || 1,
      unit: item.unit || 'g',
      matchedIngredientId: matched?.id,
      unitCostUsd: unitCost,
      totalCostUsd: Math.round(totalCost * 100) / 100,
      inStock: matched ? matched.currentStock > 0 : false,
    };
  });

  const totalBatchCost = enrichedIngredients.reduce((sum, item) => sum + item.totalCostUsd, 0) || 4.2;
  const costPerPiece = totalBatchCost / Math.max(1, yieldQty);
  const suggestedPrice = raw.suggestedSellPriceUsd || Math.max(1.5, Math.round(costPerPiece * 3.2 * 10) / 10);
  const profitMargin = Math.round(((suggestedPrice - costPerPiece) / suggestedPrice) * 100);

  return {
    id: `recipe-ai-${Date.now()}`,
    nameKh: raw.nameKh || 'នំរូបមន្តថ្មី AI Chef',
    nameEn: raw.nameEn || 'AI Chef Artisan Pastry',
    category: raw.category || 'pastries',
    descriptionKh: raw.descriptionKh || 'រូបមន្តនំថ្មីស្រាវជ្រាវដោយ AI Chef ស្តង់ដារបារាំង',
    yieldQuantity: yieldQty,
    yieldUnit: raw.yieldUnit || 'ដុំ',
    bakerPercentages: raw.bakerPercentages || [
      { ingredientName: 'ម្សៅមី Bread Flour', percentage: 100, weightGrams: 500 },
      { ingredientName: 'ទឹកដោះគោ Fresh Milk', percentage: 60, weightGrams: 300 },
      { ingredientName: 'ប៊័រ French Butter', percentage: 40, weightGrams: 200 },
      { ingredientName: 'ស្ករស Sugar', percentage: 12, weightGrams: 60 },
      { ingredientName: 'មេនំបុ័ង Yeast', percentage: 2, weightGrams: 10 },
      { ingredientName: 'អំបិល Salt', percentage: 1.8, weightGrams: 9 },
    ],
    ingredientsList: enrichedIngredients,
    instructionsKh: raw.instructionsKh || [
      'ជំហានទី ១៖ ថ្លឹងគ្រឿងផ្សំទាំងអស់តាមរូបមន្ត Baker’s Percentage ដោយសុក្រឹត។',
      'ជំហានទី ២៖ វាយម្សៅឱ្យឡើង Glutein Windowpane Test រួចទុកផ្អាប់ ៤៥ នាទី។',
      'ជំហានទី ៣៖ កាត់ទម្ងន់ស្មើៗគ្នា មូលជាដុំ និងទុកឱ្យឡើងទ្វេដង (Final Proofing)។',
      'ជំហានទី ៤៖ ដុតក្នុងចង្ក្រានកម្តៅ ១៩០°C រយៈពេល ១៨-២០ នាទី រហូតដល់ពណ៌មាសក្រហមក្រអូប។',
    ],
    bakingTempC: raw.bakingTempC || 190,
    bakingTimeMinutes: raw.bakingTimeMinutes || 18,
    proofingTimeMinutes: raw.proofingTimeMinutes || 60,
    chefSecretTipKh: raw.chefSecretTipKh || 'ប្រើប៊័របារាំង 82% ខ្លាញ់ត្រជាក់ពេលកិនម្សៅ ធ្វើឱ្យស្រទាប់នំស្រួយក្រអូបប្លែកពីគេ!',
    totalBatchCostUsd: Math.round(totalBatchCost * 100) / 100,
    costPerPieceUsd: Math.round(costPerPiece * 100) / 100,
    suggestedSellPriceUsd: suggestedPrice,
    profitMarginPercent: Math.max(40, Math.min(85, profitMargin)),
  };
}

/**
 * Offline Master Artisan Formulas (Fallback)
 */
function generateOfflineArtisanRecipe(
  prompt: string,
  storeIngredients: Ingredient[],
  exchangeRate: number
): AiGeneratedRecipe {
  const p = prompt.toLowerCase();

  let nameKh = 'នំក្រូសង់ពីស្តាស៊ីអូ & ស្ករត្នោត (Artisan Pistachio Croissant)';
  let nameEn = 'Artisan Pistachio & Palm Sugar Croissant';
  let category = 'pastries';
  let desc = 'នំក្រូសង់បារាំងស្រួយ ស្រទាប់ច្រើន ផ្សំស្នូលពីស្តាស៊ីអូក្រអូបឈ្ងុយ និងស្ករត្នោតធម្មជាតិខ្មែរ។';
  let temp = 195;
  let time = 18;
  let tip = 'ប្រើប៊័របារាំងត្រជាក់ 82% fat និងផ្អាប់ម្សៅក្នុងបន្ទប់ត្រជាក់ ៤°C យ៉ាងតិច ៤ ម៉ោងដើម្បីឱ្យឡើងស្រទាប់ Honeycomb ស្អាតឥតខ្ចោះ។';

  if (p.includes('durian') || p.includes('ទុរេន')) {
    nameKh = 'នំខេកទុរេនកំពតឈីហ្វុន (Kampot Durian Chiffon Cake)';
    nameEn = 'Kampot Durian Cloud Chiffon';
    category = 'cakes';
    desc = 'សាច់នំទន់ដូចពពក ជាមួយសាច់ទុរេនកំពតសុទ្ធ ១០០% និងក្រែមទឹកដោះគោស្រស់។';
    temp = 160;
    time = 45;
    tip = 'កុំបើកទ្វារចង្ក្រានពេលដុត ៣០ នាទីដំបូង ហើយពេលឆ្អិនត្រូវផ្កាប់ពុម្ពភ្លាមៗដើម្បីកុំឱ្យស្រុត។';
  } else if (p.includes('bread') || p.includes('នំបុ័ង') || p.includes('shokupan')) {
    nameKh = 'នំបុ័ងជប៉ុនទឹកដោះគោពពក (Japanese Shokupan Milk Bread)';
    nameEn = 'Hokkaido Cloud Shokupan';
    category = 'breads';
    desc = 'នំបុ័ងទឹកដោះគោជប៉ុនទន់ស្វិត រក្សាភាពទន់បាន ៣ ថ្ងៃដោយមិនប្រើសារធាតុគីមីតាមក្បួន Yudane Method។';
    temp = 180;
    time = 32;
    tip = 'ប្រើបច្ចេកទេស Yudane (ចាក់ទឹកក្តៅ ៩០°C លើម្សៅ) ធ្វើឱ្យនំបុ័ងទន់សំណើមពិសេស។';
  } else if (p.includes('macaron')) {
    nameKh = 'French Macarons កាហ្វេទឹកដោះគោខ្មែរ (Khmer Coffee Macarons)';
    nameEn = 'Artisan Khmer Coffee Macarons';
    category = 'cookies';
    desc = 'សំបកម៉ាកាហ្គុងស្រួយស្រាល ស្នូលហ្គាណាសកាហ្វេត្នោតខ្មែរឈ្ងុយជាប់ចិត្ត។';
    temp = 150;
    time = 14;
    tip = 'ទុកឱ្យសំបកម៉ាកាហ្គុងស្ងួតស្រទាប់លើ (Skin) ៣០ នាទីមុនដុត ដើម្បីឱ្យដុះជើងស្អាត (Pied de Macaron)។';
  }

  const raw = {
    nameKh,
    nameEn,
    category,
    descriptionKh: desc,
    yieldQuantity: 12,
    yieldUnit: 'ដុំ',
    bakingTempC: temp,
    bakingTimeMinutes: time,
    proofingTimeMinutes: 75,
    chefSecretTipKh: tip,
    suggestedSellPriceUsd: 2.20,
    ingredientsList: [
      { name: 'ម្សៅមី Bread Flour T55', quantity: 500, unit: 'g', unitCostUsd: 0.0016, totalCostUsd: 0.8 },
      { name: 'ប៊័របារាំង French Butter', quantity: 260, unit: 'g', unitCostUsd: 0.009, totalCostUsd: 2.34 },
      { name: 'ទឹកដោះគោស្រស់ Milk', quantity: 280, unit: 'ml', unitCostUsd: 0.002, totalCostUsd: 0.56 },
      { name: 'ស្ករស / ស្ករត្នោត Sugar', quantity: 60, unit: 'g', unitCostUsd: 0.0015, totalCostUsd: 0.09 },
      { name: 'មេនំបុ័ង Instant Yeast', quantity: 10, unit: 'g', unitCostUsd: 0.015, totalCostUsd: 0.15 },
      { name: 'អំបិល Sea Salt', quantity: 9, unit: 'g', unitCostUsd: 0.001, totalCostUsd: 0.01 },
      { name: 'ស្នូលពិសេស Filling', quantity: 150, unit: 'g', unitCostUsd: 0.008, totalCostUsd: 1.2 },
    ],
  };

  return enrichRecipeWithCosts(raw, storeIngredients);
}
