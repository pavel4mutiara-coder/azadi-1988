
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
  LayoutGrid
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
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Cloud Connectivity Status Bar */}
      <div className={`rounded-[3rem] p-1 border-2 transition-all duration-500 ${cloudSynced ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30 shadow-lg'}`}>
        <div className="bg-white dark:bg-slate-900 rounded-[2.9rem] p-6 flex flex-col items-center justify-between gap-6">
          <div className="flex flex-col lg:flex-row items-center gap-6 w-full">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl transition-all duration-500 shrink-0 ${cloudSynced ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white animate-pulse'}`}>
              {cloudSynced ? <Cloud size={32} /> : (cloudErrorType === 'auth' ? <Lock size={32} /> : <ServerCrash size={32} />)}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-center lg:justify-start gap-2">
                {cloudSynced ? (lang === 'bn' ? 'ক্লাউড সিঙ্ক সক্রিয়' : 'Cloud Sync Active') : (lang === 'bn' ? 'ডাটাবেজ কানেকশন সমস্যা' : 'Cloud Access Restricted')}
                {cloudSynced ? <CheckCircle2 className="text-emerald-500" size={18} /> : <AlertCircle className="text-red-500" size={18} />}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xs mt-1">
                {cloudSynced ? (lang === 'bn' ? 'সকল তথ্য নিরাপদে সংরক্ষিত আছে।' : 'Action required: Update security rules or project configuration.') : cloudErrorMessage}
              </p>
            </div>
            {!cloudSynced && (
              <button onClick={retryCloudConnection} disabled={cloudSyncStatus === 'syncing'} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg hover:bg-red-700 transition-all shrink-0">
                {cloudSyncStatus === 'syncing' ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                {cloudSyncStatus === 'syncing' ? (lang === 'bn' ? 'পরীক্ষা করা হচ্ছে...' : 'Verifying...') : (lang === 'bn' ? 'কানেকশন চেক করুন' : 'Retry Connection')}
              </button>
            )}
          </div>

          {!cloudSynced && (
            <div className="mt-4 p-8 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-red-200 dark:border-red-900/30 rounded-[2.5rem] w-full animate-in zoom-in-95 duration-500">
               <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
                  <div className={`p-4 rounded-3xl ${cloudErrorType === 'auth' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'} shadow-lg`}>
                    {cloudErrorType === 'auth' ? <ShieldAlert size={40} /> : (cloudErrorType === 'billing-required' ? <CreditCard size={40} /> : <Settings2 size={40} />)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                       {cloudErrorType === 'auth' ? (lang === 'bn' ? 'সিকিউরিটি রুল আপডেট করুন' : 'Update Security Rules')
                          : cloudErrorType === 'billing-required' ? (lang === 'bn' ? 'বিলিং সক্রিয় করুন' : 'Enable Project Billing')
                          : (lang === 'bn' ? 'ডাটাবেজ কনফিগারেশন' : 'Initialize Database Instance')}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                      <UserCheck size={16} className="text-emerald-500" />
                      <span>Project Admin: <span className="text-slate-900 dark:text-slate-100">gp01712782564@gmail.com</span></span>
                    </div>
                  </div>
               </div>
               
               <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-1 h-px bg-emerald-500 rounded-full"></div>
                       <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Resolution Steps</h4>
                    </div>
                    
                    {cloudErrorType === 'auth' ? (
                      <ul className="space-y-6">
                        <li className="flex gap-5 group">
                          <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg group-hover:bg-rose-600 transition-colors">1</span>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Open Firestore Rules</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                              Visit <a href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/rules`} target="_blank" className="text-emerald-600 underline font-black inline-flex items-center gap-1">Rules Console <ExternalLink size={12}/></a>
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-5 group">
                          <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg group-hover:bg-rose-600 transition-colors">2</span>
                          <div className="space-y-3 w-full">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Copy & Paste these rules:</p>
                            <div className="relative group/code">
                              <pre className="text-[10px] font-mono bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-800 overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /azadi_organization/state_v2 {
      allow read, write: if true;
    }
  }
}`}
                              </pre>
                              <button onClick={handleCopyRules} className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
                                {copiedRules ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        </li>
                        <li className="flex gap-5 group">
                          <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg group-hover:bg-rose-600 transition-colors">3</span>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Publish Changes</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                              Click the blue <strong>"Publish"</strong> button in Firebase. Then return here and click <strong>"Retry Connection"</strong>.
                            </p>
                          </div>
                        </li>
                      </ul>
                    ) : cloudErrorType === 'billing-required' ? (
                      <ul className="space-y-6">
                        <li className="flex gap-5 group">
                          <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg group-hover:bg-emerald-600 transition-colors">1</span>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Open Billing Console</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                              Visit the <a href={`https://console.developers.google.com/billing/enable?project=${FIREBASE_PROJECT_ID}`} target="_blank" className="text-emerald-600 underline font-black inline-flex items-center gap-1">Billing Setup Link <ExternalLink size={12}/></a>
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-5 group">
                          <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg group-hover:bg-emerald-600 transition-colors">2</span>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Verify Project & Account</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                              Ensure project <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">{FIREBASE_PROJECT_ID}</span> is selected in the top bar.
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-5 group">
                          <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg group-hover:bg-emerald-600 transition-colors">3</span>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Link Payment Method</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                              Follow the prompts to add or link an existing billing account. 
                              <span className="block mt-1 text-amber-600 font-black">※ Note: Google requires ~10 mins to propagate this update.</span>
                            </p>
                          </div>
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-6">
                        <li className="flex gap-5 group">
                          <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg group-hover:bg-emerald-600 transition-colors">1</span>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Open Firebase Console</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                              Visit <a href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore`} target="_blank" className="text-emerald-600 underline font-black inline-flex items-center gap-1">Firestore Setup <ExternalLink size={12}/></a>
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-5 group">
                          <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg group-hover:bg-emerald-600 transition-colors">2</span>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Create Database</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                              Click "Create Database", choose "Start in test mode", and pick a server location.
                            </p>
                          </div>
                        </li>
                      </ul>
                    )}
                 </div>
                 
                 <div className="bg-emerald-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-slate-800 shadow-xl self-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck size={100} />
                    </div>
                    <div className="flex items-center gap-3 text-emerald-600 mb-5">
                      <HelpCircle className="w-6 h-6" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Safe Offline Mode</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
                      Your data is currently stored in a <strong>Permanent Local Database</strong> linked to your browser. 
                      You will not lose any information.
                    </p>
                    <div className="mt-6 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-emerald-100 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Project ID Helper</p>
                      <div className="flex items-center justify-between">
                         <code className="text-sm font-mono text-emerald-600">{FIREBASE_PROJECT_ID}</code>
                         <button onClick={handleCopyProjectId} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                           {copiedId ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                         </button>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Modules Quick Access */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg">
            <LayoutGrid size={20} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {lang === 'bn' ? 'ম্যানেজমেন্ট মডিউল' : 'Management Modules'}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const label = t[item.label as keyof typeof t] as string;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 flex flex-col items-center text-center gap-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-bl-[2rem] transition-colors"></div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-all shadow-inner">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{item.label}</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-widest">{label}</div>
                </div>
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight size={16} className="text-emerald-500 animate-pulse" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:border-emerald-500 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
            <DollarSign size={24} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Total Collections</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">৳{totalApproved.toLocaleString()}</div>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:border-amber-500 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
            <Clock size={24} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Pending Approval</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{pendingDonations.length}</div>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:border-blue-500 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
            <Users size={24} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Total Contributors</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{new Set(approvedDonations.map(d => d.donorName)).size}</div>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl group hover:border-rose-500 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6">
            <Heart size={24} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Impact Points</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{(totalApproved/500).toFixed(0)}</div>
        </div>
      </div>

      {/* Donation Management */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl">
            <button onClick={() => setActiveTab('pending')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-md' : 'text-slate-500'}`}>
              <Clock size={16} /> {lang === 'bn' ? 'অপেক্ষমান' : 'Pending'} ({pendingDonations.length})
            </button>
            <button onClick={() => setActiveTab('approved')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'approved' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500'}`}>
              <Check size={16} /> {lang === 'bn' ? 'অনুমোদিত' : 'Approved'}
            </button>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowCashForm(!showCashForm)} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:opacity-80 transition-all">
              <Plus size={16} /> {lang === 'bn' ? 'নগদ অন্ট্রি' : 'Add Cash'}
            </button>
            <button onClick={() => window.print()} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-200 dark:border-slate-700">
              <Download size={18} />
            </button>
          </div>
        </div>

        {showCashForm && (
          <form onSubmit={handleCashSubmit} className="p-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
             <input required type="text" placeholder="Donor Name" className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold" value={cashFormData.donorName} onChange={e => setCashFormData({...cashFormData, donorName: e.target.value})} />
             <input required type="number" placeholder="Amount (৳)" className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold" value={cashFormData.amount} onChange={e => setCashFormData({...cashFormData, amount: e.target.value})} />
             <select className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold" value={cashFormData.purpose} onChange={e => setCashFormData({...cashFormData, purpose: e.target.value})}>
               {t.categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
             </select>
             <button type="submit" className="bg-emerald-600 text-white font-black rounded-xl py-3 hover:bg-emerald-700 transition-all shadow-lg">Save Cash Entry</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-6">Donor Info</th>
                <th className="p-6">Method & TXID</th>
                <th className="p-6">Purpose</th>
                <th className="p-6">Amount</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(activeTab === 'pending' ? pendingDonations : approvedDonations).map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                  <td className="p-6">
                    <div className="font-black text-slate-900 dark:text-white">{d.isAnonymous ? (lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous') : d.donorName}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{d.phone}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">{d.paymentMethod}</div>
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">{d.transactionId}</div>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">
                      {d.purpose}
                    </span>
                  </td>
                  <td className="p-6 font-black text-xl text-slate-900 dark:text-white font-mono tracking-tighter">
                    ৳{d.amount.toLocaleString()}
                  </td>
                  <td className="p-6 text-right space-x-2">
                    {d.status === DonationStatus.PENDING && (
                      <>
                        <button onClick={() => updateDonation(d.id, DonationStatus.APPROVED)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                          <Check size={18} />
                        </button>
                        <button onClick={() => updateDonation(d.id, DonationStatus.REJECTED)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                          <X size={18} />
                        </button>
                      </>
                    )}
                    {d.status === DonationStatus.APPROVED && (
                      <button onClick={() => setViewingReceipt(d)} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 hover:text-white transition-all">
                        <FileText size={18} />
                      </button>
                    )}
                    <button onClick={() => deleteDonation(d.id)} className="p-2.5 text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {(activeTab === 'pending' ? pendingDonations : approvedDonations).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 italic font-medium">
                    No donations found in this queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
