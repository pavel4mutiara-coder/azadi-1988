import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { BellRing, Plus, Trash2, Edit2, Clock } from 'lucide-react';
import { Notice } from '../../types';

export const NoticeManager: React.FC = () => {
  const { lang, notices, saveNotice, deleteNotice } = useApp();
  const t = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Notice, 'id'>>({
    titleEn: '', titleBn: '',
    contentEn: '', contentBn: '',
    date: new Date().toISOString().split('T')[0],
    isUrgent: false
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      saveNotice({ ...formData, id: editingId } as Notice);
    } else {
      const newId = `notice_${Date.now()}`;
      saveNotice({ ...formData, id: newId } as Notice);
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      titleEn: '', titleBn: '',
      contentEn: '', contentBn: '',
      date: new Date().toISOString().split('T')[0],
      isUrgent: false
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি এই নোটিশটি মুছে ফেলতে চান?' : 'Do you want to delete this notice?')) {
      deleteNotice(id);
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setFormData({ ...notice });
    setShowForm(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <BellRing className="text-amber-500" />
            {t.notices}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">{lang === 'bn' ? 'সংগঠনের নোটিশ বোর্ড তদারকি ও নতুন নোটিশ প্রকাশ করুন' : 'Oversee notice boards and publish active administrative notices'}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl active:scale-95">
          <Plus size={20} /> {lang === 'bn' ? 'নতুন নোটিশ' : 'New Notice'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 animate-in slide-in-from-top-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">তারিখ / Date</label>
                <input required type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              
              <label className="flex items-center gap-4 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50 cursor-pointer select-none">
                <input type="checkbox" className="w-6 h-6 rounded-lg text-amber-600 focus:ring-amber-500 cursor-pointer" checked={formData.isUrgent} onChange={e => setFormData({...formData, isUrgent: e.target.checked})} />
                <div>
                  <div className="font-black text-amber-900 dark:text-amber-400 text-sm">Mark as Urgent</div>
                  <div className="text-[10px] font-bold text-amber-700/60 dark:text-amber-500/50 uppercase">নোটিশটি লাল রঙে হাইলাইট হবে</div>
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Title (EN)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">শিরোনাম (বাংলা)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.titleBn} onChange={e => setFormData({...formData, titleBn: e.target.value})} />
                </div>
              </div>
              <textarea rows={4} placeholder="Content (EN)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium" value={formData.contentEn} onChange={e => setFormData({...formData, contentEn: e.target.value})} />
              <textarea rows={4} placeholder="বিস্তারিত (বাংলা)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl font-medium" value={formData.contentBn} onChange={e => setFormData({...formData, contentBn: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all">{editingId ? (lang === 'bn' ? 'নোটিশ আপডেট করুন' : 'Update Notice') : (lang === 'bn' ? 'নোটিশ পোস্ট করুন' : 'Post Notice')}</button>
            <button type="button" onClick={resetForm} className="px-10 bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-black py-4 rounded-xl">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6">
        {notices.map(notice => (
          <div key={notice.id} className={`bg-white dark:bg-slate-900 rounded-[2rem] border ${notice.isUrgent ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'} p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 group`}>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Clock size={12} /> {new Date(notice.date).toLocaleDateString()}</span>
                {notice.isUrgent && <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase rounded-full">Urgent</span>}
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight bengali">{lang === 'bn' ? notice.titleBn : notice.titleEn}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm line-clamp-2 bengali">{lang === 'bn' ? notice.contentBn : notice.contentEn}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(notice)} className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"><Edit2 size={20} /></button>
              <button onClick={() => handleDelete(notice.id)} className="p-4 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
