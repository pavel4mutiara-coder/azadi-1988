import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { Users, Plus, Trash2, Edit2, Upload, AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';
import { Leadership } from '../../types';
import { uploadImage } from '../../firebase';
import { INITIAL_COMMITTEE } from '../../utils/committee';

export const LeadershipManager: React.FC = () => {
  const { lang, leadership, settings, updateLeadership, replaceLeadership } = useApp();
  const t = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Leadership, 'id'>>({
    nameEn: '', nameBn: '',
    designationEn: '', designationBn: '',
    subDesignationEn: '', subDesignationBn: '',
    messageEn: '', messageBn: '',
    phone: '',
    image: '', 
    order: leadership.length + 1,
    status: 'active',
    createdAt: new Date().toISOString()
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const url = await uploadImage(file, "leadership");
        setFormData(prev => ({ ...prev, image: url }));
      } catch (error) {
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRestoreDefaults = async () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি পূর্ণাঙ্গ কমিটির কাঠামো লোড করতে চান? এটি বর্তমান তালিকা মুছে দেবে এবং নতুন ডেটা দিয়ে আপডেট করবে।' : 'Load full committee structure? This will replace current list and update with defaults.')) {
      try {
        setIsRestoring(true);
        // Create restored list with stable IDs to prevent duplication on repeated restores
        const restored = INITIAL_COMMITTEE.map((d, index) => ({
          ...d,
          id: `leader-${index + 1}`,
          image: '',
          messageEn: '',
          messageBn: '',
          phone: '',
          status: 'active' as const,
          createdAt: new Date().toISOString()
        }));
        await replaceLeadership(restored);
        alert(lang === 'bn' ? 'কমিটির তালিকা সফলভাবে রিস্টোর করা হয়েছে।' : 'Committee list restored successfully.');
      } catch (error) {
        alert("Restore failed.");
      } finally {
        setIsRestoring(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updatedLeader: Leadership = { ...formData, id: editingId };
      updateLeadership(leadership.map(l => l.id === editingId ? updatedLeader : l));
    } else {
      const newLeader: Leadership = { 
        ...formData, 
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
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
      subDesignationEn: '', subDesignationBn: '',
      messageEn: '', messageBn: '', 
      phone: '', 
      image: '', 
      order: leadership.length + 1,
      status: 'active',
      createdAt: new Date().toISOString()
    });
  };

  const handleEdit = (leader: Leadership) => {
    setEditingId(leader.id);
    setFormData({
      nameEn: leader.nameEn,
      nameBn: leader.nameBn,
      designationEn: leader.designationEn,
      designationBn: leader.designationBn,
      subDesignationEn: leader.subDesignationEn || '',
      subDesignationBn: leader.subDesignationBn || '',
      messageEn: leader.messageEn,
      messageBn: leader.messageBn,
      phone: leader.phone,
      image: leader.image,
      order: leader.order,
      status: leader.status || 'active',
      createdAt: leader.createdAt || new Date().toISOString()
    });
    setShowForm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      updateLeadership(leadership.filter(l => l.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const leaderToDelete = leadership.find(l => l.id === deleteConfirmId);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 bengali">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="text-emerald-500" />
            {t.leadership}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-xs md:text-sm">Management for committee members</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleRestoreDefaults} 
            disabled={isRestoring}
            className="bg-amber-100 text-amber-700 px-4 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 border border-amber-200 disabled:opacity-50"
          >
            {isRestoring ? <Loader2 className="animate-spin" size={14} /> : <RefreshCcw size={14} />}
            {lang === 'bn' ? 'রিস্টোর তালিকা' : 'Restore List'}
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg">
            <Plus size={16} />
            {lang === 'bn' ? 'নতুন সদস্য' : 'Add Member'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in slide-in-from-top-4">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                  {isUploading ? <Loader2 className="text-emerald-500 animate-spin" size={24} /> : formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Preview" /> : <Users className="text-slate-300" size={32} />}
                </div>
                <label htmlFor="leader-photo" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                  <Upload className="text-white" size={20} />
                  <input id="leader-photo" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <p className="text-[8px] font-black uppercase text-slate-400">Photo</p>
            </div>
            
            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Name (English)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">নাম (বাংলা)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Designation (EN)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.designationEn} onChange={e => setFormData({...formData, designationEn: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">পদবী (বাংলা)</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.designationBn} onChange={e => setFormData({...formData, designationBn: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Sub-Designation (EN)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.subDesignationEn} onChange={e => setFormData({...formData, subDesignationEn: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">উপ-পদবী (বাংলা)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.subDesignationBn} onChange={e => setFormData({...formData, subDesignationBn: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Phone</label>
                  <input type="tel" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Order</label>
                  <input required type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Status</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Message (BN)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" value={formData.messageBn} onChange={e => setFormData({...formData, messageBn: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg">Save</button>
            <button type="button" onClick={resetForm} className="px-6 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {leadership.sort((a,b) => (a.order||0)-(b.order||0)).map(leader => (
          <div key={leader.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group relative">
            {leader.status === 'inactive' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase">Inactive</div>
            )}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-emerald-500/10 shrink-0 bg-slate-50">
              <img src={leader.image || settings.logo} className="w-full h-full object-cover" alt={leader.nameEn} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] md:text-xs font-black text-slate-900 dark:text-white truncate bengali leading-none mb-1">{lang === 'bn' ? leader.nameBn : leader.nameEn}</div>
              <div className="text-[9px] font-bold text-emerald-600 uppercase truncate bengali">{lang === 'bn' ? leader.designationBn : leader.designationEn}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleEdit(leader)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={14} /></button>
              <button onClick={() => setDeleteConfirmId(leader.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Confirm Removal</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">{lang === 'bn' ? 'সদস্য মুছে ফেলতে চান?' : 'Are you sure?'}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-slate-100 text-slate-600 font-black py-3 rounded-xl">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 bg-rose-600 text-white font-black py-3 rounded-xl shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};