
import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { Target, Users, Heart, Globe, PieChart } from 'lucide-react';

export const Impact: React.FC = () => {
  const { lang, donations } = useApp();
  const t = TRANSLATIONS[lang];

  const totalDonations = donations.filter(d => d.status === 'APPROVED').reduce((s, d) => s + d.amount, 0);

  const impactStats = [
    { label: lang === 'bn' ? 'উপকৃত পরিবার' : 'Beneficiary Families', val: '500+', icon: <Users />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' },
    { label: lang === 'bn' ? 'আয়োজিত ইভেন্ট' : 'Events Organized', val: '85+', icon: <Globe />, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30' },
    { label: lang === 'bn' ? 'স্বেচ্ছাসেবক' : 'Volunteers', val: '120', icon: <Target />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30' },
    { label: lang === 'bn' ? 'মোট অনুদান সংগ্রহ' : 'Total Donations Raised', val: '৳ ' + totalDonations.toLocaleString(), icon: <Heart />, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/30' },
  ];

  return (
    <div className="space-y-20 sm:space-y-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24 bengali">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 dark:border-emerald-800">
           <Heart size={14} className="animate-pulse" /> {lang === 'bn' ? 'আমাদের প্রভাব' : 'Our Impact'}
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-slate-50 tracking-tighter leading-tight">{t.impact}</h1>
        <p className="text-lg sm:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed opacity-80">
          {lang === 'bn' 
            ? 'আমাদের কাজের মাধ্যমে সমাজে যে পরিবর্তন আসছে তার এক ঝলক।' 
            : 'A transparent look at the meaningful changes we are bringing to our community through collective effort.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {impactStats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-4xl border border-emerald-50 dark:border-slate-800 shadow-soft hover:shadow-heavy flex flex-col items-center text-center gap-6 group hover:-translate-y-3 transition-all">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner ring-8 ring-transparent group-hover:ring-emerald-500/5`}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 36 })}
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter drop-shadow-sm">{stat.val}</div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-900 dark:bg-slate-900 text-white rounded-4xl p-10 sm:p-20 md:p-24 shadow-heavy relative overflow-hidden border border-emerald-800 dark:border-slate-800 group">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabic-bazazz.png')] group-hover:scale-110 transition-transform duration-[20s]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tighter">{lang === 'bn' ? 'আমাদের অর্থায়নের উৎস' : 'Our Funding Sources'}</h2>
              <p className="text-emerald-100/70 dark:text-slate-300/80 leading-relaxed font-medium text-lg sm:text-xl">
                {lang === 'bn' 
                  ? 'আজাদী সমাজ কল্যাণ সংঘ সম্পূর্ণভাবে ব্যক্তিগত অনুদান এবং সদস্যদের মাসিক চাঁদার মাধ্যমে পরিচালিত হয়।' 
                  : 'Azadi Social Welfare Organization is entirely run by personal donations, community support, and monthly contributions from our dedicated members.'}
              </p>
            </div>
            
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-300 dark:text-slate-400">
                  <span>Public Donations</span>
                  <span className="text-white">75%</span>
                </div>
                <div className="h-4 bg-emerald-950 dark:bg-slate-950 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-1000" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-300 dark:text-slate-400">
                  <span>Member Contributions</span>
                  <span className="text-white">25%</span>
                </div>
                <div className="h-4 bg-emerald-950 dark:bg-slate-950 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all duration-1000" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center xl:justify-end">
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-emerald-950/50 dark:bg-slate-950/50 rounded-full flex items-center justify-center border-[12px] border-white/5 relative shadow-heavy backdrop-blur-sm group/chart overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent"></div>
               <PieChart size={180} className="text-white opacity-10 group-hover/chart:scale-110 transition-transform duration-1000" />
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/5 hover:bg-slate-900/40 transition-colors">
                  <div className="text-[11px] font-black opacity-60 uppercase tracking-[0.2em] text-white/80 mb-2">Total Transparency</div>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">৳ {totalDonations.toLocaleString()}</div>
                  <div className="mt-4 px-4 py-1.5 bg-white/10 dark:bg-emerald-500/10 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 dark:border-emerald-500/20 backdrop-blur-md">Total Income</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
