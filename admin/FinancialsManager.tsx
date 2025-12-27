
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { FinancialRecord } from '../types';
import { PieChart, Plus, Trash2, Filter, RefreshCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const FinancialsManager: React.FC = () => {
  const { lang, financials, addFinancialRecord } = useApp();
  const t = TRANSLATIONS[lang];
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const globalIncome = financials.filter(f => f.type === 'INCOME').reduce((s, r) => s + r.amount, 0);
  const globalExpense = financials.filter(f => f.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0);
  const globalBalance = globalIncome - globalExpense;

  const filteredFinancials = useMemo(() => {
    return financials.filter(record => filterType === 'ALL' || record.type === filterType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financials, filterType]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <PieChart className="text-emerald-500" /> {t.financials}
        </h1>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg">
          <Plus size={16} /> {lang === 'bn' ? 'নতুন এন্ট্রি' : 'Add Entry'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="p-4 md:p-8 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex flex-col justify-center">
          <ArrowUpRight className="text-emerald-500 mb-2" size={20} />
          <div className="text-[8px] font-black uppercase text-emerald-600">Income</div>
          <div className="text-sm md:text-2xl font-black text-emerald-700 truncate">৳{globalIncome.toLocaleString()}</div>
        </div>
        <div className="p-4 md:p-8 bg-rose-50 rounded-[1.5rem] border border-rose-100 flex flex-col justify-center">
          <ArrowDownRight className="text-rose-500 mb-2" size={20} />
          <div className="text-[8px] font-black uppercase text-rose-600">Expense</div>
          <div className="text-sm md:text-2xl font-black text-rose-700 truncate">৳{globalExpense.toLocaleString()}</div>
        </div>
        <div className="col-span-2 md:col-span-1 p-4 md:p-8 bg-slate-900 text-white rounded-[1.5rem] shadow-lg flex flex-col justify-center">
          <div className="text-[8px] font-black uppercase opacity-60">Balance</div>
          <div className="text-lg md:text-2xl font-black truncate">৳{globalBalance.toLocaleString()}</div>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in slide-in-from-top-4">
           {/* Add Record Form stacked for mobile */}
           <div className="space-y-4">
             <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-sm">
               <option value="INCOME">Income (+)</option>
               <option value="EXPENSE">Expense (-)</option>
             </select>
             <input required type="number" placeholder="Amount" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-sm" />
             <input required type="text" placeholder="Category" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-sm" />
             <input required type="text" placeholder="Description" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-sm" />
             <button className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg">Save Record</button>
           </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transactions</h3>
          <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="bg-slate-50 text-[10px] font-black px-3 py-1.5 rounded-lg border border-slate-200">
            <option value="ALL">All</option>
            <option value="INCOME">In</option>
            <option value="EXPENSE">Out</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[400px]">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[8px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-4">Date & Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredFinancials.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="text-[10px] font-black text-slate-900 dark:text-white mb-0.5">{r.category}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">{new Date(r.date).toLocaleDateString()}</div>
                  </td>
                  <td className={`p-4 font-black text-sm tracking-tighter ${r.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {r.type === 'INCOME' ? '+' : '-'} ৳{r.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <button className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
