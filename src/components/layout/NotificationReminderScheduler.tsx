import React, { useEffect, useState } from 'react';
import { Bell, X, Sparkles, Zap, Check, Send } from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import {
  runPeriodicNotificationChecks,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  getStoredNotificationConfig,
  saveStoredNotificationConfig,
} from '../../services/notifications';
import { triggerAppCloseDailyReport } from '../../services/telegram';
import { soundFx } from '../../utils/audio';

export const NotificationReminderScheduler: React.FC = () => {
  const { customOrders, expenses, ingredients, storeInfo, exchangeRate, isDemoMode, sales } = useBakery();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission
  );
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    return localStorage.getItem('bakery_notification_banner_dismissed') === 'true';
  });
  const [isEnabling, setIsEnabling] = useState(false);
  const [isClosingApp, setIsClosingApp] = useState(false);

  // Ref to hold latest params without restarting interval on every state update
  const paramsRef = React.useRef({ customOrders, expenses, ingredients, storeInfo, exchangeRate, sales });
  useEffect(() => {
    paramsRef.current = { customOrders, expenses, ingredients, storeInfo, exchangeRate, sales };
  }, [customOrders, expenses, ingredients, storeInfo, exchangeRate, sales]);

  // 1. Run background periodic notification checks smoothly (every 60s, with safe initial delay)
  useEffect(() => {
    if (isDemoMode) return;

    const timer = setInterval(() => {
      runPeriodicNotificationChecks(paramsRef.current);
    }, 60000);

    // Initial check delayed by 10s to let app finish hydrating and avoid double-firing
    const initialTimer = setTimeout(() => {
      runPeriodicNotificationChecks(paramsRef.current);
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, [isDemoMode]);

  // 2. Refresh permission status when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      setPermission(getNotificationPermission());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 3. Auto send Telegram summary report on App Close (Desktop Electron & Web Browser)
  useEffect(() => {
    if (isDemoMode) return;

    // A) Desktop Electron Interceptor
    const desktop = (window as any).SweetBakeryDesktop;
    if (desktop && typeof desktop.onBeforeClose === 'function') {
      desktop.onBeforeClose(async () => {
        setIsClosingApp(true);
        try {
          await triggerAppCloseDailyReport({
            sales: paramsRef.current.sales || [],
            expenses: paramsRef.current.expenses || [],
            customOrders: paramsRef.current.customOrders || [],
            storeInfo: paramsRef.current.storeInfo,
            exchangeRate: paramsRef.current.exchangeRate,
          });
        } catch (e) {
          console.error('[App Close Report] Error:', e);
        } finally {
          setTimeout(() => {
            if (typeof desktop.sendCloseReady === 'function') {
              desktop.sendCloseReady();
            }
          }, 600);
        }
      });
    }

    // B) Web Browser / PWA unload & pagehide handler
    const handleBrowserUnload = () => {
      triggerAppCloseDailyReport({
        sales: paramsRef.current.sales || [],
        expenses: paramsRef.current.expenses || [],
        customOrders: paramsRef.current.customOrders || [],
        storeInfo: paramsRef.current.storeInfo,
        exchangeRate: paramsRef.current.exchangeRate,
      }).catch(() => {});
    };

    window.addEventListener('beforeunload', handleBrowserUnload);
    window.addEventListener('pagehide', handleBrowserUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBrowserUnload);
      window.removeEventListener('pagehide', handleBrowserUnload);
    };
  }, [isDemoMode]);

  const handleEnableNotifications = async () => {
    setIsEnabling(true);
    soundFx.playPop();
    const granted = await requestNotificationPermission();
    setIsEnabling(false);
    const newPerm = getNotificationPermission();
    setPermission(newPerm);

    if (granted) {
      soundFx.playSuccess();
      const currentConfig = getStoredNotificationConfig();
      saveStoredNotificationConfig({ ...currentConfig, enabled: true });
      sendTestNotification();
      setIsBannerDismissed(true);
      localStorage.setItem('bakery_notification_banner_dismissed', 'true');
    }
  };

  const handleDismissBanner = () => {
    soundFx.playPop();
    setIsBannerDismissed(true);
    localStorage.setItem('bakery_notification_banner_dismissed', 'true');
  };

  const showBanner = !isDemoMode && permission !== 'granted' && permission !== 'unsupported' && !isBannerDismissed;

  return (
    <>
      {/* Visual Overlay when Gracefully Closing App & Sending Report */}
      {isClosingApp && (
        <div className="fixed inset-0 z-[9999999] bg-slate-900/85 backdrop-blur-md flex flex-col items-center justify-center text-white px-4 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-sky-500/40 mb-4 animate-bounce">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-base sm:text-lg font-black font-battambang mb-1">
            កំពុងផ្ញើរបាយការណ៍សរុបចូល Telegram Bot... 📊
          </h3>
          <p className="text-xs text-sky-200 font-battambang max-w-sm leading-relaxed">
            ប្រព័ន្ធកំពុងបូកសរុបការលក់ និងចំណាយប្រចាំថ្ងៃជូនលោកអ្នកដោយស្វ័យប្រវត្ត មុនពេលបិទកម្មវិធី SweetBakery POS។
          </p>
        </div>
      )}

      {/* Staff Push Reminders Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white px-3 sm:px-4 py-2 text-xs flex items-center justify-between gap-2 shadow-md relative z-40 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
              <Bell className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="truncate font-semibold text-[11px] sm:text-xs">
              <strong className="font-black">🔔 បើកការដាស់តឿនលើទូរសព្ទ (Staff Push Reminders)៖</strong> ជួយរំលឹកកត់ត្រាចំណាយ នំកុម្ម៉ង់ត្រូវមកយក និងបិទវេនតាមម៉ោងកំណត់!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={isEnabling}
              className="px-3 py-1 bg-white text-pink-600 hover:bg-pink-50 font-black rounded-xl text-[11px] shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              <Zap className="w-3 h-3 fill-pink-600" />
              <span>{isEnabling ? 'កំពុងបើក...' : 'បើកឥឡូវនេះ (Enable)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismissBanner}
              className="w-6 h-6 rounded-lg hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="បិទផ្ទាំងនេះ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
