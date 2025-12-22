
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, ISLAMIC_QUOTES } from '../constants';
import { GraduationCap, Users, HeartHandshake, HandHelping, Trophy, Send, MessageSquare, Quote, RefreshCw, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURE_ICONS = [<GraduationCap />, <Users />, <HeartHandshake />, <HandHelping />, <Trophy />];

export const Home: React.FC = () => {
  const { lang, settings } = useApp();
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * ISLAMIC_QUOTES.length));
  }, []);

  const rotateQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
  };

  const features = (lang === 'bn' ? settings.sloganBn : settings.sloganEn).split(' · ');

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Name: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}`;
    const url = `https://wa.me/${settings.adminWhatsApp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const currentQuote = ISLAMIC_QUOTES[quoteIndex];

  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Responsive Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-emerald-900 dark:bg-slate-900 text-white p-6 sm:p-10 md:p-24 flex flex-col items-center text-center gap-6 md:gap-8 shadow-2xl border border-emerald-800 dark:border-slate-800 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-emerald-400/20 dark:bg-emerald-500/10 blur-[80px] md:blur-[120px] -mr-32 -mt-32 md:-mr-48 md:-mt-48 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-amber-400/10 dark:bg-amber-500/5 blur-[80px] md:blur-[120px] -ml-32 -mb-32 md:-ml-48 md:-mb-48 rounded-full"></div>
        
        <div className="mb-2 md:mb-4 opacity-90 arabic-calligraphy text-xl sm:text-3xl md:text-6xl text-emerald-100 dark:text-emerald-400 drop-shadow-sm font-serif italic">
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
        
        <h1 className="text-2xl sm:text-4xl md:text-7xl font-black tracking-tight leading-tight max-w-5xl drop-shadow-lg transition-all break-words px-2">
          {lang === 'bn' ? settings.nameBn : settings.nameEn}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-3 md:gap-8 text-emerald-200 dark:text-emerald-400/80 font-black text-[10px] sm:text-base md:text-2xl uppercase tracking-[0.1em] md:tracking-[0.15em]">
          {features.map((f, i) => (
            <span key={i} className="flex items-center gap-1.5 md:gap-3">
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
              {f}
            </span>
          ))}
        </div>

        <p className="max-w-3xl text-slate-200 dark:text-slate-400 text-sm sm:text-lg md:text-2xl leading-relaxed font-medium opacity-90 px-4">
          {lang === 'bn' 
            ? "১৯৮৮ সাল থেকে সমাজের সর্বস্তরে শিক্ষা, ঐক্য এবং সেবা নিশ্চিত করতে কাজ করে যাচ্ছে।"
            : "Working since 1988 to ensure education, unity, and service across all levels of society."}
        </p>

        <div className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-sm sm:max-w-none justify-center relative z-10 px-4">
          <button className="bg-white text-emerald-900 px-8 md:px-12 py-4 md:py-5 rounded-[1.25rem] md:rounded-[1.75rem] font-black text-sm sm:text-base md:text-xl hover:bg-emerald-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
            {t.about}
          </button>
          <Link to="/donation" className="bg-emerald-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-[1.25rem] md:rounded-[1.75rem] font-black text-sm sm:text-base md:text-xl border-2 border-emerald-400/30 hover:bg-emerald-500 transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 md:gap-3">
            <Heart size={20} className="md:w-6 md:h-6" fill="currentColor" />
            {t.donate}
          </Link>
        </div>
      </section>

      {/* Responsive Grid for Features */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[1.75rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-3 md:gap-6 hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-default shadow-sm">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ring-2 ring-emerald-100/50 dark:ring-emerald-800/50">
              {React.cloneElement(FEATURE_ICONS[i] as React.ReactElement<any>, { size: 24, className: "md:w-9 md:h-9" })}
            </div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-xs sm:text-sm md:text-xl leading-tight uppercase tracking-wide">{f}</h3>
          </div>
        ))}
      </section>

      {/* More sections follow same pattern... */}
    </div>
  );
};
