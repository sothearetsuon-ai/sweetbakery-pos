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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  TelegramConfig,
  getStoredTelegramConfig,
  saveStoredTelegramConfig,
  testTelegramConnection,
  setTelegramMenuButton,
} from '../../services/telegram';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

export const TelegramSettingsTab: React.FC = () => {
  const { isDemoMode } = useBakery();

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

  const [config, setConfig] = useState<TelegramConfig>(getStoredTelegramConfig());
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConnectingMenu, setIsConnectingMenu] = useState(false);
  const [menuConnectResult, setMenuConnectResult] = useState<{ success: boolean; message: string } | null>(null);

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

  useEffect(() => {
    setConfig(getStoredTelegramConfig());
  }, []);

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
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
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
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 },
      });
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
              placeholder="ឧ. 987654321 ឬ -100123456789 (សម្រាប់ Group)"
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

        {/* 1-Click Auto Connect Button */}
        <div className="p-3.5 bg-white rounded-2xl border border-sky-100 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div>
            <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span>⚡ ភ្ជាប់ប៊ូតុង Menu ទៅ Telegram Bot ដោយស្វ័យប្រវត្តិ</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ចុចប៊ូតុងនេះដើម្បីកំណត់ប៊ូតុង Menu ក្នុង Bot របស់លោកអ្នកភ្លាមៗ មិនបាច់ចូល BotFather ឡើយ
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoConnectMenu}
            disabled={isConnectingMenu}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isConnectingMenu ? 'animate-spin' : ''}`} />
            <span>{isConnectingMenu ? 'កំពុងភ្ជាប់...' : '⚡ ភ្ជាប់ប៊ូតុង Menu ឥឡូវនេះ'}</span>
          </button>
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
