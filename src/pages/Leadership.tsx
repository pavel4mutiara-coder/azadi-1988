import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { 
  Users, Award, Phone, Mail, Search,
  Check, Info, User, ChevronRight, ShieldCheck, Heart, Sparkles
} from 'lucide-react';
import { MemberImage } from '../components/MemberImage';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { PageHero } from '../components/PageHero';
import { PageCTA } from '../components/PageCTA';

export const Leadership: React.FC = () => {
  const { lang, leadership, loadingLeadership } = useApp();
  const t = TRANSLATIONS[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter out inactive members for public display and sort by order
  const activeLeadership = useMemo(() => {
    return leadership
      .filter(m => m.status !== 'inactive')
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [leadership]);

  // Extract unique categories present in the active leadership list
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    activeLeadership.forEach(m => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }, [activeLeadership]);

  // Helper for human-readable category titles in Bengali and English
  const getCategoryLabel = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'leader':
        return lang === 'bn' ? 'পরিচালনা পর্ষদ' : 'Executive Committee';
      case 'executive':
        return lang === 'bn' ? 'কার্যনির্বাহী সদস্য' : 'Executive Members';
      case 'advisor':
        return lang === 'bn' ? 'উপদেষ্টা পরিষদ' : 'Advisory Council';
      case 'volunteer':
        return lang === 'bn' ? 'স্বেচ্ছাসেবক' : 'Volunteers';
      case 'member':
        return lang === 'bn' ? 'সাধারণ সদস্য' : 'General Members';
      default:
        return cat;
    }
  };

  // Filter members by category and search query
  const filteredLeadership = useMemo(() => {
    return activeLeadership.filter(m => {
      const nameBn = m.nameBn || '';
      const nameEn = m.nameEn || '';
      const designationBn = m.designationBn || '';
      const designationEn = m.designationEn || '';

      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || 
        nameBn.toLowerCase().includes(query) ||
        nameEn.toLowerCase().includes(query) ||
        designationBn.toLowerCase().includes(query) ||
        designationEn.toLowerCase().includes(query);

      const matchesCategory = 
        selectedCategory === 'all' || m.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeLeadership, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500 overflow-x-hidden">
      {/* Page Hero Header */}
      <PageHero
        icon={<Users size={20} />}
        badgeBn="সংস্থার পরিচালনা পর্ষদ"
        badgeEn="Executive Leadership"
        titleBn="নেতৃবৃন্দ ও পরিচালনা পর্ষদ"
        titleEn="Leadership & Executive Body"
        subtitleBn="১৯৮৮ সাল থেকে আজাদী সমাজ কল্যাণ সংঘের সততা, নিষ্ঠা ও দূরদর্শী দিকনির্দেশনায় নিয়োজিত কর্মীবৃন্দ।"
        subtitleEn="Guiding our organization since 1988 with dedication, social integrity, and commitment to community welfare."
        breadcrumbs={[
          { labelBn: "নেতৃবৃন্দ", labelEn: "Leadership" }
        ]}
      />

      {/* Filter Tabs & Search Control Container */}
      <div className="mb-10 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {selectedCategory === 'all' && <Check size={14} className="text-amber-400" />}
            <span>
              {lang === 'bn' 
                ? `সকল সদস্য (${activeLeadership.length})` 
                : `All Members (${activeLeadership.length})`}
            </span>
          </button>

          {availableCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {selectedCategory === cat && <Check size={14} className="text-amber-400" />}
              <span>{getCategoryLabel(cat)}</span>
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'সদস্য বা পদবী দিয়ে খুঁজুন...' : 'Search by name or title...'}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Leadership Member Cards Grid */}
      {loadingLeadership ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          <SkeletonLoader variant="card" count={8} />
        </div>
      ) : filteredLeadership.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredLeadership.map((member) => {
            const rawNameBn = member.nameBn || '';
            const rawNameEn = member.nameEn || '';
            const isVacant = rawNameEn === 'Currently Vacant' || rawNameBn === 'বর্তমানে খালি' || (!rawNameBn && !rawNameEn);

            const displayName = isVacant
              ? (lang === 'bn' ? 'খালি পদ' : 'Vacant Position')
              : (lang === 'bn' ? rawNameBn : rawNameEn);

            const designation = lang === 'bn' ? member.designationBn : member.designationEn;
            const subDesignation = lang === 'bn' ? member.subDesignationBn : member.subDesignationEn;
            const message = lang === 'bn' ? member.messageBn : member.messageEn;
            const imageUrl = member.image || (member as any).photo;

            return (
              <div
                key={member.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-amber-500" />

                {/* Portrait Frame */}
                <div className="relative mt-2 mb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-blue-600/20 dark:border-amber-400/20 group-hover:border-blue-600 dark:group-hover:border-amber-400 shadow-md group-hover:scale-105 transition-all duration-300 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                    <MemberImage
                      src={imageUrl}
                      alt={displayName}
                      isVacant={isVacant}
                      widthPreset="medium"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {member.category && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-slate-900 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md whitespace-nowrap border border-amber-400/30">
                      {getCategoryLabel(member.category)}
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 w-full flex flex-col justify-between space-y-3 mt-1">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-amber-400 transition-colors leading-tight">
                      {displayName}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-amber-400 uppercase tracking-wide">
                      {designation}
                    </p>
                    {subDesignation && (
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {subDesignation}
                      </p>
                    )}
                  </div>

                  {message && !isVacant && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed italic pt-2 border-t border-slate-100 dark:border-slate-800">
                      "{message}"
                    </p>
                  )}

                  {/* Direct Contact Links */}
                  {(member.phone || (member as any).email) && !isVacant && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          title={`Call ${displayName}`}
                          className="p-2 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-amber-400 rounded-xl hover:bg-blue-700 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 transition-all cursor-pointer"
                        >
                          <Phone size={14} />
                        </a>
                      )}
                      {(member as any).email && (
                        <a
                          href={`mailto:${(member as any).email}`}
                          title={`Email ${displayName}`}
                          className="p-2 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-amber-400 rounded-xl hover:bg-blue-700 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 transition-all cursor-pointer"
                        >
                          <Mail size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <Users size={48} className="mx-auto text-slate-400 opacity-50" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {lang === 'bn' ? 'কোনো সদস্য পাওয়া যায়নি' : 'No Leadership Members Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {lang === 'bn' ? 'অনুগ্রহ করে ভিন্ন অনুসন্ধানী শব্দ বা ক্যাটাগরি ব্যবহার করুন।' : 'Try searching for another name or selecting a different category.'}
          </p>
        </div>
      )}

      {/* Bottom Institutional CTA */}
      <PageCTA />
    </div>
  );
};

