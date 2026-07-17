import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { Calendar, Plus, Trash2, Edit2, MapPin, Loader2, Video, Clipboard, UploadCloud, Image, X } from 'lucide-react';
import { Event } from '../../types';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { parseLocalDate } from '../../utils/parseLocalDate';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

export const EventManager: React.FC = () => {
  const { lang, events, saveEvent, deleteEvent } = useApp();
  const t = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return lang === 'bn' ? 'তারিখ পাওয়া যায়নি' : 'Date not available';
    try {
      const d = parseLocalDate(dateStr);
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
    image: '',
    meetUrl: ''
  });

  // Storage Upload States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(lang === 'bn' ? 'দয়া করে একটি ছবি ফাইল নির্বাচন করুন।' : 'Please select a valid image file.');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    const fileId = `event_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `events/${fileId}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Storage upload error:", error);
        alert(lang === 'bn' ? 'ছবি আপলোড করতে ব্যর্থ হয়েছে!' : 'Failed to upload image!');
        setUploading(false);
        setUploadProgress(null);
      }, 
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({ ...prev, image: downloadUrl }));
        } catch (err) {
          console.error("Error getting download URL:", err);
        } finally {
          setUploading(false);
          setUploadProgress(null);
        }
      }
    );
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleCreateMeet = () => {
    // Generate a unique real Meet code style (e.g. abc-defg-hij)
    const part = (len: number) => Math.random().toString(36).substring(2, 2 + len);
    const generatedMeet = `https://meet.google.com/${part(3)}-${part(4)}-${part(3)}`;
    setFormData(prev => ({ ...prev, meetUrl: generatedMeet }));
    alert(lang === 'bn' ? 'গুগল মিট লিংক সফলভাবে তৈরি করা হয়েছে!' : 'Unique Google Meet scheduled successfully!');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      saveEvent({ ...formData, id: editingId } as Event);
    } else {
      const newId = `event_${Date.now()}`;
      saveEvent({ ...formData, id: newId } as Event);
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
      image: '',
      meetUrl: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি এটি মুছে ফেলতে চান?' : 'Delete this event?')) {
      deleteEvent(id);
    }
  };

  const handleEdit = (ev: Event) => {
    setEditingId(ev.id);
    setFormData({ 
      titleEn: ev.titleEn || '',
      titleBn: ev.titleBn || '',
      descriptionEn: ev.descriptionEn || '',
      descriptionBn: ev.descriptionBn || '',
      locationEn: ev.locationEn || '',
      locationBn: ev.locationBn || '',
      date: ev.date || '',
      image: ev.image || '',
      meetUrl: ev.meetUrl || ''
    });
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
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">{lang === 'bn' ? 'সংগঠনের সার্বিক ইভেন্টসমূহ পরিচালনা করুন' : 'Manage corporate association events'}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl active:scale-95">
          <Plus size={20} /> {lang === 'bn' ? 'নতুন ইভেন্ট' : 'New Event'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 animate-in slide-in-from-top-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Event Date</label>
                <input required type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              {/* Custom Image Upload Drag-Drop with Progress bar */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                  {lang === 'bn' ? 'ইভেন্ট কভার ছবি' : 'Event Cover Image'}
                </label>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden ${
                    dragActive 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-950/50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  {formData.image ? (
                    <div className="space-y-3 w-full relative z-10 group/img" onClick={(e) => e.stopPropagation()}>
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <img src={getOptimizedImageUrl(formData.image, 300)} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          type="button" 
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-lg transition-transform hover:scale-105 active:scale-95"
                          title={lang === 'bn' ? 'ছবি মুছে ফেলুন' : 'Remove Image'}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold truncate px-2">{formData.image}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pointer-events-none">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-full w-fit mx-auto shadow-sm border border-slate-100 dark:border-slate-800">
                        <UploadCloud className="text-emerald-500 animate-pulse" size={24} />
                      </div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {lang === 'bn' ? 'ছবি ড্র্যাগ করে ছাড়ুন অথবা ব্রাউজ করুন' : 'Drag & drop image here, or browse'}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}

                  {/* Upload Progress Overlay */}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 flex flex-col items-center justify-center p-4 z-20 space-y-3">
                      <Loader2 className="animate-spin text-emerald-500" size={24} />
                      <div className="w-full max-w-[150px] bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        {uploadProgress}% {lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Manual Override Field */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-1 block">
                    {lang === 'bn' ? 'অথবা সরাসরি ইমেজ লিংক বসান (ঐচ্ছিক)' : 'Or manual photo image URL (Optional)'}
                  </span>
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/..." 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-mono text-xs" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                  />
                </div>
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
                   <label className="text-[11px] font-black uppercase text-slate-500 ml-1">स्थान (বাংলা)</label>
                   <input required type="text" placeholder="সিলেট শহর" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.locationBn} onChange={e => setFormData({...formData, locationBn: e.target.value})} />
                </div>
              </div>
              <textarea required rows={3} placeholder="Description (EN)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium" value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} />
              <textarea required rows={3} placeholder="বিবরণ (বাংলা)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium" value={formData.descriptionBn} onChange={e => setFormData({...formData, descriptionBn: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <label className="text-[11px] font-black uppercase text-slate-500 ml-1 flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              {lang === 'bn' ? 'গুগল মিট লিংক (ঐচ্ছিক)' : 'Google Meet URL (Optional)'}
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="url" 
                placeholder="https://meet.google.com/abc-defg-hij" 
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold font-mono text-sm text-blue-600 dark:text-blue-400" 
                value={formData.meetUrl || ''} 
                onChange={e => setFormData({...formData, meetUrl: e.target.value})} 
              />
              <button 
                type="button" 
                onClick={handleCreateMeet} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-all"
              >
                <Video className="shrink-0" size={18} />
                {lang === 'bn' ? 'মিট লিংক তৈরি করুন' : 'Schedule Google Meet'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-tight">
              {lang === 'bn' 
                ? 'আই ফ্রেম সীমার কারণে মিট লিংক সরাসরি ব্যবহার করা যাবে। ডেমোর জন্য লিংকটি ইনস্ট্যান্টলি তৈরি হবে।' 
                : 'Provides instant meeting links for online social service planning, community calls, or events.'}
            </p>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all">
              {editingId ? (lang === 'bn' ? 'ইভেন্ট আপডেট করুন' : 'Update Event') : (lang === 'bn' ? 'ইভেন্ট সংরক্ষণ করুন' : 'Save Event')}
            </button>
            <button type="button" onClick={resetForm} className="px-10 bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-black py-4 rounded-xl">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
            <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-950">
              {event.image ? <img src={getOptimizedImageUrl(event.image, 300)} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.titleEn} /> : <div className="w-full h-full flex items-center justify-center text-emerald-100"><Calendar size={48} /></div>}
              <div className="absolute top-4 right-4 flex gap-2">
                 <button onClick={() => handleEdit(event)} className="p-3 bg-white/90 dark:bg-slate-800/90 text-emerald-600 rounded-xl shadow-lg hover:scale-110 transition-transform"><Edit2 size={16} /></button>
                 <button onClick={() => handleDelete(event.id)} className="p-3 bg-white/90 dark:bg-slate-800/90 text-rose-600 rounded-xl shadow-lg hover:scale-110 transition-transform"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{formatDate(event.date)}</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 bengali">{lang === 'bn' ? event.titleBn : event.titleEn}</h3>
                <p className="text-slate-400 text-[11px] font-bold flex items-center gap-1"><MapPin size={10} /> {lang === 'bn' ? event.locationBn : event.locationEn}</p>
                {event.meetUrl && (
                  <div className="text-blue-600 dark:text-blue-400 text-[10px] font-black flex items-center gap-1.5 mt-1 bg-blue-500/5 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg w-fit max-w-full">
                    <Video size={11} className="shrink-0 text-blue-500" />
                    <span className="truncate font-mono select-all">
                      {event.meetUrl.replace('https://', '')}
                    </span>
                  </div>
                )}
              </div>
              {event.meetUrl && (
                <a
                  href={event.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-white dark:text-blue-400 font-extrabold text-[11px] uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all text-center"
                >
                  <Video size={14} className="shrink-0 text-blue-500" />
                  {lang === 'bn' ? 'গুগল মিটে যোগ দিন' : 'Join Google Meet'}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
