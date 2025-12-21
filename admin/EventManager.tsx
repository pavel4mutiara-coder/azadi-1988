
import React, { useState } from 'react';
import { useApp, compressImage } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Calendar, Plus, Trash2, Edit2, Upload } from 'lucide-react';
import { Event } from '../types';

export const EventManager: React.FC = () => {
  const { lang, events, updateEvents } = useApp();
  const t = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64, 600, 400); // Larger for events
        setFormData(prev => ({ ...prev, image: compressed }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert('দয়া করে একটি ছবি আপলোড করুন।');
      return;
    }
    if (editingId) {
      const updated = events.map(ev => ev.id === editingId ? { ...formData, id: editingId } : ev);
      updateEvents(updated);
    } else {
      const newEvent: Event = { ...formData, id: Date.now().toString() };
      updateEvents([...events, newEvent]);
    }
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
    if (window.confirm('মুছে ফেলতে চান?')) {
      updateEvents(events.filter(e => e.id !== id));
    }
  };

  const handleEdit = (ev: Event) => {
    setEditingId(ev.id);
    setFormData({ ...ev });
    setShowForm(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Calendar className="text-emerald-500" />
          {t.events}
        </h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl active:scale-95">
          <Plus size={20} /> New Event
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="relative group">
                <div className="w-full h-56 rounded-2xl overflow-hidden border-2 border-emerald-500/20 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                  {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Preview" /> : <Calendar className="text-slate-300" size={64} />}
                </div>
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity">
                  <Upload className="text-white" size={32} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <input required type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input required type="text" placeholder="Title (EN)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} />
                <input required type="text" placeholder="শিরোনাম (বাংলা)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.titleBn} onChange={e => setFormData({...formData, titleBn: e.target.value})} />
              </div>
              <textarea required rows={3} placeholder="Description (EN)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium" value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} />
              <textarea required rows={3} placeholder="বিবরণ (বাংলা)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium" value={formData.descriptionBn} onChange={e => setFormData({...formData, descriptionBn: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700">Save Event</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="h-48 overflow-hidden relative">
              <img src={event.image} className="w-full h-full object-cover" alt={event.titleEn} />
              <div className="absolute bottom-4 left-4 text-white font-black text-lg">{lang === 'bn' ? event.titleBn : event.titleEn}</div>
            </div>
            <div className="p-6 flex justify-between">
              <div className="text-xs font-bold text-emerald-600">{new Date(event.date).toLocaleDateString()}</div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(event)} className="text-slate-400 hover:text-emerald-500"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(event.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
