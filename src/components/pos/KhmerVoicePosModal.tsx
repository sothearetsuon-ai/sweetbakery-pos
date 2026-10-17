import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Plus,
  Check,
  ShoppingCart,
  AlertCircle,
  RotateCcw,
  Send,
  HelpCircle,
  CreditCard,
  Trash2,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
  const [manualInput, setManualInput] = useState('');
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
      setManualInput('');
      setDetectedActions([]);
      setErrorText(null);
      setStatusText('ចុចលើ Microphone ដើម្បីចាប់ផ្តើមនិយាយ...');
    }
  }, [isOpen]);

  const processSpokenText = (text: string) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    setTranscript(cleanText);
    setErrorText(null);

    const parsed = parseKhmerVoiceCommand(cleanText, products);
    setDetectedActions(parsed);

    const hasValidProduct = parsed.some((a) => a.type === 'ADD_PRODUCT' && a.product);
    const hasCheckout = parsed.some((a) => a.type === 'CHECKOUT');
    const hasClear = parsed.some((a) => a.type === 'CLEAR_CART');

    if (hasValidProduct) {
      soundFx.playSuccess();
      setStatusText(`✅ បានសម្គាល់ឃើញទំនិញពីសំឡេង៖ "${cleanText}"`);
    } else if (hasCheckout) {
      soundFx.playSuccess();
      setStatusText('💰 បញ្ជាបើកផ្ទាំងគិតលុយ (Checkout)...');
    } else if (hasClear) {
      soundFx.playPop();
      setStatusText('🗑️ បញ្ជាសម្អាតកន្ត្រក...');
    } else {
      setStatusText(`បានឮ៖ "${cleanText}" (សូមចុចជ្រើសរើស ឬនិយាយឈ្មោះឱ្យកាន់តែច្បាស់)`);
    }
  };

  const startListening = async () => {
    setErrorText(null);

    // 1. Android Native App Speech Bridge
    if (typeof (window as any).SweetBakeryNative?.startSpeechRecognition === 'function') {
      try {
        setIsListening(true);
        setStatusText('🎙️ កំពុងស្តាប់តាម Android Google Voice Typing... សូមនិយាយ');
        soundFx.playPop();

        (window as any).__onSweetBakerySpeechResult = (text: string) => {
          setIsListening(false);
          if (text && text.trim()) {
            processSpokenText(text);
          } else {
            setStatusText('មិនបានទទួលសំឡេងទេ សូមចុចលើ Mic ដើម្បីនិយាយម្តងទៀត');
          }
        };

        (window as any).__onSweetBakerySpeechError = (err: string) => {
          setIsListening(false);
          if (err === 'cancelled') {
            setStatusText('បានបោះបង់ការនិយាយ។ ចុចលើ Mic ដើម្បីនិយាយម្តងទៀត');
          } else {
            setStatusText('មិនបានឮសំឡេងទេ សូមសាកល្បងនិយាយម្តងទៀត ឬចុចលើពាក្យគំរូខាងក្រោម 👇');
          }
        };

        (window as any).SweetBakeryNative.startSpeechRecognition();
        return;
      } catch (err: any) {
        console.warn('Android native speech bridge exception:', err);
      }
    }

    // 2. Web Speech API (Chrome / Edge / Safari / Desktop)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorText('ឧបករណ៍ ឬ Browser នេះមិនទាន់គាំទ្រ Web Speech API ឡើយ។ អ្នកអាចប្រើប្រាស់ប៊ូតុងគំរូរហ័ស ឬវាយអក្សរខាងក្រោមបានយ៉ាងងាយស្រួល!');
      setIsListening(false);
      setStatusText('សូមចុចលើប៊ូតុងបញ្ជាគំរូខាងក្រោម 👇');
      return;
    }

    // Pre-flight Microphone Permission Check via getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.warn('Microphone permission request result:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorText('សូមអនុញ្ញាតសិទ្ធិប្រើ Microphone (Allow Microphone) នៅក្នុងការកំណត់ Browser/App។');
          setIsListening(false);
          setStatusText('មិនអាចប្រើ Mic បានដោយសារគ្មានសិទ្ធិ (Microphone Permission Denied)');
          return;
        }
      }
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
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
          processSpokenText(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error === 'not-allowed') {
            setErrorText('សូមអនុញ្ញាតសិទ្ធិប្រើ Microphone ក្នុង Browser Settings។');
          } else if (event.error === 'no-speech') {
            setStatusText('មិនបានឮសំឡេងទេ សូមនិយាយម្តងទៀត ឬចុចលើពាក្យគំរូខាងក្រោម 👇');
          } else {
            setStatusText('ការស្តាប់ត្រូវបានផ្អាក។ ចុចលើ Mic ដើម្បីនិយាយម្តងទៀត');
          }
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Only reset status text if not currently showing recognized result
        setStatusText((prev) => {
          if (prev.startsWith('✅') || prev.startsWith('💰') || prev.startsWith('🗑️')) {
            return prev;
          }
          return 'បានបញ្ចប់ការស្តាប់។ ចុចលើ Microphone ម្តងទៀតដើម្បីនិយាយ ឬចុចលើពាក្យគំរូខាងក្រោម 👇';
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Cannot start recognition:', err);
      setErrorText('មិនអាចបើក Microphone បានទេ៖ ' + (err.message || 'Error'));
      setIsListening(false);
      setStatusText('សូមចុចលើពាក្យបញ្ជាគំរូខាងក្រោម 👇');
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
      } else if (act.type === 'CLEAR_CART' && onClearCart) {
        onClearCart();
      }
    }

    if (addedCount > 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      setTranscript('');
      setDetectedActions([]);
      setStatusText(`✅ បានបញ្ចូល ${addedCount} មុខទំនិញចូលកន្ត្រករួចរាល់!`);
    }
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualInput.trim()) return;
    processSpokenText(manualInput);
    setManualInput('');
  };

  if (!isOpen) return null;

  const validProducts = detectedActions.filter((a) => a.type === 'ADD_PRODUCT' && a.product);
  const checkoutAction = detectedActions.find((a) => a.type === 'CHECKOUT');
  const clearCartAction = detectedActions.find((a) => a.type === 'CLEAR_CART');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 flex flex-col max-h-[90vh]">
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
          <div className="py-2 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isListening) stopListening();
                  else startListening();
                }}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all cursor-pointer active:scale-90 ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white ring-8 ring-pink-400/40 animate-pulse scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600 border border-slate-200'
                }`}
                title={isListening ? 'ចុចដើម្បីផ្អាកការស្តាប់' : 'ចុចដើម្បីចាប់ផ្តើមនិយាយ'}
              >
                {isListening ? (
                  <Mic className="w-9 h-9 animate-bounce" />
                ) : (
                  <MicOff className="w-9 h-9" />
                )}
              </button>

              {isListening && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
                </span>
              )}
            </div>

            <div className="mt-3 font-bold text-xs text-slate-700 max-w-sm">
              {statusText}
            </div>
          </div>

          {/* Quick Interactive Command Suggestion Chips (1-Click Test / Fallback) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ចុចលើពាក្យគំរូដើម្បីបញ្ជាលក់ភ្លាមៗ (Quick Test Chips)៖</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => processSpokenText('នំបុ័ងបារាំង ២ ដើម')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                🥖 នំបុ័ងបារាំង ២ដើម
              </button>
              <button
                type="button"
                onClick={() => processSpokenText('នំខេកសូកូឡា ១ ដុំ')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                🎂 នំខេកសូកូឡា ១ដុំ
              </button>
              <button
                type="button"
                onClick={() => processSpokenText('នំខេកស្ត្រប៊ឺរី ៣ ដុំ')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                🍰 នំខេកស្ត្រប៊ឺរី ៣ដុំ
              </button>
              <button
                type="button"
                onClick={() => processSpokenText('គិតលុយ')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                💰 គិតលុយ
              </button>
              <button
                type="button"
                onClick={() => processSpokenText('បញ្ចុះតម្លៃ 10 ភាគរយ')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                🏷️ បញ្ចុះតម្លៃ 10%
              </button>
              <button
                type="button"
                onClick={() => processSpokenText('លុបចោល')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                🗑️ សម្អាតកន្ត្រក
              </button>
            </div>
          </div>

          {/* Manual Khmer Voice Command Text Bar */}
          <form onSubmit={handleManualSubmit} className="flex gap-1.5">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="វាយពាក្យបញ្ជា ឧ. នំបុ័ងបារាំង ២ដើម ឬ គិតលុយ..."
              className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="px-3 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>បញ្ជា</span>
            </button>
          </form>

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

          {/* Checkout Shortcut Triggered */}
          {checkoutAction && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>បានសម្គាល់ឃើញពាក្យបញ្ជា «គិតលុយ»</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onCheckout?.();
                  onClose();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs active:scale-95"
              >
                បើកផ្ទាំងទូទាត់ភ្លាមៗ
              </button>
            </div>
          )}

          {/* Clear Cart Triggered */}
          {clearCartAction && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                <Trash2 className="w-4 h-4 text-amber-600" />
                <span>បានសម្គាល់ឃើញពាក្យបញ្ជា «សម្អាតកន្ត្រក»</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClearCart?.();
                  soundFx.playPop();
                  setTranscript('');
                  setDetectedActions([]);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs active:scale-95"
              >
                សម្អាតកន្ត្រក
              </button>
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
