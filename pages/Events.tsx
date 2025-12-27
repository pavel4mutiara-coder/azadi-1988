
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Calendar, MapPin, ArrowRight, X, Clock, Info, Image as ImageIcon, Share2, MessageCircle, Copy, CheckCircle } from 'lucide-react';
import { Event } from '../types';

export const Events: React.FC = () => {
  const { lang, events, settings } = useApp();
  const t = TRANSLATIONS[lang];
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

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

  const handleShare = async (event: Event) => {
    const shareTitle = lang === 'bn' ? event.titleBn : event.titleEn;
    const shareText = `${shareTitle}\n📅 ${formatDate(event.date)}\n📍 ${lang === 'bn' ? event.locationBn : event.locationEn}\n\n${lang === 'bn' ? event.descriptionBn : event.descriptionEn}\n\n— ${lang === 'bn' ? settings.nameBn : settings.nameEn}`;
    const shareUrl = window.location.origin + window.location.pathname + '#/events';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n\nLink: ${shareUrl}`);
        setCopyStatus(event.id);
        setTimeout(() => setCopyStatus(null), 2000);
      } catch (err) {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        window.open(waUrl, '_blank');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28 md:pb-20 bengali">
      {/* Page Header */}
      <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 md:gap-3 text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[9px] md:text-[10px] px-4 md:px-6 py-2 md:py-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full border border-emerald-200 dark:border-emerald-700 shadow-sm">
           <Calendar size={14} />
           {lang === 'bn' ? 'আমাদের কার্যক্রম' : 'Our Activities'}
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {t.events}
        </h1>
        <p className="text-sm md:text-xl text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
          {lang === 'bn' 
            ? 'আজাদী সমাজ কল্যাণ সংঘের আর্তমানবতার সেবা ও উন্নয়নমূলক কর্মকাণ্ডের চিত্রশালা।' 
            : 'Gallery of social welfare and development activities of Azadi Social Welfare Organization.'}
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <div 
              key={event.id} 
              className="group bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] border border-emerald-100 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col border-b-8 border-b-emerald-500/10"
            >
              {/* Image Section */}
              <div className="relative h-56 sm:h-64 overflow-hidden bg-emerald-50 dark:bg-slate-950">
                {event.image ? (
                  <img 
                    src={event.image} 
                    alt={lang === 'bn' ? event.titleBn : event.titleEn} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-emerald-200 gap-2">
                    <ImageIcon size={48} />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                  </div>
                )}
                
                {/* Float Date Overlay */}
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-lg border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-black text-[10px] md:text-xs">
                    <Clock size={12} className="md:w-3.5 md:h-3.5" />
                    {formatDate(event.date)}
                  </div>
                </div>

                {/* Quick Share Button on Image */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleShare(event); }}
                  className="absolute top-4 left-4 p-2.5 md:p-3 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl md:rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-emerald-500/30 z-10"
                >
                  {copyStatus === event.id ? <CheckCircle size={18} /> : <Share2 size={18} />}
                </button>
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-10 space-y-4 md:space-y-5 flex-1 flex flex-col">
                <div className="space-y-2 md:space-y-3">
                  <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight line-clamp-2">
                    {lang === 'bn' ? event.titleBn : event.titleEn}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500">
                    <MapPin size={12} className="text-emerald-500 md:w-3.5 md:h-3.5" />
                    {lang === 'bn' ? event.locationBn : event.locationEn}
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed line-clamp-3 text-xs md:text-sm flex-1">
                  {lang === 'bn' ? event.descriptionBn : event.descriptionEn}
                </p>

                <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <button 
                    onClick={() => setSelectedEvent(event)}
                    className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-[11px] md:text-sm hover:gap-3 transition-all uppercase tracking-wider group/btn"
                  >
                    {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform md:w-4 md:h-4" />
                  </button>

                  <button 
                    onClick={() => handleShare(event)}
                    className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 transition-colors font-black text-[10px] md:text-xs uppercase tracking-widest"
                  >
                    <Share2 size={14} className="md:w-4 md:h-4" />
                    {lang === 'bn' ? 'শেয়ার' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 md:py-32 text-center space-y-6 bg-emerald-50/30 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-emerald-100 dark:border-slate-800">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-800 rounded-[2.2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
              <Calendar size={40} className="text-emerald-200 dark:text-slate-700 md:w-12 md:h-12" />
            </div>
            <div className="space-y-2 px-6">
              <h3 className="text-base md:text-xl font-black text-slate-400 uppercase tracking-[0.2em]">{lang === 'bn' ? 'কোন ইভেন্ট পাওয়া যায়নি' : 'No Events Found'}</h3>
              <p className="text-slate-400/60 font-bold text-xs md:text-sm">{lang === 'bn' ? 'খুব শীঘ্রই নতুন ইভেন্ট যুক্ত করা হবে।' : 'New events will be added soon.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedEvent(null)}></div>
           <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-emerald-100 dark:border-slate-800 flex flex-col group no-scrollbar">
              
              {/* Modal Close Button */}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 md:p-3 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-xl md:rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-slate-100 dark:border-slate-700"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>

              <div className="grid lg:grid-cols-2 h-full">
                {/* Modal Image */}
                <div className="h-56 sm:h-72 lg:h-full min-h-[220px] md:min-h-[300px] bg-slate-100 dark:bg-slate-950 relative">
                  {selectedEvent.image ? (
                    <img src={selectedEvent.image} className="w-full h-full object-cover" alt="Event" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-100"><ImageIcon size={60} className="md:w-20 md:h-20" /></div>
                  )}
                  
                  {/* Share Floating Button on Modal Image */}
                  <button 
                    onClick={() => handleShare(selectedEvent)}
                    className="absolute bottom-4 left-4 md:bottom-6 md:left-6 p-3 md:p-4 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-2xl md:rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all border border-emerald-50 dark:border-slate-700"
                  >
                    <Share2 size={20} className="md:w-6 md:h-6" />
                  </button>
                </div>

                {/* Modal Info */}
                <div className="p-6 md:p-12 space-y-6 md:space-y-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 md:px-4 py-1.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} /> {formatDate(selectedEvent.date)}
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-3 md:px-4 py-1.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={12} /> {lang === 'bn' ? selectedEvent.locationBn : selectedEvent.locationEn}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                      {lang === 'bn' ? selectedEvent.titleBn : selectedEvent.titleEn}
                    </h2>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                      <Info size={14} className="md:w-4 md:h-4" /> {lang === 'bn' ? 'ইভেন্ট বিবরণ' : 'Event Details'}
                    </h4>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 font-bold leading-relaxed whitespace-pre-line">
                      {lang === 'bn' ? selectedEvent.descriptionBn : selectedEvent.descriptionEn}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={() => handleShare(selectedEvent)}
                      className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-black py-3 md:py-4 rounded-xl md:rounded-2xl shadow-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all uppercase text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-2"
                    >
                      <Share2 size={16} className="md:w-4 md:h-4" /> {lang === 'bn' ? 'শেয়ার' : 'Share'}
                    </button>
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black py-3 md:py-4 rounded-xl md:rounded-2xl shadow-xl hover:opacity-90 transition-all uppercase text-[9px] md:text-[10px] tracking-widest"
                    >
                      {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
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
