
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { FinancialRecord } from '../types';
import { PieChart, Plus, ArrowUpRight, ArrowDownRight, Trash2, Receipt } from 'lucide-react';

export const FinancialsManager: React.FC = () => {
  const { lang, financials, addFinancialRecord } = useApp();
  const t = TRANSLATIONS[lang];
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    category: '',
    description: ''
  });

  const totalIncome = financials.filter(f => f.type === 'INCOME').reduce((s, r) => s + r.amount, 0);
  const totalExpense = financials.filter(f => f.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFinancialRecord({
      type: formData.type,
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description
    });
    setFormData({ type: 'EXPENSE', amount: '', category: '', description: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <PieChart className="text-emerald-500" />
            {t.financials}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage organization income and expenses</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={20} />
          Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/50">
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Total Income</div>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">৳{totalIncome.toLocaleString()}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl border border-red-100 dark:border-red-800/50">
          <div className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">Total Expense</div>
          <div className="text-3xl font-black text-red-700 dark:text-red-300">৳{totalExpense.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-3xl text-white shadow-xl">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Net Balance</div>
          <div className="text-3xl font-black">৳{balance.toLocaleString()}</div>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-in slide-in-from-top-4">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Type</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Amount (BDT)</label>
              <input 
                required
                type="number" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Category</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Description</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all">
            Save Record
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <tr>
              <th className="p-6">Date</th>
              <th className="p-6">Type</th>
              <th className="p-6">Category</th>
              <th className="p-6">Amount</th>
              <th className="p-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {financials.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                <td className="p-6 text-sm font-bold text-slate-500">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    r.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {r.type}
                  </span>
                </td>
                <td className="p-6">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{r.category}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{r.description}</div>
                </td>
                <td className={`p-6 font-black text-lg ${r.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {r.type === 'INCOME' ? '+' : '-'} ৳{r.amount.toLocaleString()}
                </td>
                <td className="p-6 text-center">
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
