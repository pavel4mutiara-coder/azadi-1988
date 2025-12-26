
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { DonationStatus, Donation } from '../types';
import { Search, History, Calendar, Heart, FileText, CheckCircle2, Clock, Filter, Phone, Hash } from 'lucide-react';
import { ReceiptView } from '../admin/ReceiptView';

export const DonationHistory: React.FC = () => {
  const { lang, donations, settings } = useApp();
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      const query = searchQuery.toLowerCase();
      return (
        d.donorName.toLowerCase().includes(query) ||
        d.phone.includes(query) ||
        d.transactionId.toLowerCase().includes(query)
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [donations, searchQuery]);

  if (selectedDonation) {
    return (
      <ReceiptView 
        donation={selectedDonation} 
        settings={settings} 
        onBack={() => setSelectedDonation(null)} 
        isPublic={true}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 bengali">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-xl rotate-3">
          <History size={40} />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
          {lang === 'bn' ? 'অণুদানের ইতিহাস' : 'Donation History'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          {lang === 'bn' 
            ? 'আপনার মোবাইল নম্বর বা ট্রানজেকশন আইডি দিয়ে অণুদানের স্থিতি চেক করুন।' 
            : 'Check your donation status using your phone number or Transaction ID.'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search size={24} className="text-emerald-500" />
        </div>
        <input 
          type="text" 
          placeholder={lang === 'bn' ? 'নম্বর বা আইডি দিয়ে খুঁজুন...' : 'Search by Phone or Transaction ID...'}
          className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-slate-800 p-6 pl-14 rounded-[2rem] text-lg font-bold shadow-2xl focus:border-emerald-500 outline-none transition-all placeholder-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* History List */}
      <div className="space-y-6">
        {filteredDonations.length > 0 ? (
          filteredDonations.map((d) => (
            <div 
              key={d.id} 
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-emerald-50 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl hover:scale-[1.01] transition-all group border-b-8 border-b-emerald-500/10"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                <Heart size={32} fill={d.status === DonationStatus.APPROVED ? "currentColor" : "none"} />
              </div>

              <div className="flex-1 text-center md:text-left space-y-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {d.isAnonymous ? t.anonymous : d.donorName}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    d.status === DonationStatus.APPROVED 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                    : d.status === DonationStatus.PENDING 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                  }`}>
                    {d.status === DonationStatus.APPROVED ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                    {d.status}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                  <div className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(d.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div className="flex items-center gap-1.5"><Hash size={12}/> {d.transactionId}</div>
                  <div className="flex items-center gap-1.5"><Filter size={12}/> {d.purpose}</div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tighter">৳{d.amount.toLocaleString()}</div>
                {d.status === DonationStatus.APPROVED && (
                  <button 
                    onClick={() => setSelectedDonation(d)}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
                  >
                    <FileText size={14}/> {t.downloadReceipt}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 bg-emerald-50/30 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-emerald-100 dark:border-slate-800 text-center space-y-6">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Search size={40} className="text-slate-300" />
            </div>
            <p className="font-black uppercase tracking-[0.3em] text-xs text-slate-400">
              {lang === 'bn' ? 'কোন তথ্য পাওয়া যায়নি' : 'No records found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
