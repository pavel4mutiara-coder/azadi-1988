
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { parseLocalDate } from '../utils/parseLocalDate';
import { Target, Users, Heart, Globe, PieChart, Sparkles, MessageSquarePlus } from 'lucide-react';
import { MemberImage } from '../components/MemberImage';
import { SubmitTestimonialForm } from '../components/SubmitTestimonialForm';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Testimonial } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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
      stiffness: 90,
      damping: 15,
    },
  },
};

export const Impact: React.FC = () => {
  const { lang, donations } = useApp();
  const t = TRANSLATIONS[lang];

  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(collection(db, 'testimonials'), where('status', '==', 'APPROVED'));
        const snapshot = await getDocs(q);
        const list: Testimonial[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data() as Testimonial);
        });
        // Sort by createdAt descending
        list.sort((a, b) => parseLocalDate(b.createdAt).getTime() - parseLocalDate(a.createdAt).getTime());
        setDbTestimonials(list);
      } catch (err) {
        console.error("Error fetching testimonials from firestore:", err);
      }
    };
    fetchTestimonials();
  }, []);

  const totalDonations = donations.filter(d => d.status === 'APPROVED').reduce((s, d) => s + d.amount, 0);

  const impactStats = [
    { label: lang === 'bn' ? 'উপকৃত পরিবার' : 'Beneficiary Families', val: '500+', icon: <Users />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' },
    { label: lang === 'bn' ? 'আয়োজিত ইভেন্ট' : 'Events Organized', val: '85+', icon: <Globe />, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30' },
    { label: lang === 'bn' ? 'স্বেচ্ছাসেবক' : 'Volunteers', val: '120', icon: <Target />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30' },
    { label: lang === 'bn' ? 'মোট অনুদান সংগ্রহ' : 'Total Donations Raised', val: '৳ ' + totalDonations.toLocaleString(), icon: <Heart />, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/30' },
  ];

  return (
    <div className="space-y-20 sm:space-y-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24 bengali">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 dark:border-emerald-800">
           <Heart size={14} className="animate-pulse" /> {lang === 'bn' ? 'আমাদের প্রভাব' : 'Our Impact'}
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-slate-50 tracking-tighter leading-tight">{t.impact}</h1>
        <p className="text-lg sm:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed opacity-80">
          {lang === 'bn' 
            ? 'আমাদের কাজের মাধ্যমে সমাজে যে পরিবর্তন আসছে তার এক ঝলক।' 
            : 'A transparent look at the meaningful changes we are bringing to our community through collective effort.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {impactStats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-4xl border border-emerald-50 dark:border-slate-800 shadow-soft hover:shadow-heavy flex flex-col items-center text-center gap-6 group hover:-translate-y-3 transition-all">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner ring-8 ring-transparent group-hover:ring-emerald-500/5`}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 36 })}
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter drop-shadow-sm">{stat.val}</div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Beneficiary Testimonials Section */}
      <div className="space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 dark:border-emerald-800">
            {lang === 'bn' ? 'শুভকামনা ও অনুভূতি' : 'Stories of Hope'}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tighter leading-tight">
            {lang === 'bn' ? 'সুবিধাভোগীদের মুখ থেকে' : 'Voices of Impact'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            {lang === 'bn' 
              ? 'আমাদের গৃহীত প্রতিটি উদ্যোগ এবং আপনাদের প্রতিটি অনুদান কীভাবে জীবন বদলে দিচ্ছে শুনুন তাঁদের নিজেদের মুখেই।' 
              : 'Listen to the real stories of resilience and change directly from the community members we have served together.'}
          </p>
        </div>

        <div className="flex justify-center">
          {!showSubmitForm ? (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="px-6 py-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 border border-emerald-100 dark:border-emerald-800 transition-all hover:scale-105 active:scale-98 shadow-sm"
            >
              <MessageSquarePlus size={16} />
              <span>{lang === 'bn' ? 'আপনার গল্প বা অনুভূতি শেয়ার করুন' : 'Share Your Story / Testimonial'}</span>
            </button>
          ) : null}
        </div>

        <AnimatePresence>
          {showSubmitForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <SubmitTestimonialForm 
                onCancel={() => setShowSubmitForm(false)}
                onSuccess={() => {
                  // After successful submission, pull any new ones and close form
                  setShowSubmitForm(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          key={`grid-${dbTestimonials.length}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              nameEn: "Fatema Begum",
              nameBn: "ফাতেমা বেগম",
              roleEn: "Widowed Mother & Sewing Microgrant",
              roleBn: "বিধবা মাতা ও সেলাই প্রকল্প সুবিধাভোগী",
              locationEn: "Hathazari, Chattogram",
              locationBn: "হাটহাজারী, চট্টগ্রাম",
              quoteEn: "“After losing my husband, I struggled to support my children. Azadi helped me set up a tailoring venture with a new sewing machine. Today, I can support my children confidently.”",
              quoteBn: "“স্বামী হারানোর পর সন্তানদের চালানো অসম্ভব হয়ে দাঁড়িয়েছিল। আজাদী আমাকে একটি সেলাই মেশিন দিয়ে নিজের আয়ের পথ গড়ে দিয়েছে। আজ আমি সন্তানদের নিজের তাগিদেই সাহায্য করতে পারি।”",
              image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", 
            },
            {
              nameEn: "Md. Rafiqul Islam",
              nameBn: "মো: রফিকুল ইসলাম",
              roleEn: "Flood Relief Survivor",
              roleBn: "বন্যা পুনর্বাসন সুবিধাভোগী",
              locationEn: "Feni, Bangladesh",
              locationBn: "ফেনী, বাংলাদেশ",
              quoteEn: "“When the devastating floods swept our house away, Azadi's team came with dry food, medical supplies, and tin metal sheets. They essentially rebuilt our shelter.”",
              quoteBn: "“বিধ্বংসী বন্যায় যখন আমরা ঘর হারিয়ে ফেললাম, আজাদী সমাজ কল্যাণ সংঘ খাবার এবং টিনের চাল নিয়ে পাশে এসে দাঁড়ায়। তারা আমাদের মাথা গোঁজার নতুন ঠিকানা দিয়েছেন।”",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
            },
            {
              nameEn: "Anika Tabassum",
              nameBn: "আনিকা তাবাসসুম",
              roleEn: "Scholarship Recipient",
              roleBn: "শিক্ষা বৃত্তি সুবিধাভোগী",
              locationEn: "Chattogram University student",
              locationBn: "চট্টগ্রাম বিশ্ববিদ্যালয় শিক্ষার্থী",
              quoteEn: "“Unbearable educational costs almost ended my dreams of studying. With Azadi's student stipend, I preparation tests became stress-free. I am currently pursuing an honors degree!”",
              quoteBn: "“আর্থিক সংকটে পড়াশোনা থেমে যাওয়ার উপক্রম হয়েছিল। আজাদী সমাজ কল্যাণ সংঘের শিক্ষাবৃত্তির কারণে আমি আজ চট্টগ্রাম বিশ্ববিদ্যালয়ে অনার্সে পড়তে পারছি।”",
              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            },
            // Map dynamic Database testimonials too!
            ...dbTestimonials.map(t => ({
              nameEn: t.nameEn,
              nameBn: t.nameBn,
              roleEn: t.roleEn,
              roleBn: t.roleBn,
              locationEn: t.locationEn,
              locationBn: t.locationBn,
              quoteEn: t.quoteEn,
              quoteBn: t.quoteBn,
              image: t.image
            }))
          ].map((tItem, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-emerald-50/60 dark:border-slate-800/80 shadow-soft hover:shadow-heavy relative flex flex-col justify-between group"
            >
              {/* Soft decorative quotes watermark */}
              <div className="absolute top-6 right-8 text-emerald-100/60 dark:text-slate-800/20 font-serif text-8xl leading-none select-none pointer-events-none group-hover:text-emerald-250 dark:group-hover:text-slate-700/30 transition-colors duration-500">
                ”
              </div>
              
              <div className="space-y-6 relative z-10">
                <p className="text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed text-[13px] sm:text-[14px]">
                  {lang === 'bn' ? tItem.quoteBn : tItem.quoteEn}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-105 dark:border-slate-800/60 relative z-10">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-500/10 bg-white dark:bg-slate-950 p-0.5">
                  <MemberImage 
                    src={tItem.image} 
                    alt={lang === 'bn' ? tItem.nameBn : tItem.nameEn} 
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm truncate">
                    {lang === 'bn' ? tItem.nameBn : tItem.nameEn}
                  </h4>
                  <div className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5 truncate">
                    {lang === 'bn' ? tItem.roleBn : tItem.roleEn}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {lang === 'bn' ? tItem.locationBn : tItem.locationEn}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="bg-emerald-900 dark:bg-slate-900 text-white rounded-4xl p-10 sm:p-20 md:p-24 shadow-heavy relative overflow-hidden border border-emerald-800 dark:border-slate-800 group">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabic-bazazz.png')] group-hover:scale-110 transition-transform duration-[20s]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tighter">{lang === 'bn' ? 'আমাদের অর্থায়নের উৎস' : 'Our Funding Sources'}</h2>
              <p className="text-emerald-100/70 dark:text-slate-300/80 leading-relaxed font-medium text-lg sm:text-xl">
                {lang === 'bn' 
                  ? 'আজাদী সমাজ কল্যাণ সংঘ সম্পূর্ণভাবে ব্যক্তিগত অনুদান এবং সদস্যদের মাসিক চাঁদার মাধ্যমে পরিচালিত হয়।' 
                  : 'Azadi Social Welfare Organization is entirely run by personal donations, community support, and monthly contributions from our dedicated members.'}
              </p>
            </div>
            
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-300 dark:text-slate-400">
                  <span>Public Donations</span>
                  <span className="text-white">75%</span>
                </div>
                <div className="h-4 bg-emerald-950 dark:bg-slate-950 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-emerald-400 rounded-full shadow-emerald-400/50 shadow-lg transition-all duration-1000" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-300 dark:text-slate-400">
                  <span>Member Contributions</span>
                  <span className="text-white">25%</span>
                </div>
                <div className="h-4 bg-emerald-950 dark:bg-slate-950 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-amber-400 rounded-full shadow-amber-400/50 shadow-lg transition-all duration-1000" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center xl:justify-end">
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-emerald-950/50 dark:bg-slate-950/50 rounded-full flex items-center justify-center border-8 sm:border-[12px] border-white/5 relative shadow-heavy backdrop-blur-sm group/chart overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent"></div>
               <PieChart size={180} className="text-white opacity-10 group-hover/chart:scale-110 transition-transform duration-1000" />
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/5 hover:bg-slate-900/40 transition-colors">
                  <div className="text-[11px] font-black opacity-60 uppercase tracking-[0.2em] text-white/80 mb-2">Total Transparency</div>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">৳ {totalDonations.toLocaleString()}</div>
                  <div className="mt-4 px-4 py-1.5 bg-white/10 dark:bg-emerald-500/10 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 dark:border-emerald-500/20 backdrop-blur-md">Total Income</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
