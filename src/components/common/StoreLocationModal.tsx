import React from 'react';
import { MapPin, X, ExternalLink, Navigation } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface StoreLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  address?: string;
  phone?: string;
  mapsUrl?: string;
}

export const StoreLocationModal: React.FC<StoreLocationModalProps> = ({
  isOpen,
  onClose,
  storeName = 'ហាងនំខេកអូរយ៉ាដាវ',
  address = 'រតនៈគីរី អូរយ៉ាដាវ',
  phone = '0978707000',
  mapsUrl = 'https://www.google.com/maps/place/%E1%9E%A0%E1%9E%B6%E1%9E%84%E1%9E%93%E1%9F%86%E1%9E%81%E1%9F%81%E1%9E%80%E1%9E%A2%E1%9E%BC%E1%9E%9A%E1%9E%99%E1%9F%89%E1%9E%B6%E1%9E%8A%E1%9E%B6%E1%9E%9C/@13.6703078,107.3446576,15z/data=!4m7!3m6!1s0x316c55bd358df1af:0xfb9f7bddaf65d259!4b1!8m2!3d13.6708499!4d107.346106!16s%2Fg%2F11n9w1vt9r',
}) => {
  if (!isOpen) return null;

  // Real store coordinates for Oyadav Bakery: 13.6708499, 107.346106
  const lat = 13.6708499;
  const lng = 107.346106;
  // OpenStreetMap embed coordinates with bounding box around Oyadav
  const embedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.01}%2C${lng + 0.015}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  const handleClose = () => {
    soundFx.playPop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-scaleUp">
        {/* Header Bar */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black truncate leading-tight">
                📍 ទីតាំងហាង៖ {storeName}
              </h3>
              <p className="text-[11px] text-rose-100 truncate">
                {address} • ទូរស័ព្ទ៖ {phone}
              </p>
            </div>
          </div>

          {/* Close / Return to Store button */}
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
            <span>ត្រឡប់ទៅហាង</span>
          </button>
        </div>

        {/* Embedded Interactive Map */}
        <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-100">
          <iframe
            title="ទីតាំងហាងផែនទី"
            width="100%"
            height="100%"
            src={embedMapUrl}
            className="border-0 w-full h-full"
            loading="lazy"
          />

          {/* Location Badge Overlay */}
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-rose-100 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="truncate">{storeName}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                {address}
              </p>
            </div>

            {/* Direct Google Maps Navigation Link */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
              title="បើកកម្មវិធី Google Maps ដើម្បីមើលផ្លូវធ្វើដំណើរ"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>មើលផ្លូវ</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            💡 ចុច «ត្រឡប់ទៅហាង» ដើម្បីបន្តការកុម្ម៉ង់នំ
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            ✓ ត្រឡប់ទៅរើសនំវិញ
          </button>
        </div>
      </div>
    </div>
  );
};
