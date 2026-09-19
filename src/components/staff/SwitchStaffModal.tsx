import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Sparkles, ArrowRight, ShieldCheck, Check, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { StaffMember } from '../../types';
import { soundFx } from '../../utils/audio';

interface SwitchStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchStaffModal: React.FC<SwitchStaffModalProps> = ({ isOpen, onClose }) => {
  const { staffMembers, currentStaff, setCurrentStaff, switchStaffByPin } = useBakery();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Default to current staff when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedStaff(currentStaff);
      setPinInput('');
      setErrorMessage('');
    }
  }, [isOpen, currentStaff]);

  // Physical Keyboard Support (0-9, Backspace, Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pinInput, selectedStaff]);

  if (!isOpen) return null;

  const handleSelectStaffDirect = (staff: StaffMember) => {
    soundFx.playPop();
    setSelectedStaff(staff);
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
        verifyAndSwitch(selectedStaff, nextPin);
      }
    }
  };

  const handleBackspace = () => {
    soundFx.playPop();
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const verifyAndSwitch = (targetStaff: StaffMember | null, pin: string) => {
    if (!targetStaff) {
      const success = switchStaffByPin(pin);
      if (success) {
        soundFx.playSuccess();
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
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
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      setCurrentStaff(targetStaff);
      setTimeout(() => {
        onClose();
        setPinInput('');
      }, 300);
    } else {
      soundFx.playPop();
      setErrorMessage('លេខកូដ PIN មិនត្រឹមត្រូវសម្រាប់បុគ្គលិកនេះ!');
      setPinInput('');
    }
  };

  const handleQuickSwitch = (staff: StaffMember) => {
    soundFx.playSuccess();
    confetti({ particleCount: 40, spread: 45, origin: { y: 0.6 } });
    setCurrentStaff(staff);
    onClose();
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { labelKh: 'ម្ចាស់ហាង (Admin)', badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'MANAGER':
        return { labelKh: 'ប្រធានហាង (Manager)', badgeStyle: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'CASHIER':
        return { labelKh: 'អ្នកគិតលុយ (Cashier)', badgeStyle: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'BAKER':
        return { labelKh: 'ចុងភៅនំ (Baker)', badgeStyle: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { labelKh: role, badgeStyle: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const activeTarget = selectedStaff || currentStaff;
  const { labelKh: targetRoleLabel, badgeStyle: targetBadgeStyle } = roleLabel(activeTarget.role);

  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-3 sm:pt-6 pb-6 px-3 sm:px-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-amber-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <span>ប្តូរគណនីបុគ្គលិក</span>
                <span className="text-xs font-semibold text-pink-600 bg-pink-100/70 px-2 py-0.5 rounded-full">
                  PIN Auth
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                ជ្រើសរើសបុគ្គលិក និងវាយលេខកូដ PIN 4 ខ្ទង់ដើម្បីប្តូរសិទ្ធិប្រើប្រាស់
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* Left Column: Staff Cards Grid (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  ជ្រើសរើសបុគ្គលិក ({staffMembers.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  ចុចលើកាតដើម្បីជ្រើស
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staffMembers.map((staff) => {
                  const isCurrent = staff.id === currentStaff.id;
                  const isSelected = activeTarget.id === staff.id;
                  const { labelKh, badgeStyle } = roleLabel(staff.role);

                  return (
                    <div
                      key={staff.id}
                      onClick={() => handleSelectStaffDirect(staff)}
                      className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer relative group ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50/60 shadow-md ring-2 ring-pink-400/20'
                          : isCurrent
                          ? 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-400'
                          : 'border-slate-200/80 bg-white hover:border-pink-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-2xl shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                          {staff.avatar || '👤'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-slate-800 text-xs truncate">
                              {staff.name}
                            </h4>
                            {isCurrent && (
                              <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold shrink-0">
                                កំពុងប្រើ
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 truncate max-w-full ${badgeStyle}`}
                          >
                            {labelKh}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Action */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-mono">
                          PIN: <strong className="text-slate-600">{staff.pinCode}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickSwitch(staff);
                          }}
                          className="px-2 py-0.5 bg-white hover:bg-pink-600 hover:text-white text-pink-600 border border-pink-200 rounded-lg text-[10px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          title="ចូលប្រើភ្លាមៗដោយមិនបាច់វាយ PIN"
                        >
                          <span>ចូលភ្លាម</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hint Box */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5 text-[11px] text-amber-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>គន្លឹះ៖</strong> ចុច <strong>«ចូលភ្លាម»</strong> ដើម្បីផ្លាស់ប្តូរតួនាទីសាកល្បងភ្លាមៗដោយមិនបាច់វាយលេខសម្ងាត់!
              </span>
            </div>
          </div>

          {/* Right Column: PIN Keypad Terminal (5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-50 to-rose-50/30 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
            <div>
              {/* Active Profile Info */}
              <div className="text-center pb-2 border-b border-slate-200/60">
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs mb-1">
                  <span className="text-lg">{activeTarget.avatar || '👤'}</span>
                  <span className="font-black text-xs text-slate-800">{activeTarget.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${targetBadgeStyle}`}>
                    {targetRoleLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  វាយលេខកូដ PIN 4 ខ្ទង់ (PIN សាកល្បង: <strong className="text-pink-600 font-mono text-xs">{activeTarget.pinCode}</strong>)
                </div>

                {/* 4 PIN Dots */}
                <div className="flex items-center justify-center gap-3 my-2">
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

                {/* Error message */}
                {errorMessage && (
                  <p className="text-[11px] text-rose-600 font-bold bg-rose-50 py-0.5 px-2 rounded-lg inline-block animate-shake">
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-1.5 max-w-[210px] mx-auto mt-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-10 rounded-xl bg-white hover:bg-pink-50 hover:border-pink-300 text-slate-800 font-black text-sm border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput('')}
                  className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  title="លុបទាំងអស់"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-10 rounded-xl bg-white hover:bg-pink-50 hover:border-pink-300 text-slate-800 font-black text-sm border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  title="លុបមួយខ្ទង់"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Quick Switch CTA */}
            <div className="pt-2 border-t border-slate-200/60 mt-2">
              <button
                type="button"
                onClick={() => handleQuickSwitch(activeTarget)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-black text-xs shadow-md shadow-pink-500/20 transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ចូលប្រើគណនី {activeTarget.name} ភ្លាមៗ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>⌨️ អាចចុចលេខផ្ទាល់លើ Keyboard កុំព្យូទ័របាន (0-9, Backspace, Esc)</span>
          <span className="font-semibold text-pink-600">SweetBakery Staff Auth</span>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
