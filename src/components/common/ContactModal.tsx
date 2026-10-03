import React, { useState } from 'react';
import {
  X,
  Phone,
  PhoneCall,
  Send,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cake,
  ExternalLink,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const phoneNumber = '012 629 160';
  const rawPhone = '012629160';
  const telegramText = encodeURIComponent(
    'ជំរាបសួរ! ខ្ញុំមានចំណាប់អារម្មណ៍ចង់ប្រើប្រាស់កម្មវិធី SweetBakery POS សម្រាប់គ្រប់គ្រងហាងនំ។ សូមផ្តល់ព័ត៌មានបន្ថែម។ សូមអរគុណ!'
  );

  const handleCopyPhone = () => {
    soundFx.playPop();
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-[#FF6F68] to-[#E6514D] text-white rounded-2xl shadow-md shadow-[#E6514D]/25">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base font-battambang">
                ទំនាក់ទំនងប្រព័ន្ធ (Contact)
              </h3>
              <p className="text-xs text-rose-600 font-bold">SweetBakery POS System</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Main Inquiry Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-amber-500/10 border-2 border-rose-200/80 shadow-xs text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>ប្រព័ន្ធគ្រប់គ្រងហាងនំទំនើប</span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug font-battambang">
              ប្រសិនបើអ្នកមានចំណាប់អារម្មណ៍ចង់ប្រើប្រាស់កម្មវិធីនេះសូមទាក់ទង
            </h4>

            {/* Prominent Phone Highlight */}
            <div className="p-3.5 bg-white rounded-2xl border-2 border-[#E6514D]/30 shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">លេខទូរសព្ទ័ទំនាក់ទំនង</span>
                  <span className="text-base sm:text-lg font-black text-emerald-600 font-mono tracking-wide">
                    {phoneNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyPhone}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="ចម្លងលេខទូរសព្ទ"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">បានចម្លង</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>ចម្លង</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <a
                href={`tel:${rawPhone}`}
                className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>ខលឥឡូវនេះ</span>
              </a>

              <a
                href={`https://t.me/share/url?url=&text=${telegramText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-gradient-to-r from-[#229ED9] to-[#1E88E5] hover:brightness-105 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </a>
            </div>
          </div>

          {/* Key Advantages / Features Overview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
              ✨ មុខងារពិសេសៗរបស់ SweetBakery POS៖
            </span>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>គិតលុយរហ័ស ស្កេន KHQR Bakong ស្វ័យប្រវត្តិកាត់លុយ</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>គ្រប់គ្រងការកុម្ម៉ង់នំខួបកំណើត (Custom Cake Order)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>គ្រប់គ្រងស្តុកទំនិញ ចំណាយចំណូល និងរបាយការណ៍លក់</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>ដំណើរការបានទាំង Offline គ្មានអ៊ីនធឺណិត និង Cloud Real-Time</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              SweetBakery POS • រួសរាន់ឡើងដើម្បីទទួលបានការដំឡើង និងការប្រឹក្សាដោយឥតគិតថ្លៃ!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
