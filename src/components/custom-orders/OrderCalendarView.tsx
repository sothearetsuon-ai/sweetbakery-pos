import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cake,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  Sparkles,
} from 'lucide-react';
import { CustomCakeOrder } from '../../types';
import { getProductImageUrl } from '../../utils/imagePath';
import { soundFx } from '../../utils/audio';

interface OrderCalendarViewProps {
  orders: CustomCakeOrder[];
  onSelectOrder: (order: CustomCakeOrder) => void;
  exchangeRate: number;
}

const MONTH_NAMES_KH = [
  'មករា (Jan)',
  'កុម្ភៈ (Feb)',
  'មីនា (Mar)',
  'មេសា (Apr)',
  'ឧសភា (May)',
  'មិថុនា (Jun)',
  'កក្កដា (Jul)',
  'សីហា (Aug)',
  'កញ្ញា (Sep)',
  'តុលា (Oct)',
  'វិច្ឆិកា (Nov)',
  'ធ្នូ (Dec)',
];

const WEEK_DAYS_KH = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'];

export const OrderCalendarView: React.FC<OrderCalendarViewProps> = ({
  orders,
  onSelectOrder,
  exchangeRate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Map orders by pickupDate (YYYY-MM-DD)
  const ordersByDate = useMemo(() => {
    const map = new Map<string, CustomCakeOrder[]>();
    for (const order of orders) {
      if (!order.pickupDate) continue;
      const dateKey = order.pickupDate.trim();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(order);
    }
    return map;
  }, [orders]);

  // Orders for the currently selected date
  const selectedDateOrders = useMemo(() => {
    const list = ordersByDate.get(selectedDateStr) || [];
    // Sort by pickupTime
    return [...list].sort((a, b) => (a.pickupTime || '').localeCompare(b.pickupTime || ''));
  }, [ordersByDate, selectedDateStr]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: dateStr === todayStr });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true, isToday: dateStr === todayStr });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: dateStr === todayStr });
    }

    return days;
  }, [year, month]);

  const handlePrevMonth = () => {
    soundFx.playPop();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    soundFx.playPop();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    soundFx.playPop();
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">⏳ រង់ចាំ</span>;
      case 'BAKING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">🔥 កំពុងដុត</span>;
      case 'DECORATING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">🎨 កំពុងតែង</span>;
      case 'READY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">✅ នំរួចរាល់</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">📦 បានប្រគល់</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Month Bar & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{MONTH_NAMES_KH[month]} {year}</span>
            </h3>
            <p className="text-xs text-slate-400">
              ប្រតិទិនកាលវិភាគដុតនំ និងទទួលនំកុម្ម៉ង់ប្រចាំថ្ងៃ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition-colors"
          >
            ថ្ងៃនេះ
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
            title="ខែមុន"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
            title="ខែបន្ទាប់"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Grid (Left) + Selected Day's Schedule (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Calendar Grid (7 columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEK_DAYS_KH.map((day, idx) => (
              <span
                key={day}
                className={`text-[11px] font-bold py-1 ${
                  idx === 0 ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell) => {
              const dayOrders = ordersByDate.get(cell.dateStr) || [];
              const isSelected = cell.dateStr === selectedDateStr;
              const hasOrders = dayOrders.length > 0;

              return (
                <button
                  type="button"
                  key={cell.dateStr}
                  onClick={() => {
                    soundFx.playPop();
                    setSelectedDateStr(cell.dateStr);
                  }}
                  className={`min-h-[68px] sm:min-h-[76px] p-1.5 rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer relative border ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 shadow-xs ring-2 ring-rose-400/40'
                      : cell.isToday
                      ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                      : cell.isCurrentMonth
                      ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'border-transparent opacity-40 bg-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-black ${
                        isSelected
                          ? 'text-rose-600 dark:text-rose-400'
                          : cell.isToday
                          ? 'w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {cell.isToday && !isSelected && (
                      <span className="text-[9px] font-bold text-amber-600">ថ្ងៃនេះ</span>
                    )}
                  </div>

                  {/* Orders pill */}
                  {hasOrders && (
                    <div className="w-full mt-1">
                      <div className="px-1.5 py-0.5 rounded-lg bg-rose-500 text-white text-[9.5px] font-bold flex items-center justify-between shadow-2xs">
                        <span className="flex items-center gap-0.5">
                          <Cake className="w-2.5 h-2.5" />
                          <span>{dayOrders.length}</span>
                        </span>
                        <span className="text-[8px] opacity-90 hidden sm:inline">កុម្ម៉ង់</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day's Schedule List (Right Panel) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>កាលវិភាគទទួលនំថ្ងៃ៖ {selectedDateStr}</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                មានចំនួន {selectedDateOrders.length} កុម្ម៉ង់ត្រូវទទួល
              </p>
            </div>
            {selectedDateOrders.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black">
                {selectedDateOrders.length} នំ
              </span>
            )}
          </div>

          {/* Orders list */}
          <div className="flex-1 overflow-y-auto max-h-[460px] space-y-2.5 pr-1">
            {selectedDateOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <CalendarIcon className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs">គ្មានកុម្ម៉ង់នំខេក ឬនំបុ័ងសម្រាប់ថ្ងៃនេះឡើយ។</p>
              </div>
            ) : (
              selectedDateOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-rose-300 transition-all cursor-pointer group shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center gap-1 shadow-2xs">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{order.pickupTime || 'មិនទាន់កំណត់'}</span>
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      #{order.orderNumber}
                    </span>
                  </div>

                  {/* Cake info row */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                      {order.referenceImage ? (
                        <img
                          src={getProductImageUrl(order.referenceImage)}
                          alt={order.cakeName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-rose-50 text-rose-500">
                          🎂
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {order.cakeName}
                      </h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                        ទំហំ៖ {order.size} • រសជាតិ៖ {order.flavor}
                      </p>
                      {order.inscription && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 italic truncate">
                          ✍️ &ldquo;{order.inscription}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customer info & price */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="font-bold">{order.customerName}</span>
                      <span className="text-slate-400">({order.phone})</span>
                    </div>

                    <div className="font-black text-rose-600 dark:text-rose-400 shrink-0">
                      {(order.totalKhr || Math.round(order.totalUsd * exchangeRate)).toLocaleString()} ៛
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

