import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { 
  GraduationCap, Users, HeartHandshake, HandHelping, Trophy, 
  Heart, ArrowRight, Calendar, MapPin, Shield, BellRing, 
  Newspaper, Megaphone, Sparkles, Award, CheckCircle2, 
  ExternalLink, Phone, Mail, MessageCircle, FileText, 
  Flame, Compass, Target, Eye, Layers, Activity, ChevronRight,
  CreditCard, Lock, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { NoticeMarquee } from '../components/NoticeMarquee';
import { MemberImage } from '../components/MemberImage';
import { parseLocalDate } from '../utils/parseLocalDate';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { logImageLoadFailure } from '../utils/imageMonitor';

export default function Home() {
  const { lang, settings, leadership, events, notices, news, testimonials } = useApp();
  const t = TRANSLATIONS[lang];

  const slogan = (lang === 'bn' ? settings?.sloganBn : settings?.sloganEn) || (lang === 'bn' ? 'শিক্ষা · ঐক্য · সেবা · শান্তি · ক্রীড়া' : 'Education · Unity · Service · Peace · Sports');
  const features = slogan.split(' · ').filter(Boolean);

  // Data processing from Firebase AppContext
  const topLeaders = Array.isArray(leadership) 
    ? [...leadership].sort((a, b) => (a.order || 99) - (b.order || 99)).slice(0, 4) 
    : [];

  const recentEvents = Array.isArray(events) 
    ? [...events].slice(0, 3) 
    : [];

  const recentNews = Array.isArray(news) 
    ? [...news].sort((a, b) => parseLocalDate(b?.date || 0).getTime() - parseLocalDate(a?.date || 0).getTime()).slice(0, 3) 
    : [];

  const allNotices = Array.isArray(notices) ? notices : [];

  const approvedTestimonials = Array.isArray(testimonials)
    ? testimonials.filter(item => item.status === 'APPROVED').slice(0, 3)
    : [];

  // Organization Seal/Logo
  const LOGO_URL = settings?.logo || "https://lh3.googleusercontent.com/d/1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh";

  // Gallery preview images gathered from events & news
  const galleryImages = [
    ...recentEvents.map(e => ({ url: e.image, title: lang === 'bn' ? e.titleBn : e.titleEn })),
    ...recentNews.map(n => ({ url: n.image, title: lang === 'bn' ? n.titleBn : n.titleEn })),
    { url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600", title: lang === 'bn' ? "বার্ষিক ক্রীড়া অনুষ্ঠান" : "Annual Sports Meet" },
    { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600", title: lang === 'bn' ? "বিনামূল্যে চিকিৎসা সেবা" : "Free Medical Camp" },
    { url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600", title: lang === 'bn' ? "ত্রাণ বিতরণ কর্মসূচি" : "Emergency Relief Camp" },
    { url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600", title: lang === 'bn' ? "প্রতিষ্ঠাবার্ষিকী অনুষ্ঠান" : "Founding Anniversary" }
  ].filter(item => Boolean(item.url)).slice(0, 6);

  return (
    <div id="home-page-root" className="space-y-16 sm:space-y-24 md:space-y-32 pb-20 bengali">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-[#091329] text-white p-6 xs:p-8 sm:p-14 md:p-20 border border-slate-800 shadow-royal group">
        {/* Decorative Grid Overlay & Light Glows */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-80 h-80 sm:w-[32rem] sm:h-[32rem] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 sm:w-[32rem] sm:h-[32rem] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center space-y-8 sm:space-y-10">
          
          {/* Islamic Bismillah Calligraphy */}
          <div className="transform hover:scale-105 transition-transform duration-500">
            <div className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl text-amber-300 font-serif italic tracking-widest drop-shadow-md select-none opacity-90">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
          </div>

          {/* Badges / Credibility Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-[10px] xs:text-[11px] sm:text-xs font-black uppercase tracking-wider max-w-full">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 sm:px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-sm text-center">
              <Award size={14} className="text-amber-400 shrink-0" />
              <span>{lang === 'bn' ? 'প্রতিষ্ঠিত: ১০ জুন ১৯৮৮ (৩৮ বছরের পথচলা)' : 'Est. 10 June 1988 (38 Years of Service)'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-blue-900/60 text-blue-200 px-3 sm:px-3.5 py-1.5 rounded-full border border-blue-700/50 shadow-sm text-center">
              <MapPin size={14} className="text-blue-400 shrink-0" />
              <span>{lang === 'bn' ? 'মিরবক্সটুলা, সিলেট, বাংলাদেশ' : 'Mirbox Tula, Sylhet, Bangladesh'}</span>
            </span>
          </div>

          {/* Organization Title & Slogan */}
          <div className="space-y-3 sm:space-y-4 max-w-4xl">
            <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] sm:leading-[1.05] tracking-tight text-white drop-shadow-lg bengali">
              {lang === 'bn' ? settings?.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ' : settings?.nameEn || 'Azadi Social Welfare Organization'}
            </h1>

            {/* Slogan Pill Highlights */}
            <div className="flex flex-wrap justify-center gap-2 xs:gap-2.5 sm:gap-4 md:gap-6 pt-1 sm:pt-2">
              {features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 xs:gap-2 text-xs sm:text-base font-black text-slate-200 bg-slate-900/80 px-2.5 xs:px-3.5 py-1.5 rounded-xl border border-slate-700/80">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400 shrink-0"></span>
                  <span>{f}</span>
                </span>
              ))}
            </div>

            <p className="text-slate-300 text-sm sm:text-lg md:text-xl font-medium leading-relaxed max-w-3xl mx-auto pt-3 text-balance bengali">
              {lang === 'bn'
                ? '১৯৮৮ সাল থেকে সিলেটে শিক্ষা বিস্তার, তরুণ উন্নয়ন, ক্রীড়া চর্চা ও সুবিধাবঞ্চিত মানুষের সেবায় নিবেদিত অরাজনৈতিক ও অলাভজনক সামাজিক প্রতিষ্ঠান।'
                : 'Since 1988, dedicated to education, youth development, sports, and humanitarian social welfare in Sylhet, Bangladesh.'
              }
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full max-w-md sm:max-w-none pt-2">
            <Link 
              to="/donation" 
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-8 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Heart size={20} fill="currentColor" className="animate-pulse" />
              <span>{t.donate as string}</span>
            </Link>

            <Link 
              to="/events" 
              className="w-full sm:w-auto bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 border border-blue-500/50 shadow-lg shadow-blue-700/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Sparkles size={18} className="text-amber-300" />
              <span>{lang === 'bn' ? 'কার্যক্রম দেখুন' : 'Explore Activities'}</span>
            </Link>

            <Link 
              to="/about" 
              className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-7 py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 border border-slate-700/80 transition-all"
            >
              <span>{lang === 'bn' ? 'আমাদের ইতিহাস' : 'Our History'}</span>
              <ArrowRight size={16} className="text-amber-400" />
            </Link>
          </div>

        </div>
      </section>

      {/* 2. TRUST / CREDIBILITY STRIP */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center divide-x-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="flex items-center gap-3 p-2 justify-center sm:justify-start md:justify-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
              <Award size={20} />
            </div>
            <div className="text-left">
              <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                {lang === 'bn' ? '৩৮ বছরের ইতিহাস' : '38 Years History'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {lang === 'bn' ? 'প্রতিষ্ঠিত ১০ জুন ১৯৮৮' : 'Founded June 10, 1988'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 justify-center sm:justify-start md:justify-center">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                {lang === 'bn' ? 'স্বচ্ছতা ও সততা' : 'Transparency & Integrity'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {lang === 'bn' ? '১০০% ভেরিফাইড ফান্ডিং' : '100% Verified Funding'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 justify-center sm:justify-start md:justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
              <Trophy size={20} />
            </div>
            <div className="text-left">
              <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                {lang === 'bn' ? 'যুব ও ক্রীড়া কল্যাণ' : 'Youth & Sports Welfare'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {lang === 'bn' ? 'বার্ষিক ক্রীড়া টুর্নামেন্ট' : 'Annual Sports Tournaments'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 justify-center sm:justify-start md:justify-center">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/50">
              <MapPin size={20} />
            </div>
            <div className="text-left">
              <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                {lang === 'bn' ? 'সিলেট সদর কেন্দ্র' : 'Sylhet HQ Center'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {lang === 'bn' ? 'মিরবক্সটুলা, সিলেট' : 'Mirbox Tula, Sylhet'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT AZADI PREVIEW SECTION */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 md:p-12 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Visual Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-950 group">
              <img 
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800" 
                alt="Azadi Social Welfare Activities" 
                className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 text-white">
                <div className="flex items-center gap-3">
                  <img src={LOGO_URL} alt="Seal" className="w-10 h-10 object-contain rounded-full bg-white p-0.5" />
                  <div>
                    <div className="font-black text-xs text-amber-400 uppercase">
                      {lang === 'bn' ? settings?.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ' : settings?.nameEn || 'Azadi Social Welfare Organization'}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">
                      {lang === 'bn' ? 'প্রতিষ্ঠা: ১০ জুন ১৯৮৮ | মিরবক্সটুলা, সিলেট' : 'Est: 10 June 1988 | Mirbox Tula, Sylhet'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text & History Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-700 dark:text-amber-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
                <Compass size={14} />
                <span>{lang === 'bn' ? 'সংগঠনের পরিচয়' : 'Organization Overview'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight bengali">
                {lang === 'bn' ? '১৯৮৮ সাল থেকে সিলেটের সমাজসেবা ও যুব উন্নয়নে নিবেদিত' : 'Dedicated to Social Welfare & Youth Development Since 1988'}
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium bengali">
              {lang === 'bn'
                ? 'আজাদী সমাজ কল্যাণ সংঘ সিলেটের মিরবক্সটুলায় প্রতিষ্ঠিত একটি ঐতিহ্যবাহী অলাভজনক সংস্থা। দীর্ঘ ৩৮ বছর ধরে শিক্ষা, ক্রীড়া, দারিদ্র্য বিমোচন ও সামাজিক সেবায় আমাদের তরুণ সমাজ নিবেদিতভাবে কাজ করে যাচ্ছে।'
                : 'Azadi Social Welfare Organization is a rooted non-profit organization located in Mirbox Tula, Sylhet. For 38 years, our youth have been actively serving education, sports, and social welfare.'
              }
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bengali">
                  {lang === 'bn' ? 'শিক্ষা বৃত্তি ও বিনামূল্যে পাঠ্যপুস্তক বিতরণ' : 'Education Stipends & Free Textbook Distribution'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bengali">
                  {lang === 'bn' ? 'বার্ষিক ক্রীড়া টুর্নামেন্ট ও যুব সংবর্ধনা' : 'Annual Youth Sports Tournaments & Awards'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bengali">
                  {lang === 'bn' ? 'বন্যা ও প্রাকৃতিক দুর্যোগে জরুরি ত্রাণ সহায়তা' : 'Emergency Disaster & Flood Relief Assistance'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bengali">
                  {lang === 'bn' ? 'বিনামূল্যে চিকিৎসা ক্যাম্প ও রক্তদান কর্মসূচি' : 'Free Healthcare Camps & Blood Donation Drives'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link 
                to="/about"
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
              >
                <span>{lang === 'bn' ? 'আমাদের বিস্তারিত ইতিহাস জানুন' : 'Read Full History'}</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. MISSION / VISION / CORE VALUES */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-700 dark:text-amber-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
            <Target size={14} />
            <span>{lang === 'bn' ? 'লক্ষ্য ও উদ্দেশ্য' : 'Mission & Vision'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white bengali">
            {lang === 'bn' ? 'আমাদের মূলনীতি ও আদর্শ' : 'Our Principles & Pillars'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Mission */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'আমাদের লক্ষ্য (Mission)' : 'Our Mission'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bengali">
              {lang === 'bn'
                ? 'শিক্ষা, খেলাধুলা ও সামাজিক কল্যাণের মাধ্যমে সমাজ থেকে দারিদ্র্য ও অজ্ঞতা দূর করে এক সুসংগঠিত, আলোকিত ও স্বাবলম্বী যুবসমাজ গড়ে তোলা।'
                : 'Empower underprivileged communities through education, sports, and humanitarian social welfare.'
              }
            </p>
          </div>

          {/* Card 2: Vision */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-amber-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
              <Eye size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'আমাদের উদ্দেশ্য (Vision)' : 'Our Vision'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bengali">
              {lang === 'bn'
                ? 'একটি বৈষম্যহীন, শান্তিময়, মাদকমুক্ত ও ভ্রাতৃত্বপূর্ণ সমাজ বিনির্মাণ করা যেখানে প্রতিটি নাগরিক মর্যাদা ও শিক্ষার সুযোগ পাবে।'
                : 'A progressive, educated, peaceful, and self-reliant society built on brotherhood and social justice.'
              }
            </p>
          </div>

          {/* Card 3: Core Values */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <Layers size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'আমাদের ৫ মূল স্তম্ভ' : 'Our 5 Core Pillars'}
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {features.map((f, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. IMPACT STATISTICS SECTION */}
      <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
              {lang === 'bn' ? 'আমাদের প্রভাব ও অর্জন' : 'Our Verified Impact'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black bengali text-white">
              {lang === 'bn' ? 'সংখ্যার আলোয় আজাদী সংঘ' : 'Azadi Social Welfare in Numbers'}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80">
              <div className="text-3xl sm:text-5xl font-black text-amber-400 font-mono">{lang === 'bn' ? '১৯৮৮' : '1988'}</div>
              <div className="text-xs font-black uppercase text-slate-300 mt-2 bengali">{lang === 'bn' ? 'প্রতিষ্ঠার বছর' : 'Year Founded'}</div>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80">
              <div className="text-3xl sm:text-5xl font-black text-blue-400 font-mono">{lang === 'bn' ? '৩৮+' : '38+'}</div>
              <div className="text-xs font-black uppercase text-slate-300 mt-2 bengali">{lang === 'bn' ? 'বছরের জনসেবা' : 'Years of Service'}</div>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80">
              <div className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono">{lang === 'bn' ? '৪১+' : '41+'}</div>
              <div className="text-xs font-black uppercase text-slate-300 mt-2 bengali">{lang === 'bn' ? 'কমিটি সদস্য ও সেবক' : 'Active Members'}</div>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80">
              <div className="text-3xl sm:text-5xl font-black text-purple-400 font-mono">100%</div>
              <div className="text-xs font-black uppercase text-slate-300 mt-2 bengali">{lang === 'bn' ? 'অলাভজনক ও স্বেচ্ছাসেবামূলক' : 'Non-profit & Volunteer'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROGRAMS / AREAS OF WORK */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-700 dark:text-amber-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              <Activity size={14} />
              <span>{lang === 'bn' ? 'কর্মক্ষেত্র' : 'Areas of Work'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'আমাদের প্রধান সেবামূলক কার্যক্রম' : 'Our Core Social Programs'}
            </h2>
          </div>

          <Link 
            to="/events" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-amber-400 hover:underline bengali"
          >
            <span>{lang === 'bn' ? 'সব ইভেন্ট ও প্রোগ্রাম দেখুন' : 'View All Events'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Program 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
              <HandHelping size={24} />
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'সমাজ কল্যাণ ও জরুরি ত্রাণ' : 'Social Welfare & Relief'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed bengali">
              {lang === 'bn' ? 'বন্যা ও প্রাকৃতিক দুর্যোগে অসহায় পরিবারের মাঝে শুকনো খাবার, শীতবস্ত্র ও জরুরি নগদ সহায়তা বিতরণ।' : 'Providing dry food, winter clothing, and emergency cash support to disaster-affected families.'}
            </p>
          </div>

          {/* Program 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
              <GraduationCap size={24} />
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'শিক্ষা সহায়তা ও মেধাবৃত্তি' : 'Education & Scholarships'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed bengali">
              {lang === 'bn' ? 'দরিদ্র ও মেধাবী শিক্ষার্থীদের মাঝে বিনামূল্যে পাঠ্যপুস্তক, শিক্ষা সামগ্রী ও নগদ শিক্ষা বৃত্তি প্রদান।' : 'Distributing free textbooks, educational materials, and merit stipends to underprivileged students.'}
            </p>
          </div>

          {/* Program 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <Trophy size={24} />
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'ক্রীড়া ও যুব উন্নয়ন' : 'Sports & Youth Empowerment'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed bengali">
              {lang === 'bn' ? 'যুবসমাজকে মাদকমুক্ত রাখতে স্থানীয় ফুটবল, ক্রিকেট টুর্নামেন্ট ও ক্রীড়া সামগ্রী বিতরণ।' : 'Organizing football/cricket tournaments and sports gear distribution to engage youth constructively.'}
            </p>
          </div>

          {/* Program 4 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-900/50">
              <HeartHandshake size={24} />
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'বিনামূল্যে চিকিৎসা ও রক্তদান' : 'Healthcare & Blood Donation'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed bengali">
              {lang === 'bn' ? 'বিনামূল্যে মেডিকেল ক্যাম্প আয়োজন, সাধারণ মানুষদের চিকিৎসা সেবা প্রদান ও জরুরি রক্তদান কর্মসূচি।' : 'Hosting free medical camps, health checkups, and voluntary blood donation drives.'}
            </p>
          </div>

          {/* Program 5 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-all sm:col-span-2 lg:col-span-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/50">
              <Users size={24} />
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'সামাজিক ঐক্য ও সংস্কার' : 'Community Cohesion & Peace'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed bengali">
              {lang === 'bn' ? 'সামাজিক সৌহার্দ্য রক্ষা, ধর্মীয় উদযাপন ও এলাকার সার্বিক শান্তি বজায় রাখতে যৌথ নাগরিক উদ্যোগ।' : 'Promoting civic harmony, communal solidarity, and peaceful community building in Sylhet.'}
            </p>
          </div>
        </div>
      </section>

      {/* 7. FEATURED & UPCOMING EVENTS */}
      <section className="space-y-8">
        {/* Notice Board Marquee Strip */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col sm:flex-row items-stretch">
          <div className="bg-blue-700 text-white px-5 py-3 flex items-center justify-center gap-2 shrink-0">
            <BellRing size={16} className="animate-pulse text-amber-300" />
            <span className="font-black text-xs uppercase tracking-wider bengali">{t.notices as string}</span>
          </div>
          <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950/40 flex items-center">
            <NoticeMarquee notices={allNotices} lang={lang} />
          </div>
          <Link 
            to="/notices" 
            className="px-5 py-3 bg-slate-900 dark:bg-slate-800 text-slate-200 font-bold text-xs uppercase hover:bg-black transition-colors shrink-0 flex items-center justify-center gap-1.5 bengali"
          >
            <span>{lang === 'bn' ? 'সব নোটিশ' : 'All Notices'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-700 dark:text-amber-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              <Calendar size={14} />
              <span>{lang === 'bn' ? 'ইভেন্টসমূহ' : 'Events Calendar'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'সাম্প্রতিক ও আসন্ন ইভেন্ট' : 'Upcoming & Recent Events'}
            </h2>
          </div>

          <Link 
            to="/events" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-amber-400 hover:underline bengali"
          >
            <span>{lang === 'bn' ? 'সব ইভেন্ট দেখুন' : 'View All Events'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentEvents.length > 0 ? (
            recentEvents.map((evt) => {
              const title = lang === 'bn' ? evt.titleBn : evt.titleEn;
              const desc = lang === 'bn' ? evt.descriptionBn : evt.descriptionEn;
              const locationText = lang === 'bn' ? evt.locationBn : evt.locationEn;

              return (
                <div key={evt.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {evt.image ? (
                      <img 
                        src={getOptimizedImageUrl(evt.image, 400)} 
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => logImageLoadFailure(evt.image, `Event Image (${title})`)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Calendar size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-blue-700 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {lang === 'bn' ? 'ইভেন্ট' : 'Event'}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <Calendar size={13} className="text-amber-500 shrink-0" />
                        <span>{evt.date ? parseLocalDate(evt.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug line-clamp-2 bengali group-hover:text-blue-600 transition-colors">
                        {title}
                      </h3>
                      {locationText && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <MapPin size={12} className="text-blue-500 shrink-0" />
                          <span className="truncate">{locationText}</span>
                        </div>
                      )}
                    </div>

                    <Link 
                      to="/events" 
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-amber-400 hover:gap-2 transition-all pt-2"
                    >
                      <span>{lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 text-slate-500">
              <Calendar size={36} className="mx-auto text-slate-400" />
              <p className="font-bold text-sm bengali">বর্তমানে কোনো নির্ধারিত ইভেন্ট নেই।</p>
            </div>
          )}
        </div>
      </section>

      {/* 8. LATEST NEWS & ACTIVITIES */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-700 dark:text-amber-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              <Newspaper size={14} />
              <span>{lang === 'bn' ? 'খবর ও আপডেট' : 'News & Media'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'সর্বশেষ সংবাদ ও কার্যক্রম' : 'Latest News & Activities'}
            </h2>
          </div>

          <Link 
            to="/news" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-amber-400 hover:underline bengali"
          >
            <span>{lang === 'bn' ? 'সব সংবাদ দেখুন' : 'View All News'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentNews.length > 0 ? (
            recentNews.map((n) => {
              const title = lang === 'bn' ? (n.titleBn || n.title) : (n.titleEn || n.title);
              const content = lang === 'bn' ? (n.contentBn || n.content) : (n.contentEn || n.content);

              return (
                <div key={n.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {n.image ? (
                      <img 
                        src={getOptimizedImageUrl(n.image, 400)} 
                        alt={title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => logImageLoadFailure(n.image, `News Image (${title})`)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Newspaper size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {lang === 'bn' ? 'সংবাদ' : 'Update'}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <Calendar size={13} className="text-blue-500 shrink-0" />
                        <span>{n.date ? parseLocalDate(n.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug line-clamp-2 bengali group-hover:text-blue-600 transition-colors">
                        {title}
                      </h3>
                      {content && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed bengali">
                          {content}
                        </p>
                      )}
                    </div>

                    <Link 
                      to={`/news?id=${n.id}`} 
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-amber-400 hover:gap-2 transition-all pt-2"
                    >
                      <span>{lang === 'bn' ? 'সম্পূর্ণ পড়ুন' : 'Read More'}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 text-slate-500">
              <Megaphone size={36} className="mx-auto text-slate-400" />
              <p className="font-bold text-sm bengali">বর্তমানে কোনো সংবাদ নেই।</p>
            </div>
          )}
        </div>
      </section>

      {/* 9. DONATION / SUPPORT CTA SECTION */}
      <section className="bg-gradient-to-br from-blue-950 via-slate-950 to-blue-900 text-white rounded-3xl p-8 sm:p-12 md:p-16 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Heart size={32} fill="currentColor" className="animate-pulse" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
              {lang === 'bn' ? 'মানবতার সেবায় অংশ নিন' : 'Support Our Cause'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight bengali text-white">
              {lang === 'bn' ? 'আপনার অনুদান সমাজ পরিবর্তনের বড় শক্তি' : 'Your Support Transforms Lives in Sylhet'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed bengali">
              {lang === 'bn' 
                ? 'শিক্ষা কল্যাণ, ফ্রি মেডিকেল ক্যাম্প, ক্রীড়া সামগ্রী ও দুর্যোগে সাধারণ মানুষের সহায়তায় আপনার যে কোনো পরিমাণের সাহায্য অমূল্য ভূমিকা পালন করে।'
                : 'Your generous support empowers education, free medical care, youth sports, and emergency disaster relief in Sylhet.'
              }
            </p>
          </div>

          {/* Payment options display */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 max-w-lg mx-auto space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider bengali">
              {lang === 'bn' ? 'সরাসরি অনুদান পাঠানোর নম্বরসমূহ' : 'Direct Donation Mobile Banking Numbers'}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-pink-950/80 text-pink-300 border border-pink-800">
                bKash: {settings?.bkash || '01711975488'}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-orange-950/80 text-orange-300 border border-orange-800">
                Nagad: {settings?.nagad || '01711975488'}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800">
                Rocket: {settings?.roket || '01711975488'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link 
              to="/donation" 
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-8 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
            >
              <Heart size={20} fill="currentColor" />
              <span>{t.donate as string}</span>
            </Link>

            <Link 
              to="/impact" 
              className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-8 py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 border border-slate-700/80 transition-all"
            >
              <span>{lang === 'bn' ? 'অনুদান ব্যবহারের হিসাব দেখুন' : 'Transparency & Impact'}</span>
              <ArrowRight size={16} className="text-amber-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. TRANSPARENCY & ACCOUNTABILITY */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              <ShieldCheck size={16} />
              <span>{lang === 'bn' ? 'স্বচ্ছতা ও জবাবদিহিতা' : 'Transparency & Governance'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'আমাদের প্রতিটি টাকার স্বচ্ছ হিসাব ও রেকর্ড' : 'Audited & Verified Financial Governance'}
            </h2>
          </div>

          <Link 
            to="/impact"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors bengali"
          >
            {lang === 'bn' ? 'আর্থিক বিবরণী দেখুন' : 'View Financial Reports'}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>{lang === 'bn' ? 'ভেরিফাইড অনুদান রশিদ' : 'Verified Donation Receipt'}</span>
            </div>
            <p className="bengali">
              {lang === 'bn' ? 'প্রতিটি অনুমোদিত অনুদানের ক্ষেত্রে ডিজিটাল ট্রানজেকশন আইডি সহ সিস্টেম জেনারেটেড রশিদ প্রদান করা হয়।' : 'System-generated digital receipt with transaction ID is issued for every approved donation.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>{lang === 'bn' ? 'কার্যনির্বাহী কমিটি নিরীক্ষা' : 'Executive Audit'}</span>
            </div>
            <p className="bengali">
              {lang === 'bn' ? 'সংঘের সভাপতি ও অর্থ সম্পাদকের যৌথ অনুমোদনে সকল ধরণের সামাজিক ও প্রাতিষ্ঠানিক ব্যয় সম্পন্ন করা হয়।' : 'All social and organizational expenditures are approved jointly by the President and Treasurer.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>{lang === 'bn' ? 'প্রকাশ্য বার্ষিক অডিট' : 'Annual Public Audit'}</span>
            </div>
            <p className="bengali">
              {lang === 'bn' ? 'বার্ষিক সাধারণ সভায় সকল আয়-ব্যয়ের হিসাব ও ভবিষ্যৎ পরিকল্পনা সাধারণ সদস্যদের সামনে পেশ করা হয়।' : 'All financial accounts and future plans are presented transparently at the Annual General Meeting.'}
            </p>
          </div>
        </div>
      </section>

      {/* 11. LEADERSHIP PREVIEW SECTION */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-700 dark:text-amber-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              <Users size={14} />
              <span>{lang === 'bn' ? 'কার্যনির্বাহী পরিষদ' : 'Executive Leadership'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'আমাদের পরিচালন পরিষদ' : 'Our Key Leadership'}
            </h2>
          </div>

          <Link 
            to="/leadership" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-amber-400 hover:underline bengali"
          >
            <span>{lang === 'bn' ? 'সম্পূর্ণ কমিটি দেখুন' : 'Full Committee'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {topLeaders.map((leader) => {
            const name = lang === 'bn' ? leader.nameBn : leader.nameEn;
            const designation = lang === 'bn' ? leader.designationBn : leader.designationEn;

            return (
              <div key={leader.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm hover:shadow-md transition-all group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-2 border-blue-600/20 group-hover:border-blue-600 transition-colors">
                  <MemberImage src={leader.image} alt={name} fallbackSrc={LOGO_URL} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base leading-tight bengali group-hover:text-blue-600 transition-colors">
                    {name}
                  </h4>
                  <p className="text-[11px] font-bold text-blue-700 dark:text-amber-400 uppercase tracking-wide bengali">
                    {designation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 12. TESTIMONIALS */}
      {approvedTestimonials.length > 0 && (
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              {lang === 'bn' ? 'শুভাকাঙ্ক্ষীদের অনুভূতি' : 'Community Voices'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black bengali text-white">
              {lang === 'bn' ? 'আজাদী সংঘ সম্পর্কে বক্তব্য' : 'Words About Azadi Organization'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedTestimonials.map((item) => (
              <div key={item.id} className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
                <p className="text-xs text-slate-300 italic leading-relaxed bengali">"{lang === 'bn' ? (item.messageBn || item.message || item.messageEn) : (item.messageEn || item.messageBn || item.message)}"</p>
                <div>
                  <div className="font-black text-xs text-amber-400">{lang === 'bn' ? (item.nameBn || item.nameEn) : (item.nameEn || item.nameBn)}</div>
                  <div className="text-[10px] text-slate-500">{lang === 'bn' ? (item.designationBn || item.designationEn || 'সুশীল সমাজের প্রতিনিধি') : (item.designationEn || item.designationBn || 'Community Member')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 13. GALLERY PREVIEW */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-700 dark:text-amber-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              <Sparkles size={14} />
              <span>{lang === 'bn' ? 'গ্যালারি' : 'Photo Gallery'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'কার্যক্রমের স্থিরচিত্র' : 'Activity Snapshots'}
            </h2>
          </div>

          <Link 
            to="/events" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-amber-400 hover:underline bengali"
          >
            <span>{lang === 'bn' ? 'সব ছবি দেখুন' : 'View Gallery'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {galleryImages.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 group shadow-sm">
              <img 
                src={getOptimizedImageUrl(img.url, 300)} 
                alt={img.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                <span className="text-[10px] font-black text-white leading-tight bengali line-clamp-2">{img.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 14. CONTACT & LOCATION STRIP */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-700 dark:text-amber-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              <Phone size={14} />
              <span>{lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white bengali">
              {lang === 'bn' ? 'আমাদের কার্যালয়ে আমন্ত্রণ' : 'Visit Our Headquarters'}
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="bengali">
                  {lang === 'bn' 
                    ? settings?.addressBn || 'মিরবক্সটুলা, সিলেট-৩১০০, বাংলাদেশ' 
                    : settings?.addressEn || 'Mirbox Tula, Sylhet-3100, Bangladesh'
                  }
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-amber-500 shrink-0" />
                <a href={`tel:${settings?.phone || '+8801712782564'}`} className="hover:text-blue-600 font-bold">
                  {settings?.phone || '+880 1712-782564'}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-500 shrink-0" />
                <a href={`mailto:${settings?.email || 'info@azadi.org'}`} className="hover:text-blue-600 font-bold">
                  {settings?.email || 'info@azadi.org'}
                </a>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a 
                href={`https://wa.me/${(settings?.adminWhatsApp || '8801712782564').replace(/\+/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
              >
                <MessageCircle size={16} />
                <span>{lang === 'bn' ? 'WhatsApp এ মেসেজ পাঠান' : 'Message on WhatsApp'}</span>
              </a>

              <a 
                href="https://maps.google.com/?q=Mirboxtula,Sylhet,Bangladesh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs px-4 py-2.5 rounded-xl transition-all hover:bg-slate-200"
              >
                <MapPin size={16} className="text-blue-600" />
                <span>{lang === 'bn' ? 'ম্যাপে দিকনির্দেশনা দেখুন' : 'Get Directions on Map'}</span>
              </a>
            </div>
          </div>

          {/* Quick Map / Address Visual Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-950 text-white border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} className="w-12 h-12 object-contain bg-white rounded-full p-1" alt="Seal" />
              <div>
                <h4 className="font-black text-sm text-white bengali">{lang === 'bn' ? settings?.nameBn : settings?.nameEn}</h4>
                <p className="text-[10px] text-amber-400 font-black uppercase">{lang === 'bn' ? 'সিলেট সদর কেন্দ্র' : 'Sylhet Headquarters'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium bengali">
              {lang === 'bn' 
                ? 'যে কোনো পরামর্শ, সদস্যপদ সংক্রান্ত তথ্য বা সামাজিক ইভেন্টে অংশগ্রহণের বিষয়ে আমাদের সঙ্গে যোগাযোগ করতে পারেন।'
                : 'Feel free to contact us for suggestions, membership inquiries, or participation in social initiatives.'
              }
            </p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>{lang === 'bn' ? 'সাপ্তাহিক দিনগুলো: খোলা' : 'Operating Days: Open'}</span>
              <span className="text-emerald-400">{lang === 'bn' ? 'সকাল ১০:০০ - রাত ৯:০০' : '10:00 AM - 9:00 PM'}</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
