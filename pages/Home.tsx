
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
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-emerald-900 dark:bg-slate-900 text-white p-10 md:p-24 flex flex-col items-center text-center gap-8 shadow-2xl border border-emerald-800 dark:border-slate-800 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/10 blur-[120px] -mr-48 -mt-48 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 blur-[120px] -ml-48 -mb-48 rounded-full"></div>
        
        <div className="mb-4 opacity-90 arabic-calligraphy text-3xl md:text-6xl text-emerald-100 dark:text-emerald-400 drop-shadow-sm font-serif italic">
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
        
        <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight max-w-5xl drop-shadow-lg transition-all">
          {lang === 'bn' ? settings.nameBn : settings.nameEn}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-emerald-200 dark:text-emerald-400/80 font-black md:text-2xl uppercase tracking-[0.15em]">
          {features.map((f, i) => (
            <span key={i} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
              {f}
            </span>
          ))}
        </div>

        <p className="max-w-3xl text-slate-200 dark:text-slate-400 text-lg md:text-2xl leading-relaxed font-medium opacity-90">
          {lang === 'bn' 
            ? "একটি অলাভজনক সমাজ কল্যাণমূলক সংস্থা যা ১৯৮৮ সাল থেকে সমাজের সর্বস্তরে শিক্ষা, ঐক্য এবং সেবা নিশ্চিত করতে কাজ করে যাচ্ছে।"
            : "A non-profit social welfare organization working since 1988 to ensure education, unity, and service across all levels of society."}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-6 w-full justify-center relative z-10">
          <button className="bg-white text-emerald-900 px-12 py-5 rounded-[1.75rem] font-black text-xl hover:bg-emerald-50 transition-all shadow-2xl hover:-translate-y-1.5 active:scale-95">
            {t.about}
          </button>
          <Link to="/donation" className="bg-emerald-600 text-white px-12 py-5 rounded-[1.75rem] font-black text-xl border-2 border-emerald-400/30 hover:bg-emerald-500 transition-all shadow-2xl hover:-translate-y-1.5 active:scale-95 flex items-center justify-center gap-3">
            <Heart size={24} fill="currentColor" />
            {t.donate}
          </Link>
        </div>
      </section>

      {/* Islamic Quote Inspiration Section */}
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 md:p-16 shadow-2xl relative group overflow-hidden transition-all duration-500">
        <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 -ml-24 -mt-24 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/5 -mr-24 -mb-24 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.25em] text-[11px] px-5 py-2 bg-emerald-50 dark:bg-emerald-900/40 rounded-full border border-emerald-100 dark:border-emerald-800 shadow-sm">
              <Quote size={16} />
              {t.inspiration}
            </div>
            <div className="arabic-calligraphy text-3xl md:text-5xl text-emerald-800 dark:text-emerald-300 font-serif my-6 drop-shadow-sm">
              {currentQuote.arabic}
            </div>
            <p className="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 leading-tight italic tracking-tight">
              " {lang === 'bn' ? currentQuote.bn : currentQuote.en} "
            </p>
          </div>
          
          <button 
            onClick={rotateQuote}
            className="p-6 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-3xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-md active:scale-90 group/btn border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw size={32} className="group-hover/btn:rotate-180 transition-transform duration-700" />
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-6 hover:shadow-3xl transition-all hover:-translate-y-3 group cursor-default">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ring-2 ring-emerald-100/50 dark:ring-emerald-800/50">
              {/* Fix: cast element to React.ReactElement<any> to allow dynamic props */}
              {React.cloneElement(FEATURE_ICONS[i] as React.ReactElement<any>, { size: 36 })}
            </div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl leading-tight uppercase tracking-wide">{f}</h3>
          </div>
        ))}
      </section>

      {/* Intro & Application Form */}
      <section className="grid md:grid-cols-2 gap-20 items-start">
        <div className="space-y-10 py-6">
          <div className="inline-flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.25em] text-[11px] px-5 py-2 bg-emerald-50 dark:bg-emerald-900/40 rounded-full border border-emerald-100 dark:border-emerald-800">
            <MessageSquare size={16} />
            {lang === 'bn' ? 'আমাদের বার্তা' : 'Our Message'}
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            {lang === 'bn' ? 'মানবসেবায় আজাদী সমাজ কল্যাণ সংঘ' : 'Service to Humanity'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed font-medium">
            {lang === 'bn' 
              ? "দীর্ঘ ৩৪ বছরের পথচলায় আমরা সবসময় দুর্গত মানুষের পাশে দাঁড়িয়েছি। শিক্ষা বিস্তার এবং ক্রীড়া উন্নয়ন আমাদের ভূমিকা অনন্য। আমরা বিশ্বাস করি একতাই বল, আর সেবাই পরম ধর্ম।"
              : "In our 34-year journey, we have always stood by the distressed. Our role in spreading education and developing sports is unique. We believe unity is strength, and service is the greatest duty."}
          </p>
          <div className="flex items-center gap-8 p-8 rounded-[3rem] bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
            <div className="font-black text-7xl text-emerald-600 dark:text-emerald-400 drop-shadow-sm">35+</div>
            <div className="text-lg font-black text-slate-700 dark:text-slate-300 leading-tight uppercase tracking-wider">
              {lang === 'bn' ? 'বছরের সামাজিক অভিজ্ঞতা এবং উন্নয়নমূলক কাজ' : 'Years of social experience and development work'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-3xl space-y-10 relative overflow-hidden transition-colors duration-500">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 dark:bg-emerald-500/5 -rotate-12 rounded-[4rem] -z-0"></div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl">
                <Send className="text-emerald-600 dark:text-emerald-400" size={28} />
              </div>
              {t.callToAction}
            </h3>
            <p className="text-slate-500 dark:text-slate-500 font-bold ml-16">{lang === 'bn' ? 'সরাসরি আমাদের হোয়াটস অ্যাপে মেসেজ পাঠান' : 'Directly message us on WhatsApp'}</p>
          </div>
          
          <form className="space-y-8 relative z-10" onSubmit={handleComplaintSubmit}>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">{t.donorName}</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl focus:ring-4 ring-emerald-500/10 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:opacity-30" 
                  placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">{t.phone}</label>
                <input 
                  required
                  type="tel" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl focus:ring-4 ring-emerald-500/10 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:opacity-30" 
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">{lang === 'bn' ? 'আপনার মেসেজ' : 'Your Message'}</label>
              <textarea 
                required
                rows={5} 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl focus:ring-4 ring-emerald-500/10 outline-none transition-all resize-none text-slate-900 dark:text-white font-bold placeholder:opacity-30" 
                placeholder={lang === 'bn' ? 'বিস্তারিত লিখুন...' : 'Details here...'}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-4 text-2xl hover:-translate-y-2 active:scale-95 ring-8 ring-emerald-500/5 group">
              <Send size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              {t.submit}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
