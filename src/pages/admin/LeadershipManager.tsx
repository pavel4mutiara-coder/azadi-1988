import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { Leadership } from '../../types';
import { Users, Plus, Trash2, Edit2, RefreshCcw, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { MemberImage } from '../../components/MemberImage';
import { extractGoogleDriveId } from '../../utils/normalizeGoogleDriveImage';

export const LeadershipManager: React.FC = () => {
  const { lang, leadership, saveLeader, deleteLeader, replaceLeadership } = useApp();
  const t = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Leadership, 'id'>>({
    nameEn: '', nameBn: '',
    designationEn: '', designationBn: '',
    subDesignationEn: '', subDesignationBn: '',
    messageEn: '', messageBn: '',
    phone: '',
    image: '', 
    order: leadership.length + 1,
    category: 'executive',
    status: 'active',
    createdAt: new Date().toISOString()
  });

  const handleRestoreDefaults = () => {
    setShowRestoreConfirm(true);
  };

  const handleConfirmRestore = async () => {
    await replaceLeadership([]);
    setShowRestoreConfirm(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      saveLeader({ ...formData, id: editingId } as Leadership);
    } else {
      const newId = `leader_${Date.now()}`;
      saveLeader({ ...formData, id: newId } as Leadership);
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
      category: 'executive',
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
      messageEn: leader.messageEn || '',
      messageBn: leader.messageBn || '',
      phone: leader.phone || '',
      image: leader.image || '',
      order: leader.order,
      category: leader.category || 'executive',
      status: leader.status || 'active',
      createdAt: leader.createdAt || new Date().toISOString()
    });
    setShowForm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteLeader(deleteConfirmId);
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
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-xs md:text-sm">{lang === 'bn' ? 'সংগঠনের পরিচালনা পর্ষদ ও সাধারণ সদস্য তালিকা পরিচালনা করুন' : 'Manage corporate body and active family members'}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleRestoreDefaults} 
            className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-900/30"
          >
            <RefreshCcw size={14} />
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
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Form Inputs Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Image Photo URL</label>
                <input 
                  type="text" 
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm focus:outline-none focus:border-emerald-500" 
                  value={formData.image} 
                  onChange={e => setFormData({...formData, image: e.target.value})} 
                />
                <p className="text-[10px] text-slate-400 font-bold leading-tight mt-1">
                  Use publicly accessible Google Drive image links. Make sure link sharing is set to "Anyone with the link can view".
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Phone</label>
                  <input 
                    type="tel" 
                    placeholder="e.g., 01700000000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm focus:outline-none focus:border-emerald-500" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Order Position</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" 
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Name (English)</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm focus:outline-none" 
                    value={formData.nameEn} 
                    onChange={e => setFormData({...formData, nameEn: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">নাম (বাংলা)</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm focus:outline-none" 
                    value={formData.nameBn} 
                    onChange={e => setFormData({...formData, nameBn: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Designation (English)</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm focus:outline-none" 
                    value={formData.designationEn} 
                    onChange={e => setFormData({...formData, designationEn: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">পদবী (বাংলা)</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm focus:outline-none" 
                    value={formData.designationBn} 
                    onChange={e => setFormData({...formData, designationBn: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Sub-Designation (EN - Optional)</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" 
                    value={formData.subDesignationEn} 
                    onChange={e => setFormData({...formData, subDesignationEn: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">উপ-পদবী (বাংলা - ঐচ্ছিক)</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" 
                    value={formData.subDesignationBn} 
                    onChange={e => setFormData({...formData, subDesignationBn: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Message (English - Optional)</label>
                  <textarea 
                    rows={2} 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" 
                    value={formData.messageEn} 
                    onChange={e => setFormData({...formData, messageEn: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">বক্তব্য (বাংলা - ঐচ্ছিক)</label>
                  <textarea 
                    rows={2} 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm" 
                    value={formData.messageBn} 
                    onChange={e => setFormData({...formData, messageBn: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Status</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm focus:outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Category</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg font-bold text-sm focus:outline-none"
                    value={formData.category || 'executive'}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                  >
                    <option value="leader">Leader (নেতৃবৃন্দ)</option>
                    <option value="executive">Executive (কার্যকরী কমিটি)</option>
                    <option value="advisor">Advisor (উপদেষ্টা মণ্ডলী)</option>
                    <option value="volunteer">Volunteer (স্বেচ্ছাসেবকবৃন্দ)</option>
                    <option value="member">Member (সাধারণ সদস্যবৃন্দ)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Smart Detection & Preview Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              {/* Image URL Validation Status Panel */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Info size={14} className="text-emerald-500" /> Image Link Analysis
                </h4>
                
                {formData.image ? (
                  <div className="text-[11px] font-bold space-y-3.5">
                    {(() => {
                      const imgUrl = formData.image.trim();
                      if (/drive\.google\.com/i.test(imgUrl)) {
                        const fileId = extractGoogleDriveId(imgUrl);
                        if (fileId) {
                          return (
                            <div className="space-y-2">
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle size={14} className="shrink-0" /> Google Drive URL Detected
                              </span>
                              <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                                Extracted File ID: <span className="font-mono bg-slate-200 dark:bg-slate-900 px-1.5 py-0.5 rounded text-[9px]">{fileId}</span>
                              </p>
                              <div className="flex gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 text-[10px] leading-relaxed">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-black">Sharing check required:</span> Make sure the file's Google Drive link sharing is set to <span className="font-black">"Anyone with the link can view"</span>, otherwise others won't be able to see the photo.
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 flex gap-2">
                              <AlertTriangle size={16} className="shrink-0 animate-pulse" />
                              <div>
                                <span className="font-black">Invalid Drive Link:</span> We detected a Google Drive domain but were unable to extract the File ID. Please use a full Web share URL.
                              </div>
                            </div>
                          );
                        }
                      } else if (/dropbox\.com/i.test(imgUrl)) {
                        return (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 flex gap-2">
                            <CheckCircle size={16} className="shrink-0" />
                            <div>
                              <span className="font-black">Dropbox Link Detected:</span> Direct imagery is guaranteed by injecting raw download query parameters automatically.
                            </div>
                          </div>
                        );
                      } else if (/^(javascript|data|file|vbscript):/i.test(imgUrl)) {
                        return (
                          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 flex gap-2">
                            <AlertTriangle size={16} className="shrink-0" />
                            <div>Security check: Unsafe Javascript/Data protocol blocked. Please use an HTTP/HTTPS image URL.</div>
                          </div>
                        );
                      } else if (!/^https?:\/\//i.test(imgUrl) && !/^\//.test(imgUrl)) {
                        return (
                          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 flex gap-2">
                            <AlertTriangle size={16} className="shrink-0" />
                            <div>Invalid format. URL must start with http or https protocol.</div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                            <CheckCircle size={14} /> Direct HTTP/HTTPS Image link detected beautifully.
                          </div>
                        );
                      }
                    })()}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px] font-medium italic">No image URL has been provided yet.</p>
                )}
              </div>

              {/* Real-time Widget Card Preview */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 block">Real-time Member Card Preview</label>
                <div className="scale-90 origin-top flex justify-center">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-50 dark:border-slate-800 p-6 shadow-md max-w-xs w-full flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>
                    
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/10 bg-white dark:bg-slate-950 p-1 flex items-center justify-center">
                        <MemberImage 
                          src={formData.image} 
                          alt={formData.nameEn || 'Name Preview'} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2.5 w-full">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                        {lang === 'bn' ? (formData.nameBn || 'সদস্যের নাম') : (formData.nameEn || 'Member Name')}
                      </h3>
                      <div className="flex flex-col items-center gap-1 bg-slate-50 dark:bg-slate-950/30 p-2 rounded-xl border border-slate-100 dark:border-slate-850/50">
                        <div className="inline-block px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-black text-[8px] uppercase tracking-wider">
                          {lang === 'bn' ? (formData.designationBn || 'পদবী') : (formData.designationEn || 'Designation')}
                        </div>
                        {(formData.subDesignationBn || formData.subDesignationEn) && (
                          <div className="text-[9px] font-bold text-slate-400 truncate max-w-full">
                            {lang === 'bn' ? formData.subDesignationBn : formData.subDesignationEn}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-colors">
              {editingId ? 'Update Member' : 'Save Member'}
            </button>
            <button type="button" onClick={resetForm} className="px-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {leadership.sort((a,b) => (a.order||0)-(b.order||0)).map(leader => (
          <div key={leader.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group relative">
            {leader.status === 'inactive' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase">Inactive</div>
            )}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-800">
              <MemberImage src={leader.image} alt={lang === 'bn' ? leader.nameBn : leader.nameEn} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">{lang === 'bn' ? leader.nameBn : leader.nameEn}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase truncate">{lang === 'bn' ? leader.designationBn : leader.designationEn}</p>
              <div className="text-[8px] mt-0.5 font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md inline-block">
                {leader.category || 'executive'}
              </div>
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => handleEdit(leader)} className="p-2 bg-slate-50 dark:bg-slate-850 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit2 size={12} /></button>
              <button type="button" onClick={() => setDeleteConfirmId(leader.id)} className="p-2 bg-slate-50 dark:bg-slate-850 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirmId && leaderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 max-w-md w-full shadow-heavy text-center space-y-6">
            <h3 className="text-xl font-black">{lang === 'bn' ? 'সদস্য মুছে ফেলবেন?' : 'Remove Member?'}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">{lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${leaderToDelete.nameBn}" কে তালিকা থেকে মুছে ফেলতে চান?` : `Are you sure you want to remove "${leaderToDelete.nameEn}"?`}</p>
            <div className="flex gap-3">
              <button type="button" onClick={handleConfirmDelete} className="flex-1 bg-rose-600 text-white font-black py-4 rounded-xl hover:bg-rose-700 transition-colors">Delete</button>
              <button type="button" onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black py-4 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 max-w-md w-full shadow-heavy text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black">{lang === 'bn' ? 'কমিটি তালিকা রিস্টোর করবেন?' : 'Restore Committee List?'}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed px-2">
              {lang === 'bn' 
                ? 'আপনি কি নিশ্চিতভাবে পূর্ণাঙ্গ কমিটির মূল কাঠামো পুনরায় লোড করতে চান? এর ফলে বর্তমান তালিকা পরিবর্তিত হয়ে যাবে।' 
                : 'Are you sure you want to reload the full default committee structure? This will replace your current active list.'}
            </p>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={handleConfirmRestore} 
                className="flex-1 bg-amber-600 text-white font-black py-4 rounded-xl hover:bg-amber-750 transition-colors"
              >
                {lang === 'bn' ? 'রিস্টোর করুন' : 'Restore'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowRestoreConfirm(false)} 
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black py-4 rounded-xl"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
