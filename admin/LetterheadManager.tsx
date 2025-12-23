
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { FileText, Printer, Save, Edit3, MapPin, Phone, Mail, Upload, Eraser, PenTool, Check, Download, Globe } from 'lucide-react';

declare var html2pdf: any;

export const LetterheadManager: React.FC = () => {
  const { lang, settings, letterhead, saveLetterhead } = useApp();
  const t = TRANSLATIONS[lang];
  const [localConfig, setLocalConfig] = useState(letterhead);
  const [viewMode, setViewMode] = useState<'bn' | 'en'>(lang);
  const [today, setToday] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const letterheadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToday(new Date().toLocaleDateString(viewMode === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  }, [viewMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLocalConfig(prev => ({ ...prev, signature: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => { setIsDrawing(true); draw(e); };
  const stopDrawing = () => { setIsDrawing(false); if (canvasRef.current) canvasRef.current.getContext('2d')?.beginPath(); };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };

  const clearCanvas = () => canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  const saveSignatureFromCanvas = () => {
    if (canvasRef.current) {
      setLocalConfig({ ...localConfig, signature: canvasRef.current.toDataURL('image/png') });
      alert(lang === 'bn' ? 'স্বাক্ষর সেভ হয়েছে!' : 'Signature captured!');
    }
  };

  const handleSave = () => { saveLetterhead(localConfig); alert(lang === 'bn' ? 'লেটারহেড সংরক্ষিত হয়েছে!' : 'Letterhead saved!'); };

  const handleDownloadPDF = async () => {
    if (!letterheadRef.current) return;
    setIsGeneratingPdf(true);

    try {
      await document.fonts.ready;
      const element = letterheadRef.current;
      
      const opt = {
        margin: 0,
        filename: `Azadi_Official_Pad_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 1.0 }, 
        html2canvas: { 
          scale: 3, 
          useCORS: true, 
          logging: false, 
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          scrollY: 0, 
          scrollX: 0,
          windowWidth: 794, 
          windowHeight: 1123, 
          x: 0,
          y: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          precision: 16
        }
      };

      await new Promise(resolve => setTimeout(resolve, 800));
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Error:', error);
      alert(lang === 'bn' ? 'পিডিএফ ডাউনলোডে সমস্যা হয়েছে!' : 'PDF Download Failed!');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    if (!letterheadRef.current) return;
    const printContent = letterheadRef.current.innerHTML;
    
    const style = `
      <style>
        @page { size: A4; margin: 0; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
        .print-container { width: 210mm; height: 297mm; margin: 0; padding: 0; overflow: hidden; }
      </style>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print</title>');
      printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700;900&display=swap" rel="stylesheet">');
      printWindow.document.write(style);
      printWindow.document.write('</head><body><div class="print-container">');
      printWindow.document.write(printContent);
      printWindow.document.write('</div></body></html>');
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  const BENGALI_STYLE: React.CSSProperties = { 
    fontFamily: '"Noto Sans Bengali", sans-serif',
    letterSpacing: '0px',
    fontVariantLigatures: 'common-ligatures',
    fontWeight: 900
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8 no-print">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400"><FileText size={32} /></div>
            {t.letterhead}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">{lang === 'bn' ? 'অফিসিয়াল লেটারহেড এবং মেমোরেন্ডাম ব্যবস্থাপনা' : 'Official letterhead & memorandum management'}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button onClick={() => setViewMode('bn')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'bn' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500'}`}>বাংলা</button>
            <button onClick={() => setViewMode('en')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'en' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500'}`}>English</button>
          </div>
          <button onClick={handleSave} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-emerald-700 transition-all"><Save size={20} /> সেভ করুন</button>
          <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50">
            <Download size={20} className={isGeneratingPdf ? 'animate-bounce' : ''} /> {isGeneratingPdf ? 'তৈরি হচ্ছে...' : 'ডাউনলোড PDF'}
          </button>
          <button onClick={handlePrint} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl transition-all"><Printer size={20} /> প্রিন্ট</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-8 no-print">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white"><Edit3 className="text-emerald-500" /> বিস্তারিত তথ্য</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Signatory Name" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={localConfig.leaderName} onChange={e => setLocalConfig({...localConfig, leaderName: e.target.value})} />
              <input type="text" placeholder="Designation" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={localConfig.designation} onChange={e => setLocalConfig({...localConfig, designation: e.target.value})} />
              <textarea rows={10} placeholder="পত্রের মূল বিষয়বস্তু এখানে লিখুন..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-medium text-sm leading-relaxed" value={localConfig.bodyText} onChange={e => setLocalConfig({...localConfig, bodyText: e.target.value})} />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white"><PenTool className="text-emerald-500" /> ডিজিটাল স্বাক্ষর</h3>
            <div className="space-y-4">
              <div className="relative bg-white border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl h-40">
                <canvas ref={canvasRef} width={400} height={160} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full cursor-crosshair touch-none" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={clearCanvas} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Eraser size={14} /></button>
                  <button onClick={saveSignatureFromCanvas} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><Check size={14} /></button>
                </div>
              </div>
              <label className="flex items-center justify-center gap-3 w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-emerald-50 transition-all">
                <Upload size={18} className="text-slate-400" />
                <span className="text-xs font-black text-slate-500">স্বাক্ষরের ছবি আপলোড করুন</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-200 dark:bg-slate-950 p-2 md:p-6 rounded-[3rem] border border-slate-300 dark:border-slate-800 shadow-inner print:p-0 print:border-0 print:bg-white overflow-hidden flex justify-center">
          <div 
            ref={letterheadRef} 
            className="bg-white shadow-2xl relative flex flex-col print:shadow-none print:m-0" 
            style={{ 
              width: '210mm', 
              height: '297mm', 
              minHeight: '297mm',
              padding: '10mm 15mm 10mm 15mm', 
              boxSizing: 'border-box',
              color: '#000000',
              overflow: 'hidden',
              margin: '0 auto',
              fontFamily: '"Noto Sans Bengali", sans-serif'
            }}
          >
            <div className="text-center mb-4">
              <div 
                className="inline-block px-10 py-1.5 border-b border-emerald-950/10 text-[13px] text-emerald-950 uppercase"
                style={{ ...BENGALI_STYLE }}
              >
                {viewMode === 'bn' ? settings.sloganBn : settings.sloganEn}
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4 border-b-2 border-emerald-900 pb-4 mb-8 relative">
              <div className="flex items-center justify-between w-full px-2">
                <div className="w-24 h-24 shrink-0 p-1 border-2 border-emerald-600 rounded-full bg-white flex items-center justify-center overflow-hidden">
                   <img src={settings.logo} className="w-full h-full object-contain" alt="Logo" crossOrigin="anonymous" />
                </div>

                <div className="flex-1 px-4 text-center">
                  <h1 
                    className="text-4xl font-black text-emerald-950 leading-none mb-2" 
                    style={{ fontSize: '38px', ...BENGALI_STYLE }}
                  >
                    {viewMode === 'bn' ? settings.nameBn : settings.nameEn}
                  </h1>
                  <p 
                    className="text-[12px] font-bold text-emerald-800"
                    style={{ ...BENGALI_STYLE, fontWeight: 700 }}
                  >
                    {viewMode === 'bn' ? settings.establishedBn : settings.establishedEn}
                  </p>
                </div>

                <div className="w-24 h-16 shrink-0 border border-slate-100 bg-white overflow-hidden shadow-sm flex items-center justify-center rounded-sm">
                  <img src={settings.flag} className="w-full h-full object-cover" alt="Flag" crossOrigin="anonymous" />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 mt-1">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800" style={{ ...BENGALI_STYLE, fontWeight: 700 }}>
                  <MapPin size={11} className="text-emerald-900" /> {viewMode === 'bn' ? settings.addressBn : settings.addressEn}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800" style={{ ...BENGALI_STYLE, fontWeight: 700 }}>
                  <Phone size={11} className="text-emerald-900" /> {settings.phone}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800" style={{ ...BENGALI_STYLE, fontWeight: 700 }}>
                  <Mail size={11} className="text-emerald-900" /> {settings.email}
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none z-0">
               <img src={settings.logo} className="w-[450px] h-[450px] object-contain" alt="Watermark" crossOrigin="anonymous" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col px-4 overflow-hidden">
              <div className="flex justify-between items-center mb-6 text-[15px] font-bold" style={{ ...BENGALI_STYLE, fontWeight: 700 }}>
                <div className="flex items-center gap-2">
                  স্মারক নং: <span className="border-b border-dotted border-slate-400 min-w-[180px] inline-block"></span>
                </div>
                <div className="flex items-center gap-2">
                  তারিখ: <span className="border-b border-slate-300 px-6">{today}</span>
                </div>
              </div>

              <div 
                className="whitespace-pre-wrap leading-[1.8] text-slate-950 text-[15px] font-medium text-justify flex-1 overflow-hidden"
                style={{ ...BENGALI_STYLE, fontWeight: 500 }}
              >
                {localConfig.bodyText || (
                  <div className="space-y-6 opacity-[0.03] pt-6 no-print">
                    {[...Array(15)].map((_, i) => (
                      <div key={i} className="h-4 border-b border-dotted border-emerald-900 w-full"></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 pt-6 pb-2 px-4 flex justify-between items-end border-t border-emerald-900/5 mt-4">
              <div className="relative">
                <div className="w-28 h-28 border-[5px] border-double border-emerald-900/10 rounded-full flex flex-col items-center justify-center text-center p-3 transform -rotate-12 bg-white/40">
                   <div className="text-[6px] font-black text-emerald-950 uppercase leading-none mb-1 text-center" style={{ ...BENGALI_STYLE }}>{viewMode === 'bn' ? settings.nameBn : settings.nameEn}</div>
                   <div className="w-full h-[0.5px] bg-emerald-900/10 my-1"></div>
                   <div className="text-[12px] font-black text-emerald-900 font-mono">{new Date().toLocaleDateString('en-GB')}</div>
                   <div className="w-full h-[0.5px] bg-emerald-900/10 my-1"></div>
                   <div className="text-[6px] font-black text-emerald-950 uppercase tracking-widest">OFFICIAL SEAL</div>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-1.5 min-w-[250px]">
                {localConfig.signature && (
                  <img src={localConfig.signature} className="h-20 w-auto object-contain mb-1" alt="Signature" crossOrigin="anonymous" />
                )}
                <div className="w-full h-[1.5px] bg-slate-950"></div>
                <div 
                  className="text-xl font-black text-slate-950 leading-none pt-2"
                  style={{ ...BENGALI_STYLE }}
                >
                  {localConfig.leaderName}
                </div>
                <div 
                  className="text-[12px] font-bold text-emerald-900"
                  style={{ ...BENGALI_STYLE, fontWeight: 700 }}
                >
                  {localConfig.designation}
                </div>
                <div 
                  className="text-[10px] font-bold text-slate-400 mt-0.5 opacity-80"
                  style={{ ...BENGALI_STYLE, fontWeight: 700 }}
                >
                  {viewMode === 'bn' ? settings.nameBn : settings.nameEn}
                </div>
              </div>
            </div>

            <div className="mt-2 pt-3 px-2 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-emerald-900/5">
              <div>azadi social welfare organization</div>
              <div className="flex items-center gap-1.5"><Globe size={10} /> azadi-1988.vercel.app</div>
            </div>

            <div className="absolute inset-4 border border-emerald-900/5 pointer-events-none rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
