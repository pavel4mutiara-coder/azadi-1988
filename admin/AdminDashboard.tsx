
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { DonationStatus, Donation } from '../types';
import { ReceiptView } from './ReceiptView';
import { 
  Check, 
  X, 
  Trash2, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  LayoutGrid, 
  FileText,
  History,
  CheckCircle2,
  Database,
  RefreshCw,
  Cloud,
  CloudOff,
  AlertCircle,
  ExternalLink,
  Zap,
  Activity
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { lang, donations, settings, updateDonation, deleteDonation, clearAllData, cloudSynced, cloudApiError, syncDatabase, retryCloudConnection } = useApp();
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [viewingReceipt, setViewingReceipt] = useState<Donation | null>(null);

  const pendingDonations = donations.filter(d => d.status === DonationStatus.PENDING);
  const approvedDonations = donations.filter(d => d.status === DonationStatus.APPROVED);
  const totalApproved = approvedDonations.reduce((sum, d) => sum + d.amount, 0);

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
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* PROFESSIONAL DATABASE STATUS HEADER */}
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/20 rounded-[2.5rem] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${cloudSynced ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse'}`}>
             {cloudSynced ? <Cloud size={32} /> : <CloudOff size={32} />}
           </div>
           <div>
             <div className="flex items-center gap-2">
               <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Database Status:</h2>
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cloudSynced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                 {cloudSynced ? 'ONLINE & SYNCED' : 'LOCAL ONLY (API ERROR)'}
               </span>
             </div>
             <p className="text-xs text-slate-500 font-bold mt-1">
               {cloudSynced 
                 ? 'সব ডাটা এখন নিরাপদভাবে গুগল ক্লাউডে সেভ হচ্ছে।' 
                 : 'সতর্কতা: ডাটাবেস এপিআই বন্ধ আছে। নিচের বাটনটি ব্যবহার করে এটি ঠিক করুন।'}
             </p>
           </div>
        </div>

        {!cloudSynced && (
          <div className="flex flex-col sm:flex-row gap-3">
             <a 
              href={`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=hussain-5124c`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl"
            >
              ১. এপিআই সচল করুন <ExternalLink size={14} />
            </a>
            <button 
              onClick={retryCloudConnection}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl"
            >
              ২. রি-কানেক্ট করুন <Zap size={14} fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:border-emerald-500 transition-all duration-300">
          <div className="w-14 h-14 rounded-[1.25rem] bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <DollarSign size={28} />
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">Total Donations</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">৳{totalApproved.toLocaleString()}</div>
        </div>
        
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:border-amber-500 transition-all duration-300">
          <div className="w-14 h-14 rounded-[1.25rem] bg-amber-50 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <Clock size={28} />
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">Pending Approvals</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{pendingDonations.length}</div>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:border-blue-500 transition-all duration-300">
          <div className="w-14 h-14 rounded-[1.25rem] bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <Activity size={28} />
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">Database Link</div>
          <div className={`text-xl font-black tracking-tighter uppercase ${cloudSynced ? 'text-emerald-600' : 'text-amber-600'}`}>
            {cloudSynced ? 'Active Sync' : 'Local Persistence'}
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:border-purple-500 transition-all duration-300">
          <div className="w-14 h-14 rounded-[1.25rem] bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <LayoutGrid size={28} />
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">Total Records</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{donations.length}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-6 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'pending' 
                ? 'text-amber-600 bg-amber-50/30 dark:bg-amber-900/10 border-b-4 border-amber-500' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Clock size={18} />
            {lang === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Awaiting Approval'}
            <span className="ml-2 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full text-[10px]">{pendingDonations.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-6 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'approved' 
                ? 'text-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/10 border-b-4 border-emerald-500' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 size={18} />
            {lang === 'bn' ? 'অনুমোদিত অনুদান' : 'Approved Donations'}
            <span className="ml-2 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full text-[10px]">{approvedDonations.length}</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500">
              <tr>
                <th className="px-10 py-6">Donor Info</th>
                <th className="px-10 py-6">Amount</th>
                <th className="px-10 py-6">Transaction ID</th>
                <th className="px-10 py-6">Purpose & Date</th>
                <th className="px-10 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {(activeTab === 'pending' ? pendingDonations : approvedDonations).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                     <div className="flex flex-col items-center gap-6 opacity-20 dark:opacity-10 grayscale">
                        <div className={`p-8 rounded-full ${activeTab === 'pending' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          {activeTab === 'pending' ? <Check size={80} className="text-emerald-600" strokeWidth={3} /> : <History size={80} className="text-slate-600" strokeWidth={3} />}
                        </div>
                        <p className="font-black italic text-2xl tracking-tight">
                          {activeTab === 'pending' ? 'No pending transactions to review.' : 'No approved donations yet.'}
                        </p>
                     </div>
                  </td>
                </tr>
              ) : (
                (activeTab === 'pending' ? pendingDonations : approvedDonations).map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors text-lg tracking-tight">
                        {d.isAnonymous ? (lang === 'bn' ? 'বেনামী দাতা' : 'Anonymous Donor') : d.donorName}
                      </div>
                      <div className="text-sm font-bold text-slate-500 dark:text-slate-500 mt-1.5 flex items-center gap-2 font-mono">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
                        {d.phone}
                      </div>
                    </td>
                    <td className="px-10 py-8 font-black text-emerald-700 dark:text-emerald-400 text-2xl font-mono tracking-tighter">৳{d.amount.toLocaleString()}</td>
                    <td className="px-10 py-8">
                      <span className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 shadow-sm">
                        {d.transactionId}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/50 w-fit mb-2">{d.purpose}</div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{new Date(d.date).toLocaleString()}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex gap-4 justify-center">
                        {activeTab === 'pending' ? (
                          <>
                            <button 
                              onClick={() => updateDonation(d.id, DonationStatus.APPROVED)} 
                              className="p-4 bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-emerald-500/10" 
                              title="Approve"
                            >
                              <Check size={22} strokeWidth={4} />
                            </button>
                            <button 
                              onClick={() => updateDonation(d.id, DonationStatus.REJECTED)} 
                              className="p-4 bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-2xl hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-amber-500/10" 
                              title="Reject"
                            >
                              <X size={22} strokeWidth={4} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setViewingReceipt(d)} 
                            className="p-4 bg-slate-100/80 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all hover:scale-110 active:scale-95 shadow-lg flex items-center gap-2" 
                            title="Download Receipt"
                          >
                            <FileText size={20} strokeWidth={2.5} />
                            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Receipt</span>
                          </button>
                        )}
                        <button 
                          onClick={() => deleteDonation(d.id)} 
                          className="p-4 bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-2xl hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-500/10" 
                          title="Delete"
                        >
                          <Trash2 size={22} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
