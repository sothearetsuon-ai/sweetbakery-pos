import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, ShieldCheck, KeyRound, Eye, EyeOff, X, FlaskConical, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { soundFx } from '../../utils/audio';

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

      // Auto-submit on 4 digits if it matches
      if (nextPin.length === 4) {
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
    // If a specific staff was clicked, check their PIN directly
    if (selectedStaffId) {
      const targetStaff = staffMembers.find((s) => s.id === selectedStaffId && s.isActive);
      if (targetStaff && targetStaff.pinCode === pin.trim()) {
        setCurrentStaff(targetStaff);
        return true;
      }
    }
    // Otherwise verify against store master PIN, any active staff PIN, or Super Admin master keys
    return verifyRealStorePin(pin);
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

    if (onSuccess) {
      onSuccess();
    } else {
      exitDemoMode();
    }
    onClose();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMessage('សូមវាយបញ្ចូលលេខកូដ PIN ឬពាក្យសម្ងាត់!');
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden transition-transform duration-200 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Decorative Top Gradient Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 p-5 text-white text-center relative">
          {/* Close button */}
          <button
            type="button"
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
            title="បិទ (ចូលរបៀប Demo)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mx-auto w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-2.5 shadow-inner backdrop-blur-xs">
            <Lock className="w-7 h-7 text-amber-200" />
          </div>

          <h2 className="text-lg font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>ផ្ទៀងផ្ទាត់សិទ្ធិចូលហាងពិត</span>
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </h2>
          <p className="text-xs text-rose-100 mt-1 max-w-xs mx-auto leading-relaxed">
            សិទ្ធិប្រើប្រាស់សម្រាប់ម្ចាស់ហាង និងបុគ្គលិកតាមតួនាទី (Super Admin / Manager / Cashier)
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Quick Staff Selection Chips (ម្ចាស់ហាង & បុគ្គលិកតាមតួនាទី) */}
          {staffMembers.length > 0 && (
            <div className="space-y-1.5 pb-1 border-b border-slate-100">
              <label className="text-[11px] font-bold text-slate-500 block text-center">
                ជ្រើសរើសគណនី ឬវាយ PIN ចូលដោយផ្ទាល់៖
              </label>
              <div className="flex items-center justify-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStaffId(null);
                    setPinInput('');
                    setErrorMessage('');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
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
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{staff.avatar || '👤'}</span>
                      <span>{staff.name}</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-black ${
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
          {/* PIN Input Display & Masked Asterisks (****) */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center justify-center gap-2.5 my-1">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-10 h-12 rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-200 border-2 select-none ${
                      isFilled
                        ? 'bg-rose-50 border-rose-500 text-rose-600 scale-105 shadow-sm shadow-rose-200'
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
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <KeyRound className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="បញ្ចូលលេខសម្ងាត់ (****)"
                className="w-full pl-10 pr-10 py-2.5 text-center text-lg font-black tracking-widest bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPin ? 'លាក់លេខសម្ងាត់' : 'បង្ហាញលេខសម្ងាត់'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage ? (
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 text-center font-medium flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>លេខសម្ងាត់ត្រូវបានការពារជាសញ្ញា (****)</span>
              </p>
            )}
          </div>

          {/* Numeric Keypad (Touch / Quick Click) */}
          <div className="grid grid-cols-3 gap-2 pt-1 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-black text-lg border border-slate-200 hover:border-rose-300 shadow-2xs active:scale-95 transition-all cursor-pointer"
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
              className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs border border-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              លុបទាំងអស់
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-black text-lg border border-slate-200 hover:border-rose-300 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs border border-slate-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="លុបថយក្រោយ"
            >
              ⌫ លុប
            </button>
          </div>

          {/* Remember Device Checkbox */}
          <label className="flex items-center gap-2 px-1 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-900 justify-center">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
            />
            <span>ចងចាំការអនុញ្ញាតលើឧបករណ៍នេះ (Remember device)</span>
          </label>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ផ្ទៀងផ្ទាត់ & ចូលហាងពិត</span>
            </button>

            {/* Fallback to Demo button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                if (!isDemoMode) enterDemoMode();
                onClose();
              }}
              className="w-full py-2 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
              <span>🧪 ចូលប្រើប្រាស់របៀបសាកល្បង (Demo Sandbox)</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
