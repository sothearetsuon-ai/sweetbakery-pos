import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, ShieldCheck, KeyRound, Eye, EyeOff, X, FlaskConical, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';
import { setStoreId, DEFAULT_STORE_ID } from '../../services/firebase';

interface RealStoreAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RealStoreAuthModal: React.FC<RealStoreAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    verifyRealStorePin,
    exitDemoMode,
    enterDemoMode,
    isDemoMode,
    staffMembers,
    currentStaff,
    setCurrentStaff,
  } = useBakery();
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMessage('');
      setIsShaking(false);
      setSelectedStaffId(null);
    }
  }, [isOpen]);

  // Physical Keyboard Support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pinInput, rememberDevice, selectedStaffId]);

  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    soundFx.playPop();
    if (pinInput.length < 12) {
      const nextPin = pinInput + char;
      setPinInput(nextPin);
      setErrorMessage('');

      // Auto-submit when PIN length >= 4 and matches any staff member or master key
      if (nextPin.length >= 4) {
        if (checkAndAuthenticate(nextPin)) {
          triggerSuccess();
        }
      }
    }
  };

  const handleBackspace = () => {
    soundFx.playPop();
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const checkAndAuthenticate = (pin: string): boolean => {
    const clean = pin.trim();
    if (clean === '1111' || clean === '2222') {
      setErrorMessage('លេខកូដ 1111 និង 2222 សម្រាប់តែរបៀប Demo និងហាងសាកល្បងប៉ុណ្ណោះ! សូមប្រើលេខកូដហាងពិត (660168 / 0202)។');
      return false;
    }
    // If a specific staff was clicked, check their PIN directly
    if (selectedStaffId) {
      const targetStaff = staffMembers.find((s) => s.id === selectedStaffId && s.isActive !== false);
      if (targetStaff && targetStaff.pinCode === clean && clean !== '1111' && clean !== '2222') {
        setCurrentStaff(targetStaff);
        return true;
      }
    }
    // Otherwise verify against store master PIN, any active staff PIN, or Super Admin master keys
    return verifyRealStorePin(clean);
  };

  const triggerSuccess = () => {
    soundFx.playSuccess();
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    // Mark session as authenticated for real store (ហាងវិជ្ជតា)
    sessionStorage.setItem('bakery_real_store_unlocked', 'true');
    localStorage.setItem('bakery_is_primary_store', 'true');
    if (rememberDevice) {
      localStorage.setItem('bakery_real_store_authorized_device', 'true');
    }
    setStoreId(DEFAULT_STORE_ID);

    if (onSuccess) {
      onSuccess();
    } else {
      exitDemoMode();
    }
    onClose();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pinInput.trim();
    if (!clean) {
      setErrorMessage('សូមវាយបញ្ចូលលេខកូដ PIN ឬពាក្យសម្ងាត់!');
      return;
    }

    if (clean === '1111' || clean === '2222') {
      soundFx.playPop();
      setIsShaking(true);
      setErrorMessage('លេខកូដ 1111 និង 2222 សម្រាប់តែរបៀប Demo និងហាងសាកល្បងប៉ុណ្ណោះ! សូមប្រើលេខកូដហាងពិត (660168 / 0202)។');
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const isValid = checkAndAuthenticate(pinInput);
    if (isValid) {
      triggerSuccess();
    } else {
      soundFx.playPop();
      setIsShaking(true);
      setErrorMessage('លេខសម្ងាត់មិនត្រឹមត្រូវឡើយ! សូមព្យាយាមម្តងទៀត។');
      setTimeout(() => setIsShaking(false), 500);
      setPinInput('');
    }
  };

  const handleCancel = () => {
    // If not in demo mode yet and user cancels authentication, safely put them in Demo mode
    if (!isDemoMode) {
      enterDemoMode();
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className={`relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col max-h-[92vh] overflow-hidden transition-transform duration-200 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Compact Top Header Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 px-4 py-3 sm:px-5 sm:py-3.5 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner backdrop-blur-xs shrink-0">
              <Lock className="w-5 h-5 text-amber-200" />
            </div>
            <div className="text-left">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-tight">
                <span>ផ្ទៀងផ្ទាត់សិទ្ធិចូលហាងពិត</span>
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              </h2>
              <p className="text-[11px] text-rose-100/90 leading-tight">
                បញ្ចូលលេខកូដសម្ងាត់ (PIN) ដើម្បីចូលប្រើប្រាស់
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer shrink-0 ml-2"
            title="បិទ (ចូលរបៀប Demo)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 overflow-y-auto flex-1">
          {/* Quick Staff Selection Chips (ម្ចាស់ហាង & បុគ្គលិកតាមតួនាទី) */}
          {staffMembers.length > 0 && (
            <div className="space-y-1 pb-1.5 border-b border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">ជ្រើសរើសគណនី ឬវាយ PIN ចូល៖</span>
                <span className="text-[10px] text-slate-400">({staffMembers.filter((s) => s.isActive).length} នាក់)</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-h-16 scrollbar-none">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStaffId(null);
                    setPinInput('');
                    setErrorMessage('');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer shrink-0 ${
                    selectedStaffId === null
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Auto Detect PIN
                </button>
                {staffMembers.filter((s) => s.isActive).map((staff) => {
                  const isSelected = selectedStaffId === staff.id;
                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => {
                        setSelectedStaffId(staff.id);
                        setPinInput('');
                        setErrorMessage('');
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs scale-102'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{staff.avatar || '👤'}</span>
                      <span className="truncate max-w-[85px]">{staff.name}</span>
                      <span className={`text-[8px] px-1 py-0.2 rounded font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {staff.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PIN Input Display & Masked Dots */}
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 py-0.5">
              {Array.from({ length: Math.max(4, Math.min(8, pinInput.length)) }).map((_, idx) => {
                const isFilled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-sm sm:text-base transition-all duration-150 border-2 select-none ${
                      isFilled
                        ? 'bg-rose-50 border-rose-500 text-rose-600 scale-105 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {isFilled ? '✱' : '•'}
                  </div>
                );
              })}
            </div>

            {/* Input Field with Show/Hide toggle */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="បញ្ចូលលេខសម្ងាត់ PIN"
                className="w-full pl-9 pr-9 py-2 text-center text-base sm:text-lg font-black tracking-widest bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPin ? 'លាក់លេខសម្ងាត់' : 'បង្ហាញលេខសម្ងាត់'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage ? (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 text-center font-medium">
                វាយលេខលើក្តារចុច (Keyboard) ឬចុចប៊ូតុងខាងក្រោម
              </p>
            )}
          </div>

          {/* Numeric Keypad (Touch / Quick Click) */}
          <div className="grid grid-cols-3 gap-1.5 max-w-[260px] mx-auto w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-8 sm:h-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-black text-base border border-slate-200 hover:border-rose-300 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setPinInput('');
                setErrorMessage('');
              }}
              className="h-8 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] border border-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              លុប
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-8 sm:h-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-black text-base border border-slate-200 hover:border-rose-300 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-8 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] border border-slate-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="លុបថយក្រោយ"
            >
              ⌫
            </button>
          </div>

          {/* Remember Device Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-600 hover:text-slate-900 justify-center">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
            />
            <span>ចងចាំការអនុញ្ញាតលើឧបករណ៍នេះ (Remember device)</span>
          </label>
        </div>

        {/* Modal Footer - Always Visible Action Buttons (កន្លែងចូល) */}
        <div className="p-3 sm:p-3.5 bg-slate-50 border-t border-slate-100 shrink-0 space-y-1.5">
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-rose-500/20"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>ផ្ទៀងផ្ទាត់ & ចូលហាងពិត (Enter) ➜</span>
          </button>

          {/* Fallback to Demo button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              if (!isDemoMode) enterDemoMode();
              onClose();
            }}
            className="w-full py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
            <span>🧪 ចូលប្រើប្រាស់របៀបសាកល្បង (Demo Sandbox)</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
