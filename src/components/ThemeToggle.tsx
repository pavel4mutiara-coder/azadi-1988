import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme, lang } = useApp();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 shrink-0 ${className}`}
      title={lang === 'bn' ? (theme === 'light' ? 'ডার্ক মোড' : 'লাইট মোড') : (theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode')}
      aria-label={lang === 'bn' ? 'থিম পরিবর্তন করুন' : 'Toggle Theme'}
    >
      {theme === 'light' ? (
        <Moon size={16} className="text-slate-700" />
      ) : (
        <Sun size={16} className="text-amber-400" />
      )}
    </button>
  );
};
