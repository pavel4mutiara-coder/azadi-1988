
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { GraduationCap, Users, HeartHandshake, HandHelping, Trophy, Heart, ArrowRight, Calendar, User, MapPin, Shield, BellRing, Newspaper, Clock, Megaphone, Info, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { NoticeMarquee } from '../components/NoticeMarquee';
import { MemberImage } from '../components/MemberImage';
import { parseLocalDate } from '../utils/parseLocalDate';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { logImageLoadFailure } from '../utils/imageMonitor';

const FEATURE_ICONS = [<GraduationCap />, <Users />, <HeartHandshake />, <HandHelping />, <Trophy />];

export default function Home() {
  const { lang, settings, leadership, events, notices, news } = useApp();
  const t = TRANSLATIONS[lang];

  const slogan = (lang === 'bn' ? settings?.sloganBn : settings?.sloganEn) || (lang === 'bn' ? 'শিক্ষা · ঐক্য · সেবা · শান্তি · ক্রীড়া' : 'Education · Unity · Service · Peace · Sports');
  const features = slogan.split(' · ').filter(Boolean);
  const topLeaders = Array.isArray(leadership) ? [...leadership].sort((a, b) => (a.order || 99) - (b.order || 99)).slice(0, 4) : [];
  const recentEvents = Array.isArray(events) ? [...events].slice(0, 2) : [];
  const recentNews = Array.isArray(news) ? [...news].sort((a, b) => parseLocalDate(b?.date || 0).getTime() - parseLocalDate(a?.date || 0).getTime()).slice(0, 3) : [];
  const allNotices = Array.isArray(notices) ? notices : [];

  return (
    <div id="home-page-root" className="space-y-20 sm:space-y-32 pb-24 bengali">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-4xl bg-emerald-950 dark:bg-slate-900 text-white p-8 xs:p-12 sm:p-20 md:p-32 flex flex-col items-center text-center gap-10 shadow-heavy border border-emerald-800 dark:border-slate-800 transition-all duration-700 min-h-[500px] sm:min-h-[600px] hero-section group">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabic-bazazz.png')] group-hover:scale-110 transition-transform duration-[20s] linear"></div>
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 md:w-[40rem] md:h-[40rem] bg-emerald-400/20 dark:bg-emerald-500/10 blur-[80px] sm:blur-[120px] -mr-16 -mt-16 sm:-mr-48 sm:-mt-48 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 md:w-[40rem] md:h-[40rem] bg-amber-400/10 dark:bg-amber-500/5 blur-[80px] sm:blur-[120px] -ml-16 -mb-16 sm:-ml-48 sm:-mb-48 rounded-full"></div>
        
        <div className="relative z-10 space-y-10 sm:space-y-12 w-full max-w-6xl mx-auto">
          <div className="mb-4 transform hover:scale-105 transition-transform duration-700">
            <div className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl text-emerald-300 shadow-emerald-400/30 drop-shadow-xl font-serif italic select-none tracking-widest opacity-80">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
          </div>
          
          <div className="space-y-6 sm:space-y-10">
            <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white bengali drop-shadow-2xl">
              {lang === 'bn' ? settings?.nameBn : settings?.nameEn}
            </h1>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-10 text-emerald-200 dark:text-emerald-400 font-black text-xs sm:text-lg md:text-3xl bengali tracking-tight uppercase">
              {features.map((f, i) => (
                <span key={i} className="flex items-center gap-3 group/feat">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-400 shadow-amber-400/50 shadow-md group-hover/feat:scale-150 transition-transform"></div>
                  {f}
                </span>
              ))}
            </div>

            <p className="max-w-4xl mx-auto text-emerald-50/90 dark:text-slate-300 text-sm sm:text-xl md:text-3xl font-medium leading-relaxed bengali opacity-90 drop-shadow-sm">
              {lang === 'bn' 
                ? "১৯৮৮ সাল থেকে সমাজের সর্বস্তরে শিক্ষা, ঐক্য এবং সেবা নিশ্চিত করতে আমরা নিবেদিতভাবে কাজ করে যাচ্ছি।"
                : "Since 1988, we have been dedicatedly working to ensure education, unity, and service across all segments of society."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full max-w-sm mx-auto sm:max-w-none justify-center relative z-10 pt-6 sm:pt-10">
            <Link to="/leadership" className="bg-white dark:bg-slate-800 text-emerald-950 dark:text-emerald-400 px-8 sm:px-14 py-4 sm:py-6 rounded-3xl font-black text-sm sm:text-xl hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-heavy hover:-translate-y-2 active:scale-95 flex items-center justify-center bengali group overflow-hidden relative">
               <span className="relative z-10">{t.leadership}</span>
               <div className="absolute inset-0 bg-emerald-100/50 dark:bg-emerald-900/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </Link>
            <Link to="/donation" className="bg-emerald-600 dark:bg-emerald-500 text-white px-8 sm:px-14 py-4 sm:py-6 rounded-3xl font-black text-sm sm:text-xl border border-emerald-400/30 hover:bg-emerald-500 transition-all shadow-heavy hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4 bengali group">
              <Heart size={24} className="group-hover:scale-125 transition-transform duration-300" fill="currentColor" />
              {t.donate}
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Professional Notice Board Section */}
      <section className="container mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] border border-emerald-100 dark:border-slate-800 shadow-soft overflow-hidden flex flex-col sm:flex-row items-stretch group transition-all duration-500">
          <div className="bg-emerald-600 dark:bg-emerald-700 text-white px-6 py-3 sm:px-8 sm:py-6 flex items-center justify-center gap-3 shrink-0 relative overflow-hidden group-hover:bg-emerald-700 transition-colors">
            <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-700 skew-x-12"></div>
            <BellRing size={18} className="animate-pulse relative z-10" />
            <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px] bengali whitespace-nowrap relative z-10">{t.notices}</span>
          </div>
          
          <div className="flex-1 min-w-0 bg-emerald-50/10 dark:bg-slate-950/20 flex items-center py-2 sm:py-0">
            <NoticeMarquee notices={allNotices} lang={lang} />
          </div>

          <Link 
            to="/notices" 
            className="px-6 py-3 sm:px-8 sm:py-6 bg-slate-900 dark:bg-slate-800 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-[0.1em] hover:bg-black dark:hover:bg-slate-700 transition-all bengali shrink-0 flex items-center justify-center gap-2"
          >
            {lang === 'bn' ? 'সব নোটিশ' : 'All Notices'}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>


      {/* Feature Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-4xl border border-emerald-50 dark:border-slate-800 flex flex-col items-center text-center gap-6 hover:shadow-heavy transition-all hover:-translate-y-3 group cursor-default shadow-soft">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ring-4 ring-emerald-500/5">
              {FEATURE_ICONS[i] ? React.cloneElement(FEATURE_ICONS[i] as React.ReactElement<any>, { size: 32, className: "sm:size-[36px] md:size-[40px]" }) : <Sparkles size={32} />}
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-lg md:text-2xl leading-tight bengali tracking-tight group-hover:text-emerald-600 transition-colors uppercase">{f}</h3>
          </div>
        ))}
      </section>

      {/* News & Updates Section */}
      <section className="space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between px-4 gap-4">
          <div className="space-y-4">
            <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-2 tracking-[0.2em]">
              <Newspaper size={16} /> {lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest Updates'}
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white bengali leading-tight tracking-tighter">{t.news}</h2>
          </div>
          <Link to="/news" className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black text-[12px] uppercase hover:gap-6 transition-all bengali bg-emerald-50 dark:bg-emerald-900/30 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            {lang === 'bn' ? 'সব সংবাদ' : 'View All'} <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentNews.length > 0 ? (
            recentNews.map((n) => {
              const title = lang === 'bn' ? (n.titleBn || n.title || n.titleEn) : (n.titleEn || n.title || n.titleBn);
              const image = n.image || n.imageUrl || '';
              const dateVal = n.date || n.createdAt || '';
              return (
                <div key={n.id} className="bg-white dark:bg-slate-900 rounded-4xl border border-emerald-50 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-heavy hover:-translate-y-2 transition-all group flex flex-col">
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                     {image ? (
                       <img
                         src={getOptimizedImageUrl(image, 300)}
                         referrerPolicy="no-referrer"
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                         alt="News"
                         onError={() => {
                           logImageLoadFailure(getOptimizedImageUrl(image, 300), `Home News Image (${title})`);
                         }}
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-emerald-100 bg-emerald-50/50">
                         <Newspaper size={48} />
                       </div>
                     )}
                     <div className="absolute top-6 left-6 bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">{lang === 'bn' ? 'আপডেট' : 'Update'}</div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar size={14} className="text-emerald-500" /> {dateVal ? parseLocalDate(dateVal).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                      <Link to={`/news?id=${n.id}`}>
                        <h3 className="font-black text-slate-900 dark:text-white text-xl sm:text-2xl leading-[1.3] line-clamp-2 bengali group-hover:text-emerald-600 transition-colors">{title}</h3>
                      </Link>
                    </div>
                    <Link to={`/news?id=${n.id}`} className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black text-[12px] uppercase tracking-widest hover:gap-5 transition-all w-fit">
                      {lang === 'bn' ? 'আরও পড়ুন' : 'Read More'} <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
             <div className="col-span-full py-24 text-center bg-emerald-50/20 dark:bg-slate-950/50 rounded-[4rem] border border-dashed border-emerald-200 space-y-6 opacity-60">
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-soft">
                  <Megaphone size={40} className="text-emerald-200 dark:text-emerald-800" />
                </div>
                <p className="font-black text-slate-400 text-lg bengali">{lang === 'bn' ? 'বর্তমানে কোনো সংবাদ নেই।' : 'No news updates available.'}</p>
             </div>
          )}
        </div>
      </section>

      {/* Leadership Preview Section */}
      <section className="space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between px-4 gap-4">
          <div className="space-y-4">
            <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-2 tracking-[0.2em]">
              <Users size={16} /> {lang === 'bn' ? 'আমাদের টিম' : 'Our Team'}
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white bengali leading-tight tracking-tighter">{lang === 'bn' ? 'কার্যকরী কমিটি' : 'Executive Committee'}</h2>
          </div>
          <Link to="/leadership" className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black text-[12px] uppercase hover:gap-6 transition-all bengali bg-emerald-50 dark:bg-emerald-900/30 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            {lang === 'bn' ? 'সব দেখুন' : 'View All'} <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {topLeaders.map((leader) => (
            <div key={leader.id} className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-emerald-50 dark:border-slate-800 flex flex-col items-center text-center group hover:-translate-y-3 transition-all shadow-soft hover:shadow-heavy relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600/10 group-hover:bg-emerald-600 transition-colors"></div>
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-emerald-500/10 mb-6 bg-white dark:bg-slate-950 p-1.5 relative group-hover:border-emerald-500 transition-all shadow-inner scale-100 group-hover:scale-105 duration-500">
                <MemberImage src={leader.image} alt={lang === 'bn' ? leader.nameBn : leader.nameEn} fallbackSrc={settings.logo} />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl leading-tight bengali group-hover:text-emerald-600 transition-colors">{lang === 'bn' ? leader.nameBn : leader.nameEn}</h4>
              <p className="text-[11px] font-black text-emerald-600 uppercase mt-2 tracking-widest bengali opacity-80">{lang === 'bn' ? leader.designationBn : leader.designationEn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Islamic CTA Section */}
      <section className="bg-emerald-900 dark:bg-slate-900 p-10 sm:p-20 md:p-32 rounded-4xl text-center space-y-10 relative overflow-hidden shadow-heavy border border-emerald-800 dark:border-slate-800 group">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen-2.png')] group-hover:scale-110 transition-transform duration-[10s]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-400/10 to-transparent"></div>
        
        <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
           <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-emerald-500/20 shadow-xl border border-emerald-400/30">
              <Shield size={48} className="text-emerald-400 animate-pulse" />
           </div>
           <h2 className="text-3xl sm:text-5xl md:text-6xl text-white font-black leading-[1.1] bengali tracking-tighter">
              {lang === 'bn' ? 'মানবসেবায় আপনার ছোট পদক্ষেপ বড় পরিবর্তন আনতে পারে' : 'Small steps in human service can bring big changes'}
           </h2>
           <p className="text-emerald-100/70 font-medium max-w-2xl mx-auto text-base sm:text-xl leading-relaxed bengali opacity-80">
              {lang === 'bn' ? 'সংস্থার সকল কার্যক্রমে অংশগ্রহণ করতে বা তথ্য জানতে আমাদের সাথে যোগাযোগ করুন।' : 'Contact us to participate in activities or to know more about our organization.'}
           </p>
           <div className="pt-8 sm:pt-10 flex flex-wrap justify-center gap-6">
             <Link to="/donation" className="inline-flex items-center gap-4 bg-amber-500 text-emerald-950 px-10 py-6 rounded-3xl font-black text-lg hover:bg-amber-400 transition-all shadow-heavy shadow-amber-500/20 hover:-translate-y-2 active:scale-95 bengali group">
                <Heart size={24} className="group-hover:scale-125 transition-transform" fill="currentColor" /> {t.donate}
             </Link>
             <Link to="/about" className="inline-flex items-center gap-4 bg-white/10 dark:bg-emerald-500/10 text-white border border-white/20 dark:border-emerald-500/20 backdrop-blur-md px-10 py-6 rounded-3xl font-black text-lg hover:bg-white/20 transition-all hover:-translate-y-2 active:scale-95 bengali">
                {lang === 'bn' ? 'আরও জানুন' : 'Learn More'} <ArrowRight size={24} />
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
};
