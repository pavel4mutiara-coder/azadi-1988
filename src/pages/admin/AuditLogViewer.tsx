import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { parseLocalDate } from '../../utils/parseLocalDate';
import { History, Shield, Search, Filter, Loader2, UserCheck, Calendar, FileText, Database } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { lang, auditLogs, loadingAuditLogs } = useApp();
  const t = TRANSLATIONS[lang];

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetCollection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetDocId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 bengali">
            <History className="text-emerald-600" size={24} />
            {lang === 'bn' ? 'সিকিউরিটি ও কমপ্লায়েন্স অডিট লগ' : 'Security & Compliance Audit Logs'}
          </h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 bengali">
            {lang === 'bn' ? 'প্রশাসকদের সকল কার্যক্রম ও পরিবর্তনের সময়সূচী তালিকা' : 'Immutable audit trail of all administrative updates, modifications, and security actions.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800 shrink-0">
          <Shield size={16} />
          <span>{filteredLogs.length} {lang === 'bn' ? 'টি রেকর্ড পাওয়া গেছে' : 'Records Logged'}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'bn' ? 'অ্যাকশন, ইউজার, কালেকশন বা বিবরণ দিয়ে খুঁজুন...' : 'Search by action, email, collection, or details...'}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="ALL">{lang === 'bn' ? 'সকল অ্যাকশন' : 'All Actions'}</option>
          <option value="CREATE">{lang === 'bn' ? 'তৈরি (Create)' : 'Create Actions'}</option>
          <option value="UPDATE">{lang === 'bn' ? 'আপডেট (Update)' : 'Update Actions'}</option>
          <option value="DELETE">{lang === 'bn' ? 'ডিলিট (Delete)' : 'Delete Actions'}</option>
          <option value="APPROVE">{lang === 'bn' ? 'অনুমোদন (Approve)' : 'Approve Actions'}</option>
        </select>
      </div>

      {loadingAuditLogs ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {lang === 'bn' ? 'অডিট লগ লোড হচ্ছে...' : 'Loading audit trail...'}
          </p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <History className="mx-auto text-slate-300 dark:text-slate-700" size={48} />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 bengali">
            {lang === 'bn' ? 'কোন অডিট লগ রেকর্ড পাওয়া যায়নি।' : 'No audit log records match your filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-4 px-6">{lang === 'bn' ? 'সময় ও তারিখ' : 'Timestamp'}</th>
                  <th className="py-4 px-6">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  <th className="py-4 px-6">{lang === 'bn' ? 'প্রশাসক' : 'Administrator'}</th>
                  <th className="py-4 px-6">{lang === 'bn' ? 'টার্গেট' : 'Target'}</th>
                  <th className="py-4 px-6">{lang === 'bn' ? 'বিবরণ' : 'Details'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                {filteredLogs.map(log => {
                  const dateObj = parseLocalDate(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const isDelete = log.action.includes('DELETE');
                  const isApprove = log.action.includes('APPROVE');
                  const isCreate = log.action.includes('CREATE') || log.action.includes('ADD') || log.action.includes('SAVE');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                          isDelete 
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : isApprove
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : isCreate
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserCheck size={13} className="text-emerald-500" />
                          <span>{log.userEmail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Database size={13} className="text-indigo-400" />
                          <span className="font-bold text-slate-900 dark:text-white">{log.targetCollection}</span>
                          <span className="text-slate-400">({log.targetDocId.slice(0, 8)})</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 max-w-xs truncate font-mono text-[11px]">
                        {log.details || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
