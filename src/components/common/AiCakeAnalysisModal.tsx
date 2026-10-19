import React from 'react';
import { Sparkles, X, Check, DollarSign, Palette, Cake, MessageSquare, ChefHat, AlertCircle } from 'lucide-react';
import { AiCakeAnalysisResult } from '../../services/aiCakeVisionService';
import { soundFx } from '../../utils/audio';

interface AiCakeAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AiCakeAnalysisResult | null;
  isLoading: boolean;
  error?: string | null;
  onApplyAll: (result: AiCakeAnalysisResult) => void;
  onApplyPriceOnly?: (khr: number, size: string) => void;
  onApplyInscriptionOnly?: (text: string) => void;
}

export const AiCakeAnalysisModal: React.FC<AiCakeAnalysisModalProps> = ({
  isOpen,
  onClose,
  result,
  isLoading,
  error,
  onApplyAll,
  onApplyPriceOnly,
  onApplyInscriptionOnly,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-pink-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm sm:text-base tracking-tight leading-tight">
                  AI វិភាគម៉ូដនំ & ប៉ាន់ស្មានតម្លៃ
                </h3>
                <span className="px-2 py-0.5 bg-white/20 text-yellow-300 rounded-full text-[10px] font-black uppercase">
                  Gemini Vision
                </span>
              </div>
              <p className="text-[11px] text-pink-100 mt-0.5">
                ឆ្លាតវៃសម្គាល់ម៉ូដ គណនាថ្លៃដើម និងតម្លៃសមស្របដោយស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-pink-50 border-2 border-pink-200 flex items-center justify-center text-3xl animate-bounce">
                  🎂
                </div>
                <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-spin [animation-duration:3s]" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-800">
                  AI កំពុងវិភាគរូបភាពនំ...
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  កំពុងសម្គាល់កម្រិតតុបតែង និងប៉ាន់ស្មានតម្លៃសមរម្យ...
                </p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold">ការវិភាគមិនជោគជ័យ</div>
                <div className="text-rose-600">{error}</div>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Identified Cake Card */}
              <div className="p-3.5 bg-gradient-to-r from-pink-50/70 to-purple-50/70 border border-pink-200/80 rounded-2xl flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="px-2.5 py-0.5 bg-pink-200/80 text-pink-800 rounded-full text-[10px] font-black uppercase inline-block">
                    {result.styleCategoryKh}
                  </span>
                  <h4 className="font-black text-sm text-slate-900 leading-snug">
                    {result.cakeNameKh}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {result.cakeNameEn}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold block">កម្រិតតុបតែង</span>
                  <span className="text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {result.difficultyKh}
                  </span>
                </div>
              </div>

              {/* Price & Size Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-white border border-pink-100 rounded-2xl shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-pink-500" />
                    <span>តម្លៃប៉ាន់ស្មានសមរម្យ</span>
                  </div>
                  <div className="text-base font-black text-pink-700">
                    {result.suggestedPriceKhr.toLocaleString()} ៛
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    ${result.suggestedPriceUsd.toFixed(2)} USD
                  </div>
                </div>

                <div className="p-3 bg-white border border-pink-100 rounded-2xl shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Cake className="w-3.5 h-3.5 text-pink-500" />
                    <span>ទំហំសមស្របណែនាំ</span>
                  </div>
                  <div className="text-xs font-black text-slate-800 line-clamp-1">
                    {result.estimatedSize}
                  </div>
                  <div className="text-[10px] text-purple-600 font-bold">
                    {result.occasionKh}
                  </div>
                </div>
              </div>

              {/* Colors & Flavors */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                  <Palette className="w-3.5 h-3.5 text-pink-500" />
                  <span>ពណ៌ចម្បង៖</span>
                  <span className="text-slate-800 font-medium">
                    {result.primaryColors.join(', ')}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                  <ChefHat className="w-3.5 h-3.5 text-purple-500" />
                  <span>រសជាតិដែលត្រូវគ្នាបើក៖</span>
                  <span className="text-purple-800 font-bold">
                    {result.recommendedFlavors.join(', ')}
                  </span>
                </div>
              </div>

              {/* Inscription suggestions */}
              {result.recommendedInscriptions && result.recommendedInscriptions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>គំនិតពាក្យជូនពរស័ក្តិសមជាមួយនំនេះ៖</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {result.recommendedInscriptions.map((txt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          soundFx.playSuccess();
                          if (onApplyInscriptionOnly) onApplyInscriptionOnly(txt);
                        }}
                        className="text-left text-xs p-2 bg-pink-50/50 hover:bg-pink-100/70 border border-pink-200/70 rounded-xl font-bold text-pink-900 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                      >
                        <span>"{txt}"</span>
                        <span className="text-[10px] text-pink-600 font-black group-hover:underline">
                          ដាក់ពាក្យនេះ →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Baker's Notes */}
              {result.bakingNotes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-0.5">
                  <div className="font-black text-[11px] flex items-center gap-1">
                    <span>💡 ចំណាំសម្រាប់ការធ្វើនំ៖</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    {result.bakingNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {result && !isLoading && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playSuccess();
                onApplyAll(result);
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-2xl text-xs font-black shadow-md shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>✓ យល់ព្រមយកការកំណត់ទាំងអស់ (Apply All)</span>
            </button>

            {onApplyPriceOnly && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onApplyPriceOnly(result.suggestedPriceKhr, result.estimatedSize);
                  onClose();
                }}
                className="py-2.5 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                យកតែតម្លៃ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
