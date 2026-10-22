import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  ShoppingBag,
  RefreshCw,
  Scan,
  Maximize2,
  Check,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../../types';
import { soundFx } from '../../utils/audio';
import {
  analyzePastryTrayWithGemini,
  DetectedTrayItem,
  PastryTrayScanResult,
} from '../../services/aiPastryScannerService';

interface AiPastryScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  exchangeRate?: number;
  onAddItemsToCart: (items: { product: Product; quantity: number }[]) => void;
}

export const AiPastryScannerModal: React.FC<AiPastryScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  exchangeRate = 4100,
  onAddItemsToCart,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<PastryTrayScanResult | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedTrayItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera helper
  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setErrorMessage(null);
    } catch (err: any) {
      console.warn('[Camera] Failed to initialize webcam stream:', err);
      setCameraActive(false);
      setErrorMessage('មិនអាចបើកកាមេរ៉ាបានទេ (សូមអនុញ្ញាត Camera Permission ឬប្រើប្រាស់ការ Upload រូបថត)');
      setMode('upload');
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (isOpen && mode === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, capturedImage, startCamera, stopCamera]);

  if (!isOpen) return null;

  // Snap photo from webcam stream
  const captureFrame = () => {
    soundFx.playPop();
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    stopCamera();
    performAiAnalysis(dataUrl);
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playPop();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      performAiAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Perform AI analysis
  const performAiAnalysis = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setScanResult(null);

    try {
      const result = await analyzePastryTrayWithGemini(imageDataUrl, products, exchangeRate);
      setScanResult(result);
      setDetectedItems(result.detectedItems);
      soundFx.playSuccess();
    } catch (err: any) {
      console.error('[AI Tray Scan] Error:', err);
      setErrorMessage(err?.message || 'ការវិភាគ AI មានបញ្ហាបន្តិចបន្តួច សូមសាកល្បងម្ដងទៀត');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Adjust item quantity
  const updateItemQty = (index: number, delta: number) => {
    soundFx.playPop();
    setDetectedItems((prev) =>
      prev
        .map((item, idx) => {
          if (idx !== index) return item;
          const newQty = Math.max(0, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            totalKhr: newQty * item.unitPriceKhr,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Reset to scan another tray
  const handleResetScan = () => {
    soundFx.playPop();
    setCapturedImage(null);
    setScanResult(null);
    setDetectedItems([]);
    setErrorMessage(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  // Confirm and add all detected items to POS cart
  const handleAddAllToCart = () => {
    soundFx.playSuccess();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    const itemsToAdd: { product: Product; quantity: number }[] = [];

    for (const item of detectedItems) {
      if (item.quantity <= 0) continue;

      let prod: Product | undefined = item.matchedProduct;
      if (!prod && item.productId) {
        prod = products.find((p) => p.id === item.productId);
      }

      // If no catalog product matched, construct an on-the-fly product
      if (!prod) {
        prod = {
          id: `custom_pastry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          nameKh: item.nameKh,
          nameEn: item.nameEn,
          categoryId: 'bread',
          priceUsd: Number((item.unitPriceKhr / exchangeRate).toFixed(2)),
          priceKhr: item.unitPriceKhr,
          costPriceUsd: 0,
          stockQty: 99,
          imageUrl: '',
          isCustom: true,
          unit: 'ដុំ',
        };
      }

      itemsToAdd.push({
        product: prod,
        quantity: item.quantity,
      });
    }

    if (itemsToAdd.length > 0) {
      onAddItemsToCart(itemsToAdd);
      onClose();
    }
  };

  const totalCalculatedKhr = detectedItems.reduce((acc, it) => acc + it.totalKhr, 0);
  const totalCount = detectedItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-pink-950/40 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white tracking-wide">
                  AI Pastry Tray Scanner
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  BakeryScan Vision
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ស្កេននំលើថាសស្វ័យប្រវត្តិជាមួយ Google Gemini Vision
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {!capturedImage && (
          <div className="px-5 pt-3 pb-2 flex items-center justify-between bg-slate-900/60 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setMode('camera');
                  startCamera();
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'camera'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>បើកកាមេរ៉ា (Live Stream)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setMode('upload');
                  stopCamera();
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'upload'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>បញ្ចូលរូបថត (Upload)</span>
              </button>
            </div>

            {mode === 'camera' && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-700 cursor-pointer"
                title="ប្តូរកាមេរ៉ាមុខ / ក្រោយ"
              >
                <RefreshCw className="w-3 h-3" />
                <span>ប្តូរកាមេរ៉ា</span>
              </button>
            )}
          </div>
        )}

        {/* Viewport Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-2xl flex items-center gap-3 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Camera Stream View */}
          {!capturedImage && mode === 'camera' && (
            <div className="relative aspect-4/3 w-full max-h-80 bg-black rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Sci-Fi Scanner Overlay HUD */}
              <div className="absolute inset-0 pointer-events-none border border-pink-500/30 m-4 rounded-xl flex flex-col justify-between p-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-pink-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE SCAN READY
                  </span>
                  <span>AI VISION V3.8</span>
                </div>

                {/* Center Reticle */}
                <div className="self-center w-36 h-36 border border-pink-400/40 rounded-2xl relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />
                </div>

                <div className="text-center text-[11px] text-pink-200/90 font-medium bg-black/60 py-1 px-3 rounded-full backdrop-blur-sm mx-auto">
                  🎯 សូមដាក់ថាសនំឱ្យចំកណ្តាលកាមេរ៉ា
                </div>
              </div>
            </div>
          )}

          {/* Upload View */}
          {!capturedImage && mode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-pink-500/70 bg-slate-800/40 hover:bg-slate-800/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-4/3 max-h-80"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                ចុចទីនេះដើម្បីជ្រើសរើស ឬថតរូបថាសនំ
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                គាំទ្ររូបថតថាសនំបញ្ឈរ ឬពីលើចុះក្រោម (JPG, PNG, WebP)
              </p>
            </div>
          )}

          {/* Captured Image Preview + Analysis HUD */}
          {capturedImage && (
            <div className="relative aspect-4/3 max-h-72 w-full bg-black rounded-2xl overflow-hidden border border-slate-700">
              <img
                src={capturedImage}
                alt="Captured Tray"
                className={`w-full h-full object-cover transition-all ${
                  isAnalyzing ? 'brightness-75 blur-xs scale-102' : ''
                }`}
              />

              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-pink-500/30 border-t-pink-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-black text-white">Gemini Multimodal AI កំពុងស្កេន...</p>
                    <p className="text-xs text-slate-300">កំពុងសម្គាល់នំលើថាស និងរាប់ចំនួនស្វ័យប្រវត្តិ</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detection Results */}
          {scanResult && !isAnalyzing && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Summary Banner */}
              <div className="p-3 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-200">
                      {scanResult.scanSummaryKh}
                    </div>
                    {scanResult.bakingRecommendationsKh && (
                      <div className="text-[11px] text-emerald-400/80">
                        💡 {scanResult.bakingRecommendationsKh}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-emerald-300 font-black">
                    {totalCount} ដុំ
                  </div>
                </div>
              </div>

              {/* Detected Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {detectedItems.length === 0 ? (
                  <div className="p-4 bg-slate-800/60 rounded-xl text-center text-xs text-slate-400">
                    រកមិនឃើញនំលើថាសនេះទេ សូមសាកល្បងថតសារជាថ្មី។
                  </div>
                ) : (
                  detectedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-800/90 border border-slate-700 rounded-2xl flex items-center justify-between gap-3 hover:border-pink-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.matchedProduct?.imageUrl ? (
                          <img
                            src={item.matchedProduct.imageUrl}
                            alt={item.nameKh}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-base shrink-0">
                            🥐
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{item.nameKh}</span>
                            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-md bg-pink-500/20 text-pink-300">
                              {Math.round(item.confidence * 100)}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.unitPriceKhr.toLocaleString()} ៛/ដុំ • ទីតាំង: {item.locationOnTray}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => updateItemQty(idx, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono font-black text-xs text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQty(idx, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-right w-16">
                          <div className="text-xs font-black font-mono text-amber-400">
                            {item.totalKhr.toLocaleString()} ៛
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0 gap-3">
          {!capturedImage ? (
            <>
              <div className="text-xs text-slate-400 hidden sm:block">
                ⚡ រាប់នំលើថាសលឿនក្នុងពេលតែ ១ វិនាទី
              </div>
              <button
                type="button"
                onClick={captureFrame}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ml-auto"
              >
                <Camera className="w-4 h-4" />
                <span>ថត & ស្កេននំ AI (Scan Now)</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleResetScan}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ថតស្កេនម្ដងទៀត</span>
              </button>

              {scanResult && detectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    បញ្ចូលកន្ត្រកទាំងអស់ ({totalCount} ដុំ = {totalCalculatedKhr.toLocaleString()} ៛)
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
