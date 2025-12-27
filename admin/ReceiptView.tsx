
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Donation, OrganizationSettings, DonationStatus } from '../types';
import { Heart, Printer, ArrowLeft, Download, MessageCircle, ShieldCheck, Mail, Phone, MapPin, Loader2, Eye, CheckCircle2, Clock, Share2, FileText } from 'lucide-react';
import { ISLAMIC_QUOTES } from '../constants';

declare var html2pdf: any;

interface Props {
  donation: Donation;
  settings: OrganizationSettings;
  onBack: () => void;
  isPublic?: boolean;
}

export const ReceiptView: React.FC<Props> = ({ donation, settings, onBack, isPublic = false }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [base64Logo, setBase64Logo] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const selectedQuote = useMemo(() => {
    return ISLAMIC_QUOTES[parseInt(donation.id.slice(-2), 16) % ISLAMIC_QUOTES.length] || ISLAMIC_QUOTES[0];
  }, [donation.id]);

  useEffect(() => {
    const convertToBase64 = async () => {
      try {
        const response = await fetch(settings.logo);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        return settings.logo;
      }
    };
    convertToBase64().then(res => setBase64Logo(res));
  }, [settings.logo]);

  const generatePdfBlob = async (): Promise<Blob | null> => {
    if (!receiptRef.current) return null;
    const opt = {
      margin: 0,
      filename: `Azadi_Receipt_${donation.transactionId}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 4, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false,
        y: 0,
        scrollY: 0,
        windowWidth: 794, // 210mm at 96dpi
        windowHeight: 1123 // 297mm at 96dpi
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' }
    };
    try {
      return await html2pdf().set(opt).from(receiptRef.current).output('blob');
    } catch (err) {
      console.error("PDF generation failed:", err);
      return null;
    }
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) throw new Error("Could not generate blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Azadi_Receipt_${donation.transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('PDF তৈরিতে সমস্যা হয়েছে।');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `আসসালামু আলাইকুম,\n\n*দাতার নাম:* ${donation.isAnonymous ? 'নাম প্রকাশে অনিচ্ছুক' : donation.donorName}\n*পরিমাণ:* ৳${donation.amount}\n*ট্রানজেকশন আইডি:* ${donation.transactionId}\n\nধন্যবাদান্তে,\nআজাদী সমাজ কল্যাণ সংঘ।`;
    const url = `https://wa.me/${settings.adminWhatsApp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-2 md:p-8 pb-24 bengali">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-lg border border-emerald-100 dark:border-slate-800">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 font-black transition-colors uppercase text-[10px] tracking-widest px-4 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl">
            <ArrowLeft size={16} /> ফিরে যান
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload} 
              disabled={isGenerating || !base64Logo} 
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[9px] flex items-center gap-2 shadow-md hover:bg-emerald-700 transition-all uppercase disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
              PDF ডাউনলোড
            </button>
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[9px] flex items-center gap-2 shadow-md hover:bg-black transition-all uppercase">
              <Printer size={14} /> প্রিন্ট
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
                    <div className="font-black text-slate-900 text-sm">{new Date(donation.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
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
                <div className="bg-emerald-900 text-white px-16 py-8 rounded-[2.5rem] text-center shadow-xl relative overflow-hidden ring-[8px] ring-emerald-50">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full"></div>
                  <div className="text-[9px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">মোট অনুদান পরিমাণ / Amount</div>
                  <div className="text-5xl font-black font-mono tracking-tighter">৳{donation.amount.toLocaleString()}</div>
                  <div className="mt-3 text-[9px] font-black uppercase opacity-50 border-t border-white/10 pt-3 tracking-[0.15em]">{donation.amount} Taka Only</div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Tightly optimized for visibility */}
            <div className="space-y-8 pb-4">
              {/* Islamic Quote Card - Ensure this is fully visible */}
              <div className="text-center">
                <div className="space-y-2 px-8 py-5 bg-emerald-50/20 rounded-[2rem] border border-emerald-100/40 relative">
                   <Heart className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-rose-500 bg-white p-1 rounded-full shadow-sm" size={20} fill="currentColor" />
                   <div className="text-2xl text-emerald-900 font-serif italic bengali leading-tight">{selectedQuote.arabic}</div>
                   <div className="text-[11px] font-black text-slate-700 bengali leading-snug">{selectedQuote.bn}</div>
                </div>
              </div>

              {/* Signature Row */}
              <div className="flex justify-between items-end px-4">
                <div className="relative">
                  <div className="w-20 h-20 border border-emerald-900/10 rounded-full flex flex-col items-center justify-center text-[6px] font-black transform -rotate-12 opacity-30 bg-white shadow-inner">
                     <ShieldCheck size={18} className="mb-0.5 text-emerald-900" />
                     <span className="uppercase text-center leading-tight">Azadi Social Welfare<br/>Official Seal</span>
                  </div>
                </div>
                <div className="text-center w-56 space-y-1.5">
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
