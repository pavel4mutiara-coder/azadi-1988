
import React, { useState, useEffect } from 'react';
import { useApp, compressImage } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Settings, Save, Globe, Mail, Upload, CheckCircle, Facebook, Youtube, MessageCircle, RefreshCcw, Image as ImageIcon, ExternalLink, Info } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { lang, settings, saveSettings } = useApp();
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  /**
   * Enhanced URL normalization to ensure links work across all devices
   */
  const normalizeUrl = (url: string) => {
    if (!url) return '';
    let trimmed = url.trim().replace(/\s+/g, '');
    if (trimmed === '') return '';
    
    // If it already has a protocol, return as is
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // Add https:// to common patterns or if dots/slashes are present
    if (trimmed.includes('.') || trimmed.includes('/')) {
        return `https://${trimmed}`;
    }
    
    return trimmed;
  };

  const handleUrlBlur = (key: 'facebook' | 'youtube' | 'whatsappChannel') => {
    const normalized = normalizeUrl(formData[key]);
    setFormData(prev => ({ ...prev, [key]: normalized }));
  };

  const testLink = (url: string) => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      alert(lang === 'bn' ? 'প্রথমে একটি লিঙ্ক লিখুন' : 'Please enter a link first');
      return;
    }
    window.open(normalized, '_blank');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'logo' | 'flag') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const compressed = await compressImage(base64);
          setFormData(prev => ({ ...prev, [key]: compressed }));
        } catch (err) {
          setFormData(prev => ({ ...prev, [key]: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    // Force normalization on all links before saving
    const finalData = {
      ...formData,
      facebook: normalizeUrl(formData.facebook),
      youtube: normalizeUrl(formData.youtube),
      whatsappChannel: normalizeUrl(formData.whatsappChannel)
    };
    
    saveSettings(finalData);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20 bengali">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Settings size={32} />
            </div>
            {t.settings}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">সংস্থার প্রোফাইল এবং সোশ্যাল লিঙ্ক আপডেট করুন</p>
        </div>
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg animate-bounce">
            <CheckCircle size={20} />
            সংরক্ষিত হয়েছে!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10">
            <h3 className="text-2xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
              <Globe className="text-emerald-500" /> লোগো ও নাম
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block ml-1">অফিসিয়াল লোগো</label>
                 <div className="flex flex-col gap-4">
                   <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center overflow-hidden">
                      {formData.logo ? (
                        <div className="w-40 h-40 relative rounded-full border-[4px] border-emerald-600 bg-white p-2 shadow-2xl flex items-center justify-center overflow-hidden">
                          <img src={formData.logo} className="w-full h-full object-contain" alt="Logo" />
                        </div>
                      ) : (
                        <ImageIcon size={48} className="text-slate-300" />
                      )}
                   </div>
                   <label htmlFor="logo-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition-all shadow-md">
                     <Upload size={18} /> লোগো পরিবর্তন
                     <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                   </label>
                 </div>
               </div>

               <div className="space-y-4">
                 <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block ml-1">জাতীয় পতাকা</label>
                 <div className="flex flex-col gap-4">
                   <div className="w-full aspect-square bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center">
                     <img src={formData.flag} className="w-40 h-24 object-cover rounded-xl shadow-lg" alt="Flag" />
                   </div>
                   <label htmlFor="flag-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-black transition-all shadow-md">
                     <Upload size={18} /> পতাকা পরিবর্তন
                     <input id="flag-upload" type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'flag')} />
                   </label>
                 </div>
               </div>
            </div>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">নাম (বাংলা)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Name (English)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 md:p-10 rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-800 shadow-xl space-y-8 relative overflow-hidden">
            <h3 className="text-2xl font-black flex items-center gap-4 text-emerald-900 dark:text-emerald-400">
              <MessageCircle size={24} /> সোশ্যাল মিডিয়া লিঙ্ক
            </h3>
            
            <div className="bg-white/50 dark:bg-slate-950/50 p-4 rounded-2xl space-y-2 border border-emerald-100/50">
               <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-500">
                 <Info size={16} className="mt-1 shrink-0" />
                 <p className="text-[11px] font-bold leading-relaxed italic">
                   লিঙ্কটি কাজ করছে কি না নিশ্চিত হতে সেভ করার আগে "টেস্ট লিঙ্ক" বাটনে ক্লিক করুন।
                 </p>
               </div>
            </div>

            <div className="space-y-6">
              {[
                { label: 'ফেসবুক লিঙ্ক (Facebook)', key: 'facebook', icon: <Facebook className="text-blue-600" /> },
                { label: 'ইউটিউব লিঙ্ক (YouTube)', key: 'youtube', icon: <Youtube className="text-red-600" /> },
                { label: 'হোয়াটসঅ্যাপ চ্যানেল (WhatsApp)', key: 'whatsappChannel', icon: <MessageCircle className="text-emerald-600" /> }
              ].map(item => (
                <div key={item.key} className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">{item.label}</label>
                  <div className="flex gap-2">
                     <div className="relative flex-1">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2">{item.icon}</div>
                       <input 
                         type="text" 
                         placeholder="https://..." 
                         className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pl-12 rounded-xl font-bold font-mono text-xs" 
                         value={(formData as any)[item.key]} 
                         onChange={e => setFormData({...formData, [item.key]: e.target.value})}
                         onBlur={() => handleUrlBlur(item.key as any)}
                       />
                     </div>
                     <button 
                       type="button" 
                       onClick={() => testLink((formData as any)[item.key])}
                       className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase border border-slate-200 dark:border-slate-700"
                     >
                       <ExternalLink size={14} /> টেস্ট
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <h3 className="text-2xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
              <Mail className="text-emerald-500" /> যোগাযোগ ও পেমেন্ট
            </h3>
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">ফোন নম্বর</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">ইমেইল</label>
                  <input type="email" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">ঠিকানা</label>
                <textarea rows={2} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.addressBn} onChange={e => setFormData({...formData, addressBn: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">বিকাশ</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.bkash} onChange={e => setFormData({...formData, bkash: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">নগদ</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.nagad} onChange={e => setFormData({...formData, nagad: e.target.value})} />
                </div>
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
