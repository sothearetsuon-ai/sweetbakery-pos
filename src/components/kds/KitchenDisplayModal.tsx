import React, { useState, useMemo } from 'react';
import {
  X,
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Sparkles,
  Calendar,
  Flame,
  Search,
  Maximize2
} from 'lucide-react';
import { CustomCakeOrder } from '../../types';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
import { sendTelegramOrderNotification } from '../../services/telegram';

interface KitchenDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KitchenDisplayModal: React.FC<KitchenDisplayModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customOrders, updateOrderStatus, storeInfo } = useBakery();
  const [filterType, setFilterType] = useState<'ALL' | 'TODAY' | 'TOMORROW'>('TODAY');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const filteredOrders = useMemo(() => {
    return customOrders.filter((order) => {
      if (filterType === 'TODAY') return order.pickupDate === todayStr;
      if (filterType === 'TOMORROW') return order.pickupDate === tomorrowStr;
      return true;
    });
  }, [customOrders, filterType, todayStr, tomorrowStr]);

  const prepOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === 'PENDING' || o.status === 'BAKING' || !o.status),
    [filteredOrders]
  );
  const decoratingOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === 'DECORATING'),
    [filteredOrders]
  );
  const readyOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === 'READY'),
    [filteredOrders]
  );
  const completedOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === 'DELIVERED'),
    [filteredOrders]
  );

  const handleUpdateStatus = (
    order: CustomCakeOrder,
    newStatus: CustomCakeOrder['status']
  ) => {
    soundFx.playSuccess();
    updateOrderStatus(order.id, newStatus);

    // If marked ready, dispatch notification
    if (newStatus === 'READY') {
      try {
        const msg = `🎂 **នំខេកធ្វើរួចរាល់ហើយ! (Ready for Pickup)**\n\n` +
          `• **លេខកុម្ម៉ង់៖** \`${order.orderNumber || order.id}\`\n` +
          `• **ម៉ូដនំ៖** ${order.cakeName || 'នំខួបកំណើត'}\n` +
          `• **រសជាតិ៖** ${order.flavor || 'សូកូឡា'}\n` +
          `• **អតិថិជន៖** ${order.customerName} (${order.phone})\n` +
          `• **ម៉ោងមកទទួល៖** ${order.pickupTime} (${order.pickupDate})\n\n` +
          `📍 នំបានរៀបចំទុកក្នុងទូត្រជាក់រួចរាល់ អតិថិជនអាចមកទទួលយកបាន! ✨`;
        sendTelegramOrderNotification(msg);
      } catch (e) {}
    }
  };

  const getTimeLeftHint = (pickupDate: string, pickupTime: string) => {
    try {
      const now = new Date();
      const target = new Date(`${pickupDate}T${pickupTime}:00`);
      const diffMs = target.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffMs < 0) {
        return { text: 'ហួសម៉ោងកំណត់', isOverdue: true };
      }
      if (diffHrs === 0) {
        return { text: `នៅសល់ ${diffMins} នាទី`, isUrgent: true };
      }
      return { text: `នៅសល់ ${diffHrs}ម៉ោង ${diffMins}នាទី`, isNormal: true };
    } catch {
      return { text: pickupTime, isNormal: true };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 animate-in fade-in duration-200 overflow-hidden">
      {/* Top KDS Navbar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xl shadow-md">
            👨‍🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Kitchen Display System (KDS)</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-black uppercase">
                  បន្ទប់ដុត & តែងនំ
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              {storeInfo.nameKh || 'Sweet Bakery'} • កម្មវិធីគ្រប់គ្រងលំដាប់ការងារជាងនំ Real-time
            </p>
          </div>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 text-xs font-bold">
            <button
              onClick={() => { soundFx.playPop(); setFilterType('TODAY'); }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterType === 'TODAY' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              នំថ្ងៃនេះ ({customOrders.filter((o) => o.pickupDate === todayStr).length})
            </button>
            <button
              onClick={() => { soundFx.playPop(); setFilterType('TOMORROW'); }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterType === 'TOMORROW' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              នំថ្ងៃស្អែក ({customOrders.filter((o) => o.pickupDate === tomorrowStr).length})
            </button>
            <button
              onClick={() => { soundFx.playPop(); setFilterType('ALL'); }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterType === 'ALL' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              ទាំងអស់ ({customOrders.length})
            </button>
          </div>

          <button
            onClick={() => { soundFx.playPop(); onClose(); }}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Kanban Board Columns */}
      <div className="flex-1 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto">
        {/* Column 1: Baking / Preparing */}
        <div className="bg-slate-900/70 border border-amber-500/30 rounded-3xl p-3 sm:p-4 flex flex-col max-h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                <span>១. កំពុងត្រៀមដុត (Baking)</span>
                <span className="text-xs bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300">
                  {prepOrders.length}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pt-3">
            {prepOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-600 font-bold">
                គ្មានការកុម្ម៉ង់ក្នុងដំណាក់កាលនេះទេ
              </div>
            ) : (
              prepOrders.map((order) => (
                <KdsOrderCard
                  key={order.id}
                  order={order}
                  getTimeLeftHint={getTimeLeftHint}
                  onPreviewImage={setPreviewImage}
                  nextActionLabel="👉 ចាប់ផ្តើមតែងម៉ូដ (Decorate)"
                  onNextAction={() => handleUpdateStatus(order, 'DECORATING')}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Decorating */}
        <div className="bg-slate-900/70 border border-purple-500/30 rounded-3xl p-3 sm:p-4 flex flex-col max-h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
              <h3 className="font-black text-sm text-purple-300 flex items-center gap-1.5">
                <span>២. កំពុងតែងម៉ូដ (Decorating)</span>
                <span className="text-xs bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-300">
                  {decoratingOrders.length}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pt-3">
            {decoratingOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-600 font-bold">
                គ្មានការកុម្ម៉ង់ក្នុងដំណាក់កាលនេះទេ
              </div>
            ) : (
              decoratingOrders.map((order) => (
                <KdsOrderCard
                  key={order.id}
                  order={order}
                  getTimeLeftHint={getTimeLeftHint}
                  onPreviewImage={setPreviewImage}
                  nextActionLabel="✅ នំរួចរាល់ (Ready)"
                  onNextAction={() => handleUpdateStatus(order, 'READY')}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup */}
        <div className="bg-slate-900/70 border border-emerald-500/30 rounded-3xl p-3 sm:p-4 flex flex-col max-h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <h3 className="font-black text-sm text-emerald-300 flex items-center gap-1.5">
                <span>៣. រួចរាល់រង់ចាំភ្ញៀវយក (Ready)</span>
                <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300">
                  {readyOrders.length}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pt-3">
            {readyOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-600 font-bold">
                គ្មាននំរង់ចាំភ្ញៀវយកទេ
              </div>
            ) : (
              readyOrders.map((order) => (
                <KdsOrderCard
                  key={order.id}
                  order={order}
                  getTimeLeftHint={getTimeLeftHint}
                  onPreviewImage={setPreviewImage}
                  nextActionLabel="🎉 បានប្រគល់ជូនភ្ញៀវ (Delivered)"
                  onNextAction={() => handleUpdateStatus(order, 'DELIVERED')}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Image Full-Screen Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Cake Reference"
              className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface KdsOrderCardProps {
  order: CustomCakeOrder;
  getTimeLeftHint: (date: string, time: string) => { text: string; isOverdue?: boolean; isUrgent?: boolean; isNormal?: boolean };
  onPreviewImage: (url: string) => void;
  nextActionLabel: string;
  onNextAction: () => void;
}

const KdsOrderCard: React.FC<KdsOrderCardProps> = ({
  order,
  getTimeLeftHint,
  onPreviewImage,
  nextActionLabel,
  onNextAction,
}) => {
  const timeHint = getTimeLeftHint(order.pickupDate, order.pickupTime);

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 space-y-3 shadow-md hover:border-slate-500 transition-all">
      {/* Card Header: Order No, Time left badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/60">
          #{order.orderNumber || order.id.slice(0, 8)}
        </span>

        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
            timeHint.isOverdue
              ? 'bg-rose-900/80 text-rose-300 border border-rose-700 animate-pulse'
              : timeHint.isUrgent
              ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>{timeHint.text}</span>
        </span>
      </div>

      {/* Main Info: Photo & Cake Specs */}
      <div className="flex items-start gap-3">
        {order.referenceImage ? (
          <div
            onClick={() => onPreviewImage(order.referenceImage!)}
            className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-600 bg-slate-900 cursor-pointer group"
          >
            <img
              src={order.referenceImage}
              alt="Cake reference"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
            🎂
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="font-black text-xs text-white leading-tight truncate">
            {order.cakeName || 'នំខេកខួបកំណើត'}
          </h4>

          <div className="text-[11px] text-pink-300 font-bold truncate">
            🍓 រសជាតិ៖ {order.flavor || 'សូកូឡា'}
          </div>

          <div className="text-[10px] text-slate-300">
            📏 ទំហំ៖ {order.size || 'ស្តង់ដារ'}
          </div>
        </div>
      </div>

      {/* Inscription on Cake */}
      {order.inscription && (
        <div className="p-2 bg-slate-900/80 rounded-xl border border-pink-900/40 text-[11px] space-y-0.5">
          <span className="text-[9px] font-black text-pink-400 uppercase block">
            ✍️ អក្សរលើនំ (Inscription)៖
          </span>
          <p className="font-bold text-white italic">
            "{order.inscription}"
          </p>
        </div>
      )}

      {/* Customer Info & Pickup */}
      <div className="pt-2 flex items-center justify-between gap-2 text-xs border-t border-slate-700/60">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-slate-400 block">👤 ឈ្មោះភ្ញៀវ៖</span>
          <div className="text-white font-black text-sm truncate">
            {order.customerName} <span className="text-slate-400 text-xs font-normal">({order.phone})</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block">ម៉ោងមកយក</span>
          <span className="text-amber-400 font-black text-xs">ម៉ោង {order.pickupTime}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onNextAction}
        className="w-full py-2 bg-slate-700 hover:bg-amber-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
      >
        <span>{nextActionLabel}</span>
      </button>
    </div>
  );
};
