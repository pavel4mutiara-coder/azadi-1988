import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { CURRENT_VERSION } from '../../utils/version';
import { 
  Shield, Cloud, CloudOff, RefreshCcw, Download, UploadCloud, 
  Trash2, LogOut, Loader2, ArrowUpCircle, Info, Database, 
  CheckCircle, AlertTriangle, RefreshCw, Smartphone, Save,
  Activity, Clock, Server, Wifi, WifiOff
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const SystemAdmin: React.FC = () => {
  const { 
    lang, 
    user,
    logout,
    cloudSyncStatus,
    retryCloudConnection,
    exportBackup,
    importBackup,
    restoreFromLegacy,
    resetAllData,
    versionConfig,
    saveVersionConfig,
    syncHealth
  } = useApp();
  
  const navigate = useNavigate();
  const t = TRANSLATIONS[lang];
  
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [localVersion, setLocalVersion] = useState<any>(null);
  const [savingVersion, setSavingVersion] = useState(false);

  useEffect(() => {
    if (versionConfig) {
      setLocalVersion({ ...versionConfig });
    }
  }, [versionConfig]);

  const superAdminEmail = import.meta.env.VITE_SUPERADMIN_EMAIL || 'azadisocialwelfareorganization@gmail.com';
  const isSuperAdmin = user?.email === superAdminEmail;

  const showStatus = (type: 'success' | 'error', textBn: string, textEn: string) => {
    setStatusMessage({
      type,
      text: lang === 'bn' ? textBn : textEn
    });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const formatSyncTime = (isoString: string | null) => {
    if (!isoString) return lang === 'bn' ? 'কখনো না' : 'Never';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  const getCollectionLabel = (name: string) => {
    const labels: Record<string, { en: string; bn: string }> = {
      settings: { en: 'Organization Settings', bn: 'প্রতিষ্ঠান সেটিংস' },
      letterhead: { en: 'Letterhead Config', bn: 'লেটারহেড কনফিগ' },
      donations: { en: 'Donation Ledgers', bn: 'অনুদান লেজারসমূহ' },
      leadership: { en: 'Committee Leadership', bn: 'কমিটি ও নেতৃত্ব' },
      events: { en: 'Public Events', bn: 'জনসাধারণের ইভেন্ট' },
      notices: { en: 'Urgent Notices', bn: 'জরুরী নোটিশসমূহ' },
      news: { en: 'News & Media', bn: 'সংবাদ ও মিডিয়া' },
      expenses: { en: 'Expense Ledgers', bn: 'ব্যয় লেজারসমূহ' },
      version: { en: 'App Versioning', bn: 'অ্যাপ সংস্করণ' },
    };
    return labels[name]?.[lang] || name;
  };

  const handleForceSync = async () => {
    setLoadingAction('sync');
    try {
      await retryCloudConnection();
      await new Promise(r => setTimeout(r, 1200));
      showStatus('success', 'ফায়ারবেস ডাটাবেস সফলভাবে সিঙ্ক করা হয়েছে!', 'Cloud database successfully synced!');
    } catch (e) {
      showStatus('error', 'সিঙ্ক ব্যর্থ হয়েছে। সংযোগ পরীক্ষা করুন।', 'Sync failed. Please check connection.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExport = async () => {
    setLoadingAction('export');
    try {
      await new Promise(r => setTimeout(r, 1000));
      exportBackup();
      showStatus('success', 'ডাটাবেস ব্যাকআপ (JSON) সফলভাবে ডাউনলোড করা হয়েছে!', 'Database backup (JSON) exported successfully!');
    } catch (e) {
      showStatus('error', 'ব্যাকআপ রফতানি করতে ব্যর্থ হয়েছে।', 'Failed to export backup.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(lang === 'bn' 
      ? 'আপনি কি এই ব্যাকআপ ফাইলটি আমদানি করতে চান? এটি বর্তমান ডাটাবেজের ওপর লেখা হতে পারে।' 
      : 'Are you sure you want to import this backup file? This may overwrite current record states.')) {
      e.target.value = '';
      return;
    }

    setLoadingAction('import');
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) throw new Error('Empty file');
        const success = await importBackup(text);
        if (success) {
          showStatus('success', 'ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে!', 'Database backup successfully restored!');
        } else {
          showStatus('error', 'ব্যাকআপ রিস্টোর করতে ব্যর্থ হয়েছে!', 'Failed to restore backup!');
        }
      } catch (err) {
        showStatus('error', 'ভুল ফাইল ফরম্যাট। অনুগ্রহ করে একটি সঠিক ব্যাকআপ ফাইল নির্বাচন করুন।', 'Invalid file format. Please select a valid JSON backup.');
      } finally {
        setLoadingAction(null);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleReSeed = async () => {
    if (!isSuperAdmin) {
      alert(lang === 'bn' 
        ? 'অ্যাক্সেস অস্বীকার করা হয়েছে: শুধুমাত্র প্রধান ডেভেলপার ডেমো ডাটা রিসেট করতে পারবেন।' 
        : 'Access Denied: Only the primary developer is permitted to seed default template data.');
      return;
    }

    const input = window.prompt(lang === 'bn' 
      ? `অনুমোদনের জন্য অনুগ্রহ করে আপনার ডেভেলপার ইমেল (${superAdminEmail}) টাইপ করুন:` 
      : `Please type your developer email (${superAdminEmail}) to confirm:`);
    if (input !== superAdminEmail) {
      alert(lang === 'bn' ? 'অনুমোদন ব্যর্থ হয়েছে।' : 'Authorization failed.');
      return;
    }

    if (window.confirm(lang === 'bn' 
      ? 'আপনি কি পূর্ববর্তী ডেমো ডেটা রিস্টোর করতে চান? আপনার বর্তমান সমস্ত পরিবর্তন মুছে যাবে।' 
      : 'Are you sure you want to restore default template data? All existing settings and records will be replaced.')) {
      setLoadingAction('maintenance');
      try {
        await restoreFromLegacy();
        showStatus('success', 'সফলভাবে ডাটাবেজ ডেমো ডাটা রিস্টোর হয়েছে!', 'Default database template successfully re-seeded!');
      } catch (e) {
        showStatus('error', 'রিস্টোর করতে ব্যর্থ হয়েছে।', 'Failed to seed defaults.');
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const handleWipeDatabase = async () => {
    if (!isSuperAdmin) {
      alert(lang === 'bn' 
        ? 'অ্যাক্সেস অস্বীকার করা হয়েছে: শুধুমাত্র প্রধান ডেভেলপার ডাটাবেজ খালি করতে পারবেন।' 
        : 'Access Denied: Only the primary developer is permitted to wipe the database.');
      return;
    }

    const input = window.prompt(lang === 'bn' 
      ? 'ডাটাবেজ সম্পুর্ণ খালি করতে অনুগ্রহ করে "WIPE DATABASE" টাইপ করুন:' 
      : 'Please type "WIPE DATABASE" in all caps to confirm database wipe:');
    if (input !== 'WIPE DATABASE') {
      alert(lang === 'bn' ? 'মুছে ফেলার কাজ বাতিল করা হয়েছে।' : 'Wipe operation cancelled.');
      return;
    }

    if (window.confirm(lang === 'bn' 
      ? 'সতর্কতা: এটি স্থায়ীভাবে সমস্ত ডাটা মুছে ফেলবে! আপনি কি নিশ্চিত?' 
      : 'CRITICAL WARNING: This will permanently destroy all records in the Firestore database. Continue?')) {
      setLoadingAction('maintenance');
      try {
        await resetAllData();
        showStatus('success', 'ডাটাবেজ সফলভাবে খালি করা হয়েছে!', 'Database successfully wiped clean.');
      } catch (e) {
        showStatus('error', 'ডাটাবেজ খালি করতে ব্যর্থ হয়েছে।', 'Failed to wipe database.');
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const handleCheckUpdates = async () => {
    setCheckingUpdates(true);
    setUpdateStatus(null);
    await new Promise(r => setTimeout(r, 1500));
    
    const liveBuild = versionConfig?.buildNumber || 1;
    const liveVersion = versionConfig?.latestVersion || 'v1.0.0';
    const hasUpdate = liveBuild > CURRENT_VERSION.buildNumber;

    setUpdateStatus({
      checked: true,
      hasUpdate,
      latestVersion: liveVersion,
      latestBuild: liveBuild,
      releaseDate: versionConfig?.releaseDate || 'N/A'
    });
    setCheckingUpdates(false);
  };

  const handleSaveVersion = async () => {
    if (!localVersion) return;
    try {
      setSavingVersion(true);
      await saveVersionConfig(localVersion);
      showStatus('success', 'সফটওয়্যার আপডেট সংস্করণ সফলভাবে ফায়ারবেসে পাবলিশ করা হয়েছে!', 'Application update settings published to Firestore successfully!');
    } catch (e) {
      showStatus('error', 'সংরক্ষণ করতে ব্যর্থ হয়েছে।', 'Failed to publish update configuration.');
    } finally {
      setSavingVersion(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি আসলেই এডমিন সেশন থেকে লগআউট করতে চান?' : 'Are you sure you want to log out of the admin session?')) {
      setLoadingAction('logout');
      try {
        await logout();
        await new Promise(r => setTimeout(r, 800));
        navigate('/');
      } catch (e) {
        showStatus('error', 'লগআউট ব্যর্থ হয়েছে।', 'Failed to log out.');
      } finally {
        setLoadingAction(null);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 bengali relative">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="text-emerald-500" size={36} />
            {lang === 'bn' ? 'সিস্টেম অপারেশন ও কন্ট্রোল' : 'System Operations & Control'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">
            {lang === 'bn' 
              ? 'ডাটাবেজ সিঙ্ক, ব্যাকআপ, রিস্টোর, সফটওয়্যার আপডেট এবং নিরাপত্তা ফিচারসমূহ পরিচালনা করুন।' 
              : 'Administer cloud syncing, backups, database restores, app versioning, and access configurations.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to="/admin" 
            className="px-6 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {lang === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Back to Dashboard'}
          </Link>
        </div>
      </div>

      {/* Action Notification Box */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-lg animate-in slide-in-from-top duration-300 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40' 
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/40'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${statusMessage.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Core Grid layout */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left Hand: Core Database & Sync Operations */}
        <div className="space-y-8">
          
          {/* Card 1: Cloud Sync operations */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Cloud className="text-blue-500" size={22} />
              {lang === 'bn' ? 'ক্লাউড ডেটা সিঙ্ক্রোনাইজেশন' : 'Cloud Database Sync'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              {lang === 'bn'
                ? 'আপনার স্থানীয় ব্রাউজারের সমস্ত ক্যাশ ও নতুন ডাটা ক্লাউড ফায়ারবেস ফায়ারস্টোর ডাটাবেজে রিয়েল-টাইমে সিঙ্ক রাখুন।'
                : 'Ensure local browser application states and cache records match Google Cloud Firestore records securely.'}
            </p>
            
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">{lang === 'bn' ? 'সিঙ্ক স্ট্যাটাস' : 'Connection State'}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    cloudSyncStatus === 'syncing' ? 'bg-amber-500 animate-spin border-t-transparent' :
                    cloudSyncStatus === 'error' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                  }`} />
                  <span className="text-sm font-black uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300">
                    {cloudSyncStatus === 'syncing' ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') :
                     cloudSyncStatus === 'error' ? (lang === 'bn' ? 'সংযোগ ত্রুটি' : 'Sync Offline') :
                     (lang === 'bn' ? 'সম্পূর্ণ সিঙ্কড' : 'Fully Synced')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleForceSync}
                disabled={loadingAction !== null}
                className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-600/10 flex items-center gap-2"
              >
                {loadingAction === 'sync' ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                {lang === 'bn' ? 'ফোর্স সিঙ্ক' : 'Force Sync Now'}
              </button>
            </div>
          </div>

          {/* Card 1.5: Document Sync Health Diagnostic Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
                <Activity className="text-emerald-500" size={22} />
                {lang === 'bn' ? 'ডকুমেন্ট সিঙ্ক হেলথ' : 'Document Sync Health'}
              </h2>
              <span className="text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200/20">
                {lang === 'bn' ? 'ডায়াগনস্টিকস লাইভ' : 'Diagnostics Live'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              {lang === 'bn'
                ? 'ফায়ারস্টোর ক্লাউড ডাটাবেজ বনাম ব্রাউজার লোকাল মেমোরি স্টেটের রিয়েল-টাইম সিঙ্ক এবং স্বাস্থ্য পর্যবেক্ষণ করুন।'
                : 'Monitor real-time synchronization integrity and check for any discrepancy between Cloud Firestore and local store.'}
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {syncHealth && syncHealth.map((item) => {
                const isSynced = item.status === 'synced';
                const isOffline = item.status === 'offline';
                const isStale = item.status === 'stale';

                return (
                  <div key={item.collectionName} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {getCollectionLabel(item.collectionName)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({item.count} {lang === 'bn' ? 'টি' : 'items'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Status Badge */}
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isSynced ? 'bg-emerald-50 border-emerald-200/50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50' :
                          isOffline ? 'bg-blue-50 border-blue-200/50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50' :
                          isStale ? 'bg-amber-50 border-amber-200/50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50' :
                          'bg-slate-50 border-slate-200/50 text-slate-500 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-800'
                        }`}>
                          {item.status === 'synced' ? (lang === 'bn' ? 'সিঙ্কড' : 'Synced') :
                           item.status === 'stale' ? (lang === 'bn' ? 'মেমোরি বিলম্ব' : 'Local Stale') :
                           item.status === 'offline' ? (lang === 'bn' ? 'অফলাইন ক্যাশ' : 'Offline Cache') :
                           (lang === 'bn' ? 'অজানা' : 'Unknown')}
                        </span>

                        {/* Source Icon Badge */}
                        <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-200/50 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {item.metadataSource === 'server' ? <Server size={8} /> : item.metadataSource === 'cache' ? <WifiOff size={8} /> : <Info size={8} />}
                          {item.metadataSource === 'server' ? (lang === 'bn' ? 'ক্লাউড' : 'Cloud') :
                           item.metadataSource === 'cache' ? (lang === 'bn' ? 'ক্যাশ' : 'Cache') :
                           (lang === 'bn' ? 'ডেমো' : 'Demo')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px] font-bold">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block uppercase tracking-wider text-[8px]">{lang === 'bn' ? 'ফায়ারস্টোর আপডেট' : 'Firestore Update'}</span>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Clock size={10} className="text-slate-400" />
                          <span>{formatSyncTime(item.firestoreLastUpdated)}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 block uppercase tracking-wider text-[8px]">{lang === 'bn' ? 'লোকাল স্টেট আপডেট' : 'Local State Update'}</span>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Clock size={10} className="text-slate-400" />
                          <span>{formatSyncTime(item.localLastUpdated)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Backup & Restore (JSON) */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Database className="text-emerald-500" size={22} />
              {lang === 'bn' ? 'ব্যাকআপ ও রিস্টোর সিস্টেম' : 'Database Backup & Restore'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              {lang === 'bn'
                ? 'একটি একক জেসন (JSON) ফাইল হিসেবে আপনার পুরো ডাটাবেজ ব্যাকআপ বা রফতানি করুন এবং পরবর্তীতে প্রয়োজন অনুসারে আমদানি করে রিস্টোর করুন।'
                : 'Export all collections (settings, donations, expenses, notices, members, etc.) as a JSON archive, or restore state instantly.'}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleExport}
                disabled={loadingAction !== null}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-200 font-black text-xs uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                {loadingAction === 'export' ? <Loader2 size={16} className="animate-spin text-slate-500" /> : <Download size={16} className="text-emerald-500" />}
                {lang === 'bn' ? 'ব্যাকআপ রফতানি' : 'Export Database'}
              </button>

              <div className="relative">
                <input
                  type="file"
                  id="system-backup-import-file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={loadingAction !== null}
                  className="hidden"
                />
                <label
                  htmlFor="system-backup-import-file"
                  className={`w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-200 font-black text-xs uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer text-center select-none shadow-sm ${
                    loadingAction !== null ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {loadingAction === 'import' ? <Loader2 size={16} className="animate-spin text-slate-500" /> : <UploadCloud size={16} className="text-blue-500" />}
                  {lang === 'bn' ? 'ব্যাকআপ আমদানি' : 'Import Database'}
                </label>
              </div>
            </div>
          </div>

          {/* Card 3: Database Resets (Developer Only) */}
          {isSuperAdmin && (
            <div className="bg-rose-50/40 dark:bg-rose-950/10 rounded-[2.5rem] p-8 border border-rose-100 dark:border-rose-900/30 shadow-lg space-y-6">
              <h2 className="text-xl font-black text-rose-800 dark:text-rose-400 flex items-center gap-2.5 uppercase tracking-tight">
                <AlertTriangle className="text-rose-500" size={22} />
                {lang === 'bn' ? 'ডাটাবেজ রক্ষণাবেক্ষণ (প্রধান ডেভেলপার)' : 'Database Maintenance (Developer)'}
              </h2>
              <p className="text-xs text-rose-700/80 dark:text-slate-400 font-bold leading-relaxed">
                {lang === 'bn'
                  ? 'এই অপারেশনগুলো অত্যন্ত স্পর্শকাতর। মাস্টার রিসেট করলে সম্পূর্ণ ক্লাউড ডেমো ডাটাবেজ পুনরায় তৈরি হবে এবং ফোর্স ওয়াইপ করলে সমস্ত ডাটা মুছে যাবে।'
                  : 'Highly destructive operations restricted strictly to the Azadi primary developer email. Requires authorization.'}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleReSeed}
                  disabled={loadingAction !== null}
                  className="bg-rose-100 hover:bg-rose-200/80 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200/30 dark:border-rose-900/30 font-black text-xs uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  {loadingAction === 'maintenance' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {lang === 'bn' ? 'মাস্টার ডেমো রিসেট' : 'Re-seed Demo Data'}
                </button>

                <button
                  type="button"
                  onClick={handleWipeDatabase}
                  disabled={loadingAction !== null}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-600/10"
                >
                  {loadingAction === 'maintenance' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {lang === 'bn' ? 'ডাটাবেজ ওয়াইপ করুন' : 'Wipe Clean Database'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Hand: Version Control & System Information */}
        <div className="space-y-8">
          
          {/* Card 4: System Information and Release Management */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <ArrowUpCircle className="text-emerald-500" size={22} />
              {lang === 'bn' ? 'সফটওয়্যার সংস্করণ ও রিলিজ কন্ট্রোল' : 'Software Build & Release'}
            </h2>
            
            {/* Version Display parameters */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'ইনস্টলড ভার্সন' : 'Current Installed Version'}</span>
                <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">{CURRENT_VERSION.latestVersion}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'বিল্ড নম্বর' : 'Installed Build'}</span>
                <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">#{CURRENT_VERSION.buildNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'রিলিজের তারিখ' : 'Release Date'}</span>
                <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">{CURRENT_VERSION.releaseDate}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'টার্গেট ডিভাইস' : 'Target Platform'}</span>
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Smartphone size={14} className="text-slate-400" />
                  Android / Web PWA
                </span>
              </div>
            </div>

            {/* Check Updates */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleCheckUpdates}
                disabled={checkingUpdates}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs uppercase py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95 border border-slate-200/40 dark:border-slate-800/40 shadow-sm cursor-pointer"
              >
                {checkingUpdates ? <Loader2 size={16} className="animate-spin text-slate-500" /> : <RefreshCw size={16} className="text-emerald-500" />}
                {lang === 'bn' ? 'আপডেট চেক করুন' : 'Check for Updates'}
              </button>

              {updateStatus && (
                <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-left animate-in fade-in duration-300 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={updateStatus.hasUpdate ? "text-amber-500" : "text-emerald-500"} size={18} />
                    <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                      {updateStatus.hasUpdate 
                        ? (lang === 'bn' ? 'নতুন সফটওয়্যার আপডেট উপলব্ধ!' : 'New Update Available!') 
                        : (lang === 'bn' ? 'সফটওয়্যার সম্পূর্ণ আপ-টু-ডেট!' : 'Software is fully up-to-date!')}
                    </span>
                  </div>
                  
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 space-y-1 pl-6">
                    <p>{lang === 'bn' ? `লাইভ ক্লাউড সংস্করণ: ${updateStatus.latestVersion} (বিল্ড #${updateStatus.latestBuild})` : `Live Cloud Version: ${updateStatus.latestVersion} (Build #${updateStatus.latestBuild})`}</p>
                    <p>{lang === 'bn' ? `প্রকাশের তারিখ: ${updateStatus.releaseDate}` : `Release Date: ${updateStatus.releaseDate}`}</p>
                  </div>

                  {updateStatus.hasUpdate && versionConfig?.apkDownloadUrl && (
                    <a
                      href={versionConfig.apkDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase py-3.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      {lang === 'bn' ? 'নতুন এপিকে (APK) ডাউনলোড করুন' : 'Download Latest APK'}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Release Update Publisher Form (Admins only) */}
            {localVersion && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 text-left">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {lang === 'bn' ? 'নতুন আপডেট রিলিজ পাবলিশ করুন' : 'Publish Application Update'}
                </h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{lang === 'bn' ? 'নতুন সংস্করণ নম্বর' : 'Latest Version Number'}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-xs text-slate-900 dark:text-white" 
                    value={localVersion.latestVersion || ''} 
                    onChange={e => setLocalVersion({...localVersion, latestVersion: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{lang === 'bn' ? 'বিল্ড নম্বর' : 'Build Number (Integer)'}</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-xs text-slate-900 dark:text-white" 
                    value={localVersion.buildNumber || 1} 
                    onChange={e => setLocalVersion({...localVersion, buildNumber: parseInt(e.target.value) || 1})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{lang === 'bn' ? 'রিলিজ ডেট' : 'Release Date (YYYY-MM-DD)'}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-xs text-slate-900 dark:text-white" 
                    value={localVersion.releaseDate || ''} 
                    onChange={e => setLocalVersion({...localVersion, releaseDate: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{lang === 'bn' ? 'এপিকে ডাউনলোড লিঙ্ক' : 'APK Download Link'}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-xs text-blue-600 dark:text-blue-400 font-mono" 
                    value={localVersion.apkDownloadUrl || ''} 
                    onChange={e => setLocalVersion({...localVersion, apkDownloadUrl: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{lang === 'bn' ? 'ফাইল সাইজ' : 'Update Size'}</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-xs text-slate-900 dark:text-white" 
                      placeholder="e.g. 8.5 MB"
                      value={localVersion.updateSize || ''} 
                      onChange={e => setLocalVersion({...localVersion, updateSize: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{lang === 'bn' ? 'প্লে স্টোর লিঙ্ক' : 'Play Store Link'}</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-xs text-slate-900 dark:text-white" 
                      value={localVersion.playStoreUrl || ''} 
                      onChange={e => setLocalVersion({...localVersion, playStoreUrl: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Force Update alert toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase block">{lang === 'bn' ? 'বাধ্যতামূলক আপডেট' : 'Force Update Mode'}</span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{lang === 'bn' ? 'ব্যবহারকারীদের বাধ্য করুন' : 'Prevent access to old versions'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalVersion({ ...localVersion, forceUpdate: !localVersion.forceUpdate })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none cursor-pointer ${localVersion.forceUpdate ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-800'}`}
                  >
                    <span className={`${localVersion.forceUpdate ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{lang === 'bn' ? 'রিলিজ নোট' : 'Release Notes'}</label>
                  <textarea 
                    rows={3} 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-xs text-slate-900 dark:text-white" 
                    value={localVersion.releaseNotes || ''} 
                    onChange={e => setLocalVersion({...localVersion, releaseNotes: e.target.value})} 
                  />
                </div>

                <button 
                  onClick={handleSaveVersion}
                  disabled={savingVersion}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs uppercase p-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  {savingVersion ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {lang === 'bn' ? 'আপডেট রিলিজ পাবলিশ করুন' : 'Publish Update Release'}
                </button>
              </div>
            )}
          </div>

          {/* Card 5: Access Security & Logout */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Shield className="text-slate-700 dark:text-slate-400" size={22} />
              {lang === 'bn' ? 'প্রশাসক নিরাপত্তা ও প্রস্থান' : 'Security & Session Control'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              {lang === 'bn'
                ? 'অনুমোদিত কাজ শেষ হলে আপনার প্রশাসক অধিবেশন বাতিল করুন যাতে কোনো অননুমোদিত ব্যক্তি সিস্টেম প্রবেশ করতে না পারে।'
                : 'Safely terminate your authenticated administrator session when operations are complete to prevent unauthorized local terminal access.'}
            </p>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loadingAction === 'logout'}
              className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 text-rose-650 dark:text-rose-400 font-black text-xs uppercase py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer border border-rose-200 dark:border-rose-900/40 shadow-sm"
            >
              {loadingAction === 'logout' ? <Loader2 size={16} className="animate-spin text-rose-500" /> : <LogOut size={16} />}
              {lang === 'bn' ? 'অ্যাডমিন সেশন লগআউট করুন' : 'Administrator Session Logout'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
