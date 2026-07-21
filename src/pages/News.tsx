import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { 
  Newspaper, Calendar, ArrowRight, Share2, Search,
  X, CheckCircle, Clock, ChevronLeft, ChevronRight, User, Tag
} from 'lucide-react';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { parseLocalDate } from '../utils/parseLocalDate';
import { RichTextRenderer } from '../components/RichTextRenderer';
import { normalizeGoogleDriveImage } from '../utils/normalizeGoogleDriveImage';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { logImageLoadFailure } from '../utils/imageMonitor';
import { PageHero } from '../components/PageHero';
import { PageCTA } from '../components/PageCTA';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const getNewsFields = (item: any, lang: 'bn' | 'en') => {
  if (!item) return { title: '', content: '', image: '', date: '', category: '', author: '' };
  const title = lang === 'bn' 
    ? (item.titleBn || item.title || item.titleEn || '') 
    : (item.titleEn || item.title || item.titleBn || '');
  const content = lang === 'bn' 
    ? (item.contentBn || item.content || item.contentEn || '') 
    : (item.contentEn || item.content || item.contentBn || '');
  const image = item.image || item.imageUrl || '';
  const date = item.date || item.createdAt || '';
  const category = item.category || (lang === 'bn' ? 'সাধারণ বিষয়' : 'General');
  const author = item.author || (lang === 'bn' ? 'আজাদী সংবাদ সেল' : 'Azadi News Desk');
  return { title, content, image, date, category, author };
};

const ITEMS_PER_PAGE = 6;

export const NewsPage: React.FC = () => {
  const { lang, news, settings } = useApp();
  const t = TRANSLATIONS[lang];
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [loadingDirectDoc, setLoadingDirectDoc] = useState(false);

  // Handle direct links to news via ?id=...
  useEffect(() => {
    const newsId = searchParams.get('id');
    if (newsId) {
      const found = news.find(n => n.id === newsId);
      if (found) {
        setSelectedNews(found);
      } else {
        const fetchDoc = async () => {
          setLoadingDirectDoc(true);
          try {
            const docRef = doc(db, 'news', newsId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setSelectedNews({ id: docSnap.id, ...docSnap.data() });
            }
          } catch (err) {
            console.error('Failed to fetch news article:', err);
          } finally {
            setLoadingDirectDoc(false);
          }
        };
        fetchDoc();
      }
    } else {
      setSelectedNews(null);
    }
  }, [searchParams, news]);

  // Sort news by date (newest first)
  const sortedNews = useMemo(() => {
    return [...news].sort((a, b) => {
      const dateA = a.date ? parseLocalDate(a.date).getTime() : 0;
      const dateB = b.date ? parseLocalDate(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [news]);

  // Featured / Lead article (most recent)
  const featuredNews = sortedNews[0];

  // Extract categories dynamically
  const categories = useMemo(() => {
    const cats = new Set<string>();
    news.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [news]);

  // Filtered news list
  const filteredNews = useMemo(() => {
    return sortedNews.filter(item => {
      const { title, content, category } = getNewsFields(item, lang);
      const matchesSearch = 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = 
        selectedCategory === 'all' || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sortedNews, searchQuery, selectedCategory, lang]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE) || 1;
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNews.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNews, currentPage]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return lang === 'bn' ? 'তারিখ পাওয়া যায়নি' : 'Date TBD';
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

  const handleShare = async (item: any) => {
    const fields = getNewsFields(item, lang);
    const shareUrl = `${window.location.origin}/#/news?id=${item.id}`;
    const text = `${fields.title}\n📅 ${formatDate(fields.date)}\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: fields.title, text, url: shareUrl });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(item.id);
      setTimeout(() => setCopyStatus(null), 3000);
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero Header */}
      <PageHero
        icon={<Newspaper size={20} />}
        badgeBn="সংবাদ ও প্রেস বার্তা"
        badgeEn="Press & Media Archive"
        titleBn="সংবাদ ও সামাজিক আপডেট"
        titleEn="News & Activity Updates"
        subtitleBn="আজাদী সমাজ কল্যাণ সংঘের সাম্প্রতিক সংবাদ, সামাজিক অর্জন, রিপোর্ট ও প্রেস বার্তা।"
        subtitleEn="Official news hub documenting our social welfare achievements, community reports, and relief operations."
        breadcrumbs={[
          { labelBn: "সংবাদ ও আপডেট", labelEn: "News & Updates" }
        ]}
      />

      {/* Detail View Modal / Section */}
      {selectedNews && (
        <div className="mb-16 p-6 sm:p-10 bg-white dark:bg-slate-900 rounded-4xl border-2 border-blue-600/30 dark:border-amber-400/30 shadow-heavy space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-600 dark:text-amber-400 tracking-widest">
                <Tag size={14} />
                <span>{getNewsFields(selectedNews, lang).category}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                {getNewsFields(selectedNews, lang).title}
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedNews(null);
                setSearchParams({});
              }}
              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar size={15} className="text-blue-600 dark:text-amber-400" />
              <span>{formatDate(getNewsFields(selectedNews, lang).date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={15} className="text-blue-600 dark:text-amber-400" />
              <span>{getNewsFields(selectedNews, lang).author}</span>
            </div>
          </div>

          {getNewsFields(selectedNews, lang).image && (
            <div className="rounded-3xl overflow-hidden max-h-[450px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <img
                src={getOptimizedImageUrl(getNewsFields(selectedNews, lang).image, 1000)}
                alt={getNewsFields(selectedNews, lang).title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={() => logImageLoadFailure(getNewsFields(selectedNews, lang).image, "News Detail")}
              />
            </div>
          )}

          <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-base sm:text-lg">
            <RichTextRenderer content={getNewsFields(selectedNews, lang).content} />
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => handleShare(selectedNews)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <Share2 size={16} />
              <span>{copyStatus === selectedNews.id ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'শেয়ার খবর' : 'Share Story')}</span>
            </button>
            <button
              onClick={() => {
                setSelectedNews(null);
                setSearchParams({});
              }}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase cursor-pointer"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close Article'}
            </button>
          </div>
        </div>
      )}

      {/* Featured Lead Story (If available and no active search) */}
      {!selectedNews && featuredNews && searchQuery === '' && selectedCategory === 'all' && (
        <div className="mb-16 group bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-4xl border border-blue-800/40 overflow-hidden shadow-heavy text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 h-72 sm:h-96 lg:h-full overflow-hidden relative bg-slate-950">
              {getNewsFields(featuredNews, lang).image ? (
                <img
                  src={getOptimizedImageUrl(getNewsFields(featuredNews, lang).image, 800)}
                  alt={getNewsFields(featuredNews, lang).title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={() => logImageLoadFailure(getNewsFields(featuredNews, lang).image, "Featured News")}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Newspaper size={64} className="opacity-40" />
                </div>
              )}
              <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                {lang === 'bn' ? 'সর্বশেষ বিশেষ সংবাদ' : 'Latest Featured Story'}
              </div>
            </div>

            <div className="lg:col-span-5 p-8 sm:p-12 space-y-6">
              <div className="flex items-center gap-3 text-xs font-black text-amber-300 uppercase tracking-widest">
                <Calendar size={14} />
                <span>{formatDate(getNewsFields(featuredNews, lang).date)}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight group-hover:text-amber-300 transition-colors">
                {getNewsFields(featuredNews, lang).title}
              </h2>

              <p className="text-slate-300 text-sm sm:text-base font-medium line-clamp-3 leading-relaxed opacity-90">
                {getNewsFields(featuredNews, lang).content.replace(/<[^>]*>?/gm, '')}
              </p>

              <button
                onClick={() => {
                  setSelectedNews(featuredNews);
                  setSearchParams({ id: featuredNews.id });
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer hover:scale-105"
              >
                <span>{lang === 'bn' ? 'সম্পূর্ণ খবর পড়ুন' : 'Read Full Story'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={lang === 'bn' ? 'সংবাদ খুঁজুন...' : 'Search news articles...'}
            className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {lang === 'bn' ? 'সব বিভাগ' : 'All Topics'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedNews.length > 0 ? (
          paginatedNews.map((item) => {
            const fields = getNewsFields(item, lang);
            const plainExcerpt = fields.content.replace(/<[^>]*>?/gm, '');

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-heavy transition-all duration-300 flex flex-col hover:-translate-y-2"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-950">
                  {fields.image ? (
                    <img
                      src={getOptimizedImageUrl(fields.image, 600)}
                      alt={fields.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={() => logImageLoadFailure(fields.image, "News Card")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900">
                      <Newspaper size={48} className="opacity-40" />
                    </div>
                  )}

                  <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                    {fields.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar size={14} className="text-blue-600 dark:text-amber-400" />
                      <span>{formatDate(fields.date)}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                      {fields.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                      {plainExcerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedNews(item);
                        setSearchParams({ id: item.id });
                      }}
                      className="inline-flex items-center gap-2 text-blue-700 dark:text-amber-400 font-black text-xs uppercase tracking-wider hover:gap-3 transition-all cursor-pointer group/btn"
                    >
                      <span>{lang === 'bn' ? 'বিস্তারিত দেখি' : 'Read More'}</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Share Article"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <Newspaper size={48} className="mx-auto text-slate-400 opacity-50" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'কোনো সংবাদ নিবন্ধ পাওয়া যায়নি' : 'No News Articles Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {lang === 'bn' ? 'অনুগ্রহ করে ভিন্ন অনুসন্ধানী শব্দ চেষ্টা করুন।' : 'Try adjusting your search criteria or topic filter.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-xs font-black text-slate-700 dark:text-slate-300 px-4">
            {lang === 'bn' ? `পৃষ্ঠা ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};
