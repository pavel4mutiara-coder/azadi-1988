
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { History, Target, Eye, Star, Award, ShieldCheck, Heart, Users, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export const AboutUs: React.FC = () => {
  const { lang, settings } = useApp();
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
      year: "2015",
      titleEn: "Health & Welfare",
      titleBn: "স্বাস্থ্য ও কল্যাণ",
      descEn: "Expanded into free medical camps and disaster relief coordination across the region.",
      descBn: "বিনামূল্যে চিকিৎসা ক্যাম্প এবং দুর্যোগকালীন ত্রাণ কার্যক্রমের প্রসার।"
    },
    {
      year: "Today",
      titleEn: "Modern Azadi",
      titleBn: "আধুনিক আজাদী",
      descEn: "Continuing the legacy through technology to reach more lives efficiently.",
      descBn: "প্রযুক্তির মাধ্যমে আরও মানুষের কাছে দ্রুত সেবা পৌঁছে দিতে নিরন্তর পথচলা।"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 bengali">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-10">
        <div className="inline-flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full border border-emerald-200 dark:border-emerald-700 shadow-sm">
           <Users size={14} />
           {lang === 'bn' ? 'আমাদের সম্পর্কে জানুন' : 'Learn About Us'}
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.about}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed">
          {lang === 'bn' 
            ? 'তিন দশকেরও বেশি সময় ধরে শিক্ষা, ঐক্য এবং মানবতার সেবায় নিবেদিত এক গৌরবময় ইতিহাস।' 
            : 'A glorious history dedicated to education, unity, and human service for over three decades.'}
        </p>
      </div>

      {/* Intro Section */}
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-14 border border-emerald-50 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-emerald-900 dark:text-emerald-400">
              {t.foundingTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-justify">
              {lang === 'bn' 
                ? 'আজাদী সমাজ কল্যাণ সংঘ ১৯৮৮ সালের ১০ জুন সিলেটের মিরবক্সটুলা এলাকায় যাত্রা শুরু করে। একদল স্বপ্নবাজ যুবকের উদ্যোগে প্রতিষ্ঠিত এই সংস্থাটি শিক্ষার প্রসার, সামাজিক ঐক্য রক্ষা এবং আর্তমানবতার সেবায় নিরলসভাবে কাজ করে যাচ্ছে। প্রতিষ্ঠালগ্ন থেকেই আমরা বিশ্বাস করি, ঐক্যবদ্ধ প্রচেষ্টাই পারে একটি সুন্দর সমাজ গড়ে তুলতে।'
                : 'Azadi Social Welfare Organization began its journey on June 10, 1988, in the Mirboxtula area of Sylhet. Founded by a group of visionary youths, this organization has been working tirelessly to promote education, maintain social unity, and serve suffering humanity.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-emerald-50 dark:bg-slate-950 p-8 rounded-[2.5rem] text-center space-y-2 border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
               <Star className="mx-auto text-amber-500" />
               <div className="text-3xl font-black text-slate-900 dark:text-white">35+</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{lang === 'bn' ? 'বছরের গৌরব' : 'Years Legacy'}</div>
             </div>
             <div className="bg-blue-50 dark:bg-slate-950 p-8 rounded-[2.5rem] text-center space-y-2 border border-blue-100 dark:border-blue-900/50 shadow-sm">
               <ShieldCheck className="mx-auto text-blue-500" />
               <div className="text-3xl font-black text-slate-900 dark:text-white">1988</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{lang === 'bn' ? 'প্রতিষ্ঠিত' : 'Established'}</div>
             </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-emerald-900 dark:bg-emerald-950 text-white p-12 rounded-[3.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Target size={200} />
          </div>
          <div className="relative z-10 space-y-5">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
              <Target className="text-emerald-400" size={32} />
            </div>
            <h3 className="text-3xl font-black">{t.missionTitle}</h3>
            <p className="text-emerald-100/80 font-bold leading-relaxed text-lg">
              {lang === 'bn' 
                ? 'আমাদের লক্ষ্য হলো শিক্ষার আলো ছড়িয়ে দেয়া এবং সামাজিক বৈষম্য দূর করে একটি সমৃদ্ধশালী সমাজ গঠন করা।'
                : 'Our mission is to spread the light of education and build a prosperous society by removing social inequalities.'}
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-emerald-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Eye size={200} />
          </div>
          <div className="relative z-10 space-y-5">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <Eye className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{t.visionTitle}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-lg">
              {lang === 'bn' 
                ? 'একটি আদর্শ ও কল্যানমুখী সমাজ বিনির্মাণ যেখানে প্রতিটি নাগরিকের শিক্ষা ও নিরাপত্তা নিশ্চিত হবে।'
                : 'To build an ideal and welfare-oriented society where education and security are ensured for all.'}
            </p>
          </div>
        </section>
      </div>

      {/* Timeline Section */}
      <section className="space-y-16">
        <div className="text-center space-y-3">
          <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">{lang === 'bn' ? 'অতীত থেকে বর্তমান' : 'Our Timeline'}</div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">{t.milestonesTitle}</h2>
        </div>

        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-500/20 before:to-transparent">
          {milestones.map((m, i) => (
            <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group`}>
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-950 bg-emerald-600 text-white shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                <Star size={18} fill="currentColor" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-emerald-50 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-black text-emerald-600">{m.year}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg">{lang === 'bn' ? m.titleBn : m.titleEn}</div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed text-base">
                  {lang === 'bn' ? m.descBn : m.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section - The replacement for the request of Contact page */}
      <section className="space-y-16 pt-10">
        <div className="text-center space-y-3">
          <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">{lang === 'bn' ? 'যোগাযোগ করুন' : 'Get In Touch'}</div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">{lang === 'bn' ? 'আমাদের সাথে যোগাযোগ' : 'Contact Us'}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <a href={`tel:${settings.phone}`} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-emerald-50 dark:border-slate-800 shadow-xl flex flex-col items-center text-center gap-6 hover:-translate-y-2 transition-all group">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Phone size={36} />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">{lang === 'bn' ? 'ফোন' : 'Phone'}</h4>
              <p className="text-slate-500 font-bold font-mono tracking-wider">{settings.phone}</p>
            </div>
          </a>

          <a href={`mailto:${settings.email}`} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-emerald-50 dark:border-slate-800 shadow-xl flex flex-col items-center text-center gap-6 hover:-translate-y-2 transition-all group">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Mail size={36} />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">{lang === 'bn' ? 'ইমেইল' : 'Email'}</h4>
              <p className="text-slate-500 font-bold break-all">{settings.email}</p>
            </div>
          </a>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-emerald-50 dark:border-slate-800 shadow-xl flex flex-col items-center text-center gap-6 hover:-translate-y-2 transition-all group">
            <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <MapPin size={36} />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">{lang === 'bn' ? 'ঠিকানা' : 'Address'}</h4>
              <p className="text-slate-500 font-bold leading-tight">{lang === 'bn' ? settings.addressBn : settings.addressEn}</p>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="bg-emerald-900 dark:bg-emerald-950 rounded-[4rem] p-12 text-center text-white space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen-2.png')]"></div>
          <div className="relative z-10 space-y-4">
            <MessageCircle size={64} className="mx-auto text-emerald-400 group-hover:scale-110 transition-transform" />
            <h2 className="text-3xl md:text-4xl font-black">{lang === 'bn' ? 'হোয়াটসঅ্যাপে আমাদের সাথে যুক্ত হোন' : 'Connect with us on WhatsApp'}</h2>
            <p className="text-emerald-100/70 font-bold max-w-xl mx-auto">
              {lang === 'bn' ? 'যেকোনো আবেদন, অভিযোগ বা তথ্যের জন্য সরাসরি আমাদের হোয়াটসঅ্যাপ চ্যানেলে যোগাযোগ করতে পারেন।' : 'Connect directly with our WhatsApp channel for any request or information.'}
            </p>
            <div className="pt-6">
               <a 
                 href={settings.whatsappChannel} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-3 bg-white text-emerald-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-emerald-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
                >
                 <MessageCircle size={24} className="text-emerald-600" />
                 {lang === 'bn' ? 'চ্যানেল জয়েন করুন' : 'Join Channel'}
               </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
