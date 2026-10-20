import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  MessageSquare,
  Bot,
  Users,
  Phone,
  Sparkles,
  Clock,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Search,
  Store,
  User,
  AlertCircle,
  Plus,
  Flame,
  ChevronRight,
  Cake,
  RefreshCw,
} from 'lucide-react';
import {
  ChatMessage,
  CustomerChatSession,
  ChatChannel,
  Product,
  StaffMember,
} from '../../types';
import { useBakery } from '../../context/BakeryContext';
import {
  subscribeToChatMessages,
  subscribeToCustomerSessions,
  sendChatMessage,
  markChatAsRead,
} from '../../services/liveChatService';
import {
  queryCustomerAiAssistant,
  CustomerAiContext,
} from '../../services/customerAiAssistantService';
import { soundFx } from '../../utils/audio';

interface InAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ChatChannel;
  initialSessionId?: string;
}

export const InAppChatModal: React.FC<InAppChatModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'CUSTOMER',
  initialSessionId,
}) => {
  const { storeInfo, currentStaff, staffMembers, products, exchangeRate } = useBakery();

  // Active channel tab: 'CUSTOMER' | 'AI_ASSISTANT' | 'STAFF_TEAM'
  const [activeTab, setActiveTab] = useState<ChatChannel>(initialTab);

  // Customer Sessions & Messages
  const [sessions, setSessions] = useState<CustomerChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionSearch, setSessionSearch] = useState('');

  // AI Assistant Specific State
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micStatusText, setMicStatusText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial tab when opening
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialSessionId) setSelectedSessionId(initialSessionId);
    }
  }, [isOpen, initialTab, initialSessionId]);

  // Subscribe to Customer Sessions
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToCustomerSessions((list) => {
      setSessions(list);
      // Auto-select first session if none selected
      if (!selectedSessionId && list.length > 0) {
        setSelectedSessionId(list[0].sessionId);
      }
    });
    return unsub;
  }, [isOpen, selectedSessionId]);

  // Subscribe to Chat Messages based on Active Tab
  useEffect(() => {
    if (!isOpen) return;

    const targetSessionId = activeTab === 'CUSTOMER' ? selectedSessionId || undefined : undefined;
    const unsub = subscribeToChatMessages(activeTab, targetSessionId, (msgs) => {
      setMessages(msgs);
    });

    // Mark as read for cashier if customer tab
    if (activeTab === 'CUSTOMER' && selectedSessionId) {
      markChatAsRead(selectedSessionId, 'STAFF');
    }

    return unsub;
  }, [isOpen, activeTab, selectedSessionId]);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages, isAiTyping, activeTab]);

  // Total unread for staff across all customer sessions
  const totalUnreadStaff = useMemo(() => {
    return sessions.reduce((sum, s) => sum + (s.unreadCountStaff || 0), 0);
  }, [sessions]);

  // Current active customer session
  const currentSession = useMemo(() => {
    return sessions.find((s) => s.sessionId === selectedSessionId) || null;
  }, [sessions, selectedSessionId]);

  // Filtered customer sessions by search
  const filteredSessions = useMemo(() => {
    if (!sessionSearch.trim()) return sessions;
    const q = sessionSearch.toLowerCase().trim();
    return sessions.filter(
      (s) =>
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.customerPhone && s.customerPhone.includes(q)) ||
        (s.lastMessage && s.lastMessage.toLowerCase().includes(q))
    );
  }, [sessions, sessionSearch]);

  // Build Context for AI Assistant
  const aiContext: CustomerAiContext = useMemo(() => {
    return {
      storeName: storeInfo?.nameKh || 'Sweet Bakery',
      storePhone: storeInfo?.phone || '012 345 678',
      storeAddress: storeInfo?.address || 'រតនៈគីរី អូរយ៉ាដាវ',
      exchangeRate: exchangeRate || 4100,
      availableProducts: products || [],
      availableFlavors: [
        { label: 'chocolate', nameKh: 'សូកូឡា (Chocolate)' },
        { label: 'vanilla', nameKh: 'វ៉ានីឡា (Vanilla)' },
        { label: 'strawberry', nameKh: 'ស្ត្រប៊ែរី (Strawberry)' },
        { label: 'matcha', nameKh: 'តែបៃតង (Matcha)' },
      ],
      currentStep: 1,
    };
  }, [storeInfo, exchangeRate, products]);

  // Quick reply options for Cashier/Staff
  const staffQuickReplies = [
    '👋 សួស្តីបាទ! ហាងនំ Sweet Bakery សូមស្វាគមន៍!',
    '🍰 នំនេះមានក្នុងស្តុកស្រាប់ អាចអញ្ជើញមកយកបានភ្លាមៗ!',
    '⏰ សម្រាប់នំកុម្ម៉ង់ម៉ូដពិសេស អាចកុម្ម៉ង់ទុកមុន ២-៣ ម៉ោង!',
    '✨ ហាងមានថែមជូន ទៀនខួបកំណើត មួក និងស្លាកជូនពរដោយឥតគិតថ្លៃ!',
    '🙏 អរគុណច្រើនបង! បុគ្គលិកកំពុងរៀបចំជូនភ្លាមៗ!',
  ];

  // Send Message Handler
  const handleSend = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend || isSending) return;

    soundFx.playPop();
    setInputText('');
    setIsSending(true);

    try {
      if (activeTab === 'CUSTOMER') {
        if (!selectedSessionId) {
          setIsSending(false);
          return;
        }

        await sendChatMessage(
          {
            channel: 'CUSTOMER',
            sessionId: selectedSessionId,
            senderName: currentStaff?.name || 'អ្នកគិតលុយ (Cashier)',
            senderRole: 'STAFF',
            senderId: currentStaff?.id,
            senderAvatar: currentStaff?.avatar || '👤',
            text: textToSend,
          },
          storeInfo
        );
      } else if (activeTab === 'STAFF_TEAM') {
        await sendChatMessage(
          {
            channel: 'STAFF_TEAM',
            senderName: currentStaff?.name || 'បុគ្គលិក',
            senderRole: 'STAFF',
            senderId: currentStaff?.id,
            senderAvatar: currentStaff?.avatar || '👤',
            text: textToSend,
          },
          storeInfo
        );
      } else if (activeTab === 'AI_ASSISTANT') {
        // 1. Post user message
        const userMsg = await sendChatMessage({
          channel: 'AI_ASSISTANT',
          senderName: currentStaff?.name || 'អ្នកប្រើប្រាស់',
          senderRole: 'STAFF',
          senderAvatar: currentStaff?.avatar || '👤',
          text: textToSend,
        });

        // 2. Query AI Assistant
        setIsAiTyping(true);
        try {
          const aiReply = await queryCustomerAiAssistant(textToSend, [...messages, userMsg] as any, aiContext);
          setIsAiTyping(false);
          soundFx.playPop();

          await sendChatMessage({
            channel: 'AI_ASSISTANT',
            senderName: 'Smart AI Assistant 🤖',
            senderRole: 'AI',
            senderAvatar: '🤖',
            text: aiReply.text,
            quickReplies: aiReply.quickReplies,
          });
        } catch (e) {
          setIsAiTyping(false);
          await sendChatMessage({
            channel: 'AI_ASSISTANT',
            senderName: 'Smart AI Assistant 🤖',
            senderRole: 'AI',
            senderAvatar: '🤖',
            text: 'សូមអភ័យទោស! ខ្ញុំកំពុងមានបញ្ហាក្នុងការតភ្ជាប់បន្តិច។ សូមសាកល្បងម្តងទៀតបាទ/ចាស។',
          });
        }
      }
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Voice Read Aloud for AI
  const handleToggleSpeak = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('កម្មវិធីរុករករបស់អ្នកមិនទាន់គាំទ្រសំឡេងអានទេ');
      return;
    }

    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpeech = text.replace(/[*#_~`]/g, '').replace(/\[.*?\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Mic Speech to text for AI
  const handleToggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('ឧបករណ៍របស់អ្នកមិនទាន់គាំទ្រការនិយាយបញ្ចូលសំឡេង Speech-to-Text ទេ');
      return;
    }

    if (isListening) {
      if ((window as any)._bakerySpeechRec) {
        (window as any)._bakerySpeechRec.stop();
      }
      setIsListening(false);
      setMicStatusText(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      (window as any)._bakerySpeechRec = recognition;
      recognition.lang = 'km-KH';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setMicStatusText('🎙️ កំពុងស្តាប់ភាសាខ្មែរ... សូមនិយាយសំណួររបស់អ្នក');
        soundFx.playPop();
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setMicStatusText(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setMicStatusText(null);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setMicStatusText(null);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-battambang">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[850px] bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-pink-900 text-white p-3.5 sm:p-4 shrink-0 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 p-0.5 shadow-md flex items-center justify-center text-white shrink-0 text-xl">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-wide">
                  មជ្ឈមណ្ឌលជជែកផ្ទាល់ក្នុង App (In-App Chat Suite)
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-tight">
                ជជែកផ្ទាល់ជាមួយភ្ញៀវ, ប្រើ AI ជំនួយការឆ្លាតវៃ និងផ្ញើសារក្នុងក្រុមការងារហាង
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="បិទ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CHANNEL TABS SWITCHER */}
        <div className="flex items-center border-b border-rose-100 bg-rose-50/70 p-1.5 gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
          {/* TAB 1: CUSTOMER LIVE CHAT */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('CUSTOMER');
              soundFx.playPop();
            }}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'CUSTOMER'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/20 scale-[1.01]'
                : 'bg-white text-slate-700 hover:text-rose-600 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>💬 ភ្ញៀវ & អ្នកលក់ (Customer Chat)</span>
            {totalUnreadStaff > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 animate-bounce">
                {totalUnreadStaff}
              </span>
            )}
          </button>

          {/* TAB 2: AI SMART ASSISTANT */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('AI_ASSISTANT');
              soundFx.playPop();
            }}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'AI_ASSISTANT'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/20 scale-[1.01]'
                : 'bg-white text-slate-700 hover:text-rose-600 border border-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-200" />
            <span>🤖 AI ជំនួយការឆ្លាតវៃ (Smart AI)</span>
          </button>

          {/* TAB 3: STAFF TEAM CHAT */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('STAFF_TEAM');
              soundFx.playPop();
            }}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'STAFF_TEAM'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/20 scale-[1.01]'
                : 'bg-white text-slate-700 hover:text-rose-600 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-200" />
            <span>👥 ក្រុមការងារហាង (Staff Team)</span>
          </button>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-hidden flex">
          {/* TAB 1: CUSTOMER LIVE CHAT (Split Pane) */}
          {activeTab === 'CUSTOMER' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Pane: Customer Session List */}
              <div className="w-full sm:w-80 border-r border-slate-200 bg-slate-50/70 flex flex-col shrink-0">
                <div className="p-3 border-b border-slate-200 bg-white">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={sessionSearch}
                      onChange={(e) => setSessionSearch(e.target.value)}
                      placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Session list items */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {filteredSessions.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 space-y-2">
                      <div className="text-2xl">💬</div>
                      <p className="text-xs font-bold text-slate-600">មិនទាន់មានសារពីភ្ញៀវនៅឡើយទេ</p>
                      <p className="text-[11px] text-slate-400">
                        នៅពេលអតិថិជនឆាតសួរនាំតាមផ្ទាំង Order Portal សារនឹងលោតមកទីនេះភ្លាមៗ!
                      </p>
                    </div>
                  ) : (
                    filteredSessions.map((sess) => {
                      const isSelected = selectedSessionId === sess.sessionId;
                      const hasUnread = (sess.unreadCountStaff || 0) > 0;
                      return (
                        <button
                          key={sess.sessionId}
                          type="button"
                          onClick={() => {
                            setSelectedSessionId(sess.sessionId);
                            markChatAsRead(sess.sessionId, 'STAFF');
                            soundFx.playPop();
                          }}
                          className={`w-full text-left p-3 transition-all cursor-pointer flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-rose-50/80 border-l-4 border-rose-600 shadow-2xs'
                              : 'hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {sess.customerName ? sess.customerName.charAt(0) : '👤'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-black text-xs text-slate-800 truncate">
                                {sess.customerName || 'អតិថិជន'}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {sess.lastTimestamp ? new Date(sess.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>

                            {sess.customerPhone && (
                              <p className="text-[10px] font-mono font-bold text-rose-600 mb-0.5">
                                📞 {sess.customerPhone}
                              </p>
                            )}

                            <p className="text-[11px] text-slate-500 truncate">
                              {sess.lastMessage || 'បានចាប់ផ្តើមការជជែក'}
                            </p>
                          </div>

                          {hasUnread && (
                            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs animate-pulse">
                              {sess.unreadCountStaff}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Pane: Active Conversation */}
              <div className="flex-1 flex flex-col bg-slate-50/40 overflow-hidden">
                {selectedSessionId ? (
                  <>
                    {/* Active Chat Header */}
                    <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-sm">
                          👤
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-xs sm:text-sm text-slate-800">
                              {currentSession?.customerName || 'អតិថិជន'}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                              កំពុងជជែក
                            </span>
                          </div>
                          {currentSession?.customerPhone ? (
                            <a
                              href={`tel:${currentSession.customerPhone}`}
                              className="text-[11px] text-rose-600 hover:underline font-mono font-bold flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{currentSession.customerPhone}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">អតិថិជនតាម Online Order Portal</span>
                          )}
                        </div>
                      </div>

                      {/* Cashier indicator */}
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 block">អ្នកឆ្លើយតបបច្ចុប្បន្ន</span>
                        <span className="text-xs font-black text-slate-700">
                          {currentStaff?.name || 'Cashier វិជ្ជតា'} ({currentStaff?.role || 'Admin'})
                        </span>
                      </div>
                    </div>

                    {/* Messages Scroll View */}
                    <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3">
                      {messages.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 space-y-2">
                          <p className="text-xs font-bold text-slate-600">មិនទាន់មានសារក្នុងបន្ទប់នេះទេ</p>
                          <p className="text-[11px] text-slate-400">
                            វាយសារខាងក្រោម ឬជ្រើសរើសចម្លើយរហ័សដើម្បីឆ្លើយតបទៅកាន់ភ្ញៀវ!
                          </p>
                        </div>
                      ) : (
                        messages.map((m) => {
                          const isStaff = m.senderRole === 'STAFF';
                          return (
                            <div
                              key={m.id}
                              className={`flex items-end gap-2 ${isStaff ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isStaff && (
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                  {m.senderName ? m.senderName.charAt(0) : '👤'}
                                </div>
                              )}

                              <div
                                className={`max-w-[78%] sm:max-w-[65%] rounded-2xl p-3 shadow-2xs ${
                                  isStaff
                                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-xs'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span
                                    className={`text-[10px] font-black ${
                                      isStaff ? 'text-rose-100' : 'text-rose-600'
                                    }`}
                                  >
                                    {m.senderName}
                                  </span>
                                  <span
                                    className={`text-[9px] ${
                                      isStaff ? 'text-rose-200' : 'text-slate-400'
                                    }`}
                                  >
                                    {m.timestamp}
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                  {m.text}
                                </p>
                              </div>

                              {isStaff && (
                                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                  {m.senderAvatar || '👤'}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Staff Answers Chips */}
                    <div className="px-3 py-1.5 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">ឆ្លើយរហ័ស៖</span>
                      {staffQuickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(qr)}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>

                    {/* Input Bar */}
                    <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="វាយសារឆ្លើយតបទៅកាន់អតិថិជន..."
                        className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none transition-all font-medium"
                      />

                      <button
                        type="button"
                        onClick={() => handleSend()}
                        disabled={!inputText.trim() || isSending}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 transition-all cursor-pointer active:scale-95 shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                    <div className="text-4xl">💬</div>
                    <h4 className="font-black text-sm text-slate-700">សូមជ្រើសរើសការសន្ទនាពីបញ្ជីខាងឆ្វេង</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      អ្នកអាចមើលរាល់សារដែលភ្ញៀវផ្ញើមកពីទំព័រ Order Portal និងឆ្លើយតបភ្លាមៗក្នុងពេលតែមួយ
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI SMART ASSISTANT */}
          {activeTab === 'AI_ASSISTANT' && (
            <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
              {/* Header Status Bar */}
              <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    🤖
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                      <span>ជំនួយការឆ្លាតវៃ AI Smart Bakery</span>
                      <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-1.5 py-0.2 rounded-md">
                        AI Gemini Engine
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      ជួយគិតថវិកា, ណែនាំទំហំនំ, រកទំនិញ, តែងពាក្យជូនពរ និងគណនារូបមន្ត
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    handleSend('សួស្តី AI! តើថ្ងៃនេះមានការណែនាំអ្វីខ្លះសម្រាប់ហាងនំ?');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>សួរសំណួរថ្មី</span>
                </button>
              </div>

              {/* Messages List */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5">
                {messages.map((m) => {
                  const isUser = m.senderRole === 'STAFF';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs mt-0.5">
                          🤖
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-2xs ${
                          isUser
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-xs'
                            : 'bg-white border border-indigo-100 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`text-[10px] font-black ${
                              isUser ? 'text-rose-100' : 'text-indigo-600'
                            }`}
                          >
                            {m.senderName}
                          </span>
                          <span
                            className={`text-[9px] ${
                              isUser ? 'text-rose-200' : 'text-slate-400'
                            }`}
                          >
                            {m.timestamp}
                          </span>
                        </div>

                        <div className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                          {m.text}
                        </div>

                        {/* Quick Replies below AI message */}
                        {!isUser && m.quickReplies && m.quickReplies.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                            {m.quickReplies.map((qr, qidx) => (
                              <button
                                key={qidx}
                                type="button"
                                onClick={() => handleSend(qr)}
                                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer active:scale-95"
                              >
                                {qr}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Audio speak button */}
                        {!isUser && (
                          <div className="mt-2 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleToggleSpeak(m.text, m.id)}
                              className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                              title="អានជាសំឡេង"
                            >
                              {isSpeakingId === m.id ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                                  <span className="text-rose-500 font-bold">កំពុងអាន...</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>អានសំឡេង</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-8 h-8 rounded-2xl bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs mt-0.5">
                          {m.senderAvatar || '👤'}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isAiTyping && (
                  <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold animate-pulse p-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                    <span>AI កំពុងគិត និងរៀបចំចម្លើយជូន...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick AI Prompts Bar */}
              <div className="px-3 py-1.5 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
                <span className="text-[10px] font-bold text-slate-400 shrink-0">💡 សំណួរពេញនិយម៖</span>
                {[
                  '👥 ណែនាំទំហំនំ និងតម្លៃសម្រាប់មនុស្ស ១០-១៥ នាក់',
                  '✍️ តែងពាក្យជូនពរខួបកំណើតប៉ាម៉ាក់',
                  '🍓 ណែនាំរសជាតិនំឆ្ងាញ់សម្រាប់ក្មេងៗ',
                  '🔍 តើទៀនកាំជ្រួច និងមួកមានតម្លៃប៉ុន្មាន?',
                ].map((prompt, pidx) => (
                  <button
                    key={pidx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Mic Listening Status Notification */}
              {micStatusText && (
                <div className="px-3 py-1.5 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span>{micStatusText}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className="text-[10px] underline font-black cursor-pointer"
                  >
                    បញ្ឈប់
                  </button>
                </div>
              )}

              {/* Input Bar */}
              <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 border-slate-200'
                  }`}
                  title={isListening ? 'បញ្ឈប់ការស្តាប់' : 'និយាយជាភាសាខ្មែរ (Voice Input)'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-600" />}
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="សួរនាំ AI ពីម៉ូដនំ, តម្លៃ, រសជាតិ, រូបមន្ត ឬពាក្យជូនពរ..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium"
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STAFF TEAM CHAT */}
          {activeTab === 'STAFF_TEAM' && (
            <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
              {/* Header Info */}
              <div className="p-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    👥
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                      <span>បន្ទប់ជជែកផ្ទៃក្នុងក្រុមការងារហាង (Internal Team Chat)</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded-md">
                        {staffMembers?.length || 2} នាក់
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      សម្រាប់អ្នកគិតលុយ, ម្ចាស់ហាង និងអ្នកធ្វើនំ ទុកសារដំណឹងរវាងវេនការងារ
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">អ្នកផ្ញើបច្ចុប្បន្ន</span>
                  <span className="text-xs font-black text-emerald-700">
                    {currentStaff?.name || 'វិជ្ជតា'} ({currentStaff?.role || 'Admin'})
                  </span>
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const isCurrent = m.senderId === currentStaff?.id || m.senderName === currentStaff?.name;
                  const isSystem = m.senderRole === 'SYSTEM';

                  if (isSystem) {
                    return (
                      <div key={m.id} className="text-center my-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700 inline-block">
                          {m.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2.5 ${isCurrent ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrent && (
                        <div className="w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs mt-0.5">
                          {m.senderAvatar || '👤'}
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-2xs ${
                          isCurrent
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-[10px] font-black ${
                              isCurrent ? 'text-emerald-100' : 'text-emerald-700'
                            }`}
                          >
                            {m.senderName}
                          </span>
                          <span
                            className={`text-[9px] ${
                              isCurrent ? 'text-emerald-200' : 'text-slate-400'
                            }`}
                          >
                            {m.timestamp}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                          {m.text}
                        </p>
                      </div>

                      {isCurrent && (
                        <div className="w-8 h-8 rounded-2xl bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs mt-0.5">
                          {m.senderAvatar || '👤'}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Staff Task Chips */}
              <div className="px-3 py-1.5 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
                <span className="text-[10px] font-bold text-slate-400 shrink-0">សាររហ័ស៖</span>
                {[
                  '🎂 ភ្ញៀវម៉ោង ៤ រសៀល នឹងមកយកនំកុម្ម៉ង់',
                  '🍫 នំខេកសូកូឡាក្នុងទូកញ្ចក់ជិតអស់ហើយ',
                  '🥖 ទើបដុតនំប៉័ងថ្មីៗរួច អាចដាក់តាំងលក់បាន',
                  '📦 គ្រឿងផ្សំប័រ និងម្សៅមីមកដល់ហាងហើយ',
                ].map((note, nidx) => (
                  <button
                    key={nidx}
                    type="button"
                    onClick={() => handleSend(note)}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                  >
                    {note}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="ផ្ញើសារប្រាប់ក្រុមការងារ ឬទុកកំណត់ត្រា..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium"
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
