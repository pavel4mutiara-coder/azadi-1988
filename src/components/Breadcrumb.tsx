import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BreadcrumbProps {
  items: {
    labelBn: string;
    labelEn: string;
    path?: string;
  }[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { lang } = useApp();

  return (
    <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 py-3 px-4 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-sm w-fit max-w-full overflow-x-auto bengali no-scrollbar">
      <Link 
        to="/" 
        className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-amber-400 transition-colors shrink-0"
        title={lang === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
      >
        <Home size={14} className="text-blue-600 dark:text-amber-400" />
        <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const label = lang === 'bn' ? item.labelBn : item.labelEn;

        return (
          <React.Fragment key={idx}>
            <ChevronRight size={12} className="text-slate-400 shrink-0" />
            {item.path && !isLast ? (
              <Link 
                to={item.path} 
                className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors truncate shrink-0 max-w-[150px] sm:max-w-none"
              >
                {label}
              </Link>
            ) : (
              <span className="text-blue-900 dark:text-blue-300 font-black truncate max-w-[200px] sm:max-w-none">
                {label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
