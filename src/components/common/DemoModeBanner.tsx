import React, { useState, useEffect } from 'react';
import { FlaskConical, RotateCcw, Share2, Check, Lock, Sparkles, Users, Eye, EyeOff, Phone } from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
import { recordDemoVisitor, subscribeToDemoVisitorStats, DemoVisitorStats } from '../../services/firebase';
import { ContactModal } from './ContactModal';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, requestExitDemoMode, resetDemoData, hideDemoPrices, toggleHideDemoPrices } = useBakery();
  const [copied, setCopied] = useState(false);
  const [visitorStats, setVisitorStats] = useState<DemoVisitorStats>({
    totalVisits: 25,
    uniqueVisitors: 18,
  });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    if (!isDemoMode) return;
    recordDemoVisitor();
    const unsub = subscribeToDemoVisitorStats((stats) => {
      setVisitorStats(stats);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [isDemoMode]);

  if (!isDemoMode) return null;

  const handleShareDemo = () => {
    soundFx.playPop();
    const demoUrl = `${window.location.origin}${window.location.pathname}?demo=true`;
    navigator.clipboard.writeText(demoUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-700 text-white px-3 sm:px-6 py-2 shadow-md flex items-center justify-between flex-wrap gap-2 text-xs sticky top-0 z-50 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-white/25 rounded-lg animate-pulse">
          <FlaskConical className="w-4 h-4 text-amber-200" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-amber-200 uppercase tracking-wide flex items-center gap-1">
            <span>🧪 របៀបសាកល្បង (Demo Sandbox Mode)</span>
          </span>
          <span className="hidden xl:inline text-white/90 font-medium text-[11px] bg-black/20 px-2 py-0.5 rounded-full">
            ✨ រាល់ការលក់ & បញ្ចូលនំ មិនប៉ះពាល់ទិន្នន័យជាក់ស្តែងរបស់ហាងឡើយ!
          </span>

          {/* Live Demo Visitors Counter Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-black/30 hover:bg-black/40 border border-white/25 rounded-full text-[11px] font-bold shadow-xs select-none transition-all cursor-help"
            title={`📊 ស្ថិតិអ្នកចូលទស្សនា Demo ផ្ទាល់៖\n• អ្នកទស្សនាសរុប៖ ${visitorStats.totalVisits} លើក\n• ឧបករណ៍ប្លែកៗពីគ្នា៖ ${visitorStats.uniqueVisitors} នាក់\n(Live Real-Time Cloud Counter)`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Users className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span className="text-white/95">
              អ្នកទស្សនា៖ <strong className="text-amber-300 font-black">{visitorStats.totalVisits}</strong> នាក់
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Toggle Hide/Show Demo Prices */}
        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            toggleHideDemoPrices();
          }}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer text-[11px] font-black shadow-xs border ${
            hideDemoPrices
              ? 'bg-amber-400 text-amber-950 border-amber-300'
              : 'bg-white/20 hover:bg-white/30 text-white border-white/25'
          }`}
          title="ចុចដើម្បីបិទ ឬបង្ហាញតម្លៃនំទាំងអស់ក្នុងរបៀប Demo"
        >
          {hideDemoPrices ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-amber-950" />
              <span>បិទតម្លៃនំ 🙈</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-300" />
              <span>បង្ហាញតម្លៃ 👁️</span>
            </>
          )}
        </button>

        {/* Reset Demo Button */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យ Demo ឡើងវិញទៅទិន្នន័យដើមមែនទេ?')) {
              resetDemoData();
            }
          }}
          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer text-[11px] font-bold shadow-xs"
          title="កំណត់ទិន្នន័យគំរូឡើងវិញ (Reset)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>🔄 Reset Demo</span>
        </button>

        {/* Copy Demo Link Button */}
        <button
          type="button"
          onClick={handleShareDemo}
          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer text-[11px] font-bold shadow-xs"
          title="ចម្លង Link សាកល្បង (?demo=true) សម្រាប់ផ្ញើឱ្យអ្នកដទៃ"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'បានចម្លង!' : '🔗 ចម្លង Link Demo'}</span>
        </button>

        {/* Exit to Live Store Button (Passcode Protected) */}
        <button
          type="button"
          onClick={requestExitDemoMode}
          className="px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-black text-xs shadow-md border border-rose-100"
          title="តម្រូវឱ្យបញ្ចូលលេខសម្ងាត់សិទ្ធិប្រើប្រាស់ដើម្បីចូលហាងពិត"
        >
          <Lock className="w-3.5 h-3.5 text-rose-600" />
          <span>ចូលហាងពិត 🔐</span>
        </button>

        {/* Contact System Button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playPop();
            setIsContactModalOpen(true);
          }}
          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer text-[11px] font-black shadow-xs border border-emerald-300/40"
          title="ប្រសិនបើអ្នកមានចំណាប់អារម្មណ៍ចង់ប្រើប្រាស់កម្មវិធីនេះសូមទាក់ទង លេខទូរសព្ទ័៖ 012 629 160"
        >
          <Phone className="w-3.5 h-3.5 text-white" />
          <span>📞 Contact</span>
        </button>
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};
