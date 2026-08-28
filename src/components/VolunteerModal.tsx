import React, { useState, useEffect } from 'react';
import { 
  X, HeartHandshake, CheckCircle2, AlertCircle, Loader2, 
  User, Phone, Sparkles, Send, ShieldCheck, Heart, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [areaOfInterest, setAreaOfInterest] = useState('');
  const [availability, setAvailability] = useState('weekends');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Volunteer tracks
  const volunteerAreas = [
    {
      id: 'medical_health',
      labelBn: 'স্বাস্থ্য ও ফ্রি মেডিকেল ক্যাম্প সেবা',
      labelEn: 'Health & Free Medical Camps'
    },
    {
      id: 'education_scholarship',
      labelBn: 'শিক্ষা ও মেধা বৃত্তি সহায়তা',
      labelEn: 'Education & Youth Scholarships'
    },
    {
      id: 'relief_welfare',
      labelBn: 'ত্রাণ বিতরণ ও শীতবস্ত্র সহায়তা',
      labelEn: 'Disaster Relief & Winter Welfare'
    },
    {
      id: 'sports_culture',
      labelBn: 'ক্রীড়া ও সাংস্কৃতিক আয়োজন',
      labelEn: 'Sports & Cultural Events'
    },
    {
      id: 'environment_cleaning',
      labelBn: 'পরিবেশ উন্নয়ন ও বৃক্ষরোপণ',
      labelEn: 'Environmental & Tree Plantation'
    },
    {
      id: 'media_tech',
      labelBn: 'আইটি, মিডিয়া ও প্রচারণা',
      labelEn: 'Media, IT & Social Outreach'
    },
    {
      id: 'logistics_event',
      labelBn: 'ইভেন্ট ব্যবস্থাপনা ও লজিস্টিকস',
      labelEn: 'Event Logistics & Coordination'
    },
    {
      id: 'general',
      labelBn: 'সাধারণ কল্যাণমূলক কার্যক্রম (যে কোনো ক্ষেত্রে)',
      labelEn: 'General Humanitarian Volunteering (Any Area)'
    }
  ];

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  // Reset form when reopened
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSubmittedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validatePhone = (input: string): boolean => {
    // Allows standard BD format (+8801..., 01..., or international numbers)
    const cleaned = input.replace(/[\s\-()]/g, '');
    const phoneRegex = /^(\+?[0-9]{8,15})$/;
    return phoneRegex.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    // 1. Validation: Name
    if (!cleanName || cleanName.length < 2) {
      setError(
        lang === 'bn'
          ? 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন (কমপক্ষে ২ অক্ষর)।'
          : 'Please enter your full name (at least 2 characters).'
      );
      return;
    }

    // 2. Validation: Phone
    if (!cleanPhone || !validatePhone(cleanPhone)) {
      setError(
        lang === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক যোগাযোগ বা মোবাইল নম্বর প্রদান করুন (যেমন: 01712-XXXXXX)।'
          : 'Please enter a valid contact phone number (e.g. +8801712-XXXXXX).'
      );
      return;
    }

    // 3. Validation: Area of interest
    if (!areaOfInterest) {
      setError(
        lang === 'bn'
          ? 'অনুগ্রহ করে আপনার আগ্রহের ক্ষেত্র নির্বাচন করুন।'
          : 'Please select your primary area of interest.'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Mock submit handler simulating network save
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newRecord = {
        id: `vol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        phone: cleanPhone,
        areaOfInterest,
        areaTitle: volunteerAreas.find(a => a.id === areaOfInterest)?.[lang === 'bn' ? 'labelBn' : 'labelEn'] || areaOfInterest,
        availability,
        notes: notes.trim(),
        submittedAt: new Date().toISOString(),
        status: 'PENDING'
      };

      // Save to local storage cache for simulated persistence
      const storageKey = 'azadi_volunteer_applications';
      let existing: any[] = [];
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) existing = JSON.parse(raw);
      } catch {
        existing = [];
      }
      existing.unshift(newRecord);
      localStorage.setItem(storageKey, JSON.stringify(existing));

      window.dispatchEvent(new CustomEvent('azadi_volunteer_added', { detail: newRecord }));

      setSubmittedSuccess(true);
    } catch {
      setError(
        lang === 'bn'
          ? 'আবেদন সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Failed to submit application. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setName('');
    setPhone('');
    setAreaOfInterest('');
    setNotes('');
    setSubmittedSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div 
      id="volunteer-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleResetAndClose();
        }
      }}
    >
      <div 
        id="volunteer-modal-content"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="volunteer-modal-title"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-6 sm:px-8 py-5 text-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 shadow-inner">
              <HeartHandshake size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5 bengali">
                <Sparkles size={12} />
                <span>{lang === 'bn' ? 'মানবতার সেবায় অংশ নিন' : 'Join Our Humanitarian Mission'}</span>
              </div>
              <h2 id="volunteer-modal-title" className="text-lg sm:text-xl font-black text-white leading-tight bengali">
                {lang === 'bn' ? 'স্বেচ্ছাসেবক হিসেবে যোগ দিন' : 'Become a Volunteer'}
              </h2>
            </div>
          </div>

          <button
            id="close-volunteer-modal-btn"
            type="button"
            onClick={handleResetAndClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1">
          {submittedSuccess ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white bengali">
                  {lang === 'bn' ? 'স্বেচ্ছাসেবক আবেদন সফল হয়েছে!' : 'Application Submitted Successfully!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-md mx-auto bengali leading-relaxed">
                  {lang === 'bn'
                    ? `ধন্যবাদ, ${name}! আজাদী সমাজ কল্যাণ সংঘের কার্যক্রমে আপনার আগ্রহের জন্য আমরা কৃতজ্ঞ। আমাদের স্বেচ্ছাসেবক সমন্বয়ক টিম শীঘ্রই আপনার সাথে যোগাযোগ করবেন।`
                    : `Thank you, ${name}! We appreciate your willingness to serve with Azadi Social Welfare Organization. Our volunteer coordination team will contact you shortly.`}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2 text-slate-700 dark:text-slate-300 max-w-sm mx-auto">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">{lang === 'bn' ? 'নাম:' : 'Name:'}</span>
                  <span className="font-black text-slate-900 dark:text-white">{name}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">{lang === 'bn' ? 'মোবাইল:' : 'Phone:'}</span>
                  <span className="font-mono">{phone}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">{lang === 'bn' ? 'আগ্রহের ক্ষেত্র:' : 'Area:'}</span>
                  <span className="text-blue-600 dark:text-amber-400 truncate max-w-[180px]">
                    {volunteerAreas.find(a => a.id === areaOfInterest)?.[lang === 'bn' ? 'labelBn' : 'labelEn']}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-700/20 transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'ঠিক আছে (সম্পন্ন)' : 'Done (Close)'}
                </button>
              </div>
            </div>
          ) : (
            <form id="volunteer-signup-form" onSubmit={handleSubmit} noValidate className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bengali">
                {lang === 'bn'
                  ? 'আজাদী সমাজ কল্যাণ সংঘের শিক্ষা, চিকিৎসা, ত্রাণ ও সাংস্কৃতিক কার্যক্রমে যুক্ত হয়ে সমাজের কল্যাণে কাজ করুন।'
                  : 'Join hands with Azadi Social Welfare Organization to create tangible impact in education, health, disaster relief, and youth empowerment.'}
              </p>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span className="bengali">{error}</span>
                </div>
              )}

              {/* 1. Name Field */}
              <div className="space-y-1.5">
                <label htmlFor="volunteer-name" className="block text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider bengali">
                  {lang === 'bn' ? 'আপনার পূর্ণ নাম' : 'Full Name'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    id="volunteer-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ আব্দুল্লাহ' : 'e.g. John Doe'}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-amber-400 focus:ring-2 focus:ring-blue-600/10 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-medium transition-all outline-none"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 2. Contact Number Field */}
              <div className="space-y-1.5">
                <label htmlFor="volunteer-phone" className="block text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider bengali">
                  {lang === 'bn' ? 'যোগাযোগ / মোবাইল নম্বর' : 'Contact Number'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    id="volunteer-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={lang === 'bn' ? 'যেমন: 01712-782564' : 'e.g. +880 1712-782564'}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-amber-400 focus:ring-2 focus:ring-blue-600/10 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-mono font-medium transition-all outline-none"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 3. Area of Interest */}
              <div className="space-y-1.5">
                <label htmlFor="volunteer-area" className="block text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider bengali">
                  {lang === 'bn' ? 'আগ্রহের ক্ষেত্র / সেবার ধরন' : 'Area of Interest'} <span className="text-rose-500">*</span>
                </label>
                <select
                  id="volunteer-area"
                  required
                  value={areaOfInterest}
                  onChange={(e) => {
                    setAreaOfInterest(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-amber-400 focus:ring-2 focus:ring-blue-600/10 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium transition-all outline-none cursor-pointer bengali"
                  disabled={isLoading}
                >
                  <option value="">{lang === 'bn' ? '-- একটি ক্ষেত্র নির্বাচন করুন --' : '-- Select Area of Interest --'}</option>
                  {volunteerAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {lang === 'bn' ? area.labelBn : area.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Availability Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider bengali">
                  {lang === 'bn' ? 'সময় দেয়ার সুবিধা' : 'Availability'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'weekends', labelBn: 'ছুটির দিন', labelEn: 'Weekends' },
                    { id: 'events', labelBn: 'ইভেন্ট ভিত্তিক', labelEn: 'Per Event' },
                    { id: 'flexible', labelBn: 'যে কোনো সময়', labelEn: 'Flexible' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAvailability(opt.id)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center bengali cursor-pointer ${
                        availability === opt.id
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 font-black'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {lang === 'bn' ? opt.labelBn : opt.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Additional Note (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="volunteer-notes" className="block text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider bengali">
                  {lang === 'bn' ? 'অতিরিক্ত মন্তব্য বা অভিজ্ঞতা (ঐচ্ছিক)' : 'Additional Note / Experience (Optional)'}
                </label>
                <textarea
                  id="volunteer-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={lang === 'bn' ? 'আপনার কোনো বিশেষ দক্ষতা বা পূর্ব অভিজ্ঞতা থাকলে লিখতে পারেন...' : 'Any previous volunteer experience, skills, or remarks...'}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-amber-400 focus:ring-2 focus:ring-blue-600/10 rounded-2xl p-3 text-xs font-medium transition-all outline-none resize-none"
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-3">
                <button
                  id="submit-volunteer-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-xl shadow-blue-700/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{lang === 'bn' ? 'আবেদন পাঠানো হচ্ছে...' : 'Submitting Application...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>{lang === 'bn' ? 'আবেদন জমা দিন' : 'Submit Application'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span className="bengali">
                    {lang === 'bn' ? 'আপনার যোগাযোগের তথ্য সম্পূর্ণ নিরাপদ থাকবে।' : 'Your contact information is strictly protected.'}
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
