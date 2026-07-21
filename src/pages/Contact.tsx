import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { 
  Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, 
  Share2, ExternalLink, Clock, Building2, AlertCircle, Loader2, Copy, Check
} from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { PageCTA } from '../components/PageCTA';

export const Contact: React.FC = () => {
  const { lang, settings } = useApp();
  const t = TRANSLATIONS[lang];

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const cleanPhone = settings.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsApp = (settings.adminWhatsApp || '8801712782564').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWhatsApp}`;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent('Mirbox Tula, Sylhet, Bangladesh')}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Mirbox Tula, Sylhet, Bangladesh')}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 2500);
  };

  const handleShare = async (platform: 'wa' | 'fb' | 'copy') => {
    const pageUrl = window.location.href;
    const title = lang === 'bn' ? settings.nameBn : settings.nameEn;

    if (platform === 'wa') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${pageUrl}`)}`, '_blank');
    } else if (platform === 'fb') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank');
    } else {
      handleCopy(pageUrl, 'share-link');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.contact.trim() || !formData.message.trim()) {
      setErrorMessage(lang === 'bn' ? 'অনুগ্রহ করে সকল আবশ্যকীয় ঘরগুলো পূরণ করুন।' : 'Please fill in all required fields.');
      return;
    }

    // Cooldown check (60s)
    const cooldownMs = 60 * 1000;
    const lastSubStr = localStorage.getItem('last_contact_submit');
    if (lastSubStr) {
      const diff = Date.now() - Number(lastSubStr);
      if (diff < cooldownMs) {
        const secsLeft = Math.ceil((cooldownMs - diff) / 1000);
        setErrorMessage(
          lang === 'bn'
            ? `অনুগ্রহ করে নতুন বার্তা পাঠানোর পূর্বে ${secsLeft} সেকেন্ড অপেক্ষা করুন।`
            : `Please wait ${secsLeft} seconds before sending another message.`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Simulate/Process submission securely
      await new Promise(res => setTimeout(res, 800));
      localStorage.setItem('last_contact_submit', Date.now().toString());
      setSubmitSuccess(true);
      setFormData({ name: '', contact: '', subject: '', message: '' });
    } catch (err) {
      setErrorMessage(lang === 'bn' ? 'বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero */}
      <PageHero
        icon={<Phone size={20} />}
        badgeBn="যোগাযোগ ও সহায়তা কেন্দ্র"
        badgeEn="Direct Communication"
        titleBn="যোগাযোগ করুন"
        titleEn="Get in Touch with Us"
        subtitleBn="আজাদী সমাজ কল্যাণ সংঘের সাথে সরাসরি যোগাযোগ, আবেদন, পরামর্শ বা সহযোগিতার জন্য বার্তা প্রেরণ করুন।"
        subtitleEn="Reach out directly to our leadership team for inquiries, complaints, welfare requests, or partnerships."
        breadcrumbs={[
          { labelBn: "যোগাযোগ", labelEn: "Contact" }
        ]}
      />

      {/* Direct Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        <a
          href={`tel:${cleanPhone}`}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-3xl shadow-soft hover:shadow-heavy transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
        >
          <Phone size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">
            {lang === 'bn' ? 'সরাসরি কল করুন' : 'Call Now'}
          </span>
        </a>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-700 hover:bg-emerald-800 text-white p-5 rounded-3xl shadow-soft hover:shadow-heavy transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">
            {lang === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp Us'}
          </span>
        </a>

        <a
          href={`mailto:${settings.email}`}
          className="bg-blue-700 hover:bg-blue-800 text-white p-5 rounded-3xl shadow-soft hover:shadow-heavy transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
        >
          <Mail size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">
            {lang === 'bn' ? 'ইমেইল লিখুন' : 'Send Email'}
          </span>
        </a>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 dark:bg-slate-800 text-white p-5 rounded-3xl shadow-soft hover:shadow-heavy transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
        >
          <MapPin size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">
            {lang === 'bn' ? 'ম্যাপে দেখুন' : 'Get Directions'}
          </span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">
        {/* Left Column: Official Contact Info & Map */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-heavy space-y-8">
            <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
              <span className="text-xs font-black uppercase text-blue-700 dark:text-amber-400 tracking-widest">
                {lang === 'bn' ? 'অফিসিয়াল ঠিকানা' : 'Official Headquarters'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? settings.nameBn : settings.nameEn}
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {lang === 'bn' ? settings.establishedBn : settings.establishedEn}
              </p>
            </div>

            <div className="space-y-6 text-sm font-medium">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
                  <MapPin size={20} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'কার্যালয়ের ঠিকানা' : 'Address'}
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-black leading-snug">
                    {lang === 'bn' ? settings.addressBn : settings.addressEn}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900">
                  <Phone size={20} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'ফোন ও হেল্পলাইন' : 'Phone & Hotline'}
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-black font-mono">
                    {settings.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900">
                  <Mail size={20} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-black">
                    {settings.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                {lang === 'bn' ? 'শেয়ার করুন' : 'Share Organization Page'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleShare('wa')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShare('fb')}
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-blue-800 transition-all cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>Facebook</span>
                </button>

                <button
                  onClick={() => handleShare('copy')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  {copyStatus === 'share-link' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copyStatus === 'share-link' ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'লিঙ্ক কপি' : 'Copy Link')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Box */}
          <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <MapPin size={14} className="text-blue-600" />
                <span>{lang === 'bn' ? 'গুগল ম্যাপ মানচিত্র' : 'Google Maps Location'}</span>
              </span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>{lang === 'bn' ? 'বড় ম্যাপে দেখুন' : 'View Larger'}</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="h-64 w-full bg-slate-100 dark:bg-slate-950 relative">
              <iframe
                title="Azadi Office Map"
                src={mapUrl}
                className="w-full h-full border-none"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-heavy">
          {submitSuccess ? (
            <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনার মূল্যবান বার্তাটির জন্য ধন্যবাদ। আজাদী সমাজ কল্যাণ সংঘের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।'
                    : 'Thank you for reaching out. Our team will review your inquiry and get back to you shortly.'}
                </p>
              </div>

              <button
                onClick={() => setSubmitSuccess(false)}
                className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
              >
                {lang === 'bn' ? 'আরেকটি বার্তা লিখুন' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
                <span className="text-xs font-black uppercase text-blue-700 dark:text-amber-400 tracking-widest">
                  {lang === 'bn' ? 'অনলাইন বার্তা কেন্দ্র' : 'Message Center'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'আমাদের নিকট বার্তা পাঠান' : 'Send Us a Message'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn'
                    ? 'আবেদন, অনুদান সম্পর্কিত তথ্য বা সামাজিক প্রস্তাব পাঠাতে নিচের ফরমটি পূরণ করুন।'
                    : 'Fill out the form below and your message will be forwarded directly to executive committee officers.'}
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {lang === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder={lang === 'bn' ? 'পূর্ণ নাম লিখুন' : 'Enter full name'}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {lang === 'bn' ? 'মোবাইল বা ইমেইল *' : 'Phone or Email *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact}
                      onChange={e => setFormData({ ...formData, contact: e.target.value })}
                      placeholder={lang === 'bn' ? '০১৮XXXXXXXX / mail@example.com' : 'Phone number or email'}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {lang === 'bn' ? 'বিষয়' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={lang === 'bn' ? 'বিষয়বস্তু লিখুন (যেমন: স্কলারশিপ আবেদন / অনুদান সহায়তা)' : 'Brief message subject'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {lang === 'bn' ? 'আপনার বার্তা *' : 'Your Message *'}
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder={lang === 'bn' ? 'আপনার বক্তব্য বিস্তারিত লিখুন...' : 'Write your message details here...'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{lang === 'bn' ? 'বার্তা পাঠানো হচ্ছে...' : 'Sending Message...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>{lang === 'bn' ? 'বার্তা পাঠান' : 'Submit Message'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};
