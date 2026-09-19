import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCw,
  X,
  Check,
  RefreshCw,
  Sparkles,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { compressImageFile } from '../../utils/imageCompressor';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'ថតរូបភាពផ្ទាល់ពីកាម៉េរ៉ា (Live Camera)',
  subtitle = 'ថតរូបភាពនំ ឬបង្កាន់ដៃដោយផ្ទាល់ពីកាម៉េរ៉ាទូរស័ព្ទ ឬកុំព្យូទ័រ',
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      setIsLoadingCamera(true);
      setError(null);
      stopCamera();

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('browser_not_supported');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('សូមអនុញ្ញាត (Allow) សិទ្ធិចូលប្រើកាម៉េរ៉ាក្នុងកម្មវិធីរុករក (Browser Permission) ដើម្បីថតរូប។');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('មិនមានឧបករណ៍កាម៉េរ៉ាត្រូវបានរកឃើញនៅលើឧបករណ៍នេះទេ។');
        } else {
          setError('មិនអាចបើកកាម៉េរ៉ាបានទេ សូមសាកល្បងជ្រើសរើសរូបពីវិចិត្រសាល (Gallery) ជំនួសវិញ។');
        }
      } finally {
        setIsLoadingCamera(false);
      }
    },
    [stopCamera]
  );

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  // Ensure video stream connects if video element mounts late
  useEffect(() => {
    if (videoRef.current && stream && !capturedImage) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, capturedImage]);

  if (!isOpen) return null;

  const handleFlipCamera = () => {
    soundFx.playPop();
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    soundFx.playPop();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Compress to web-friendly JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    soundFx.playPop();
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    soundFx.playSuccess();
    onCapture(capturedImage);
    stopCamera();
    onClose();
  };

  const handleFallbackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImageFile(file, 800, 800, 0.8);
      soundFx.playSuccess();
      onCapture(base64);
      stopCamera();
      onClose();
    } catch (err) {
      console.error('Fallback image compression error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-white">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-xl text-white shadow-md shadow-pink-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>{title}</span>
                <span className="text-[10px] bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full font-bold">
                  HD Live
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Capture Area */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {/* Flash Effect */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200" />
          )}

          {capturedImage ? (
            /* Image Preview */
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>ថតបានជោគជ័យ!</span>
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-pink-400" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-pink-400" />
                </div>
                <div className="self-center bg-black/40 backdrop-blur-xs text-[11px] text-white/90 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span>តម្រង់វត្ថុ ឬនំឱ្យចំកណ្តាល</span>
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-pink-400" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-pink-400" />
                </div>
              </div>

              {/* Loading indicator */}
              {isLoadingCamera && (
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
                  <span className="text-xs font-bold text-slate-300">កំពុងតភ្ជាប់កាម៉េរ៉ា...</span>
                </div>
              )}

              {/* Error fallback message */}
              {error && (
                <div className="absolute inset-4 bg-slate-900/95 border border-rose-500/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3">
                  <AlertCircle className="w-10 h-10 text-rose-400" />
                  <p className="text-xs text-rose-200 font-medium max-w-sm">{error}</p>
                  <button
                    type="button"
                    onClick={() => fileFallbackRef.current?.click()}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>ជ្រើសរើសរូបពីវិចិត្រសាល (Gallery)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Fallback Input */}
        <input
          ref={fileFallbackRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFallbackFile}
          className="hidden"
        />

        {/* Bottom Controls */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {capturedImage ? (
            /* Actions when photo is taken */
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-700 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>🔄 ថតម្តងទៀត (Retake)</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>✓ ប្រើប្រាស់រូបនេះ (Use Photo)</span>
              </button>
            </div>
          ) : (
            /* Controls during live camera */
            <div className="flex items-center justify-between w-full">
              {/* Fallback upload button */}
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                title="ជ្រើសរើសរូបពីកុំព្យូទ័រ / ទូរស័ព្ទ"
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer border border-slate-700 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              >
                <Upload className="w-4 h-4 text-pink-400" />
                <span className="hidden sm:inline">ជ្រើសរូបពី File</span>
              </button>

              {/* Big Shutter Button */}
              <button
                type="button"
                disabled={Boolean(error) || isLoadingCamera}
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 p-1 shadow-xl shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-4 border-white/90 bg-white/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white shadow-inner" />
                </div>
              </button>

              {/* Flip camera button */}
              <button
                type="button"
                onClick={handleFlipCamera}
                title="ប្តូរកាម៉េរ៉ា មុខ / ក្រោយ"
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer border border-slate-700 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              >
                <RotateCw className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">
                  {facingMode === 'environment' ? 'កាម៉េរ៉ាមុខ' : 'កាម៉េរ៉ាក្រោយ'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
