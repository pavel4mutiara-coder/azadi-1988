
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { DonationStatus, Donation as DonationType } from '../types';
import { Copy, CheckCircle, Heart, Phone, Receipt, User, Wallet, AlertCircle, Mail } from 'lucide-react';
import { ReceiptView } from '../admin/ReceiptView';

export const Donation: React.FC = () => {
  const { lang, settings, donations, addDonation } = useApp();
  const t = TRANSLATIONS[lang];
  
  const [formData, setFormData] = useState({ 
    donorName: '', 
    isAnonymous: false, 
    amount: '', 
    phone: '', 
    email: '', // Added email
    transactionId: '', 
    purpose: t.categories[0],
    paymentMethod: 'Bkash'
  });
  
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submittedDonation, setSubmittedDonation] = useState<DonationType | null>(null);

  const approvedDonations = donations.filter(d => d.status === DonationStatus.APPROVED);
  const totalReceived = approvedDonations.reduce((acc, curr) => acc + curr.amount, 0);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    const amountNum = Number(formData.amount);
    if (!formData.amount) {
      errs.amount = lang === 'bn' ? 'পরিমাণ প্রদান করুন' : 'Amount is required';
    } else if (amountNum <= 0) {
      errs.amount = lang === 'bn' ? 'সঠিক পরিমাণ লিখুন' : 'Enter a valid amount';
    } else if (amountNum < 10) {
      errs.amount = lang === 'bn' ? 'ন্যূনতম ১০ টাকা' : 'Minimum 10 BDT';
    }

    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!formData.phone) {
      errs.phone = lang === 'bn' ? 'মোবাইল নম্বর লিখুন' : 'Phone is required';
    } else if (!phoneRegex.test(formData.phone)) {
      errs.phone = lang === 'bn' ? 'সঠিক ১১ ডিজিট নম্বর লিখুন (০১৮...)' : 'Enter valid 11-digit BD number';
    }

    if (!formData.isAnonymous && !formData.donorName.trim()) {
      errs.donorName = lang === 'bn' ? 'আপনার নাম লিখুন' : 'Name is required';
    }

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
      setTouched({ donorName: true, amount: true, phone: true, transactionId: true });
      return;
    }

    const newDonation: any = {
      donorName: formData.donorName,
      isAnonymous: formData.isAnonymous,
      amount: Number(formData.amount),
      phone: formData.phone,
      email: formData.email,
      transactionId: formData.transactionId,
      purpose: formData.purpose,
      paymentMethod: formData.paymentMethod,
      date: new Date().toISOString(),
      id: Date.now().toString(),
      status: DonationStatus.PENDING
    };

    addDonation(newDonation);
    setSubmittedDonation(newDonation);
    setFormData({ donorName: '', isAnonymous: false, amount: '', phone: '', email: '', transactionId: '', purpose: t.categories[0], paymentMethod: 'Bkash' });
    setTouched({});
  };

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

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-2 duration-500 pb-20 bengali">
      
      {/* Arabic Calligraphy Header Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-emerald-950 p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-2xl border border-emerald-800 transition-all group">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabic-bazazz.png')] group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-400/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 space-y-8 w-full">
          <div className="mb-2 transform transition-transform duration-700">
            <div className="text-4xl md:text-7xl text-emerald-300 font-serif italic tracking-wide drop-shadow-[0_0_15px_rgba(110,231,183,0.3)] select-none pointer-events-none">
               وَمَا تُنْفِقُوا مِنْ خَيْرٍ فَلِأَنْفُسِكُمْ
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent rounded-full"></div>
            <div className="space-y-3 max-w-2xl px-4">
              <p className="text-emerald-50 dark:text-emerald-100/90 text-lg md:text-xl font-medium leading-relaxed bengali" style={{ fontFamily: '"Noto Sans Bengali", sans-serif', letterSpacing: 'normal' }}>
                {lang === 'bn' 
                  ? '“তোমরা যে উত্তম বস্তু ব্যয় করো, তা তোমাদের নিজেদের কল্যাণের জন্যই”'
                  : '“Whatever good you spend is for your own souls”'}
              </p>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/60 bengali">
                — {lang === 'bn' ? 'সূরা আল-বাকারা: ২৭২' : 'Surah Al-Baqarah: 272'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-xl rotate-3">
          <Heart size={40} fill="currentColor" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">{t.donation}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto text-base md:text-lg leading-relaxed">{t.paymentInstructions}</p>
      </div>

      {/* Payment Numbers */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Bkash', num: settings.bkash, color: 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-900/50' },
          { label: 'Nagad', num: settings.nagad, color: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50' },
          { label: 'Roket', num: settings.roket, color: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50' },
        ].map(m => (
          <div key={m.label} className={`p-8 rounded-[2.5rem] border ${m.color} flex items-center justify-between shadow-lg shadow-black/5 group hover:scale-[1.02] transition-all duration-300`}>
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{m.label}</div>
              <div className="text-2xl font-black font-mono tracking-tighter">{m.num}</div>
            </div>
            <button onClick={() => handleCopy(m.num, m.label)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
              {copyStatus === m.label ? <CheckCircle size={22} className="text-emerald-500" /> : <Copy size={22} />}
            </button>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-12 gap-10 items-start">
        <form onSubmit={handleSubmit} className="md:col-span-7 bg-emerald-100/40 dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border border-emerald-200 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-slate-800 pb-8 relative z-10">
            <h3 className="text-2xl font-black text-emerald-900 dark:text-white flex items-center gap-3">
              <Wallet className="text-emerald-600 dark:text-emerald-400" />
              {lang === 'bn' ? 'অণুদান ফরম' : 'Donation Form'}
            </h3>
            <label className="flex items-center gap-3 text-[10px] font-black cursor-pointer bg-white/70 dark:bg-slate-950 px-5 py-3 rounded-2xl border border-emerald-200 dark:border-slate-800 select-none hover:bg-emerald-50 dark:hover:bg-slate-900 transition-colors">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-emerald-600 dark:bg-slate-950 border-emerald-300 dark:border-slate-700 rounded-lg cursor-pointer focus:ring-emerald-500" 
                checked={formData.isAnonymous}
                onChange={e => setFormData({...formData, isAnonymous: e.target.checked})}
              />
              <span className="text-emerald-800 dark:text-slate-300 uppercase tracking-widest">{t.anonymous}</span>
            </label>
          </div>
          
          <div className="space-y-8 relative z-10">
            {!formData.isAnonymous && (
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-slate-500 ml-1">{t.donorName}</label>
                <input 
                  required 
                  type="text" 
                  onBlur={() => handleBlur('donorName')}
                  className={`w-full bg-emerald-50/60 dark:bg-slate-950 border ${touched.donorName && errors.donorName ? 'border-red-500' : 'border-emerald-200/50 dark:border-slate-800'} p-5 rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder-emerald-800/30`} 
                  placeholder="আপনার পূর্ণ নাম লিখুন" 
                  value={formData.donorName} 
                  onChange={e => setFormData({...formData, donorName: e.target.value})} 
                />
                {touched.donorName && errors.donorName && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> {errors.donorName}</p>}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-slate-500 ml-1">{t.amount} (BDT)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-600 dark:text-emerald-400 text-2xl">৳</span>
                  <input 
                    required 
                    type="number" 
                    onBlur={() => handleBlur('amount')}
                    className={`w-full bg-emerald-50/60 dark:bg-slate-950 border ${touched.amount && errors.amount ? 'border-red-500' : 'border-emerald-200/50 dark:border-slate-800'} p-5 pl-12 rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white font-black text-3xl tracking-tighter placeholder-emerald-800/30`} 
                    placeholder="1000" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                </div>
                {touched.amount && errors.amount && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> {errors.amount}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-slate-500 ml-1">{t.phone}</label>
                <input 
                  required 
                  type="tel" 
                  maxLength={11}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full bg-emerald-50/60 dark:bg-slate-950 border ${touched.phone && errors.phone ? 'border-red-500' : 'border-emerald-200/50 dark:border-slate-800'} p-5 rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder-emerald-800/30`} 
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

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-slate-500 ml-1">{lang === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600/50" size={20} />
                  <input 
                    type="email" 
                    className="w-full bg-emerald-50/60 dark:bg-slate-950 border border-emerald-200/50 dark:border-slate-800 p-5 pl-12 rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder-emerald-800/30" 
                    placeholder="example@mail.com" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-slate-500 ml-1">{t.txid}</label>
                <input 
                  required 
                  type="text" 
                  onBlur={() => handleBlur('transactionId')}
                  className={`w-full bg-emerald-50/60 dark:bg-slate-950 border ${touched.transactionId && errors.transactionId ? 'border-red-500' : 'border-emerald-200/50 dark:border-slate-800'} p-5 rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white font-mono font-black uppercase text-xl tracking-wider placeholder-emerald-800/30`} 
                  placeholder="TRX12345..." 
                  value={formData.transactionId} 
                  onChange={e => setFormData({...formData, transactionId: e.target.value})} 
                />
                {touched.transactionId && errors.transactionId && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> {errors.transactionId}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-slate-500 ml-1">{t.purpose}</label>
              <select className="w-full bg-emerald-50/60 dark:bg-slate-950 border border-emerald-200/50 dark:border-slate-800 p-5 rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all text-emerald-950 dark:text-white font-black cursor-pointer appearance-none" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}>
                {t.categories.map((c: string) => <option key={c} value={c} className="font-bold py-3 bg-white dark:bg-slate-900">{c}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!isValid && Object.keys(touched).length > 0}
            className={`w-full ${!isValid && Object.keys(touched).length > 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:-translate-y-1 active:scale-95'} text-white font-black py-6 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-3 text-xl ring-4 ring-emerald-500/10 group`}
          >
            <Heart size={26} className="group-hover:scale-110 transition-transform" />
            {t.submit}
          </button>
        </form>

        <div className="md:col-span-5 space-y-10">
          <div className="bg-emerald-900 dark:bg-emerald-950 p-10 rounded-[3.5rem] border-2 border-emerald-800/50 shadow-2xl flex items-center justify-between text-white group overflow-hidden relative transition-all">
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-125 transition-all duration-1000">
               <Heart size={180} fill="white" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400/80">{lang === 'bn' ? 'সর্বমোট সাহায্য প্রাপ্তি' : 'Total Donations'}</div>
              <div className="text-4xl font-black tracking-tighter">৳ {totalReceived.toLocaleString()}</div>
            </div>
            <Receipt size={56} className="text-emerald-400 opacity-20 relative z-10" />
          </div>

          <div className="bg-emerald-100/30 dark:bg-slate-900 p-8 rounded-[3.5rem] border border-emerald-200/60 dark:border-slate-800 shadow-2xl space-y-8">
            <h3 className="text-xl font-black flex items-center gap-4 text-emerald-950 dark:text-white">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100">
                <User size={24} />
              </div>
              {t.recentDonors}
            </h3>
            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
              {approvedDonations.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-30">
                   <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                      <Heart size={32} className="text-slate-400" />
                   </div>
                   <p className="font-bold italic text-slate-500">No approved donations yet.</p>
                </div>
              ) : (
                approvedDonations.map(d => (
                  <div key={d.id} className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-500 transition-all shadow-sm">
                    <div className="space-y-1">
                      <div className="font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {d.isAnonymous ? t.anonymous : d.donorName}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/40 px-3 py-1 rounded-full">{d.purpose}</span>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(d.date).toLocaleDateString()}</span>
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
