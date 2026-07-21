import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { DonationStatus, Donation as DonationType } from '../types';
import { 
  Copy, CheckCircle2, Heart, Receipt, User, Wallet, AlertCircle, 
  Mail, Info, MousePointerClick, Smartphone, FileCheck, Send, X, Loader2,
  ShieldCheck, Lock, Search, FileText, Check, ArrowRight, Building2, HelpCircle
} from 'lucide-react';
import { ReceiptView } from './admin/ReceiptView';
import { parseLocalDate } from '../utils/parseLocalDate';
import { PageHero } from '../components/PageHero';
import { PageCTA } from '../components/PageCTA';

export const Donation: React.FC = () => {
  const { lang, settings, donations, addDonation } = useApp();
  const t = TRANSLATIONS[lang];

  const [formData, setFormData] = useState({
    donorName: '',
    isAnonymous: false,
    amount: '',
    phone: '',
    email: '',
    transactionId: '',
    purpose: t.categories?.[0] || 'General Welfare',
    paymentMethod: 'bKash',
  });

  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submittedDonation, setSubmittedDonation] = useState<DonationType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedDonations = donations.filter(d => d.status === DonationStatus.APPROVED);
  const totalReceived = approvedDonations.reduce((acc, curr) => acc + curr.amount, 0);

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    const amountNum = Number(formData.amount);
    if (!formData.amount) {
      errs.amount = lang === 'bn' ? 'অনুদানের পরিমাণ লিখুন' : 'Amount is required';
    } else if (amountNum <= 0) {
      errs.amount = lang === 'bn' ? 'সঠিক পরিমাণ প্রদান করুন' : 'Enter a valid amount';
    }

    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!formData.phone) {
      errs.phone = lang === 'bn' ? '১১ ডিজিটের মোবাইল নম্বর লিখুন' : 'Phone is required';
    } else if (!phoneRegex.test(formData.phone)) {
      errs.phone = lang === 'bn' ? 'সঠিক মোবাইল নম্বর প্রদান করুন (০১৮...)' : 'Valid 11-digit BD number required';
    }

    if (!formData.isAnonymous && !formData.donorName.trim()) {
      errs.donorName = lang === 'bn' ? 'দাতার নাম প্রদান করুন' : 'Name is required';
    }

    if (!formData.transactionId.trim()) {
      errs.transactionId = lang === 'bn' ? 'ট্রানজেকশন আইডি প্রদান করুন' : 'Transaction ID is required';
    }

    return errs;
  }, [formData, lang]);

  const isValid = Object.keys(errors).length === 0;

  const handleCopy = (num: string, type: string) => {
    navigator.clipboard.writeText(num);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ donorName: true, amount: true, phone: true, transactionId: true });
      return;
    }

    if (isSubmitting) return;

    // Cooldown check (60 seconds)
    const cooldownMs = 60 * 1000;
    const lastSubStr = localStorage.getItem('last_donation_submit');
    if (lastSubStr) {
      const diff = Date.now() - Number(lastSubStr);
      if (diff < cooldownMs) {
        const secsLeft = Math.ceil((cooldownMs - diff) / 1000);
        alert(
          lang === 'bn'
            ? `অনুগ্রহ করে নতুন জমা দেওয়ার পূর্বে ${secsLeft} সেকেন্ড অপেক্ষা করুন।`
            : `Please wait ${secsLeft} seconds before submitting again.`
        );
        return;
      }
    }

    setIsSubmitting(true);

    const cleanTxId = formData.transactionId.trim().toUpperCase().replace(/[^A-Z0-9_\-]/g, '') || Date.now().toString();

    const newDonation: DonationType = {
      id: cleanTxId,
      donorName: formData.donorName || 'Anonymous Giver',
      isAnonymous: formData.isAnonymous,
      amount: Number(formData.amount),
      phone: formData.phone,
      email: formData.email,
      transactionId: formData.transactionId,
      purpose: formData.purpose,
      paymentMethod: formData.paymentMethod,
      date: new Date().toISOString(),
      status: DonationStatus.PENDING
    };

    try {
      await addDonation(newDonation);
      localStorage.setItem('last_donation_submit', Date.now().toString());
      setSubmittedDonation(newDonation);
      setFormData({
        donorName: '',
        isAnonymous: false,
        amount: '',
        phone: '',
        email: '',
        transactionId: '',
        purpose: t.categories?.[0] || 'General Welfare',
        paymentMethod: 'bKash',
      });
      setTouched({});
    } catch (err) {
      alert(lang === 'bn' ? 'অনুদান জমা দিতে সমস্যা হয়েছে।' : 'Error submitting donation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const donationFlowSteps = [
    {
      step: 1,
      titleBn: "অনুদানের পরিমাণ",
      titleEn: "Choose Amount",
      descBn: "আপনার সামর্থ্য অনুযায়ী যেকোনো পরিমাণ অর্থ নির্বাচন করুন।",
      descEn: "Select any contribution amount according to your ability."
    },
    {
      step: 2,
      titleBn: "পেমেন্ট পদ্ধতি",
      titleEn: "Payment Method",
      descBn: "বিকাশ, নগদ, রকেট বা ব্যাংক অ্যাকাউন্ট সিলেক্ট করুন।",
      descEn: "Select bKash, Nagad, Rocket, or direct bank transfer."
    },
    {
      step: 3,
      titleBn: "অর্থ প্রেরণ",
      titleEn: "Complete Payment",
      descBn: "মোবাইল অ্যাপ বা ইউএসএসডি কোড ব্যবহার করে অর্থ পাঠান।",
      descEn: "Send money via mobile app or USSD codes (*247# / *167#)."
    },
    {
      step: 4,
      titleBn: "তথ্য জমা দিন",
      titleEn: "Submit TrxID",
      descBn: "পেমেন্টের ট্রানজেকশন আইডি ফরমে লিখে জমা দিন।",
      descEn: "Fill out the transaction ID & reference details in the form."
    },
    {
      step: 5,
      titleBn: "অপেক্ষাধীন স্থিতি",
      titleEn: "Pending Status",
      descBn: "আপনার অনুদানটি PENDING ক্যাটাগরিতে পর্যালোচনায় সংরক্ষিত হবে।",
      descEn: "Your submission enters PENDING status for financial audit."
    },
    {
      step: 6,
      titleBn: "ম্যানুয়াল যাচাইকরণ",
      titleEn: "Verification",
      descBn: "অর্থ কর্মকর্তা ব্যাংক লগ মিলিয়ে তথ্য অনুমোদন করবেন।",
      descEn: "Officers manually verify the TrxID with live banking records."
    },
    {
      step: 7,
      titleBn: "অফিসিয়াল রিসিট",
      titleEn: "Official Receipt",
      descBn: "অনুমোদনের পর কিউআর কোডসহ রিসিট ডাউনলোড করতে পারবেন।",
      descEn: "Download your official QR-verified PDF receipt anytime."
    }
  ];

  if (submittedDonation) {
    return (
      <ReceiptView 
        donation={submittedDonation} 
        settings={settings} 
        onBack={() => setSubmittedDonation(null)} 
        isPublic={true}
      />
    );
  }

  // Active verified payment methods
  const paymentMethods = [
    { name: 'bKash', number: settings.bkash, color: 'border-pink-500/30 bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400' },
    { name: 'Nagad', number: settings.nagad, color: 'border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400' },
    { name: 'Rocket', number: settings.roket, color: 'border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400' }
  ].filter(m => Boolean(m.number));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero */}
      <PageHero
        icon={<Heart size={20} />}
        badgeBn="অনলাইন অনুদান পোর্টাল"
        badgeEn="Official Donation Portal"
        titleBn="আজাদী সমাজ কল্যাণ সংঘে অনুদান"
        titleEn="Support Our Community Welfare Projects"
        subtitleBn="আপনার সদকা ও যাকাত সিলেটের দুঃস্থ পরিবার, শিক্ষা স্কলারশিপ ও স্বাস্থ্যসেবায় স্বচ্ছতার সাথে ব্যবহৃত হয়।"
        subtitleEn="100% of your public contributions directly empower marginalized families, student stipends, and relief drives."
        breadcrumbs={[
          { labelBn: "অনুদান", labelEn: "Donation" }
        ]}
      />

      {/* Islamic Quranic Calligraphy Hero Banner */}
      <div className="mb-16 p-8 sm:p-12 rounded-4xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 border border-emerald-500/30 shadow-heavy text-center relative overflow-hidden">
        <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
          <div dir="rtl" className="text-3xl sm:text-5xl text-emerald-300 font-serif leading-relaxed drop-shadow-[0_2px_10px_rgba(52,211,153,0.3)]">
            <span className="text-amber-400 opacity-80 mr-2">﴿</span>
            وَمَا تُنْفِقُوا مِنْ خَيْرٍ فَلِأَنْفُسِكُمْ
            <span className="text-amber-400 opacity-80 ml-2">﴾</span>
          </div>

          <p className="text-emerald-100 text-sm sm:text-lg font-medium leading-relaxed">
            {lang === 'bn' 
              ? '“তোমরা যে উত্তম বস্তু ব্যয় করো, তা তোমাদের নিজেদের কল্যাণের জন্যই”'
              : '“Whatever good you spend is for your own souls”'}
          </p>

          <span className="inline-block px-4 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[11px] font-black uppercase tracking-widest text-amber-300">
            {lang === 'bn' ? '— সূরা আল-বাকারা: ২৭২' : '— Surah Al-Baqarah: 272'}
          </span>
        </div>
      </div>

      {/* 7-Step Institutional Process Flow */}
      <div className="mb-16 bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-heavy space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-blue-700 dark:text-amber-400 tracking-widest">
              {lang === 'bn' ? 'অনুদানের স্বচ্ছ পরিক্রমা' : 'Transparent Process Flow'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {lang === 'bn' ? '৭টি ধাপে অনুদান প্রদান ও রিসিট পাওয়ার নিয়ম' : 'How Your Donation is Processed & Verified'}
            </h2>
          </div>

          <Link
            to="/verify-donation"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0"
          >
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>{lang === 'bn' ? 'রশিদ সত্যতা যাচাই করুন' : 'Verify a Receipt'}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {donationFlowSteps.map((s) => (
            <div key={s.step} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-blue-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {s.step}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">Step 0{s.step}</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-xs text-slate-900 dark:text-white">
                  {lang === 'bn' ? s.titleBn : s.titleEn}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {lang === 'bn' ? s.descBn : s.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Numbers */}
      <div className="mb-16 space-y-6">
        <h3 className="text-xs font-black uppercase text-blue-700 dark:text-amber-400 tracking-widest">
          {lang === 'bn' ? 'অফিসিয়াল মোবাইল ব্যাংকিং হিসাব' : 'Official Payment Channels'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {paymentMethods.map(m => (
            <div 
              key={m.name} 
              className={`p-6 rounded-3xl border ${m.color} flex items-center justify-between shadow-soft hover:shadow-heavy transition-all duration-300`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{m.name} Personal / Merchant</span>
                <div className="text-xl font-black font-mono tracking-tight">{m.number}</div>
              </div>

              <button 
                onClick={() => handleCopy(m.number, m.name)} 
                className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                {copyStatus === m.name ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Donation Form & Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        {/* Form Container */}
        <form 
          onSubmit={handleSubmit} 
          className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-heavy space-y-8"
        >
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-blue-700 dark:text-amber-400 tracking-widest">
                {lang === 'bn' ? 'অনলাইন অনুদান পেশ করুন' : 'Submit Contribution'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="text-blue-600 dark:text-amber-400" size={24} />
                <span>{lang === 'bn' ? 'অনুদান জমা ফর্ম' : 'Donation Form'}</span>
              </h3>
            </div>

            <label className="flex items-center gap-2 text-[11px] font-black cursor-pointer bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 select-none">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-blue-600 rounded cursor-pointer" 
                checked={formData.isAnonymous}
                onChange={e => setFormData({...formData, isAnonymous: e.target.checked})}
              />
              <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t.anonymous}</span>
            </label>
          </div>

          <div className="space-y-6">
            {!formData.isAnonymous && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">
                  {t.donorName} *
                </label>
                <input 
                  type="text" 
                  onBlur={() => handleBlur('donorName')}
                  className={`w-full bg-slate-50 dark:bg-slate-950 border ${touched.donorName && errors.donorName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all`} 
                  placeholder={lang === 'bn' ? 'আপনার পূর্ণ নাম লিখুন' : 'Enter your full name'} 
                  value={formData.donorName} 
                  onChange={e => setFormData({...formData, donorName: e.target.value})} 
                />
                {touched.donorName && errors.donorName && (
                  <p className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.donorName}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">
                  {t.amount} (BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">৳</span>
                  <input 
                    type="number" 
                    onBlur={() => handleBlur('amount')}
                    className={`w-full bg-slate-50 dark:bg-slate-950 border ${touched.amount && errors.amount ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} p-4 pl-10 rounded-2xl text-lg font-black font-mono text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all`} 
                    placeholder="1000" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                </div>
                {touched.amount && errors.amount && (
                  <p className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">
                  {t.phone} *
                </label>
                <input 
                  type="tel" 
                  maxLength={11}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full bg-slate-50 dark:bg-slate-950 border ${touched.phone && errors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} p-4 rounded-2xl text-sm font-bold font-mono text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all`} 
                  placeholder="01XXXXXXXXX" 
                  value={formData.phone} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 11) setFormData({...formData, phone: val});
                  }} 
                />
                {touched.phone && errors.phone && (
                  <p className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">
                  {lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                </label>
                <select 
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cash / Handover">In-Person Cash</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">
                  {t.txid} *
                </label>
                <input 
                  type="text" 
                  onBlur={() => handleBlur('transactionId')}
                  className={`w-full bg-slate-50 dark:bg-slate-950 border ${touched.transactionId && errors.transactionId ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} p-4 rounded-2xl text-sm font-mono font-black uppercase tracking-wider text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all`} 
                  placeholder="TRX12345..." 
                  value={formData.transactionId} 
                  onChange={e => setFormData({...formData, transactionId: e.target.value})} 
                />
                {touched.transactionId && errors.transactionId && (
                  <p className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.transactionId}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">
                {t.purpose}
              </label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all cursor-pointer" 
                value={formData.purpose} 
                onChange={e => setFormData({...formData, purpose: e.target.value})}
              >
                {t.categories?.map((c: string) => (
                  <option key={c} value={c} className="font-bold py-2 bg-white dark:bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-heavy transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>{lang === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing Submission...'}</span>
              </>
            ) : (
              <>
                <Heart size={20} className="text-amber-400" />
                <span>{t.submit}</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Total Raised Summary & Trust Guarantees */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-10 rounded-4xl border border-blue-800/40 shadow-heavy text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                {lang === 'bn' ? 'অনুমোদিত সর্বমোট কল্যাণ দান' : 'Total Approved Raised'}
              </span>
              <Receipt size={24} className="text-blue-400" />
            </div>

            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
              ৳ {totalReceived.toLocaleString()}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>{lang === 'bn' ? 'অনুমোদিত ট্রানজেকশন' : 'Approved Records'}</span>
              <span className="font-bold text-amber-400 font-mono">{approvedDonations.length}</span>
            </div>
          </div>

          {/* Institutional Trust Guarantees Block */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
            <h4 className="text-xs font-black uppercase text-blue-700 dark:text-amber-400 tracking-wider flex items-center gap-2">
              <ShieldCheck size={18} />
              <span>{lang === 'bn' ? 'আমাদের সামাজিক নিরাপত্তা গ্যারান্টি' : 'Trust & Stewardship Guarantees'}</span>
            </h4>

            <div className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>{lang === 'bn' ? 'অনুদানের তথ্য সরাসরি ম্যানুয়ালি যাচাই করা হয় এবং PENDING থেকে APPROVED করা হয়।' : 'Every submission undergoes 100% manual bank statement audit before approval.'}</p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>{lang === 'bn' ? 'অনুমোদনের সাথে সাথে ডিজিটাল রিসিট এবং কিউআর ভেরিফিকেশন তৈরি হয়।' : 'Approved donations generate an official digital receipt with QR authenticity scan.'}</p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>{lang === 'bn' ? 'দাতার ফোন ও ব্যক্তিগত বিবরণ সুরক্ষিত রাখা হয় এবং কখনো প্রকাশ করা হয় না।' : 'Donor privacy is guaranteed — phone & private contact info remain strictly concealed.'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                to="/donation-history"
                className="text-xs font-black text-blue-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1 hover:underline"
              >
                <span>{lang === 'bn' ? 'অণুদানের ইতিহাস দেখুন' : 'Check Donation Records'}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};
