import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { 
  BellRing, Calendar, AlertTriangle, FileText, Download, Share2, 
  CheckCircle, Search, Filter, ShieldCheck, Tag, Check
} from 'lucide-react';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { parseLocalDate } from '../utils/parseLocalDate';
import { PageHero } from '../components/PageHero';
import { PageCTA } from '../components/PageCTA';

export const Notices: React.FC = () => {
  const { lang, notices, settings, loadingNotices } = useApp();
  const t = TRANSLATIONS[lang];
  const [searchParams] = useSearchParams();

  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'general'>('all');

  // Highlight/scroll to notice if ?id=... present in URL
  useEffect(() => {
    const noticeId = searchParams.get('id');
    if (noticeId && notices.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(noticeId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-amber-500', 'scale-[1.01]');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-amber-500', 'scale-[1.01]');
          }, 3000);
        }
      }, 300);
    }
  }, [searchParams, notices]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return lang === 'bn' ? 'তারিখ নির্ধারিত নয়' : 'Date TBD';
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

  const handleShare = async (notice: any) => {
    const title = lang === 'bn' ? notice.titleBn : notice.titleEn;
    const shareUrl = `${window.location.origin}/#/notices?id=${notice.id}`;
    const text = `📢 *${title}*\n📅 ${formatDate(notice.date)}\n\nRead notice: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(notice.id);
      setTimeout(() => setCopyStatus(null), 3000);
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // Sort & filter notices
  const sortedNotices = useMemo(() => {
    return Array.isArray(notices)
      ? [...notices].sort((a, b) => parseLocalDate(b.date || 0).getTime() - parseLocalDate(a.date || 0).getTime())
      : [];
  }, [notices]);

  const filteredNotices = useMemo(() => {
    return sortedNotices.filter((n) => {
      const title = (lang === 'bn' ? n.titleBn : n.titleEn) || '';
      const content = (lang === 'bn' ? n.contentBn : n.contentEn) || '';
      const matchesSearch = 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeTab === 'urgent') return matchesSearch && n.isUrgent;
      if (activeTab === 'general') return matchesSearch && !n.isUrgent;
      return matchesSearch;
    });
  }, [sortedNotices, searchQuery, activeTab, lang]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero */}
      <PageHero
        icon={<BellRing size={20} />}
        badgeBn="অফিসিয়াল বিজ্ঞপ্তি"
        badgeEn="Official Announcements"
        titleBn="বিজ্ঞপ্তি বোর্ড"
        titleEn="Notice Board & Directives"
        subtitleBn="আজাদী সমাজ কল্যাণ সংঘের অফিসিয়াল বিজ্ঞপ্তি, নির্দেশনাবলী ও জরুরি তথ্যাবলী।"
        subtitleEn="Official circulars, general notices, and administrative directives published by the Executive Body."
        breadcrumbs={[
          { labelBn: "বিজ্ঞপ্তি বোর্ড", labelEn: "Notice Board" }
        ]}
      />

      {/* Filter Tabs & Search Bar */}
      <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { key: 'all', labelBn: 'সকল বিজ্ঞপ্তি', labelEn: 'All Notices' },
            { key: 'urgent', labelBn: 'জরুরি বিজ্ঞপ্তি', labelEn: 'Urgent Notices' },
            { key: 'general', labelBn: 'সাধারণ বিজ্ঞপ্তি', labelEn: 'General Notices' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {activeTab === tab.key && <Check size={14} className="text-amber-400" />}
              <span>{lang === 'bn' ? tab.labelBn : tab.labelEn}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'বিজ্ঞপ্তি খুঁজুন...' : 'Search notices...'}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-6">
        {loadingNotices ? (
          <SkeletonLoader variant="notice" count={3} />
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice, idx) => {
            const title = lang === 'bn' ? notice.titleBn : notice.titleEn;
            const content = lang === 'bn' ? notice.contentBn : notice.contentEn;

            return (
              <div
                key={notice.id}
                id={notice.id}
                className={`group transition-all duration-300 rounded-3xl border p-6 sm:p-8 bg-white dark:bg-slate-900 shadow-soft hover:shadow-heavy relative overflow-hidden ${
                  notice.isUrgent
                    ? 'border-amber-500/50 dark:border-amber-500/40 bg-amber-500/5'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Official Gold Left Indicator Line for Important Notices */}
                <div className={`absolute top-0 left-0 bottom-0 w-2 ${
                  notice.isUrgent ? 'bg-amber-500' : 'bg-blue-700 dark:bg-blue-500'
                }`} />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-2">
                  <div className="space-y-4 flex-1">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.isUrgent ? (
                        <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[11px] font-black uppercase rounded-full flex items-center gap-1 shadow-sm">
                          <AlertTriangle size={12} />
                          {lang === 'bn' ? 'জরুরি বিজ্ঞপ্তি' : 'Urgent Directive'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-black uppercase rounded-full flex items-center gap-1">
                          <ShieldCheck size={12} />
                          {lang === 'bn' ? 'সাধারণ বিজ্ঞপ্তি' : 'Official Circular'}
                        </span>
                      )}

                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        NO #{sortedNotices.length - idx}
                      </span>
                    </div>

                    {/* Notice Title */}
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors">
                      {title}
                    </h2>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <Calendar size={14} className="text-blue-600 dark:text-amber-400" />
                      <span>{formatDate(notice.date)}</span>
                    </div>

                    {/* Content */}
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line opacity-95">
                      {content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center md:flex-col gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    {notice.attachmentUrl && (
                      <a
                        href={notice.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        <span>{lang === 'bn' ? 'ডাউনলোড' : 'Download PDF'}</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleShare(notice)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copyStatus === notice.id ? (
                        <CheckCircle size={14} className="text-emerald-500" />
                      ) : (
                        <Share2 size={14} />
                      )}
                      <span>{copyStatus === notice.id ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'শেয়ার' : 'Share')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <BellRing size={48} className="mx-auto text-slate-400 opacity-50" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'কোনো বিজ্ঞপ্তি পাওয়া যায়নি' : 'No Notices Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {lang === 'bn' ? 'কোনো বিজ্ঞপ্তি প্রকাশিত হলে তা এখানে দেখানো হবে।' : 'New notices published by the board will appear here.'}
            </p>
          </div>
        )}
      </div>

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};
