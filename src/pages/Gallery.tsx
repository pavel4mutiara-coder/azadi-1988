import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { 
  Image as ImageIcon, Filter, X, Calendar, Share2, 
  CheckCircle, ChevronLeft, ChevronRight, ZoomIn, Check
} from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { logImageLoadFailure } from '../utils/imageMonitor';
import { parseLocalDate } from '../utils/parseLocalDate';
import { PageHero } from '../components/PageHero';
import { PageCTA } from '../components/PageCTA';

interface GalleryItem {
  id: string;
  url: string;
  titleBn: string;
  titleEn: string;
  category: string;
  date?: string;
  sourceType: 'event' | 'news' | 'gallery';
}

export const Gallery: React.FC = () => {
  const { lang, events, news } = useApp();
  const t = TRANSLATIONS[lang];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Aggregate real images from events and news
  const galleryItems = useMemo<GalleryItem[]>(() => {
    const items: GalleryItem[] = [];

    events.forEach(e => {
      if (e.image) {
        items.push({
          id: `event-${e.id}`,
          url: e.image,
          titleBn: e.titleBn,
          titleEn: e.titleEn,
          category: lang === 'bn' ? 'ইভেন্টস ও প্রতিযোগিতা' : 'Events & Sports',
          date: e.date,
          sourceType: 'event'
        });
      }
    });

    news.forEach(n => {
      if (n.image) {
        items.push({
          id: `news-${n.id}`,
          url: n.image,
          titleBn: n.titleBn || n.titleEn || '',
          titleEn: n.titleEn || n.titleBn || '',
          category: n.category || (lang === 'bn' ? 'সামাজিক কার্যক্রম' : 'Social Welfare'),
          date: n.date,
          sourceType: 'news'
        });
      }
    });

    return items;
  }, [events, news, lang]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    galleryItems.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [galleryItems]);

  // Filtered gallery items
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return galleryItems;
    return galleryItems.filter(item => item.category === activeCategory);
  }, [galleryItems, activeCategory]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = parseLocalDate(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleShare = async (item: GalleryItem) => {
    const title = lang === 'bn' ? item.titleBn : item.titleEn;
    const text = `📷 ${title}\n${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: window.location.href });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(item.id);
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero */}
      <PageHero
        icon={<ImageIcon size={20} />}
        badgeBn="ছবি ও ভিডিও মেমোরি"
        badgeEn="Visual Archive"
        titleBn="গ্যালারি ও চিত্রশালা"
        titleEn="Photo Gallery & Historical Archive"
        subtitleBn="আজাদী সমাজ কল্যাণ সংঘের ক্রীড়া প্রতিযোগিতা, ত্রাণ বিতরণ, সভা ও সামাজিক অর্জনের স্থিরচিত্র।"
        subtitleEn="Visual documentation of our sports tournaments, humanitarian relief drives, and social welfare programs."
        breadcrumbs={[
          { labelBn: "গ্যালারি", labelEn: "Gallery" }
        ]}
      />

      {/* Category Filter Pills */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
            activeCategory === 'all'
              ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          {activeCategory === 'all' && <Check size={14} className="text-amber-400" />}
          <span>{lang === 'bn' ? `সব ছবি (${galleryItems.length})` : `All Photos (${galleryItems.length})`}</span>
        </button>

        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
              activeCategory === cat
                ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {activeCategory === cat && <Check size={14} className="text-amber-400" />}
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const title = lang === 'bn' ? item.titleBn : item.titleEn;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-soft hover:shadow-heavy transition-all duration-500 cursor-pointer aspect-4/3 hover:-translate-y-2 border border-slate-200 dark:border-slate-800"
              >
                <img
                  src={getOptimizedImageUrl(item.url, 600)}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  onError={() => logImageLoadFailure(item.url, "Gallery Item")}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Zoom Icon Badge */}
                <div className="absolute top-4 right-4 p-2.5 bg-slate-900/80 backdrop-blur-md text-amber-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <ZoomIn size={18} />
                </div>

                {/* Info Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-md">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-black text-white leading-snug line-clamp-2">
                    {title}
                  </h3>
                  {item.date && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                      <Calendar size={12} className="text-amber-400" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <ImageIcon size={48} className="mx-auto text-slate-400 opacity-50" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'কোনো চিত্র পাওয়া যায়নি' : 'No Gallery Photos Available'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {lang === 'bn' ? 'সংস্থার নতুন ইভেন্ট ও সংবাদের স্থিরচিত্র শীঘ্রই যুক্ত করা হবে।' : 'New photos from upcoming events will be published here.'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="relative max-w-5xl w-full bg-slate-900 rounded-4xl border border-slate-800 overflow-hidden shadow-heavy text-white flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
                  {selectedPhoto.category}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {lang === 'bn' ? selectedPhoto.titleBn : selectedPhoto.titleEn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-3 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Large Image */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden p-4">
              <img
                src={getOptimizedImageUrl(selectedPhoto.url, 1200)}
                alt={selectedPhoto.titleEn}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
              {selectedPhoto.date ? (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Calendar size={14} className="text-amber-400" />
                  <span>{formatDate(selectedPhoto.date)}</span>
                </div>
              ) : (
                <span />
              )}

              <button
                onClick={() => handleShare(selectedPhoto)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                {copyStatus === selectedPhoto.id ? <CheckCircle size={14} /> : <Share2 size={14} />}
                <span>{copyStatus === selectedPhoto.id ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'শেয়ার' : 'Share Photo')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};
