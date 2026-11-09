import React, { useState, useMemo } from 'react';
import {
  X,
  Award,
  Search,
  Star,
  Gift,
  Crown,
  Sparkles,
  Phone,
  User,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import {
  calculateCustomerLoyaltyProfiles,
  CustomerLoyaltyProfile,
  TIER_CONFIG,
  redeemCustomerPoints,
} from '../../services/loyaltyService';
import { soundFx } from '../../utils/audio';
import { formatKhr } from '../../utils/currencyUtils';

interface LoyaltyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomerToCart?: (customer: CustomerLoyaltyProfile) => void;
}

export const LoyaltyRewardsModal: React.FC<LoyaltyRewardsModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomerToCart,
}) => {
  const { sales, customOrders } = useBakery();
  const [searchQuery, setSearchQuery] = useState('');
  const [redeemCustomer, setRedeemCustomer] = useState<CustomerLoyaltyProfile | null>(null);
  const [redeemPointsAmount, setRedeemPointsAmount] = useState<number>(20);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  const profiles = useMemo(
    () => calculateCustomerLoyaltyProfiles(sales, customOrders),
    [sales, customOrders]
  );

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.tierNameKh.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);

  const totalPointsInSystem = useMemo(
    () => profiles.reduce((acc, p) => acc + p.currentPoints, 0),
    [profiles]
  );

  const vipMembersCount = useMemo(
    () => profiles.filter((p) => p.tier === 'GOLD' || p.tier === 'DIAMOND').length,
    [profiles]
  );

  if (!isOpen) return null;

  const handleConfirmRedeem = () => {
    if (!redeemCustomer || redeemPointsAmount <= 0) return;
    if (redeemPointsAmount > redeemCustomer.currentPoints) {
      alert('ពិន្ទុមិនគ្រប់គ្រាន់ទេ!');
      return;
    }

    soundFx.playSuccess();
    redeemCustomerPoints(redeemCustomer.phone, redeemPointsAmount);
    setSuccessFeedback(
      `បានដក ${redeemPointsAmount} ពិន្ទុពីអតិថិជន ${redeemCustomer.name} (${redeemCustomer.phone}) រួចរាល់!`
    );
    setTimeout(() => {
      setSuccessFeedback(null);
      setRedeemCustomer(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.15)] rounded-3xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-100/70 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-rose-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>ពិន្ទុសន្សំ & កាតសមាជិក (Loyalty & VIP)</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Customer Rewards
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                សន្សំពិន្ទុរាល់ការទិញ ($1 = 1 ពិន្ទុ) និងផ្ដល់អត្ថប្រយោជន៍តាមកម្រិតសមាជិក
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 py-3.5 bg-slate-50/70 border-b border-slate-100">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">សមាជិកសរុប (Members)</p>
              <p className="text-base font-black text-slate-800">{profiles.length} នាក់</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">ពិន្ទុក្នុងប្រព័ន្ធ (Total Pts)</p>
              <p className="text-base font-black text-rose-600">{totalPointsInSystem.toLocaleString()} Pts</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">សមាជិក VIP (Gold & Diamond)</p>
              <p className="text-base font-black text-purple-700">{vipMembersCount} នាក់</p>
            </div>
          </div>
        </div>

        {/* Tier Levels Bar */}
        <div className="px-6 py-2.5 bg-amber-50/40 border-b border-amber-100/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 overflow-x-auto py-1">
            {Object.entries(TIER_CONFIG).map(([k, t]) => (
              <span
                key={k}
                className={`px-2.5 py-1 rounded-xl border text-[11px] flex items-center gap-1.5 shadow-2xs ${t.color}`}
              >
                <span>{k === 'DIAMOND' ? '💎' : k === 'GOLD' ? '🥇' : k === 'SILVER' ? '🥈' : '🥉'}</span>
                <span>{t.nameKh}:</span>
                <span className="font-mono font-bold">({t.minPoints}+ pts)</span>
              </span>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {successFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successFeedback}</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខទូរស័ព្ទភ្ញៀវ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Customer Profiles List */}
          {filteredProfiles.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Award className="w-12 h-12 mx-auto stroke-1 opacity-50 mb-2" />
              <p className="text-sm font-medium">មិនមានទិន្នន័យអតិថិជនសន្សំពិន្ទុទេ</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-slate-100">
              {filteredProfiles.map((customer) => (
                <div
                  key={customer.phone}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-base">{customer.name}</span>
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${customer.tierBadgeColor}`}>
                        {customer.tierNameKh}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>ទិញសរុប: <b>${customer.totalSpentUsd}</b></span>
                      <span>•</span>
                      <span>ចំនួនកុម្ម៉ង់: <b>{customer.totalOrders} ដង</b></span>
                      <span>•</span>
                      <span>មកទិញចុងក្រោយ: {customer.lastVisitDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-lg font-black text-amber-600 flex items-center gap-1 justify-end">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        {customer.currentPoints} Pts
                      </span>
                      <p className="text-[11px] text-slate-400 font-medium">
                        សន្សំបាន: {customer.totalPointsEarned} | ដក: {customer.pointsRedeemed}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setRedeemCustomer(customer);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      <span>ដូរពិន្ទុ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Redeem Points Submodal */}
        {redeemCustomer && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-500" />
                  <span>ដូរពិន្ទុរង្វាន់ (Redeem Reward)</span>
                </h3>
                <button
                  onClick={() => setRedeemCustomer(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                <p className="text-sm font-bold text-slate-800">{redeemCustomer.name}</p>
                <p className="text-xs text-slate-500 font-mono">{redeemCustomer.phone}</p>
                <p className="text-xs font-bold text-amber-800 mt-1">
                  ពិន្ទុបច្ចុប្បន្ន: <span className="text-base font-black">{redeemCustomer.currentPoints} Pts</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  ជ្រើសរើសរង្វាន់ ឬចំនួនពិន្ទុដែលត្រូវដក:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { pts: 20, desc: 'បញ្ចុះតម្លៃ $1.00 (4,000៛)' },
                    { pts: 50, desc: 'បញ្ចុះតម្លៃ $2.50 ឬកាហ្វេ ១' },
                    { pts: 100, desc: 'បញ្ចុះតម្លៃ $6.00 (24,000៛)' },
                    { pts: 200, desc: 'បញ្ចុះតម្លៃ $15.00 ឬនំខេក ១' },
                  ].map((r) => (
                    <button
                      key={r.pts}
                      type="button"
                      disabled={r.pts > redeemCustomer.currentPoints}
                      onClick={() => setRedeemPointsAmount(r.pts)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                        redeemPointsAmount === r.pts
                          ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                      }`}
                    >
                      <span className="block text-amber-700">{r.pts} Pts</span>
                      <span className="text-[11px] text-slate-500 font-normal">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRedeemCustomer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRedeem}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25"
                >
                  បញ្ជាក់ការដក {redeemPointsAmount} ពិន្ទុ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

