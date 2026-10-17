import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Check,
  Copy,
  ChevronRight,
  Cake,
  Clock,
  Heart,
  CreditCard,
  HelpCircle,
  ArrowRight,
  MessageSquare,
  Flame,
  AlertCircle,
} from 'lucide-react';
import {
  CustomerAiMessage,
  CustomerAiContext,
  CustomerAiAction,
  ORDERING_STEPS_GUIDE,
  CAKE_SIZES_GUIDE,
  FLAVOR_RECOMMENDATIONS_GUIDE,
  INSCRIPTIONS_IDEAS_GUIDE,
  BAKONG_PAYMENT_GUIDE,
  PICKUP_TIME_GUIDE,
  queryCustomerAiAssistant,
} from '../../services/customerAiAssistantService';
import { soundFx } from '../../utils/audio';

interface CustomerAiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: CustomerAiContext;
  onApplySizeBudget?: (khr: number, sizeHint?: string) => void;
  onApplyFlavor?: (flavorLabel: string, isOther?: boolean, customText?: string) => void;
  onApplyInscription?: (text: string) => void;
  onGoToStep?: (step: 1 | 2 | 3 | 4) => void;
  onOpenStoreLocation?: () => void;
}

export const CustomerAiGuideModal: React.FC<CustomerAiGuideModalProps> = ({
  isOpen,
  onClose,
  context,
  onApplySizeBudget,
  onApplyFlavor,
  onApplyInscription,
  onGoToStep,
  onOpenStoreLocation,
}) => {
  const [messages, setMessages] = useState<CustomerAiMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `👋 **សួស្តីបាទ/ចាស! ខ្ញុំជាជំនួយការ AI របស់ ${context.storeName || 'Sweet Bakery'} 🎂✨**

ខ្ញុំអាចជួយលោកអ្នកបានភ្លាមៗ៖
• 📋 **ណែនាំរបៀបកុម្ម៉ង់នំងាយៗ ៤ ជំហាន**
• 👥 **ជួយគិតទំហំនំ & ថវិកាតាមចំនួនមនុស្ស**
• 🍓 **ណែនាំរសជាតិនំឆ្ងាញ់ៗប្រចាំហាង**
• ✍️ **ជួយគិតពាក្យជូនពរលើនំឱ្យពិរោះ**
• 💳 **របៀបបង់ប្រាក់កក់តាម Bakong KHQR**

តើលោកអ្នកចង់ឱ្យខ្ញុំជួយណែនាំពីអ្វីខ្លះថ្ងៃនេះ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        'របៀបកុម្ម៉ង់ ៤ ជំហាន',
        'ណែនាំទំហំតាមមនុស្ស',
        'ណែនាំរសជាតិពេញនិយម',
        'ជួយតែងអក្សរជូនពរ',
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [appliedActionKey, setAppliedActionKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 150);
    } else {
      // Stop speech if modal closes
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Voice speech synthesis
  const handleToggleSpeak = (msg: CustomerAiMessage) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('កម្មវិធីរុករក (Browser) របស់អ្នកមិនទាន់គាំទ្រសំឡេងអាន (Speech) ទេ');
      return;
    }

    if (isSpeakingId === msg.id) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const cleanSpeech = msg.text
      .replace(/[*#_~`]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick Khmer voice if available, else standard
    const voices = window.speechSynthesis.getVoices();
    const kmVoice = voices.find((v) => v.lang.includes('km') || v.lang.includes('kh'));
    if (kmVoice) {
      utterance.voice = kmVoice;
    }

    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Voice Input)
  const handleToggleVoiceInput = async () => {
    if (typeof window === 'undefined') return;
    setVoiceError(null);

    // 1. Android Native App Voice Recognition
    if (typeof (window as any).SweetBakeryNative?.startSpeechRecognition === 'function') {
      try {
        setIsListening(true);
        setVoiceStatusText('🎙️ កំពុងស្តាប់តាម Android Voice Typing...');
        soundFx.playPop();

        (window as any).__onSweetBakerySpeechResult = (text: string) => {
          setIsListening(false);
          setVoiceStatusText(null);
          if (text) {
            setInputValue((prev) => (prev ? `${prev} ${text}` : text));
            soundFx.playSuccess();
          }
        };

        (window as any).__onSweetBakerySpeechError = (err: string) => {
          setIsListening(false);
          setVoiceStatusText(null);
          if (err !== 'cancelled') {
            setVoiceError('មិនបានទទួលសំឡេងទេ សូមសាកល្បងម្តងទៀត។');
          }
        };

        (window as any).SweetBakeryNative.startSpeechRecognition();
        return;
      } catch (e) {
        console.error('Android speech recognition error', e);
      }
    }

    // 2. Stop if currently listening
    if (isListening) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      setVoiceStatusText(null);
      return;
    }

    // 3. Web Speech API availability check
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        'Browser ឬឧបករណ៍នេះមិនទាន់គាំទ្រការនិយាយបញ្ចូលសំឡេងទេ (Web Speech API)។ សូមប្រើប្រាស់ Google Chrome ឬចុចលើប៊ូតុងសំណួររហ័សខាងលើ។'
      );
      return;
    }

    // 4. Request microphone permission explicitly via getUserMedia if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.warn('Microphone permission check error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setVoiceError('សូមអនុញ្ញាតសិទ្ធិប្រើប្រាស់ Microphone (Allow Microphone) នៅក្នុង Browser Settings។');
          return;
        }
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'km-KH';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatusText('🎙️ កំពុងស្តាប់សំឡេង... សូមនិយាយសំណួររបស់អ្នក...');
        soundFx.playPop();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        if (transcript) {
          setInputValue(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        setVoiceStatusText(null);

        if (event.error === 'not-allowed') {
          setVoiceError('សូមអនុញ្ញាតសិទ្ធិប្រើ Microphone នៅក្នុងកម្មវិធីរុករករបស់អ្នក (Microphone Permission Blocked)។');
        } else if (event.error === 'no-speech') {
          setVoiceError('មិនបានឮសំឡេងនិយាយទេ សូមសាកល្បងចុចនិយាយម្តងទៀត។');
        } else if (event.error === 'network') {
          setVoiceError('មិនអាចភ្ជាប់ទៅកាន់សេវាបកប្រែសំឡេងបានទេ (Network Error) សូមពិនិត្យមើលអ៊ីនធឺណិត។');
        } else if (event.error === 'language-not-supported') {
          try {
            recognition.lang = navigator.language || 'en-US';
            recognition.start();
            return;
          } catch (e) {
            setVoiceError('ភាសានេះមិនទាន់គាំទ្រលើឧបករណ៍របស់អ្នកទេ');
          }
        } else if (event.error !== 'aborted') {
          setVoiceError(`បញ្ហា Microphone: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatusText(null);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error('Failed to start SpeechRecognition:', e);
      setIsListening(false);
      setVoiceStatusText(null);
      setVoiceError('មិនអាចបើក Microphone បានទេ: ' + (e?.message || 'សូមពិនិត្យមើលសិទ្ធិ'));
    }
  };

  // Handle Sending a Question
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isTyping) return;

    soundFx.playPop();
    setInputValue('');

    const userMsg: CustomerAiMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const aiResponse = await queryCustomerAiAssistant(textToSend, [...messages, userMsg], context);
      setIsTyping(false);
      soundFx.playPop();
      setMessages((prev) => [...prev, aiResponse]);
    } catch (e) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: 'សូមអភ័យទោស! ខ្ញុំកំពុងមានបញ្ហាក្នុងការតភ្ជាប់បន្តិច។ សូមសាកល្បងសួរម្តងទៀត ឬជ្រើសរើសជម្រើសណែនាំខាងលើ។',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Handle Quick Topic Click
  const handleQuickTopic = (topic: 'steps' | 'sizes' | 'flavors' | 'inscriptions' | 'payment' | 'pickup') => {
    soundFx.playPop();
    let guideMsg: CustomerAiMessage;
    if (topic === 'steps') guideMsg = { ...ORDERING_STEPS_GUIDE, id: 'guide-' + Date.now() };
    else if (topic === 'sizes') guideMsg = { ...CAKE_SIZES_GUIDE, id: 'guide-' + Date.now() };
    else if (topic === 'flavors') guideMsg = { ...FLAVOR_RECOMMENDATIONS_GUIDE(context.availableFlavors), id: 'guide-' + Date.now() };
    else if (topic === 'inscriptions') guideMsg = { ...INSCRIPTIONS_IDEAS_GUIDE, id: 'guide-' + Date.now() };
    else if (topic === 'payment') guideMsg = { ...BAKONG_PAYMENT_GUIDE, id: 'guide-' + Date.now() };
    else guideMsg = { ...PICKUP_TIME_GUIDE, id: 'guide-' + Date.now() };

    setMessages((prev) => [...prev, guideMsg]);
  };

  // Execute interactive Action
  const handleExecuteAction = (action: CustomerAiAction, key: string) => {
    soundFx.playSuccess();
    setAppliedActionKey(key);
    setTimeout(() => setAppliedActionKey(null), 2500);

    if (action.type === 'SET_SIZE_BUDGET' && onApplySizeBudget && action.payload) {
      onApplySizeBudget(action.payload.khr, action.payload.size);
    } else if (action.type === 'SET_FLAVOR' && onApplyFlavor && action.payload) {
      onApplyFlavor(action.payload.flavor, action.payload.isOther, action.payload.customText);
    } else if (action.type === 'SET_INSCRIPTION' && onApplyInscription && action.payload) {
      onApplyInscription(action.payload.text);
    } else if (action.type === 'SET_STEP' && onGoToStep && action.payload) {
      onGoToStep(action.payload.step);
      onClose();
    } else if (action.type === 'OPEN_LOCATION' && onOpenStoreLocation) {
      onOpenStoreLocation();
    }
  };

  // Copy text helper
  const handleCopyText = (msg: CustomerAiMessage) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    soundFx.playPop();
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset/Clear Chat
  const handleResetChat = () => {
    soundFx.playPop();
    setMessages([
      {
        id: 'welcome-reset-' + Date.now(),
        sender: 'assistant',
        text: `👋 **សួស្តីបាទ/ចាស! ការជជែកត្រូវបានចាប់ផ្តើមឡើងវិញ។**\n\nតើលោកអ្នកចង់ឱ្យខ្ញុំជួយណែនាំពីអ្វីខ្លះ?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          'របៀបកុម្ម៉ង់ ៤ ជំហាន',
          'ណែនាំទំហំតាមមនុស្ស',
          'ណែនាំរសជាតិពេញនិយម',
          'ជួយតែងអក្សរជូនពរ',
        ],
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-[82vh] max-h-[850px] overflow-hidden border border-rose-100 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* ========================================================= */}
        {/* TOP HEADER */}
        {/* ========================================================= */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-rose-500 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-xs">
                🤖
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white absolute -bottom-0.5 -right-0.5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm sm:text-base tracking-tight leading-none">
                  ជំនួយការ AI ផ្ទាំងកុម្ម៉ង់
                </h3>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider text-pink-100">
                  Smart AI
                </span>
              </div>
              <p className="text-[11px] text-pink-100 font-medium mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>ឆ្លើយតប និងណែនាំពីរបៀបកុម្ម៉ង់នំ ២៤/៧</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetChat}
              className="p-2 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
              title="ជម្រះការជជែក (Reset Chat)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-2 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
              title="បិទ (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* QUICK TOPIC PILLS BAR */}
        {/* ========================================================= */}
        <div className="px-3 py-2 bg-rose-50/70 border-b border-rose-100/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-black text-pink-800 shrink-0 flex items-center gap-1 mr-0.5">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>សំណួរញឹកញាប់៖</span>
          </span>

          <button
            type="button"
            onClick={() => handleQuickTopic('steps')}
            className="px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-800 rounded-xl text-[11px] font-bold border border-pink-200 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
          >
            <span>📋</span>
            <span>របៀបកុម្ម៉ង់ ៤ ជំហាន</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTopic('sizes')}
            className="px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-800 rounded-xl text-[11px] font-bold border border-pink-200 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
          >
            <span>👥</span>
            <span>ទំហំ & ថវិកាតាមមនុស្ស</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTopic('flavors')}
            className="px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-800 rounded-xl text-[11px] font-bold border border-pink-200 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
          >
            <span>🍓</span>
            <span>រសជាតិឆ្ងាញ់ប្រចាំហាង</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTopic('inscriptions')}
            className="px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-800 rounded-xl text-[11px] font-bold border border-pink-200 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
          >
            <span>✍️</span>
            <span>តែងពាក្យជូនពរលើនំ</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTopic('payment')}
            className="px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-800 rounded-xl text-[11px] font-bold border border-pink-200 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
          >
            <span>💳</span>
            <span>បង់ប្រាក់កក់ KHQR</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTopic('pickup')}
            className="px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-800 rounded-xl text-[11px] font-bold border border-pink-200 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
          >
            <span>⏰</span>
            <span>ពេលណាអាចមកយក?</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* CHAT MESSAGES BODY */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-gradient-to-b from-slate-50/50 via-white to-pink-50/20">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = isSpeakingId === msg.id;

            return (
              <div
                key={msg.id || index}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-sm shadow-xs shrink-0 self-start mt-0.5">
                    🤖
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-br-xs font-medium'
                        : 'bg-white border border-rose-100 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Actions & Utilities Bar (Under Assistant messages) */}
                  {!isUser && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>

                      <button
                        type="button"
                        onClick={() => handleCopyText(msg)}
                        className="p-1 hover:text-slate-700 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer ml-1"
                        title="ចម្លងអត្ថបទ"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === msg.id ? 'បានចម្លង' : 'ចម្លង'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(msg)}
                        className={`p-1 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer ${
                          isSpeaking ? 'text-pink-600 font-bold' : 'hover:text-slate-700'
                        }`}
                        title="ស្តាប់សំឡេងអាន"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3 animate-pulse text-pink-600" />
                            <span className="text-pink-600">កំពុងអាន...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>ស្តាប់</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Interactive Action Buttons attached to AI message */}
                  {!isUser && msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 w-full">
                      {msg.actions.map((act, actIdx) => {
                        const actKey = `${msg.id}-${actIdx}`;
                        const isApplied = appliedActionKey === actKey;

                        return (
                          <button
                            key={actIdx}
                            type="button"
                            onClick={() => handleExecuteAction(act, actKey)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                              isApplied
                                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                                : 'bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 text-pink-800 border border-pink-200/90'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>បានអនុវត្តជោគជ័យ!</span>
                              </>
                            ) : (
                              <>
                                <span>{act.label}</span>
                                <ArrowRight className="w-3 h-3 text-pink-600 shrink-0" />
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Replies Buttons */}
                  {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((qr, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => handleSendMessage(qr)}
                          className="px-2.5 py-1 bg-white hover:bg-pink-50 text-slate-700 hover:text-pink-700 border border-slate-200 hover:border-pink-300 rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                        >
                          💬 {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black shadow-xs shrink-0 self-start mt-0.5">
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Thinking Animation */}
          {isTyping && (
            <div className="flex gap-2.5 items-center animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                🤖
              </div>
              <div className="px-4 py-3 bg-white border border-rose-100 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-bold text-pink-700 ml-1.5">AI កំពុងគិតឆ្លើយ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Listening Banner */}
        {isListening && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white flex items-center justify-between gap-2 animate-in slide-in-from-bottom duration-150 shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 text-xs font-bold min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
              <span className="truncate">{voiceStatusText || '🎙️ កំពុងស្តាប់សំឡេង... សូមនិយាយសំណួររបស់អ្នក'}</span>
            </div>
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-black shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              បញ្ឈប់
            </button>
          </div>
        )}

        {/* Voice Error Notification */}
        {voiceError && (
          <div className="px-3.5 py-2.5 bg-amber-50 border-t border-amber-200 text-amber-900 flex items-center justify-between gap-2 animate-in fade-in shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceError(null)}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 px-2 py-0.5 rounded cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* INPUT BAR */}
        {/* ========================================================= */}
        <div className="p-3 bg-white border-t border-rose-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-md'
                  : 'bg-rose-50/70 hover:bg-rose-100 text-rose-700 border-rose-200/80 shadow-2xs'
              }`}
              title={isListening ? 'កំពុងស្តាប់... (ចុចដើម្បីឈប់)' : 'ចុចនិយាយតាមសំឡេង (Mic)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="សួរសំណួរពីទំហំ រសជាតិ របៀបកុម្ម៉ង់..."
                className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => setInputValue('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 sm:px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black shadow-md shadow-pink-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">ផ្ញើ</span>
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
            💡 ជំនួយការ AI អាចឆ្លើយជាភាសាខ្មែរ និងអង់គ្លេស • ជួយសម្រួលការកុម្ម៉ង់ឱ្យកាន់តែលឿន
          </p>
        </div>

      </div>
    </div>
  );
};
