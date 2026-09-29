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
  Zap,
  ZapOff,
  Sun,
  WifiOff,
  Lightbulb,
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

  // Lighting & Flash System
  const [hasHardwareTorch, setHasHardwareTorch] = useState(false);
  const [isTorchActive, setIsTorchActive] = useState(false);
  const [screenLightActive, setScreenLightActive] = useState(false);
  const [flashAuto, setFlashAuto] = useState(false);

  // Network State
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement | null>(null);
  const torchActiveRef = useRef(false);

  useEffect(() => {
    torchActiveRef.current = isTorchActive;
  }, [isTorchActive]);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track && torchActiveRef.current) {
        try {
          (track as any).applyConstraints({ advanced: [{ torch: false }] });
        } catch (e) {
          // ignore
        }
      }
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsTorchActive(false);
  }, [stream]);

  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      setIsLoadingCamera(true);
      setError(null);
      stopCamera();

      try {
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
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

        // Check if device supports hardware flashlight/torch
        const track = mediaStream.getVideoTracks()[0];
        if (track) {
          try {
            const caps = (track.getCapabilities && track.getCapabilities()) as any;
            if (caps && 'torch' in caps) {
              setHasHardwareTorch(true);
            } else {
              setHasHardwareTorch(false);
            }
          } catch (e) {
            setHasHardwareTorch(false);
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('សូមអនុញ្ញាត (Allow) សិទ្ធិចូលប្រើកាម៉េរ៉ាក្នុងកម្មវិធីរុករក ដើម្បីថតរូបផ្ទាល់ ឬប្រើប៊ូតុងកាម៉េរ៉ាខាងក្រោម។');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('មិនមានឧបករណ៍កាម៉េរ៉ា WebRTC ផ្ទាល់ទេ។ លោកអ្នកអាចចុចថតរូបតាមកាម៉េរ៉ាទូរស័ព្ទ (Native Camera) បានយ៉ាងស្រួល។');
        } else {
          setError('កាម៉េរ៉ា WebRTC មិនអាចបើកបានលើបណ្តាញនេះទេ។ ចុចប៊ូតុងថតដើម្បីបើកកាម៉េរ៉ាទូរស័ព្ទភ្លាមៗ (១០០% Offline Ready)។');
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
    setIsTorchActive(false);
    setFacingMode(nextMode);
  };

  // Toggle Torch / Flash / Screen Light
  const handleToggleLight = async () => {
    soundFx.playPop();

    // 1. If hardware torch is supported on the back camera, toggle physical LED torch
    if (stream && hasHardwareTorch && facingMode === 'environment') {
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          const nextTorchState = !isTorchActive;
          await (track as any).applyConstraints({
            advanced: [{ torch: nextTorchState }],
          });
          setIsTorchActive(nextTorchState);
          // If turning on torch, we don't need screen light
          if (nextTorchState) {
            setScreenLightActive(false);
          }
          return;
        } catch (e) {
          console.warn('Hardware torch error, falling back to screen light:', e);
        }
      }
    }

    // 2. Fallback / Front Camera / Desktop: Toggle Screen Ring Light (ពន្លឺអេក្រង់ជំនួយ)
    setScreenLightActive((prev) => !prev);
  };

  const handleCapture = async () => {
    // If WebRTC camera stream is unavailable or in error, trigger native phone camera directly!
    if (!videoRef.current || error || !stream) {
      soundFx.playPop();
      fileFallbackRef.current?.click();
      return;
    }

    soundFx.playPop();

    // Shutter flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 240);

    // Pulse torch if auto flash is active and torch isn't already on
    const track = stream.getVideoTracks()[0];
    if (track && hasHardwareTorch && !isTorchActive && flashAuto) {
      try {
        await (track as any).applyConstraints({ advanced: [{ torch: true }] });
        setTimeout(() => {
          try {
            (track as any).applyConstraints({ advanced: [{ torch: false }] });
          } catch (e) {}
        }, 300);
      } catch (e) {}
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    // Scale down to max 800px on either dimension to ensure lightweight storage (~40KB-70KB)
    // This completely avoids exceeding localStorage/IndexedDB quotas when offline!
    const maxDim = 800;
    let targetW = video.videoWidth || 800;
    let targetH = video.videoHeight || 600;

    if (targetW > maxDim || targetH > maxDim) {
      if (targetW > targetH) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW * maxDim) / targetH);
        targetH = maxDim;
      }
    }

    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, targetW, targetH);

    // Compress to web-friendly lightweight JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    soundFx.playPop();
    setCapturedImage(null);
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      startCamera(facingMode);
    } else {
      fileFallbackRef.current?.click();
    }
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    soundFx.playSuccess();
    onCapture(capturedImage);
    stopCamera();
    onClose();
  };

  // Fallback for native camera / file upload (100% offline & local network compatible)
  const handleFallbackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so retaking or choosing another photo triggers onChange properly
    e.target.value = '';

    try {
      const base64 = await compressImageFile(file, 800, 800, 0.82);
      soundFx.playSuccess();
      setCapturedImage(base64);
      stopCamera();
    } catch (err) {
      console.error('Fallback image compression error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border ${
          screenLightActive
            ? 'border-white shadow-[0_0_60px_rgba(255,255,255,0.7)]'
            : 'border-slate-700/80 shadow-2xl'
        } rounded-3xl max-w-xl w-full overflow-hidden flex flex-col max-h-[95vh] text-white transition-all duration-300`}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-xl text-white shadow-md shadow-pink-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>{title}</span>
                {isOffline ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Offline Ready
                  </span>
                ) : (
                  <span className="text-[10px] bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full font-bold">
                    HD Live
                  </span>
                )}
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
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-250" />
          )}

          {/* Screen Fill Light / Ring Light (ពន្លឺអេក្រង់ជំនួយពេលថត) */}
          {screenLightActive && !capturedImage && (
            <div className="absolute inset-0 pointer-events-none z-20 border-[16px] sm:border-[22px] border-white shadow-[inset_0_0_80px_rgba(255,255,255,0.9),0_0_40px_rgba(255,255,255,0.8)] backdrop-brightness-125 transition-all animate-pulse" />
          )}

          {capturedImage ? (
            /* Image Preview */
            <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-30">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>ថតបានជោគជ័យ!</span>
              </div>
            </div>
          ) : (
            /* Live Camera Stream or Fallback View */
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
              {!error && !isLoadingCamera && (
                <div className="absolute inset-6 sm:inset-10 border-2 border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2 z-10">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-pink-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-pink-400" />
                  </div>

                  <div className="self-center bg-black/50 backdrop-blur-xs text-[11px] text-white/95 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>តម្រង់វត្ថុ ឬនំឱ្យចំកណ្តាល</span>
                  </div>

                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-pink-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-pink-400" />
                  </div>
                </div>
              )}

              {/* Top Quick Floating Controls: Flash / Light */}
              {!capturedImage && !error && (
                <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
                  {/* Torch / Light Button */}
                  <button
                    type="button"
                    onClick={handleToggleLight}
                    title={
                      isTorchActive
                        ? 'បិទពិលកាម៉េរ៉ា'
                        : screenLightActive
                        ? 'បិទពន្លឺអេក្រង់'
                        : 'បើកពិល / ពន្លឺជំនួយ'
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95 ${
                      isTorchActive
                        ? 'bg-amber-400 text-slate-950 font-black shadow-amber-400/50 ring-2 ring-amber-300'
                        : screenLightActive
                        ? 'bg-white text-slate-950 font-black shadow-white/50 ring-2 ring-white'
                        : 'bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {isTorchActive ? (
                      <>
                        <Zap className="w-4 h-4 fill-amber-950 text-amber-950 animate-pulse" />
                        <span>ពិលកាម៉េរ៉ា (On)</span>
                      </>
                    ) : screenLightActive ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-500 fill-amber-500 animate-spin" />
                        <span>ពន្លឺអេក្រង់ (On)</span>
                      </>
                    ) : (
                      <>
                        <ZapOff className="w-3.5 h-3.5 text-slate-300" />
                        <span>ថែមភ្លើង</span>
                      </>
                    )}
                  </button>

                  {/* Auto Flash Shutter Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setFlashAuto((prev) => !prev);
                    }}
                    title="Flash ស្វ័យប្រវត្តពេលចុចថត"
                    className={`p-1.5 rounded-full text-xs transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95 border ${
                      flashAuto
                        ? 'bg-rose-500 text-white border-rose-400 font-bold'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700'
                    }`}
                  >
                    <Lightbulb className={`w-4 h-4 ${flashAuto ? 'text-amber-200 fill-amber-200' : ''}`} />
                  </button>
                </div>
              )}

              {/* Loading indicator */}
              {isLoadingCamera && (
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center gap-2 z-20">
                  <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
                  <span className="text-xs font-bold text-slate-300">កំពុងតភ្ជាប់កាម៉េរ៉ា...</span>
                </div>
              )}

              {/* Error fallback message (Offline / HTTP / Denied permission) */}
              {error && (
                <div className="absolute inset-3 sm:inset-5 bg-slate-900/95 border border-rose-500/40 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-3 z-30">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white mb-1">
                      {isOffline ? 'ដំណើរការក្នុងរបៀប Offline / Local Wi-Fi' : 'កាម៉េរ៉ា WebRTC មិនអាចបើកផ្ទាល់'}
                    </h4>
                    <p className="text-xs text-rose-200/90 font-medium max-w-sm leading-relaxed">
                      {error}
                    </p>
                  </div>

                  {/* 1-Tap Direct Camera Trigger for 100% Offline / Mobile Reliability */}
                  <div className="w-full max-w-xs flex flex-col gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        fileFallbackRef.current?.click();
                      }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>📸 ចុចទីនេះដើម្បីថតរូបភ្លាមៗ (Native Camera)</span>
                    </button>
                    <p className="text-[10px] text-slate-400">
                      ដំណើរការ ១០០% ទោះបីគ្មានអ៊ីនធឺណិត ឬលើបណ្តាញ Local Wi-Fi
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Fallback Input (Native OS Camera Trigger via capture="environment") */}
        <input
          ref={fileFallbackRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFallbackFile}
          className="hidden"
        />

        {/* Bottom Controls */}
        <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
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
            /* Controls during live camera / capture mode */
            <div className="flex items-center justify-between w-full">
              {/* Fallback upload / gallery button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  fileFallbackRef.current?.click();
                }}
                title="ជ្រើសរើសរូបពីកុំព្យូទ័រ ឬទូរស័ព្ទ"
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer border border-slate-700 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              >
                <Upload className="w-4 h-4 text-pink-400" />
                <span className="hidden sm:inline">ជ្រើសរូបពី File</span>
              </button>

              {/* Big Center Shutter Button (Always clickable!) */}
              <button
                type="button"
                onClick={handleCapture}
                title="ចុចដើម្បីថតរូប"
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 p-1 shadow-xl shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-4 border-white/90 bg-white/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white shadow-inner" />
                </div>
              </button>

              {/* Flip camera / Lighting toggle button */}
              {error ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    fileFallbackRef.current?.click();
                  }}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-pink-400 hover:text-pink-300 rounded-2xl transition-all cursor-pointer border border-slate-700 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">ថតកាម៉េរ៉ា</span>
                </button>
              ) : (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
