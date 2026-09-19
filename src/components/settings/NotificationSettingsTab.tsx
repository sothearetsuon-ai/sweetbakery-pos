import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Info,
  Calendar,
  Smartphone,
  DollarSign,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NotificationConfig } from '../../types';
import {
  DEFAULT_NOTIFICATION_CONFIG,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getStoredNotificationConfig,
  saveStoredNotificationConfig,
  sendTestNotification,
} from '../../services/notifications';
import { soundFx } from '../../utils/audio';

export const NotificationSettingsTab: React.FC = () => {
  const [config, setConfig] = useState<NotificationConfig>(getStoredNotificationConfig);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    soundFx.playPop();
    const granted = await requestNotificationPermission();
    setIsRequesting(false);
    const newPerm = getNotificationPermission();
    setPermission(newPerm);

    if (granted) {
      soundFx.playSuccess();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      const updated = { ...config, enabled: true };
      setConfig(updated);
      saveStoredNotificationConfig(updated);
      sendTestNotification();
    }
  };

  const handleSave = (updated: NotificationConfig) => {
    setConfig(updated);
    saveStoredNotificationConfig(updated);
    setSaveToast(true);
    soundFx.playPop();
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleTestNotification = () => {
    soundFx.playPop();
    const success = sendTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      handleRequestPermission();
    }
  };

  const isSupported = isNotificationSupported();
  const isGranted = permission === 'granted';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 border border-pink-200 rounded-3xl p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
          <Bell className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-black text-slate-800">
              ប្រព័ន្ធដាស់តឿនលើអេក្រង់ទូរសព្ទ (Push / Device Notifications)
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-pink-800 border border-pink-300">
              ស្វ័យប្រវត្តិ
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            ផ្ញើសារជូនដំណឹង និងបន្លឺសំឡេងកណ្ដឹងលើអេក្រង់ទូរសព្ទបុគ្គលិកដោយផ្ទាល់ (Lock Screen / Notification Banner) ដើម្បីដាស់តឿន <strong>កត់ត្រាចំណាយប្រចាំថ្ងៃ</strong>, <strong>រំលឹកនំកុម្ម៉ង់ត្រូវប្រគល់ជូនភ្ញៀវ</strong> និង <strong>បិទវេន</strong>។
          </p>
        </div>
      </div>

      {/* Permission Status & Activation Card */}
      <div className="p-5 rounded-3xl border bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                isGranted
                  ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse'
                  : permission === 'denied'
                  ? 'bg-rose-500 ring-4 ring-rose-100'
                  : 'bg-amber-400 ring-4 ring-amber-100'
              }`}
            />
            <div>
              <h5 className="text-sm font-black text-slate-800">
                {isGranted
                  ? '🟢 បានបើកការជូនដំណឹងលើទូរសព្ទនេះរួចរាល់'
                  : permission === 'denied'
                  ? '🔴 ការជូនដំណឹងត្រូវបានបិទ (Blocked in Browser Settings)'
                  : '🟡 មិនទាន់បានបើកការជូនដំណឹងលើឧបករណ៍នេះ'}
              </h5>
              <p className="text-xs text-slate-500">
                {isGranted
                  ? 'ទូរសព្ទនេះនឹងទទួលបានសារដាស់តឿនតាមម៉ោងកំណត់ដោយស្វ័យប្រវត្តិ'
                  : permission === 'denied'
                  ? 'សូមចូលទៅ Browser Settings លើទូរសព្ទ រួចចុច Allow Notifications សម្រាប់គេហទំព័រនេះ'
                  : 'សូមចុចប៊ូតុងខាងស្តាំដើម្បីអនុញ្ញាតឱ្យទូរសព្ទបង្ហាញសារដាស់តឿន'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isGranted ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isRequesting || !isSupported}
                className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-pink-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isRequesting ? 'កំពុងបើក...' : '🔔 បើកការជូនដំណឹងឥឡូវនេះ'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                <span>{testSent ? '✅ បានផ្ញើសាររួច!' : '🧪 សាកល្បងផ្ញើសារដាស់តឿន (Test)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs font-black text-slate-800">បើកដំណើរការប្រព័ន្ធដាស់តឿន (Enable Reminders)</p>
            <p className="text-[11px] text-slate-500">អនុញ្ញាតឱ្យប្រព័ន្ធដាស់តឿន និងផ្ញើសារតាមកាលវិភាគ</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleSave({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>
      </div>

      {/* Reminder Schedule Settings */}
      <div className="p-5 rounded-3xl border bg-white shadow-xs space-y-4">
        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-pink-600" />
          <span>ការកំណត់ម៉ោងដាស់តឿន (Scheduled Notification Times)</span>
        </h5>

        {/* 1. Expense Reminders */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-600" />
              <div>
                <p className="text-xs font-black text-slate-800">💸 ដាស់តឿនកត់ត្រាការចំណាយ (Expense Reminders)</p>
                <p className="text-[11px] text-slate-500">រំលឹកបុគ្គលិកឱ្យថតរូបវិក្កយបត្រ និងបញ្ចូលចំណាយដែលបានទិញ</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.remindExpenses}
                onChange={(e) => handleSave({ ...config, remindExpenses: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {config.remindExpenses && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ☀️ ពេលថ្ងៃត្រង់ (Lunch Check)
                </label>
                <input
                  type="time"
                  value={config.expenseReminderTime1}
                  onChange={(e) => handleSave({ ...config, expenseReminderTime1: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  🌆 ពេលល្ងាច (Evening Check)
                </label>
                <input
                  type="time"
                  value={config.expenseReminderTime2}
                  onChange={(e) => handleSave({ ...config, expenseReminderTime2: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  🌙 ពេលយប់បិទវេន (Closing Shift)
                </label>
                <input
                  type="time"
                  value={config.expenseReminderTime3}
                  onChange={(e) => handleSave({ ...config, expenseReminderTime3: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Cake Pickup Reminders */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-xs font-black text-slate-800">🎂 ដាស់តឿននំកុម្ម៉ង់ត្រូវមកយក (Cake Pickup Alert)</p>
                <p className="text-[11px] text-slate-500">ជូនដំណឹងមុនម៉ោងអតិថិជនមកយកនំ ដើម្បីឱ្យជាងនំត្រៀមរៀបចំទាន់ពេល</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.remindCakePickup}
                onChange={(e) => handleSave({ ...config, remindCakePickup: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {config.remindCakePickup && (
            <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
              <label className="text-xs text-slate-600 font-bold">ដាស់តឿនមុនម៉ោងមកយកចំនួន៖</label>
              <select
                value={config.cakePickupAdvanceMins}
                onChange={(e) => handleSave({ ...config, cakePickupAdvanceMins: Number(e.target.value) })}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white"
              >
                <option value={15}>១៥ នាទីមុន (15 Mins)</option>
                <option value={30}>៣០ នាទីមុន (30 Mins)</option>
                <option value={45}>៤៥ នាទីមុន (45 Mins)</option>
                <option value={60}>១ ម៉ោងមុន (1 Hour - ណែនាំ)</option>
                <option value={120}>២ ម៉ោងមុន (2 Hours)</option>
              </select>
            </div>
          )}
        </div>

        {/* 3. Sound Effect Setting */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <div>
              <p className="text-xs font-black text-slate-800">🔊 សំឡេងកណ្ដឹងពេលជូនដំណឹង (Notification Sound Alert)</p>
              <p className="text-[11px] text-slate-500">បន្លឺសំឡេងកណ្ដឹងពិរោះស្រទន់នៅពេលមានសារដាស់តឿនថ្មី</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.soundEnabled}
              onChange={(e) => handleSave({ ...config, soundEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>បានរក្សាទុកការកំណត់ការជូនដំណឹងដោយជោគជ័យ!</span>
        </div>
      )}
    </div>
  );
};
