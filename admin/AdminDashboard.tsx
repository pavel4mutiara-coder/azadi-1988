
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { DonationStatus, Donation } from '../types';
import { ReceiptView } from './ReceiptView';
import { FIREBASE_PROJECT_ID } from '../firebase';
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
  Activity,
  ServerCrash,
  Loader2,
  Terminal,
  HelpCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { lang, donations, settings, updateDonation, deleteDonation, clearAllData, cloudSynced, cloudApiError, cloudSyncStatus, cloudErrorMessage, syncDatabase, retryCloudConnection } = useApp();
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [viewingReceipt, setViewingReceipt] = useState<Donation | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(true);

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
      {/* PROFESSIONAL DATABASE REPAIR CENTER */}
      <div className={`rounded-[3rem] p-1 border-2 transition-all duration-500 ${cloudSynced ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)]'}`}>
        <div className="bg-white dark:bg-slate-900 rounded-[2.9rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 ${cloudSynced ? 'bg-emerald-600 text-white rotate-0' : 'bg-red-600 text-white animate-pulse -rotate-3'}`}>
              {cloudSynced ? <Cloud size={40} /> : <ServerCrash size={40} />}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                {cloudSynced ? 'ডাটাবেজ কানেক্টেড' : 'ডাটাবেজ এরর: এপিআই বন্ধ'}
                {cloudSynced ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-red-500" />}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md leading-snug">
                {cloudSynced 
                  ? 'আপনার সকল ডাটা বর্তমানে গুগল ক্লাউডে নিরাপদে সিঙ্ক হচ্ছে।' 
                  : `আপনার 'azadi-93ad1' প্রজেক্টে এপিআই সচল করা হয়নি। নিচের ধাপগুলো অনুসরণ করুন।`}
              </p>
            </div>
          </div>

          {!cloudSynced && (
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
              <div className="flex flex-col gap-2">
                <a 
                  href={`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${FIREBASE_PROJECT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl group border-2 border-slate-800"
                >
                  <div className="flex flex-col items-start leading-none">
                     <span className="text-[10px] opacity-60 uppercase mb-1">Step 1</span>
                     <span>এপিআই সচল করুন</span>
                  </div>
                  <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                <p className="text-[10px] text-center font-black opacity-40 uppercase tracking-widest">Project: {FIREBASE_PROJECT_ID}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={retryCloudConnection}
                  disabled={cloudSyncStatus === 'syncing'}
                  className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 border-2 border-red-700"
                >
                  <div className="flex flex-col items-start leading-none text-left">
                     <span className="text-[10px] opacity-60 uppercase mb-1">Step 2</span>
                     <span>কানেক্ট করুন</span>
                  </div>
                  {cloudSyncStatus === 'syncing' ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                </button>
                <p className="text-[9px] text-center font-bold opacity-40 uppercase tracking-widest">{cloudSyncStatus === 'syncing' ? 'চেক হচ্ছে...' : 'এপিআই অন করার ৩ মিনিট পর'}</p>
              </div>
            </div>
          )}
          
          {cloudSynced && (
             <div className="hidden lg:flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                <Activity size={20} className="text-emerald-600" />
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Cloud Database Active</span>
             </div>
          )}
        </div>
      </div>

      {/* SYSTEM DIAGNOSTICS LOG */}
      {!cloudSynced && showDiagnostic && (
        <div className="bg-slate-900 text-emerald-400 p-8 rounded-[2.5rem] font-mono text-xs border border-slate-800 shadow-2xl animate-in slide-in-from-top duration-300">
           <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                 <Terminal size={20} />
                 <span className="font-black uppercase tracking-[0.2em] text-sm">System Diagnostic Log</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                 <Activity size={12} className="text-amber-500 animate-pulse" />
                 Status: {cloudSyncStatus.toUpperCase()}
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-black/40 p-4 rounded-xl space-y-2 border border-slate-800">
                    <p className="opacity-40 uppercase font-black tracking-widest text-[9px]">Target Project Info</p>
                    <p className="text-white font-black text-sm">{FIREBASE_PROJECT_ID}</p>
                    <p className="text-[10px] opacity-60">এই আইডিটি আপনার গুগল কনসোলের সাথে মিলতে হবে।</p>
                 </div>
                 <div className="bg-black/40 p-4 rounded-xl space-y-2 border border-slate-800">
                    <p className="opacity-40 uppercase font-black tracking-widest text-[9px]">Raw Error Code</p>
                    <p className="text-red-400 font-black text-sm">{cloudErrorMessage || 'No active error logged yet.'}</p>
                    <p className="text-[10px] opacity-60">PERMISSION_DENIED এর মানে এপিআই বন্ধ আছে।</p>
                 </div>
              </div>
              
              <div className="bg-amber-900/10 border border-amber-900/30 p-6 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-widest text-[11px]">
                    <HelpCircle size={16} />
                    সমাধান গাইড:
                 </div>
                 <ol className="list-decimal list-inside space-y-2 text-slate-300 font-medium text-[11px] leading-relaxed">
                    <li>প্রথমে <span className="text-white font-black">"১. এপিআই সচল করুন"</span> বাটনে ক্লিক করুন।</li>
                    <li>ব্রাউজারে নতুন পেজ খুললে নিশ্চিত হোন আপনি <span className="text-white font-black">{FIREBASE_PROJECT_ID}</span> প্রজেক্টে আছেন।</li>
                    <li>সেখানে বড় করে নীল রঙের <span className="text-emerald-400 font-black">"ENABLE"</span> বাটনটি চাপুন।</li>
                    <li>বাটনটি অদৃশ্য হওয়া পর্যন্ত অপেক্ষা করুন (এর মানে এটি সচল হয়েছে)।</li>
                    <li>২-৩ মিনিট অপেক্ষা করে আবার এই পেজে এসে <span className="text-red-400 font-black">"২. কানেক্ট করুন"</span> বাটনে চাপুন।</li>
                 </ol>
              </div>
           </div>
        </div>
      )}

      {/* Stats Cards and other parts remain the same... */}
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
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">Sync Accuracy</div>
          <div className={`text-xl font-black tracking-tighter uppercase ${cloudSynced ? 'text-emerald-600' : 'text-amber-600'}`}>
            {cloudSynced ? '100% Cloud' : 'Local Only'}
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

      {/* Tables and other parts continue below... */}
    </div>
  );
};
