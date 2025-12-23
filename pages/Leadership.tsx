
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { ShieldCheck, PhoneCall, MessageCircle, User } from 'lucide-react';

export const Leadership: React.FC = () => {
  const { lang, leadership, settings } = useApp();
  const t = TRANSLATIONS[lang];

  const sortedLeadership = [...leadership].sort((a, b) => (a.order || 99) - (b.order || 99));

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 bengali">
      {/* Header Section with Clean Typography */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full border border-emerald-200 dark:border-emerald-700 shadow-sm">
           <User size={14} />
           {lang === 'bn' ? 'কার্যকরী কমিটি' : 'Executive Committee'}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.leadership}
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-bold leading-relaxed px-4">
          {lang === 'bn' 
            ? 'আমাদের পরিচালনা পর্ষদ এবং নিবেদিতপ্রাণ স্বেচ্ছাসেবক যারা সমাজ গঠনে অগ্রণী ভূমিকা পালন করছেন।' 
            : 'Our Board of Directors and dedicated volunteers leading the way in social development.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {sortedLeadership.map((leader) => (
          <div key={leader.id} className="bg-emerald-50/60 dark:bg-slate-900 rounded-[3rem] border border-emerald-100 dark:border-slate-800 p-8 shadow-xl group hover:-translate-y-2 hover:shadow-emerald-200/50 dark:hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/10 group-hover:border-emerald-500 transition-all duration-500 bg-white dark:bg-slate-950 p-1 shadow-lg flex items-center justify-center">
                <img 
                  src={leader.image || settings.logo} 
                  alt={lang === 'bn' ? leader.nameBn : leader.nameEn} 
                  className="w-full h-full rounded-full object-cover transition-all duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = settings.logo;
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 dark:bg-emerald-500 text-white p-2.5 rounded-2xl shadow-xl ring-4 ring-white dark:ring-slate-900 transform group-hover:rotate-12 transition-transform">
                <ShieldCheck size={18} />
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight bengali">
                {lang === 'bn' ? leader.nameBn : leader.nameEn}
              </h3>
              <div className="inline-block px-4 py-1.5 rounded-xl bg-white dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest border border-emerald-100 dark:border-emerald-800 bengali">
                {lang === 'bn' ? leader.designationBn : leader.designationEn}
              </div>
            </div>
            
            <div className="text-[13px] text-slate-600 dark:text-slate-300 italic bg-white/50 dark:bg-slate-950/50 p-6 rounded-[2rem] w-full border border-emerald-50 dark:border-slate-800 leading-relaxed font-bold flex-1 flex items-center justify-center bengali">
              <div className="flex flex-col items-center">
                <MessageCircle size={16} className="text-emerald-500/40 mb-2" />
                {lang === 'bn' ? (leader.messageBn || 'সমাজ সেবায় আমরা প্রতিশ্রুতিবদ্ধ।') : (leader.messageEn || 'Committed to social service.')}
              </div>
            </div>

            {leader.phone && (
              <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-slate-800 w-full flex justify-center">
                <a href={`tel:${leader.phone}`} className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-mono font-black text-sm tracking-widest">
                  <PhoneCall size={16} className="text-emerald-600" />
                  {leader.phone}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
