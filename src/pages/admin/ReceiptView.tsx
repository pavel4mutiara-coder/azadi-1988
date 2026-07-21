
import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import { Donation, OrganizationSettings, DonationStatus } from '../../types';
import { Heart, Printer, ArrowLeft, Download, MessageCircle, Shield, Mail, Phone, MapPin, Loader2, Eye, CheckCircle2, Clock, Share2, FileText, QrCode as QrIcon } from 'lucide-react';
import { ISLAMIC_QUOTES } from '../../utils/constants';
import { useApp } from '../../context/AppContext';
import { parseLocalDate } from '../../utils/parseLocalDate';

declare var html2pdf: any;

interface Props {
  donation: Donation;
  settings: OrganizationSettings;
  onBack: () => void;
  isPublic?: boolean;
  autoDownload?: boolean;
  onDownloadDone?: () => void;
}

export const ReceiptView: React.FC<Props> = ({ 
  donation, 
  settings, 
  onBack, 
  isPublic = false,
  autoDownload = false,
  onDownloadDone
}) => {
  const { letterhead, lang } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);

  const selectedQuote = useMemo(() => {
    return ISLAMIC_QUOTES[parseInt(donation.id.slice(-2), 16) % ISLAMIC_QUOTES.length] || ISLAMIC_QUOTES[0];
  }, [donation.id]);

  const signatoryConfig = letterhead;
  const base64Logo = settings.logo;

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const verificationUrl = `${window.location.origin}/verify-donation/REC-${donation.id.slice(-8)}`;
    QRCode.toDataURL(verificationUrl, { margin: 1, width: 120 })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
  }, [donation.id]);

  const handleDownload = async () => {
    try {
      setIsGeneratingPDF(true);
      const element = receiptRef.current;
      if (!element) return;

      let html2pdfLib = (window as any).html2pdf;
      if (!html2pdfLib) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = () => {
            html2pdfLib = (window as any).html2pdf;
            resolve();
          };
          script.onerror = () => {
            reject(new Error("Failed to load html2pdf script"));
          };
          document.head.appendChild(script);
        });
      }

      if (!html2pdfLib) {
        // Fallback to window print if script failed to load
        window.print();
        return;
      }

      const opt = {
        margin: 0,
        filename: `receipt_REC-${donation.id.slice(-8)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          allowTaint: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: 1123
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdfLib().from(element).set(opt).save();
    } catch (err) {
      console.error("Failed to generate Receipt PDF, falling back to window.print()", err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    if (autoDownload) {
      const timer = setTimeout(() => {
        handleDownload();
        if (onDownloadDone) {
          onDownloadDone();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, donation]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-2 md:p-8 pb-24 bengali print-receipt-wrapper">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #root, .app-container, #app-layout-root {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          header, footer, nav, .no-print, .no-print * {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
          .print-receipt-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            min-height: 0 !important;
          }
          .print-receipt-wrapper .max-w-4xl {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-receipt-wrapper .overflow-x-auto {
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            display: flex !important;
            justify-content: center !important;
          }
          .print-receipt-wrapper div[ref] {
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-lg border border-emerald-100 dark:border-slate-800">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 font-black transition-colors uppercase text-[10px] tracking-widest px-4 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl">
            <ArrowLeft size={16} /> ফিরে যান
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload} 
              disabled={isGeneratingPDF}
              className={`bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[9px] flex items-center gap-2 shadow-md hover:bg-emerald-700 transition-all uppercase ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {lang === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...'}
                </>
              ) : (
                <>
                  <Download size={14} /> 
                  {lang === 'bn' ? 'PDF ডাউনলোড' : 'PDF Download'}
                </>
              )}
            </button>
            <button 
              onClick={handlePrint} 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[9px] flex items-center gap-2 shadow-md hover:bg-black transition-all uppercase"
            >
              <Printer size={14} /> {lang === 'bn' ? 'প্রিন্ট রশিদ' : 'Print Receipt'}
            </button>
          </div>
        </div>

        {/* The Receipt Document - Strictly A4 and Fully Responsive */}
        <div className="overflow-x-auto rounded-[1.5rem] shadow-2xl flex justify-center bg-slate-300 p-2 md:p-6 no-scrollbar">
          <div 
            ref={receiptRef} 
            className="bg-white relative text-slate-900 bengali flex flex-col justify-between overflow-hidden" 
            style={{ 
              width: '210mm', 
              height: '297mm', 
              minHeight: '297mm', 
              maxHeight: '297mm', 
              fontFamily: '"Noto Sans Bengali", sans-serif', 
              boxSizing: 'border-box',
              padding: '10mm 12mm' // Slightly reduced horizontal padding
            }}
          >
            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-emerald-900"></div>

            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-20 h-20 p-1.5 bg-white rounded-full border border-emerald-50 shadow-sm">
                {base64Logo && <img src={base64Logo} className="w-full h-full object-contain" alt="Logo" />}
              </div>
              <div className="space-y-0.5">
                <h1 className="text-3xl font-black text-emerald-950 tracking-tight leading-none">{settings.nameBn}</h1>
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{settings.nameEn}</h2>
              </div>
              <div className="flex flex-col items-center gap-0.5 text-slate-600 font-bold text-[10px] pt-1">
                <p className="flex items-center gap-2"><MapPin size={10} className="text-emerald-800" /> {settings.addressBn}</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Phone size={10} className="text-emerald-800" /> {settings.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={10} className="text-emerald-800" /> {settings.email}</span>
                </div>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-100 to-transparent mt-2"></div>
            </div>

            {/* Body Section */}
            <div className="flex-1 flex flex-col justify-center space-y-8 py-4">
              
              <div className="flex flex-col items-center gap-3">
                <div className="bg-emerald-900 text-white px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.35em] shadow-lg">অনুদান রশিদ / Donation Receipt</div>
                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest ${
                  donation.status === DonationStatus.APPROVED 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {donation.status === DonationStatus.APPROVED ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {donation.status === DonationStatus.APPROVED ? 'Approved' : 'Pending Verification'}
                </div>
              </div>

              {/* Information Grid - Slightly more compact */}
              <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full"></div>
                
                <div className="flex justify-between items-center border-b border-emerald-100 pb-4">
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">রশিদ নম্বর / ID</div>
                    <div className="font-mono font-black text-emerald-950 text-sm uppercase">REC-{donation.id.slice(-8)}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">তারিখ / Date</div>
                    <div className="font-black text-slate-900 text-sm">{parseLocalDate(donation.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex justify-between items-end border-b border-white pb-3">
                    <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest">দাতার নাম / Donor:</div>
                    <div className="text-xl font-black text-emerald-950">{donation.isAnonymous ? 'নাম প্রকাশে অনিচ্ছুক' : donation.donorName}</div>
                  </div>
                  <div className="flex justify-between items-end border-b border-white pb-3">
                    <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest">উদ্দেশ্য / Purpose:</div>
                    <div className="font-black text-slate-800 text-base">{donation.purpose}</div>
                  </div>
                  <div className="flex justify-between items-end border-b border-white pb-3">
                    <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest">ট্রানজেকশন আইডি:</div>
                    <div className="font-mono font-black text-slate-900 uppercase tracking-widest text-[11px]">{donation.paymentMethod} • {donation.transactionId}</div>
                  </div>
                </div>
              </div>

              {/* Amount Card - Reduced padding to allow more footer space */}
              <div className="flex justify-center">
                <div className="bg-emerald-900 text-white px-16 py-8 rounded-[2.5rem] text-center shadow-xl relative overflow-hidden ring-8 ring-emerald-50">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full"></div>
                  <div className="text-[9px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">মোট অনুদান পরিমাণ / Amount</div>
                  <div className="text-5xl font-black font-mono tracking-tighter">৳{donation.amount.toLocaleString()}</div>
                  <div className="mt-3 text-[9px] font-black uppercase opacity-50 border-t border-white/10 pt-3 tracking-[0.15em]">{donation.amount} Taka Only</div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Tightly optimized for visibility */}
            <div className="space-y-8 pb-4">
              {/* Islamic Quote Card - Ensure this is fully visible with a beautiful, high-class calligraphy design */}
              <div className="text-center mx-4">
                <div className="space-y-3 px-8 py-5 bg-gradient-to-br from-emerald-50/20 to-teal-50/20 rounded-[2.5rem] border border-emerald-900/10 relative shadow-sm">
                  {/* Absolute Badge style decor */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1.5 text-emerald-800 text-[9px] font-black tracking-widest uppercase shadow-sm">
                    <Heart className="text-rose-500 animate-pulse" size={10} fill="currentColor" />
                    <span>{lang === 'bn' ? 'প্রেরণা বাণী' : 'Words of Wisdom'}</span>
                    <Heart className="text-rose-500 animate-pulse" size={10} fill="currentColor" />
                  </div>

                  {/* Gorgeous Arabic Calligraphy */}
                  <div 
                    className="text-3xl text-emerald-950 font-normal leading-loose text-center pt-2 select-none tracking-wide"
                    style={{ 
                      fontFamily: '"Amiri", serif',
                      direction: 'rtl'
                    }}
                  >
                    <span className="text-amber-600/80 mr-1.5 pb-1 inline-block">﴿</span>
                    {selectedQuote.arabic}
                    <span className="text-amber-600/80 ml-1.5 pb-1 inline-block">﴾</span>
                  </div>

                  {/* Exquisite Floral/Geometric Divider */}
                  <div className="flex items-center justify-center gap-3 py-1 select-none">
                    <div className="w-14 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-amber-500/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <div className="w-14 h-px bg-gradient-to-l from-transparent via-amber-500/30 to-amber-500/50"></div>
                  </div>

                  {/* Bengali Translation */}
                  <div className="text-xs font-bold text-slate-800 leading-relaxed max-w-xl mx-auto tracking-normal">
                    {selectedQuote.bn}
                  </div>
                </div>
              </div>

              {/* Signature & QR Code Row */}
              <div className="flex justify-between items-end px-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 border border-emerald-900/10 rounded-full flex flex-col items-center justify-center text-[6px] font-black transform -rotate-12 opacity-30 bg-white shadow-inner">
                       <Shield size={18} className="mb-0.5 text-emerald-950" />
                       <span className="uppercase text-center leading-tight">Azadi Social Welfare<br/>Official Seal</span>
                    </div>
                  </div>

                  {qrCodeDataUrl && (
                    <div className="flex flex-col items-center p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <img src={qrCodeDataUrl} alt="Verify QR Code" className="w-14 h-14 object-contain" />
                      <span className="text-[6px] font-black uppercase text-slate-500 tracking-tight">Scan to Verify</span>
                    </div>
                  )}
                </div>

                <div className="text-center w-56 space-y-1.5 relative">
                  {signatoryConfig?.signature && (
                    <img 
                      src={signatoryConfig.signature} 
                      className="h-10 object-contain mx-auto absolute bottom-7 left-1/2 -translate-x-1/2 select-none" 
                      alt="Signature" 
                    />
                  )}
                  <div className="h-0.5 bg-slate-950 w-full mb-1"></div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-950">Authorized Signature</div>
                </div>
              </div>

              {/* Footer Tagline */}
              <div className="text-center opacity-25">
                 <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Education · Unity · Service · Peace · Progress</p>
              </div>
            </div>

            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.012] pointer-events-none select-none">
              {base64Logo && <img src={base64Logo} className="w-[400px] h-[400px] object-contain rotate-[-15deg]" alt="Watermark" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
