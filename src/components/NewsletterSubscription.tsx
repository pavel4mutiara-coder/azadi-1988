import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NewsletterSubscription: React.FC = () => {
  const { lang } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Email format validation helper
  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Basic validation: Empty check
    if (!cleanEmail) {
      setStatus({
        type: 'error',
        message: lang === 'bn' 
          ? 'অনুগ্রহ করে আপনার সঠিক ইমেইল ঠিকানা প্রদান করুন।' 
          : 'Please enter your email address.'
      });
      return;
    }

    // 2. Format validation
    if (!validateEmail(cleanEmail)) {
      setStatus({
        type: 'error',
        message: lang === 'bn' 
          ? 'অনুগ্রহ করে একটি কার্যকর ইমেইল ফরম্যাট লিখুন (যেমন: name@example.com)' 
          : 'Please enter a valid email address format (e.g. name@example.com).'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock submit handler simulating network request
      await new Promise((resolve) => setTimeout(resolve, 750));

      // Retrieve existing subscribers from localStorage for local persistence simulation
      const storageKey = 'azadi_newsletter_subscribers';
      let existingList: Array<{ email: string; subscribedAt: string }> = [];
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          existingList = JSON.parse(raw);
        }
      } catch {
        existingList = [];
      }

      // Check if already subscribed
      const alreadySubscribed = existingList.some(item => item.email.toLowerCase() === cleanEmail);

      if (alreadySubscribed) {
        setStatus({
          type: 'success',
          message: lang === 'bn'
            ? 'আপনি ইতিমধ্যে আমাদের নিউজলেটারে অন্তর্ভুক্ত আছেন! ধন্যবাদ।'
            : 'You are already subscribed to our newsletter! Thank you.'
        });
      } else {
        const updatedList = [
          ...existingList,
          { email: cleanEmail, subscribedAt: new Date().toISOString() }
        ];
        localStorage.setItem(storageKey, JSON.stringify(updatedList));

        setStatus({
          type: 'success',
          message: lang === 'bn'
            ? 'ধন্যবাদ! আপনি সফলভাবে আজাদী সমাজ কল্যাণ সংঘের আপডেটে সাবস্ক্রাইব করেছেন।'
            : 'Thank you! You have successfully subscribed to Azadi Organization updates.'
        });
        setEmail('');
      }
    } catch {
      setStatus({
        type: 'error',
        message: lang === 'bn'
          ? 'সাবস্ক্রিপশন সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ পর পুনরায় চেষ্টা করুন।'
          : 'Failed to process subscription. Please try again in a moment.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="footer-newsletter-section"
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-950/80 border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl"
    >
      {/* Decorative ambient lighting */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Headline & Description */}
        <div className="lg:col-span-6 space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-black uppercase tracking-widest">
            <Sparkles size={13} className="text-amber-400" />
            <span>{lang === 'bn' ? 'সংগঠনের নিয়মিত আপডেট' : 'Stay Connected & Informed'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight bengali">
            {lang === 'bn' 
              ? 'আমাদের কার্যক্রম ও নতুন নোটিশের আপডেট পেতে সাবস্ক্রাইব করুন' 
              : 'Subscribe to Our Newsletter for Regular Updates'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-xl bengali">
            {lang === 'bn'
              ? 'সমাজসেবামূলক উদ্যোগ, ফ্রি স্বাস্থ্য ক্যাম্প, মেধা বৃত্তি ও জরুরি নোটিশের খবর সবার আগে সরাসরি আপনার ইমেইলে পেতে যুক্ত থাকুন।'
              : 'Receive our latest event announcements, humanitarian campaign summaries, and official press releases directly in your inbox.'}
          </p>
        </div>

        {/* Right Side: Form & Live Feedback */}
        <div className="lg:col-span-6 space-y-3">
          <form 
            id="newsletter-form"
            onSubmit={handleSubmit} 
            noValidate 
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Mail size={18} />
              </div>
              <input
                id="newsletter-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status?.type === 'error') setStatus(null);
                }}
                placeholder={
                  lang === 'bn' 
                    ? 'আপনার ইমেইল লিখুন (যেমন: name@example.com)' 
                    : 'Enter your email (e.g. name@example.com)'
                }
                className="w-full bg-slate-950/80 text-white placeholder-slate-500 border border-slate-700/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm font-medium transition-all shadow-inner outline-none"
                disabled={isLoading}
              />
            </div>

            <button
              id="newsletter-submit-btn"
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{lang === 'bn' ? 'যুক্ত হচ্ছে...' : 'Subscribing...'}</span>
                </>
              ) : (
                <>
                  <span>{lang === 'bn' ? 'সাবস্ক্রাইব' : 'Subscribe'}</span>
                  <Send size={15} />
                </>
              )}
            </button>
          </form>

          {/* Validation / Status Feedback Notification */}
          {status && (
            <div 
              id="newsletter-status-alert"
              className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 transition-all ${
                status.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/70 border border-rose-800 text-rose-300'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug bengali">{status.message}</span>
            </div>
          )}

          {/* Privacy & Anti-Spam Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 font-medium pl-1">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span className="bengali">
              {lang === 'bn'
                ? 'আমরা আপনার তথ্যের গোপনীয়তা রক্ষা করি। কোনো স্প্যাম পাঠানো হবে না।'
                : 'Your privacy is protected. No spam, unsubscribe at any time.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
