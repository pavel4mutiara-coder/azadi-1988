import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { 
  Users, Award, Phone, Mail, Search, ShieldCheck, 
  Check, Info, User, ChevronRight, Star, Heart
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

  // Sort leadership items by order
  const sortedLeadership = useMemo(() => {
    return [...leadership].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [leadership]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    leadership.forEach(m => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }, [leadership]);

  // Filtered list
  const filteredLeadership = useMemo(() => {
    return sortedLeadership.filter(m => {
      const nameBn = m.nameBn || '';
      const nameEn = m.nameEn || '';
      const designationBn = m.designationBn || '';
      const designationEn = m.designationEn || '';

      const matchesSearch = 
        nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        designationBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        designationEn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'all' || m.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [sortedLeadership, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero */}
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

      {/* Filter Tabs & Search Bar */}
      <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {selectedCategory === 'all' && <Check size={14} className="text-amber-400" />}
            <span>{lang === 'bn' ? `সকল সদস্য (${sortedLeadership.length})` : `All Members (${sortedLeadership.length})`}</span>
          </button>

          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {selectedCategory === cat && <Check size={14} className="text-amber-400" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'সদস্য খুঁজুন...' : 'Search leadership...'}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Leadership Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loadingLeadership ? (
          <div className="col-span-full">
            <SkeletonLoader variant="card" count={4} />
          </div>
        ) : filteredLeadership.length > 0 ? (
          filteredLeadership.map((member) => {
            const name = lang === 'bn' ? member.nameBn : member.nameEn;
            const designation = lang === 'bn' ? member.designationBn : member.designationEn;
            const bio = lang === 'bn' ? member.bioBn : member.bioEn;

            return (
              <div
                key={member.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-soft hover:shadow-heavy transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden hover:-translate-y-2"
              >
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-700 via-blue-500 to-amber-500 opacity-80" />

                {/* Portrait Frame */}
                <div className="relative mt-4 mb-6">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-blue-600/20 dark:border-amber-400/20 shadow-lg group-hover:scale-105 transition-transform duration-500 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                    <MemberImage
                      src={member.image || (member as any).photo}
                      alt={name}
                      widthPreset="medium"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {member.category && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-slate-900 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md whitespace-nowrap border border-amber-400/30">
                      {member.category}
                    </span>
                  )}
                </div>

                {/* Member Details */}
                <div className="space-y-2 flex-1 w-full flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                      {name}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-amber-400 uppercase tracking-wider">
                      {designation}
                    </p>
                  </div>

                  {bio && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3 pt-2">
                      {bio}
                    </p>
                  )}

                  {/* Contact Links */}
                  {(member.phone || member.email) && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3">
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          title={`Call ${name}`}
                          className="p-2.5 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-amber-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                        >
                          <Phone size={15} />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          title={`Email ${name}`}
                          className="p-2.5 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-amber-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                        >
                          <Mail size={15} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <Users size={48} className="mx-auto text-slate-400 opacity-50" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'কোনো সদস্য পাওয়া যায়নি' : 'No Leadership Members Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {lang === 'bn' ? 'অনুগ্রহ করে ভিন্ন অনুসন্ধানী শব্দ ব্যবহার করুন।' : 'Try searching for another name or category.'}
            </p>
          </div>
        )}
      </div>

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};
