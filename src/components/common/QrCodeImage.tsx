import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

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
  const [dataUrl, setDataUrl] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!data || !data.trim()) {
      setDataUrl('');
      return;
    }

    setHasError(false);

    QRCode.toDataURL(data.trim(), {
      width: size * 2, // render 2x for sharp retina display
      margin,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
        }
      })
      .catch((err) => {
        console.warn('Local QRCode generator warning:', err);
        // Fallback to online generator if local fails for any reason
        if (isMounted) {
          setDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [data, size, margin]);

  if (!dataUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-lg animate-pulse ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-slate-400 font-bold">QR...</span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

