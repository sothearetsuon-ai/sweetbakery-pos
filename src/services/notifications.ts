import { NotificationConfig, CustomCakeOrder, Expense, Ingredient } from '../types';
import { soundFx } from '../utils/audio';

const STORAGE_KEY = 'bakery_notification_config';

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: true,
  remindExpenses: true,
  expenseReminderTime1: '12:00', // 12:00 PM (Lunch check)
  expenseReminderTime2: '18:00', // 6:00 PM (Evening check)
  expenseReminderTime3: '20:30', // 8:30 PM (Closing shift check)
  remindCakePickup: true,
  cakePickupAdvanceMins: 60, // 1 hour before pickup
  remindLowStock: true,
  soundEnabled: true,
};

/**
 * Check if the browser supports notifications
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Get current browser notification permission
 */
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

/**
 * Request notification permission from user / browser
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return false;
  }
};

/**
 * Get saved notification settings from localStorage
 */
export const getStoredNotificationConfig = (): NotificationConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_NOTIFICATION_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_NOTIFICATION_CONFIG;
};

/**
 * Save notification settings to localStorage
 */
export const saveStoredNotificationConfig = (config: NotificationConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {}
};

/**
 * Send an actual push/browser notification to the device screen
 */
export const sendDeviceNotification = (
  title: string,
  options: {
    body: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    data?: any;
  }
): boolean => {
  const config = getStoredNotificationConfig();
  if (!config.enabled) return false;

  if (config.soundEnabled) {
    soundFx.playNotificationAlert();
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const defaultIcon = '/uploads/products/prod_1789651345094_x6k2.jpg';
    
    // Check if ServiceWorker registration can show notification (better for mobile lock screens)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body: options.body,
          icon: options.icon || defaultIcon,
          badge: options.icon || defaultIcon,
          tag: options.tag || `bakery-${Date.now()}`,
          requireInteraction: options.requireInteraction ?? false,
          data: options.data,
        } as any);
      }).catch(() => {
        // Fallback to standard Notification API
        new Notification(title, {
          body: options.body,
          icon: options.icon || defaultIcon,
          tag: options.tag || `bakery-${Date.now()}`,
          requireInteraction: options.requireInteraction ?? false,
        });
      });
      return true;
    }

    // Standard Notification
    new Notification(title, {
      body: options.body,
      icon: options.icon || defaultIcon,
      tag: options.tag || `bakery-${Date.now()}`,
      requireInteraction: options.requireInteraction ?? false,
    });
    return true;
  } catch (e) {
    console.error('Failed to dispatch device notification:', e);
    return false;
  }
};

/**
 * Send a test notification to verify device compatibility
 */
export const sendTestNotification = (): boolean => {
  return sendDeviceNotification('🎉 SweetBakery POS - ដំណើរការជូនដំណឹងជោគជ័យ!', {
    body: 'ទូរសព្ទរបស់អ្នកត្រូវបានភ្ជាប់ជាមួយប្រព័ន្ធដាស់តឿនបុគ្គលិកដោយជោគជ័យ! (នឹងមានសាររំលឹកពេលកត់ត្រាចំណាយ និងនំត្រូវមកយក)',
    tag: 'test-notification',
  });
};

/**
 * Check and trigger reminders in the background
 */
// Keep track of fired tags today so we don't spam
const firedReminders = new Set<string>();

export const runPeriodicNotificationChecks = (params: {
  customOrders: CustomCakeOrder[];
  expenses: Expense[];
  ingredients: Ingredient[];
}) => {
  const config = getStoredNotificationConfig();
  if (!config.enabled) return;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMins = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMins}`;

  // 1. Expense & Shift Reminders at scheduled times
  if (config.remindExpenses) {
    const times = [
      config.expenseReminderTime1,
      config.expenseReminderTime2,
      config.expenseReminderTime3,
    ].filter(Boolean);

    for (const targetTime of times) {
      if (currentTimeStr === targetTime) {
        const tag = `expense-reminder-${todayStr}-${targetTime}`;
        if (!firedReminders.has(tag)) {
          firedReminders.add(tag);

          const expensesToday = params.expenses.filter((e) => e.date === todayStr);
          sendDeviceNotification('💸 រំលឹកកត់ត្រាចំណាយ (SweetBakery POS)', {
            body: `⏰ ម៉ោង ${targetTime}៖ សូមកុំភ្លេចថតរូបវិក្កយបត្រ និងបញ្ចូលការចំណាយដែលបានទិញថ្ងៃនេះ (ថ្ងៃនេះបានកត់ត្រា ${expensesToday.length} លើក)។`,
            tag,
            requireInteraction: true,
          });
        }
      }
    }
  }

  // 2. Cake Pickup Reminders
  if (config.remindCakePickup && Array.isArray(params.customOrders)) {
    const advanceMs = (config.cakePickupAdvanceMins || 60) * 60 * 1000;
    
    params.customOrders.forEach((order) => {
      if (order.status === 'DELIVERED' || order.status === 'CANCELLED') return;
      if (order.pickupDate !== todayStr) return;

      if (order.pickupTime) {
        const [pHours, pMins] = order.pickupTime.split(':').map(Number);
        if (!isNaN(pHours) && !isNaN(pMins)) {
          const pickupDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), pHours, pMins);
          const diffMs = pickupDateObj.getTime() - now.getTime();

          // If pickup time is within the window (between 0 and advanceMs)
          if (diffMs > 0 && diffMs <= advanceMs) {
            const minsLeft = Math.round(diffMs / 60000);
            const tag = `pickup-alert-${order.id}-${todayStr}`;
            if (!firedReminders.has(tag)) {
              firedReminders.add(tag);
              sendDeviceNotification(`🎂 រំលឹកមកយកនំ: ${order.customerName} (${order.pickupTime})`, {
                body: `នំខេក "${order.cakeName || order.flavor}" នឹងត្រូវមកយកក្នុងរយៈពេល ${minsLeft} នាទីទៀត! សូមរៀបចំនំឱ្យរួចរាល់។`,
                tag,
                requireInteraction: true,
              });
            }
          }
        }
      }
    });
  }

  // 3. Low stock warning (once per day)
  if (config.remindLowStock && Array.isArray(params.ingredients)) {
    const lowStockItems = params.ingredients.filter((i) => i.currentStock <= i.minAlertStock);
    if (lowStockItems.length > 0 && currentTimeStr === '09:00') {
      const tag = `low-stock-${todayStr}`;
      if (!firedReminders.has(tag)) {
        firedReminders.add(tag);
        sendDeviceNotification('⚠️ ការដាស់តឿន៖ គ្រឿងផ្សំជិតអស់ស្តុក!', {
          body: `មានគ្រឿងផ្សំចំនួន ${lowStockItems.length} មុខជិតអស់ពីស្តុក (${lowStockItems.map((i) => i.nameKh).slice(0, 3).join(', ')}...)។ សូមពិនិត្យទិញបន្ថែម។`,
          tag,
        });
      }
    }
  }
};
