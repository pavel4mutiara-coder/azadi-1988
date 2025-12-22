
import React, { useState } from 'react';
import { useApp, compressImage } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Users, Plus, Trash2, Edit2, Upload, AlertTriangle, X, RefreshCcw } from 'lucide-react';
import { Leadership } from '../types';

export const LeadershipManager: React.FC = () => {
  const { lang, leadership, settings, updateLeadership } = useApp();
  const t = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Leadership, 'id'>>({
    nameEn: '',
    nameBn: '',
    designationEn: '',
    designationBn: '',
    messageEn: '',
    messageBn: '',
    phone: '',
    image: '', 
    order: leadership.length + 1
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64, 300, 300);
        setFormData(prev => ({ ...prev, image: compressed }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি পূর্ণাঙ্গ কমিটির তালিকা পুনরায় লোড করতে চান?' : 'Restore full committee list?')) {
      const logo = settings.logo;
      const defaultData: Leadership[] = [
        { id: 'p1', nameEn: 'Md. Abdus Sabir (Tutul)', nameBn: 'মোঃ আব্দুছ ছাবির (টুটুল)', designationEn: 'President', designationBn: 'সভাপতি', messageEn: '', messageBn: '', phone: '01711975488', image: logo, order: 1 },
        { id: 'vp1', nameEn: 'Adv. Shahanur', nameBn: 'এস এস নুরুল হুদা চৌঃ (এডঃ শাহানুর)', designationEn: 'Vice President', designationBn: 'সহ-সভাপতি', messageEn: '', messageBn: '', phone: '', image: logo, order: 2 },
        { id: 'vp2', nameEn: 'Aminur Rahman (Shamim)', nameBn: 'আমিনুর রহমান (শামীম)', designationEn: 'Vice President', designationBn: 'সহ-সভাপতি', messageEn: '', messageBn: '', phone: '', image: logo, order: 3 },
        { id: 'vp3', nameEn: 'Jubed Ahmad', nameBn: 'জুবেদ আহমদ', designationEn: 'Vice President', designationBn: 'সহ-সভাপতি', messageEn: '', messageBn: '', phone: '', image: logo, order: 4 },
        { id: 'gs1', nameEn: 'Junel Ahmad', nameBn: 'জুনেল আহমদ', designationEn: 'General Secretary', designationBn: 'সাধারণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 5 },
        { id: 'ags1', nameEn: 'Kawser Ahmad (Pappu)', nameBn: 'কাওসার আহমদ (পাপ্পু)', designationEn: 'Asst. General Secretary', designationBn: 'সহ-সাধারণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 6 },
        { id: 'os1', nameEn: 'Tareq Ahmad', nameBn: 'তারেক আহমদ', designationEn: 'Organizing Secretary', designationBn: 'সাংগঠনিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 7 },
        { id: 'os2', nameEn: '', nameBn: '', designationEn: 'Asst. Organizing Secretary', designationBn: 'সহ-সাংগঠনিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 8 },
        { id: 'sws1', nameEn: 'Najib Salam', nameBn: 'নাজিব সালাম', designationEn: 'Social Welfare Secretary', designationBn: 'সমাজ কল্যাণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 9 },
        { id: 'sws2', nameEn: 'Samin Ahmad Limon', nameBn: 'সামিন আহমদ লিমন', designationEn: 'Asst. Social Welfare Secretary', designationBn: 'সহ-সমাজ কল্যাণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 10 },
        { id: 'trs1', nameEn: 'Abdul Malik (Biplob)', nameBn: 'আব্দুল মালিক (বিপ্লব)', designationEn: 'Treasurer', designationBn: 'অর্থ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 11 },
        { id: 'trs2', nameEn: 'Abdul Hadi (Rumman)', nameBn: 'আব্দুল হাদী (রুম্মান)', designationEn: 'Asst. Treasurer', designationBn: 'সহ-অর্থ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 12 },
        { id: 'pubs1', nameEn: 'Arafat Islam (Boni)', nameBn: 'আরাফাত ইসলাম (বনি)', designationEn: 'Publicity Secretary', designationBn: 'প্রচার সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 13 },
        { id: 'pubs2', nameEn: '', nameBn: '', designationEn: 'Asst. Publicity Secretary', designationBn: 'সহ-প্রচার সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 14 },
        { id: 'sps1', nameEn: 'Rafayat Malik (Rafi)', nameBn: 'রাফায়াত মালিক (রাফি)', designationEn: 'Sports Secretary', designationBn: 'ক্রীড়া সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 15 },
        { id: 'sps2', nameEn: 'Harun Ahmad', nameBn: 'হারুণ আহমদ', designationEn: 'Asst. Sports Secretary', designationBn: 'সহ-ক্রীড়া সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 16 },
        { id: 'rels1', nameEn: 'Nayeem Ahmad', nameBn: 'নাঈম আহমদ', designationEn: 'Religious Secretary', designationBn: 'ধর্ম সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 17 },
        { id: 'rels2', nameEn: '', nameBn: '', designationEn: 'Asst. Religious Secretary', designationBn: 'সহ-ধর্ম সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 18 },
        { id: 'edus1', nameEn: 'Shafayat Rasul (Alif)', nameBn: 'শাফায়াত রসুল (আলিফ)', designationEn: 'Education & Cultural Secretary', designationBn: 'শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 19 },
        { id: 'edus2', nameEn: 'Aminul Islam (Nabil)', nameBn: 'আমিনুল ইসলাম (নাবিল)', designationEn: 'Asst. Education & Cultural Secretary', designationBn: 'সহ-শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 20 },
        { id: 'wom1', nameEn: '', nameBn: '', designationEn: 'Women\'s Affairs Secretary', designationBn: 'মহিলা সম্পাদিকা', messageEn: '', messageBn: '', phone: '', image: logo, order: 21 },
        { id: 'wom2', nameEn: '', nameBn: '', designationEn: 'Asst. Women\'s Affairs Secretary', designationBn: 'সহ-মহিলা সম্পাদিকা', messageEn: '', messageBn: '', phone: '', image: logo, order: 22 },
        { id: 'off1', nameEn: '', nameBn: '', designationEn: 'Office Secretary', designationBn: 'দপ্তর সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 23 },
        { id: 'off2', nameEn: '', nameBn: '', designationEn: 'Asst. Office Secretary', designationBn: 'সহ-দপ্তর সম্পাদক', messageEn: '', messageBn: '', phone: '', image: logo, order: 24 }
      ];
      updateLeadership(defaultData);
      alert(lang === 'bn' ? 'পূর্ণাঙ্গ কমিটির তালিকা রিস্টোর হয়েছে!' : 'Full committee list restored!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert(lang === 'bn' ? 'দয়া করে একটি ছবি আপলোড করুন।' : 'Please upload a photo.');
      return;
    }
    if (editingId) {
      const updated = leadership.map(l => l.id === editingId ? { ...formData, id: editingId } : l);
      updateLeadership(updated);
    } else {
      const newLeader: Leadership = { ...formData, id: Date.now().toString() };
      updateLeadership([...leadership, newLeader]);
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ 
      nameEn: '', nameBn: '', 
      designationEn: '', designationBn: '', 
      messageEn: '', messageBn: '', 
      phone: '', 
      image: '', 
      order: leadership.length + 1 
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      updateLeadership(leadership.filter(l => l.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handleEdit = (leader: Leadership) => {
    setEditingId(leader.id);
    setFormData({ ...leader });
    setShowForm(true);
  };

  const leaderToDelete = leadership.find(l => l.id === deleteConfirmId);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="text-emerald-500" />
            {t.leadership}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Bilingual Leadership Management</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRestoreDefaults}
            className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-amber-200 transition-all active:scale-95 border border-amber-200 dark:border-amber-800"
          >
            <RefreshCcw size={18} />
            {lang === 'bn' ? 'কমিটির তালিকা রিস্টোর করুন' : 'Restore Committee List'}
          </button>
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-xl"
          >
            <Plus size={20} />
            {lang === 'bn' ? 'নতুন সদস্য' : 'Add New Member'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 animate-in slide-in-from-top-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                  {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Preview" /> : <Users className="text-slate-300" size={48} />}
                </div>
                <label htmlFor="leader-photo" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                  <Upload className="text-white" size={24} />
                  <input id="leader-photo" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400">Upload Photo</p>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Name (English)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">নাম (বাংলা)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Designation (English)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={formData.designationEn} onChange={e => setFormData({...formData, designationEn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">পদবী (বাংলা)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={formData.designationBn} onChange={e => setFormData({...formData, designationBn: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Phone</label>
                  <input type="tel" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Order</label>
                  <input required type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all">
              Save Member
            </button>
            <button type="button" onClick={resetForm} className="px-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-xl">
              Cancel
            </button>
          </div>
        </form>
      )}

      {leadership.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-20 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
          <Users size={64} className="mx-auto text-slate-300" />
          <h3 className="text-xl font-black text-slate-500">No members found.</h3>
          <button onClick={handleRestoreDefaults} className="text-emerald-600 font-black uppercase tracking-widest text-xs hover:underline">
            Restore Default Committee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leadership.sort((a,b) => (a.order||0)-(b.order||0)).map(leader => (
            <div key={leader.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex items-center gap-4 group hover:border-emerald-500/50 transition-all">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/10 shrink-0 bg-slate-50">
                <img src={leader.image} className="w-full h-full object-cover" alt={leader.nameEn} onError={(e) => {
                  (e.target as HTMLImageElement).src = settings.logo;
                }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">{lang === 'bn' ? (leader.nameBn || 'নাম নেই') : (leader.nameEn || 'No Name')}</div>
                <div className="text-xs font-bold text-emerald-600 uppercase mt-1 truncate">{lang === 'bn' ? leader.designationBn : leader.designationEn}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleEdit(leader)} className="p-2 text-slate-400 hover:text-emerald-500 transition-all"><Edit2 size={16} /></button>
                <button onClick={() => setDeleteConfirmId(leader.id)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deletion Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'সদস্য মুছে ফেলুন?' : 'Confirm Deletion'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  {lang === 'bn' 
                    ? `আপনি কি নিশ্চিত যে আপনি "${leaderToDelete?.nameBn || 'এই সদস্য'}"-কে তালিকা থেকে মুছে ফেলতে চান?` 
                    : `Are you sure you want to remove "${leaderToDelete?.nameEn || 'this member'}" from the committee list?`}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 text-white font-black py-4 rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
              >
                {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
