
import React, { useState, useEffect, useRef } from 'react';
import { Donation, OrganizationSettings, DonationStatus } from '../types';
import { Heart, Printer, ArrowLeft, Download, MessageCircle, ShieldCheck, Mail, Phone, MapPin, Loader2, Eye, CheckCircle2, Clock } from 'lucide-react';

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

  const logoId = "1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh";
  const logoUrl = `https://lh3.googleusercontent.com/d/${logoId}`;

  useEffect(() => {
    const convertToBase64 = async () => {
      try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        return logoUrl;
      }
    };
    convertToBase64().then(res => setBase64Logo(res));
  }, [logoUrl]);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const opt = {
      margin: 0,
      filename: `Azadi_Receipt_${donation.transactionId}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2.5, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      const worker = html2pdf().set(opt).from(receiptRef.current);
      
      if (isIOS) {
        const pdfBlob = await worker.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
      } else {
        await worker.save();
      }
    } catch (err) {
      console.error(err);
      alert('PDF তৈরিতে সমস্যা হয়েছে। প্রিন্ট অপশনটি ব্যবহার করুন।');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `আসসালামু আলাইকুম,\nআমি আজাদী সমাজ কল্যাণ সংঘে একটি অনুদান প্রদান করেছি।\n\n*দাতার নাম:* ${donation.isAnonymous ? 'নাম প্রকাশে অনিচ্ছুক' : donation.donorName}\n*পরিমাণ:* ৳${donation.amount}\n*ট্রানজেকশন আইডি:* ${donation.transactionId}\n*অবস্থা:* ${donation.status === DonationStatus.APPROVED ? 'অনুমোদিত' : 'অপেক্ষমান'}\n\nধন্যবাদ।`;
    const url = `https://wa.me/${settings.adminWhatsApp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-2 md:p-8 animate-in fade-in duration-500 pb-20">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 font-black transition-colors uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16} /> {isPublic ? 'পিছনে' : 'ড্যাশবোর্ড'}
          </button>
          <div className="flex gap-2">
            <button onClick={handleWhatsAppShare} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-md hover:bg-emerald-700 transition-all uppercase">
              <MessageCircle size={16} /> WhatsApp
            </button>
            <button 
              onClick={handleDownload} 
              disabled={isGenerating || !base64Logo} 
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all uppercase disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
              {isGenerating ? 'প্রসেসিং...' : 'ডাউনলোড (PDF)'}
            </button>
            <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-md hover:bg-black transition-all uppercase">
              <Printer size={16} /> প্রিন্ট
            </button>
          </div>
        </div>

        <div 
          ref={receiptRef} 
          className="bg-white p-6 md:p-14 shadow-2xl relative border-t-[12px] border-emerald-900 text-slate-900 rounded-b-3xl bengali overflow-hidden mx-auto" 
          style={{ width: '100%', maxWidth: '794px', minHeight: '1050px', fontFamily: '"Noto Sans Bengali", sans-serif' }}
        >
          <div className="flex flex-col items-center text-center border-b border-emerald-100 pb-8 mb-8 relative">
            <div className="w-24 h-24 mb-4 relative z-10 p-1 bg-white rounded-full shadow-sm">
              {base64Logo && <img src={base64Logo} className="w-full h-full object-contain" alt="Logo" />}
            </div>
            <div className="space-y-1 relative z-10">
              <h1 className="text-3xl font-black text-emerald-900 leading-none">{settings.nameBn}</h1>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2 opacity-80">{settings.nameEn}</h2>
              <div className="mt-4 space-y-1 text-slate-600">
                <p className="text-[11px] font-bold flex items-center justify-center gap-2"><MapPin size={12} className="text-emerald-800" /> {settings.addressBn}</p>
                <div className="flex items-center justify-center gap-5 text-[11px] font-bold">
                  <span className="flex items-center gap-1"><Phone size={12} className="text-emerald-800" /> {settings.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={12} className="text-emerald-800" /> {settings.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            {base64Logo && <img src={base64Logo} className="w-[400px] h-[400px] object-contain" alt="Watermark" />}
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <span className="bg-emerald-900 text-white px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-lg">অনুদান রশিদ / Donation Receipt</span>
              <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl border-2 font-black text-xs uppercase tracking-widest ${
                donation.status === DonationStatus.APPROVED 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {donation.status === DonationStatus.APPROVED ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                {donation.status === DonationStatus.APPROVED ? (isPublic ? 'অনুমোদিত / Approved' : 'Approved') : (isPublic ? 'অপেক্ষমান / Pending' : 'Pending')}
              </div>
            </div>

            <div className="bg-emerald-50/20 border border-emerald-100 rounded-3xl p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-emerald-100 pb-4">
                <div className="space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">রশিদ নম্বর / ID</div>
                  <div className="font-mono font-bold text-slate-900 text-xs uppercase">REC-{donation.id.slice(-8)}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">তারিখ / Date</div>
                  <div className="font-bold text-slate-900 text-xs">{new Date(donation.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">দাতার নাম / Donor:</div>
                  <div className="text-xl font-black text-emerald-950">{donation.isAnonymous ? 'নাম প্রকাশে অনিচ্ছুক' : donation.donorName}</div>
                </div>
                <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">উদ্দেশ্য / Purpose:</div>
                  <div className="font-bold text-slate-800 text-base">{donation.purpose}</div>
                </div>
                {donation.email && (
                  <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">ইমেইল / Email:</div>
                    <div className="font-bold text-slate-800 text-base">{donation.email}</div>
                  </div>
                )}
                <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">পেমেন্ট মেথড ও আইডি:</div>
                  <div className="font-mono font-bold text-slate-900 uppercase tracking-widest text-[10px]">{donation.paymentMethod} • {donation.transactionId}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <div className="bg-emerald-900 text-white px-14 py-8 rounded-[2.5rem] text-center shadow-xl relative overflow-hidden ring-4 ring-emerald-50">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full"></div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-70 mb-2">মোট অনুদান পরিমাণ / Amount</div>
                <div className="text-5xl font-black font-mono tracking-tighter">৳{donation.amount.toLocaleString()}</div>
                <div className="mt-3 text-[9px] font-black uppercase opacity-60 border-t border-white/20 pt-3 tracking-widest">{donation.amount} Taka Only</div>
              </div>
            </div>

            <div className="flex justify-between items-end pt-8 pb-4">
              <div className="relative">
                <div className="w-28 h-28 border-4 border-double border-emerald-900/20 rounded-full flex flex-col items-center justify-center text-[7px] font-black transform -rotate-12 opacity-40 bg-white shadow-sm">
                   <ShieldCheck size={20} className="mb-1 text-emerald-900" />
                   <span className="uppercase text-center leading-tight">Azadi Social Welfare<br/>Official Stamp</span>
                </div>
              </div>
              <div className="text-center w-52 space-y-2">
                <div className="h-px bg-slate-900 w-full mb-1"></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Authorized Signature</div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-slate-100 pt-8 text-center space-y-6">
              <div className="text-2xl text-emerald-900 font-serif italic bengali drop-shadow-sm select-none">وَمَا تُنفِقُوا مِنْ خَيْرٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ</div>
              <div className="inline-flex items-center justify-center gap-3 text-emerald-900 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-8 py-3 rounded-full shadow-sm">
                <Heart size={14} className="text-rose-500" fill="currentColor" />
                আপনার সহযোগিতার জন্য অশেষ কৃতজ্ঞতা
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
