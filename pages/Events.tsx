
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export const Events: React.FC = () => {
  const { lang, events } = useApp();
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-50">{t.events}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'bn' 
            ? 'আমাদের সামাজিক উন্নয়নমূলক কার্যক্রম এবং ইভেন্টের তালিকা।' 
            : 'Explore our list of social development activities and upcoming events.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map((event) => (
          <div key={event.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col sm:flex-row">
            <div className="sm:w-2/5 relative h-48 sm:h-auto overflow-hidden bg-white dark:bg-slate-950">
              <img src={event.image} alt={lang === 'bn' ? event.titleBn : event.titleEn} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                Upcoming
              </div>
            </div>
            <div className="p-8 sm:w-3/5 space-y-4 flex flex-col justify-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
                  <Calendar size={14} />
                  {new Date(event.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                  {lang === 'bn' ? event.titleBn : event.titleEn}
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-300 line-clamp-3 leading-relaxed">
                {lang === 'bn' ? event.descriptionBn : event.descriptionEn}
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 pt-2">
                <MapPin size={14} />
                {lang === 'bn' ? event.locationBn : event.locationEn}
              </div>
              <button className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm pt-4 hover:gap-4 transition-all uppercase tracking-wider">
                {lang === 'bn' ? 'বিস্তারিত দেখুন' : 'Learn More'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-30">
            <Calendar size={64} className="mx-auto text-slate-400 mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">No Events Found</p>
          </div>
        )}
      </div>
    </div>
  );
};
