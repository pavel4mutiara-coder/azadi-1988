import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { Shield, PhoneCall, MessageCircle, User, Users, Heart, Award } from 'lucide-react';
import { MemberImage } from '../components/MemberImage';
import { motion } from 'framer-motion';
import { SkeletonLoader } from '../components/SkeletonLoader';

// Staggered Entry Animation Variants for Sections
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 16,
    },
  },
};

export const Leadership: React.FC = () => {
  const { lang, leadership, settings, loadingLeadership } = useApp();
  const t = TRANSLATIONS[lang];

  // Helper to determine the effective category (handles backward-compatibility gracefully)
  const getCategory = (member: typeof leadership[0]): 'leader' | 'executive' | 'advisor' | 'volunteer' | 'member' => {
    if (member.category) return member.category;
    
    const dEn = (member.designationEn || '').toLowerCase();
    const dBn = (member.designationBn || '');
    if (
      dEn.includes('president') || 
      dEn.includes('chair') ||
      dBn.includes('সভাপতি')
    ) {
      return 'leader';
    }
    return 'executive'; // default fallback config
  };

  // Filter out inactive members & sort by order priority or serial number
  const sortedLeadership = [...leadership]
    .filter(l => l.status !== 'inactive')
    .sort((a, b) => (a.order || 999) - (b.order || 999));

  // Define Category Sections corresponding to the requested layout
  const sections = [
    {
      id: 'leader',
      titleBn: 'সভাপতি ও চেয়ারম্যান',
      titleEn: 'President / Chairman',
      descriptionBn: 'সংগঠনের মূল নেতৃত্ব প্রদানকারী ও দিকনির্দেশকবৃন্দ।',
      descriptionEn: 'The visionary core leaders guiding and steering our social goals.',
      icon: <Award className="text-amber-500 shrink-0" size={24} />
    },
    {
      id: 'executive',
      titleBn: 'কার্যকরী কমিটি',
      titleEn: 'Executive Committee',
      descriptionBn: 'সংগঠনের পরিকল্পনা ও কার্যক্রম বাস্তবায়নের ভারপ্রাপ্ত পরিষদ।',
      descriptionEn: 'The dedicated team coordinating daily operations and social development plans.',
      icon: <Shield className="text-emerald-500 shrink-0" size={24} />
    },
    {
      id: 'advisor',
      titleBn: 'উপদেষ্টা মণ্ডলী',
      titleEn: 'Advisors',
      descriptionBn: 'অভিজ্ঞ ব্যক্তিত্ব যারা আমাদের দিকনির্দেশনা ও সার্বিক সাহায্য করেন।',
      descriptionEn: 'Eminent advisors offering stellar advice and strategic support to our mission.',
      icon: <Award className="text-blue-500 shrink-0" size={24} />
    },
    {
      id: 'volunteer',
      titleBn: 'স্বেচ্ছাসেবকবৃন্দ',
      titleEn: 'Volunteers',
      descriptionBn: 'মানবতার কল্যাণে মাঠপর্যায়ে নিবেদিতপ্রাণ ও প্রাণবন্ত কর্মীদল।',
      descriptionEn: 'The relentless volunteers executing all aid campaigns with profound dedication.',
      icon: <Heart className="text-rose-500 shrink-0" size={24} />
    },
    {
      id: 'member',
      titleBn: 'সাধারণ সদস্যবৃন্দ (সদস্যবৃন্দ)',
      titleEn: 'General Members (সদস্যবৃন্দ)',
      descriptionBn: 'আমাদের সংগঠনের সম্মানীত সাধারণ সদস্য খতিয়ান যারা আমাদের চালিকাশক্তি।',
      descriptionEn: 'The proud general members of our family who anchor and power our initiatives.',
      icon: <Users className="text-purple-500 shrink-0" size={24} />
    }
  ];

  // Helper checking if a member card is considered "Vacant"
  const getIsVacant = (member: typeof leadership[0]): boolean => {
    const isVacantBn = member.nameBn === 'বর্তমানে খালি' || member.nameBn === 'খালি';
    const isVacantEn = member.nameEn === 'Vacant' || member.nameEn === 'Currently Vacant';
    return isVacantBn || isVacantEn;
  };

  // Determine if the whole page is empty
  const isPageEmpty = sortedLeadership.length === 0;

  return (
    <div className="space-y-16 sm:space-y-24 md:space-y-32 pb-24 bengali max-w-7xl mx-auto px-4 sm:px-6">
      {/* Banner/Header Section */}
      <div className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-[0.2em] text-[9.5px] md:text-[11px] px-6 py-2.5 bg-white dark:bg-slate-900 rounded-full border border-emerald-100 dark:border-emerald-800 shadow-soft">
          <Users size={14} className="text-emerald-500 shrink-0" />
          {lang === 'bn' ? 'আমাদের পরিবার' : 'Our Family Members'}
        </div>
        
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight drop-shadow-sm">
          {t.leadership}
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto">
          {lang === 'bn' 
            ? 'আমাদের পরিচালনা পর্ষদ, সম্মানিত উপদেষ্টা, সাহসী স্বেচ্ছাসেবক এবং সাধারণ সদস্যদের সম্মিলিত পরিবার।' 
            : 'The visionary Board, elite advisors, dedicated volunteers, and general members fueling our community projects.'}
        </p>
      </div>

      {loadingLeadership ? (
        <div className="space-y-16">
          <div className="space-y-4">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <SkeletonLoader variant="profile" count={4} />
        </div>
      ) : isPageEmpty ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
          <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'কোনো সদস্য খুঁজে পাওয়া যায়নি' : 'No Members Available'}
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            {lang === 'bn' 
              ? 'সদস্য তালিকা বর্তমানে খালি রয়েছে। নতুন সদস্য যুক্ত করতে অনুগ্রহ করে এডমিন ড্যাশবোর্ডে যান।' 
              : 'The member registry is currently empty. Please add members via the Admin Dashboard.'}
          </p>
        </div>
      ) : (
        <div className="space-y-20 sm:space-y-28 md:space-y-36">
          {sections.map((section) => {
            const sectionMembers = sortedLeadership.filter(l => getCategory(l) === section.id);

            // Hide empty section cleanly (Empty State Requirement)
            if (sectionMembers.length === 0) return null;

            return (
              <div key={section.id} className="space-y-10">
                {/* Section Title with custom visuals & helper description */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 flex items-center justify-center">
                      {section.icon}
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
                      {lang === 'bn' ? section.titleBn : section.titleEn}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent ml-4"></div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium">
                    {lang === 'bn' ? section.descriptionBn : section.descriptionEn}
                  </p>
                </div>

                {/* Staggered Cards Grid */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 equal-heights w-full max-w-full overflow-hidden sm:overflow-visible"
                >
                  {sectionMembers.map((leader) => {
                    const isVacant = getIsVacant(leader);
                    
                    // Fallbacks for empty/missing values (Requirement details)
                    const name = (lang === 'bn' ? leader.nameBn : leader.nameEn) || (lang === 'bn' ? 'নাম পাওয়া যায়নি' : 'Name not found');
                    const designation = (lang === 'bn' ? leader.designationBn : leader.designationEn) || (lang === 'bn' ? 'সদস্য' : 'Member');
                    const subDesignation = lang === 'bn' ? leader.subDesignationBn : leader.subDesignationEn;
                    const message = lang === 'bn' ? leader.messageBn : leader.messageEn;

                    return (
                      <motion.div
                        key={leader.id}
                        variants={itemVariants}
                        className={`bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-6 md:p-8 shadow-soft hover:-translate-y-2 hover:shadow-heavy transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center w-full max-w-full ${isVacant ? 'opacity-50 saturate-50 bg-slate-50/50 dark:bg-slate-950/20' : ''}`}
                      >
                        {/* Dynamic decorative backdrop circles to avoid layout shifts */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-bl-[2rem]"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
                        
                        {/* Member Image Avatar */}
                        <div className="relative mb-5 flex-shrink-0">
                          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 ${isVacant ? 'border-slate-200 dark:border-slate-800' : 'border-emerald-500/10 hover:border-emerald-500'} bg-white dark:bg-slate-950 p-1 shadow-soft flex items-center justify-center transition-colors duration-300`}>
                            <MemberImage 
                              src={leader.image} 
                              alt={name} 
                              fallbackSrc={settings.logo}
                              isVacant={isVacant}
                            />
                          </div>
                          {!isVacant && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-600 dark:bg-emerald-500 text-white p-2 rounded-xl shadow-heavy ring-4 ring-white dark:ring-slate-900 transition-transform">
                              <Shield size={14} />
                            </div>
                          )}
                        </div>
                        
                        {/* Text details (Flex-1 to force same card height grids easily) */}
                        <div className="space-y-2.5 mb-5 flex-1 w-full flex flex-col items-center">
                          <h3 className={`text-base sm:text-lg font-black ${isVacant ? 'text-slate-400' : 'text-slate-900 dark:text-white'} leading-tight break-words max-w-full`}>
                            {name}
                          </h3>
                          
                          <div className="space-y-1 w-full shrink-0">
                            <div className={`inline-block px-3 py-1 rounded-xl ${isVacant ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'} font-black text-[8.5px] uppercase tracking-wider border ${isVacant ? 'border-slate-200 dark:border-slate-800' : 'border-emerald-100/60 dark:border-emerald-800/60'} break-words max-w-full`}>
                              {designation}
                            </div>
                            {subDesignation && (
                              <div className="text-[10px] font-bold text-slate-400 italic break-words max-w-full">
                                {subDesignation}
                              </div>
                            )}
                          </div>

                          {/* Message / Quote block with correct dynamic layout constraints */}
                          {!isVacant && message && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic pt-3 border-t border-slate-50 dark:border-slate-850 w-full mt-auto break-words">
                              <p className="line-clamp-3">
                                "{message}"
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Phone action link */}
                        {!isVacant && leader.phone && (
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 w-full flex justify-center shrink-0">
                            <a 
                              href={`tel:${leader.phone}`} 
                              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-mono font-black text-[11px] tracking-wide bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-150 dark:border-slate-800 hover:border-emerald-500 max-w-full truncate"
                            >
                              <PhoneCall size={12} className="text-emerald-600 shrink-0" />
                              <span className="truncate">{leader.phone}</span>
                            </a>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
