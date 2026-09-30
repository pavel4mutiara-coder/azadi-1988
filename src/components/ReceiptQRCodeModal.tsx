import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, Download, Printer, Copy, Check, Share2, 
  ExternalLink, QrCode as QrIcon, ShieldCheck, Heart, 
  Calendar, User, Wallet, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { Donation, OrganizationSettings } from '../types';
import { useApp } from '../context/AppContext';
import { parseLocalDate } from '../utils/parseLocalDate';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receiptId: string;
  donation?: Donation | null;
  settings?: OrganizationSettings;
}

export const ReceiptQRCodeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  receiptId,
  donation,
  settings: propSettings
}) => {
  const { lang, settings: contextSettings } = useApp();
  const settings = propSettings || contextSettings;

  const [qrColor, setQrColor] = useState<string>('#065f46'); // Emerald 800 default
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [encodeFormat, setEncodeFormat] = useState<'url' | 'id'>('url');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Normalize canonical receipt ID
  const cleanId = receiptId.trim().toUpperCase();
  const canonicalReceiptId = cleanId.startsWith('REC-') ? cleanId : `REC-${cleanId.slice(-8)}`;

  // Determine payload
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationUrl = `${currentOrigin}/verify-donation/${canonicalReceiptId}`;
  const qrPayload = encodeFormat === 'url' ? verificationUrl : canonicalReceiptId;

  // Color preset options
  const colorPresets = [
    { label: 'Emerald', hex: '#065f46', bgClass: 'bg-emerald-800' },
    { label: 'Deep Blue', hex: '#1e3a8a', bgClass: 'bg-blue-900' },
    { label: 'Slate', hex: '#0f172a', bgClass: 'bg-slate-900' },
    { label: 'Teal', hex: '#115e59', bgClass: 'bg-teal-800' },
    { label: 'Classic Black', hex: '#000000', bgClass: 'bg-black' }
  ];

  // Generate QR code with optional center badge
  useEffect(() => {
    if (!isOpen || !receiptId) return;

    let isMounted = true;
    setIsGenerating(true);

    const generateQR = async () => {
      try {
        // High error correction level ('H') is necessary when embedding a logo in the center
        const qrCanvas = document.createElement('canvas');
        await QRCode.toCanvas(qrCanvas, qrPayload, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 600,
          color: {
            dark: qrColor,
            light: '#ffffff'
          }
        });

        if (includeLogo) {
          const ctx = qrCanvas.getContext('2d');
          if (ctx) {
            const logoSize = Math.floor(qrCanvas.width * 0.22);
            const center = qrCanvas.width / 2;
            const logoX = center - logoSize / 2;
            const logoY = center - logoSize / 2;

            // Draw white background pill/circle for logo clearance
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, (logoSize / 2) + 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = qrColor;
            ctx.stroke();
            ctx.restore();

            // Draw official emblem or stylized text
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            const logoSrc = settings.logoUrl || settings.logo || '/images/azadi_logo.png';

            await new Promise<void>((resolve) => {
              logoImg.onload = () => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(center, center, logoSize / 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                ctx.restore();
                resolve();
              };
              logoImg.onerror = () => {
                // Fallback icon inside canvas if image fails to load
                ctx.save();
                ctx.fillStyle = qrColor;
                ctx.font = 'bold 22px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('ASWO', center, center);
                ctx.restore();
                resolve();
              };
              logoImg.src = logoSrc;
            });
          }
        }

        if (isMounted) {
          setQrDataUrl(qrCanvas.toDataURL('image/png'));
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Failed to generate Receipt QR code:', err);
        if (isMounted) setIsGenerating(false);
      }
    };

    generateQR();

    return () => {
      isMounted = false;
    };
  }, [isOpen, qrPayload, qrColor, includeLogo, settings.logoUrl, settings.logo]);

  // Handle Download PNG
  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `receipt_qr_${canonicalReceiptId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle Download SVG vector
  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(qrPayload, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: qrColor,
          light: '#ffffff'
        }
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_qr_${canonicalReceiptId}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export SVG QR code:', err);
    }
  };

  // Handle Copy Verification URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings.nameBn} - অনুদান রশিদ যাচাই`,
          text: `রশিদ নম্বর ${canonicalReceiptId} এর ডিজিটাল ভেরিফিকেশন লিংক:`,
          url: verificationUrl
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${settings.nameBn}\nরশিদ নম্বর: ${canonicalReceiptId}\nযাচাই লিংক: ${verificationUrl}`
      )}`;
      window.open(waUrl, '_blank');
    }
  };

  // Handle Print
  const handlePrintSlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${canonicalReceiptId} - QR Verification Slip</title>
          <style>
            @page { size: 80mm 120mm; margin: 5mm; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              text-align: center; 
              margin: 0; 
              padding: 10px;
              color: #0f172a;
            }
            .header { font-size: 13px; font-weight: 900; margin-bottom: 2px; }
            .sub { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .badge { display: inline-block; font-size: 9px; font-weight: 800; background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 9999px; margin-bottom: 8px; }
            .qr-wrap { margin: 8px auto; width: 140px; height: 140px; }
            .qr-wrap img { width: 100%; height: 100%; object-fit: contain; }
            .rec-id { font-family: monospace; font-size: 14px; font-weight: 900; margin: 4px 0; letter-spacing: 1px; }
            .details { font-size: 10px; text-align: left; margin: 10px 0; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; padding: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .footer { font-size: 8px; color: #94a3b8; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">${settings.nameBn}</div>
          <div class="sub">${settings.nameEn}</div>
          <div class="badge">Official Donation Verification</div>
          <div class="qr-wrap">
            <img src="${qrDataUrl}" alt="QR" />
          </div>
          <div class="rec-id">${canonicalReceiptId}</div>
          ${donation ? `
            <div class="details">
              <div class="row"><span>Donor:</span><strong>${donation.isAnonymous ? 'Anonymous' : donation.donorName}</strong></div>
              <div class="row"><span>Amount:</span><strong>৳ ${donation.amount.toLocaleString()} BDT</strong></div>
              <div class="row"><span>Purpose:</span><strong>${donation.purpose || 'Welfare'}</strong></div>
              <div class="row"><span>Date:</span><strong>${parseLocalDate(donation.date).toLocaleDateString()}</strong></div>
            </div>
          ` : ''}
          <div class="footer">
            Scan QR code with smartphone to verify authenticity instantly.<br/>
            ${settings.phone} • ${settings.email}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
              <QrIcon size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {lang === 'bn' ? 'রশিদ কিউআর কোড জেনারেটর' : 'Receipt QR Code Generator'}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {canonicalReceiptId} • {lang === 'bn' ? 'তাত্ক্ষণিক যাচাইযোগ্য' : 'Instant Verification'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`p-2.5 rounded-xl border transition-all ${
                showCustomizer 
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title={lang === 'bn' ? 'কিউআর কাস্টমাইজেশন' : 'Customize QR'}
            >
              <SlidersHorizontal size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Customizer Drawer */}
          {showCustomizer && (
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  {lang === 'bn' ? 'কালার থিম নির্বাচন' : 'QR Color Theme'}
                </span>
                <div className="flex items-center gap-2">
                  {colorPresets.map(preset => (
                    <button
                      key={preset.hex}
                      onClick={() => setQrColor(preset.hex)}
                      className={`w-6 h-6 rounded-full transition-transform ${preset.bgClass} ${
                        qrColor === preset.hex ? 'ring-2 ring-emerald-500 ring-offset-2 scale-110' : 'hover:scale-105'
                      }`}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setIncludeLogo(!includeLogo)}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                    includeLogo
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>{includeLogo ? (lang === 'bn' ? 'সংস্থার লোগো চালু' : 'Logo Embedded') : (lang === 'bn' ? 'লোগো ছাড়া' : 'Plain QR')}</span>
                </button>

                <button
                  onClick={() => setEncodeFormat(encodeFormat === 'url' ? 'id' : 'url')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <span>{encodeFormat === 'url' ? (lang === 'bn' ? 'মোবাইল স্ক্যান লিংক' : 'Direct URL Mode') : (lang === 'bn' ? 'রশিদ আইডি মোড' : 'Raw ID Mode')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Printable / Display Slip Card */}
          <div 
            ref={cardRef}
            className="p-6 sm:p-8 bg-gradient-to-b from-white to-emerald-50/20 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-5"
          >
            {/* Top Branding Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>{lang === 'bn' ? 'ভেরিফাইড অফিসিয়াল রশিদ' : 'Verified Official Receipt'}</span>
            </div>

            <div className="space-y-0.5">
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? settings.nameBn : settings.nameEn}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {settings.addressBn}
              </p>
            </div>

            {/* The QR Image */}
            <div className="relative inline-block p-4 bg-white rounded-3xl border border-slate-200 shadow-md">
              {isGenerating ? (
                <div className="w-56 h-56 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold">{lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating QR...'}</span>
                </div>
              ) : (
                <img 
                  src={qrDataUrl} 
                  alt="Donation Receipt QR Code" 
                  className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-xl select-none"
                />
              )}
            </div>

            {/* Receipt Identification Monospace */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'bn' ? 'রশিদ সনাক্তকরণ আইডি' : 'Official Receipt ID'}
              </div>
              <div className="font-mono text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-wider">
                {canonicalReceiptId}
              </div>
            </div>

            {/* Donation Meta info if available */}
            {donation && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-left text-xs bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'দাতার নাম' : 'Donor'}
                  </span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {donation.isAnonymous ? (lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous') : donation.donorName}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'পরিমাণ' : 'Amount'}
                  </span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    ৳ {donation.amount.toLocaleString()} BDT
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'খাত / উদ্দেশ্য' : 'Purpose'}
                  </span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block">
                    {donation.purpose || 'Welfare'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'তারিখ' : 'Date'}
                  </span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {parseLocalDate(donation.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                  </strong>
                </div>
              </div>
            )}

            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {lang === 'bn'
                ? 'স্মার্টফোন ক্যামেরা দিয়ে এই কিউআর কোড স্ক্যান করে রশিদের সত্যতা সরাসরি যাচাই করা যাবে।'
                : 'Scan this QR code with any smartphone camera to authenticate this receipt instantly.'}
            </p>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={handleDownloadPNG}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download size={18} />
              <span>PNG {lang === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
            </button>

            <button
              onClick={handleDownloadSVG}
              className="p-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download size={18} />
              <span>SVG {lang === 'bn' ? 'ভেক্টর' : 'Vector'}</span>
            </button>

            <button
              onClick={handlePrintSlip}
              className="p-3 bg-slate-900 dark:bg-slate-800 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer size={18} />
              <span>{lang === 'bn' ? 'প্রিন্ট ভাউচার' : 'Print Slip'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Share2 size={18} />
              <span>{lang === 'bn' ? 'শেয়ার' : 'Share QR'}</span>
            </button>
          </div>

          {/* Verification URL Copy Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                {lang === 'bn' ? 'সরাসরি যাচাইকরণ ওয়েব লিংক' : 'Direct Verification Web Link'}
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                {verificationUrl}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
              </button>

              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 transition-colors"
                title={lang === 'bn' ? 'যাচাই পেজ খুলুন' : 'Open Verification Page'}
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
