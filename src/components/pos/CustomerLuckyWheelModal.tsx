import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Gift,
  Trophy,
  RefreshCw,
  Settings,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
  ChevronLeft,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';
import { saveFirestoreDoc, getFirestoreDoc, getStoreId } from '../../services/firebase';

export type RewardProbability = 'common' | 'normal' | 'rare';

export interface LuckyWheelReward {
  id: string;
  labelKh: string;
  labelEn?: string;
  color: string;
  icon: string;
  probability: RewardProbability;
}

const DEFAULT_REWARDS: LuckyWheelReward[] = [
  { id: '1', labelKh: '🧁 ហ្វ្រី Donut ១', labelEn: 'Free Donut', color: '#f43f5e', icon: '🧁', probability: 'normal' },
  { id: '2', labelKh: '⭐ +20 ពិន្ទុ VIP', labelEn: '+20 Loyalty Pts', color: '#f59e0b', icon: '⭐', probability: 'common' },
  { id: '3', labelKh: '🎟️ បញ្ចុះតម្លៃ 10%', labelEn: '10% Discount', color: '#10b981', icon: '🎟️', probability: 'normal' },
  { id: '4', labelKh: '☕ ហ្វ្រីភេសជ្ជៈ ១', labelEn: 'Free Drink', color: '#06b6d4', icon: '☕', probability: 'normal' },
  { id: '5', labelKh: '🎁 កាដូនំពិសេស', labelEn: 'Special Treat', color: '#8b5cf6', icon: '🎁', probability: 'rare' },
  { id: '6', labelKh: '⭐ +50 ពិន្ទុ VIP', labelEn: '+50 Loyalty Pts', color: '#ec4899', icon: '⭐', probability: 'rare' },
];

const PRESET_COLORS = [
  '#f43f5e', // Rose
  '#ea580c', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#d946ef', // Fuchsia
  '#14b8a6', // Teal
  '#84cc16', // Lime
];

const PRESET_EMOJIS = ['🧁', '🍩', '🎂', '🍰', '☕', '🧋', '🎁', '🎟️', '⭐', '🥐', '🥖', '🍪', '🍫', '🥤', '👑', '🎉', '💰', '🥇'];

interface CustomerLuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (reward: LuckyWheelReward) => void;
}

export const CustomerLuckyWheelModal: React.FC<CustomerLuckyWheelModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [mode, setMode] = useState<'spin' | 'settings'>('spin');
  const [rewards, setRewards] = useState<LuckyWheelReward[]>(DEFAULT_REWARDS);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [winningReward, setWinningReward] = useState<LuckyWheelReward | null>(null);

  // Form State for Adding / Editing Reward
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formLabelKh, setFormLabelKh] = useState('');
  const [formLabelEn, setFormLabelEn] = useState('');
  const [formColor, setFormColor] = useState('#f43f5e');
  const [formIcon, setFormIcon] = useState('🧁');
  const [formProbability, setFormProbability] = useState<RewardProbability>('normal');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const getStorageKey = () => {
    try {
      const storeId = getStoreId ? getStoreId() : 'default';
      return `sweetbakery_lucky_wheel_rewards_${storeId}`;
    } catch {
      return 'sweetbakery_lucky_wheel_rewards_default';
    }
  };

  // Load rewards from localStorage and Firestore on mount / open
  useEffect(() => {
    if (!isOpen) return;

    const key = getStorageKey();
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          setRewards(parsed);
        }
      } catch (err) {
        console.warn('Failed to parse cached lucky wheel rewards:', err);
      }
    }

    // Attempt cloud sync
    getFirestoreDoc<{ rewards: LuckyWheelReward[] }>('settings', 'luckyWheelRewards')
      .then((cloudDoc) => {
        if (cloudDoc && Array.isArray(cloudDoc.rewards) && cloudDoc.rewards.length >= 3) {
          setRewards(cloudDoc.rewards);
          try {
            localStorage.setItem(key, JSON.stringify(cloudDoc.rewards));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Could not fetch lucky wheel rewards from Firestore:', err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  // Persist rewards to localStorage and Firestore
  const persistRewards = (newRewards: LuckyWheelReward[]) => {
    setRewards(newRewards);
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newRewards));
    } catch (e) {
      console.warn('Failed to save lucky wheel rewards to localStorage:', e);
    }
    // Background cloud sync
    saveFirestoreDoc('settings', 'luckyWheelRewards', {
      rewards: newRewards,
      updatedAt: new Date().toISOString(),
    }).catch((e) => console.warn('Cloud sync error for lucky wheel:', e));
  };

  // Weighted Random Selection
  const pickWeightedIndex = (): number => {
    const weights = rewards.map((r) => {
      if (r.probability === 'rare') return 1;
      if (r.probability === 'common') return 6;
      return 3; // 'normal'
    });
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      if (rand < weights[i]) return i;
      rand -= weights[i];
    }
    return 0;
  };

  const handleSpin = () => {
    if (isSpinning || rewards.length < 3) return;

    soundFx.playPop();
    setIsSpinning(true);
    setWinningReward(null);

    const winningIndex = pickWeightedIndex();
    const sliceAngle = 360 / rewards.length;
    // 5 to 7 full rotations
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));

    // Needle is at top (12 o'clock = 0 deg).
    // Center of slice i is at i * sliceAngle + sliceAngle / 2.
    // Calculate exact delta taking current rotation into account:
    const currentRemainder = rotationAngle % 360;
    const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const neededDelta = (360 - targetSliceCenter - currentRemainder + 720) % 360;
    // Jitter within ±30% of slice width
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.4);

    const finalAngle = rotationAngle + extraSpins + neededDelta + jitter;
    setRotationAngle(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const winner = rewards[winningIndex];
      setWinningReward(winner);
      soundFx.playSuccess();
      confetti({ particleCount: 75, spread: 85, origin: { y: 0.6 } });
      if (onRewardClaimed) onRewardClaimed(winner);
    }, 4500);
  };

  // Open form for adding new reward
  const handleOpenAddForm = () => {
    if (rewards.length >= 12) return;
    setEditingRewardId(null);
    setFormLabelKh('');
    setFormLabelEn('');
    setFormColor(PRESET_COLORS[rewards.length % PRESET_COLORS.length]);
    setFormIcon('🧁');
    setFormProbability('normal');
    setFormOpen(true);
  };

  // Open form for editing existing reward
  const handleOpenEditForm = (item: LuckyWheelReward) => {
    setEditingRewardId(item.id);
    setFormLabelKh(item.labelKh);
    setFormLabelEn(item.labelEn || '');
    setFormColor(item.color);
    setFormIcon(item.icon);
    setFormProbability(item.probability || 'normal');
    setFormOpen(true);
  };

  // Save form
  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabelKh.trim()) return;

    let updated: LuckyWheelReward[];
    if (editingRewardId) {
      updated = rewards.map((r) =>
        r.id === editingRewardId
          ? {
              ...r,
              labelKh: formLabelKh.trim(),
              labelEn: formLabelEn.trim() || undefined,
              color: formColor,
              icon: formIcon,
              probability: formProbability,
            }
          : r
      );
    } else {
      const newReward: LuckyWheelReward = {
        id: `reward_${Date.now()}`,
        labelKh: formLabelKh.trim(),
        labelEn: formLabelEn.trim() || undefined,
        color: formColor,
        icon: formIcon,
        probability: formProbability,
      };
      updated = [...rewards, newReward];
    }

    persistRewards(updated);
    setFormOpen(false);
    setSaveSuccessMsg('បានរក្សាទុករង្វាន់ជោគជ័យ!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    soundFx.playSuccess();
  };

  // Delete reward
  const handleDeleteReward = (id: string) => {
    if (rewards.length <= 3) {
      alert('កងបង្វិលត្រូវមានយ៉ាងហោចណាស់ ៣ រង្វាន់!');
      return;
    }
    const updated = rewards.filter((r) => r.id !== id);
    persistRewards(updated);
    soundFx.playPop();
  };

  // Reset to default
  const handleResetDefault = () => {
    if (window.confirm('តើអ្នកពិតជាចង់កំណត់កងរង្វាន់ទៅតាមលំនាំដើម (៦ រង្វាន់) វិញមែនទេ?')) {
      persistRewards(DEFAULT_REWARDS);
      soundFx.playSuccess();
      setSaveSuccessMsg('បានដាក់តាមលំនាំដើមជោគជ័យ!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const sliceAngle = 360 / Math.max(rewards.length, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl w-full border border-pink-200 dark:border-pink-900/40 shadow-2xl flex flex-col items-center relative overflow-hidden transition-all duration-300 ${
          mode === 'settings' ? 'max-w-xl p-5 sm:p-6' : 'max-w-md p-6 text-center'
        }`}
      >
        {/* Glow ambient background accents */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-rose-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />

        {/* Top Navigation & Controls */}
        <div className="w-full flex items-center justify-between mb-3 relative z-10">
          {mode === 'settings' ? (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setMode('spin');
                setFormOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ត្រឡប់ទៅកងបង្វិល</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setMode('settings');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer border border-transparent hover:border-rose-200"
              title="កំណត់និងកែសម្រួលរង្វាន់កងសំណាង"
            >
              <Settings className="w-3.5 h-3.5 text-rose-500" />
              <span>⚙️ កំណត់រង្វាន់</span>
            </button>
          )}

          {/* Close modal */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= MODE: SPIN (LUCKY WHEEL) ================= */}
        {mode === 'spin' && (
          <>
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-5 h-5 text-rose-500 animate-bounce" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                កងបង្វិលសំណាង Sweet Bakery
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              បង្វិលដើម្បីឈ្នះរង្វាន់នំឆ្ងាញ់ៗ និងពិន្ទុ VIP ភ្លាមៗ! ({rewards.length} រង្វាន់)
            </p>

            {/* Wheel Container */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-1 flex items-center justify-center">
              {/* Wheel Pointer (Top Needle) */}
              <div className="absolute -top-3.5 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 drop-shadow-md filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />

              {/* SVG Rotating Wheel */}
              <div
                className="w-full h-full rounded-full shadow-2xl border-4 border-amber-300 dark:border-amber-400 relative overflow-hidden transition-transform ease-out"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transitionDuration: isSpinning ? '4.5s' : '0s',
                  transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {rewards.map((reward, i) => {
                    const startAngle = i * sliceAngle;
                    const endAngle = startAngle + sliceAngle;
                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (endAngle - 90) * (Math.PI / 180);

                    const x1 = 50 + 50 * Math.cos(startRad);
                    const y1 = 50 + 50 * Math.sin(startRad);
                    const x2 = 50 + 50 * Math.cos(endRad);
                    const y2 = 50 + 50 * Math.sin(endRad);

                    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    const midAngle = startAngle + sliceAngle / 2;
                    const midRad = (midAngle - 90) * (Math.PI / 180);
                    const iconX = 50 + 33 * Math.cos(midRad);
                    const iconY = 50 + 33 * Math.sin(midRad);

                    // Truncated clean short label
                    const rawCleanLabel = reward.labelKh.replace(/^[^\w\s\u1780-\u17FF]+/, '').trim();
                    const shortLabel = rawCleanLabel.length > 9 ? rawCleanLabel.substring(0, 8) + '..' : rawCleanLabel;
                    const textX = 50 + 21 * Math.cos(midRad);
                    const textY = 50 + 21 * Math.sin(midRad);

                    return (
                      <g key={reward.id}>
                        <path d={pathData} fill={reward.color} stroke="#ffffff" strokeWidth="0.8" />
                        {/* Outer Icon */}
                        <text
                          x={iconX}
                          y={iconY}
                          fill="#ffffff"
                          fontSize={rewards.length > 8 ? '4' : '5.5'}
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${midAngle}, ${iconX}, ${iconY})`}
                        >
                          {reward.icon}
                        </text>
                        {/* Inner Short Label */}
                        <text
                          x={textX}
                          y={textY}
                          fill="#ffffff"
                          fontSize={rewards.length > 8 ? '2.1' : '2.7'}
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                          className="select-none pointer-events-none drop-shadow-sm font-sans"
                        >
                          {shortLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Wheel Center Button */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={handleSpin}
                className="absolute z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 font-black text-xs shadow-xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all border-2 border-white disabled:opacity-85"
              >
                {isSpinning ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mb-0.5 text-rose-700" />
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold">បង្វិល</span>
                  </>
                )}
              </button>
            </div>

            {/* Winner Announcement */}
            {winningReward && (
              <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/40 border border-rose-200 dark:border-rose-800/50 w-full animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>អបអរសាទរ! អ្នកបានឈ្នះ៖</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <span className="text-xl">{winningReward.icon}</span>
                  <span>{winningReward.labelKh}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  បុគ្គលិកនឹងបន្ថែមរង្វាន់នេះទៅក្នុងវិក្កយបត្រជូនលោកអ្នក! 🎉
                </p>
                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpin}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>បង្វិលម្ដងទៀត</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-all"
                  >
                    <span>រួចរាល់</span>
                  </button>
                </div>
              </div>
            )}

            {/* Spin action button */}
            {!winningReward && (
              <button
                type="button"
                disabled={isSpinning}
                onClick={handleSpin}
                className="w-full mt-4 py-3 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-rose-500/25 cursor-pointer active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងបង្វិល...</span>
                  </>
                ) : (
                  <>
                    <span>🎯 ចុចបង្វិលកងយករង្វាន់</span>
                  </>
                )}
              </button>
            )}
          </>
        )}

        {/* ================= MODE: SETTINGS (CUSTOM REWARDS MANAGER) ================= */}
        {mode === 'settings' && (
          <div className="w-full flex flex-col text-left">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-rose-500" />
                  <span>កំណត់រង្វាន់កងសំណាង (Custom Wheel Rewards)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ហាងអាចបន្ថែម កែសម្រួល ឬលុបរង្វាន់តាមចិត្ត (បច្ចុប្បន្ន {rewards.length}/12 រង្វាន់)
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                  title="ដាក់តាមលំនាំដើម ៦ រង្វាន់"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">លំនាំដើម</span>
                </button>
                <button
                  type="button"
                  disabled={rewards.length >= 12}
                  onClick={handleOpenAddForm}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>បន្ថែមរង្វាន់</span>
                </button>
              </div>
            </div>

            {/* Notification alert banner */}
            {saveSuccessMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Add / Edit Form Modal Drawer */}
            {formOpen && (
              <form
                onSubmit={handleSaveReward}
                className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-rose-200 dark:border-rose-900/50 shadow-inner flex flex-col gap-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{editingRewardId ? 'កែសម្រួលរង្វាន់' : 'បន្ថែមរង្វាន់ថ្មី'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      ឈ្មោះរង្វាន់ (ភាសាខ្មែរ) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formLabelKh}
                      onChange={(e) => setFormLabelKh(e.target.value)}
                      placeholder="ឧ. 🧁 ហ្វ្រី Donut ១ ឬ បញ្ចុះតម្លៃ 20%"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      ឈ្មោះជាភាសាអង់គ្លេស (ស្រេចចិត្ត)
                    </label>
                    <input
                      type="text"
                      value={formLabelEn}
                      onChange={(e) => setFormLabelEn(e.target.value)}
                      placeholder="e.g. Free Cupcake / 20% Off"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>

                {/* Emoji Icon Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    ជ្រើសរើសរូបតំណាង (Emoji / Icon): <span className="text-base">{formIcon}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    {PRESET_EMOJIS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setFormIcon(emoji)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          formIcon === emoji
                            ? 'bg-rose-500 text-white scale-110 shadow-sm'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    ពណ៌ផ្ទាំងរង្វាន់ (Slice Color):
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {PRESET_COLORS.map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setFormColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          formColor === col ? 'border-slate-900 dark:border-white scale-125 shadow-md' : 'border-white'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent p-0"
                      title="ជ្រើសពណ៌តាមចិត្ត"
                    />
                  </div>
                </div>

                {/* Probability */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    ឱកាសឈ្នះ (Probability Rate):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormProbability('common')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        formProbability === 'common'
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>🟢 ងាយត្រូវ (6x)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormProbability('normal')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        formProbability === 'normal'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>🟡 មធ្យម (3x)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormProbability('rare')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        formProbability === 'rare'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      <span>🔴 កម្រ (1x)</span>
                    </button>
                  </div>
                </div>

                {/* Form Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer shadow-md"
                  >
                    {editingRewardId ? 'ធ្វើបច្ចុប្បន្នភាព' : 'រក្សាទុក'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Current Wheel Rewards */}
            <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
              {rewards.map((reward, idx) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 hover:border-rose-300 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-black text-slate-400 w-4">{idx + 1}.</span>
                    {/* Swatch & Emoji */}
                    <div
                      style={{ backgroundColor: reward.color }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm flex-shrink-0"
                    >
                      {reward.icon}
                    </div>
                    {/* Labels */}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {reward.labelKh}
                      </div>
                      {reward.labelEn && (
                        <div className="text-[10px] text-slate-400 truncate">
                          {reward.labelEn}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Probability tag & actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        reward.probability === 'rare'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : reward.probability === 'common'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {reward.probability === 'rare' ? '🔴 កម្រ' : reward.probability === 'common' ? '🟢 ងាយត្រូវ' : '🟡 ធម្មតា'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(reward)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="កែសម្រួល"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={rewards.length <= 3}
                      onClick={() => handleDeleteReward(reward.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={rewards.length <= 3 ? 'ត្រូវមានយ៉ាងតិច ៣ រង្វាន់' : 'លុបរង្វាន់នេះ'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom info */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>* រាល់ការកែសម្រួលនឹងរក្សាទុកដោយស្វ័យប្រវត្តិចូល Cloud និងកុំព្យូទ័រនេះ។</span>
              <button
                type="button"
                onClick={() => setMode('spin')}
                className="text-rose-500 font-bold hover:underline cursor-pointer"
              >
                សាកល្បងបង្វិល &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
