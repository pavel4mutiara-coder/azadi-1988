import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  X, Camera, Upload, AlertCircle, CheckCircle2, 
  FlipHorizontal, Sparkles, RefreshCw, QrCode
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (receiptId: string) => void;
}

export const ReceiptQRScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState<'camera' | 'file'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract receipt ID from scanned string
  const parseReceiptIdFromScannedText = (text: string): string | null => {
    if (!text || !text.trim()) return null;
    const clean = text.trim();

    // Case 1: URL containing verify-donation or verify-receipt
    const urlMatch = clean.match(/(?:verify-donation|verify-receipt)\/([a-zA-Z0-9_-]+)/i);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1].toUpperCase();
    }

    // Case 2: Direct REC-XXXXXXXX or similar ID
    const recMatch = clean.match(/REC-[a-zA-Z0-9_-]+/i);
    if (recMatch) {
      return recMatch[0].toUpperCase();
    }

    // Case 3: Alphanumeric receipt ID string (6-32 chars)
    if (/^[a-zA-Z0-9_-]{6,32}$/.test(clean)) {
      return clean.toUpperCase();
    }

    return clean;
  };

  // Trigger feedback (vibration + sound)
  const triggerSuccessFeedback = () => {
    if (navigator.vibrate) {
      try {
        navigator.vibrate([80, 50, 80]);
      } catch {
        // Ignored
      }
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(lang === 'bn' ? 'আপনার ব্রাউজারে ক্যামেরা সমর্থিত নয়।' : 'Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanVideoFrame();
      }
    } catch (err: any) {
      console.warn("Camera start warning:", err);
      let msg = lang === 'bn' ? 'ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে অনুমতি দিন অথবা ফাইল আপলোড করুন।' : 'Could not access camera. Please allow camera permissions or upload an image.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = lang === 'bn' ? 'ক্যামেরার অনুমতি প্রত্যাখ্যাত হয়েছে। ব্রাউজারের সেটিংসে ক্যামেরা এলাও করুন।' : 'Camera permission was denied. Please allow camera access in browser settings.';
      }
      setCameraError(msg);
      setIsScanning(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Continuous Frame Scanner via jsQR
  const scanVideoFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });

    if (code && code.data) {
      const parsedId = parseReceiptIdFromScannedText(code.data);
      if (parsedId) {
        triggerSuccessFeedback();
        setScannedResult(parsedId);
        stopCamera();
        setTimeout(() => {
          onScanSuccess(parsedId);
          onClose();
        }, 600);
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  // Handle Image File Upload Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          const parsedId = parseReceiptIdFromScannedText(code.data);
          if (parsedId) {
            triggerSuccessFeedback();
            setScannedResult(parsedId);
            setTimeout(() => {
              onScanSuccess(parsedId);
              onClose();
            }, 600);
            return;
          }
        }

        setFileError(
          lang === 'bn'
            ? 'ছবিতে কোনো বৈধ অনুদান রশিদ কিউআর কোড পাওয়া যায়নি। দয়া করে পরিষ্কার ছবি আপলোড করুন।'
            : 'No valid donation receipt QR code was found in this image. Please upload a clear photo.'
        );
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-amber-400 flex items-center justify-center border border-blue-200 dark:border-blue-900 shrink-0">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {lang === 'bn' ? 'রশিদ কিউআর কোড স্ক্যানার' : 'Receipt QR Code Scanner'}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'bn' ? 'তাৎক্ষণিক অনুদান যাচাইকরণ' : 'Instant Donation Verification'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-3 bg-slate-100/70 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Camera size={14} />
            <span>{lang === 'bn' ? 'লাইভ ক্যামেরা' : 'Live Camera'}</span>
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'file'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload size={14} />
            <span>{lang === 'bn' ? 'ছবি / স্ক্রিনশট আপলোড' : 'Upload Image'}</span>
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {scannedResult ? (
            /* Match Success Indicator */
            <div className="p-8 text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-emerald-950 dark:text-emerald-300">
                  {lang === 'bn' ? 'রশিদ সনাক্ত হয়েছে!' : 'Receipt Detected!'}
                </h4>
                <p className="font-mono text-xl font-black text-emerald-800 dark:text-emerald-400">
                  {scannedResult}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'যাচাইকরণ পেজে রিডাইরেক্ট করা হচ্ছে...' : 'Redirecting to verification...'}
                </p>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            /* Live Camera Viewfinder */
            <div className="space-y-4">
              <div className="relative aspect-square sm:aspect-4/3 w-full bg-slate-950 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Reticle / Viewfinder Frame */}
                {isScanning && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400/80 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-xl"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-xl"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-xl"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-xl"></div>
                      
                      {/* Animated Laser Scan Bar */}
                      <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse top-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                )}

                {/* Camera Error Fallback */}
                {cameraError && (
                  <div className="p-6 text-center text-white space-y-3 max-w-sm">
                    <AlertCircle size={36} className="text-amber-400 mx-auto" />
                    <p className="text-xs font-medium leading-relaxed text-slate-300">
                      {cameraError}
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mx-auto transition-colors"
                    >
                      <RefreshCw size={14} />
                      <span>{lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Camera'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Viewfinder Controls */}
              <div className="flex items-center justify-between gap-3 px-1">
                <span className="text-[11px] font-bold text-slate-500">
                  {lang === 'bn' ? 'রশিদের কিউআর কোডটি ক্যামেরার সামনে রাখুন' : 'Point camera directly at the receipt QR code'}
                </span>

                <button
                  onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title={lang === 'bn' ? 'ক্যামেরা পরিবর্তন করুন' : 'Flip Camera'}
                >
                  <FlipHorizontal size={14} />
                  <span>{lang === 'bn' ? 'ক্যামেরা ফ্লিপ' : 'Flip'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* File Upload View */
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 sm:p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-amber-400 bg-slate-50 dark:bg-slate-950/60 rounded-3xl text-center space-y-4 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-900 shadow-sm">
                  <Upload size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">
                    {lang === 'bn' ? 'রশিদের ছবি বা স্ক্রিনশট আপলোড করুন' : 'Click to Upload Receipt Photo or Screenshot'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'PNG, JPG, WEBP ফাইল সমর্থিত' : 'Supports PNG, JPG, JPEG, WEBP'}
                  </p>
                </div>
              </div>

              {fileError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{fileError}</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
