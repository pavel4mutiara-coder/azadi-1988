import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { News } from '../../types';
import { Newspaper, Plus, Trash2, Edit2, Clock } from 'lucide-react';

export const NewsManager: React.FC = () => {
  const { lang, news, saveNews, deleteNews } = useApp();
  const t = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<News, 'id'>>({
    titleEn: '', titleBn: '',
    contentEn: '', contentBn: '',
    date: new Date().toISOString().split('T')[0],
    image: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      saveNews({ ...formData, id: editingId } as News);
    } else {
      const newId = `news_${Date.now()}`;
      saveNews({ ...formData, id: newId } as News);
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
      image: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি এই সংবাদটি মুছে ফেলতে চান?' : 'Do you want to delete this news?')) {
      deleteNews(id);
    }
  };

  const handleEdit = (n: News) => {
    setEditingId(n.id);
    setFormData({ ...n });
    setShowForm(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Newspaper className="text-blue-500" />
            {t.news}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">{lang === 'bn' ? 'সংগঠনের সংবাদ ও নিয়মিত আপডেটসমূহ প্রকাশ ও পরিচালনা করুন' : 'Publish and manage press releases and organization updates'}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl active:scale-95">
          <Plus size={20} /> {lang === 'bn' ? 'নতুন সংবাদ' : 'Add News'}
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
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Photo Image URL</label>
                <input type="text" placeholder="https://images.unsplash.com/..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>
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
              <textarea rows={4} placeholder="বিস্তারিত (বাংলা)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium" value={formData.contentBn} onChange={e => setFormData({...formData, contentBn: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all">{editingId ? (lang === 'bn' ? 'সংবাদ আপডেট করুন' : 'Update News') : (lang === 'bn' ? 'সংবাদ সংরক্ষণ করুন' : 'Save News')}</button>
            <button type="button" onClick={resetForm} className="px-10 bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-black py-4 rounded-xl">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map(n => (
          <div key={n.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl group hover:-translate-y-1 transition-all flex flex-col">
            <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-950">
              {n.image ? <img src={n.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="News" /> : <div className="w-full h-full flex items-center justify-center text-emerald-100"><Newspaper size={48} /></div>}
              <div className="absolute top-4 left-4 flex gap-2">
                 <button onClick={() => handleEdit(n)} className="p-3 bg-white/90 dark:bg-slate-800/90 text-emerald-600 rounded-xl shadow-lg hover:scale-110 transition-transform"><Edit2 size={16} /></button>
                 <button onClick={() => handleDelete(n.id)} className="p-3 bg-white/90 dark:bg-slate-800/90 text-rose-600 rounded-xl shadow-lg hover:scale-110 transition-transform"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Clock size={12} /> {new Date(n.date).toLocaleDateString()}</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 bengali">{lang === 'bn' ? n.titleBn : n.titleEn}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xs line-clamp-2 bengali">{lang === 'bn' ? n.contentBn : n.contentEn}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
