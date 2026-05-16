
import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { ShieldCheck, PhoneCall, MessageCircle, User } from 'lucide-react';

export const Leadership: React.FC = () => {
  const { lang, leadership, settings } = useApp();
  const t = TRANSLATIONS[lang];

  const sortedLeadership = [...leadership]
    .filter(l => l.status !== 'inactive')
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  // Define Groups for Professional Display
  const groups = [
    { title: lang === 'bn' ? 'সভাপতি ও সহ-সভাপতি' : 'President & Vice-Presidents', match: ['সভাপতি', 'সহ-সভাপতি', 'President', 'Vice-President'] },
    { title: lang === 'bn' ? 'সাধারণ সম্পাদক ও সহ-সম্পাদক' : 'Secretary & Asst. Secretary', match: ['সাধারণ সম্পাদক', 'সহ-সাধারণ সম্পাদক', 'General Secretary', 'Assistant General Secretary'] },
    { title: lang === 'bn' ? 'সাংগঠনিক সম্পাদক ও সহ-সাংগঠনিক সম্পাদক' : 'Organizing Secretary', match: ['সাংগঠনিক সম্পাদক', 'সহ-সাংগঠনিক সম্পাদক', 'Organizing Secretary', 'Assistant Organizing Secretary'] },
    { title: lang === 'bn' ? 'সমাজ কল্যাণ সম্পাদক ও সহ-সম্পাদক' : 'Social Welfare', match: ['সমাজ কল্যাণ সম্পাদক', 'সহ-সমাজ কল্যাণ সম্পাদক', 'Social Welfare Secretary', 'Assistant Social Welfare Secretary'] },
    { title: lang === 'bn' ? 'অর্থ সম্পাদক ও সহ-অর্থ সম্পাদক' : 'Finance & Treasury', match: ['অর্থ সম্পাদক', 'সহ-অর্থ সম্পাদক', 'Finance Secretary', 'Assistant Finance Secretary'] },
    { title: lang === 'bn' ? 'প্রচার সম্পাদক ও সহ-প্রচার সম্পাদক' : 'Publicity & Media', match: ['প্রচার সম্পাদক', 'সহ-প্রচার সম্পাদক', 'Publicity Secretary', 'Assistant Publicity Secretary'] },
    { title: lang === 'bn' ? 'ক্রীড়া সম্পাদক ও সহ-ক্রীড়া সম্পাদক' : 'Sports & Athletics', match: ['ক্রীড়া সম্পাদক', 'সহ-ক্রীড়া সম্পাদক', 'Sports Secretary', 'Assistant Sports Secretary'] },
    { title: lang === 'bn' ? 'ধর্ম সম্পাদক ও সহ-ধর্ম সম্পাদক' : 'Religious Affairs', match: ['ধর্ম সম্পাদক', 'সহ-ধর্ম সম্পাদক', 'Religious Secretary', 'Assistant Religious Secretary'] },
    { title: lang === 'bn' ? 'শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক' : 'Culture & Education', match: ['শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক', 'সহ-শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক', 'Education, Literature & Cultural Secretary', 'Assistant Education, Literature & Cultural Secretary'] },
    { title: lang === 'bn' ? 'মহিলা সম্পাদিকা ও সহ-সম্পাদিকা' : 'Women Affairs', match: ['মহিলা সম্পাদিকা', 'সহ-মহিলা সম্পাদিকা', 'Women Affairs Secretary', 'Assistant Women Affairs Secretary'] },
    { title: lang === 'bn' ? 'দপ্তর সম্পাদক ও সহ-দপ্তর সম্পাদক' : 'Office & Admin', match: ['দপ্তর সম্পাদক', 'সহ-দপ্তর সম্পাদক', 'Office Secretary', 'Assistant Office Secretary'] },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 md:space-y-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24 bengali">
      {/* Header Section */}
      <div className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] px-6 md:px-8 py-2 md:py-3 bg-white dark:bg-slate-900 rounded-full border border-emerald-100 dark:border-emerald-800 shadow-soft">
           <User size={14} className="text-emerald-500" />
           {lang === 'bn' ? 'আমাদের পরিবার' : 'Executive Council'}
        </div>
        
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] md:leading-tight drop-shadow-sm">
          {t.leadership}
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed opacity-80 max-w-3xl mx-auto">
          {lang === 'bn' 
            ? 'আমাদের পরিচালনা পর্ষদ এবং নিবেদিতপ্রাণ স্বেচ্ছাসেবক যারা সমাজ গঠনে অগ্রণী ভূমিকা পালন করছেন।' 
            : 'The visionary Board of Directors and tireless volunteers who serve as the architectural backbone of our social mission.'}
        </p>
      </div>

      <div className="space-y-16 md:space-y-24">
        {groups.map((group, groupIdx) => {
          const members = sortedLeadership.filter(l => 
            group.match.includes(l.designationBn) || group.match.includes(l.designationEn)
          );

          if (members.length === 0) return null;

          return (
            <div key={groupIdx} className="space-y-8 md:space-y-12">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
                <h2 className="text-lg md:text-3xl font-black text-slate-800 dark:text-slate-200 px-4 md:px-6 py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm whitespace-nowrap text-center">
                  {group.title}
                </h2>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10 px-4 md:px-0">
                {members.map((leader) => {
                  const isVacant = leader.nameBn === 'বর্তমানে খালি' || leader.nameEn === 'Vacant' || leader.nameEn === 'Currently Vacant';
                  
                  return (
                    <div key={leader.id} className={`bg-white dark:bg-slate-900 rounded-3xl md:rounded-4xl border border-emerald-50 dark:border-slate-800 p-6 md:p-8 shadow-soft group hover:-translate-y-2 md:hover:-translate-y-4 hover:shadow-heavy transition-all duration-700 relative overflow-hidden flex flex-col items-center text-center ${isVacant ? 'opacity-60 saturate-0' : ''}`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-bl-4xl group-hover:scale-125 transition-transform duration-700"></div>
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600/10 group-hover:bg-emerald-600 transition-colors"></div>
                      
                      <div className="relative mb-6">
                        <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 ${isVacant ? 'border-slate-200 dark:border-slate-800' : 'border-emerald-500/10 group-hover:border-emerald-500'} transition-all duration-700 bg-white dark:bg-slate-950 p-1.5 shadow-soft flex items-center justify-center`}>
                          {isVacant ? (
                            <User className="text-slate-300 dark:text-slate-700" size={48} />
                          ) : (
                            <img 
                              src={leader.image || settings.logo} 
                              alt={lang === 'bn' ? leader.nameBn : leader.nameEn} 
                              className="w-full h-full rounded-full object-cover transition-all duration-1000 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = settings.logo;
                              }}
                            />
                          )}
                        </div>
                        {!isVacant && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-600 dark:bg-emerald-500 text-white p-2 rounded-xl shadow-heavy ring-4 ring-white dark:ring-slate-900 transform group-hover:rotate-12 transition-all duration-500">
                            <ShieldCheck size={16} />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <h3 className={`text-lg sm:text-xl font-black ${isVacant ? 'text-slate-400' : 'text-slate-900 dark:text-white'} leading-tight bengali group-hover:text-emerald-700 transition-colors`}>
                          {lang === 'bn' ? leader.nameBn : leader.nameEn}
                        </h3>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`inline-block px-4 py-1.5 rounded-xl ${isVacant ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'} font-black text-[9px] uppercase tracking-[0.2em] border ${isVacant ? 'border-slate-200' : 'border-emerald-100 dark:border-emerald-800'} bengali`}>
                            {lang === 'bn' ? leader.designationBn : leader.designationEn}
                          </div>
                          {(leader.subDesignationBn || leader.subDesignationEn) && (
                            <div className="text-[10px] font-bold text-slate-400 bengali italic">
                              {lang === 'bn' ? leader.subDesignationBn : leader.subDesignationEn}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!isVacant && (
                        <>
                          <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium flex-1 flex flex-col items-center justify-center bengali opacity-80 group-hover:opacity-100 transition-opacity">
                               <MessageCircle size={20} className="text-emerald-500/20 mb-3 group-hover:scale-125 transition-transform" />
                               <p className="line-clamp-3 italic">
                                {lang === 'bn' ? (leader.messageBn || 'সমাজ সেবায় আমরা প্রতিশ্রুতিবদ্ধ।') : (leader.messageEn || 'Committed to serving the collective future.')}
                               </p>
                          </div>

                          {leader.phone && (
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 w-full flex justify-center">
                              <a href={`tel:${leader.phone}`} className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-mono font-black text-xs tracking-wider bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl group/btn ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-emerald-500">
                                <PhoneCall size={14} className="text-emerald-600 group-hover/btn:rotate-[15deg] transition-transform" />
                                {leader.phone}
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
