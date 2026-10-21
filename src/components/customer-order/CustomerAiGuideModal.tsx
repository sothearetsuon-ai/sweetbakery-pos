import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Phone,
  Search,
  ShoppingCart,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Store,
  MapPin,
  SendHorizontal,
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
  DIRECT_STORE_CHAT_GUIDE,
  queryCustomerAiAssistant,
  searchProductsForChat,
  sendDirectCustomerMessageToTelegram,
} from '../../services/customerAiAssistantService';
import {
  getCustomerSessionId,
  getSavedCustomerInfo,
  saveCustomerInfo,
  subscribeToChatMessages,
  sendChatMessage,
  markChatAsRead,
} from '../../services/liveChatService';
import { Product, StoreInfo, ChatMessage } from '../../types';
import { soundFx } from '../../utils/audio';
import { getProductImageUrl } from '../../utils/imagePath';

interface CustomerAiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: CustomerAiContext;
  storeInfo?: StoreInfo;
  onApplySizeBudget?: (khr: number, sizeHint?: string) => void;
  onApplyFlavor?: (flavorLabel: string, isOther?: boolean, customText?: string) => void;
  onApplyInscription?: (text: string) => void;
  onGoToStep?: (step: 1 | 2 | 3 | 4) => void;
  onOpenStoreLocation?: () => void;
  onSelectProduct?: (product: Product) => void;
  initialTab?: 'chat' | 'browse' | 'store-chat';
}

export const CustomerAiGuideModal: React.FC<CustomerAiGuideModalProps> = ({
  isOpen,
  onClose,
  context,
  storeInfo,
  onApplySizeBudget,
  onApplyFlavor,
  onApplyInscription,
  onGoToStep,
  onOpenStoreLocation,
  onSelectProduct,
  initialTab = 'chat',
}) => {
  // Navigation Tabs: 'chat' (AI Q&A) | 'browse' (Cake Catalog) | 'store-chat' (Live Store Contact)
  const [activeTab, setActiveTab] = useState<'chat' | 'browse' | 'store-chat'>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Option to hide cake prices in customer view (defaults to true)
  const hidePrices = storeInfo?.hideCustomerPrices ?? true;

  // Messages History
  const [messages, setMessages] = useState<CustomerAiMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `👋 **សួស្តីបាទ/ចាស! ខ្ញុំជាជំនួយការ AI របស់ ${context.storeName || 'Sweet Bakery'} 🎂✨**

ខ្ញុំអាចជួយលោកអ្នកបានភ្លាមៗ៖
• 🍰 **កុម្ម៉ង់នំខួបកំណើត & រើសម៉ូដនំស្អាតៗ**
• 💬 **ឆាត ឬទាក់ទងផ្ទាល់មកកាន់ហាង**
• 📋 **ណែនាំរបៀបកុម្ម៉ង់នំងាយៗ ៤ ជំហាន**
• 👥 **ជួយគិតថវិកា & ទំហំតាមចំនួនមនុស្ស**
• 🍓 **ណែនាំរសជាតិនំឆ្ងាញ់ៗប្រចាំហាង**
• ✍️ **ជួយគិតពាក្យជូនពរលើនំឱ្យពិរោះ**
• 💳 **របៀបបង់ប្រាក់កក់តាម Bakong KHQR**

តើលោកអ្នកចង់ឱ្យខ្ញុំជួយណែនាំពីអ្វីខ្លះថ្ងៃនេះ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        'កុម្ម៉ង់នំខួបកំណើត',
        '💬 ឆាតមកហាងផ្ទាល់',
        'របៀបកុម្ម៉ង់ ៤ ជំហាន',
        'ណែនាំតម្លៃតាមមនុស្ស',
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

  // Browse Catalog Tab State
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');

  // Direct Telegram Store Message Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custCakeInterest, setCustCakeInterest] = useState('');
  const [custMessage, setCustMessage] = useState('');
  const [isSendingDirect, setIsSendingDirect] = useState(false);
  const [directSendStatus, setDirectSendStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Real-Time In-App Live Store Chat State (Customer ↔ Store Cashier)
  const [liveStoreMessages, setLiveStoreMessages] = useState<ChatMessage[]>([]);
  const [liveStoreInput, setLiveStoreInput] = useState('');
  const [isSendingLiveStore, setIsSendingLiveStore] = useState(false);
  const liveStoreEndRef = useRef<HTMLDivElement>(null);

  // Auto-fill saved customer profile
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedCustomerInfo();
      if (saved.name && !custName) setCustName(saved.name);
      if (saved.phone && !custPhone) setCustPhone(saved.phone);
    }
  }, [isOpen]);

  // Real-time unread count from staff
  const unreadStaffCount = useMemo(() => {
    return liveStoreMessages.filter((m) => m.senderRole === 'STAFF' && !m.isRead).length;
  }, [liveStoreMessages]);

  // Subscribe to Live In-App Chat with Store Cashier (keep listening whenever modal is open!)
  useEffect(() => {
    if (!isOpen) return;
    const sessId = getCustomerSessionId();
    if (activeTab === 'store-chat') {
      markChatAsRead(sessId, 'CUSTOMER');
    }

    const unsub = subscribeToChatMessages('CUSTOMER', sessId, (msgs) => {
      setLiveStoreMessages(msgs);
      if (activeTab === 'store-chat') {
        const hasUnread = msgs.some((m) => m.senderRole === 'STAFF' && !m.isRead);
        if (hasUnread) {
          markChatAsRead(sessId, 'CUSTOMER');
        }
      }
    });
    return unsub;
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (activeTab === 'store-chat') {
      setTimeout(() => {
        liveStoreEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [liveStoreMessages, activeTab]);

  const handleSendLiveStoreChat = async (textToSend?: string) => {
    const text = (textToSend || liveStoreInput).trim();
    if (!text || isSendingLiveStore) return;

    const sessId = getCustomerSessionId();
    const name = custName.trim() || 'អតិថិជន';
    const phone = custPhone.trim();

    if (custName.trim() || custPhone.trim()) {
      saveCustomerInfo(custName.trim(), custPhone.trim());
    }

    setIsSendingLiveStore(true);
    try {
      await sendChatMessage(
        {
          channel: 'CUSTOMER',
          sessionId: sessId,
          senderName: name,
          customerPhone: phone,
          senderRole: 'CUSTOMER',
          senderAvatar: '👤',
          text,
        },
        storeInfo
      );
      soundFx.playPop();
      setLiveStoreInput('');
    } catch (e) {
      console.error('Failed to send live chat', e);
    } finally {
      setIsSendingLiveStore(false);
    }
  };

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (activeTab === 'chat') {
          scrollToBottom();
          inputRef.current?.focus();
        }
      }, 150);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingId(null);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isTyping, activeTab]);

  // Handle select a cake for order -> Step 2
  const handleSelectCake = (product: Product) => {
    soundFx.playSuccess();
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    onClose();
  };

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
    const cleanSpeech = msg.text
      .replace(/[*#_~`]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

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

    // 3. Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រ Voice Input ទេ សូមវាយបញ្ចូលអក្សរជំនួសវិញ។');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'km-KH';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatusText('🎙️ កំពុងស្តាប់ភាសាខ្មែរ... សូមនិយាយសំណួររបស់អ្នក');
        soundFx.playPop();
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceStatusText(null);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setVoiceError(`មិនអាចស្តាប់បាន (${event.error})`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatusText(null);
      };

      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      setVoiceStatusText(null);
      setVoiceError('មិនអាចដំណើរការ Voice Input បានទេ');
    }
  };

  // Send message
  const handleSendMessage = async (text?: string) => {
    const textToSend = (text !== undefined ? text : inputValue).trim();
    if (!textToSend || isTyping) return;

    soundFx.playPop();

    const userMsg: CustomerAiMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
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
  const handleQuickTopic = (topic: 'steps' | 'sizes' | 'flavors' | 'inscriptions' | 'payment' | 'pickup' | 'store') => {
    soundFx.playPop();
    let guideMsg: CustomerAiMessage;
    if (topic === 'steps') guideMsg = { ...ORDERING_STEPS_GUIDE, id: 'guide-' + Date.now() };
    else if (topic === 'sizes') guideMsg = { ...CAKE_SIZES_GUIDE, id: 'guide-' + Date.now() };
    else if (topic === 'flavors') guideMsg = { ...FLAVOR_RECOMMENDATIONS_GUIDE(context.availableFlavors, context.outOfStockFlavors), id: 'guide-' + Date.now() };
    else if (topic === 'inscriptions') guideMsg = { ...INSCRIPTIONS_IDEAS_GUIDE, id: 'guide-' + Date.now() };
    else if (topic === 'payment') guideMsg = { ...BAKONG_PAYMENT_GUIDE, id: 'guide-' + Date.now() };
    else if (topic === 'pickup') guideMsg = { ...PICKUP_TIME_GUIDE, id: 'guide-' + Date.now() };
    else guideMsg = DIRECT_STORE_CHAT_GUIDE(context);

    setMessages((prev) => [...prev, guideMsg]);
  };

  // Execute interactive Action
  const handleExecuteAction = (action: CustomerAiAction, key: string) => {
    soundFx.playSuccess();
    setAppliedActionKey(key);
    setTimeout(() => setAppliedActionKey(null), 2500);

    if (action.type === 'SELECT_PRODUCT' && action.payload?.product) {
      handleSelectCake(action.payload.product);
    } else if (action.type === 'SWITCH_DIRECT_CHAT') {
      soundFx.playPop();
      setActiveTab('store-chat');
    } else if (action.type === 'OPEN_BROWSE_CAKES') {
      soundFx.playPop();
      setActiveTab('browse');
    } else if (action.type === 'OPEN_TELEGRAM' && action.payload?.url) {
      window.open(action.payload.url, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'CALL_PHONE' && action.payload?.phone) {
      window.location.href = `tel:${action.payload.phone}`;
    } else if (action.type === 'SET_SIZE_BUDGET' && onApplySizeBudget && action.payload) {
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
          'កុម្ម៉ង់នំខួបកំណើត',
          '💬 ឆាតមកហាងផ្ទាល់',
          'របៀបកុម្ម៉ង់ ៤ ជំហាន',
          'ណែនាំតម្លៃតាមមនុស្ស',
          'ណែនាំរសជាតិពេញនិយម',
          'ជួយតែងអក្សរជូនពរ',
        ],
      },
    ]);
  };

  // Direct Telegram Store Message Form Submission
  const handleSendDirectInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingDirect) return;

    if (!custPhone.trim()) {
      soundFx.playPop();
      setDirectSendStatus({
        type: 'error',
        message: 'សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក ដើម្បីឱ្យខាងហាងអាចទាក់ទងមកវិញបាន!',
      });
      return;
    }

    if (!custMessage.trim()) {
      soundFx.playPop();
      setDirectSendStatus({
        type: 'error',
        message: 'សូមសរសេរសារ ឬសំណួរដែលអ្នកចង់សួរនាំ!',
      });
      return;
    }

    setIsSendingDirect(true);
    setDirectSendStatus({ type: 'idle', message: '' });

    try {
      const result = await sendDirectCustomerMessageToTelegram({
        customerName: custName,
        customerPhone: custPhone,
        message: custMessage,
        cakeName: custCakeInterest || undefined,
        storeInfo,
      });

      if (result.success) {
        soundFx.playSuccess();
        setDirectSendStatus({
          type: 'success',
          message: result.message,
        });

        // Also register into In-App Live Chat sessions so it immediately enters POS App as well!
        try {
          const sessId = getCustomerSessionId();
          await sendChatMessage(
            {
              channel: 'CUSTOMER',
              sessionId: sessId,
              senderName: custName.trim() || 'ភ្ញៀវ',
              customerPhone: custPhone.trim(),
              senderRole: 'CUSTOMER',
              senderAvatar: '👤',
              text: custMessage.trim() + (custCakeInterest ? ` (ចាប់អារម្មណ៍នំ៖ ${custCakeInterest})` : ''),
            },
            storeInfo
          );
        } catch (e) {
          console.warn('Failed to mirror direct inquiry to live chat', e);
        }

        // Also append record to chat messages
        setMessages((prev) => [
          ...prev,
          {
            id: 'inquiry-' + Date.now(),
            sender: 'user',
            text: `💬 **ខ្ញុំបានផ្ញើសារសួរនាំទៅកាន់ហាង៖**\n• 👤 ឈ្មោះ៖ ${custName || 'ភ្ញៀវ'}\n• 📞 លេខទូរស័ព្ទ៖ ${custPhone}\n${custCakeInterest ? `• 🎂 នំ៖ ${custCakeInterest}\n` : ''}• 📝 សារ៖ "${custMessage}"`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: 'inquiry-ack-' + Date.now(),
            sender: 'assistant',
            text: `✅ **សាររបស់អ្នកត្រូវបានបញ្ជូនទៅកាន់ម្ចាស់ហាងតាម Telegram រួចរាល់ហើយ!**\n\nបុគ្គលិកហាងនឹងពិនិត្យមើល និងខលទាក់ទងមកកាន់លេខ **${custPhone}** របស់អ្នកយ៉ាងឆាប់រហ័សបំផុត។ សូមអរគុណ! 🙏`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        // Reset message field
        setCustMessage('');
      } else {
        soundFx.playPop();
        setDirectSendStatus({
          type: 'error',
          message: result.message,
        });
      }
    } catch (err: any) {
      soundFx.playPop();
      setDirectSendStatus({
        type: 'error',
        message: 'មានបញ្ហាក្នុងការផ្ញើសារ សូមសាកល្បងខលទូរស័ព្ទមកហាងផ្ទាល់!',
      });
    } finally {
      setIsSendingDirect(false);
    }
  };

  // Filter products for Browse Catalog tab
  const filteredCatalogProducts = useMemo(() => {
    return (context.availableProducts || []).filter((p) => {
      const q = catalogSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.nameKh && p.nameKh.toLowerCase().includes(q)) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchCat = catalogCategory === 'all' || p.categoryId === catalogCategory;
      return matchSearch && matchCat;
    });
  }, [context.availableProducts, catalogSearch, catalogCategory]);

  const telegramHandle = (storeInfo?.telegramUsername || context.telegramUsername || '')
    .replace(/^@/, '')
    .trim();
  const telegramUrl =
    storeInfo?.telegramChatLink ||
    context.telegramChatLink ||
    (telegramHandle ? `https://t.me/${telegramHandle}` : null);
  const storePhone = storeInfo?.phone || context.storePhone || '0978707000';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[92vh] sm:h-[85vh] max-h-[880px] overflow-hidden border border-rose-100 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* ========================================================= */}
        {/* TOP HEADER */}
        {/* ========================================================= */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-rose-500 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-xs">
                {activeTab === 'chat' ? '🤖' : activeTab === 'browse' ? '🍰' : '💬'}
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white absolute -bottom-0.5 -right-0.5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm sm:text-base tracking-tight leading-none">
                  {activeTab === 'chat'
                    ? 'ជំនួយការ AI ផ្ទាំងកុម្ម៉ង់'
                    : activeTab === 'browse'
                    ? 'រើសម៉ូដនំកុម្ម៉ង់'
                    : 'ឆាតផ្ទាល់មកហាង'}
                </h3>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider text-pink-100">
                  {activeTab === 'chat' ? 'Smart AI' : activeTab === 'browse' ? 'Catalog' : 'Live Chat'}
                </span>
              </div>
              <p className="text-[11px] text-pink-100 font-medium mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>
                  {activeTab === 'chat'
                    ? 'ឆ្លើយតប សួរនាំ និងណែនាំពីរបៀបកុម្ម៉ង់ ២៤/៧'
                    : activeTab === 'browse'
                    ? 'ជ្រើសរើសម៉ូដនំស្អាតៗកុម្ម៉ង់បានភ្លាមៗ'
                    : 'ផ្ញើសារ ឬខលមកកាន់ម្ចាស់ហាងផ្ទាល់'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {activeTab === 'chat' && (
              <button
                type="button"
                onClick={handleResetChat}
                className="p-2 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
                title="ជម្រះការជជែក (Reset Chat)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

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
        {/* MODE TABS: 🤖 Cake Bot | 🍰 Browse & Order | 💬 Live Store Chat */}
        {/* ========================================================= */}
        <div className="bg-rose-50/70 p-1.5 border-b border-rose-100 flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveTab('chat');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-pink-700 shadow-xs border border-rose-200/80'
                : 'text-slate-600 hover:text-pink-600 hover:bg-white/50'
            }`}
          >
            <span>🤖</span>
            <span className="truncate">ជំនួយការ AI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveTab('browse');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-white text-pink-700 shadow-xs border border-rose-200/80'
                : 'text-slate-600 hover:text-pink-600 hover:bg-white/50'
            }`}
          >
            <span>🍰</span>
            <span className="truncate">រើសម៉ូដនំកុម្ម៉ង់</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveTab('store-chat');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'store-chat'
                ? 'bg-white text-pink-700 shadow-xs border border-rose-200/80'
                : 'text-slate-600 hover:text-pink-600 hover:bg-white/50'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="truncate">ឆាតមកហាងផ្ទាល់</span>
            {unreadStaffCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-rose-600 text-white animate-bounce shadow-xs">
                {unreadStaffCount}
              </span>
            )}
          </button>
        </div>

        {/* Real-time Alert Banner in AI tab when Staff has replied */}
        {unreadStaffCount > 0 && activeTab === 'chat' && (
          <div
            onClick={() => {
              soundFx.playPop();
              setActiveTab('store-chat');
            }}
            className="p-2.5 mx-3 mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-md cursor-pointer flex items-center justify-between gap-2 active:scale-98 transition-all shrink-0 animate-in slide-in-from-top duration-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base animate-bounce shrink-0">👩‍🍳</span>
              <div className="min-w-0">
                <span className="text-xs font-black block truncate">
                  អ្នកលក់បានឆ្លើយតបសាររបស់អ្នក ({unreadStaffCount} សារថ្មី)!
                </span>
                <span className="text-[10px] text-blue-100 truncate block">
                  ចុចទីនេះដើម្បីបើកមើល និងឆ្លើយតបទៅអ្នកលក់
                </span>
              </div>
            </div>
            <span className="text-xs font-black bg-white text-indigo-700 px-2 py-1 rounded-xl shrink-0 shadow-xs">
              បើកមើល ➜
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: AI CONVERSATIONAL CHAT */}
        {/* ========================================================= */}
        {activeTab === 'chat' && (
          <>
            {/* QUICK TOPIC PILLS BAR */}
            <div className="px-3 py-2 bg-white border-b border-rose-50 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>សួររហ័ស៖</span>
              </span>

              <button
                type="button"
                onClick={() => handleSendMessage('កុម្ម៉ង់នំខួបកំណើត')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200/80 shrink-0 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <span>🍰 កុម្ម៉ង់នំ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('store-chat')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 shrink-0 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <span>💬 ឆាតមកហាង</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickTopic('steps')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <span>📋 របៀបកុម្ម៉ង់</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickTopic('sizes')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <span>🎂 ទំហំ & តម្លៃ</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickTopic('flavors')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <span>🍓 រសជាតិស្តុក</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickTopic('inscriptions')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <span>✍️ ពាក្យជូនពរ</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickTopic('payment')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <span>💳 បង់ប្រាក់ KHQR</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickTopic('pickup')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <span>⏰ ម៉ោងមកយក</span>
              </button>
            </div>

            {/* MESSAGES LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isSpeaking = isSpeakingId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-sm shadow-xs shrink-0 self-start mt-0.5">
                        🤖
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-2xs ${
                          isUser
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-br-xs font-medium'
                            : 'bg-white text-slate-800 border border-rose-100 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Recommended Products Carousel / Cards inside Chat Message */}
                      {!isUser && msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="mt-3 space-y-2 w-full">
                          <div className="text-[11px] font-black text-pink-700 flex items-center gap-1">
                            <span>🍰</span>
                            <span>នំដែលបានណែនាំ ({msg.recommendedProducts.length} ម៉ូដ)៖</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.recommendedProducts.map((prod) => {
                              const priceKhr =
                                prod.priceKhr ??
                                Math.round(prod.priceUsd * (context.exchangeRate || 4100));
                              return (
                                <div
                                  key={prod.id}
                                  className="bg-white rounded-2xl p-2 border border-rose-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={getProductImageUrl(
                                        prod.imageUrl ||
                                          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'
                                      )}
                                      alt={prod.nameKh}
                                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-rose-100 group-hover:scale-105 transition-transform"
                                      loading="lazy"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <h5 className="font-black text-slate-800 text-xs truncate group-hover:text-pink-600 transition-colors">
                                        {prod.nameKh}
                                      </h5>
                                      <p className="text-[10px] text-slate-400 truncate">
                                        {prod.nameEn || prod.unit || 'នំខួបកំណើត'}
                                      </p>
                                      <div className="text-xs font-black text-rose-600 mt-0.5">
                                        {priceKhr > 0
                                          ? `${priceKhr.toLocaleString()} ៛`
                                          : 'តម្លៃចរចា'}
                                        {prod.priceUsd > 0 && (
                                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                                            (${prod.priceUsd.toFixed(2)})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectCake(prod)}
                                    className="mt-2 w-full py-1.5 px-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                                  >
                                    <span>🛒 កុម្ម៉ង់នំនេះ</span>
                                    <ArrowRight className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

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
                              onClick={() => {
                                if (qr.includes('ឆាតមកហាង')) {
                                  setActiveTab('store-chat');
                                } else {
                                  handleSendMessage(qr);
                                }
                              }}
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
                    <span className="text-[11px] font-bold text-pink-700 ml-1.5">
                      AI កំពុងគិតឆ្លើយ...
                    </span>
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
                  <span className="truncate">
                    {voiceStatusText || '🎙️ កំពុងស្តាប់សំឡេង... សូមនិយាយសំណួររបស់អ្នក'}
                  </span>
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

            {/* INPUT BAR */}
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
                    placeholder="សួរសំណួរពីតម្លៃ រសជាតិ នំកុម្ម៉ង់ របៀបបង់ប្រាក់..."
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
                💡 ជំនួយការ AI ឆ្លើយតបភាសាខ្មែរ ២៤/៧ • ឆ្លើយសំណួរ ណែនាំនំ និងជួយកុម្ម៉ង់បានភ្លាមៗ
              </p>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BROWSE & ORDER CAKES CATALOG */}
        {/* ========================================================= */}
        {activeTab === 'browse' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/60">
            {/* Search & Filter Header */}
            <div className="p-3 bg-white border-b border-rose-100 shrink-0 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="ស្វែងរកឈ្មោះនំ (សូកូឡា, ស្ត្របឺរី, ផេនដា...)"
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-pink-500 rounded-xl text-xs font-medium focus:outline-none transition-all"
                />
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                ចុច **"🛒 កុម្ម៉ង់នំនេះ"** ដើម្បីរើសយកទៅតុបតែងទំហំ រសជាតិ និងពាក្យជូនពរភ្លាមៗ!
              </p>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {filteredCatalogProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Cake className="w-10 h-10 mx-auto text-rose-300" />
                  <p className="text-xs font-bold">រកមិនឃើញនំដែលត្រូវនឹងការស្វែងរកនេះទេ</p>
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    className="text-xs font-black text-pink-600 underline cursor-pointer"
                  >
                    បង្ហាញនំទាំងអស់
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {filteredCatalogProducts.map((p) => {
                    const priceKhr =
                      p.priceKhr ??
                      Math.round(p.priceUsd * (context.exchangeRate || 4100));
                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div className="relative w-full h-28 sm:h-36 bg-rose-50 overflow-hidden">
                          <img
                            src={getProductImageUrl(
                              p.imageUrl ||
                                'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'
                            )}
                            alt={p.nameKh}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                          <div>
                            <h4 className="font-black text-slate-800 text-xs line-clamp-1 group-hover:text-pink-600 transition-colors">
                              {p.nameKh}
                            </h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {p.nameEn || p.unit || 'នំខួបកំណើត'}
                            </p>
                          </div>

                          <div className="pt-1.5 border-t border-rose-50">
                            {hidePrices ? (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200 mb-1">
                                <Sparkles className="w-3 h-3 text-pink-500 shrink-0" />
                                <span>តម្លៃតាមទំហំ & ម៉ូដ</span>
                              </div>
                            ) : (
                              <>
                                <div className="text-xs font-black text-rose-600 tracking-tight">
                                  {priceKhr > 0 ? `${priceKhr.toLocaleString()} ៛` : 'តម្លៃចរចា'}
                                </div>
                                {p.priceUsd > 0 && (
                                  <div className="text-[10px] text-slate-400">
                                    ${p.priceUsd.toFixed(2)}
                                  </div>
                                )}
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSelectCake(p)}
                              className="mt-1.5 w-full py-1.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-[10px] sm:text-xs font-black transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>🛒 កុម្ម៉ង់នំនេះ</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LIVE DIRECT STORE CHAT & CONTACT */}
        {/* ========================================================= */}
        {activeTab === 'store-chat' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/70">
            {/* Top Store Contact Banner & Hotline */}
            <div className="p-3 bg-white border-b border-rose-100 shrink-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                    💬
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 truncate">
                      <span>ឆាតផ្ទាល់ជាមួយអ្នកលក់ (In-App Live Chat)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {storeInfo?.nameKh || context.storeName || 'Sweet Bakery'} • ឆ្លើយតបផ្ទាល់លើ POS
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${storePhone}`}
                    onClick={() => soundFx.playPop()}
                    className="p-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    title="ខលទាន់ហេតុការណ៍"
                  >
                    <Phone className="w-3 h-3" />
                    <span className="hidden sm:inline">{storePhone}</span>
                  </a>

                  {telegramUrl && (
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundFx.playPop()}
                      className="p-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title="ឆាត Telegram"
                    >
                      <span>✈️</span>
                      <span className="hidden sm:inline">Telegram</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Customer Identity Bar (Name & Phone) */}
              <div className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-rose-50/70 border border-rose-200/70 text-[11px]">
                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <span className="text-rose-500 font-bold shrink-0">👤</span>
                  <input
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="ឈ្មោះរបស់អ្នក"
                    className="w-24 sm:w-28 bg-white px-2 py-0.5 rounded-lg border border-rose-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 truncate"
                  />
                  <span className="text-slate-300">|</span>
                  <span className="text-rose-500 font-bold shrink-0">📞</span>
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="លេខទូរស័ព្ទ (ចាំបាច់)"
                    className="flex-1 bg-white px-2 py-0.5 rounded-lg border border-rose-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 truncate"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline shrink-0">
                  (សម្រាប់បុគ្គលិកទាក់ទងមកវិញ)
                </span>
              </div>
            </div>

            {/* Chat Messages Stream Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {liveStoreMessages.length === 0 ? (
                <div className="space-y-3 py-4">
                  <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm text-center space-y-2 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md shadow-pink-500/20">
                      🧁
                    </div>
                    <h5 className="text-xs sm:text-sm font-black text-slate-800">
                      សូមស្វាគមន៍មកកាន់ {storeInfo?.nameKh || context.storeName || 'Sweet Bakery'}!
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      លោកអ្នកអាចវាយសារ ឬចុចសំណួររហ័សខាងក្រោម ដើម្បីសាកសួរតម្លៃនំ ម៉ូដនំ ឬការកុម្ម៉ង់ភ្លាមៗ។
                      បុគ្គលិកអ្នកលក់នឹងឆ្លើយតបមកវិញនៅលើផ្ទាំងនេះភ្លាមៗ!
                    </p>
                  </div>

                  {/* Quick question chips */}
                  <div className="max-w-md mx-auto space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">
                      សំណួររហ័សដែលពេញនិយមសួរ៖
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {[
                        '👋 សួស្តីបាទ! ខ្ញុំចង់សួរពីតម្លៃនំ',
                        '🎂 តើអាចកុម្ម៉ង់ម៉ូដពិសេសតាមរូបថតបានទេ?',
                        '⏰ ត្រូវកុម្ម៉ង់ទុកមុនប៉ុន្មានម៉ោងដែរ?',
                        '🛵 ខាងហាងមានសេវាដឹកជញ្ជូនដែរទេ?',
                        '💳 អាចបង់ប្រាក់កក់តាម Bakong KHQR បានទេ?',
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            handleSendLiveStoreChat(chip);
                          }}
                          className="px-2.5 py-1.5 rounded-full bg-white hover:bg-pink-50 border border-rose-200/80 text-slate-700 hover:text-pink-700 text-[11px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                liveStoreMessages.map((msg) => {
                  const isCust = msg.senderRole === 'CUSTOMER';
                  const isSys = msg.senderRole === 'SYSTEM';

                  if (isSys) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-600 text-[10px] font-bold">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 items-end ${isCust ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCust && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                          👩‍🍳
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] sm:max-w-[75%] rounded-3xl p-3 shadow-xs space-y-1 ${
                          isCust
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-br-xs'
                            : 'bg-white border border-rose-100 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-80">
                          <span className="font-bold">
                            {isCust ? 'អ្នក (Customer)' : msg.senderName || 'អ្នកលក់ (Staff)'}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                          {msg.text}
                        </p>
                      </div>

                      {isCust && (
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0">
                          👤
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={liveStoreEndRef} />
            </div>

            {/* Quick chips when already chatting */}
            {liveStoreMessages.length > 0 && (
              <div className="px-3 py-1 bg-white/70 border-t border-rose-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-bold text-slate-400 shrink-0">ឆ្លើយតបរហ័ស៖</span>
                {['បាទ/ចាស អរគុណ!', 'តម្លៃប៉ុន្មានដែរ?', 'ខ្ញុំសម្រេចចិត្តកុម្ម៉ង់យកមួយនេះ', 'ដឹកជញ្ជូនដល់ណាដែរ?'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSendLiveStoreChat(c)}
                    className="px-2 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold shrink-0 transition-colors cursor-pointer border border-rose-200"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Message Input Bar */}
            <div className="p-3 bg-white border-t border-rose-100 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendLiveStoreChat();
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
                    type="text"
                    value={liveStoreInput}
                    onChange={(e) => setLiveStoreInput(e.target.value)}
                    placeholder="វាយសារសួរនាំមកកាន់ហាងនៅទីនេះ..."
                    className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                  />
                  {liveStoreInput && (
                    <button
                      type="button"
                      onClick={() => setLiveStoreInput('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!liveStoreInput.trim() || isSendingLiveStore}
                  className="p-2.5 sm:px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                >
                  {isSendingLiveStore ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">ផ្ញើ</span>
                </button>
              </form>

              <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
                💬 សារត្រូវបានបញ្ជូនទៅកាន់អេក្រង់ POS របស់ហាងភ្លាមៗ • បុគ្គលិកឆ្លើយតបមកវិញភ្លាមៗ
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
