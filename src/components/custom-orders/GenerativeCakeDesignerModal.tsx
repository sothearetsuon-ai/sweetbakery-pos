import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Cake,
  Palette,
  Layers,
  DollarSign,
  Check,
  RotateCcw,
  Loader2,
  Wand2,
  Heart,
  Info,
  Calendar,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';
import { formatKhr } from '../../utils/currencyUtils';
import {
  generateCakeDesignWithAi,
  GeneratedCakeDesign,
} from '../../services/generativeCakeService';

interface GenerativeCakeDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeRate?: number;
  onApplyDesign: (design: GeneratedCakeDesign) => void;
}

const PRESET_THEMES = [
  { id: 'elsa', label: '🏰 ប្រាសាទព្រះនាង Elsa', theme: 'ប្រាសាទព្រះនាងទឹកកក Frozen', color: 'Blue', tiers: 2, occasion: 'ខួបកំណើត (Birthday)' },
  { id: 'car', label: '🏎️ ឡានប្រណាំង Ferrari', theme: 'ឡានប្រណាំង Ferrari កីឡា', color: 'Chocolate', tiers: 1, occasion: 'ខួបកំណើត (Birthday)' },
  { id: 'unicorn', label: '🦄 សេះវេទមន្ត Unicorn', theme: 'សេះវេទមន្ត Unicorn ឥន្ទធនូ', color: 'Pink', tiers: 2, occasion: 'ខួបកំណើត (Birthday)' },
  { id: 'rose', label: '🌹 ផ្កាកុលាបមាសប្រណីត', theme: 'ផ្កាកុលាបក្រហម & មាស 24K', color: 'Gold', tiers: 3, occasion: 'អាពាហ៍ពិពាហ៍ (Wedding)' },
  { id: 'teddy', label: '🧸 ខ្លាឃ្មុំ Teddy Bear', theme: 'ខ្លាឃ្មុំ Teddy Bear & ប៉េងប៉ោង', color: 'Pink', tiers: 1, occasion: 'ខួប ១ ខែ (Baby Shower)' },
  { id: 'chocolate', label: '🍫 Belgian Chocolate Drip', theme: 'សូកូឡាបែលហ្ស៊ិក Triple Drip', color: 'Chocolate', tiers: 2, occasion: 'ខួបកំណើត (Birthday)' },
  { id: 'strawberry', label: '🍓 នំស្ត្របឺរីជប៉ុនស្រស់', theme: 'ស្ត្របឺរីជប៉ុន & ក្រែមស្រស់ Chiffon', color: 'Pink', tiers: 1, occasion: 'ខួបកំណើត (Birthday)' },
  { id: 'galaxy', label: '🌌 ចក្រវាលផ្កាយ Galaxy', theme: 'ចក្រវាលផ្កាយ Galaxy Nebula', color: 'Purple', tiers: 2, occasion: 'ជប់លៀង (Party)' },
];

const COLOR_OPTIONS = [
  { id: 'pink', label: 'ពណ៌ផ្កាឈូក (Rose Pink)', bg: 'bg-rose-500' },
  { id: 'blue', label: 'ពណ៌ផ្ទៃមេឃ (Sky Blue)', bg: 'bg-sky-500' },
  { id: 'gold', label: 'ពណ៌មាសប្រណីត (Royal Gold)', bg: 'bg-amber-500' },
  { id: 'chocolate', label: 'ពណ៌សូកូឡា (Belgian Chocolate)', bg: 'bg-amber-900' },
  { id: 'mint', label: 'ពណ៌បៃតងខ្ចី (Emerald Mint)', bg: 'bg-emerald-500' },
  { id: 'purple', label: 'ពណ៌ស្វាយ (Lavender Purple)', bg: 'bg-purple-500' },
  { id: 'white', label: 'ពណ៌សគុជខ្យង (Pure Pearl White)', bg: 'bg-slate-300' },
];

export const GenerativeCakeDesignerModal: React.FC<GenerativeCakeDesignerModalProps> = ({
  isOpen,
  onClose,
  exchangeRate = 4100,
  onApplyDesign,
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('ប្រាសាទព្រះនាងទឹកកក Frozen');
  const [selectedOccasion, setSelectedOccasion] = useState('ខួបកំណើត (Birthday)');
  const [tiers, setTiers] = useState<number>(2);
  const [shape, setShape] = useState('មូល (Round)');
  const [colorScheme, setColorScheme] = useState('Pink');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<GeneratedCakeDesign | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (customPrompt?: string) => {
    const promptToUse = customPrompt !== undefined ? customPrompt : userPrompt;
    soundFx.playPop();
    setIsGenerating(true);

    try {
      const result = await generateCakeDesignWithAi({
        userPrompt: promptToUse || selectedTheme,
        theme: selectedTheme,
        occasion: selectedOccasion,
        tiers,
        shape,
        colorScheme,
        exchangeRate,
      });

      setGeneratedDesign(result);
      soundFx.playSuccess();
      confetti({ particleCount: 40, spread: 60 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_THEMES[0]) => {
    soundFx.playPop();
    setSelectedTheme(preset.theme);
    setColorScheme(preset.color);
    setTiers(preset.tiers);
    setSelectedOccasion(preset.occasion);
    setUserPrompt(preset.label);
    handleGenerate(preset.label);
  };

  const handleApply = () => {
    if (!generatedDesign) return;
    soundFx.playSuccess();
    confetti({ particleCount: 60, spread: 70 });
    onApplyDesign(generatedDesign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-rose-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight leading-tight">
                  Generative AI Cake Designer
                </h3>
                <span className="px-2 py-0.5 bg-yellow-400 text-purple-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-pink-100 mt-0.5">
                បង្កើតរូបភាពគំរូនំខេក 3D Photorealistic កម្រិតខ្ពស់ តាមការស្រមើស្រមៃរបស់អតិថិជន
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Quick Themes Preset Pills */}
            <div>
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-2">
                <Wand2 className="w-3.5 h-3.5 text-pink-600" />
                <span>រើសម៉ូដពេញនិយមរហ័ស (Popular AI Presets):</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
                {PRESET_THEMES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white hover:bg-pink-50 hover:text-pink-700 text-slate-700 border border-slate-200 hover:border-pink-300 transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Input */}
            <div>
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>ពិពណ៌នាម៉ូដនំតាមការស្រមើស្រមៃ (Custom Description):</span>
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="ឧទាហរណ៍៖ នំខេក ២ ជាន់ សម្រាប់កូនស្រី អាយុ ៥ ឆ្នាំ Theme ព្រះនាង Elsa ពណ៌ផ្ទៃមេឃ និងពណ៌ស មានផ្កាព្រិលទឹកកក និងទៀនភ្លោះ..."
                rows={3}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all resize-none outline-none bg-slate-50/50"
              />
            </div>

            {/* Cake Tiers & Shape */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ចំនួនជាន់នំ (Tiers):</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {[1, 2, 3].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setTiers(t);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        tiers === t
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t} ជាន់
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Cake className="w-3.5 h-3.5 text-pink-600" />
                  <span>ទ្រង់ទ្រាយនំ (Shape):</span>
                </label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                  className="w-full p-2 rounded-xl text-xs font-bold border border-slate-200 bg-white outline-none focus:border-pink-500"
                >
                  <option value="មូល (Round)">មូល (Round)</option>
                  <option value="ការ៉េ (Square)">ការ៉េ (Square)</option>
                  <option value="បេះដូង (Heart)">បេះដូង (Heart)</option>
                </select>
              </div>
            </div>

            {/* Dominant Color Palette */}
            <div>
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-2">
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                <span>ពណ៌ចម្បងដែលចង់បាន (Dominant Palette):</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setColorScheme(c.id);
                    }}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      colorScheme === c.id
                        ? 'border-pink-500 bg-pink-50/60 text-pink-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${c.bg} shrink-0`} />
                    <span className="truncate">{c.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Trigger Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerate()}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white rounded-2xl font-black text-sm shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50 mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                  <span>AI កំពុងគូរម៉ូដនំ & គណនាថ្លៃដើម...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-bounce" />
                  <span>✨ បង្កើតម៉ូដនំ AI (Generate Dream Cake)</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: AI Rendered Result Card */}
          <div className="lg:col-span-6 flex flex-col">
            {generatedDesign ? (
              <div className="bg-gradient-to-b from-rose-50/60 to-white rounded-3xl border border-rose-200/80 p-4 sm:p-5 flex flex-col gap-4 shadow-sm h-full">
                {/* Visual Image Preview */}
                <div className="relative rounded-2xl overflow-hidden aspect-square max-h-72 w-full bg-slate-900 shadow-inner group flex items-center justify-center">
                  <img
                    src={generatedDesign.renderedImage}
                    alt={generatedDesign.cakeNameKh}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-black flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>AI Photorealistic Render</span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-black shadow-xs">
                    {generatedDesign.tiers} ជាន់ • {generatedDesign.shape}
                  </div>
                </div>

                {/* Cake Info & Specs */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-slate-900 text-base leading-tight">
                        {generatedDesign.cakeNameKh}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {generatedDesign.cakeNameEn}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-rose-600">
                        ${generatedDesign.suggestedPriceUsd.toFixed(2)}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        {formatKhr(generatedDesign.suggestedPriceKhr)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-rose-100 flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">ទំហំ & ចំណុះ</span>
                      <span className="font-bold text-slate-700">{generatedDesign.estimatedSize}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-rose-100 flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">ប្រាក់កក់ 50%</span>
                      <span className="font-bold text-emerald-600">
                        {formatKhr(generatedDesign.suggestedDepositKhr)} (${(generatedDesign.suggestedPriceUsd * 0.5).toFixed(2)})
                      </span>
                    </div>
                  </div>

                  {/* Recommended Inscription */}
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs flex flex-col gap-0.5">
                    <span className="text-[10px] text-amber-800 font-black uppercase">✍️ អក្សរជូនពរលើនំដែល AI ណែនាំ៖</span>
                    <span className="font-bold text-amber-950 italic">
                      "{generatedDesign.recommendedInscription}"
                    </span>
                  </div>

                  {/* Chef Decorating Notes */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">👩‍🍳 កំណត់សម្គាល់មេចុងភៅដុតនំ៖</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {generatedDesign.bakingTechniqueNotesKh}
                    </p>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all mt-auto"
                >
                  <Check className="w-4 h-4" />
                  <span>✅ ប្រើប្រាស់ម៉ូដនេះលើការកុម្ម៉ង់ (Apply to Order)</span>
                </button>
              </div>
            ) : (
              <div className="h-full min-h-[360px] rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/20 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-rose-100 flex items-center justify-center text-2xl text-rose-500 mb-3 shadow-inner">
                  🎂
                </div>
                <h4 className="font-black text-slate-700 text-sm mb-1">
                  មិនទាន់បាន Generate ម៉ូដនំនៅឡើយទេ
                </h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  សូមជ្រើសរើស Preset ឬវាយពិពណ៌នាម៉ូដនំនៅខាងឆ្វេង រួចចុច "✨ បង្កើតម៉ូដនំ AI" ដើម្បីមើលរូបភាព 3D Render
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
