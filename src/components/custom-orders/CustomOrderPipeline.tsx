import React, { useState, useMemo } from 'react';
import { Cake, Plus, Search, Clock, Flame, Palette, CheckCircle2, CheckSquare, Sparkles, Trash2, Link as LinkIcon } from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { t } from '../../utils/translations';
import { OrderCard } from './OrderCard';
import { NewCustomOrderModal } from './NewCustomOrderModal';
import { AddDepositModal } from './AddDepositModal';
import { ReceiptModal } from '../pos/ReceiptModal';
import { CustomerOrderLinkModal } from '../customer-order/CustomerOrderLinkModal';
import { OrderStatus, CustomCakeOrder, CompletedSale } from '../../types';
import { soundFx } from '../../utils/audio';

export const CustomOrderPipeline: React.FC = () => {
  const { lang, customOrders, sales, currentStaff, exchangeRate, updateOrderStatus, deleteCustomOrder, clearAllCustomOrders } = useBakery();
  const text = t[lang];

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isCustomerLinkModalOpen, setIsCustomerLinkModalOpen] = useState(false);
  const [selectedOrderForDeposit, setSelectedOrderForDeposit] = useState<CustomCakeOrder | null>(null);
  const [receiptSale, setReceiptSale] = useState<CompletedSale | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<CustomCakeOrder | null>(null);
  const [stageToDelete, setStageToDelete] = useState<{ status: OrderStatus; title: string; count: number } | null>(null);
  const [isConfirmClearAll, setIsConfirmClearAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CAKE' | 'BREAD'>('ALL');

  const todayStr = new Date().toISOString().slice(0, 10);

  const cakeCount = useMemo(() => customOrders.filter(o => o.orderType !== 'BREAD').length, [customOrders]);
  const breadCount = useMemo(() => customOrders.filter(o => o.orderType === 'BREAD').length, [customOrders]);

  const filteredOrders = useMemo(() => {
    return customOrders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.customerName.toLowerCase().includes(q) ||
        order.phone.includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.cakeName.toLowerCase().includes(q) ||
        (order.breadItems && order.breadItems.some(it => it.nameKh.toLowerCase().includes(q) || it.nameEn?.toLowerCase().includes(q)));

      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = order.pickupDate === todayStr;
      } else if (dateFilter === 'upcoming') {
        matchesDate = order.pickupDate > todayStr;
      } else if (dateFilter === 'custom') {
        const start = customStartDate || '1970-01-01';
        const end = customEndDate || '2099-12-31';
        matchesDate = order.pickupDate >= start && order.pickupDate <= end;
      }

      let matchesType = true;
      if (typeFilter === 'CAKE') {
        matchesType = order.orderType !== 'BREAD';
      } else if (typeFilter === 'BREAD') {
        matchesType = order.orderType === 'BREAD';
      }

      return matchesSearch && matchesDate && matchesType;
    });
  }, [customOrders, searchQuery, dateFilter, customStartDate, customEndDate, typeFilter, todayStr]);

  const columns: {
    status: OrderStatus;
    titleKh: string;
    titleEn: string;
    icon: any;
    color: string;
    bgHeader: string;
    badgeStyle: string;
  }[] = [
    {
      status: 'PENDING',
      titleKh: 'រង់ចាំទទួល',
      titleEn: 'Pending',
      icon: Clock,
      color: 'text-amber-500',
      bgHeader: 'bg-amber-50/90 border-amber-200/80',
      badgeStyle: 'bg-amber-500 text-white',
    },
    {
      status: 'BAKING',
      titleKh: 'កំពុងដុតនំ',
      titleEn: 'Baking',
      icon: Flame,
      color: 'text-orange-500 animate-pulse',
      bgHeader: 'bg-orange-50/90 border-orange-200/80',
      badgeStyle: 'bg-orange-500 text-white',
    },
    {
      status: 'DECORATING',
      titleKh: 'កំពុងតែងនំ',
      titleEn: 'Decorating',
      icon: Palette,
      color: 'text-purple-500',
      bgHeader: 'bg-purple-50/90 border-purple-200/80',
      badgeStyle: 'bg-purple-500 text-white',
    },
    {
      status: 'READY',
      titleKh: 'រួចរាល់ មកយកបាន',
      titleEn: 'Ready',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgHeader: 'bg-emerald-50/90 border-emerald-200/80',
      badgeStyle: 'bg-emerald-500 text-white',
    },
    {
      status: 'DELIVERED',
      titleKh: 'បានប្រគល់ជូន',
      titleEn: 'Delivered',
      icon: CheckSquare,
      color: 'text-slate-500',
      bgHeader: 'bg-slate-100/90 border-slate-200/80',
      badgeStyle: 'bg-slate-700 text-white',
    },
  ];

  const [mobileStatusTab, setMobileStatusTab] = useState<OrderStatus | 'ALL'>('ALL');

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: filteredOrders.length };
    columns.forEach((c) => {
      counts[c.status] = filteredOrders.filter((o) => o.status === c.status).length;
    });
    return counts;
  }, [filteredOrders, columns]);

  const visibleColumns = useMemo(() => {
    if (mobileStatusTab === 'ALL') return columns;
    return columns.filter((c) => c.status === mobileStatusTab);
  }, [columns, mobileStatusTab]);

  const handleOpenReceipt = (order: CustomCakeOrder) => {
    const matching = sales.find(
      (s) =>
        s.id === `sale-custom-${order.id}` ||
        s.orderNumber === order.orderNumber ||
        (order.themeNotes && order.themeNotes.includes(s.orderNumber))
    );
    if (matching) {
      setReceiptSale(matching);
    } else {
      const orderTotalKhr = order.totalKhr ?? Math.round(order.totalUsd * exchangeRate);
      
      const receiptItems = order.orderType === 'BREAD' && order.breadItems && order.breadItems.length > 0
        ? order.breadItems.map((it, idx) => ({
            productId: `bread-${order.id}-${idx}`,
            nameKh: `${it.nameKh} (${it.unit})`,
            nameEn: `${it.nameEn || it.nameKh} (${it.unit})`,
            quantity: it.quantity,
            priceUsd: it.pricePerUnitUsd,
            priceKhr: it.pricePerUnitKhr,
          }))
        : [
            {
              productId: `custom-${order.id}`,
              nameKh: `នំកុម្ម៉ង់៖ ${order.cakeName} (${order.size})`,
              nameEn: `Custom Cake: ${order.cakeName} (${order.size})`,
              quantity: 1,
              priceUsd: order.totalUsd,
              priceKhr: orderTotalKhr,
              image: order.referenceImage || undefined,
            },
          ];

      setReceiptSale({
        id: `sale-custom-${order.id}`,
        orderNumber: order.orderNumber,
        items: receiptItems,
        subtotalUsd: order.totalUsd,
        discountUsd: 0,
        totalUsd: order.totalUsd,
        totalKhr: orderTotalKhr,
        paymentMethod: order.paymentMethod || 'CASH_KHR',
        paidUsd: order.totalUsd,
        paidKhr: orderTotalKhr,
        changeUsd: 0,
        changeKhr: 0,
        cashierName: currentStaff?.name || 'ម្ចាស់ហាង (Admin)',
        customerName: order.customerName,
        customerPhone: order.phone,
        isDeposit: false,
        depositKhr: order.depositKhr,
        depositUsd: order.depositUsd,
        remainingKhr: 0,
        remainingUsd: 0,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
        notes: order.orderType === 'BREAD'
          ? `កុម្ម៉ង់នំបុ័ង & នំដុត (${order.packagingOption || 'ច្រកធម្មតា'}) • បានប្រគល់ជូនរួចរាល់`
          : `នំកុម្ម៉ង់ពិសេស (រសជាតិ៖ ${order.flavor}) • បានប្រគល់ជូនរួចរាល់`,
        createdAt: order.createdAt || new Date().toISOString(),
      });
    }
  };

  const handleClearStage = () => {
    if (!stageToDelete) return;
    soundFx.playSuccess();
    const ordersInStage = customOrders.filter((o) => o.status === stageToDelete.status);
    ordersInStage.forEach((o) => deleteCustomOrder(o.id));
    setStageToDelete(null);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-hidden pb-20 md:pb-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-5 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>🎂 🥖</span>
            <span>{text.orderPipelineTitle} & កុម្ម៉ង់នំបុ័ង</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            តាមដានដំណើរការផលិតនំខួបកំណើត និងនំបុ័ងកុម្ម៉ង់តាមដំណាក់កាល
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Type Filter Pills */}
          <div className="flex items-center bg-white/90 p-1 rounded-2xl border border-rose-100 shadow-2xs">
            <button
              onClick={() => {
                soundFx.playPop();
                setTypeFilter('ALL');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                typeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>ទាំងអស់</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-black">
                {customOrders.length}
              </span>
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setTypeFilter('CAKE');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                typeFilter === 'CAKE'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎂 នំខេក</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-black">
                {cakeCount}
              </span>
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setTypeFilter('BREAD');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                typeFilter === 'BREAD'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🥖 នំបុ័ង</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-black">
                {breadCount}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ/ទូរស័ព្ទ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-white border border-rose-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 w-full sm:w-48 shadow-2xs font-medium"
            />
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center bg-white/90 p-1 rounded-2xl border border-rose-100 shadow-2xs flex-wrap gap-1">
            <button
              onClick={() => {
                soundFx.playPop();
                setDateFilter('all');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ទាំងអស់
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setDateFilter('today');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ថ្ងៃនេះ
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setDateFilter('upcoming');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'upcoming'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ថ្ងៃខាងមុខ
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setDateFilter('custom');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'custom'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎯 ចន្លោះកាលបរិច្ឆេទ
            </button>

            {/* Custom Date Range Picker (ចាប់ពីថ្ងៃទី ... ដល់ថ្ងៃទី ...) */}
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 flex-wrap py-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-600">ចាប់ពីថ្ងៃទី៖</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomStartDate(val);
                      if (val) {
                        soundFx.playPop();
                        setDateFilter('custom');
                      }
                    }}
                    className="px-2 py-0.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer"
                  />
                </div>
                <span className="text-slate-300 text-xs hidden sm:inline">➔</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-600">ដល់ថ្ងៃទី៖</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomEndDate(val);
                      if (val) {
                        soundFx.playPop();
                        setDateFilter('custom');
                      }
                    }}
                    className="px-2 py-0.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clear All Test Orders Button */}
          {customOrders.length > 0 && (
            <button
              onClick={() => {
                soundFx.playPop();
                setIsConfirmClearAll(true);
              }}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="លុបការកុម្ម៉ង់នំតេស្តទាំងអស់"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">សម្អាតទិន្នន័យតេស្ត</span>
            </button>
          )}

          {/* Customer Order Link Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              setIsCustomerLinkModalOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:bg-pink-500/20 text-pink-700 border border-pink-300 text-xs font-black rounded-2xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="ចម្លង ឬចែករំលែកលីងកុម្ម៉ង់សម្រាប់ភ្ញៀវ"
          >
            <LinkIcon className="w-3.5 h-3.5 text-pink-600" />
            <span className="hidden sm:inline">លីងកុម្ម៉ង់ភ្ញៀវ & QR</span>
            <span className="sm:hidden">លីងភ្ញៀវ</span>
          </button>

          {/* New Order Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              setIsNewOrderModalOpen(true);
            }}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-500/25 flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">{text.newOrderBtn}</span>
            <span className="sm:hidden">+ កុម្ម៉ង់នំ</span>
          </button>
        </div>
      </div>

      {/* Mobile Status Tabs Switcher (Visible on Mobile) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none shrink-0">
        <button
          onClick={() => {
            soundFx.playPop();
            setMobileStatusTab('ALL');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            mobileStatusTab === 'ALL'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-rose-100'
          }`}
        >
          <span>ទាំងអស់</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-black">
            {statusCounts.ALL}
          </span>
        </button>

        {columns.map((col) => {
          const isActive = mobileStatusTab === col.status;
          return (
            <button
              key={col.status}
              onClick={() => {
                soundFx.playPop();
                setMobileStatusTab(col.status);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-rose-100'
              }`}
            >
              <span>{lang === 'km' ? col.titleKh : col.titleEn}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rose-50 text-pink-600'
                }`}
              >
                {statusCounts[col.status] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Single Stage Action Bar (Shows when filtering by stage on mobile) */}
      {mobileStatusTab !== 'ALL' && (
        <div className="md:hidden flex items-center justify-between bg-rose-50/70 border border-rose-200/70 rounded-2xl px-3.5 py-2 mb-3 text-xs shrink-0 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <span>📍 ដំណាក់កាល៖</span>
            <span className="text-pink-600">
              {columns.find((c) => c.status === mobileStatusTab)?.titleKh} ({statusCounts[mobileStatusTab] || 0} នំ)
            </span>
          </div>
          {(statusCounts[mobileStatusTab] || 0) > 0 && (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                const colInfo = columns.find((c) => c.status === mobileStatusTab);
                setStageToDelete({
                  status: mobileStatusTab as OrderStatus,
                  title: lang === 'km' ? (colInfo?.titleKh || '') : (colInfo?.titleEn || ''),
                  count: statusCounts[mobileStatusTab] || 0,
                });
              }}
              className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[11px] font-black flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3 h-3 text-rose-500" />
              <span>លុបទាំងអស់ក្នុងកន្លែងនេះ</span>
            </button>
          )}
        </div>
      )}

      {/* Kanban Columns: Horizontal swipe on mobile, grid on desktop */}
      <div className="flex-1 flex md:grid md:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {visibleColumns.map((col) => {
          const Icon = col.icon;
          const colOrders = filteredOrders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className={`flex flex-col bg-white/70 backdrop-blur-sm rounded-3xl border border-rose-100/70 p-3 sm:p-3.5 overflow-hidden shadow-2xs snap-center ${
                mobileStatusTab !== 'ALL'
                  ? 'w-full flex-1 min-w-0'
                  : 'min-w-[85vw] sm:min-w-[320px] md:min-w-0 shrink-0 md:shrink'
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-2.5 sm:p-3 rounded-2xl border mb-2.5 sm:mb-3 flex items-center justify-between shadow-2xs ${col.bgHeader}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${col.color}`} />
                  <span className="font-black text-xs text-slate-800">
                    {lang === 'km' ? col.titleKh : col.titleEn}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shadow-xs ${col.badgeStyle}`}>
                    {colOrders.length}
                  </span>
                  {colOrders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setStageToDelete({
                          status: col.status,
                          title: lang === 'km' ? col.titleKh : col.titleEn,
                          count: colOrders.length,
                        });
                      }}
                      className="w-6 h-6 rounded-lg bg-white/80 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors border border-slate-200/50 cursor-pointer active:scale-90"
                      title={`សម្អាត ឬលុបទាំងអស់ក្នុង «${lang === 'km' ? col.titleKh : col.titleEn}» (${colOrders.length} នំ)`}
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Column Card List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colOrders.length === 0 ? (
                  <div className="h-32 sm:h-36 border-2 border-dashed border-rose-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs font-medium p-4 text-center">
                    <Cake className="w-6 h-6 text-rose-200 mb-1" />
                    <span>គ្មាននំកុម្ម៉ង់ក្នុងដំណាក់កាលនេះទេ</span>
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAdvanceStatus={(id, nextStatus) => updateOrderStatus(id, nextStatus)}
                      onAddDeposit={(ord) => setSelectedOrderForDeposit(ord)}
                      onDelete={(ord) => setOrderToDelete(ord)}
                      onViewReceipt={handleOpenReceipt}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to add custom cake */}
      <NewCustomOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
      />

      {/* Modal to add or update deposit */}
      <AddDepositModal
        isOpen={!!selectedOrderForDeposit}
        onClose={() => setSelectedOrderForDeposit(null)}
        order={selectedOrderForDeposit}
      />

      {/* Modal to view / print receipt */}
      <ReceiptModal
        isOpen={!!receiptSale}
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />

      {/* In-App Modal to Confirm Delete Single Custom Cake Order (Touch Friendly!) */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base">លុបការកុម្ម៉ង់នំ?</h3>
                <p className="text-xs text-slate-400">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-1 text-xs text-slate-700">
              <div className="font-bold text-rose-700 text-sm">{orderToDelete.cakeName}</div>
              <div className="text-[11px] text-slate-500">
                អតិថិជន៖ <span className="font-semibold text-slate-800">{orderToDelete.customerName}</span> ({orderToDelete.phone})
              </div>
              <div className="text-[11px] text-slate-500">
                លេខកូដ៖ <span className="font-semibold text-pink-600">{orderToDelete.orderNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playSuccess();
                  deleteCustomOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>យល់ព្រមលុប</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Modal to Confirm Clear Specific Stage / Column */}
      {stageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base">សម្អាតដំណាក់កាលនេះ?</h3>
                <p className="text-xs text-rose-600 font-bold">{stageToDelete.title} ({stageToDelete.count} នំ)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              តើលោកអ្នកពិតជាចង់លុបការកុម្ម៉ង់ទាំង <strong>{stageToDelete.count}</strong> នំ នៅក្នុងផ្នែក «<strong>{stageToDelete.title}</strong>» មែនទេ? ការកុម្ម៉ង់ក្នុងដំណាក់កាលផ្សេងទៀតនឹងមិនរងផលប៉ះពាល់ឡើយ។
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStageToDelete(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleClearStage}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>យល់ព្រមលុប ({stageToDelete.count})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Modal to Confirm Clear All Orders */}
      {isConfirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base">សម្អាតទិន្នន័យទាំងអស់?</h3>
                <p className="text-xs text-slate-400">លុបការកុម្ម៉ង់នំទាំងអស់ ({customOrders.length} នំ)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              តើលោកអ្នកពិតជាចង់សម្អាត និងលុបការកុម្ម៉ង់នំទាំងអស់ចេញពីផ្ទាំង Pipeline មែនទេ?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmClearAll(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playSuccess();
                  clearAllCustomOrders();
                  setIsConfirmClearAll(false);
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>សម្អាតទាំងអស់</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Customer Self-Order Link & QR Modal */}
      <CustomerOrderLinkModal
        isOpen={isCustomerLinkModalOpen}
        onClose={() => setIsCustomerLinkModalOpen(false)}
      />
    </div>
  );
};
