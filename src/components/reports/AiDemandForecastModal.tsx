import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Send,
  ChefHat,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useBakery } from '../../context/BakeryContext';
import { generateBakingDemandForecast, DemandForecastResult } from '../../services/aiDemandForecastService';
import { soundFx } from '../../utils/audio';
import { sendTelegramOrderNotification } from '../../services/telegram';

interface AiDemandForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiDemandForecastModal: React.FC<AiDemandForecastModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { sales, customOrders, products, exchangeRate } = useBakery();
  const [forecast, setForecast] = useState<DemandForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadForecast();
    }
  }, [isOpen]);

  const loadForecast = async () => {
    setIsLoading(true);
    try {
      const res = await generateBakingDemandForecast(sales, customOrders, products, undefined, exchangeRate);
      setForecast(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToTelegram = async () => {
    if (!forecast) return;
    soundFx.playSuccess();
    setIsDispatched(true);

    const planItems = forecast.bakingPlan
      .map((p) => `• **${p.nameKh}៖** ${p.recommendedQty} ${p.unit} _(${p.reasonKh})_`)
      .join('\n');

    const ingrItems = forecast.keyIngredientsNeeded
      .map((i) => `• ${i.name}៖ ~${i.estimatedAmount}`)
      .join('\n');

    const msg = `📊 **ផែនការដុតនំឆ្លាតវៃប្រចាំថ្ងៃ (AI Baking Forecast)**\n` +
      `📅 **កាលបរិច្ឆេទ៖** ${forecast.dayOfWeekKh} (${forecast.forecastDate})\n\n` +
      `🥖 **ចំនួននំដែលត្រូវដុតណែនាំ៖**\n${planItems}\n\n` +
      `🥣 **គ្រឿងផ្សំសំខាន់ត្រូវត្រៀម៖**\n${ingrItems}\n\n` +
      `💡 **គន្លឹះកាត់បន្ថយការសល់ខូច៖**\n${forecast.wasteReductionTipKh}`;

    try {
      await sendTelegramOrderNotification(msg);
    } catch (e) {}
    setTimeout(() => setIsDispatched(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-amber-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">
              📊
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm sm:text-base tracking-tight leading-tight">
                  AI Baking Forecast & Smart Inventory
                </h3>
                <span className="px-2 py-0.5 bg-white/20 text-yellow-300 rounded-full text-[10px] font-black uppercase">
                  Demand Prediction
                </span>
              </div>
              <p className="text-[11px] text-amber-100 mt-0.5">
                ព្យាករណ៍តម្រូវការដុតនំប្រចាំថ្ងៃ និងគ្រឿងផ្សំត្រូវប្រើ ការពារការសល់នំខូចគុណភាព
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

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl animate-spin [animation-duration:6s]">
                🥐
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-800">
                  AI កំពុងវិភាគទិន្នន័យលក់ និងការកុម្ម៉ង់...
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  គណនាចំនួននំដែលត្រូវដុត និងតម្រូវការគ្រឿងផ្សំ...
                </p>
              </div>
            </div>
          )}

          {forecast && !isLoading && (
            <div className="space-y-4 animate-in fade-in">
              {/* Target Date Banner */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50/80 to-rose-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-amber-800 uppercase">
                    ផែនការដុតនំសម្រាប់
                  </span>
                  <h4 className="font-black text-sm text-slate-800">
                    {forecast.dayOfWeekKh} ({forecast.forecastDate})
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    ចំណូលរំពឹងទុក
                  </span>
                  <span className="text-sm font-black text-amber-700">
                    {forecast.projectedRevenueKhr.toLocaleString()} ៛
                  </span>
                </div>
              </div>

              {/* Summary Note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
                {forecast.summaryKh}
              </div>

              {/* Baking Plan Items */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  <span>ចំនួននំដែលត្រូវដុត (Baking Schedule)៖</span>
                </span>

                <div className="space-y-1.5">
                  {forecast.bakingPlan.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-amber-300 transition-all"
                    >
                      <div>
                        <h5 className="font-black text-xs text-slate-900">
                          {item.nameKh}
                        </h5>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.reasonKh}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-xl border border-amber-200">
                          {item.recommendedQty} {item.unit}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          មធ្យមភាគ៖ {item.historicalDailyAvg} {item.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredients Checklist */}
              {forecast.keyIngredientsNeeded.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>គ្រឿងផ្សំសំខាន់ត្រូវត្រៀមទុក៖</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {forecast.keyIngredientsNeeded.map((ingr, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-2xl"
                      >
                        <div className="text-[11px] font-black text-purple-900">
                          {ingr.name}
                        </div>
                        <div className="text-[10px] text-purple-600 font-bold mt-0.5">
                          ~ {ingr.estimatedAmount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Waste reduction advice */}
              {forecast.wasteReductionTipKh && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-0.5">
                  <div className="font-black text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>គន្លឹះកាត់បន្ថយការសល់នំខូចគុណភាព៖</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {forecast.wasteReductionTipKh}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {forecast && !isLoading && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={handleSendToTelegram}
              disabled={isDispatched}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {isDispatched ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{isDispatched ? 'បានផ្ញើរួច' : 'ផ្ញើផែនការដុតនំចូល Telegram'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
