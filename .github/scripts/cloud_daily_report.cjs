/**
 * SweetBakery POS - 24/7 Cloud Automated Daily Telegram Report Bot
 * 
 * Runs in the cloud (via GitHub Actions Cron or standalone Node.js)
 * Fetches sales & expenses directly from Google Cloud Firestore
 * Sends comprehensive Daily & Monthly Summary reports to Telegram
 * even when all local computers, tablets, and phones are turned off.
 */

const FIREBASE_PROJECT_ID = 'sweetbakery-8040d';
const FIREBASE_API_KEY = 'AIzaSyAUcTJMNMOAjT_FrtmJsaM68otwUnujrXg';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

// Helper: Escape HTML characters for Telegram HTML parse_mode
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Helper: Convert Firestore REST API value to native JavaScript value
function parseFirestoreValue(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('mapValue' in val) {
    const res = {};
    const fields = val.mapValue.fields || {};
    for (const k of Object.keys(fields)) {
      res[k] = parseFirestoreValue(fields[k]);
    }
    return res;
  }
  if ('arrayValue' in val) {
    const list = val.arrayValue.values || [];
    return list.map(parseFirestoreValue);
  }
  return null;
}

// Helper: Parse full Firestore document
function parseFirestoreDoc(doc) {
  if (!doc) return null;
  const id = doc.name ? doc.name.split('/').pop() : '';
  const res = { id };
  const fields = doc.fields || {};
  for (const k of Object.keys(fields)) {
    res[k] = parseFirestoreValue(fields[k]);
  }
  return res;
}

// Helper: Fetch a single document from Firestore REST API
async function fetchFirestoreDoc(collectionName, docId) {
  const url = `${FIRESTORE_BASE_URL}/${collectionName}/${docId}?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch ${collectionName}/${docId}: ${res.status} ${errText}`);
  }
  const json = await res.json();
  return parseFirestoreDoc(json);
}

// Helper: Fetch all documents from a Firestore collection (handles pagination)
async function fetchFirestoreCollection(collectionName) {
  const documents = [];
  let pageToken = '';
  do {
    const url = `${FIRESTORE_BASE_URL}/${collectionName}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}&key=${FIREBASE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) return [];
      const errText = await res.text();
      console.warn(`[Cloud Report] Warning fetching ${collectionName}: ${res.status} ${errText}`);
      break;
    }
    const json = await res.json();
    if (json.documents && Array.isArray(json.documents)) {
      for (const d of json.documents) {
        const parsed = parseFirestoreDoc(d);
        if (parsed) documents.push(parsed);
      }
    }
    pageToken = json.nextPageToken || '';
  } while (pageToken);

  return documents;
}

// Helper: Write/Patch a document in Firestore REST API
async function patchFirestoreDoc(collectionName, docId, fieldsObj) {
  const url = `${FIRESTORE_BASE_URL}/${collectionName}/${docId}?key=${FIREBASE_API_KEY}`;
  
  // Format fields to Firestore REST schema
  function toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return { integerValue: String(val) };
      return { doubleValue: val };
    }
    if (typeof val === 'boolean') return { booleanValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map(toFirestoreValue) } };
    }
    if (typeof val === 'object') {
      const fields = {};
      for (const k of Object.keys(val)) {
        fields[k] = toFirestoreValue(val[k]);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  const fields = {};
  for (const k of Object.keys(fieldsObj)) {
    fields[k] = toFirestoreValue(fieldsObj[k]);
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Cloud Report] Error patching ${collectionName}/${docId}:`, errText);
    return false;
  }
  return true;
}

// Helper: Get Cambodia Date String (YYYY-MM-DD)
function getCambodiaDateStr(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

// Helper: Get Cambodia Time String (HH:mm)
function getCambodiaTimeStr(d = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

// Helper: Format Date to DD/MM/YYYY
function formatDateDMY(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
  return parts;
}

// Helper: Parse target chat IDs
function parseTelegramChatIds(chatIdStr, botToken) {
  const defaultGroup = '-5528089668';
  if (!chatIdStr) return [defaultGroup];
  const parts = chatIdStr.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
  const set = new Set(parts);
  set.add(defaultGroup);
  return Array.from(set);
}

// Helper: Send message to Telegram Bot API
async function sendTelegramMessage(botToken, chatId, text) {
  const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: String(chatId).trim(),
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json();
  return data;
}

// Main report generation
function generateReportHtml(params) {
  const {
    sales = [],
    expenses = [],
    customOrders = [],
    storeInfo,
    exchangeRate = 4100,
    targetDate,
    timeDisplay,
  } = params;

  const currentMonthStr = targetDate.slice(0, 7); // YYYY-MM

  // Filter Sales for Target Date
  const todaySales = sales.filter((s) => (s.createdAt || '').slice(0, 10) === targetDate);
  const todaySalesCount = todaySales.length;
  const todaySalesUsd = todaySales.reduce((sum, s) => sum + (s.totalUsd || 0), 0);
  const todaySalesKhr = todaySales.reduce(
    (sum, s) => sum + (s.totalKhr || Math.round((s.totalUsd || 0) * exchangeRate)),
    0
  );

  // Payment Breakdown
  const bakongSalesKhr = todaySales
    .filter((s) => s.paymentMethod === 'KHQR_BAKONG')
    .reduce((sum, s) => sum + (s.totalKhr || Math.round((s.totalUsd || 0) * exchangeRate)), 0);
  const cashKhrSalesKhr = todaySales
    .filter((s) => s.paymentMethod === 'CASH_KHR')
    .reduce((sum, s) => sum + (s.totalKhr || Math.round((s.totalUsd || 0) * exchangeRate)), 0);
  const cashUsdSalesUsd = todaySales
    .filter((s) => s.paymentMethod === 'CASH_USD')
    .reduce((sum, s) => sum + (s.totalUsd || 0), 0);

  const bakongPct = todaySalesKhr > 0 ? Math.round((bakongSalesKhr / todaySalesKhr) * 100) : 0;
  const cashKhrPct = todaySalesKhr > 0 ? Math.round((cashKhrSalesKhr / todaySalesKhr) * 100) : 0;

  // Custom cake orders created or for today
  const todayOrders = customOrders.filter(
    (o) => (o.createdAt || o.pickupDate || '').slice(0, 10) === targetDate
  );
  const todayOrdersDepositsKhr = todayOrders.reduce(
    (sum, o) => sum + (o.depositKhr || Math.round((o.depositUsd || 0) * exchangeRate)),
    0
  );

  // Filter Expenses for Today
  const isIngExpense = (e) => e.expenseType === 'INGREDIENT' || e.category === 'INGREDIENTS';
  const todayExpenses = expenses.filter((e) => (e.date || e.createdAt || '').slice(0, 10) === targetDate);
  const todayExpensesCount = todayExpenses.length;
  const todayExpensesUsd = todayExpenses.reduce((sum, e) => sum + (e.amountUsd || 0), 0);
  const todayExpensesKhr = todayExpenses.reduce(
    (sum, e) => sum + (e.amountKhr || Math.round((e.amountUsd || 0) * exchangeRate)),
    0
  );

  const todayIngExpensesKhr = todayExpenses
    .filter(isIngExpense)
    .reduce((sum, e) => sum + (e.amountKhr || Math.round((e.amountUsd || 0) * exchangeRate)), 0);
  const todayGenExpensesKhr = todayExpenses
    .filter((e) => !isIngExpense(e))
    .reduce((sum, e) => sum + (e.amountKhr || Math.round((e.amountUsd || 0) * exchangeRate)), 0);

  // Daily Net Profit
  const todayNetProfitKhr = todaySalesKhr - todayExpensesKhr;
  const todayNetProfitUsd = Number((todaySalesUsd - todayExpensesUsd).toFixed(2));
  const todayMarginPct = todaySalesUsd > 0 ? ((todayNetProfitUsd / todaySalesUsd) * 100).toFixed(1) : '0';

  // Best-selling items today
  const itemMap = new Map();
  todaySales.forEach((s) => {
    (s.items || []).forEach((item) => {
      const name = item.nameKh || item.nameEn || 'ទំនិញ';
      itemMap.set(name, (itemMap.get(name) || 0) + (item.quantity || 1));
    });
  });
  const topItems = Array.from(itemMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Month-to-date (MTD)
  const monthSales = sales.filter((s) => (s.createdAt || '').slice(0, 7) === currentMonthStr);
  const monthSalesCount = monthSales.length;
  const monthSalesUsd = monthSales.reduce((sum, s) => sum + (s.totalUsd || 0), 0);
  const monthSalesKhr = monthSales.reduce(
    (sum, s) => sum + (s.totalKhr || Math.round((s.totalUsd || 0) * exchangeRate)),
    0
  );

  const monthExpenses = expenses.filter((e) => (e.date || e.createdAt || '').slice(0, 7) === currentMonthStr);
  const monthExpensesUsd = monthExpenses.reduce((sum, e) => sum + (e.amountUsd || 0), 0);
  const monthExpensesKhr = monthExpenses.reduce(
    (sum, e) => sum + (e.amountKhr || Math.round((e.amountUsd || 0) * exchangeRate)),
    0
  );

  const monthNetProfitUsd = Number((monthSalesUsd - monthExpensesUsd).toFixed(2));
  const monthNetProfitKhr = monthSalesKhr - monthExpensesKhr;
  const monthMarginPct = monthSalesUsd > 0 ? ((monthNetProfitUsd / monthSalesUsd) * 100).toFixed(1) : '0';

  // Month Name in Khmer
  const monthNamesKh = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const [, mStr] = currentMonthStr.split('-');
  const monthKhName = monthNamesKh[parseInt(mStr, 10) - 1] || mStr;

  // Day of week in Khmer
  const dObj = new Date(targetDate + 'T12:00:00Z');
  const dayNamesKh = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const dayOfWeekKh = dayNamesKh[dObj.getDay()] || '';
  const dateFormatted = formatDateDMY(targetDate);

  const storeTitle = escapeHtml(storeInfo?.nameKh || 'ហាងនំ SweetBakery');

  // Intelligent AI Insights Summary
  let aiInsightText = '';
  if (todayNetProfitKhr > 0) {
    aiInsightText = `ថ្ងៃនេះការលក់មានភាពកាក់កប ចំណេញសុទ្ធ <b>+${todayNetProfitKhr.toLocaleString()} ៛ ($${todayNetProfitUsd.toFixed(2)})</b> (អត្រាចំណេញ ${todayMarginPct}%)។ `;
    if (topItems.length > 0) {
      aiInsightText += `មុខទំនិញលក់ដាច់បំផុតគឺ <i>"${escapeHtml(topItems[0][0])}"</i>។ `;
    }
    if (bakongPct > 40) {
      aiInsightText += `ការទូទាត់តាម KHQR មានដល់ ${bakongPct}% ជួយកាត់បន្ថយការកាន់សាច់ប្រាក់។`;
    }
  } else if (todayExpensesKhr > 0 && todaySalesKhr === 0) {
    aiInsightText = `ថ្ងៃនេះមិនទាន់មានវិក្កយបត្រលក់ទេ ប៉ុន្តែមានការកត់ត្រាចំណាយសរុប <b>${todayExpensesKhr.toLocaleString()} ៛</b>។`;
  } else if (todayExpensesKhr > todaySalesKhr) {
    aiInsightText = `ថ្ងៃនេះការចំណាយខ្ពស់ជាងចំណូលលក់បន្តិច (ភាគច្រើនលើការទិញគ្រឿងផ្សំស្តុក)។ សរុបខែ${monthKhName}នៅតែរក្សាបានប្រាក់ចំណេញសុទ្ធ <b>+${monthNetProfitKhr.toLocaleString()} ៛</b>។`;
  } else {
    aiInsightText = `អាជីវកម្មដំណើរការល្អធម្មតា។ ខែ${monthKhName}នេះសម្រេចបានចំណូលលក់សរុប <b>${monthSalesKhr.toLocaleString()} ៛ ($${monthSalesUsd.toFixed(2)})</b> ជាមួយអត្រាចំណេញ ${monthMarginPct}%។`;
  }

  // Top items list formatted
  const topItemsFormatted = topItems.length > 0
    ? topItems.map(([name, qty], idx) => `   ${idx + 1}. <b>${escapeHtml(name)}</b> × ${qty}`).join('\n')
    : '   <i>(មិនទាន់មានទំនិញលក់ចេញ)</i>';

  return (
    `📊 <b>[${storeTitle}] — របាយការណ៍បូកសរុបការលក់ & ចំណាយ</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🤖 <b>ប្រព័ន្ធដំណើរការ៖</b> 24/7 Cloud Automated Bot (ស្វ័យប្រវត្តិតាម Cloud)\n` +
    `📅 <b>កាលបរិច្ឆេទ៖</b> ថ្ងៃ${dayOfWeekKh} ទី ${dateFormatted}\n` +
    `⏰ <b>ម៉ោងចេញរបាយការណ៍៖</b> ${timeDisplay} (ICT ម៉ោងកម្ពុជា)\n\n` +
    `💵 <b>១. សង្ខេបការលក់ថ្ងៃនេះ (Daily Sales)៖</b>\n` +
    `• ចំនួនវិក្កយបត្រ៖ <b>${todaySalesCount} វិក្កយបត្រ</b>\n` +
    `• ចំណូលលក់សរុប៖ <b>${todaySalesKhr.toLocaleString()} ៛</b> <i>($${todaySalesUsd.toFixed(2)})</i>\n` +
    `  ├ 📲 KHQR Bakong: <b>${bakongSalesKhr.toLocaleString()} ៛</b> (${bakongPct}%)\n` +
    `  ├ 💵 សាច់ប្រាក់ (៛): <b>${cashKhrSalesKhr.toLocaleString()} ៛</b> (${cashKhrPct}%)\n` +
    `  └ 💵 សាច់ប្រាក់ ($): <b>$${cashUsdSalesUsd.toFixed(2)}</b>\n` +
    (todayOrders.length > 0 ? `• 🎂 នំខួបកំណើតកុម្ម៉ង់ថ្មី៖ <b>${todayOrders.length} នំ</b> (ប្រាក់កក់: ${todayOrdersDepositsKhr.toLocaleString()} ៛)\n` : '') +
    `\n💸 <b>២. សង្ខេបការចំណាយថ្ងៃនេះ (Daily Expenses)៖</b>\n` +
    `• ចំណាយសរុប៖ <b>${todayExpensesKhr.toLocaleString()} ៛</b> <i>($${todayExpensesUsd.toFixed(2)})</i> [${todayExpensesCount} មុខ]\n` +
    `  ├ 🥚 គ្រឿងផ្សំ (COGS): <b>${todayIngExpensesKhr.toLocaleString()} ៛</b>\n` +
    `  └ 🏢 ទូទៅ/ប្រតិបត្តិការ: <b>${todayGenExpensesKhr.toLocaleString()} ៛</b>\n\n` +
    `📈 <b>៣. ប្រាក់ចំណេញសុទ្ធថ្ងៃនេះ (Daily Net Profit)៖</b>\n` +
    `• ចំណេញសុទ្ធ៖ <b>${todayNetProfitKhr >= 0 ? '+' : ''}${todayNetProfitKhr.toLocaleString()} ៛</b> <i>($${todayNetProfitUsd >= 0 ? '+' : ''}${todayNetProfitUsd.toFixed(2)})</i>\n` +
    `• អត្រាចំណេញ (Margin)៖ <b>${todayMarginPct}%</b>\n\n` +
    `🏆 <b>៤. មុខទំនិញលក់ដាច់បំផុតថ្ងៃនេះ៖</b>\n` +
    `${topItemsFormatted}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📅 <b>៥. វឌ្ឍនភាពប្រចាំខែ${monthKhName} (Month-to-Date)៖</b>\n` +
    `• ចំណូលលក់សរុប៖ <b>${monthSalesKhr.toLocaleString()} ៛</b> <i>($${monthSalesUsd.toFixed(2)})</i> [${monthSalesCount} វិក្កយបត្រ]\n` +
    `• ចំណាយសរុប៖ <b>${monthExpensesKhr.toLocaleString()} ៛</b> <i>($${monthExpensesUsd.toFixed(2)})</i>\n` +
    `• ចំណេញសុទ្ធខែនេះ៖ <b>${monthNetProfitKhr >= 0 ? '+' : ''}${monthNetProfitKhr.toLocaleString()} ៛</b> <i>($${monthNetProfitUsd >= 0 ? '+' : ''}${monthNetProfitUsd.toFixed(2)})</i> [${monthMarginPct}%]\n\n` +
    `💡 <b>៦. ការវិភាគដោយជំនួយការ AI៖</b>\n` +
    `<i>${aiInsightText}</i>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `✨ <i>របាយការណ៍ស្វ័យប្រវត្តិ ២៤/៧ ចេញដោយ SweetBakery Cloud Bot (ទោះមិនបើក App ក៏ផ្ញើជូនជាប្រចាំ)</i>`
  );
}

async function main() {
  console.log('=== [SweetBakery POS] 24/7 Cloud Automated Daily Report Bot ===');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isForce = args.includes('--force');
  let targetDate = '';

  for (const arg of args) {
    if (arg.startsWith('--date=')) {
      targetDate = arg.split('=')[1].trim();
    }
  }

  const now = new Date();
  const cambodiaToday = getCambodiaDateStr(now);
  const cambodiaCurrentTime = getCambodiaTimeStr(now);

  if (!targetDate) {
    targetDate = cambodiaToday;
  }

  console.log(`[Time] Cambodia Date: ${cambodiaToday}, Current Time: ${cambodiaCurrentTime}`);
  console.log(`[Target] Target Report Date: ${targetDate}`);
  if (isDryRun) console.log('[Mode] DRY RUN mode (no messages or database updates will be sent)');
  if (isForce) console.log('[Mode] FORCE mode (ignoring schedule and deduplication locks)');

  // 1. Fetch settings from Firestore
  console.log('[Firestore] Fetching Telegram & Store settings...');
  const [telegramSettings, storeInfo, currencySettings] = await Promise.all([
    fetchFirestoreDoc('settings', 'telegram'),
    fetchFirestoreDoc('settings', 'storeInfo'),
    fetchFirestoreDoc('settings', 'currency'),
  ]);

  if (!telegramSettings) {
    console.error('[Error] No settings/telegram document found in Firestore. Exiting.');
    process.exit(1);
  }

  const botToken = (telegramSettings.botToken || '').trim();
  const chatId = telegramSettings.chatId || '-5528089668';
  const adminChatId = (telegramSettings.adminChatId || '8970210109').trim();
  const recipientMode = telegramSettings.dailyReportRecipient || 'ADMIN_ONLY';
  const scheduledTime = telegramSettings.dailyReportTime || '21:00';
  const isEnabled = telegramSettings.enabled !== false;
  const notifyDailyReport = telegramSettings.notifyDailyReport !== false;
  const exchangeRate = currencySettings?.exchangeRate || 4100;

  console.log(`[Config] Bot Token: ${botToken ? 'Configured (Active)' : 'MISSING'}`);
  console.log(`[Config] Recipient Mode: ${recipientMode}`);
  console.log(`[Config] Admin Chat ID: ${adminChatId}`);
  console.log(`[Config] Group Chat ID: ${chatId}`);
  console.log(`[Config] Scheduled Time: ${scheduledTime} ICT (Enabled: ${isEnabled}, NotifyReport: ${notifyDailyReport})`);

  if (!botToken) {
    console.error('[Error] Telegram Bot Token is missing. Please set botToken in Settings > Telegram.');
    process.exit(1);
  }

  if (!isEnabled || !notifyDailyReport) {
    console.log('[Notice] Telegram Daily Report is disabled in settings. Exiting.');
    return;
  }

  // 2. Schedule Timing Check (only when checking today's date in non-force mode)
  if (!isForce && !isDryRun && targetDate === cambodiaToday) {
    const [schedH, schedM] = scheduledTime.split(':').map((s) => parseInt(s, 10));
    const [currH, currM] = cambodiaCurrentTime.split(':').map((s) => parseInt(s, 10));
    const schedMinutes = (isNaN(schedH) ? 21 : schedH) * 60 + (isNaN(schedM) ? 0 : schedM);
    const currMinutes = currH * 60 + currM;

    // If current time is earlier than the scheduled time, skip run
    if (currMinutes < schedMinutes) {
      console.log(`[Schedule] Current time (${cambodiaCurrentTime}) is before scheduled time (${scheduledTime}). Skipping until scheduled hour.`);
      return;
    }
  }

  // 3. Deduplication Check via Firestore log
  const eventKey = `daily_report_${targetDate}`;
  let existingLog = null;
  try {
    existingLog = await fetchFirestoreDoc('daily_report_logs', eventKey);
  } catch (e) {
    console.warn('[Notice] Could not read daily_report_logs:', e.message);
  }

  // 4. Fetch sales, expenses, and custom orders
  console.log('[Firestore] Fetching sales, expenses, and custom orders...');
  const [sales, expenses, customOrders] = await Promise.all([
    fetchFirestoreCollection('sales'),
    fetchFirestoreCollection('expenses'),
    fetchFirestoreCollection('customOrders'),
  ]);

  console.log(`[Data] Loaded ${sales.length} sales, ${expenses.length} expenses, ${customOrders.length} custom orders.`);

  // Calculate snapshot of target date to detect changes
  const targetSales = sales.filter((s) => (s.createdAt || '').slice(0, 10) === targetDate);
  const targetExpenses = expenses.filter((e) => (e.date || e.createdAt || '').slice(0, 10) === targetDate);
  const targetSalesUsd = targetSales.reduce((sum, s) => sum + (s.totalUsd || 0), 0);
  const targetExpensesUsd = targetExpenses.reduce((sum, e) => sum + (e.amountUsd || 0), 0);

  if (existingLog && !isForce && !isDryRun) {
    // If a report was already sent today, check if sales or expenses changed
    const prevSalesCount = existingLog.salesCount ?? -1;
    const prevSalesUsd = existingLog.salesUsd ?? -1;
    const prevExpCount = existingLog.expensesCount ?? -1;
    const prevExpUsd = existingLog.expensesUsd ?? -1;

    if (
      prevSalesCount === targetSales.length &&
      Math.abs(prevSalesUsd - targetSalesUsd) < 0.01 &&
      prevExpCount === targetExpenses.length &&
      Math.abs(prevExpUsd - targetExpensesUsd) < 0.01
    ) {
      console.log(`[Deduplication] Report for ${targetDate} was already sent (sentAt: ${new Date(existingLog.sentAt || 0).toISOString()}) and data is unchanged. Skipping duplicate notification.`);
      return;
    } else {
      console.log(`[Update] New sales/expenses detected since previous report. Re-sending updated summary for ${targetDate}.`);
    }
  }

  // 5. Generate Report Text
  console.log('[Report] Generating report HTML text...');
  const timeDisplay = `${cambodiaCurrentTime} (ម៉ោង ${scheduledTime})`;
  const reportHtml = generateReportHtml({
    sales,
    expenses,
    customOrders,
    storeInfo,
    exchangeRate,
    targetDate,
    timeDisplay,
  });

  if (isDryRun) {
    console.log('\n--- GENERATED REPORT PREVIEW ---');
    console.log(reportHtml);
    console.log('--------------------------------\n');
    return;
  }

  // 6. Determine Target Chat IDs
  let targetChatIds = [];
  if (recipientMode === 'ADMIN_ONLY') {
    targetChatIds = [adminChatId];
  } else if (recipientMode === 'GROUP_ONLY') {
    targetChatIds = parseTelegramChatIds(chatId, botToken);
  } else {
    // 'BOTH'
    const groupIds = parseTelegramChatIds(chatId, botToken);
    const set = new Set(groupIds);
    if (adminChatId) set.add(adminChatId);
    targetChatIds = Array.from(set);
  }

  targetChatIds = Array.from(new Set(targetChatIds.map((id) => String(id).trim()).filter(Boolean)));
  console.log(`[Telegram] Sending daily report to recipients: ${targetChatIds.join(', ')}...`);

  let anySuccess = false;
  for (const tid of targetChatIds) {
    try {
      let res = await sendTelegramMessage(botToken, tid, reportHtml);
      if (res.ok) {
        console.log(`[Telegram] Successfully sent to chat ID ${tid}`);
        anySuccess = true;
      } else {
        console.warn(`[Telegram] Failed to send to chat ID ${tid}:`, res.description);
        // Smart Fallback: If Admin private chat is blocked (e.g. hasn't clicked /start), fallback to store group
        if (
          tid === adminChatId &&
          (res.description?.includes('Forbidden') ||
            res.description?.includes('/start') ||
            res.description?.includes('initiate conversation'))
        ) {
          console.warn('[Telegram] Admin private chat blocked. Retrying to fallback store group -5528089668...');
          const retryRes = await sendTelegramMessage(botToken, '-5528089668', reportHtml);
          if (retryRes.ok) {
            console.log('[Telegram] Successfully delivered to fallback store group -5528089668');
            anySuccess = true;
          }
        }
      }
    } catch (e) {
      console.error(`[Telegram] Network error sending to ${tid}:`, e.message);
    }
  }

  // 7. Record log in Firestore
  if (anySuccess) {
    console.log(`[Firestore] Updating daily_report_logs/${eventKey}...`);
    await patchFirestoreDoc('daily_report_logs', eventKey, {
      date: targetDate,
      sentAt: Date.now(),
      recipients: targetChatIds,
      salesCount: targetSales.length,
      salesUsd: targetSalesUsd,
      expensesCount: targetExpenses.length,
      expensesUsd: targetExpensesUsd,
      source: 'CLOUD_BOT',
    });
    console.log('✅ Daily report successfully processed and logged!');
  } else {
    console.error('❌ Failed to deliver report to any chat ID.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
