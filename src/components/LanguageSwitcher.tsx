import React from 'react';
import { useApp } from '../context/AppContext';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useApp();

  return (
    <div 
      className={`inline-flex items-center bg-slate-100 dark:bg-slate-900/90 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner shrink-0 ${className}`}
      role="group"
      aria-label={lang === 'bn' ? 'ভাষা নির্বাচন' : 'Language Selection'}
    >
      <button 
        type="button"
        onClick={() => setLang('bn')} 
        className={`w-7 h-7 sm:w-7 sm:h-7 rounded-lg text-xs font-black transition-all duration-200 flex items-center justify-center ${
          lang === 'bn' 
          ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/20' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="B = বাংলা"
        aria-label="বাংলা ভাষায় পরিবর্তন করুন"
        aria-pressed={lang === 'bn'}
      >
        <span>B</span>
      </button>
      
      <button 
        type="button"
        onClick={() => setLang('en')} 
        className={`w-7 h-7 sm:w-7 sm:h-7 rounded-lg text-xs font-black transition-all duration-200 flex items-center justify-center ${
          lang === 'en' 
          ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/20' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="E = English"
        aria-label="Switch to English"
        aria-pressed={lang === 'en'}
      >
        <span>E</span>
      </button>
    </div>
  );
};

