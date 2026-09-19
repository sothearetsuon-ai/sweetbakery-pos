import React, { useEffect, useState } from 'react';
import { Bell, X, Sparkles, Zap, Check } from 'lucide-react';
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
import { soundFx } from '../../utils/audio';

export const NotificationReminderScheduler: React.FC = () => {
  const { customOrders, expenses, ingredients } = useBakery();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission
  );
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    return localStorage.getItem('bakery_notification_banner_dismissed') === 'true';
  });
  const [isEnabling, setIsEnabling] = useState(false);

  // 1. Run background periodic notification checks every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      runPeriodicNotificationChecks({
        customOrders,
        expenses,
        ingredients,
      });
    }, 30000);

    // Initial check on mount
    runPeriodicNotificationChecks({
      customOrders,
      expenses,
      ingredients,
    });

    return () => clearInterval(timer);
  }, [customOrders, expenses, ingredients]);

  // 2. Refresh permission status when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      setPermission(getNotificationPermission());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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

  // If already granted, unsupported, or dismissed, don't show the prompt banner
  if (permission === 'granted' || permission === 'unsupported' || isBannerDismissed) {
    return null;
  }

  return (
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
  );
};
