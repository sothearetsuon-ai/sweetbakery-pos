import { getGeminiApiKey, getGeminiApiKeyAsync, getUsableGeminiModels } from './geminiInvoiceService';
import { roundKhr } from '../utils/currencyUtils';

export interface GeneratedCakeDesign {
  cakeNameKh: string;
  cakeNameEn: string;
  themeKh: string;
  occasionKh: string;
  tiers: number;
  shape: string;
  estimatedSize: string;
  suggestedPriceKhr: number;
  suggestedPriceUsd: number;
  suggestedDepositKhr: number;
  recommendedFlavorKh: string;
  recommendedInscription: string;
  bakingTechniqueNotesKh: string;
  colorPalette: string[];
  decorElements: string[];
  renderedImage: string; // Data URL of the generated visual artwork
}

export interface CakeDesignPromptParams {
  userPrompt: string;
  theme: string;
  occasion: string;
  tiers: number;
  shape: string;
  colorScheme: string;
  exchangeRate?: number;
}

/**
 * Generate a custom procedural SVG/Canvas high-definition cake render image
 */
export function generateCakeRenderImage(params: {
  cakeName: string;
  tiers: number;
  shape: string;
  primaryColor: string;
  accentColor: string;
  theme: string;
  inscription?: string;
}): string {
  const width = 800;
  const height = 800;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background Studio Ambient
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 450);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(0.6, '#fff5f7');
  bgGrad.addColorStop(1, '#fde2e4');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft Studio Lighting
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(width * 0.3, height * 0.25, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Pedestal / Cake Stand
  const centerX = width / 2;
  const baseY = height * 0.74;

  // Stand Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(100, 60, 70, 0.15)';
  ctx.beginPath();
  ctx.ellipse(centerX, baseY + 60, 260, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stand Plate
  const standGrad = ctx.createLinearGradient(centerX - 240, baseY, centerX + 240, baseY + 40);
  standGrad.addColorStop(0, '#f8fafc');
  standGrad.addColorStop(0.5, '#e2e8f0');
  standGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = standGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, baseY + 20, 240, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#94a3b8';
  ctx.stroke();

  // Stand Pillar
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(centerX - 40, baseY + 25);
  ctx.lineTo(centerX - 60, baseY + 80);
  ctx.lineTo(centerX + 60, baseY + 80);
  ctx.lineTo(centerX + 40, baseY + 25);
  ctx.closePath();
  ctx.fill();

  // Stand Base Foot
  ctx.beginPath();
  ctx.ellipse(centerX, baseY + 80, 110, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Colors Palette
  const colorMap: Record<string, { top: string; body: string; drip: string; border: string }> = {
    pink: { top: '#fce7f3', body: '#fbcfe8', drip: '#f43f5e', border: '#f472b6' },
    blue: { top: '#e0f2fe', body: '#bae6fd', drip: '#0284c7', border: '#38bdf8' },
    gold: { top: '#fef3c7', body: '#fde68a', drip: '#b45309', border: '#f59e0b' },
    chocolate: { top: '#78350f', body: '#451a03', drip: '#270e02', border: '#92400e' },
    white: { top: '#ffffff', body: '#f8fafc', drip: '#cbd5e1', border: '#e2e8f0' },
    purple: { top: '#f3e8ff', body: '#e9d5ff', drip: '#9333ea', border: '#c084fc' },
    mint: { top: '#ecfdf5', body: '#a7f3d0', drip: '#059669', border: '#34d399' },
  };

  const selectedPalette = colorMap[params.primaryColor.toLowerCase()] || colorMap.pink;

  // Render Tiers (Bottom to Top)
  const tierCount = Math.max(1, Math.min(3, params.tiers));

  const tierConfigs = [
    { w: 340, h: 110, y: baseY - 110 },
    { w: 250, h: 95, y: baseY - 205 },
    { w: 170, h: 85, y: baseY - 290 },
  ].slice(0, tierCount);

  tierConfigs.forEach((tier, idx) => {
    // Drop shadow under tier
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.ellipse(centerX, tier.y + tier.h + 5, tier.w / 2 + 10, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cake Cylinder Body
    ctx.save();
    const tierGrad = ctx.createLinearGradient(centerX - tier.w / 2, tier.y, centerX + tier.w / 2, tier.y);
    tierGrad.addColorStop(0, selectedPalette.border);
    tierGrad.addColorStop(0.25, selectedPalette.body);
    tierGrad.addColorStop(0.75, selectedPalette.top);
    tierGrad.addColorStop(1, selectedPalette.border);

    ctx.fillStyle = tierGrad;
    ctx.beginPath();
    ctx.ellipse(centerX, tier.y + tier.h, tier.w / 2, 22, 0, 0, Math.PI); // bottom round
    ctx.lineTo(centerX - tier.w / 2, tier.y);
    ctx.ellipse(centerX, tier.y, tier.w / 2, 22, 0, Math.PI, 0, true); // top round inverse
    ctx.lineTo(centerX + tier.w / 2, tier.y + tier.h);
    ctx.closePath();
    ctx.fill();

    // Top Surface
    ctx.fillStyle = selectedPalette.top;
    ctx.beginPath();
    ctx.ellipse(centerX, tier.y, tier.w / 2, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();

    // Drips / Frosting Cascades
    ctx.fillStyle = selectedPalette.drip;
    const dripCount = Math.floor(tier.w / 28);
    for (let d = 0; d < dripCount; d++) {
      const dx = centerX - tier.w / 2 + (d + 0.5) * (tier.w / dripCount);
      const dripLen = 14 + ((d * 17) % 24);
      ctx.beginPath();
      ctx.arc(dx, tier.y + dripLen, 5, 0, Math.PI);
      ctx.lineTo(dx - 5, tier.y + 4);
      ctx.lineTo(dx + 5, tier.y + 4);
      ctx.closePath();
      ctx.fill();
    }

    // Pearls / Rosettes on the bottom border
    const pearlCount = Math.floor(tier.w / 16);
    for (let p = 0; p <= pearlCount; p++) {
      const angle = Math.PI - (p / pearlCount) * Math.PI;
      const px = centerX + (tier.w / 2) * Math.cos(angle);
      const py = tier.y + tier.h + 20 * Math.sin(angle);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
      ctx.beginPath();
      ctx.arc(px - 1, py - 1, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // Top Tier Toppers & Theme Props
  const topTier = tierConfigs[tierConfigs.length - 1];
  const topperY = topTier.y - 10;

  ctx.save();
  // Strawberries, Cherries, or Macarons
  const toppers = [-45, -15, 18, 48];
  toppers.forEach((offset, i) => {
    ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#ec4899';
    ctx.beginPath();
    ctx.arc(centerX + offset, topperY - 12 + (i % 2) * 5, 12, 0, Math.PI * 2);
    ctx.fill();

    // Strawberry seed highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX + offset - 4, topperY - 16 + (i % 2) * 5, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Center Golden Candle / Sparkler
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(centerX - 3, topperY - 70, 6, 60);

  // Candle Flame Glow
  const flameGrad = ctx.createRadialGradient(centerX, topperY - 80, 2, centerX, topperY - 80, 20);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.3, '#fef08a');
  flameGrad.addColorStop(0.7, '#f97316');
  flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.arc(centerX, topperY - 80, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Inscription text on middle or bottom tier
  if (params.inscription) {
    ctx.save();
    ctx.font = 'bold 20px "Khmer OS Battambang", "Siemreap", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#991b1b';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 6;
    const textTier = tierConfigs[0];
    ctx.fillText(params.inscription, centerX, textTier.y + textTier.h * 0.65);
    ctx.restore();
  }

  // Watermark Header Pill
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.roundRect(width / 2 - 190, 25, 380, 48, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 16px "Khmer OS Battambang", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e11d48';
  ctx.fillText('✨ SWEET BAKERY AI CAKE DESIGNER', width / 2, 54);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Generate a complete AI cake design with price calculation, recipe specs, and render
 */
export async function generateCakeDesignWithAi(
  params: CakeDesignPromptParams
): Promise<GeneratedCakeDesign> {
  const exchangeRate = params.exchangeRate || 4100;
  let apiKey = getGeminiApiKey().trim();
  if (!apiKey) {
    apiKey = await getGeminiApiKeyAsync();
  }

  // Default fallback design structure if offline
  const baseTiers = params.tiers || 2;
  const basePriceUsd = baseTiers === 1 ? 16 : baseTiers === 2 ? 38 : 75;
  const basePriceKhr = roundKhr(basePriceUsd * exchangeRate);
  const baseDepositKhr = roundKhr(basePriceKhr * 0.5);

  const localFallback: GeneratedCakeDesign = {
    cakeNameKh: `នំខេក ${params.theme || 'ប្រណីត'} ${baseTiers} ជាន់ (${params.colorScheme || 'Pastel'})`,
    cakeNameEn: `${params.theme || 'Luxury'} Celebration Cake (${baseTiers} Tiers)`,
    themeKh: params.theme || 'ស្ទីលទាន់សម័យ',
    occasionKh: params.occasion || 'ពិធីខួបកំណើត (Birthday)',
    tiers: baseTiers,
    shape: params.shape || 'មូល (Round)',
    estimatedSize: `${baseTiers} ជាន់ (${baseTiers === 1 ? '8"' : baseTiers === 2 ? '8" + 6"' : '10" + 8" + 6"'}) - សម្រាប់ ${baseTiers * 8} នាក់`,
    suggestedPriceKhr: basePriceKhr,
    suggestedPriceUsd: basePriceUsd,
    suggestedDepositKhr: baseDepositKhr,
    recommendedFlavorKh: 'សូកូឡាបែលហ្ស៊ិក & ក្រែមស្រស់ស្ត្រប៊ែរី',
    recommendedInscription: 'Happy Birthday to You 💖🎂',
    bakingTechniqueNotesKh: 'ប្រើក្រែម Swiss Meringue Buttercream, បាញ់ផ្កា និងស្រោប Fondant រលោង, រក្សាក្នុងទូក្លាស្សេ ៤°C។',
    colorPalette: [params.colorScheme || 'Rose Pink', 'Gold Luster', 'Pure Cream White'],
    decorElements: ['ផ្កាកុលាបស្ករ Edible Roses', 'Macarons បារាំង', 'ស្លឹកមាស 24K Gold Leaf', 'ទៀនភ្លោះប្រណីត'],
    renderedImage: generateCakeRenderImage({
      cakeName: params.theme,
      tiers: baseTiers,
      shape: params.shape,
      primaryColor: params.colorScheme.toLowerCase().includes('blue')
        ? 'blue'
        : params.colorScheme.toLowerCase().includes('gold')
        ? 'gold'
        : params.colorScheme.toLowerCase().includes('choc')
        ? 'chocolate'
        : 'pink',
      accentColor: '#f59e0b',
      theme: params.theme,
      inscription: 'Happy Birthday 💖',
    }),
  };

  if (!apiKey) {
    return localFallback;
  }

  const prompt = `You are the Lead Master Pastry Chef & AI Cake Architect at Sweet Bakery Cambodia.
The customer wants a bespoke custom cake designed according to these specifications:
- Customer Request/Idea: "${params.userPrompt}"
- Occasion: "${params.occasion}"
- Theme: "${params.theme}"
- Desired Tiers: ${params.tiers}
- Cake Shape: "${params.shape}"
- Preferred Color Scheme: "${params.colorScheme}"
- Currency Exchange Rate: 1 USD = ${exchangeRate} KHR

Generate a creative, stunning, realistic Cambodian bakery cake blueprint.
Rules for Pricing:
- 1 Tier: $15 - $25 (60,000 - 100,000 KHR)
- 2 Tiers: $35 - $60 (140,000 - 250,000 KHR)
- 3 Tiers: $70 - $150 (280,000 - 600,000 KHR)
Deposit is strictly 50% of total price.

CRITICAL REQUIREMENT:
Output ONLY a valid JSON object starting with { and ending with }.
NO markdown fences (\`\`\`json), NO comments, NO other text.

JSON Schema:
{
  "cakeNameKh": "ឈ្មោះនំពិរោះៗជាភាសាខ្មែរ",
  "cakeNameEn": "English Cake Name",
  "themeKh": "ប្រធានបទម៉ូដ",
  "occasionKh": "កម្មវិធី",
  "tiers": ${params.tiers},
  "shape": "${params.shape}",
  "estimatedSize": "ទំហំ និងចំណុះភ្ញៀវ",
  "suggestedPriceKhr": 160000,
  "suggestedPriceUsd": 40.0,
  "suggestedDepositKhr": 80000,
  "recommendedFlavorKh": "រសជាតិនំ និងស្នូលក្រែម",
  "recommendedInscription": "អក្សរជូនពរលើនំ",
  "bakingTechniqueNotesKh": "បច្ចេកទេសដុតនំ និងតុបតែងលម្អិតសម្រាប់កូនជាង",
  "colorPalette": ["ពណ៌ចម្បង", "ពណ៌បន្ទាប់បន្សំ", "ពណ៌រំលេច"],
  "decorElements": ["គ្រឿងតុបតែង ១", "គ្រឿងតុបតែង ២", "គ្រឿងតុបតែង ៣"]
}`;

  try {
    const usableModels = await getUsableGeminiModels(apiKey);
    let rawText = '';
    for (const model of usableModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!resp.ok) continue;
        const data = await resp.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          rawText = candidate;
          break;
        }
      } catch (_) {
        continue;
      }
    }

    if (!rawText) return localFallback;

    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return localFallback;

    const parsed = JSON.parse(jsonMatch[0]);

    const rendered = generateCakeRenderImage({
      cakeName: parsed.cakeNameKh || params.theme,
      tiers: parsed.tiers || params.tiers || 2,
      shape: parsed.shape || params.shape || 'មូល',
      primaryColor: params.colorScheme.toLowerCase().includes('blue')
        ? 'blue'
        : params.colorScheme.toLowerCase().includes('gold')
        ? 'gold'
        : params.colorScheme.toLowerCase().includes('choc')
        ? 'chocolate'
        : params.colorScheme.toLowerCase().includes('mint')
        ? 'mint'
        : params.colorScheme.toLowerCase().includes('purple')
        ? 'purple'
        : 'pink',
      accentColor: '#f59e0b',
      theme: parsed.themeKh || params.theme,
      inscription: parsed.recommendedInscription || 'Happy Birthday 💖',
    });

    return {
      cakeNameKh: parsed.cakeNameKh || localFallback.cakeNameKh,
      cakeNameEn: parsed.cakeNameEn || localFallback.cakeNameEn,
      themeKh: parsed.themeKh || localFallback.themeKh,
      occasionKh: parsed.occasionKh || localFallback.occasionKh,
      tiers: parsed.tiers || localFallback.tiers,
      shape: parsed.shape || localFallback.shape,
      estimatedSize: parsed.estimatedSize || localFallback.estimatedSize,
      suggestedPriceKhr: roundKhr(parsed.suggestedPriceKhr || localFallback.suggestedPriceKhr),
      suggestedPriceUsd: parsed.suggestedPriceUsd || localFallback.suggestedPriceUsd,
      suggestedDepositKhr: roundKhr(parsed.suggestedDepositKhr || localFallback.suggestedDepositKhr),
      recommendedFlavorKh: parsed.recommendedFlavorKh || localFallback.recommendedFlavorKh,
      recommendedInscription: parsed.recommendedInscription || localFallback.recommendedInscription,
      bakingTechniqueNotesKh: parsed.bakingTechniqueNotesKh || localFallback.bakingTechniqueNotesKh,
      colorPalette: parsed.colorPalette || localFallback.colorPalette,
      decorElements: parsed.decorElements || localFallback.decorElements,
      renderedImage: rendered,
    };
  } catch (err) {
    console.warn('[GenerativeCake] Fallback to local procedural:', err);
    return localFallback;
  }
}

