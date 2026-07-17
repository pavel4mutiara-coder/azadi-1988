import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { 
  Newspaper, Calendar, ArrowRight, Share2, ChevronRight, 
  X, CheckCircle, Clock 
} from 'lucide-react';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { parseLocalDate } from '../utils/parseLocalDate';
import { RichTextRenderer } from '../components/RichTextRenderer';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { normalizeGoogleDriveImage } from '../utils/normalizeGoogleDriveImage';
import { logImageLoadFailure } from '../utils/imageMonitor';

// Helper function to extract fields from a news item (for robustness/resilience)
const getNewsFields = (item: any, lang: 'bn' | 'en') => {
  if (!item) return null;
  const title = lang === 'bn' 
    ? (item.titleBn || item.title || item.titleEn || '') 
    : (item.titleEn || item.title || item.titleBn || '');
  const content = lang === 'bn' 
    ? (item.contentBn || item.content || item.contentEn || '') 
    : (item.contentEn || item.content || item.contentBn || '');
  const image = item.image || item.imageUrl || '';
  const date = item.date || item.createdAt || '';
  const status = item.status || 'published';
  return { title, content, image, date, status };
};

// Direct image link formatter (for Google Drive, Firebase Storage, HTTPS)
const getDirectImageUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Parse Google Drive links with the robust system utility
  if (/drive\.google\.com/i.test(trimmed)) {
    return normalizeGoogleDriveImage(trimmed);
  }
  
  // Append cache-busting query parameter for standard HTTP/HTTPS/Firebase Storage URLs
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.set('t', String(Date.now()));
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }
  
  return trimmed;
};

// Stateful featured image component with error logging and clean fallback
const FeaturedImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = '' }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
      setImageSrc(getDirectImageUrl(src));
      setHasError(false);
    } else {
      setHasError(true);
    }
  }, [src]);

  if (hasError || !imageSrc) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-850 text-slate-400 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 ${className}`}>
        <Newspaper size={48} className="opacity-40 animate-pulse text-emerald-500" />
        <span className="text-xs font-bold mt-2 opacity-60">Image Unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={(e) => {
        console.error("Featured image failed to load:", src, e);
        logImageLoadFailure(imageSrc, `FeaturedImage (${alt})`);
        setHasError(true);
      }}
    />
  );
};

export const NewsPage: React.FC = () => {
  const { lang, news, settings } = useApp();
  const t = TRANSLATIONS[lang];
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Simulate or sync loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [news]);

  // Handle direct links or detail state through URL Search Params
  useEffect(() => {
    const newsId = searchParams.get('id');
    setNotFound(false);
    if (newsId) {
      const found = news.find(n => n.id === newsId);
      if (found) {
        setSelectedNews(found);
        // Scroll to the top smoothly when viewing full content
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Retrieve the complete article from Firestore using its document ID
        const fetchArticleDirectly = async () => {
          setDetailLoading(true);
          try {
            console.log(`Retrieving complete article from Firestore with ID: ${newsId}`);
            const docRef = doc(db, 'news', newsId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setSelectedNews({ id: docSnap.id, ...docSnap.data() });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              console.warn(`No news document found for ID: ${newsId}`);
              setSelectedNews(null);
              setNotFound(true);
            }
          } catch (err) {
            console.error("Error retrieving news article from Firestore:", err);
            setSelectedNews(null);
            setNotFound(true);
          } finally {
            setDetailLoading(false);
          }
        };
        fetchArticleDirectly();
      }
    } else {
      setSelectedNews(null);
      setNotFound(false);
    }
  }, [searchParams, news]);

  // Sort and filter news by date (newest first) with robust malformed document skipping
  const sortedNews = useMemo(() => {
    try {
      return [...news]
        .filter(n => {
          if (!n || typeof n !== 'object' || !n.id) return false;
          const fields = getNewsFields(n, lang);
          if (!fields) return false;
          // Hide drafts, keeping published and missing-status fields as published
          return fields.status !== 'draft';
        })
        .sort((a, b) => {
          try {
            const fieldsA = getNewsFields(a, lang);
            const fieldsB = getNewsFields(b, lang);
            const dateA = fieldsA?.date || fieldsA?.createdAt || '';
            const dateB = fieldsB?.date || fieldsB?.createdAt || '';
            
            const timeA = dateA ? parseLocalDate(dateA).getTime() : 0;
            const timeB = dateB ? parseLocalDate(dateB).getTime() : 0;
            return timeB - timeA;
          } catch (e) {
            console.warn("Error parsing dates for news sorting:", e);
            return 0;
          }
        });
    } catch (err) {
      console.error("Critical error in sortedNews useMemo:", err);
      return [];
    }
  }, [news, lang]);

  const handleShare = async (item: any) => {
    const fields = getNewsFields(item, lang);
    if (!fields) return;

    const shareTitle = fields.title;
    const dateStr = parseLocalDate(fields.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    // Strip HTML/Markdown for a clean plain-text short description
    const cleanDesc = fields.content.replace(/<[^>]*>/g, '').replace(/[*#_`[\]()]/g, '').slice(0, 120).trim();
    const shortDesc = cleanDesc ? `${cleanDesc}...` : '';

    const shareUrl = `${window.location.origin}/#/news?id=${item.id}`;
    const fullMessage = `📰 *${shareTitle}*\n📅 ${dateStr}\n\n${shortDesc}\n\n${lang === 'bn' ? 'বিস্তারিত খবরটি পড়তে নিচে ক্লিক করুন' : 'Read full news article here'}:\n🔗 ${shareUrl}\n\n— ${lang === 'bn' ? settings?.nameBn : settings?.nameEn}`;

    console.log(`Initiating sharing flow for article ID: ${item.id}`);

    // Android (Capacitor): Use native share API
    if (Capacitor.isNativePlatform()) {
      try {
        console.log("Attempting Capacitor Native Share...");
        await Share.share({
          title: shareTitle,
          text: fullMessage,
          url: shareUrl,
          dialogTitle: lang === 'bn' ? 'সংবাদ শেয়ার করুন' : 'Share News Update',
        });
        console.log("Capacitor Native Share completed successfully.");
        return;
      } catch (err) {
        console.error('Capacitor native sharing failed:', err);
      }
    }

    // Web: Use Web Share API
    if (navigator.share) {
      try {
        console.log("Attempting Web Share API...");
        await navigator.share({
          title: shareTitle,
          text: fullMessage,
          url: shareUrl,
        });
        console.log("Web Share API completed successfully.");
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Web share API failed:', err);
        } else {
          console.log("Web Share API was cancelled by the user.");
          return; // Cancelled by user
        }
      }
    }

    // Fallback: Copy to clipboard and display a success toast
    try {
      console.log("Web Share unavailable or failed. Falling back to clipboard copy.");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullMessage);
        showToast(lang === 'bn' ? 'লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Link copied to clipboard!');
      } else {
        // Document command copy fallback for non-secure contexts/iframes/webview elements
        const textArea = document.createElement("textarea");
        textArea.value = fullMessage;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (success) {
          showToast(lang === 'bn' ? 'লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Link copied to clipboard!');
        } else {
          throw new Error("execCommand returned false");
        }
      }
    } catch (err) {
      console.error('Clipboard copy fallback failed:', err);
      showToast(lang === 'bn' ? 'শেয়ার করতে ব্যর্থ হয়েছে!' : 'Failed to share!');
    }
  };

  const handleOpenNews = (item: any) => {
    setSearchParams({ id: item.id });
  };

  const handleCloseDetail = () => {
    setSearchParams({});
  };

  const selectedFields = selectedNews ? getNewsFields(selectedNews, lang) : null;

  return (
    <div className="space-y-16 pb-24 bengali select-none">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs sm:text-sm uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-300 border border-emerald-500/20">
          <CheckCircle size={18} className="text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Loading direct detail view from Firestore */}
      {notFound ? (
        <div id="article-not-found-container" className="max-w-xl mx-auto py-24 text-center space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-850 shadow-heavy animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-rose-500/10 dark:bg-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-500/20 animate-bounce">
            <Newspaper size={40} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white leading-tight">
              {lang === 'bn' ? 'নিবন্ধটি পাওয়া যায়নি' : 'Article Not Found'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
              {lang === 'bn' 
                ? 'দুঃখিত, আপনি যে সংবাদটি খুঁজছেন তা খুঁজে পাওয়া যায়নি বা মুছে ফেলা হয়েছে।' 
                : 'Sorry, the news article you are looking for does not exist or has been removed.'}
            </p>
          </div>
          <button
            onClick={handleCloseDetail}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <ArrowRight size={16} className="rotate-180" />
            <span>{lang === 'bn' ? 'সকল খবরে ফিরে যান' : 'Back to All News'}</span>
          </button>
        </div>
      ) : detailLoading ? (
        <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            {lang === 'bn' ? 'খবর লোড করা হচ্ছে...' : 'Loading complete article...'}
          </p>
        </div>
      ) : selectedNews && selectedFields ? (
        /* Detail View Mode */
        <div id="news-details-section" className="space-y-12 animate-in fade-in duration-500">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm px-2">
            <button onClick={handleCloseDetail} className="hover:text-emerald-600 transition-colors cursor-pointer">
              {lang === 'bn' ? 'খবর ও আপডেট' : 'News & Updates'}
            </button>
            <ChevronRight size={14} />
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px] sm:max-w-md">
              {selectedFields.title}
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Main Content Area */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-850 p-6 sm:p-10 md:p-12 shadow-heavy space-y-8">
              
              {/* Cover Image */}
              {selectedFields.image && (
                <div className="rounded-3xl overflow-hidden shadow-soft border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-[16/9]">
                  <FeaturedImage 
                    src={selectedFields.image} 
                    alt="Cover highlight" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}

              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full">
                  <Calendar size={14} /> 
                  <span>
                    {selectedFields.date ? parseLocalDate(selectedFields.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-full">
                  <Clock size={14} />
                  <span>{lang === 'bn' ? 'আজাদী আপডেট' : 'Azadi Update'}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-950 dark:text-white leading-[1.25] tracking-tight text-left bengali">
                {selectedFields.title}
              </h1>

              {/* Rich-Text content */}
              <div className="pt-2">
                <RichTextRenderer content={selectedFields.content} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleShare(selectedNews)}
                  className="px-8 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/10 cursor-pointer"
                >
                  <Share2 size={18} />
                  <span>
                    {lang === 'bn' ? 'সংবাদ শেয়ার করুন' : 'Share News'}
                  </span>
                </button>

                <button
                  onClick={handleCloseDetail}
                  className="px-8 py-4 sm:py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <X size={18} />
                  <span>{lang === 'bn' ? 'তালিকায় ফিরুন' : 'Back to News'}</span>
                </button>
              </div>
            </div>

            {/* Sidebar with other recent news updates */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-850 p-6 sm:p-8 shadow-heavy space-y-6">
                <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl border-b border-slate-100 dark:border-slate-850 pb-4">
                  {lang === 'bn' ? 'অন্যান্য খবরসমূহ' : 'More Updates'}
                </h3>
                
                <div className="space-y-5">
                  {sortedNews.filter(n => n.id !== selectedNews.id).slice(0, 5).map(other => {
                    const otherFields = getNewsFields(other, lang);
                    if (!otherFields) return null;

                    return (
                      <button 
                        key={other.id}
                        onClick={() => handleOpenNews(other)}
                        className="w-full text-left flex gap-4 group/item hover:bg-slate-50 dark:hover:bg-slate-850/50 p-2 rounded-2xl transition-colors cursor-pointer"
                      >
                        {otherFields.image && (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 dark:border-slate-800">
                            <FeaturedImage src={otherFields.image} alt="Thumbnail" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" />
                          </div>
                        )}
                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-[10px] font-black text-slate-400 block uppercase">
                            {parseLocalDate(otherFields.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                          </span>
                          <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm leading-snug line-clamp-2 group-hover/item:text-emerald-600 transition-colors bengali">
                            {otherFields.title}
                          </h4>
                        </div>
                      </button>
                    );
                  })}

                  {sortedNews.filter(n => n.id !== selectedNews.id).length === 0 && (
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 py-4 text-center">
                      {lang === 'bn' ? 'কোনো অতিরিক্ত খবর নেই।' : 'No other updates available.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View Mode */
        <div className="space-y-16 animate-in fade-in duration-500">
          
          {/* Header section with cover */}
          <section className="relative py-20 px-8 bg-emerald-950 dark:bg-slate-900 rounded-[3rem] text-center overflow-hidden border border-emerald-800 dark:border-slate-800 shadow-heavy">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabic-bazazz.png')]"></div>
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-emerald-400/30">
                <Newspaper size={40} className="text-emerald-400" />
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tighter">
                {t.news}
              </h1>
              <p className="text-emerald-100/70 font-medium max-w-2xl mx-auto text-base sm:text-xl bengali opacity-90">
                {lang === 'bn' 
                  ? 'আজাদী সমাজ কল্যাণ সংঘের কার্যক্রম, সাম্প্রতিক উন্নয়ন ও কার্যক্রমের নির্ভরযোগ্য সংবাদ ও আপডেটসমূহ।' 
                  : 'Reliable news, developments, and operational updates of Azadi Social Welfare Organization.'}
              </p>
            </div>
          </section>

          {/* List of News Grid */}
          <div className="container mx-auto px-2">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SkeletonLoader count={3} height="h-64" />
              </div>
            ) : sortedNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedNews.map((n) => {
                  const fields = getNewsFields(n, lang);
                  if (!fields) return null;

                  const plainText = fields.content
                    .replace(/<[^>]*>/g, '')
                    .replace(/[*#_`[\]()]/g, '');
                  const shortPreview = plainText.slice(0, 150) + (plainText.length > 150 ? '...' : '');

                  return (
                    <div 
                      key={n.id} 
                      className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-emerald-50/50 dark:border-slate-800/80 overflow-hidden shadow-soft hover:shadow-heavy hover:-translate-y-2 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        {/* Cover image banner */}
                        <div className="relative h-60 overflow-hidden bg-slate-100 dark:bg-slate-950">
                          {fields.image ? (
                            <FeaturedImage 
                              src={fields.image} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                              alt="Cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-emerald-100 bg-emerald-50/20 dark:bg-slate-950">
                              <Newspaper size={48} />
                            </div>
                          )}
                          <div className="absolute top-5 left-5 bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                            {lang === 'bn' ? 'আপডেট' : 'Update'}
                          </div>
                        </div>

                        {/* Text and context details */}
                        <div className="p-8 space-y-4">
                          <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            <Calendar size={14} className="text-emerald-500" /> 
                            <span>
                              {fields.date ? parseLocalDate(fields.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </span>
                          </div>
                          <h3 onClick={() => handleOpenNews(n)} className="font-black text-slate-900 dark:text-white text-xl leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors bengali cursor-pointer">
                            {fields.title}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed line-clamp-3 bengali">
                            {shortPreview}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons footer inside card */}
                      <div className="px-8 pb-8 pt-2 flex items-center justify-between">
                        <button 
                          onClick={() => handleOpenNews(n)}
                          className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-[11px] uppercase tracking-widest hover:gap-4 transition-all w-fit cursor-pointer"
                        >
                          <span>{lang === 'bn' ? 'আরও পড়ুন' : 'Read More'}</span>
                          <ArrowRight size={16} />
                        </button>

                        <button
                          onClick={() => handleShare(n)}
                          className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-400 rounded-xl transition-all cursor-pointer"
                          title={lang === 'bn' ? 'শেয়ার করুন' : 'Share'}
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="col-span-full py-24 text-center bg-emerald-50/20 dark:bg-slate-950/50 rounded-[4rem] border border-dashed border-emerald-200 space-y-6 opacity-60">
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-soft">
                  <Newspaper size={40} className="text-emerald-200 dark:text-emerald-800" />
                </div>
                <p className="font-black text-slate-400 text-lg bengali">
                  {lang === 'bn' ? 'বর্তমানে কোনো সংবাদ নেই।' : 'No news updates available.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
