import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Users, Check, ShieldCheck, KeyRound, ArrowRight, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { StaffMember } from '../../types';
import { soundFx } from '../../utils/audio';

interface StaffDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStaffManagement?: () => void;
}

export const StaffDropdown: React.FC<StaffDropdownProps> = ({
  isOpen,
  onClose,
  onOpenStaffManagement,
}) => {
  const { staffMembers, currentStaff, setCurrentStaff, switchStaffByPin } = useBakery();
  const [isPinMode, setIsPinMode] = useState(false);
  const [selectedStaffForPin, setSelectedStaffForPin] = useState<StaffMember | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPinMode(false);
      setSelectedStaffForPin(null);
      setPinInput('');
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (isPinMode && e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (isPinMode && e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPinMode, pinInput, selectedStaffForPin]);

  if (!isOpen) return null;

  const roleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { labelKh: 'ម្ចាស់ហាង (Admin)', badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'CASHIER':
        return { labelKh: 'បេឡាធិការ (Cashier)', badgeStyle: 'bg-pink-100 text-pink-900 border-pink-300' };
      case 'BAKER':
        return { labelKh: 'មេចុងភៅដុតនំ (Baker)', badgeStyle: 'bg-orange-100 text-orange-900 border-orange-300' };
      case 'INVENTORY':
        return { labelKh: 'គ្រប់គ្រងស្តុក (Stock)', badgeStyle: 'bg-blue-100 text-blue-900 border-blue-300' };
      default:
        return { labelKh: role, badgeStyle: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const handleQuickSwitch = (staff: StaffMember) => {
    if (staff.id === currentStaff.id) return;
    soundFx.playSuccess();
    confetti({ particleCount: 35, spread: 45, origin: { y: 0.1 } });
    setCurrentStaff(staff);
    onClose();
  };

  const handleSelectStaffForPin = (staff: StaffMember) => {
    soundFx.playPop();
    setSelectedStaffForPin(staff);
    setIsPinMode(true);
    setPinInput('');
    setErrorMessage('');
  };

  const handleKeypadPress = (num: string) => {
    soundFx.playPop();
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setErrorMessage('');

      if (nextPin.length === 4) {
        verifyPinAndSwitch(selectedStaffForPin, nextPin);
      }
    }
  };

  const handleBackspace = () => {
    soundFx.playPop();
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const verifyPinAndSwitch = (targetStaff: StaffMember | null, pin: string) => {
    if (!targetStaff) {
      const success = switchStaffByPin(pin);
      if (success) {
        soundFx.playSuccess();
        confetti({ particleCount: 40, spread: 45, origin: { y: 0.1 } });
        onClose();
      } else {
        soundFx.playPop();
        setErrorMessage('លេខកូដ PIN មិនត្រឹមត្រូវទេ!');
        setPinInput('');
      }
      return;
    }

    if (targetStaff.pinCode === pin) {
      soundFx.playSuccess();
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.1 } });
      setCurrentStaff(targetStaff);
      setTimeout(() => {
        onClose();
      }, 250);
    } else {
      soundFx.playPop();
      setErrorMessage('លេខកូដ PIN មិនត្រឹមត្រូវ!');
      setPinInput('');
    }
  };

  const { labelKh: currentRoleLabel, badgeStyle: currentBadgeStyle } = roleLabel(currentStaff.role);

  return (
    <>
      {/* Invisible backdrop to dismiss on outside click */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
        onClick={() => {
          soundFx.playPop();
          onClose();
        }}
      />

      {/* Dropdown Floating Panel anchored directly under top button */}
      <div
        ref={dropdownRef}
        className="absolute top-full right-0 mt-2 z-50 w-84 sm:w-96 bg-white rounded-3xl shadow-2xl border border-rose-200/90 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-3 duration-200"
      >
        {/* Header: Current Active Staff Banner */}
        <div className="p-4 bg-gradient-to-r from-purple-50 via-pink-50/70 to-amber-50/40 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-purple-200 flex items-center justify-center text-2xl shadow-sm">
              {currentStaff.avatar || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">កំពុងប្រើប្រាស់៖</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h4 className="font-black text-slate-800 text-sm">{currentStaff.name}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md border inline-block mt-0.5 ${currentBadgeStyle}`}>
                {currentRoleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/80 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-3.5 space-y-3 max-h-[75vh] overflow-y-auto">
          {!isPinMode ? (
            /* Quick Switch Mode (Default) */
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  ប្តូរទៅកាន់បុគ្គលិកផ្សេង (Switch Staff)
                </span>
                <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                  ចុច ១ ដងប្តូរភ្លាម ✨
                </span>
              </div>

              {/* Staff List */}
              <div className="space-y-1.5">
                {staffMembers.map((staff) => {
                  const isCurrent = staff.id === currentStaff.id;
                  const { labelKh, badgeStyle } = roleLabel(staff.role);

                  return (
                    <div
                      key={staff.id}
                      onClick={() => handleQuickSwitch(staff)}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'border-emerald-300 bg-emerald-50/50 shadow-2xs'
                          : 'border-slate-100 bg-white hover:border-pink-300 hover:bg-pink-50/40 hover:shadow-xs group'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                          {staff.avatar || '👤'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-800 text-xs truncate">
                              {staff.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold shrink-0">
                                កំពុងប្រើ
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badgeStyle}`}>
                              {labelKh}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              PIN: <strong className="text-slate-600">{staff.pinCode}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isCurrent ? (
                          <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectStaffForPin(staff);
                              }}
                              title="វាយលេខកូដ PIN 4 ខ្ទង់"
                              className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-500 hover:text-purple-700 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickSwitch(staff);
                              }}
                              title="ប្តូរចូលប្រើភ្លាមៗ"
                              className="px-2.5 py-1 bg-pink-50 hover:bg-pink-600 text-pink-700 hover:text-white border border-pink-200 hover:border-pink-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>ប្តូរ</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* PIN Input Mode */
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  onClick={() => setIsPinMode(false)}
                  className="text-xs text-slate-500 hover:text-pink-600 font-bold flex items-center gap-1 cursor-pointer"
                >
                  ← ត្រឡប់ក្រោយ
                </button>
                <span className="text-xs font-black text-slate-700">វាយលេខកូដ PIN 4 ខ្ទង់</span>
              </div>

              {selectedStaffForPin && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 mb-1">
                    <span className="text-base">{selectedStaffForPin.avatar || '👤'}</span>
                    <span className="font-black text-xs text-slate-800">{selectedStaffForPin.name}</span>
                    <span className="text-[10px] text-pink-600 font-mono font-black">
                      (PIN: {selectedStaffForPin.pinCode})
                    </span>
                  </div>

                  {/* PIN Dots */}
                  <div className="flex items-center justify-center gap-2.5 my-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                          pinInput.length > i
                            ? 'bg-pink-600 border-pink-600 scale-125 shadow-xs'
                            : 'bg-white border-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  {errorMessage && (
                    <p className="text-[11px] text-rose-600 font-bold">{errorMessage}</p>
                  )}
                </div>
              )}

              {/* Compact Keypad */}
              <div className="grid grid-cols-3 gap-1.5 max-w-[190px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-9 rounded-xl bg-slate-50 hover:bg-pink-50 hover:border-pink-300 text-slate-800 font-black text-xs border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput('')}
                  className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-9 rounded-xl bg-slate-50 hover:bg-pink-50 hover:border-pink-300 text-slate-800 font-black text-xs border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>

              {selectedStaffForPin && (
                <button
                  type="button"
                  onClick={() => handleQuickSwitch(selectedStaffForPin)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>ចូលភ្លាមៗដោយមិនបាច់វាយ PIN</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer: Link to Staff Management */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          {onOpenStaffManagement ? (
            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
                onOpenStaffManagement();
              }}
              className="w-full py-1.5 rounded-xl bg-white hover:bg-purple-50 hover:border-purple-300 text-purple-800 border border-slate-200 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>គ្រប់គ្រងបុគ្គលិក & កំណត់សិទ្ធិ 👥</span>
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 mx-auto">SweetBakery POS • Staff Auth</span>
          )}
        </div>
      </div>
    </>
  );
};
