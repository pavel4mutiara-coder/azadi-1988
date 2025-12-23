
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Target, Users, Heart, Globe, PieChart } from 'lucide-react';

export const Impact: React.FC = () => {
  const { lang, donations, financials } = useApp();
  const t = TRANSLATIONS[lang];

  const totalDonations = donations.filter(d => d.status === 'APPROVED').reduce((s, d) => s + d.amount, 0);
  const totalExpense = financials.filter(f => f.type === 'EXPENSE').reduce((s, f) => s + f.amount, 0);

  const impactStats = [
    { label: lang === 'bn' ? 'উপকৃত পরিবার' : 'Beneficiary Families', val: '500+', icon: <Users />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' },
    { label: lang === 'bn' ? 'সফল প্রজেক্ট' : 'Successful Projects', val: '24', icon: <Target />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' },
    { label: lang === 'bn' ? 'স্বেচ্ছাসেবক' : 'Volunteers', val: '120', icon: <Globe />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30' },
    { label: lang === 'bn' ? 'মোট সাহায্য' : 'Total Aid Distributed', val: '৳ ' + totalExpense.toLocaleString(), icon: <Heart />, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/30' },
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-50">{t.impact}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'bn' 
            ? 'আমাদের কাজের মাধ্যমে সমাজে যে পরিবর্তন আসছে তার এক ঝলক।' 
            : 'A glimpse of the changes we are bringing to society through our work.'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {impactStats.map((stat, i) => (
          <div key={i} className="bg-emerald-50/80 dark:bg-slate-900 p-8 rounded-[2rem] border border-emerald-100 dark:border-slate-800 shadow-xl flex flex-col items-center text-center gap-4 group hover:-translate-y-1 transition-transform">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 32 })}
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{stat.val}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-900 dark:bg-slate-900 text-white rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden border border-emerald-800 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white dark:text-emerald-400">{lang === 'bn' ? 'আমাদের অর্থায়নের উৎস' : 'Our Funding Sources'}</h2>
            <p className="text-emerald-100 dark:text-slate-300 opacity-80 leading-relaxed font-medium">
              {lang === 'bn' 
                ? 'আজাদী সমাজ কল্যাণ সংঘ সম্পূর্ণভাবে ব্যক্তিগত অনুদান এবং সদস্যদের মাসিক চাঁদার মাধ্যমে পরিচালিত হয়।' 
                : 'Azadi Social Welfare Organization is entirely run by personal donations and monthly contributions from members.'}
            </p>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-200 dark:text-slate-400">
                  <span>Public Donations</span>
                  <span>75%</span>
                </div>
                <div className="h-2.5 bg-emerald-800 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-3/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-200 dark:text-slate-400">
                  <span>Member Contributions</span>
                  <span>25%</span>
                </div>
                <div className="h-2.5 bg-emerald-800 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-white/10 dark:bg-slate-800/50 rounded-full flex items-center justify-center border-8 border-white/5 relative shadow-inner">
              <PieChart size={120} className="text-white opacity-20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                 <div className="text-sm font-bold opacity-60 uppercase tracking-widest text-white">Income</div>
                 <div className="text-3xl font-black text-white">৳ {totalDonations.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
