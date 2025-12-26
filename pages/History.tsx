
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { History, Target, Eye, Star, Award, ShieldCheck, Heart, Users } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { lang } = useApp();
  const t = TRANSLATIONS[lang];

  const milestones = [
    {
      year: "1988",
      titleEn: "Founding",
      titleBn: "প্রতিষ্ঠা",
      descEn: "Founded on 10th June 1988 by a group of dedicated youths in Mirboxtula, Sylhet.",
      descBn: "১০ই জুন ১৯৮৮ সালে সিলেটের মিরবক্সটুলার একদল নিবেদিতপ্রাণ যুবকদের হাত ধরে যাত্রা শুরু।"
    },
    {
      year: "1995",
      titleEn: "Education Drive",
      titleBn: "শিক্ষা কার্যক্রম",
      descEn: "Launched mass literacy programs and scholarship funds for underprivileged students.",
      descBn: "অসহায় শিক্ষার্থীদের জন্য গণসাক্ষরতা কর্মসূচি এবং শিক্ষা বৃত্তি তহবিল চালু।"
    },
    {
      year: "2005",
      titleEn: "Unity Through Sports",
      titleBn: "ক্রীড়ার মাধ্যমে ঐক্য",
      descEn: "Initiated regional sports tournaments to build community bonding and youth leadership.",
      descBn: "সামাজিক মেলবন্ধন ও যুব নেতৃত্ব তৈরিতে আঞ্চলিক ক্রীড়া টুর্নামেন্টের সূচনা।"
    },
    {
      year: "2015",
      titleEn: "Health & Welfare",
      titleBn: "স্বাস্থ্য ও কল্যাণ",
      descEn: "Expanded into free medical camps and disaster relief coordination across the region.",
      descBn: "বিনামূল্যে চিকিৎসা ক্যাম্প এবং দুর্যোগকালীন ত্রাণ কার্যক্রমের প্রসার।"
    },
    {
      year: "Today",
      titleEn: "Digital Transformation",
      titleBn: "ডিজিটাল রূপান্তর",
      descEn: "Continuing the legacy through technology to reach more lives efficiently.",
      descBn: "প্রযুক্তির মাধ্যমে আরও মানুষের কাছে দ্রুত সেবা পৌঁছে দিতে নিরন্তর পথচলা।"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 bengali">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-xl rotate-3">
          <History size={40} />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.about}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {lang === 'bn' 
            ? 'তিন দশকেরও বেশি সময় ধরে শিক্ষা, ঐক্য এবং মানবতার সেবায় নিবেদিত এক গৌরবময় ইতিহাস।' 
            : 'A glorious history dedicated to education, unity, and human service for over three decades.'}
        </p>
      </div>

      {/* Intro Section */}
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-14 border border-emerald-50 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-emerald-900 dark:text-emerald-400">
              {t.foundingTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-justify">
              {lang === 'bn' 
                ? 'আজাদী সমাজ কল্যাণ সংঘ ১৯৮৮ সালের ১০ জুন সিলেটের মিরবক্সটুলা এলাকায় যাত্রা শুরু করে। একদল স্বপ্নবাজ যুবকের উদ্যোগে প্রতিষ্ঠিত এই সংস্থাটি শিক্ষার প্রসার, সামাজিক ঐক্য রক্ষা এবং আর্তমানবতার সেবায় নিরলসভাবে কাজ করে যাচ্ছে। প্রতিষ্ঠালগ্ন থেকেই আমরা বিশ্বাস করি, ঐক্যবদ্ধ প্রচেষ্টাই পারে একটি সুন্দর সমাজ গড়ে তুলতে।'
                : 'Azadi Social Welfare Organization began its journey on June 10, 1988, in the Mirboxtula area of Sylhet. Founded by a group of visionary youths, this organization has been working tirelessly to promote education, maintain social unity, and serve suffering humanity. Since its inception, we have believed that united efforts can build a beautiful society.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-emerald-50 dark:bg-slate-950 p-6 rounded-[2.5rem] text-center space-y-2 border border-emerald-100 dark:border-emerald-900/50">
               <Star className="mx-auto text-amber-500" />
               <div className="text-2xl font-black text-slate-900 dark:text-white">35+</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{lang === 'bn' ? 'বছরের গৌরব' : 'Years Legacy'}</div>
             </div>
             <div className="bg-blue-50 dark:bg-slate-950 p-6 rounded-[2.5rem] text-center space-y-2 border border-blue-100 dark:border-blue-900/50">
               <ShieldCheck className="mx-auto text-blue-500" />
               <div className="text-2xl font-black text-slate-900 dark:text-white">1988</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{lang === 'bn' ? 'প্রতিষ্ঠিত' : 'Established'}</div>
             </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-emerald-900 dark:bg-emerald-950 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Target size={200} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Target className="text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black">{t.missionTitle}</h3>
            <p className="text-emerald-100/80 font-bold leading-relaxed">
              {lang === 'bn' 
                ? 'আমাদের লক্ষ্য হলো শিক্ষার আলো ছড়িয়ে দেয়া, যুব শক্তিকে গঠনমূলক কাজে অনুপ্রাণিত করা এবং সামাজিক বৈষম্য দূর করে একটি সমৃদ্ধশালী সমাজ গঠন করা।'
                : 'Our mission is to spread the light of education, inspire youth in constructive activities, and build a prosperous society by removing social inequalities.'}
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-emerald-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Eye size={200} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <Eye className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t.visionTitle}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              {lang === 'bn' 
                ? 'একটি আদর্শ ও কল্যানমুখী সমাজ বিনির্মাণ যেখানে প্রতিটি নাগরিকের শিক্ষা, শান্তি এবং নিরাপত্তা নিশ্চিত হবে।'
                : 'To build an ideal and welfare-oriented society where the education, peace, and security of every citizen will be ensured.'}
            </p>
          </div>
        </section>
      </div>

      {/* Timeline Section */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">{lang === 'bn' ? 'আমাদের ইতিহাস' : 'Timeline'}</div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">{t.milestonesTitle}</h2>
        </div>

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-500/20 before:to-transparent">
          {milestones.map((m, i) => (
            <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
              {/* Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-950 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Star size={16} fill="currentColor" />
              </div>
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-emerald-50 dark:border-slate-800 shadow-xl group-hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xl font-black text-emerald-600">{m.year}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'bn' ? m.titleBn : m.titleEn}</div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed bengali">
                  {lang === 'bn' ? m.descBn : m.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact & Core Values */}
      <section className="bg-emerald-50/50 dark:bg-slate-900/50 p-10 md:p-16 rounded-[4rem] border border-emerald-100 dark:border-slate-800 text-center space-y-10">
         <div className="space-y-4">
           <h2 className="text-3xl font-black text-slate-900 dark:text-white">{lang === 'bn' ? 'আমাদের মূল আদর্শ' : 'Our Core Values'}</h2>
           <div className="flex flex-wrap justify-center gap-6">
             {[
               { icon: <Heart size={20}/>, label: lang === 'bn' ? 'মানবতা' : 'Humanity' },
               { icon: <ShieldCheck size={20}/>, label: lang === 'bn' ? 'স্বচ্ছতা' : 'Transparency' },
               { icon: <Users size={20}/>, label: lang === 'bn' ? 'ঐক্য' : 'Unity' },
               { icon: <Award size={20}/>, label: lang === 'bn' ? 'সততা' : 'Integrity' },
             ].map((v, i) => (
               <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-900 px-6 py-3 rounded-full border border-emerald-50 dark:border-emerald-900 shadow-sm">
                 <span className="text-emerald-500">{v.icon}</span>
                 <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{v.label}</span>
               </div>
             ))}
           </div>
         </div>
      </section>
    </div>
  );
};
