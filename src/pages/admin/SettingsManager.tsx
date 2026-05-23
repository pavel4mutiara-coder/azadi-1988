
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { 
  Settings, Save, Globe, Mail, Upload, CheckCircle, 
  Facebook, Youtube, MessageCircle, RefreshCcw, 
  Image as ImageIcon, ExternalLink, Info, Database, 
  Loader2, Shield, Copy, AlertCircle, Trash2, LogOut,
  Moon, Sun
} from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { UploadDiagnosticPanel } from '../../components/UploadDiagnosticPanel';
import { Bug } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { lang, theme, setTheme, settings, saveSettings, restoreFromLegacy, logout, resetAllData, exportBackup, importBackup } = useApp();
  const t = TRANSLATIONS[lang];
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const { upload, isUploading, progress: uploadProgress, error: uploadError } = useImageUpload();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await upload(file, "settings");
        setLocalSettings(prev => ({ ...prev, logo: url }));
      } catch (error) {
        console.error("Logo upload failed:", error);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveSettings(localSettings);
    setIsSaving(false);
    alert(lang === 'bn' ? 'সেটিংস সংরক্ষিত হয়েছে!' : 'Settings updated successfully!');
  };

  const handleRestore = async () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি পুরনো ডাটাবেজ থেকে সব ডাটা রিস্টোর করতে চান?' : 'Do you want to restore all data from the legacy database?')) {
      setIsRestoring(true);
      await restoreFromLegacy();
      setIsRestoring(false);
    }
  };

  const copyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
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
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Configure organization identity and cloud sync</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
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
        </div>

        {/* Right Column: Assets & Recovery */}
        <div className="lg:col-span-4 space-y-8">
          {/* Logo Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest">Logo & Branding</h3>
            <div className="relative w-32 h-32 mx-auto group">
               <div className={`w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-2 ${uploadError ? 'border-amber-500/50' : 'border-emerald-500/20'} flex flex-col items-center justify-center p-4 shadow-inner overflow-hidden relative`}>
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="animate-spin text-emerald-500" size={24} />
                       <div className="text-[10px] font-black text-emerald-600">{uploadProgress}%</div>
                    </div>
                  ) : uploadError ? (
                    <div className="flex flex-col items-center gap-1 text-center">
                       <Bug className="text-amber-500" size={20} />
                       <button onClick={(e) => { e.stopPropagation(); setShowDiagnostics(true); }} className="text-[7px] font-black text-amber-600 underline uppercase tracking-tighter">DIAGNOSE</button>
                    </div>
                  ) : (
                    <img src={localSettings.logo} className="w-full h-full object-contain" alt="Logo Preview" />
                  )}
               </div>
               <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[2rem] cursor-pointer transition-opacity">
                  <Upload className="text-white" size={24} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
               </label>
            </div>
            {isUploading && (
              <div className="w-32 mx-auto h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
            <p className="text-[10px] font-bold text-slate-400">Click to upload organization logo</p>
          </section>

          {/* Data Recovery System */}
          <section className="bg-emerald-900 text-white rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
              <Database size={100} />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-black flex items-center gap-2">
                <RefreshCcw size={20} className={isRestoring ? 'animate-spin' : ''} />
                ডাটা রিস্টোর (Restore)
              </h3>
              <p className="text-xs text-emerald-100/60 font-bold leading-relaxed">
                আপনার যদি আগের ইভেন্ট বা নেতৃবৃন্দের লিস্ট হারিয়ে গিয়ে থাকে, তবে এই বাটনে ক্লিক করে পুরনো ডাটাবেজ থেকে ডাটাগুলো পুনরায় ফিরিয়ে আনতে পারেন।
              </p>
            </div>
            <button 
              onClick={handleRestore}
              disabled={isRestoring}
              className="w-full bg-white text-emerald-950 py-4 rounded-2xl font-black text-[11px] uppercase shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 relative z-10"
            >
              {isRestoring ? <Loader2 className="animate-spin" size={14} /> : <Database size={14} />}
              {lang === 'bn' ? 'ডাটা রিস্টোর করুন' : 'Restore All Data'}
            </button>
          </section>

          {/* Backup & System Integrity System */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Database size={16} className="text-teal-500" /> Database Backup & Import
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              {lang === 'bn' 
                ? 'সিস্টেমের সমস্ত ডাটা (নেতৃবৃন্দ, অনুদান, নোটিশ, খবর ও সেটিংস) নিরাপদ রাখতে ব্যাকআপ ফাইল তৈরি বা পূর্বের ব্যাকআপ রিস্টোর করুন।' 
                : 'Safeguard all data (leaders, donations, notices, news, settings) by exporting a JSON backup or importing an existing backup file.'}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={exportBackup}
                className="py-4 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all border border-teal-100 dark:border-teal-900/50 flex flex-col items-center justify-center gap-2"
              >
                <Save size={18} />
                {lang === 'bn' ? 'এক্সপোর্ট ব্যাকআপ' : 'Export Backup'}
              </button>
              
              <label className="py-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center justify-center gap-2 cursor-pointer text-center">
                <Upload size={18} />
                <span>{lang === 'bn' ? 'ইম্পোর্ট ব্যাকআপ' : 'Import Backup'}</span>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const jsonText = event.target?.result as string;
                        if (jsonText) {
                          await importBackup(jsonText);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }} 
                />
              </label>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-rose-50 dark:bg-rose-950/20 rounded-[2.5rem] p-8 border border-rose-100 dark:border-rose-900/50 space-y-4">
             <h3 className="text-xs font-black uppercase text-rose-600 flex items-center gap-2"><AlertCircle size={14} /> Danger Zone</h3>
             <button 
               onClick={async () => {
                 const confirmMessage1 = lang === 'bn' 
                   ? 'আপনি কি নিশ্চিত যে আপনি সমস্ত সিস্টেম ডাটা মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব নয়!'
                   : 'Are you sure you want to delete ALL system data? This action cannot be undone!';
                 if (window.confirm(confirmMessage1)) {
                   const confirmMessage2 = lang === 'bn'
                     ? 'শেষবার নিশ্চিত করুন: সত্যিই কি সব ডাটা ডিলিট করবেন?'
                     : 'FINAL CONFIRMATION: Do you absolutely want to wipe everything and load defaults?';
                   if (window.confirm(confirmMessage2)) {
                     await resetAllData();
                   }
                 }
               }}
               className="w-full text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 p-4 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
             >
               <Trash2 size={16} /> Reset All System Data
             </button>
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
                  <div className="text-[10px] font-bold text-slate-500">{lang === 'bn' ? 'চোখের আরামের জন্য অন্ধকার থিম' : 'Switch to dark theme for night usage'}</div>
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
              <Shield size={16} className="text-indigo-500" /> System Health & Diagnostics
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <Database size={16} />
                     </div>
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Database Connection</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-500">Connected</span>
               </div>
               
               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <ImageIcon size={16} />
                     </div>
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Storage System</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-500">Active</span>
               </div>

               <button 
                 onClick={() => setShowDiagnostics(true)}
                 className="w-full py-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2"
               >
                 <Bug size={14} />
                 Open AI Diagnostics
               </button>
            </div>
          </section>

          {/* Session Management */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <LogOut size={16} className="text-orange-500" /> Account & Session
            </h3>
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Shield className="text-emerald-600" size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black uppercase text-slate-400">Authenticated as</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">System Administrator</div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (window.confirm(lang === 'bn' ? 'আপনি কি লগআউট করতে চান?' : 'Do you want to logout?')) {
                    logout();
                  }
                }}
                className="w-full bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 py-3 rounded-xl font-black text-[11px] uppercase transition-all flex items-center justify-center gap-2 border border-orange-200 dark:border-orange-800/50"
              >
                <LogOut size={14} />
                {t.logout}
              </button>
            </div>
            <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-wider">Security Version 4.0.2</p>
          </section>

        </div>
      </div>
      <UploadDiagnosticPanel isOpen={showDiagnostics} onClose={() => setShowDiagnostics(false)} />
    </div>
  );
};
