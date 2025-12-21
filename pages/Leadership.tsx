
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { ShieldCheck, Mail, PhoneCall, MessageCircle } from 'lucide-react';

export const Leadership: React.FC = () => {
  const { lang, leadership, settings } = useApp();
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">{t.leadership}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'bn' 
            ? 'আমাদের পরিচালনা পর্ষদ এবং নিবেদিতপ্রাণ স্বেচ্ছাসেবক যারা সমাজ গঠনে অগ্রণী ভূমিকা পালন করছেন।' 
            : 'Our Board of Directors and dedicated volunteers leading the way in social development.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {leadership.map((leader) => (
          <div key={leader.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl group hover:-translate-y-2 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 group-hover:border-emerald-500 transition-colors bg-white">
                  <img src={leader.image} alt={lang === 'bn' ? leader.nameBn : leader.nameEn} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{lang === 'bn' ? leader.nameBn : leader.nameEn}</h3>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest">{lang === 'bn' ? leader.designationBn : leader.designationEn}</p>
              </div>
              
              <div className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl w-full border border-slate-100 dark:border-slate-800">
                <MessageCircle size={14} className="inline mr-2 text-emerald-500" />
                {lang === 'bn' ? leader.messageBn : leader.messageEn}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full justify-center">
                <a href={`tel:${leader.phone}`} className="p-3 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-2">
                  <PhoneCall size={18} />
                  <span className="text-[10px] font-black">{leader.phone}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
