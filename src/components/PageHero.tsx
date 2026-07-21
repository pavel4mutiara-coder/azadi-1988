import React from 'react';
import { useApp } from '../context/AppContext';
import { Breadcrumb } from './Breadcrumb';

interface PageHeroProps {
  icon?: React.ReactNode;
  badgeBn: string;
  badgeEn: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  breadcrumbs?: { labelBn: string; labelEn: string; path?: string }[];
}

export const PageHero: React.FC<PageHeroProps> = ({
  icon,
  badgeBn,
  badgeEn,
  titleBn,
  titleEn,
  subtitleBn,
  subtitleEn,
  breadcrumbs
}) => {
  const { lang } = useApp();

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-900/40 text-white p-8 sm:p-12 lg:p-16 shadow-heavy mb-12 sm:mb-16">
      {/* Background Islamic Pattern Accent */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6 max-w-4xl mx-auto text-center flex flex-col items-center">
        {breadcrumbs && (
          <div className="mb-2">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-blue-900/60 border border-blue-400/30 text-amber-300 font-black text-xs uppercase tracking-widest shadow-inner bengali">
          {icon && <span className="text-amber-400">{icon}</span>}
          <span>{lang === 'bn' ? badgeBn : badgeEn}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight bengali drop-shadow-md">
          {lang === 'bn' ? titleBn : titleEn}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl bengali opacity-90">
          {lang === 'bn' ? subtitleBn : subtitleEn}
        </p>
      </div>
    </div>
  );
};
