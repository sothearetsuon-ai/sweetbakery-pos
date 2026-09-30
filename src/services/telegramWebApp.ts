/**
 * Telegram Mini App (TMA / WebApp) Integration Service
 * 
 * Provides native bridge to Telegram WebApp JavaScript SDK:
 * - Fullscreen expansion
 * - Telegram User Profile detection (first name, username, id)
 * - Native Haptic Feedback
 * - Native MainButton & BackButton lifecycle
 * - Theme and viewport synchronization
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: any;
    start_param?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

/**
 * Check if the application is currently running inside Telegram WebApp
 */
export const isTelegramWebApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.Telegram?.WebApp &&
    (window.Telegram.WebApp.initData || window.Telegram.WebApp.platform)
  );
};

/**
 * Get the Telegram WebApp instance
 */
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
};

/**
 * Get current Telegram user profile if launched inside Telegram
 */
export const getTelegramUser = (): TelegramUser | null => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
};

/**
 * Get launch start_param passed from Telegram bot (e.g. t.me/my_bot/app?startapp=order)
 */
export const getTelegramStartParam = (): string | null => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.start_param || null;
};

/**
 * Initialize Telegram Mini App on application mount
 */
export const initTelegramMiniApp = (): void => {
  const tg = getTelegramWebApp();
  if (!tg) return;

  try {
    tg.ready();
    tg.expand();
    
    // Set matching colors for bakery aesthetic
    if (typeof tg.setHeaderColor === 'function') {
      tg.setHeaderColor('#FAF8F5');
    }
    if (typeof tg.setBackgroundColor === 'function') {
      tg.setBackgroundColor('#FAF8F5');
    }
    
    // Warn before accidental closing if user is midway through an order
    if (typeof tg.enableClosingConfirmation === 'function') {
      tg.enableClosingConfirmation();
    }
  } catch (e) {
    console.warn('[Telegram Mini App] Initialization warning:', e);
  }
};

/**
 * Trigger native Telegram Haptic Impact (vibration)
 */
export const tgHapticImpact = (style: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid' = 'light'): void => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback?.impactOccurred) {
    try {
      tg.HapticFeedback.impactOccurred(style);
    } catch (e) {}
  }
};

/**
 * Trigger native Telegram Haptic Notification (success / warning / error)
 */
export const tgHapticNotification = (type: 'success' | 'warning' | 'error'): void => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback?.notificationOccurred) {
    try {
      tg.HapticFeedback.notificationOccurred(type);
    } catch (e) {}
  }
};

/**
 * Trigger native Telegram Haptic Selection changed
 */
export const tgHapticSelection = (): void => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback?.selectionChanged) {
    try {
      tg.HapticFeedback.selectionChanged();
    } catch (e) {}
  }
};
