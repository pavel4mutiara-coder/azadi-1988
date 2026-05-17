
import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { BellRing, Clock, AlertTriangle, FileText, ChevronRight, Share2, Calendar } from 'lucide-react';

export const Notices: React.FC = () => {
  const { lang, notices } = useApp();
  const t = TRANSLATIONS[lang];

  // Sort notices by date (newest first)
  const sortedNotices = Array.isArray(notices) 
    ? [...notices].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    : [];

  return (
    <div className="space-y-16 pb-24 bengali">
      {/* Header Section */}
      <section className="relative py-20 px-8 bg-emerald-950 dark:bg-slate-900 rounded-[3rem] text-center overflow-hidden border border-emerald-800 dark:border-slate-800 shadow-heavy">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabic-bazazz.png')]"></div>
        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-emerald-400/30">
            <BellRing size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tighter">
            {t.notices}
          </h1>
          <p className="text-emerald-100/70 font-medium max-w-2xl mx-auto text-base sm:text-xl bengali opacity-90">
            {lang === 'bn' 
              ? 'সংস্থার সকল গুরুত্বপূর্ণ তথ্য ও বিজ্ঞপ্তি এখানে নিয়মিত আপডেট করা হয়।' 
              : 'All important information and notices of the organization are updated regularly here.'}
          </p>
        </div>
      </section>

      {/* Notices List */}
      <section className="container mx-auto px-4 max-w-5xl">
        {sortedNotices.length > 0 ? (
          <div className="grid grid-cols-1 gap-10">
            {sortedNotices.map((notice, index) => (
              <div 
                key={notice.id} 
                className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] border ${
                  notice.isUrgent 
                    ? 'border-red-100 dark:border-red-900/40 bg-red-50/10 dark:bg-red-900/5' 
                    : 'border-slate-100 dark:border-slate-800'
                } p-8 md:p-12 shadow-soft hover:shadow-heavy transition-all duration-500 relative overflow-hidden`}
              >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                   <div className="shrink-0 space-y-4 text-center md:text-left">
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${
                       notice.isUrgent 
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' 
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                     }`}>
                       {notice.isUrgent ? <AlertTriangle size={32} /> : <FileText size={32} />}
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'bn' ? 'তারিখ' : 'Date'}</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 justify-center md:justify-start">
                          <Calendar size={14} className="text-emerald-500" />
                          {new Date(notice.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                        </div>
                     </div>
                   </div>

                   <div className="flex-1 space-y-6">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          {notice.isUrgent && (
                            <span className="px-5 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-red-500/30 animate-pulse">
                              {lang === 'bn' ? 'জরুরী বিজ্ঞপ্তি' : 'Urgent Notice'}
                            </span>
                          )}
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                            NO #{index + 1}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-[1.2] bengali group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {lang === 'bn' ? notice.titleBn : notice.titleEn}
                        </h2>
                      </div>

                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed bengali font-medium whitespace-pre-wrap">
                          {lang === 'bn' ? notice.contentBn : notice.contentEn}
                        </p>
                      </div>

                      <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-slate-100 dark:border-slate-800/50">
                         <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                           <Clock size={14} className="text-emerald-500" />
                           {lang === 'bn' ? 'প্রকাশিত:' : 'Posted:'} {new Date(notice.date).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                         </div>
                         <button className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-6 py-2.5 rounded-xl font-black text-[12px] uppercase hover:bg-emerald-600 hover:text-white transition-all">
                            <Share2 size={16} /> {lang === 'bn' ? 'শেয়ার করুন' : 'Share'}
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-emerald-50/20 dark:bg-slate-950/50 rounded-[4rem] border border-dashed border-emerald-200 dark:border-emerald-800/50 space-y-6 opacity-60">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-soft">
              <BellRing size={48} className="text-emerald-100 dark:text-emerald-800 line-through" />
            </div>
            <p className="font-black text-slate-400 text-xl bengali">
              {lang === 'bn' ? 'বর্তমানে কোনো নতুন বিজ্ঞপ্তি নেই।' : 'No new notices available at this moment.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
