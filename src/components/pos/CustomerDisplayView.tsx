import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  QrCode,
  CheckCircle2,
  Clock,
  Phone,
  Wifi,
  Maximize2,
  Minimize2,
  Store,
  ChevronRight,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import {
  customerDisplaySync,
  CustomerDisplayState,
} from '../../services/customerDisplaySync';

export const CustomerDisplayView: React.FC = () => {
  const { storeInfo, exchangeRate, products } = useBakery();
  const [displayState, setDisplayState] = useState<CustomerDisplayState>(() =>
    customerDisplaySync.getCurrentState()
  );
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Subscribe to live dual-screen updates
  useEffect(() => {
    const unsub = customerDisplaySync.subscribe((state) => {
      setDisplayState(state);
      if (state.status === 'paid') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#F43F5E', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'],
        });
      }
    });

    return () => unsub();
  }, []);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('km-KH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Idle showcase carousel
  const showcaseProducts = products.slice(0, 8);
  useEffect(() => {
    if (displayState.status !== 'idle' || showcaseProducts.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % showcaseProducts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [displayState.status, showcaseProducts.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentShowcaseProduct = showcaseProducts[carouselIndex];

  return (
    <div className="min-h-screen h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      {/* Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
              🎂
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide font-muol flex items-center gap-2">
              <span>{storeInfo.nameKh || storeInfo.nameEn || 'Sweet Bakery'}</span>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Customer Display
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {storeInfo.address || 'ភ្នំពេញ, ប្រទេសកម្ពុជា'}
            </p>
          </div>
        </div>

        {/* Live Status and Clock */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-slate-300">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>{currentTime}</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'ចេញពីពេញអេក្រង់' : 'ពេញអេក្រង់ (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row p-4 sm:p-6 gap-6 overflow-hidden z-10">
        {/* Left Side: Order Items or Welcome Message */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md shadow-2xl overflow-hidden">
          {displayState.status === 'idle' ? (
            /* Idle Welcome State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500/20 to-amber-500/20 border border-pink-500/30 flex items-center justify-center text-5xl shadow-xl shadow-pink-500/10 animate-bounce">
                  🥐
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-black text-white font-muol leading-relaxed">
                  សូមស្វាគមន៍មកកាន់ {storeInfo.nameKh || storeInfo.nameEn || 'Sweet Bakery'}!
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-battambang">
                  នំបុ័ង និងនំខេកស្រស់ៗដុតរាល់ថ្ងៃ ជាមួយគ្រឿងផ្សំគុណភាពខ្ពស់ និងរសជាតិឆ្ងាញ់ពិតៗ។
                </p>
              </div>

              {/* Store Highlights / Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {storeInfo.phone && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-pink-400" />
                    <span>{storeInfo.phone}</span>
                  </div>
                )}
                {storeInfo.address && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    <span>{storeInfo.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-xs text-pink-300 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                  <span>បម្រើដោយក្តីស្រឡាញ់ & ទំនុកចិត្ត</span>
                </div>
              </div>
            </div>
          ) : (
            /* Active Cart or Checkout Items List */
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-pink-400" />
                  <h2 className="text-base font-black text-white">បញ្ជីទំនិញដែលបានជ្រើសរើស</h2>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {displayState.items.reduce((s, it) => s + it.quantity, 0)} មុខ
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 py-3">
                {displayState.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 transition-all animate-in fade-in slide-in-from-left-2 duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.nameKh}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500/20 to-amber-500/20 border border-slate-700 text-pink-300 flex items-center justify-center text-xl shrink-0">
                          🎂
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{item.nameKh}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {item.unitPriceKhr.toLocaleString()} ៛ ({item.unitPriceUsd.toFixed(2)} $)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black font-mono text-pink-300">
                        x{item.quantity} {item.unit || ''}
                      </div>
                      <div className="text-right w-24">
                        <div className="text-sm font-black font-mono text-amber-400">
                          {item.totalKhr.toLocaleString()} ៛
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          ${item.totalUsd.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Showcase OR Payment Card */}
        <div className="w-full lg:w-96 flex flex-col shrink-0 gap-4">
          {displayState.status === 'idle' && currentShowcaseProduct ? (
            /* Rotating Showcase of Bakery Items */
            <div className="flex-1 bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden relative">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span className="flex items-center gap-1.5 font-bold text-pink-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  នំពិសេសប្រចាំថ្ងៃ (Daily Special)
                </span>
                <span className="font-mono">
                  {carouselIndex + 1}/{showcaseProducts.length}
                </span>
              </div>

              <div className="my-auto py-4 flex flex-col items-center text-center space-y-3">
                <div className="w-48 h-48 rounded-3xl overflow-hidden border-2 border-pink-500/30 shadow-2xl shadow-pink-500/10 relative group">
                  {currentShowcaseProduct.imageUrl ? (
                    <img
                      src={currentShowcaseProduct.imageUrl}
                      alt={currentShowcaseProduct.nameKh}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-6xl">
                      🥐
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-amber-400 border border-amber-500/30 font-mono">
                    {currentShowcaseProduct.categoryId.toUpperCase()}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white font-muol">
                    {currentShowcaseProduct.nameKh}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    {currentShowcaseProduct.nameEn}
                  </p>
                </div>

                <div className="text-xl font-black font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-2xl">
                  {(currentShowcaseProduct.priceKhr ?? Math.round(currentShowcaseProduct.priceUsd * exchangeRate)).toLocaleString()} ៛
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    (${currentShowcaseProduct.priceUsd.toFixed(2)})
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-1.5 pt-2">
                {showcaseProducts.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === carouselIndex ? 'w-6 bg-pink-500' : 'w-1.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : displayState.status === 'paid' ? (
            /* Paid Celebration Card */
            <div className="flex-1 bg-gradient-to-b from-emerald-950/70 to-teal-950/70 border-2 border-emerald-500/60 rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-400/50 shadow-xl shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white font-muol">
                  ការទូទាត់ប្រាក់ជោគជ័យ!
                </h3>
                <p className="text-xs text-emerald-300">
                  {displayState.paidBankName || 'Bakong KHQR'} • បានផ្ទៀងផ្ទាត់រួចរាល់
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-emerald-500/30 w-full space-y-1">
                <div className="text-xs text-slate-400">ទឹកប្រាក់ដែលទទួលបាន</div>
                <div className="text-2xl font-black font-mono text-emerald-300">
                  {displayState.paidAmount?.toLocaleString()} {displayState.paidCurrency || 'KHR'}
                </div>
              </div>

              <div className="text-xs text-slate-300 font-battambang">
                🎉 សូមអរគុណច្រើនដែលបានគាំទ្រ Sweet Bakery! សូមអញ្ជើញមកពិសាម្ដងទៀត។
              </div>
            </div>
          ) : (
            /* Active Bill Summary & KHQR Payment Card */
            <div className="flex-1 bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider pb-3 border-b border-slate-800">
                  សរុបការទូទាត់ (Payment Summary)
                </h3>

                <div className="space-y-2.5 py-4 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>តម្លៃសរុប (Subtotal):</span>
                    <span className="font-mono text-slate-200">
                      {displayState.subtotalKhr.toLocaleString()} ៛
                    </span>
                  </div>
                  {displayState.discountKhr > 0 && (
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span>បញ្ចុះតម្លៃ (Discount):</span>
                      <span className="font-mono">
                        -{displayState.discountKhr.toLocaleString()} ៛
                      </span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="pt-3 border-t border-slate-800">
                    <div className="p-3.5 bg-gradient-to-r from-pink-950/60 to-rose-950/60 border border-pink-500/40 rounded-2xl text-center space-y-1 shadow-inner">
                      <div className="text-[11px] font-bold text-pink-300 uppercase tracking-wider">
                        {displayState.isDeposit ? 'ទឹកប្រាក់ត្រូវកក់ (Deposit)' : 'ទឹកប្រាក់ត្រូវទូទាត់ (Total Due)'}
                      </div>
                      <div className="text-2xl font-black font-mono text-white tracking-tight">
                        {(displayState.isDeposit && displayState.depositKhr
                          ? displayState.depositKhr
                          : displayState.totalKhr
                        ).toLocaleString()} ៛
                      </div>
                      <div className="text-xs font-mono font-bold text-pink-200/80">
                        ${(
                          (displayState.isDeposit && displayState.depositKhr
                            ? displayState.depositKhr
                            : displayState.totalKhr) / exchangeRate
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KHQR Code display if in checkout */}
              {displayState.status === 'checkout' && displayState.khqrDataUrl && (
                <div className="p-4 bg-white rounded-3xl shadow-xl border-2 border-red-500/50 flex flex-col items-center justify-center text-center space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="text-[10px] font-black tracking-widest text-red-600 uppercase flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>BAKONG KHQR ស្កេនបង់ប្រាក់</span>
                  </div>
                  <img
                    src={displayState.khqrDataUrl}
                    alt="KHQR Code"
                    className="w-40 h-40 object-contain rounded-xl border border-slate-200 shadow-xs"
                  />
                  <div className="text-[10px] font-medium text-slate-600">
                    ស្កេនជាមួយគ្រប់ធនាគារ (ABA, ACLEDA, Canadia, Bakong...)
                  </div>
                </div>
              )}

              {displayState.cashierName && (
                <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                  បម្រើដោយ: {displayState.cashierName}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
