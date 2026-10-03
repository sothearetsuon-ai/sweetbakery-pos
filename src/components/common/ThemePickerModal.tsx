import React, { useState } from 'react';
import { X, Palette, Check, Sparkles, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_THEMES, AppTheme, ThemeCategory } from '../../utils/themeManager';
import { soundFx } from '../../utils/audio';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  isButterflyEnabled?: boolean;
  onToggleButterfly?: () => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  isButterflyEnabled,
  onToggleButterfly,
}) => {
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>('all');

  if (!isOpen) return null;

  const handlePick = (theme: AppTheme) => {
    if (theme.category === 'festival') {
      soundFx.playSuccess();
    } else {
      soundFx.playChime();
    }
    onSelectTheme(theme);
    try {
      confetti({
        particleCount: theme.category === 'festival' ? 55 : 30,
        spread: theme.category === 'festival' ? 70 : 50,
        origin: { y: 0.75 },
        colors: theme.confettiColors || ['#E6514D', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
      });
    } catch {}
  };

  const filteredThemes = APP_THEMES.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  const festivalCount = APP_THEMES.filter((t) => t.category === 'festival').length;
  const bakeryCount = APP_THEMES.filter((t) => t.category === 'bakery').length;
  const pastelCount = APP_THEMES.filter((t) => t.category === 'pastel').length;
  const darkCount = APP_THEMES.filter((t) => t.category === 'dark').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100/80 flex items-center justify-between bg-gradient-to-r from-pink-50/80 via-rose-50/50 to-amber-50/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base flex items-center gap-1.5 font-battambang">
                <span>🎨 រចនាប័ទ្មពណ៌ផ្ទៃខាងក្រោយ & រដូវកាលពិធីបុណ្យ</span>
                <span className="text-xs text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-full font-bold">
                  {APP_THEMES.length} ជម្រើស
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium font-battambang">
                ជ្រើសរើស Theme តាមរដូវកាលចូលឆ្នាំ បុណ្យភ្ជុំ ចូលឆ្នាំចិន ឬពណ៌ហាងនំបុ័ងដែលអ្នកពេញចិត្ត
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Categories Tabs */}
        <div className="px-5 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveCategory('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 font-battambang ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            ✨ ទាំងអស់ ({APP_THEMES.length})
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveCategory('festival');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 font-battambang ${
              activeCategory === 'festival'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-white shadow-xs'
                : 'bg-gradient-to-r from-amber-50 to-rose-50 text-rose-800 hover:from-amber-100 hover:to-rose-100 border border-rose-200'
            }`}
          >
            <PartyPopper className="w-3.5 h-3.5" />
            <span>🎉 រដូវកាលពិធីបុណ្យ ({festivalCount})</span>
            <span className="text-[10px] bg-white/20 text-current px-1.5 py-0.2 rounded-md font-black">HOT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveCategory('bakery');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 font-battambang ${
              activeCategory === 'bakery'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            🧁 បែបហាងនំ ({bakeryCount})
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveCategory('pastel');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 font-battambang ${
              activeCategory === 'pastel'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            🌸 ពណ៌ធម្មជាតិ ({pastelCount})
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveCategory('dark');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 font-battambang ${
              activeCategory === 'dark'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            🌙 Dark Mode ({darkCount})
          </button>
        </div>

        {/* Content: Theme Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredThemes.map((theme) => {
              const isSelected = currentTheme.id === theme.id;
              const isFestival = theme.category === 'festival';

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handlePick(theme)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'border-pink-500 ring-2 ring-pink-500/30 shadow-md scale-[1.01] bg-white'
                      : isFestival
                      ? 'border-amber-200/90 hover:border-amber-400 hover:shadow-sm bg-gradient-to-b from-amber-50/20 to-white hover:bg-white'
                      : 'border-slate-200/90 hover:border-pink-300 hover:shadow-sm bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  {/* Active Badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 bg-pink-600 text-white rounded-full p-1 shadow-xs animate-in zoom-in duration-150 z-10">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <div className="space-y-2 w-full">
                    {/* Color Swatch Preview Bar */}
                    <div
                      className={`h-14 w-full rounded-xl border shadow-inner flex items-center justify-center overflow-hidden relative ${theme.previewBg}`}
                      style={theme.bgStyle}
                    >
                      <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                        {theme.emoji}
                      </span>
                      {isSelected ? (
                        <span className="absolute bottom-1 right-1.5 text-[9px] font-black bg-black/60 backdrop-blur-md text-white px-1.5 py-0.2 rounded-md">
                          កំពុងប្រើ
                        </span>
                      ) : theme.seasonTagKh ? (
                        <span className="absolute bottom-1 right-1.5 text-[9px] font-black bg-amber-950/70 backdrop-blur-md text-amber-200 px-1.5 py-0.2 rounded-md">
                          {theme.seasonTagKh.split(' ')[0]}
                        </span>
                      ) : null}
                    </div>

                    {/* Theme Info */}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-slate-800 group-hover:text-pink-600 transition-colors font-battambang">
                          {theme.nameKh}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold line-clamp-1">
                        {theme.nameEn}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 font-battambang">
                      {theme.descriptionKh}
                    </p>
                  </div>

                  {/* Footer Tag */}
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border font-battambang ${theme.badgeClass}`}>
                      {theme.seasonTagKh || (theme.id === 'midnight-dark' ? 'Dark Mode' : theme.category === 'bakery' ? 'Bakery' : 'Pastel')}
                    </span>
                    <span className="text-[10px] font-black text-pink-600 group-hover:underline">
                      {isSelected ? '✓ បានជ្រើស' : 'ជ្រើសរើស →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-battambang">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>ពណ៌ផ្ទៃខាងក្រោយ & Theme រដូវកាល នឹងរក្សាទុកជាប់ជានិច្ចពេលបើកកម្មវិធីឡើងវិញ</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {onToggleButterfly && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onToggleButterfly();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer font-battambang ${
                  isButterflyEnabled
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="បើក/បិទ សត្វមេអំបៅហើរលើអេក្រង់"
              >
                <span>🦋</span>
                <span>មេអំបៅ៖ {isButterflyEnabled ? 'បើក (ON)' : 'បិទ (OFF)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer font-battambang"
            >
              រួចរាល់ (Done)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

