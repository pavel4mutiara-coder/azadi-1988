
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { DonationStatus } from '../types';
import { Copy, CheckCircle, Heart, Phone, Receipt, User, Wallet, AlertCircle } from 'lucide-react';

export const Donation: React.FC = () => {
  const { lang, settings, donations, addDonation } = useApp();
  const t = TRANSLATIONS[lang];
  
  const [formData, setFormData] = useState({ 
    donorName: '', 
    isAnonymous: false, 
    amount: '', 
    phone: '', 
    transactionId: '', 
    purpose: t.categories[0],
    paymentMethod: 'Bkash'
  });
  
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const approvedDonations = donations.filter(d => d.status === DonationStatus.APPROVED);
  const totalReceived = approvedDonations.reduce((acc, curr) => acc + curr.amount, 0);

  // Validation Logic
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    
    // Amount validation
    const amountNum = Number(formData.amount);
    if (!formData.amount) {
      errs.amount = lang === 'bn' ? 'পরিমাণ প্রদান করুন' : 'Amount is required';
    } else if (amountNum <= 0) {
      errs.amount = lang === 'bn' ? 'সঠিক পরিমাণ লিখুন' : 'Enter a valid amount';
    } else if (amountNum < 10) {
      errs.amount = lang === 'bn' ? 'ন্যূনতম ১০ টাকা' : 'Minimum 10 BDT';
    }

    // Phone validation (Bangladeshi Format: 01 followed by 9 digits)
    // Supports 013, 014, 015, 016, 017, 018, 019
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!formData.phone) {
      errs.phone = lang === 'bn' ? 'মোবাইল নম্বর লিখুন' : 'Phone is required';
    } else if (!phoneRegex.test(formData.phone)) {
      errs.phone = lang === 'bn' ? 'সঠিক ১১ ডিজিট নম্বর লিখুন (০১৮...)' : 'Enter valid 11-digit BD number (e.g. 018...)';
    }

    // Name validation
    if (!formData.isAnonymous && !formData.donorName.trim()) {
      errs.donorName = lang === 'bn' ? 'আপনার নাম লিখুন' : 'Name is required';
    }

    // Transaction ID validation
    if (!formData.transactionId.trim()) {
      errs.transactionId = lang === 'bn' ? 'ট্রানজেকশন আইডি লিখুন' : 'Transaction ID is required';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      // Mark all as touched to show errors
      const allTouched = {
        donorName: true,
        amount: true,
        phone: true,
        transactionId: true,
      };
      setTouched(allTouched);
      return;
    }

    addDonation({
      donorName: formData.donorName,
      isAnonymous: formData.isAnonymous,
      amount: Number(formData.amount),
      phone: formData.phone,
      transactionId: formData.transactionId,
      purpose: formData.purpose,
      paymentMethod: formData.paymentMethod
    });
    
    alert(lang === 'bn' ? 'ধন্যবাদ! আপনার অনুদান এডমিন অনুমোদনের অপেক্ষায় আছে।' : 'Thank you! Your donation is awaiting admin approval.');
    setFormData({ donorName: '', isAnonymous: false, amount: '', phone: '', transactionId: '', purpose: t.categories[0], paymentMethod: 'Bkash' });
    setTouched({});
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-2 duration-500">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-100 dark:border-emerald-800 shadow-2xl rotate-3">
          <Heart size={40} fill="currentColor" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">{t.donation}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto text-lg leading-relaxed">{t.paymentInstructions}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Bkash', num: settings.bkash, color: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-400 dark:border-pink-900/50' },
          { label: 'Nagad', num: settings.nagad, color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900/50' },
          { label: 'Roket', num: settings.roket, color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-900/50' },
        ].map(m => (
          <div key={m.label} className={`p-6 rounded-[2rem] border ${m.color} flex items-center justify-between shadow-lg shadow-black/5 group hover:scale-[1.02] transition-all duration-300`}>
            <div className="space-y-1">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">{m.label}</div>
              <div className="text-xl font-black font-mono tracking-tighter">{m.num}</div>
            </div>
            <button onClick={() => handleCopy(m.num, m.label)} className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
              {copyStatus === m.label ? <CheckCircle size={20} className="text-emerald-500" /> : <Copy size={20} />}
            </button>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-12 gap-10 items-start">
        <form onSubmit={handleSubmit} className="md:col-span-7 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-8 relative z-10">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Wallet className="text-emerald-600 dark:text-emerald-400" />
              {lang === 'bn' ? 'অণুদান ফরম' : 'Donation Form'}
            </h3>
            <label className="flex items-center gap-3 text-xs font-black cursor-pointer bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 select-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-emerald-600 dark:bg-slate-950 border-slate-300 dark:border-slate-700 rounded-md cursor-pointer focus:ring-emerald-500" 
                checked={formData.isAnonymous}
                onChange={e => setFormData({...formData, isAnonymous: e.target.checked})}
              />
              <span className="text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t.anonymous}</span>
            </label>
          </div>
          
          <div className="space-y-7 relative z-10">
            {!formData.isAnonymous && (
              <div className="space-y-2.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">{t.donorName}</label>
                <input 
                  required 
                  type="text" 
                  onBlur={() => handleBlur('donorName')}
                  className={`w-full bg-slate-50 dark:bg-slate-950 border ${touched.donorName && errors.donorName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} p-4.5 rounded-2xl focus:ring-2 ring-emerald-500/20 dark:ring-emerald-400/10 outline-none transition-all text-slate-900 dark:text-white font-bold`} 
                  placeholder="Full Name" 
                  value={formData.donorName} 
                  onChange={e => setFormData({...formData, donorName: e.target.value})} 
                />
                {touched.donorName && errors.donorName && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> {errors.donorName}</p>}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">{t.amount} (BDT)</label>
                <div className="relative">
                  <span className="absolute left-4.5 top-1/2 -translate-y-1/2 font-black text-emerald-600 dark:text-emerald-400 text-xl">৳</span>
                  <input 
                    required 
                    type="number" 
                    onBlur={() => handleBlur('amount')}
                    className={`w-full bg-slate-50 dark:bg-slate-950 border ${touched.amount && errors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} p-4.5 pl-10 rounded-2xl focus:ring-2 ring-emerald-500/20 dark:ring-emerald-400/10 outline-none transition-all text-slate-900 dark:text-white font-black text-2xl tracking-tighter`} 
                    placeholder="1000" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                </div>
                {touched.amount && errors.amount && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> {errors.amount}</p>}
              </div>
              <div className="space-y-2.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">{t.phone}</label>
                <input 
                  required 
                  type="tel" 
                  maxLength={11}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full bg-slate-50 dark:bg-slate-950 border ${touched.phone && errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} p-4.5 rounded-2xl focus:ring-2 ring-emerald-500/20 dark:ring-emerald-400/10 outline-none transition-all text-slate-900 dark:text-white font-bold`} 
                  placeholder="01XXXXXXXXX" 
                  value={formData.phone} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 11) setFormData({...formData, phone: val});
                  }} 
                />
                {touched.phone && errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
              </div>
            </div>
            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">{t.txid}</label>
              <input 
                required 
                type="text" 
                onBlur={() => handleBlur('transactionId')}
                className={`w-full bg-slate-50 dark:bg-slate-950 border ${touched.transactionId && errors.transactionId ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} p-4.5 rounded-2xl focus:ring-2 ring-emerald-500/20 dark:ring-emerald-400/10 outline-none transition-all text-slate-900 dark:text-white font-mono font-black uppercase text-lg tracking-wider`} 
                placeholder="TXN-ID..." 
                value={formData.transactionId} 
                onChange={e => setFormData({...formData, transactionId: e.target.value})} 
              />
              {touched.transactionId && errors.transactionId && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> {errors.transactionId}</p>}
            </div>
            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">{t.purpose}</label>
              <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl focus:ring-2 ring-emerald-500/20 dark:ring-emerald-400/10 outline-none transition-all text-slate-900 dark:text-white font-black cursor-pointer appearance-none" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}>
                {t.categories.map((c: string) => <option key={c} value={c} className="font-bold py-3 bg-white dark:bg-slate-900">{c}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!isValid && Object.keys(touched).length > 0}
            className={`w-full ${!isValid && Object.keys(touched).length > 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:-translate-y-1 active:scale-95'} text-white font-black py-5.5 rounded-[1.75rem] shadow-2xl transition-all flex items-center justify-center gap-3 text-xl ring-4 ring-emerald-500/10 group`}
          >
            <Heart size={24} className="group-hover:scale-110 transition-transform" />
            {t.submit}
          </button>
        </form>

        <div className="md:col-span-5 space-y-10">
          <div className="bg-emerald-900 dark:bg-emerald-950 p-8 md:p-10 rounded-[3rem] border-2 border-emerald-800/50 shadow-2xl flex items-center justify-between text-white group overflow-hidden relative transition-all hover:border-emerald-500/50">
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
               <Heart size={180} fill="white" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400/80">{lang === 'bn' ? 'সর্বমোট সাহায্য প্রাপ্তি' : 'Total Donations Collected'}</div>
              <div className="text-4xl md:text-5xl font-black tracking-tighter">৳ {totalReceived.toLocaleString()}</div>
            </div>
            <Receipt size={56} className="text-emerald-400 opacity-20 relative z-10" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8">
            <h3 className="text-2xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <User size={24} />
              </div>
              {t.recentDonors}
            </h3>
            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
              {approvedDonations.length === 0 ? (
                <div className="py-24 text-center space-y-4 opacity-30">
                   <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                      <Heart size={32} className="text-slate-400" />
                   </div>
                   <p className="font-bold italic text-slate-500">No approved donations yet.</p>
                </div>
              ) : (
                approvedDonations.map(d => (
                  <div key={d.id} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between group hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="space-y-2">
                      <div className="font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {d.isAnonymous ? t.anonymous : d.donorName}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">{d.purpose}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{new Date(d.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tighter">৳{d.amount.toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
