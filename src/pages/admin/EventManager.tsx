
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { Calendar, Plus, Trash2, Edit2, Upload, MapPin, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Event } from '../../types';
import { uploadImage } from '../../firebase';

export const EventManager: React.FC = () => {
  const { lang, events, saveEvent, deleteEvent } = useApp();
  const t = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Added formatDate helper function to fix missing function error on line 149
  const formatDate = (dateStr: string) => {
    if (!dateStr) return lang === 'bn' ? 'তারিখ পাওয়া যায়নি' : 'Date not available';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };
  
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    titleEn: '', titleBn: '',
    descriptionEn: '', descriptionBn: '',
    locationEn: '', locationBn: '',
    date: '',
    image: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const url = await uploadImage(file, "events");
        setFormData(prev => ({ ...prev, image: url }));
      } catch (error) {
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert(lang === 'bn' ? 'দয়া করে একটি ছবি আপলোড করুন।' : 'Please upload a photo.');
      return;
    }
    const newEvent: Event = { ...formData, id: editingId || Date.now().toString() };
    saveEvent(newEvent);
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      titleEn: '', titleBn: '',
      descriptionEn: '', descriptionBn: '',
      locationEn: '', locationBn: '',
      date: '',
      image: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি এটি মুছে ফেলতে চান?' : 'Delete this event?')) {
      deleteEvent(id);
    }
  };

  const handleEdit = (ev: Event) => {
    setEditingId(ev.id);
    setFormData({ ...ev });
    setShowForm(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
             <Calendar className="text-emerald-500" />
             {t.events}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Manage public event gallery</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl active:scale-95">
          <Plus size={20} /> {lang === 'bn' ? 'নতুন ইভেন্ট' : 'New Event'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 animate-in slide-in-from-top-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="relative group">
                <div className="w-full h-56 rounded-3xl overflow-hidden border-2 border-emerald-500/20 bg-slate-50 dark:bg-slate-950 flex items-center justify-center shadow-inner">
                  {isUploading ? <Loader2 className="text-emerald-500 animate-spin" size={32} /> : formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon className="text-slate-300" size={64} />}
                </div>
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-3xl cursor-pointer transition-opacity">
                  <Upload className="text-white" size={32} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Event Date</label>
                <input required type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Title (EN)</label>
                   <input required type="text" placeholder="Winter Aid" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[11px] font-black uppercase text-slate-500 ml-1">শিরোনাম (বাংলা)</label>
                   <input required type="text" placeholder="শীতবস্ত্র বিতরণ" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.titleBn} onChange={e => setFormData({...formData, titleBn: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Location (EN)</label>
                   <input required type="text" placeholder="Sylhet City" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.locationEn} onChange={e => setFormData({...formData, locationEn: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[11px] font-black uppercase text-slate-500 ml-1">স্থান (বাংলা)</label>
                   <input required type="text" placeholder="সিলেট শহর" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.locationBn} onChange={e => setFormData({...formData, locationBn: e.target.value})} />
                </div>
              </div>
              <textarea required rows={3} placeholder="Description (EN)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium" value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} />
              <textarea required rows={3} placeholder="বিবরণ (বাংলা)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium" value={formData.descriptionBn} onChange={e => setFormData({...formData, descriptionBn: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all">
              {editingId ? 'Update Event' : 'Save Event'}
            </button>
            <button type="button" onClick={resetForm} className="px-10 bg-slate-100 text-slate-500 font-black py-4 rounded-xl">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
            <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-950">
              {event.image ? <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.titleEn} /> : <div className="w-full h-full flex items-center justify-center text-emerald-100"><Calendar size={48} /></div>}
              <div className="absolute top-4 right-4 flex gap-2">
                 <button onClick={() => handleEdit(event)} className="p-3 bg-white/90 dark:bg-slate-800/90 text-emerald-600 rounded-xl shadow-lg hover:scale-110 transition-transform"><Edit2 size={16} /></button>
                 <button onClick={() => handleDelete(event.id)} className="p-3 bg-white/90 dark:bg-slate-800/90 text-rose-600 rounded-xl shadow-lg hover:scale-110 transition-transform"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-6 flex-1 space-y-2">
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{formatDate(event.date)}</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 bengali">{lang === 'bn' ? event.titleBn : event.titleEn}</h3>
              <p className="text-slate-400 text-[11px] font-bold flex items-center gap-1"><MapPin size={10} /> {lang === 'bn' ? event.locationBn : event.locationEn}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
