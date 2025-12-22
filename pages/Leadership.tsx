
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { ShieldCheck, Mail, PhoneCall, MessageCircle, User } from 'lucide-react';

export const Leadership: React.FC = () => {
  const { lang, leadership, settings } = useApp();
  const t = TRANSLATIONS[lang];

  // Sort leadership by order before rendering
  const sortedLeadership = [...leadership].sort((a, b) => (a.order || 99) - (b.order || 99));

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.25em] text-[11px] px-5 py-2 bg-emerald-50 dark:bg-emerald-900/40 rounded-full border border-emerald-100 dark:border-emerald-800 shadow-sm">
           <User size={16} />
           {lang === 'bn' ? 'কার্যকরী কমিটি' : 'Executive Committee'}
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">{t.leadership}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
          {lang === 'bn' 
            ? 'আমাদের পরিচালনা পর্ষদ এবং নিবেদিতপ্রাণ স্বেচ্ছাসেবক যারা সমাজ গঠনে অগ্রণী ভূমিকা পালন করছেন।' 
            : 'Our Board of Directors and dedicated volunteers leading the way in social development.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {sortedLeadership.map((leader) => (
          <div key={leader.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[3rem] -z-10 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 group-hover:border-emerald-500 transition-all duration-500 bg-slate-50 dark:bg-slate-950 shadow-inner">
                  {leader.image ? (
                    <img src={leader.image} alt={lang === 'bn' ? leader.nameBn : leader.nameEn} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <User size={64} />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2.5 rounded-2xl shadow-xl ring-4 ring-white dark:ring-slate-900 transform group-hover:rotate-12 transition-transform">
                  <ShieldCheck size={18} />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{lang === 'bn' ? leader.nameBn : leader.nameEn}</h3>
                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-[0.15em] border border-emerald-100 dark:border-emerald-800">
                  {lang === 'bn' ? leader.designationBn : leader.designationEn}
                </div>
              </div>
              
              <div className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-5 rounded-[2rem] w-full border border-slate-100 dark:border-slate-800/60 leading-relaxed font-bold">
                <MessageCircle size={14} className="inline mr-2 text-emerald-500 mb-1" />
                {lang === 'bn' ? leader.messageBn : leader.messageEn}
              </div>

              {leader.phone && (
                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full justify-center">
                  <a href={`tel:${leader.phone}`} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all flex items-center gap-3 border border-slate-200 dark:border-slate-700">
                    <PhoneCall size={18} />
                    <span className="text-[11px] font-black tracking-widest">{leader.phone}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Quote */}
      <div className="mt-20 p-12 bg-emerald-900 dark:bg-emerald-950 rounded-[4rem] text-center space-y-4 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabic-bazazz.png')] opacity-10"></div>
        <p className="text-2xl md:text-3xl font-black text-emerald-50 italic relative z-10 leading-relaxed max-w-4xl mx-auto">
          " {lang === 'bn' ? 'আমরা একটি সুন্দর ও উন্নত সমাজ বিনির্মাণে সংকল্পবদ্ধ।' : 'We are committed to building a beautiful and developed society.'} "
        </p>
        <div className="w-16 h-1.5 bg-amber-400 mx-auto rounded-full relative z-10 group-hover:w-32 transition-all duration-700"></div>
      </div>
    </div>
  );
};
