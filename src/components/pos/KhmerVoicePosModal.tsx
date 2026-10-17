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
  CreditCard,
  Trash2,
  Tag,
  Loader2,
  Keyboard,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../../types';
import { parseKhmerVoiceCommand, VoicePosAction } from '../../services/khmerVoicePosService';
import { soundFx } from '../../utils/audio';
import { getGeminiApiKey, getGeminiApiKeyAsync } from '../../services/geminiInvoiceService';

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
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [detectedActions, setDetectedActions] = useState<VoicePosAction[]>([]);
  const [statusText, setStatusText] = useState('ចុចលើ Microphone ដើម្បីចាប់ផ្តើមនិយាយ...');
  const [errorText, setErrorText] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFallingBackRef = useRef(false);

  const isWindows = typeof navigator !== 'undefined' && /windows|win32/i.test(navigator.userAgent);
  const isDesktop = typeof window !== 'undefined' && Boolean(
    (window as any).SweetBakeryDesktop?.isDesktop ||
    navigator.userAgent.includes('Electron') ||
    navigator.userAgent.includes('SweetBakery-POS')
  );
  const isWindowsEnvironment = isDesktop || isWindows;

  useEffect(() => {
    if (isOpen) {
      setErrorText(null);
      setTranscript('');
      setManualInput('');
      setDetectedActions([]);
      setIsAiProcessing(false);
      setRecordingSeconds(0);
      isFallingBackRef.current = false;

      // On Android native app, automatically start speech
      if (typeof (window as any).SweetBakeryNative?.startSpeechRecognition === 'function') {
        startListening();
      } else if (isWindowsEnvironment) {
        setStatusText('ចុចលើ Microphone ដើម្បីថតសំឡេងបញ្ជា ឬប្រើ Windows Voice Typing (Win + H)');
      } else {
        setStatusText('ចុចលើ Microphone ដើម្បីចាប់ផ្តើមនិយាយ ឬចុចលើពាក្យគំរូខាងក្រោម 👇');
      }
    } else {
      stopListening();
    }
  }, [isOpen]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

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

  // Start audio recording via MediaRecorder (for Windows Electron & Web fallback)
  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (audioBlob.size > 2000) {
          await transcribeWithGemini(audioBlob, mimeType);
        } else {
          setIsListening(false);
          setIsAiProcessing(false);
          setStatusText('មិនបានទទួលសំឡេងទេ សូមចុចលើ Mic ម្តងទៀតដើម្បីនិយាយ');
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);

      setIsListening(true);
      setErrorText(null);
      setRecordingSeconds(0);
      setStatusText('🎙️ កំពុងថតសំឡេង... សូមនិយាយ (រួចចុចលើ Mic ម្តងទៀតដើម្បីផ្ញើ)');
      soundFx.playPop();

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 6) {
            stopMediaRecording();
            return 6;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('MediaRecorder error:', err);
      setIsListening(false);
      setErrorText('មិនអាចបើក Microphone បានទេ៖ ' + (err.message || 'Permission denied'));
    }
  };

  const stopMediaRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Transcribe recorded audio with Gemini AI (supports multi-model fallback to eliminate 404s)
  const transcribeWithGemini = async (audioBlob: Blob, mimeType: string) => {
    setIsAiProcessing(true);
    setStatusText('✨ AI កំពុងស្ដាប់ និងបកប្រែសំឡេងខ្មែរ (Gemini AI Speech)...');

    let apiKey = getGeminiApiKey();
    if (!apiKey) {
      apiKey = await getGeminiApiKeyAsync();
    }

    if (!apiKey) {
      setIsAiProcessing(false);
      setErrorText('💡 លើ Windows៖ ដើម្បីឱ្យ AI ស្ដាប់សំឡេង សូមបញ្ចូល Gemini API Key ក្នុង Settings។ ឬប្រើ Windows Voice Typing (Win + H) និយាយផ្ទាល់បានភ្លាមៗ!');
      setStatusText('👉 សូមចុច ⊞ Windows + H លើ Keyboard រួចនិយាយ ឬចុចលើពាក្យគំរូខាងក្រោម 👇');
      inputRef.current?.focus();
      return;
    }

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1] || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Strip extra parameters like ';codecs=opus' so Gemini gets a pure mimeType
      const cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim();

      // Gather candidate models in order of speed, quota stability, and 2026 availability
      let cachedModels: string[] = [];
      try {
        const cachedStr = localStorage.getItem('sweetbakery_usable_models');
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedModels = parsed;
          }
        }
      } catch {}

      const activeModel = localStorage.getItem('sweetbakery_gemini_active_model');
      const defaultCandidates = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash-8b',
      ];

      const candidateModels = Array.from(
        new Set([
          ...(activeModel ? [activeModel] : []),
          ...cachedModels,
          ...defaultCandidates,
        ])
      ).filter(Boolean);

      let transcribedText = '';
      let lastErrorMsg = '';

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey.trim(),
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: 'Listen to the Khmer speech in this audio clip. Transcribe it into Khmer text accurately (e.g., product names and numbers, or checkout commands like "គិតលុយ"). Return ONLY the recognized Khmer text. Do not add markdown or quotes.',
                    },
                    {
                      inlineData: {
                        mimeType: cleanMimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
            }),
          });

          if (response.ok) {
            const resData = await response.json();
            transcribedText = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            try {
              localStorage.setItem('sweetbakery_gemini_active_model', model);
            } catch {}
            break; // Success!
          }

          const errorData = await response.json().catch(() => ({}));
          const rawMsg = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;

          if (
            response.status === 404 ||
            response.status === 429 ||
            response.status === 503 ||
            rawMsg.toLowerCase().includes('not found') ||
            rawMsg.toLowerCase().includes('quota') ||
            rawMsg.toLowerCase().includes('rate limit')
          ) {
            console.warn(`Model ${model} returned ${response.status} (${rawMsg}), trying next fallback model...`);
            lastErrorMsg = rawMsg;
            continue;
          }

          if (
            rawMsg.toLowerCase().includes('api key not valid') ||
            rawMsg.toLowerCase().includes('invalid authentication')
          ) {
            lastErrorMsg = 'Google API Key មិនត្រឹមត្រូវ សូមពិនិត្យមើលក្នុង Settings';
            break;
          }

          lastErrorMsg = rawMsg;
        } catch (callErr: any) {
          console.warn(`Error connecting to Gemini model ${model}:`, callErr);
          lastErrorMsg = callErr.message || 'Network error';
        }
      }

      setIsAiProcessing(false);

      if (transcribedText) {
        processSpokenText(transcribedText);
      } else if (lastErrorMsg) {
        let userFriendly = lastErrorMsg;
        if (lastErrorMsg.includes('404') || lastErrorMsg.toLowerCase().includes('not found')) {
          userFriendly = 'Google Gemini ឆ្លើយតប (404)៖ សូមពិនិត្យមើល API Key ក្នុង Settings ឬប្រើ Windows Voice Typing (Win + H) ជំនួសវិញ';
        } else if (lastErrorMsg.toLowerCase().includes('quota')) {
          userFriendly = 'Quota ការប្រើប្រាស់ Gemini ពេញហើយ (Quota Exceeded)។ សូមរង់ចាំបន្តិច ឬប្រើ Windows Voice Typing (Win + H)';
        }
        setErrorText('មិនអាចបកប្រែសំឡេងបានទេ៖ ' + userFriendly);
        setStatusText('សូមសាកល្បងនិយាយម្តងទៀត ឬចុចលើពាក្យគំរូខាងក្រោម 👇');
      } else {
        setStatusText('មិនបានឮសំឡេងច្បាស់លាស់ទេ សូមសាកល្បងនិយាយម្តងទៀត');
      }
    } catch (err: any) {
      console.warn('Gemini audio transcription failed:', err);
      setIsAiProcessing(false);
      setErrorText('មិនអាចបកប្រែសំឡេងបានទេ៖ ' + (err.message || 'Error'));
      setStatusText('សូមចុចលើប៊ូតុងបញ្ជាគំរូខាងក្រោម 👇');
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

    // 2. Windows Desktop Electron: Always use MediaRecorder + Gemini AI (because Chromium disables Web Speech in Electron)
    if (isDesktop) {
      await startMediaRecording();
      return;
    }

    // 3. Web Speech API (Chrome / Edge / Safari on Web)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback to MediaRecorder + Gemini AI
      await startMediaRecording();
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
          if (event.error === 'network') {
            // Chromium Web Speech API network error -> Auto fallback to MediaRecorder + Gemini AI!
            isFallingBackRef.current = true;
            startMediaRecording();
            return;
          } else if (event.error === 'not-allowed') {
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
        if (isFallingBackRef.current) {
          isFallingBackRef.current = false;
          return;
        }
        setIsListening(false);
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
      console.warn('Cannot start recognition, falling back to MediaRecorder:', err);
      startMediaRecording();
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      stopMediaRecording();
    }
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

  const handleActivateWindowsVoiceTyping = () => {
    soundFx.playPop();
    inputRef.current?.focus();
    setStatusText('👉 សូមចុចគ្រាប់ចុច ⊞ Windows + H លើ Keyboard រួចនិយាយភាសាខ្មែរ!');
  };

  if (!isOpen) return null;

  const validProducts = detectedActions.filter((a) => a.type === 'ADD_PRODUCT' && a.product);
  const checkoutAction = detectedActions.find((a) => a.type === 'CHECKOUT');
  const clearCartAction = detectedActions.find((a) => a.type === 'CLEAR_CART');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 flex flex-col max-h-[92vh]">
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
                  {isWindowsEnvironment ? 'Windows Voice' : 'និយាយភាសាខ្មែរ'}
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
                    : 'bg-slate-100 text-slate-700 hover:bg-pink-50 hover:text-pink-600 border border-slate-200'
                }`}
                title={isListening ? 'ចុចដើម្បីផ្អាកការស្តាប់' : 'ចុចដើម្បីចាប់ផ្តើមនិយាយ'}
              >
                {isAiProcessing ? (
                  <Loader2 className="w-9 h-9 animate-spin text-pink-600" />
                ) : isListening ? (
                  <Mic className="w-9 h-9 animate-bounce text-white" />
                ) : (
                  <Mic className="w-9 h-9 text-pink-600" />
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
              {isListening && recordingSeconds > 0 && (
                <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-mono font-bold mr-1.5 animate-pulse">
                  REC 00:0{recordingSeconds}
                </span>
              )}
              {statusText}
            </div>
          </div>

          {/* Windows Voice Typing (Win + H) Helper Bar */}
          {isWindowsEnvironment && (
            <div className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-blue-900 font-bold min-w-0">
                <Keyboard className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">🗣️ និយាយផ្ទាល់លើ Windows៖</span>
              </div>
              <button
                type="button"
                onClick={handleActivateWindowsVoiceTyping}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold shrink-0 shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>ចុច ⊞ Win + H</span>
              </button>
            </div>
          )}

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
              ref={inputRef}
              type="text"
              value={manualInput}
              onChange={(e) => {
                const val = e.target.value;
                setManualInput(val);
                if (val.trim()) {
                  const parsed = parseKhmerVoiceCommand(val.trim(), products);
                  if (parsed.length > 0) {
                    setDetectedActions(parsed);
                  }
                }
              }}
              placeholder="វាយ ឬនិយាយតាម Win + H (ឧ. នំបុ័ងបារាំង ២ដើម ឬ គិតលុយ)..."
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
