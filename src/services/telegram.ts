import { CompletedSale, CustomCakeOrder, Expense, Shift, StoreInfo } from '../types';
import { formatDateDMY, formatDateTimeDMY } from '../utils/dateUtils';
import { idbGet, idbSet } from '../utils/idbStorage';
import { saveFirestoreDoc, getFirestoreDoc, getStoreId } from './firebase';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifySales: boolean;
  notifyCustomOrders: boolean;
  notifyExpenses: boolean;
  notifyExpenseDue?: boolean;
  notifyShiftClose: boolean;
  notifyDailyReport?: boolean;
  dailyReportTime?: string; // e.g. "21:00" (9:00 PM) or "09:00" (9:00 AM)
  notifyReportOnAppClose?: boolean; // ផ្ញើរបាយការណ៍សរុបដោយស្វ័យប្រវត្តិពេលបិទ App (Default: true)
  includeAiInsight?: boolean;
  adminChatId?: string; // e.g. "8970210109" (Admin private chat id)
  dailyReportRecipient?: 'ADMIN_ONLY' | 'GROUP_ONLY' | 'BOTH'; // default: 'ADMIN_ONLY'
  notifyCustomerChat?: boolean; // ជូនដំណឹងពេលភ្ញៀវឆាតសួរនាំលើ App / Customer Portal
  listenBankAlerts?: boolean; // ស្ដាប់ដំណឹងផ្ទេរប្រាក់ស្វ័យប្រវត្តិពី Telegram Group ធនាគារ (ACLEDA / ABA Bank Alert)
  bankAlertChatId?: string; // Chat ID នៃ Group Alert ធនាគារ (បើទទេរ គឺស្ដាប់គ្រប់ Group ដែល Bot នៅ)
}

const STORAGE_KEY = 'bakery_telegram_config';

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '-5528089668',
  adminChatId: '8970210109',
  dailyReportRecipient: 'BOTH',
  enabled: true,
  notifySales: true,
  notifyCustomOrders: true,
  notifyExpenses: true,
  notifyExpenseDue: true,
  notifyShiftClose: true,
  notifyDailyReport: true,
  notifyReportOnAppClose: true, // ផ្ញើរបាយការណ៍បូកសរុបដោយស្វ័យប្រវត្តិពេលបិទ App
  dailyReportTime: '21:00', // 9:00 យប់ (ម៉ោងបិទហាងលក់សរុបប្រចាំថ្ងៃ)
  includeAiInsight: true,
  notifyCustomerChat: true,
  listenBankAlerts: true,
  bankAlertChatId: '',
};

export const isDemoModeActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === 'true' || window.location.hash === '#demo') return true;
  return localStorage.getItem('bakery_is_demo_mode') === 'true';
};

/**
 * Retrieve saved Telegram config from localStorage
 */
export const getStoredTelegramConfig = (): TelegramConfig => {
  if (isDemoModeActive()) {
    return {
      botToken: '',
      chatId: '',
      enabled: false,
      notifySales: false,
      notifyCustomOrders: false,
      notifyExpenses: false,
      notifyShiftClose: false,
    };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged: TelegramConfig = { ...DEFAULT_TELEGRAM_CONFIG, ...parsed };

      // If user still has the revoked token string, clear it so they can paste their new token
      if (merged.botToken === '8544004471:AAFsyBJbtmKR6W46zGtqGhNVWjE2AIvzWC4') {
        merged.botToken = '';
      }

      // Auto-heal 2: Ensure group -5528089668 is always present in chatId
      if (!merged.chatId) {
        merged.chatId = DEFAULT_TELEGRAM_CONFIG.chatId;
      } else if (!merged.chatId.includes('-5528089668')) {
        merged.chatId = `-5528089668, ${merged.chatId}`;
      }

      // Auto-heal 3: Admin chat ID and daily report recipient defaults
      if (!merged.adminChatId) {
        merged.adminChatId = DEFAULT_TELEGRAM_CONFIG.adminChatId || '8970210109';
      }
      if (!merged.dailyReportRecipient) {
        merged.dailyReportRecipient = 'BOTH';
      }

      // Auto-heal 4: If bot credentials exist, ensure alerts are enabled
      if (merged.botToken && merged.chatId && !merged.enabled) {
        merged.enabled = true;
        merged.notifySales = true;
      }

      // Write back healed config to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {}

      return merged;
    }
  } catch (e) {
    console.error('Error loading Telegram config:', e);
  }
  return DEFAULT_TELEGRAM_CONFIG;
};

/**
 * Deep equality checker for Telegram configurations to prevent unnecessary sync updates and infinite loops
 */
export const areTelegramConfigsEqual = (
  a?: Partial<TelegramConfig> | null,
  b?: Partial<TelegramConfig> | null
): boolean => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    (a.botToken || '').trim() === (b.botToken || '').trim() &&
    (a.chatId || '').trim() === (b.chatId || '').trim() &&
    (a.adminChatId || '').trim() === (b.adminChatId || '').trim() &&
    Boolean(a.enabled) === Boolean(b.enabled) &&
    Boolean(a.notifySales) === Boolean(b.notifySales) &&
    Boolean(a.notifyCustomOrders) === Boolean(b.notifyCustomOrders) &&
    Boolean(a.notifyExpenses) === Boolean(b.notifyExpenses) &&
    Boolean(a.notifyExpenseDue) === Boolean(b.notifyExpenseDue) &&
    Boolean(a.notifyShiftClose) === Boolean(b.notifyShiftClose) &&
    Boolean(a.notifyDailyReport) === Boolean(b.notifyDailyReport) &&
    Boolean(a.notifyReportOnAppClose ?? true) === Boolean(b.notifyReportOnAppClose ?? true) &&
    (a.dailyReportTime || '21:00') === (b.dailyReportTime || '21:00') &&
    (a.dailyReportRecipient || 'ADMIN_ONLY') === (b.dailyReportRecipient || 'ADMIN_ONLY') &&
    Boolean(a.includeAiInsight) === Boolean(b.includeAiInsight) &&
    Boolean(a.notifyCustomerChat ?? true) === Boolean(b.notifyCustomerChat ?? true) &&
    Boolean(a.listenBankAlerts ?? true) === Boolean(b.listenBankAlerts ?? true) &&
    (a.bankAlertChatId || '').trim() === (b.bankAlertChatId || '').trim()
  );
};

/**
 * Save Telegram config to localStorage, IndexedDB, server LAN sync, and Firestore Cloud
 */
export const saveStoredTelegramConfig = (
  config: TelegramConfig,
  syncToCloud = true,
  syncToLan = true
): void => {
  try {
    const rawSaved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    let isSameAsLocal = false;
    if (rawSaved) {
      try {
        const existing = JSON.parse(rawSaved);
        if (areTelegramConfigsEqual(existing, config)) {
          isSameAsLocal = true;
          // If already equal in localStorage and no remote push needed, skip everything
          if (!syncToCloud && !syncToLan) {
            return;
          }
        }
      } catch (e) {}
    }

    if (!isSameAsLocal) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      idbSet(STORAGE_KEY, JSON.stringify(config)).catch(() => {});
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bakery_telegram_config_changed', { detail: config }));
      }
    }

    // Sync to Firestore Cloud so mobile phones automatically inherit store Telegram credentials
    if (syncToCloud) {
      saveFirestoreDoc('settings', 'telegram', config).catch(() => {});
    }

    // Also push to server LAN sync if available so local network devices get it
    if (syncToLan) {
      const currentTenant = getStoreId();
      fetch(`/api/lan-sync?tenant=${encodeURIComponent(currentTenant)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            if (data.telegramConfig && areTelegramConfigsEqual(data.telegramConfig, config)) {
              return; // Already up-to-date on LAN server
            }
            fetch(`/api/lan-sync?tenant=${encodeURIComponent(currentTenant)}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Tenant-Id': currentTenant,
              },
              body: JSON.stringify({ ...data, telegramConfig: config }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }
  } catch (e) {
    console.error('Error saving Telegram config:', e);
  }
};

export const parseTelegramChatIds = (chatIdStr?: string, botToken?: string): string[] => {
  const defaultGroup = DEFAULT_TELEGRAM_CONFIG.chatId; // '-5528089668'
  if (!chatIdStr) {
    return [defaultGroup];
  }
  // Split on commas, semicolons, whitespace
  const parts = chatIdStr.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
  const set = new Set(parts);

  // Default store group safety net: if bot is the official vicheta_order_bot, always ensure group '-5528089668' is included
  const cleanBotToken = botToken?.trim() || '';
  if (
    cleanBotToken === DEFAULT_TELEGRAM_CONFIG.botToken ||
    cleanBotToken === ''
  ) {
    set.add(defaultGroup);
  }

  return Array.from(set);
};

/**
 * Deduplication Store: Prevents repeated spam or loops of Telegram notifications
 * Stores up to 600 recent event keys in localStorage & memory
 */
const SENT_EVENTS_STORAGE_KEY = 'bakery_sent_telegram_events';
const sentEventCache = new Set<string>();
const inFlightSaleEvents = new Set<string>();
const inFlightCustomOrderEvents = new Set<string>();
const inFlightDailyReportEvents = new Set<string>();

const loadSentEvents = (): Set<string> => {
  if (typeof window === 'undefined') return sentEventCache;
  try {
    const raw = localStorage.getItem(SENT_EVENTS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach((k: string) => {
          if (typeof k === 'string') sentEventCache.add(k);
        });
      }
    }
  } catch (e) {}
  return sentEventCache;
};

export const hasTelegramEventFired = (key: string): boolean => {
  if (!key) return false;
  loadSentEvents();
  return sentEventCache.has(key);
};

export const markTelegramEventFired = (key: string): void => {
  if (!key) return;
  loadSentEvents();
  sentEventCache.add(key);
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(sentEventCache).slice(-600);
    localStorage.setItem(SENT_EVENTS_STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {}
};

/**
 * Retrieve saved Telegram config (with fallback to LAN sync / server for mobile devices)
 */
export const getStoredTelegramConfigAsync = async (): Promise<TelegramConfig> => {
  let config = getStoredTelegramConfig();
  if (isDemoModeActive()) {
    return config;
  }
  if (config.botToken && config.chatId && config.enabled && config.notifySales) {
    return config;
  }

  // Fallback 1: Check Firestore Cloud ('settings/telegram') so mobile customer portals inherit store bot credentials
  try {
    const cloudDoc = await getFirestoreDoc<TelegramConfig>('settings', 'telegram');
    if (cloudDoc && cloudDoc.botToken && cloudDoc.chatId) {
      const merged: TelegramConfig = { ...DEFAULT_TELEGRAM_CONFIG, ...cloudDoc };
      if (!merged.chatId.includes('-5528089668')) {
        merged.chatId = `-5528089668, ${merged.chatId}`;
      }
      merged.enabled = true;
      merged.notifySales = true;
      saveStoredTelegramConfig(merged, false, false);
      return merged;
    }
  } catch (e) {
    console.warn('[Telegram] Could not fetch Firestore telegram config:', e);
  }

  // Fallback 2: If mobile phone doesn't have credentials in localStorage, fetch from server
  try {
    const currentTenant = getStoreId();
    const res = await fetch(`/api/lan-sync?tenant=${encodeURIComponent(currentTenant)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.telegramConfig?.botToken && data?.telegramConfig?.chatId) {
        const merged = { ...DEFAULT_TELEGRAM_CONFIG, ...data.telegramConfig };
        if (!merged.chatId.includes('-5528089668')) {
          merged.chatId = `-5528089668, ${merged.chatId}`;
        }
        merged.enabled = true;
        merged.notifySales = true;
        saveStoredTelegramConfig(merged, false, false);
        return merged;
      }
    }
  } catch (e) {
    console.warn('[Telegram] Could not fetch server telegram config:', e);
  }

  return config;
};

/**
 * Send raw HTML message via Telegram Bot API
 * Supports single chat ID or multiple comma-separated IDs (e.g. Group + Personal Admin)
 * If directChatIds is provided, sends EXCLUSIVELY to those IDs without appending default group
 */
export const sendTelegramMessage = async (
  text: string,
  customConfig?: TelegramConfig,
  directChatIds?: string | string[]
): Promise<{ success: boolean; message: string; data?: any }> => {
  const config = customConfig || (await getStoredTelegramConfigAsync());

  if (!config.botToken) {
    return { success: false, message: 'សូមបំពេញ Bot Token ជាមុនសិន!' };
  }

  const cleanToken = config.botToken.trim();

  let chatIds: string[];
  if (directChatIds) {
    const rawIds = Array.isArray(directChatIds) ? directChatIds : [directChatIds];
    const cleaned = rawIds.map((s) => (s ? String(s).trim() : '')).filter(Boolean);
    chatIds = Array.from(new Set(cleaned));
  } else {
    chatIds = parseTelegramChatIds(config.chatId, cleanToken);
  }

  if (chatIds.length === 0) {
    return { success: false, message: 'សូមបំពេញ Chat ID ជាមុនសិន!' };
  }

  let anySuccess = false;
  let lastData: any = null;
  let lastError = '';

  for (const cid of chatIds) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: cid,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      let data = await response.json();

      if (!response.ok || !data.ok) {
        // If Telegram failed due to HTML parsing entities, retry immediately with plain text
        if (data.description && (data.description.includes('parse entities') || data.description.includes('Bad Request'))) {
          try {
            const plainText = text.replace(/<[^>]*>/g, '');
            const retryRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
              method: 'POST',
              keepalive: true,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: cid,
                text: plainText,
                disable_web_page_preview: true,
              }),
            });
            const retryData = await retryRes.json();
            if (retryRes.ok && retryData.ok) {
              anySuccess = true;
              lastData = retryData.result;
              continue;
            }
          } catch (retryErr) {
            console.warn('[Telegram Retry Failed]:', retryErr);
          }
        }

        lastError = data.description || 'កំហុសមិនស្គាល់';
        console.warn(`[Telegram] Send failed for chat_id ${cid}:`, lastError);
      } else {
        anySuccess = true;
        lastData = data.result;
      }
    } catch (error: any) {
      lastError = error?.message || 'Network error';
      console.error(`[Telegram] Exception for chat_id ${cid}:`, error);
    }
  }

  if (anySuccess) {
    return {
      success: true,
      message: 'សារត្រូវបានផ្ញើទៅកាន់ Telegram ជោគជ័យ!',
      data: lastData,
    };
  }

  let errDesc = lastError || 'កំហុសមិនស្គាល់';
  if (errDesc.includes('Unauthorized') || errDesc.includes('Not Found')) {
    errDesc = 'Bot Token មិនត្រឹមត្រូវ (Invalid Bot Token)';
  } else if (errDesc.includes("bot can't initiate conversation") || errDesc.includes('Forbidden')) {
    errDesc = 'Telegram តម្រូវឱ្យ Admin ចុច /start ក្នុង Bot ជាមុនសិន! សូមបើក Telegram ស្វែងរក @vicheta_order_bot ហើយចុច Start (ឬផ្ញើសារ /start) ដើម្បីឱ្យ Bot អាចផ្ញើសារចូលគណនីផ្ទាល់ខ្លួនបាន។';
  } else if (errDesc.includes('chat not found')) {
    errDesc = 'រកមិនឃើញ Chat ID នេះឡើយ។ សូមប្រាកដថា Admin បានចុច /start ក្នុង Bot (@vicheta_order_bot) ឬបាន Add Bot ចូល Group!';
  }

  return {
    success: false,
    message: `Telegram Error: ${errDesc}`,
  };
};

/**
 * Universal helper to send order or operation alert to Telegram
 */
export const sendTelegramOrderNotification = async (
  message: string,
  customConfig?: TelegramConfig
): Promise<boolean> => {
  const res = await sendTelegramMessage(message, customConfig);
  return res.success;
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
  const chatIds = parseTelegramChatIds(config.chatId, cleanToken);

  if (chatIds.length === 0) {
    return { success: false, message: 'សូមបំពេញ Chat ID ជាមុនសិន!' };
  }

  // Telegram photo caption maximum length is 1024 characters
  const isCaptionLong = caption.length > 1000;
  const photoCaption = isCaptionLong ? caption.slice(0, 990) + '...' : caption;

  let anySuccess = false;
  let lastData: any = null;

  try {
    // 1. If photo is a Base64 data URL, upload as binary multipart/form-data
    if (photo.startsWith('data:')) {
      const blob = dataURLtoBlob(photo);
      if (blob) {
        for (const cid of chatIds) {
          try {
            const formData = new FormData();
            formData.append('chat_id', cid);
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
                retryFormData.append('chat_id', cid);
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
              anySuccess = true;
              lastData = data.result;
            }
          } catch (photoErr) {
            console.warn(`[Telegram Photo] Failed sending to ${cid}:`, photoErr);
          }
        }

        if (anySuccess) {
          if (isCaptionLong) {
            await sendTelegramMessage(caption, config);
          }
          return { success: true, message: 'ផ្ញើរូបភាពជោគជ័យ!', data: lastData };
        }
        console.warn('sendPhoto with blob failed for all recipients, falling back to text');
      }
    } else if (photo.startsWith('http://') || photo.startsWith('https://')) {
      // 2. If photo is a Web URL (e.g. Firebase Storage)
      for (const cid of chatIds) {
        try {
          const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: cid,
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
                  chat_id: cid,
                  photo,
                  caption: plainCaption,
                }),
              });
              data = await retryRes.json();
            }
          }

          if (data.ok) {
            anySuccess = true;
            lastData = data.result;
          }
        } catch (urlPhotoErr) {
          console.warn(`[Telegram Photo URL] Failed sending to ${cid}:`, urlPhotoErr);
        }
      }

      if (anySuccess) {
        if (isCaptionLong) {
          await sendTelegramMessage(caption, config);
        }
        return { success: true, message: 'ផ្ញើរូបភាពជោគជ័យ!', data: lastData };
      }
      console.warn('sendPhoto with URL failed for all recipients, falling back to text');
    }

    // Fallback: If image fails or format not supported (e.g. local relative path), send regular text message
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
  const chatIds = parseTelegramChatIds(chatId, cleanToken);

  if (!cleanToken || chatIds.length === 0) {
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
    const nowStr = formatDateTimeDMY(new Date());
    const testMsg = `🎉 <b>ការតភ្ជាប់ Telegram Bot ជោគជ័យ!</b>\n\n` +
      `🍰 <b>ហាង៖</b> SweetBakery & Cafe\n` +
      `🤖 <b>Bot Name:</b> ${botName} (@${botUsername})\n` +
      `⏰ <b>កាលបរិច្ឆេទ៖</b> ${nowStr}\n\n` +
      `✅ ប្រព័ន្ធ POS នឹងផ្ញើដំណឹងលក់ និងកុម្ម៉ង់នំមកកាន់ទីនេះដោយស្វ័យប្រវត្តិ!`;

    const sendRes = await sendTelegramMessage(testMsg, {
      botToken: cleanToken,
      chatId: chatIds.join(', '),
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
  if (isDemoModeActive()) return;

  const stateKey = sale.isDeposit ? 'deposit' : 'final';
  // Use unique sale ID as primary key (fallback to orderNumber if no id)
  const eventKey = sale.id ? `sale_id_${sale.id}_${stateKey}` : `sale_ord_${sale.orderNumber}_${stateKey}`;

  // Check if already sent or currently in-flight
  if (hasTelegramEventFired(eventKey) || inFlightSaleEvents.has(eventKey)) {
    console.warn('[Telegram Alert] Sale notification skipped (already sent or in-flight):', {
      eventKey,
      orderNumber: sale.orderNumber,
      isDeposit: sale.isDeposit,
    });
    return;
  }

  inFlightSaleEvents.add(eventKey);

  try {
    const config = await getStoredTelegramConfigAsync();
    if (!config.enabled || !config.notifySales || !config.botToken || !config.chatId) {
      console.warn('[Telegram Alert] Sale notification skipped (disabled or missing token/chatId):', {
        enabled: config.enabled,
        notifySales: config.notifySales,
        hasBotToken: Boolean(config.botToken),
        hasChatId: Boolean(config.chatId),
      });
      return;
    }

    // Prevent duplicate alerts: if this is a deposit pre-order sale and custom cake order alerts are enabled,
    // let notifyTelegramCustomOrder handle the notification with complete cake & deposit details.
    if (sale.isDeposit && config.notifyCustomOrders) {
      console.log(
        '[Telegram Alert] Skipping POS sale notification for deposit pre-order (handled by Custom Order alert):',
        sale.orderNumber
      );
      return;
    }

    const storeTitle = storeInfo?.nameKh || 'ហាងនំ SweetBakery';
    const totalKhr = sale.totalKhr ?? Math.round(sale.totalUsd * exchangeRate);
    const now = new Date(sale.createdAt || Date.now());
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = formatDateDMY(sale.createdAt || Date.now());

    const paymentText =
      sale.paymentMethod === 'KHQR_BAKONG'
        ? '📲 KHQR Bakong / ធនាគារ'
        : sale.paymentMethod === 'CASH_KHR'
        ? '💵 សាច់ប្រាក់ (៛ រៀល)'
        : '💵 សាច់ប្រាក់ ($ ដុល្លារ)';

    const itemsList = (sale.items || [])
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
      `👤 <b>អ្នកគិតប្រាក់៖</b> ${escapeHtml(sale.cashierName || 'Cashier')}\n` +
      (sale.customerName ? `🧑‍💼 <b>អតិថិជន៖</b> <b>${escapeHtml(sale.customerName)}</b>\n` : '') +
      (sale.customerPhone ? `📞 <b>ទូរស័ព្ទ៖</b> <a href="tel:${sale.customerPhone}">${sale.customerPhone}</a>\n` : '') +
      (sale.pickupDate ? `📅 <b>ថ្ងៃ & ម៉ោងមកយក៖</b> <b>${formatDateDMY(sale.pickupDate)} ${sale.pickupTime ? `វេលាម៉ោង ${sale.pickupTime}` : ''}</b>\n` : '') +
      (sale.notes ? `✍️ <b>ចំណាំ/សរសេរលើនំ៖</b> <i>"${escapeHtml(sale.notes)}"</i>\n` : '') +
      `\n🛒 <b>មុខទំនិញដែលបានលក់៖</b>\n` +
      `${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 <b>ទឹកប្រាក់សរុប៖</b> <b>${totalKhr.toLocaleString()} ៛</b>  <i>($${sale.totalUsd.toFixed(2)})</i>\n` +
      (sale.isDeposit
        ? `👛 <b>បានកក់ប្រាក់៖</b> <b>${(sale.depositKhr || 0).toLocaleString()} ៛</b>\n⚠️ <b>នៅខ្វះពេលមកយក៖</b> <b>${(sale.remainingKhr || 0).toLocaleString()} ៛</b>\n`
        : '') +
      `💳 <b>វិធីទូទាត់៖</b> ${paymentText}\n` +
      `✨ <i>សូមអរគុណ! សូមហាងរកស៊ីកាន់តែមានបាន!</i>`;

    const itemWithImage = sale.items?.find((item) => Boolean(item.image));
    const photoUrl = itemWithImage?.image;

    console.log('[Telegram Alert] Sending sale notification for invoice:', sale.orderNumber, 'hasPhoto:', Boolean(photoUrl));

    let res: { success: boolean; message: string; data?: any } = { success: false, message: '' };

    if (photoUrl && (photoUrl.startsWith('data:') || photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
      try {
        res = await sendTelegramPhoto(photoUrl, text, config);
      } catch (photoErr) {
        console.warn('[Telegram Alert] sendTelegramPhoto failed, will fallback to text:', photoErr);
      }
    }

    if (!res.success) {
      res = await sendTelegramMessage(text, config);
    }

    console.log('[Telegram Alert] Sale send result:', res);

    if (res.success) {
      markTelegramEventFired(eventKey);
      if (sale.orderNumber) {
        markTelegramEventFired(`sale_ord_${sale.orderNumber}_${stateKey}`);
      }
    }
  } catch (error: any) {
    console.error('[Telegram Alert] Error in notifyTelegramSale:', error);
  } finally {
    inFlightSaleEvents.delete(eventKey);
  }
};

/**
 * Format & send notification for a new custom cake order
 */
export const notifyTelegramCustomOrder = async (
  order: CustomCakeOrder,
  storeInfo?: StoreInfo,
  exchangeRate = 4100
): Promise<void> => {
  if (isDemoModeActive()) return;

  const eventKey = order.id ? `custom_id_${order.id}` : `custom_ord_${order.orderNumber}`;

  if (hasTelegramEventFired(eventKey) || inFlightCustomOrderEvents.has(eventKey)) {
    console.warn('[Telegram Alert] Custom order notification skipped (already sent or in-flight):', order.orderNumber);
    return;
  }

  inFlightCustomOrderEvents.add(eventKey);

  try {
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

    const paymentText =
      order.paymentMethod === 'KHQR_BAKONG'
        ? '📲 KHQR Bakong / ធនាគារ'
        : order.paymentMethod === 'CASH_KHR'
        ? '💵 សាច់ប្រាក់ (៛ រៀល)'
        : order.paymentMethod === 'CASH_USD'
        ? '💵 សាច់ប្រាក់ ($ ដុល្លារ)'
        : '';

    const text =
      `🎂 <b>[${escapeHtml(storeTitle)}] — មានភ្ញៀវកុម្ម៉ង់នំខួបកំណើតថ្មី!</b>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🏷️ <b>កូដកុម្ម៉ង់៖</b> <code>#${order.orderNumber}</code>\n` +
      `👤 <b>អតិថិជន៖</b> <b>${escapeHtml(order.customerName)}</b>\n` +
      `📞 <b>ទូរស័ព្ទ៖</b> <a href="tel:${order.phone}">${order.phone}</a>\n\n` +
      `🎂 <b>ឈ្មោះនំ៖</b> <b>${escapeHtml(order.cakeName)}</b>\n` +
      (order.size && order.size !== 'ស្តង់ដារ' ? `📏 <b>ទំហំ៖</b> ${escapeHtml(order.size)}\n` : '') +
      `🍓 <b>រសជាតិ៖</b> ${escapeHtml(order.flavor)}\n` +
      (order.inscription ? `✍️ <b>អក្សរលើនំ៖</b> <i>"${escapeHtml(order.inscription)}"</i>\n` : '') +
      (order.themeNotes ? `📝 <b>ចំណាំ៖</b> ${escapeHtml(order.themeNotes)}\n` : '') +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⏰ <b>ថ្ងៃ & ម៉ោងមកយក៖</b> <b>${formatDateDMY(order.pickupDate)} វេលាម៉ោង ${order.pickupTime}</b>\n\n` +
      `💵 <b>តម្លៃសរុប៖</b> <b>${totalKhr.toLocaleString()} ៛</b> ($${order.totalUsd.toFixed(2)})\n` +
      `👛 <b>បានកក់រួច៖</b> <b>${depositKhr.toLocaleString()} ៛ ($${order.depositUsd.toFixed(2)})</b>\n` +
      (paymentText ? `💳 <b>វិធីទូទាត់ប្រាក់កក់៖</b> ${paymentText}\n` : '') +
      (remainingUsd > 0
        ? `⚠️ <b>នៅខ្វះពេលមកយក៖</b> <b>${remainingKhr.toLocaleString()} ៛</b> ($${remainingUsd.toFixed(2)})\n`
        : `✅ <b>បានបង់ប្រាក់គ្រប់ ១០០%</b>\n`);

    console.log('[Telegram Alert] Sending custom order notification for:', order.orderNumber, 'hasPhoto:', Boolean(order.referenceImage));

    let res: { success: boolean; message: string; data?: any } = { success: false, message: '' };

    if (order.referenceImage) {
      try {
        res = await sendTelegramPhoto(order.referenceImage, text, config);
      } catch (photoErr) {
        console.warn('[Telegram Alert] sendTelegramPhoto failed, will fallback to text:', photoErr);
      }
    }

    if (!res.success) {
      res = await sendTelegramMessage(text, config);
    }

    if (res.success) {
      markTelegramEventFired(eventKey);
      if (order.orderNumber) {
        markTelegramEventFired(`custom_ord_${order.orderNumber}`);
      }
    }
  } catch (error: any) {
    console.error('[Telegram Alert] Error in notifyTelegramCustomOrder:', error);
  } finally {
    inFlightCustomOrderEvents.delete(eventKey);
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
  if (isDemoModeActive()) return;

  const config = await getStoredTelegramConfigAsync();
  if (!config.enabled || config.notifyExpenses === false || !config.botToken || !config.chatId) {
    console.warn('[Telegram Alert] Expense notification skipped (disabled or missing token/chatId):', {
      enabled: config.enabled,
      notifyExpenses: config.notifyExpenses,
      hasToken: !!config.botToken,
      hasChatId: !!config.chatId,
    });
    return;
  }

  const expenseKey = `expense_${expense.id}`;
  if (hasTelegramEventFired(expenseKey)) {
    console.warn('[Telegram Alert] Expense notification skipped (already sent):', expense.id);
    return;
  }

  const storeTitle = escapeHtml(storeInfo?.nameKh || 'ហាងនំ SweetBakery');
  const amountKhr = expense.amountKhr ?? Math.round(expense.amountUsd * exchangeRate);

  const isIng = expense.expenseType === 'INGREDIENT' || expense.category === 'INGREDIENTS';
  const typeBadge = isIng ? '🥚 ចំណាយគ្រឿងផ្សំ (Ingredients)' : '🏢 ចំណាយទូទៅ (General Expense)';
  const isUnpaid = expense.paymentStatus === 'UNPAID';
  const paymentStatusText = isUnpaid ? '⏳ មិនទាន់បង់ / ជំពាក់' : '✅ បង់រួចរាល់';

  const safeTitle = escapeHtml(expense.title);
  const safePaidBy = escapeHtml(expense.paidBy);
  const safeSupplier = escapeHtml(expense.supplier);
  const safeNotes = escapeHtml(expense.notes);

  const text =
    `💸 <b>[${storeTitle}] — កត់ត្រាការចំណាយថ្មី</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🏷️ <b>ផ្នែកចំណាយ៖</b> <b>${typeBadge}</b>\n` +
    `📦 <b>មុខទំនិញ/ការចំណាយ៖</b> <b>${safeTitle}</b>\n` +
    (expense.quantity ? `🔢 <b>ចំនួន៖</b> ${expense.quantity} ${escapeHtml(expense.unit || '')}\n` : '') +
    (safeSupplier ? `🏪 <b>អ្នកផ្គត់ផ្គង់៖</b> ${safeSupplier}\n` : '') +
    `💰 <b>ទឹកប្រាក់ចំណាយ៖</b> <b>${amountKhr.toLocaleString()} ៛</b> <i>($${expense.amountUsd.toFixed(2)})</i>\n` +
    `💳 <b>ស្ថានភាព៖</b> <b>${paymentStatusText}</b>\n` +
    (expense.dueDate ? `📅 <b>ថ្ងៃផុតកំណត់${isUnpaid ? 'បង់' : ''}៖</b> <b>${formatDateDMY(expense.dueDate)}</b>\n` : '') +
    `👤 <b>អ្នកចំណាយ/ទទួលបន្ទុក៖</b> ${safePaidBy}\n` +
    (safeNotes ? `📝 <b>កំណត់សម្គាល់៖</b> ${safeNotes}\n` : '') +
    `⏰ <b>កាលបរិច្ឆេទកត់ត្រា៖</b> ${formatDateDMY(expense.date)}`;

  let res: { success: boolean; message: string };
  if (expense.receiptImage && expense.receiptImage.length < 5000000) {
    try {
      res = await sendTelegramPhoto(expense.receiptImage, text, config);
      if (!res.success) {
        res = await sendTelegramMessage(text, config);
      }
    } catch {
      res = await sendTelegramMessage(text, config);
    }
  } else {
    res = await sendTelegramMessage(text, config);
  }

  if (res.success) {
    markTelegramEventFired(expenseKey);
    console.log('[Telegram Alert] Expense notification sent successfully:', expense.id);
  } else {
    console.warn('[Telegram Alert] Failed to send expense notification:', res.message);
  }
};

/**
 * Format & send notification when an expense due date is approaching or overdue
 */
export const notifyTelegramExpenseDueAlert = async (
  expense: Expense,
  diffDays: number,
  storeInfo?: StoreInfo,
  exchangeRate = 4100
): Promise<void> => {
  if (isDemoModeActive()) return;
  const config = await getStoredTelegramConfigAsync();
  if (!config.enabled || config.notifyExpenseDue === false || !config.botToken || !config.chatId) return;

  // ប្រសិនបើបានបង់រួចហើយ ឬបង់មុនកាលកំណត់ (PAID / paidAt) មិនបាច់ផ្ញើសារដាស់តឿនជាដាច់ខាត
  if (expense.paymentStatus === 'PAID' || !!expense.paidAt) return;

  const storeTitle = storeInfo?.nameKh || 'ហាងនំ SweetBakery';
  const amountKhr = expense.amountKhr ?? Math.round(expense.amountUsd * exchangeRate);

  let statusHeader = '';
  if (diffDays < 0) {
    statusHeader = `🚨 <b>[ប្រញាប់] ហួសកាលកំណត់បង់ប្រាក់ ${Math.abs(diffDays)} ថ្ងៃ!</b>`;
  } else if (diffDays === 0) {
    statusHeader = `⏰ <b>[ដាស់តឿន] ដល់ថ្ងៃត្រូវបង់ប្រាក់ថ្ងៃនេះ!</b>`;
  } else {
    statusHeader = `⏳ <b>[រំលឹកជាមុន] សល់ ${diffDays} ថ្ងៃទៀតដល់ថ្ងៃកំណត់បង់!</b>`;
  }

  const text =
    `🔔 <b>[${escapeHtml(storeTitle)}] — រំលឹកបង់ប្រាក់ចំណាយទូទៅ!</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `${statusHeader}\n\n` +
    `🏢 <b>ការចំណាយ៖</b> <b>${escapeHtml(expense.title)}</b>\n` +
    (expense.supplier ? `🏪 <b>អ្នកផ្គត់ផ្គង់/ម្ចាស់ទីតាំង៖</b> ${escapeHtml(expense.supplier)}\n` : '') +
    `💰 <b>ទឹកប្រាក់ត្រូវបង់៖</b> <b>${amountKhr.toLocaleString()} ៛</b> <i>($${expense.amountUsd.toFixed(2)})</i>\n` +
    `📅 <b>ថ្ងៃផុតកំណត់៖</b> <b>${formatDateDMY(expense.dueDate)}</b>\n` +
    `👤 <b>អ្នកទទួលបន្ទុក៖</b> ${escapeHtml(expense.paidBy)}\n` +
    (expense.notes ? `📝 <b>សម្គាល់៖</b> ${escapeHtml(expense.notes)}\n` : '') +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💡 <i>សូមកុំភ្លេចទូទាត់ និងចូលទៅផ្ទាំងចំណាយដើម្បីចុច «បង់ប្រាក់រួច»</i>`;

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
  if (isDemoModeActive()) return;

  const shiftKey = `shift_${shift.id || shift.startTime}`;
  if (hasTelegramEventFired(shiftKey)) {
    console.warn('[Telegram Alert] Shift close notification skipped (already sent):', shiftKey);
    return;
  }
  markTelegramEventFired(shiftKey);

  const config = await getStoredTelegramConfigAsync();
  if (!config.enabled || !config.notifyShiftClose || !config.botToken || !config.chatId) return;

  const storeTitle = storeInfo?.nameKh || 'ហាងនំ SweetBakery';
  const startStr = new Date(shift.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endStr = new Date(shift.endTime || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const totalSalesKhr = Math.round(shift.totalSalesUsd * exchangeRate);

  const text =
    `🏁 <b>[${escapeHtml(storeTitle)}] — របាយការណ៍បិទវេនលក់ (Shift Closed)</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>អ្នកគិតប្រាក់៖</b> <b>${escapeHtml(shift.cashierName)}</b>\n` +
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

/**
 * Configure Telegram Bot Chat Menu Button to open Mini App directly
 */
export const setTelegramMenuButton = async (
  botToken: string,
  webAppUrl: string = 'https://sothearetsuon-ai.github.io/sweetbakery-pos/?order=true',
  buttonText: string = '🎂 កុម្ម៉ង់នំខេក'
): Promise<{ success: boolean; message: string }> => {
  if (!botToken) return { success: false, message: 'សូមបញ្ចូល Bot Token!' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: buttonText,
          web_app: {
            url: webAppUrl,
          },
        },
      }),
    });
    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'បានភ្ជាប់ Telegram Mini App Menu Button ជោគជ័យ!' };
    }
    return { success: false, message: data.description || 'បរាជ័យក្នុងការកំណត់ Menu Button' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error connecting to Telegram API' };
  }
};

/**
 * Reset Telegram Bot Chat Menu Button back to default standard menu
 */
export const resetTelegramMenuButton = async (
  botToken: string
): Promise<{ success: boolean; message: string }> => {
  if (!botToken) return { success: false, message: 'សូមបញ្ចូល Bot Token!' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'default',
        },
      }),
    });
    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'បានកំណត់ Menu Button ទៅជា Default ធម្មតាវិញដោយជោគជ័យ!' };
    }
    return { success: false, message: data.description || 'បរាជ័យក្នុងការកំណត់ Menu Button' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error connecting to Telegram API' };
  }
};

/**
 * Daily & Monthly Sales and Expenses Summary Report Parameters
 */
export interface DailyReportParams {
  sales: CompletedSale[];
  expenses: Expense[];
  customOrders?: CustomCakeOrder[];
  storeInfo?: StoreInfo;
  exchangeRate?: number;
  targetDate?: string; // YYYY-MM-DD
  dateStr?: string; // alias for targetDate
  reportTimeLabel?: string;
  reportTrigger?: 'SCHEDULED' | 'APP_CLOSE' | 'SHIFT_CLOSE' | 'MANUAL';
}

/**
 * Generate formatted HTML report summarizing daily & monthly sales and expenses with AI insights
 */
export const generateDailyMonthlySummaryReportText = (params: DailyReportParams): string => {
  const {
    sales = [],
    expenses = [],
    customOrders = [],
    storeInfo,
    exchangeRate = 4100,
    targetDate,
    dateStr,
    reportTimeLabel,
    reportTrigger,
  } = params;

  const now = new Date();
  const todayStr = targetDate || dateStr || now.toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

  // Filter Sales for Today
  const todaySales = sales.filter((s) => (s.createdAt || '').slice(0, 10) === todayStr);
  const todaySalesCount = todaySales.length;
  const todaySalesUsd = todaySales.reduce((sum, s) => sum + s.totalUsd, 0);
  const todaySalesKhr = todaySales.reduce(
    (sum, s) => sum + (s.totalKhr || Math.round(s.totalUsd * exchangeRate)),
    0
  );

  // Payment Breakdown
  const bakongSalesKhr = todaySales
    .filter((s) => s.paymentMethod === 'KHQR_BAKONG')
    .reduce((sum, s) => sum + (s.totalKhr || Math.round(s.totalUsd * exchangeRate)), 0);
  const cashKhrSalesKhr = todaySales
    .filter((s) => s.paymentMethod === 'CASH_KHR')
    .reduce((sum, s) => sum + (s.totalKhr || Math.round(s.totalUsd * exchangeRate)), 0);
  const cashUsdSalesUsd = todaySales
    .filter((s) => s.paymentMethod === 'CASH_USD')
    .reduce((sum, s) => sum + s.totalUsd, 0);

  const bakongPct = todaySalesKhr > 0 ? Math.round((bakongSalesKhr / todaySalesKhr) * 100) : 0;
  const cashKhrPct = todaySalesKhr > 0 ? Math.round((cashKhrSalesKhr / todaySalesKhr) * 100) : 0;

  // Custom cake orders created or for today
  const todayOrders = customOrders.filter(
    (o) => (o.createdAt || o.pickupDate || '').slice(0, 10) === todayStr
  );
  const todayOrdersDepositsKhr = todayOrders.reduce(
    (sum, o) => sum + (o.depositKhr || Math.round(o.depositUsd * exchangeRate)),
    0
  );

  // Filter Expenses for Today
  const isIngExpense = (e: any) => e.expenseType === 'INGREDIENT' || e.category === 'INGREDIENTS';
  const todayExpenses = expenses.filter((e) => (e.date || e.createdAt || '').slice(0, 10) === todayStr);
  const todayExpensesCount = todayExpenses.length;
  const todayExpensesUsd = todayExpenses.reduce((sum, e) => sum + e.amountUsd, 0);
  const todayExpensesKhr = todayExpenses.reduce(
    (sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)),
    0
  );

  const todayIngExpensesKhr = todayExpenses
    .filter(isIngExpense)
    .reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);
  const todayGenExpensesKhr = todayExpenses
    .filter((e) => !isIngExpense(e))
    .reduce((sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)), 0);

  // Daily Net Profit
  const todayNetProfitKhr = todaySalesKhr - todayExpensesKhr;
  const todayNetProfitUsd = Number((todaySalesUsd - todayExpensesUsd).toFixed(2));
  const todayMarginPct = todaySalesUsd > 0 ? ((todayNetProfitUsd / todaySalesUsd) * 100).toFixed(1) : '0';

  // Best-selling items today
  const itemMap = new Map<string, number>();
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
  const monthSalesUsd = monthSales.reduce((sum, s) => sum + s.totalUsd, 0);
  const monthSalesKhr = monthSales.reduce(
    (sum, s) => sum + (s.totalKhr || Math.round(s.totalUsd * exchangeRate)),
    0
  );

  const monthExpenses = expenses.filter((e) => (e.date || e.createdAt || '').slice(0, 7) === currentMonthStr);
  const monthExpensesUsd = monthExpenses.reduce((sum, e) => sum + e.amountUsd, 0);
  const monthExpensesKhr = monthExpenses.reduce(
    (sum, e) => sum + (e.amountKhr || Math.round(e.amountUsd * exchangeRate)),
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
  const dayNamesKh = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const dayOfWeekKh = dayNamesKh[now.getDay()] || '';
  const dateFormatted = formatDateDMY(todayStr);

  const storeTitle = escapeHtml(storeInfo?.nameKh || 'ហាងនំ SweetBakery');
  const timeDisplay = reportTimeLabel || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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

  const isAppClose = reportTrigger === 'APP_CLOSE';
  const headerTitle = isAppClose
    ? `📊 <b>[${storeTitle}] — របាយការណ៍បូកសរុបការលក់ពេលបិទ App</b>\n`
    : `📊 <b>[${storeTitle}] — របាយការណ៍បូកសរុបការលក់ & ចំណាយ</b>\n`;
  const statusNote = isAppClose
    ? `🚪 <b>ស្ថានភាព៖</b> បិទបញ្ចប់ការងារ និងចាកចេញពីកម្មវិធី App (App Closed)\n`
    : '';

  return (
    `${headerTitle}` +
    `━━━━━━━━━━━━━━━━━━\n` +
    (statusNote ? `${statusNote}` : '') +
    `📅 <b>កាលបរិច្ឆេទ៖</b> ថ្ងៃ${dayOfWeekKh} ទី ${dateFormatted}\n` +
    `⏰ <b>ម៉ោងចេញរបាយការណ៍៖</b> ${timeDisplay}\n\n` +
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
    `✨ <i>${isAppClose ? 'របាយការណ៍ស្វ័យប្រវត្តិចេញដោយ SweetBakery POS ពេលបិទ App' : 'របាយការណ៍ស្វ័យប្រវត្តិចេញដោយ SweetBakery POS'}</i>`
  );
};

/**
 * Send Daily & Monthly Summary Report to Telegram
 * Defaults to 'ADMIN_ONLY' (8970210109) so financial summaries remain private and confidential
 */
export const sendTelegramDailyReport = async (
  params: DailyReportParams,
  isManual = false,
  customConfig?: TelegramConfig
): Promise<{ success: boolean; message: string }> => {
  if (isDemoModeActive()) {
    return { success: false, message: 'Telegram ត្រូវបានបិទក្នុង Demo Mode' };
  }

  const config = customConfig || (await getStoredTelegramConfigAsync());
  if (!config.enabled || (config.notifyDailyReport === false && !isManual) || !config.botToken) {
    return {
      success: false,
      message: 'សូមបើកមុខងារ Telegram Bot ក្នុង Settings ជាមុនសិន!',
    };
  }

  // Determine recipient for the Daily/Monthly Summary Report
  // Default: 'ADMIN_ONLY' -> Send strictly and confidentially to Admin's private bot chat (8970210109)
  const recipientMode = config.dailyReportRecipient || 'ADMIN_ONLY';
  const adminId = (config.adminChatId || '8970210109').trim();
  const groupChatId = config.chatId || DEFAULT_TELEGRAM_CONFIG.chatId;

  let targetChatIds: string[] = [];
  if (recipientMode === 'ADMIN_ONLY') {
    if (!adminId) {
      return {
        success: false,
        message: 'សូមបញ្ចូល Admin Chat ID (ឧទាហរណ៍: 8970210109) ដើម្បីទទួលរបាយការណ៍!',
      };
    }
    targetChatIds = [adminId];
  } else if (recipientMode === 'GROUP_ONLY') {
    targetChatIds = parseTelegramChatIds(groupChatId, config.botToken);
  } else {
    // 'BOTH'
    const groupIds = parseTelegramChatIds(groupChatId, config.botToken);
    const combined = new Set([...groupIds]);
    if (adminId) combined.add(adminId);
    targetChatIds = Array.from(combined);
  }

  // Deduplicate target chat IDs so that the exact same ID is never sent to multiple times
  targetChatIds = Array.from(new Set(targetChatIds.map((id) => String(id).trim()).filter(Boolean)));

  if (targetChatIds.length === 0) {
    return {
      success: false,
      message: 'គ្មាន Chat ID សម្រាប់ទទួលរបាយការណ៍ឡើយ!',
    };
  }

  const now = new Date();
  const todayStr = params.targetDate || params.dateStr || now.toISOString().slice(0, 10);
  const timeSlot = config.dailyReportTime || '21:00';
  // Strictly lock by date so that duplicate reports can never fire for the same calendar day
  const eventKey = `daily_report_${todayStr}`;

  if (!isManual) {
    if (hasTelegramEventFired(eventKey) || inFlightDailyReportEvents.has(eventKey)) {
      return {
        success: true,
        message: 'របាយការណ៍ប្រចាំថ្ងៃត្រូវបានផ្ញើរួចហើយសម្រាប់ថ្ងៃនេះ',
      };
    }
    inFlightDailyReportEvents.add(eventKey);

    // Cross-device cloud deduplication: check if another device (e.g. Phone or PC) already sent it today
    try {
      const cloudLog = await getFirestoreDoc<{ sentAt: number }>('daily_report_logs', eventKey);
      if (cloudLog && cloudLog.sentAt) {
        markTelegramEventFired(eventKey);
        inFlightDailyReportEvents.delete(eventKey);
        return {
          success: true,
          message: 'របាយការណ៍ប្រចាំថ្ងៃត្រូវបានផ្ញើរួចហើយសម្រាប់ថ្ងៃនេះតាមរយៈឧបករណ៍ផ្សេង',
        };
      }
    } catch (e) {}
  }

  const reportText = generateDailyMonthlySummaryReportText({
    ...params,
    reportTimeLabel: isManual ? undefined : timeSlot,
  });

  try {
    let res = await sendTelegramMessage(reportText, config, targetChatIds);

    // Smart Fallback: If sending strictly to ADMIN_ONLY failed because Admin hasn't clicked /start on the bot,
    // automatically fallback to delivering to store group so the report is never lost!
    let targetDesc = '';
    if (
      !res.success &&
      recipientMode === 'ADMIN_ONLY' &&
      (res.message?.includes('Forbidden') ||
        res.message?.includes('/start') ||
        res.message?.includes('initiate conversation'))
    ) {
      const fallbackGroupIds = parseTelegramChatIds(groupChatId, config.botToken);
      if (fallbackGroupIds.length > 0) {
        console.warn('[Daily Report] Admin private chat blocked. Retrying to fallback store group:', fallbackGroupIds);
        const retryRes = await sendTelegramMessage(reportText, config, fallbackGroupIds);
        if (retryRes.success) {
          res = retryRes;
          targetDesc = 'Telegram Group ហាង (ជំនួស Admin ផ្ទាល់ខ្លួន ដោយសារគណនី Admin មិនទាន់ចុច /start ក្នុង Bot)';
        }
      }
    }

    if (res.success) {
      markTelegramEventFired(eventKey);
      // Persist to Cloud so other POS devices (e.g. Phone/Tablet) will immediately recognize it as already sent
      saveFirestoreDoc('daily_report_logs', eventKey, {
        sentAt: Date.now(),
        date: todayStr,
        recipients: targetChatIds,
      }).catch(() => {});

      if (!targetDesc) {
        if (recipientMode === 'ADMIN_ONLY') {
          targetDesc = `Admin ផ្ទាល់ខ្លួន (${adminId}) [សម្ងាត់ មិនផ្ញើចូល Group ឡើយ]`;
        } else if (recipientMode === 'GROUP_ONLY') {
          targetDesc = 'Telegram Group ហាង';
        } else {
          targetDesc = `Admin (${adminId}) និង Group ហាង`;
        }
      }
      return {
        success: true,
        message: `📊 របាយការណ៍បូកសរុបត្រូវបានផ្ញើទៅកាន់ ${targetDesc} ជោគជ័យ!`,
      };
    }
    return res;
  } finally {
    inFlightDailyReportEvents.delete(eventKey);
  }
};

/**
 * Automatically triggers daily summary report when closing the App (Windows App, Browser close, or exit)
 */
export const triggerAppCloseDailyReport = async (
  params: DailyReportParams
): Promise<{ success: boolean; message: string; skipped?: boolean }> => {
  if (isDemoModeActive()) {
    return { success: false, message: 'Telegram ត្រូវបានបិទក្នុង Demo Mode', skipped: true };
  }

  const config = await getStoredTelegramConfigAsync();
  if (!config.enabled || config.notifyReportOnAppClose === false || !config.botToken) {
    return { success: false, message: 'មុខងារផ្ញើរបាយការណ៍ពេលបិទ App ត្រូវបានបិទ ឬគ្មាន Bot Token', skipped: true };
  }

  const now = new Date();
  const todayStr = params.targetDate || params.dateStr || now.toISOString().slice(0, 10);
  const todaySales = (params.sales || []).filter((s) => (s.createdAt || '').slice(0, 10) === todayStr);
  const todayExpenses = (params.expenses || []).filter((e) => (e.date || e.createdAt || '').slice(0, 10) === todayStr);
  const todayOrders = (params.customOrders || []).filter((o) => (o.createdAt || o.pickupDate || '').slice(0, 10) === todayStr);

  // Build a snapshot string of today's totals so we never send identical duplicate reports within the same session
  const totalSalesUsd = todaySales.reduce((acc, s) => acc + (s.totalUsd || 0), 0);
  const totalExpUsd = todayExpenses.reduce((acc, e) => acc + (e.amountUsd || 0), 0);
  const snapshotKey = `${todayStr}_s${todaySales.length}_$${totalSalesUsd.toFixed(2)}_e${todayExpenses.length}_$${totalExpUsd.toFixed(2)}_o${todayOrders.length}`;

  const lastSentSnapshot = localStorage.getItem('bakery_last_app_close_report_snapshot');
  if (lastSentSnapshot === snapshotKey) {
    console.log('[Telegram Close Report] Identical report already sent recently for current snapshot, skipping.');
    return { success: true, message: 'របាយការណ៍ដូចគ្នានេះត្រូវបានផ្ញើរួចហើយ', skipped: true };
  }

  try {
    const res = await sendTelegramDailyReport(
      {
        ...params,
        targetDate: todayStr,
        reportTrigger: 'APP_CLOSE',
        reportTimeLabel: `${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (ពេលបិទ App)`,
      },
      true, // isManual = true to bypass time schedule lock
      config
    );

    if (res.success) {
      localStorage.setItem('bakery_last_app_close_report_snapshot', snapshotKey);
    }
    return res;
  } catch (err: any) {
    console.error('[Telegram Close Report] Error sending report on app close:', err);
    return { success: false, message: err?.message || 'Error sending report' };
  }
};



