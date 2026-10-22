// Real-time Bank Alert Listener & Parser for SweetBakery POS
// Listens to ACLEDA Bank, ABA Bank, and Bakong KHQR deposit alerts from Telegram Groups via Bot API
// Automatically triggers Khmer Voice Soundbox & completes orders in POS!

import { paymentListener, PaymentNotification } from './paymentListener';
import { getStoredTelegramConfig, TelegramConfig } from './telegram';
import { soundFx } from '../utils/audio';

export interface ParsedBankAlert {
  amount: number;
  currency: 'KHR' | 'USD';
  bankName: string;
  senderName?: string;
  transactionId?: string;
  accountNumber?: string;
  rawText: string;
  timestamp: number;
}

const DEDUPE_KEY = 'bakery_processed_bank_alerts';
const LAST_OFFSET_KEY = 'bakery_telegram_bank_alert_offset';

/**
 * Deduplication storage for processed transaction and message IDs
 */
function getProcessedAlertIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DEDUPE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
}

function markAlertAsProcessed(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const set = getProcessedAlertIds();
    set.add(id);
    // Keep max 300 IDs
    const arr = Array.from(set);
    if (arr.length > 300) {
      arr.splice(0, arr.length - 300);
    }
    localStorage.setItem(DEDUPE_KEY, JSON.stringify(arr));
  } catch (e) {}
}

/**
 * Intelligent ACLEDA & Cambodian Bank Alert Text Parser
 * Accurately extracts Amount, Currency, Sender, and Transaction Ref from Telegram messages
 */
export function parseBankAlertMessage(rawText: string): ParsedBankAlert | null {
  if (!rawText || typeof rawText !== 'string') return null;

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Filter out withdrawals / debit / paid out messages (We only want incoming deposits / credits)
  if (
    lower.includes('ដកប្រាក់') ||
    lower.includes('ផ្ទេរប្រាក់ចេញ') ||
    lower.includes('debit') ||
    lower.includes('paid out') ||
    lower.includes('transfer out') ||
    lower.includes('withdrawal')
  ) {
    // If it also explicitly has a minus sign, ignore
    if (/[-−]\s*[\d,]+/.test(text)) {
      return null;
    }
  }

  // 2. Identify Bank Name
  let bankName = 'ACLEDA Bank';
  if (text.includes('អេស៊ីលីដា') || lower.includes('acleda')) {
    bankName = 'ACLEDA Bank';
  } else if (lower.includes('aba')) {
    bankName = 'ABA Bank';
  } else if (text.includes('បាគង') || lower.includes('bakong')) {
    bankName = 'Bakong KHQR';
  } else if (text.includes('វីង') || lower.includes('wing')) {
    bankName = 'Wing Bank';
  } else if (lower.includes('canadia')) {
    bankName = 'Canadia Bank';
  } else if (lower.includes('truemoney')) {
    bankName = 'TrueMoney';
  } else if (lower.includes('chip mong')) {
    bankName = 'Chip Mong Bank';
  }

  // Must match either a bank indicator or a KHQR/deposit indicator
  const hasBankOrDepositIndicator =
    text.includes('អេស៊ីលីដា') ||
    lower.includes('acleda') ||
    lower.includes('aba') ||
    lower.includes('bakong') ||
    lower.includes('khqr') ||
    text.includes('ចំនួនទឹកប្រាក់') ||
    text.includes('ទទួលបាន') ||
    text.includes('បានទទួល') ||
    lower.includes('received') ||
    lower.includes('deposit') ||
    lower.includes('credit') ||
    lower.includes('payment');

  if (!hasBankOrDepositIndicator) {
    return null;
  }

  // 3. Extract Amount & Currency
  let amount = 0;
  let currency: 'KHR' | 'USD' = 'KHR';

  // Pattern A: ACLEDA standard "ចំនួនទឹកប្រាក់: +25,000.00 KHR" or "+$10.00" or "+25,000 KHR"
  const acledaKhPattern = /(?:ចំនួនទឹកប្រាក់|ទឹកប្រាក់|ទទួលបាន|ចំនួន)\s*[:=]?\s*[\+]?\s*([$]?)\s*([\d,]+(?:\.\d{1,2})?)\s*(KHR|USD|៛|\$)?/i;
  // Pattern B: English "Amount: +25,000 KHR" or "+$5.00" or "Received: 25,000 KHR"
  const enPattern = /(?:Amount|Received|Payment|Credit|Deposit)\s*[:=]?\s*[\+]?\s*([$]?)\s*([\d,]+(?:\.\d{1,2})?)\s*(KHR|USD|៛|\$)?/i;
  // Pattern C: Explicit plus sign with currency e.g. "+25,000 KHR" or "+$5.50" or "+10.00 USD"
  const plusPattern = /[\+]\s*([$]?)\s*([\d,]+(?:\.\d{1,2})?)\s*(KHR|USD|៛|\$)?/i;

  let match = text.match(acledaKhPattern) || text.match(enPattern) || text.match(plusPattern);

  if (match) {
    const dollarPrefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const currencySuffix = (match[3] || '').toUpperCase();

    const parsedNum = parseFloat(numStr);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      amount = parsedNum;
      if (dollarPrefix === '$' || currencySuffix === '$' || currencySuffix === 'USD') {
        currency = 'USD';
      } else if (currencySuffix === 'KHR' || currencySuffix === '៛') {
        currency = 'KHR';
      } else {
        // If no currency symbol is found, deduce: amounts >= 100 are almost always KHR in Cambodia
        currency = amount >= 100 ? 'KHR' : 'USD';
      }
    }
  }

  // Fallback pattern if structured label wasn't matched
  if (amount === 0) {
    const rawNumMatch = text.match(/(?:[\+]|ទទួលបាន|បាន)\s*([\d,]+(?:\.\d{1,2})?)\s*(KHR|USD|៛|\$)/i);
    if (rawNumMatch) {
      amount = parseFloat(rawNumMatch[1].replace(/,/g, ''));
      currency = (rawNumMatch[2].includes('USD') || rawNumMatch[2].includes('$')) ? 'USD' : 'KHR';
    }
  }

  if (amount <= 0) return null;

  // 4. Extract Sender Name
  let senderName: string | undefined;
  const senderMatch =
    text.match(/(?:ពី|អ្នកផ្ញើ|ពីគណនី|From|Sender)\s*[:=]?\s*([^\n\r,]+)/i);
  if (senderMatch && senderMatch[1]) {
    const cleanSender = senderMatch[1].trim().replace(/^[-–\s]+/, '');
    if (cleanSender.length > 1 && cleanSender.length < 60) {
      senderName = cleanSender;
    }
  }

  // 5. Extract Transaction Reference / ID
  let transactionId: string | undefined;
  const refMatch =
    text.match(/(?:លេខយោង|លេខប្រតិបត្តិការ|កូដ|Ref(?:erence)?|Txn(?:ID)?|Trace)\s*[:=#]?\s*([A-Za-z0-9_-]+)/i);
  if (refMatch && refMatch[1]) {
    transactionId = refMatch[1].trim();
  }

  // 6. Extract Account Number (if present)
  let accountNumber: string | undefined;
  const accMatch = text.match(/(?:គណនី|A\/C|Account)\s*[:=]?\s*([\d\s*-]{5,20})/i);
  if (accMatch && accMatch[1]) {
    accountNumber = accMatch[1].trim();
  }

  return {
    amount,
    currency,
    bankName,
    senderName,
    transactionId,
    accountNumber,
    rawText: text,
    timestamp: Date.now(),
  };
}

class BankAlertListenerService {
  private isPolling = false;
  private abortController: AbortController | null = null;
  private pollTimeoutId: any = null;
  private lastUpdateId = 0;
  private isSimulating = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedOffset = localStorage.getItem(LAST_OFFSET_KEY);
        if (savedOffset) {
          this.lastUpdateId = parseInt(savedOffset, 10) || 0;
        }
      } catch (e) {}
    }
  }

  /**
   * Start polling Telegram getUpdates in the background
   */
  public start(): void {
    if (this.isPolling) return;
    const config = getStoredTelegramConfig();

    if (!config.botToken || !config.enabled) {
      console.log('[BankAlertListener] Telegram Bot is not configured or disabled');
      return;
    }

    if (config.listenBankAlerts === false) {
      console.log('[BankAlertListener] Bank alert listening is turned off in settings');
      return;
    }

    this.isPolling = true;
    console.log('[BankAlertListener] 🟢 Started ACLEDA & Bank Alert Listener via Telegram Bot');
    this.pollLoop();
  }

  /**
   * Stop polling
   */
  public stop(): void {
    this.isPolling = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.pollTimeoutId) {
      clearTimeout(this.pollTimeoutId);
      this.pollTimeoutId = null;
    }
    console.log('[BankAlertListener] 🔴 Stopped Bank Alert Listener');
  }

  public isRunning(): boolean {
    return this.isPolling;
  }

  /**
   * Continuous Long-Polling loop to receive live Telegram messages
   */
  private async pollLoop(): Promise<void> {
    if (!this.isPolling) return;

    const config = getStoredTelegramConfig();
    const token = config.botToken?.trim();

    if (!token || !config.enabled || config.listenBankAlerts === false) {
      this.stop();
      return;
    }

    try {
      this.abortController = new AbortController();
      const offsetParam = this.lastUpdateId ? `&offset=${this.lastUpdateId + 1}` : '';
      const url = `https://api.telegram.org/bot${token}/getUpdates?timeout=20&allowed_updates=["message"]${offsetParam}`;

      const res = await fetch(url, {
        method: 'GET',
        signal: this.abortController.signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            if (update.update_id) {
              this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);
              try {
                localStorage.setItem(LAST_OFFSET_KEY, String(this.lastUpdateId));
              } catch (e) {}
            }

            if (update.message) {
              await this.handleIncomingMessage(update.message, config);
            }
          }
        }
      } else if (res.status === 409) {
        // Conflict: Another webhook or poller is active
        console.warn('[BankAlertListener] Telegram 409 Conflict: getUpdates cannot be used while Webhook is active');
        await new Promise((r) => setTimeout(r, 10000));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[BankAlertListener] Polling warning:', err.message || err);
      }
    }

    // Schedule next poll iteration with gentle throttle
    if (this.isPolling) {
      this.pollTimeoutId = setTimeout(() => this.pollLoop(), 1200);
    }
  }

  /**
   * Process incoming Telegram Message and check if it is a bank transaction alert
   */
  public async handleIncomingMessage(message: any, config: TelegramConfig): Promise<boolean> {
    if (!message) return false;

    const chatId = String(message.chat?.id || '');
    const messageId = String(message.message_id || '');
    const text = message.text || message.caption || '';

    if (!text) return false;

    // Optional Filter: If user specified a target bank alert group ID, check it
    const targetGroupId = config.bankAlertChatId?.trim();
    if (targetGroupId && targetGroupId !== '' && chatId !== targetGroupId) {
      return false; // Skip messages from unrelated groups
    }

    // Parse the message for bank deposits
    const parsed = parseBankAlertMessage(text);
    if (!parsed) return false;

    // Deduplication key
    const dedupeId = parsed.transactionId
      ? `txn_${parsed.bankName}_${parsed.transactionId}`
      : `msg_${chatId}_${messageId}`;

    const processed = getProcessedAlertIds();
    if (processed.has(dedupeId)) {
      return false; // Already processed
    }
    markAlertAsProcessed(dedupeId);

    console.log(`[BankAlertListener] 🎉 Valid ${parsed.bankName} Alert Detected!`, {
      amount: parsed.amount,
      currency: parsed.currency,
      sender: parsed.senderName,
      ref: parsed.transactionId,
    });

    // Create payment notification payload
    const paymentPayload: PaymentNotification = {
      id: dedupeId,
      amount: parsed.amount,
      currency: parsed.currency,
      bankName: parsed.bankName,
      senderName: parsed.senderName || 'អតិថិជនស្កេន KHQR',
      transactionId: parsed.transactionId || `TXN${Date.now().toString().slice(-6)}`,
      timestamp: parsed.timestamp,
    };

    // 1. Play success pop sound and notify PaymentListener (triggers Khmer Soundbox voice & Checkout auto-pay!)
    soundFx.playSuccess();
    paymentListener.notify(paymentPayload, true);

    // 2. Broadcast to Firebase Cloud so all cashier screens on LAN/Tablets receive it
    paymentListener.pushPaymentToCloud(
      paymentPayload.amount,
      paymentPayload.currency,
      paymentPayload.bankName,
      paymentPayload.senderName
    ).catch(() => {});

    // 3. Dispatch specific window event for Toast and UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bank_alert_received', {
          detail: { ...paymentPayload, rawText: parsed.rawText },
        })
      );
    }

    return true;
  }

  /**
   * Simulate an ACLEDA Alert message to test Soundbox voice, Toast, and checkout matching
   */
  public simulateAcledaAlert(amount: number = 25000, currency: 'KHR' | 'USD' = 'KHR'): ParsedBankAlert {
    const formattedAmount = currency === 'KHR'
      ? `${amount.toLocaleString()} KHR`
      : `$${amount.toFixed(2)}`;

    const simulatedText = `ធនាគារ អេស៊ីលីដា ភីអិលស៊ី
គណនី: 010-xxx-1688 (KHR)
ចំនួនទឹកប្រាក់: +${formattedAmount}
ពី: SOK DARA (អតិថិជនសាកល្បង)
កាលបរិច្ឆេទ: ${new Date().toLocaleTimeString()}
លេខយោង: ACL${Math.floor(100000 + Math.random() * 900000)}
សមតុល្យ: 1,850,000.00 KHR`;

    const parsed = parseBankAlertMessage(simulatedText);
    if (parsed) {
      const paymentPayload: PaymentNotification = {
        id: `sim_acleda_${Date.now()}`,
        amount: parsed.amount,
        currency: parsed.currency,
        bankName: parsed.bankName,
        senderName: parsed.senderName,
        transactionId: parsed.transactionId,
        timestamp: Date.now(),
        isSimulated: true,
      };

      paymentListener.notify(paymentPayload, true);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('bank_alert_received', {
            detail: { ...paymentPayload, rawText: simulatedText },
          })
        );
      }
    }

    return parsed!;
  }
}

export const bankAlertListener = new BankAlertListenerService();
