import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { CURRENT_VERSION } from '../../utils/version';
import { 
  Settings, Save, Globe, Mail, CheckCircle, 
  Facebook, Youtube, MessageCircle, RefreshCcw, 
  Image as ImageIcon, ExternalLink, Info, Database, 
  Shield, Copy, AlertCircle, Trash2, LogOut, Moon, Sun,
  Loader2, MessageSquare, Send, Bell, ArrowUpCircle,
  Cloud, CloudOff, UploadCloud, Download
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { 
    lang, 
    theme, 
    setTheme, 
    settings, 
    saveSettings, 
    restoreFromLegacy, 
    resetAllData, 
    user,
    googleAccessToken,
    loginWithGoogle,
    versionConfig,
    saveVersionConfig,
    logout,
    cloudSyncStatus,
    retryCloudConnection,
    exportBackup,
    importBackup
  } = useApp();
  const t = TRANSLATIONS[lang];
  const [localSettings, setLocalSettings] = useState(settings);
  const [localVersion, setLocalVersion] = useState<any>(null);
  const [savingVersion, setSavingVersion] = useState(false);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const success = await importBackup(text);
      if (success) {
        alert(lang === 'bn' ? 'ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে!' : 'Backup restored successfully!');
      } else {
        alert(lang === 'bn' ? 'ব্যাকআপ রিস্টোর করতে ব্যর্থ হয়েছে!' : 'Failed to restore backup!');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (versionConfig) {
      setLocalVersion({ ...versionConfig });
    }
  }, [versionConfig]);

  const [spaces, setSpaces] = useState<any[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [spaceError, setSpaceError] = useState<string | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (googleAccessToken) {
      setLoadingSpaces(true);
      setSpaceError(null);
      import('../../utils/googleChat')
        .then(({ listGoogleChatSpaces }) => listGoogleChatSpaces(googleAccessToken))
        .then((data) => {
          setSpaces(data);
          setLoadingSpaces(false);
        })
        .catch((err) => {
          console.error("Failed to fetch Chat spaces:", err);
          setSpaceError(err.message || 'Failed to list spaces');
          setLoadingSpaces(false);
        });
    } else {
      setSpaces([]);
    }
  }, [googleAccessToken]);

  const settingsString = JSON.stringify(settings);
  React.useEffect(() => {
    setLocalSettings(JSON.parse(settingsString));
  }, [settingsString]);

  const superAdminEmail = import.meta.env.VITE_SUPERADMIN_EMAIL || 'azadisocialwelfareorganization@gmail.com';
  const isSuperAdmin = user?.email === superAdminEmail;

  const handleSave = async () => {
    try {
      await saveSettings(localSettings);
      alert(lang === 'bn' ? 'সেটিংস সফলভাবে সেভ করা হয়েছে!' : 'Settings successfully saved to Firestore!');
    } catch (e) {
      alert(lang === 'bn' ? 'সেভ করতে ব্যর্থ হয়েছে।' : 'Failed to save settings.');
    }
  };

  const handleSaveVersion = async () => {
    if (!localVersion) return;
    try {
      setSavingVersion(true);
      await saveVersionConfig(localVersion);
      alert(lang === 'bn' ? 'সফটওয়্যার আপডেট সংস্করণ সফলভাবে ফায়ারবেসে পাবলিশ করা হয়েছে!' : 'Application update settings published to Firestore successfully!');
    } catch (e) {
      alert(lang === 'bn' ? 'সংরক্ষণ করতে ব্যর্থ হয়েছে।' : 'Failed to publish update configuration.');
    } finally {
      setSavingVersion(false);
    }
  };

  const handleRestore = async () => {
    if (!isSuperAdmin) {
      alert(lang === 'bn' ? 'অ্যাক্সেস অস্বীকার করা হয়েছে: শুধুমাত্র প্রধান ডেভেলপার এই কাজটি করতে পারবেন।' : 'Access Denied: Only the primary developer is permitted to seed default template data.');
      return;
    }

    const input = window.prompt(lang === 'bn' ? 'ডাটা রিস্টোর করতে অনুগ্রহ করে ফায়ারবেস ইমেইল টাইপ করুন:' : 'Please type your developer email to confirm data restore:');
    if (input !== superAdminEmail) {
      alert(lang === 'bn' ? 'অনুমোদন ব্যর্থ হয়েছে।' : 'Authorization failed.');
      return;
    }

    if (window.confirm(lang === 'bn' ? 'আপনি কি পূর্ববর্তী ডেমো ডেটা রিস্টোর করতে চান?' : 'Are you sure you want to restore the default database data?')) {
      try {
        await restoreFromLegacy();
        alert(lang === 'bn' ? 'সফলভাবে ডাটাবেজ ডেমো ডাটা রিস্টোর হয়েছে!' : 'Default template database successfully re-seeded!');
      } catch (e) {
        alert(lang === 'bn' ? 'রিস্টোর করতে ব্যর্থ হয়েছে।' : 'Restore failed.');
      }
    }
  };

  const handleWipe = async () => {
    if (!isSuperAdmin) {
      alert(lang === 'bn' ? 'অ্যাক্সেস অস্বীকার করা হয়েছে: শুধুমাত্র প্রধান ডেভেলপার ডাটাবেজ খালি করতে পারবেন।' : 'Access Denied: Only the primary developer is permitted to wipe the database.');
      return;
    }

    const input = window.prompt(lang === 'bn' ? 'ডাটাবেজ সম্পুর্ণ মুছে ফেলতে অনুগ্রহ করে "WIPE DATABASE" টাইপ করুন:' : 'Please type "WIPE DATABASE" in all caps to confirm database wipe:');
    if (input !== 'WIPE DATABASE') {
      alert(lang === 'bn' ? 'মুছে ফেলার কাজ বাতিল করা হয়েছে।' : 'Wipe operation cancelled.');
      return;
    }

    try {
      await resetAllData();
      alert(lang === 'bn' ? 'ডাটাবেজ সফলভাবে খালি করা হয়েছে।' : 'Database successfully wiped clean.');
    } catch (e) {
      alert(lang === 'bn' ? 'রিসেট করতে ব্যর্থ হয়েছে।' : 'Reset failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Settings className="text-emerald-500" />
            {t.settings}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">{lang === 'bn' ? 'সংগঠনের মূল তথ্য এবং প্রোফাইল পরিচিতি কনফিগার করুন' : 'Configure organizational identity info and profiles'}</p>
        </div>
        <button 
          onClick={handleSave} 
          className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Save size={20} />
          {lang === 'bn' ? 'সেভ করুন' : 'Save Settings'}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Organization & Social */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Identity Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <h3 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase">
              <Globe size={20} className="text-emerald-500" /> Organization Identity
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Name (English)</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={localSettings.nameEn} onChange={e => setLocalSettings({...localSettings, nameEn: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">নাম (বাংলা)</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold font-bengali" value={localSettings.nameBn} onChange={e => setLocalSettings({...localSettings, nameBn: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Address (EN)</label>
              <textarea rows={2} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={localSettings.addressEn} onChange={e => setLocalSettings({...localSettings, addressEn: e.target.value})} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pl-12 rounded-xl font-bold" value={localSettings.email} onChange={e => setLocalSettings({...localSettings, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Phone</label>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="tel" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pl-12 rounded-xl font-bold" value={localSettings.phone} onChange={e => setLocalSettings({...localSettings, phone: e.target.value})} />
                </div>
              </div>
            </div>
          </section>

          {/* Social & Payments Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <h3 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase">
              <Facebook size={20} className="text-blue-600" /> Social & Payment Links
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Facebook URL</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={localSettings.facebook || ''} onChange={e => setLocalSettings({...localSettings, facebook: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">YouTube URL</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={localSettings.youtube || ''} onChange={e => setLocalSettings({...localSettings, youtube: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">WhatsApp Channel</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={localSettings.whatsappChannel || ''} onChange={e => setLocalSettings({...localSettings, whatsappChannel: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Admin WhatsApp</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={localSettings.adminWhatsApp || ''} onChange={e => setLocalSettings({...localSettings, adminWhatsApp: e.target.value})} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="space-y-2">
                 <label className="text-[11px] font-black uppercase text-slate-500 ml-1">bKash</label>
                 <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-pink-600" value={localSettings.bkash || ''} onChange={e => setLocalSettings({...localSettings, bkash: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Nagad</label>
                 <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-orange-600" value={localSettings.nagad || ''} onChange={e => setLocalSettings({...localSettings, nagad: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Rocket</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-purple-600" value={localSettings.roket || ''} onChange={e => setLocalSettings({...localSettings, roket: e.target.value})} />
                </div>
             </div>
           </section>

          {/* Google Chat Settings Card */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <h3 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase font-sans">
                <MessageSquare size={22} className="text-emerald-500" /> Google Chat Integration
              </h3>
              
              {/* Google Connection Badge */}
              <div className="flex items-center gap-2">
                {googleAccessToken ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-650 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900/50 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {lang === 'bn' ? 'সংযুক্ত' : 'Connected'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-800 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    {lang === 'bn' ? 'অসংযুক্ত' : 'Disconnected'}
                  </span>
                )}
              </div>
            </div>

            {/* General Connection Action & Explainer */}
            {!googleAccessToken ? (
              <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/80 space-y-4">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                    {lang === 'bn' 
                      ? 'আজাদী সমাজ কল্যাণ সংঘের গুগল চ্যাট নোটিফিকেশন সিস্টেমটি সরাসরি আপনার সেশনে চলে। স্পেস ব্রাউজ করতে অথবা আপডেট ব্রডকাস্ট করতে গুগল ওয়ার্কস্পেস এডমিন অ্যাকাউন্ট লিঙ্ক করুন।' 
                      : 'Google Chat operations execute directly within your browser session. Authenticate with your Google account to automatically list spaces, verify permissions, and broadcast announcements.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <MessageSquare size={16} />
                  {lang === 'bn' ? 'গুগল অ্যাকাউন্ট লিঙ্ক করুন' : 'Connect Google Workspace Account'}
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/30">
                <p className="text-xs text-emerald-800 dark:text-emerald-450 font-black leading-relaxed flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  {lang === 'bn' 
                    ? 'আপনার গুগল ওয়ার্কস্পেস সেশন সফলভাবে মেমোরিতে প্রাধিকৃত হয়েছে।' 
                    : 'Welfare admin token is active! You can now manage notification triggers and publish live broadcasts.'}
                </p>
              </div>
            )}

            {/* Notification Parameters Form */}
            <div className="space-y-6">
              {/* Main status toggle */}
              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase block">{lang === 'bn' ? 'চ্যাট নোটিফিকেশন সিস্টেম' : 'Enable Google Chat Notifications'}</span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{lang === 'bn' ? 'স্বয়ংক্রিয় এলার্ট অন/অফ করুন' : 'Toggle all automatic notifications on or off'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, googleChatEnabled: !localSettings.googleChatEnabled })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none cursor-pointer ${localSettings.googleChatEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-800'}`}
                >
                  <span className="sr-only">Toggle chat notifications</span>
                  <span className={`${localSettings.googleChatEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform`} />
                </button>
              </div>

              {/* Chat Space Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'টার্গেট গুগল চ্যাট স্পেস (Space)' : 'Target Google Chat Space'}</span>
                  {loadingSpaces && <Loader2 size={12} className="animate-spin text-emerald-500" />}
                </label>

                {googleAccessToken ? (
                  <>
                    {spaces.length > 0 ? (
                      <select
                        value={localSettings.googleChatSpace || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, googleChatSpace: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-sm block cursor-pointer"
                      >
                        <option value="">-- {lang === 'bn' ? 'একটি স্পেস নির্বাচন করুন' : 'Select Google Chat Space'} --</option>
                        {spaces.map((sp) => (
                          <option key={sp.name} value={sp.name}>{sp.displayName || sp.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="spaces/AAAAxxxxxx"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-mono text-xs font-bold animate-in fade-in"
                          value={localSettings.googleChatSpace || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, googleChatSpace: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 font-bold italic">
                          {spaceError 
                            ? `${lang === 'bn' ? 'স্পেস তালিকা লোড করা যায়নি: ' : 'Unable to list spaces: '} ${spaceError}. ${lang === 'bn' ? 'অনুগ্রহ করে সরাসরি স্পেস আইডি টাইপ করুন।' : 'Please enter space ID manually.'}`
                            : lang === 'bn' 
                              ? 'আপনার চ্যাট চ্যানেলে কোনো স্পেস পাওয়া যায়নি। অনুগ্রহ করে স্পেস আইডি যুক্ত করুন।' 
                              : 'Connected, but no custom spaces found. You can paste your Space ID (e.g. spaces/AAAAxxxxx) directly.'}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="spaces/AAAAxxxxx"
                      className="w-full bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-mono text-xs font-bold text-slate-400"
                      value={localSettings.googleChatSpace || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, googleChatSpace: e.target.value })}
                    />
                    <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold">
                      ⚠ {lang === 'bn' 
                        ? 'স্পেসের তালিকা দেখতে ও সহজে যুক্ত করতে অনুগ্রহ করে গুগল অ্যাকাউন্ট লিঙ্ক করুন।' 
                        : 'Link Google details to browse spaces automatically. Or paste a specific space ID manually.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Active Toggle Group */}
              {localSettings.googleChatEnabled && (
                <div className="bg-slate-50 dark:bg-slate-950/20 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-300">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block border-b border-slate-200/50 dark:border-slate-800 pb-2">
                    {lang === 'bn' ? 'স্বয়ংক্রিয় নোটিফিকেশন ট্রিগারসমূহ' : 'Automatic Notification Triggers'}
                  </span>
                  
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="opt-receipt"
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 mt-1 cursor-pointer"
                      checked={localSettings.googleChatNotifyOnReceipt !== false}
                      onChange={(e) => setLocalSettings({ ...localSettings, googleChatNotifyOnReceipt: e.target.checked })}
                    />
                    <label htmlFor="opt-receipt" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      {lang === 'bn' ? 'নতুন দাতারা অনলাইনে অনুদান সাবমিট করলে তাৎক্ষণিক এলার্ট' : 'Notify immediately when an online donation submission is received'}
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="opt-approved"
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 mt-1 cursor-pointer"
                      checked={localSettings.googleChatNotifyOnApproval !== false}
                      onChange={(e) => setLocalSettings({ ...localSettings, googleChatNotifyOnApproval: e.target.checked })}
                    />
                    <label htmlFor="opt-approved" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      {lang === 'bn' ? 'এডমিন প্যানেলে অনুদান এন্ট্রি অনুমোদন করলে নোটিফিকেশন' : 'Post notification when any payment is marked Approved'}
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="opt-expense"
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 mt-1 cursor-pointer"
                      checked={localSettings.googleChatNotifyOnExpense !== false}
                      onChange={(e) => setLocalSettings({ ...localSettings, googleChatNotifyOnExpense: e.target.checked })}
                    />
                    <label htmlFor="opt-expense" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      {lang === 'bn' ? 'অর্গানাইজেশনের কোনো খরচ (ব্যয়) রেকর্ড করা হলে এলার্ট' : 'Send alert whenever a new expense entry is saved'}
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Test Connection Button */}
            {localSettings.googleChatEnabled && localSettings.googleChatSpace && googleAccessToken && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 animate-in fade-in">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setTestSuccess(null);
                      const { sendGoogleChatMessage } = await import('../../utils/googleChat');
                      await sendGoogleChatMessage(
                        googleAccessToken,
                        localSettings.googleChatSpace!,
                        `🧪 *Azadi Welfare Google Chat Test Message*\n` +
                        `• Admin Session: Securely Authorized\n` +
                        `• Org State: Integration Active\n` +
                        `• State: Connection Active!\n` +
                        `• Timestamp: ${new Date().toLocaleString()}`
                      );
                      setTestSuccess(true);
                      setTimeout(() => setTestSuccess(null), 4500);
                    } catch (err) {
                      console.error("Test message failed:", err);
                      setTestSuccess(false);
                      setTimeout(() => setTestSuccess(null), 5000);
                    }
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black text-[11px] px-5 py-3 rounded-xl uppercase flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCcw size={14} className={testSuccess === null ? "" : "animate-spin"} />
                  {lang === 'bn' ? 'টেস্ট মেসেজ পাঠান' : 'Send Test message'}
                </button>

                {testSuccess === true && (
                  <span className="text-xs font-black text-emerald-650 dark:text-emerald-450 animate-in slide-in-from-right duration-300">
                    ✓ {lang === 'bn' ? 'পরীক্ষামূলক মেসেজ পাঠানো হয়েছে!' : 'Test alert delivered!'}
                  </span>
                )}
                {testSuccess === false && (
                  <span className="text-xs font-black text-rose-500 animate-in slide-in-from-right duration-300">
                    ✗ {lang === 'bn' ? 'পাঠাতে ব্যর্থ হয়েছে।' : 'Error posting.'}
                  </span>
                )}
              </div>
            )}

            {/* Live Broadcast Studio */}
            {localSettings.googleChatEnabled && localSettings.googleChatSpace && (
              <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-850/80 space-y-4 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block animate-pulse" />
                  <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 font-sans">
                    📢 {lang === 'bn' ? 'লাইভ চ্যাট ব্রডকাস্টার' : 'Live Broadcaster Studio'}
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনার নির্বাচনকৃত গুগল চ্যাট স্পেসে যেকোনো জরুরি নোটিশ বা সমাজ কল্যাণ আপডেট সরাসরি এখান থেকে ব্রডকাস্ট করুন।'
                    : 'Craft custom messages or urgent bulletins and dispatch them immediately to your active workspace.'}
                </p>

                <textarea
                  rows={3}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder={lang === 'bn' ? 'আজাদী সমাজ কল্যাণ সংঘ... আজীবনের জন্য অনুদান...' : 'Type announcement...'}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                <button
                  type="button"
                  disabled={sendingBroadcast || !broadcastText.trim()}
                  onClick={async () => {
                    if (!googleAccessToken) {
                      alert(lang === 'bn' ? 'দয়া করে প্রথমে গুগল চ্যাট লিঙ্ক করুন!' : 'Please connect your Workspace Account first!');
                      return;
                    }
                    try {
                      setSendingBroadcast(true);
                      const { sendGoogleChatMessage } = await import('../../utils/googleChat');
                      await sendGoogleChatMessage(
                        googleAccessToken,
                        localSettings.googleChatSpace!,
                        `📢 *${lang === 'bn' ? 'আজাদী চ্যাট ব্রডকাস্ট' : 'Azadi Welfare Broadcast Announcement'}*\n\n` +
                        `${broadcastText}`
                      );
                      alert(lang === 'bn' ? 'অনুমোদনকারী চ্যানেলে বার্তাটি ব্রডকাস্ট করা হয়েছে!' : 'Welfare announcement was published successfully!');
                      setBroadcastText('');
                    } catch (e: any) {
                      alert(`${lang === 'bn' ? 'ব্রডকাস্ট করতে সমস্যা হয়েছে: ' : 'Failed to broadcast: '} ${e.message || e}`);
                    } finally {
                      setSendingBroadcast(false);
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase p-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  {sendingBroadcast ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {lang === 'bn' ? 'চ্যানেলে ব্রডকাস্ট করুন' : 'Dispatch Broadcast'}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Assets & Recovery */}
        <div className="lg:col-span-4 space-y-8">
          {/* Logo Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest">Logo Branding URL</h3>
            <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={localSettings.logo} onChange={e => setLocalSettings({...localSettings, logo: e.target.value})} />
            <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-slate-950 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
              <img src={localSettings.logo} className="object-contain" alt="Logo Preview" />
            </div>
          </section>

          {/* Appearance Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Sun size={16} className="text-amber-500" /> Appearance & Theme
            </h3>
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-amber-900/20 text-amber-500' : 'bg-slate-200 text-slate-600'}`}>
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white uppercase">{lang === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</div>
                  <div className="text-[10px] font-bold text-slate-500">{lang === 'bn' ? 'চোখের আরামের জন্য অন্ধকার থিম' : 'Switch to dark theme'}</div>
                </div>
              </div>
              
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ring-2 ring-transparent ${theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <span className="sr-only">Toggle dark mode</span>
                <span
                  className={`${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out`}
                />
              </button>
            </div>
          </section>

          {/* System Diagnostics */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Shield size={16} className="text-indigo-500" /> Static Visual Client Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Environment status</span>
                <span className="text-[10px] font-black uppercase text-emerald-500">STATIC ACTIVE</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
