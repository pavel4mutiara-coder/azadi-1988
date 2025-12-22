
import React, { useState, useEffect } from 'react';
import { useApp, compressImage } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Settings, Save, Globe, Mail, Upload, CheckCircle, Facebook, Youtube, MessageCircle, RefreshCcw, Image as ImageIcon } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { lang, settings, saveSettings } = useApp();
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'logo' | 'flag') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          // Compress image before saving to state
          const compressed = await compressImage(base64);
          setFormData(prev => ({ ...prev, [key]: compressed }));
        } catch (err) {
          console.error("Compression error:", err);
          setFormData(prev => ({ ...prev, [key]: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const restoreOriginalLogo = () => {
    const originalLogo = "https://drive.google.com/uc?export=view&id=1VYH9NzuVHOhTM_vXf3amTtTrTFhTAQID";
    setFormData(prev => ({ ...prev, logo: originalLogo }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    saveSettings(formData);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Settings size={32} />
            </div>
            {t.settings}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Manage branding, contacts, and payment options</p>
        </div>
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg animate-bounce">
            <CheckCircle size={20} />
            {lang === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Settings Saved!'}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden">
            <h3 className="text-2xl font-black flex items-center gap-4 text-slate-900 dark:text-white relative z-10">
              <Globe className="text-emerald-500" /> Branding & Visual Identity
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-8 relative z-10">
               <div className="space-y-4">
                 <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block ml-1">Official Logo</label>
                 <div className="flex flex-col gap-4">
                   <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center overflow-hidden">
                      {formData.logo ? (
                        <div className="w-40 h-40 relative rounded-full border-[4px] border-emerald-600 bg-white p-2 shadow-2xl flex items-center justify-center overflow-hidden">
                          <img src={formData.logo} className="w-full h-full object-contain relative z-10" alt="Logo Preview" onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Logo+Error";
                          }} />
                        </div>
                      ) : (
                        <ImageIcon size={48} className="text-slate-300" />
                      )}
                   </div>
                   <div className="flex flex-col gap-2">
                     <label htmlFor="logo-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md">
                       <Upload size={18} /> Update Logo
                     </label>
                     <button type="button" onClick={restoreOriginalLogo} className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                       <RefreshCcw size={18} /> Restore Original
                     </button>
                     <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block ml-1">Flag</label>
                 <div className="flex flex-col gap-4">
                   <div className="w-full aspect-square bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center overflow-hidden">
                     {formData.flag ? (
                        <img src={formData.flag} className="w-40 h-24 object-cover rounded-xl shadow-lg" alt="Flag Preview" />
                     ) : (
                        <ImageIcon size={48} className="text-slate-300" />
                     )}
                   </div>
                   <div className="flex flex-col gap-2">
                     <label htmlFor="flag-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md">
                       <Upload size={18} /> Update Flag
                     </label>
                     <input id="flag-upload" type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'flag')} />
                   </div>
                 </div>
               </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Name (Bangla)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Name (English)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Slogan</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.sloganBn} onChange={e => setFormData({...formData, sloganBn: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <h3 className="text-2xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
              <Facebook className="text-blue-600" /> Social Media Links
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Facebook Page URL</label>
                <div className="relative">
                  <Facebook size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" />
                  <input type="url" placeholder="https://facebook.com/page" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pl-12 rounded-xl font-bold" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">YouTube Channel URL</label>
                <div className="relative">
                  <Youtube size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" />
                  <input type="url" placeholder="https://youtube.com/@channel" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pl-12 rounded-xl font-bold" value={formData.youtube} onChange={e => setFormData({...formData, youtube: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">WhatsApp Channel URL</label>
                <div className="relative">
                  <MessageCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                  <input type="url" placeholder="https://whatsapp.com/channel/..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pl-12 rounded-xl font-bold" value={formData.whatsappChannel} onChange={e => setFormData({...formData, whatsappChannel: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <h3 className="text-2xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
              <Mail className="text-emerald-500" /> Contact & Payment
            </h3>
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                  <input type="email" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Address</label>
                <textarea rows={2} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.addressBn} onChange={e => setFormData({...formData, addressBn: e.target.value})} />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saveStatus === 'saving'}
            className="w-full bg-emerald-600 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-4 text-2xl"
          >
            <Save size={28} />
            {saveStatus === 'saving' ? 'সংরক্ষণ করা হচ্ছে...' : 'সব তথ্য সেভ করুন'}
          </button>
        </div>
      </form>
    </div>
  );
};
