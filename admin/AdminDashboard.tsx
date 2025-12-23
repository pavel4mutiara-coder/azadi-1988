
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, ADMIN_NAV_ITEMS } from '../constants';
import { DonationStatus, Donation } from '../types';
import { ReceiptView } from './ReceiptView';
import { FIREBASE_PROJECT_ID } from '../firebase';
import { Link } from 'react-router-dom';
import { 
  Check, 
  X, 
  Trash2, 
  DollarSign, 
  Clock, 
  FileText,
  CheckCircle2,
  Cloud,
  AlertCircle,
  Zap,
  ServerCrash,
  Loader2,
  HelpCircle,
  Plus,
  Download,
  Users,
  Heart,
  ExternalLink,
  CreditCard,
  Settings2,
  ShieldCheck,
  Copy,
  UserCheck,
  Lock,
  ShieldAlert,
  ArrowRight,
  LayoutGrid,
  Phone
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { lang, donations, settings, updateDonation, deleteDonation, addDonation, cloudSynced, cloudSyncStatus, cloudErrorMessage, cloudErrorType, retryCloudConnection } = useApp();
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [viewingReceipt, setViewingReceipt] = useState<Donation | null>(null);
  const [showCashForm, setShowCashForm] = useState(false);
  const [cashFormData, setCashFormData] = useState({ donorName: '', amount: '', purpose: t.categories[0] });
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const pendingDonations = donations.filter(d => d.status === DonationStatus.PENDING);
  const approvedDonations = donations.filter(d => d.status === DonationStatus.APPROVED);
  const totalApproved = approvedDonations.reduce((sum, d) => sum + d.amount, 0);

  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(FIREBASE_PROJECT_ID);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /azadi_organization/state_v2 {
      allow read, write: if true;
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  const handleCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donationData = {
      donorName: cashFormData.donorName,
      isAnonymous: !cashFormData.donorName,
      amount: Number(cashFormData.amount),
      phone: 'N/A (Cash)',
      transactionId: `CASH-${Date.now()}`,
      purpose: cashFormData.purpose,
      paymentMethod: 'Cash'
    };
    addDonation(donationData);
    setCashFormData({ donorName: '', amount: '', purpose: t.categories[0] });
    setShowCashForm(false);
    alert(lang === 'bn' ? 'নগদ অনুদান যুক্ত হয়েছে!' : 'Cash donation added!');
  };

  if (viewingReceipt) {
    return (
      <ReceiptView 
        donation={viewingReceipt} 
        settings={settings} 
        onBack={() => setViewingReceipt(null)} 
      />
    );
  }

  return (
    <div className="space-y-14 animate-in fade-in duration-500 pb-20">
      {/* Cloud Connectivity Status Bar */}
      <div className={`rounded-[3rem] p-1.5 border-2 transition-all duration-500 shadow-2xl ${cloudSynced ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30 shadow-lg'}`}>
        <div className="bg-emerald-50/50 dark:bg-slate-900 rounded-[2.8rem] p-8 flex flex-col items-center justify-between gap-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 shrink-0 ${cloudSynced ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white animate-pulse'}`}>
              {cloudSynced ? <Cloud size={36} /> : (cloudErrorType === 'auth' ? <Lock size={36} /> : <ServerCrash size={36} />)}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-center lg:justify-start gap-3">
                {cloudSynced ? (lang === 'bn' ? 'ক্লাউড সিঙ্ক সক্রিয়' : 'Cloud Sync Active') : (lang === 'bn' ? 'ডাটাবেজ কানেকশন সমস্যা' : 'Cloud Access Restricted')}
                {cloudSynced ? <CheckCircle2 className="text-emerald-500" size={24} /> : <AlertCircle className="text-red-500" size={24} />}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-bold text-sm mt-2">
                {cloudSynced ? (lang === 'bn' ? 'সকল তথ্য নিরাপদে সংরক্ষিত আছে।' : 'Action required: Update security rules or project configuration.') : cloudErrorMessage}
              </p>
            </div>
            {!cloudSynced && (
              <button onClick={retryCloudConnection} disabled={cloudSyncStatus === 'syncing'} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-red-700 transition-all shrink-0">
                {cloudSyncStatus === 'syncing' ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                {cloudSyncStatus === 'syncing' ? (lang === 'bn' ? 'পরীক্ষা করা হচ্ছে...' : 'Verifying...') : (lang === 'bn' ? 'কানেকশন চেক করুন' : 'Retry Connection')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary with High Visibility */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: <DollarSign size={28}/>, label: 'Total Collections', val: `৳${totalApproved.toLocaleString()}`, color: 'emerald' },
          { icon: <Clock size={28}/>, label: 'Pending Approval', val: pendingDonations.length, color: 'amber' },
          { icon: <Users size={28}/>, label: 'Total Contributors', val: new Set(approvedDonations.map(d => d.donorName)).size, color: 'blue' },
          { icon: <Heart size={28}/>, label: 'Impact Points', val: (totalApproved/500).toFixed(0), color: 'rose' }
        ].map((stat, i) => (
          <div key={i} className="p-10 bg-emerald-50/80 dark:bg-slate-900 rounded-[3rem] border border-emerald-100 dark:border-slate-800 shadow-xl group hover:border-emerald-500 transition-all flex flex-col items-center text-center gap-4">
            <div className={`w-16 h-16 rounded-[1.5rem] bg-${stat.color}-50 dark:bg-${stat.color}-900/40 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 mb-2 shadow-inner group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1.5">{stat.label}</div>
              <div className="text-4xl font-black text-slate-900 dark:text-white transition-colors">{stat.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Module Title Section */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl">
          <LayoutGrid size={24} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {lang === 'bn' ? 'ম্যানেজমেন্ট মডিউল' : 'Management Modules'}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {ADMIN_NAV_ITEMS.map((item) => {
          const label = t[item.label as keyof typeof t] as string;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group relative bg-emerald-50/80 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-slate-800 shadow-lg hover:shadow-3xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-500 flex flex-col items-center text-center gap-5 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 group-hover:bg-emerald-500/15 rounded-bl-[2.5rem] transition-colors"></div>
              <div className="w-14 h-14 rounded-[1.25rem] bg-white dark:bg-slate-950 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-all shadow-inner border border-emerald-100 group-hover:border-emerald-500/20">
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 group-hover:text-emerald-600/60 transition-colors">{item.label}</div>
                <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-widest leading-none">{label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Donation Management with Enhanced Contrast */}
      <div className="bg-emerald-50/60 dark:bg-slate-900 rounded-[3.5rem] border border-emerald-100 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-10 border-b border-emerald-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex bg-white/50 dark:bg-slate-950 p-2 rounded-2xl border border-emerald-100 dark:border-slate-800/50">
            <button onClick={() => setActiveTab('pending')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 ${activeTab === 'pending' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Clock size={18} /> {lang === 'bn' ? 'অপেক্ষমান' : 'Pending'} ({pendingDonations.length})
            </button>
            <button onClick={() => setActiveTab('approved')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 ${activeTab === 'approved' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Check size={18} /> {lang === 'bn' ? 'অনুমোদিত' : 'Approved'}
            </button>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowCashForm(!showCashForm)} className="bg-emerald-900 dark:bg-white dark:text-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:opacity-90 shadow-2xl transition-all">
              <Plus size={18} /> {lang === 'bn' ? 'নগদ এন্ট্রি' : 'Add Cash'}
            </button>
            <button onClick={() => window.print()} className="p-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 dark:border-slate-700 shadow-md">
              <Download size={22} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/50 dark:bg-slate-950 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 border-b border-emerald-100 dark:border-slate-800">
              <tr>
                <th className="p-8">Donor Info</th>
                <th className="p-8">Method & TXID</th>
                <th className="p-8">Purpose</th>
                <th className="p-8">Amount</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 dark:divide-slate-800/60">
              {(activeTab === 'pending' ? pendingDonations : approvedDonations).map(d => (
                <tr key={d.id} className="hover:bg-white/60 dark:hover:bg-slate-950/40 transition-all duration-300">
                  <td className="p-8">
                    <div className="font-black text-slate-900 dark:text-white text-base mb-1">{d.isAnonymous ? (lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous') : d.donorName}</div>
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Phone size={12} className="text-emerald-500" /> {d.phone}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-2 flex items-center gap-2">
                      <CreditCard size={14} className="text-blue-500" /> {d.paymentMethod}
                    </div>
                    <div className="text-[10px] font-mono font-black text-slate-500 dark:text-emerald-400 bg-white/80 dark:bg-emerald-950/40 px-3 py-1 rounded-lg inline-block uppercase tracking-wider border border-emerald-50 dark:border-emerald-900/40">
                      {d.transactionId}
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">
                      {d.purpose}
                    </span>
                  </td>
                  <td className="p-8 font-black text-2xl text-slate-900 dark:text-white font-mono tracking-tighter">
                    ৳{d.amount.toLocaleString()}
                  </td>
                  <td className="p-8 text-right space-x-3">
                    {d.status === DonationStatus.PENDING && (
                      <>
                        <button onClick={() => updateDonation(d.id, DonationStatus.APPROVED)} className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                          <Check size={20} />
                        </button>
                        <button onClick={() => updateDonation(d.id, DonationStatus.REJECTED)} className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                          <X size={20} />
                        </button>
                      </>
                    )}
                    {d.status === DonationStatus.APPROVED && (
                      <button onClick={() => setViewingReceipt(d)} className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-emerald-900 dark:hover:bg-white dark:hover:text-slate-900 hover:text-white transition-all shadow-md">
                        <FileText size={20} />
                      </button>
                    )}
                    <button onClick={() => deleteDonation(d.id)} className="p-3 text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
