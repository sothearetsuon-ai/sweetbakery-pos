import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrCodeIcon, AlertCircle } from 'lucide-react';

interface QrCodeImageProps {
  data: string;
  size?: number;
  className?: string;
  alt?: string;
  margin?: number;
}

export const QrCodeImage: React.FC<QrCodeImageProps> = ({
  data,
  size = 220,
  className = 'w-full h-full object-contain',
  alt = 'QR Code',
  margin = 1,
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (!data || !data.trim()) {
      setSvgContent('');
      setHasError(false);
      setErrorMessage('');
      return;
    }

    setHasError(false);
    setErrorMessage('');

    const qrLib = (QRCode as any).default || QRCode;

    // Use pure SVG generation: 100% vector, offline, zero canvas/network dependency, zero broken image icons
    qrLib
      .toString(data.trim(), {
        type: 'svg',
        margin,
        errorCorrectionLevel: 'L', // Low error correction level gives highest data capacity and fastest scanning
        width: size,
      })
      .then((svg: string) => {
        if (isMounted) {
          setSvgContent(svg);
        }
      })
      .catch((err: any) => {
        console.warn('Local SVG QR generation failed, trying fallback toDataURL:', err);
        // Fallback: try toDataURL
        qrLib
          .toDataURL(data.trim(), {
            width: size * 2,
            margin,
            errorCorrectionLevel: 'L',
          })
          .then((dataUrl: string) => {
            if (isMounted) {
              setSvgContent(`<img src="${dataUrl}" alt="${alt}" class="${className}" style="width:100%;height:100%;object-fit:contain;" />`);
            }
          })
          .catch((canvasErr: any) => {
            console.error('All local QR generators failed:', canvasErr);
            if (isMounted) {
              setHasError(true);
              setErrorMessage(err?.message || 'ទិន្នន័យលើសទំហំ QR Code');
            }
          });
      });

    return () => {
      isMounted = false;
    };
  }, [data, size, margin, alt, className]);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-2 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-700 font-battambang ${className}`}
        style={{ width: size, height: size }}
      >
        <AlertCircle className="w-6 h-6 text-rose-500 mb-1" />
        <span className="text-[10px] font-bold">QR Code មិនអាចបង្ហាញបាន</span>
        <span className="text-[8px] text-rose-500 line-clamp-1">{errorMessage}</span>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl animate-pulse text-slate-400 ${className}`}
        style={{ width: size, height: size }}
      >
        <QrCodeIcon className="w-6 h-6 mb-1 opacity-50" />
        <span className="text-[10px] font-bold font-mono">កំពុងបង្កើត QR...</span>
      </div>
    );
  }

  // Render inline SVG
  if (svgContent.startsWith('<svg')) {
    return (
      <div
        className={`inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block ${className}`}
        style={{ width: size, height: size }}
        aria-label={alt}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  // If fallback img tag string was set
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={alt}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
