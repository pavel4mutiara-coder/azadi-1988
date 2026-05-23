
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS, ADMIN_NAV_ITEMS } from '../../utils/constants';
import { DonationStatus, Donation } from '../../types';
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
  LayoutGrid,
  Phone,
  Lock,
  LogOut,
  BellRing,
  Newspaper,
} from 'lucide-react';
import { StorageDiagnostics } from '../../components/StorageDiagnostics';


export const AdminDashboard: React.FC = () => {
  const { lang, donations, settings, updateDonation, deleteDonation, addDonation, cloudSynced, cloudSyncStatus, cloudErrorMessage, cloudErrorType, retryCloudConnection, restoreFromLegacy, logout } = useApp();
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [viewingReceipt, setViewingReceipt] = useState<Donation | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showCashForm, setShowCashForm] = useState(false);
  const [cashFormData, setCashFormData] = useState({ donorName: '', amount: '', purpose: t.categories[0] });

  const handleRestore = async () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি পুরনো ডাটাবেজ থেকে রিস্টোর করতে চান?' : 'Are you sure you want to restore from the legacy database?')) {
      setIsRestoring(true);
      await restoreFromLegacy();
      setIsRestoring(false);
    }
  };

  const pendingDonations = donations.filter(d => d.status === DonationStatus.PENDING);
  const approvedDonations = donations.filter(d => d.status === DonationStatus.APPROVED);
  const donationTotal = approvedDonations.reduce((sum, d) => sum + d.amount, 0);

  const stats = [
    { icon: <DollarSign size={24}/>, label: lang === 'bn' ? 'মোট অনুদান' : 'Total Donations', val: `৳${donationTotal.toLocaleString()}`, color: 'emerald' },
    { icon: <Heart size={24}/>, label: lang === 'bn' ? 'অনুমোদিত অনুদান' : 'Approved Donations', val: approvedDonations.length, color: 'blue' },
    { icon: <Clock size={24}/>, label: lang === 'bn' ? 'অপেক্ষমান অনুদান' : 'Pending Donations', val: pendingDonations.length, color: 'amber' },
    { icon: <Users size={24}/>, label: lang === 'bn' ? 'মোট দাতা' : 'Total Donors', val: donations.length, color: 'rose' }
  ];

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

  const getStatColors = (color: string) => {
    switch(color) {
      case 'emerald': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:ring-emerald-500/5';
      case 'blue': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:ring-blue-500/5';
      case 'amber': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:ring-amber-500/5';
      case 'rose': return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 group-hover:ring-rose-500/5';
      default: return 'bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 group-hover:ring-slate-500/5';
    }
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
      <div className={`rounded-4xl md:rounded-4xl p-0.5 border-2 transition-all duration-700 shadow-heavy ${cloudSynced ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-4xl p-5 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className={`w-16 h-16 md:w-24 md:h-24 rounded-3xl flex items-center justify-center shadow-soft shrink-0 group ${cloudSynced ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white animate-pulse'}`}>
              {cloudSynced ? <Cloud size={32} className="md:w-12 md:h-12 group-hover:scale-110 transition-transform" /> : (cloudErrorType === 'auth' ? <Lock size={32} /> : <ServerCrash size={32} />)}
            </div>
            <div className="flex-1 text-center md:text-left space-y-1">
              <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center justify-center md:justify-start gap-3">
                {cloudSynced ? (lang === 'bn' ? 'ক্লাউড সিঙ্ক সক্রিয়' : 'Cloud DB Connected') : (lang === 'bn' ? 'ডাটাবেজ কানেকশন সমস্যা' : 'Access Restricted')}
                {cloudSynced && <CheckCircle2 className="text-emerald-500 animate-in zoom-in duration-500" size={24} />}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-base opacity-80">
                {cloudSynced ? (lang === 'bn' ? 'সকল তথ্য নিরাপদে সংরক্ষিত আছে।' : 'Infrastructure is healthy. Real-time sync optimized.') : cloudErrorMessage}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={handleRestore} 
                disabled={isRestoring} 
                className="w-full md:w-auto bg-slate-900 dark:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-heavy hover:bg-slate-800 transition-all active:scale-95"
              >
                {isRestoring ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                {isRestoring ? (lang === 'bn' ? 'রিস্টোর হচ্ছে...' : 'Restoring...') : (lang === 'bn' ? 'রিস্টোর' : 'Restore')}
              </button>
              
              {!cloudSynced && (
                <button onClick={retryCloudConnection} disabled={cloudSyncStatus === 'syncing'} className="w-full md:w-auto bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-heavy active:scale-95">
                  {cloudSyncStatus === 'syncing' ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                  {cloudSyncStatus === 'syncing' ? (lang === 'bn' ? 'পরীক্ষা...' : 'Checking...') : (lang === 'bn' ? 'চেক করুন' : 'Retry')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 md:p-12 bg-white dark:bg-slate-900 rounded-4xl border border-emerald-50 dark:border-slate-800 shadow-soft flex flex-col items-center text-center gap-4 md:gap-6 group hover:shadow-heavy hover:-translate-y-2 transition-all">
            <div className={`w-14 h-14 md:w-20 md:h-20 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all ring-8 ring-transparent ${getStatColors(stat.color)}`}>
              {stat.icon}
            </div>
            <div className="min-w-0 w-full space-y-1">
              <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 truncate">{stat.label}</div>
              <div className="text-xl md:text-4xl font-black text-slate-900 dark:text-white truncate tracking-tighter drop-shadow-sm">{stat.val}</div>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 gap-3 md:gap-5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const label = t[item.label as keyof typeof t] as string;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative bg-white dark:bg-slate-900 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-md hover:border-emerald-500 transition-all flex flex-col items-center text-center gap-2 md:gap-5"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-[0.8rem] md:rounded-[1.25rem] bg-emerald-50 dark:bg-slate-950 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center transition-all border border-emerald-50 dark:border-emerald-900/30">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20, className: "md:w-7 md:h-7" })}
                </div>
                <div className="min-w-0 w-full">
                  <div className="text-[7px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">{item.label}</div>
                  <div className="text-[10px] md:text-sm font-black text-slate-900 dark:text-white truncate bengali">{label}</div>
                </div>
              </Link>
            );
          })}

          {/* Logout Action Card */}
          <button
            onClick={() => {
              if (window.confirm(lang === 'bn' ? 'আপনি কি লগআউট করতে চান?' : 'Do you want to logout?')) {
                logout();
              }
            }}
            className="group relative bg-white dark:bg-slate-900 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 dark:border-orange-950/30 shadow-md hover:border-orange-500 transition-all flex flex-col items-center text-center gap-2 md:gap-5"
          >
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-[0.8rem] md:rounded-[1.25rem] bg-orange-50 dark:bg-orange-900/20 text-orange-400 group-hover:text-orange-600 flex items-center justify-center transition-all border border-orange-50 shadow-inner">
              <LogOut size={20} className="md:w-7 md:h-7" />
            </div>
            <div className="min-w-0 w-full">
              <div className="text-[7px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">{lang === 'bn' ? 'Logout' : 'Sign Out'}</div>
              <div className="text-[10px] md:text-sm font-black text-slate-900 dark:text-white truncate bengali">{t.logout}</div>
            </div>
            {/* Hover indication */}
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-orange-500 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
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

      <div className="mt-10">
        <StorageDiagnostics />
      </div>
    </div>
  );
};
