import { getGeminiApiKey, getGeminiApiKeyAsync } from './geminiInvoiceService';
import { Product } from '../types';

export interface CustomerAiAction {
  type: 'SET_SIZE_BUDGET' | 'SET_FLAVOR' | 'SET_INSCRIPTION' | 'SET_STEP' | 'SELECT_PRODUCT' | 'OPEN_LOCATION';
  label: string;
  payload?: any;
}

export interface CustomerAiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  actions?: CustomerAiAction[];
}

export interface CustomerAiContext {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  exchangeRate: number;
  availableProducts: Product[];
  availableFlavors: { label: string; nameKh: string; isAvailable?: boolean }[];
  currentStep: number;
  selectedCakeName?: string;
  selectedSize?: string;
  cakePriceKhr?: number;
  selectedFlavor?: string;
  inscription?: string;
}

// -------------------------------------------------------------
// Pre-built Local Intelligence & Knowledge Base (Khmer & English)
// -------------------------------------------------------------

export const ORDERING_STEPS_GUIDE: CustomerAiMessage = {
  id: 'guide-steps',
  sender: 'assistant',
  text: `📋 **របៀបកុម្ម៉ង់នំងាយៗ ៤ ជំហានជាមួយ Sweet Bakery៖**

1️⃣ **ជំហានទី ១ - រើសម៉ូដនំ (Choose Design):**
ជ្រើសរើសម៉ូដនំស្អាតៗពីមឺនុយ ឬចុច *"កុម្ម៉ង់ម៉ូដតាមរូបភាព"* ដើម្បី Upload រូបនំដែលអ្នកស្រឡាញ់ពីទូរស័ព្ទ។

2️⃣ **ជំហានទី ២ - កំណត់ទំហំ រសជាតិ & អក្សរ (Customize):**
• កំណត់ទំហំ ឬថវិកានំ (ចាប់ពី ២០,០០០ ៛ ឡើងទៅ)
• ជ្រើសរើសរសជាតិឆ្ងាញ់ៗ (សូកូឡា, ទុរេន, តយដូង...)
• សរសេរអក្សរជូនពរលើនំ (*ឥតគិតថ្លៃ!*) និងរើសគ្រឿងតុបតែងបន្ថែម។

3️⃣ **ជំហានទី ៣ - ថ្ងៃម៉ោងមកយក & ព័ត៌មាន (Pickup & Contact):**
កំណត់កាលបរិច្ឆេទ ម៉ោងមកទទួលនំ ព្រមទាំងឈ្មោះ និងលេខទូរស័ព្ទរបស់អ្នក។

4️⃣ **ជំហានទី ៤ - កក់ប្រាក់ KHQR (Deposit & Confirm):**
ស្កេនទូទាត់ប្រាក់កក់ (៣០%, ៥០% ឬ ១០០%) តាម Bakong KHQR គ្រប់ធនាគារ រួច Upload វិក្កយបត្រដើម្បីឱ្យជាងនំចាប់ផ្តើមធ្វើភ្លាមៗ!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  quickReplies: ['ណែនាំទំហំតាមមនុស្ស', 'ណែនាំរសជាតិពេញនិយម', 'ជួយតែងអក្សរជូនពរ'],
  actions: [
    { type: 'SET_STEP', label: '👉 ទៅជំហានទី ១ (រើសម៉ូដ)', payload: { step: 1 } },
    { type: 'SET_STEP', label: '👉 ទៅជំហានទី ២ (កំណត់ម៉ូដ)', payload: { step: 2 } },
  ],
};

export const CAKE_SIZES_GUIDE: CustomerAiMessage = {
  id: 'guide-sizes',
  sender: 'assistant',
  text: `🎂 **ការណែនាំជ្រើសរើសទំហំនំ & ថវិកាតាមចំនួនភ្ញៀវ៖**

• **សម្រាប់ ២ ទៅ ៤ នាក់៖**
  ទំហំ **1.5 ទឹក (~15cm)** | តម្លៃសមរម្យ **២០,០០០ ៛ - ៣០,០០០ ៛** ($5 - $7.5)
  *(ស័ក្តិសមសម្រាប់ញ៉ាំជាលក្ខណៈគូស្នេហ៍ ឬគ្រួសារតូច)*

• **សម្រាប់ ៦ ទៅ ៨ នាក់ (ពេញនិយមបំផុត ⭐)៖**
  ទំហំ **2 ទឹក (~20cm)** | តម្លៃ **៤០,០០០ ៛ - ៥០,០០០ ៛** ($10 - $12.5)
  *(ទំហំស្តង់ដារលក់ដាច់បំផុតសម្រាប់ខួបកំណើត)*

• **សម្រាប់ ១០ ទៅ ១៤ នាក់៖**
  ទំហំ **2.5 ទឹក (~25cm)** | តម្លៃ **៦០,០០០ ៛ - ៨០,០០០ ៛** ($15 - $20)
  *(ស័ក្តិសមសម្រាប់ជួបជុំមិត្តភក្តិ ឬពិធីខួបកំណើត)*

• **សម្រាប់ ១៥ ទៅ ២០ នាក់៖**
  ទំហំ **3 ទឹក (~30cm)** | តម្លៃ **១០០,០០០ ៛ - ១២០,០០០ ៛** ($25 - $30)

• **សម្រាប់ ២០+ នាក់ / កម្មវិធីធំ៖**
  នំ **២ ជាន់ (2-Tier)** | តម្លៃ **១៥០,០០០ ៛ - ២០០,០០០ ៛+** ($37 - $50+)

💡 *អ្នកអាចចុចប៊ូតុងខាងក្រោមដើម្បីជ្រើសរើសទំហំ & តម្លៃដែលពេញចិត្តភ្លាមៗ៖*`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actions: [
    { type: 'SET_SIZE_BUDGET', label: '✓ រើស 1.5 ទឹក (២០,០០០ ៛)', payload: { khr: 20000, size: '1.5 ទឹក (~15cm)' } },
    { type: 'SET_SIZE_BUDGET', label: '⭐ រើស 2 ទឹក (៤០,០០០ ៛) - ពេញនិយម', payload: { khr: 40000, size: '2 ទឹក (~20cm)' } },
    { type: 'SET_SIZE_BUDGET', label: '✓ រើស 2.5 ទឹក (៦០,០០០ ៛)', payload: { khr: 60000, size: '2.5 ទឹក (~25cm)' } },
    { type: 'SET_SIZE_BUDGET', label: '✓ រើស 3 ទឹក (១០០,០០០ ៛)', payload: { khr: 100000, size: '3 ទឹក (~30cm)' } },
    { type: 'SET_SIZE_BUDGET', label: '👑 រើស នំ ២ ជាន់ (១៥០,០០០ ៛)', payload: { khr: 150000, size: '2 ជាន់' } },
  ],
};

export const FLAVOR_RECOMMENDATIONS_GUIDE = (
  availableFlavors: { label: string; nameKh: string; isAvailable?: boolean }[]
): CustomerAiMessage => {
  const inStock = availableFlavors.filter((f) => f.isAvailable !== false);
  const actions: CustomerAiAction[] = inStock.slice(0, 4).map((f) => ({
    type: 'SET_FLAVOR',
    label: `✓ រើសរសជាតិ "${f.nameKh}"`,
    payload: { flavor: f.label },
  }));

  return {
    id: 'guide-flavors',
    sender: 'assistant',
    text: `🍓 **រសជាតិនំឆ្ងាញ់ៗប្រចាំហាង Sweet Bakery៖**

🍫 **សូកូឡា (Chocolate):** រសជាតិដិត ឈ្ងុយសូកូឡាពិតៗ ផ្អែមល្មម ក្មេងៗ និងយុវវ័យចូលចិត្តខ្លាំងជាងគេ!
🍈 **ទុរេន (Durian):** ឈ្ងុយទុរេនធម្មជាតិជាប់ចិត្ត ពិសេសសម្រាប់អ្នកគាំទ្រទុរេន។
🥥 **តយដូង (Pandan Coconut):** ក្លិនស្លឹកតយឈ្ងុយស្រាលជាមួយខ្ទិះដូង ផ្អែមត្រជាក់មិនទ្រលាន់។
🍓 **ស្ត្រប៊ែរី (Strawberry):** ជូរអែមស្រទន់ ស្រស់ស្រាយជាមួយក្រែមស្រស់។
🍠 **ត្រាវដូង (Taro Coconut):** ឈ្ងុយត្រាវធម្មជាតិ រសជាតិស្រទន់បែបប្រពៃណី។
☕ **កាហ្វេម៉ូកា (Coffee Mocha):** ឈ្ងុយកាហ្វេអារ៉ាប៊ីកា សម្រាប់មនុស្សពេញវ័យ។
🍵 **តែបៃតង (Matcha):** ឈ្ងុយតែបៃតងជប៉ុន ផ្អែមស្រាលចត់ចុងមាត់តិចៗ។

💡 *ចុចជ្រើសរើសរសជាតិដែលអ្នកស្រឡាញ់ខាងក្រោមបានភ្លាមៗ៖*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actions,
  };
};

export const INSCRIPTIONS_IDEAS_GUIDE: CustomerAiMessage = {
  id: 'guide-inscriptions',
  sender: 'assistant',
  text: `✍️ **គំនិតពាក្យជូនពរលើនំពិរោះៗ (ឥតគិតថ្លៃ)៖**

🎂 **ខួបកំណើតទូទៅ & កុមារ៖**
• *"Happy Birthday [ឈ្មោះ] 🎂🎉"*
• *"រីករាយថ្ងៃខួបកំណើតកូនសំឡាញ់ ❤️"*
• *"Happy Birthday My Little Princess 👑"*
• *"រីករាយថ្ងៃកំណើត សុខភាពល្អ & សំណាងល្អ 🌟"*

💑 **សម្រាប់គូស្នេហ៍ / សង្សារ / ប្តីប្រពន្ធ៖**
• *"Happy Birthday My Love ❤️💍"*
• *"រីករាយថ្ងៃខួបកំណើតមនុស្សល្អរបស់បង"*
• *"Happy Anniversary ស្រឡាញ់អូនរហូត"*

👨‍👩‍👧 **សម្រាប់លោកឪពុក / អ្នកម្តាយ៖**
• *"រីករាយថ្ងៃកំណើតអ្នកម្តាយ សុខភាពល្អ & អាយុយឺនយូរ ❤️"*
• *"Happy Birthday លោកប៉ាជាទីគោរពស្រឡាញ់ 💐"*

🎉 **កម្មវិធីផ្សេងៗ / ឡើងផ្ទះ / បើកហាង៖**
• *"Congratulations on Grand Opening ហេងៗ 💰"*
• *"Congratulations! ជោគជ័យគ្រប់ភារកិច្ច 🎓"*

💡 *ចុចជ្រើសរើសពាក្យជូនពរគំរូខាងក្រោមដើម្បីដាក់លើនំរបស់អ្នកភ្លាមៗ៖*`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actions: [
    { type: 'SET_INSCRIPTION', label: '✓ "Happy Birthday 🎂🎉"', payload: { text: 'Happy Birthday 🎂🎉' } },
    { type: 'SET_INSCRIPTION', label: '✓ "រីករាយថ្ងៃខួបកំណើតកូនសំឡាញ់ ❤️"', payload: { text: 'រីករាយថ្ងៃខួបកំណើតកូនសំឡាញ់ ❤️' } },
    { type: 'SET_INSCRIPTION', label: '✓ "Happy Birthday My Love ❤️"', payload: { text: 'Happy Birthday My Love ❤️' } },
    { type: 'SET_INSCRIPTION', label: '✓ "រីករាយថ្ងៃកំណើតអ្នកម្តាយ សុខភាពល្អ 💐"', payload: { text: 'រីករាយថ្ងៃកំណើតអ្នកម្តាយ សុខភាពល្អ 💐' } },
    { type: 'SET_INSCRIPTION', label: '✓ "Congratulations! ហេងៗ 💰"', payload: { text: 'Congratulations! ហេងៗ 💰' } },
  ],
};

export const BAKONG_PAYMENT_GUIDE: CustomerAiMessage = {
  id: 'guide-payment',
  sender: 'assistant',
  text: `💳 **របៀបបង់ប្រាក់កក់តាម Bakong KHQR៖**

• ហាងយើងខ្ញុំគាំទ្រ **Bakong KHQR** ដែលលោកអ្នកអាចស្កេនទូទាត់បានពីគ្រប់ធនាគារក្នុងប្រទេសកម្ពុជា (ABA, ACLEDA, Wing, Canadia, TrueMoney, Chip Mong និងធនាគារ ៣០+ ផ្សេងទៀត)!
• **ជម្រើសប្រាក់កក់៖**
  - **៥០% (ពេញនិយម)**: កក់ពាក់កណ្តាលមុន ហើយចំនួននៅសល់ទូទាត់ពេលមកយកនំ
  - **៣០%**: សម្រាប់សម្រួលការចំណាយដំបូង
  - **១០០%**: ទូទាត់ដាច់ស្រេច ពេលមកយកគ្រាន់តែបង្ហាញ Order ID គឺអាចទទួលនំភ្លាមៗ
• បន្ទាប់ពីស្កេនជោគជ័យ សូមថត Screenshot ឬ Save រូបវិក្កយបត្រ (Bank Slip) រួច Upload ក្នុងទម្រង់កុម្ម៉ង់ដើម្បីឱ្យប្រព័ន្ធបញ្ជូនការកុម្ម៉ង់ទៅកាន់ជាងនំភ្លាមៗ!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actions: [{ type: 'SET_STEP', label: '👉 ទៅជំហានទី ៤ (បង់ប្រាក់កក់ KHQR)', payload: { step: 4 } }],
};

export const PICKUP_TIME_GUIDE: CustomerAiMessage = {
  id: 'guide-pickup',
  sender: 'assistant',
  text: `⏰ **ការណែនាំអំពីពេលវេលាកុម្ម៉ង់ & ទទួលនំ៖**

• **កុម្ម៉ង់មុន ១ ថ្ងៃ (ណែនាំខ្លាំងបំផុត ⭐)៖**
  ដើម្បីឱ្យជាងនំមានពេលដុតនំថ្មីៗ ក្រឡុកក្រែមស្រស់ និងតុបតែងម៉ូដឱ្យបានផ្ចិតផ្ចង់ស្អាតឥតខ្ចោះបំផុត។
• **កុម្ម៉ង់យកក្នុងថ្ងៃតែមួយ (Same Day)៖**
  សូមកុម្ម៉ង់មុនយ៉ាងតិច **៤ ទៅ ៦ ម៉ោង** ដើម្បីឱ្យជាងនំអាចរៀបចំជូនទាន់ពេលវេលា។
• **ម៉ោងបើកហាង៖** ទទួលការកុម្ម៉ង់ជារៀងរាល់ថ្ងៃពីម៉ោង ៧:០០ ព្រឹក ដល់ ៨:០០ យប់។`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actions: [{ type: 'SET_STEP', label: '👉 កំណត់ថ្ងៃម៉ោងមកយក (ជំហានទី ៣)', payload: { step: 3 } }],
};

// -------------------------------------------------------------
// Intent Matching for zero-latency instant responses
// -------------------------------------------------------------
export function matchLocalIntent(
  query: string,
  context: CustomerAiContext
): CustomerAiMessage | null {
  const q = query.toLowerCase().trim();

  // How to order / steps
  if (
    q.includes('របៀបកុម្ម៉ង់') ||
    q.includes('កុម្ម៉ង់យ៉ាងម៉េច') ||
    q.includes('របៀបទិញ') ||
    q.includes('order យ៉ាងម៉េច') ||
    q.includes('ជំហាន') ||
    q.includes('how to order') ||
    q.includes('guide')
  ) {
    return { ...ORDERING_STEPS_GUIDE, id: 'msg-' + Date.now() };
  }

  // Size / price / people / budget
  if (
    q.includes('ទំហំ') ||
    q.includes('ប៉ុន្មាននាក់') ||
    q.includes('មនុស្ស') ||
    q.includes('តម្លៃ') ||
    q.includes('ថ្លៃប៉ុន្មាន') ||
    q.includes('budget') ||
    q.includes('size') ||
    q.includes('ទឹក') ||
    q.includes('ខ្នាត')
  ) {
    return { ...CAKE_SIZES_GUIDE, id: 'msg-' + Date.now() };
  }

  // Flavors / taste
  if (
    q.includes('រសជាតិ') ||
    q.includes('សូកូឡា') ||
    q.includes('ទុរេន') ||
    q.includes('តយ') ||
    q.includes('ឆ្ងាញ់') ||
    q.includes('flavor') ||
    q.includes('taste')
  ) {
    return { ...FLAVOR_RECOMMENDATIONS_GUIDE(context.availableFlavors), id: 'msg-' + Date.now() };
  }

  // Inscriptions / wishes / text on cake
  if (
    q.includes('អក្សរ') ||
    q.includes('ជូនពរ') ||
    q.includes('សរសេរ') ||
    q.includes('happy birthday') ||
    q.includes('ពាក្យ') ||
    q.includes('inscription') ||
    q.includes('wishes')
  ) {
    return { ...INSCRIPTIONS_IDEAS_GUIDE, id: 'msg-' + Date.now() };
  }

  // Payment / Bakong / Deposit
  if (
    q.includes('បង់លុយ') ||
    q.includes('ប្រាក់កក់') ||
    q.includes('bakong') ||
    q.includes('khqr') ||
    q.includes('aba') ||
    q.includes('កក់') ||
    q.includes('deposit') ||
    q.includes('ទូទាត់')
  ) {
    return { ...BAKONG_PAYMENT_GUIDE, id: 'msg-' + Date.now() };
  }

  // Time / Pickup / Hours
  if (
    q.includes('ម៉ោង') ||
    q.includes('ថ្ងៃ') ||
    q.includes('ពេលណា') ||
    q.includes('មកយក') ||
    q.includes('ទាន់') ||
    q.includes('pickup') ||
    q.includes('time')
  ) {
    return { ...PICKUP_TIME_GUIDE, id: 'msg-' + Date.now() };
  }

  // Location / Address / Map
  if (
    q.includes('ទីតាំង') ||
    q.includes('ហាងនៅឯណា') ||
    q.includes('កន្លែងណា') ||
    q.includes('ផែនទី') ||
    q.includes('map') ||
    q.includes('address') ||
    q.includes('location')
  ) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'assistant',
      text: `📍 **ទីតាំងហាង៖** ${context.storeAddress || 'រតនៈគីរី អូរយ៉ាដាវ'}
📞 **លេខទូរស័ព្ទ៖** ${context.storePhone || '0978707000'}

លោកអ្នកអាចចុចប៊ូតុងខាងក្រោមដើម្បីមើលទីតាំងលើផែនទី Google Maps ឬចុចទាក់ទងខលមកហាងបានផ្ទាល់!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [{ type: 'OPEN_LOCATION', label: '📍 មើលផែនទីទីតាំងហាង' }],
    };
  }

  return null;
}

// -------------------------------------------------------------
// Online AI Query using Google Gemini API
// -------------------------------------------------------------
export async function queryCustomerAiAssistant(
  userQuery: string,
  history: CustomerAiMessage[],
  context: CustomerAiContext
): Promise<CustomerAiMessage> {
  // First, check local intent for ultra-fast, offline-friendly responses
  const localMatch = matchLocalIntent(userQuery, context);
  if (localMatch) {
    return localMatch;
  }

  // Try to use Gemini API if key is available
  let apiKey = getGeminiApiKey();
  if (!apiKey) {
    apiKey = await getGeminiApiKeyAsync();
  }

  // If no Gemini key is configured, fallback to friendly context-aware assistance
  if (!apiKey || !apiKey.trim()) {
    return generateFallbackAiResponse(userQuery, context);
  }

  try {
    const systemPrompt = `You are "ជំនួយការ AI របស់ ${context.storeName || 'Sweet Bakery'}", a super friendly, polite, helpful, and sweet Cambodian bakery assistant.
You are helping a customer who is currently on the Bakery Self-Ordering Web App/Kiosk.
Always answer in natural, warm, polite, and grammatically correct Khmer language (or English if the customer asked in English). Use emojis like 🎂, 🍰, ✨, ❤️, 🍓 to make it delightful.

Bakery Context:
- Store Name: ${context.storeName || 'Sweet Bakery'}
- Phone: ${context.storePhone || '0978707000'}
- Location: ${context.storeAddress || 'រតនៈគីរី អូរយ៉ាដាវ'}
- Current Exchange Rate: $1 = ${context.exchangeRate} KHR
- Available Flavors in Store: ${context.availableFlavors.map((f) => f.nameKh).join(', ')}
- Cake Size & Price Presets: 
  - 1.5 ទឹក (~15cm, 2-4 នាក់): ២០,០០០ ៛ - ៣០,០០០ ៛ ($5 - $7.5)
  - 2 ទឹក (~20cm, 6-8 នាក់, ពេញនិយម): ៤០,០០០ ៛ - ៥០,០០០ ៛ ($10 - $12.5)
  - 2.5 ទឹក (~25cm, 10-14 នាក់): ៦០,០០០ ៛ - ៨០,០០០ ៛ ($15 - $20)
  - 3 ទឹក (~30cm, 15-20 នាក់): ១០០,០០០ ៛ - ១២០,០០០ ៛ ($25 - $30)
  - 2 ជាន់ (20+ នាក់): ១៥០,០០០ ៛ - ២០០,០០០ ៛+
- Ordering Steps: 
  Step 1: Choose cake model or upload custom design
  Step 2: Customize budget/size, flavor, cake inscription, addons
  Step 3: Choose pickup date/time, customer name and phone
  Step 4: Pay deposit with KHQR Bakong (30%, 50%, or 100%) and upload slip

Instruction:
- Keep responses concise, clear, and very practical.
- If recommending a size, explicitly provide size name and KHR price.
- If recommending a flavor, recommend ones from the store's available flavors.
- If customer asks about birthday wishes or cake writing, provide 2-3 sweet, meaningful quotes.
- At the very end of your response, if you made a specific recommendation, you may include an actionable tag on a new line:
  - [[ACTION:SET_SIZE:priceKhr:sizeLabel]] (e.g., [[ACTION:SET_SIZE:40000:2 ទឹក (~20cm)]])
  - [[ACTION:SET_FLAVOR:flavorLabel]] (e.g., [[ACTION:SET_FLAVOR:សូកូឡា (Chocolate Cake)]])
  - [[ACTION:SET_INSCRIPTION:text]] (e.g., [[ACTION:SET_INSCRIPTION:Happy Birthday My Love ❤️]])
  - [[ACTION:SET_STEP:stepNumber]] (e.g., [[ACTION:SET_STEP:2]])
- DO NOT wrap the entire response in JSON. Reply as a natural markdown chat message.`;

    const recentHistory = history.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    // Add current query
    recentHistory.push({
      role: 'user',
      parts: [{ text: userQuery }],
    });

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
    ];

    let responseText = '';

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
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: recentHistory,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          responseText =
            data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (responseText.trim()) {
            break;
          }
        }
      } catch (e) {
        // Continue to fallback model
      }
    }

    if (!responseText.trim()) {
      return generateFallbackAiResponse(userQuery, context);
    }

    // Parse any [[ACTION:...]] tags from response text
    const actions: CustomerAiAction[] = [];
    let cleanText = responseText;

    const actionRegex = /\[\[ACTION:([^\]]+)\]\]/g;
    let match;
    while ((match = actionRegex.exec(responseText)) !== null) {
      const parts = match[1].split(':');
      const actionType = parts[0];
      if (actionType === 'SET_SIZE' && parts.length >= 3) {
        const khr = Number(parts[1]) || 40000;
        const size = parts.slice(2).join(':');
        actions.push({
          type: 'SET_SIZE_BUDGET',
          label: `✓ ជ្រើសរើសទំហំនេះ (${size} - ${khr.toLocaleString()} ៛)`,
          payload: { khr, size },
        });
      } else if (actionType === 'SET_FLAVOR' && parts.length >= 2) {
        const flavor = parts.slice(1).join(':');
        actions.push({
          type: 'SET_FLAVOR',
          label: `✓ ជ្រើសរើសរសជាតិ "${flavor}"`,
          payload: { flavor },
        });
      } else if (actionType === 'SET_INSCRIPTION' && parts.length >= 2) {
        const text = parts.slice(1).join(':');
        actions.push({
          type: 'SET_INSCRIPTION',
          label: `✓ ដាក់អក្សរនេះលើនំ ("${text}")`,
          payload: { text },
        });
      } else if (actionType === 'SET_STEP' && parts.length >= 2) {
        const step = Number(parts[1]) as 1 | 2 | 3 | 4;
        actions.push({
          type: 'SET_STEP',
          label: `👉 ទៅកាន់ជំហានទី ${step}`,
          payload: { step },
        });
      }
    }

    // Clean out the action tags from readable text
    cleanText = cleanText.replace(/\[\[ACTION:[^\]]+\]\]/g, '').trim();

    return {
      id: 'ai-' + Date.now(),
      sender: 'assistant',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: actions.length > 0 ? actions : undefined,
    };
  } catch (error) {
    return generateFallbackAiResponse(userQuery, context);
  }
}

// -------------------------------------------------------------
// Fallback Response if AI offline or key unavailable
// -------------------------------------------------------------
function generateFallbackAiResponse(
  userQuery: string,
  context: CustomerAiContext
): CustomerAiMessage {
  const q = userQuery.toLowerCase();

  if (q.includes('ខួប') || q.includes('birthday') || q.includes('ពរ')) {
    return { ...INSCRIPTIONS_IDEAS_GUIDE, id: 'fb-' + Date.now() };
  }

  if (q.includes('ទំហំ') || q.includes('តម្លៃ') || q.includes('ថ្លៃ')) {
    return { ...CAKE_SIZES_GUIDE, id: 'fb-' + Date.now() };
  }

  if (q.includes('រសជាតិ')) {
    return { ...FLAVOR_RECOMMENDATIONS_GUIDE(context.availableFlavors), id: 'fb-' + Date.now() };
  }

  return {
    id: 'fb-' + Date.now(),
    sender: 'assistant',
    text: `🎂 **សួស្តីបាទ/ចាស!** ខ្ញុំជាជំនួយការ AI របស់ ${context.storeName || 'Sweet Bakery'} ✨

តើលោកអ្នកចង់ឱ្យខ្ញុំជួយណែនាំអំពីអ្វីខ្លះ?
• 📋 **របៀបកុម្ម៉ង់ ៤ ជំហានងាយៗ**
• 🎂 **ណែនាំទំហំនំ & ថវិកាតាមចំនួនភ្ញៀវ**
• 🍓 **ណែនាំរសជាតិនំឆ្ងាញ់ៗប្រចាំហាង**
• ✍️ **ជួយគិតពាក្យជូនពរពិរោះៗលើនំ**
• 💳 **របៀបបង់ប្រាក់កក់តាម Bakong KHQR**

សូមជ្រើសរើសជម្រើសខាងក្រោម ឬសរសេរសំណួររបស់អ្នកបានភ្លាមៗ!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    quickReplies: [
      'របៀបកុម្ម៉ង់ ៤ ជំហាន',
      'ណែនាំទំហំតាមមនុស្ស',
      'ណែនាំរសជាតិពេញនិយម',
      'ជួយតែងអក្សរជូនពរ',
    ],
    actions: [
      { type: 'SET_STEP', label: '👉 ទៅជំហានទី ១ (រើសម៉ូដ)', payload: { step: 1 } },
      { type: 'SET_STEP', label: '👉 ទៅជំហានទី ២ (កំណត់ទំហំ & រសជាតិ)', payload: { step: 2 } },
    ],
  };
}
