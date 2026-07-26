import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useApp();

  const toggleLang = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`h-8 px-2.5 flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-800 transition-all shadow-sm cursor-pointer shrink-0 ${className}`}
      title={lang === 'bn' ? 'English' : 'বাংলা'}
      aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
    >
      <Globe size={14} className="text-blue-600 dark:text-amber-400 shrink-0" />
      <span className="text-[11px] font-black tracking-tight uppercase">
        {lang === 'bn' ? 'বাংলা' : 'EN'}
      </span>
    </button>
  );
};



