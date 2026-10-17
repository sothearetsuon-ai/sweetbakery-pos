import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles, Plus, Check, ShoppingCart, AlertCircle, RotateCcw } from 'lucide-react';
import { Product } from '../../types';
import { parseKhmerVoiceCommand, VoicePosAction } from '../../services/khmerVoicePosService';
import { soundFx } from '../../utils/audio';

interface KhmerVoicePosModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Product, quantity: number) => void;
  onCheckout?: () => void;
  onClearCart?: () => void;
  exchangeRate?: number;
}

export const KhmerVoicePosModal: React.FC<KhmerVoicePosModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onCheckout,
  onClearCart,
  exchangeRate = 4100,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedActions, setDetectedActions] = useState<VoicePosAction[]>([]);
  const [statusText, setStatusText] = useState('ចុចលើ Microphone ដើម្បីចាប់ផ្តើមនិយាយ...');
  const [errorText, setErrorText] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      setTranscript('');
      setDetectedActions([]);
      setErrorText(null);
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorText('Browser នេះមិនទាន់គាំទ្រការទទួលសំឡេង Web Speech API ឡើយ។');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'km-KH';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText('🎙️ កំពុងស្តាប់សំឡេង... សូមនិយាយឈ្មោះទំនិញ ឬបញ្ជាលក់...');
        soundFx.playPop();
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
          const parsed = parseKhmerVoiceCommand(currentTranscript, products);
          setDetectedActions(parsed);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error === 'not-allowed') {
            setErrorText('សូមអនុញ្ញាតសិទ្ធិប្រើ Microphone ក្នុង Browser Settings។');
          } else if (event.error === 'no-speech') {
            setStatusText('មិនបានឮសំឡេងទេ សូមនិយាយម្តងទៀត...');
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorText('មិនអាចបើក Microphone បានទេ៖ ' + err.message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleApplyAction = (action: VoicePosAction) => {
    soundFx.playSuccess();
    if (action.type === 'ADD_PRODUCT' && action.product) {
      onAddProduct(action.product, action.quantity || 1);
    } else if (action.type === 'CHECKOUT' && onCheckout) {
      onCheckout();
      onClose();
    } else if (action.type === 'CLEAR_CART' && onClearCart) {
      onClearCart();
    }
  };

  const handleApplyAllAdded = () => {
    soundFx.playSuccess();
    let addedCount = 0;
    for (const act of detectedActions) {
      if (act.type === 'ADD_PRODUCT' && act.product) {
        onAddProduct(act.product, act.quantity || 1);
        addedCount++;
      } else if (act.type === 'CHECKOUT' && onCheckout) {
        onCheckout();
        onClose();
        return;
      }
    }

    if (addedCount > 0) {
      setTranscript('');
      setDetectedActions([]);
      setStatusText(`✅ បានបញ្ចូល ${addedCount} មុខទំនិញចូលកន្ត្រករួចរាល់!`);
    }
  };

  if (!isOpen) return null;

  const validProducts = detectedActions.filter((a) => a.type === 'ADD_PRODUCT' && a.product);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm sm:text-base tracking-tight leading-tight">
                  Khmer Voice POS Assistant
                </h3>
                <span className="px-2 py-0.5 bg-white/20 text-yellow-300 rounded-full text-[10px] font-black uppercase">
                  និយាយភាសាខ្មែរ
                </span>
              </div>
              <p className="text-[11px] text-pink-100 mt-0.5">
                និយាយឈ្មោះទំនិញ ឬពាក្យ "គិតលុយ" ដើម្បីលក់រហ័សទាន់ចិត្ត
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
          {/* Big Interactive Mic Button */}
          <div className="py-4 flex flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all cursor-pointer active:scale-90 ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white ring-8 ring-pink-400/30 animate-pulse'
                  : 'bg-slate-100 text-slate-500 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              {isListening ? <Mic className="w-9 h-9" /> : <MicOff className="w-9 h-9" />}
            </button>

            <div className="mt-3 font-bold text-xs text-slate-700">
              {statusText}
            </div>
          </div>

          {errorText && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Spoken Transcript Preview */}
          {transcript && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                សំឡេងដែលបានឮ (Transcript)៖
              </span>
              <p className="text-sm font-black text-slate-800 italic">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Recognized Actions / Products */}
          {validProducts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>ទំនិញដែលបានសម្គាល់ឃើញ ({validProducts.length})៖</span>
                </span>
                <button
                  type="button"
                  onClick={handleApplyAllAdded}
                  className="text-[11px] font-black text-pink-700 hover:text-pink-800 flex items-center gap-1 cursor-pointer bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-200"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>បញ្ចូលទាំងអស់</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {validProducts.map((act, idx) => {
                  const p = act.product!;
                  const priceKhr = p.priceKhr ?? Math.round(p.priceUsd * exchangeRate);
                  const totalItemKhr = priceKhr * (act.quantity || 1);

                  return (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-rose-100 rounded-2xl shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0 p-1 rounded-xl bg-pink-50">
                          {p.categoryId === 'cakes' || p.categoryId?.includes('cake') ? '🎂' : '🥖'}
                        </span>
                        <div className="min-w-0">
                          <h5 className="font-black text-xs text-slate-800 truncate">
                            {p.nameKh}
                          </h5>
                          <div className="text-[10px] text-pink-600 font-bold">
                            {priceKhr.toLocaleString()} ៛ x {act.quantity} = {totalItemKhr.toLocaleString()} ៛
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyAction(act)}
                        className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>បញ្ចូល</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Helpful Tips for Staff */}
          <div className="p-3 bg-pink-50/60 border border-pink-100 rounded-2xl text-xs space-y-1.5">
            <span className="font-bold text-pink-800 text-[11px] flex items-center gap-1">
              💡 គំរូពាក្យបញ្ជាដែលអ្នកអាចនិយាយ៖
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 font-medium">
              <div>• <i>"នំបុ័ងបារាំង ២ ដើម"</i></div>
              <div>• <i>"នំខេកសូកូឡា ១ ដុំ"</i></div>
              <div>• <i>"គិតលុយ" (បើកផ្ទាំងទូទាត់)</i></div>
              <div>• <i>"បញ្ចុះតម្លៃ 10 ភាគរយ"</i></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {validProducts.length > 0 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={handleApplyAllAdded}
              className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>✓ បញ្ចូលទាំងអស់ក្នុងកន្ត្រក ({validProducts.length} មុខ)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
