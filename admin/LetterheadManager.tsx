
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { FileText, Printer, Save, Edit3, MapPin, Phone, Mail, Upload, Eraser, PenTool, Check, Download } from 'lucide-react';

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

    const element = letterheadRef.current;
    const opt = {
      margin: 0,
      filename: `Azadi_Letterhead_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert(lang === 'bn' ? 'পিডিএফ তৈরিতে সমস্যা হয়েছে!' : 'Failed to generate PDF!');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8 no-print">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400"><FileText size={32} /></div>
            {t.letterhead}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">{lang === 'bn' ? 'ডিজিটাল লেটারহেড এবং স্ট্যাম্প ব্যবস্থাপনা' : 'Digital letterhead & stamp management'}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button onClick={() => setViewMode('bn')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'bn' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500'}`}>বাংলা</button>
            <button onClick={() => setViewMode('en')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'en' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500'}`}>English</button>
          </div>
          <button onClick={handleSave} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-emerald-700 transition-all"><Save size={20} /> {t.submit}</button>
          <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50">
            <Download size={20} className={isGeneratingPdf ? 'animate-bounce' : ''} /> {isGeneratingPdf ? (lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...') : (lang === 'bn' ? 'ডাউনলোড PDF' : 'Download PDF')}
          </button>
          <button onClick={() => window.print()} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl transition-all"><Printer size={20} /> Print</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-8 no-print">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white"><Edit3 className="text-emerald-500" /> Basic Details</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Signatory Name" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={localConfig.leaderName} onChange={e => setLocalConfig({...localConfig, leaderName: e.target.value})} />
              <input type="text" placeholder="Designation" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={localConfig.designation} onChange={e => setLocalConfig({...localConfig, designation: e.target.value})} />
              <textarea rows={6} placeholder="Document Content" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-medium text-sm" value={localConfig.bodyText} onChange={e => setLocalConfig({...localConfig, bodyText: e.target.value})} />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white"><PenTool className="text-emerald-500" /> Digital Signature</h3>
            <div className="space-y-4">
              <div className="relative bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl h-40">
                <canvas ref={canvasRef} width={400} height={160} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full cursor-crosshair touch-none" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={clearCanvas} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Eraser size={14} /></button>
                  <button onClick={saveSignatureFromCanvas} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><Check size={14} /></button>
                </div>
              </div>
              <label className="flex items-center justify-center gap-3 w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-emerald-50 transition-all">
                <Upload size={18} className="text-slate-400" />
                <span className="text-xs font-black text-slate-500">Upload Signature Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-100 dark:bg-slate-950 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-inner print:p-0 print:border-0 print:bg-white">
          <div ref={letterheadRef} className="bg-white p-12 md:p-14 shadow-2xl min-h-[1100px] w-full text-slate-900 mx-auto relative flex flex-col print:shadow-none print:m-0 print:p-12">
            
            {/* Header Structure: Slogan Centered Top */}
            <div className="border-b-[4px] border-emerald-800 pb-10 flex flex-col items-center relative">
              <div className="w-full text-center text-[11px] font-black text-emerald-800 uppercase tracking-[0.4em] mb-10 border-b border-emerald-100 pb-2">
                {viewMode === 'bn' ? settings.sloganBn : settings.sloganEn}
              </div>

              {/* Logo Left | Info Center | Flag Right */}
              <div className="flex items-center justify-between w-full gap-4 relative">
                <div className="w-28 h-28 shrink-0 relative rounded-full border-[3px] border-emerald-600 bg-white p-1.5 shadow-lg flex items-center justify-center overflow-hidden ring-4 ring-emerald-500/5">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white relative z-10">
                    <img src={settings.logo} className="w-full h-full object-contain" alt="Logo" />
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center text-center space-y-1">
                  <h1 className="text-3xl font-black text-emerald-900 leading-none">{viewMode === 'bn' ? settings.nameBn : settings.nameEn}</h1>
                  <h2 className="text-[14px] font-bold text-emerald-700 uppercase tracking-widest">{viewMode === 'bn' ? settings.establishedBn : settings.establishedEn}</h2>
                  <div className="pt-2 flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700 leading-tight">
                      <MapPin size={14} className="text-emerald-700 shrink-0" />
                      {viewMode === 'bn' ? settings.addressBn : settings.addressEn}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                      <div className="flex items-center gap-1.5"><Phone size={13} className="text-emerald-700" />{settings.phone}</div>
                      <div className="flex items-center gap-1.5"><Mail size={13} className="text-emerald-700" />{settings.email}</div>
                    </div>
                  </div>
                </div>

                <div className="w-28 h-16 shrink-0 border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center bg-white">
                  <img src={settings.flag} className="w-full h-full object-cover" alt="Flag" />
                </div>
              </div>
            </div>

            {/* Content Area with Watermark */}
            <div className="flex-1 py-14 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
                <img src={settings.logo} className="w-[500px] h-[500px] object-contain" alt="Watermark" />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between text-sm font-black mb-12">
                  <div>Ref: <span className="border-b-2 border-dotted border-slate-300 px-10"></span></div>
                  <div>Date: <span className="border-b-2 border-slate-200 px-4">{today}</span></div>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-slate-800 flex-1 text-[18px] font-medium tracking-wide">
                  {localConfig.bodyText || <div className="space-y-10 opacity-5 mt-10 no-print">{[...Array(10)].map((_, i) => <div key={i} className="h-4 border-b-2 border-dotted border-slate-200"></div>)}</div>}
                </div>
              </div>
            </div>

            {/* Footer Section: Stamp & Signature */}
            <div className="mt-auto pt-10 flex justify-between items-end pb-4 relative z-10">
              <div className="relative">
                <div className="w-32 h-32 border-[6px] border-double border-emerald-800/40 rounded-full flex flex-col items-center justify-center text-center p-3 transform -rotate-12 opacity-80 bg-white/50">
                   <div className="text-[7px] font-black text-emerald-950 uppercase leading-tight mb-0.5">{viewMode === 'bn' ? settings.nameBn : settings.nameEn}</div>
                   <div className="w-3/4 h-px bg-emerald-800/20 my-0.5"></div>
                   <div className="text-[12px] font-black text-emerald-900 font-mono">{new Date().toLocaleDateString('en-GB')}</div>
                   <div className="w-3/4 h-px bg-emerald-800/20 my-0.5"></div>
                   <div className="text-[6px] font-black text-emerald-900 uppercase tracking-tighter">OFFICIAL SEAL</div>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2 min-w-[220px]">
                {localConfig.signature && <img src={localConfig.signature} className="h-20 w-auto object-contain mix-blend-multiply" alt="Signature" />}
                <div className="w-full h-px bg-slate-900"></div>
                <div className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">{localConfig.leaderName}</div>
                <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{localConfig.designation}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
