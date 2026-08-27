import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { BellRing, Plus, Trash2, Edit2, Clock, Loader2, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Notice } from '../../types';
import { parseLocalDate } from '../../utils/parseLocalDate';
import { formatFirebaseError, auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { normalizeGoogleDriveImage } from '../../utils/normalizeGoogleDriveImage';

export const NoticeManager: React.FC = () => {
  const { lang, notices, saveNotice, deleteNotice } = useApp();
  const t = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<Omit<Notice, 'id'>>({
    titleEn: '', 
    titleBn: '',
    contentEn: '', 
    contentBn: '',
    date: new Date().toISOString().split('T')[0],
    isUrgent: true,
    imageUrl: '',
    priority: 'normal'
  });

  const isDateWithin24Hours = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const localDate = parseLocalDate(dateStr);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - localDate.getTime());
    return diffMs <= 24 * 60 * 60 * 1000;
  };

  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusFeedback({ type, text });
    setTimeout(() => setStatusFeedback(null), 6000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusFeedback(null);

    // 1. Diagnostic logging: Check Auth User
    const currentUser = auth.currentUser;
    console.log("[ADMIN AUTH]", {
      uid: currentUser?.uid,
      email: currentUser?.email
    });

    if (!currentUser || !currentUser.uid) {
      const msg = lang === 'bn' 
        ? 'আপনি লগইন করেননি। অনুগ্রহ করে পুনরায় অ্যাডমিন হিসেবে সাইন ইন করুন।' 
        : 'You are not logged in. Please sign in as an administrator.';
      showToast('error', msg);
      return;
    }

    setIsSaving(true);
    try {
      // 2. Diagnostic logging & verification: Check Admin Document in Firestore
      const adminRef = doc(db, 'admins', currentUser.uid);
      let adminDoc = await getDoc(adminRef);
      console.log("[ADMIN DOCUMENT]", adminDoc.exists() ? adminDoc.data() : null);

      const superAdminEmail = (import.meta.env.VITE_SUPERADMIN_EMAIL || 'azadisocialwelfareorganization@gmail.com').toLowerCase();
      const isSuperAdminEmail = currentUser.email ? currentUser.email.toLowerCase() === superAdminEmail : false;

      // Handle initial superadmin self-bootstrap if missing
      if (!adminDoc.exists() && isSuperAdminEmail) {
        console.log("[ADMIN BOOTSTRAP] Creating superadmin document for", currentUser.uid);
        await setDoc(adminRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || 'Azadi Social Welfare Organization',
          role: 'superadmin',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        adminDoc = await getDoc(adminRef);
      }

      if (!adminDoc.exists()) {
        const errorMsg = lang === 'bn' 
          ? 'আপনার Firebase Admin authorization document পাওয়া যায়নি।' 
          : 'Your Firebase Admin authorization document was not found in Firestore (/admins/{uid}).';
        showToast('error', errorMsg);
        setIsSaving(false);
        return;
      }

      const adminData = adminDoc.data();
      if (adminData?.active !== true && !isSuperAdminEmail) {
        const errorMsg = lang === 'bn' 
          ? 'আপনার অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে।' 
          : 'Your administrator account is marked as inactive.';
        showToast('error', errorMsg);
        setIsSaving(false);
        return;
      }

      if (!['superadmin', 'admin', 'editor'].includes(adminData?.role) && !isSuperAdminEmail) {
        const errorMsg = lang === 'bn' 
          ? 'এই কাজটি করার জন্য আপনার প্রশাসনিক ভূমিকা (Role) অনুমোদিত নয়।' 
          : 'Your administrator role does not have permission for this action.';
        showToast('error', errorMsg);
        setIsSaving(false);
        return;
      }

      const isUrgentAuto = formData.isUrgent || isDateWithin24Hours(formData.date);
      const normalizedImg = formData.imageUrl ? normalizeGoogleDriveImage(formData.imageUrl) : '';

      const finalData: Omit<Notice, 'id'> = { 
        ...formData, 
        isUrgent: isUrgentAuto,
        ...(normalizedImg ? { imageUrl: normalizedImg } : {})
      };

      if (editingId) {
        await saveNotice({ ...finalData, id: editingId } as Notice);
        showToast('success', lang === 'bn' ? 'নোটিশ সফলভাবে আপডেট করা হয়েছে!' : 'Notice successfully updated!');
      } else {
        const newId = `notice_${Date.now()}`;
        await saveNotice({ ...finalData, id: newId } as Notice);
        showToast('success', lang === 'bn' ? 'নোটিশ সফলভাবে প্রকাশিত হয়েছে!' : 'Notice published successfully!');
      }
      resetForm();
    } catch (err: any) {
      console.error("Save notice failed:", err);
      const msg = formatFirebaseError(err, lang);
      showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      titleEn: '', titleBn: '',
      contentEn: '', contentBn: '',
      date: new Date().toISOString().split('T')[0],
      isUrgent: true,
      imageUrl: '',
      priority: 'normal'
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি এই নোটিশটি মুছে ফেলতে চান?' : 'Do you want to delete this notice?')) {
      setDeletingId(id);
      try {
        await deleteNotice(id);
        showToast('success', lang === 'bn' ? 'নোটিশ সফলভাবে মুছে ফেলা হয়েছে।' : 'Notice deleted successfully.');
      } catch (err) {
        console.error("Delete notice failed:", err);
        showToast('error', formatFirebaseError(err, lang));
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setFormData({ 
      titleEn: notice.titleEn || '',
      titleBn: notice.titleBn || '',
      contentEn: notice.contentEn || '',
      contentBn: notice.contentBn || '',
      date: notice.date || new Date().toISOString().split('T')[0],
      isUrgent: notice.isUrgent ?? true,
      imageUrl: notice.imageUrl || '',
      priority: notice.priority || 'normal'
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl active:scale-95 transition-all">
          <Plus size={20} /> {lang === 'bn' ? 'নতুন নোটিশ' : 'New Notice'}
        </button>
      </div>

      {statusFeedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in ${
          statusFeedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {statusFeedback.type === 'success' ? <CheckCircle2 className="shrink-0" size={20} /> : <AlertCircle className="shrink-0" size={20} />}
          <span className="font-bold text-sm">{statusFeedback.text}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 animate-in slide-in-from-top-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">তারিখ / Date</label>
                <input required type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold" value={formData.date} onChange={e => {
                  const newDate = e.target.value;
                  setFormData({
                    ...formData,
                    date: newDate,
                    isUrgent: formData.isUrgent || isDateWithin24Hours(newDate)
                  });
                }} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
                  <ImageIcon size={14} /> ছবি বা এটাচমেন্ট লিংক (Optional Image / Drive URL)
                </label>
                <input 
                  type="url" 
                  placeholder="https://drive.google.com/... or image link"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-medium text-sm" 
                  value={formData.imageUrl || ''} 
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} 
                />
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
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{lang === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving to Firestore...'}</span>
                </>
              ) : (
                <span>{editingId ? (lang === 'bn' ? 'নোটিশ আপডেট করুন' : 'Update Notice') : (lang === 'bn' ? 'নোটিশ পোস্ট করুন' : 'Post Notice')}</span>
              )}
            </button>
            <button type="button" onClick={resetForm} disabled={isSaving} className="px-10 bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-black py-4 rounded-xl">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6">
        {notices.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
            <BellRing className="mx-auto mb-3 opacity-40" size={36} />
            <p className="font-bold">{lang === 'bn' ? 'বর্তমানে কোনো নোটিশ নেই।' : 'No notices published yet.'}</p>
          </div>
        ) : (
          notices.map(notice => (
            <div key={notice.id} className={`bg-white dark:bg-slate-900 rounded-[2rem] border ${notice.isUrgent ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'} p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 group`}>
              <div className="flex-1 space-y-3 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Clock size={12} /> {parseLocalDate(notice.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {notice.isUrgent && <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase rounded-full">Urgent</span>}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight bengali">{lang === 'bn' ? notice.titleBn : notice.titleEn}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm line-clamp-2 bengali">{lang === 'bn' ? notice.contentBn : notice.contentEn}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(notice)} className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"><Edit2 size={20} /></button>
                <button onClick={() => handleDelete(notice.id)} disabled={deletingId === notice.id} className="p-4 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50">
                  {deletingId === notice.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
