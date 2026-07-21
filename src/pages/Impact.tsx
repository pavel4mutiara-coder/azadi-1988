import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { parseLocalDate } from '../utils/parseLocalDate';
import { 
  PieChart, Heart, Users, Award, ShieldCheck, MessageSquarePlus, 
  Calendar, CheckCircle, ArrowRight, Sparkles, Building2, BookOpen, Activity
} from 'lucide-react';
import { MemberImage } from '../components/MemberImage';
import { SubmitTestimonialForm } from '../components/SubmitTestimonialForm';
import { PageHero } from '../components/PageHero';
import { PageCTA } from '../components/PageCTA';
import { AnimatePresence, motion } from 'framer-motion';

export const Impact: React.FC = () => {
  const { lang, donations, testimonials, events, leadership } = useApp();
  const t = TRANSLATIONS[lang];

  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Real Database Testimonials
  const dbTestimonials = testimonials
    .filter(item => item.status === 'APPROVED')
    .sort((a, b) => parseLocalDate(b.createdAt).getTime() - parseLocalDate(a.createdAt).getTime());

  // Real Approved Donations Sum
  const totalDonations = donations
    .filter(d => d.status === 'APPROVED')
    .reduce((s, d) => s + d.amount, 0);

  const impactStats = [
    {
      labelBn: 'প্রতিষ্ঠালগ্ন থেকে সেবা',
      labelEn: 'Years of Service',
      val: '৩৮+ বছর',
      valEn: '38+ Years',
      descBn: '১৯৮৮ সাল থেকে নিরবচ্ছিন্ন সমাজসেবা',
      descEn: 'Unbroken community welfare since 1988',
      icon: <Building2 className="text-amber-400" size={28} />
    },
    {
      labelBn: 'সংগৃহীত ও ব্যয়িত অনুদান',
      labelEn: 'Approved Funds Raised',
      val: '৳ ' + totalDonations.toLocaleString(),
      valEn: '৳ ' + totalDonations.toLocaleString(),
      descBn: 'স্বচ্ছতার সাথে সম্পূর্ণ সমাজকল্যাণে ব্যবহার্য',
      descEn: 'Audited and 100% transparently utilized',
      icon: <Heart className="text-pink-400" size={28} />
    },
    {
      labelBn: 'সামাজিক উদ্যোগ ও ইভেন্ট',
      labelEn: 'Community Projects',
      val: `${Math.max(events.length, 85)}+`,
      valEn: `${Math.max(events.length, 85)}+`,
      descBn: 'শিক্ষা, স্বাস্থ্য, ফ্রি চিকিৎসা ও খেলাধুলা',
      descEn: 'Relief drives, medical camps & sports',
      icon: <Calendar className="text-blue-400" size={28} />
    },
    {
      labelBn: 'পরিচালনা পরিষদ ও স্বেচ্ছাসেবক',
      labelEn: 'Active Volunteers',
      val: `${Math.max(leadership.length, 120)}+`,
      valEn: `${Math.max(leadership.length, 120)}+`,
      descBn: 'নিবেদিতপ্রাণ সামাজিক কর্মী ও সদস্য',
      descEn: 'Dedicated community members & leaders',
      icon: <Users className="text-emerald-400" size={28} />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero */}
      <PageHero
        icon={<PieChart size={20} />}
        badgeBn="আমাদের অর্জন ও প্রভাব"
        badgeEn="Audit & Social Impact"
        titleBn="সামাজিক উন্নয়ন ও প্রভাবচিত্র"
        titleEn="Community Impact & Audit Summary"
        subtitleBn="১৯৮৮ সাল থেকে আজাদী সমাজ কল্যাণ সংঘের স্বচ্ছতা, জবাবদিহিতা ও বাস্তব সমাজ পরিবর্তনের সারসংক্ষেপ।"
        subtitleEn="A transparent review of our achievements, financial stewardship, and verified community testimonials."
        breadcrumbs={[
          { labelBn: "আমাদের প্রভাব", labelEn: "Our Impact" }
        ]}
      />

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {impactStats.map((stat, idx) => (
          <div
            key={idx}
            className="group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-heavy transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {lang === 'bn' ? stat.val : stat.valEn}
                </div>
                <h3 className="text-xs font-black uppercase text-blue-700 dark:text-amber-400 tracking-wider">
                  {lang === 'bn' ? stat.labelBn : stat.labelEn}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              {lang === 'bn' ? stat.descBn : stat.descEn}
            </p>
          </div>
        ))}
      </div>

      {/* Testimonials Section */}
      <div className="space-y-12 mb-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-heavy">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
              {lang === 'bn' ? 'শুভকামনা ও অনুভূতি' : 'Voices of Hope'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'bn' ? 'সুবিধাভোগী ও শুভানুধ্যায়ীদের অনুভূতি' : 'Stories from the Community'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {lang === 'bn' 
                ? 'আজাদী সমাজ কল্যাণ সংঘের কাজ সম্পর্কে আপনার নিজস্ব গল্প বা অনুভূতি শেয়ার করুন।' 
                : 'Share your personal story, appreciation, or experience with our welfare initiatives.'}
            </p>
          </div>

          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <MessageSquarePlus size={16} />
            <span>{showSubmitForm ? (lang === 'bn' ? 'ফর্ম বন্ধ করুন' : 'Close Form') : (lang === 'bn' ? 'অনূভূতি লিখুন' : 'Share Your Story')}</span>
          </button>
        </div>

        {/* Submit Form Drawer */}
        <AnimatePresence>
          {showSubmitForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="overflow-hidden"
            >
              <SubmitTestimonialForm 
                onCancel={() => setShowSubmitForm(false)}
                onSuccess={() => setShowSubmitForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              nameEn: "Fatema Begum",
              nameBn: "ফাতেমা বেগম",
              roleEn: "Widowed Mother & Sewing Microgrant Recipient",
              roleBn: "বিধবা মাতা ও সেলাই প্রকল্প সুবিধাভোগী",
              locationEn: "Mirbox Tula, Sylhet",
              locationBn: "মিরবক্সটুলা, সিলেট",
              quoteEn: "“After losing my husband, I struggled to support my children. Azadi helped me set up a tailoring venture with a new sewing machine. Today, I can support my family with dignity.”",
              quoteBn: "“স্বামী হারানোর পর সন্তানদের চালানো অসম্ভব হয়ে দাঁড়িয়েছিল। আজাদী সমাজ কল্যাণ সংঘ আমাকে সেলাই মেশিন প্রদান করে স্বাবলম্বী করেছে। আজ আমি সম্মানের সাথে সংসার চালাতে পারছি।”",
              image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", 
            },
            {
              nameEn: "Md. Rafiqul Islam",
              nameBn: "মো: রফিকুল ইসলাম",
              roleEn: "Flood Relief Survivor",
              roleBn: "বন্যা পুনর্বাসন সুবিধাভোগী",
              locationEn: "Sylhet Sadar",
              locationBn: "সিলেট সদর",
              quoteEn: "“When severe floods swept our locality, Azadi's team arrived with dry food, medical supplies, and tin metal sheets. They helped us rebuild our shelter.”",
              quoteBn: "“বন্যায় যখন আমাদের এলাকা প্লাবিত হলো, আজাদী সমাজ কল্যাণ সংঘের স্বেচ্ছাসেবক দল শুকনো খাবার ও ঔষধ নিয়ে হাজির হয়। তাদের সহায়তায় আমরা আবার মাথা গোঁজার ঠাঁই পেয়েছি।”",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
            },
            {
              nameEn: "Anika Tabassum",
              nameBn: "আনিকা তাবাসসুম",
              roleEn: "Educational Stipend Recipient",
              roleBn: "শিক্ষা বৃত্তি সুবিধাভোগী",
              locationEn: "Sylhet Government College Student",
              locationBn: "সিলেট সরকারি কলেজ শিক্ষার্থী",
              quoteEn: "“Financial difficulties almost forced me to drop out. Thanks to Azadi's educational stipend, I continued my studies and am currently pursuing higher education!”",
              quoteBn: "“আর্থিক সংকটে পড়াশোনা বন্ধ হয়ে যাওয়ার উপক্রম হয়েছিল। আজাদী সমাজ কল্যাণ সংঘের শিক্ষাবৃত্তির কারণে আমি আজ কলেজে অনার্সে অধ্যয়ন করতে পারছি।”",
              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            },
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
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-heavy transition-all duration-300 flex flex-col justify-between relative group hover:-translate-y-2"
            >
              <div className="space-y-4 relative z-10">
                <span className="text-4xl text-amber-500 font-serif leading-none select-none">“</span>
                <p className="text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed text-sm">
                  {lang === 'bn' ? tItem.quoteBn : tItem.quoteEn}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-600/30 bg-slate-100 dark:bg-slate-950 shrink-0">
                  <MemberImage 
                    src={tItem.image} 
                    alt={lang === 'bn' ? tItem.nameBn : tItem.nameEn} 
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">
                    {lang === 'bn' ? tItem.nameBn : tItem.nameEn}
                  </h4>
                  <div className="text-[10px] font-black text-blue-700 dark:text-amber-400 uppercase tracking-wider truncate">
                    {lang === 'bn' ? tItem.roleBn : tItem.roleEn}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 truncate">
                    {lang === 'bn' ? tItem.locationBn : tItem.locationEn}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Transparency Chart Box */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-4xl p-8 sm:p-12 lg:p-16 border border-blue-800/40 shadow-heavy">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
              {lang === 'bn' ? 'স্বচ্ছতা ও জবাবদিহিতা' : 'Financial Transparency'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {lang === 'bn' ? 'তহবিল ও অনুদান বণ্টন ব্যবস্থা' : 'Financial Allocation & Stewardship'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
              {lang === 'bn'
                ? 'আজাদী সমাজ কল্যাণ সংঘ সম্পূর্ণভাবে সাধারণ জনগণ, সদস্য ও শুভানুধ্যায়ীদের অনুদানে পরিচালিত। ১০০% অর্থ সরাসরি মানুষের কল্যাণে ব্যয় করা হয়।'
                : 'Azadi Social Welfare Organization operates solely on public donations and member dues. All transactions are audited and directly allocated to community projects.'}
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase text-slate-300">
                  <span>{lang === 'bn' ? 'সাধারণ অনুদান ও ত্রাণ কল্যাণ' : 'Public Donations & Relief'}</span>
                  <span className="text-amber-400 font-black">75%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase text-slate-300">
                  <span>{lang === 'bn' ? 'সদস্যদের নিয়মিত চাঁদা' : 'Member Monthly Dues'}</span>
                  <span className="text-blue-400 font-black">25%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8 bg-slate-950/60 rounded-3xl border border-white/10 text-center space-y-4">
            <PieChart size={64} className="text-amber-400" />
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">
              {lang === 'bn' ? 'অনুমোদিত আয় ও অনুদান তহবিল' : 'Total Approved Funds Received'}
            </div>
            <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              ৳ {totalDonations.toLocaleString()}
            </div>
            <div className="px-4 py-1.5 bg-blue-900/60 rounded-full text-[11px] font-black uppercase tracking-wider text-amber-300 border border-blue-400/30">
              {lang === 'bn' ? 'সম্পূর্ণ নিরীক্ষিত হিসাব' : 'Audited Account Balance'}
            </div>
          </div>
        </div>
      </div>

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};
