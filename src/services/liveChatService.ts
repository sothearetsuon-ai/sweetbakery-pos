import { ChatMessage, CustomerChatSession, ChatChannel, ChatSenderRole, StoreInfo } from '../types';
import {
  saveFirestoreDoc,
  subscribeToFirestoreCollection,
  getFirestoreDb,
  getStoreId,
} from './firebase';
import { sendTelegramMessage, escapeHtml, getStoredTelegramConfig } from './telegram';
import { soundFx } from '../utils/audio';

const STORAGE_CHATS_KEY = 'bakery_live_chat_messages';
const STORAGE_SESSIONS_KEY = 'bakery_live_chat_sessions';
const STORAGE_CUST_SESSION_ID = 'bakery_customer_chat_session_id';
const STORAGE_CUST_NAME = 'bakery_customer_chat_name';
const STORAGE_CUST_PHONE = 'bakery_customer_chat_phone';

// Real-time inter-tab communication channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('bakery_live_chat_channel');
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

/**
 * Get or create a persistent Customer Session ID for the customer's browser
 */
export function getCustomerSessionId(): string {
  if (typeof window === 'undefined') return 'cust_default';
  try {
    let id = localStorage.getItem(STORAGE_CUST_SESSION_ID);
    if (!id) {
      id = 'cust_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      localStorage.setItem(STORAGE_CUST_SESSION_ID, id);
    }
    return id;
  } catch (e) {
    return 'cust_' + Date.now();
  }
}

/**
 * Get saved Customer name and phone
 */
export function getSavedCustomerInfo(): { name: string; phone: string } {
  if (typeof window === 'undefined') return { name: '', phone: '' };
  try {
    return {
      name: localStorage.getItem(STORAGE_CUST_NAME) || '',
      phone: localStorage.getItem(STORAGE_CUST_PHONE) || '',
    };
  } catch (e) {
    return { name: '', phone: '' };
  }
}

export function saveCustomerInfo(name: string, phone: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (name) localStorage.setItem(STORAGE_CUST_NAME, name.trim());
    if (phone) localStorage.setItem(STORAGE_CUST_PHONE, phone.trim());
  } catch (e) {}
}

/**
 * Load all stored messages from localStorage
 */
function loadLocalMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CHATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save messages to localStorage
 */
function saveLocalMessages(msgs: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep most recent 500 messages to prevent storage overflow
    const trimmed = msgs.slice(-500);
    localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(trimmed));
  } catch (e) {}
}

/**
 * Load all customer chat sessions
 */
function loadLocalSessions(): CustomerChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save customer chat sessions
 */
function saveLocalSessions(sessions: CustomerChatSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {}
}

/**
 * Initial Default AI Assistant Message
 */
export function getInitialAiWelcomeMessage(storeName = 'Sweet Bakery'): ChatMessage {
  return {
    id: 'ai_welcome_initial',
    channel: 'AI_ASSISTANT',
    senderName: 'Smart AI Assistant 🤖',
    senderRole: 'AI',
    senderAvatar: '🤖',
    text: `សួស្តីបាទ/ចាស! ខ្ញុំជាជំនួយការឆ្លាតវៃ AI ប្រចាំ ${storeName} 🎂✨

ខ្ញុំអាចជួយលោកអ្នកបានភ្លាមៗ៖
• 🔍 **ស្វែងរកទំនិញ & ពិនិត្យតម្លៃ** ទាំង $ USD និង ៛ KHR
• 👥 **ណែនាំទំហំនំ & ថវិកាតាមចំនួនភ្ញៀវ**
• 🍓 **ណែនាំរសជាតិនំឆ្ងាញ់ៗប្រចាំហាង**
• ✍️ **ជួយតែងអក្សរជូនពរខួបកំណើតជាភាសាខ្មែរយ៉ាងពិរោះ**
• 🍰 **គណនារូបមន្ត និងគ្រឿងផ្សំសម្រាប់អ្នកធ្វើនំ**

តើខ្ញុំអាចជួយអ្វីលោកអ្នកថ្ងៃនេះដែរ?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: Date.now(),
    quickReplies: [
      'ណែនាំទំហំនំតាមចំនួនមនុស្ស',
      'ជួយតែងពាក្យជូនពរខួបកំណើត',
      'រសជាតិនំឆ្ងាញ់ប្រចាំហាង',
      'ពិនិត្យទំនិញគ្រឿងបន្ថែម Party',
    ],
  };
}

/**
 * Initial Default Staff Team Chat Messages
 */
function getInitialStaffMessages(): ChatMessage[] {
  return [
    {
      id: 'staff_msg_welcome',
      channel: 'STAFF_TEAM',
      senderName: 'ប្រព័ន្ធហាង (System)',
      senderRole: 'SYSTEM',
      senderAvatar: '🏢',
      text: '🎉 សូមស្វាគមន៍មកកាន់បន្ទប់ជជែកផ្ទៃក្នុងក្រុមការងារហាង! អ្នកទាំងអស់គ្នាអាចទុកសារ កំណត់ត្រា ឬផ្ញើដំណឹងរហ័សរវាងអ្នកគិតលុយ និងអ្នកធ្វើនំនៅទីនេះ។',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now() - 3600000,
    },
  ];
}

/**
 * Send a new chat message across in-app channels
 */
export async function sendChatMessage(
  msg: Omit<ChatMessage, 'id' | 'createdAt'>,
  storeInfo?: StoreInfo
): Promise<ChatMessage> {
  const newMsg: ChatMessage = {
    ...msg,
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: Date.now(),
    timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // 1. Save to local storage
  const allMsgs = loadLocalMessages();
  allMsgs.push(newMsg);
  saveLocalMessages(allMsgs);

  // 2. If Customer Channel, update or create session
  if (newMsg.channel === 'CUSTOMER' && newMsg.sessionId) {
    const sessions = loadLocalSessions();
    const existingIdx = sessions.findIndex((s) => s.sessionId === newMsg.sessionId);

    const isFromCustomer = newMsg.senderRole === 'CUSTOMER';
    if (existingIdx >= 0) {
      const sess = sessions[existingIdx];
      sess.lastMessage = newMsg.text;
      sess.lastTimestamp = newMsg.createdAt;
      if (isFromCustomer) {
        sess.unreadCountStaff = (sess.unreadCountStaff || 0) + 1;
        if (newMsg.customerPhone && !sess.customerPhone) {
          sess.customerPhone = newMsg.customerPhone;
        }
      } else {
        sess.unreadCountCustomer = (sess.unreadCountCustomer || 0) + 1;
      }
      sessions[existingIdx] = sess;
    } else {
      sessions.unshift({
        sessionId: newMsg.sessionId,
        customerName: newMsg.senderName || 'អតិថិជន',
        customerPhone: newMsg.customerPhone,
        lastMessage: newMsg.text,
        lastTimestamp: newMsg.createdAt,
        unreadCountStaff: isFromCustomer ? 1 : 0,
        unreadCountCustomer: isFromCustomer ? 0 : 1,
        createdAt: newMsg.createdAt,
        status: 'ACTIVE',
      });
    }

    saveLocalSessions(sessions);

    // Save session to Firestore if online
    try {
      const sessToSave = sessions.find((s) => s.sessionId === newMsg.sessionId);
      if (sessToSave) {
        saveFirestoreDoc('live_chat_sessions', sessToSave.sessionId, sessToSave);
      }
    } catch (e) {}

    // 3. If message is from a customer, trigger Telegram alert to store owner
    if (isFromCustomer) {
      notifyTelegramCustomerChat(newMsg, storeInfo).catch(() => {});
    }
  }

  // 4. Save message to Firestore for real-time cloud multi-device sync
  try {
    saveFirestoreDoc('live_chats', newMsg.id, newMsg);
  } catch (e) {}

  // 5. Notify local listeners and other tabs
  notifyLocalMessageChange(newMsg);

  return newMsg;
}

/**
 * Trigger Telegram Notification for New Customer In-App Chat
 */
async function notifyTelegramCustomerChat(msg: ChatMessage, storeInfo?: StoreInfo) {
  try {
    const tgConfig = getStoredTelegramConfig();
    if (!tgConfig.enabled || !tgConfig.botToken || !tgConfig.chatId) return;

    const storeTitle = storeInfo?.nameKh || 'Sweet Bakery';
    const custName = msg.senderName || 'អតិថិជន';
    const custPhone = msg.customerPhone ? msg.customerPhone.trim() : '';

    const text = `💬 <b>សារសួរនាំផ្ទាល់លើ App ពីអតិថិជន (In-App Live Chat)</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>ភ្ញៀវ៖</b> ${escapeHtml(custName)}
${custPhone ? `📞 <b>លេខទូរស័ព្ទ៖</b> <code>${escapeHtml(custPhone)}</code>` : '📞 <i>(មិនបានផ្ដល់លេខទូរស័ព្ទ)</i>'}
⏰ <b>ម៉ោង៖</b> ${escapeHtml(msg.timestamp)}
📍 <b>ហាង៖</b> ${escapeHtml(storeTitle)}

📝 <b>ខ្លឹមសារសារ៖</b>
<i>${escapeHtml(msg.text)}</i>
━━━━━━━━━━━━━━━━━━━━━
👉 <b>របៀបឆ្លើយតបទៅកាន់ភ្ញៀវវិញ៖</b>
1️⃣ <b>បើក App POS</b> ➜ ចុចប៊ូតុង <b>«💬 ឆាត»</b> ដើម្បីវាយតបទៅភ្ញៀវផ្ទាល់ (ភ្ញៀវនឹងឃើញសារលើទូរស័ព្ទរបស់គាត់ភ្លាមៗ)
${custPhone ? `2️⃣ ឬចុចខលទូរស័ព្ទ / Search Telegram ទៅកាន់លេខ <code>${escapeHtml(custPhone)}</code> ដើម្បីទាក់ទងភ្ញៀវផ្ទាល់` : ''}`;

    await sendTelegramMessage(text);
  } catch (e) {
    console.warn('Failed to send Telegram chat notification:', e);
  }
}

/**
 * Broadcast local change
 */
function notifyLocalMessageChange(msg: ChatMessage) {
  if (typeof window === 'undefined') return;

  // Custom DOM event
  try {
    window.dispatchEvent(new CustomEvent('bakery_live_chat_update', { detail: msg }));
  } catch (e) {}

  // BroadcastChannel for cross-tab sync
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'NEW_CHAT_MESSAGE', message: msg });
    } catch (e) {}
  }
}

/**
 * Subscribe to Messages of a specific channel & optional customer session
 */
export function subscribeToChatMessages(
  channel: ChatChannel,
  sessionId: string | undefined,
  callback: (messages: ChatMessage[]) => void
): () => void {
  let isUnsubscribed = false;

  const pushCurrent = () => {
    if (isUnsubscribed) return;
    const local = loadLocalMessages();
    let filtered = local.filter((m) => m.channel === channel);

    if (channel === 'CUSTOMER') {
      if (sessionId) {
        filtered = filtered.filter((m) => m.sessionId === sessionId);
      }
    } else if (channel === 'AI_ASSISTANT' && filtered.length === 0) {
      filtered = [getInitialAiWelcomeMessage()];
    } else if (channel === 'STAFF_TEAM' && filtered.length === 0) {
      filtered = getInitialStaffMessages();
    }

    filtered.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    callback(filtered);
  };

  // Initial call
  pushCurrent();

  // 1. Listen for DOM events
  const handleDomEvent = () => pushCurrent();
  window.addEventListener('bakery_live_chat_update', handleDomEvent);
  window.addEventListener('storage', handleDomEvent);

  // 2. Listen for BroadcastChannel
  const handleBc = (evt: MessageEvent) => {
    if (evt.data?.type === 'NEW_CHAT_MESSAGE') {
      pushCurrent();
    }
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBc);
  }

  // 3. Real-time Firestore sync
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    const db = getFirestoreDb();
    if (db) {
      unsubscribeFirestore = subscribeToFirestoreCollection<ChatMessage>(
        'live_chats',
        (cloudMsgs) => {
          if (isUnsubscribed || !Array.isArray(cloudMsgs)) return;

          // Merge cloud messages with local messages
          const local = loadLocalMessages();
          const localMap = new Map<string, ChatMessage>();
          local.forEach((m) => localMap.set(m.id, m));
          cloudMsgs.forEach((m) => {
            if (m && m.id) localMap.set(m.id, m);
          });

          const merged = Array.from(localMap.values());
          saveLocalMessages(merged);
          pushCurrent();
        }
      );
    }
  } catch (e) {
    console.warn('Firestore chat subscription notice:', e);
  }

  return () => {
    isUnsubscribed = true;
    window.removeEventListener('bakery_live_chat_update', handleDomEvent);
    window.removeEventListener('storage', handleDomEvent);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBc);
    }
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}

/**
 * Subscribe to Customer Chat Sessions (for staff/cashier overview)
 */
export function subscribeToCustomerSessions(
  callback: (sessions: CustomerChatSession[]) => void
): () => void {
  let isUnsubscribed = false;

  const pushSessions = () => {
    if (isUnsubscribed) return;
    const list = loadLocalSessions();
    list.sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0));
    callback(list);
  };

  pushSessions();

  const handleUpdate = () => pushSessions();
  window.addEventListener('bakery_live_chat_update', handleUpdate);
  window.addEventListener('storage', handleUpdate);

  let unsubFirestore: (() => void) | null = null;
  try {
    const db = getFirestoreDb();
    if (db) {
      unsubFirestore = subscribeToFirestoreCollection<CustomerChatSession>(
        'live_chat_sessions',
        (cloudSessions) => {
          if (isUnsubscribed || !Array.isArray(cloudSessions)) return;
          const local = loadLocalSessions();
          const map = new Map<string, CustomerChatSession>();
          local.forEach((s) => map.set(s.sessionId, s));
          cloudSessions.forEach((s) => {
            if (s && s.sessionId) map.set(s.sessionId, s);
          });
          const merged = Array.from(map.values());
          saveLocalSessions(merged);
          pushSessions();
        }
      );
    }
  } catch (e) {}

  return () => {
    isUnsubscribed = true;
    window.removeEventListener('bakery_live_chat_update', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
    if (unsubFirestore) unsubFirestore();
  };
}

/**
 * Mark a Customer Chat Session as read
 */
export function markChatAsRead(sessionId: string, by: 'STAFF' | 'CUSTOMER'): void {
  if (typeof window === 'undefined') return;
  try {
    const sessions = loadLocalSessions();
    const idx = sessions.findIndex((s) => s.sessionId === sessionId);
    if (idx >= 0) {
      if (by === 'STAFF') {
        sessions[idx].unreadCountStaff = 0;
      } else {
        sessions[idx].unreadCountCustomer = 0;
      }
      saveLocalSessions(sessions);
      saveFirestoreDoc('live_chat_sessions', sessionId, sessions[idx]);
    }

    // Also mark messages as isRead
    const msgs = loadLocalMessages();
    let updated = false;
    msgs.forEach((m) => {
      if (m.sessionId === sessionId && !m.isRead) {
        if ((by === 'STAFF' && m.senderRole === 'CUSTOMER') || (by === 'CUSTOMER' && m.senderRole === 'STAFF')) {
          m.isRead = true;
          updated = true;
        }
      }
    });

    if (updated) {
      saveLocalMessages(msgs);
    }

    window.dispatchEvent(new CustomEvent('bakery_live_chat_update'));
  } catch (e) {}
}

/**
 * Get total unread message count for Staff / Cashier
 */
export function getStaffUnreadChatCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const sessions = loadLocalSessions();
    return sessions.reduce((sum, s) => sum + (s.unreadCountStaff || 0), 0);
  } catch (e) {
    return 0;
  }
}
