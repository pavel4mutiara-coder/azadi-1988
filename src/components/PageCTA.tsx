import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, MessageSquare, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PageCTA: React.FC = () => {
  const { lang, settings } = useApp();

  return (
    <div className="relative mt-20 sm:mt-28 rounded-4xl bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 p-8 sm:p-12 lg:p-16 border border-blue-800/50 shadow-heavy overflow-hidden text-white bengali">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-xs uppercase tracking-widest">
            <Heart size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
            <span>{lang === 'bn' ? 'মানবতার সেবায় অংশ নিন' : 'Join Our Mission'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
            {lang === 'bn' 
              ? 'আপনার ছোট একটি সহযোগিতাই বদলে দিতে পারে কারও জীবন' 
              : 'Your Small Support Can Change a Life Forever'}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            {lang === 'bn'
              ? 'আজাদী সমাজ কল্যাণ সংঘ ১৯৮৮ সাল থেকে সামাজিক উন্নয়ন, শিক্ষা প্রসারণ ও চিকিৎসাসেবা পৌঁছে দিচ্ছে। আজই আমাদের সাথে যুক্ত হোন।'
              : 'Serving humanity since 1988 through education, healthcare, youth development, and emergency relief.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
          <Link
            to="/donation"
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Heart size={18} fill="currentColor" />
            <span>{lang === 'bn' ? 'দান করুন' : 'Donate Now'}</span>
          </Link>
          <a
            href={`https://wa.me/${settings?.whatsappNumber || '8801712782564'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl border border-slate-700 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <MessageSquare size={18} className="text-emerald-400" />
            <span>{lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
