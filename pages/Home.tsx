
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
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 bengali">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] md:rounded-[4rem] bg-emerald-950 dark:bg-slate-900 text-white p-10 sm:p-14 md:p-24 flex flex-col items-center text-center gap-10 shadow-2xl border border-emerald-800 dark:border-slate-800 transition-all duration-500">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabic-bazazz.png')]"></div>
        <div className="absolute top-0 right-0 w-72 h-72 md:w-[32rem] md:h-[32rem] bg-emerald-400/20 dark:bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 md:w-[32rem] md:h-[32rem] bg-amber-400/10 dark:bg-amber-500/5 blur-[100px] -ml-32 -mb-32 rounded-full"></div>
        
        <div className="relative z-10 space-y-8 w-full">
          <div className="mb-2 transform hover:scale-105 transition-transform duration-700">
            <div className="text-3xl sm:text-4xl md:text-7xl text-emerald-300 drop-shadow-[0_0_15px_rgba(110,231,183,0.4)] font-serif italic select-none">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
          </div>
          
          <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight leading-tight text-white bengali" style={{ letterSpacing: 'normal' }}>
              {lang === 'bn' ? settings.nameBn : settings.nameEn}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-emerald-200 dark:text-emerald-400 font-bold text-xs sm:text-lg md:text-2xl uppercase tracking-widest bengali">
              {features.map((f, i) => (
                <span key={i} className="flex items-center gap-3 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-lg"></div>
                  {f}
                </span>
              ))}
            </div>

            <p className="max-w-3xl mx-auto text-emerald-50 dark:text-slate-300 text-base sm:text-xl md:text-2xl font-medium opacity-90 leading-relaxed bengali" style={{ fontFamily: '"Noto Sans Bengali", sans-serif' }}>
              {lang === 'bn' 
                ? "১৯৮৮ সাল থেকে সমাজের সর্বস্তরে শিক্ষা, ঐক্য এবং সেবা নিশ্চিত করতে আমরা নিবেদিতভাবে কাজ করে যাচ্ছি।"
                : "Working since 1988 to ensure education, unity, and service across all levels of society."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 w-full max-w-sm sm:max-w-none justify-center relative z-10 pt-4">
            <Link to="/leadership" className="bg-white text-emerald-950 px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center">
              {t.leadership}
            </Link>
            <Link to="/donation" className="bg-emerald-600 dark:bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-lg border border-emerald-400/30 hover:bg-emerald-500 transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3">
              <Heart size={24} fill="currentColor" />
              {t.donate}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-6 hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-default shadow-lg">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-all duration-500 ring-1 ring-emerald-100 dark:ring-emerald-800">
              {React.cloneElement(FEATURE_ICONS[i] as React.ReactElement<any>, { size: 28, className: "md:w-10 md:h-10" })}
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-base md:text-xl uppercase tracking-widest leading-none bengali">{f}</h3>
          </div>
        ))}
      </section>

      {/* Leadership Preview Section */}
      <section className="space-y-12">
        <div className="flex items-end justify-between px-4">
          <div className="space-y-2">
            <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Users size={14} /> {lang === 'bn' ? 'আমাদের টিম' : 'Our Team'}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">{lang === 'bn' ? 'কার্যকরী কমিটি' : 'Executive Committee'}</h2>
          </div>
          <Link to="/leadership" className="hidden sm:flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all">
            {lang === 'bn' ? 'সব দেখুন' : 'View All'} <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topLeaders.map((leader) => (
            <div key={leader.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center group hover:-translate-y-1 transition-all shadow-md">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/10 mb-4 bg-slate-50 relative group-hover:border-emerald-500 transition-all">
                <img src={leader.image || settings.logo} className="w-full h-full object-cover" alt={leader.nameBn} />
                <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight bengali">{lang === 'bn' ? leader.nameBn : leader.nameEn}</h4>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 bengali">{lang === 'bn' ? leader.designationBn : leader.designationEn}</p>
            </div>
          ))}
        </div>
        
        <Link to="/leadership" className="flex sm:hidden items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest">
           {lang === 'bn' ? 'সকল নেতৃবৃন্দ' : 'View Committee'} <ArrowRight size={18} />
        </Link>
      </section>

      {/* Events Preview Section */}
      <section className="space-y-12">
        <div className="flex items-end justify-between px-4">
          <div className="space-y-2">
            <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Calendar size={14} /> {lang === 'bn' ? 'কার্যক্রম' : 'Activities'}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">{lang === 'bn' ? 'আসন্ন ইভেন্টসমূহ' : 'Upcoming Events'}</h2>
          </div>
          <Link to="/events" className="hidden sm:flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all">
            {lang === 'bn' ? 'সব দেখুন' : 'View All'} <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {recentEvents.length > 0 ? (
            recentEvents.map((event) => (
              <div key={event.id} className="group bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col sm:flex-row border-b-8 border-b-amber-500/20">
                <div className="sm:w-2/5 relative h-48 sm:h-auto overflow-hidden bg-slate-50">
                  <img src={event.image} alt={event.titleBn} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-8 sm:w-3/5 space-y-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    <Calendar size={14} />
                    {new Date(event.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors bengali leading-tight">
                    {lang === 'bn' ? event.titleBn : event.titleEn}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bengali">
                    <MapPin size={14} /> {lang === 'bn' ? event.locationBn : event.locationEn}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
               <Calendar size={48} className="mx-auto text-slate-300" />
               <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">{lang === 'bn' ? 'কোন ইভেন্ট পাওয়া যায়নি' : 'No upcoming events'}</p>
            </div>
          )}
        </div>
      </section>

      {/* Islamic CTA Section */}
      <section className="bg-emerald-900 dark:bg-emerald-950 p-10 md:p-20 rounded-[3rem] md:rounded-[4rem] text-center space-y-8 relative overflow-hidden shadow-2xl border border-emerald-800">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen-2.png')]"></div>
        <div className="relative z-10 space-y-6">
           <ShieldCheck size={48} className="mx-auto text-emerald-400" />
           <h2 className="text-2xl md:text-4xl text-white font-black leading-tight bengali" style={{ fontFamily: '"Noto Sans Bengali", sans-serif' }}>
              {lang === 'bn' ? 'মানবসেবায় আপনার ছোট পদক্ষেপ বড় পরিবর্তন আনতে পারে' : 'Small steps in human service can bring big changes'}
           </h2>
           <p className="text-emerald-100/70 font-bold max-w-2xl mx-auto text-sm md:text-base leading-relaxed bengali">
              {lang === 'bn' ? 'সংস্থার সকল কার্যক্রমে অংশগ্রহণ করতে বা তথ্য জানতে আমাদের সাথে যোগাযোগ করুন।' : 'Contact us to participate in activities or to know more about our organization.'}
           </p>
           <div className="pt-6">
             <Link to="/donation" className="inline-flex items-center gap-3 bg-amber-500 text-emerald-950 px-10 py-5 rounded-2xl font-black text-lg hover:bg-amber-400 transition-all shadow-xl hover:-translate-y-1">
                <Heart size={20} fill="currentColor" /> {t.donate}
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
};
