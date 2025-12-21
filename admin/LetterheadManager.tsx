
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { FileText, Printer, Save, Edit3, Languages, MapPin, Phone, Mail, Upload, FileSignature } from 'lucide-react';

export const LetterheadManager: React.FC = () => {
  const { lang, settings, letterhead, saveLetterhead } = useApp();
  const t = TRANSLATIONS[lang];
  const [localConfig, setLocalConfig] = useState(letterhead);
  const [viewMode, setViewMode] = useState<'bn' | 'en'>(lang);
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString(viewMode === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
  }, [viewMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalConfig(prev => ({ ...prev, signature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    saveLetterhead(localConfig);
    alert(lang === 'bn' ? 'লেটারহেড সংরক্ষিত হয়েছে!' : 'Letterhead configuration saved!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <FileText size={32} />
            </div>
            {t.letterhead}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">
            {lang === 'bn' ? 'অফিসিয়াল লেটারহেড এবং ডিজিটাল স্ট্যাম্প ব্যবস্থাপনা' : 'Manage official letterheads and digital stamps'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 no-print">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setViewMode('bn')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'bn' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-400'}`}
            >
              বাংলা
            </button>
            <button 
              onClick={() => setViewMode('en')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'en' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-400'}`}
            >
              English
            </button>
          </div>
          <button onClick={handleSave} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-700 shadow-xl">
            <Save size={20} /> {t.submit}
          </button>
          <button onClick={handlePrint} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl">
            <Printer size={20} /> Print
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Editor Settings */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 print:hidden">
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Edit3 className="text-emerald-500" /> {lang === 'bn' ? 'তথ্য এডিট করুন' : 'Edit Information'}
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500">Official Name</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={localConfig.leaderName} onChange={e => setLocalConfig({...localConfig, leaderName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500">Designation</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={localConfig.designation} onChange={e => setLocalConfig({...localConfig, designation: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                <FileSignature size={14} /> {lang === 'bn' ? 'লেটারহেড বিষয়বস্তু' : 'Document Content (Body)'}
              </label>
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl focus:ring-2 ring-emerald-500 outline-none text-sm font-medium" 
                rows={12}
                placeholder={lang === 'bn' ? 'আপনার বার্তা এখানে লিখুন...' : "Type document body content..."}
                value={localConfig.bodyText}
                onChange={e => setLocalConfig({...localConfig, bodyText: e.target.value})}
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500">Signature Image</label>
              <div className="relative group w-full h-32 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                {localConfig.signature ? <img src={localConfig.signature} className="h-full object-contain mix-blend-multiply dark:invert" alt="Signature" /> : <Upload className="text-slate-300" size={32} />}
                <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 bg-emerald-600/10 flex items-center justify-center transition-opacity">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Preview */}
        <div className="lg:col-span-8 bg-slate-100 dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-300 dark:border-slate-700 shadow-inner print:p-0 print:bg-white print:border-0">
          <div className="bg-white p-16 shadow-2xl min-h-[1050px] w-full text-black mx-auto relative print:shadow-none print:p-12 print:m-0 flex flex-col">
            
            <div className="flex flex-col items-center text-center gap-6 border-b-4 border-emerald-800 pb-8 relative">
               <div className="text-[12px] font-black text-emerald-800 uppercase tracking-[0.5em] mb-2">{viewMode === 'bn' ? settings.sloganBn : settings.sloganEn}</div>
               <div className="flex items-center justify-between w-full gap-6">
                 <div className="w-28 h-28 relative rounded-full border-[3px] border-emerald-700 bg-white p-2 flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 border-[4px] border-emerald-50 rounded-full"></div>
                   <img src={settings.logo} className="w-full h-full object-contain relative z-10" alt="Logo" />
                 </div>
                 <div className="flex-1">
                   <h1 className="text-3xl font-black text-emerald-900 mb-1 leading-none">{viewMode === 'bn' ? settings.nameBn : settings.nameEn}</h1>
                   <h2 className="text-lg font-bold text-emerald-700 uppercase">{viewMode === 'bn' ? settings.establishedBn : settings.establishedEn}</h2>
                 </div>
                 <img src={settings.flag} className="w-24 h-14 object-cover border-2 border-slate-100" alt="Flag" />
               </div>
               <div className="w-full flex justify-between items-center text-[10px] font-bold text-slate-600 mt-4 px-4 py-2 bg-slate-50 rounded-xl">
                  <div className="uppercase">{viewMode === 'bn' ? settings.addressBn : settings.addressEn}</div>
                  <div className="flex gap-4">
                    <span>{settings.phone}</span>
                    <span>{settings.email}</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 py-16 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <img src={settings.logo} className="w-[500px]" alt="Watermark" />
              </div>

              <div className="flex justify-between text-sm font-black mb-16">
                <div>Ref: ________________</div>
                <div>Date: <span className="text-slate-900 border-b-2 border-emerald-500/20 px-2">{today}</span></div>
              </div>

              <div className="space-y-8 text-base leading-relaxed text-slate-800 relative z-10">
                 <p className="font-black text-xl mb-12">{viewMode === 'bn' ? 'বরাবর,' : 'To whom it may concern,'}</p>
                 <div className="whitespace-pre-wrap min-h-[400px] leading-relaxed">
                   {localConfig.bodyText || <div className="space-y-12 opacity-10 no-print">
                       {[...Array(4)].map((_, i) => <div key={i} className="h-4 border-b border-dotted border-slate-200"></div>)}
                   </div>}
                 </div>
              </div>
            </div>

            <div className="mt-auto pt-10 border-t-2 border-slate-100 flex justify-between items-end pb-6">
              <div className="w-36 h-36 border-[4px] border-double border-emerald-800/70 rounded-full flex flex-col items-center justify-center text-center p-2 transform -rotate-12 opacity-80">
                  <div className="text-[8px] font-black text-emerald-900 uppercase leading-tight">{viewMode === 'bn' ? settings.nameBn : settings.nameEn}</div>
                  <div className="w-4/5 h-px bg-emerald-800/40 my-1"></div>
                  <div className="text-[12px] font-black text-emerald-950 font-mono tracking-tighter">{new Date().toLocaleDateString('en-GB')}</div>
                  <div className="w-4/5 h-px bg-emerald-800/40 my-1"></div>
                  <div className="text-[7px] font-black text-emerald-800 uppercase">ESTD 1988</div>
              </div>

              <div className="flex flex-col items-center text-center gap-2 min-w-[200px]">
                {localConfig.signature && <img src={localConfig.signature} className="h-20 w-auto object-contain mix-blend-multiply" alt="Sig" />}
                <div className="w-full h-0.5 bg-slate-900"></div>
                <div className="text-base font-black text-slate-900 uppercase">{localConfig.leaderName}</div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">{localConfig.designation}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
