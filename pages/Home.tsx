
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { GraduationCap, Users, HeartHandshake, HandHelping, Trophy, Heart, ArrowRight, Calendar, User, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURE_ICONS = [<GraduationCap />, <Users />, <HeartHandshake />, <HandHelping />, <Trophy />];

export const Home: React.FC = () => {
  const { lang, settings, leadership, events } = useApp();
  const t = TRANSLATIONS[lang];

  const features = (lang === 'bn' ? settings.sloganBn : settings.sloganEn).split(' · ');
  const topLeaders = leadership.sort((a, b) => (a.order || 99) - (b.order || 99)).slice(0, 4);
  const recentEvents = events.slice(0, 2);

  return (
    <div className="space-y-16 sm:space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 bengali">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[4rem] bg-emerald-950 dark:bg-slate-900 text-white p-6 xs:p-10 sm:p-14 md:p-24 flex flex-col items-center text-center gap-6 sm:gap-10 shadow-2xl border border-emerald-800 dark:border-slate-800 transition-all duration-500 min-h-[400px] sm:min-h-[500px] hero-section">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabic-bazazz.png')]"></div>
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 md:w-[32rem] md:h-[32rem] bg-emerald-400/10 dark:bg-emerald-500/10 blur-[60px] sm:blur-[100px] -mr-16 -mt-16 sm:-mr-32 sm:-mt-32 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 md:w-[32rem] md:h-[32rem] bg-amber-400/5 dark:bg-amber-500/5 blur-[60px] sm:blur-[100px] -ml-16 -mb-16 sm:-ml-32 sm:-mb-32 rounded-full"></div>
        
        <div className="relative z-10 space-y-6 sm:space-y-8 w-full max-w-5xl mx-auto">
          <div className="mb-2 transform hover:scale-105 transition-transform duration-700">
            <div className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl text-emerald-300 drop-shadow-[0_0_15px_rgba(110,231,183,0.4)] font-serif italic select-none">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black leading-tight text-white bengali">
              {lang === 'bn' ? settings.nameBn : settings.nameEn}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-8 text-emerald-200 dark:text-emerald-400 font-bold text-[10px] sm:text-base md:text-2xl bengali">
              {features.map((f, i) => (
                <span key={i} className="flex items-center gap-2 sm:gap-3 group">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-400 shadow-lg"></div>
                  {f}
                </span>
              ))}
            </div>

            <p className="max-w-3xl mx-auto text-emerald-50 dark:text-slate-300 text-sm sm:text-lg md:text-2xl font-medium opacity-90 leading-relaxed bengali">
              {lang === 'bn' 
                ? "১৯৮৮ সাল থেকে সমাজের সর্বস্তরে শিক্ষা, ঐক্য এবং সেবা নিশ্চিত করতে আমরা নিবেদিতভাবে কাজ করে যাচ্ছি।"
                : "Working since 1988 to ensure education, unity, and service across all levels of society."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full max-w-sm mx-auto sm:max-w-none justify-center relative z-10 pt-2 sm:pt-4">
            <Link to="/leadership" className="bg-white text-emerald-950 px-6 sm:px-10 py-3.5 sm:py-5 rounded-2xl font-black text-sm sm:text-lg hover:bg-emerald-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center bengali">
              {t.leadership}
            </Link>
            <Link to="/donation" className="bg-emerald-600 dark:bg-emerald-500 text-white px-6 sm:px-10 py-3.5 sm:py-5 rounded-2xl font-black text-sm sm:text-lg border border-emerald-400/30 hover:bg-emerald-500 transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 bengali">
              <Heart size={20} className="sm:size-[24px]" fill="currentColor" />
              {t.donate}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-emerald-50/80 dark:bg-slate-900 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-emerald-200 dark:border-slate-800 flex flex-col items-center text-center gap-4 sm:gap-6 hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-default shadow-lg">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-all duration-500 ring-1 ring-emerald-100 dark:ring-emerald-800">
              {React.cloneElement(FEATURE_ICONS[i] as React.ReactElement<any>, { size: 24, className: "sm:size-[28px] md:size-[32px]" })}
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-base md:text-xl leading-none bengali">{f}</h3>
          </div>
        ))}
      </section>

      {/* Leadership Preview Section */}
      <section className="space-y-8 sm:space-y-12">
        <div className="flex items-end justify-between px-2 sm:px-4">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-2">
              <Users size={12} className="sm:size-[14px]" /> {lang === 'bn' ? 'আমাদের টিম' : 'Our Team'}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white bengali">{lang === 'bn' ? 'কার্যকরী কমিটি' : 'Executive Committee'}</h2>
          </div>
          <Link to="/leadership" className="hidden xs:flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-[10px] sm:text-sm uppercase hover:gap-4 transition-all bengali">
            {lang === 'bn' ? 'সব দেখুন' : 'View All'} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {topLeaders.map((leader) => (
            <div key={leader.id} className="bg-emerald-50/60 dark:bg-slate-900 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-emerald-100 dark:border-slate-800 flex flex-col items-center text-center group hover:-translate-y-1 transition-all shadow-md">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 sm:border-4 border-emerald-500/10 mb-3 sm:mb-4 bg-white dark:bg-slate-950 p-1 relative group-hover:border-emerald-500 transition-all shadow-sm">
                <img src={leader.image || settings.logo} className="w-full h-full object-cover rounded-full" alt={leader.nameBn} />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base leading-tight bengali">{lang === 'bn' ? leader.nameBn : leader.nameEn}</h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase mt-1 bengali">{lang === 'bn' ? leader.designationBn : leader.designationEn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Islamic CTA Section */}
      <section className="bg-emerald-900 dark:bg-emerald-950 p-8 sm:p-14 md:p-20 rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[4rem] text-center space-y-6 sm:space-y-8 relative overflow-hidden shadow-2xl border border-emerald-800">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen-2.png')]"></div>
        <div className="relative z-10 space-y-4 sm:space-y-6">
           <ShieldCheck size={40} className="mx-auto text-emerald-400 sm:size-[48px]" />
           <h2 className="text-xl sm:text-3xl md:text-4xl text-white font-black leading-tight bengali">
              {lang === 'bn' ? 'মানবসেবায় আপনার ছোট পদক্ষেপ বড় পরিবর্তন আনতে পারে' : 'Small steps in human service can bring big changes'}
           </h2>
           <p className="text-emerald-100/70 font-bold max-w-2xl mx-auto text-xs sm:text-base leading-relaxed bengali">
              {lang === 'bn' ? 'সংস্থার সকল কার্যক্রমে অংশগ্রহণ করতে বা তথ্য জানতে আমাদের সাথে যোগাযোগ করুন।' : 'Contact us to participate in activities or to know more about our organization.'}
           </p>
           <div className="pt-4 sm:pt-6">
             <Link to="/donation" className="inline-flex items-center gap-2 sm:gap-3 bg-amber-500 text-emerald-950 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-sm sm:text-lg hover:bg-amber-400 transition-all shadow-xl hover:-translate-y-1 bengali">
                <Heart size={18} className="sm:size-[20px]" fill="currentColor" /> {t.donate}
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
};
