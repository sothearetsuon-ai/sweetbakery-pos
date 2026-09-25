import React from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_THEMES, AppTheme } from '../../utils/themeManager';
import { soundFx } from '../../utils/audio';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const handlePick = (theme: AppTheme) => {
    soundFx.playChime();
    onSelectTheme(theme);
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100/80 flex items-center justify-between bg-gradient-to-r from-pink-50/80 via-rose-50/50 to-amber-50/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-pink-600 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                <span>🎨 រចនាប័ទ្មពណ៌ផ្ទៃខាងក្រោយ</span>
                <span className="text-xs text-pink-600 bg-pink-100/70 px-2 py-0.5 rounded-full font-bold">
                  {APP_THEMES.length} ជម្រើស
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ជ្រើសរើសពណ៌ផ្ទៃខាងក្រោយ (Background Theme) តាមចំណង់ចំណូលចិត្តរបស់អ្នក
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

        {/* Content: Theme Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {APP_THEMES.map((theme) => {
              const isSelected = currentTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handlePick(theme)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'border-pink-500 ring-2 ring-pink-500/30 shadow-md scale-[1.02] bg-white'
                      : 'border-slate-200/90 hover:border-pink-300 hover:shadow-sm bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  {/* Active Badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 bg-pink-600 text-white rounded-full p-1 shadow-xs animate-in zoom-in duration-150">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <div className="space-y-2 w-full">
                    {/* Color Swatch Preview Bar */}
                    <div
                      className={`h-12 w-full rounded-xl border shadow-inner flex items-center justify-center overflow-hidden relative ${theme.previewBg}`}
                      style={theme.bgStyle}
                    >
                      <span className="text-2xl filter drop-shadow-xs">{theme.emoji}</span>
                      {isSelected && (
                        <span className="absolute bottom-1 right-1.5 text-[9px] font-black bg-black/60 backdrop-blur-md text-white px-1.5 py-0.2 rounded-md">
                          កំពុងប្រើ
                        </span>
                      )}
                    </div>

                    {/* Theme Info */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-slate-800 group-hover:text-pink-600 transition-colors">
                          {theme.nameKh}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold line-clamp-1">
                        {theme.nameEn}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {theme.descriptionKh}
                    </p>
                  </div>

                  {/* Footer Tag */}
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${theme.badgeClass}`}>
                      {theme.id === 'midnight-dark' ? 'Dark Mode' : 'Light Pastel'}
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
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>ពណ៌ផ្ទៃខាងក្រោយនឹងរក្សាទុកជាប់ជានិច្ចពេលបើកកម្មវិធីឡើងវិញ</span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            រួចរាល់ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
