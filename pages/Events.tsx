
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Calendar, MapPin, ArrowRight, X, Clock, Info, Image as ImageIcon } from 'lucide-react';
import { Event } from '../types';

export const Events: React.FC = () => {
  const { lang, events } = useApp();
  const t = TRANSLATIONS[lang];
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Sort events by date: newest first
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 bengali">
      {/* Page Header */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full border border-emerald-200 dark:border-emerald-700 shadow-sm">
           <Calendar size={14} />
           {lang === 'bn' ? 'আমাদের কার্যক্রম' : 'Our Activities'}
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.events}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-bold leading-relaxed px-4">
          {lang === 'bn' 
            ? 'আজাদী সমাজ কল্যাণ সংঘের আর্তমানবতার সেবা ও উন্নয়নমূলক কর্মকাণ্ডের চিত্রশালা।' 
            : 'Gallery of social welfare and development activities of Azadi Social Welfare Organization.'}
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <div 
              key={event.id} 
              className="group bg-white dark:bg-slate-900 rounded-[3rem] border border-emerald-100 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col border-b-8 border-b-emerald-500/10"
            >
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden bg-emerald-50 dark:bg-slate-950">
                {event.image ? (
                  <img 
                    src={event.image} 
                    alt={lang === 'bn' ? event.titleBn : event.titleEn} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-emerald-200 gap-2">
                    <ImageIcon size={48} />
                    <span className="text-[10px] font-black uppercase">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs">
                    <Clock size={14} />
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 md:p-10 space-y-5 flex-1 flex flex-col">
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    {lang === 'bn' ? event.titleBn : event.titleEn}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                    <MapPin size={14} className="text-emerald-500" />
                    {lang === 'bn' ? event.locationBn : event.locationEn}
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed line-clamp-3 text-sm flex-1">
                  {lang === 'bn' ? event.descriptionBn : event.descriptionEn}
                </p>

                <button 
                  onClick={() => setSelectedEvent(event)}
                  className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm pt-4 hover:gap-4 transition-all uppercase tracking-wider group/btn"
                >
                  {lang === 'bn' ? 'বিস্তারিত দেখুন' : 'Learn More'}
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center space-y-6 bg-emerald-50/30 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-emerald-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
              <Calendar size={48} className="text-emerald-200 dark:text-slate-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">{lang === 'bn' ? 'কোন ইভেন্ট পাওয়া যায়নি' : 'No Events Found'}</h3>
              <p className="text-slate-400/60 font-bold text-sm">{lang === 'bn' ? 'খুব শীঘ্রই নতুন ইভেন্ট যুক্ত করা হবে।' : 'New events will be added soon.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedEvent(null)}></div>
           <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] shadow-2xl border border-emerald-100 dark:border-slate-800 flex flex-col group">
              
              {/* Modal Close Button */}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-slate-100 dark:border-slate-700"
              >
                <X size={24} />
              </button>

              <div className="grid lg:grid-cols-2">
                {/* Modal Image */}
                <div className="h-64 lg:h-full min-h-[300px] bg-slate-100 dark:bg-slate-950 relative">
                  {selectedEvent.image ? (
                    <img src={selectedEvent.image} className="w-full h-full object-cover" alt="Event" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-100"><ImageIcon size={80} /></div>
                  )}
                </div>

                {/* Modal Info */}
                <div className="p-8 md:p-12 space-y-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} /> {formatDate(selectedEvent.date)}
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} /> {lang === 'bn' ? selectedEvent.locationBn : selectedEvent.locationEn}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                      {lang === 'bn' ? selectedEvent.titleBn : selectedEvent.titleEn}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                      <Info size={16} /> {lang === 'bn' ? 'ইভেন্ট বিবরণ' : 'Event Details'}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-base whitespace-pre-line">
                      {lang === 'bn' ? selectedEvent.descriptionBn : selectedEvent.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-emerald-700 transition-all uppercase text-xs tracking-widest"
                    >
                      {lang === 'bn' ? 'বন্ধ করুন' : 'Close Details'}
                    </button>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
