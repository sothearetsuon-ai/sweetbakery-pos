import { CompletedSale, CustomCakeOrder, Expense, Shift, StoreInfo } from '../types';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifySales: boolean;
  notifyCustomOrders: boolean;
  notifyExpenses: boolean;
  notifyShiftClose: boolean;
}

const STORAGE_KEY = 'bakery_telegram_config';

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  enabled: true,
  notifySales: true,
  notifyCustomOrders: true,
  notifyExpenses: true,
  notifyShiftClose: true,
};

/**
 * Retrieve saved Telegram config from localStorage
 */
export const getStoredTelegramConfig = (): TelegramConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_TELEGRAM_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Error loading Telegram config:', e);
  }
  return DEFAULT_TELEGRAM_CONFIG;
};

/**
 * Save Telegram config to localStorage and server LAN sync
 */
export const saveStoredTelegramConfig = (config: TelegramConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Also push to server LAN sync if available so other devices (phones) get it
    fetch('/api/lan-sync')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          fetch('/api/lan-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, telegramConfig: config }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  } catch (e) {
    console.error('Error saving Telegram config:', e);
  }
};

/**
 * Retrieve saved Telegram config (with fallback to LAN sync / server for mobile devices)
 */
export const getStoredTelegramConfigAsync = async (): Promise<TelegramConfig> => {
  let config = getStoredTelegramConfig();
  if (config.botToken && config.chatId) {
    return config;
  }

  // Fallback: If mobile phone doesn't have credentials in localStorage, fetch from server
  try {
    const res = await fetch('/api/lan-sync');
    if (res.ok) {
      const data = await res.json();
      if (data?.telegramConfig?.botToken && data?.telegramConfig?.chatId) {
        saveStoredTelegramConfig(data.telegramConfig);
        return { ...DEFAULT_TELEGRAM_CONFIG, ...data.telegramConfig };
      }
    }
  } catch (e) {
    console.warn('[Telegram] Could not fetch server telegram config:', e);
  }

  return config;
};

/**
 * Send raw HTML message via Telegram Bot API
 */
export const sendTelegramMessage = async (
  text: string,
  customConfig?: TelegramConfig
): Promise<{ success: boolean; message: string; data?: any }> => {
  const config = customConfig || (await getStoredTelegramConfigAsync());

  if (!config.botToken || !config.chatId) {
    return { success: false, message: 'សូមបំពេញ Bot Token និង Chat ID ជាមុនសិន!' };
  }

  const cleanToken = config.botToken.trim();
  const cleanChatId = config.chatId.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      let errDesc = data.description || 'កំហុសមិនស្គាល់';
      if (errDesc.includes('Unauthorized') || errDesc.includes('Not Found')) {
        errDesc = 'Bot Token មិនត្រឹមត្រូវ (Invalid Bot Token)';
      } else if (errDesc.includes('chat not found')) {
        errDesc = 'រកមិនឃើញ Chat ID នេះឡើយ។ សូមប្រាកដថាអ្នកបានចុច /start ក្នុង Bot ឬបាន Add Bot ចូល Group!';
      }
      return {
        success: false,
        message: `Telegram Error: ${errDesc}`,
      };
    }

    return {
      success: true,
      message: 'សារត្រូវបានផ្ញើទៅកាន់ Telegram ជោគជ័យ!',
      data: data.result,
    };
  } catch (error: any) {
    console.error('Telegram API request failed:', error);
    return {
      success: false,
      message: `មិនអាចភ្ជាប់ទៅ Telegram API បានទេ: ${error.message || 'សូមពិនិត្យអ៊ីនធឺណិត'}`,
    };
  }
};

/**
 * Escape HTML special characters for safe Telegram HTML parsing
 */
export const escapeHtml = (str?: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Helper to convert Base64 Data URL to Blob for binary upload
 */
const dataURLtoBlob = (dataurl: string): Blob | null => {
  try {
    const parts = dataurl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    // Remove all whitespace/newlines that could corrupt atob
    const base64Clean = parts[1].replace(/[\s\r\n]+/g, '');
    const bstr = atob(base64Clean);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error converting dataURL to blob:', e);
    return null;
  }
};

/**
 * Send Photo with Caption via Telegram Bot API
 * Supports both HTTP/HTTPS image URLs and Base64 data URLs (via Blob FormData)
 */
export const sendTelegramPhoto = async (
  photo: string,
  caption: string,
  customConfig?: TelegramConfig
): Promise<{ success: boolean; message: string; data?: any }> => {
  const config = customConfig || (await getStoredTelegramConfigAsync());

  if (!config.botToken || !config.chatId) {
    return { success: false, message: 'សូមបំពេញ Bot Token និង Chat ID ជាមុនសិន!' };
  }

  const cleanToken = config.botToken.trim();
  const cleanChatId = config.chatId.trim();

  // Telegram photo caption maximum length is 1024 characters
  const isCaptionLong = caption.length > 1000;
  const photoCaption = isCaptionLong ? caption.slice(0, 990) + '...' : caption;

  try {
    // 1. If photo is a Base64 data URL, upload as binary multipart/form-data
    if (photo.startsWith('data:')) {
      const blob = dataURLtoBlob(photo);
      if (blob) {
        const formData = new FormData();
        formData.append('chat_id', cleanChatId);
        formData.append('photo', blob, 'cake.jpg');
        formData.append('caption', photoCaption);
        formData.append('parse_mode', 'HTML');

        const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendPhoto`, {
          method: 'POST',
          body: formData,
        });

        let data = await response.json();

        // If HTML parsing failed, retry with plain text (strip tags)
        if (!response.ok || !data.ok) {
          if (data.description && data.description.includes('parse entities')) {
            console.warn('[Telegram Photo] HTML parse failed, retrying plain text:', data.description);
            const plainCaption = photoCaption.replace(/<[^>]*>/g, '');
            const retryFormData = new FormData();
            retryFormData.append('chat_id', cleanChatId);
            retryFormData.append('photo', blob, 'cake.jpg');
            retryFormData.append('caption', plainCaption);
            const retryRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendPhoto`, {
              method: 'POST',
              body: retryFormData,
            });
            data = await retryRes.json();
          }
        }

        if (data.ok) {
          if (isCaptionLong) {
            await sendTelegramMessage(caption, config);
          }
          return { success: true, message: 'ផ្ញើរូបភាពជោគជ័យ!', data: data.result };
        }
        console.warn('sendPhoto with blob failed, falling back to text:', data.description);
      }
    } else if (photo.startsWith('http://') || photo.startsWith('https://')) {
      // 2. If photo is a Web URL (e.g. Firebase Storage)
      const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          photo,
          caption: photoCaption,
          parse_mode: 'HTML',
        }),
      });

      let data = await response.json();

      // If HTML parsing failed, retry with plain text
      if (!response.ok || !data.ok) {
        if (data.description && data.description.includes('parse entities')) {
          console.warn('[Telegram Photo] URL HTML parse failed, retrying plain text:', data.description);
          const plainCaption = photoCaption.replace(/<[^>]*>/g, '');
          const retryRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: cleanChatId,
              photo,
              caption: plainCaption,
            }),
          });
          data = await retryRes.json();
        }
      }

      if (data.ok) {
        if (isCaptionLong) {
          await sendTelegramMessage(caption, config);
        }
        return { success: true, message: 'ផ្ញើរូបភាពជោគជ័យ!', data: data.result };
      }
      console.warn('sendPhoto with URL failed, falling back to text:', data.description);
    }

    // Fallback: If image fails or format not supported, send regular text message
    return await sendTelegramMessage(caption, config);
  } catch (error: any) {
    console.error('sendTelegramPhoto exception, falling back to text:', error);
    return await sendTelegramMessage(caption, config);
  }
};

/**
 * Test Telegram Bot connection & verify credentials
 */
export const testTelegramConnection = async (
  botToken: string,
  chatId: string
): Promise<{ success: boolean; message: string; botUsername?: string }> => {
  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    return {
      success: false,
      message: 'សូមបញ្ចូល Bot Token និង Chat ID ឱ្យបានត្រឹមត្រូវ!',
    };
  }

  try {
    // 1. Verify Bot Token
    const meRes = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
    const meData = await meRes.json();

    if (!meRes.ok || !meData.ok) {
      return {
        success: false,
        message: 'Bot Token មិនត្រឹមត្រូវ! សូមពិនិត្យមើលកូដ Token ដែលបាន Copy ពី @BotFather',
      };
    }

    const botName = meData.result?.first_name || 'Bot';
    const botUsername = meData.result?.username || 'Unknown';

    // 2. Send test message
    const nowStr = new Date().toLocaleString('km-KH');
    const testMsg = `🎉 <b>ការតភ្ជាប់ Telegram Bot ជោគជ័យ!</b>\n\n` +
      `🍰 <b>ហាង៖</b> SweetBakery & Cafe\n` +
      `🤖 <b>Bot Name:</b> ${botName} (@${botUsername})\n` +
      `⏰ <b>កាលបរិច្ឆេទ៖</b> ${nowStr}\n\n` +
      `✅ ប្រព័ន្ធ POS នឹងផ្ញើដំណឹងលក់ និងកុម្ម៉ង់នំមកកាន់ទីនេះដោយស្វ័យប្រវត្តិ!`;

    const sendRes = await sendTelegramMessage(testMsg, {
      botToken: cleanToken,
      chatId: cleanChatId,
      enabled: true,
      notifySales: true,
      notifyCustomOrders: true,
      notifyExpenses: true,
      notifyShiftClose: true,
    });

    if (!sendRes.success) {
      return {
        success: false,
        message: sendRes.message,
      };
    }

    return {
      success: true,
      message: `បានតភ្ជាប់ទៅកាន់ Bot @${botUsername} និងបានផ្ញើសារសាកល្បងជោគជ័យ!`,
      botUsername,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `កំហុសក្នុងការតភ្ជាប់: ${error.message || 'សូមពិនិត្យមើលអ៊ីនធឺណិត'}`,
    };
  }
};

/**
 * Format & send notification for a newly completed POS sale
 */
export const notifyTelegramSale = async (
  sale: CompletedSale,
  storeInfo?: StoreInfo,
  exchangeRate = 4100
): Promise<void> => {
  const config = await getStoredTelegramConfigAsync();
  if (!config.enabled || !config.notifySales || !config.botToken || !config.chatId) {
    console.warn('[Telegram Alert] Sale notification skipped:', {
      enabled: config.enabled,
      notifySales: config.notifySales,
      hasBotToken: Boolean(config.botToken),
      hasChatId: Boolean(config.chatId),
    });
    return;
  }

  const storeTitle = storeInfo?.nameKh || 'ហាងនំ SweetBakery';
  const totalKhr = sale.totalKhr ?? Math.round(sale.totalUsd * exchangeRate);
  const now = new Date(sale.createdAt || Date.now());
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('km-KH');

  const paymentText =
    sale.paymentMethod === 'KHQR_BAKONG'
      ? '📲 KHQR Bakong / ធនាគារ'
      : sale.paymentMethod === 'CASH_KHR'
      ? '💵 សាច់ប្រាក់ (៛ រៀល)'
      : '💵 សាច់ប្រាក់ ($ ដុល្លារ)';

  const itemsList = sale.items
    .map(
      (item) =>
        `• <b>${escapeHtml(item.nameKh)}</b> × ${item.quantity}  <i>($${(item.priceUsd * item.quantity).toFixed(2)})</i>`
    )
    .join('\n');

  const text =
    `🍰 <b>[${escapeHtml(storeTitle)}] — វិក្កយបត្រលក់ថ្មី!</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🧾 <b>លេខវិក្កយបត្រ៖</b> <code>#${sale.orderNumber}</code>\n` +
    `⏰ <b>ម៉ោង៖</b> ${timeStr} • ${dateStr}\n` +
    `👤 <b>អ្នកគិតប្រាក់៖</b> ${escapeHtml(sale.cashierName || 'Cashier')}\n\n` +
    `🛒 <b>មុខទំនិញដែលបានលក់៖</b>\n` +
    `${itemsList}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>ទឹកប្រាក់សរុប៖</b> <b>${totalKhr.toLocaleString()} ៛</b>  <i>($${sale.totalUsd.toFixed(2)})</i>\n` +
    `💳 <b>វិធីទូទាត់៖</b> ${paymentText}\n` +
    `✨ <i>សូមអរគុណ! សូមហាងរកស៊ីកាន់តែមានបាន!</i>`;

  // Find if any item in this sale has an image
  const itemWithImage = sale.items.find((item) => Boolean(item.image));
  const photoUrl = itemWithImage?.image;

  console.log('[Telegram Alert] Sending sale notification for invoice:', sale.orderNumber, 'hasPhoto:', Boolean(photoUrl));
  let res;
  if (photoUrl) {
    res = await sendTelegramPhoto(photoUrl, text, config);
  } else {
    res = await sendTelegramMessage(text, config);
  }
  console.log('[Telegram Alert] Sale send result:', res);
};

/**
 * Format & send notification for a new custom cake order
 */
export const notifyTelegramCustomOrder = async (
  order: CustomCakeOrder,
  storeInfo?: StoreInfo,
  exchangeRate = 4100
): Promise<void> => {
  const config = await getStoredTelegramConfigAsync();
  if (!config.enabled || !config.notifyCustomOrders || !config.botToken || !config.chatId) {
    console.warn('[Telegram Alert] Order notification skipped:', {
      enabled: config.enabled,
      notifyCustomOrders: config.notifyCustomOrders,
      hasBotToken: Boolean(config.botToken),
      hasChatId: Boolean(config.chatId),
    });
    return;
  }

  const storeTitle = storeInfo?.nameKh || 'ហាងនំ SweetBakery';
  const totalKhr = order.totalKhr ?? Math.round(order.totalUsd * exchangeRate);
  const depositKhr = order.depositKhr ?? Math.round(order.depositUsd * exchangeRate);
  const remainingUsd = Math.max(0, order.totalUsd - order.depositUsd);
  const remainingKhr = Math.round(remainingUsd * exchangeRate);

  const text =
    `🎂 <b>[${escapeHtml(storeTitle)}] — មានភ្ញៀវកុម្ម៉ង់នំខួបកំណើតថ្មី!</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🏷️ <b>កូដកុម្ម៉ង់៖</b> <code>#${order.orderNumber}</code>\n` +
    `👤 <b>អតិថិជន៖</b> <b>${escapeHtml(order.customerName)}</b>\n` +
    `📞 <b>ទូរស័ព្ទ៖</b> <a href="tel:${order.phone}">${order.phone}</a>\n\n` +
    `🎂 <b>ឈ្មោះនំ៖</b> <b>${escapeHtml(order.cakeName)}</b>\n` +
    `📏 <b>ទំហំ៖</b> ${escapeHtml(order.size)}\n` +
    `🍓 <b>រសជាតិ៖</b> ${escapeHtml(order.flavor)}\n` +
    (order.inscription ? `✍️ <b>អក្សរលើនំ៖</b> <i>"${escapeHtml(order.inscription)}"</i>\n` : '') +
    (order.themeNotes ? `📝 <b>ចំណាំ៖</b> ${escapeHtml(order.themeNotes)}\n` : '') +
    `━━━━━━━━━━━━━━━━━━\n` +
    `⏰ <b>ថ្ងៃ & ម៉ោងមកយក៖</b> <b>${order.pickupDate} វេលាម៉ោង ${order.pickupTime}</b>\n\n` +
    `💵 <b>តម្លៃសរុប៖</b> <b>${totalKhr.toLocaleString()} ៛</b> ($${order.totalUsd.toFixed(2)})\n` +
    `👛 <b>បានកក់រួច៖</b> <b>${depositKhr.toLocaleString()} ៛ ($${order.depositUsd.toFixed(2)})</b>\n` +
    (remainingUsd > 0
      ? `⚠️ <b>នៅខ្វះពេលមកយក៖</b> <b>${remainingKhr.toLocaleString()} ៛</b> ($${remainingUsd.toFixed(2)})\n`
      : `✅ <b>បានបង់ប្រាក់គ្រប់ ១០០%</b>\n`);

  console.log('[Telegram Alert] Sending custom order notification for:', order.orderNumber, 'hasPhoto:', Boolean(order.referenceImage));
  if (order.referenceImage) {
    const res = await sendTelegramPhoto(order.referenceImage, text, config);
    console.log('[Telegram Alert] Photo send result:', res);
  } else {
    const res = await sendTelegramMessage(text, config);
    console.log('[Telegram Alert] Text send result:', res);
  }
};

/**
 * Format & send notification for a recorded expense
 */
export const notifyTelegramExpense = async (
  expense: Expense,
  storeInfo?: StoreInfo,
  exchangeRate = 4100
): Promise<void> => {
  const config = await getStoredTelegramConfigAsync();
  if (!config.enabled || !config.notifyExpenses || !config.botToken || !config.chatId) return;

  const storeTitle = storeInfo?.nameKh || 'ហាងនំ SweetBakery';
  const amountKhr = expense.amountKhr ?? Math.round(expense.amountUsd * exchangeRate);

  const text =
    `💸 <b>[${storeTitle}] — កត់ត្រាការចំណាយថ្មី</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📦 <b>មុខទំនិញ/ការចំណាយ៖</b> <b>${expense.title}</b>\n` +
    (expense.quantity ? `🔢 <b>ចំនួន៖</b> ${expense.quantity} ${expense.unit || ''}\n` : '') +
    `💰 <b>ទឹកប្រាក់ចំណាយ៖</b> <b>${amountKhr.toLocaleString()} ៛</b> <i>($${expense.amountUsd.toFixed(2)})</i>\n` +
    `👤 <b>អ្នកចំណាយ៖</b> ${expense.paidBy}\n` +
    (expense.notes ? `📝 <b>កំណត់សម្គាល់៖</b> ${expense.notes}\n` : '') +
    `⏰ <b>កាលបរិច្ឆេទ៖</b> ${expense.date}`;

  if (expense.receiptImage) {
    await sendTelegramPhoto(expense.receiptImage, text, config);
  } else {
    await sendTelegramMessage(text, config);
  }
};

/**
 * Format & send notification when closing a cashier shift
 */
export const notifyTelegramShiftClose = async (
  shift: Shift,
  storeInfo?: StoreInfo,
  exchangeRate = 4100
): Promise<void> => {
  const config = await getStoredTelegramConfigAsync();
  if (!config.enabled || !config.notifyShiftClose || !config.botToken || !config.chatId) return;

  const storeTitle = storeInfo?.nameKh || 'ហាងនំ SweetBakery';
  const startStr = new Date(shift.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endStr = new Date(shift.endTime || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const totalSalesKhr = Math.round(shift.totalSalesUsd * exchangeRate);

  const text =
    `🏁 <b>[${storeTitle}] — របាយការណ៍បិទវេនលក់ (Shift Closed)</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>អ្នកគិតប្រាក់៖</b> <b>${shift.cashierName}</b>\n` +
    `⏱️ <b>ពេលដំណើរការ៖</b> ${startStr} ដល់ ${endStr}\n` +
    `🧾 <b>ចំនួនវិក្កយបត្រសរុប៖</b> <b>${shift.totalOrdersCount} វិក្កយបត្រ</b>\n` +
    `💰 <b>ចំណូលលក់សរុប៖</b> <b>${totalSalesKhr.toLocaleString()} ៛</b> <i>($${shift.totalSalesUsd.toFixed(2)})</i>\n\n` +
    `💵 <b>សាច់ប្រាក់ក្នុងថតពេលបិទ៖</b>\n` +
    `• លុយរៀល៖ ${(shift.closingCashKhr || 0).toLocaleString()} ៛\n` +
    `• លុយដុល្លារ៖ $${(shift.closingCashUsd || 0).toFixed(2)}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `✨ <i>បិទវេនលក់ដោយជោគជ័យ!</i>`;

  await sendTelegramMessage(text, config);
};
