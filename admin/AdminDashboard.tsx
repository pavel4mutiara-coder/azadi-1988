
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, ADMIN_NAV_ITEMS } from '../constants';
import { DonationStatus, Donation } from '../types';
import { ReceiptView } from './ReceiptView';
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
  Plus,
  Download,
  Users,
  Heart,
  CreditCard,
  LayoutGrid,
  Phone,
  Lock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { lang, donations, settings, updateDonation, deleteDonation, addDonation, cloudSynced, cloudSyncStatus, cloudErrorMessage, cloudErrorType, retryCloudConnection } = useApp();
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [viewingReceipt, setViewingReceipt] = useState<Donation | null>(null);
  const [showCashForm, setShowCashForm] = useState(false);
  const [cashFormData, setCashFormData] = useState({ donorName: '', amount: '', purpose: t.categories[0] });

  const pendingDonations = donations.filter(d => d.status === DonationStatus.PENDING);
  const approvedDonations = donations.filter(d => d.status === DonationStatus.APPROVED);
  const totalApproved = approvedDonations.reduce((sum, d) => sum + d.amount, 0);

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
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      
      {/* Cloud Connectivity Status Bar */}
      <div className={`rounded-[1.5rem] md:rounded-[3rem] p-0.5 border-2 transition-all duration-500 shadow-xl ${cloudSynced ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="bg-emerald-50/50 dark:bg-slate-900 rounded-[1.4rem] md:rounded-[2.8rem] p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className={`w-12 h-12 md:w-20 md:h-20 rounded-[1rem] md:rounded-[2rem] flex items-center justify-center shadow-lg shrink-0 ${cloudSynced ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white animate-pulse'}`}>
              {cloudSynced ? <Cloud size={24} className="md:w-9 md:h-9" /> : (cloudErrorType === 'auth' ? <Lock size={24} /> : <ServerCrash size={24} />)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-base md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
                {cloudSynced ? (lang === 'bn' ? 'ক্লাউড সিঙ্ক সক্রিয়' : 'Cloud Sync Active') : (lang === 'bn' ? 'ডাটাবেজ কানেকশন সমস্যা' : 'Cloud Access Restricted')}
                {cloudSynced ? <CheckCircle2 className="text-emerald-500" size={16} /> : <AlertCircle className="text-red-500" size={16} />}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-bold text-[10px] md:text-sm mt-1">
                {cloudSynced ? (lang === 'bn' ? 'সকল তথ্য নিরাপদে সংরক্ষিত আছে।' : 'Action required: Update security rules.') : cloudErrorMessage}
              </p>
            </div>
            {!cloudSynced && (
              <button onClick={retryCloudConnection} disabled={cloudSyncStatus === 'syncing'} className="w-full md:w-auto bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl">
                {cloudSyncStatus === 'syncing' ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
                {cloudSyncStatus === 'syncing' ? (lang === 'bn' ? 'পরীক্ষা করা হচ্ছে...' : 'Verifying...') : (lang === 'bn' ? 'চেক করুন' : 'Retry')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
        {[
          { icon: <DollarSign size={20}/>, label: 'Total Collections', val: `৳${totalApproved.toLocaleString()}`, color: 'emerald' },
          { icon: <Clock size={20}/>, label: 'Pending Approval', val: pendingDonations.length, color: 'amber' },
          { icon: <Users size={20}/>, label: 'Contributors', val: new Set(approvedDonations.map(d => d.donorName)).size, color: 'blue' },
          { icon: <Heart size={20}/>, label: 'Impact Points', val: (totalApproved/500).toFixed(0), color: 'rose' }
        ].map((stat, i) => (
          <div key={i} className="p-4 md:p-10 bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] border border-emerald-100 dark:border-slate-800 shadow-md flex flex-col items-center text-center gap-1 md:gap-4">
            <div className={`w-10 h-10 md:w-16 md:h-16 rounded-[0.8rem] md:rounded-[1.5rem] bg-${stat.color}-50 dark:bg-${stat.color}-900/40 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 shadow-inner`}>
              {stat.icon}
            </div>
            <div className="min-w-0 w-full">
              <div className="text-[8px] md:text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{stat.label}</div>
              <div className="text-sm md:text-3xl font-black text-slate-900 dark:text-white truncate">{stat.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-emerald-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg">
            <LayoutGrid size={16} className="md:w-6 md:h-6" />
          </div>
          <h2 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight bengali">
            {lang === 'bn' ? 'ম্যানেজমেন্ট মডিউল' : 'Management Modules'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const label = t[item.label as keyof typeof t] as string;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative bg-white dark:bg-slate-900 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-md hover:border-emerald-500 transition-all flex flex-col items-center text-center gap-2 md:gap-5"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-[0.8rem] md:rounded-[1.25rem] bg-emerald-50 dark:bg-slate-950 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center transition-all border border-emerald-50">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20, className: "md:w-7 md:h-7" })}
                </div>
                <div className="min-w-0 w-full">
                  <div className="text-[7px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">{item.label}</div>
                  <div className="text-[10px] md:text-sm font-black text-slate-900 dark:text-white truncate bengali">{label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Donation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[3.5rem] border border-emerald-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 md:p-10 border-b border-emerald-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800/50 w-full sm:w-auto">
            <button onClick={() => setActiveTab('pending')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'pending' ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-md' : 'text-slate-500'}`}>
              <Clock size={14} /> {lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}
            </button>
            <button onClick={() => setActiveTab('approved')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'approved' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500'}`}>
              <Check size={14} /> {lang === 'bn' ? 'অনুমোদিত' : 'Approved'}
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setShowCashForm(!showCashForm)} className="flex-1 sm:flex-none bg-emerald-900 dark:bg-white dark:text-slate-900 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2">
              <Plus size={14} /> {lang === 'bn' ? 'নগদ এন্ট্রি' : 'Add Cash'}
            </button>
            <button onClick={() => window.print()} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200">
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[8px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-emerald-50 dark:border-slate-800">
              <tr>
                <th className="p-4 md:p-8">Donor Info</th>
                <th className="p-4 md:p-8">Transaction</th>
                <th className="p-4 md:p-8">Amount</th>
                <th className="p-4 md:p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 dark:divide-slate-800/60">
              {(activeTab === 'pending' ? pendingDonations : approvedDonations).map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 md:p-8">
                    <div className="font-black text-slate-900 dark:text-white text-xs md:text-base mb-0.5 bengali leading-none">{d.isAnonymous ? (lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous') : d.donorName}</div>
                    <div className="text-[8px] md:text-[10px] font-bold text-slate-400 flex items-center gap-1">
                       <Phone size={8} className="text-emerald-500" /> {d.phone}
                    </div>
                  </td>
                  <td className="p-4 md:p-8">
                    <div className="text-[8px] md:text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase mb-1">
                      {d.paymentMethod}
                    </div>
                    <div className="text-[8px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded uppercase border border-emerald-100 dark:border-emerald-900/40 truncate max-w-[80px] md:max-w-none">
                      {d.transactionId}
                    </div>
                  </td>
                  <td className="p-4 md:p-8 font-black text-sm md:text-2xl text-slate-900 dark:text-white font-mono tracking-tighter">
                    ৳{d.amount.toLocaleString()}
                  </td>
                  <td className="p-4 md:p-8 text-right space-x-1 md:space-x-3 whitespace-nowrap">
                    {d.status === DonationStatus.PENDING && (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => updateDonation(d.id, DonationStatus.APPROVED)} className="p-1.5 md:p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                          <Check size={14} />
                        </button>
                        <button onClick={() => updateDonation(d.id, DonationStatus.REJECTED)} className="p-1.5 md:p-3 bg-rose-100 text-rose-600 rounded-lg">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {d.status === DonationStatus.APPROVED && (
                      <button onClick={() => setViewingReceipt(d)} className="p-1.5 md:p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                        <FileText size={14} />
                      </button>
                    )}
                    <button onClick={() => deleteDonation(d.id)} className="p-1.5 md:p-3 text-slate-300 hover:text-red-500">
                      <Trash2 size={14} />
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
