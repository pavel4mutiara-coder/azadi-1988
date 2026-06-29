import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Testimonial } from '../../types';
import { 
  Check, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  FileText,
  Edit2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MemberImage } from '../../components/MemberImage';

export const TestimonialManager: React.FC = () => {
  const { lang, isAdmin } = useApp();
  const t = TRANSLATIONS[lang];

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    nameEn: '',
    nameBn: '',
    roleEn: '',
    roleBn: '',
    locationEn: '',
    locationBn: '',
    quoteEn: '',
    quoteBn: '',
    status: 'PENDING' as 'PENDING' | 'APPROVED'
  });

  const handleEditClick = (tItem: Testimonial) => {
    setEditingTestimonialId(tItem.id);
    setTestimonialForm({
      nameEn: tItem.nameEn || '',
      nameBn: tItem.nameBn || '',
      roleEn: tItem.roleEn || '',
      roleBn: tItem.roleBn || '',
      locationEn: tItem.locationEn || '',
      locationBn: tItem.locationBn || '',
      quoteEn: tItem.quoteEn || '',
      quoteBn: tItem.quoteBn || '',
      status: tItem.status || 'PENDING'
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonialId) return;
    setActionLoadingId(editingTestimonialId);
    try {
      const existing = testimonials.find(item => item.id === editingTestimonialId);
      if (!existing) {
        throw new Error("Testimonial not found in local list.");
      }
      const docRef = doc(db, 'testimonials', editingTestimonialId);
      const fullUpdate: Testimonial = {
        ...existing,
        nameEn: testimonialForm.nameEn,
        nameBn: testimonialForm.nameBn,
        roleEn: testimonialForm.roleEn,
        roleBn: testimonialForm.roleBn,
        locationEn: testimonialForm.locationEn,
        locationBn: testimonialForm.locationBn,
        quoteEn: testimonialForm.quoteEn,
        quoteBn: testimonialForm.quoteBn,
        status: testimonialForm.status as 'PENDING' | 'APPROVED'
      };
      await setDoc(docRef, fullUpdate);
      
      // Update local state
      setTestimonials(prev => 
        prev.map(item => item.id === editingTestimonialId ? fullUpdate : item)
      );

      alert(lang === 'bn' ? 'টেস্টিমোনিয়াল সফলভাবে আপডেট করা হয়েছে!' : 'Testimonial successfully updated!');
      setEditingTestimonialId(null);
    } catch (err) {
      console.error("Error updating testimonial:", err);
      alert(lang === 'bn' ? 'আপডেট করতে ত্রুটি হয়েছে।' : 'Error updating testimonial.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const fetchAllTestimonials = async () => {
    setLoading(true);
    try {
      const q = collection(db, 'testimonials');
      const snapshot = await getDocs(q);
      const list: Testimonial[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Testimonial);
      });
      // Sort by newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTestimonials(list);
    } catch (err) {
      console.error("Error retrieving testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllTestimonials();
    }
  }, [isAdmin]);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const existing = testimonials.find(item => item.id === id);
      if (!existing) {
        throw new Error("Testimonial not found in local list.");
      }
      const docRef = doc(db, 'testimonials', id);
      const fullUpdate: Testimonial = { ...existing, status: 'APPROVED' };
      await setDoc(docRef, fullUpdate);
      
      // Update local state
      setTestimonials(prev => 
        prev.map(item => item.id === id ? fullUpdate : item)
      );
    } catch (err) {
      console.error("Error approving testimonial:", err);
      alert(lang === 'bn' ? 'অনুমোদন করতে ত্রুটি হয়েছে।' : 'Error approving testimonial.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this testimonial?')) {
      return;
    }
    setActionLoadingId(id);
    try {
      const docRef = doc(db, 'testimonials', id);
      await deleteDoc(docRef);
      
      // Update local state
      setTestimonials(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      alert(lang === 'bn' ? 'মুছে ফেলতে ত্রুটি হয়েছে।' : 'Error deleting testimonial.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">
          {lang === 'bn' ? 'লোডিং হচ্ছে...' : 'Loading testimonials...'}
        </p>
      </div>
    );
  }

  const pendingList = testimonials.filter(tItem => tItem.status === 'PENDING');
  const approvedList = testimonials.filter(tItem => tItem.status === 'APPROVED');

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500 bengali">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-650 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{lang === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}</span>
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {lang === 'bn' ? 'টেস্টিমোনিয়াল ম্যানেজার' : 'Testimonials Manager'}
          </h1>
          <p className="text-slate-500 text-xs">
            {lang === 'bn' 
              ? 'ব্যবহারকারীদের থেকে পাঠানো টেস্টিমোনিয়াল পর্যালোচনা এবং অনুমোদন করুন।' 
              : 'Review, approve, and manage user-submitted stories of hope and impact.'}
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="space-y-12">
        {/* Pending Reviews */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Clock size={18} className="text-amber-500" />
            <span>{lang === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Awaiting Approval'} ({pendingList.length})</span>
          </h2>

          {pendingList.length === 0 ? (
            <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-850 flex flex-col items-center text-center gap-3">
              <AlertCircle size={32} className="text-slate-300 dark:text-slate-700" />
              <p className="text-xs text-slate-400 font-semibold leading-normal">
                {lang === 'bn' ? 'কোনো অপেক্ষমান মতামত পাওয়া যায়নি।' : 'No testimonials currently awaiting review.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingList.map(tItem => (
                <div 
                  key={tItem.id} 
                  className="bg-white dark:bg-slate-900 border-2 border-amber-500/20 p-6 rounded-3xl relative flex flex-col justify-between shadow-soft hover:shadow-heavy transition-all duration-300"
                >
                  <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                    PENDING
                  </span>

                  <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed text-[12px] h-24 overflow-y-auto pr-1">
                      {lang === 'bn' ? tItem.quoteBn || tItem.quoteEn : tItem.quoteEn || tItem.quoteBn}
                    </p>

                    <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-150 p-0.5">
                        <MemberImage src={tItem.image} alt={tItem.nameEn} widthPreset="small" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                          {lang === 'bn' ? tItem.nameBn || tItem.nameEn : tItem.nameEn || tItem.nameBn}
                        </h4>
                        <div className="text-[9px] font-bold text-slate-400 truncate">
                          {lang === 'bn' ? tItem.roleBn || tItem.roleEn : tItem.roleEn || tItem.roleBn}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {lang === 'bn' ? tItem.locationBn || tItem.locationEn : tItem.locationEn || tItem.locationBn}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                    <button
                      onClick={() => handleApprove(tItem.id)}
                      disabled={actionLoadingId !== null}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      {actionLoadingId === tItem.id ? (
                        <Loader2 className="animate-spin" size={12} />
                      ) : (
                        <Check size={12} />
                      )}
                      <span>{lang === 'bn' ? 'অনুমোদন দিন' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => handleEditClick(tItem)}
                      disabled={actionLoadingId !== null}
                      title={lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit testimonial'}
                      className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-all disabled:opacity-50"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tItem.id)}
                      disabled={actionLoadingId !== null}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Reviews */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span>{lang === 'bn' ? 'অনুমোদিত মতামতসমূহ' : 'Approved Stories'} ({approvedList.length})</span>
          </h2>

          {approvedList.length === 0 ? (
            <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-850 flex flex-col items-center text-center gap-3">
              <FileText size={32} className="text-slate-300 dark:text-slate-700" />
              <p className="text-xs text-slate-400 font-semibold leading-normal">
                {lang === 'bn' ? 'কোনো অনুমোদিত মতামত পাওয়া যায়নি।' : 'No approved testimonials found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedList.map(tItem => (
                <div 
                  key={tItem.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl relative flex flex-col justify-between shadow-soft hover:shadow-heavy transition-all duration-300"
                >
                  <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    APPROVED
                  </span>

                  <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed text-[12px] h-24 overflow-y-auto pr-1">
                      {lang === 'bn' ? tItem.quoteBn || tItem.quoteEn : tItem.quoteEn || tItem.quoteBn}
                    </p>

                    <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-150 p-0.5">
                        <MemberImage src={tItem.image} alt={tItem.nameEn} widthPreset="small" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                          {lang === 'bn' ? tItem.nameBn || tItem.nameEn : tItem.nameEn || tItem.nameBn}
                        </h4>
                        <div className="text-[9px] font-bold text-slate-400 truncate">
                          {lang === 'bn' ? tItem.roleBn || tItem.roleEn : tItem.roleEn || tItem.roleBn}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {lang === 'bn' ? tItem.locationBn || tItem.locationEn : tItem.locationEn || tItem.locationBn}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                    <button
                      onClick={() => handleEditClick(tItem)}
                      disabled={actionLoadingId !== null}
                      className="py-2 px-3.5 bg-amber-50 hover:bg-amber-100 text-amber-605 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-soft"
                    >
                      <Edit2 size={12} />
                      <span>{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(tItem.id)}
                      disabled={actionLoadingId !== null}
                      className="py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-soft"
                    >
                      <Trash2 size={12} />
                      <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Testimonial Edit Modal Overlay */}
      {editingTestimonialId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingTestimonialId(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in"></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl border border-slate-100 dark:border-slate-800 p-8 shadow-heavy relative animate-in zoom-in-95 duration-200 bengali max-h-[90vh] overflow-y-auto z-10 text-slate-900 dark:text-slate-100">
            <button onClick={() => setEditingTestimonialId(null)} className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
              {lang === 'bn' ? 'টেস্টিমোনিয়াল সম্পাদনা' : 'Edit Testimonial'}
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name (English) *</label>
                  <input 
                    type="text"
                    required
                    value={testimonialForm.nameEn}
                    onChange={e => setTestimonialForm({ ...testimonialForm, nameEn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">নাম (বাংলা) *</label>
                  <input 
                    type="text"
                    required
                    value={testimonialForm.nameBn}
                    onChange={e => setTestimonialForm({ ...testimonialForm, nameBn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role (English) *</label>
                  <input 
                    type="text"
                    required
                    value={testimonialForm.roleEn}
                    onChange={e => setTestimonialForm({ ...testimonialForm, roleEn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">পদবি (বাংলা) *</label>
                  <input 
                    type="text"
                    required
                    value={testimonialForm.roleBn}
                    onChange={e => setTestimonialForm({ ...testimonialForm, roleBn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location (English) *</label>
                  <input 
                    type="text"
                    required
                    value={testimonialForm.locationEn}
                    onChange={e => setTestimonialForm({ ...testimonialForm, locationEn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ঠিকানা (বাংলা) *</label>
                  <input 
                    type="text"
                    required
                    value={testimonialForm.locationBn}
                    onChange={e => setTestimonialForm({ ...testimonialForm, locationBn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quote (English) *</label>
                <textarea 
                  required
                  rows={2}
                  value={testimonialForm.quoteEn}
                  onChange={e => setTestimonialForm({ ...testimonialForm, quoteEn: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-medium text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">বিবরণী (বাংলা) *</label>
                <textarea 
                  required
                  rows={2}
                  value={testimonialForm.quoteBn}
                  onChange={e => setTestimonialForm({ ...testimonialForm, quoteBn: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-medium text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status *</label>
                <select 
                  value={testimonialForm.status}
                  onChange={e => setTestimonialForm({ ...testimonialForm, status: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="PENDING">PENDING (অপেক্ষমান)</option>
                  <option value="APPROVED">APPROVED (অনুমোদিত)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingTestimonialId(null)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl border border-slate-250 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white font-black py-3.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all text-center"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
