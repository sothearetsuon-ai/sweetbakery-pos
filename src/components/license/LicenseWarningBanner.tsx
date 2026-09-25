import React from 'react';
import { AlertTriangle, Key } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface LicenseWarningBannerProps {
  daysRemaining: number;
  onOpenRenewModal: () => void;
}

export const LicenseWarningBanner: React.FC<LicenseWarningBannerProps> = ({
  daysRemaining,
  onOpenRenewModal,
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-4 py-2 text-xs font-bold shadow-md flex items-center justify-between gap-2 z-40 relative">
      <div className="flex items-center gap-2 overflow-hidden">
        <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce text-amber-200" />
        <span className="truncate">
          ⚠️ <strong>ដំណឹងសុពលភាព៖</strong> រយៈពេលប្រើប្រាស់សាកល្បងនៅសល់ត្រឹមតែ{' '}
          <span className="underline font-black text-amber-200">{daysRemaining} ថ្ងៃ</span> ទៀតប៉ុណ្ណោះ!
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          soundFx.playPop();
          onOpenRenewModal();
        }}
        className="shrink-0 px-3 py-1 bg-white text-orange-700 hover:bg-orange-50 rounded-xl font-black text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
      >
        <Key className="w-3.5 h-3.5" />
        <span>បញ្ចូលកូដបន្តសុពលភាព</span>
      </button>
    </div>
  );
};
