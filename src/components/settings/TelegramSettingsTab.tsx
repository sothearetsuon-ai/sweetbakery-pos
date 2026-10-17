import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Bell,
  Check,
  RotateCw,
  ShoppingBag,
  Cake,
  Receipt,
  Clock,
  Lock,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  TelegramConfig,
  getStoredTelegramConfig,
  saveStoredTelegramConfig,
  areTelegramConfigsEqual,
  testTelegramConnection,
  setTelegramMenuButton,
  resetTelegramMenuButton,
  sendTelegramDailyReport,
} from '../../services/telegram';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

export const TelegramSettingsTab: React.FC = () => {
  const { isDemoMode, currentStaff, sales, expenses, customOrders, storeInfo, exchangeRate } = useBakery();

  const [config, setConfig] = useState<TelegramConfig>(getStoredTelegramConfig());
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isConnectingMenu, setIsConnectingMenu] = useState(false);
  const [menuConnectResult, setMenuConnectResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSendingReportTest, setIsSendingReportTest] = useState(false);
  const [reportSendResult, setReportSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setConfig(getStoredTelegramConfig());

    const handleExternalConfigChange = (e: any) => {
      const newConfig = e?.detail || getStoredTelegramConfig();
      setConfig((prev) => (areTelegramConfigsEqual(prev, newConfig) ? prev : newConfig));
    };

    window.addEventListener('bakery_telegram_config_changed', handleExternalConfigChange);
    return () => {
      window.removeEventListener('bakery_telegram_config_changed', handleExternalConfigChange);
    };
  }, []);

  if (currentStaff.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-sm space-y-4 my-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-rose-900">
          សិទ្ធិត្រូវបានកំណត់ (Admin Only) 🔒
        </h3>
        <p className="text-sm text-rose-700 max-w-md mx-auto leading-relaxed">
          សម្រាប់តែគណនីម្ចាស់ហាង (Admin) ប៉ុណ្ណោះដែលអាចមើល និងកែប្រែការកំណត់ប្រព័ន្ធ Telegram Bot បាន។
        </p>
      </div>
    );
  }

  if (isDemoMode) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-blue-100 shadow-sm space-y-4 my-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Send className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-800">
          មុខងារ Telegram Bot ត្រូវបានបិទក្នុង Demo Mode
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          ដើម្បីការពារសុវត្ថិភាព Bot Token និង Chat ID ផ្ទាំងកំណត់ប្រព័ន្ធ Telegram Bot មិនត្រូវបានអនុញ្ញាតឱ្យចូលមើល ឬកែប្រែក្នុងផ្ទាំង Demo ឡើយ។
        </p>
      </div>
    );
  }

  const handleSendDailyReportTest = async () => {
    if (!config.botToken || !config.chatId) {
      alert('សូមបញ្ចូល Bot Token និង Chat ID ជាមុនសិន!');
      return;
    }
    setIsSendingReportTest(true);
    setReportSendResult(null);
    soundFx.playPop();

    try {
      const res = await sendTelegramDailyReport(
        {
          sales,
          expenses,
          customOrders,
          storeInfo,
          exchangeRate,
        },
        true // isManual = true
      );
      setIsSendingReportTest(false);
      setReportSendResult(res);
      if (res.success) {
        soundFx.playSuccess();
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err: any) {
      setIsSendingReportTest(false);
      setReportSendResult({ success: false, message: err?.message || 'Error sending report' });
    }
  };

  const handleAutoConnectMenu = async () => {
    if (!config.botToken) {
      alert('សូមបញ្ចូល Bot Token ជាមុនសិន!');
      return;
    }
    setIsConnectingMenu(true);
    setMenuConnectResult(null);
    soundFx.playPop();

    const res = await setTelegramMenuButton(
      config.botToken,
      'https://sothearetsuon-ai.github.io/sweetbakery-pos/?order=true',
      '🎂 កុម្ម៉ង់នំខេក'
    );
    setIsConnectingMenu(false);
    setMenuConnectResult(res);
    if (res.success) {
      soundFx.playSuccess();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleResetMenu = async () => {
    if (!config.botToken) {
      alert('សូមបញ្ចូល Bot Token ជាមុនសិន!');
      return;
    }
    setIsConnectingMenu(true);
    setMenuConnectResult(null);
    soundFx.playPop();

    const res = await resetTelegramMenuButton(config.botToken);
    setIsConnectingMenu(false);
    setMenuConnectResult(res);
    if (res.success) {
      soundFx.playSuccess();
    }
  };

  const updateConfig = (updated: TelegramConfig) => {
    if (isDemoMode) return;
    setConfig(updated);
    saveStoredTelegramConfig(updated);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isDemoMode) {
      alert('មុខងារនេះត្រូវបានបិទក្នុង Demo Mode');
      return;
    }
    updateConfig(config);
    soundFx.playSuccess();
    setSavedSuccess(true);
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        disableForReducedMotion: true,
      });
    } catch (err) {}
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTest = async () => {
    if (!config.botToken || !config.chatId) {
      setTestResult({
        success: false,
        message: 'សូមបំពេញ Bot Token និង Chat ID ជាមុនសិន ទើបអាចធ្វើតេស្តបាន!',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    soundFx.playPop();

    const res = await testTelegramConnection(config.botToken, config.chatId);
    setTesting(false);
    setTestResult(res);

      if (res.success) {
        // Auto-enable and auto-save on successful test
        const activeConfig = { ...config, enabled: true };
        updateConfig(activeConfig);
        soundFx.playSuccess();
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            disableForReducedMotion: true,
          });
        } catch (err) {}
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 rounded-3xl text-white shadow-lg shadow-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <Send className="w-6 h-6 -translate-x-0.5 translate-y-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg">Telegram Bot Alerts</h3>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  config.enabled && config.botToken && config.chatId
                    ? 'bg-emerald-400 text-slate-900'
                    : 'bg-white/20 text-white'
                }`}
              >
                {config.enabled && config.botToken && config.chatId
                  ? '🟢 បានបើកដំណើរការ'
                  : '⚪ មិនទាន់បើក'}
              </span>
            </div>
            <p className="text-xs text-sky-100 mt-0.5">
              ផ្ញើដំណឹងវិក្កយបត្រលក់ នំកុម្ម៉ង់ខួបកំណើត និងរបាយការណ៍បិទវេនចូល Telegram ភ្លាមៗ!
            </p>
          </div>
        </div>

        {/* Enable Switch */}
        <label className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl cursor-pointer transition-colors shrink-0 select-none">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => {
              const updated = { ...config, enabled: e.target.checked };
              setConfig(updated);
              saveStoredTelegramConfig(updated);
              soundFx.playPop();
            }}
            className="w-4 h-4 rounded text-pink-600 focus:ring-0 cursor-pointer"
          />
          <span className="text-xs font-bold text-white">បើកដំណើរការ Alert</span>
        </label>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>🤖</span>
            <span>ព័ត៌មានសម្គាល់ Bot (Bot Credentials)</span>
          </h4>

          {/* Bot Token Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Telegram Bot Token</span>
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>យកពី @BotFather</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                placeholder="ឧ. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={config.botToken}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateConfig({
                    ...config,
                    botToken: val,
                    enabled: config.chatId ? true : config.enabled,
                  });
                }}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Chat ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Telegram Chat ID (Telegram ផ្ទាល់ខ្លួន ឬ Group ហាង)</span>
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>ឆែក Chat ID តាម @userinfobot</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="text"
              placeholder="ឧ. -5528089668 ឬ -5528089668, 8970210109"
              value={config.chatId}
              onChange={(e) => {
                const val = e.target.value.trim();
                updateConfig({
                  ...config,
                  chatId: val,
                  enabled: config.botToken ? true : config.enabled,
                });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            
            {/* Quick Presets */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 mr-1">ជម្រើសរហ័ស៖</span>
              <button
                type="button"
                onClick={() => updateConfig({ ...config, chatId: '-5528089668', enabled: true })}
                className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all border ${
                  config.chatId === '-5528089668'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-300'
                }`}
              >
                👥 Group ហាង (-5528089668)
              </button>
              <button
                type="button"
                onClick={() => updateConfig({ ...config, chatId: '8970210109', enabled: true })}
                className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all border ${
                  config.chatId === '8970210109'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-300'
                }`}
              >
                👤 Admin ផ្ទាល់ខ្លួន (8970210109)
              </button>
              <button
                type="button"
                onClick={() => updateConfig({ ...config, chatId: '-5528089668, 8970210109', enabled: true })}
                className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all border ${
                  config.chatId.includes('-5528089668') && config.chatId.includes('8970210109')
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                ✨ ផ្ញើទាំងពីរ (Group + Admin)
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
              💡 <b>ចំណាំ៖</b> អ្នកអាចដាក់ Chat ID ច្រើនដោយបំបែកដោយសញ្ញាក្បៀស (,) ដើម្បីឱ្យប្រព័ន្ធផ្ញើដំណឹងចូលទាំងក្នុង Group ហាង និងគណនីផ្ទាល់ខ្លួនក្នុងពេលតែមួយ។
            </p>
          </div>
        </div>

        {/* Notification Types Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>🔔</span>
            <span>ជ្រើសរើសប្រភេទដំណឹងដែលត្រូវផ្ញើ (Notification Preferences)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Sales */}
            <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.notifySales}
                onChange={(e) => updateConfig({ ...config, notifySales: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                  <span>ការលក់វិក្កយបត្រថ្មី (POS Sale)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ផ្ញើស្លាកវិក្កយបត្រ ឈ្មោះនំ ចំនួន និងទឹកប្រាក់សរុប
                </p>
              </div>
            </label>

            {/* Custom Cake Orders */}
            <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.notifyCustomOrders}
                onChange={(e) => updateConfig({ ...config, notifyCustomOrders: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5 text-purple-500" />
                  <span>ភ្ញៀវកុម្ម៉ង់នំខួបកំណើត (Custom Cake)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ផ្ញើឈ្មោះភ្ញៀវ លេខទូរស័ព្ទ ម៉ោងមកយក និងប្រាក់កក់
                </p>
              </div>
            </label>

            {/* Shift Close */}
            <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.notifyShiftClose}
                onChange={(e) => updateConfig({ ...config, notifyShiftClose: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>របាយការណ៍បិទវេនលក់ (Shift Close)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ផ្ញើសរុបចំណូលលក់ក្នុងវេន និងចំនួនសាច់ប្រាក់ក្នុងថត
                </p>
              </div>
            </label>

            {/* Expenses */}
            <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.notifyExpenses}
                onChange={(e) => updateConfig({ ...config, notifyExpenses: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-rose-500" />
                  <span>ការកត់ត្រាចំណាយហាង (Expenses)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ផ្ញើទំនិញដែលបានទិញ តម្លៃចំណាយ និងអ្នកចំណាយ
                </p>
              </div>
            </label>

            {/* Expense Due Date Alert */}
            <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.notifyExpenseDue ?? true}
                onChange={(e) => updateConfig({ ...config, notifyExpenseDue: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>រំលឹកថ្ងៃផុតកំណត់បង់ប្រាក់ (Expense Due Date Alert)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ផ្ញើសារដាស់តឿនពេលមានវិក្កយបត្រជំពាក់ ដល់ថ្ងៃត្រូវបង់ ឬហួសកាលកំណត់
                </p>
              </div>
            </label>

            {/* Daily & Monthly Summary Report */}
            <div className="p-3.5 rounded-2xl border border-sky-200/90 bg-gradient-to-r from-sky-50/50 via-indigo-50/30 to-pink-50/30 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.notifyDailyReport ?? true}
                  onChange={(e) => updateConfig({ ...config, notifyDailyReport: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 flex-wrap">
                    <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                    <span>របាយការណ៍បូកសរុបការលក់ & ចំណាយប្រចាំថ្ងៃ-ខែ (Daily & Monthly Summary Report)</span>
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-[10px] font-black uppercase">
                      ស្វ័យប្រវត្តិ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    បូកសរុបចំណូលលក់, ការទូទាត់ Bakong/Cash, ចំណាយ, ចំណេញសុទ្ធ, មុខទំនិញលក់ដាច់ និងវឌ្ឍនភាពប្រចាំខែ រួមទាំងការវិភាគដោយជំនួយការ AI។
                  </p>
                </div>
              </label>

              {/* Extended options when enabled */}
              {(config.notifyDailyReport ?? true) && (
                <div className="pl-7 space-y-3 pt-2.5 border-t border-sky-100 text-xs animate-in fade-in duration-200">
                  {/* Recipient Destination Selector */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>កន្លែងទទួលរបាយការណ៍បូកសរុប (Report Destination)៖</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Option 1: ADMIN_ONLY (Default & Recommended) */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ ...config, dailyReportRecipient: 'ADMIN_ONLY' })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          (config.dailyReportRecipient || 'ADMIN_ONLY') === 'ADMIN_ONLY'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-xs flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Admin ផ្ទាល់ខ្លួន</span>
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                            (config.dailyReportRecipient || 'ADMIN_ONLY') === 'ADMIN_ONLY'
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            ណែនាំ ⭐
                          </span>
                        </div>
                        <p className={`text-[10px] leading-tight ${
                          (config.dailyReportRecipient || 'ADMIN_ONLY') === 'ADMIN_ONLY'
                            ? 'text-indigo-100'
                            : 'text-slate-500'
                        }`}>
                          ផ្ញើចូលតែ Admin ({config.adminChatId || '8970210109'}) សម្ងាត់ មិនផ្ញើចូល Group ហាងឡើយ
                        </p>
                      </button>

                      {/* Option 2: GROUP_ONLY */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ ...config, dailyReportRecipient: 'GROUP_ONLY' })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          config.dailyReportRecipient === 'GROUP_ONLY'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-xs flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>Group ហាង</span>
                          </span>
                        </div>
                        <p className={`text-[10px] leading-tight ${
                          config.dailyReportRecipient === 'GROUP_ONLY'
                            ? 'text-sky-100'
                            : 'text-slate-500'
                        }`}>
                          ផ្ញើចូល Telegram Group ({config.chatId || '-5528089668'}) សម្រាប់បុគ្គលិកទាំងអស់
                        </p>
                      </button>

                      {/* Option 3: BOTH */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ ...config, dailyReportRecipient: 'BOTH' })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          config.dailyReportRecipient === 'BOTH'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-xs flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>ផ្ញើទាំងពីរ (Both)</span>
                          </span>
                        </div>
                        <p className={`text-[10px] leading-tight ${
                          config.dailyReportRecipient === 'BOTH'
                            ? 'text-purple-100'
                            : 'text-slate-500'
                        }`}>
                          ផ្ញើដំណាលគ្នាទាំងចូល Admin ({config.adminChatId || '8970210109'}) និង Group ហាង
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Admin Chat ID Input (shown if ADMIN_ONLY or BOTH) */}
                  {(config.dailyReportRecipient || 'ADMIN_ONLY') !== 'GROUP_ONLY' && (
                    <div className="p-3 bg-white/90 border border-indigo-100 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-indigo-600" />
                          <span>Admin Private Chat ID (លេខសម្គាល់ Telegram Admin ផ្ទាល់ខ្លួន)៖</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => updateConfig({ ...config, adminChatId: '8970210109' })}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                        >
                          កំណត់ 8970210109
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={config.adminChatId ?? '8970210109'}
                          onChange={(e) => updateConfig({ ...config, adminChatId: e.target.value.trim() })}
                          placeholder="8970210109"
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <a
                          href="https://t.me/vicheta_order_bot"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <span>បើក Bot</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Important Bot Start Reminder */}
                      <div className="p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1">
                        <p className="font-bold flex items-center gap-1 text-amber-800">
                          <span>🔔 សំខាន់សម្រាប់ Admin៖</span>
                        </p>
                        <p className="text-[10.5px] leading-relaxed text-amber-800/90">
                          Telegram តម្រូវឱ្យ Admin ចុច <b>Start</b> ក្នុង Bot ជាមុនសិន ទើប Bot មានសិទ្ធិផ្ញើសារចូលគណនីផ្ទាល់ខ្លួនបាន។ សូមបើក Telegram ស្វែងរក <b>@vicheta_order_bot</b> រួចចុច Start (ឬផ្ញើសារ <code>/start</code>) ម្ដងជាការស្រេច។
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Schedule Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      <span>ម៉ោងកំណត់ផ្ញើរបាយការណ៍ស្វ័យប្រវត្តិតាមថ្ងៃ (Schedule Time)៖</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={config.dailyReportTime || '21:00'}
                        onChange={(e) => updateConfig({ ...config, dailyReportTime: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-sky-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs cursor-pointer"
                      >
                        <option value="21:00">🕘 ម៉ោង 9:00 យប់ (21:00) — ពេលបិទហាង (ពេញនិយមបំផុត ⭐)</option>
                        <option value="09:00">🕘 ម៉ោង 9:00 ព្រឹក (09:00) — ពេលព្រឹកព្រលឹម</option>
                        <option value="20:00">🕗 ម៉ោង 8:00 យប់ (20:00)</option>
                        <option value="22:00">🕙 ម៉ោង 10:00 យប់ (22:00)</option>
                        <option value="18:00">🕕 ម៉ោង 6:00 ល្ងាច (18:00)</option>
                      </select>
                    </div>
                  </div>

                  {/* AI Insight Checkbox */}
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeAiInsight ?? true}
                      onChange={(e) => updateConfig({ ...config, includeAiInsight: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-sky-600 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>រួមបញ្ចូលការវិភាគអាជីវកម្មដោយជំនួយការ AI (AI Executive Insights)</span>
                    </span>
                  </label>

                  {/* Quick Test Send Daily Report Button */}
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendDailyReportTest}
                      disabled={isSendingReportTest}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSendingReportTest ? 'animate-pulse' : ''}`} />
                      <span>
                        {isSendingReportTest
                          ? 'កំពុងផ្ញើរបាយការណ៍...'
                          : (config.dailyReportRecipient || 'ADMIN_ONLY') === 'ADMIN_ONLY'
                          ? `📊 សាកល្បងផ្ញើទៅ Admin (${config.adminChatId || '8970210109'}) ឥឡូវនេះ`
                          : config.dailyReportRecipient === 'GROUP_ONLY'
                          ? '📊 សាកល្បងផ្ញើទៅ Group ហាង ឥឡូវនេះ'
                          : `📊 សាកល្បងផ្ញើទៅ Admin & Group ឥឡូវនេះ`}
                      </span>
                    </button>
                    {reportSendResult && (
                      <span className={`text-[11px] font-bold ${reportSendResult.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {reportSendResult.message}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{testResult.success ? 'ជោគជ័យ!' : 'បរាជ័យ!'}</p>
              <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'កំពុងតេស្ត...' : '🚀 តេស្តផ្ញើសារសាកល្បង (Test Alert)'}</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all active:scale-95 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>បានរក្សាទុកជោគជ័យ!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>រក្សាទុកការកំណត់</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Telegram Mini App (Web App) Setup & Links Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-sky-50 via-blue-50/50 to-indigo-50 border border-sky-200/80 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-sm shadow-sky-500/30 font-bold">
              📱
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                <span>Telegram Mini App (Web App)</span>
                <span className="text-[10px] px-2 py-0.5 bg-sky-500 text-white font-black rounded-full uppercase tracking-wider">
                  ថ្មី New
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                ដំណើរការកម្មវិធីហាងនំខេក SweetBakery ផ្ទាល់នៅលើ Telegram ដោយមិនបាច់ដំឡើង App!
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Link 1: Customer Self-Ordering Mini App */}
          <div className="p-3.5 bg-white rounded-2xl border border-sky-100 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>🎂 តំណភ្ជាប់សម្រាប់អតិថិជន (Customer Order)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 font-bold rounded-full">
                អតិថិជនកុម្ម៉ង់
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              អតិថិជនបើកកុម្ម៉ង់នំខេក មើលម៉ូដនំ ជ្រើសរើសរសជាតិ និងបង់ប្រាក់ KHQR ក្នុង Telegram
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value="https://sothearetsuon-ai.github.io/sweetbakery-pos/?order=true"
                className="w-full text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://sothearetsuon-ai.github.io/sweetbakery-pos/?order=true');
                  soundFx.playPop();
                  alert('បានចម្លងតំណភ្ជាប់អតិថិជនរួចរាល់!');
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                ចម្លង
              </button>
            </div>
          </div>

          {/* Link 2: Staff / POS Mini App */}
          <div className="p-3.5 bg-white rounded-2xl border border-sky-100 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>💼 តំណភ្ជាប់សម្រាប់បុគ្គលិក (Staff POS)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded-full">
                POS ហាង
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              បុគ្គលិក ឬម្ចាស់ហាងអាចលក់ គិតលុយ និងគ្រប់គ្រងស្តុកផ្ទាល់ក្នុង Telegram
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value="https://sothearetsuon-ai.github.io/sweetbakery-pos/"
                className="w-full text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://sothearetsuon-ai.github.io/sweetbakery-pos/');
                  soundFx.playPop();
                  alert('បានចម្លងតំណភ្ជាប់ POS ហាងរួចរាល់!');
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                ចម្លង
              </button>
            </div>
          </div>
        </div>

        {/* 1-Click Auto Connect Button & Reset Button */}
        <div className="p-3.5 bg-white rounded-2xl border border-sky-100 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div>
            <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span>⚡ ភ្ជាប់ប៊ូតុង Menu ទៅ Telegram Bot ដោយស្វ័យប្រវត្តិ</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              កំណត់ប៊ូតុង Menu ក្នុង Bot របស់លោកអ្នកភ្លាមៗ មិនបាច់ចូល BotFather ឡើយ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetMenu}
              disabled={isConnectingMenu}
              title="កំណត់ត្រឡប់ទៅជាប៊ូតុងធម្មតាវិញ"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              🔄 Reset Default
            </button>
            <button
              type="button"
              onClick={handleAutoConnectMenu}
              disabled={isConnectingMenu}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isConnectingMenu ? 'animate-spin' : ''}`} />
              <span>{isConnectingMenu ? 'កំពុងភ្ជាប់...' : '⚡ ភ្ជាប់ប៊ូតុង Menu'}</span>
            </button>
          </div>
        </div>

        {/* Warning & Solution for Android Google Play Store Telegram */}
        <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ដំណោះស្រាយពេលទូរសព្ទ Android បង្ហាញ៖ «This bot can't be displayed on Telegram apps downloaded from the Google Play Store»</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            នេះជា<b>គោលការណ៍រឹតត្បិតរបស់ Google Play Store</b> លើកម្មវិធី Telegram (ដោយសារកម្មវិធីមានមុខងារទូទាត់ប្រាក់ KHQR និងការលក់ទំនិញ)។ ដើម្បីបើកប្រើប្រាស់បាន ១០០%៖
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 space-y-1">
              <p className="font-bold text-slate-800">✅ វិធីទី ១៖ ប្រើ Telegram Direct APK (ផ្លូវការ)</p>
              <p className="text-slate-600 leading-relaxed">
                ទាញយក Telegram ផ្លូវការដោយផ្ទាល់ពី <a href="https://telegram.org/android" target="_blank" rel="noreferrer" className="text-sky-600 font-bold underline">telegram.org/android</a> ជំនួស Telegram ពី Play Store (គ្មានការរឹតត្បិត បើក Mini App បាន ១០០%)។
              </p>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 space-y-1">
              <p className="font-bold text-slate-800">🌐 វិធីទី ២៖ ឱ្យអតិថិជនបើកតាម Web Browser</p>
              <p className="text-slate-600 leading-relaxed">
                ផ្ញើតំណភ្ជាប់ <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">?order=true</code> ខាងលើឱ្យអតិថិជនបើកតាម Chrome, Safari ឬតាម <a href="https://web.telegram.org" target="_blank" rel="noreferrer" className="text-sky-600 font-bold underline">web.telegram.org</a> ដោយផ្ទាល់។
              </p>
            </div>
          </div>
        </div>

        {menuConnectResult && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              menuConnectResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {menuConnectResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{menuConnectResult.message}</span>
          </div>
        )}

        {/* 3 Steps to setup on Telegram with BotFather */}
        <div className="p-4 bg-white/90 rounded-2xl border border-sky-100/80 space-y-2">
          <h5 className="font-bold text-xs text-sky-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>របៀបដាក់ប៊ូតុង Menu «🎂 កុម្ម៉ង់នំខេក» ក្នុង Telegram Bot របស់លោកអ្នក៖</span>
          </h5>
          <ol className="text-[11px] text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
            <li>បើក Telegram រួចស្វែងរកគណនី <b>@BotFather</b></li>
            <li>វាយពាក្យបញ្ជា <code>/setmenubutton</code> រួចជ្រើសរើស Bot របស់លោកអ្នក</li>
            <li>បិទភ្ជាប់ (Paste) តំណភ្ជាប់ខាងលើ៖ <code>https://sothearetsuon-ai.github.io/sweetbakery-pos/?order=true</code></li>
            <li>វាយចំណងជើងប៊ូតុង ឧ. <b>🎂 កុម្ម៉ង់នំខេក (Order Cake)</b></li>
            <li><b>រួចរាល់!</b> នៅពេលអតិថិជនបើក Chat ជាមួយ Bot ពួកគេនឹងឃើញប៊ូតុង <b>Menu</b> នៅជ្រុងខាងឆ្វេងខាងក្រោម ដែលចុចទៅបើក Mini App កុម្ម៉ង់នំខេកភ្លាមៗ!</li>
          </ol>
        </div>
      </div>

      {/* Quick Guide Card */}
      <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-3">
        <h4 className="font-black text-slate-800 text-xs sm:text-sm flex items-center gap-2 text-sky-800">
          <HelpCircle className="w-4 h-4 text-sky-600" />
          <span>ការណែនាំ៖ របៀបបង្កើត Telegram Bot ក្នុងរយៈពេល ១ នាទី (ងាយស្រួល ១០០%)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          {/* Step 1 */}
          <div className="p-3 bg-white rounded-2xl border border-slate-100 space-y-1.5">
            <span className="font-bold text-sky-700">ជំហានទី ១៖ យក Bot Token</span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              1. ក្នុងកម្មវិធី Telegram ស្វែងរក <b>@BotFather</b> រួចចុច <b>Start</b><br />
              2. វាយពាក្យ <code>/newbot</code><br />
              3. ដាក់ឈ្មោះ Bot ឧ. <i>SweetBakery Notifier</i><br />
              4. ដាក់ Username ឧ. <i>sweetbakery_pos_bot</i><br />
              5. BotFather នឹងផ្តល់កូដ <b>HTTP API Token</b> វែងមួយ។ ចម្លង (Copy) កូដនោះយកមកបិទភ្ជាប់ (Paste) ក្នុងប្រអប់ Bot Token ខាងលើ។
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-white rounded-2xl border border-slate-100 space-y-1.5">
            <span className="font-bold text-sky-700">ជំហានទី ២៖ យក Chat ID</span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              1. ស្វែងរក <b>@userinfobot</b> ក្នុង Telegram រួចចុច <b>Start</b> វានឹងបង្ហាញលេខ <b>Id</b> របស់អ្នកភ្លាមៗ<br />
              2. បើចង់ផ្ញើចូល <b>Telegram Group ហាង</b>៖
              គ្រាន់តែ Add Bot ដែលបានបង្កើតខាងលើចូលទៅក្នុង Group ហាងរបស់អ្នក រួចយក Group Chat ID មកដាក់ (លេខអវិជ្ជមាន ឧ. <code>-100123456789</code>)។
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
