
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
    // PDF generation logic...
    setIsGeneratingPdf(false);
  };

  const handlePrint = () => {
    if (!letterheadRef.current) return;
    // Print logic...
  };

  const BENGALI_STYLE: React.CSSProperties = { 
    fontFamily: '"Noto Sans Bengali", sans-serif',
    letterSpacing: '0px',
    fontVariantLigatures: 'common-ligatures',
    fontWeight: 900
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <FileText size={24} />
          </div>
          <h1 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white">
            {t.letterhead}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSave} className="flex-1 md:flex-none bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg"><Save size={16} /> Save</button>
          <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg"><Download size={16} /> PDF</button>
          <button onClick={handlePrint} className="flex-1 md:flex-none bg-slate-900 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg"><Printer size={16} /> Print</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-6 no-print">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <h3 className="text-sm md:text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase"><Edit3 size={18} className="text-emerald-500" /> Details</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Signatory Name" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm" value={localConfig.leaderName} onChange={e => setLocalConfig({...localConfig, leaderName: e.target.value})} />
              <input type="text" placeholder="Designation" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm" value={localConfig.designation} onChange={e => setLocalConfig({...localConfig, designation: e.target.value})} />
              <textarea rows={6} placeholder="Message body..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-medium text-xs leading-relaxed" value={localConfig.bodyText} onChange={e => setLocalConfig({...localConfig, bodyText: e.target.value})} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase"><PenTool size={18} className="text-emerald-500" /> Signature</h3>
            <div className="relative bg-white border border-slate-200 rounded-xl h-32 md:h-40">
              <canvas ref={canvasRef} width={400} height={160} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full cursor-crosshair touch-none" />
              <div className="absolute top-1 right-1 flex gap-1">
                <button onClick={clearCanvas} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Eraser size={12} /></button>
                <button onClick={saveSignatureFromCanvas} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Check size={12} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Scaled Preview Wrapper */}
        <div className="lg:col-span-8 bg-slate-100 dark:bg-slate-950 p-2 md:p-6 rounded-[2rem] md:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden">
          <div className="overflow-x-auto pb-4">
            <div 
              ref={letterheadRef} 
              className="bg-white shadow-2xl relative flex flex-col mx-auto origin-top" 
              style={{ 
                width: '210mm', 
                height: '297mm', 
                padding: '10mm 15mm', 
                boxSizing: 'border-box',
                color: '#000000',
                fontFamily: '"Noto Sans Bengali", sans-serif'
              }}
            >
              {/* Pad content (already correctly styled from previous versions) */}
              <div className="text-center mb-4">
                <div className="inline-block px-10 py-1.5 border-b border-emerald-950/10 text-[13px] text-emerald-950 uppercase" style={{ ...BENGALI_STYLE }}>
                  {viewMode === 'bn' ? settings.sloganBn : settings.sloganEn}
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-4 border-b-2 border-emerald-900 pb-4 mb-8">
                <div className="flex items-center justify-between w-full">
                  <div className="w-20 h-20 p-1 border-2 border-emerald-600 rounded-full bg-white flex items-center justify-center overflow-hidden">
                     <img src={settings.logo} className="w-full h-full object-contain" alt="Logo" />
                  </div>
                  <div className="flex-1 px-4">
                    <h1 className="text-3xl font-black text-emerald-950 leading-none mb-1" style={{ fontSize: '32px', ...BENGALI_STYLE }}>{viewMode === 'bn' ? settings.nameBn : settings.nameEn}</h1>
                    <p className="text-[10px] font-bold text-emerald-800" style={{ ...BENGALI_STYLE, fontWeight: 700 }}>{viewMode === 'bn' ? settings.establishedBn : settings.establishedEn}</p>
                  </div>
                  <div className="w-20 h-12 border border-slate-100 bg-white flex items-center justify-center rounded-sm">
                    <img src={settings.flag} className="w-full h-full object-cover" alt="Flag" />
                  </div>
                </div>
              </div>

              <div className="flex-1 px-4 text-[14px] leading-relaxed" style={{ ...BENGALI_STYLE, fontWeight: 500 }}>
                {localConfig.bodyText || 'পত্রের মূল বিষয়বস্তু এখানে প্রদর্শিত হবে...'}
              </div>

              <div className="pt-6 border-t border-emerald-900/5 mt-4 flex justify-between items-end">
                <div className="w-24 h-24 border-4 border-double border-emerald-900/10 rounded-full flex items-center justify-center text-[8px] font-black opacity-40">STAMP</div>
                <div className="text-center w-52 space-y-1">
                  <div className="h-[1.5px] bg-slate-950 w-full mb-1"></div>
                  <div className="text-lg font-black text-slate-950 leading-none" style={{ ...BENGALI_STYLE }}>{localConfig.leaderName}</div>
                  <div className="text-[11px] font-bold text-emerald-900" style={{ ...BENGALI_STYLE, fontWeight: 700 }}>{localConfig.designation}</div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest no-print">
            {lang === 'bn' ? 'বাম থেকে ডানে স্ক্রল করে সম্পূর্ণ দেখুন' : 'Scroll left to right to see full preview'}
          </p>
        </div>
      </div>
    </div>
  );
};
