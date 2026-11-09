import React, { useState } from 'react';
import { Sparkles, X, Gift, Trophy, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface LuckyWheelReward {
  id: string;
  labelKh: string;
  labelEn: string;
  color: string;
  icon: string;
}

const REWARDS: LuckyWheelReward[] = [
  { id: '1', labelKh: '🧁 ហ្វ្រី Donut ១', labelEn: 'Free Donut', color: '#f43f5e', icon: '🧁' },
  { id: '2', labelKh: '⭐ +20 ពិន្ទុ VIP', labelEn: '+20 Loyalty Pts', color: '#f59e0b', icon: '⭐' },
  { id: '3', labelKh: '🎟️ បញ្ចុះតម្លៃ 10%', labelEn: '10% Discount', color: '#10b981', icon: '🎟️' },
  { id: '4', labelKh: '☕ ហ្វ្រីភេសជ្ជៈ ១', labelEn: 'Free Drink', color: '#06b6d4', icon: '☕' },
  { id: '5', labelKh: '🎁 កាដូនំពិសេស', labelEn: 'Special Treat', color: '#8b5cf6', icon: '🎁' },
  { id: '6', labelKh: '⭐ +50 ពិន្ទុ VIP', labelEn: '+50 Loyalty Pts', color: '#ec4899', icon: '⭐' },
];

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
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [winningReward, setWinningReward] = useState<LuckyWheelReward | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;

    soundFx.playPop();
    setIsSpinning(true);
    setWinningReward(null);

    // Random winner index
    const randomIndex = Math.floor(Math.random() * REWARDS.length);
    const sliceAngle = 360 / REWARDS.length;
    // 5 to 8 full rotations + target angle
    const extraRotations = 360 * (5 + Math.floor(Math.random() * 3));
    const targetAngle = extraRotations + (360 - (randomIndex * sliceAngle + sliceAngle / 2));

    const finalAngle = rotationAngle + targetAngle;
    setRotationAngle(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const winner = REWARDS[randomIndex];
      setWinningReward(winner);
      soundFx.playSuccess();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      if (onRewardClaimed) onRewardClaimed(winner);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 border border-pink-200 shadow-2xl flex flex-col items-center relative overflow-hidden text-center">
        {/* Glow ambient */}
        <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-rose-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-5 h-5 text-rose-500 animate-bounce" />
          <h3 className="font-black text-lg text-slate-900 tracking-tight">
            កងបង្វិលសំណាង Sweet Bakery
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          បង្វិលដើម្បីឈ្នះរង្វាន់នំឆ្ងាញ់ៗ និងពិន្ទុ VIP ភ្លាមៗ!
        </p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 my-2 flex items-center justify-center">
          {/* Wheel Pointer (Top Needle) */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 drop-shadow-md" />

          {/* SVG Rotating Wheel */}
          <div
            className="w-full h-full rounded-full shadow-xl border-4 border-amber-300 relative overflow-hidden transition-transform ease-out"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transitionDuration: isSpinning ? '4.5s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {REWARDS.map((reward, i) => {
                const angle = 360 / REWARDS.length;
                const startAngle = i * angle;
                const endAngle = startAngle + angle;
                const startRad = (startAngle - 90) * (Math.PI / 180);
                const endRad = (endAngle - 90) * (Math.PI / 180);

                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + angle / 2;
                const midRad = (midAngle - 90) * (Math.PI / 180);
                const textX = 50 + 32 * Math.cos(midRad);
                const textY = 50 + 32 * Math.sin(midRad);

                return (
                  <g key={reward.id}>
                    <path d={pathData} fill={reward.color} stroke="#ffffff" strokeWidth="1" />
                    <text
                      x={textX}
                      y={textY}
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                    >
                      {reward.icon}
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
            className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 font-black text-xs shadow-lg flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all border-2 border-white disabled:opacity-80"
          >
            {isSpinning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mb-0.5 text-rose-700" />
                <span className="text-[10px] uppercase tracking-wider">បង្វិល</span>
              </>
            )}
          </button>
        </div>

        {/* Winner Announcement */}
        {winningReward && (
          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-bold mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>អបអរសាទរ! អ្នកបានឈ្នះ៖</span>
            </div>
            <div className="text-base font-black text-slate-900">
              {winningReward.labelKh}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              បុគ្គលិកនឹងបន្ថែមរង្វាន់នេះទៅក្នុងវិក្កយបត្ររបស់លោកអ្នក!
            </p>
          </div>
        )}

        {/* Spin action button */}
        {!winningReward && (
          <button
            type="button"
            disabled={isSpinning}
            onClick={handleSpin}
            className="w-full mt-4 py-3 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-rose-500/25 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
          >
            {isSpinning ? 'កំពុងបង្វិល...' : '🎯 ចុចបង្វិលកងយករង្វាន់'}
          </button>
        )}
      </div>
    </div>
  );
};

