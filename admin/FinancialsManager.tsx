
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { FinancialRecord } from '../types';
import { PieChart, Plus, Trash2, Filter, X, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';

export const FinancialsManager: React.FC = () => {
  const { lang, financials, addFinancialRecord } = useApp();
  const t = TRANSLATIONS[lang];
  const [showAdd, setShowAdd] = useState(false);
  
  // Filter States
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [formData, setFormData] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    category: '',
    description: ''
  });

  // Calculate Global Totals
  const globalIncome = financials.filter(f => f.type === 'INCOME').reduce((s, r) => s + r.amount, 0);
  const globalExpense = financials.filter(f => f.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0);
  const globalBalance = globalIncome - globalExpense;

  // Filtering Logic
  const filteredFinancials = useMemo(() => {
    return financials.filter(record => {
      const matchType = filterType === 'ALL' || record.type === filterType;
      const recordDate = new Date(record.date);
      const matchStart = !startDate || recordDate >= new Date(startDate);
      const matchEnd = !endDate || recordDate <= new Date(endDate);
      return matchType && matchStart && matchEnd;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financials, filterType, startDate, endDate]);

  // Filtered Totals
  const filteredIncome = filteredFinancials.filter(f => f.type === 'INCOME').reduce((s, r) => s + r.amount, 0);
  const filteredExpense = filteredFinancials.filter(f => f.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0);

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

  const clearFilters = () => {
    setFilterType('ALL');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <PieChart className="text-emerald-500" />
            {t.financials}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Manage organization income and expenses</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={20} />
          {lang === 'bn' ? 'নতুন এন্ট্রি' : 'Add Entry'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/50 relative overflow-hidden group">
          <ArrowUpRight className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/10 group-hover:scale-110 transition-transform" />
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Total Income</div>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">৳{globalIncome.toLocaleString()}</div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-800/50 relative overflow-hidden group">
          <ArrowDownRight className="absolute -right-4 -bottom-4 w-24 h-24 text-rose-500/10 group-hover:scale-110 transition-transform" />
          <div className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">Total Expense</div>
          <div className="text-3xl font-black text-rose-700 dark:text-rose-300">৳{globalExpense.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Net Balance</div>
          <div className="text-3xl font-black relative z-10">৳{globalBalance.toLocaleString()}</div>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-in slide-in-from-top-4">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Type</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold appearance-none cursor-pointer"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="INCOME">Income (+)</option>
                <option value="EXPENSE">Expense (-)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Amount (BDT)</label>
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
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Category</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Charity, Maintenance"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Description</label>
              <input 
                required
                type="text" 
                placeholder="Brief details..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
            Save Record
          </button>
        </form>
      )}

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-2">
          <Filter size={18} className="text-emerald-500" />
          <h2 className="text-sm font-black uppercase tracking-widest">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type</label>
            <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-xs"
            >
              <option value="ALL">All Transactions</option>
              <option value="INCOME">Income Only</option>
              <option value="EXPENSE">Expenses Only</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">From Date</label>
            <div className="relative">
              <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 pl-10 rounded-xl font-bold text-xs" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">To Date</label>
            <div className="relative">
              <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 pl-10 rounded-xl font-bold text-xs" 
              />
            </div>
          </div>

          <button 
            onClick={clearFilters}
            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <RefreshCcw size={14} /> Reset Filters
          </button>
        </div>

        {/* Filter Summary */}
        {(filterType !== 'ALL' || startDate || endDate) && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Results:</div>
            <div className="flex gap-2">
              <span className="text-[10px] font-black px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-800">
                In: ৳{filteredIncome.toLocaleString()}
              </span>
              <span className="text-[10px] font-black px-3 py-1 bg-rose-50 dark:bg-rose-900/40 text-rose-600 rounded-full border border-rose-100 dark:border-rose-800">
                Out: ৳{filteredExpense.toLocaleString()}
              </span>
              <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
                Count: {filteredFinancials.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-6">Date</th>
                <th className="p-6">Type</th>
                <th className="p-6">Category</th>
                <th className="p-6">Amount</th>
                <th className="p-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFinancials.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                  <td className="p-6 text-sm font-bold text-slate-500 whitespace-nowrap">
                    {new Date(r.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      r.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800'
                    }`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="font-black text-slate-900 dark:text-slate-100">{r.category}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight line-clamp-1">{r.description}</div>
                  </td>
                  <td className={`p-6 font-black text-xl font-mono tracking-tighter ${r.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {r.type === 'INCOME' ? '+' : '-'} ৳{r.amount.toLocaleString()}
                  </td>
                  <td className="p-6 text-center">
                    <button className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFinancials.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Filter size={64} className="text-slate-400" />
                      <p className="font-black italic text-slate-500 uppercase tracking-widest text-xs">No records found matching filters.</p>
                      <button onClick={clearFilters} className="text-emerald-600 font-black text-xs hover:underline">Clear Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
