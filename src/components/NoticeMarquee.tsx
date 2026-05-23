
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Clock, AlertTriangle } from 'lucide-react';
import { Notice, Language } from '../types';

interface NoticeMarqueeProps {
  notices: Notice[];
  lang: Language;
}

export const NoticeMarquee: React.FC<NoticeMarqueeProps> = ({ notices, lang }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(40);

  // Filter and sort notices (newest first)
  const activeNotices = [...notices].sort((a, b) => 
    new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );

  useEffect(() => {
    const updateDuration = () => {
      if (scrollRef.current) {
        const contentWidth = scrollRef.current.scrollWidth;
        // Adjust duration based on content length (pixels per second)
        // 60px/s for a smooth readable speed
        const speed = 60; 
        const calculatedDuration = (contentWidth / 2) / speed; // Use width/2 because we loop half-way
        setDuration(Math.max(calculatedDuration, 15));
      }
    };

    updateDuration();
    window.addEventListener('resize', updateDuration);
    return () => window.removeEventListener('resize', updateDuration);
  }, [activeNotices, lang]);

  if (activeNotices.length === 0) {
    return (
      <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 italic py-4 px-8 w-full justify-center">
        <BellRing size={18} className="opacity-40" />
        <span className="text-[11px] font-bold uppercase tracking-widest bengali">
          {lang === 'bn' ? 'বর্তমানে কোনো নতুন বিজ্ঞপ্তি নেই' : 'No new notices at this moment'}
        </span>
      </div>
    );
  }

  const NoticeItem = ({ notice }: { notice: Notice }) => (
    <div className="flex items-center gap-4 sm:gap-6 px-6 sm:px-10 whitespace-nowrap group/item cursor-pointer">
      <div className="flex items-center gap-3">
        {notice.isUrgent ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-[9px] font-black uppercase rounded-full shadow-[0_0_12px_rgba(220,38,38,0.4)] animate-pulse">
            <AlertTriangle size={10} />
            {lang === 'bn' ? 'জরুরী' : 'Urgent'}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
            <BellRing size={10} />
            {lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notice'}
          </div>
        )}
        <h3 className="text-slate-900 dark:text-white font-black text-[13px] sm:text-base bengali tracking-tight group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">
          {lang === 'bn' ? notice.titleBn : notice.titleEn}
        </h3>
      </div>
      
      <div className="hidden xs:flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500">
        <Clock size={12} className="text-emerald-500/60" />
        {notice.date ? new Date(notice.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
      </div>

      <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800 to-transparent mx-2 sm:mx-4"></div>
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden flex items-center h-full">
      {/* Decorative side fades */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-white dark:from-slate-900 via-transparent to-transparent pointer-events-none opacity-100"></div>
      <div className="absolute inset-y-0 right-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-white dark:from-slate-900 via-transparent to-transparent pointer-events-none opacity-100"></div>

      <div 
        ref={scrollRef}
        className="flex items-center animate-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused] py-4 transition-opacity duration-500"
      >
        {/* We duplicate the content to ensure seamless loop */}
        <div className="flex items-center">
          {activeNotices.map((notice) => (
            <NoticeItem key={`orig-${notice.id}`} notice={notice} />
          ))}
        </div>
        <div className="flex items-center">
          {activeNotices.map((notice) => (
            <NoticeItem key={`dup-${notice.id}`} notice={notice} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee-infinite ${duration}s linear infinite;
        }
        /* Mobile touch support to pause */
        @media (hover: none) {
          .animate-marquee:active {
            animation-play-state: paused;
          }
        }
      `}</style>
    </div>
  );
};
